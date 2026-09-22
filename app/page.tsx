"use client";

import * as React from "react";
import {
  Menu,
  HardDrive,
  Command as CommandIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { TreeView } from "@/components/sidebar/TreeView";
import { BreadcrumbBar } from "@/components/main-panel/BreadcrumbBar";
import { Toolbar } from "@/components/main-panel/Toolbar";
import { ItemList } from "@/components/main-panel/ItemList";
import { FileEditor } from "@/components/editor/FileEditor";
import { SearchCommand } from "@/components/search/SearchCommand";
import { ThemeToggle } from "@/components/theme-toggle";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { useFileSystemStore, useFsHydrated } from "@/store/useFileSystemStore";
import { useUiStore } from "@/store/useUiStore";

export default function WorkspacePage() {
  const hasHydrated = useFsHydrated();

  const openFileId = useUiStore((state) => state.openFileId);
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);
  const setSearchOpen = useUiStore((state) => state.setSearchOpen);

  // SSR hydration safety: rehydrate Zustand store after client mount
  React.useEffect(() => {
    useFileSystemStore.persist.rehydrate();
  }, []);

  // Show Skeleton until Zustand store has finished rehydrating from localStorage
  if (!hasHydrated) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-background overflow-hidden select-none">
      {/* Top Application Header */}
      <header className="h-11 border-b border-border/70 flex items-center justify-between px-3 bg-card/60 shrink-0 z-10">
        {/* Left: Mobile menu toggle & brand */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setSidebarOpen(true)}
            className="md:hidden h-7 w-7 text-muted-foreground hover:text-foreground"
            aria-label="Open sidebar"
          >
            <Menu className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-primary text-primary-foreground shadow-xs">
              <HardDrive className="h-3.5 w-3.5" />
            </div>
            <span className="font-semibold text-xs tracking-tight text-foreground hidden sm:inline">
              Workspace Explorer
            </span>
          </div>
        </div>

        {/* Center: Global search bar trigger */}
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="flex items-center justify-between gap-3 h-7 w-52 sm:w-72 md:w-80 px-2.5 rounded-md border border-border/60 bg-muted/30 hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors text-xs font-sans"
        >
          <span className="truncate text-left text-[11px]">
            Search files, folders, content...
          </span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded bg-background px-1.5 py-px border text-[10px] font-mono text-muted-foreground/80">
            <CommandIcon className="h-2.5 w-2.5" /> K
          </kbd>
        </button>

        {/* Right: Shortcuts helper & Theme Toggle */}
        <div className="flex items-center gap-1">
          {/* <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  aria-label="Keyboard shortcuts"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                </Button>
              }
            />
            <TooltipContent side="bottom" align="end" className="text-xs space-y-1 p-2.5 font-sans">
              <p className="font-semibold text-[11px] pb-1 border-b border-border/40">Shortcuts</p>
              <div className="flex items-center justify-between gap-4 text-[11px]">
                <span className="text-muted-foreground">Search</span>
                <kbd className="font-mono bg-muted px-1 rounded text-[10px]">⌘K / Ctrl+K</kbd>
              </div>
              <div className="flex items-center justify-between gap-4 text-[11px]">
                <span className="text-muted-foreground">Save File</span>
                <kbd className="font-mono bg-muted px-1 rounded text-[10px]">⌘S / Ctrl+S</kbd>
              </div>
              <div className="flex items-center justify-between gap-4 text-[11px]">
                <span className="text-muted-foreground">Open Item</span>
                <span className="font-mono text-[10px]">Double click</span>
              </div>
            </TooltipContent>
          </Tooltip> */}

          <ThemeToggle />
        </div>
      </header>

      {/* Main Workspace Split Layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="w-60 lg:w-64 shrink-0 hidden md:flex flex-col h-full">
          <TreeView />
        </aside>

        {/* Mobile Sidebar Sheet */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-72 sm:w-80">
            <SheetHeader className="sr-only">
              <SheetTitle>Workspace Explorer Navigation</SheetTitle>
              <SheetDescription>Browse nested folders and files in workspace</SheetDescription>
            </SheetHeader>
            <TreeView />
          </SheetContent>
        </Sheet>

        {/* Center / Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
          {openFileId ? (
            /* File Editor View */
            <FileEditor />
          ) : (
            /* Folder Explorer View */
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Breadcrumb Navigation Bar */}
              <div className="px-4 py-2 border-b border-border/50 bg-card/20 shrink-0">
                <BreadcrumbBar />
              </div>

              {/* Action Toolbar */}
              <Toolbar />

              {/* Folder Item List */}
              <ItemList />
            </div>
          )}
        </main>
      </div>

      {/* Global Cmd+K Search Modal */}
      <SearchCommand />
    </div>
  );
}
