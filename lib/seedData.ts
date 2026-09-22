import { FileSystemItem } from "./types";

export const ROOT_FOLDER_ID = "root";

const now = 1716380000000;

export const SEED_ITEMS: Record<string, FileSystemItem> = {
  [ROOT_FOLDER_ID]: {
    id: ROOT_FOLDER_ID,
    name: "Workspace",
    parentId: null,
    type: "folder",
    createdAt: now,
    updatedAt: now,
  },
  "folder-projects": {
    id: "folder-projects",
    name: "Projects",
    parentId: ROOT_FOLDER_ID,
    type: "folder",
    createdAt: now + 1000,
    updatedAt: now + 1000,
  },
  "folder-webbly": {
    id: "folder-webbly",
    name: "Webbly",
    parentId: "folder-projects",
    type: "folder",
    createdAt: now + 2000,
    updatedAt: now + 2000,
  },
  "file-notes": {
    id: "file-notes",
    name: "notes.txt",
    parentId: "folder-webbly",
    type: "file",
    content: `# Webbly Architecture & Implementation Notes

- Framework: Next.js 16 (App Router)
- Language: TypeScript (strict mode enabled)
- Styling: Tailwind CSS v4 with custom VS Code-inspired theme
- Components: shadcn/ui primitives with dense functional design
- State: Dual Zustand stores (persisted FS + ephemeral UI)
- Lookups: O(1) flat Record<id, FileSystemItem> with memoized selectors

Design Priorities:
1. Instant feedback on all filesystem mutations
2. In-panel draft editing with dirty state protection
3. Fast Cmd+K full-path search across deep hierarchies
`,
    createdAt: now + 3000,
    updatedAt: now + 3000,
  },
  "file-tasks": {
    id: "file-tasks",
    name: "tasks.txt",
    parentId: "folder-webbly",
    type: "file",
    content: `Webbly Roadmap
=================

[x] Scaffold Next.js 16 + Tailwind CSS v4
[x] Install and configure shadcn/ui components
[x] Design flat Record<id, FileSystemItem> Zustand store
[x] Implement recursive tree view with expand/collapse
[x] Build breadcrumb navigation with path derivation
[x] Build toolbar with modal dialogs & inline validation
[x] Implement in-panel text editor with unsaved changes guard
[x] Add search command (Cmd+K) with deep path display
[x] LocalStorage persistence with SSR hydration skeleton
[ ] Final QA and production build verification
`,
    createdAt: now + 4000,
    updatedAt: now + 4000,
  },
  "folder-personal": {
    id: "folder-personal",
    name: "Personal",
    parentId: "folder-projects",
    type: "folder",
    createdAt: now + 5000,
    updatedAt: now + 5000,
  },
  "folder-documents": {
    id: "folder-documents",
    name: "Documents",
    parentId: ROOT_FOLDER_ID,
    type: "folder",
    createdAt: now + 6000,
    updatedAt: now + 6000,
  },
  "file-readme": {
    id: "file-readme",
    name: "README.txt",
    parentId: ROOT_FOLDER_ID,
    type: "file",
    content: `Mini Workspace Explorer
=========================

A production-quality, browser-based file manager built with Next.js 16, TypeScript, Zustand, and shadcn/ui.

Quick Start & Shortcuts:
------------------------
• Double-click any file to open the in-panel editor.
• Press Cmd+K or Ctrl+K anytime to open Search.
• Press Cmd+S or Ctrl+S in the editor to save changes.
• Double-click item name or use toolbar/row actions to rename.
• Delete folders safely: confirmation dialog shows exact nested count.
• Local changes are automatically persisted to localStorage.

Explore the folders in the left sidebar to get started!
`,
    createdAt: now + 7000,
    updatedAt: now + 7000,
  },
};

