"use client";

import { type ThemeId, type ThemeDefinition } from "@/lib/themes";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeId: ThemeId;
  onSelectTheme: (id: ThemeId) => void;
  allThemes: Record<ThemeId, ThemeDefinition>;
}

export default function SettingsModal({
  isOpen,
  onClose,
  themeId,
  onSelectTheme,
  allThemes,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
      style={{ animation: "fadeIn 160ms ease-out" }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-md" />

      {/* Modal */}
      <div
        className="glass relative w-full max-w-lg overflow-hidden rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "scaleIn 180ms ease-out" }}
      >
        {/* Top hairline highlight */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-6 w-6 items-center justify-center rounded-md text-white"
              style={{ background: "var(--gradient-accent)" }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <h2 className="text-[14px] font-semibold text-[var(--foreground)]">
              Settings
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-[var(--muted)] transition-colors hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
              Theme
            </h3>
            <span className="text-[11px] text-[var(--muted)]">
              {Object.keys(allThemes).length} options
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {Object.values(allThemes).map((theme) => {
              const isSelected = theme.id === themeId;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => onSelectTheme(theme.id)}
                  className={`group relative overflow-hidden rounded-xl border p-3 text-left transition-all ${
                    isSelected
                      ? "border-transparent shadow-[0_0_0_2px_var(--accent),0_8px_24px_rgba(0,0,0,0.4)]"
                      : "border-[var(--border)] hover:border-[var(--border-strong)]"
                  }`}
                  style={{ background: theme.cssVars["--sidebar-bg"] }}
                >
                  {isSelected && (
                    <div
                      className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full text-white"
                      style={{ background: "var(--gradient-accent)" }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                  {/* Color swatches */}
                  <div className="mb-2.5 flex gap-1">
                    {[
                      theme.cssVars["--background"],
                      theme.cssVars["--accent"],
                      theme.cssVars["--foreground"],
                      theme.cssVars["--border"],
                    ].map((c, i) => (
                      <div
                        key={i}
                        className="h-3.5 w-3.5 rounded-full ring-1 ring-black/30"
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                  {/* Mini editor preview */}
                  <div
                    className="mb-2.5 rounded-lg p-2.5"
                    style={{ background: theme.cssVars["--editor-bg"] }}
                  >
                    <div
                      className="mb-1.5 h-1.5 w-3/4 rounded-full"
                      style={{ background: theme.cssVars["--muted"] }}
                    />
                    <div
                      className="mb-1.5 h-1.5 w-1/2 rounded-full"
                      style={{ background: theme.cssVars["--accent"] }}
                    />
                    <div
                      className="h-1.5 w-2/3 rounded-full"
                      style={{ background: theme.cssVars["--foreground"], opacity: 0.4 }}
                    />
                  </div>
                  <span
                    className="text-[12px] font-medium"
                    style={{ color: theme.cssVars["--foreground"] }}
                  >
                    {theme.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
