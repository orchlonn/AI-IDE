"use client";

import { useState, useRef, useCallback } from "react";
import { MAX_PROJECT_SIZE } from "@/lib/fileUtils";

export function useDragDrop(
  processFiles: (files: { path: string; content: string }[]) => void,
  readFileList: (fileList: FileList, useRelativePath: boolean) => void,
  readEntry: (entry: FileSystemEntry, basePath: string) => Promise<{ path: string; content: string }[]>,
  showToast: (message: string, type: "error" | "warning" | "success") => void,
) {
  const [dragging, setDragging] = useState(false);
  const dragCounterRef = useRef(0);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      dragCounterRef.current = 0;

      const items = e.dataTransfer.items;
      if (items && items.length > 0) {
        const entries: FileSystemEntry[] = [];
        for (let i = 0; i < items.length; i++) {
          const entry = items[i].webkitGetAsEntry?.();
          if (entry) entries.push(entry);
        }
        if (entries.length > 0) {
          Promise.all(entries.map((e) => readEntry(e, ""))).then((results) => {
            const files = results.flat();
            const totalSize = files.reduce((sum, f) => sum + f.content.length, 0);
            if (totalSize > MAX_PROJECT_SIZE) {
              showToast(`Project too large (${(totalSize / 1024 / 1024).toFixed(1)} MB). Max is ${MAX_PROJECT_SIZE / 1024 / 1024} MB. Try removing large files.`, "error");
              return;
            }
            processFiles(files);
          });
          return;
        }
      }
      if (e.dataTransfer.files.length > 0) {
        readFileList(e.dataTransfer.files, false);
      }
    },
    [readEntry, processFiles, readFileList, showToast],
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current++;
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current--;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return {
    dragging,
    handleDrop, handleDragEnter, handleDragLeave, handleDragOver,
  };
}
