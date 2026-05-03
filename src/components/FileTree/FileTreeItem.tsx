"use client";

import { useState } from "react";
import type { FileNode } from "@/types";
import FileIcon from "./FileIcon";
import FolderIcon from "./FolderIcon";

export default function FileTreeItem({
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
        className={`group relative flex w-full items-center gap-2 rounded-md py-[5px] pr-2 text-left text-[12.5px] transition-colors ${
          isSelected
            ? "bg-[var(--selected-bg)] text-[var(--foreground)]"
            : "text-[var(--muted-strong)] hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)]"
        }`}
        style={{ paddingLeft: `${10 + depth * 14}px` }}
      >
        {isSelected && (
          <span className="absolute left-1 top-1/2 h-3.5 w-[2px] -translate-y-1/2 rounded-full bg-[var(--accent)]" />
        )}
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
            className="min-w-0 flex-1 rounded bg-[var(--editor-bg)] px-1 py-0.5 text-[12.5px] text-[var(--foreground)] outline-none ring-1 ring-[var(--accent)]"
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
        className={`group flex w-full items-center gap-2 rounded-md py-[5px] pr-2 text-left text-[12.5px] transition-colors ${
          isSelected
            ? "bg-[var(--selected-bg)] text-[var(--foreground)]"
            : "text-[var(--muted-strong)] hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)]"
        }`}
        style={{ paddingLeft: `${10 + depth * 14}px` }}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 12 12"
          className={`shrink-0 text-[var(--muted)] transition-transform duration-150 ${
            isExpanded ? "rotate-90" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 2L8 6L4 10" />
        </svg>
        <FolderIcon open={isExpanded} />
        <span className="truncate">{node.name}</span>
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
