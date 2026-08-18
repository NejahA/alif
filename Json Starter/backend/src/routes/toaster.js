import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { checkEnergyMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Toasters
 *   description: Toaster discovery and interaction
 */

/**
 * @swagger
 * /api/toasters:
 *   get:
 *     tags: [Toasters]
 *     summary: Get all toasters
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Toasters retrieved successfully
 */
router.get('/', authMiddleware, (req, res) => {
  res.json({
    toasters: [
      {
        id: 1,
        name: 'Ancient Prehistoric Toaster',
        description: 'A primitive toaster from the dawn of time',
        period: 'prehistoric',
        energyRequired: 10,
        toastYield: 3,
        discovered: true,
      },
      {
        id: 2,
        name: 'Medieval Castle Toaster',
        description: 'A royal toaster from the age of knights',
        period: 'medieval',
        energyRequired: 15,
        toastYield: 5,
        discovered: false,
      },
      {
        id: 3,
        name: 'Renaissance Art Toaster',
        description: 'A beautiful toaster from the age of art',
        period: 'renaissance',
        energyRequired: 20,
        toastYield: 8,
        discovered: false,
      },
    ],
    total: 100,
    discovered: 1,
  });
});

/**
 * @swagger
 * /api/toasters/{id}/toast:
 *   post:
 *     tags: [Toasters]
 *     summary: Toast bread using a specific toaster
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Toast successful
 *       400:
 *         description: Insufficient energy or toaster not found
 */
router.post('/:id/toast', authMiddleware, checkEnergyMiddleware(10), (req, res) => {
  const { id } = req.params;
  
  res.json({
    success: true,
    message: 'Bread toasted successfully!',
    toasterId: id,
    energyUsed: 10,
    toastsCollected: 5,
    specialEffect: 'golden_crust',
    achievement: {
      name: 'First Toast',
      description: 'You made your first piece of toast!',
      points: 10,
    },
  });
});

export default router;
