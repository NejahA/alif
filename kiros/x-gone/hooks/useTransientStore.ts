"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type ItemType = "note" | "task" | "secret" | "code" | "file";

export interface TransientItem {
  id: string;
  content: string;
  type: ItemType;
  isCompleted?: boolean;
  createdAt: number;
  expiresAt: number;
  totalDuration: number;
  life: number; // calculated locally in seconds
  vanishing?: boolean;
}

export const useTransientStore = () => {
  const [items, setItems] = useState<TransientItem[]>([]);
  const [isWiping, setIsWiping] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/items");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const now = Date.now();
        setItems((prev) => {
          const prevMap = new Map(prev.map((item) => [item.id, item]));
          return json.data.map((item: any) => {
            const exp = new Date(item.expiresAt).getTime();
            const created = new Date(item.createdAt).getTime();
            const totalDuration = Math.max(1, Math.floor((exp - created) / 1000));
            const serverLife = Math.max(0, Math.floor((exp - now) / 1000));
            const existing = prevMap.get(item._id || item.id);

            return {
              id: item._id || item.id,
              content: item.content,
              type: item.type || "note",
              isCompleted: item.isCompleted ?? false,
              createdAt: created,
              expiresAt: exp,
              totalDuration: existing?.totalDuration || totalDuration,
              life: existing && Math.abs(existing.life - serverLife) < 3 ? existing.life : serverLife,
              vanishing: existing?.vanishing ?? false,
            };
          });
        });
      }
    } catch (e) {
      console.error("Failed to fetch items", e);
    }
  }, []);

  // Initial fetch and stable polling
  useEffect(() => {
    fetchItems();
    pollingRef.current = setInterval(fetchItems, 6000); // Poll every 6s
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchItems]);

  // Local decay timer for smooth countdown UI
  useEffect(() => {
    const timer = setInterval(() => {
      setItems((prev) => {
        let hasChanges = false;
        const expiredIds: string[] = [];

        const next = prev.map((item) => {
          if (item.vanishing) return item;
          if (item.life > 0) {
            hasChanges = true;
            return { ...item, life: item.life - 1 };
          }
          if (item.life === 0 && !item.vanishing) {
            hasChanges = true;
            expiredIds.push(item.id);
            return { ...item, life: 0, vanishing: true };
          }
          return item;
        });

        if (expiredIds.length > 0) {
          expiredIds.forEach((id) => {
            fetch(`/api/items/${id}`, { method: "DELETE" }).catch(() => {});
          });
          setTimeout(() => {
            setItems((curr) => curr.filter((i) => !expiredIds.includes(i.id)));
          }, 500);
        }

        return hasChanges ? next : prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const addItem = async (
    content: string,
    type: ItemType = "note",
    durationSeconds = 300
  ) => {
    const now = Date.now();
    const expiresAt = now + durationSeconds * 1000;

    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          type,
          isCompleted: false,
          createdAt: now,
          expiresAt,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const newItem: TransientItem = {
          id: json.data._id || json.data.id,
          content: json.data.content,
          type: json.data.type || type,
          isCompleted: false,
          createdAt: json.data.createdAt || now,
          expiresAt: json.data.expiresAt || expiresAt,
          totalDuration: durationSeconds,
          life: durationSeconds,
          vanishing: false,
        };
        setItems((prev) => [...prev, newItem]);
        return newItem;
      }
    } catch (e) {
      console.error("Failed to add item", e);
    }
    return null;
  };

  const toggleTask = async (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
      )
    );

    const target = items.find((i) => i.id === id);
    if (!target) return;

    try {
      await fetch(`/api/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: !target.isCompleted }),
      });
    } catch (e) {
      console.warn("Failed to toggle task", e);
    }
  };

  const removeAtOnce = async (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, vanishing: true } : item))
    );

    try {
      await fetch(`/api/items/${id}`, { method: "DELETE" });
    } catch (e) {
      console.warn("Failed to delete item from backend", e);
    }

    setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }, 400);
  };

  const massWipe = async () => {
    setIsWiping(true);
    setItems((prev) => prev.map((item) => ({ ...item, vanishing: true })));

    try {
      await fetch("/api/items", { method: "DELETE" });
    } catch (e) {
      console.warn("Failed to mass wipe from backend", e);
    }

    setTimeout(() => {
      setItems([]);
      setIsWiping(false);
    }, 900);
  };

  return { items, addItem, toggleTask, removeAtOnce, massWipe, isWiping };
};
