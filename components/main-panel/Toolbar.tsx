"use client";

import * as React from "react";
import {
  FolderPlus,
  FilePlus,
  Edit2,
  Trash2,
  MoreHorizontal,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUiStore } from "@/store/useUiStore";
import { useItem, useChildren } from "@/store/useFileSystemStore";
import { CreateItemDialog } from "@/components/dialogs/CreateItemDialog";
import { RenameDialog } from "@/components/dialogs/RenameDialog";
import { DeleteDialog } from "@/components/dialogs/DeleteDialog";
import { ROOT_FOLDER_ID } from "@/lib/seedData";
import { ItemType } from "@/lib/types";

export function Toolbar() {
  const selectedFolderId = useUiStore((state) => state.selectedFolderId);
  const setSearchOpen = useUiStore((state) => state.setSearchOpen);
  const currentFolder = useItem(selectedFolderId);
  const children = useChildren(selectedFolderId);

  // Dialog triggers
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [createType, setCreateType] = React.useState<ItemType>("file");
  const [renameOpen, setRenameOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const isRoot = !selectedFolderId || selectedFolderId === ROOT_FOLDER_ID;
  const canModifySelected = !isRoot && currentFolder !== null;

  const folderCount = children.filter((c) => c.type === "folder").length;
  const fileCount = children.filter((c) => c.type === "file").length;

  const handleOpenCreate = (type: ItemType) => {
    setCreateType(type);
    setCreateDialogOpen(true);
  };

  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-border/60 bg-card/40 shrink-0 text-xs gap-2">
      {/* Primary Actions (Desktop) */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleOpenCreate("file")}
          className="h-8 text-xs font-medium gap-1.5 border-border/80 hover:bg-accent/60"
        >
          <FilePlus className="h-3.5 w-3.5 text-muted-foreground" />
          <span>New File</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleOpenCreate("folder")}
          className="h-8 text-xs font-medium gap-1.5 border-border/80 hover:bg-accent/60"
        >
          <FolderPlus className="h-3.5 w-3.5 text-primary" />
          <span>New Folder</span>
        </Button>

        {/* Desktop Rename & Delete current folder */}
        <div className="hidden sm:flex items-center gap-1.5 pl-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRenameOpen(true)}
            disabled={!canModifySelected}
            className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5"
            title={isRoot ? "Root workspace cannot be renamed" : "Rename this folder"}
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>Rename Folder</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            disabled={!canModifySelected}
            className="h-8 text-xs text-muted-foreground hover:text-destructive gap-1.5"
            title={isRoot ? "Root workspace cannot be deleted" : "Delete this folder"}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete Folder</span>
          </Button>
        </div>

        {/* Mobile Overflow Menu */}
        <div className="sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-8 w-8 text-muted-foreground"
                  aria-label="More folder actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="start" className="text-xs">
              <DropdownMenuItem
                disabled={!canModifySelected}
                onClick={() => setRenameOpen(true)}
                className="cursor-pointer"
              >
                <Edit2 className="h-3.5 w-3.5 mr-2" />
                Rename Current Folder
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={!canModifySelected}
                onClick={() => setDeleteOpen(true)}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Delete Current Folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Right side: Search shortcut trigger & item counter */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 h-7 px-2.5 rounded-md border border-input/60 bg-muted/30 hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors text-[11px] font-sans"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Quick Search...</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 rounded bg-background px-1.5 py-0.2 border text-[10px] font-mono">
            ⌘K
          </kbd>
        </button>

        <span className="text-[11px] text-muted-foreground/80 font-mono hidden lg:inline">
          {folderCount} {folderCount === 1 ? "folder" : "folders"},{" "}
          {fileCount} {fileCount === 1 ? "file" : "files"}
        </span>
      </div>

      {/* Dialogs */}
      <CreateItemDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        parentId={selectedFolderId}
        itemType={createType}
      />

      <RenameDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        itemId={canModifySelected ? currentFolder?.id || null : null}
      />

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        itemId={canModifySelected ? currentFolder?.id || null : null}
      />
    </div>
  );
}

