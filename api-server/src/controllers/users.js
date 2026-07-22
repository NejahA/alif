import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import * as userStore from '../data/users.js';

function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Name is required and must be a non-empty string' });
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email is required' });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const existing = userStore.findByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = userStore.create({ name: name.trim(), email: email.trim(), password: hashedPassword });

  const token = jwt.sign({ userId: user.id }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

  res.status(201).json({
    data: {
      user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
      token,
    },
  });
}

function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = userStore.findByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign({ userId: user.id }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

  res.json({
    data: {
      user: { id: user.id, name: user.name, email: user.email },
      token,
    },
  });
}

function getProfile(req, res) {
  const user = userStore.findById(req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    data: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
  });
}

function updateProfile(req, res) {
  const { name } = req.body;

  if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
    return res.status(400).json({ error: 'Name must be a non-empty string' });
  }

  const updates = {};
  if (name !== undefined) updates.name = name.trim();

  const user = userStore.update(req.userId, updates);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    data: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
  });
}

export { register, login, getProfile, updateProfile };