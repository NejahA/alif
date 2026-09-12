const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Article = require('../models/Article.model');
const User = require('../models/User.model');
const { authMiddleware } = require('../middleware/validation');

// Get popular articles
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10, language } = req.query;
    
    let query = {};
    if (language) {
      query.language = language;
    }

    const articles = await Article.find(query)
      .sort({ popularityScore: -1, pageViews: -1 })
      .limit(parseInt(limit));

    res.json({
      articles: articles.map(article => ({
        id: article._id,
        wikipediaId: article.wikipediaId,
        title: article.title,
        language: article.language,
        summary: article.summary,
        thumbnail: article.thumbnail,
        url: article.url,
        pageViews: article.pageViews,
        totalSaves: article.totalSaves,
        totalReads: article.totalReads,
        popularityScore: article.popularityScore,
        lastUpdated: article.lastUpdated
      })),
      total: articles.length
    });
  } catch (error) {
    console.error('Get popular articles error:', error);
    res.status(500).json({ 
      message: 'Failed to get popular articles', 
      error: error.message 
    });
  }
});

// Get trending articles
router.get('/trending', async (req, res) => {
  try {
    const { limit = 10, language } = req.query;
    
    let query = {};
    if (language) {
      query.language = language;
    }

    // Trending articles are those with recent activity
    const articles = await Article.find(query)
      .sort({ trendingScore: -1, pageViews: -1 })
      .limit(parseInt(limit));

    res.json({
      articles: articles.map(article => ({
        id: article._id,
        wikipediaId: article.wikipediaId,
        title: article.title,
        language: article.language,
        summary: article.summary,
        thumbnail: article.thumbnail,
        url: article.url,
        pageViews: article.pageViews,
        totalSaves: article.totalSaves,
        totalReads: article.totalReads,
        trendingScore: article.trendingScore,
        lastUpdated: article.lastUpdated,
        createdAt: article.createdAt
      })),
      total: articles.length
    });
  } catch (error) {
    console.error('Get trending articles error:', error);
    res.status(500).json({ 
      message: 'Failed to get trending articles', 
      error: error.message 
    });
  }
});

// Search articles
router.get('/search', async (req, res) => {
  try {
    const { query, language, limit = 20 } = req.query;
    
    if (!query) {
      return res.status(400).json({ 
        message: 'Search query is required' 
      });
    }

    const searchOptions = {
      $text: { $search: query }
    };

    if (language) {
      searchOptions.language = language;
    }

    const articles = await Article.find(searchOptions)
      .sort({ score: { $meta: 'textScore' }, popularityScore: -1 })
      .limit(parseInt(limit));

    // If no articles found in database, return search suggestions
    if (articles.length === 0) {
      return res.json({
        message: 'No articles found in database. You can search Wikipedia directly.',
        articles: [],
        searchSuggestions: [
          { title: query, description: 'Search Wikipedia for this term' }
        ]
      });
    }

    res.json({
      articles: articles.map(article => ({
        id: article._id,
        wikipediaId: article.wikipediaId,
        title: article.title,
        originalTitle: article.originalTitle,
        language: article.language,
        summary: article.summary,
        thumbnail: article.thumbnail,
        url: article.url,
        wordCount: article.wordCount,
        pageViews: article.pageViews,
        totalSaves: article.totalSaves,
        totalReads: article.totalReads,
        averageReadingTime: article.averageReadingTime,
        lastUpdated: article.lastUpdated,
        availableLanguages: article.availableLanguages
      })),
      total: articles.length
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      message: 'Search failed', 
      error: error.message 
    });
  }
});

// Get article by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next();
    }
    
    const article = await Article.findById(id);
    
    if (!article) {
      return res.status(404).json({ 
        message: 'Article not found' 
      });
    }

    // Increment page views
    article.pageViews += 1;
    await article.updatePopularityScore();

    res.json({
      article: {
        id: article._id,
        wikipediaId: article.wikipediaId,
        title: article.title,
        originalTitle: article.originalTitle,
        language: article.language,
        content: article.content,
        summary: article.summary,
        thumbnail: article.thumbnail,
        url: article.url,
        categories: article.categories,
        wordCount: article.wordCount,
        pageViews: article.pageViews,
        totalSaves: article.totalSaves,
        totalReads: article.totalReads,
        averageReadingTime: article.averageReadingTime,
        lastUpdated: article.lastUpdated,
        availableLanguages: article.availableLanguages,
        metadata: article.metadata,
        createdAt: article.createdAt
      }
    });
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({ 
      message: 'Failed to get article', 
      error: error.message 
    });
  }
});

// Get article by Wikipedia ID
router.get('/wikipedia/:wikipediaId', async (req, res) => {
  try {
    const { wikipediaId } = req.params;
    
    const article = await Article.findOne({ wikipediaId });
    
    if (!article) {
      return res.status(404).json({ 
        message: 'Article not found in database' 
      });
    }

    // Increment page views
    article.pageViews += 1;
    await article.updatePopularityScore();

    res.json({
      article: {
        id: article._id,
        wikipediaId: article.wikipediaId,
        title: article.title,
        originalTitle: article.originalTitle,
        language: article.language,
        content: article.content,
        summary: article.summary,
        thumbnail: article.thumbnail,
        url: article.url,
        categories: article.categories,
        wordCount: article.wordCount,
        pageViews: article.pageViews,
        totalSaves: article.totalSaves,
        totalReads: article.totalReads,
        averageReadingTime: article.averageReadingTime,
        lastUpdated: article.lastUpdated,
        availableLanguages: article.availableLanguages,
        metadata: article.metadata
      }
    });
  } catch (error) {
    console.error('Get article by Wikipedia ID error:', error);
    res.status(500).json({ 
      message: 'Failed to get article', 
      error: error.message 
    });
  }
});

// Record article read (authenticated)
router.post('/:id/read', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { readingTime } = req.body;
    
    const article = await Article.findById(id);
    
    if (!article) {
      return res.status(404).json({ 
        message: 'Article not found' 
      });
    }

    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    // Check if user already read this article (update timestamp)
    const existingIndex = article.readByUsers.findIndex(
      record => record.userId.toString() === req.userId
    );

    if (existingIndex !== -1) {
      article.readByUsers[existingIndex].timestamp = new Date();
      article.readByUsers[existingIndex].readingTime = readingTime || 0;
    } else {
      article.readByUsers.push({
        userId: req.userId,
        timestamp: new Date(),
        readingTime: readingTime || 0
      });
    }

    // Update article popularity
    await article.updatePopularityScore();
    
    // Update user's reading stats
    if (readingTime) {
      user.readingStats.totalReadingTime += readingTime;
    }
    await user.save();

    res.json({
      message: 'Reading recorded',
      article: {
        id: article._id,
        title: article.title,
        totalReads: article.totalReads,
        averageReadingTime: article.averageReadingTime
      },
      userStats: user.readingStats
    });
  } catch (error) {
    console.error('Record read error:', error);
    res.status(500).json({ 
      message: 'Failed to record reading', 
      error: error.message 
    });
  }
});

// Get popular articles
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10, language } = req.query;
    
    let query = {};
    if (language) {
      query.language = language;
    }

    const articles = await Article.find(query)
      .sort({ popularityScore: -1, pageViews: -1 })
      .limit(parseInt(limit));

    res.json({
      articles: articles.map(article => ({
        id: article._id,
        wikipediaId: article.wikipediaId,
        title: article.title,
        language: article.language,
        summary: article.summary,
        thumbnail: article.thumbnail,
        url: article.url,
        pageViews: article.pageViews,
        totalSaves: article.totalSaves,
        totalReads: article.totalReads,
        popularityScore: article.popularityScore,
        lastUpdated: article.lastUpdated
      })),
      total: articles.length
    });
  } catch (error) {
    console.error('Get popular articles error:', error);
    res.status(500).json({ 
      message: 'Failed to get popular articles', 
      error: error.message 
    });
  }
});

// Get trending articles
router.get('/trending', async (req, res) => {
  try {
    const { limit = 10, language } = req.query;
    
    let query = {};
    if (language) {
      query.language = language;
    }

    // Trending articles are those with recent activity
    const articles = await Article.find(query)
      .sort({ trendingScore: -1, pageViews: -1 })
      .limit(parseInt(limit));

    res.json({
      articles: articles.map(article => ({
        id: article._id,
        wikipediaId: article.wikipediaId,
        title: article.title,
        language: article.language,
        summary: article.summary,
        thumbnail: article.thumbnail,
        url: article.url,
        pageViews: article.pageViews,
        totalSaves: article.totalSaves,
        totalReads: article.totalReads,
        trendingScore: article.trendingScore,
        lastUpdated: article.lastUpdated,
        createdAt: article.createdAt
      })),
      total: articles.length
    });
  } catch (error) {
    console.error('Get trending articles error:', error);
    res.status(500).json({ 
      message: 'Failed to get trending articles', 
      error: error.message 
    });
  }
});

// Get articles by language
router.get('/language/:language', async (req, res) => {
  try {
    const { language } = req.params;
    const { limit = 20, sort = 'popularity' } = req.query;
    
    let sortOptions = {};
    switch (sort) {
      case 'popularity':
        sortOptions = { popularityScore: -1 };
        break;
      case 'trending':
        sortOptions = { trendingScore: -1 };
        break;
      case 'recent':
        sortOptions = { createdAt: -1 };
        break;
      case 'views':
        sortOptions = { pageViews: -1 };
        break;
      default:
        sortOptions = { popularityScore: -1 };
    }

    const articles = await Article.find({ language })
      .sort(sortOptions)
      .limit(parseInt(limit));

    res.json({
      language,
      articles: articles.map(article => ({
        id: article._id,
        wikipediaId: article.wikipediaId,
        title: article.title,
        summary: article.summary,
        thumbnail: article.thumbnail,
        url: article.url,
        pageViews: article.pageViews,
        totalSaves: article.totalSaves,
        totalReads: article.totalReads,
        wordCount: article.wordCount,
        lastUpdated: article.lastUpdated
      })),
      total: articles.length
    });
  } catch (error) {
    console.error('Get articles by language error:', error);
    res.status(500).json({ 
      message: 'Failed to get articles by language', 
      error: error.message 
    });
  }
});

// Save article (authenticated)
router.post('/:id/save', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const article = await Article.findById(id);
    
    if (!article) {
      return res.status(404).json({ 
        message: 'Article not found' 
      });
    }

    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    // Check if article already saved by user
    const alreadySaved = article.savedByUsers.some(
      userId => userId.toString() === req.userId
    );

    if (alreadySaved) {
      return res.status(400).json({ 
        message: 'Article already saved' 
      });
    }

    // Add user to savedByUsers
    article.savedByUsers.push(req.userId);
    
    // Update article popularity
    await article.updatePopularityScore();
    
    // Add to user's favorites
    user.favoriteArticles.push({
      articleTitle: article.title,
      articleId: article.wikipediaId,
      language: article.language,
      savedAt: new Date()
    });

    await Promise.all([article.save(), user.save()]);

    res.json({
      message: 'Article saved successfully',
      article: {
        id: article._id,
        title: article.title,
        totalSaves: article.totalSaves
      }
    });
  } catch (error) {
    console.error('Save article error:', error);
    res.status(500).json({ 
      message: 'Failed to save article', 
      error: error.message 
    });
  }
});

// Unsaved article (authenticated)
router.delete('/:id/save', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const article = await Article.findById(id);
    
    if (!article) {
      return res.status(404).json({ 
        message: 'Article not found' 
      });
    }

    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    // Check if article is saved by user
    const savedIndex = article.savedByUsers.findIndex(
      userId => userId.toString() === req.userId
    );

    if (savedIndex === -1) {
      return res.status(400).json({ 
        message: 'Article not saved by user' 
      });
    }

    // Remove user from savedByUsers
    article.savedByUsers.splice(savedIndex, 1);
    
    // Update article popularity
    await article.updatePopularityScore();
    
    // Remove from user's favorites
    user.favoriteArticles = user.favoriteArticles.filter(
      fav => !(fav.articleId === article.wikipediaId && fav.language === article.language)
    );

    await Promise.all([article.save(), user.save()]);

    res.json({
      message: 'Article unsaved successfully',
      article: {
        id: article._id,
        title: article.title,
        totalSaves: article.totalSaves
      }
    });
  } catch (error) {
    console.error('Unsaved article error:', error);
    res.status(500).json({ 
      message: 'Failed to unsaved article', 
      error: error.message 
    });
  }
});

// Get article statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    
    const article = await Article.findById(id);
    
    if (!article) {
      return res.status(404).json({ 
        message: 'Article not found' 
      });
    }

    // Get reader demographics
    const readers = await User.find({
      _id: { $in: article.readByUsers.map(r => r.userId) }
    }).select('username createdAt');

    res.json({
      article: {
        id: article._id,
        title: article.title,
        language: article.language
      },
      statistics: {
        pageViews: article.pageViews,
        totalSaves: article.totalSaves,
        totalReads: article.totalReads,
        averageReadingTime: article.averageReadingTime,
        wordCount: article.wordCount,
        popularityScore: article.popularityScore,
        trendingScore: article.trendingScore
      },
      demographics: {
        totalReaders: readers.length,
        readerSample: readers.slice(0, 10).map(r => ({
          username: r.username,
          memberSince: r.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Get article stats error:', error);
    res.status(500).json({ 
      message: 'Failed to get article statistics', 
      error: error.message 
    });
  }
});

// Sync/Upsert article from frontend Wikipedia fetch
router.post('/sync', async (req, res) => {
  try {
    const { title, pageid, language = 'en', summary, content, url, categories, thumbnail } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const wikipediaId = pageid ? String(pageid) : String(title.toLowerCase().replace(/\s+/g, '-'));
    
    let article = await Article.findOne({ wikipediaId });
    
    if (!article) {
      article = new Article({
        wikipediaId,
        title,
        originalTitle: title,
        language,
        summary: summary || (content ? content.replace(/<[^>]*>/g, '').slice(0, 300) + '...' : title),
        content: content || '',
        url: url || `https://${language}.wikipedia.org/wiki/${encodeURIComponent(title)}`,
        thumbnail: thumbnail || null,
        categories: categories || [],
        wordCount: content ? content.split(/\s+/).length : 0,
        pageViews: 1,
        popularityScore: 10,
        trendingScore: 10,
        lastUpdated: new Date()
      });
    } else {
      article.pageViews += 1;
      article.popularityScore += 1;
      article.trendingScore += 1;
    }

    await article.save();
    res.json({ message: 'Article synced successfully', article });
  } catch (error) {
    console.error('Sync article error:', error);
    res.status(500).json({ message: 'Failed to sync article', error: error.message });
  }
});

module.exports = router;