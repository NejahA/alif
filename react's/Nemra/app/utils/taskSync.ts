import { Task } from "../types";

export type SyncStatus = "synced" | "pending" | "error";

export type SyncConfig = {
  enabled: boolean;
  endpoint?: string;
  apiKey?: string;
  lastSync?: number;
};

export function getSyncConfig(): SyncConfig {
  const stored = localStorage.getItem("syncConfig");
  return stored ? JSON.parse(stored) : { enabled: false };
}

export function setSyncConfig(config: SyncConfig): void {
  localStorage.setItem("syncConfig", JSON.stringify(config));
}

export async function syncTasks(tasks: Task[]): Promise<{ success: boolean; message: string }> {
  const config = getSyncConfig();
  
  if (!config.enabled || !config.endpoint) {
    return { success: false, message: "Sync not configured" };
  }
  
  try {
    const response = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.apiKey || ""}`,
      },
      body: JSON.stringify({ tasks, timestamp: Date.now() }),
    });
    
    if (response.ok) {
      config.lastSync = Date.now();
      setSyncConfig(config);
      return { success: true, message: "Synced successfully" };
    } else {
      return { success: false, message: "Sync failed" };
    }
  } catch (error) {
    return { success: false, message: "Network error" };
  }
}

export function detectConflicts(localTasks: Task[], remoteTasks: Task[]): Task[] {
  const conflicts: Task[] = [];
  
  localTasks.forEach(localTask => {
    const remoteTask = remoteTasks.find(t => t.id === localTask.id);
    if (remoteTask && remoteTask.createdAt !== localTask.createdAt) {
      conflicts.push(localTask);
    }
  });
  
  return conflicts;
}

export function mergeTaskLists(local: Task[], remote: Task[]): Task[] {
  const merged = new Map<string, Task>();
  
  // Add all remote tasks
  remote.forEach(task => merged.set(task.id, task));
  
  // Add or update with local tasks (local takes precedence if newer)
  local.forEach(task => {
    const existing = merged.get(task.id);
    if (!existing || task.createdAt > existing.createdAt) {
      merged.set(task.id, task);
    }
  });
  
  return Array.from(merged.values());
}
