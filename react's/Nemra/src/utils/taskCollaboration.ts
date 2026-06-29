import { Task } from "../types";

export type TaskComment = {
  id: string;
  taskId: string;
  author: string;
  text: string;
  timestamp: number;
};

export type TaskAssignment = {
  taskId: string;
  assignedTo: string[];
  assignedBy: string;
  assignedAt: number;
};

export function shareTasksViaLink(tasks: Task[]): string {
  const data = JSON.stringify(tasks);
  const encoded = btoa(data);
  return `${window.location.origin}?import=${encoded}`;
}

export function importTasksFromLink(encodedData: string): Task[] | null {
  try {
    const decoded = atob(encodedData);
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
}

export function generateTaskReport(tasks: Task[]): string {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const highPriority = tasks.filter(t => t.priority === "high" && !t.completed).length;
  const overdue = tasks.filter(t => 
    !t.completed && t.dueDate && new Date(t.dueDate) < new Date()
  ).length;
  
  return `
📊 Task Report Summary
━━━━━━━━━━━━━━━━━━━━
Total Tasks: ${total}
✅ Completed: ${completed} (${Math.round((completed/total)*100)}%)
⚠️ High Priority: ${highPriority}
🔴 Overdue: ${overdue}
📅 Generated: ${new Date().toLocaleString()}
  `.trim();
}

export function exportToClipboard(tasks: Task[]): void {
  const text = tasks.map(t => 
    `${t.completed ? '✓' : '○'} ${t.text} [${t.priority}]${t.dueDate ? ` - Due: ${t.dueDate}` : ''}`
  ).join('\n');
  
  navigator.clipboard.writeText(text);
}