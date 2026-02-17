export type ThemeId = "github-dark" | "github-light" | "dracula" | "monokai" | "nord";

export interface TerminalColors {
  bg: string;
  fg: string;
  inputColor: string;
  errorColor: string;
  promptColor: string;
  mutedColor: string;
  cursorColor: string;
}

export interface ThemeDefinition {
  id: ThemeId;
  label: string;
  monacoTheme: string;
  cssVars: Record<string, string>;
  terminal: TerminalColors;
}

export const themes: Record<ThemeId, ThemeDefinition> = {
  "github-dark": {
    id: "github-dark",
    label: "GitHub Dark",
    monacoTheme: "vs-dark",
    cssVars: {
      "--background": "#0d1117",
      "--foreground": "#e6edf3",
      "--sidebar-bg": "#161b22",
      "--panel-bg": "#0d1117",
      "--editor-bg": "#0d1117",
      "--border": "#30363d",
      "--accent": "#58a6ff",
      "--accent-muted": "#388bfd26",
      "--hover-bg": "#21262d",
      "--selected-bg": "#388bfd26",
      "--line-highlight": "#1c2128",
      "--status-bar": "#161b22",
      "--chat-user-bg": "#388bfd26",
      "--chat-ai-bg": "#21262d",
      "--code-block-bg": "#161b22",
      "--muted": "#8b949e",
    },
    terminal: {
      bg: "#0d1117",
      fg: "#e6edf3",
      inputColor: "#58a6ff",
      errorColor: "#f85149",
      promptColor: "#3fb950",
      mutedColor: "#8b949e",
      cursorColor: "#58a6ff",
    },
  },

  "github-light": {
    id: "github-light",
    label: "GitHub Light",
    monacoTheme: "vs",
    cssVars: {
      "--background": "#ffffff",
      "--foreground": "#1f2328",
      "--sidebar-bg": "#f6f8fa",
      "--panel-bg": "#ffffff",
      "--editor-bg": "#ffffff",
      "--border": "#d1d9e0",
      "--accent": "#0969da",
      "--accent-muted": "#0969da1a",
      "--hover-bg": "#eaeef2",
      "--selected-bg": "#0969da1a",
      "--line-highlight": "#eaeef2",
      "--status-bar": "#f6f8fa",
      "--chat-user-bg": "#0969da1a",
      "--chat-ai-bg": "#f6f8fa",
      "--code-block-bg": "#f6f8fa",
      "--muted": "#656d76",
    },
    terminal: {
      bg: "#ffffff",
      fg: "#1f2328",
      inputColor: "#0969da",
      errorColor: "#cf222e",
      promptColor: "#1a7f37",
      mutedColor: "#656d76",
      cursorColor: "#0969da",
    },
  },

  dracula: {
    id: "dracula",
    label: "Dracula",
    monacoTheme: "vs-dark",
    cssVars: {
      "--background": "#282a36",
      "--foreground": "#f8f8f2",
      "--sidebar-bg": "#21222c",
      "--panel-bg": "#282a36",
      "--editor-bg": "#282a36",
      "--border": "#44475a",
      "--accent": "#bd93f9",
      "--accent-muted": "#bd93f926",
      "--hover-bg": "#44475a",
      "--selected-bg": "#bd93f926",
      "--line-highlight": "#44475a",
      "--status-bar": "#21222c",
      "--chat-user-bg": "#bd93f926",
      "--chat-ai-bg": "#44475a",
      "--code-block-bg": "#21222c",
      "--muted": "#6272a4",
    },
    terminal: {
      bg: "#282a36",
      fg: "#f8f8f2",
      inputColor: "#bd93f9",
      errorColor: "#ff5555",
      promptColor: "#50fa7b",
      mutedColor: "#6272a4",
      cursorColor: "#bd93f9",
    },
  },

  monokai: {
    id: "monokai",
    label: "Monokai",
    monacoTheme: "vs-dark",
    cssVars: {
      "--background": "#272822",
      "--foreground": "#f8f8f2",
      "--sidebar-bg": "#1e1f1c",
      "--panel-bg": "#272822",
      "--editor-bg": "#272822",
      "--border": "#3e3d32",
      "--accent": "#a6e22e",
      "--accent-muted": "#a6e22e26",
      "--hover-bg": "#3e3d32",
      "--selected-bg": "#a6e22e26",
      "--line-highlight": "#3e3d32",
      "--status-bar": "#1e1f1c",
      "--chat-user-bg": "#a6e22e26",
      "--chat-ai-bg": "#3e3d32",
      "--code-block-bg": "#1e1f1c",
      "--muted": "#75715e",
    },
    terminal: {
      bg: "#272822",
      fg: "#f8f8f2",
      inputColor: "#66d9ef",
      errorColor: "#f92672",
      promptColor: "#a6e22e",
      mutedColor: "#75715e",
      cursorColor: "#66d9ef",
    },
  },

  nord: {
    id: "nord",
    label: "Nord",
    monacoTheme: "vs-dark",
    cssVars: {
      "--background": "#2e3440",
      "--foreground": "#d8dee9",
      "--sidebar-bg": "#292e39",
      "--panel-bg": "#2e3440",
      "--editor-bg": "#2e3440",
      "--border": "#3b4252",
      "--accent": "#88c0d0",
      "--accent-muted": "#88c0d026",
      "--hover-bg": "#3b4252",
      "--selected-bg": "#88c0d026",
      "--line-highlight": "#3b4252",
      "--status-bar": "#292e39",
      "--chat-user-bg": "#88c0d026",
      "--chat-ai-bg": "#3b4252",
      "--code-block-bg": "#292e39",
      "--muted": "#616e88",
    },
    terminal: {
      bg: "#2e3440",
      fg: "#d8dee9",
      inputColor: "#88c0d0",
      errorColor: "#bf616a",
      promptColor: "#a3be8c",
      mutedColor: "#616e88",
      cursorColor: "#88c0d0",
    },
  },
};

export const DEFAULT_THEME: ThemeId = "github-dark";
export const THEME_STORAGE_KEY = "ai-ide-theme";
