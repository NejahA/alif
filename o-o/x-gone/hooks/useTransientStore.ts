"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface TransientItem {
  id: string;
  content: string;
  type: "note" | "file" | "windows" | "apk";
  createdAt: number;
  expiresAt: number;
  life: number; // calculated locally
  vanishing?: boolean;
}

const STORAGE_KEY = "xgone_transient_items";

const getSavedItems = (): TransientItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const now = Date.now();
    return parsed
      .map((item: any) => ({
        ...item,
        life: Math.max(0, Math.floor(((item.expiresAt || now) - now) / 1000)),
        vanishing: false,
      }))
      .filter((item: any) => item.life > 0);
  } catch {
    return [];
  }
};

const saveItemsToStorage = (items: TransientItem[]) => {
  if (typeof window === "undefined") return;
  try {
    const toSave = items
      .filter((item) => !item.vanishing && item.life > 0)
      .map(({ vanishing, ...rest }) => rest);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (err) {
    console.error("Failed to save to localStorage", err);
  }
};

export const useTransientStore = () => {
  const [items, setItems] = useState<TransientItem[]>([]);
  const [isWiping, setIsWiping] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/items");
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const now = Date.now();
        const serverItems: TransientItem[] = json.data
          .map((item: any) => ({
            id: item._id?.toString() || item.id || String(item._id),
            content: item.content,
            type: item.type,
            createdAt: item.createdAt instanceof Date ? item.createdAt.getTime() : new Date(item.createdAt).getTime(),
            expiresAt: item.expiresAt instanceof Date ? item.expiresAt.getTime() : new Date(item.expiresAt).getTime(),
            life: Math.max(0, Math.floor((new Date(item.expiresAt).getTime() - now) / 1000)),
            vanishing: false,
          }))
          .filter((item) => item.life > 0);

        setItems((prev) => {
          // Keep optimistic vanishing items until their animation completes
          const vanishingIds = new Set(prev.filter((i) => i.vanishing).map((i) => i.id));
          const updated = serverItems.filter((i) => !vanishingIds.has(i.id));
          saveItemsToStorage(updated);
          return updated;
        });
      }
    } catch {
      // Quiet fallback when offline or in standalone mobile/desktop WebView
    }
  }, []);

  // Initial load from local storage + fetch backend and setup polling
  useEffect(() => {
    const local = getSavedItems();
    if (local.length > 0) {
      setItems(local);
    }
    fetchItems();
    pollingRef.current = setInterval(fetchItems, 5000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchItems]);

  // Local decay timer for smooth countdown UI
  useEffect(() => {
    const timer = setInterval(() => {
      setItems((prev) => {
        let changed = false;
        let hasExpired = false;

        const next = prev.map((item) => {
          if (item.vanishing) return item;
          const newLife = Math.max(0, item.life - 1);
          if (newLife === 0 && !item.vanishing) {
            changed = true;
            hasExpired = true;
            return { ...item, life: 0, vanishing: true };
          }
          if (newLife !== item.life) changed = true;
          return { ...item, life: newLife };
        });

        if (hasExpired) {
          setTimeout(() => {
            setItems((curr) => {
              const active = curr.filter((i) => !(i.vanishing && i.life === 0));
              saveItemsToStorage(active);
              return active;
            });
          }, 600);
        }

        if (changed) {
          saveItemsToStorage(next);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const addItem = async (content: string, type: TransientItem["type"] = "note", durationSeconds = 300) => {
    const now = Date.now();
    const expiresAt = now + durationSeconds * 1000;
    const localId = `task_${now}_${Math.random().toString(36).substring(2, 9)}`;

    const newItem: TransientItem = {
      id: localId,
      content,
      type,
      createdAt: now,
      expiresAt,
      life: durationSeconds,
      vanishing: false,
    };

    // Optimistically add to state and localStorage
    setItems((prev) => {
      const updated = [...prev, newItem];
      saveItemsToStorage(updated);
      return updated;
    });

    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, type, createdAt: now, expiresAt }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?._id) {
          const serverId = json.data._id.toString();
          setItems((prev) => {
            const updated = prev.map((item) =>
              item.id === localId ? { ...item, id: serverId } : item
            );
            saveItemsToStorage(updated);
            return updated;
          });
        }
      }
    } catch (e) {
      console.warn("Backend add sync failed, saved locally:", e);
    }
  };

  // Individual task erase / delete
  const removeAtOnce = async (id: string) => {
    // 1. Optimistic vanish animation
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, vanishing: true } : item))
    );

    // 2. Remove locally after smooth animation (works offline, Android, Windows)
    setTimeout(() => {
      setItems((prev) => {
        const remaining = prev.filter((item) => item.id !== id);
        saveItemsToStorage(remaining);
        return remaining;
      });
    }, 400);

    // 3. Sync delete with backend if online
    try {
      await fetch(`/api/items/${id}`, { method: "DELETE" });
    } catch (e) {
      console.warn("Backend delete sync failed, removed locally:", e);
    }
  };

  const updateItem = async (id: string, updates: Partial<Pick<TransientItem, "content" | "type">>) => {
    setItems((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, ...updates } : item));
      saveItemsToStorage(updated);
      return updated;
    });

    try {
      await fetch(`/api/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    } catch (e) {
      console.warn("Backend update sync failed, updated locally:", e);
    }
  };

  // Mass wipe all tasks
  const massWipe = async () => {
    setIsWiping(true);
    setItems((prev) => prev.map((item) => ({ ...item, vanishing: true })));

    setTimeout(() => {
      setItems([]);
      saveItemsToStorage([]);
      setIsWiping(false);
    }, 800);

    try {
      await fetch("/api/items", { method: "DELETE" });
    } catch (e) {
      console.warn("Backend mass wipe sync failed, wiped locally:", e);
    }
  };

  return { items, addItem, updateItem, removeAtOnce, massWipe, isWiping };
};
