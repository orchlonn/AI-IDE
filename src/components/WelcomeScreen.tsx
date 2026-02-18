export default function WelcomeScreen({
  onUploadFiles,
  onUploadFolder,
}: {
  onUploadFiles: () => void;
  onUploadFolder: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <svg
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        className="mb-6 text-[#30363d]"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="18" x2="12" y2="12" />
        <line x1="9" y1="15" x2="12" y2="12" />
        <line x1="15" y1="15" x2="12" y2="12" />
      </svg>
      <h2 className="mb-2 text-xl font-semibold text-[var(--foreground)]">
        No project open
      </h2>
      <p className="mb-6 max-w-sm text-sm text-[#8b949e]">
        Upload files or a folder to get started, or load a saved project from the dropdown above.
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onUploadFiles}
          className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--sidebar-bg)] px-4 py-2.5 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--hover-bg)]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          Upload Files
        </button>
        <button
          type="button"
          onClick={onUploadFolder}
          className="flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm text-white transition-opacity hover:opacity-90"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          Open Folder
        </button>
      </div>
      <p className="mt-4 text-xs text-[#484f58]">
        or drag and drop files anywhere
      </p>
    </div>
  );
}
