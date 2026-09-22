export type BaseItem = {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: number;
  updatedAt: number;
};

export type Folder = BaseItem & {
  type: "folder";
};

export type TextFile = BaseItem & {
  type: "file";
  content: string;
};

export type FileSystemItem = Folder | TextFile;

export type ItemType = "folder" | "file";

/**
 * Recursive Tree Node structure built by buildTree()
 */
export type TreeItem = {
  id: string;
  name: string;
  type: ItemType;
  parentId: string | null;
  createdAt: number;
  updatedAt: number;
  content?: string;
  children: TreeItem[];
  depth: number;
};
