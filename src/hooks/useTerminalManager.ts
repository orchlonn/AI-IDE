"use client";

import { useState, useRef, useCallback } from "react";
import type { TerminalHandle } from "@/components/Terminal";
import { getRunCommand } from "@/lib/fileUtils";

export function useTerminalManager(
  currentFileName: string,
  language: string,
  code: string,
  terminalOpen: boolean,
  setTerminalOpen: (open: boolean) => void,
) {
  const [pendingRunCommand, setPendingRunCommand] = useState<string | null>(null);
  const [pendingRunFile, setPendingRunFile] = useState<{ name: string; content: string } | null>(null);
  const terminalRef = useRef<TerminalHandle>(null);

  const handleRunFile = useCallback(() => {
    if (!currentFileName) return;
    const cmd = getRunCommand(currentFileName, language);
    if (!cmd) return;

    const fileInfo = { name: currentFileName, content: code };

    if (terminalOpen && terminalRef.current) {
      terminalRef.current.runCommand(cmd, fileInfo);
    } else {
      setPendingRunCommand(cmd);
      setPendingRunFile(fileInfo);
      setTerminalOpen(true);
    }
  }, [currentFileName, language, terminalOpen, code, setTerminalOpen]);

  return {
    pendingRunCommand, pendingRunFile, terminalRef, handleRunFile,
  };
}
