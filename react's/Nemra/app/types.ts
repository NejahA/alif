export type Task = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  tags: string[];
  category?: string;
  notes?: string;
  subtasks?: Subtask[];
  timeSpent?: number;
  attachments?: string[];
};

export type Subtask = {
  id: string;
  text: string;
  completed: boolean;
};

export type Filter = "all" | "active" | "completed";
export type SortBy = "date" | "priority" | "alphabetical" | "dueDate";
export type ViewMode = "list" | "kanban";
