import React from 'react'
import type { Stats } from '../types'

interface DashboardProps {
  stats: Stats
  onSelectReview: (deck?: string) => void
  onAddCardClick: () => void
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  onSelectReview,
  onAddCardClick,
}) => {
  const deckNames = Object.keys(stats.totalPerDeck).sort()

  return (
    <div className="dashboard-container animate-fade-in">
      <header className="dashboard-header">
        <div>
          <h1>Welcome Back, Developer</h1>
          <p className="subtext">Ready for your spaced-repetition daily review?</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={onAddCardClick}>
            <span className="btn-icon">+</span> Add Flashcard
          </button>
        </div>
      </header>

      {/* Grid of Stats Cards */}
      <section className="stats-grid">
        <div className="stat-card card-glow-purple">
          <div className="stat-icon-wrapper purple-glow">
            <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Due Today</span>
            <span className="stat-value">{stats.dueToday}</span>
            <span className="stat-desc">
              {stats.dueToday > 0 ? 'Cards waiting to be reviewed' : 'All caught up! Nice job 🎉'}
            </span>
          </div>
        </div>

        <div className="stat-card card-glow-cyan">
          <div className="stat-icon-wrapper cyan-glow">
            <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 11H5m14 0a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2m14 0V9a2 2 0 0 0-2-2M5 11V9a2 2 0 0 1 2-2m0 0V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2M7 7h10" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Cards</span>
            <span className="stat-value">{stats.totalCards}</span>
            <span className="stat-desc">{stats.decks} active decks</span>
          </div>
        </div>

        <div className="stat-card card-glow-pink">
          <div className="stat-icon-wrapper pink-glow">
            <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Current Streak</span>
            <span className="stat-value streak-value">
              🔥 {stats.streak} {stats.streak === 1 ? 'day' : 'days'}
            </span>
            <span className="stat-desc">Keep the habit going!</span>
          </div>
        </div>

        <div className="stat-card card-glow-green">
          <div className="stat-icon-wrapper green-glow">
            <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Retention Rate</span>
            <span className="stat-value">{stats.retention}%</span>
            <span className="stat-desc">Accuracy on remembered items</span>
          </div>
        </div>
      </section>

      {/* Main split: Decks and Quick Actions */}
      <div className="dashboard-layout-split">
        {/* Left Column: Decks */}
        <section className="dashboard-section decks-panel">
          <h2>Your Study Decks</h2>
          {deckNames.length === 0 ? (
            <div className="empty-state">
              <p>No decks found. Get started by adding a card!</p>
              <button className="btn btn-outline" onClick={onAddCardClick}>Add Card</button>
            </div>
          ) : (
            <div className="dashboard-decks-list">
              {deckNames.map(name => {
                const total = stats.totalPerDeck[name] || 0
                const due = stats.duePerDeck[name] || 0
                const isDue = due > 0

                return (
                  <div key={name} className={`deck-row ${isDue ? 'has-due' : ''}`}>
                    <div className="deck-info">
                      <h3>{name}</h3>
                      <p className="deck-counts">
                        <span>{total} {total === 1 ? 'card' : 'cards'}</span>
                        <span className="separator">•</span>
                        <span className={`due-badge ${isDue ? 'due' : 'done'}`}>
                          {due} due
                        </span>
                      </p>
                    </div>
                    <div className="deck-actions">
                      <button
                        className={`btn ${isDue ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => onSelectReview(name)}
                      >
                        {isDue ? 'Study Due' : 'Custom Study'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Right Column: Quick Review & Card Distribution */}
        <section className="dashboard-section secondary-panel">
          <div className="quick-study-widget">
            <h3>Ready to Ponder?</h3>
            <p>Reviewing spaced cards daily helps lock programming concepts into your long-term memory.</p>
            {stats.dueToday > 0 ? (
              <button className="btn btn-primary btn-block btn-lg glow-btn" onClick={() => onSelectReview()}>
                Study {stats.dueToday} Cards Now
              </button>
            ) : (
              <div className="caught-up-widget">
                <div className="check-logo">✓</div>
                <p className="bold-text">You are fully caught up for today!</p>
                <p className="small-text">Want to review anyway? Click a deck's "Custom Study" button above.</p>
              </div>
            )}
          </div>

          <div className="card-distribution-widget">
            <h3>Card Distribution</h3>
            <div className="dist-bar">
              <div
                className="dist-segment dist-new"
                style={{ width: `${(stats.newCards / (stats.totalCards || 1)) * 100}%` }}
                title={`New: ${stats.newCards}`}
              ></div>
              <div
                className="dist-segment dist-learning"
                style={{ width: `${(stats.learningCards / (stats.totalCards || 1)) * 100}%` }}
                title={`Learning: ${stats.learningCards}`}
              ></div>
              <div
                className="dist-segment dist-mature"
                style={{ width: `${(stats.matureCards / (stats.totalCards || 1)) * 100}%` }}
                title={`Mature: ${stats.matureCards}`}
              ></div>
            </div>
            <div className="dist-labels">
              <span className="dist-label-item"><span className="legend-dot new"></span> New ({stats.newCards})</span>
              <span className="dist-label-item"><span className="legend-dot learning"></span> Learning ({stats.learningCards})</span>
              <span className="dist-label-item"><span className="legend-dot mature"></span> Mature ({stats.matureCards})</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
