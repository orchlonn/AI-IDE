import type { ToastData } from "@/hooks/useToast";

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

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-[slideUp_0.2s_ease-out]">
      <div
        className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg ${
          toast.type === "error"
            ? "border-red-500/30 bg-red-500/15 text-red-400"
            : toast.type === "warning"
              ? "border-yellow-500/30 bg-yellow-500/15 text-yellow-400"
              : "border-green-500/30 bg-green-500/15 text-green-400"
        }`}
      >
        <span>{toast.message}</span>
        {showUndo && (
          <button
            type="button"
            onClick={onUndo}
            className="ml-2 rounded px-2 py-0.5 text-xs font-medium underline hover:no-underline"
          >
            Undo
          </button>
        )}
        <button
          type="button"
          onClick={onDismiss}
          className="ml-2 opacity-60 hover:opacity-100"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
