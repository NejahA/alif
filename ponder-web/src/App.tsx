import { useState, useEffect } from 'react'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './components/Dashboard'
import { ReviewSession } from './components/ReviewSession'
import { DecksManager } from './components/DecksManager'
import { CardsManager } from './components/CardsManager'
import { StatsDashboard } from './components/StatsDashboard'
import { Settings } from './components/Settings'
import {
  getCards,
  getStats,
  addCard,
  updateCard,
  deleteCard,
  forgetCard,
  renameDeck,
  deleteDeck,
  reviewCard,
  importCards,
  exportCards,
  resetAll,
  seedInitialData,
  getConfig,
  setConfig,
  getDecks,
} from './sm2'
import type { Card, Stats } from './types'
import './App.css'

function App() {
  const [currentTab, setTab] = useState<string>('dashboard')
  const [cards, setCards] = useState<Card[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  
  // Review session state
  const [activeReviewDeck, setActiveReviewDeck] = useState<string | undefined>(null as any) // undefined = all, null = inactive
  const [isReviewing, setIsReviewing] = useState(false)
  
  // Modal state for adding cards from dashboard or decks
  const [showAddCardModal, setShowAddCardModal] = useState(false)
  const [initialDeckForModal, setInitialDeckForModal] = useState('default')
  
  // Tracks empty decks manually created by the user
  const [customDecks, setCustomDecks] = useState<string[]>(() => {
    const saved = localStorage.getItem('ponder_custom_decks')
    return saved ? JSON.parse(saved) : []
  })

  const [, setSoundTrigger] = useState(0)

  // Seed data and load state on mount
  useEffect(() => {
    seedInitialData()
    refreshState()

    const handleStorageUpdate = () => {
      setSoundTrigger(prev => prev + 1)
    }
    window.addEventListener('storage', handleStorageUpdate)
    return () => window.removeEventListener('storage', handleStorageUpdate)
  }, [])

  // Sync custom decks to localStorage
  useEffect(() => {
    localStorage.setItem('ponder_custom_decks', JSON.stringify(customDecks))
  }, [customDecks])

  const refreshState = () => {
    const loadedCards = getCards()
    setCards(loadedCards)
    setStats(getStats())
  }

  // Cards management wrappers
  const handleReviewCard = (id: string, quality: number) => {
    reviewCard(id, quality)
    refreshState()
  }

  const handleAddCard = (front: string, back: string, deck: string, tags?: string[], hint?: string, type?: 'standard' | 'cloze' | 'mcq', options?: string[]) => {
    addCard(front, back, deck, tags, hint, type, options)
    // If the deck added was a manually created empty custom deck, remove it from empty trackers since it now has cards
    if (customDecks.includes(deck)) {
      setCustomDecks(prev => prev.filter(d => d !== deck))
    }
    refreshState()
  }

  const handleUpdateCard = (id: string, updates: Partial<Card>) => {
    updateCard(id, updates)
    // Remove updated deck from customDecks if it was there (since it now has cards)
    if (updates.deck && customDecks.includes(updates.deck)) {
      setCustomDecks(prev => prev.filter(d => d !== updates.deck))
    }
    refreshState()
  }

  const handleDeleteCard = (id: string) => {
    deleteCard(id)
    refreshState()
  }

  const handleForgetCard = (id: string) => {
    forgetCard(id)
    refreshState()
  }

  // Decks management wrappers
  const handleCreateDeck = (name: string) => {
    const trimmed = name.trim()
    if (trimmed && !customDecks.includes(trimmed)) {
      setCustomDecks(prev => [...prev, trimmed])
    }
  }

  const handleRenameDeck = (oldName: string, newName: string) => {
    const trimmedNew = newName.trim()
    if (!trimmedNew) return

    // Update cards deck
    renameDeck(oldName, trimmedNew)

    // Update empty decks list if it was empty
    setCustomDecks(prev => {
      const updated = prev.filter(d => d !== oldName)
      // If oldName was empty and newName is not already in customDecks, put it in customDecks
      const totalInNew = getCards().filter(c => c.deck === trimmedNew).length
      if (totalInNew === 0 && !updated.includes(trimmedNew)) {
        updated.push(trimmedNew)
      }
      return updated
    })

    refreshState()
  }

  const handleDeleteDeck = (deck: string) => {
    deleteDeck(deck)
    setCustomDecks(prev => prev.filter(d => d !== deck))
    refreshState()
  }

  // Settings configs
  const handleUpdateDailyLimit = (limit: number) => {
    setConfig({ dailyLimit: limit })
    refreshState()
  }

  const handleExportData = () => {
    const data = exportCards()
    const jsonStr = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `ponder-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportData = (file: File): Promise<number | string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const result = e.target?.result
          if (typeof result !== 'string') {
            resolve('Invalid file format')
            return
          }
          const parsed = JSON.parse(result)
          if (!Array.isArray(parsed)) {
            resolve('Data must be a JSON array of cards')
            return
          }

          const count = importCards(parsed)
          refreshState()
          resolve(count)
        } catch (err: any) {
          resolve(err.message || 'JSON parsing failed')
        }
      }
      reader.onerror = () => resolve('File reading failed')
      reader.readAsText(file)
    })
  }

  const handleResetAll = () => {
    resetAll()
    setCustomDecks([])
    refreshState()
  }

  const handleSeedData = () => {
    // Force seeding by resetting first
    resetAll()
    setCustomDecks([])
    seedInitialData()
    refreshState()
    alert('Starter decks seeded successfully!')
  }

  // Review sessions setup
  const startReviewSession = (deck?: string) => {
    setActiveReviewDeck(deck as any)
    setIsReviewing(true)
  }

  const endReviewSession = () => {
    setIsReviewing(false)
    setActiveReviewDeck(null as any)
    refreshState()
  }

  // Deck click shortcuts
  const handleAddCardToDeckShortcut = (deck: string) => {
    setInitialDeckForModal(deck)
    setShowAddCardModal(true)
    setTab('cards')
  }

  const handleAddCardGeneralShortcut = () => {
    setInitialDeckForModal(decks.length > 0 ? decks[0] : 'default')
    setShowAddCardModal(true)
    setTab('cards')
  }

  if (!stats) {
    return <div className="loading-screen">Loading Ponder Workspace...</div>
  }

  // Decks list (derived from cards + manually added empty decks)
  const decks = Array.from(new Set([...getDecks(), ...customDecks])).sort()
  
  // Extract all unique tags
  const tags = Array.from(
    new Set(
      cards.flatMap(c => c.tags || [])
    )
  ).sort()

  const dailyLimit = getConfig().dailyLimit

  // Render Full Screen active review player
  if (isReviewing) {
    return (
      <div className="app-viewport active-study-session">
        <main className="app-main-content">
          <ReviewSession
            deckName={activeReviewDeck}
            cards={cards}
            onReviewCard={handleReviewCard}
            onClose={endReviewSession}
          />
        </main>
      </div>
    )
  }

  return (
    <div className="app-viewport">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setTab={setTab}
        dueCount={stats.dueToday}
      />

      {/* Main Panel Content Area */}
      <main className="app-main-content">
        <div className="panel-scroll-container">
          {currentTab === 'dashboard' && (
            <Dashboard
              stats={stats}
              onSelectReview={startReviewSession}
              onAddCardClick={handleAddCardGeneralShortcut}
            />
          )}

          {currentTab === 'review' && (
            <div className="study-selector-tab animate-fade-in">
              <header className="selector-header">
                <h1>Study Deck Selection</h1>
                <p className="subtext">Select a deck or review all pending cards</p>
              </header>

              <div className="selector-options-grid">
                <button className="option-card card-glow-purple" onClick={() => startReviewSession()}>
                  <div className="option-icon">⚡</div>
                  <h3>Review All Decks</h3>
                  <p className="option-desc">Study all due cards across your entire database.</p>
                  <span className="badge badge-due-selector">{stats.dueToday} cards due</span>
                </button>

                {decks.map(deckName => {
                  const dueCount = stats.duePerDeck[deckName] || 0
                  return (
                    <button
                      key={deckName}
                      className="option-card card-glow-dark"
                      onClick={() => startReviewSession(deckName)}
                    >
                      <div className="option-icon">📁</div>
                      <h3>{deckName}</h3>
                      <p className="option-desc">Review cards filtered only by the "{deckName}" deck.</p>
                      <span className={`badge ${dueCount > 0 ? 'badge-due-selector' : 'badge-done-selector'}`}>
                        {dueCount} due
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {currentTab === 'decks' && (
            <DecksManager
              stats={stats}
              onSelectReview={startReviewSession}
              onAddCardToDeck={handleAddCardToDeckShortcut}
              onRenameDeck={handleRenameDeck}
              onDeleteDeck={handleDeleteDeck}
              onCreateDeck={handleCreateDeck}
              customDecks={customDecks}
            />
          )}

          {currentTab === 'cards' && (
            <CardsManager
              cards={cards}
              decks={decks}
              tags={tags}
              onAddCard={handleAddCard}
              onUpdateCard={handleUpdateCard}
              onDeleteCard={handleDeleteCard}
              onForgetCard={handleForgetCard}
              initialDeckSelection={initialDeckForModal}
              showAddModalDirectly={showAddCardModal}
              onCloseModalDirectly={() => setShowAddCardModal(false)}
            />
          )}

          {currentTab === 'stats' && (
            <StatsDashboard stats={stats} />
          )}

          {currentTab === 'settings' && (
            <Settings
              dailyLimit={dailyLimit}
              onUpdateDailyLimit={handleUpdateDailyLimit}
              onExportData={handleExportData}
              onImportData={handleImportData}
              onResetAll={handleResetAll}
              onSeedData={handleSeedData}
              totalCards={stats.totalCards}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default App
