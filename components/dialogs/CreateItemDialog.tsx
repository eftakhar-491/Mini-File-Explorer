"use client";

import * as React from "react";
import { FolderPlus, FilePlus } from "lucide-react";
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
import { validateName, getPathString } from "@/lib/fileSystemUtils";
import { ItemType } from "@/lib/types";

interface CreateItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId: string | null;
  itemType: ItemType;
  onCreated?: (id: string) => void;
}

interface CreateItemFormProps {
  parentId: string | null;
  itemType: ItemType;
  onClose: () => void;
  onCreated?: (id: string) => void;
}

function CreateItemForm({
  parentId,
  itemType,
  onClose,
  onCreated,
}: CreateItemFormProps) {
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const items = useFileSystemStore((state) => state.items);
  const createFolder = useFileSystemStore((state) => state.createFolder);
  const createFile = useFileSystemStore((state) => state.createFile);

  const parentPath = React.useMemo(() => {
    return getPathString(items, parentId);
  }, [items, parentId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (error) {
      const validation = validateName(val, parentId, items);
      if (validation.valid) {
        setError(null);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const validation = validateName(name, parentId, items);
    if (!validation.valid) {
      setError(validation.error || "Invalid item name");
      return;
    }

    setIsSubmitting(true);
    try {
      let newId = "";
      if (itemType === "folder") {
        newId = createFolder(parentId, name);
      } else {
        newId = createFile(parentId, name);
      }
      onClose();
      onCreated?.(newId);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFolder = itemType === "folder";

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader className="gap-1.5 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded bg-primary/10 text-primary">
            {isFolder ? <FolderPlus className="h-4 w-4" /> : <FilePlus className="h-4 w-4" />}
          </div>
          <DialogTitle className="text-base font-semibold">
            New {isFolder ? "Folder" : "File"}
          </DialogTitle>
        </div>
        <DialogDescription className="text-xs text-muted-foreground">
          Creating in <span className="font-mono text-foreground font-medium">{parentPath}</span>
        </DialogDescription>
      </DialogHeader>

      <div className="py-3 space-y-2">
        <div className="space-y-1">
          <label htmlFor="create-item-name" className="text-xs font-medium text-muted-foreground">
            {isFolder ? "Folder Name" : "File Name (e.g. notes.txt)"}
          </label>
          <Input
            id="create-item-name"
            value={name}
            onChange={handleChange}
            placeholder={isFolder ? "my-new-folder" : "document.txt"}
            autoFocus
            className="h-9 font-mono text-sm"
            aria-invalid={!!error}
          />
        </div>

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
          {isSubmitting ? "Creating..." : `Create ${isFolder ? "Folder" : "File"}`}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CreateItemDialog({
  open,
  onOpenChange,
  parentId,
  itemType,
  onCreated,
}: CreateItemDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] bg-card border-border shadow-xl">
        {open && (
          <CreateItemForm
            parentId={parentId}
            itemType={itemType}
            onClose={() => onOpenChange(false)}
            onCreated={onCreated}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

