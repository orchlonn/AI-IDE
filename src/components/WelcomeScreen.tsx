export default function WelcomeScreen({
  onUploadFiles,
  onUploadFolder,
}: {
  onUploadFiles: () => void;
  onUploadFolder: () => void;
}) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden text-center">
      {/* Decorative gradient orb */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full opacity-50 blur-3xl"
        style={{
          background: "var(--gradient-accent)",
          animation: "orbFloat 6s ease-in-out infinite",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, var(--background) 70%)",
        }}
      />

      <div
        className="relative flex flex-col items-center"
        style={{ animation: "scaleIn 320ms ease-out" }}
      >
        <div
          className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_30px_rgba(122,167,255,0.35)]"
          style={{ background: "var(--gradient-accent)" }}
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <h2 className="mb-2 text-[22px] font-semibold tracking-tight text-[var(--foreground)]">
          Start something new
        </h2>
        <p className="mb-7 max-w-sm text-[13px] leading-relaxed text-[var(--muted-strong)]">
          Drop a folder, upload files, or load a saved project to get started.
          Ask the AI anything along the way.
        </p>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onUploadFiles}
            className="ray-focus group flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--sidebar-bg)] px-3.5 py-2 text-[12.5px] text-[var(--foreground)] transition-all hover:border-[var(--border-strong)] hover:bg-[var(--hover-bg)]"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-[var(--muted-strong)]"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            Upload Files
            <span className="kbd ml-1">⌘O</span>
          </button>
          <button
            type="button"
            onClick={onUploadFolder}
            className="ray-focus group flex items-center gap-2 rounded-lg px-3.5 py-2 text-[12.5px] font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_4px_18px_rgba(122,167,255,0.35)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "var(--gradient-accent)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            Open Folder
          </button>
        </div>
        <p className="mt-5 text-[11.5px] text-[var(--muted)]">
          or drag and drop files anywhere
        </p>
      </div>
    </div>
  );
}
