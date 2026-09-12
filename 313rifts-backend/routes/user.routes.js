const express = require('express');
const router = express.Router();
const User = require('../models/User.model');
const { authMiddleware } = require('../middleware/validation');

// Get user reading history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    res.json({
      history: user.readingHistory,
      total: user.readingHistory.length,
      stats: user.readingStats
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ 
      message: 'Failed to get reading history', 
      error: error.message 
    });
  }
});

// Add to reading history
router.post('/history', authMiddleware, async (req, res) => {
  try {
    const { articleTitle, articleId, language, url } = req.body;
    
    if (!articleTitle || !articleId) {
      return res.status(400).json({ 
        message: 'Article title and ID are required' 
      });
    }

    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    // Check if article already in history (update timestamp if exists)
    const existingIndex = user.readingHistory.findIndex(
      item => item.articleId === articleId && item.language === language
    );

    if (existingIndex !== -1) {
      user.readingHistory[existingIndex].timestamp = new Date();
    } else {
      // Add new history item (keep only last 100 items)
      user.readingHistory.unshift({
        articleTitle,
        articleId,
        language: language || 'en',
        timestamp: new Date(),
        url: url || `https://${language || 'en'}.wikipedia.org/wiki/${encodeURIComponent(articleTitle)}`
      });
      
      if (user.readingHistory.length > 100) {
        user.readingHistory = user.readingHistory.slice(0, 100);
      }

      // Update reading stats
      user.readingStats.totalArticlesRead += 1;
      
      // Update favorite language
      const languageCounts = {};
      user.readingHistory.forEach(item => {
        languageCounts[item.language] = (languageCounts[item.language] || 0) + 1;
      });
      
      let favoriteLanguage = 'en';
      let maxCount = 0;
      Object.entries(languageCounts).forEach(([lang, count]) => {
        if (count > maxCount) {
          maxCount = count;
          favoriteLanguage = lang;
        }
      });
      
      user.readingStats.favoriteLanguage = favoriteLanguage;
    }

    await user.save();

    res.json({
      message: 'History updated',
      history: user.readingHistory.slice(0, 10), // Return recent 10
      stats: user.readingStats
    });
  } catch (error) {
    console.error('Add to history error:', error);
    res.status(500).json({ 
      message: 'Failed to update history', 
      error: error.message 
    });
  }
});

// Clear reading history
router.delete('/history', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    user.readingHistory = [];
    user.readingStats.totalArticlesRead = 0;
    user.readingStats.totalReadingTime = 0;
    
    await user.save();

    res.json({
      message: 'Reading history cleared',
      history: [],
      stats: user.readingStats
    });
  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({ 
      message: 'Failed to clear history', 
      error: error.message 
    });
  }
});

// Get user favorite articles
router.get('/favorites', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    res.json({
      favorites: user.favoriteArticles,
      total: user.favoriteArticles.length
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ 
      message: 'Failed to get favorites', 
      error: error.message 
    });
  }
});

// Add article to favorites
router.post('/favorites', authMiddleware, async (req, res) => {
  try {
    const { articleTitle, articleId, language } = req.body;
    
    if (!articleTitle || !articleId) {
      return res.status(400).json({ 
        message: 'Article title and ID are required' 
      });
    }

    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    // Check if already in favorites
    const alreadyFavorite = user.favoriteArticles.some(
      fav => fav.articleId === articleId && fav.language === language
    );

    if (alreadyFavorite) {
      return res.status(400).json({ 
        message: 'Article already in favorites' 
      });
    }

    // Add to favorites
    user.favoriteArticles.push({
      articleTitle,
      articleId,
      language: language || 'en',
      savedAt: new Date()
    });

    await user.save();

    res.json({
      message: 'Article added to favorites',
      favorites: user.favoriteArticles
    });
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({ 
      message: 'Failed to add to favorites', 
      error: error.message 
    });
  }
});

// Remove article from favorites
router.delete('/favorites/:articleId', authMiddleware, async (req, res) => {
  try {
    const { articleId } = req.params;
    const { language } = req.query;

    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    const initialLength = user.favoriteArticles.length;
    
    user.favoriteArticles = user.favoriteArticles.filter(fav => 
      !(fav.articleId === articleId && (!language || fav.language === language))
    );

    if (user.favoriteArticles.length === initialLength) {
      return res.status(404).json({ 
        message: 'Article not found in favorites' 
      });
    }

    await user.save();

    res.json({
      message: 'Article removed from favorites',
      favorites: user.favoriteArticles
    });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({ 
      message: 'Failed to remove from favorites', 
      error: error.message 
    });
  }
});

// Get user statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    // Calculate additional stats
    const languages = {};
    user.readingHistory.forEach(item => {
      languages[item.language] = (languages[item.language] || 0) + 1;
    });

    const languageStats = Object.entries(languages)
      .map(([language, count]) => ({ language, count }))
      .sort((a, b) => b.count - a.count);

    res.json({
      readingStats: user.readingStats,
      readingProgress: user.readingProgress,
      languageStats,
      totalHistory: user.readingHistory.length,
      totalFavorites: user.favoriteArticles.length,
      accountAge: Math.floor((new Date() - user.createdAt) / (1000 * 60 * 60 * 24)) // days
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      message: 'Failed to get statistics', 
      error: error.message 
    });
  }
});

// Update reading time
router.put('/reading-time', authMiddleware, async (req, res) => {
  try {
    const { minutes } = req.body;
    
    if (!minutes || minutes <= 0) {
      return res.status(400).json({ 
        message: 'Valid reading time is required' 
      });
    }

    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    user.readingStats.totalReadingTime += minutes;
    await user.save();

    res.json({
      message: 'Reading time updated',
      readingStats: user.readingStats
    });
  } catch (error) {
    console.error('Update reading time error:', error);
    res.status(500).json({ 
      message: 'Failed to update reading time', 
      error: error.message 
    });
  }
});

// Export router
module.exports = router;