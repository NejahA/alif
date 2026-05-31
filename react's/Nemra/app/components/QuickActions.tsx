"use client";

import { Task } from "../types";
import { exportToClipboard, generateTaskReport } from "../utils/taskCollaboration";

type Props = {
  tasks: Task[];
  onBulkComplete: () => void;
  onBulkDelete: () => void;
  onArchiveCompleted: () => void;
};

export default function QuickActions({ tasks, onBulkComplete, onBulkDelete, onArchiveCompleted }: Props) {
  const handleCopyReport = () => {
    const report = generateTaskReport(tasks);
    navigator.clipboard.writeText(report);
    alert("Report copied to clipboard!");
  };
  
  const handleCopyTasks = () => {
    exportToClipboard(tasks);
    alert("Tasks copied to clipboard!");
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={handleCopyReport}
          className="px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all text-sm font-medium"
        >
          📋 Copy Report
        </button>
        
        <button
          onClick={handleCopyTasks}
          className="px-4 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all text-sm font-medium"
        >
          📝 Copy Tasks
        </button>
        
        <button
          onClick={onBulkComplete}
          className="px-4 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all text-sm font-medium"
        >
          ✓ Complete All
        </button>
        
        <button
          onClick={onArchiveCompleted}
          className="px-4 py-3 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-all text-sm font-medium"
        >
          📦 Archive Done
        </button>
      </div>
    </div>
  );
}
