import ProjectMenu from "./ProjectMenu";

export default function Header({
  projectName,
  showProjectMenu,
  onToggleProjectMenu,
  projectList,
  projectId,
  onLoadProject,
  onDeleteProject,
  saving,
  onSave,
  onOpenSettings,
}: {
  projectName: string;
  showProjectMenu: boolean;
  onToggleProjectMenu: () => void;
  projectList: { id: string; name: string; updated_at: string }[];
  projectId: string | null;
  onLoadProject: (id: string) => void;
  onDeleteProject: (id: string, e: React.MouseEvent) => void;
  saving: boolean;
  onSave: () => void;
  onOpenSettings: () => void;
}) {
  return (
    <header className="relative z-30 flex h-11 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--sidebar-bg)]/80 px-3 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 pl-1.5">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-[7px] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_1px_2px_rgba(0,0,0,0.3)]"
            style={{ background: "var(--gradient-accent)" }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-[13px] font-semibold tracking-tight text-[var(--foreground)]">
            AI Code Editor
          </span>
        </div>
        <div className="mx-2 h-4 w-px bg-[var(--border)]" />
        <div className="relative">
          <button
            type="button"
            onClick={onToggleProjectMenu}
            className="ray-focus flex items-center gap-2 rounded-md px-2.5 py-1 text-[12.5px] text-[var(--muted-strong)] transition-colors hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)]"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-[var(--muted)]"
            >
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            <span className="max-w-[200px] truncate">{projectName}</span>
            <svg
              width="10"
              height="10"
              viewBox="0 0 12 12"
              fill="currentColor"
              className="text-[var(--muted)]"
            >
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {showProjectMenu && (
            <ProjectMenu
              projectList={projectList}
              projectId={projectId}
              onLoadProject={onLoadProject}
              onDeleteProject={onDeleteProject}
            />
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="ray-focus flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12.5px] text-[var(--muted-strong)] transition-colors hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)] disabled:opacity-50"
          aria-label="Save project"
        >
          {saving ? (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              className="animate-spin"
            >
              <path d="M21 12a9 9 0 1 1-6.22-8.56" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
          )}
          <span>{saving ? "Saving" : "Save"}</span>
          <span className="kbd ml-0.5">⌘S</span>
        </button>
        <button
          type="button"
          onClick={onOpenSettings}
          className="ray-focus rounded-md p-1.5 text-[var(--muted)] transition-colors hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)]"
          aria-label="Settings"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>
    </header>
  );
}
