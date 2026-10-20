"use client";

import { useTransientStore, ItemType } from "@/hooks/useTransientStore";
import { 
  X, 
  Plus, 
  Trash2, 
  Clock, 
  FileText, 
  CheckSquare, 
  Square, 
  Eye, 
  EyeOff, 
  Code2, 
  Copy, 
  Check, 
  Search, 
  Flame,
  ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import styles from "./Workspace.module.css";

export const Workspace = () => {
  const { items, addItem, toggleTask, removeAtOnce, massWipe, isWiping } = useTransientStore();
  const [input, setInput] = useState("");
  const [selectedType, setSelectedType] = useState<ItemType>("note");
  const [selectedDuration, setSelectedDuration] = useState<number>(300);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | ItemType>("all");
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    addItem(input, selectedType, selectedDuration);
    setInput("");
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const toggleSecret = (id: string) => {
    setRevealedSecrets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "all" || item.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [items, searchQuery, filterType]);

  const expiringSoonCount = useMemo(() => {
    return items.filter((i) => i.life <= 60 && i.life > 0).length;
  }, [items]);

  return (
    <div className={styles.workspace}>
      <header className={styles.header}>
        {/* Controls Container */}
        <div className={styles.controls}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Type Selector Dropdown / Pill */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as ItemType)}
              className={styles.typeSelect}
              title="Select Type"
            >
              <option value="note">📝 Note</option>
              <option value="task">✅ Task</option>
              <option value="secret">🔐 Secret</option>
              <option value="code">💻 Code</option>
            </select>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                selectedType === "task"
                  ? "Enter a transient task..."
                  : selectedType === "secret"
                  ? "Enter a confidential thought..."
                  : selectedType === "code"
                  ? "Paste snippet or command..."
                  : "Inject a thought into the void..."
              }
              className={styles.input}
            />

            {/* Duration Selector */}
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(Number(e.target.value))}
              className={styles.durationSelect}
              title="Lifespan Duration"
            >
              <option value={60}>⚡ 1m</option>
              <option value={300}>⏱️ 5m</option>
              <option value={900}>☕ 15m</option>
              <option value={3600}>🌙 1h</option>
              <option value={86400}>🔒 24h</option>
            </select>

            <button type="submit" className={styles.addButton} title="Inject Thought">
              <Plus size={20} />
            </button>
          </form>

          <button 
            onClick={massWipe} 
            className={styles.wipeButton}
            title="Mass-X Wipe"
          >
            <Trash2 size={22} />
          </button>
        </div>

        {/* Toolbar: Search, Filters & Counters */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search thoughts..."
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterPills}>
            {(["all", "note", "task", "secret", "code"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`${styles.filterPill} ${filterType === t ? styles.filterActive : ""}`}
              >
                {t === "all" ? "All" : t}
              </button>
            ))}
          </div>

          <div className={styles.statsBar}>
            <span className={styles.statChip}>
              {items.length} {items.length === 1 ? "Item" : "Items"}
            </span>
            {expiringSoonCount > 0 && (
              <span className={styles.expiringChip}>
                <Flame size={13} />
                {expiringSoonCount} Expiring Soon
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Grid of Transient Items */}
      {filteredItems.length === 0 ? (
        <div className={styles.emptyVoid}>
          <ShieldAlert size={48} className={styles.voidIcon} />
          <h3>The void is silent.</h3>
          <p>Inject a thought, task, or secret above. They will auto-decay and vanish forever.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          <AnimatePresence>
            {filteredItems.map((item) => {
              const isSecret = item.type === "secret";
              const isCode = item.type === "code";
              const isTask = item.type === "task";
              const isRevealed = revealedSecrets[item.id];
              const totalSecs = item.totalDuration || 300;
              const progressPct = Math.max(0, Math.min(100, (item.life / totalSecs) * 100));
              const isCritical = item.life <= 30;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={
                    item.vanishing
                      ? { opacity: 0, scale: 1.15, rotate: 10, filter: "blur(12px)" }
                      : { opacity: 1, scale: 1, y: 0 }
                  }
                  exit={{ opacity: 0, scale: 0.5, rotate: -25 }}
                  transition={{ duration: 0.35 }}
                  className={`${styles.item} glass-panel ${isCode ? styles.codeItem : ""}`}
                >
                  <div className={styles.itemHeader}>
                    <div className={styles.typeBadge}>
                      {isTask ? (
                        <CheckSquare size={14} className={styles.typeIcon} />
                      ) : isSecret ? (
                        <ShieldAlert size={14} className={styles.typeIcon} />
                      ) : isCode ? (
                        <Code2 size={14} className={styles.typeIcon} />
                      ) : (
                        <FileText size={14} className={styles.typeIcon} />
                      )}
                      <span className={styles.typeText}>{item.type}</span>
                    </div>

                    <div className={styles.cardActions}>
                      {/* Copy Action */}
                      <button
                        onClick={() => handleCopy(item.id, item.content)}
                        className={styles.actionBtn}
                        title="Copy to clipboard"
                      >
                        {copiedId === item.id ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                      </button>

                      {/* Secret Eye Toggle */}
                      {isSecret && (
                        <button
                          onClick={() => toggleSecret(item.id)}
                          className={styles.actionBtn}
                          title={isRevealed ? "Hide Secret" : "Reveal Secret"}
                        >
                          {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      )}

                      {/* Delete / Vanish Button */}
                      <button
                        onClick={() => removeAtOnce(item.id)}
                        className={styles.xButton}
                        title="Vanish now"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className={styles.itemContent}>
                    {isTask ? (
                      <div 
                        className={styles.taskWrapper}
                        onClick={() => toggleTask(item.id)}
                      >
                        {item.isCompleted ? (
                          <CheckSquare size={18} className={styles.checkedIcon} />
                        ) : (
                          <Square size={18} className={styles.uncheckedIcon} />
                        )}
                        <span className={`${styles.taskText} ${item.isCompleted ? styles.completedText : ""}`}>
                          {item.content}
                        </span>
                      </div>
                    ) : isSecret && !isRevealed ? (
                      <div 
                        className={styles.secretBlur}
                        onClick={() => toggleSecret(item.id)}
                        title="Click to reveal secret"
                      >
                        <span>••••••••••••••••••••••••</span>
                        <small className={styles.blurHint}>Click to peek</small>
                      </div>
                    ) : isCode ? (
                      <pre className={styles.codeSnippet}>
                        <code>{item.content}</code>
                      </pre>
                    ) : (
                      <p className={styles.normalText}>{item.content}</p>
                    )}
                  </div>

                  {/* Card Lifebar & Decay Countdown */}
                  <div className={styles.footer}>
                    <div className={styles.lifeBarContainer}>
                      <div
                        className={`${styles.lifeBar} ${isCritical ? styles.criticalBar : ""}`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <span className={styles.timeLeft}>
                      {Math.floor(item.life / 60)}:{(item.life % 60).toString().padStart(2, "0")}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Mass Wipe Overlay */}
      {isWiping && (
        <div className={styles.wipeOverlay}>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 22, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className={styles.wipeCircle}
          />
          <h1 className={styles.wipeText}>X-GONE</h1>
        </div>
      )}
    </div>
  );
};
