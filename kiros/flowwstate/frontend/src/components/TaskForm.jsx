import React, { useState } from 'react';

export default function TaskForm({ onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [command, setCommand] = useState('');
  const [schedule, setSchedule] = useState('daily');
  const [enabled, setEnabled] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !command) return;
    
    onSubmit({ name, command, schedule, enabled });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-purple-200 mb-1">Task Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Backup Database"
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-purple-200 mb-1">Command</label>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="e.g., C:\\backup\\backup.bat"
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
          required
        />
        <p className="text-xs text-slate-500 mt-1">Path to the executable or script</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-purple-200 mb-1">Schedule</label>
        <select
          value={schedule}
          onChange={(e) => setSchedule(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
        >
          <option value="startup">On System Startup</option>
          <option value="login">On User Login</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="enabled"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
        />
        <label htmlFor="enabled" className="text-sm text-white">Enable this task</label>
      </div>
      
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Create Task
        </button>
      </div>
    </form>
  );
}
