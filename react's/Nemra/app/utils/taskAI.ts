import { Task } from "../types";

export function suggestPriority(taskText: string): "low" | "medium" | "high" {
  const text = taskText.toLowerCase();
  
  const urgentKeywords = ["urgent", "asap", "critical", "emergency", "immediately", "deadline"];
  const highKeywords = ["important", "must", "required", "essential", "priority"];
  const lowKeywords = ["maybe", "someday", "consider", "optional", "nice to have"];
  
  if (urgentKeywords.some(keyword => text.includes(keyword))) {
    return "high";
  }
  
  if (lowKeywords.some(keyword => text.includes(keyword))) {
    return "low";
  }
  
  if (highKeywords.some(keyword => text.includes(keyword))) {
    return "high";
  }
  
  return "medium";
}

export function suggestTags(taskText: string): string[] {
  const text = taskText.toLowerCase();
  const suggestions: string[] = [];
  
  const tagMap: { [key: string]: string[] } = {
    work: ["meeting", "email", "report", "presentation", "project", "client"],
    personal: ["home", "family", "personal", "self"],
    health: ["exercise", "workout", "gym", "health", "doctor", "fitness"],
    learning: ["learn", "study", "course", "tutorial", "read", "book"],
    finance: ["pay", "bill", "budget", "money", "invoice", "payment"],
    shopping: ["buy", "purchase", "shop", "order", "get"],
    urgent: ["urgent", "asap", "critical", "emergency"],
    planning: ["plan", "schedule", "organize", "prepare"],
  };
  
  Object.entries(tagMap).forEach(([tag, keywords]) => {
    if (keywords.some(keyword => text.includes(keyword))) {
      suggestions.push(tag);
    }
  });
  
  return suggestions;
}

export function suggestDueDate(taskText: string): string | undefined {
  const text = taskText.toLowerCase();
  const today = new Date();
  
  if (text.includes("today")) {
    return today.toISOString().split('T')[0];
  }
  
  if (text.includes("tomorrow")) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
  
  if (text.includes("next week")) {
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  }
  
  if (text.includes("next month")) {
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth.toISOString().split('T')[0];
  }
  
  return undefined;
}

export function breakdownTask(taskText: string): string[] {
  const subtasks: string[] = [];
  
  if (taskText.toLowerCase().includes("project")) {
    subtasks.push("Plan and outline");
    subtasks.push("Research requirements");
    subtasks.push("Execute main work");
    subtasks.push("Review and test");
    subtasks.push("Finalize and deliver");
  } else if (taskText.toLowerCase().includes("meeting")) {
    subtasks.push("Prepare agenda");
    subtasks.push("Send invites");
    subtasks.push("Attend meeting");
    subtasks.push("Send follow-up notes");
  } else if (taskText.toLowerCase().includes("write") || taskText.toLowerCase().includes("blog")) {
    subtasks.push("Research topic");
    subtasks.push("Create outline");
    subtasks.push("Write draft");
    subtasks.push("Edit and revise");
    subtasks.push("Publish");
  }
  
  return subtasks;
}

export function estimateTimeRequired(task: Task): number {
  let baseTime = 30; // minutes
  
  if (task.priority === "high") baseTime += 30;
  if (task.subtasks && task.subtasks.length > 0) {
    baseTime += task.subtasks.length * 15;
  }
  if (task.notes && task.notes.length > 100) baseTime += 20;
  
  return baseTime;
}

export function suggestNextTask(tasks: Task[]): Task | null {
  const activeTasks = tasks.filter(t => !t.completed);
  
  if (activeTasks.length === 0) return null;
  
  // Score each task
  const scored = activeTasks.map(task => {
    let score = 0;
    
    // Priority scoring
    if (task.priority === "high") score += 50;
    else if (task.priority === "medium") score += 30;
    else score += 10;
    
    // Due date scoring
    if (task.dueDate) {
      const daysUntilDue = Math.floor(
        (new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilDue < 0) score += 100; // Overdue
      else if (daysUntilDue === 0) score += 80; // Due today
      else if (daysUntilDue <= 3) score += 60; // Due soon
      else if (daysUntilDue <= 7) score += 40;
    }
    
    // Age scoring (older tasks get slight boost)
    const ageInDays = Math.floor((Date.now() - task.createdAt) / (1000 * 60 * 60 * 24));
    score += Math.min(ageInDays * 2, 20);
    
    return { task, score };
  });
  
  scored.sort((a, b) => b.score - a.score);
  return scored[0].task;
}
