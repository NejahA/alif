const axios = require('axios');

const BASE_URL = 'https://api.coingecko.com/api/v3';

const coingeckoClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { Accept: 'application/json' },
});

/**
 * Fetch top cryptocurrencies by market cap
 */
const getTopCoins = async (count = 100) => {
  const { data } = await coingeckoClient.get('/coins/markets', {
    params: {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: Math.min(count, 250),
      page: 1,
      sparkline: false,
      price_change_percentage: '1h,24h,7d',
    },
  });
  return data;
};

/**
 * Fetch detailed info for a specific coin
 */
const getCoinDetails = async (coinId) => {
  const { data } = await coingeckoClient.get(`/coins/${coinId}`, {
    params: {
      localization: false,
      tickers: false,
      market_data: true,
      community_data: false,
      developer_data: false,
    },
  });
  return data;
};

/**
 * Fetch historical chart data for a coin
 */
const getCoinChart = async (coinId, days = 7) => {
  const { data } = await coingeckoClient.get(`/coins/${coinId}/market_chart`, {
    params: {
      vs_currency: 'usd',
      days,
    },
  });
  return data;
};

/**
 * Search coins by query
 */
const searchCoins = async (query) => {
  const { data } = await coingeckoClient.get('/search', {
    params: { query },
  });
  return data.coins.slice(0, 20);
};

/**
 * Fetch price data for multiple coin IDs
 */
const getSimplePrice = async (coinIds) => {
  const { data } = await coingeckoClient.get('/simple/price', {
    params: {
      ids: coinIds.join(','),
      vs_currencies: 'usd',
      include_24hr_change: true,
      include_7d_change: true,
      include_market_cap: true,
      include_24hr_vol: true,
    },
  });
  return data;
};

module.exports = {
  getTopCoins,
  getCoinDetails,
  getCoinChart,
  searchCoins,
  getSimplePrice,
};