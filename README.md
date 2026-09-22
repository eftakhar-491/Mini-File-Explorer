# Mini Workspace Explorer

A production-quality, browser-based file manager where users can create, navigate, search, edit, rename, and delete folders and text files. Built with **Next.js 16 (App Router)**, **TypeScript (strict mode)**, **Zustand**, and **shadcn/ui**, styled with a dense, functional developer aesthetic inspired by VS Code and Linear.
A production-quality, browser-based file manager where users can create, navigate, search, edit, rename, and delete folders and text files. Built with **Next.js 16 (App Router)**, **TypeScript (strict mode enabled)**, **Zustand**, **IndexedDB + LocalStorage**, and **shadcn/ui**, styled with a dense, functional developer aesthetic inspired by VS Code and Linear.

## Getting Started

### 1. Installation

```bash
git clone <repository-url>
cd directory
npm install
```

### 2. Development & Production Commands

```bash
npm run dev
# OR
npm run build
npm run start
```

## Project Structure

```
file-manage/
├── app/
│   ├── globals.css              # Custom VS Code/Linear slate palette, density overrides, monospace tokens
│   ├── layout.tsx               # Root layout, ThemeProvider, TooltipProvider, Geist font configuration
│   └── page.tsx                 # Main application shell with split panel & responsive Sheet sidebar
├── components/
│   ├── theme-provider.tsx       # next-themes provider wrapper
│   ├── theme-toggle.tsx         # SSR-safe dark/light mode toggle with tooltip
│   ├── loading-skeleton.tsx     # Full workspace skeleton shown during Zustand store hydration
│   ├── sidebar/
│   │   ├── TreeView.tsx         # Sidebar container, expand/collapse all, reset workspace
│   │   └── TreeNode.tsx         # Recursive folder tree node with smooth height animation and distinct selection
│   ├── main-panel/
│   │   ├── BreadcrumbBar.tsx    # Clickable path breadcrumbs with smart middle ellipsis for deep paths
│   │   ├── Toolbar.tsx          # New File, New Folder, Rename, Delete, item counter & mobile overflow
│   │   ├── ItemList.tsx         # Contents of active folder (folders first, then files) & empty state
│   │   └── ItemRow.tsx          # Dense 38px item row with monospace typography, double-click to open & inline edit
│   ├── editor/
│   │   └── FileEditor.tsx       # In-panel text editor with local draft state, dirty badge & Cmd+S shortcut
│   ├── search/
│   │   └── SearchCommand.tsx    # Cmd/Ctrl+K command palette with full-path results & auto tree expansion
│   ├── dialogs/
│   │   ├── CreateItemDialog.tsx # Modal dialog for creating files/folders with live name validation
│   │   ├── RenameDialog.tsx     # Modal dialog for renaming with validation & duplicate check
│   │   ├── DeleteDialog.tsx     # AlertDialog computing exact recursive descendant count
│   │   └── UnsavedChangesDialog.tsx # Guard modal warning against discarding unsaved text drafts
│   └── ui/                      # Generated shadcn/ui primitives (Radix / Base UI)
├── lib/
│   ├── types.ts                 # BaseItem, Folder, TextFile, FileSystemItem, ItemType, TreeItem
│   ├── seedData.ts              # Default seed items (Workspace, Projects, Webbly, notes, tasks, etc.)
│   ├── storage.ts               # Dual IndexedDB + LocalStorage storage adapter for Zustand persist
│   ├── fileSystemUtils.ts       # Pure functions: buildTree (recursive), getChildren, getPath, validateName, searchItems
│   └── utils.ts                 # Tailwind class merger (cn)
└── store/
    ├── useFileSystemStore.ts    # Persisted Zustand store (IndexedDB + LocalStorage) for filesystem data & memoized selectors
    └── useUiStore.ts            # Ephemeral Zustand store for UI selection, editor state, sidebar & search
```

## State management approach

#### Dual Store Architecture

To prevent unnecessary writes to browser storage and eliminate re-rendering, the application separates filesystem data from ephemeral UI state:

1. **`useFileSystemStore` (Persisted via IndexedDB + LocalStorage)**:
   - Stores filesystem items with Zustand persistence via IndexedDB and LocalStorage. Client hydration controls `<LoadingSkeleton />`; actions support creating, renaming, deleting, editing, seeding, and resetting items.

2. **`useUiStore` (Ephemeral UI State)**:
   - Holds UI concerns: `selectedFolderId`, `openFileId`, `expandedFolderIds`, `sidebarOpen` (mobile sheet), `searchOpen`, `isEditorDirty`, and navigation guards.
   - Kept in memory only — never writes to storage. This ensures frequent UI interactions (clicking tree nodes, expanding folders, toggling sheets, typing search queries) do not trigger expensive storage serialization.

## File-system data structure - (Tree Data Structure)

### 1. Flat Normalized Dictionary (`Record<string, FileSystemItem>`)

Rather than maintaining items in an interconnected, deeply nested tree structure (`{ id, children: [{ id, children: [...] }] }`), the primary store maintains items in a **flat, normalized dictionary** keyed by item ID:

```typescript
export type BaseItem = {
  id: string;
  name: string;
  parentId: string | null;  // null for root-level items
  createdAt: number;
  updatedAt: number;
};

export type Folder = BaseItem & {
  type: "folder";
};

export type TextFile = BaseItem & {
  type: "file";
  content: string;
};

export type FileSystemItem = Folder | TextFile;

// Store state:
items: Record<string, FileSystemItem>;
```

### 2. On-Demand Recursive Tree Projection (`buildTree`)

When components like the Sidebar TreeView need to render the visual hierarchy, the pure utility `buildTree` (`lib/fileSystemUtils.ts`) converts the flat dictionary into a clean recursive tree structure on demand:

```typescript
export interface TreeItem {
  id: string;
  name: string;
  type: "folder" | "file";
  parentId: string | null;
  createdAt: number;
  updatedAt: number;
  content?: string;
  children: TreeItem[];
  depth: number;
}

export function buildTree(
  items: Record<string, FileSystemItem>,
  parentId: string | null = null,
  depth: number = 0
): TreeItem[] {
 
  const children = getChildren(items, parentId);

  // Recursive step: folders recurse for children, files terminate with empty array
  return children.map((item) => ({
    ...item,
    depth,
    children: item.type === "folder" ? buildTree(items, item.id, depth + 1) : [],
  }));
}
```

## Key Implementation Decisions


#### 1. Pure File System Utilities (`/lib/fileSystemUtils.ts`)
All filesystem business logic is isolated into pure functions decoupled from Zustand:
- `buildTree(items, parentId)`
- `getChildren(items, parentId)`
- `getPath(items, id)`
- `getDescendantCount(items, id)`
- `validateName(name, parentId, items, excludeId?)`
- `findNearestSurvivingAncestor(items, deletedIds, currentFolderId)`
#### 2 Performance: Memoized Shallow Selectors
#### 3. In-Panel Text Editor & Local Draft State
#### 4. Fast Command Search (`Cmd+K` / `Ctrl+K`)
#### 5. Responsive Design & System Color Mood

## 🧪 Edge Cases Handled

- [x] **Duplicate names within same folder**: Blocked with inline error message inside dialogs and inline rename.
- [x] **Empty folder**: Clean empty state with quick "New File" and "New Folder" action buttons.
- [x] **Deleting deep subtrees**: Single atomic store update; AlertDialog warns user with exact nested item count.
- [x] **Deleting active folder**: Automatically falls back to the nearest surviving ancestor (or workspace root).
- [x] **Unsaved draft protection**: Guard dialog prevents accidental navigation away from dirty text files.
- [x] **Very long item names**: CSS truncation with ellipsis and tooltip on hover.
- [x] **Empty workspace**: If all items are deleted, root-level controls remain functional, with a "Reset Workspace" button.
- [x] **SSR Hydration safety**: Full loading skeleton prevents layout shifts or invalid store reads before storage rehydration completes.
