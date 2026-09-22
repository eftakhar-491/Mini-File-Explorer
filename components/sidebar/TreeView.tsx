"use client";

import * as React from "react";
import {
  FolderPlus,
  FilePlus,
  ChevronsUpDown,
  RotateCcw,
  Plus,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TreeNode } from "./TreeNode";
import { useFileSystemStore, useChildren, useItem } from "@/store/useFileSystemStore";
import { useUiStore } from "@/store/useUiStore";
import { CreateItemDialog } from "@/components/dialogs/CreateItemDialog";
import { ROOT_FOLDER_ID } from "@/lib/seedData";
import { ItemType } from "@/lib/types";

export function TreeView() {
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [createType, setCreateType] = React.useState<ItemType>("folder");
  const [targetParentId, setTargetParentId] = React.useState<string | null>(null);

  const rootItems = useChildren(null);
  const resetToDefault = useFileSystemStore((state) => state.resetToDefault);
  const selectedFolderId = useUiStore((state) => state.selectedFolderId);
  const setSelectedFolderId = useUiStore((state) => state.setSelectedFolderId);
  const requestNavigation = useUiStore((state) => state.requestNavigation);
  const expandFolders = useUiStore((state) => state.expandFolders);
  const collapseFolder = useUiStore((state) => state.collapseFolder);
  const expandedFolderIds = useUiStore((state) => state.expandedFolderIds);

  const selectedFolder = useItem(selectedFolderId);

  const handleQuickCreate = (parentId: string | null, type: ItemType = "folder") => {
    setTargetParentId(parentId);
    setCreateType(type);
    setCreateDialogOpen(true);
  };

  const handleNavigateRoot = () => {
    requestNavigation(() => {
      setSelectedFolderId(null);
    });
  };

  const handleExpandAll = () => {
    const allFolderIds = Object.values(useFileSystemStore.getState().items)
      .filter((i) => i.type === "folder")
      .map((i) => i.id);
    expandFolders(allFolderIds);
  };

  const handleCollapseAll = () => {
    // Keep root folder expanded
    expandedFolderIds.forEach((id) => {
      if (id !== ROOT_FOLDER_ID) {
        collapseFolder(id);
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border text-sidebar-foreground">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-3 h-10 border-b border-sidebar-border/60 shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleNavigateRoot}
            className={`text-[11px] uppercase tracking-wider font-semibold transition-colors cursor-pointer hover:text-foreground ${
              selectedFolderId === null
                ? "text-foreground font-bold underline underline-offset-4"
                : "text-muted-foreground"
            }`}
            title="Navigate to Explorer Root"
          >
            Explorer
          </button>
        </div>

        <div className="flex items-center gap-0.5">
          {/* Collapse/Expand Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="text-muted-foreground hover:text-foreground h-6 w-6"
                  aria-label="Tree view options"
                >
                  <ChevronsUpDown className="h-3.5 w-3.5" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="text-xs">
              <DropdownMenuItem onClick={handleExpandAll} className="cursor-pointer">
                Expand All Folders
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCollapseAll} className="cursor-pointer">
                Collapse All Folders
              </DropdownMenuItem>
              <DropdownMenuItem onClick={resetToDefault} className="text-muted-foreground cursor-pointer">
                <RotateCcw className="h-3 w-3 mr-1.5" />
                Reset Default Files
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* New Item Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="text-muted-foreground hover:text-foreground h-6 w-6"
                  aria-label="New item"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="text-xs">
              <DropdownMenuItem
                onClick={() => handleQuickCreate(null, "folder")}
                className="cursor-pointer"
              >
                <FolderPlus className="h-3.5 w-3.5 mr-1.5 text-primary" />
                New Folder in Explorer (Root)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleQuickCreate(null, "file")}
                className="cursor-pointer"
              >
                <FilePlus className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                New File in Explorer (Root)
              </DropdownMenuItem>
              {selectedFolderId && selectedFolder && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleQuickCreate(selectedFolderId, "folder")}
                    className="cursor-pointer"
                  >
                    <FolderPlus className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                    New Folder in {selectedFolder.name}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleQuickCreate(selectedFolderId, "file")}
                    className="cursor-pointer"
                  >
                    <FilePlus className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                    New File in {selectedFolder.name}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tree Content Area */}
      <ScrollArea
        className="flex-1 px-1 py-1.5 cursor-default"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleNavigateRoot();
          }
        }}
      >
        {rootItems.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground space-y-3">
            <p>No workspace items found.</p>
            <Button
              variant="outline"
              size="xs"
              onClick={resetToDefault}
              className="text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset Workspace
            </Button>
          </div>
        ) : (
          <div className="space-y-0.5">
            {rootItems.map((item) => (
              <TreeNode
                key={item.id}
                itemId={item.id}
                depth={0}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Creation Modal */}
      <CreateItemDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        parentId={targetParentId}
        itemType={createType}
      />
    </div>
  );
}
