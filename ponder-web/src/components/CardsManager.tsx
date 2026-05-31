import React, { useState } from 'react'
import type { Card } from '../types'

interface CardsManagerProps {
  cards: Card[]
  decks: string[]
  tags: string[]
  onAddCard: (front: string, back: string, deck: string, tags?: string[], hint?: string, type?: 'standard' | 'cloze' | 'mcq', options?: string[]) => void
  onUpdateCard: (id: string, updates: Partial<Card>) => void
  onDeleteCard: (id: string) => void
  onForgetCard: (id: string) => void
  initialDeckSelection?: string
  showAddModalDirectly?: boolean
  onCloseModalDirectly?: () => void
}

export const CardsManager: React.FC<CardsManagerProps> = ({
  cards,
  decks,
  tags,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onForgetCard,
  initialDeckSelection = 'default',
  showAddModalDirectly = false,
  onCloseModalDirectly,
}) => {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDeck, setSelectedDeck] = useState('All')
  const [selectedTag, setSelectedTag] = useState('All')
  const [selectedState, setSelectedState] = useState('All') // All, Due, New, Learning, Mature

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(showAddModalDirectly)
  const [editingCard, setEditingCard] = useState<Card | null>(null)
  
  // Card form state
  const [formFront, setFormFront] = useState('')
  const [formBack, setFormBack] = useState('')
  const [formDeck, setFormDeck] = useState(initialDeckSelection)
  const [formHint, setFormHint] = useState('')
  const [formTags, setFormTags] = useState('')
  
  // Advanced card type state
  const [formType, setFormType] = useState<'standard' | 'cloze' | 'mcq'>('standard')
  const [formOptions, setFormOptions] = useState('')

  // Custom deck creation in form
  const [showNewDeckInput, setShowNewDeckInput] = useState(false)
  const [newDeckInput, setNewDeckInput] = useState('')

  // Sync modal state from props if opened externally
  React.useEffect(() => {
    if (showAddModalDirectly) {
      setEditingCard(null)
      setFormFront('')
      setFormBack('')
      setFormDeck(initialDeckSelection)
      setFormHint('')
      setFormTags('')
      setFormType('standard')
      setFormOptions('')
      setShowNewDeckInput(false)
      setIsModalOpen(true)
    }
  }, [showAddModalDirectly, initialDeckSelection])

  // Filter logic
  const now = Date.now()
  const filteredCards = cards.filter(card => {
    if (selectedDeck !== 'All' && card.deck !== selectedDeck) return false
    if (selectedTag !== 'All' && (!card.tags || !card.tags.includes(selectedTag))) return false

    if (selectedState !== 'All') {
      if (selectedState === 'Due' && card.due > now) return false
      if (selectedState === 'New' && card.reviews !== 0) return false
      if (selectedState === 'Learning' && (card.reviews === 0 || card.interval > 6)) return false
      if (selectedState === 'Mature' && card.interval <= 6) return false
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchFront = card.front.toLowerCase().includes(q)
      const matchBack = card.back.toLowerCase().includes(q)
      const matchHint = card.hint?.toLowerCase().includes(q) ?? false
      const matchTags = card.tags?.some(t => t.toLowerCase().includes(q)) ?? false
      return matchFront || matchBack || matchHint || matchTags
    }

    return true
  })

  // Open modal for editing
  const handleEditClick = (card: Card) => {
    setEditingCard(card)
    setFormFront(card.front)
    setFormBack(card.back)
    setFormDeck(card.deck)
    setFormHint(card.hint || '')
    setFormTags(card.tags?.join(', ') || '')
    setFormType(card.type || 'standard')
    setFormOptions(card.options?.join(', ') || '')
    setShowNewDeckInput(false)
    setIsModalOpen(true)
  }

  // Open modal for adding
  const handleAddClick = () => {
    setEditingCard(null)
    setFormFront('')
    setFormBack('')
    setFormDeck(decks.length > 0 ? decks[0] : 'default')
    setFormHint('')
    setFormTags('')
    setFormType('standard')
    setFormOptions('')
    setShowNewDeckInput(false)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCard(null)
    if (onCloseModalDirectly) {
      onCloseModalDirectly()
    }
  }

  // Submit form (Save / Create)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formFront.trim() || !formBack.trim()) {
      alert('Front and Back content are required.')
      return
    }

    const deck = (showNewDeckInput ? newDeckInput.trim() : formDeck) || 'default'
    const tagList = formTags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
    const hint = formHint.trim() || undefined
    const parsedOptions = formOptions
      .split(',')
      .map(o => o.trim())
      .filter(Boolean)

    if (editingCard) {
      onUpdateCard(editingCard.id, {
        front: formFront.trim(),
        back: formBack.trim(),
        deck,
        tags: tagList,
        hint,
        type: formType,
        options: formType === 'mcq' ? parsedOptions : undefined,
      })
    } else {
      onAddCard(
        formFront.trim(),
        formBack.trim(),
        deck,
        tagList,
        hint,
        formType,
        formType === 'mcq' ? parsedOptions : undefined
      )
    }

    handleCloseModal()
  }

  const getCardStateLabel = (card: Card) => {
    if (card.due <= now) return <span className="badge badge-due-status">Due</span>
    if (card.reviews === 0) return <span className="badge badge-new-status">New</span>
    if (card.interval <= 6) return <span className="badge badge-learning-status">Learning</span>
    return <span className="badge badge-mature-status">Mature</span>
  }

  return (
    <div className="cards-manager-container animate-fade-in">
      <header className="cards-header">
        <div>
          <h1>Cards Manager</h1>
          <p className="subtext">Browse, search, edit, or reset cards</p>
        </div>
        <div>
          <button className="btn btn-primary" onClick={handleAddClick}>
            + Create New Card
          </button>
        </div>
      </header>

      {/* Filter and Search Panel */}
      <section className="filters-panel card-glow-dark">
        <div className="search-box-wrapper">
          <input
            type="text"
            placeholder="Search front, back, hints, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-text search-input"
          />
        </div>

        <div className="filters-grid">
          <div className="filter-group">
            <label>Deck</label>
            <select
              value={selectedDeck}
              onChange={(e) => setSelectedDeck(e.target.value)}
              className="select-dropdown"
            >
              <option value="All">All Decks</option>
              {decks.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="select-dropdown"
            >
              <option value="All">All Statuses</option>
              <option value="Due">Due for Review</option>
              <option value="New">New</option>
              <option value="Learning">Learning</option>
              <option value="Mature">Mature</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Tag</label>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="select-dropdown"
            >
              <option value="All">All Tags</option>
              {tags.map(t => (
                <option key={t} value={t}>
                  #{t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Cards Catalog */}
      <section className="cards-catalog-section">
        <div className="catalog-meta">
          <span>Showing {filteredCards.length} of {cards.length} cards</span>
        </div>

        {filteredCards.length === 0 ? (
          <div className="empty-state card-glow-dark">
            <p>No cards match your filters.</p>
          </div>
        ) : (
          <div className="cards-table-container">
            <table className="cards-table">
              <thead>
                <tr>
                  <th>Front</th>
                  <th>Back</th>
                  <th>Type</th>
                  <th>Deck</th>
                  <th>Status</th>
                  <th>Interval / Ease</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCards.map(card => (
                  <tr key={card.id}>
                    <td className="cell-code card-cell-front">
                      <div className="cell-content-scroll" title={card.front}>{card.front}</div>
                      {card.hint && <div className="cell-hint">Hint: {card.hint}</div>}
                    </td>
                    <td className="cell-code card-cell-back">
                      <div className="cell-content-scroll" title={card.back}>{card.back}</div>
                      {card.tags && card.tags.length > 0 && (
                        <div className="cell-tags">
                          {card.tags.map(t => (
                            <span key={t} className="cell-tag">#{t}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor:
                            card.type === 'cloze'
                              ? 'var(--accent-cyan-bg)'
                              : card.type === 'mcq'
                              ? 'var(--accent-pink-bg)'
                              : 'var(--bg-tertiary)',
                          color:
                            card.type === 'cloze'
                              ? 'var(--accent-cyan)'
                              : card.type === 'mcq'
                              ? 'var(--accent-pink)'
                              : 'var(--text-secondary)',
                          fontSize: '11px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {card.type || 'standard'}
                      </span>
                    </td>
                    <td>
                      <span className="cell-deck-badge">{card.deck}</span>
                    </td>
                    <td>{getCardStateLabel(card)}</td>
                    <td>
                      <div className="cell-stats">
                        <span>{card.interval}d interval</span>
                        <span>{card.ease.toFixed(2)} ease</span>
                        <span>{card.reviews} revs</span>
                      </div>
                    </td>
                    <td>
                      <div className="cell-actions-buttons">
                        <button className="btn-table btn-table-edit" onClick={() => handleEditClick(card)}>
                          Edit
                        </button>
                        <button
                          className="btn-table btn-table-forget"
                          onClick={() => {
                            if (confirm('Reset learning progress for this card?')) {
                              onForgetCard(card.id)
                            }
                          }}
                          title="Reset memory weight/progress"
                        >
                          Reset
                        </button>
                        <button
                          className="btn-table btn-table-delete"
                          onClick={() => {
                            if (confirm('Delete this card permanently?')) {
                              onDeleteCard(card.id)
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal Editor Form */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content card-glow-purple animate-slide-up">
            <header className="modal-header">
              <h2>{editingCard ? 'Edit Flashcard' : 'Create New Flashcard'}</h2>
              <button className="btn-close-modal" onClick={handleCloseModal}>
                ✕
              </button>
            </header>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Card Type</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as any)}
                  className="select-dropdown"
                >
                  <option value="standard">Standard (Front & Back Q&A)</option>
                  <option value="cloze">Cloze Deletion (Fill in the blank)</option>
                  <option value="mcq">Multiple Choice Question (MCQ)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Front side (Question or Prompt)</label>
                {formType === 'cloze' ? (
                  <p className="form-tip" style={{ color: 'var(--accent-cyan)' }}>
                    💡 Tip: Wrap the blank syntax portion in double curly-braces, e.g.
                    <br />
                    <code>const [value, {"{{setValue}}"}] = useState()</code>
                  </p>
                ) : null}
                <textarea
                  value={formFront}
                  onChange={(e) => setFormFront(e.target.value)}
                  placeholder={
                    formType === 'cloze'
                      ? 'e.g. To perform side-effects in React, use the {{useEffect}} hook.'
                      : 'e.g. What does API stand for?'
                  }
                  rows={3}
                  className="textarea-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Back side (Correct Answer / Explanation)</label>
                <textarea
                  value={formBack}
                  onChange={(e) => setFormBack(e.target.value)}
                  placeholder={
                    formType === 'cloze'
                      ? 'e.g. useEffect (exact blank answer matches front)'
                      : 'e.g. Application Programming Interface.'
                  }
                  rows={2}
                  className="textarea-input"
                  required
                />
              </div>

              {/* Render Multiple Choice Options input */}
              {formType === 'mcq' && (
                <div className="form-group options-config-group animate-fade-in">
                  <label style={{ color: 'var(--accent-pink)' }}>MCQ Choices (comma-separated list)</label>
                  <input
                    type="text"
                    value={formOptions}
                    onChange={(e) => setFormOptions(e.target.value)}
                    placeholder="e.g. Option A, Option B, Option C, Correct Option"
                    className="input-text"
                    required
                  />
                  <p className="form-tip">Must include the correct answer matching the Back side text perfectly.</p>
                </div>
              )}

              <div className="form-group">
                <label>Deck Selection</label>
                {showNewDeckInput ? (
                  <div className="form-group-inline">
                    <input
                      type="text"
                      value={newDeckInput}
                      onChange={(e) => setNewDeckInput(e.target.value)}
                      placeholder="Enter new deck name..."
                      className="input-text"
                      autoFocus
                    />
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setShowNewDeckInput(false)}
                    >
                      Use Existing
                    </button>
                  </div>
                ) : (
                  <div className="form-group-inline">
                    <select
                      value={formDeck}
                      onChange={(e) => setFormDeck(e.target.value)}
                      className="select-dropdown"
                    >
                      {decks.map(d => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                      {decks.length === 0 && <option value="default">default</option>}
                    </select>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setShowNewDeckInput(true)}
                    >
                      + Create New Deck
                    </button>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Hint (Optional)</label>
                <input
                  type="text"
                  value={formHint}
                  onChange={(e) => setFormHint(e.target.value)}
                  placeholder="e.g. Think of hooks"
                  className="input-text"
                />
              </div>

              <div className="form-group">
                <label>Tags (Optional, comma-separated)</label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="e.g. basics, hooks, react"
                  className="input-text"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCard ? 'Save Changes' : 'Create Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
