"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import { FileSystemItem, Folder, TextFile, TreeItem } from "@/lib/types";
import {
  getChildren,
  getPath,
  getDescendantIds,
  buildTree,
} from "@/lib/fileSystemUtils";
import { dualIndexedDBStorage } from "@/lib/storage";

export interface FileSystemState {
  items: Record<string, FileSystemItem>;
  hasHydrated: boolean;

  // Actions
  createFolder: (parentId: string | null, name: string) => string;
  createFile: (parentId: string | null, name: string, content?: string) => string;
  renameItem: (id: string, newName: string) => void;
  deleteItem: (id: string) => string[];
  updateFileContent: (id: string, content: string) => void;
  seedIfEmpty: () => void;
  resetToDefault: () => void;
  setHasHydrated: (hydrated: boolean) => void;
}

function generateId(prefix: "folder" | "file"): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
}

export const useFileSystemStore = create<FileSystemState>()(
  persist(
    (set) => ({
      items: {},
      hasHydrated: false,

      createFolder: (parentId, name) => {
        const id = generateId("folder");
        const now = Date.now();
        const newFolder: Folder = {
          id,
          name: name.trim(),
          parentId,
          type: "folder",
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          items: {
            ...state.items,
            [id]: newFolder,
          },
        }));

        return id;
      },

      createFile: (parentId, name, content = "") => {
        const id = generateId("file");
        const now = Date.now();
        const newFile: TextFile = {
          id,
          name: name.trim(),
          parentId,
          type: "file",
          content,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          items: {
            ...state.items,
            [id]: newFile,
          },
        }));

        return id;
      },

      renameItem: (id, newName) => {
        const trimmed = newName.trim();
        if (!trimmed) return;

        set((state) => {
          const item = state.items[id];
          if (!item) return state;

          return {
            items: {
              ...state.items,
              [id]: {
                ...item,
                name: trimmed,
                updatedAt: Date.now(),
              },
            },
          };
        });
      },

      deleteItem: (id) => {
        let deletedIds: string[] = [];

        set((state) => {
          if (!state.items[id]) return state;

          // Gather target item and all recursive descendants in one batch
          const descendants = getDescendantIds(state.items, id);
          deletedIds = [id, ...descendants];

          const nextItems = { ...state.items };
          for (const delId of deletedIds) {
            delete nextItems[delId];
          }

          return { items: nextItems };
        });

        return deletedIds;
      },

      updateFileContent: (id, content) => {
        set((state) => {
          const item = state.items[id];
          if (!item || item.type !== "file") return state;

          return {
            items: {
              ...state.items,
              [id]: {
                ...item,
                content,
                updatedAt: Date.now(),
              },
            },
          };
        });
      },

      seedIfEmpty: () => {
        // No automatic seed data initially
      },

      resetToDefault: () => {
        set({ items: {} });
      },

      setHasHydrated: (hydrated: boolean) => {
        set({ hasHydrated: hydrated });
      },
    }),
    {
      name: "workspace-explorer-fs-v3",
      storage: createJSONStorage(() => dualIndexedDBStorage),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// ==========================================
// Memoized Selectors for Performance
// ==========================================

/**
 * Returns immediate children of parentId.
 * Subscribing components only re-render if the list of children changed.
 */
export function useChildren(parentId: string | null): FileSystemItem[] {
  return useFileSystemStore(
    useShallow((state) => getChildren(state.items, parentId))
  );
}

/**
 * Returns a single item by id.
 */
export function useItem(id: string | null): FileSystemItem | null {
  return useFileSystemStore((state) => (id ? state.items[id] ?? null : null));
}

/**
 * Returns the folder path for an item/folder.
 */
export function usePath(id: string | null): Folder[] {
  return useFileSystemStore(
    useShallow((state) => getPath(state.items, id))
  );
}

/**
 * Returns the complete hierarchical nested tree using recursive buildTree.
 */
export function useTree(rootId: string | null = null): TreeItem[] {
  return useFileSystemStore(
    useShallow((state) => buildTree(state.items, rootId))
  );
}

/**
 * Returns hydration status.
 */
export function useFsHydrated(): boolean {
  return useFileSystemStore((state) => state.hasHydrated);
}

