"use client";

import * as React from "react";
import { Folder, FolderPlus, FilePlus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ItemRow } from "./ItemRow";
import { useChildren, useItem, useFileSystemStore } from "@/store/useFileSystemStore";
import { useUiStore } from "@/store/useUiStore";
import { RenameDialog } from "@/components/dialogs/RenameDialog";
import { DeleteDialog } from "@/components/dialogs/DeleteDialog";
import { CreateItemDialog } from "@/components/dialogs/CreateItemDialog";
import { FileSystemItem, ItemType } from "@/lib/types";

export function ItemList() {
  const selectedFolderId = useUiStore((state) => state.selectedFolderId);
  const currentFolder = useItem(selectedFolderId);
  const items = useChildren(selectedFolderId);
  const resetToDefault = useFileSystemStore((state) => state.resetToDefault);

  // Dialog state
  const [renameTarget, setRenameTarget] = React.useState<FileSystemItem | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<FileSystemItem | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [createType, setCreateType] = React.useState<ItemType>("file");

  const handleOpenCreate = (type: ItemType) => {
    setCreateType(type);
    setCreateDialogOpen(true);
  };

  const isWorkspaceEmpty = !currentFolder && items.length === 0;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Table-style header */}
      {items.length > 0 && (
        <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-medium text-muted-foreground/80 border-b border-border/50 shrink-0 select-none">
          <div className="flex-1">Name</div>
          <div className="flex items-center gap-4 text-right">
            <span className="w-16 hidden sm:inline-block">Size</span>
            <span className="w-28 hidden md:inline-block">Modified</span>
            <span className="w-7 text-center"></span>
          </div>
        </div>
      )}

      {/* Items or Empty State */}
      <div className="flex-1 overflow-y-auto p-2">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border/60 flex items-center justify-center text-muted-foreground/60 shadow-inner">
              <Folder className="h-8 w-8 stroke-1" />
            </div>

            <div className="max-w-xs space-y-1">
              <h3 className="text-sm font-semibold text-foreground">
                {isWorkspaceEmpty ? "Workspace is empty" : "This folder is empty"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isWorkspaceEmpty
                  ? "All folders and files have been removed. You can create new items or restore the sample workspace."
                  : `Create your first file or folder in ${currentFolder?.name || "this folder"} to get started.`}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1 flex-wrap justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenCreate("file")}
                className="h-8 text-xs font-medium gap-1.5"
              >
                <FilePlus className="h-3.5 w-3.5 text-muted-foreground" />
                New File
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleOpenCreate("folder")}
                className="h-8 text-xs font-medium gap-1.5"
              >
                <FolderPlus className="h-3.5 w-3.5" />
                New Folder
              </Button>
              {isWorkspaceEmpty && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetToDefault}
                  className="h-8 text-xs font-medium gap-1.5 text-muted-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restore Defaults
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-0.5">
            {items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                onRenameRequest={(target) => setRenameTarget(target)}
                onDeleteRequest={(target) => setDeleteTarget(target)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <RenameDialog
        open={!!renameTarget}
        onOpenChange={(open) => !open && setRenameTarget(null)}
        itemId={renameTarget?.id || null}
      />

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        itemId={deleteTarget?.id || null}
      />

      <CreateItemDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        parentId={selectedFolderId}
        itemType={createType}
      />
    </div>
  );
}
