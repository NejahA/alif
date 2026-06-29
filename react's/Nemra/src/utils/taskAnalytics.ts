import { Task } from "../types";

export function getProductivityScore(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  
  const completed = tasks.filter(t => t.completed).length;
  const highPriorityCompleted = tasks.filter(t => t.completed && t.priority === "high").length;
  const onTime = tasks.filter(t => t.completed && t.dueDate && new Date(t.dueDate) >= new Date(t.completedAt || 0)).length;
  
  const completionRate = (completed / tasks.length) * 40;
  const priorityBonus = (highPriorityCompleted / Math.max(1, tasks.filter(t => t.priority === "high").length)) * 30;
  const timelinessBonus = (onTime / Math.max(1, completed)) * 30;
  
  return Math.round(completionRate + priorityBonus + timelinessBonus);
}

export function getTasksByTimeOfDay(tasks: Task[]): { morning: number; afternoon: number; evening: number; night: number } {
  const completed = tasks.filter(t => t.completed && t.completedAt);
  
  return completed.reduce((acc, task) => {
    const hour = new Date(task.completedAt!).getHours();
    if (hour >= 6 && hour < 12) acc.morning++;
    else if (hour >= 12 && hour < 17) acc.afternoon++;
    else if (hour >= 17 && hour < 22) acc.evening++;
    else acc.night++;
    return acc;
  }, { morning: 0, afternoon: 0, evening: 0, night: 0 });
}

export function getAverageCompletionTime(tasks: Task[]): number {
  const completed = tasks.filter(t => t.completed && t.completedAt);
  if (completed.length === 0) return 0;
  
  const totalTime = completed.reduce((sum, task) => {
    return sum + (task.completedAt! - task.createdAt);
  }, 0);
  
  return Math.round(totalTime / completed.length / (1000 * 60 * 60)); // hours
}

export function getTasksByPriority(tasks: Task[]): { high: number; medium: number; low: number } {
  return tasks.reduce((acc, task) => {
    if (!task.completed) {
      acc[task.priority]++;
    }
    return acc;
  }, { high: 0, medium: 0, low: 0 });
}

export function getUpcomingDeadlines(tasks: Task[], days: number = 7): Task[] {
  const now = new Date();
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  
  return tasks
    .filter(t => !t.completed && t.dueDate)
    .filter(t => {
      const dueDate = new Date(t.dueDate!);
      return dueDate >= now && dueDate <= future;
    })
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
}

export function getOverdueTasks(tasks: Task[]): Task[] {
  const now = new Date();
  return tasks
    .filter(t => !t.completed && t.dueDate)
    .filter(t => new Date(t.dueDate!) < now)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
}

export function getCompletionTrend(tasks: Task[], days: number = 7): number[] {
  const trend: number[] = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toDateString();
    
    const completed = tasks.filter(t => 
      t.completed && 
      t.completedAt && 
      new Date(t.completedAt).toDateString() === dateStr
    ).length;
    
    trend.push(completed);
  }
  
  return trend;
}

export function getMostProductiveDay(tasks: Task[]): string {
  const dayCount: { [key: string]: number } = {};
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  tasks.filter(t => t.completed && t.completedAt).forEach(task => {
    const day = new Date(task.completedAt!).getDay();
    dayCount[day] = (dayCount[day] || 0) + 1;
  });
  
  const maxDay = Object.entries(dayCount).reduce((max, [day, count]) => 
    count > max.count ? { day: parseInt(day), count } : max
  , { day: 0, count: 0 });
  
  return dayNames[maxDay.day];
}

export function getTagStats(tasks: Task[]): { tag: string; count: number; completed: number }[] {
  const tagMap: { [key: string]: { count: number; completed: number } } = {};
  
  tasks.forEach(task => {
    task.tags.forEach(tag => {
      if (!tagMap[tag]) {
        tagMap[tag] = { count: 0, completed: 0 };
      }
      tagMap[tag].count++;
      if (task.completed) {
        tagMap[tag].completed++;
      }
    });
  });
  
  return Object.entries(tagMap)
    .map(([tag, stats]) => ({ tag, ...stats }))
    .sort((a, b) => b.count - a.count);
}