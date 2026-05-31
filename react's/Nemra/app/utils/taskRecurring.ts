import { Task } from "../types";

export type RecurrencePattern = "daily" | "weekly" | "monthly" | "custom";

export type RecurringTask = Task & {
  recurrence?: {
    pattern: RecurrencePattern;
    interval: number;
    endDate?: string;
    lastGenerated?: number;
  };
};

export function generateRecurringTasks(tasks: RecurringTask[]): Task[] {
  const newTasks: Task[] = [];
  const now = Date.now();
  
  tasks.forEach(task => {
    if (!task.recurrence || !task.completed) return;
    
    const { pattern, interval, endDate, lastGenerated } = task.recurrence;
    const lastGen = lastGenerated || task.createdAt;
    
    let nextDate = new Date(lastGen);
    
    switch (pattern) {
      case "daily":
        nextDate.setDate(nextDate.getDate() + interval);
        break;
      case "weekly":
        nextDate.setDate(nextDate.getDate() + (interval * 7));
        break;
      case "monthly":
        nextDate.setMonth(nextDate.getMonth() + interval);
        break;
    }
    
    if (nextDate.getTime() <= now) {
      if (!endDate || new Date(endDate) >= nextDate) {
        const newTask: Task = {
          ...task,
          id: Date.now().toString() + Math.random(),
          completed: false,
          completedAt: undefined,
          createdAt: now,
          dueDate: task.dueDate ? nextDate.toISOString().split('T')[0] : undefined,
        };
        newTasks.push(newTask);
      }
    }
  });
  
  return newTasks;
}

export function createRecurringTask(
  task: Task,
  pattern: RecurrencePattern,
  interval: number,
  endDate?: string
): RecurringTask {
  return {
    ...task,
    recurrence: {
      pattern,
      interval,
      endDate,
      lastGenerated: task.createdAt,
    },
  };
}
