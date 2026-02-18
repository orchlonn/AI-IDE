"use client";

import { useState, useEffect, useCallback } from "react";
import {
  themes,
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  type ThemeId,
  type ThemeDefinition,
} from "@/lib/themes";

export function useTheme() {
  const [themeId, setThemeId] = useState<ThemeId>(DEFAULT_THEME);

  // Read from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null;
    if (stored && themes[stored]) {
      setThemeId(stored);
    }
  }, []);

  // Apply CSS variables to :root and persist
  useEffect(() => {
    const theme = themes[themeId];
    const root = document.documentElement;
    for (const [key, value] of Object.entries(theme.cssVars)) {
      root.style.setProperty(key, value);
    }
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  }, [themeId]);

  const currentTheme: ThemeDefinition = themes[themeId];

  const selectTheme = useCallback((id: ThemeId) => {
    setThemeId(id);
  }, []);

  return { themeId, currentTheme, selectTheme, allThemes: themes };
}
