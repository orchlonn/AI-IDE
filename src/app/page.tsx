"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Editor, { DiffEditor, type OnMount } from "@monaco-editor/react";
import type * as MonacoEditor from "monaco-editor";
import { getSupabase } from "@/lib/supabase";
import { useTheme } from "@/lib/useTheme";
import ChatMarkdown from "@/components/ChatMarkdown";
import SettingsModal from "@/components/SettingsModal";
import dynamic from "next/dynamic";

import type { TerminalHandle } from "@/components/Terminal";

const Terminal = dynamic(() => import("@/components/Terminal"), { ssr: false });

type ProjectRow = {
  id: string;
  name: string;
  file_tree: FileNode[];
  file_contents: Record<string, string>;
  updated_at: string;
};

// Detect Monaco language ID from file name
const extToLanguage: Record<string, string> = {
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  java: "java",
  cpp: "cpp",
  c: "c",
  json: "json",
  html: "html",
  css: "css",
  md: "markdown",
};

function getLanguageFromFileName(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase();
  return (ext && extToLanguage[ext]) || "plaintext";
}

// File tree node type
type FileNode = {
  name: string;
  type: "file" | "folder";
  extension?: string;
  children?: FileNode[];
};

// Insert a file into the tree, creating intermediate folders as needed
function insertIntoTree(tree: FileNode[], pathParts: string[]): FileNode[] {
  const [head, ...rest] = pathParts;
  if (rest.length === 0) {
    // Leaf file — add if not already present
    if (tree.some((n) => n.name === head && n.type === "file")) return tree;
    const ext = head.includes(".") ? head.split(".").pop() : undefined;
    return [...tree, { name: head, type: "file", extension: ext }];
  }
  // Intermediate folder
  const existing = tree.find((n) => n.name === head && n.type === "folder");
  if (existing) {
    return tree.map((n) =>
      n === existing
        ? { ...n, children: insertIntoTree(n.children ?? [], rest) }
        : n,
    );
  }
  return [
    ...tree,
    {
      name: head,
      type: "folder",
      children: insertIntoTree([], rest),
    },
  ];
}

// Chat message type
type ChatMessage = {
  id: string;
  role: "user" | "ai";
  content: string;
};

function FileIcon({ extension }: { extension?: string }) {
  const color =
    extension === "ts" || extension === "tsx"
      ? "#3178c6"
      : extension === "js" || extension === "jsx"
        ? "#f7df1e"
        : extension === "css"
          ? "#563d7c"
          : extension === "json"
            ? "#cbcb41"
            : extension === "html"
              ? "#e34c26"
              : extension === "md"
                ? "#083fa1"
                : "#8b949e";
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0">
      <path
        fill={color}
        d="M2 2a1 1 0 0 1 1-1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-7 7a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 2 9.586V2z"
      />
    </svg>
  );
}

function FolderIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      className="shrink-0 text-[#d29922]"
      fill="currentColor"
    >
      {open ? (
        <path d="M.513 1.513A1.5 1.5 0 0 1 1.5 1h3a1.5 1.5 0 0 1 1.06.44l.12.12A1.5 1.5 0 0 0 6.44 2H14a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H2a1.5 1.5 0 0 1-1.5-1.5V2.5a1.5 1.5 0 0 1 .013-.987zM2 3v9a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5V3.5a.5.5 0 0 0-.5-.5h-7a.5.5 0 0 1-.354-.146l-.353-.354A.5.5 0 0 0 5.293 2.5H2a.5.5 0 0 0-.5.5z" />
      ) : (
        <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h3.797a1.5 1.5 0 0 1 1.06.44l.12.12a1.5 1.5 0 0 0 1.06.44H13.5A1.5 1.5 0 0 1 15 4.5v9a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 13.5v-10z" />
      )}
    </svg>
  );
}

function FileTreeItem({
  node,
  depth,
  parentPath,
  selectedPath,
  onSelect,
  onRename,
  expandedFolders,
  toggleFolder,
}: {
  node: FileNode;
  depth: number;
  parentPath: string;
  selectedPath: string;
  onSelect: (path: string, name: string) => void;
  onRename: (oldPath: string, newName: string) => void;
  expandedFolders: Set<string>;
  toggleFolder: (path: string) => void;
}) {
  const path = parentPath ? `${parentPath}/${node.name}` : node.name;
  const isFolder = node.type === "folder";
  const isExpanded = isFolder && expandedFolders.has(path);
  const isSelected = selectedPath === path;
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(node.name);

  const startRename = () => {
    setEditValue(node.name);
    setEditing(true);
  };

  const commitRename = () => {
    setEditing(false);
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== node.name) {
      onRename(path, trimmed);
    }
  };

  if (node.type === "file") {
    return (
      <button
        type="button"
        onClick={() => onSelect(path, node.name)}
        onDoubleClick={(e) => {
          e.preventDefault();
          startRename();
        }}
        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-[var(--hover-bg)] ${isSelected ? "bg-[var(--selected-bg)] text-[var(--accent)]" : "text-[#8b949e]"}`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        <FileIcon extension={editing ? editValue.split(".").pop() : node.extension} />
        {editing ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") setEditing(false);
            }}
            onClick={(e) => e.stopPropagation()}
            autoFocus
            className="min-w-0 flex-1 rounded bg-[var(--editor-bg)] px-1 py-0.5 text-sm text-[var(--foreground)] outline-none ring-1 ring-[var(--accent)]"
          />
        ) : (
          <span className="truncate">{node.name}</span>
        )}
      </button>
    );
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => toggleFolder(path)}
        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-[var(--hover-bg)] ${isSelected ? "bg-[var(--selected-bg)] text-[var(--foreground)]" : "text-[#8b949e]"}`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        <FolderIcon open={isExpanded} />
        <span className="truncate">{node.name}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          className={`ml-auto shrink-0 text-[#8b949e] transition-transform ${isExpanded ? "rotate-90" : ""}`}
          fill="currentColor"
        >
          <path d="M4 2L8 6L4 10V2Z" />
        </svg>
      </button>
      {isExpanded && node.children && (
        <div className="w-full">
          {node.children.map((child) => (
            <FileTreeItem
              key={path + "/" + child.name}
              node={child}
              depth={depth + 1}
              parentPath={path}
              selectedPath={selectedPath}
              onSelect={onSelect}
              onRename={onRename}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { themeId, currentTheme, selectTheme, allThemes } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);
  const [leftWidth, setLeftWidth] = useState(256);
  const [rightOpen, setRightOpen] = useState(true);
  const [rightWidth, setRightWidth] = useState(384);
  const resizingLeft = useRef(false);
  const resizingRight = useRef(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(200);
  const [pendingRunCommand, setPendingRunCommand] = useState<string | null>(null);
  const [pendingRunFile, setPendingRunFile] = useState<{ name: string; content: string } | null>(null);
  const resizingTerminal = useRef(false);
  const terminalRef = useRef<TerminalHandle>(null);
  const [selectedPath, setSelectedPath] = useState("");
  const [currentFileName, setCurrentFileName] = useState("");
  const [language, setLanguage] = useState("plaintext");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(),
  );
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [fileContents, setFileContents] = useState<Map<string, string>>(
    () => new Map(),
  );
  const [code, setCode] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [indexing, setIndexing] = useState(false);
  const [diffMode, setDiffMode] = useState<{
    original: string;
    modified: string;
    language: string;
  } | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("my-project");
  const [projectList, setProjectList] = useState<
    { id: string; name: string; updated_at: string }[]
  >([]);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [saving, setSaving] = useState(false);
  const monacoEditorRef =
    useRef<MonacoEditor.editor.IStandaloneCodeEditor | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const handleEditorMount: OnMount = (editor, monaco) => {
    monacoEditorRef.current = editor;

    // Enable JSX and disable semantic validation (no tsconfig or types available)
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

  // Map language to run command
  const getRunCommand = useCallback((fileName: string, lang: string): string | null => {
    const cmds: Record<string, string> = {
      python: `python3 "${fileName}"`,
      javascript: `node "${fileName}"`,
      typescript: `npx tsx "${fileName}"`,
      java: `javac "${fileName}" && java "${fileName.replace(/\.java$/, "")}"`,
      c: `gcc "${fileName}" -o /tmp/a.out && /tmp/a.out`,
      cpp: `g++ "${fileName}" -o /tmp/a.out && /tmp/a.out`,
      go: `go run "${fileName}"`,
      ruby: `ruby "${fileName}"`,
      php: `php "${fileName}"`,
      rust: `rustc "${fileName}" -o /tmp/a.out && /tmp/a.out`,
      shell: `bash "${fileName}"`,
    };
    return cmds[lang] ?? null;
  }, []);

  const handleRunFile = useCallback(() => {
    if (!currentFileName) return;
    const cmd = getRunCommand(currentFileName, language);
    if (!cmd) return;

    const fileInfo = { name: currentFileName, content: code };

    if (terminalOpen && terminalRef.current) {
      terminalRef.current.runCommand(cmd, fileInfo);
    } else {
      setPendingRunCommand(cmd);
      setPendingRunFile(fileInfo);
      setTerminalOpen(true);
    }
  }, [currentFileName, language, terminalOpen, getRunCommand, code]);

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const selectFile = (path: string, name: string) => {
    // Save current file content before switching
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

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    setFileContents((prev) => {
      const next = new Map(prev);
      next.set(selectedPath, newCode);
      return next;
    });
  };

  // Rename a file in the tree and update fileContents map
  const renameFile = useCallback(
    (oldPath: string, newName: string) => {
      const parts = oldPath.split("/");
      const parentParts = parts.slice(0, -1);
      const newPath = parentParts.length > 0
        ? `${parentParts.join("/")}/${newName}`
        : newName;

      // Update tree node
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

      // Update fileContents key
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

      // Update selected path if this file is selected
      if (selectedPath === oldPath) {
        setSelectedPath(newPath);
        setCurrentFileName(newName);
        setLanguage(getLanguageFromFileName(newName));
      }
    },
    [selectedPath],
  );

  // Process uploaded files: replace current project
  const processFiles = useCallback(
    (files: { path: string; content: string }[]) => {
      if (files.length === 0) return;

      // Build a fresh tree from uploaded files
      let tree: FileNode[] = [];
      for (const f of files) {
        tree = insertIntoTree(tree, f.path.split("/"));
      }
      setFileTree(tree);

      // Replace all file contents
      const contents = new Map<string, string>();
      for (const f of files) {
        contents.set(f.path, f.content);
      }
      setFileContents(contents);

      // Only expand root-level folders
      const rootFolders = new Set<string>();
      for (const node of tree) {
        if (node.type === "folder") {
          rootFolders.add(node.name);
        }
      }
      setExpandedFolders(rootFolders);

      // Select the first uploaded file
      const first = files[0];
      const name = first.path.split("/").pop() ?? first.path;
      setSelectedPath(first.path);
      setCurrentFileName(name);
      setLanguage(getLanguageFromFileName(name));
      setCode(first.content);
    },
    [],
  );

  // Read a FileList (from input or drop) and process
  const readFileList = useCallback(
    (fileList: FileList, useRelativePath: boolean) => {
      const pending: Promise<{ path: string; content: string }>[] = [];
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        // Skip non-text / binary files
        if (
          file.size > 2 * 1024 * 1024 ||
          file.name.match(
            /\.(png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot|mp[34]|webm|zip|tar|gz|exe|dll|so|dylib|bin|pdf)$/i,
          )
        )
          continue;
        const path =
          useRelativePath && file.webkitRelativePath
            ? file.webkitRelativePath
            : file.name;
        pending.push(
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({ path, content: (reader.result as string) ?? "" });
            reader.onerror = () => resolve({ path, content: "" });
            reader.readAsText(file);
          }),
        );
      }
      Promise.all(pending).then(processFiles);
    },
    [processFiles],
  );

  // Recursively read a dropped directory entry
  const readEntry = useCallback(
    (
      entry: FileSystemEntry,
      basePath: string,
    ): Promise<{ path: string; content: string }[]> => {
      if (entry.isFile) {
        return new Promise((resolve) => {
          (entry as FileSystemFileEntry).file((file) => {
            const path = basePath ? `${basePath}/${entry.name}` : entry.name;
            if (
              file.size > 2 * 1024 * 1024 ||
              file.name.match(
                /\.(png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot|mp[34]|webm|zip|tar|gz|exe|dll|so|dylib|bin|pdf)$/i,
              )
            ) {
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

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      dragCounterRef.current = 0;

      const items = e.dataTransfer.items;
      if (items && items.length > 0) {
        const entries: FileSystemEntry[] = [];
        for (let i = 0; i < items.length; i++) {
          const entry = items[i].webkitGetAsEntry?.();
          if (entry) entries.push(entry);
        }
        if (entries.length > 0) {
          Promise.all(entries.map((e) => readEntry(e, ""))).then((results) =>
            processFiles(results.flat()),
          );
          return;
        }
      }
      // Fallback: plain file list
      if (e.dataTransfer.files.length > 0) {
        readFileList(e.dataTransfer.files, false);
      }
    },
    [readEntry, processFiles, readFileList],
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current++;
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current--;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Fetch project list from Supabase
  const fetchProjects = useCallback(async () => {
    const { data } = await getSupabase()
      .from("projects")
      .select("id, name, updated_at")
      .order("updated_at", { ascending: false });
    if (data) setProjectList(data);
  }, []);

  // Load a project from Supabase
  const loadProject = useCallback(
    async (id: string) => {
      const { data } = await getSupabase()
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();
      if (!data) return;
      const row = data as ProjectRow;
      setProjectId(row.id);
      setProjectName(row.name);
      setFileTree(row.file_tree);
      const contents = new Map(Object.entries(row.file_contents));
      setFileContents(contents);

      // Expand root folders
      const rootFolders = new Set<string>();
      for (const node of row.file_tree) {
        if (node.type === "folder") rootFolders.add(node.name);
      }
      setExpandedFolders(rootFolders);

      // Select first file
      const firstPath = Object.keys(row.file_contents)[0];
      if (firstPath) {
        const name = firstPath.split("/").pop() ?? firstPath;
        setSelectedPath(firstPath);
        setCurrentFileName(name);
        setLanguage(getLanguageFromFileName(name));
        setCode(row.file_contents[firstPath] ?? "");
      }
      setShowProjectMenu(false);
    },
    [],
  );

  // Index project embeddings
  const indexProject = useCallback(async (id: string) => {
    setIndexing(true);
    try {
      await fetch("/api/embeddings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: id }),
      });
    } catch (err) {
      console.error("Indexing failed:", err);
    }
    setIndexing(false);
  }, []);

  // Save current project to Supabase
  const saveProject = useCallback(async () => {
    // Make sure current file is saved to fileContents
    const currentContents = new Map(fileContents);
    currentContents.set(selectedPath, code);

    let name = projectName;
    if (!projectId) {
      const input = prompt("Project name:", projectName);
      if (!input) return;
      name = input;
    }

    setSaving(true);
    const payload = {
      name,
      file_tree: fileTree,
      file_contents: Object.fromEntries(currentContents),
      updated_at: new Date().toISOString(),
    };

    let savedId = projectId;
    if (projectId) {
      await getSupabase().from("projects").update(payload).eq("id", projectId);
    } else {
      const { data } = await getSupabase()
        .from("projects")
        .insert(payload)
        .select("id")
        .single();
      if (data) {
        setProjectId(data.id);
        savedId = data.id;
      }
    }
    setProjectName(name);
    setSaving(false);

    // Auto-index for AI search
    if (savedId) indexProject(savedId);
  }, [fileTree, fileContents, code, selectedPath, projectId, projectName, indexProject]);

  // Delete a project
  const deleteProject = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!confirm("Delete this project?")) return;
      await getSupabase().from("projects").delete().eq("id", id);
      if (projectId === id) setProjectId(null);
      fetchProjects();
    },
    [projectId, fetchProjects],
  );

  // Send chat message
  const sendChat = useCallback(async () => {
    const question = chatInput.trim();
    if (!question || !projectId || chatLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: question,
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "ai",
      content: "",
    };
    setChatMessages((prev) => [...prev, aiMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          question,
          history: chatMessages.map((m) => ({
            role: m.role === "ai" ? "assistant" : "user",
            content: m.content,
          })),
          current_file: selectedPath ? { path: selectedPath, content: code } : null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setChatMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsg.id
              ? { ...m, content: `Error: ${err.error || "Something went wrong"}` }
              : m,
          ),
        );
        setChatLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (reader) {
        let accumulated = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          const text = accumulated;
          setChatMessages((prev) =>
            prev.map((m) => (m.id === aiMsg.id ? { ...m, content: text } : m)),
          );
        }
      }
    } catch {
      setChatMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsg.id
            ? { ...m, content: "Error: Failed to connect to AI." }
            : m,
        ),
      );
    }
    setChatLoading(false);
  }, [chatInput, projectId, chatLoading, chatMessages, selectedPath, code]);

  // Review AI-suggested code in diff view
  const handleReviewCode = useCallback(
    (suggestedCode: string) => {
      setDiffMode({
        original: code,
        modified: suggestedCode,
        language,
      });
    },
    [code, language],
  );

  // Accept diff: apply modified code to editor
  const acceptDiff = useCallback(() => {
    if (!diffMode) return;
    handleCodeChange(diffMode.modified);
    setDiffMode(null);
  }, [diffMode, handleCodeChange]);

  // Reject diff: go back to original
  const rejectDiff = useCallback(() => {
    setDiffMode(null);
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Fetch projects when menu opens
  useEffect(() => {
    if (showProjectMenu) fetchProjects();
  }, [showProjectMenu, fetchProjects]);

  // Close project menu on outside click
  useEffect(() => {
    if (!showProjectMenu) return;
    const handler = () => setShowProjectMenu(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [showProjectMenu]);

  // Left sidebar resize handler
  const handleLeftResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    resizingLeft.current = true;
    const startX = e.clientX;
    const startWidth = leftWidth;
    const onMouseMove = (ev: MouseEvent) => {
      if (!resizingLeft.current) return;
      const delta = ev.clientX - startX;
      setLeftWidth(Math.max(180, Math.min(500, startWidth + delta)));
    };
    const onMouseUp = () => {
      resizingLeft.current = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [leftWidth]);

  // Right sidebar resize handler
  const handleRightResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    resizingRight.current = true;
    const startX = e.clientX;
    const startWidth = rightWidth;
    const onMouseMove = (ev: MouseEvent) => {
      if (!resizingRight.current) return;
      const delta = startX - ev.clientX;
      setRightWidth(Math.max(280, Math.min(600, startWidth + delta)));
    };
    const onMouseUp = () => {
      resizingRight.current = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [rightWidth]);

  // Terminal resize handlers
  const handleTerminalResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    resizingTerminal.current = true;
    const startY = e.clientY;
    const startHeight = terminalHeight;

    const onMouseMove = (ev: MouseEvent) => {
      if (!resizingTerminal.current) return;
      const delta = startY - ev.clientY;
      setTerminalHeight(Math.max(100, Math.min(600, startHeight + delta)));
    };

    const onMouseUp = () => {
      resizingTerminal.current = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [terminalHeight]);

  return (
    <div
      className="flex h-screen flex-col bg-[var(--background)] text-[var(--foreground)]"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Top navigation bar */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--sidebar-bg)] px-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="text-[var(--accent)]"
            >
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-lg font-semibold tracking-tight">
              AI Code Editor
            </span>
          </div>
          <div className="h-5 w-px bg-[var(--border)]" />
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProjectMenu((p) => !p)}
              className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-[#8b949e] transition-colors hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)]"
            >
              <span>{projectName}</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 8L2 4h8L6 8z" />
              </svg>
            </button>
            {showProjectMenu && (
              <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-lg border border-[var(--border)] bg-[var(--sidebar-bg)] shadow-xl">
                <div className="border-b border-[var(--border)] px-3 py-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-[#8b949e]">
                    Projects
                  </p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {projectList.length === 0 && (
                    <p className="px-3 py-4 text-center text-sm text-[#8b949e]">
                      No saved projects
                    </p>
                  )}
                  {projectList.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => loadProject(p.id)}
                      className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--hover-bg)] ${p.id === projectId ? "text-[var(--accent)]" : "text-[var(--foreground)]"}`}
                    >
                      <span className="truncate">{p.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="shrink-0 text-xs text-[#8b949e]">
                          {new Date(p.updated_at).toLocaleDateString()}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => deleteProject(p.id, e)}
                          className="shrink-0 rounded p-0.5 text-[#8b949e] hover:text-red-400"
                          aria-label="Delete project"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={saveProject}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-[#8b949e] transition-colors hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)] disabled:opacity-50"
            aria-label="Save project"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            <span>{saving ? "Saving..." : "Save"}</span>
          </button>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="rounded-md p-2 text-[var(--muted,#8b949e)] transition-colors hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)]"
            aria-label="Settings"
          >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          </button>
        </div>
      </header>

      <div className="relative flex flex-1 min-h-0">
        {/* Left sidebar - File Explorer */}
        <aside
          className={`relative flex shrink-0 flex-col border-r border-[var(--border)] bg-[var(--sidebar-bg)] shadow-lg ${leftOpen ? "" : "w-0 overflow-hidden border-0"}`}
          style={leftOpen ? { width: leftWidth } : undefined}
        >
          <div className="flex h-10 shrink-0 items-center justify-between border-b border-[var(--border)] px-3">
            <span className="text-xs font-medium uppercase tracking-wider text-[#8b949e]">
              Explorer
            </span>
            <div className="flex items-center gap-1">
              {/* Upload file button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded p-1 text-[#8b949e] hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)]"
                aria-label="Upload files"
                title="Upload files"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="12" y2="12" />
                  <line x1="15" y1="15" x2="12" y2="12" />
                </svg>
              </button>
              {/* Upload folder button */}
              <button
                type="button"
                onClick={() => folderInputRef.current?.click()}
                className="rounded p-1 text-[#8b949e] hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)]"
                aria-label="Upload folder"
                title="Upload folder"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  <line x1="12" y1="17" x2="12" y2="11" />
                  <line x1="9" y1="14" x2="12" y2="11" />
                  <line x1="15" y1="14" x2="12" y2="11" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setLeftOpen(false)}
                className="rounded p-1 text-[#8b949e] hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)] lg:hidden"
                aria-label="Close sidebar"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            </div>
            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) readFileList(e.target.files, false);
                e.target.value = "";
              }}
            />
            <input
              ref={folderInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) readFileList(e.target.files, true);
                e.target.value = "";
              }}
              {...({
                webkitdirectory: "",
                directory: "",
              } as React.InputHTMLAttributes<HTMLInputElement>)}
            />
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="border-b border-[var(--border)] px-3 py-2">
              <p className="truncate text-sm font-medium">{projectName}</p>
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-auto py-2">
              {fileTree.map((node) => (
                <FileTreeItem
                  key={node.name}
                  node={node}
                  depth={0}
                  parentPath=""
                  selectedPath={selectedPath}
                  onSelect={selectFile}
                  onRename={renameFile}
                  expandedFolders={expandedFolders}
                  toggleFolder={toggleFolder}
                />
              ))}
            </div>
          </div>
          {/* Resize handle */}
          <div
            className="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-[var(--accent)] transition-colors z-10"
            onMouseDown={handleLeftResizeStart}
          />
        </aside>

        {!leftOpen && (
          <button
            type="button"
            onClick={() => setLeftOpen(true)}
            className="absolute left-0 top-14 z-10 rounded-r border border-l-0 border-[var(--border)] bg-[var(--sidebar-bg)] p-2 text-[#8b949e] hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)]"
            aria-label="Open file explorer"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}

        {/* Center - Code Editor */}
        <main className="flex flex-1 flex-col min-w-0 min-h-0">
          {/* Editor toolbar */}
          <div className="flex h-10 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--editor-bg)] px-3">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium">
                {currentFileName}
              </span>
              <span className="rounded bg-[var(--hover-bg)] px-2 py-0.5 text-xs text-[#8b949e]">
                {language}
              </span>
              {diffMode && (
                <span className="rounded bg-[var(--accent-muted)] px-2 py-0.5 text-xs text-[var(--accent)]">
                  Review Changes
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {diffMode ? (
                <>
                  <button
                    type="button"
                    onClick={acceptDiff}
                    className="rounded bg-green-600 px-3 py-1 text-xs text-white transition-colors hover:bg-green-500"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={rejectDiff}
                    className="rounded bg-red-600 px-3 py-1 text-xs text-white transition-colors hover:bg-red-500"
                  >
                    Reject
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="rounded px-2 py-1 text-xs text-[#8b949e] transition-colors hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)]"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={handleFormat}
                    className="rounded px-2 py-1 text-xs text-[#8b949e] transition-colors hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)]"
                  >
                    Format
                  </button>
                  {getRunCommand(currentFileName, language) && (
                    <button
                      type="button"
                      onClick={handleRunFile}
                      className="flex items-center gap-1 rounded bg-[#238636] px-2.5 py-1 text-xs text-white transition-colors hover:bg-[#2ea043]"
                      title="Run file"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        stroke="none"
                      >
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                      Run
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Monaco Editor / Diff Editor / Welcome */}
          <div className="flex-1 min-h-0">
            {fileTree.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="mb-6 text-[#30363d]"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="12" y2="12" />
                  <line x1="15" y1="15" x2="12" y2="12" />
                </svg>
                <h2 className="mb-2 text-xl font-semibold text-[var(--foreground)]">
                  No project open
                </h2>
                <p className="mb-6 max-w-sm text-sm text-[#8b949e]">
                  Upload files or a folder to get started, or load a saved project from the dropdown above.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--sidebar-bg)] px-4 py-2.5 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--hover-bg)]"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    Upload Files
                  </button>
                  <button
                    type="button"
                    onClick={() => folderInputRef.current?.click()}
                    className="flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm text-white transition-opacity hover:opacity-90"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                    Open Folder
                  </button>
                </div>
                <p className="mt-4 text-xs text-[#484f58]">
                  or drag and drop files anywhere
                </p>
              </div>
            ) : diffMode ? (
              <DiffEditor
                theme={currentTheme.monacoTheme}
                language={diffMode.language}
                original={diffMode.original}
                modified={diffMode.modified}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  padding: { top: 16 },
                  readOnly: true,
                  renderSideBySide: true,
                  automaticLayout: true,
                }}
              />
            ) : (
              <Editor
                theme={currentTheme.monacoTheme}
                language={language}
                path={selectedPath}
                value={code}
                onChange={(value) => handleCodeChange(value ?? "")}
                onMount={handleEditorMount}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  padding: { top: 16 },
                  lineNumbersMinChars: 4,
                  automaticLayout: true,
                }}
              />
            )}
          </div>

          {/* Terminal Panel */}
          {terminalOpen && (
            <>
              {/* Resize handle */}
              <div
                className="h-1 shrink-0 cursor-row-resize bg-[var(--border)] hover:bg-[var(--accent)] transition-colors"
                onMouseDown={handleTerminalResizeStart}
              />
              <div className="shrink-0" style={{ height: terminalHeight }}>
                <Terminal
                  ref={terminalRef}
                  onClose={() => setTerminalOpen(false)}
                  initialCommand={pendingRunCommand}
                  initialFile={pendingRunFile}
                  terminalColors={currentTheme.terminal}
                />
              </div>
            </>
          )}
        </main>

        {/* Right panel - AI Assistant Chat */}
        <aside
          className={`relative flex shrink-0 flex-col border-l border-[var(--border)] bg-[var(--sidebar-bg)] shadow-lg ${rightOpen ? "" : "w-0 overflow-hidden border-0"}`}
          style={rightOpen ? { width: rightWidth } : undefined}
        >
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--border)] px-4">
            <h2 className="text-sm font-semibold">AI Assistant</h2>
            <button
              type="button"
              onClick={() => setRightOpen(false)}
              className="rounded p-1 text-[#8b949e] hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)] lg:hidden"
              aria-label="Close chat"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>

          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto overflow-x-auto p-4 space-y-4">
              {chatMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center text-[#8b949e]">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 opacity-50">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <p className="text-sm">
                    {projectId ? "Ask a question about your code" : "Save your project first to enable AI chat"}
                  </p>
                </div>
              )}
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md ${
                      msg.role === "user"
                        ? "bg-[var(--chat-user-bg)] text-[var(--foreground)] rounded-br-md"
                        : "bg-[var(--chat-ai-bg)] text-[#e6edf3] rounded-bl-md"
                    }`}
                  >
                    {msg.role === "ai" ? (
                      <ChatMarkdown content={msg.content} onReviewCode={handleReviewCode} />
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {chatLoading && chatMessages[chatMessages.length - 1]?.content === "" && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md bg-[var(--chat-ai-bg)] px-4 py-3 shadow-md">
                    <span className="text-sm text-[#8b949e] animate-pulse">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="shrink-0 border-t border-[var(--border)] p-3">
              {indexing && (
                <p className="mb-2 text-xs text-[var(--accent)] animate-pulse">Indexing project for AI...</p>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendChat();
                }}
                className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--editor-bg)] px-3 py-2"
              >
                <input
                  type="text"
                  placeholder={projectId ? "Ask about this code..." : "Save project to enable chat"}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={!projectId || chatLoading}
                  className="min-w-0 flex-1 bg-transparent text-sm text-[var(--foreground)] placeholder:text-[#8b949e] focus:outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!projectId || chatLoading || !chatInput.trim()}
                  className="shrink-0 rounded bg-[var(--accent)] p-2 text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                  aria-label="Send"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
          {/* Resize handle */}
          <div
            className="absolute top-0 left-0 h-full w-1 cursor-col-resize hover:bg-[var(--accent)] transition-colors z-10"
            onMouseDown={handleRightResizeStart}
          />
        </aside>

        {!rightOpen && (
          <button
            type="button"
            onClick={() => setRightOpen(true)}
            className="absolute right-0 top-14 z-10 rounded-l border border-r-0 border-[var(--border)] bg-[var(--sidebar-bg)] p-2 text-[#8b949e] hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)]"
            aria-label="Open AI assistant"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 18l6-6-6-6" />
            </svg>
          </button>
        )}
      </div>

      {/* Drag overlay */}
      {dragging && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-2xl border-2 border-dashed border-[var(--accent)] bg-[var(--sidebar-bg)] px-12 py-8 text-center">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="mx-auto mb-3 text-[var(--accent)]"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className="text-lg font-medium text-[var(--foreground)]">
              Drop files or folders here
            </p>
            <p className="mt-1 text-sm text-[#8b949e]">
              Files will be added to the explorer
            </p>
          </div>
        </div>
      )}

      {/* Bottom status bar */}
      <footer className="flex h-6 shrink-0 items-center justify-between border-t border-[var(--border)] bg-[var(--status-bar)] px-4 text-xs text-[#8b949e]">
        <div className="flex items-center gap-4">
          <span>{saving ? "Saving..." : indexing ? "Indexing..." : projectId ? "Saved" : "Unsaved"}</span>
          <span>{language}</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setTerminalOpen((v) => !v)}
            className={`flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)] ${terminalOpen ? "text-[var(--foreground)]" : ""}`}
            title="Toggle Terminal"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
            <span>Terminal</span>
          </button>
          <span>Ln 5, Col 3</span>
        </div>
      </footer>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        themeId={themeId}
        onSelectTheme={selectTheme}
        allThemes={allThemes}
      />
    </div>
  );
}
