import type { FileNode } from "@/types";
import FileTreeItem from "./FileTree/FileTreeItem";

export default function LeftSidebar({
  isOpen,
  width,
  projectName,
  fileTree,
  selectedPath,
  expandedFolders,
  fileInputRef,
  folderInputRef,
  onToggle,
  onSelectFile,
  onRenameFile,
  onToggleFolder,
  onReadFileList,
  onResizeStart,
}: {
  isOpen: boolean;
  width: number;
  projectName: string;
  fileTree: FileNode[];
  selectedPath: string;
  expandedFolders: Set<string>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  folderInputRef: React.RefObject<HTMLInputElement | null>;
  onToggle: () => void;
  onSelectFile: (path: string, name: string) => void;
  onRenameFile: (oldPath: string, newName: string) => void;
  onToggleFolder: (path: string) => void;
  onReadFileList: (fileList: FileList, useRelativePath: boolean) => void;
  onResizeStart: (e: React.MouseEvent) => void;
}) {
  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={onToggle}
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
    );
  }

  return (
    <aside
      className="relative flex shrink-0 flex-col border-r border-[var(--border)] bg-[var(--sidebar-bg)] shadow-lg"
      style={{ width }}
    >
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-[var(--border)] px-3">
        <span className="text-xs font-medium uppercase tracking-wider text-[#8b949e]">
          Explorer
        </span>
        <div className="flex items-center gap-1">
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
            onClick={onToggle}
            className="rounded p-1 text-[#8b949e] hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)] lg:hidden"
            aria-label="Close sidebar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) onReadFileList(e.target.files, false);
            e.target.value = "";
          }}
        />
        <input
          ref={folderInputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) onReadFileList(e.target.files, true);
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
              onSelect={onSelectFile}
              onRename={onRenameFile}
              expandedFolders={expandedFolders}
              toggleFolder={onToggleFolder}
            />
          ))}
        </div>
      </div>
      <div
        className="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-[var(--accent)] transition-colors z-10"
        onMouseDown={onResizeStart}
      />
    </aside>
  );
}
