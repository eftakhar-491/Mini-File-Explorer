"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface UnsavedChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDiscard: () => void;
  onSave?: () => void;
}

export function UnsavedChangesDialog({
  open,
  onOpenChange,
  onDiscard,
  onSave,
}: UnsavedChangesDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[420px] bg-card border-border shadow-xl">
        <AlertDialogHeader className="gap-2">
          <div className="flex items-center gap-2 text-amber-500">
            <div className="p-2 rounded bg-amber-500/10">
              <AlertCircle className="h-5 w-5" />
            </div>
            <AlertDialogTitle className="text-base font-semibold">
              Unsaved Changes
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            You have unsaved changes in the current file. If you navigate away without
            saving, your modifications will be discarded.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2 pt-2">
          <AlertDialogCancel className="h-8 text-xs">Stay & Keep Editing</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDiscard}
            className="h-8 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Discard Changes
          </AlertDialogAction>
          {onSave && (
            <Button
              type="button"
              size="sm"
              onClick={onSave}
              className="h-8 text-xs"
            >
              Save & Proceed
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

