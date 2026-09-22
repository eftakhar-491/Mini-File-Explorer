"use client";

import * as React from "react";
import {
  Save,
  X,
  FileText,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useItem, useFileSystemStore } from "@/store/useFileSystemStore";
import { useUiStore } from "@/store/useUiStore";
import { UnsavedChangesDialog } from "@/components/dialogs/UnsavedChangesDialog";
import { formatDate, formatSize } from "@/lib/fileSystemUtils";
import { TextFile } from "@/lib/types";

interface FileEditorContentProps {
  file: TextFile;
}

function FileEditorContent({ file }: FileEditorContentProps) {
  const closeFile = useUiStore((state) => state.closeFile);
  const setSelectedFolderId = useUiStore((state) => state.setSelectedFolderId);
  const pendingAction = useUiStore((state) => state.pendingAction);
  const setIsEditorDirty = useUiStore((state) => state.setIsEditorDirty);
  const confirmDiscardNavigation = useUiStore((state) => state.confirmDiscardNavigation);
  const cancelPendingNavigation = useUiStore((state) => state.cancelPendingNavigation);

  const updateFileContent = useFileSystemStore((state) => state.updateFileContent);

  // Local component draft state (initialized directly from file.content)
  const [draftContent, setDraftContent] = React.useState<string>(file.content);
  const [isSaving, setIsSaving] = React.useState(false);
  const [guardDialogOpen, setGuardDialogOpen] = React.useState(false);

  const isDirty = draftContent !== file.content;

  // Sync dirty flag with UI store so outside navigators can query it
  React.useEffect(() => {
    setIsEditorDirty(isDirty);
    return () => {
      setIsEditorDirty(false);
    };
  }, [isDirty, setIsEditorDirty]);

  // If outside navigation was requested while dirty, show the guard dialog
  React.useEffect(() => {
    if (pendingAction) {
      setGuardDialogOpen(true);
    }
  }, [pendingAction]);

  // Save handler wrapped in useCallback for stable reference
  const handleSave = React.useCallback(() => {
    if (!isDirty || isSaving) return;
    setIsSaving(true);
    try {
      updateFileContent(file.id, draftContent);
    } finally {
      setIsSaving(false);
    }
  }, [file.id, isDirty, isSaving, draftContent, updateFileContent]);

  // Keyboard shortcut listener: Cmd+S / Ctrl+S
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  // Window beforeunload listener to warn against tab close/refresh if dirty
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Attempt to close editor from the back button
  const handleAttemptClose = () => {
    if (isDirty) {
      setGuardDialogOpen(true);
    } else {
      closeFile();
      if (file.parentId) {
        setSelectedFolderId(file.parentId);
      }
    }
  };

  const handleConfirmDiscard = () => {
    setGuardDialogOpen(false);
    if (pendingAction) {
      confirmDiscardNavigation();
    } else {
      closeFile();
      if (file.parentId) {
        setSelectedFolderId(file.parentId);
      }
    }
  };

  const handleSaveAndClose = () => {
    handleSave();
    setGuardDialogOpen(false);
    if (pendingAction) {
      confirmDiscardNavigation();
    } else {
      closeFile();
      if (file.parentId) {
        setSelectedFolderId(file.parentId);
      }
    }
  };

  // Calculate lines and character metrics
  const lines = draftContent.split("\n").length;
  const chars = draftContent.length;

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/70 bg-card/60 shrink-0 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleAttemptClose}
            className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
            title="Back to folder view"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="p-1 rounded bg-muted text-muted-foreground shrink-0">
            <FileText className="h-3.5 w-3.5" />
          </div>

          <div className="flex items-center gap-2 truncate">
            <span className="font-mono text-sm font-semibold text-foreground truncate">
              {file.name}
            </span>

            {/* Status Badge */}
            {isDirty ? (
              <Badge
                variant="outline"
                className="text-[11px] font-sans border-amber-500/40 text-amber-500 bg-amber-500/10 py-0 px-2 gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Unsaved changes
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-[11px] font-sans border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 py-0 px-2 gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Saved
              </Badge>
            )}
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="h-7 px-3 text-xs gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaving ? "Saving..." : "Save"}</span>
            <kbd className="hidden sm:inline-block ml-1 opacity-70 text-[10px] font-mono">
              ⌘S
            </kbd>
          </Button>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleAttemptClose}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            aria-label="Close file editor"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 relative flex overflow-hidden">
        <textarea
          value={draftContent}
          onChange={(e) => setDraftContent(e.target.value)}
          placeholder="Start typing your text here..."
          spellCheck={false}
          className="flex-1 w-full p-4 font-mono text-xs md:text-sm leading-relaxed bg-transparent resize-none border-none outline-none focus:ring-0 focus-visible:ring-0 text-foreground placeholder:text-muted-foreground/50 overflow-y-auto"
        />
      </div>

      {/* Editor Status Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-muted/40 border-t border-border/50 text-[11px] font-mono text-muted-foreground shrink-0 select-none">
        <div className="flex items-center gap-3">
          <span>{lines} {lines === 1 ? "line" : "lines"}</span>
          <span>{chars} chars</span>
          <span>{formatSize(chars)}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          <span>Last modified: {formatDate(file.updatedAt)}</span>
        </div>
      </div>

      {/* Navigation Discard Warning Dialog */}
      <UnsavedChangesDialog
        open={guardDialogOpen}
        onOpenChange={(open) => {
          setGuardDialogOpen(open);
          if (!open) {
            cancelPendingNavigation();
          }
        }}
        onDiscard={handleConfirmDiscard}
        onSave={handleSaveAndClose}
      />
    </div>
  );
}

export function FileEditor() {
  const openFileId = useUiStore((state) => state.openFileId);
  const fileItem = useItem(openFileId);
  const file = fileItem && fileItem.type === "file" ? fileItem : null;

  if (!file) {
    return null;
  }

  // Keying by file.id automatically resets draft state when switching files
  return <FileEditorContent key={file.id} file={file} />;
}
