"use client";

import { useState } from "react";

// File tree node type
type FileNode = {
  name: string;
  type: "file" | "folder";
  extension?: string;
  children?: FileNode[];
};

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
  const [chatMessages] = useState<ChatMessage[]>(initialChatMessages);

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const selectFile = (path: string, name: string) => {
    setSelectedPath(path);
    setCurrentFileName(name);
    const ext = name.split(".").pop();
    const lang =
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
    setLanguage(lang);
  };

  return (
    <div className="flex h-screen flex-col bg-[var(--background)] text-[var(--foreground)]">
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
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="border-b border-[var(--border)] px-3 py-2">
              <p className="truncate text-sm font-medium">my-project</p>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              {initialFileTree.map((node) => (
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

          {/* Editor content */}
          <div className="flex flex-1 min-h-0 overflow-auto bg-[var(--editor-bg)]">
            <div className="flex font-mono text-sm">
              {/* Line numbers */}
              <div className="sticky left-0 shrink-0 border-r border-[var(--border)] bg-[var(--sidebar-bg)] py-4 pl-4 pr-4 text-right text-[#8b949e] select-none">
                {placeholderCode.split("\n").map((_, i) => (
                  <div key={i} className="leading-6">
                    {i + 1}
                  </div>
                ))}
              </div>
              {/* Code area - Monaco-style placeholder with syntax highlight and highlighted line */}
              <pre className="flex-1 overflow-x-auto py-4 pl-4 pr-6">
                <code className="block min-w-max font-mono text-sm leading-6 text-[#e6edf3]">
                  <div>
                    <span className="text-[#7ee787]">import</span>{" "}
                    <span className="text-[#ff7b72]">{`{ useState }`}</span>{" "}
                    <span className="text-[#7ee787]">from</span>{" "}
                    <span className="text-[#a5d6ff]">&quot;react&quot;</span>;
                  </div>
                  <div>
                    <span className="text-[#ff7b72]">function</span>{" "}
                    <span className="text-[#d2a8ff]">Counter</span>
                    <span className="text-[#e6edf3]">() {`{`}</span>
                  </div>
                  <div>
                    {" "}
                    <span className="text-[#ff7b72]">const</span> [
                    <span className="text-[#79c0ff]">count</span>,{" "}
                    <span className="text-[#79c0ff]">setCount</span>] ={" "}
                    <span className="text-[#d2a8ff]">useState</span>(
                    <span className="text-[#79c0ff]">0</span>);
                  </div>
                  <div></div>
                  <div className="bg-[var(--line-highlight)] -ml-4 pl-4 border-l-2 border-[var(--accent)]">
                    {" "}
                    <span className="text-[#ff7b72]">return</span> (
                  </div>
                  <div>
                    {" "}
                    &lt;div <span className="text-[#79c0ff]">className</span>=
                    <span className="text-[#a5d6ff]">&quot;counter&quot;</span>
                    &gt;
                  </div>
                  <div> &lt;p&gt;Count: {`{count}`}&lt;/p&gt;</div>
                  <div>
                    {" "}
                    &lt;button <span className="text-[#79c0ff]">onClick</span>=
                    <span className="text-[#a5d6ff]">{`{() => setCount(count + 1)}`}</span>
                    &gt;
                  </div>
                  <div> Increment</div>
                  <div> &lt;/button&gt;</div>
                  <div> &lt;/div&gt;</div>
                  <div> );</div>
                  <div>{`}`}</div>
                  <div></div>
                  <div>
                    <span className="text-[#7ee787]">export default</span>{" "}
                    <span className="text-[#d2a8ff]">Counter</span>;
                  </div>
                </code>
              </pre>
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
