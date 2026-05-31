"use client";

import { useState } from "react";

type Props = {
  taskId: string;
  initialNotes?: string;
  onSave: (taskId: string, notes: string) => void;
  onClose: () => void;
};

export default function TaskNotes({ taskId, initialNotes = "", onSave, onClose }: Props) {
  const [notes, setNotes] = useState(initialNotes);

  const handleSave = () => {
    onSave(taskId, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold">Task Notes</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes, links, or details about this task..."
          className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          autoFocus
        />
        
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-medium"
          >
            Save Notes
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
