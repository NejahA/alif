"use client";

import { useState, useEffect } from "react";

type Props = {
  taskId: string;
  taskName: string;
  onComplete: (taskId: string, timeSpent: number) => void;
};

export default function TaskTimer({ taskId, taskName, onComplete }: Props) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const remainingSeconds = secs % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const handleComplete = () => {
    setIsRunning(false);
    onComplete(taskId, seconds);
    setSeconds(0);
  };

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
      <h3 className="text-lg font-semibold mb-2">Timer: {taskName}</h3>
      <div className="text-4xl font-mono font-bold mb-4">{formatTime(seconds)}</div>
      <div className="flex gap-2">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="flex-1 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-all font-medium"
        >
          {isRunning ? '⏸ Pause' : '▶ Start'}
        </button>
        <button
          onClick={() => setSeconds(0)}
          className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all"
        >
          🔄 Reset
        </button>
        <button
          onClick={handleComplete}
          className="px-4 py-2 bg-green-500 rounded-lg hover:bg-green-600 transition-all"
        >
          ✓ Done
        </button>
      </div>
    </div>
  );
}
