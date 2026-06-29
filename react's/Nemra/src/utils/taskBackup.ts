import { Task } from "../types";

export type Backup = {
  id: string;
  timestamp: number;
  tasks: Task[];
  version: string;
};

export function createBackup(tasks: Task[]): Backup {
  return {
    id: Date.now().toString(),
    timestamp: Date.now(),
    tasks: JSON.parse(JSON.stringify(tasks)),
    version: "1.0",
  };
}

export function saveBackup(tasks: Task[]): void {
  const backup = createBackup(tasks);
  const backups = getBackups();
  backups.unshift(backup);
  
  // Keep only last 10 backups
  const limited = backups.slice(0, 10);
  localStorage.setItem("taskBackups", JSON.stringify(limited));
}

export function getBackups(): Backup[] {
  const stored = localStorage.getItem("taskBackups");
  return stored ? JSON.parse(stored) : [];
}

export function restoreBackup(backupId: string): Task[] | null {
  const backups = getBackups();
  const backup = backups.find(b => b.id === backupId);
  return backup ? backup.tasks : null;
}

export function autoBackup(tasks: Task[]): void {
  const lastBackup = localStorage.getItem("lastBackupTime");
  const now = Date.now();
  
  // Auto backup every 30 minutes
  if (!lastBackup || now - parseInt(lastBackup) > 30 * 60 * 1000) {
    saveBackup(tasks);
    localStorage.setItem("lastBackupTime", now.toString());
  }
}

export function exportBackup(backup: Backup): void {
  const dataStr = JSON.stringify(backup, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `nemra-backup-${new Date(backup.timestamp).toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function importBackup(file: File): Promise<Backup | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const backup = JSON.parse(event.target?.result as string);
        if (backup.tasks && Array.isArray(backup.tasks)) {
          resolve(backup);
        } else {
          resolve(null);
        }
      } catch (error) {
        resolve(null);
      }
    };
    reader.readAsText(file);
  });
}