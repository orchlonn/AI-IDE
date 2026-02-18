import type { FileNode } from "@/types";

// ── File filtering constants ──
export const MAX_FILE_SIZE = 512 * 1024; // 512 KB per file
export const MAX_PROJECT_SIZE = 4 * 1024 * 1024; // 4 MB total
export const BINARY_EXTENSIONS =
  /\.(png|jpg|jpeg|gif|svg|ico|webp|bmp|woff2?|ttf|eot|otf|mp[34]|wav|ogg|webm|avi|mov|zip|tar|gz|bz2|xz|7z|rar|exe|dll|so|dylib|bin|pdf|doc|docx|xls|xlsx|ppt|pptx|db|sqlite|class|jar|pyc|pyo|o|obj|DS_Store)$/i;
export const SKIP_DIRS = /^(node_modules|\.git|\.next|dist|build|out|coverage|\.cache|__pycache__|\.venv|vendor|\.idea|\.vscode)$/;
export const SKIP_FILES = /^(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|bun\.lockb|composer\.lock|Gemfile\.lock|Cargo\.lock|\.env\.local|\.env)$/;

// Detect Monaco language ID from file name
export const extToLanguage: Record<string, string> = {
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

export function getLanguageFromFileName(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase();
  return (ext && extToLanguage[ext]) || "plaintext";
}

// Insert a file into the tree, creating intermediate folders as needed
export function insertIntoTree(tree: FileNode[], pathParts: string[]): FileNode[] {
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

export function shouldSkipFile(name: string, size: number): boolean {
  if (size > MAX_FILE_SIZE) return true;
  if (BINARY_EXTENSIONS.test(name)) return true;
  if (SKIP_FILES.test(name)) return true;
  return false;
}

export function shouldSkipDir(name: string): boolean {
  return SKIP_DIRS.test(name);
}

// Map language to run command
export function getRunCommand(fileName: string, lang: string): string | null {
  const cmds: Record<string, string> = {
    python: `python3 "${fileName}"`,
    javascript: `node "${fileName}"`,
    typescript: `npx tsx "${fileName}"`,
    java: `javac "${fileName}" && java "${fileName.replace(/\\.java$/, "")}"`,
    c: `gcc "${fileName}" -o /tmp/a.out && /tmp/a.out`,
    cpp: `g++ "${fileName}" -o /tmp/a.out && /tmp/a.out`,
    go: `go run "${fileName}"`,
    ruby: `ruby "${fileName}"`,
    php: `php "${fileName}"`,
    rust: `rustc "${fileName}" -o /tmp/a.out && /tmp/a.out`,
    shell: `bash "${fileName}"`,
  };
  return cmds[lang] ?? null;
}
