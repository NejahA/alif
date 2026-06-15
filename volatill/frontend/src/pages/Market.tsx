import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { marketAPI } from '../services/api';

interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
}

export default function Market() {
  const navigate = useNavigate();
  const [coins, setCoins] = useState<Coin[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    marketAPI.getTopCoins(100)
      .then(res => setCoins(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (p: number) => {
    if (!p) return '$0.00';
    return p >= 1 ? `$${p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$${p.toFixed(6)}`;
  };

  const filtered = coins.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.symbol.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading-spinner"><div className="spinner" />;</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Market</h1>
        <input
          className="input"
          style={{ width: '280px' }}
          placeholder="Search coins..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Price</th>
                <th>24h %</th>
                <th>7d %</th>
                <th>Market Cap</th>
                <th>Volume</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((coin, i) => (
                <tr key={coin.id} onClick={() => navigate(`/market/${coin.id}`)}>
                  <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                  <td>
                    <div className="coin-cell">
                      <img src={coin.image} alt={coin.name} />
                      <div>
                        <div className="coin-name">{coin.name}</div>
                        <div className="coin-symbol">{coin.symbol.toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{formatPrice(coin.current_price)}</td>
                  <td>
                    <span className={`badge ${(coin.price_change_percentage_24h ?? 0) >= 0 ? 'badge-green' : 'badge-red'}`}>
                      {(coin.price_change_percentage_24h ?? 0) >= 0 ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${(coin.price_change_percentage_7d_in_currency ?? 0) >= 0 ? 'badge-green' : 'badge-red'}`}>
                      {(coin.price_change_percentage_7d_in_currency ?? 0) >= 0 ? '+' : ''}{coin.price_change_percentage_7d_in_currency?.toFixed(2)}%
                    </span>
                  </td>
                  <td>${(coin.market_cap / 1e9).toFixed(2)}B</td>
                  <td>${(coin.total_volume / 1e9).toFixed(2)}B</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                    No coins found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}