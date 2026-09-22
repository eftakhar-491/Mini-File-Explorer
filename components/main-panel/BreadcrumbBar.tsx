"use client";

import * as React from "react";
import { Folder } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePath } from "@/store/useFileSystemStore";
import { useUiStore } from "@/store/useUiStore";

export function BreadcrumbBar() {
  const selectedFolderId = useUiStore((state) => state.selectedFolderId);
  const setSelectedFolderId = useUiStore((state) => state.setSelectedFolderId);
  const requestNavigation = useUiStore((state) => state.requestNavigation);

  const path = usePath(selectedFolderId);

  const handleNavigate = (folderId: string) => {
    requestNavigation(() => {
      setSelectedFolderId(folderId);
    });
  };

  if (!path || path.length === 0) {
    return (
      <div className="flex items-center text-xs text-muted-foreground font-mono">
        / Workspace
      </div>
    );
  }

  // If path is deeply nested (e.g. > 4 levels), collapse middle items into an ellipsis dropdown
  const shouldCollapse = path.length > 4;
  const firstItem = path[0];
  const lastItem = path[path.length - 1];
  const middleItems = shouldCollapse ? path.slice(1, path.length - 2) : [];
  const tailItems = shouldCollapse ? path.slice(path.length - 2) : path.slice(1);

  return (
    <Breadcrumb className="text-xs font-mono">
      <BreadcrumbList className="flex-nowrap overflow-hidden">
        {/* First segment (Root) */}
        <BreadcrumbItem className="shrink-0">
          {path.length === 1 ? (
            <BreadcrumbPage className="flex items-center gap-1.5 font-medium text-foreground">
              <Folder className="h-3.5 w-3.5 text-primary" />
              <span>{firstItem.name}</span>
            </BreadcrumbPage>
          ) : (
            <button
              type="button"
              onClick={() => handleNavigate(firstItem.id)}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <Folder className="h-3.5 w-3.5 text-primary/80" />
              <span>{firstItem.name}</span>
            </button>
          )}
        </BreadcrumbItem>

        {/* Collapsed middle dropdown if deep path */}
        {shouldCollapse && (
          <>
            <BreadcrumbSeparator className="shrink-0" />
            <BreadcrumbItem className="shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label="Show collapsed path items"
                >
                  <BreadcrumbEllipsis className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="font-mono text-xs">
                  {middleItems.map((item) => (
                    <DropdownMenuItem
                      key={item.id}
                      onClick={() => handleNavigate(item.id)}
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <Folder className="h-3.5 w-3.5 text-primary/80" />
                      <span>{item.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
          </>
        )}

        {/* Remaining items */}
        {tailItems.map((item) => {
          const isLast = item.id === lastItem.id;
          return (
            <React.Fragment key={item.id}>
              <BreadcrumbSeparator className="shrink-0" />
              <BreadcrumbItem className="truncate">
                {isLast ? (
                  <BreadcrumbPage className="font-semibold text-foreground truncate max-w-[180px] sm:max-w-[280px]">
                    {item.name}
                  </BreadcrumbPage>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleNavigate(item.id)}
                    className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer truncate max-w-[120px]"
                  >
                    {item.name}
                  </button>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
