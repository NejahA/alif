import mongoose from 'mongoose';

const toasterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  timePeriod: {
    type: String,
    enum: ['prehistoric', 'medieval', 'renaissance', 'industrial', 'modern', 'futuristic'],
    required: true,
  },
  coordinates: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    z: { type: Number, default: 0 },
  },
  energyRequired: {
    type: Number,
    default: 10,
    min: 1,
    max: 100,
  },
  toastYield: {
    type: Number,
    default: 1,
    min: 1,
    max: 100,
  },
  specialEffect: {
    type: String,
    enum: ['double_toast', 'energy_boost', 'time_warp', 'ancient_wisdom', 'futuristic_tech', 'none'],
    default: 'none',
  },
  discoveryPoints: {
    type: Number,
    default: 10,
  },
  discoveredBy: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    discoveredAt: { type: Date, default: Date.now },
    energyUsed: Number,
    toastsCollected: Number,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  coolDownTime: {
    type: Number,
    default: 300, // 5 minutes in seconds
  },
  lastUsed: Date,
}, {
  timestamps: true,
});

// Index for geospatial queries
toasterSchema.index({ coordinates: '2dsphere' });
toasterSchema.index({ timePeriod: 1 });
toasterSchema.index({ isActive: 1 });

// Static method to find nearby toasters
toasterSchema.statics.findNearby = function(coordinates, maxDistance = 1000) {
  return this.find({
    coordinates: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [coordinates.x, coordinates.y],
        },
        $maxDistance: maxDistance,
      },
    },
    isActive: true,
  });
};

// Method to use toaster
toasterSchema.methods.useToaster = async function(userId, energyUsed) {
  if (this.lastUsed && Date.now() - this.lastUsed.getTime() < this.coolDownTime * 1000) {
    throw new Error(`Toaster is on cooldown. Try again in ${Math.ceil((this.lastUsed.getTime() + this.coolDownTime * 1000 - Date.now()) / 1000)} seconds`);
  }
  
  this.lastUsed = new Date();
  
  const discovery = {
    userId,
    discoveredAt: new Date(),
    energyUsed,
    toastsCollected: this.toastYield,
  };
  
  this.discoveredBy.push(discovery);
  
  await this.save();
  return {
    toastsCollected: this.toastYield,
    specialEffect: this.specialEffect,
    discoveryPoints: this.discoveryPoints,
  };
};

const Toaster = mongoose.model('Toaster', toasterSchema);
export default Toaster;