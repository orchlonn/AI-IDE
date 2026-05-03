import type { ChatMessage } from "@/types";
import ChatMarkdown from "./ChatMarkdown";

export default function RightSidebar({
  isOpen,
  width,
  projectId,
  chatMessages,
  chatInput,
  chatLoading,
  indexing,
  chatEndRef,
  isDark = true,
  onToggle,
  onChatInputChange,
  onSendChat,
  onResizeStart,
}: {
  isOpen: boolean;
  width: number;
  projectId: string | null;
  chatMessages: ChatMessage[];
  chatInput: string;
  chatLoading: boolean;
  indexing: boolean;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  isDark?: boolean;
  onToggle: () => void;
  onChatInputChange: (value: string) => void;
  onSendChat: () => void;
  onResizeStart: (e: React.MouseEvent) => void;
}) {
  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="glass absolute right-3 top-16 z-10 flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[var(--muted-strong)] transition-colors hover:text-[var(--foreground)]"
        aria-label="Open AI assistant"
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span className="text-[11.5px] font-medium">AI</span>
      </button>
    );
  }

  return (
    <aside
      className="relative flex shrink-0 flex-col border-l border-[var(--border)] bg-[var(--sidebar-bg)]"
      style={{ width }}
    >
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-[var(--border)] px-3">
        <div className="flex items-center gap-2">
          <div
            className="flex h-5 w-5 items-center justify-center rounded-md text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
            style={{ background: "var(--gradient-accent)" }}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
            </svg>
          </div>
          <h2 className="text-[12.5px] font-semibold text-[var(--foreground)]">
            AI Assistant
          </h2>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="rounded-md p-1 text-[var(--muted)] transition-colors hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)] lg:hidden"
          aria-label="Close chat"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto overflow-x-auto px-4 py-5">
          {chatMessages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_24px_rgba(122,167,255,0.25)]"
                style={{ background: "var(--gradient-accent)" }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p className="mb-1 text-[13px] font-medium text-[var(--foreground)]">
                {projectId ? "Ask anything" : "AI is paused"}
              </p>
              <p className="text-[12px] leading-relaxed text-[var(--muted)]">
                {projectId
                  ? "Reference files with @, ask for changes, or explain code."
                  : "Save your project first to enable AI chat with code context."}
              </p>
            </div>
          )}

          <div className="space-y-4">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
                style={{ animation: "slideUp 200ms ease-out" }}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "rounded-br-md border border-[var(--accent-muted)] bg-[var(--chat-user-bg)] text-[var(--foreground)]"
                      : "rounded-bl-md border border-[var(--border)] bg-[var(--chat-ai-bg)] text-[var(--foreground)]"
                  }`}
                >
                  {msg.role === "ai" ? (
                    <ChatMarkdown content={msg.content} isDark={isDark} />
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            {chatLoading &&
              chatMessages[chatMessages.length - 1]?.content === "" && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-[var(--border)] bg-[var(--chat-ai-bg)] px-3.5 py-3">
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-[var(--muted-strong)]"
                      style={{ animation: "pulseDot 1.2s ease-in-out infinite", animationDelay: "0ms" }}
                    />
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-[var(--muted-strong)]"
                      style={{ animation: "pulseDot 1.2s ease-in-out infinite", animationDelay: "150ms" }}
                    />
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-[var(--muted-strong)]"
                      style={{ animation: "pulseDot 1.2s ease-in-out infinite", animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              )}
            <div ref={chatEndRef} />
          </div>
        </div>

        <div className="shrink-0 border-t border-[var(--border)] p-3">
          {indexing && (
            <div className="mb-2 flex items-center gap-2 px-1">
              <span
                className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
                style={{ animation: "pulseDot 1.2s ease-in-out infinite" }}
              />
              <span className="shimmer-text text-[11px]">
                Indexing project for AI…
              </span>
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSendChat();
            }}
            className="group flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--editor-bg)] px-3 py-2 transition-colors focus-within:border-[var(--border-strong)] focus-within:shadow-[0_0_0_3px_var(--accent-glow)]"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="shrink-0 text-[var(--muted)]"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
            </svg>
            <input
              type="text"
              placeholder={
                projectId ? "Ask about this code…" : "Save project to enable chat"
              }
              value={chatInput}
              onChange={(e) => onChatInputChange(e.target.value)}
              disabled={!projectId || chatLoading}
              className="min-w-0 flex-1 bg-transparent text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!projectId || chatLoading || !chatInput.trim()}
              className="ray-focus flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_2px_rgba(0,0,0,0.3)] transition-all hover:scale-[1.04] active:scale-[0.96] disabled:cursor-not-allowed disabled:scale-100 disabled:opacity-40 disabled:shadow-none"
              style={{ background: "var(--gradient-accent)" }}
              aria-label="Send"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </form>
        </div>
      </div>
      <div
        className="absolute top-0 left-0 z-10 h-full w-1 cursor-col-resize transition-colors hover:bg-[var(--accent)]/40"
        onMouseDown={onResizeStart}
      />
    </aside>
  );
}
