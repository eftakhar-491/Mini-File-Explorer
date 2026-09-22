"use client";

import * as React from "react";
import {
  Folder,
  FileText,
  Search,
  CornerDownLeft,
} from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { useFileSystemStore } from "@/store/useFileSystemStore";
import { useUiStore } from "@/store/useUiStore";
import { searchItems, getAncestorIds, SearchResult } from "@/lib/fileSystemUtils";

export function SearchCommand() {
  const [query, setQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");

  const searchOpen = useUiStore((state) => state.searchOpen);
  const setSearchOpen = useUiStore((state) => state.setSearchOpen);
  const navigateToFolder = useUiStore((state) => state.navigateToFolder);
  const navigateToFile = useUiStore((state) => state.navigateToFile);

  const items = useFileSystemStore((state) => state.items);

  // Global Cmd+K / Ctrl+K listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen, setSearchOpen]);

  // Debounce query by 200ms
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Search results
  const results: SearchResult[] = React.useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    return searchItems(items, debouncedQuery);
  }, [items, debouncedQuery]);

  const requestNavigation = useUiStore((state) => state.requestNavigation);

  const handleSelect = (result: SearchResult) => {
    const { item } = result;
    const ancestors = getAncestorIds(items, item.id);

    setSearchOpen(false);
    setQuery("");

    requestNavigation(() => {
      if (item.type === "folder") {
        navigateToFolder(item.id, ancestors);
      } else {
        navigateToFile(item.id, item.parentId, ancestors);
      }
    });
  };

  return (
    <CommandDialog
      open={searchOpen}
      onOpenChange={(open) => {
        setSearchOpen(open);
        if (!open) setQuery("");
      }}
      title="Search Workspace"
      description="Quick search files and folders"
    >
      <CommandInput
        placeholder="Type to search files, folders, or contents..."
        value={query}
        onValueChange={setQuery}
      />

      <CommandList className="max-h-[380px] p-1.5">
        {debouncedQuery.trim() && results.length === 0 && (
          <CommandEmpty className="py-8 text-center">
            <div className="flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
              <Search className="h-6 w-6 stroke-1 text-muted-foreground/60" />
              <p className="text-sm font-medium">No matches found</p>
              <p className="text-xs text-muted-foreground/80">
                No files or folders matched &ldquo;{debouncedQuery}&rdquo;
              </p>
            </div>
          </CommandEmpty>
        )}

        {!debouncedQuery.trim() && (
          <div className="py-8 px-4 text-center text-xs text-muted-foreground space-y-2">
            <p className="font-medium text-foreground/80">Quick Navigation</p>
            <p>Type a folder name, file name, or text snippet to jump directly anywhere in the workspace.</p>
            <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground/70 pt-1">
              <span>Press</span>
              <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono border">Esc</kbd>
              <span>to close</span>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <CommandGroup heading={`Matches (${results.length})`}>
            {results.map((result) => {
              const isFolder = result.item.type === "folder";
              return (
                <CommandItem
                  key={result.item.id}
                  value={`${result.item.name} ${result.path} ${result.item.id}`}
                  onSelect={() => handleSelect(result)}
                  className="flex items-center justify-between py-2 px-2.5 rounded-md cursor-pointer hover:bg-accent/60 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                      className={`p-1.5 rounded shrink-0 ${
                        isFolder
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isFolder ? (
                        <Folder className="h-3.5 w-3.5" />
                      ) : (
                        <FileText className="h-3.5 w-3.5" />
                      )}
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[13px] font-medium text-foreground truncate">
                          {result.item.name}
                        </span>
                        {result.matchType === "content" && (
                          <Badge variant="outline" className="text-[10px] py-0 px-1 font-sans">
                            content
                          </Badge>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground font-mono truncate">
                        {result.path}
                      </span>
                      {result.snippet && (
                        <span className="text-[11px] text-muted-foreground/80 italic truncate mt-0.5">
                          &ldquo;{result.snippet}&rdquo;
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-muted-foreground/50 shrink-0 pl-2">
                    <CornerDownLeft className="h-3 w-3" />
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}

