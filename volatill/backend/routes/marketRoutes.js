const express = require('express');
const router = express.Router();
const {
  getTopCoins,
  getCoinDetails,
  getCoinChart,
  searchCoins,
  getVolatilityRankings,
  getPrices,
} = require('../controllers/marketController');

router.get('/top', getTopCoins);
router.get('/coin/:coinId', getCoinDetails);
router.get('/coin/:coinId/chart', getCoinChart);
router.get('/search', searchCoins);
router.get('/volatility', getVolatilityRankings);
router.post('/prices', getPrices);

module.exports = router;