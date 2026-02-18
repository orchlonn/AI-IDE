"use client";

import { useState, useRef, useCallback } from "react";
import { getLanguageFromFileName } from "@/lib/fileUtils";

export function useCodeReview(
  selectedPath: string,
  code: string,
  fileContents: Map<string, string>,
  language: string,
  handleCodeChange: (newCode: string) => void,
  setFileContents: React.Dispatch<React.SetStateAction<Map<string, string>>>,
  showToast: (message: string, type: "error" | "warning" | "success") => void,
) {
  const [diffMode, setDiffMode] = useState<{
    original: string;
    modified: string;
    language: string;
  } | null>(null);
  const lastApplied = useRef<{ path: string; previousContent: string } | null>(null);

  const handleReviewCode = useCallback(
    (suggestedCode: string, filePath?: string) => {
      const targetPath = filePath || selectedPath;
      const original = targetPath === selectedPath ? code : (fileContents.get(targetPath) ?? "");
      setDiffMode({
        original,
        modified: suggestedCode,
        language: filePath ? getLanguageFromFileName(filePath) : language,
      });
    },
    [code, language, selectedPath, fileContents],
  );

  const handleApplyCode = useCallback(
    (newCode: string, filePath?: string) => {
      const targetPath = filePath || selectedPath;
      if (!targetPath) {
        showToast("No file to apply to. Open a file first.", "error");
        return;
      }

      const previousContent = targetPath === selectedPath ? code : (fileContents.get(targetPath) ?? "");
      lastApplied.current = { path: targetPath, previousContent };

      if (targetPath === selectedPath) {
        handleCodeChange(newCode);
      } else {
        setFileContents((prev) => {
          const next = new Map(prev);
          next.set(targetPath, newCode);
          return next;
        });
      }

      const fileName = targetPath.split("/").pop() ?? targetPath;
      showToast(`Applied to ${fileName}`, "success");
    },
    [selectedPath, code, fileContents, handleCodeChange, showToast, setFileContents],
  );

  const undoLastApply = useCallback(() => {
    if (!lastApplied.current) return;
    const { path, previousContent } = lastApplied.current;
    if (path === selectedPath) {
      handleCodeChange(previousContent);
    } else {
      setFileContents((prev) => {
        const next = new Map(prev);
        next.set(path, previousContent);
        return next;
      });
    }
    lastApplied.current = null;
    showToast("Reverted changes", "success");
  }, [selectedPath, handleCodeChange, showToast, setFileContents]);

  const acceptDiff = useCallback(() => {
    if (!diffMode) return;
    handleCodeChange(diffMode.modified);
    setDiffMode(null);
  }, [diffMode, handleCodeChange]);

  const rejectDiff = useCallback(() => {
    setDiffMode(null);
  }, []);

  return {
    diffMode, lastApplied,
    handleReviewCode, handleApplyCode,
    undoLastApply, acceptDiff, rejectDiff,
  };
}
