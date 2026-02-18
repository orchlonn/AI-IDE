export type ProjectRow = {
  id: string;
  name: string;
  file_tree: FileNode[];
  file_contents: Record<string, string>;
  updated_at: string;
};

export type FileNode = {
  name: string;
  type: "file" | "folder";
  extension?: string;
  children?: FileNode[];
};

export type ChatMessage = {
  id: string;
  role: "user" | "ai";
  content: string;
};
