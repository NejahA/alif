import { Task } from "../types";

export type TaskTemplate = {
  id: string;
  name: string;
  description: string;
  tasks: Omit<Task, "id" | "createdAt" | "completed" | "completedAt">[];
};

export const templates: TaskTemplate[] = [
  {
    id: "daily-routine",
    name: "Daily Routine",
    description: "Essential daily tasks",
    tasks: [
      { text: "Morning exercise", priority: "high", tags: ["health", "daily"], subtasks: [] },
      { text: "Check emails", priority: "medium", tags: ["work", "daily"], subtasks: [] },
      { text: "Plan the day", priority: "high", tags: ["planning", "daily"], subtasks: [] },
      { text: "Review goals", priority: "medium", tags: ["planning", "daily"], subtasks: [] },
    ]
  },
  {
    id: "project-launch",
    name: "Project Launch",
    description: "Complete project launch checklist",
    tasks: [
      { text: "Final code review", priority: "high", tags: ["development", "review"], subtasks: [] },
      { text: "Update documentation", priority: "high", tags: ["documentation"], subtasks: [] },
      { text: "Run all tests", priority: "high", tags: ["testing", "qa"], subtasks: [] },
      { text: "Deploy to production", priority: "high", tags: ["deployment"], subtasks: [] },
      { text: "Monitor metrics", priority: "medium", tags: ["monitoring"], subtasks: [] },
      { text: "Send launch announcement", priority: "medium", tags: ["communication"], subtasks: [] },
    ]
  },
  {
    id: "weekly-review",
    name: "Weekly Review",
    description: "Weekly planning and review",
    tasks: [
      { text: "Review last week's accomplishments", priority: "medium", tags: ["review", "weekly"], subtasks: [] },
      { text: "Set goals for next week", priority: "high", tags: ["planning", "weekly"], subtasks: [] },
      { text: "Clean up workspace", priority: "low", tags: ["organization", "weekly"], subtasks: [] },
      { text: "Update project status", priority: "medium", tags: ["reporting", "weekly"], subtasks: [] },
    ]
  },
  {
    id: "content-creation",
    name: "Content Creation",
    description: "Blog post or video creation workflow",
    tasks: [
      { text: "Research topic", priority: "high", tags: ["research", "content"], subtasks: [] },
      { text: "Create outline", priority: "high", tags: ["planning", "content"], subtasks: [] },
      { text: "Write first draft", priority: "high", tags: ["writing", "content"], subtasks: [] },
      { text: "Edit and revise", priority: "medium", tags: ["editing", "content"], subtasks: [] },
      { text: "Create graphics", priority: "medium", tags: ["design", "content"], subtasks: [] },
      { text: "Publish and promote", priority: "medium", tags: ["marketing", "content"], subtasks: [] },
    ]
  },
  {
    id: "learning-path",
    name: "Learning Path",
    description: "Structured learning plan",
    tasks: [
      { text: "Watch tutorial videos", priority: "high", tags: ["learning", "education"], subtasks: [] },
      { text: "Read documentation", priority: "high", tags: ["learning", "education"], subtasks: [] },
      { text: "Build practice project", priority: "high", tags: ["learning", "practice"], subtasks: [] },
      { text: "Join community discussions", priority: "low", tags: ["learning", "community"], subtasks: [] },
      { text: "Share what you learned", priority: "low", tags: ["learning", "teaching"], subtasks: [] },
    ]
  },
  {
    id: "event-planning",
    name: "Event Planning",
    description: "Organize a successful event",
    tasks: [
      { text: "Set event date and venue", priority: "high", tags: ["planning", "event"], subtasks: [] },
      { text: "Create guest list", priority: "high", tags: ["planning", "event"], subtasks: [] },
      { text: "Send invitations", priority: "high", tags: ["communication", "event"], subtasks: [] },
      { text: "Plan catering", priority: "medium", tags: ["logistics", "event"], subtasks: [] },
      { text: "Arrange equipment", priority: "medium", tags: ["logistics", "event"], subtasks: [] },
      { text: "Follow up with attendees", priority: "low", tags: ["communication", "event"], subtasks: [] },
    ]
  }
];

export function applyTemplate(template: TaskTemplate): Task[] {
  return template.tasks.map((task, index) => ({
    ...task,
    id: Date.now().toString() + index,
    createdAt: Date.now() + index,
    completed: false,
  }));
}
