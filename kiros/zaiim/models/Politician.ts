import mongoose from 'mongoose';

const PoliticianSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  position: {
    type: String,
    required: true,
  },
  party: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  approvalRating: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 50,
  },
  status: {
    type: String,
    enum: ['active', 'retired', 'investigation'],
    default: 'active',
  },
  ideology: {
    type: String,
    enum: ['progressive', 'moderate', 'conservative', 'liberal', 'nationalist'],
    default: 'moderate',
  },
  lastPublicAppearance: {
    type: Date,
    default: null,
  },
  yearsInOffice: {
    type: Number,
    required: true,
    min: 0,
  },
  keyPolicies: [{
    type: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

PoliticianSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Politician || mongoose.model('Politician', PoliticianSchema);