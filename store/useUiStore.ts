import { create } from "zustand";
import { ROOT_FOLDER_ID } from "@/lib/seedData";

export interface UiState {
  selectedFolderId: string | null;
  openFileId: string | null;
  expandedFolderIds: string[];
  sidebarOpen: boolean;
  searchOpen: boolean;
  isEditorDirty: boolean;
  pendingAction: (() => void) | null;

  // Actions
  setSelectedFolderId: (id: string | null) => void;
  setOpenFileId: (id: string | null) => void;
  toggleFolder: (id: string) => void;
  expandFolder: (id: string) => void;
  expandFolders: (ids: string[]) => void;
  collapseFolder: (id: string) => void;
  setSidebarOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  closeFile: () => void;
  setIsEditorDirty: (dirty: boolean) => void;
  setPendingAction: (action: (() => void) | null) => void;
  requestNavigation: (action: () => void) => void;
  confirmDiscardNavigation: () => void;
  cancelPendingNavigation: () => void;

  // Composite navigators
  navigateToFolder: (id: string, ancestorIds?: string[]) => void;
  navigateToFile: (fileId: string, parentFolderId: string, ancestorIds?: string[]) => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  selectedFolderId: ROOT_FOLDER_ID,
  openFileId: null,
  expandedFolderIds: [ROOT_FOLDER_ID, "folder-projects"],
  sidebarOpen: false,
  searchOpen: false,
  isEditorDirty: false,
  pendingAction: null,

  setSelectedFolderId: (id) =>
    set({
      selectedFolderId: id,
      openFileId: null,
    }),

  setOpenFileId: (id) =>
    set({
      openFileId: id,
    }),

  toggleFolder: (id) =>
    set((state) => {
      const isExpanded = state.expandedFolderIds.includes(id);
      return {
        expandedFolderIds: isExpanded
          ? state.expandedFolderIds.filter((item) => item !== id)
          : [...state.expandedFolderIds, id],
      };
    }),

  expandFolder: (id) =>
    set((state) => {
      if (state.expandedFolderIds.includes(id)) return state;
      return { expandedFolderIds: [...state.expandedFolderIds, id] };
    }),

  expandFolders: (ids) =>
    set((state) => {
      const unique = Array.from(new Set([...state.expandedFolderIds, ...ids]));
      return { expandedFolderIds: unique };
    }),

  collapseFolder: (id) =>
    set((state) => ({
      expandedFolderIds: state.expandedFolderIds.filter((item) => item !== id),
    })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setSearchOpen: (open) => set({ searchOpen: open }),

  closeFile: () => set({ openFileId: null, isEditorDirty: false }),

  setIsEditorDirty: (dirty) => set({ isEditorDirty: dirty }),

  setPendingAction: (action) => set({ pendingAction: action }),

  // Guards against unsaved changes before navigating
  requestNavigation: (action: () => void) => {
    const { isEditorDirty } = get();
    if (isEditorDirty) {
      set({ pendingAction: action });
    } else {
      action();
    }
  },

  confirmDiscardNavigation: () => {
    const { pendingAction } = get();
    set({ isEditorDirty: false, pendingAction: null });
    if (pendingAction) {
      pendingAction();
    }
  },

  cancelPendingNavigation: () => {
    set({ pendingAction: null });
  },

  navigateToFolder: (id, ancestorIds = []) =>
    set((state) => {
      const uniqueExpanded = Array.from(
        new Set([...state.expandedFolderIds, id, ...ancestorIds])
      );
      return {
        selectedFolderId: id,
        openFileId: null,
        expandedFolderIds: uniqueExpanded,
        sidebarOpen: false,
        isEditorDirty: false,
      };
    }),

  navigateToFile: (fileId, parentFolderId, ancestorIds = []) =>
    set((state) => {
      const uniqueExpanded = Array.from(
        new Set([...state.expandedFolderIds, parentFolderId, ...ancestorIds])
      );
      return {
        selectedFolderId: parentFolderId,
        openFileId: fileId,
        expandedFolderIds: uniqueExpanded,
        sidebarOpen: false,
        isEditorDirty: false,
      };
    }),
}));
