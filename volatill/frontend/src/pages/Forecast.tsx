import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { forecastAPI } from "../services/api";

interface Pattern {
  type: string;
  label: string;
  description: string;
  confidence: number;
  expectedDuration: number;
  severity: string;
}

interface NextEvent {
  type: string;
  probability: number;
  estimatedIn: number;
  description: string;
}

interface Forecast {
  _id: string;
  coinId: string;
  symbol: string;
  name: string;
  currentPrice: number;
  priceChangePercent24h: number;
  forecastScore: number;
  forecastLabel: string;
  forecastDirection: string;
  patterns: Pattern[];
  nextEvent: NextEvent;
  dataPointsUsed: number;
  lastAnalyzed: string;
}

const forecastLabels: Record<string, { label: string; color: string }> = {
  very_low: { label: "Very Low", color: "#22c55e" },
  low: { label: "Low", color: "#4ade80" },
  moderate: { label: "Moderate", color: "#facc15" },
  high: { label: "High", color: "#fb923c" },
  extreme: { label: "Extreme", color: "#ef4444" },
};

const eventIcons: Record<string, string> = {
  volatility_spike: "⚡",
  calm_period: "🌊",
  breakout: "🚀",
  reversal: "🔄",
  none: "✅",
};

const severityColors: Record<string, string> = {
  low: "#22c55e",
  moderate: "#facc15",
  high: "#fb923c",
  extreme: "#ef4444",
};

const directionIcons: Record<string, string> = {
  up: "↑",
  down: "↓",
  sideways: "→",
  unclear: "↕",
};

function ForecastCard({ forecast }: { forecast: Forecast }) {
  const navigate = useNavigate();
  const fLabel = forecastLabels[forecast.forecastLabel] || forecastLabels.moderate;
  const hasPatterns = forecast.patterns && forecast.patterns.length > 0;
  const event = forecast.nextEvent;

  return (
    <div
      className="card forecast-card"
      onClick={() => navigate("/market/" + forecast.coinId)}
    >
      <div className="forecast-card-header">
        <div>
          <div className="coin-name">{forecast.name}</div>
          <div className="coin-symbol">{forecast.symbol.toUpperCase()}</div>
        </div>
        <div className="forecast-score-badge" style={{ background: fLabel.color }}>
          <div className="forecast-score-value">{forecast.forecastScore}</div>
          <div className="forecast-score-label">{fLabel.label}</div>
        </div>
      </div>

      <div className="forecast-card-price">
        <span>
          ${forecast.currentPrice?.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6,
          })}
        </span>
        <span
          className={
            "price-change " +
            ((forecast.priceChangePercent24h ?? 0) >= 0 ? "up" : "down")
          }
        >
          {directionIcons[forecast.forecastDirection]}{" "}
          {(forecast.priceChangePercent24h ?? 0).toFixed(2)}%
        </span>
      </div>

      {event && event.type !== "none" && (
        <div
          className="next-event-banner"
          style={{
            borderLeftColor: severityColors[
              hasPatterns ? forecast.patterns[0].severity : "moderate"
            ],
          }}
        >
          <span className="event-icon">{eventIcons[event.type]}</span>
          <div className="event-info">
            <div className="event-type">
              {event.type.replace("_", " ").toUpperCase()}
            </div>
            <div className="event-probability">
              {(event.probability * 100).toFixed(0)}% probability · ~
              {event.estimatedIn}h
            </div>
          </div>
        </div>
      )}

      {hasPatterns && (
        <div className="forecast-patterns">
          {forecast.patterns.slice(0, 2).map((p, i) => (
            <div
              key={i}
              className="pattern-chip"
              style={{ borderColor: severityColors[p.severity] }}
            >
              <span>{p.label}</span>
            </div>
          ))}
          {forecast.patterns.length > 2 && (
            <div className="pattern-chip pattern-more">
              +{forecast.patterns.length - 2} more
            </div>
          )}
        </div>
      )}

      <div className="forecast-card-footer">
        <span className="data-points">
          📊 {forecast.dataPointsUsed} data points
        </span>
        <span className="analyzed-time">
          🕐 {new Date(forecast.lastAnalyzed).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}

export default function Forecast() {
  const navigate = useNavigate();
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "name">("score");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchForecasts();
  }, []);

  const fetchForecasts = async () => {
    try {
      setLoading(true);
      const { data } = await forecastAPI.getAllForecasts(50);
      setForecasts(data);
    } catch (err) {
      console.error("Fetch forecasts error:", err);
      setError(
        "Failed to load forecasts. Make sure the backend has price snapshot data."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setAnalyzing(true);
      await forecastAPI.triggerAnalysis(30);
      setTimeout(() => {
        fetchForecasts();
        setAnalyzing(false);
      }, 3000);
    } catch (err) {
      console.error("Refresh error:", err);
      setAnalyzing(false);
    }
  };

  const filteredForecasts = forecasts
    .filter((f) => filterSeverity === "all" || f.forecastLabel === filterSeverity)
    .sort((a, b) => {
      if (sortBy === "score") return b.forecastScore - a.forecastScore;
      return a.name.localeCompare(b.name);
    });

  if (loading && forecasts.length === 0) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="forecast-page">
      <div className="page-header">
        <div>
          <h1>Volatility Forecaster 🔮</h1>
          <p className="page-description">
            Pattern detection and volatility forecasting using statistical
            analysis of historical price data
          </p>
        </div>
        <div className="page-actions">
          <button
            className="btn btn-secondary"
            onClick={handleRefresh}
            disabled={analyzing}
          >
            {analyzing ? "⏳ Analyzing..." : "🔄 Refresh Analysis"}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/market")}
          >
            View Market
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠️</span> {error}
          <button className="btn btn-ghost btn-sm" onClick={fetchForecasts}>
            Retry
          </button>
        </div>
      )}

      <div className="forecast-controls">
        <div className="control-group">
          <label>Sort by</label>
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "score" | "name")
            }
          >
            <option value="score">Forecast Score</option>
            <option value="name">Coin Name</option>
          </select>
        </div>
        <div className="control-group">
          <label>Filter by</label>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
          >
            <option value="all">All Levels</option>
            <option value="extreme">Extreme</option>
            <option value="high">High</option>
            <option value="moderate">Moderate</option>
            <option value="low">Low</option>
            <option value="very_low">Very Low</option>
          </select>
        </div>
      </div>

      {filteredForecasts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔮</div>
          <h3>No Forecasts Available</h3>
          <p>
            Price snapshot data is needed to generate forecasts. The scheduler
            will collect data automatically.
          </p>
          <button
            className="btn btn-primary"
            onClick={handleRefresh}
            disabled={analyzing}
          >
            Generate Now
          </button>
        </div>
      ) : (
        <>
          <div className="forecast-stats">
            <div className="stat-mini">
              <span className="stat-mini-value">{forecasts.length}</span>
              <span className="stat-mini-label">Coins Analyzed</span>
            </div>
            <div className="stat-mini">
              <span className="stat-mini-value">
                {
                  forecasts.filter(
                    (f) =>
                      f.forecastLabel === "extreme" ||
                      f.forecastLabel === "high"
                  ).length
                }
              </span>
              <span className="stat-mini-label">High Risk</span>
            </div>
            <div className="stat-mini">
              <span className="stat-mini-value">
                {forecasts.filter((f) => f.patterns.length > 0).length}
              </span>
              <span className="stat-mini-label">With Patterns</span>
            </div>
          </div>

          <div className="forecast-grid">
            {filteredForecasts.map((f) => (
              <ForecastCard key={f._id} forecast={f} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}