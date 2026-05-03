export default function ProjectMenu({
  projectList,
  projectId,
  onLoadProject,
  onDeleteProject,
}: {
  projectList: { id: string; name: string; updated_at: string }[];
  projectId: string | null;
  onLoadProject: (id: string) => void;
  onDeleteProject: (id: string, e: React.MouseEvent) => void;
}) {
  return (
    <div
      className="glass absolute left-0 top-full z-50 mt-2 w-80 origin-top-left overflow-hidden rounded-xl shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
      style={{ animation: "scaleIn 120ms ease-out" }}
    >
      <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2.5">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
          Projects
        </p>
        <span className="text-[10.5px] text-[var(--muted)]">
          {projectList.length}
        </span>
      </div>
      <div className="max-h-72 overflow-y-auto p-1.5">
        {projectList.length === 0 && (
          <div className="flex flex-col items-center justify-center px-3 py-8 text-center">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--hover-bg)]">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-[var(--muted)]"
              >
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="text-[12.5px] text-[var(--muted-strong)]">
              No saved projects
            </p>
            <p className="mt-0.5 text-[11px] text-[var(--muted)]">
              Save your current work to get started
            </p>
          </div>
        )}
        {projectList.map((p) => {
          const isActive = p.id === projectId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onLoadProject(p.id)}
              className={`group flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors ${
                isActive
                  ? "bg-[var(--selected-bg)] text-[var(--foreground)]"
                  : "text-[var(--muted-strong)] hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)]"
              }`}
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={`flex h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${
                    isActive ? "bg-[var(--accent)]" : "bg-transparent"
                  }`}
                />
                <span className="truncate">{p.name}</span>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <span className="text-[11px] text-[var(--muted)]">
                  {new Date(p.updated_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <button
                  type="button"
                  onClick={(e) => onDeleteProject(p.id, e)}
                  className="rounded p-1 text-[var(--muted)] opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                  aria-label="Delete project"
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
