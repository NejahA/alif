import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'time-lord'],
    default: 'user',
  },
  energy: {
    type: Number,
    default: 1500,
    min: 0,
    max: 1500,
  },
  toastsCollected: {
    type: Number,
    default: 0,
  },
  timePeriodsVisited: [{
    period: {
      type: String,
      enum: ['prehistoric', 'medieval', 'renaissance', 'industrial', 'modern', 'futuristic'],
    },
    visits: {
      type: Number,
      default: 0,
    },
    lastVisit: Date,
  }],
  inventory: [{
    item: String,
    quantity: Number,
    rarity: {
      type: String,
      enum: ['Common', 'Rare', 'Epic', 'Legendary'],
      default: 'Common',
    },
    obtainedFrom: String,
    obtainedAt: Date,
  }],
  upgrades: {
    type: [{
      name: String,
      level: Number,
      purchasedAt: Date,
    }],
    default: [
      { name: 'Capacitor Expansion', level: 1, purchasedAt: new Date() },
      { name: 'Efficient Scanner', level: 1, purchasedAt: new Date() }
    ]
  },
  achievements: [{
    name: String,
    description: String,
    unlockedAt: Date,
    points: Number,
  }],
  lastQuantumSpin: Date,
  claimedQuests: [{
    type: String
  }],
  bankBalance: {
    type: Number,
    default: 0,
  },
  lastInterestClaim: Date,
  bossHp: {
    type: Number,
    default: 1000,
  },
  bossMaxHp: {
    type: Number,
    default: 1000,
  },
  bossName: {
    type: String,
    default: 'Chrono-Dragon',
  },
  overclockUntil: Date,
  equippedGear: [{
    slot: String,
    item: String,
    rarity: String
  }],
  faction: String,
  hasHarvester: {
    type: Boolean,
    default: false,
  },
  activeBuffs: [{
    type: { type: String },
    expiresAt: Date
  }],
  prestigeLevel: {
    type: Number,
    default: 0,
  },
  prestigeMultiplier: {
    type: Number,
    default: 1,
  },
  familiars: [{
    name: String,
    passiveEffect: String,
    unlockedAt: Date
  }],
  lastTimeTravel: Date,
  refreshToken: String,
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to add toast
userSchema.methods.addToast = function(amount = 1) {
  this.toastsCollected = Math.min(this.toastsCollected + amount, 1000);
  return this.save();
};

// Method to use energy
userSchema.methods.useEnergy = function(amount) {
  if (this.energy < amount) {
    throw new Error('Not enough energy');
  }
  this.energy -= amount;
  return this.save();
};

// Method to regenerate energy
userSchema.methods.regenerateEnergy = function(amount) {
  this.energy = Math.min(this.energy + amount, 1000);
  return this.save();
};

// Method to visit time period
userSchema.methods.visitTimePeriod = function(period) {
  const existingPeriod = this.timePeriodsVisited.find(p => p.period === period);
  
  if (existingPeriod) {
    existingPeriod.visits += 1;
    existingPeriod.lastVisit = new Date();
  } else {
    this.timePeriodsVisited.push({
      period,
      visits: 1,
      lastVisit: new Date(),
    });
  }
  
  return this.save();
};

const User = mongoose.model('User', userSchema);
export default User;