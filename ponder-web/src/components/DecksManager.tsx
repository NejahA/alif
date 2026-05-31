import React, { useState } from 'react'
import type { Stats } from '../types'

interface DecksManagerProps {
  stats: Stats
  onSelectReview: (deck: string) => void
  onAddCardToDeck: (deck: string) => void
  onRenameDeck: (oldName: string, newName: string) => void
  onDeleteDeck: (deck: string) => void
  onCreateDeck: (name: string) => void
  customDecks: string[]
}

export const DecksManager: React.FC<DecksManagerProps> = ({
  stats,
  onSelectReview,
  onAddCardToDeck,
  onRenameDeck,
  onDeleteDeck,
  onCreateDeck,
  customDecks,
}) => {
  const [newDeckName, setNewDeckName] = useState('')
  const [renamingDeck, setRenamingDeck] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [error, setError] = useState('')

  // Compute all decks: those with cards + any manually added empty decks
  const decksWithCards = Object.keys(stats.totalPerDeck)
  const allDecks = Array.from(new Set([...decksWithCards, ...customDecks])).sort()

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    const name = newDeckName.trim()
    if (!name) return

    if (allDecks.some(d => d.toLowerCase() === name.toLowerCase())) {
      setError('Deck already exists')
      return
    }

    onCreateDeck(name)
    setNewDeckName('')
    setError('')
  }

  const handleStartRename = (deck: string) => {
    setRenamingDeck(deck)
    setRenameValue(deck)
  }

  const handleSaveRename = (oldName: string) => {
    const val = renameValue.trim()
    if (!val || val === oldName) {
      setRenamingDeck(null)
      return
    }

    if (allDecks.some(d => d.toLowerCase() === val.toLowerCase() && d !== oldName)) {
      alert('Deck name already exists')
      return
    }

    onRenameDeck(oldName, val)
    setRenamingDeck(null)
  }

  const handleDelete = (deck: string) => {
    const total = stats.totalPerDeck[deck] || 0
    let confirmMsg = `Are you sure you want to delete the deck "${deck}"?`
    if (total > 0) {
      confirmMsg += ` This will delete all ${total} cards inside this deck. This cannot be undone.`
    }
    if (confirm(confirmMsg)) {
      onDeleteDeck(deck)
    }
  }

  return (
    <div className="decks-container animate-fade-in">
      <header className="decks-header">
        <div>
          <h1>Decks</h1>
          <p className="subtext">Manage your collection of study decks</p>
        </div>
      </header>

      {/* Create Deck Form */}
      <section className="create-deck-card card-glow-purple">
        <h3>Create New Deck</h3>
        <form onSubmit={handleCreate} className="create-deck-form">
          <div className="form-group-inline">
            <input
              type="text"
              placeholder="e.g. System Design, Python Basics"
              value={newDeckName}
              onChange={(e) => {
                setNewDeckName(e.target.value)
                setError('')
              }}
              className="input-text"
            />
            <button type="submit" className="btn btn-primary">
              Create Deck
            </button>
          </div>
          {error && <p className="error-text">{error}</p>}
        </form>
      </section>

      {/* Decks Grid */}
      <section className="decks-grid">
        {allDecks.map(name => {
          const total = stats.totalPerDeck[name] || 0
          const due = stats.duePerDeck[name] || 0
          const isRenaming = renamingDeck === name

          return (
            <div key={name} className="deck-card card-glow-dark">
              <div className="deck-card-content">
                {isRenaming ? (
                  <div className="deck-rename-form">
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      className="input-text input-rename"
                      autoFocus
                    />
                    <div className="rename-actions">
                      <button className="btn btn-primary btn-sm" onClick={() => handleSaveRename(name)}>
                        Save
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={() => setRenamingDeck(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="deck-title-row">
                      <h3 className="deck-card-title">{name}</h3>
                      <div className="deck-card-actions">
                        <button className="btn-icon-action" onClick={() => handleStartRename(name)} title="Rename Deck">
                          ✏️
                        </button>
                        <button className="btn-icon-action" onClick={() => handleDelete(name)} title="Delete Deck">
                          🗑️
                        </button>
                      </div>
                    </div>

                    <div className="deck-card-stats">
                      <div className="deck-card-stat">
                        <span className="deck-stat-value">{total}</span>
                        <span className="deck-stat-label">cards</span>
                      </div>
                      <div className="deck-card-stat">
                        <span className={`deck-stat-value ${due > 0 ? 'color-due' : 'color-done'}`}>
                          {due}
                        </span>
                        <span className="deck-stat-label">due</span>
                      </div>
                    </div>

                    {/* Simple progress indicator */}
                    <div className="deck-card-progress">
                      <div className="progress-label">
                        <span>Study Progress</span>
                        <span>{total > 0 ? Math.round(((total - due) / total) * 100) : 0}%</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div
                          className="progress-bar-fg"
                          style={{ width: `${total > 0 ? ((total - due) / total) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="deck-card-footer-buttons">
                      <button className="btn btn-primary btn-sm" onClick={() => onSelectReview(name)}>
                        {due > 0 ? `Review Due (${due})` : 'Custom Review'}
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={() => onAddCardToDeck(name)}>
                        + Add Card
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
}
