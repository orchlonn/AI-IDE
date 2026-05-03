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
  const status = saving
    ? { label: "Saving", dot: "bg-yellow-400 animate-pulse" }
    : indexing
      ? { label: "Indexing", dot: "bg-[var(--accent)] animate-pulse" }
      : projectId
        ? { label: "Synced", dot: "bg-emerald-400" }
        : { label: "Local", dot: "bg-[var(--muted)]" };

  return (
    <footer className="flex h-7 shrink-0 items-center justify-between border-t border-[var(--border)] bg-[var(--status-bar)] px-3 text-[11px] text-[var(--muted)]">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${status.dot}`} />
          <span className="text-[var(--muted-strong)]">{status.label}</span>
        </div>
        <span className="h-3 w-px bg-[var(--border)]" />
        <span className="font-mono uppercase tracking-wide">{language}</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleTerminal}
          className={`flex items-center gap-1.5 rounded-md px-1.5 py-0.5 transition-colors hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)] ${
            terminalOpen ? "text-[var(--foreground)]" : ""
          }`}
          title="Toggle Terminal"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="4 17 10 11 4 5" />
            <line x1="12" y1="19" x2="20" y2="19" />
          </svg>
          <span>Terminal</span>
          <span className="kbd">⌃`</span>
        </button>
        <span className="font-mono text-[10.5px]">Ln 5, Col 3</span>
      </div>
    </footer>
  );
}
