const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const Item = require('../models/Item.model');
const User = require('../models/User.model');

// Analytics endpoints
router.get('/analytics/overview', adminAuth, async (req, res) => {
  try {
    const [totalItems, totalUsers, itemsByCategory, recentActivity] = await Promise.all([
      Item.countDocuments(),
      User.countDocuments(),
      Item.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' }
          }
        },
        { $sort: { count: -1 } }
      ]),
      Item.find().sort({ createdAt: -1 }).limit(5)
    ]);

    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const itemsLastWeek = await Item.countDocuments({
      createdAt: { $gte: lastWeek }
    });

    res.json({
      overview: {
        totalItems,
        totalUsers,
        itemsLastWeek,
        averageQuantity: await Item.aggregate([
          { $group: { _id: null, avg: { $avg: '$quantity' } } }
        ]).then(result => result[0]?.avg || 0)
      },
      itemsByCategory,
      recentActivity: recentActivity.map(item => ({
        name: item.name,
        quantity: item.quantity,
        date: item.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk operations
router.post('/items/bulk', auth, async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array is required' });
    }

    if (items.length > 100) {
      return res.status(400).json({ error: 'Maximum 100 items per bulk operation' });
    }

    const createdItems = await Item.insertMany(
      items.map(item => ({
        ...item,
        createdBy: req.user._id
      }))
    );

    res.status(201).json({
      message: `${createdItems.length} items created successfully`,
      items: createdItems
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/items/bulk', auth, async (req, res) => {
  try {
    const { itemIds } = req.body;
    
    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({ error: 'Item IDs array is required' });
    }

    const result = await Item.deleteMany({ _id: { $in: itemIds } });

    res.json({
      message: `${result.deletedCount} items deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export items to CSV
router.get('/items/export', auth, async (req, res) => {
  try {
    const items = await Item.find().populate('createdBy', 'username email');

    const csvData = items.map(item => ({
      ID: item._id,
      Name: item.name,
      Description: item.description || '',
      Quantity: item.quantity,
      Category: item.category || 'Uncategorized',
      'Created By': item.createdBy?.username || 'Unknown',
      'Created At': item.createdAt.toISOString()
    }));

    res.json({
      data: csvData,
      total: csvData.length,
      exportedAt: new Date().toISOString(),
      format: 'CSV'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search with advanced filters
router.get('/items/search/advanced', auth, async (req, res) => {
  try {
    const { 
      query, 
      minQuantity, 
      maxQuantity, 
      category, 
      startDate, 
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    let searchQuery = {};

    // Text search
    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }

    // Quantity range
    if (minQuantity || maxQuantity) {
      searchQuery.quantity = {};
      if (minQuantity) searchQuery.quantity.$gte = parseInt(minQuantity);
      if (maxQuantity) searchQuery.quantity.$lte = parseInt(maxQuantity);
    }

    // Category filter
    if (category) {
      searchQuery.category = category;
    }

    // Date range
    if (startDate || endDate) {
      searchQuery.createdAt = {};
      if (startDate) searchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) searchQuery.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [items, total] = await Promise.all([
      Item.find(searchQuery)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('createdBy', 'username email'),
      Item.countDocuments(searchQuery)
    ]);

    // Get aggregations for filters
    const categories = await Item.distinct('category');
    const quantityStats = await Item.aggregate([
      {
        $group: {
          _id: null,
          min: { $min: '$quantity' },
          max: { $max: '$quantity' },
          avg: { $avg: '$quantity' }
        }
      }
    ]);

    res.json({
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      filters: {
        categories,
        quantityStats: quantityStats[0] || { min: 0, max: 0, avg: 0 },
        dateRange: {
          start: startDate || null,
          end: endDate || null
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard statistics
router.get('/dashboard/stats', adminAuth, async (req, res) => {
  try {
    const [ 
      totalItems,
      totalUsers,
      lowStockItems,
      recentUsers,
      monthlyGrowth
    ] = await Promise.all([
      Item.countDocuments(),
      User.countDocuments(),
      Item.countDocuments({ quantity: { $lt: 10 } }),
      User.find().sort({ createdAt: -1 }).limit(5),
      Item.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 6 }
      ])
    ]);

    res.json({
      stats: {
        totalItems,
        totalUsers,
        lowStockItems,
        lowStockPercentage: totalItems > 0 ? (lowStockItems / totalItems * 100).toFixed(2) : 0
      },
      recentUsers: recentUsers.map(user => ({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        joined: user.createdAt
      })),
      monthlyGrowth
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import items from JSON
router.post('/items/import', adminAuth, async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items array is required' });
    }

    const validItems = items.filter(item => 
      item.name && 
      typeof item.quantity === 'number' && 
      item.quantity >= 0
    );

    const createdItems = await Item.insertMany(
      validItems.map(item => ({
        ...item,
        createdBy: req.user._id
      }))
    );

    res.status(201).json({
      message: `Imported ${createdItems.length} items successfully`,
      imported: createdItems.length,
      failed: items.length - createdItems.length,
      items: createdItems
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;