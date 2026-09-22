"use client";

import * as React from "react";
import { Folder, HardDrive } from "lucide-react";
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

  const handleNavigate = (folderId: string | null) => {
    requestNavigation(() => {
      setSelectedFolderId(folderId);
    });
  };

  const isAtRoot = !selectedFolderId;

  // Deep nesting logic (> 3 folders deep)
  const shouldCollapse = path.length > 3;
  const middleItems = shouldCollapse ? path.slice(0, path.length - 2) : [];
  const tailItems = shouldCollapse ? path.slice(path.length - 2) : path;

  return (
    <Breadcrumb className="text-xs font-mono">
      <BreadcrumbList className="flex-nowrap overflow-hidden">
        {/* Root Explorer segment */}
        <BreadcrumbItem className="shrink-0">
          {isAtRoot ? (
            <BreadcrumbPage className="flex items-center gap-1.5 font-medium text-foreground">
              <HardDrive className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Explorer</span>
            </BreadcrumbPage>
          ) : (
            <button
              type="button"
              onClick={() => handleNavigate(null)}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Navigate to Explorer Root"
            >
              <HardDrive className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Explorer</span>
            </button>
          )}
        </BreadcrumbItem>

        {/* Path segments */}
        {!isAtRoot && (
          <>
            <BreadcrumbSeparator className="shrink-0" />

            {/* Collapsed middle dropdown if deep path */}
            {shouldCollapse && (
              <>
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
                <BreadcrumbSeparator className="shrink-0" />
              </>
            )}

            {/* Remaining items */}
            {tailItems.map((item, index) => {
              const isLast = index === tailItems.length - 1;
              return (
                <React.Fragment key={item.id}>
                  {index > 0 && <BreadcrumbSeparator className="shrink-0" />}
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
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
