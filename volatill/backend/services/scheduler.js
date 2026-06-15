const cron = require('node-cron');
const coingecko = require('./coingecko');
const PriceSnapshot = require('../models/PriceSnapshot');
const Alert = require('../models/Alert');
const User = require('../models/User');

/**
 * Fetch top coins and save price snapshots every 5 minutes
 */
const scheduleSnapshots = () => {
  cron.schedule('*/5 * * * *', async () => {
    console.log(`[${new Date().toISOString()}] 📊 Collecting price snapshots...`);
    try {
      const coins = await coingecko.getTopCoins(50);
      
      const snapshots = coins.map(coin => ({
        coinId: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        currentPrice: coin.current_price || 0,
        priceChange24h: coin.price_change_24h || 0,
        priceChangePercent24h: coin.price_change_percentage_24h || 0,
        high24h: coin.high_24h || 0,
        low24h: coin.low_24h || 0,
        marketCap: coin.market_cap || 0,
        totalVolume: coin.total_volume || 0,
        circulatingSupply: coin.circulating_supply || 0,
        timestamp: new Date(),
      }));

      await PriceSnapshot.insertMany(snapshots);
      console.log(`✅ Saved ${snapshots.length} price snapshots`);
    } catch (error) {
      console.error('❌ Snapshot collection error:', error.message);
    }
  });
  console.log('⏰ Snapshot scheduler started (every 5 minutes)');
};

/**
 * Check alerts every 2 minutes
 */
const scheduleAlertCheck = () => {
  cron.schedule('*/2 * * * *', async () => {
    console.log(`[${new Date().toISOString()}] 🔔 Checking alerts...`);
    try {
      const activeAlerts = await Alert.find({
        triggered: false,
        dismissed: false,
      }).populate('user', 'preferences');

      if (!activeAlerts.length) return;

      // Group by coinId for batch price fetching
      const coinIds = [...new Set(activeAlerts.map(a => a.coinId))];
      const prices = await coingecko.getSimplePrice(coinIds);

      for (const alert of activeAlerts) {
        const priceData = prices[alert.coinId];
        if (!priceData) continue;

        const currentPrice = priceData.usd || 0;
        let shouldTrigger = false;

        switch (alert.type) {
          case 'price_above':
            shouldTrigger = currentPrice >= alert.condition;
            break;
          case 'price_below':
            shouldTrigger = currentPrice <= alert.condition;
            break;
          case 'percent_change':
            shouldTrigger = Math.abs(priceData.usd_24h_change || 0) >= alert.condition;
            break;
          case 'volatility':
            // Approximate: check if 24h change exceeds threshold
            shouldTrigger = Math.abs(priceData.usd_24h_change || 0) >= alert.condition;
            break;
        }

        if (shouldTrigger) {
          alert.triggered = true;
          alert.triggeredAt = new Date();
          alert.currentPrice = currentPrice;
          await alert.save();
          console.log(`🔔 Alert triggered: ${alert.symbol} ${alert.type} @ $${currentPrice}`);
        }
      }
    } catch (error) {
      console.error('❌ Alert check error:', error.message);
    }
  });
  console.log('⏰ Alert scheduler started (every 2 minutes)');
};

module.exports = { scheduleSnapshots, scheduleAlertCheck };