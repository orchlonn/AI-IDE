import type { ToastData } from "@/hooks/useToast";

const ICONS = {
  error: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  warning: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  success: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
};

const STYLES = {
  error: "text-red-300 border-red-500/30 bg-red-500/10",
  warning: "text-amber-200 border-amber-500/30 bg-amber-500/10",
  success: "text-emerald-200 border-emerald-500/30 bg-emerald-500/10",
};

export default function Toast({
  toast,
  showUndo,
  onUndo,
  onDismiss,
}: {
  toast: ToastData | null;
  showUndo: boolean;
  onUndo: () => void;
  onDismiss: () => void;
}) {
  if (!toast) return null;

  const type: keyof typeof ICONS =
    toast.type === "error" || toast.type === "warning" ? toast.type : "success";

  return (
    <div
      className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2"
      style={{ animation: "slideUp 220ms cubic-bezier(0.2, 0.8, 0.2, 1)" }}
    >
      <div
        className={`glass flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-[12.5px] shadow-[0_18px_50px_rgba(0,0,0,0.5)] ${STYLES[type]}`}
      >
        <span className="shrink-0">{ICONS[type]}</span>
        <span className="font-medium">{toast.message}</span>
        {showUndo && (
          <button
            type="button"
            onClick={onUndo}
            className="ml-1 rounded-md border border-current/20 px-2 py-0.5 text-[11.5px] font-medium opacity-90 transition-opacity hover:opacity-100"
          >
            Undo
          </button>
        )}
        <button
          type="button"
          onClick={onDismiss}
          className="ml-1 rounded p-0.5 opacity-50 transition-opacity hover:opacity-100"
          aria-label="Dismiss"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
