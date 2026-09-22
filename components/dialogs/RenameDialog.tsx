"use client";

import * as React from "react";
import { Edit3 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFileSystemStore } from "@/store/useFileSystemStore";
import { validateName } from "@/lib/fileSystemUtils";
import { FileSystemItem } from "@/lib/types";

interface RenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string | null;
  onRenamed?: (id: string, newName: string) => void;
}

interface RenameFormProps {
  item: FileSystemItem;
  onClose: () => void;
  onRenamed?: (id: string, newName: string) => void;
}

function RenameForm({ item, onClose, onRenamed }: RenameFormProps) {
  const [name, setName] = React.useState(item.name);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const items = useFileSystemStore((state) => state.items);
  const renameItem = useFileSystemStore((state) => state.renameItem);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (error) {
      const validation = validateName(val, item.parentId, items, item.id);
      if (validation.valid) {
        setError(null);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmed = name.trim();
    if (trimmed === item.name) {
      onClose();
      return;
    }

    const validation = validateName(trimmed, item.parentId, items, item.id);
    if (!validation.valid) {
      setError(validation.error || "Invalid name");
      return;
    }

    setIsSubmitting(true);
    try {
      renameItem(item.id, trimmed);
      onClose();
      onRenamed?.(item.id, trimmed);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFolder = item.type === "folder";

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader className="gap-1.5 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded bg-primary/10 text-primary">
            <Edit3 className="h-4 w-4" />
          </div>
          <DialogTitle className="text-base font-semibold">
            Rename {isFolder ? "Folder" : "File"}
          </DialogTitle>
        </div>
        <DialogDescription className="text-xs text-muted-foreground">
          Provide a new name for{" "}
          <span className="font-mono text-foreground font-medium">{item.name}</span>
        </DialogDescription>
      </DialogHeader>

      <div className="py-3 space-y-2">
        <Input
          id="rename-item-name"
          value={name}
          onChange={handleChange}
          autoFocus
          className="h-9 font-mono text-sm"
          aria-invalid={!!error}
        />

        {error && (
          <p className="text-xs font-medium text-destructive transition-all animate-in fade-in-50">
            {error}
          </p>
        )}
      </div>

      <DialogFooter className="gap-2 pt-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting || !name.trim()}
          className="px-4"
        >
          {isSubmitting ? "Saving..." : "Save changes"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function RenameDialog({
  open,
  onOpenChange,
  itemId,
  onRenamed,
}: RenameDialogProps) {
  const items = useFileSystemStore((state) => state.items);
  const item = itemId ? items[itemId] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] bg-card border-border shadow-xl">
        {open && item && (
          <RenameForm
            item={item}
            onClose={() => onOpenChange(false)}
            onRenamed={onRenamed}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

