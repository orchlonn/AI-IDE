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
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--sidebar-bg)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            Settings
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-[var(--muted,#8b949e)] transition-colors hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--muted,#8b949e)]">
            Theme
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.values(allThemes).map((theme) => {
              const isSelected = theme.id === themeId;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => onSelectTheme(theme.id)}
                  className={`group rounded-lg border-2 p-3 text-left transition-all ${
                    isSelected
                      ? "border-[var(--accent)] shadow-md"
                      : "border-[var(--border)] hover:border-[var(--muted,#8b949e)]"
                  }`}
                  style={{ background: theme.cssVars["--sidebar-bg"] }}
                >
                  {/* Color preview */}
                  <div className="mb-2 flex gap-1.5">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ background: theme.cssVars["--background"] }}
                    />
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ background: theme.cssVars["--accent"] }}
                    />
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ background: theme.cssVars["--foreground"] }}
                    />
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ background: theme.cssVars["--border"] }}
                    />
                  </div>
                  {/* Mini editor preview */}
                  <div
                    className="mb-2 rounded-md p-2"
                    style={{ background: theme.cssVars["--editor-bg"] }}
                  >
                    <div
                      className="mb-1 h-1.5 w-3/4 rounded"
                      style={{ background: theme.cssVars["--muted"] }}
                    />
                    <div
                      className="mb-1 h-1.5 w-1/2 rounded"
                      style={{ background: theme.cssVars["--accent"] }}
                    />
                    <div
                      className="h-1.5 w-2/3 rounded"
                      style={{ background: theme.cssVars["--foreground"], opacity: 0.4 }}
                    />
                  </div>
                  {/* Label */}
                  <span
                    className="text-xs font-medium"
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
