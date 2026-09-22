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
import { ROOT_FOLDER_ID } from "@/lib/seedData";

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
  const isRoot = item.id === ROOT_FOLDER_ID;

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

          <AlertDialogDescription className="text-sm text-muted-foreground space-y-2">
            <div>
              Are you sure you want to delete{" "}
              <span className="font-mono text-foreground font-semibold">
                &ldquo;{item.name}&rdquo;
              </span>
              ?
            </div>

            {isFolder && descendantCount > 0 && (
              <div className="p-2.5 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs leading-relaxed font-medium">
                Warning: This folder contains <strong>{descendantCount}</strong> nested{" "}
                {descendantCount === 1 ? "item" : "items"}. All contents will be permanently
                deleted.
              </div>
            )}

            {isRoot && (
              <div className="p-2.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs">
                Note: Deleting the root workspace folder will clear all items. You can restore default items at any time.
              </div>
            )}

            <div className="text-xs text-muted-foreground/80">
              This action cannot be undone.
            </div>
          </AlertDialogDescription>
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

