import { StateStorage } from "zustand/middleware";

const DB_NAME = "workspace-explorer-db";
const STORE_NAME = "keyval";
const DB_VERSION = 1;

/**
 * Initializes and returns the IndexedDB database instance.
 */
function getIDBDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB is not available"));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * IndexedDB + LocalStorage dual storage adapter for Zustand persist.
 * Reads/writes to IndexedDB with automatic LocalStorage sync & fallback.
 */
export const dualIndexedDBStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    // 1. Try reading from IndexedDB
    try {
      const db = await getIDBDatabase();
      const value = await new Promise<string | null>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(name);

        req.onsuccess = () => {
          resolve(req.result ?? null);
        };
        req.onerror = () => {
          reject(req.error);
        };
      });

      if (value !== null) {
        return value;
      }
    } catch {
      // IndexedDB failed or not yet initialized
    }

    // 2. Fallback to LocalStorage if IndexedDB was empty or unavailable
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(name);
    }

    return null;
  },

  setItem: async (name: string, value: string): Promise<void> => {
    // 1. Write to LocalStorage immediately as quick cache
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.setItem(name, value);
      } catch {
        // LocalStorage quota might be full for large text files, ignore
      }
    }

    // 2. Write persistently to IndexedDB
    try {
      const db = await getIDBDatabase();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(value, name);

        req.onsuccess = () => {
          resolve();
        };
        req.onerror = () => {
          reject(req.error);
        };
      });
    } catch (err) {
      console.warn("Failed to write to IndexedDB:", err);
    }
  },

  removeItem: async (name: string): Promise<void> => {
    // 1. Remove from LocalStorage
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(name);
    }

    // 2. Remove from IndexedDB
    try {
      const db = await getIDBDatabase();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(name);

        req.onsuccess = () => {
          resolve();
        };
        req.onerror = () => {
          reject(req.error);
        };
      });
    } catch (err) {
      console.warn("Failed to remove from IndexedDB:", err);
    }
  },
};

