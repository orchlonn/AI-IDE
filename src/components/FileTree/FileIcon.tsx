export default function FileIcon({ extension }: { extension?: string }) {
  const color =
    extension === "ts" || extension === "tsx"
      ? "#3178c6"
      : extension === "js" || extension === "jsx"
        ? "#f7df1e"
        : extension === "css"
          ? "#563d7c"
          : extension === "json"
            ? "#cbcb41"
            : extension === "html"
              ? "#e34c26"
              : extension === "md"
                ? "#083fa1"
                : "#8b949e";
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0">
      <path
        fill={color}
        d="M2 2a1 1 0 0 1 1-1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-7 7a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 2 9.586V2z"
      />
    </svg>
  );
}
