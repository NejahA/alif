import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500,
    default: ''
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  password: {
    type: String,
    default: null
  },
  maxParticipants: {
    type: Number,
    min: 1,
    max: 50,
    default: 10
  },
  language: {
    type: String,
    default: 'javascript',
    enum: [
      'javascript', 'typescript', 'python', 'java', 'cpp', 'csharp',
      'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'html',
      'css', 'json', 'markdown', 'sql', 'yaml', 'dockerfile'
    ]
  },
  initialCode: {
    type: String,
    default: '// Welcome to CodeCollab!\n// Start coding with your team...'
  },
  settings: {
    allowAnonymous: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    readOnly: {
      type: Boolean,
      default: false
    },
    autoSave: {
      type: Boolean,
      default: true
    },
    aiAssistant: {
      type: Boolean,
      default: true
    },
    chatEnabled: {
      type: Boolean,
      default: true
    },
    versionControl: {
      type: Boolean,
      default: true
    }
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    socketId: String,
    username: String,
    color: String,
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastActive: Date,
    role: {
      type: String,
      enum: ['owner', 'admin', 'editor', 'viewer'],
      default: 'editor'
    }
  }],
  activeParticipants: {
    type: Number,
    default: 0
  },
  messages: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String,
    message: String,
    type: {
      type: String,
      enum: ['message', 'system', 'ai'],
      default: 'message'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  aiSessions: [{
    prompt: String,
    response: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  codeHistory: [{
    version: Number,
    code: String,
    changes: mongoose.Schema.Types.Mixed,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  currentVersion: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate slug from name
roomSchema.pre('save', function(next) {
  if (!this.isModified('name')) return next();
  
  this.slug = this.name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  next();
});

// Update lastActivity when participants change
roomSchema.pre('save', function(next) {
  if (this.isModified('participants') || this.isModified('messages')) {
    this.lastActivity = Date.now();
  }
  next();
});

// Update activeParticipants count
roomSchema.virtual('activeParticipantsCount').get(function() {
  return this.participants.filter(p => p.lastActive > Date.now() - 5 * 60 * 1000).length;
});

// Indexes
roomSchema.index({ slug: 1 }, { unique: true });
roomSchema.index({ owner: 1 });
roomSchema.index({ isPublic: 1 });
roomSchema.index({ language: 1 });
roomSchema.index({ tags: 1 });
roomSchema.index({ lastActivity: -1 });
roomSchema.index({ createdAt: -1 });
roomSchema.index({ 'participants.user': 1 });

// Method to check if user can join
roomSchema.methods.canJoin = function(userId, password) {
  if (!this.isActive) return { canJoin: false, reason: 'Room is inactive' };
  
  if (this.activeParticipants >= this.maxParticipants) {
    return { canJoin: false, reason: 'Room is full' };
  }
  
  if (!this.isPublic && this.password && this.password !== password) {
    return { canJoin: false, reason: 'Incorrect password' };
  }
  
  if (this.settings.requireApproval) {
    const isParticipant = this.participants.some(p => p.user.toString() === userId);
    if (!isParticipant) {
      return { canJoin: false, reason: 'Approval required' };
    }
  }
  
  return { canJoin: true };
};

// Method to add participant
roomSchema.methods.addParticipant = function(user, socketId, role = 'editor') {
  const existingIndex = this.participants.findIndex(
    p => p.user && p.user.toString() === user._id.toString()
  );
  
  if (existingIndex >= 0) {
    this.participants[existingIndex].socketId = socketId;
    this.participants[existingIndex].lastActive = Date.now();
  } else {
    this.participants.push({
      user: user._id,
      socketId,
      username: user.username,
      color: this.generateColor(),
      joinedAt: Date.now(),
      lastActive: Date.now(),
      role
    });
  }
  
  this.activeParticipants = this.activeParticipantsCount;
  return this.participants[this.participants.length - 1];
};

// Method to remove participant
roomSchema.methods.removeParticipant = function(socketId) {
  const index = this.participants.findIndex(p => p.socketId === socketId);
  if (index >= 0) {
    this.participants.splice(index, 1);
    this.activeParticipants = this.activeParticipantsCount;
  }
};

// Method to add message
roomSchema.methods.addMessage = function(userId, message, type = 'message') {
  const user = this.participants.find(p => p.user.toString() === userId);
  if (!user) return null;
  
  const messageObj = {
    user: userId,
    username: user.username,
    message,
    type,
    timestamp: Date.now()
  };
  
  this.messages.push(messageObj);
  this.lastActivity = Date.now();
  
  return messageObj;
};

// Method to add AI session
roomSchema.methods.addAISession = function(userId, prompt, response) {
  const session = {
    prompt,
    response,
    timestamp: Date.now(),
    user: userId
  };
  
  this.aiSessions.push(session);
  this.lastActivity = Date.now();
  
  return session;
};

// Method to save code version
roomSchema.methods.saveCodeVersion = function(userId, code, changes) {
  this.currentVersion += 1;
  
  const version = {
    version: this.currentVersion,
    code,
    changes,
    user: userId,
    timestamp: Date.now()
  };
  
  this.codeHistory.push(version);
  
  // Keep only last 100 versions
  if (this.codeHistory.length > 100) {
    this.codeHistory.shift();
  }
  
  return version;
};

// Helper method to generate color
roomSchema.methods.generateColor = function() {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9FF3'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const Room = mongoose.model('Room', roomSchema);

export default Room;