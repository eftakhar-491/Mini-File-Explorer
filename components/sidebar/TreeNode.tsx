"use client";

import * as React from "react";
import {
  ChevronRight,
  Folder,
  FolderOpen,
  FileText,
} from "lucide-react";
import { useChildren, useItem } from "@/store/useFileSystemStore";
import { useUiStore } from "@/store/useUiStore";

interface TreeNodeProps {
  itemId: string;
  depth?: number;
}

export const TreeNode = React.memo(function TreeNode({
  itemId,
  depth = 0,
}: TreeNodeProps) {
  const item = useItem(itemId);
  const children = useChildren(itemId);

  const selectedFolderId = useUiStore((state) => state.selectedFolderId);
  const openFileId = useUiStore((state) => state.openFileId);
  const expandedFolderIds = useUiStore((state) => state.expandedFolderIds);
  const toggleFolder = useUiStore((state) => state.toggleFolder);
  const setSelectedFolderId = useUiStore((state) => state.setSelectedFolderId);
  const setOpenFileId = useUiStore((state) => state.setOpenFileId);
  const requestNavigation = useUiStore((state) => state.requestNavigation);

  if (!item) return null;

  const isFolder = item.type === "folder";
  const isExpanded = expandedFolderIds.includes(itemId);
  const isSelected = isFolder
    ? selectedFolderId === itemId && openFileId === null
    : openFileId === itemId;

  const childFolders = children.filter((c) => c.type === "folder");
  const childFiles = children.filter((c) => c.type === "file");

  const handleRowClick = () => {
    requestNavigation(() => {
      if (isFolder) {
        setSelectedFolderId(itemId);
        // If collapsed, expand when selecting
        if (!isExpanded) {
          toggleFolder(itemId);
        }
      } else {
        setOpenFileId(itemId);
        if (item.parentId) {
          setSelectedFolderId(item.parentId);
        }
      }
    });
  };

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFolder(itemId);
  };

  return (
    <div className="flex flex-col select-none">
      {/* Node Row */}
      <div
        onClick={handleRowClick}
        style={{ paddingLeft: `${depth * 12 + 6}px` }}
        className={`group relative flex items-center h-[30px] pr-2 py-0.5 rounded-sm cursor-pointer text-xs transition-colors duration-150 ${
          isSelected
            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium border-l-[2.5px] border-primary"
            : "text-sidebar-foreground/85 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground border-l-[2.5px] border-transparent"
        }`}
      >
        {/* Chevron Toggle */}
        <div className="w-4 h-4 flex items-center justify-center shrink-0 mr-1">
          {isFolder && children.length > 0 ? (
            <button
              type="button"
              onClick={handleChevronClick}
              aria-label={isExpanded ? "Collapse folder" : "Expand folder"}
              className="p-0.5 rounded hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-transform duration-200"
            >
              <ChevronRight
                className={`h-3 w-3 transition-transform duration-200 ${
                  isExpanded ? "rotate-90 text-foreground" : "rotate-0"
                }`}
              />
            </button>
          ) : (
            <span className="w-3" />
          )}
        </div>

        {/* Icon */}
        <span className="shrink-0 mr-1.5 text-muted-foreground group-hover:text-foreground transition-colors">
          {isFolder ? (
            isExpanded ? (
              <FolderOpen className="h-3.5 w-3.5 text-primary" />
            ) : (
              <Folder className="h-3.5 w-3.5 text-primary/80" />
            )
          ) : (
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </span>

        {/* Name with Monospace typography */}
        <span
          className="font-mono text-[12.5px] truncate flex-1 tracking-tight"
          title={item.name}
        >
          {item.name}
        </span>
      </div>

      {/* Children with smooth transition */}
      {isFolder && (
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-200 ease-in-out ${
            isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
          }`}
        >
          <div className="overflow-hidden">
            {childFolders.map((child) => (
              <TreeNode
                key={child.id}
                itemId={child.id}
                depth={depth + 1}
              />
            ))}
            {childFiles.map((child) => (
              <TreeNode
                key={child.id}
                itemId={child.id}
                depth={depth + 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
