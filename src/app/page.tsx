"use client";

import { useState, useRef, useCallback } from "react";

// Syntax highlighting for TSX/JS code — single-pass tokenizer
function highlightCode(code: string): string {
  // Escape HTML first
  const escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const keywords = new Set([
    "import","export","default","from","const","let","var","function","return",
    "if","else","for","while","class","extends","new","this","typeof",
    "instanceof","async","await","try","catch","throw","switch","case",
    "break","continue","do","in","of","void","delete","yield",
  ]);

  const builtins = new Set([
    "true","false","null","undefined","NaN","Infinity","console","window",
    "document","Promise","Array","Object","String","Number","Boolean","Map",
    "Set","React","useState","useEffect","useRef","useCallback","useMemo",
    "useContext","useReducer",
  ]);

  // Single combined regex — order matters (earlier alternatives take priority)
  const tokenRegex =
    /(\/\*[\s\S]*?\*\/)|(\/\/[^\n]*)|(`(?:\\[\s\S]|[^`])*`)|("(?:\\[\s\S]|[^"\\])*")|('(?:\\[\s\S]|[^'\\])*')|(=&gt;)|(&lt;\/?)([\w.]+)|\b(\d+\.?\d*)\b|\b([a-zA-Z_$][\w$]*)\b/g;

  const result = escaped.replace(
    tokenRegex,
    (
      match,
      blockComment,   // 1
      lineComment,    // 2
      templateLit,    // 3
      doubleStr,      // 4
      singleStr,      // 5
      arrow,          // 6
      jsxBracket,     // 7
      jsxTag,         // 8
      num,            // 9
      word,           // 10
    ) => {
      // Comments
      if (blockComment || lineComment)
        return `<span style="color:#8b949e">${match}</span>`;
      // Strings
      if (templateLit || doubleStr || singleStr)
        return `<span style="color:#a5d6ff">${match}</span>`;
      // Arrow =>
      if (arrow)
        return `<span style="color:#ff7b72">${match}</span>`;
      // JSX tags
      if (jsxBracket && jsxTag)
        return `<span style="color:#8b949e">${jsxBracket}</span><span style="color:#7ee787">${jsxTag}</span>`;
      // Numbers
      if (num)
        return `<span style="color:#79c0ff">${match}</span>`;
      // Words: keywords, builtins, or function calls
      if (word) {
        if (keywords.has(word))
          return `<span style="color:#ff7b72">${match}</span>`;
        if (builtins.has(word))
          return `<span style="color:#79c0ff">${match}</span>`;
        // Check if followed by ( — look ahead in the original escaped string
        const afterIdx = tokenRegex.lastIndex;
        const rest = escaped.slice(afterIdx);
        if (/^\s*\(/.test(rest))
          return `<span style="color:#d2a8ff">${match}</span>`;
      }
      return match;
    },
  );

  return result;
}

// File tree node type
type FileNode = {
  name: string;
  type: "file" | "folder";
  extension?: string;
  children?: FileNode[];
};

// Insert a file into the tree, creating intermediate folders as needed
function insertIntoTree(
  tree: FileNode[],
  pathParts: string[],
): FileNode[] {
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

// Collect all folder paths in a tree (for auto-expanding)
function collectFolderPaths(
  nodes: FileNode[],
  parentPath: string,
): string[] {
  const paths: string[] = [];
  for (const node of nodes) {
    if (node.type === "folder") {
      const p = parentPath ? `${parentPath}/${node.name}` : node.name;
      paths.push(p);
      if (node.children) paths.push(...collectFolderPaths(node.children, p));
    }
  }
  return paths;
}

// Mock file tree
const initialFileTree: FileNode[] = [
  {
    name: "src",
    type: "folder",
    children: [
      {
        name: "app",
        type: "folder",
        children: [
          { name: "page.tsx", type: "file", extension: "tsx" },
          { name: "layout.tsx", type: "file", extension: "tsx" },
          { name: "globals.css", type: "file", extension: "css" },
        ],
      },
      {
        name: "components",
        type: "folder",
        children: [
          { name: "Button.tsx", type: "file", extension: "tsx" },
          { name: "Header.tsx", type: "file", extension: "tsx" },
        ],
      },
      { name: "index.ts", type: "file", extension: "ts" },
    ],
  },
  { name: "package.json", type: "file", extension: "json" },
  { name: "tsconfig.json", type: "file", extension: "json" },
  { name: "README.md", type: "file", extension: "md" },
];

// Placeholder code for editor
const placeholderCode = `import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="counter">
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

export default Counter;
`;

// Chat message type
type ChatMessage = {
  id: string;
  role: "user" | "ai";
  content: string;
  hasCode?: boolean;
};

const initialChatMessages: ChatMessage[] = [
  {
    id: "1",
    role: "user",
    content: "How can I optimize this component for performance?",
  },
  {
    id: "2",
    role: "ai",
    content:
      "You can memoize the component with `React.memo` and wrap the callback in `useCallback` to prevent unnecessary re-renders. Here's an example:",
    hasCode: true,
  },
];

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
  expandedFolders,
  toggleFolder,
}: {
  node: FileNode;
  depth: number;
  parentPath: string;
  selectedPath: string;
  onSelect: (path: string, name: string) => void;
  expandedFolders: Set<string>;
  toggleFolder: (path: string) => void;
}) {
  const path = parentPath ? `${parentPath}/${node.name}` : node.name;
  const isFolder = node.type === "folder";
  const isExpanded = isFolder && expandedFolders.has(path);
  const isSelected = selectedPath === path;

  if (node.type === "file") {
    return (
      <button
        type="button"
        onClick={() => onSelect(path, node.name)}
        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-[var(--hover-bg)] ${isSelected ? "bg-[var(--selected-bg)] text-[var(--accent)]" : "text-[#8b949e]"}`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        <FileIcon extension={node.extension} />
        <span className="truncate">{node.name}</span>
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
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [selectedPath, setSelectedPath] = useState("src/app/page.tsx");
  const [currentFileName, setCurrentFileName] = useState("page.tsx");
  const [language, setLanguage] = useState("TypeScript");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["src", "src/app", "src/components"]),
  );
  const [fileTree, setFileTree] = useState<FileNode[]>(initialFileTree);
  const [fileContents, setFileContents] = useState<Map<string, string>>(
    () => new Map([["src/app/page.tsx", placeholderCode]]),
  );
  const [code, setCode] = useState(placeholderCode);
  const [chatMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [dragging, setDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const handleEditorScroll = useCallback(() => {
    const highlight = highlightRef.current;
    const textarea = textareaRef.current;
    if (highlight) {
      highlight.scrollLeft = textarea?.scrollLeft ?? 0;
    }
  }, []);

  const getLang = (ext: string | undefined) =>
    ext === "tsx" || ext === "ts"
      ? "TypeScript"
      : ext === "jsx" || ext === "js"
        ? "JavaScript"
        : ext === "css"
          ? "CSS"
          : ext === "json"
            ? "JSON"
            : ext === "html"
              ? "HTML"
              : "Plain Text";

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
    const ext = name.split(".").pop();
    setLanguage(getLang(ext));
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
      setLanguage(getLang(name.split(".").pop()));
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
        const path = useRelativePath && file.webkitRelativePath
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
            const dirPath = basePath
              ? `${basePath}/${entry.name}`
              : entry.name;
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
          <button
            type="button"
            className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-[#8b949e] transition-colors hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)]"
          >
            <span>my-project</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M6 8L2 4h8L6 8z" />
            </svg>
          </button>
        </div>
        <button
          type="button"
          className="rounded-md p-2 text-[#8b949e] transition-colors hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)]"
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
      </header>

      <div className="relative flex flex-1 min-h-0">
        {/* Left sidebar - File Explorer */}
        <aside
          className={`flex shrink-0 flex-col border-r border-[var(--border)] bg-[var(--sidebar-bg)] shadow-lg transition-[width] duration-200 ease-out ${leftOpen ? "w-64" : "w-0 overflow-hidden border-0"}`}
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
              {...({ webkitdirectory: "", directory: "" } as React.InputHTMLAttributes<HTMLInputElement>)}
            />
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="border-b border-[var(--border)] px-3 py-2">
              <p className="truncate text-sm font-medium">my-project</p>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              {fileTree.map((node) => (
                <FileTreeItem
                  key={node.name}
                  node={node}
                  depth={0}
                  parentPath=""
                  selectedPath={selectedPath}
                  onSelect={selectFile}
                  expandedFolders={expandedFolders}
                  toggleFolder={toggleFolder}
                />
              ))}
            </div>
          </div>
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
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="rounded px-2 py-1 text-xs text-[#8b949e] transition-colors hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)]"
              >
                Save
              </button>
              <button
                type="button"
                className="rounded px-2 py-1 text-xs text-[#8b949e] transition-colors hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)]"
              >
                Format
              </button>
              <button
                type="button"
                className="rounded px-2 py-1 text-xs text-[#8b949e] transition-colors hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)]"
              >
                Diff
              </button>
            </div>
          </div>

          {/* Editor content — single scroll container */}
          <div
            ref={editorContainerRef}
            className="relative flex-1 min-h-0 overflow-auto bg-[var(--editor-bg)]"
          >
            <div className="flex min-h-full font-mono text-sm">
              {/* Line numbers */}
              <div className="sticky left-0 z-10 shrink-0 border-r border-[var(--border)] bg-[var(--sidebar-bg)] py-4 pl-4 pr-4 text-right text-[#8b949e] select-none">
                {code.split("\n").map((_, i) => (
                  <div key={i} className="leading-6">
                    {i + 1}
                  </div>
                ))}
              </div>
              {/* Code area with syntax highlighting overlay */}
              <div className="relative flex-1 min-w-0">
                {/* Highlighted layer (behind) — sized by content, not absolute */}
                <pre
                  ref={highlightRef}
                  aria-hidden="true"
                  className="pointer-events-none whitespace-pre py-4 pl-4 pr-6 font-mono text-sm leading-6 text-[#e6edf3]"
                  dangerouslySetInnerHTML={{
                    __html: highlightCode(code) + "\n",
                  }}
                />
                {/* Transparent textarea (on top, covers the pre exactly) */}
                <textarea
                  ref={textareaRef}
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  spellCheck={false}
                  className="absolute inset-0 z-[1] block w-full h-full resize-none overflow-hidden bg-transparent py-4 pl-4 pr-6 font-mono text-sm leading-6 text-transparent caret-[var(--accent)] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </main>

        {/* Right panel - AI Assistant Chat */}
        <aside
          className={`flex shrink-0 flex-col border-l border-[var(--border)] bg-[var(--sidebar-bg)] shadow-lg transition-[width] duration-200 ease-out ${rightOpen ? "w-96" : "w-0 overflow-hidden border-0"}`}
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    {msg.hasCode && (
                      <pre className="mt-3 rounded-lg bg-[var(--code-block-bg)] p-3 font-mono text-xs text-[#8b949e] border border-[var(--border)]">
                        <code>React.memo(Counter)</code>
                        <br />
                        <code>
                          useCallback(() =&gt; setCount(c =&gt; c + 1), [])
                        </code>
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="shrink-0 border-t border-[var(--border)] p-3">
              <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--editor-bg)] px-3 py-2">
                <button
                  type="button"
                  className="shrink-0 rounded p-1.5 text-[#8b949e] transition-colors hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)]"
                  aria-label="Attach file"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                </button>
                <input
                  type="text"
                  placeholder="Ask about this code…"
                  className="min-w-0 flex-1 bg-transparent text-sm text-[var(--foreground)] placeholder:text-[#8b949e] focus:outline-none"
                  readOnly
                />
                <button
                  type="button"
                  className="shrink-0 rounded bg-[var(--accent)] p-2 text-white transition-opacity hover:opacity-90"
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
              </div>
            </div>
          </div>
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
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 text-[var(--accent)]">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className="text-lg font-medium text-[var(--foreground)]">Drop files or folders here</p>
            <p className="mt-1 text-sm text-[#8b949e]">Files will be added to the explorer</p>
          </div>
        </div>
      )}

      {/* Bottom status bar */}
      <footer className="flex h-6 shrink-0 items-center justify-between border-t border-[var(--border)] bg-[var(--status-bar)] px-4 text-xs text-[#8b949e]">
        <div className="flex items-center gap-4">
          <span>Ready</span>
          <span>{language}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Ln 5, Col 3</span>
        </div>
      </footer>
    </div>
  );
}
