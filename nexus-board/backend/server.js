const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://nejahachref:96176065@cluster0.ajw0g.mongodb.net/href?retryWrites=true&w=majority&appName=nextus';

mongoose.connect(MONGO_URI)
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Define schemas and models
const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  priority: { type: String, enum: ['low', 'medium', 'high'] },
  status: { type: String, enum: ['todo', 'inprogress', 'done'] },
  labels: [String],
  assigneeId: String,
  dueDate: Date,
  estimatedHours: Number,
  actualHours: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  avatar: String,
  points: { type: Number, default: 0 }
});

const commentSchema = new mongoose.Schema({
  taskId: mongoose.Schema.Types.ObjectId,
  userId: mongoose.Schema.Types.ObjectId,
  content: String,
  createdAt: { type: Date, default: Date.now }
});

const integrationSchema = new mongoose.Schema({
  name: String,
  description: String,
  icon: String,
  connected: { type: Boolean, default: false },
  apiKey: String,
  webhookUrl: String
});

const workflowSchema = new mongoose.Schema({
  name: String,
  description: String,
  trigger: String,
  actions: [String],
  steps: [Object],
  enabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const blockchainVerificationSchema = new mongoose.Schema({
  taskId: mongoose.Schema.Types.ObjectId,
  hash: String,
  block: Number,
  timestamp: Date,
  verified: { type: Boolean, default: false },
  transactions: Number,
  gasUsed: String
});

// Create models
const Task = mongoose.model('Task', taskSchema);
const User = mongoose.model('User', userSchema);
const Comment = mongoose.model('Comment', commentSchema);
const Integration = mongoose.model('Integration', integrationSchema);
const Workflow = mongoose.model('Workflow', workflowSchema);
const BlockchainVerification = mongoose.model('BlockchainVerification', blockchainVerificationSchema);

// API Routes

// Tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Comments
app.get('/api/comments', async (req, res) => {
  try {
    const { taskId } = req.query;
    const query = taskId ? { taskId } : {};
    const comments = await Comment.find(query).populate('userId', 'name avatar').sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/comments', async (req, res) => {
  try {
    const comment = new Comment(req.body);
    await comment.save();
    const populatedComment = await Comment.findById(comment._id).populate('userId', 'name avatar');
    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/comments/:id', async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Integrations
app.get('/api/integrations', async (req, res) => {
  try {
    const integrations = await Integration.find();
    res.json(integrations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/integrations/:id', async (req, res) => {
  try {
    const integration = await Integration.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(integration);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Workflows
app.get('/api/workflows', async (req, res) => {
  try {
    const workflows = await Workflow.find().sort({ createdAt: -1 });
    res.json(workflows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/workflows', async (req, res) => {
  try {
    const workflow = new Workflow(req.body);
    await workflow.save();
    res.status(201).json(workflow);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Blockchain Verifications
app.get('/api/blockchain-verifications', async (req, res) => {
  try {
    const verifications = await BlockchainVerification.find().populate('taskId', 'title');
    res.json(verifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/blockchain-verifications', async (req, res) => {
  try {
    const verification = new BlockchainVerification(req.body);
    await verification.save();
    const populatedVerification = await BlockchainVerification.findById(verification._id).populate('taskId', 'title');
    res.status(201).json(populatedVerification);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Seed initial data
app.post('/api/seed', async (req, res) => {
  try {
    // Clear existing data
    await Task.deleteMany({});
    await User.deleteMany({});
    await Comment.deleteMany({});
    await Integration.deleteMany({});
    await Workflow.deleteMany({});
    await BlockchainVerification.deleteMany({});

    // Create initial users
    const users = await User.insertMany([
      {
        name: 'Alex Johnson',
        email: 'alex@nextus.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        points: 420
      },
      {
        name: 'Sam Wilson',
        email: 'sam@nextus.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam',
        points: 320
      },
      {
        name: 'Jordan Lee',
        email: 'jordan@nextus.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
        points: 280
      }
    ]);

    // Create initial tasks
    const tasks = await Task.insertMany([
      {
        title: 'Design System',
        description: 'Create a cohesive dark theme with glassmorphism effects.',
        priority: 'high',
        status: 'done',
        labels: ['design', 'feature'],
        assigneeId: users[0]._id,
        estimatedHours: 8,
        actualHours: 10
      },
      {
        title: 'Task Components',
        description: 'Build draggable TaskCards and interactive Columns.',
        priority: 'medium',
        status: 'inprogress',
        labels: ['feature', 'enhancement'],
        assigneeId: users[1]._id,
        estimatedHours: 6,
        actualHours: 4
      },
      {
        title: 'State Management',
        description: 'Implement add, move, and delete functionality.',
        priority: 'high',
        status: 'todo',
        labels: ['feature'],
        assigneeId: users[2]._id,
        estimatedHours: 12,
        actualHours: 0
      }
    ]);

    // Create initial comments
    const comments = await Comment.insertMany([
      {
        taskId: tasks[0]._id,
        userId: users[0]._id,
        content: 'Great work on the design system!'
      },
      {
        taskId: tasks[1]._id,
        userId: users[0]._id,
        content: 'Need to add drag and drop functionality'
      }
    ]);

    // Create initial integrations
    const integrations = await Integration.insertMany([
      {
        name: 'Slack',
        description: 'Get notifications and updates in Slack channels',
        icon: '💬',
        connected: true,
        apiKey: '••••••••••••••••',
        webhookUrl: 'https://hooks.slack.com/services/...'
      },
      {
        name: 'GitHub',
        description: 'Sync issues and pull requests with tasks',
        icon: '🐙',
        connected: true,
        apiKey: '••••••••••••••••',
        webhookUrl: 'https://api.github.com/webhooks/...'
      },
      {
        name: 'Google Calendar',
        description: 'Sync task due dates with calendar events',
        icon: '📅',
        connected: true,
        apiKey: '••••••••••••••••',
        webhookUrl: 'https://calendar.google.com/calendar/...'
      },
      {
        name: 'Jira',
        description: 'Import/export tasks from Jira projects',
        icon: '🎯',
        connected: false
      },
      {
        name: 'Notion',
        description: 'Sync tasks with Notion databases',
        icon: '📝',
        connected: false
      }
    ]);

    // Create initial workflows
    const workflows = await Workflow.insertMany([
      {
        name: 'Review Workflow',
        description: 'Automatically assign tasks for review when marked complete',
        trigger: 'task_completed',
        actions: ['assign_task', 'send_notification'],
        steps: [
          { type: 'trigger', name: 'Task Completed', description: 'When a task is marked as done' },
          { type: 'action', name: 'Assign Task', description: 'Automatically assign the task' },
          { type: 'action', name: 'Send Notification', description: 'Send a notification to team members' }
        ],
        enabled: true
      },
      {
        name: 'Escalation Workflow',
        description: 'Escalate overdue tasks to managers',
        trigger: 'due_date_approaching',
        actions: ['update_priority', 'send_notification', 'assign_task'],
        steps: [
          { type: 'trigger', name: 'Due Date Approaching', description: 'When a task due date is near' },
          { type: 'action', name: 'Update Priority', description: 'Change task priority' },
          { type: 'action', name: 'Send Notification', description: 'Send a notification to team members' },
          { type: 'action', name: 'Assign Task', description: 'Automatically assign the task' }
        ],
        enabled: true
      }
    ]);

    // Create initial blockchain verifications
    const blockchainVerifications = await BlockchainVerification.insertMany([
      {
        taskId: tasks[0]._id,
        hash: '0x4a8f5c...b3d2e1',
        block: 1245678,
        timestamp: new Date('2024-01-15T14:30:22Z'),
        verified: true,
        transactions: 3,
        gasUsed: '0.0021 ETH'
      },
      {
        taskId: tasks[1]._id,
        hash: '0x9b2c4d...f7a8e9',
        block: 1245679,
        timestamp: new Date('2024-01-15T14:25:15Z'),
        verified: true,
        transactions: 2,
        gasUsed: '0.0018 ETH'
      }
    ]);

    res.json({
      message: 'Database seeded successfully',
      counts: {
        users: users.length,
        tasks: tasks.length,
        comments: comments.length,
        integrations: integrations.length,
        workflows: workflows.length,
        blockchainVerifications: blockchainVerifications.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});