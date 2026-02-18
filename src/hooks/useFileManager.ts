"use client";

import { useState, useRef, useCallback } from "react";
import type { OnMount } from "@monaco-editor/react";
import type * as MonacoEditor from "monaco-editor";
import type { FileNode } from "@/types";
import {
  getLanguageFromFileName,
  insertIntoTree,
  shouldSkipFile,
  shouldSkipDir,
  MAX_PROJECT_SIZE,
} from "@/lib/fileUtils";

export function useFileManager(showToast: (message: string, type: "error" | "warning" | "success") => void) {
  const [selectedPath, setSelectedPath] = useState("");
  const [currentFileName, setCurrentFileName] = useState("");
  const [language, setLanguage] = useState("plaintext");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [fileContents, setFileContents] = useState<Map<string, string>>(() => new Map());
  const [code, setCode] = useState("");
  const monacoEditorRef = useRef<MonacoEditor.editor.IStandaloneCodeEditor | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleEditorMount: OnMount = (editor, monaco) => {
    monacoEditorRef.current = editor;

    const ts = monaco.languages.typescript;
    const compilerOptions = {
      jsx: ts.JsxEmit.React,
      allowJs: true,
      allowNonTsExtensions: true,
      target: ts.ScriptTarget.ESNext,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
    };
    ts.typescriptDefaults.setCompilerOptions(compilerOptions);
    ts.javascriptDefaults.setCompilerOptions(compilerOptions);
    ts.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
    });
    ts.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
    });
  };

  const handleFormat = () => {
    monacoEditorRef.current?.getAction("editor.action.formatDocument")?.run();
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
    setFileContents((prev) => {
      const next = new Map(prev);
      next.set(selectedPath, newCode);
      return next;
    });
  }, [selectedPath]);

  const selectFile = (path: string, name: string) => {
    setFileContents((prev) => {
      const next = new Map(prev);
      next.set(selectedPath, code);
      return next;
    });
    setSelectedPath(path);
    setCurrentFileName(name);
    setLanguage(getLanguageFromFileName(name));
    setCode(fileContents.get(path) ?? "");
  };

  const renameFile = useCallback(
    (oldPath: string, newName: string) => {
      const parts = oldPath.split("/");
      const parentParts = parts.slice(0, -1);
      const newPath = parentParts.length > 0
        ? `${parentParts.join("/")}/${newName}`
        : newName;

      const updateNode = (nodes: FileNode[], pathParts: string[]): FileNode[] => {
        const [head, ...rest] = pathParts;
        return nodes.map((n) => {
          if (rest.length === 0 && n.name === head) {
            const ext = newName.includes(".") ? newName.split(".").pop() : undefined;
            return { ...n, name: newName, extension: ext };
          }
          if (n.type === "folder" && n.name === head && rest.length > 0) {
            return { ...n, children: updateNode(n.children ?? [], rest) };
          }
          return n;
        });
      };
      setFileTree((prev) => updateNode(prev, oldPath.split("/")));

      setFileContents((prev) => {
        const next = new Map<string, string>();
        for (const [key, val] of prev) {
          if (key === oldPath) {
            next.set(newPath, val);
          } else {
            next.set(key, val);
          }
        }
        return next;
      });

      if (selectedPath === oldPath) {
        setSelectedPath(newPath);
        setCurrentFileName(newName);
        setLanguage(getLanguageFromFileName(newName));
      }
    },
    [selectedPath],
  );

  const processFiles = useCallback(
    (files: { path: string; content: string }[]) => {
      if (files.length === 0) return;

      let tree: FileNode[] = [];
      for (const f of files) {
        tree = insertIntoTree(tree, f.path.split("/"));
      }
      setFileTree(tree);

      const contents = new Map<string, string>();
      for (const f of files) {
        contents.set(f.path, f.content);
      }
      setFileContents(contents);

      const rootFolders = new Set<string>();
      for (const node of tree) {
        if (node.type === "folder") {
          rootFolders.add(node.name);
        }
      }
      setExpandedFolders(rootFolders);

      const first = files[0];
      const name = first.path.split("/").pop() ?? first.path;
      setSelectedPath(first.path);
      setCurrentFileName(name);
      setLanguage(getLanguageFromFileName(name));
      setCode(first.content);
    },
    [],
  );

  const readFileList = useCallback(
    (fileList: FileList, useRelativePath: boolean) => {
      const pending: Promise<{ path: string; content: string }>[] = [];
      let skipped = 0;
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const filePath =
          useRelativePath && file.webkitRelativePath
            ? file.webkitRelativePath
            : file.name;

        const parts = filePath.split("/");
        if (parts.some((p) => shouldSkipDir(p))) { skipped++; continue; }
        if (shouldSkipFile(file.name, file.size)) { skipped++; continue; }

        pending.push(
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({ path: filePath, content: (reader.result as string) ?? "" });
            reader.onerror = () => resolve({ path: filePath, content: "" });
            reader.readAsText(file);
          }),
        );
      }
      Promise.all(pending).then((files) => {
        const totalSize = files.reduce((sum, f) => sum + f.content.length, 0);
        if (totalSize > MAX_PROJECT_SIZE) {
          showToast(`Project too large (${(totalSize / 1024 / 1024).toFixed(1)} MB). Max is ${MAX_PROJECT_SIZE / 1024 / 1024} MB. Try removing large files.`, "error");
          return;
        }
        if (skipped > 0) {
          showToast(`Skipped ${skipped} file${skipped > 1 ? "s" : ""} (binary, too large, or excluded directories)`, "warning");
        }
        processFiles(files);
      });
    },
    [processFiles, showToast],
  );

  const readEntry = useCallback(
    (
      entry: FileSystemEntry,
      basePath: string,
    ): Promise<{ path: string; content: string }[]> => {
      if (entry.isDirectory && shouldSkipDir(entry.name)) {
        return Promise.resolve([]);
      }
      if (entry.isFile) {
        return new Promise((resolve) => {
          (entry as FileSystemFileEntry).file((file) => {
            const path = basePath ? `${basePath}/${entry.name}` : entry.name;
            if (shouldSkipFile(file.name, file.size)) {
              resolve([]);
              return;
            }
            const reader = new FileReader();
            reader.onload = () =>
              resolve([{ path, content: (reader.result as string) ?? "" }]);
            reader.onerror = () => resolve([]);
            reader.readAsText(file);
          });
        });
      }
      if (entry.isDirectory) {
        return new Promise((resolve) => {
          const dirReader = (entry as FileSystemDirectoryEntry).createReader();
          dirReader.readEntries(async (entries) => {
            const dirPath = basePath ? `${basePath}/${entry.name}` : entry.name;
            const results = await Promise.all(
              entries.map((e) => readEntry(e, dirPath)),
            );
            resolve(results.flat());
          });
        });
      }
      return Promise.resolve([]);
    },
    [],
  );

  return {
    selectedPath, setSelectedPath,
    currentFileName, setCurrentFileName,
    language, setLanguage,
    expandedFolders, setExpandedFolders,
    fileTree, setFileTree,
    fileContents, setFileContents,
    code, setCode,
    monacoEditorRef, fileInputRef, folderInputRef,
    handleEditorMount, handleFormat,
    toggleFolder, selectFile, handleCodeChange,
    renameFile, processFiles, readFileList, readEntry,
  };
}
