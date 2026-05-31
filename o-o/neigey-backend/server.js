const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('Missing MONGO_URI environment variable');
  process.exit(1);
}

// --- Models ---
const NoteSchema = new mongoose.Schema({
  text: String,
  createdAt: { type: Date, default: Date.now }
});
const Note = mongoose.model('Note', NoteSchema);

const TaskSchema = new mongoose.Schema({
  text: String,
  status: { type: String, enum: ['todo', 'progress', 'done'], default: 'todo' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  timeSpent: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
const Task = mongoose.model('Task', TaskSchema);

const SnippetSchema = new mongoose.Schema({
  name: String,
  code: String,
  createdAt: { type: Date, default: Date.now }
});
const Snippet = mongoose.model('Snippet', SnippetSchema);

const PortfolioSchema = new mongoose.Schema({
  name: String,
  role: String,
  skills: [String],
  projects: [{ title: String, description: String, link: String }],
  updatedAt: { type: Date, default: Date.now }
});
const Portfolio = mongoose.model('Portfolio', PortfolioSchema);

// --- Routes ---

// Portfolio
app.get('/api/portfolio', async (req, res) => {
  let p = await Portfolio.findOne();
  if (!p) {
    p = await new Portfolio({
      name: "Nejah Achref",
      role: "Lead Ecosystem Architect",
      skills: ["React", "Flutter", "MongoDB", "Node.js", "Cyber_Security"],
      projects: [
        { title: "Neigey OS", description: "Dual-platform developer dashboard", link: "#" },
        { title: "CyberEdge", description: "Network security probe tool", link: "#" }
      ]
    }).save();
  }
  res.json(p);
});
app.put('/api/portfolio', async (req, res) => res.json(await Portfolio.findOneAndUpdate({}, req.body, { new: true, upsert: true })));

// Notes
app.get('/api/notes', async (req, res) => res.json(await Note.find().sort({ createdAt: -1 })));
app.post('/api/notes', async (req, res) => res.json(await new Note(req.body).save()));
app.delete('/api/notes/:id', async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.json({ message: 'Note deleted' });
});

// Tasks
app.get('/api/tasks', async (req, res) => res.json(await Task.find().sort({ createdAt: -1 })));
app.post('/api/tasks', async (req, res) => res.json(await new Task(req.body).save()));
app.put('/api/tasks/:id', async (req, res) => res.json(await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })));
app.delete('/api/tasks/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: 'Task deleted' });
});

// Snippets
app.get('/api/snippets', async (req, res) => res.json(await Snippet.find().sort({ createdAt: -1 })));
app.post('/api/snippets', async (req, res) => res.json(await new Snippet(req.body).save()));
app.delete('/api/snippets/:id', async (req, res) => {
  await Snippet.findByIdAndDelete(req.params.id);
  res.json({ message: 'Snippet deleted' });
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB: Neigey-Ecosystem');
    app.listen(PORT, () => console.log(`Neigey Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
