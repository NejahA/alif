"use client";

import { useEffect, useState } from "react";
import { X, Minus } from "lucide-react";

export const ElectronHeader = () => {
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).electronAPI) {
      setIsElectron(true);
    }
  }, []);

  if (!isElectron) return null;

  return (
    <div className="electron-drag fixed top-0 left-0 w-full h-8 flex justify-between items-center bg-black/50 backdrop-blur-md border-b border-white/5 z-[10000]">
      <div className="px-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">
        X-GONE // Workspace
      </div>
      <div className="flex electron-no-drag">
        <button 
          onClick={() => (window as any).electronAPI.minimize()}
          className="w-10 h-8 flex items-center justify-center hover:bg-white/5 transition-colors"
        >
          <Minus size={14} className="text-white/40" />
        </button>
        <button 
          onClick={() => (window as any).electronAPI.close()}
          className="w-10 h-8 flex items-center justify-center hover:bg-red-500/20 transition-colors"
        >
          <X size={14} className="text-white/40" />
        </button>
      </div>
    </div>
  );
};
