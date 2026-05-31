require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Contact = require('./Contact');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected successfully');
    seedDatabaseIfNeeded();
  })
  .catch(err => console.error('MongoDB connection error:', err));

async function seedDatabaseIfNeeded() {
  const count = await Contact.countDocuments();
  if (count === 0) {
    console.log('Seeding initial mock data...');
    const MOCK_CONTACTS = [
      { name: "Elena Rodriguez", role: "VP of Engineering", company: "Nexus Technologies", avatar: "https://ui-avatars.com/api/?name=Elena+Rodriguez&background=2563eb&color=fff", department: "Engineering", email: "elena@example.com", profileUrl: "#" },
      { name: "Marcus Chen", role: "Chief Design Officer", company: "Aura Creative", avatar: "https://ui-avatars.com/api/?name=Marcus+Chen&background=8b5cf6&color=fff", department: "Design", email: "marcus@example.com", profileUrl: "#" },
      { name: "Sarah Jenkins", role: "Product Lead", company: "Innovate Inc.", avatar: "https://ui-avatars.com/api/?name=Sarah+Jenkins&background=10b981&color=fff", department: "Product", email: "sarah@example.com", profileUrl: "#" },
      { name: "David Kim", role: "Senior AI Researcher", company: "Deep Learning Labs", avatar: "https://ui-avatars.com/api/?name=David+Kim&background=f59e0b&color=fff", department: "Engineering", email: "david@example.com", profileUrl: "#" },
      { name: "Aisha Patel", role: "Head of UX", company: "Global Systems", avatar: "https://ui-avatars.com/api/?name=Aisha+Patel&background=ec4899&color=fff", department: "Design", email: "aisha@example.com", profileUrl: "#" },
      { name: "Thomas Wright", role: "Director of Product", company: "Fintech Solutions", avatar: "https://ui-avatars.com/api/?name=Thomas+Wright&background=6366f1&color=fff", department: "Product", email: "thomas@example.com", profileUrl: "#" }
    ];
    await Contact.insertMany(MOCK_CONTACTS);
    console.log('Database seeded.');
  }
}

// API Endpoints
app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/contacts', async (req, res) => {
  try {
    let newContact = req.body;
    // fallback avatar if not provided
    if (!newContact.avatar) {
      newContact.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(newContact.name || 'New User')}&background=random&color=fff`;
    }
    const contact = new Contact(newContact);
    const savedContact = await contact.save();
    res.status(201).json(savedContact);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
