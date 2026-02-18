"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { ChatMessage } from "@/types";

export function useChat(
  projectId: string | null,
  selectedPath: string,
  code: string,
) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const sendChat = useCallback(async () => {
    const question = chatInput.trim();
    if (!question || !projectId || chatLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: question,
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "ai",
      content: "",
    };
    setChatMessages((prev) => [...prev, aiMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          question,
          history: chatMessages.map((m) => ({
            role: m.role === "ai" ? "assistant" : "user",
            content: m.content,
          })),
          current_file: selectedPath ? { path: selectedPath, content: code } : null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setChatMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsg.id
              ? { ...m, content: `Error: ${err.error || "Something went wrong"}` }
              : m,
          ),
        );
        setChatLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (reader) {
        let accumulated = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          const text = accumulated;
          setChatMessages((prev) =>
            prev.map((m) => (m.id === aiMsg.id ? { ...m, content: text } : m)),
          );
        }
      }
    } catch {
      setChatMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsg.id
            ? { ...m, content: "Error: Failed to connect to AI." }
            : m,
        ),
      );
    }
    setChatLoading(false);
  }, [chatInput, projectId, chatLoading, chatMessages, selectedPath, code]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  return {
    chatMessages, chatInput, setChatInput,
    chatLoading, chatEndRef, sendChat,
  };
}
