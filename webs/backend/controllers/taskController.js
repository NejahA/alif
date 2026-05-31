const Task = require('../models/Task');

// Create a new task
const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, tags } = req.body;

    // Validate title
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        error: {
          message: 'Title is required and cannot be empty',
          code: 'INVALID_TITLE'
        }
      });
    }

    const task = new Task({
      title: title.trim(),
      description,
      priority,
      dueDate,
      tags
    });

    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(500).json({
      error: {
        message: 'Failed to create task',
        code: 'CREATE_FAILED',
        details: error.message
      }
    });
  }
};

// Get all tasks with optional filters
const getAllTasks = async (req, res) => {
  try {
    const { completed, priority, tag } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (completed !== undefined) {
      filter.completed = completed === 'true';
    }
    
    if (priority) {
      filter.priority = priority;
    }
    
    if (tag) {
      filter.tags = tag;
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({
      error: {
        message: 'Failed to fetch tasks',
        code: 'FETCH_FAILED',
        details: error.message
      }
    });
  }
};

// Get a single task by ID
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await Task.findById(id);
    
    if (!task) {
      return res.status(404).json({
        error: {
          message: 'Task not found',
          code: 'NOT_FOUND'
        }
      });
    }
    
    res.status(200).json(task);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: {
          message: 'Invalid task ID',
          code: 'INVALID_ID'
        }
      });
    }
    
    res.status(500).json({
      error: {
        message: 'Failed to fetch task',
        code: 'FETCH_FAILED',
        details: error.message
      }
    });
  }
};

// Update a task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, dueDate, tags, completed } = req.body;
    
    // Validate title if provided
    if (title !== undefined && (!title || title.trim().length === 0)) {
      return res.status(400).json({
        error: {
          message: 'Title cannot be empty',
          code: 'INVALID_TITLE'
        }
      });
    }
    
    // Build update object
    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (tags !== undefined) updateData.tags = tags;
    if (completed !== undefined) updateData.completed = completed;
    
    const task = await Task.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!task) {
      return res.status(404).json({
        error: {
          message: 'Task not found',
          code: 'NOT_FOUND'
        }
      });
    }
    
    res.status(200).json(task);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: {
          message: 'Invalid task ID',
          code: 'INVALID_ID'
        }
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error.message
        }
      });
    }
    
    res.status(500).json({
      error: {
        message: 'Failed to update task',
        code: 'UPDATE_FAILED',
        details: error.message
      }
    });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await Task.findByIdAndDelete(id);
    
    if (!task) {
      return res.status(404).json({
        error: {
          message: 'Task not found',
          code: 'NOT_FOUND'
        }
      });
    }
    
    res.status(200).json({
      message: 'Task deleted successfully',
      task
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: {
          message: 'Invalid task ID',
          code: 'INVALID_ID'
        }
      });
    }
    
    res.status(500).json({
      error: {
        message: 'Failed to delete task',
        code: 'DELETE_FAILED',
        details: error.message
      }
    });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask
};
