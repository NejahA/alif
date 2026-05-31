"use client";

import { useTransientStore, TransientItem } from "@/hooks/useTransientStore";
import { X, Plus, Trash2, Clock, FileText, Monitor, Smartphone, Edit2, Check, Paperclip, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import styles from "./Workspace.module.css";

export const Workspace = () => {
  const { items, addItem, updateItem, removeAtOnce, massWipe, isWiping } = useTransientStore();
  const [input, setInput] = useState("");
  const [selectedType, setSelectedType] = useState<TransientItem["type"]>("note");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [builds, setBuilds] = useState<Record<string, { status: string, message: string }>>({});

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).electronAPI) {
      (window as any).electronAPI.onBuildStatus((data: any) => {
        // We find the first item of the matching type that is currently "building" or just update a global build state
        // To keep it simple, we'll store build status by type for now, or match it to a specific task if we have an ID
        // But since the IPC doesn't send the ID back yet, let's just show it on all items of that type that were recently clicked
        setBuilds(prev => ({
          ...prev,
          [data.type]: { status: data.status, message: data.message }
        }));
      });
    }
  }, []);

  const handleStartBuild = (type: string) => {
    if (typeof window !== "undefined" && (window as any).electronAPI) {
      setBuilds(prev => ({
        ...prev,
        [type]: { status: "starting", message: "Build process initiated..." }
      }));
      (window as any).electronAPI.startBuild(type);
    } else {
      alert("Builds can only be triggered from the desktop application.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    addItem(input, selectedType, 300); // 5 minutes
    setInput("");
  };

  const handleEdit = (item: TransientItem) => {
    setEditingId(item.id);
    setEditContent(item.content);
  };

  const handleSave = async (id: string) => {
    if (!editContent.trim()) return;
    await updateItem(id, { content: editContent });
    setEditingId(null);
  };

  const getIcon = (type: TransientItem["type"]) => {
    switch (type) {
      case "note": return <FileText size={14} />;
      case "file": return <Paperclip size={14} />;
      case "windows": return <Monitor size={14} />;
      case "apk": return <Smartphone size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const types: TransientItem["type"][] = ["note", "file", "windows", "apk"];

  return (
    <div className={styles.workspace}>
      <header className={styles.header}>
        <div className={styles.controls}>
          <div style={{ flex: 1, maxWidth: "600px" }}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Inject a ${selectedType}...`}
                className={styles.input}
              />
              <button type="submit" className={styles.addButton}>
                <Plus size={20} />
              </button>
            </form>
            
            <div className={styles.typeSelector}>
              {types.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`${styles.typeBtn} ${selectedType === t ? styles.active : ""}`}
                >
                  {getIcon(t)}
                  {t}
                </button>
              ))}
            </div>
          </div>

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
                  {getIcon(item.type)}
                  {item.type}
                </span>
                <div className={styles.itemActions}>
                  {!editingId && (
                    <button 
                      onClick={() => handleEdit(item)}
                      className={styles.actionBtn}
                      title="Edit Task"
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                  <button 
                    onClick={() => removeAtOnce(item.id)}
                    className={styles.xButton}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className={styles.itemContent}>
                {editingId === item.id ? (
                  <>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className={styles.editInput}
                      autoFocus
                    />
                    <div className={styles.editActions}>
                      <button 
                        onClick={() => handleSave(item.id)} 
                        className={`${styles.actionBtn} ${styles.saveBtn}`}
                      >
                        <Check size={14} />
                      </button>
                      <button 
                        onClick={() => setEditingId(null)} 
                        className={`${styles.actionBtn} ${styles.cancelBtn}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </>
                ) : (
                  item.content
                )}
              </div>

              {(item.type === "windows" || item.type === "apk") && (
                <div className={styles.buildSection}>
                  <button 
                    onClick={() => handleStartBuild(item.type)}
                    disabled={builds[item.type]?.status === "progress" || builds[item.type]?.status === "starting"}
                    className={styles.buildBtn}
                  >
                    <Play size={14} fill="currentColor" />
                    {builds[item.type]?.status === "progress" ? "Building..." : `Build ${item.type.toUpperCase()}`}
                  </button>
                  
                  {builds[item.type] && (
                    <div className={styles.buildStatus}>
                      <div className={styles.statusHeader}>
                        <span>Status</span>
                        <span className={styles[`status${builds[item.type].status.charAt(0).toUpperCase() + builds[item.type].status.slice(1)}`]}>
                          {builds[item.type].status.toUpperCase()}
                        </span>
                      </div>
                      <code className={styles.statusMessage}>
                        {builds[item.type].message}
                      </code>
                    </div>
                  )}
                </div>
              )}

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
