import type { Stats } from '../types'

interface StatsDashboardProps {
  stats: Stats
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats }) => {
  const tagItems = Object.entries(stats.tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15) // Show top 15 tags

  const deckData = Object.keys(stats.totalPerDeck).map(name => ({
    name,
    total: stats.totalPerDeck[name] || 0,
    due: stats.duePerDeck[name] || 0,
  })).sort((a, b) => b.total - a.total)

  // Find max total count to scale bar graphs
  const maxCardsInDeck = Math.max(...deckData.map(d => d.total), 1)

  return (
    <div className="stats-dashboard-container animate-fade-in">
      <header className="stats-header">
        <div>
          <h1>Analytics</h1>
          <p className="subtext">Insights into your memory retention & progress</p>
        </div>
      </header>

      {/* Overview Cards */}
      <section className="stats-summary-grid">
        <div className="summary-stat-box card-glow-dark">
          <span className="summary-val">{stats.totalReviews}</span>
          <span className="summary-lbl">Total Reviews</span>
        </div>
        <div className="summary-stat-box card-glow-dark">
          <span className="summary-val">{stats.retention}%</span>
          <span className="summary-lbl">Retention Rate</span>
        </div>
        <div className="summary-stat-box card-glow-dark">
          <span className="summary-val">🔥 {stats.streak}d</span>
          <span className="summary-lbl">Study Streak</span>
        </div>
        <div className="summary-stat-box card-glow-dark">
          <span className="summary-val">{stats.decks}</span>
          <span className="summary-lbl">Decks</span>
        </div>
      </section>

      {/* Main Charts Area */}
      <div className="stats-charts-grid">
        
        {/* Card States Breakdown */}
        <div className="chart-panel card-glow-purple">
          <h3>Card Retention Status</h3>
          <p className="chart-desc">How well cards are integrated into your long-term memory</p>

          <div className="state-breakdown-list">
            <div className="state-breakdown-item">
              <div className="item-labels">
                <span className="item-title"><span className="legend-dot new"></span> New Cards</span>
                <span className="item-value">{stats.newCards} ({stats.totalCards > 0 ? Math.round((stats.newCards / stats.totalCards) * 100) : 0}%)</span>
              </div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fg new-bg"
                  style={{ width: `${stats.totalCards > 0 ? (stats.newCards / stats.totalCards) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="item-explain">Unstudied cards. Initiating these places them into the learning loop.</span>
            </div>

            <div className="state-breakdown-item">
              <div className="item-labels">
                <span className="item-title"><span className="legend-dot learning"></span> Learning Cards</span>
                <span className="item-value">{stats.learningCards} ({stats.totalCards > 0 ? Math.round((stats.learningCards / stats.totalCards) * 100) : 0}%)</span>
              </div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fg learning-bg"
                  style={{ width: `${stats.totalCards > 0 ? (stats.learningCards / stats.totalCards) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="item-explain">In active review. Intervals are under 6 days.</span>
            </div>

            <div className="state-breakdown-item">
              <div className="item-labels">
                <span className="item-title"><span className="legend-dot mature"></span> Mature Cards</span>
                <span className="item-value">{stats.matureCards} ({stats.totalCards > 0 ? Math.round((stats.matureCards / stats.totalCards) * 100) : 0}%)</span>
              </div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fg mature-bg"
                  style={{ width: `${stats.totalCards > 0 ? (stats.matureCards / stats.totalCards) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="item-explain">Solidly remembered. Spaced intervals are 6+ days.</span>
            </div>
          </div>
        </div>

        {/* Decks Comparison Chart */}
        <div className="chart-panel card-glow-cyan">
          <h3>Deck Volume & Due Ratio</h3>
          <p className="chart-desc">Comparison of total size and active due cards per deck</p>

          <div className="decks-bar-chart">
            {deckData.length === 0 ? (
              <div className="empty-chart">No decks to display.</div>
            ) : (
              deckData.map(d => {
                const totalPct = (d.total / maxCardsInDeck) * 100

                return (
                  <div key={d.name} className="chart-row">
                    <span className="chart-row-label" title={d.name}>{d.name}</span>
                    <div className="chart-row-bar-container">
                      <div className="bar-wrapper">
                        {/* Total cards bar */}
                        <div
                          className="bar bar-total"
                          style={{ width: `${totalPct}%` }}
                          title={`Total cards: ${d.total}`}
                        >
                          {/* Inner due cards bar */}
                          <div
                            className="bar bar-due animate-pulse-slow"
                            style={{ width: `${d.due > 0 ? (d.due / d.total) * 100 : 0}%` }}
                            title={`Due cards: ${d.due}`}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <span className="chart-row-value">
                      <span className="value-due">{d.due} due</span> / {d.total}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>

      </div>

      {/* Tags Cloud */}
      <section className="stats-section tags-cloud-panel card-glow-dark">
        <h3>Top Study Tags</h3>
        <p className="chart-desc">Frequency of tags applied across all cards in your decks</p>

        {tagItems.length === 0 ? (
          <div className="empty-state">Add tags to your cards to see your key areas.</div>
        ) : (
          <div className="tags-cloud">
            {tagItems.map(([tag, count]) => {
              // Calculate tag font sizes and colors depending on frequency
              const size = Math.min(24, Math.max(13, 12 + count * 2))
              const opacity = Math.min(1, 0.4 + (count / 10))

              return (
                <span
                  key={tag}
                  className="cloud-tag-item"
                  style={{
                    fontSize: `${size}px`,
                    opacity: opacity,
                  }}
                >
                  #{tag} <span className="tag-frequency-badge">{count}</span>
                </span>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
