const express = require('express');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch products.' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const products = await Product.find();
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const inventoryValue = products.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0);
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    const lowStockCount = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 5).length;
    const outOfStockCount = products.filter(p => (p.stock || 0) <= 0).length;

    res.json({
      totalProducts,
      totalStock,
      inventoryValue: Number(inventoryValue.toFixed(2)),
      categoriesCount: categories.length,
      categories,
      lowStockCount,
      outOfStockCount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Unable to calculate statistics.' });
  }
});

router.post('/seed', async (req, res) => {
  try {
    const demoProducts = [
      {
        name: 'Ergonomic Mesh Chair',
        category: 'Furniture',
        price: 249.99,
        stock: 18,
        description: 'Breathable high-back desk chair with lumbar support and adjustable 3D armrests.',
      },
      {
        name: 'Solid Oak Standing Desk',
        category: 'Furniture',
        price: 599.0,
        stock: 7,
        description: 'Electric dual-motor height-adjustable desk with integrated cable management.',
      },
      {
        name: 'Studio Wireless Headphones',
        category: 'Electronics',
        price: 189.5,
        stock: 35,
        description: 'Active noise-canceling over-ear headphones with 40-hour battery life and spatial audio.',
      },
      {
        name: 'Ultra-Wide 34" Curved Monitor',
        category: 'Electronics',
        price: 479.0,
        stock: 12,
        description: 'WQHD 144Hz IPS display with USB-C 90W power delivery and color calibration.',
      },
      {
        name: 'Mechanical Keyboard Pro',
        category: 'Accessories',
        price: 129.0,
        stock: 4,
        description: 'Hot-swappable tactile switches with anodized aluminum frame and PBT keycaps.',
      },
      {
        name: 'Precision Aluminum Desk Lamp',
        category: 'Lighting',
        price: 79.99,
        stock: 22,
        description: 'Dimmable color temperature LED light with ambient light auto-sensor.',
      },
    ];

    await Product.insertMany(demoProducts);
    const all = await Product.find().sort({ createdAt: -1 });
    res.status(201).json({ message: 'Demo products loaded successfully!', products: all });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to seed products.' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    if (!name || !description || !category || price === undefined || stock === undefined) {
      return res.status(400).json({ message: 'All product fields are required.' });
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to create product.' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to update product.' });
  }
});

router.patch('/:id/stock', async (req, res) => {
  try {
    const { delta } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    const newStock = Math.max(0, (product.stock || 0) + Number(delta || 0));
    product.stock = newStock;
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to update stock.' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to delete product.' });
  }
});

module.exports = router;
