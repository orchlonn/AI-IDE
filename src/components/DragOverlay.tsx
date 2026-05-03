export default function DragOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
      style={{ animation: "fadeIn 150ms ease-out" }}
    >
      <div
        className="glass relative rounded-3xl px-14 py-10 text-center shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
        style={{ animation: "scaleIn 200ms ease-out" }}
      >
        {/* Animated ring */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-2 rounded-2xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(122,167,255,0.4), rgba(181,140,255,0.4))",
            mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMask:
              "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            padding: "1.5px",
          }}
        />
        <div
          className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_24px_rgba(122,167,255,0.35)]"
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
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <p className="text-[16px] font-semibold text-[var(--foreground)]">
          Drop files or folders here
        </p>
        <p className="mt-1 text-[12.5px] text-[var(--muted-strong)]">
          They&apos;ll be added to your explorer
        </p>
      </div>
    </div>
  );
}
