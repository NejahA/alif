const express = require('express');
const router = express.Router();
const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

// POST /api/tasks - Create a new task
router.post('/', createTask);

// GET /api/tasks - Get all tasks with optional query params (completed, priority, tag)
router.get('/', getAllTasks);

// GET /api/tasks/:id - Get a specific task by ID
router.get('/:id', getTaskById);

// PUT /api/tasks/:id - Update a task
router.put('/:id', updateTask);

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', deleteTask);

module.exports = router;
