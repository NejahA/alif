const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  wikipediaId: {
    type: String,
    required: [true, 'Wikipedia ID is required'],
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Article title is required'],
    trim: true,
    index: true
  },
  originalTitle: {
    type: String,
    required: [true, 'Original title is required']
  },
  language: {
    type: String,
    required: [true, 'Language is required'],
    default: 'en',
    index: true
  },
  content: {
    type: String,
    default: ''
  },
  summary: {
    type: String,
    maxlength: [500, 'Summary cannot exceed 500 characters']
  },
  url: {
    type: String,
    required: [true, 'URL is required']
  },
  thumbnail: {
    type: String,
    default: null
  },
  categories: [{
    type: String,
    index: true
  }],
  pageViews: {
    type: Number,
    default: 0
  },
  wordCount: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    required: true
  },
  availableLanguages: [{
    language: String,
    title: String,
    url: String
  }],
  metadata: {
    authors: [String],
    references: [String],
    images: [String],
    sections: [String]
  },
  savedByUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  readByUsers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    readingTime: Number // in minutes
  }],
  popularityScore: {
    type: Number,
    default: 0,
    index: true
  },
  trendingScore: {
    type: Number,
    default: 0,
    index: true
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total saves
articleSchema.virtual('totalSaves').get(function() {
  return this.savedByUsers.length;
});

// Virtual for total reads
articleSchema.virtual('totalReads').get(function() {
  return this.readByUsers.length;
});

// Virtual for average reading time
articleSchema.virtual('averageReadingTime').get(function() {
  if (this.readByUsers.length === 0) return 0;
  const totalTime = this.readByUsers.reduce((sum, record) => sum + (record.readingTime || 0), 0);
  return Math.round(totalTime / this.readByUsers.length);
});

// Static method to find popular articles
articleSchema.statics.findPopular = function(limit = 10) {
  return this.find()
    .sort({ popularityScore: -1, pageViews: -1 })
    .limit(limit);
};

// Static method to find trending articles
articleSchema.statics.findTrending = function(limit = 10) {
  return this.find()
    .sort({ trendingScore: -1, pageViews: -1 })
    .limit(limit);
};

// Static method to find articles by language
articleSchema.statics.findByLanguage = function(language, limit = 20) {
  return this.find({ language })
    .sort({ popularityScore: -1 })
    .limit(limit);
};

// Update popularity score
articleSchema.methods.updatePopularityScore = function() {
  this.popularityScore = 
    (this.pageViews * 0.5) + 
    (this.totalSaves * 2) + 
    (this.totalReads * 1.5) +
    (this.wordCount * 0.001);
  
  return this.save();
};

// Indexes
articleSchema.index({ title: 'text', summary: 'text' });
articleSchema.index({ language: 1, popularityScore: -1 });
articleSchema.index({ categories: 1, popularityScore: -1 });
articleSchema.index({ createdAt: -1 });
articleSchema.index({ trendingScore: -1 });

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;