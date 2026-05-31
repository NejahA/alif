export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'inprogress' | 'done';
export type Label = 'bug' | 'feature' | 'enhancement' | 'documentation' | 'design';

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  points?: number;
}

export interface Comment {
  _id: string;
  taskId: string;
  userId: string | User;
  content: string;
  createdAt: Date;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  labels: Label[];
  assigneeId?: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  estimatedHours?: number;
  actualHours?: number;
}
