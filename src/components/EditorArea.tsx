"use client";

import Editor, { type OnMount } from "@monaco-editor/react";
import dynamic from "next/dynamic";
import type { TerminalHandle } from "@/components/Terminal";
import type { FileNode } from "@/types";
import type { TerminalColors } from "@/lib/themes";
import WelcomeScreen from "./WelcomeScreen";

const Terminal = dynamic(() => import("@/components/Terminal"), { ssr: false });

export default function EditorArea({
  currentFileName,
  language,
  canRun,
  code,
  selectedPath,
  monacoTheme,
  fileTree,
  onEditorMount,
  onCodeChange,
  onFormat,
  onRunFile,
  onUploadFiles,
  onUploadFolder,
  terminalOpen,
  terminalHeight,
  terminalRef,
  pendingRunCommand,
  pendingRunFile,
  terminalColors,
  onCloseTerminal,
  onTerminalResizeStart,
}: {
  currentFileName: string;
  language: string;
  canRun: boolean;
  code: string;
  selectedPath: string;
  monacoTheme: string;
  fileTree: FileNode[];
  onEditorMount: OnMount;
  onCodeChange: (code: string) => void;
  onFormat: () => void;
  onRunFile: () => void;
  onUploadFiles: () => void;
  onUploadFolder: () => void;
  terminalOpen: boolean;
  terminalHeight: number;
  terminalRef: React.RefObject<TerminalHandle | null>;
  pendingRunCommand: string | null;
  pendingRunFile: { name: string; content: string } | null;
  terminalColors: TerminalColors;
  onCloseTerminal: () => void;
  onTerminalResizeStart: (e: React.MouseEvent) => void;
}) {
  return (
    <main className="flex flex-1 flex-col min-w-0 min-h-0">
      {/* Editor toolbar */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--editor-bg)]/60 px-3 backdrop-blur-xl">
        <div className="flex min-w-0 items-center gap-2">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="shrink-0 text-[var(--muted)]"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span className="truncate text-[12.5px] font-medium text-[var(--foreground)]">
            {currentFileName}
          </span>
          <span className="ml-1 rounded-md border border-[var(--border)] bg-[var(--hover-bg)] px-1.5 py-px font-mono text-[10.5px] uppercase tracking-wide text-[var(--muted-strong)]">
            {language}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={onFormat}
            className="ray-focus flex items-center gap-1 rounded-md px-2 py-1 text-[11.5px] text-[var(--muted-strong)] transition-colors hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)]"
            title="Format file"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="21" y1="10" x2="3" y2="10" />
              <line x1="21" y1="6" x2="3" y2="6" />
              <line x1="21" y1="14" x2="9" y2="14" />
              <line x1="21" y1="18" x2="9" y2="18" />
            </svg>
            Format
          </button>
          {canRun && (
            <button
              type="button"
              onClick={onRunFile}
              className="ray-focus ml-1 flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11.5px] font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_1px_2px_rgba(0,0,0,0.3)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: "var(--gradient-accent)" }}
              title="Run file"
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="none"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Run
            </button>
          )}
        </div>
      </div>

      {/* Monaco Editor / Diff Editor / Welcome */}
      <div className="flex-1 min-h-0">
        {fileTree.length === 0 ? (
          <WelcomeScreen onUploadFiles={onUploadFiles} onUploadFolder={onUploadFolder} />
        ) : (
          <Editor
            theme={monacoTheme}
            language={language}
            path={selectedPath}
            value={code}
            onChange={(value) => onCodeChange(value ?? "")}
            onMount={onEditorMount}
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
          <div
            className="h-px shrink-0 cursor-row-resize bg-[var(--border)] transition-colors hover:bg-[var(--accent)]/40"
            onMouseDown={onTerminalResizeStart}
          />
          <div className="shrink-0" style={{ height: terminalHeight }}>
            <Terminal
              ref={terminalRef}
              onClose={onCloseTerminal}
              initialCommand={pendingRunCommand}
              initialFile={pendingRunFile}
              terminalColors={terminalColors}
            />
          </div>
        </>
      )}
    </main>
  );
}
