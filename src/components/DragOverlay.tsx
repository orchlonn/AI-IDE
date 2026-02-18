export default function DragOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-2xl border-2 border-dashed border-[var(--accent)] bg-[var(--sidebar-bg)] px-12 py-8 text-center">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="mx-auto mb-3 text-[var(--accent)]"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p className="text-lg font-medium text-[var(--foreground)]">
          Drop files or folders here
        </p>
        <p className="mt-1 text-sm text-[#8b949e]">
          Files will be added to the explorer
        </p>
      </div>
    </div>
  );
}
