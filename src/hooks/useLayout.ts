"use client";

import { useState, useRef, useCallback } from "react";

export function useLayout() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);
  const [leftWidth, setLeftWidth] = useState(256);
  const [rightOpen, setRightOpen] = useState(true);
  const [rightWidth, setRightWidth] = useState(384);
  const resizingLeft = useRef(false);
  const resizingRight = useRef(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(200);
  const resizingTerminal = useRef(false);

  const handleLeftResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    resizingLeft.current = true;
    const startX = e.clientX;
    const startWidth = leftWidth;
    const onMouseMove = (ev: MouseEvent) => {
      if (!resizingLeft.current) return;
      const delta = ev.clientX - startX;
      setLeftWidth(Math.max(180, Math.min(500, startWidth + delta)));
    };
    const onMouseUp = () => {
      resizingLeft.current = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [leftWidth]);

  const handleRightResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    resizingRight.current = true;
    const startX = e.clientX;
    const startWidth = rightWidth;
    const onMouseMove = (ev: MouseEvent) => {
      if (!resizingRight.current) return;
      const delta = startX - ev.clientX;
      setRightWidth(Math.max(280, Math.min(600, startWidth + delta)));
    };
    const onMouseUp = () => {
      resizingRight.current = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [rightWidth]);

  const handleTerminalResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    resizingTerminal.current = true;
    const startY = e.clientY;
    const startHeight = terminalHeight;

    const onMouseMove = (ev: MouseEvent) => {
      if (!resizingTerminal.current) return;
      const delta = startY - ev.clientY;
      setTerminalHeight(Math.max(100, Math.min(600, startHeight + delta)));
    };

    const onMouseUp = () => {
      resizingTerminal.current = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [terminalHeight]);

  return {
    settingsOpen, setSettingsOpen,
    leftOpen, setLeftOpen, leftWidth,
    rightOpen, setRightOpen, rightWidth,
    terminalOpen, setTerminalOpen, terminalHeight,
    handleLeftResizeStart,
    handleRightResizeStart,
    handleTerminalResizeStart,
  };
}
