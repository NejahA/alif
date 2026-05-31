import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, 'flowwstate.db');

let db = {
  tasks: []
};

export function initDb() {
  if (existsSync(DB_PATH)) {
    try {
      const data = readFileSync(DB_PATH, 'utf8');
      db = JSON.parse(data);
    } catch (error) {
      console.log('Database corrupted, starting fresh');
      db = { tasks: [] };
    }
  }
}

export function saveDb() {
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export function addTask(taskData) {
  const newTask = {
    id: Date.now(),
    name: taskData.name,
    command: taskData.command,
    schedule: taskData.schedule,
    enabled: taskData.enabled ? 1 : 0,
    createdAt: new Date().toISOString(),
    lastRun: null,
    runCount: 0
  };
  db.tasks.push(newTask);
  saveDb();
  return newTask.id;
}

export function getTask(id) {
  return db.tasks.find(t => t.id === parseInt(id));
}

export function getAllTasks() {
  return db.tasks;
}

export function updateTask(id, taskData) {
  const task = db.tasks.find(t => t.id === parseInt(id));
  if (task) {
    task.name = taskData.name;
    task.command = taskData.command;
    task.schedule = taskData.schedule;
    task.enabled = taskData.enabled ? 1 : 0;
    saveDb();
  }
}

export function deleteTask(id) {
  db.tasks = db.tasks.filter(t => t.id !== parseInt(id));
  saveDb();
}

export function updateLastRun(id) {
  const task = db.tasks.find(t => t.id === parseInt(id));
  if (task) {
    task.lastRun = new Date().toISOString();
    task.runCount = (task.runCount || 0) + 1;
    saveDb();
  }
}
