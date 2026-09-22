"use client";

import * as React from "react";
import {
  Folder,
  FileText,
  MoreVertical,
  Edit2,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { FileSystemItem } from "@/lib/types";
import { useFileSystemStore } from "@/store/useFileSystemStore";
import { useUiStore } from "@/store/useUiStore";
import { formatDate, formatSize, validateName } from "@/lib/fileSystemUtils";

interface ItemRowProps {
  item: FileSystemItem;
  onRenameRequest?: (item: FileSystemItem) => void;
  onDeleteRequest?: (item: FileSystemItem) => void;
}

export function ItemRow({
  item,
  onRenameRequest,
  onDeleteRequest,
}: ItemRowProps) {
  const [isInlineEditing, setIsInlineEditing] = React.useState(false);
  const [inlineName, setInlineName] = React.useState(item.name);
  const [inlineError, setInlineError] = React.useState<string | null>(null);

  const items = useFileSystemStore((state) => state.items);
  const renameItem = useFileSystemStore((state) => state.renameItem);

  const setSelectedFolderId = useUiStore((state) => state.setSelectedFolderId);
  const setOpenFileId = useUiStore((state) => state.setOpenFileId);
  const expandFolder = useUiStore((state) => state.expandFolder);
  const requestNavigation = useUiStore((state) => state.requestNavigation);

  const isFolder = item.type === "folder";

  const handleOpen = () => {
    requestNavigation(() => {
      if (isFolder) {
        expandFolder(item.id);
        setSelectedFolderId(item.id);
      } else {
        setOpenFileId(item.id);
      }
    });
  };

  const handleStartRename = () => {
    if (onRenameRequest) {
      onRenameRequest(item);
    } else {
      setInlineName(item.name);
      setIsInlineEditing(true);
      setInlineError(null);
    }
  };

  const handleInlineSave = () => {
    const trimmed = inlineName.trim();
    if (!trimmed || trimmed === item.name) {
      setIsInlineEditing(false);
      setInlineError(null);
      return;
    }

    const validation = validateName(trimmed, item.parentId, items, item.id);
    if (!validation.valid) {
      setInlineError(validation.error || "Invalid name");
      return;
    }

    renameItem(item.id, trimmed);
    setIsInlineEditing(false);
    setInlineError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleInlineSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsInlineEditing(false);
      setInlineName(item.name);
      setInlineError(null);
    }
  };

  return (
    <div
      onClick={handleOpen}
      className="group flex items-center justify-between h-[38px] px-3 rounded-md hover:bg-muted/60 transition-colors border border-transparent hover:border-border/40 select-none cursor-pointer text-xs"
    >
      {/* Left: Icon & Name */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-3">
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleOpen();
          }}
          className={`p-1.5 rounded shrink-0 transition-colors ${
            isFolder
              ? "bg-primary/10 text-primary group-hover:bg-primary/15"
              : "bg-muted/80 text-muted-foreground group-hover:text-foreground"
          }`}
        >
          {isFolder ? (
            <Folder className="h-4 w-4" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
        </div>

        {isInlineEditing ? (
          <div
            className="flex-1 min-w-0 relative"
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
          >
            <Input
              value={inlineName}
              onChange={(e) => {
                setInlineName(e.target.value);
                if (inlineError) setInlineError(null);
              }}
              onBlur={handleInlineSave}
              onKeyDown={handleKeyDown}
              autoFocus
              className="h-7 text-xs font-mono py-0 px-2 w-full max-w-[280px]"
            />
            {inlineError && (
              <span className="absolute left-0 top-8 z-20 text-[10px] text-destructive bg-popover px-2 py-0.5 rounded shadow border border-destructive/20 font-sans">
                {inlineError}
              </span>
            )}
          </div>
        ) : (
          <span
            onClick={(e) => {
              e.stopPropagation();
              handleOpen();
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              handleStartRename();
            }}
            className="font-mono text-[13px] text-foreground font-medium truncate tracking-tight hover:underline underline-offset-2"
            title={`${item.name} (Double-click to rename)`}
          >
            {item.name}
          </span>
        )}
      </div>

      {/* Right: Meta info and Action Menu */}
      <div className="flex items-center gap-4 shrink-0 text-muted-foreground text-[11px]">
        {/* Size (for files) */}
        {!isFolder && (
          <span className="w-16 text-right font-mono hidden sm:inline-block">
            {formatSize(item.content.length)}
          </span>
        )}

        {/* Last Modified */}
        <span className="w-28 text-right hidden md:inline-block">
          {formatDate(item.updatedAt)}
        </span>

        {/* Actions Dropdown */}
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground opacity-70 group-hover:opacity-100"
                  aria-label={`Actions for ${item.name}`}
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="text-xs">
              <DropdownMenuItem onClick={handleOpen} className="cursor-pointer">
                <ExternalLink className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                {isFolder ? "Open Folder" : "Open in Editor"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleStartRename}
                className="cursor-pointer"
              >
                <Edit2 className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDeleteRequest?.(item)}
                className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
