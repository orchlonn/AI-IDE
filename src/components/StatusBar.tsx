export default function StatusBar({
  saving,
  indexing,
  projectId,
  language,
  terminalOpen,
  onToggleTerminal,
}: {
  saving: boolean;
  indexing: boolean;
  projectId: string | null;
  language: string;
  terminalOpen: boolean;
  onToggleTerminal: () => void;
}) {
  return (
    <footer className="flex h-6 shrink-0 items-center justify-between border-t border-[var(--border)] bg-[var(--status-bar)] px-4 text-xs text-[#8b949e]">
      <div className="flex items-center gap-4">
        <span>{saving ? "Saving..." : indexing ? "Indexing..." : projectId ? "Saved" : "Unsaved"}</span>
        <span>{language}</span>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onToggleTerminal}
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
  );
}
