const API_BASE_URL = 'http://localhost:5001/api';

export interface Task {
  _id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'inprogress' | 'done';
  labels: string[];
  assigneeId?: string;
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  createdAt: Date;
  updatedAt: Date;
}

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

export interface Integration {
  _id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  apiKey?: string;
  webhookUrl?: string;
}

export interface Workflow {
  _id: string;
  name: string;
  description: string;
  trigger: string;
  actions: string[];
  steps: any[];
  enabled: boolean;
  createdAt: Date;
}

export interface BlockchainVerification {
  _id: string;
  taskId: string | Task;
  hash: string;
  block: number;
  timestamp: Date;
  verified: boolean;
  transactions: number;
  gasUsed: string;
}

// Tasks API
export const fetchTasks = async (): Promise<Task[]> => {
  const response = await fetch(`${API_BASE_URL}/tasks`);
  if (!response.ok) throw new Error('Failed to fetch tasks');
  return response.json();
};

export const createTask = async (task: Omit<Task, '_id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task)
  });
  if (!response.ok) throw new Error('Failed to create task');
  return response.json();
};

export const updateTask = async (id: string, updates: Partial<Task>): Promise<Task> => {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!response.ok) throw new Error('Failed to update task');
  return response.json();
};

export const deleteTask = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete task');
};

// Users API
export const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch(`${API_BASE_URL}/users`);
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

// Comments API
export const fetchComments = async (taskId?: string): Promise<Comment[]> => {
  const url = taskId ? `${API_BASE_URL}/comments?taskId=${taskId}` : `${API_BASE_URL}/comments`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch comments');
  return response.json();
};

export const createComment = async (comment: Omit<Comment, '_id' | 'createdAt'>): Promise<Comment> => {
  const response = await fetch(`${API_BASE_URL}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(comment)
  });
  if (!response.ok) throw new Error('Failed to create comment');
  return response.json();
};

export const deleteComment = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/comments/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete comment');
};

// Integrations API
export const fetchIntegrations = async (): Promise<Integration[]> => {
  const response = await fetch(`${API_BASE_URL}/integrations`);
  if (!response.ok) throw new Error('Failed to fetch integrations');
  return response.json();
};

export const updateIntegration = async (id: string, updates: Partial<Integration>): Promise<Integration> => {
  const response = await fetch(`${API_BASE_URL}/integrations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!response.ok) throw new Error('Failed to update integration');
  return response.json();
};

// Workflows API
export const fetchWorkflows = async (): Promise<Workflow[]> => {
  const response = await fetch(`${API_BASE_URL}/workflows`);
  if (!response.ok) throw new Error('Failed to fetch workflows');
  return response.json();
};

export const createWorkflow = async (workflow: Omit<Workflow, '_id' | 'createdAt'>): Promise<Workflow> => {
  const response = await fetch(`${API_BASE_URL}/workflows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workflow)
  });
  if (!response.ok) throw new Error('Failed to create workflow');
  return response.json();
};

// Blockchain Verifications API
export const fetchBlockchainVerifications = async (): Promise<BlockchainVerification[]> => {
  const response = await fetch(`${API_BASE_URL}/blockchain-verifications`);
  if (!response.ok) throw new Error('Failed to fetch blockchain verifications');
  return response.json();
};

export const createBlockchainVerification = async (
  verification: Omit<BlockchainVerification, '_id'>
): Promise<BlockchainVerification> => {
  const response = await fetch(`${API_BASE_URL}/blockchain-verifications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(verification)
  });
  if (!response.ok) throw new Error('Failed to create blockchain verification');
  return response.json();
};

// Seed database
export const seedDatabase = async (): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/seed`, {
    method: 'POST'
  });
  if (!response.ok) throw new Error('Failed to seed database');
  return response.json();
};

// Health check
export const checkHealth = async (): Promise<{ status: string; timestamp: Date }> => {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) throw new Error('Backend is not healthy');
  return response.json();
};