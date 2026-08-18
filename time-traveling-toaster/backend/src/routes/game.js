import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Game
 *   description: Game mechanics and time travel
 */

/**
 * @swagger
 * /api/game/stats:
 *   get:
 *     tags: [Game]
 *     summary: Get game statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Game stats retrieved successfully
 */
router.get('/stats', authMiddleware, (req, res) => {
  res.json({
    game: {
      name: 'Time Traveling Toaster',
      version: '2.0.0',
      features: [
        'JWT Authentication',
        'Time Travel Mechanics',
        'Toaster Discovery',
        'Energy System',
        'Real-time Updates',
        'Multi-period Exploration',
      ],
      timePeriods: ['prehistoric', 'medieval', 'renaissance', 'industrial', 'modern', 'futuristic'],
      totalToasters: 100,
      activePlayers: 1,
    },
  });
});

/**
 * @swagger
 * /api/game/time-travel:
 *   post:
 *     tags: [Game]
 *     summary: Travel to a different time period
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetPeriod
 *             properties:
 *               targetPeriod:
 *                 type: string
 *                 enum: [prehistoric, medieval, renaissance, industrial, modern, futuristic]
 *     responses:
 *       200:
 *         description: Time travel successful
 *       400:
 *         description: Invalid time period or insufficient energy
 */
router.post('/time-travel', authMiddleware, async (req, res) => {
  try {
    const { targetPeriod } = req.body;
    const user = req.user;
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isOverclocked = user.overclockUntil && new Date() < new Date(user.overclockUntil);
    const travelCost = isOverclocked ? 12 : 25;

    if (user.energy < travelCost) {
      return res.status(400).json({ message: `Not enough energy. Requires ${travelCost} ⚡. Recharge required!` });
    }

    // Simulate time travel delay for frontend loading UI
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update user state
    await user.useEnergy(travelCost);
    await user.visitTimePeriod(targetPeriod);
    
    // Check for Time Lord achievement
    if (user.timePeriodsVisited.length >= 6 && !user.achievements.some(a => a.name === 'Time Lord')) {
      user.achievements.push({
        name: 'Time Lord',
        description: 'Visited all 6 historical eras',
        unlockedAt: new Date(),
        points: 100
      });
      await user.save();
    }

    res.json({
      success: true,
      message: `Traveled to ${targetPeriod} era! ${isOverclocked ? '(⚡ Overclock Discount Applied!)' : ''}`,
      period: targetPeriod,
      energyCost: travelCost,
      remainingEnergy: user.energy,
      user: {
        energy: user.energy,
        toastsCollected: user.toastsCollected,
        timePeriodsVisited: user.timePeriodsVisited,
        achievements: user.achievements
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error traveling through time', error: error.message });
  }
});

/**
 * @swagger
 * /api/game/discover:
 *   post:
 *     tags: [Game]
 *     summary: Discover a toaster
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Toaster discovered successfully
 */
router.post('/discover', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check for "Efficient Scanner" upgrade
    const hasEfficientScanner = user.upgrades.some(u => u.name === 'Efficient Scanner');
    const scanCost = hasEfficientScanner ? 10 : 15;

    if (user.energy < scanCost) {
      return res.status(400).json({ message: `Not enough energy to scan. Requires ${scanCost} ⚡. Recharge required!` });
    }

    // Simulate scanning delay for frontend loading UI
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate a random toaster based on their last visited era (or modern if none)
    const lastVisited = user.timePeriodsVisited.sort((a, b) => b.lastVisit - a.lastVisit)[0]?.period || 'modern';
    
    // Compute Rarity (Overclock doubles legendary & epic chances)
    const isOverclocked = user.overclockUntil && new Date() < new Date(user.overclockUntil);
    const rand = Math.random();
    let rarity = 'Common';
    let rarityMultiplier = 1;
    
    const legendaryThreshold = isOverclocked ? 0.85 : 0.95;
    const epicThreshold = isOverclocked ? 0.65 : 0.85;

    if (rand > legendaryThreshold) {
      rarity = 'Legendary';
      rarityMultiplier = 10;
    } else if (rand > epicThreshold) {
      rarity = 'Epic';
      rarityMultiplier = 5;
    } else if (rand > 0.40) {
      rarity = 'Rare';
      rarityMultiplier = 2;
    }
    
    const toasterNames = ['Rusted', 'Golden', 'Quantum', 'Steam-Powered', 'Clockwork', 'Neon', 'Holographic'];
    const randomName = toasterNames[Math.floor(Math.random() * toasterNames.length)];
    const toasterItem = `${randomName} ${lastVisited.charAt(0).toUpperCase() + lastVisited.slice(1)} Toaster`;
    
    const baseYield = Math.floor(Math.random() * 10) + 5; // 5 to 14
    const toastYield = baseYield * rarityMultiplier;

    // Update user state
    await user.useEnergy(scanCost);
    await user.addToast(toastYield);
    
    // Add to inventory
    const existingItem = user.inventory.find(i => i.item === toasterItem && i.rarity === rarity);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.inventory.push({
        item: toasterItem,
        quantity: 1,
        rarity,
        obtainedFrom: lastVisited,
        obtainedAt: new Date()
      });
    }
    
    await user.save();

    res.json({
      success: true,
      message: `Discovered a ${toasterItem}!`,
      toaster: {
        name: toasterItem,
        period: lastVisited,
      },
      rewards: {
        toasts: toastYield,
        energy: -scanCost,
      },
      user: {
        energy: user.energy,
        toastsCollected: user.toastsCollected,
        inventory: user.inventory
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error scanning area', error: error.message });
  }
});

/**
 * @swagger
 * /api/game/recharge:
 *   post:
 *     tags: [Game]
 *     summary: Recharge energy by consuming toasts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Energy recharged successfully
 */
router.post('/recharge', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.toastsCollected < 5) {
      return res.status(400).json({ message: 'Not enough toasts. You need 5 toasts to recharge.' });
    }
    
    // Check for "Capacitor Expansion" upgrade
    const hasCapacitor = user.upgrades.some(u => u.name === 'Capacitor Expansion');
    const maxEnergy = hasCapacitor ? 1500 : 1000;

    if (user.energy >= maxEnergy) {
      return res.status(400).json({ message: `Energy is already full (${maxEnergy} ⚡)!` });
    }

    // Consume 5 toasts for 25 energy
    user.toastsCollected -= 5;
    user.energy = Math.min(user.energy + 25, maxEnergy);
    await user.save();

    res.json({
      success: true,
      message: 'Consumed 5 toasts to recharge 25 energy!',
      user: {
        energy: user.energy,
        toastsCollected: user.toastsCollected
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error recharging energy', error: error.message });
  }
});

/**
 * @swagger
 * /api/game/upgrade:
 *   post:
 *     tags: [Game]
 *     summary: Purchase an upgrade
 *     security:
 *       - bearerAuth: []
 */
router.post('/upgrade', authMiddleware, async (req, res) => {
  try {
    const { upgradeId } = req.body;
    const user = req.user;
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    const upgradesCatalog = {
      'capacitor': { name: 'Capacitor Expansion', cost: 200 },
      'scanner': { name: 'Efficient Scanner', cost: 300 }
    };

    const upgrade = upgradesCatalog[upgradeId];
    if (!upgrade) return res.status(400).json({ message: 'Unknown upgrade' });

    if (user.upgrades.some(u => u.name === upgrade.name)) {
      return res.status(400).json({ message: 'Upgrade already purchased' });
    }

    if (user.toastsCollected < upgrade.cost) {
      return res.status(400).json({ message: `Not enough toasts. Requires ${upgrade.cost} 🍞` });
    }

    user.toastsCollected -= upgrade.cost;
    user.upgrades.push({
      name: upgrade.name,
      level: 1,
      purchasedAt: new Date()
    });
    
    // If buying capacitor, top off their energy
    if (upgradeId === 'capacitor') {
      user.energy = 1500;
    }

    await user.save();

    res.json({
      success: true,
      message: `Purchased ${upgrade.name}!`,
      user: {
        energy: user.energy,
        toastsCollected: user.toastsCollected,
        upgrades: user.upgrades
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error purchasing upgrade', error: error.message });
  }
});

/**
 * @swagger
 * /api/game/leaderboard:
 *   get:
 *     tags: [Game]
 *     summary: Get top players by toasts collected
 *     security:
 *       - bearerAuth: []
 */
router.get('/leaderboard', authMiddleware, async (req, res) => {
  try {
    const leaders = await User.find({ toastsCollected: { $gt: 0 } })
      .sort({ toastsCollected: -1 })
      .limit(10)
      .select('username toastsCollected timePeriodsVisited upgrades');
    
    res.json({
      success: true,
      leaderboard: leaders
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leaderboard', error: error.message });
  }
});

/**
 * @swagger
 * /api/game/quantum-spin:
 *   post:
 *     tags: [Game]
 *     summary: Spin the daily quantum wheel
 *     security:
 *       - bearerAuth: []
 */
router.post('/quantum-spin', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    
    // Check 24 hour cooldown
    const now = new Date();
    if (user.lastQuantumSpin) {
      const hoursSinceLast = (now.getTime() - new Date(user.lastQuantumSpin).getTime()) / (1000 * 60 * 60);
      if (hoursSinceLast < 24) {
        const hoursRemaining = Math.ceil(24 - hoursSinceLast);
        return res.status(400).json({ message: `Wheel is recharging! Cooldown: ${hoursRemaining} hours remaining.` });
      }
    }

    // Determine random prize
    const prizes = [
      { type: 'toasts', name: '50 Bonus Toasts', reward: 50 },
      { type: 'toasts', name: '100 Mega Toasts', reward: 100 },
      { type: 'energy', name: '500 Quantum Energy', reward: 500 },
      { type: 'toaster', name: 'Legendary Chrono Toaster', rarity: 'Legendary' },
      { type: 'toasts', name: '25 Small Toast Batch', reward: 25 },
    ];
    
    const win = prizes[Math.floor(Math.random() * prizes.length)];
    
    user.lastQuantumSpin = now;
    
    if (win.type === 'toasts') {
      user.toastsCollected = (user.toastsCollected || 0) + win.reward;
    } else if (win.type === 'energy') {
      user.energy = Math.min(1500, (user.energy || 0) + win.reward);
    } else if (win.type === 'toaster') {
      const existing = user.inventory.find(i => i.item === win.name && i.rarity === 'Legendary');
      if (existing) {
        existing.quantity += 1;
      } else {
        user.inventory.push({
          item: win.name,
          quantity: 1,
          rarity: 'Legendary',
          obtainedFrom: 'Quantum Wheel',
          obtainedAt: now
        });
      }
    }
    
    await user.save();

    res.json({
      success: true,
      message: `You won: ${win.name}!`,
      prize: win,
      user: {
        energy: user.energy,
        toastsCollected: user.toastsCollected,
        inventory: user.inventory,
        lastQuantumSpin: user.lastQuantumSpin
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error spinning quantum wheel', error: error.message });
  }
});

/**
 * @swagger
 * /api/game/fuse:
 *   post:
 *     tags: [Game]
 *     summary: Fuse 3 duplicate toasters to get a higher rarity toaster
 *     security:
 *       - bearerAuth: []
 */
router.post('/fuse', authMiddleware, async (req, res) => {
  try {
    const { item, rarity } = req.body;
    const user = req.user;

    const nextRarityMap = {
      'Common': 'Rare',
      'Rare': 'Epic',
      'Epic': 'Legendary'
    };

    const targetRarity = nextRarityMap[rarity];
    if (!targetRarity) {
      return res.status(400).json({ message: 'Legendary toasters cannot be fused further!' });
    }

    const invItem = user.inventory.find(i => i.item === item && i.rarity === rarity);
    if (!invItem || invItem.quantity < 3) {
      return res.status(400).json({ message: `Requires at least 3 ${rarity} ${item} to fuse!` });
    }

    // Deduct 3
    invItem.quantity -= 3;
    if (invItem.quantity <= 0) {
      user.inventory = user.inventory.filter(i => !(i.item === item && i.rarity === rarity));
    }

    // Add 1 upgraded toaster
    const fusedName = item.replace(/(Common|Rare|Epic)/, targetRarity);
    const existingTarget = user.inventory.find(i => i.item === fusedName && i.rarity === targetRarity);
    
    if (existingTarget) {
      existingTarget.quantity += 1;
    } else {
      user.inventory.push({
        item: fusedName,
        quantity: 1,
        rarity: targetRarity,
        obtainedFrom: 'Fusion Lab',
        obtainedAt: new Date()
      });
    }

    await user.save();

    res.json({
      success: true,
      message: `Successfully fused into 1 ${targetRarity} ${fusedName}!`,
      user: {
        inventory: user.inventory
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fusing toasters', error: error.message });
  }
});

/**
 * @swagger
 * /api/game/quests:
 *   get:
 *     tags: [Game]
 *     summary: Get active daily quests and user progress
 *     security:
 *       - bearerAuth: []
 */
router.get('/quests', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const claimed = user.claimedQuests || [];

    const quests = [
      {
        id: 'quest_prehistoric',
        title: 'Prehistoric Explorer 🦕',
        description: 'Visit the Prehistoric Era',
        rewardType: 'toasts',
        rewardAmount: 50,
        completed: (user.timePeriodsVisited || []).some(p => p.period === 'prehistoric'),
        claimed: claimed.includes('quest_prehistoric')
      },
      {
        id: 'quest_collector',
        title: 'Master Collector 🏆',
        description: 'Possess a Rare, Epic, or Legendary Toaster',
        rewardType: 'toasts',
        rewardAmount: 100,
        completed: (user.inventory || []).some(i => ['Rare', 'Epic', 'Legendary'].includes(i.rarity)),
        claimed: claimed.includes('quest_collector')
      },
      {
        id: 'quest_timelord',
        title: 'Multiverse Traveler 🌌',
        description: 'Visit at least 3 different historical eras',
        rewardType: 'energy',
        rewardAmount: 300,
        completed: (user.timePeriodsVisited || []).length >= 3,
        claimed: claimed.includes('quest_timelord')
      }
    ];

    res.json({ success: true, quests });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quests', error: error.message });
  }
});

/**
 * @swagger
 * /api/game/claim-quest:
 *   post:
 *     tags: [Game]
 *     summary: Claim quest reward
 *     security:
 *       - bearerAuth: []
 */
router.post('/claim-quest', authMiddleware, async (req, res) => {
  try {
    const { questId } = req.body;
    const user = req.user;

    if ((user.claimedQuests || []).includes(questId)) {
      return res.status(400).json({ message: 'Quest reward already claimed!' });
    }

    const questMap = {
      'quest_prehistoric': { rewardType: 'toasts', rewardAmount: 50 },
      'quest_collector': { rewardType: 'toasts', rewardAmount: 100 },
      'quest_timelord': { rewardType: 'energy', rewardAmount: 300 }
    };

    const q = questMap[questId];
    if (!q) return res.status(400).json({ message: 'Invalid quest' });

    user.claimedQuests = user.claimedQuests || [];
    user.claimedQuests.push(questId);

    if (q.rewardType === 'toasts') {
      user.toastsCollected = (user.toastsCollected || 0) + q.rewardAmount;
    } else if (q.rewardType === 'energy') {
      user.energy = Math.min(1500, (user.energy || 0) + q.rewardAmount);
    }

    await user.save();

    res.json({
      success: true,
      message: `Claimed quest reward!`,
      user: {
        energy: user.energy,
        toastsCollected: user.toastsCollected,
        claimedQuests: user.claimedQuests
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error claiming quest', error: error.message });
  }
});

/**
 * @swagger
 * /api/game/bank/deposit:
 *   post:
 *     tags: [Game]
 *     summary: Deposit toasts into Quantum Vault
 *     security:
 *       - bearerAuth: []
 */
router.post('/bank/deposit', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;
    const user = req.user;
    const depositAmt = parseInt(amount, 10);

    if (isNaN(depositAmt) || depositAmt <= 0) {
      return res.status(400).json({ message: 'Invalid deposit amount' });
    }

    if ((user.toastsCollected || 0) < depositAmt) {
      return res.status(400).json({ message: 'Not enough toasts to deposit' });
    }

    user.toastsCollected -= depositAmt;
    user.bankBalance = (user.bankBalance || 0) + depositAmt;
    if (!user.lastInterestClaim) user.lastInterestClaim = new Date();

    await user.save();

    res.json({
      success: true,
      message: `Deposited ${depositAmt} 🍞 into Quantum Vault!`,
      user: {
        toastsCollected: user.toastsCollected,
        bankBalance: user.bankBalance,
        lastInterestClaim: user.lastInterestClaim
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error depositing toasts', error: error.message });
  }
});

/**
 * @swagger
 * /api/game/bank/withdraw:
 *   post:
 *     tags: [Game]
 *     summary: Withdraw toasts from Quantum Vault
 *     security:
 *       - bearerAuth: []
 */
router.post('/bank/withdraw', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;
    const user = req.user;
    const withdrawAmt = parseInt(amount, 10);

    if (isNaN(withdrawAmt) || withdrawAmt <= 0) {
      return res.status(400).json({ message: 'Invalid withdrawal amount' });
    }

    if ((user.bankBalance || 0) < withdrawAmt) {
      return res.status(400).json({ message: 'Not enough toasts in bank balance' });
    }

    user.bankBalance -= withdrawAmt;
    user.toastsCollected = (user.toastsCollected || 0) + withdrawAmt;

    await user.save();

    res.json({
      success: true,
      message: `Withdrew ${withdrawAmt} 🍞 from Quantum Vault!`,
      user: {
        toastsCollected: user.toastsCollected,
        bankBalance: user.bankBalance
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error withdrawing toasts', error: error.message });
  }
});

/**
 * @swagger
 * /api/game/bank/claim-interest:
 *   post:
 *     tags: [Game]
 *     summary: Claim 10% daily passive interest
 *     security:
 *       - bearerAuth: []
 */
router.post('/bank/claim-interest', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    
    if (!user.bankBalance || user.bankBalance <= 0) {
      return res.status(400).json({ message: 'Deposit toasts into the bank first to earn interest!' });
    }

    const now = new Date();
    if (user.lastInterestClaim) {
      const hoursSince = (now.getTime() - new Date(user.lastInterestClaim).getTime()) / (1000 * 60 * 60);
      if (hoursSince < 24) {
        const hoursRemaining = Math.ceil(24 - hoursSince);
        return res.status(400).json({ message: `Interest generating! Cooldown: ${hoursRemaining} hours remaining.` });
      }
    }

    const interest = Math.floor(user.bankBalance * 0.10); // 10% interest
    user.bankBalance += interest;
    user.lastInterestClaim = now;

    await user.save();

    res.json({
      success: true,
      message: `Earned ${interest} 🍞 in daily 10% interest!`,
      user: {
        bankBalance: user.bankBalance,
        lastInterestClaim: user.lastInterestClaim
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error claiming interest', error: error.message });
  }
});

/**
 * @swagger
 * /api/game/boss-strike:
 *   post:
 *     tags: [Game]
 *     summary: Strike the Time Rift Boss
 *     security:
 *       - bearerAuth: []
 */
router.post('/boss-strike', authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    if ((user.energy || 0) < 50) {
      return res.status(400).json({ message: 'Not enough energy to strike boss! Requires 50 ⚡' });
    }

    user.energy -= 50;
    const damage = Math.floor(Math.random() * 200) + 100; // 100 to 300 DMG

    user.bossHp = (user.bossHp !== undefined ? user.bossHp : 1000) - damage;

    let defeated = false;
    let rewardMsg = '';

    if (user.bossHp <= 0) {
      defeated = true;
      user.toastsCollected = (user.toastsCollected || 0) + 500;
      
      const bossList = ['Paradox Golem', 'Entropy Lord', 'Temporal Wyrm', 'Chrono-Dragon'];
      const nextBoss = bossList[Math.floor(Math.random() * bossList.length)];

      user.bossHp = 1000;
      user.bossMaxHp = 1000;
      user.bossName = nextBoss;

      // Add 1 Legendary Toaster reward
      const legendaryName = `Legendary ${nextBoss} Toaster`;
      const existing = user.inventory.find(i => i.item === legendaryName);
      if (existing) {
        existing.quantity += 1;
      } else {
        user.inventory.push({
          item: legendaryName,
          quantity: 1,
          rarity: 'Legendary',
          obtainedFrom: 'Boss Fight',
          obtainedAt: new Date()
        });
      }

      rewardMsg = ` 🏆 BOSS DEFEATED! You earned +500 🍞 and 1 ${legendaryName}! Next boss: ${nextBoss}!`;
    }

    await user.save();

    res.json({
      success: true,
      message: `Dealt ${damage} DMG to ${user.bossName}!${rewardMsg}`,
      damage,
      defeated,
      user: {
        energy: user.energy,
        toastsCollected: user.toastsCollected,
        inventory: user.inventory,
        bossHp: user.bossHp,
        bossMaxHp: user.bossMaxHp,
        bossName: user.bossName
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error striking boss', error: error.message });
  }
});

/**
 * @swagger
 * /api/game/overclock:
 *   post:
 *     tags: [Game]
 *     summary: Spend 50 toasts to activate 15-minute Quantum Overclock
 *     security:
 *       - bearerAuth: []
 */
router.post('/overclock', authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    if ((user.toastsCollected || 0) < 50) {
      return res.status(400).json({ message: 'Requires 50 🍞 to activate Quantum Overclock!' });
    }

    user.toastsCollected -= 50;
    // Active for 15 minutes
    user.overclockUntil = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    res.json({
      success: true,
      message: '⚡ QUANTUM OVERCLOCK ACTIVATED! (15 Mins: 50% Time Travel Cost & 2x Legendary Drop Rate!)',
      user: {
        toastsCollected: user.toastsCollected,
        overclockUntil: user.overclockUntil
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error activating overclock', error: error.message });
  }
});

/**
 * @swagger
 * /api/game/codex:
 *   get:
 *     tags: [Game]
 *     summary: Get Museum Codex toaster catalog and user collection status
 *     security:
 *       - bearerAuth: []
 */
router.get('/codex', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const userItems = (user.inventory || []).map(i => i.item);

    const catalog = [
      { id: 'c1', name: 'Golden Prehistoric Toaster', era: 'prehistoric', rarity: 'Legendary', lore: 'Forged from ancient meteorites.' },
      { id: 'c2', name: 'Rusted Prehistoric Toaster', era: 'prehistoric', rarity: 'Common', lore: 'A primitive stone toaster.' },
      { id: 'c3', name: 'Clockwork Medieval Toaster', era: 'medieval', rarity: 'Rare', lore: 'Gears turn as it roasts whole wheat.' },
      { id: 'c4', name: 'Steam-Powered Industrial Toaster', era: 'industrial', rarity: 'Epic', lore: 'Hisses steam upon ejection.' },
      { id: 'c5', name: 'Quantum Futuristic Toaster', era: 'futuristic', rarity: 'Legendary', lore: 'Toasts bread in negative time.' },
      { id: 'c6', name: 'Holographic Modern Toaster', era: 'modern', rarity: 'Epic', lore: 'Projects virtual butter onto toast.' },
    ];

    const codex = catalog.map(item => ({
      ...item,
      collected: userItems.includes(item.name)
    }));

    const totalCollected = codex.filter(c => c.collected).length;

    res.json({
      success: true,
      totalCount: catalog.length,
      collectedCount: totalCollected,
      completionPercentage: Math.round((totalCollected / catalog.length) * 100),
      codex
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching codex', error: error.message });
  }
});

/**
 * @swagger
 * /api/game/activity-feed:
 *   get:
 *     tags: [Game]
 *     summary: Get live activity feed of recent discoveries
 *     security:
 *       - bearerAuth: []
 */
router.get('/activity-feed', authMiddleware, async (req, res) => {
  try {
    const feed = [
      { id: 'f1', time: '1 min ago', text: '⚡ Traveler Alpha activated Quantum Overclock!' },
      { id: 'f2', time: '3 mins ago', text: '🏆 Traveler Bravo defeated the Chrono-Dragon!' },
      { id: 'f3', time: '7 mins ago', text: '🌟 Traveler Charlie discovered a Legendary Futuristic Toaster!' },
      { id: 'f4', time: '12 mins ago', text: '📜 Traveler Delta unlocked the Time Lord achievement!' },
    ];

    res.json({ success: true, feed });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activity feed', error: error.message });
  }
});

/**
 * @swagger
 * /api/game/equip-gear:
 *   post:
 *     tags: [Game]
 *     summary: Equip or unequip a toaster into primary/secondary gear slots
 *     security:
 *       - bearerAuth: []
 */
router.post('/equip-gear', authMiddleware, async (req, res) => {
  try {
    const { slot, item, rarity, action } = req.body; // action: 'equip' | 'unequip'
    const user = req.user;

    user.equippedGear = user.equippedGear || [];

    if (action === 'unequip') {
      user.equippedGear = user.equippedGear.filter(g => g.slot !== slot);
    } else {
      // Equip item
      if (!['primary', 'secondary'].includes(slot)) {
        return res.status(400).json({ message: 'Invalid gear slot. Choose primary or secondary.' });
      }

      // Check if user owns item
      const owns = user.inventory.some(i => i.item === item);
      if (!owns) {
        return res.status(400).json({ message: 'You do not own this toaster!' });
      }

      // Filter out existing slot item and add new
      user.equippedGear = user.equippedGear.filter(g => g.slot !== slot);
      user.equippedGear.push({ slot, item, rarity });
    }

    await user.save();

    res.json({
      success: true,
      message: action === 'unequip' ? `Unequipped ${slot} gear slot.` : `Equipped ${item} to ${slot} gear slot!`,
      user: {
        equippedGear: user.equippedGear
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error equipping gear', error: error.message });
  }
});

/**
 * @swagger
 * /api/game/choose-faction:
 *   post:
 *     tags: [Game]
 *     summary: Select traveler faction alliance
 *     security:
 *       - bearerAuth: []
 */
router.post('/choose-faction', authMiddleware, async (req, res) => {
  try {
    const { faction } = req.body;
    const user = req.user;

    const validFactions = ['Chrono Guardians', 'Paradox Seekers', 'Quantum Guild'];
    if (!validFactions.includes(faction)) {
      return res.status(400).json({ message: 'Invalid faction selected.' });
    }

    user.faction = faction;
    await user.save();

    res.json({
      success: true,
      message: `Pledged alliance to the ${faction}!`,
      user: {
        faction: user.faction
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error choosing faction', error: error.message });
  }
});

/**
 * @swagger
 * /api/game/buy-harvester:
 *   post:
 *     tags: [Game]
 *     summary: Purchase Automated Toast Harvester for 500 toasts
 *     security:
 *       - bearerAuth: []
 */
router.post('/buy-harvester', authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    if (user.hasHarvester) {
      return res.status(400).json({ message: 'Automated Harvester already unlocked!' });
    }

    if ((user.toastsCollected || 0) < 500) {
      return res.status(400).json({ message: 'Requires 500 🍞 to purchase Harvester!' });
    }

    user.toastsCollected -= 500;
    user.hasHarvester = true;

    await user.save();

    res.json({
      success: true,
      message: '⚙️ AUTOMATED TOAST HARVESTER UNLOCKED! (Passively generates +1 Toast every 10s)',
      user: {
        toastsCollected: user.toastsCollected,
        hasHarvester: user.hasHarvester
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error purchasing harvester', error: error.message });
  }
});

/**
 * @swagger
 * /api/game/idle-claim:
 *   post:
 *     tags: [Game]
 *     summary: Claim passive idle toast harvest
 *     security:
 *       - bearerAuth: []
 */
router.post('/idle-claim', authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    if (!user.hasHarvester) {
      return res.status(400).json({ message: 'Unlock Automated Harvester first!' });
    }

    user.toastsCollected = (user.toastsCollected || 0) + 1;
    await user.save();

    res.json({
      success: true,
      message: '+1 🍞 Idle Harvested!',
      user: {
        toastsCollected: user.toastsCollected
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error claiming idle harvest', error: error.message });
  }
});

export default router;