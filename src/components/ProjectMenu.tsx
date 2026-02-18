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
            onClick={() => onLoadProject(p.id)}
            className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--hover-bg)] ${p.id === projectId ? "text-[var(--accent)]" : "text-[var(--foreground)]"}`}
          >
            <span className="truncate">{p.name}</span>
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-xs text-[#8b949e]">
                {new Date(p.updated_at).toLocaleDateString()}
              </span>
              <button
                type="button"
                onClick={(e) => onDeleteProject(p.id, e)}
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
  );
}
