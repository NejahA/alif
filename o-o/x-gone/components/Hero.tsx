"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import styles from "./Hero.module.css";

export const Hero = () => {
  return (
    <div className={styles.container}>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={styles.heroX}
      >
        <X size={400} strokeWidth={0.5} className={styles.icon} />
        <div className={styles.glow} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className={styles.content}
      >
        <h1 className="glowing-text">X-GONE</h1>
        <p>The Ephemeral Workspace. Drop. Process. Vanish.</p>
      </motion.div>
    </div>
  );
};
