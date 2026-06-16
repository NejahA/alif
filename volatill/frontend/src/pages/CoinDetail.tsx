import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marketAPI, watchlistAPI, alertAPI, forecastAPI } from '../services/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image?: { large: string };
  market_data: {
    current_price: { usd: number };
    market_cap: { usd: number };
    total_volume: { usd: number };
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    high_24h: { usd: number };
    low_24h: { usd: number };
    circulating_supply: number;
    max_supply: number;
    ath: { usd: number };
    ath_change_percentage: { usd: number };
  };
  volatility?: {
    score: number;
    level: string;
    color: string;
  };
}

interface ForecastData {
  coinId: string;
  symbol: string;
  name: string;
  currentPrice: number;
  forecastScore: number;
  forecastLabel: string;
  forecastDirection: string;
  patterns: { type: string; label: string; severity: string; confidence: number }[];
  nextEvent: { type: string; probability: number; estimatedIn: number; description: string };
  upcomingPeriods: { startTime: string; endTime: string; expectedVolatility: number; expectedVolatilityLabel: string; confidence: number }[];
  dataPointsUsed: number;
  lastAnalyzed: string;
}

const forecastLabelColors: Record<string, { label: string; color: string }> = {
  very_low: { label: 'Very Low', color: '#22c55e' },
  low: { label: 'Low', color: '#4ade80' },
  moderate: { label: 'Moderate', color: '#facc15' },
  high: { label: 'High', color: '#fb923c' },
  extreme: { label: 'Extreme', color: '#ef4444' },
};

const eventIcons: Record<string, string> = {
  volatility_spike: '⚡',
  calm_period: '🌊',
  breakout: '🚀',
  reversal: '🔄',
  none: '✅',
};

const severityColors: Record<string, string> = {
  low: '#22c55e',
  moderate: '#facc15',
  high: '#fb923c',
  extreme: '#ef4444',
};

export default function CoinDetail() {
  const { coinId } = useParams<{ coinId: string }>();
  const navigate = useNavigate();
  const [coin, setCoin] = useState<CoinData | null>(null);
  const [chart, setChart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertType, setAlertType] = useState('price_above');
  const [alertCondition, setAlertCondition] = useState('');
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [addingToList, setAddingToList] = useState(false);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [forecastLoading, setForecastLoading] = useState(true);

  useEffect(() => {
    if (!coinId) return;
    Promise.all([
      marketAPI.getCoinDetails(coinId),
      marketAPI.getCoinChart(coinId, 7),
      forecastAPI.getCoinForecast(coinId),
    ])
      .then(([details, chartRes, forecastRes]) => {
        setCoin(details.data);
        const prices = chartRes.data.prices || [];
        setChart(prices.map((p: [number, number]) => ({ time: new Date(p[0]).toLocaleDateString(), price: p[1] })));
        setForecast(forecastRes.data);
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
        setForecastLoading(false);
      });
  }, [coinId]);

  const addToWatchlist = async () => {
    if (!coin) return;
    setAddingToList(true);
    try {
      const wlRes = await watchlistAPI.getWatchlists();
      const defaultWl = wlRes.data.find((w: any) => w.isDefault) || wlRes.data[0];
      if (defaultWl) {
        await watchlistAPI.addCoin(defaultWl._id, {
          coinId: coin.id,
          symbol: coin.symbol,
          name: coin.name,
        });
      }
    } catch (err: any) {
      if (err.response?.status !== 400) console.error(err);
    } finally {
      setAddingToList(false);
    }
  };

  const createAlert = async () => {
    if (!coin || !alertCondition) return;
    try {
      await alertAPI.createAlert({
        coinId: coin.id,
        symbol: coin.symbol,
        coinName: coin.name,
        type: alertType,
        condition: parseFloat(alertCondition),
      });
      setShowAlertModal(false);
      setAlertCondition('');
    } catch (err) {
      console.error(err);
    }
  };

  const formatPrice = (p: number | undefined | null) => {
    if (p == null) return '$0.00';
    return p >= 1 ? `$${p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$${p.toFixed(6)}`;
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" />;</div>;
  if (!coin) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Coin not found</div>;

  const md = coin.market_data;

  return (
    <div>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/market')} style={{ marginBottom: 16 }}>
        ← Back to Market
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        {coin.image?.large && <img src={coin.image.large} alt={coin.name} style={{ width: 48, height: 48 }} />}
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>{coin.name} <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 22 }}>{coin.symbol.toUpperCase()}</span></h1>
          <div style={{ fontSize: 36, fontWeight: 700, marginTop: 4 }}>{formatPrice(md.current_price?.usd)}</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={addToWatchlist} disabled={addingToList}>
            {addingToList ? 'Adding...' : '⭐ Add to Watchlist'}
          </button>
          <button className="btn btn-primary" onClick={() => setShowAlertModal(true)}>
            🔔 Set Alert
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">24h Change</div>
          <div className={`stat-value ${(md.price_change_percentage_24h ?? 0) >= 0 ? 'up' : 'down'}`} style={{ fontSize: 20 }}>
            {(md.price_change_percentage_24h ?? 0) >= 0 ? '+' : ''}{md.price_change_percentage_24h?.toFixed(2)}%
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">7d Change</div>
          <div className={`stat-value ${(md.price_change_percentage_7d ?? 0) >= 0 ? 'up' : 'down'}`} style={{ fontSize: 20 }}>
            {(md.price_change_percentage_7d ?? 0) >= 0 ? '+' : ''}{md.price_change_percentage_7d?.toFixed(2)}%
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">24h High / Low</div>
          <div className="stat-value" style={{ fontSize: 16 }}>
            {formatPrice(md.high_24h?.usd)} / {formatPrice(md.low_24h?.usd)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Market Cap</div>
          <div className="stat-value" style={{ fontSize: 18 }}>${(md.market_cap?.usd / 1e9).toFixed(2)}B</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Volume (24h)</div>
          <div className="stat-value" style={{ fontSize: 18 }}>${(md.total_volume?.usd / 1e9).toFixed(2)}B</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Circulating Supply</div>
          <div className="stat-value" style={{ fontSize: 16 }}>{md.circulating_supply?.toLocaleString()} {coin.symbol.toUpperCase()}</div>
        </div>
      </div>

      {coin.volatility && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Volatility Score</h3>
            <span style={{ color: coin.volatility.color, fontWeight: 600 }}>
              {coin.volatility.level} ({coin.volatility.score.toFixed(2)})
            </span>
          </div>
          <div className="vol-bar">
            <div className="vol-bar-fill" style={{ width: `${Math.min(coin.volatility.score, 30)}%`, background: coin.volatility.color }} />
          </div>
        </div>
      )}

      {/* 🔮 Volatility Forecast Section */}
      {!forecastLoading && forecast && (
        <div className="card coin-forecast-card" style={{ marginBottom: 24 }}>
          <div className="coin-forecast-header">
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>🔮 Volatility Forecast</h3>
            <div
              className="forecast-score-badge-sm"
              style={{
                background: forecastLabelColors[forecast.forecastLabel]?.color || '#facc15',
              }}
            >
              <span className="forecast-score-sm">{forecast.forecastScore}</span>
              <span className="forecast-label-sm">
                {forecastLabelColors[forecast.forecastLabel]?.label || 'Moderate'}
              </span>
            </div>
          </div>

          {/* Next Event */}
          {forecast.nextEvent && forecast.nextEvent.type !== 'none' && (
            <div className="next-event-banner-sm">
              <span className="event-icon-sm">{eventIcons[forecast.nextEvent.type] || '⚡'}</span>
              <div className="event-info-sm">
                <div className="event-type-sm">
                  {forecast.nextEvent.type.replace('_', ' ').toUpperCase()}
                </div>
                <div className="event-desc-sm">{forecast.nextEvent.description}</div>
                <div className="event-prob-sm">
                  {(forecast.nextEvent.probability * 100).toFixed(0)}% probability · ~
                  {forecast.nextEvent.estimatedIn}h
                </div>
              </div>
            </div>
          )}

          {/* Detected Patterns */}
          {forecast.patterns && forecast.patterns.length > 0 && (
            <div className="coin-patterns">
              <div className="patterns-label">Detected Patterns</div>
              <div className="patterns-chips">
                {forecast.patterns.map((p, i) => (
                  <span
                    key={i}
                    className="pattern-chip-sm"
                    style={{ borderColor: severityColors[p.severity] || '#94a3b8' }}
                  >
                    {p.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Periods (mini timeline) */}
          {forecast.upcomingPeriods && forecast.upcomingPeriods.length > 0 && (
            <div className="coin-periods">
              <div className="periods-label">48h Forecast Timeline</div>
              <div className="periods-bar">
                {forecast.upcomingPeriods.slice(0, 8).map((p, i) => {
                  const volColors: Record<string, string> = {
                    very_low: '#22c55e',
                    low: '#4ade80',
                    moderate: '#facc15',
                    high: '#fb923c',
                    extreme: '#ef4444',
                  };
                  const barColor = volColors[p.expectedVolatilityLabel] || '#94a3b8';
                  const height = Math.max(8, (p.expectedVolatility / 100) * 40);
                  return (
                    <div key={i} className="period-bar-item" title={`${p.expectedVolatilityLabel} (${p.expectedVolatility}/100)`}>
                      <div className="period-bar-fill" style={{ height, background: barColor }} />
                      <div className="period-bar-label">
                        {i * 6}h
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="coin-forecast-footer">
            <span>📊 {forecast.dataPointsUsed} data points</span>
            <span>🕐 {new Date(forecast.lastAnalyzed).toLocaleString()}</span>
          </div>
        </div>
      )}

      {!forecastLoading && !forecast && (
        <div className="card" style={{ marginBottom: 24, textAlign: 'center', padding: '16px 20px', color: 'var(--text-muted)' }}>
          ⏳ Forecast data will appear once enough price snapshots have been collected.
        </div>
      )}

      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Price Chart (7 Days)</h3>
        {chart.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis domain={['auto', 'auto']} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
              <Line type="monotone" dataKey="price" stroke="var(--accent)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No chart data available</div>
        )}
      </div>

      {showAlertModal && (
        <div className="modal-overlay" onClick={() => setShowAlertModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Set Alert — {coin.symbol.toUpperCase()}</h2>
            <div className="form-group">
              <label>Alert Type</label>
              <select className="input" value={alertType} onChange={e => setAlertType(e.target.value)}>
                <option value="price_above">Price Above</option>
                <option value="price_below">Price Below</option>
                <option value="percent_change">Percent Change (24h)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Condition Value (USD or %)</label>
              <input className="input" type="number" value={alertCondition} onChange={e => setAlertCondition(e.target.value)} placeholder={alertType === 'percent_change' ? 'e.g. 5' : 'e.g. 50000'} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowAlertModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={createAlert} disabled={!alertCondition}>Create Alert</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}