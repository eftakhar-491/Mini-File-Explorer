"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useFileSystemStore } from "@/store/useFileSystemStore";
import { useUiStore } from "@/store/useUiStore";
import { getDescendantCount, findNearestSurvivingAncestor } from "@/lib/fileSystemUtils";

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string | null;
  onDeleted?: (deletedIds: string[]) => void;
}

export function DeleteDialog({
  open,
  onOpenChange,
  itemId,
  onDeleted,
}: DeleteDialogProps) {
  const items = useFileSystemStore((state) => state.items);
  const deleteItem = useFileSystemStore((state) => state.deleteItem);

  const selectedFolderId = useUiStore((state) => state.selectedFolderId);
  const openFileId = useUiStore((state) => state.openFileId);
  const setSelectedFolderId = useUiStore((state) => state.setSelectedFolderId);
  const closeFile = useUiStore((state) => state.closeFile);

  const item = itemId ? items[itemId] : null;

  const descendantCount = React.useMemo(() => {
    if (!item || item.type !== "folder") return 0;
    return getDescendantCount(items, item.id);
  }, [items, item]);

  if (!item) return null;

  const isFolder = item.type === "folder";

  const handleDelete = () => {
    const deletedIds = deleteItem(item.id);
    const deletedSet = new Set(deletedIds);

    // If currently open file is among deleted items, close the editor
    if (openFileId && deletedSet.has(openFileId)) {
      closeFile();
    }

    // If active folder is in deleted set, navigate to nearest surviving ancestor
    if (selectedFolderId && deletedSet.has(selectedFolderId)) {
      const fallbackId = findNearestSurvivingAncestor(items, deletedSet, selectedFolderId);
      setSelectedFolderId(fallbackId);
    }

    onOpenChange(false);
    onDeleted?.(deletedIds);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[440px] bg-card border-border shadow-xl">
        <AlertDialogHeader className="gap-2">
          <div className="flex items-center gap-2 text-destructive">
            <div className="p-2 rounded bg-destructive/10">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <AlertDialogTitle className="text-base font-semibold">
              Delete {isFolder ? "Folder" : "File"}?
            </AlertDialogTitle>
          </div>

          <AlertDialogDescription className="text-sm text-muted-foreground leading-normal">
            Are you sure you want to delete{" "}
            <span className="font-mono text-foreground font-semibold">
              &ldquo;{item.name}&rdquo;
            </span>
            ? This action cannot be undone.
          </AlertDialogDescription>

          {isFolder && descendantCount > 0 && (
            <div className="p-2.5 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs leading-relaxed font-medium mt-1">
              Warning: This folder contains <strong>{descendantCount}</strong> nested{" "}
              {descendantCount === 1 ? "item" : "items"}. All contents will be permanently
              deleted.
            </div>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2 pt-2">
          <AlertDialogCancel className="h-8 text-xs">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="h-8 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete Permanently
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
