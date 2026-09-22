import { FileSystemItem, Folder, TreeItem } from "./types";

export function getChildren(
  items: Record<string, FileSystemItem>,
  parentId: string | null
): FileSystemItem[] {
  const children: FileSystemItem[] = [];

  for (const key in items) {
    const item = items[key];
    if (item && item.parentId === parentId) {
      children.push(item);
    }
  }

  return children.sort((a, b) => {
    // Folders come before files
    if (a.type !== b.type) {
      return a.type === "folder" ? -1 : 1;
    }
    // Case-insensitive alphabetical sorting
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });
}


export function buildTree(
  items: Record<string, FileSystemItem>,
  parentId: string | null = null,
  depth: number = 0
): TreeItem[] {
  // 1. Base step: Get immediate sorted children of this parent
  const children = getChildren(items, parentId);

  // 2. Recursive step: map each child, recursing into folders to build children
  return children.map((item) => {
    const isFolder = item.type === "folder";
    const node: TreeItem = {
      id: item.id,
      name: item.name,
      type: item.type,
      parentId: item.parentId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      content: item.type === "file" ? item.content : undefined,
      depth,
      // Easy recursion: folders recurse for children, files have empty array
      children: isFolder ? buildTree(items, item.id, depth + 1) : [],
    };
    return node;
  });
}


export function getPath(
  items: Record<string, FileSystemItem>,
  id: string | null
): Folder[] {
  if (!id || !items[id]) return [];

  const path: Folder[] = [];
  let current: FileSystemItem | undefined = items[id];
  const visited = new Set<string>();

  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    if (current.type === "folder") {
      path.unshift(current);
    }
    if (!current.parentId) break;
    current = items[current.parentId];
  }

  return path;
}


export function getPathString(
  items: Record<string, FileSystemItem>,
  id: string | null
): string {
  if (!id || !items[id]) return "Explorer";

  const segments: string[] = [];
  let current: FileSystemItem | undefined = items[id];
  const visited = new Set<string>();

  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    segments.unshift(current.name);
    if (!current.parentId) break;
    current = items[current.parentId];
  }

  return "Explorer / " + segments.join(" / ");
}

export function getAncestorIds(
  items: Record<string, FileSystemItem>,
  id: string
): string[] {
  const item = items[id];
  if (!item || !item.parentId) return [];

  const ancestorIds: string[] = [];
  let currentParentId: string | null = item.parentId;
  const visited = new Set<string>();

  while (currentParentId && items[currentParentId] && !visited.has(currentParentId)) {
    visited.add(currentParentId);
    ancestorIds.unshift(currentParentId);
    currentParentId = items[currentParentId].parentId;
  }

  return ancestorIds;
}

export function getDescendantIds(
  items: Record<string, FileSystemItem>,
  id: string
): string[] {
  const descendants: string[] = [];
  const queue: string[] = [id];
  const visited = new Set<string>([id]);

  while (queue.length > 0) {
    const parent = queue.shift()!;
    for (const key in items) {
      const item = items[key];
      if (item && item.parentId === parent && !visited.has(item.id)) {
        visited.add(item.id);
        descendants.push(item.id);
        if (item.type === "folder") {
          queue.push(item.id);
        }
      }
    }
  }

  return descendants;
}

export function getDescendantCount(
  items: Record<string, FileSystemItem>,
  id: string
): number {
  return getDescendantIds(items, id).length;
}

export function validateName(
  name: string,
  parentId: string | null,
  items: Record<string, FileSystemItem>,
  excludeId?: string
): { valid: boolean; error?: string } {
  const trimmed = name.trim();

  if (!trimmed) {
    return { valid: false, error: "Name cannot be empty or only spaces." };
  }

  if (trimmed.length > 120) {
    return { valid: false, error: "Name cannot exceed 120 characters." };
  }

  // Check for forbidden characters
  const illegalCharsRegex = /[\\/:*?"<>|]/;
  if (illegalCharsRegex.test(trimmed)) {
    return {
      valid: false,
      error: 'Name cannot contain any of the following: \\ / : * ? " < > |',
    };
  }

  // Check for siblings with the same name (case-insensitive)
  const siblings = getChildren(items, parentId);
  const normalizedTarget = trimmed.toLowerCase();

  const isDuplicate = siblings.some(
    (item) => item.id !== excludeId && item.name.toLowerCase() === normalizedTarget
  );

  if (isDuplicate) {
    return {
      valid: false,
      error: `An item named "${trimmed}" already exists in this folder.`,
    };
  }

  return { valid: true };
}

export type SearchResult = {
  item: FileSystemItem;
  path: string;
  matchType: "name" | "content";
  snippet?: string;
};

export function searchItems(
  items: Record<string, FileSystemItem>,
  query: string
): SearchResult[] {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return [];

  const results: SearchResult[] = [];

  for (const key in items) {
    const item = items[key];
    if (!item) continue;

    const path = getPathString(items, item.id);
    const nameMatch = item.name.toLowerCase().includes(cleanQuery);

    if (nameMatch) {
      results.push({ item, path, matchType: "name" });
    } else if (item.type === "file" && item.content.toLowerCase().includes(cleanQuery)) {
      // Find a small snippet around the match
      const lowerContent = item.content.toLowerCase();
      const matchIndex = lowerContent.indexOf(cleanQuery);
      const start = Math.max(0, matchIndex - 20);
      const end = Math.min(item.content.length, matchIndex + cleanQuery.length + 30);
      const snippet =
        (start > 0 ? "..." : "") +
        item.content.substring(start, end).replace(/\n/g, " ") +
        (end < item.content.length ? "..." : "");

      results.push({ item, path, matchType: "content", snippet });
    }
  }

  // Sort results: name matches first, then folders before files, then alphabetical
  return results.sort((a, b) => {
    if (a.matchType !== b.matchType) {
      return a.matchType === "name" ? -1 : 1;
    }
    if (a.item.type !== b.item.type) {
      return a.item.type === "folder" ? -1 : 1;
    }
    return a.item.name.localeCompare(b.item.name);
  });
}

export function findNearestSurvivingAncestor(
  items: Record<string, FileSystemItem>,
  deletedIds: Set<string>,
  currentFolderId: string | null
): string | null {
  if (!currentFolderId || !deletedIds.has(currentFolderId)) {
    return currentFolderId;
  }

  let current: FileSystemItem | undefined = items[currentFolderId];
  while (current && current.parentId) {
    const pid: string = current.parentId;
    if (!deletedIds.has(pid) && items[pid] && items[pid].type === "folder") {
      return pid;
    }
    current = items[pid];
  }

  // If deleted item was a root item or all ancestors deleted, fall back to Explorer root (null)
  return null;
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}


export function formatSize(contentLength: number): string {
  if (contentLength < 1024) {
    return `${contentLength} B`;
  }
  return `${(contentLength / 1024).toFixed(1)} KB`;
}
