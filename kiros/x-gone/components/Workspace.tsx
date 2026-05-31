"use client";

import { useTransientStore, TransientItem } from "@/hooks/useTransientStore";
import { X, Plus, Trash2, Clock, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import styles from "./Workspace.module.css";

export const Workspace = () => {
  const { items, addItem, removeAtOnce, massWipe, isWiping } = useTransientStore();
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    addItem(input, "note", 300); // 5 minutes
    setInput("");
  };

  return (
    <div className={styles.workspace}>
      <header className={styles.header}>
        <div className={styles.controls}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Inject a thought..."
              className={styles.input}
            />
            <button type="submit" className={styles.addButton}>
              <Plus size={20} />
            </button>
          </form>
          <button 
            onClick={massWipe} 
            className={styles.wipeButton}
            title="Mass-X Wipe"
          >
            <Trash2 size={24} />
          </button>
        </div>
      </header>

      <div className={styles.grid}>
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={item.vanishing ? { opacity: 0, scale: 1.2, rotate: 15, filter: "blur(10px)" } : { opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: -45 }}
              transition={{ duration: 0.4 }}
              className={`${styles.item} glass-panel`}
            >
              <div className={styles.itemHeader}>
                <span className={styles.type}>
                  {item.type === "note" ? <FileText size={14} /> : <Clock size={14} />}
                  {item.type}
                </span>
                <button 
                  onClick={() => removeAtOnce(item.id)}
                  className={styles.xButton}
                >
                  <X size={16} />
                </button>
              </div>
              <div className={styles.itemContent}>
                {item.content}
              </div>
              <div className={styles.footer}>
                <div className={styles.lifeBarContainer}>
                  <div 
                    className={styles.lifeBar} 
                    style={{ width: `${(item.life / 300) * 100}%` }}
                  />
                </div>
                <span className={styles.timeLeft}>{Math.floor(item.life / 60)}:{(item.life % 60).toString().padStart(2, '0')}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isWiping && (
        <div className={styles.wipeOverlay}>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 20, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className={styles.wipeCircle}
          />
          <h1 className={styles.wipeText}>X-GONE</h1>
        </div>
      )}
    </div>
  );
};
