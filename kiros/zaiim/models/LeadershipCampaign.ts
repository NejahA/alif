import mongoose from 'mongoose';

const LeadershipCampaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  campaignType: {
    type: String,
    enum: ['election', 'policy_initiative', 'reform', 'grassroots', 'legislative'],
    default: 'election',
  },
  region: {
    type: String,
    required: true,
  },
  politicians: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Politician',
  }],
  publicSupport: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  targetSupport: {
    type: Number,
    default: 50,
    min: 0,
    max: 100,
  },
  keyIssues: [{
    type: String,
  }],
  status: {
    type: String,
    enum: ['planning', 'active', 'completed', 'stalled'],
    default: 'planning',
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

LeadershipCampaignSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.LeadershipCampaign || mongoose.model('LeadershipCampaign', LeadershipCampaignSchema);