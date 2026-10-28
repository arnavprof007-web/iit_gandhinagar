/**
 * Local storage abstraction for demo state persistence.
 * Includes in-memory fallback for headless test and SSR environments.
 */

const STORAGE_PREFIX = 'greenpulse_demo_';
const memoryStore = new Map<string, string>();

function isLocalStorageAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

export function getStoredItem<T>(key: string, defaultValue: T): T {
  try {
    if (isLocalStorageAvailable()) {
      const raw = localStorage.getItem(STORAGE_PREFIX + key);
      if (!raw) return defaultValue;
      return JSON.parse(raw) as T;
    }
    const mem = memoryStore.get(STORAGE_PREFIX + key);
    if (!mem) return defaultValue;
    return JSON.parse(mem) as T;
  } catch (error) {
    return defaultValue;
  }
}

export function setStoredItem<T>(key: string, value: T): void {
  try {
    const serialized = JSON.stringify(value);
    if (isLocalStorageAvailable()) {
      localStorage.setItem(STORAGE_PREFIX + key, serialized);
    } else {
      memoryStore.set(STORAGE_PREFIX + key, serialized);
    }
  } catch (error) {
    // Graceful error handle
  }
}

export function removeStoredItem(key: string): void {
  try {
    if (isLocalStorageAvailable()) {
      localStorage.removeItem(STORAGE_PREFIX + key);
    } else {
      memoryStore.delete(STORAGE_PREFIX + key);
    }
  } catch (error) {
    // Graceful error handle
  }
}

export function resetAllDemoStorage(): void {
  try {
    if (isLocalStorageAvailable()) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(STORAGE_PREFIX)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    }
    memoryStore.clear();
  } catch (error) {
    // Graceful error handle
  }
}
