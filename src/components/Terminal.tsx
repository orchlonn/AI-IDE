"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface TerminalLine {
  id: number;
  type: "input" | "output" | "error";
  content: string;
}

interface TerminalProps {
  onClose: () => void;
}

export default function Terminal({ onClose }: TerminalProps) {
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: 0, type: "output", content: "Terminal ready.\n" },
  ]);
  const [input, setInput] = useState("");
  const [cwd, setCwd] = useState("~");
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const nextId = useRef(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [running]);

  const addLine = useCallback(
    (type: TerminalLine["type"], content: string) => {
      const id = nextId.current++;
      setLines((prev) => [...prev, { id, type, content }]);
    },
    []
  );

  const runCommand = useCallback(
    async (cmd: string) => {
      const trimmed = cmd.trim();
      if (!trimmed) return;

      addLine("input", `$ ${trimmed}`);
      setHistory((prev) => [...prev, trimmed]);
      setHistoryIdx(-1);
      setInput("");
      setRunning(true);

      // Handle cd locally
      if (/^cd\s/.test(trimmed) || trimmed === "cd") {
        const target = trimmed.replace(/^cd\s*/, "").trim() || "~";
        // Resolve the cd on the server by running pwd after cd
        try {
          const res = await fetch("/api/terminal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              command: `cd ${target} && pwd`,
              cwd: cwd === "~" ? undefined : cwd,
            }),
          });
          const text = await res.text();
          const clean = text.replace(/\n__EXIT_CODE__:\d+\n?$/, "").trim();
          if (clean) {
            setCwd(clean);
            addLine("output", clean);
          }
        } catch {
          addLine("error", "Failed to change directory");
        }
        setRunning(false);
        return;
      }

      // Handle clear
      if (trimmed === "clear") {
        setLines([]);
        setRunning(false);
        return;
      }

      try {
        const res = await fetch("/api/terminal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            command: trimmed,
            cwd: cwd === "~" ? undefined : cwd,
          }),
        });

        if (!res.ok || !res.body) {
          addLine("error", `Error: ${res.statusText}`);
          setRunning(false);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // Split on newlines and emit complete lines
          const parts = buffer.split("\n");
          buffer = parts.pop() ?? "";
          for (const line of parts) {
            if (line.startsWith("__EXIT_CODE__:")) continue;
            addLine("output", line);
          }
        }

        // Flush remaining buffer
        if (buffer && !buffer.startsWith("__EXIT_CODE__:")) {
          addLine("output", buffer);
        }
      } catch {
        addLine("error", "Failed to execute command");
      }

      setRunning(false);
    },
    [cwd, addLine]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      runCommand(input);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const newIdx =
          historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(newIdx);
        setInput(history[newIdx]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx !== -1) {
        const newIdx = historyIdx + 1;
        if (newIdx >= history.length) {
          setHistoryIdx(-1);
          setInput("");
        } else {
          setHistoryIdx(newIdx);
          setInput(history[newIdx]);
        }
      }
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <div
      className="flex h-full flex-col bg-[#0d1117] text-[#e6edf3] font-mono text-sm"
      onClick={focusInput}
    >
      {/* Terminal header */}
      <div className="flex h-8 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--sidebar-bg)] px-3">
        <div className="flex items-center gap-2">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-[#8b949e]"
          >
            <polyline points="4 17 10 11 4 5" />
            <line x1="12" y1="19" x2="20" y2="19" />
          </svg>
          <span className="text-xs font-medium text-[#8b949e]">Terminal</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLines([]);
            }}
            className="rounded p-1 text-[#8b949e] hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)]"
            title="Clear terminal"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="rounded p-1 text-[#8b949e] hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)]"
            title="Close terminal"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Terminal output */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-0">
        {lines.map((line) => (
          <div
            key={line.id}
            className={`whitespace-pre-wrap break-all leading-5 ${
              line.type === "input"
                ? "text-[#58a6ff]"
                : line.type === "error"
                  ? "text-[#f85149]"
                  : "text-[#e6edf3]"
            }`}
          >
            {line.content}
          </div>
        ))}

        {/* Input line */}
        {!running && (
          <div className="flex items-center leading-5">
            <span className="text-[#3fb950] shrink-0">
              {cwd}
            </span>
            <span className="text-[#8b949e] mx-1 shrink-0">$</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent outline-none text-[#e6edf3] caret-[#58a6ff]"
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        )}

        {running && (
          <div className="flex items-center gap-2 leading-5 text-[#8b949e]">
            <span className="animate-pulse">Running...</span>
          </div>
        )}
      </div>
    </div>
  );
}
