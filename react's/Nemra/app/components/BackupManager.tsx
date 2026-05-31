"use client";

import { useState, useEffect } from "react";
import { getBackups, restoreBackup, exportBackup, importBackup, Backup } from "../utils/taskBackup";
import { Task } from "../types";

type Props = {
  onRestore: (tasks: Task[]) => void;
  onClose: () => void;
};

export default function BackupManager({ onRestore, onClose }: Props) {
  const [backups, setBackups] = useState<Backup[]>([]);
  
  useEffect(() => {
    setBackups(getBackups());
  }, []);
  
  const handleRestore = (backupId: string) => {
    const tasks = restoreBackup(backupId);
    if (tasks) {
      onRestore(tasks);
      onClose();
    }
  };
  
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const backup = await importBackup(file);
    if (backup) {
      onRestore(backup.tasks);
      onClose();
    } else {
      alert("Invalid backup file");
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Backup Manager
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl"
          >
            ×
          </button>
        </div>
        
        <div className="mb-6">
          <label className="block w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all cursor-pointer text-center font-semibold">
            📤 Import Backup File
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
        
        <div className="space-y-3">
          {backups.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No backups available</p>
          ) : (
            backups.map(backup => (
              <div
                key={backup.id}
                className="border-2 border-gray-200 rounded-xl p-4 hover:border-purple-500 transition-all"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">
                      {new Date(backup.timestamp).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {backup.tasks.length} tasks • Version {backup.version}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRestore(backup.id)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => exportBackup(backup)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                    >
                      Export
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
