This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
# Mini Workspace Explorer

## Getting Started
A production-quality, browser-based file manager where users can create, navigate, search, edit, rename, and delete folders and text files. Built with **Next.js 16 (App Router)**, **TypeScript (strict mode)**, **Zustand**, and **shadcn/ui**, styled with a dense, functional developer aesthetic inspired by VS Code and Linear.
A production-quality, browser-based file manager where users can create, navigate, search, edit, rename, and delete folders and text files. Built with **Next.js 16 (App Router)**, **TypeScript (strict mode enabled)**, **Zustand**, **IndexedDB + LocalStorage**, and **shadcn/ui**, styled with a dense, functional developer aesthetic inspired by VS Code and Linear.

First, run the development server:
---

## 🚀 Getting Started

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd workspace-explorer

# Install dependencies
npm install
```

### 2. Development & Production Commands

```bash
# Run local development server (Turbopack)
npm run dev
# Start production server
npm run start
```

## 📁 Project Structure

## Learn More
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
│   ├── types.ts                 # BaseItem, Folder, TextFile, FileSystemItem, ItemType
│   ├── types.ts                 # BaseItem, Folder, TextFile, FileSystemItem, ItemType, TreeItem
│   ├── seedData.ts              # Default seed items (Workspace, Projects, Webbly, notes, tasks, etc.)
│   ├── fileSystemUtils.ts       # Pure functions: getChildren, getPath, getDescendants, validateName, searchItems
│   ├── storage.ts               # Dual IndexedDB + LocalStorage storage adapter for Zustand persist
│   ├── fileSystemUtils.ts       # Pure functions: buildTree (recursive), getChildren, getPath, validateName, searchItems
│   └── utils.ts                 # Tailwind class merger (cn)
└── store/
    ├── useFileSystemStore.ts    # Persisted Zustand store (localStorage) for filesystem data & memoized selectors
    ├── useFileSystemStore.ts    # Persisted Zustand store (IndexedDB + localStorage) for filesystem data & memoized selectors
    └── useUiStore.ts            # Ephemeral Zustand store for UI selection, editor state, sidebar & search
```


### Dual Store Architecture

## Deploy on Vercel
To prevent unnecessary writes to browser storage and eliminate re-rendering bottlenecks, the application separates persistent filesystem data from ephemeral UI state:

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.
1. **`useFileSystemStore` (Persisted via `localStorage`)**:
1. **`useFileSystemStore` (Persisted via IndexedDB + LocalStorage)**:
   - Contains the single source of truth for the filesystem items.
   - Wrapped in Zustand's `persist` middleware using `createJSONStorage(() => localStorage)` under the key `"workspace-explorer-fs"`.
   - Uses `skipHydration: true` to prevent SSR hydration mismatches in Next.js. Rehydration is triggered on client mount, and `hasHydrated` controls the display of the `<LoadingSkeleton />`.
   - Uses a custom asynchronous storage adapter (`dualIndexedDBStorage` in `lib/storage.ts`) that writes directly to browser **IndexedDB** (`workspace-explorer-db`) for high capacity and durability, while mirroring to **LocalStorage** for instant synchronous fallback.
   - Configured with `skipHydration: true` to prevent SSR hydration mismatches in Next.js. Rehydration is triggered on client mount, and `hasHydrated` controls the display of the `<LoadingSkeleton />`.
   - Actions: `createFolder`, `createFile`, `renameItem`, `deleteItem` (recursive), `updateFileContent`, `seedIfEmpty`, and `resetToDefault`.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
2. **`useUiStore` (Ephemeral UI State)**:
   - Holds UI concerns: `selectedFolderId`, `openFileId`, `expandedFolderIds`, `sidebarOpen` (mobile sheet), and `searchOpen`.
   - Never writes to `localStorage`, ensuring frequent interactions (clicking tree nodes, opening mobile sheets, typing queries) do not trigger unnecessary storage serialization.
   - Kept in memory only, ensuring frequent UI interactions (clicking tree nodes, toggling sheets, typing search queries) do not trigger expensive storage writes.

### Performance: Memoized Shallow Selectors

Rather than having components subscribe to the entire filesystem record, fine-grained selector hooks use Zustand's `useShallow` comparison:

- `useChildren(parentId)`: Derives only the immediate children of `parentId`. A `TreeNode` or `ItemList` will only re-render if its immediate children list changes.
- `useItem(id)`: Selects a single item by ID with $O(1)$ lookup.
- `usePath(id)`: Computes the folder path hierarchy from the root down to `id`.
- `useTree(rootId)`: Computes the full nested hierarchy using the recursive `buildTree` utility.

---

## 🌲 Recursive Tree Building Utility (`buildTree`)

In `lib/fileSystemUtils.ts`, the `buildTree` function converts the flat dictionary into a clean, human-readable recursive tree:

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

/**
 * Builds a hierarchical nested tree from the flat Record<string, FileSystemItem>
 * using an easy, human-readable recursive function.
 */
export function buildTree(
  items: Record<string, FileSystemItem>,
  parentId: string | null = null,
  depth: number = 0
): TreeItem[] {
  // 1. Get immediate sorted children of this parent (folders first, then files)
  const children = getChildren(items, parentId);

  // 2. Recursive step: map each child, recursing into folders to build children
  return children.map((item) => {
    const isFolder = item.type === "folder";
    return {
      ...item,
      depth,
      // Easy recursion: folders recurse for children, files have empty array
      children: isFolder ? buildTree(items, item.id, depth + 1) : [],
    };
  });
}
```

---

## 🗄️ File-System Data Structure: Flat Record vs Nested Tree

### Why Flat `Record<string, FileSystemItem>`?
### Why Flat `Record<string, FileSystemItem>` in Store?

Instead of storing items in a nested tree object (`{ id, children: [...] }`), items are stored in a flat dictionary keyed by item ID:

```typescript
type BaseItem = {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: number;
  updatedAt: number;
};

type Folder = BaseItem & { type: "folder" };
type TextFile = BaseItem & { type: "file"; content: string };
type FileSystemItem = Folder | TextFile;

// Store state:
items: Record<string, FileSystemItem>;
```

### Benefits:
### Key Advantages:
- **$O(1)$ Lookups & Direct Mutations**: Finding, renaming, or updating file content requires zero tree traversals or deep cloning.
- **Atomic Deletions**: Deleting a folder with deep descendants calculates all descendant IDs in one quick BFS/DFS and deletes them from the dictionary in a single `set()` state transition.
- **Relocation / Move Ready**: Moving a file or folder between directories simply requires changing `item.parentId`, with zero tree restructuring.
- **Arbitrary Nesting**: Supports infinite nesting levels without stack overflow or mutation complexity.
- **Relocation Ready**: Moving a file or folder between directories simply requires changing `item.parentId`.

---

## 🔑 Key Implementation Decisions

### 1. Pure File System Utilities (`/lib/fileSystemUtils.ts`)
All filesystem business logic is isolated into pure functions decoupled from Zustand:
- `buildTree(items, parentId)`: Recursively structures flat items into nested nodes.
- `getChildren(items, parentId)`: Sorts folders first (A–Z), then files (A–Z) case-insensitively.
- `getPath(items, id)`: Traces `parentId` links from target item up to the root folder.
- `getDescendantCount(items, id)`: Traverses the subtree to determine total nested item count.
- `validateName(name, parentId, items, excludeId?)`: Enforces non-empty names, rejects filesystem illegal characters (`/ \ : * ? " < > |`), and prevents case-insensitive duplicate sibling names.
- `findNearestSurvivingAncestor(items, deletedIds, currentFolderId)`: Automatically navigates the user up to the nearest valid ancestor if their active folder is deleted.

### 2. In-Panel Text Editor & Local Draft State
- Clicking a file opens the editor directly in the main panel workspace.
- **Draft Isolation**: Keystrokes update local component state (`draftContent`), **never** writing to Zustand or `localStorage` on every keypress.
- **Draft Isolation**: Keystrokes update local component state (`draftContent`), **never** writing to Zustand or storage on every keypress.
- **Dirty State Badge**: Diffs `draftContent !== file.content` to display an animated "Unsaved changes" or "Saved" badge.
- **Safety Guards**:
  - `Cmd+S` / `Ctrl+S` shortcut to save changes instantly.
  - An `<AlertDialog>` prompts the user to save or discard changes before switching folders or opening a different file.
  - A browser `beforeunload` listener warns against closing or refreshing the tab while unsaved changes exist.

### 3. Fast Command Search (`Cmd+K` / `Ctrl+K`)
- Built using shadcn's `Command` (cmdk) dialog.
- Debounced by 200ms to maintain smooth input responsiveness.
- Deep search matches item names and file text content across all hierarchy levels.
- Selecting any search result immediately navigates to the item, sets selection, and auto-expands all ancestor folders in the sidebar tree.

### 4. Custom Design System & Density
- **Dense Functional Aesthetic**: Styled in `globals.css` with a custom slate/graphite palette and a sapphire primary accent, avoiding generic default themes.
- **Monospace Typography**: File and folder names use `font-mono text-[13px]`, mimicking the look and feel of modern developer tools (VS Code / Linear).
- **Desktop Density**: File rows are compact (38px height) with subtle hover and active states.
- **Light & Dark Theme**: Toggleable with system preference detection and zero hydration flicker.
- **Mobile Responsive**: The left sidebar seamlessly transitions to a slide-out `<Sheet />` on mobile screens.

---

## 🧪 Edge Cases Handled

- [x] **Duplicate names within same folder**: Blocked with inline error message inside dialogs and inline rename.
- [x] **Empty folder**: Clean empty state with quick "New File" and "New Folder" action buttons.
- [x] **Deleting deep subtrees**: Single atomic store update; AlertDialog warns user with exact nested item count.
- [x] **Deleting active folder**: Automatically falls back to the nearest surviving ancestor (or workspace root).
- [x] **Unsaved draft protection**: Guard dialog prevents accidental navigation away from dirty text files.
- [x] **Very long item names**: CSS truncation with ellipsis and tooltip on hover.
- [x] **Empty workspace**: If all items are deleted, root-level controls remain functional, with a "Reset Workspace" button.
- [x] **SSR Hydration safety**: Full loading skeleton prevents layout shifts or invalid store reads before `localStorage` rehydration completes.
- [x] **SSR Hydration safety**: Full loading skeleton prevents layout shifts or invalid store reads before storage rehydration completes.

---

## 🔭 Future Improvements (Given More Time)

1. **Drag-and-Drop Reorganization**: Support `@hello-pangea/dnd` or HTML5 drag-and-drop to move files and folders between tree nodes.
2. **File Upload / Export**: Enable downloading files or importing text/JSON files from the local computer.
3. **Multi-Selection**: Allow selecting multiple rows with Shift/Ctrl + Click for batch deletion or bulk moves.
4. **Syntax Highlighting**: Integrate Monaco Editor or CodeMirror for rich language-specific syntax highlighting and line numbers.

---

## 🚢 Ready to Deploy

This application is configured for standard Next.js 16 App Router deployment and can be deployed directly to [Vercel](https://vercel.com) with zero configuration changes.
This application is configured for standard Next.js 16 App Router deployment and can be deployed directly to [Vercel](https://vercel.com) or GitHub Pages with zero configuration changes.
