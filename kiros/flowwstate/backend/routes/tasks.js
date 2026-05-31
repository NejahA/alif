import express from 'express';
import { addTask, getAllTasks, getTask, updateTask, deleteTask, updateLastRun } from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const tasks = await getAllTasks();
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, command, schedule, enabled } = req.body;
    
    if (!name || !command || !schedule) {
      return res.status(400).json({ error: 'Name, command, and schedule are required' });
    }

    const taskId = await addTask({ name, command, schedule, enabled });
    res.status(201).json({ id: taskId, name, command, schedule, enabled });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, command, schedule, enabled } = req.body;
    
    const existingTask = await getTask(id);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await updateTask(id, { name, command, schedule, enabled });
    res.json({ id, name, command, schedule, enabled });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existingTask = await getTask(id);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await deleteTask(id);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

router.post('/:id/run', async (req, res) => {
  try {
    const { id } = req.params;
    const task = await getTask(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Update last run timestamp
    await updateLastRun(id);
    
    res.json({ message: 'Task executed', task });
  } catch (error) {
    console.error('Error running task:', error);
    res.status(500).json({ error: 'Failed to run task' });
  }
});

export default router;
