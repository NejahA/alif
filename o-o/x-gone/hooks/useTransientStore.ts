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

export const useTransientStore = () => {
  const [items, setItems] = useState<TransientItem[]>([]);
  const [isWiping, setIsWiping] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/items");
      const json = await res.json();
      if (json.success) {
        const now = Date.now();
        const newItems = json.data.map((item: any) => ({
          id: item._id,
          content: item.content,
          type: item.type,
          createdAt: item.createdAt,
          expiresAt: item.expiresAt,
          life: Math.max(0, Math.floor((item.expiresAt - now) / 1000)),
        }));
        setItems(newItems);
      }
    } catch (e) {
      console.error("Failed to fetch items", e);
    }
  }, []);

  // Initial fetch and polling
  useEffect(() => {
    fetchItems();
    pollingRef.current = setInterval(fetchItems, 5000); // Poll every 5s
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchItems]);

  // Local decay timer for smooth UI
  useEffect(() => {
    const timer = setInterval(() => {
      setItems((prev) => {
        const next = prev.map((item) => {
          if (item.vanishing) return item;
          const newLife = Math.max(0, item.life - 1);
          if (newLife === 0 && !item.vanishing) {
            return { ...item, life: 0, vanishing: true };
          }
          return { ...item, life: newLife };
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const addItem = async (content: string, type: TransientItem["type"] = "note", durationSeconds = 300) => {
    const now = Date.now();
    const expiresAt = now + durationSeconds * 1000;
    
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, type, createdAt: now, expiresAt }),
      });
      const json = await res.json();
      if (json.success) {
        const newItem: TransientItem = {
          id: json.data._id,
          content: json.data.content,
          type: json.data.type,
          createdAt: json.data.createdAt,
          expiresAt: json.data.expiresAt,
          life: durationSeconds,
        };
        setItems((prev) => [...prev, newItem]);
      }
    } catch (e) {
      console.error("Failed to add item", e);
    }
  };

  const removeAtOnce = async (id: string) => {
    // Optimistic UI
    setItems((prev) => prev.map(item => item.id === id ? { ...item, vanishing: true } : item));
    
    try {
      await fetch(`/api/items/${id}`, { method: "DELETE" });
      // Final removal after animation
      setTimeout(() => {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }, 600);
    } catch (e) {
      console.error("Failed to delete item", e);
    }
  };

  const updateItem = async (id: string, updates: Partial<Pick<TransientItem, "content" | "type">>) => {
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (json.success) {
        setItems((prev) => 
          prev.map((item) => item.id === id ? { ...item, ...updates } : item)
        );
      }
    } catch (e) {
      console.error("Failed to update item", e);
    }
  };

  const massWipe = async () => {
    setIsWiping(true);
    setItems((prev) => prev.map(item => ({...item, vanishing: true })));
    
    try {
      await fetch("/api/items", { method: "DELETE" });
      setTimeout(() => {
        setItems([]);
        setIsWiping(false);
      }, 1000);
    } catch (e) {
      console.error("Failed to mass wipe", e);
      setIsWiping(false);
    }
  };

  return { items, addItem, updateItem, removeAtOnce, massWipe, isWiping };
};
