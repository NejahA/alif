import React, { useState, useEffect } from 'react'
import type { Card } from '../types'
import {
  playFlipSound,
  playSuccessSound,
  playFailureSound,
  playTickSound,
  playAlarmSound,
  playFanfareSound
} from '../sound'

interface ReviewSessionProps {
  deckName?: string // undefined means "All Decks"
  cards: Card[] // All cards in the system (we will filter them here)
  onReviewCard: (id: string, quality: number) => void
  onClose: () => void
}

export const ReviewSession: React.FC<ReviewSessionProps> = ({
  deckName,
  cards,
  onReviewCard,
  onClose,
}) => {
  const [sessionCards, setSessionCards] = useState<Card[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [reviewedCount, setReviewedCount] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [isCustomStudy, setIsCustomStudy] = useState(false)

  // Pomodoro Focus Timer State
  const [pomoTimeLeft, setPomoTimeLeft] = useState(25 * 60)
  const [pomoMode, setPomoMode] = useState<'study' | 'break'>('study')
  const [pomoActive, setPomoActive] = useState(false)

  // MCQ & Cloze States
  const [selectedMCQOption, setSelectedMCQOption] = useState<string | null>(null)
  const [clozeInputs, setClozeInputs] = useState<Record<number, string>>({})
  
  // Standard Type-in state
  const [enableTypeIn, setEnableTypeIn] = useState(false)
  const [typeInValue, setTypeInValue] = useState('')

  // Initialize session cards
  useEffect(() => {
    const now = Date.now()
    let pool = cards.filter(c => !deckName || c.deck === deckName)
    let duePool = pool.filter(c => c.due <= now)

    if (duePool.length > 0) {
      setSessionCards(duePool.sort(() => Math.random() - 0.5))
      setIsCustomStudy(false)
    } else {
      setSessionCards(pool.sort(() => Math.random() - 0.5))
      setIsCustomStudy(true)
    }
    setCurrentIndex(0)
    setIsFlipped(false)
    setIsFinished(false)
    setReviewedCount(0)
    setShowHint(false)
    setSelectedMCQOption(null)
    setClozeInputs({})
    setTypeInValue('')
  }, [deckName, cards])

  // Sound triggering on finished sheet
  useEffect(() => {
    if (isFinished && reviewedCount > 0) {
      playFanfareSound()
    }
  }, [isFinished, reviewedCount])

  // Pomodoro Ticking Effects
  useEffect(() => {
    let timer: any = null
    if (pomoActive && pomoTimeLeft > 0) {
      timer = setInterval(() => {
        setPomoTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            // Trigger alarms and switch modes
            playAlarmSound()
            if (pomoMode === 'study') {
              alert('🍅 Pomodoro interval completed! Time for a short break.')
              setPomoMode('break')
              return 5 * 60 // 5 min break
            } else {
              alert('💪 Break complete! Get ready to study again.')
              setPomoMode('study')
              return 25 * 60 // 25 min work
            }
          }
          // Tick every 10 seconds or last 5 seconds
          if (prev % 60 === 0 || prev <= 6) {
            playTickSound()
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [pomoActive, pomoTimeLeft, pomoMode])

  const togglePomo = () => {
    setPomoActive(prev => !prev)
    playTickSound()
  }

  const formatPomoTime = () => {
    const minutes = Math.floor(pomoTimeLeft / 60)
    const seconds = pomoTimeLeft % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  // Handle rating submissions
  const handleRate = (quality: number) => {
    if (sessionCards.length === 0) return
    const currentCard = sessionCards[currentIndex]

    // Play chimes based on quality
    if (quality >= 3) {
      playSuccessSound()
    } else {
      playFailureSound()
    }

    onReviewCard(currentCard.id, quality)
    setReviewedCount(prev => prev + 1)

    if (currentIndex < sessionCards.length - 1) {
      setIsFlipped(false)
      setShowHint(false)
      setSelectedMCQOption(null)
      setClozeInputs({})
      setTypeInValue('')
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1)
      }, 200)
    } else {
      setIsFinished(true)
    }
  }

  const handleReveal = () => {
    setIsFlipped(true)
    playFlipSound()
  }

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished || sessionCards.length === 0) return

      // Don't capture keyboard shortcuts if typing inside an active cloze input or standard text area!
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return
      }

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault()
        if (!isFlipped) {
          handleReveal()
        }
      } else if (isFlipped && e.key >= '0' && e.key <= '5') {
        const quality = parseInt(e.key, 10)
        handleRate(quality)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFlipped, currentIndex, sessionCards, isFinished])

  if (sessionCards.length === 0) {
    return (
      <div className="review-container empty-session animate-fade-in">
        <div className="review-card-panel text-center">
          <h2>No Cards Found</h2>
          <p className="subtext">
            There are no cards in the <strong>{deckName || 'default'}</strong> deck.
          </p>
          <button className="btn btn-primary" onClick={onClose}>
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (isFinished) {
    return (
      <div className="review-container session-finished animate-fade-in">
        <div className="finished-panel card-glow-purple">
          <div className="trophy-icon">🏆</div>
          <h2>Session Completed!</h2>
          <p className="finished-desc">
            Awesome! You reviewed <strong>{reviewedCount}</strong> {reviewedCount === 1 ? 'card' : 'cards'} in{' '}
            <strong>{deckName || 'All Decks'}</strong>.
          </p>
          {isCustomStudy && (
            <p className="custom-study-note">
              This was a custom study session. Keep practicing to maintain your streak!
            </p>
          )}
          <div className="finished-actions">
            <button className="btn btn-primary btn-lg" onClick={onClose}>
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentCard = sessionCards[currentIndex]
  const cardType = currentCard.type || 'standard'

  // Cloze parser: Splits text on double curly-braces
  const parseCloze = (text: string) => {
    const parts = text.split(/\{\{|\}\}/g)
    const result: React.ReactNode[] = []
    let inputIdx = 0

    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 1) {
        // This is a Cloze hidden portion
        const expected = parts[i]
        const currentIdx = inputIdx
        result.push(
          <input
            key={`cloze-${i}`}
            type="text"
            className="cloze-blank-input"
            value={clozeInputs[currentIdx] || ''}
            onChange={(e) => {
              setClozeInputs(prev => ({ ...prev, [currentIdx]: e.target.value }))
            }}
            placeholder="..."
            disabled={isFlipped}
            style={{ width: `${Math.max(60, expected.length * 12)}px` }}
          />
        )
        inputIdx++
      } else {
        result.push(<span key={`text-${i}`}>{parts[i]}</span>)
      }
    }
    return { rendered: result, answers: parts.filter((_, idx) => idx % 2 === 1) }
  }

  const { rendered: clozeRendered, answers: clozeExpectedAnswers } =
    cardType === 'cloze' ? parseCloze(currentCard.front) : { rendered: [], answers: [] }

  const ratings = [
    { score: 0, label: 'Forgot', className: 'btn-forgot', desc: 'No memory' },
    { score: 1, label: 'Wrong', className: 'btn-wrong', desc: 'Slight recognition' },
    { score: 2, label: 'Close', className: 'btn-close', desc: 'Recognized with errors' },
    { score: 3, label: 'Hard', className: 'btn-hard', desc: 'Recalled with effort' },
    { score: 4, label: 'Good', className: 'btn-good', desc: 'Recalled with slight delay' },
    { score: 5, label: 'Easy', className: 'btn-easy', desc: 'Instant recall' },
  ]

  return (
    <div className="review-container animate-fade-in">
      <header className="review-header">
        <div className="review-info">
          <h2>
            Studying: <span className="deck-tag">{deckName || 'All Decks'}</span>
            {isCustomStudy && <span className="badge badge-custom-study">Custom Study</span>}
          </h2>
          <span className="progress-text">
            Card {currentIndex + 1} of {sessionCards.length}
          </span>
        </div>

        {/* Dynamic Pomodoro widget */}
        <div className={`pomodoro-header-widget ${pomoActive ? 'active' : ''}`} title="Pomodoro Flow Timer">
          <span className={`pomo-label ${pomoMode}`}>{pomoMode}</span>
          <span className={`pomo-time ${pomoActive ? 'ticking' : ''}`}>{formatPomoTime()}</span>
          <button className="btn-pomo-ctrl" onClick={togglePomo}>
            {pomoActive ? '⏸ Pause' : '▶ Play'}
          </button>
        </div>

        <button className="btn-close-session" onClick={onClose} title="Quit Session">
          ✕
        </button>
      </header>

      {/* Progress Bar */}
      <div className="session-progress-bar-container">
        <div
          className="session-progress-bar"
          style={{ width: `${((currentIndex + 1) / sessionCards.length) * 100}%` }}
        ></div>
      </div>

      {/* 3D Flip Card Container */}
      <div className="flashcard-scene" onClick={() => !isFlipped && handleReveal()}>
        <div className={`flashcard ${isFlipped ? 'is-flipped' : ''}`}>
          
          {/* Card Front */}
          <div className="card-face card-front">
            <div className="card-header-label">
              {cardType.toUpperCase()} RECALL
            </div>
            
            <div className="card-body-content">
              {cardType === 'cloze' ? (
                <p className="cloze-front-content">{clozeRendered}</p>
              ) : cardType === 'mcq' ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
                  <p className="card-text">{currentCard.front}</p>
                  <div className="mcq-options-layout" onClick={(e) => e.stopPropagation()}>
                    {currentCard.options?.map((opt) => {
                      const isCorrect = opt === currentCard.back
                      const isSelected = selectedMCQOption === opt
                      
                      let btnClass = ''
                      if (isFlipped) {
                        if (isCorrect) btnClass = 'selected-correct'
                        else if (isSelected) btnClass = 'selected-wrong'
                      }

                      return (
                        <button
                          key={opt}
                          className={`mcq-option-button ${btnClass}`}
                          disabled={isFlipped}
                          onClick={() => {
                            setSelectedMCQOption(opt)
                            handleReveal()
                          }}
                        >
                          <span>{opt}</span>
                          {isFlipped && isCorrect && <span>✓</span>}
                          {isFlipped && isSelected && !isCorrect && <span>✗</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {currentCard.front.startsWith('`') ? (
                    <code>{currentCard.front.replace(/`/g, '')}</code>
                  ) : (
                    <p className="card-text">{currentCard.front}</p>
                  )}

                  {/* Active Type-in recalls for Standard cards */}
                  {!isFlipped && enableTypeIn && (
                    <div className="typein-recall-container" onClick={(e) => e.stopPropagation()}>
                      <textarea
                        className="typein-input"
                        placeholder="Type answer here to check diff accuracy..."
                        value={typeInValue}
                        onChange={(e) => setTypeInValue(e.target.value)}
                        rows={2}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Standard type-in switcher */}
            {cardType === 'standard' && !isFlipped && (
              <div className="typein-toggle-row" onClick={(e) => e.stopPropagation()}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    className="switch-checkbox"
                    checked={enableTypeIn}
                    onChange={(e) => setEnableTypeIn(e.target.checked)}
                  />
                  <span>Type active recalls</span>
                </label>
              </div>
            )}
            
            {currentCard.hint && (
              <div className="hint-container" onClick={(e) => e.stopPropagation()}>
                {showHint ? (
                  <p className="hint-text">💡 Hint: {currentCard.hint}</p>
                ) : (
                  <button className="btn-hint" onClick={() => setShowHint(true)}>
                    Show Hint
                  </button>
                )}
              </div>
            )}
            
            <div className="card-footer-tip">
              {cardType === 'mcq' ? 'Select an option to check selection' : 'Press Space to reveal expected answer'}
            </div>
          </div>

          {/* Card Back */}
          <div className="card-face card-face-back card-back">
            <div className="card-header-label">CORRECT ANSWER</div>
            <div className="card-body-content">
              {cardType === 'cloze' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                  <p className="cloze-front-content">
                    {currentCard.front.replace(/\{\{|\}\}/g, ' ')}
                  </p>
                  
                  {/* Comparisons */}
                  <div className="cloze-comparison-display">
                    {clozeExpectedAnswers.map((expected, idx) => {
                      const userEntry = (clozeInputs[idx] || '').trim()
                      const matches = userEntry.toLowerCase() === expected.toLowerCase()
                      
                      return (
                        <div key={idx} className="comp-item">
                          <span className="comp-label">Blank #{idx + 1}:</span>
                          <span className={`comp-val ${matches ? 'correct' : 'wrong'}`}>
                            {userEntry || '(Empty entry)'}
                          </span>
                          {!matches && (
                            <>
                              <span style={{ color: 'var(--text-muted)' }}>➔</span>
                              <span className="comp-val expected">{expected}</span>
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {currentCard.back.startsWith('`') ? (
                    <code className="block-code">{currentCard.back.replace(/`/g, '')}</code>
                  ) : (
                    <p className="card-text">{currentCard.back}</p>
                  )}

                  {/* Standard Type-in check diff display */}
                  {cardType === 'standard' && enableTypeIn && typeInValue.trim() && (
                    <div className="cloze-comparison-display" style={{ width: '100%', maxWidth: '480px' }}>
                      <div className="comp-item">
                        <span className="comp-label">Entered:</span>
                        <span className={`comp-val ${typeInValue.trim().toLowerCase() === currentCard.back.trim().toLowerCase() ? 'correct' : 'wrong'}`}>
                          {typeInValue}
                        </span>
                      </div>
                      {typeInValue.trim().toLowerCase() !== currentCard.back.trim().toLowerCase() && (
                        <div className="comp-item">
                          <span className="comp-label">Expected:</span>
                          <span className="comp-val expected">{currentCard.back}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {currentCard.tags && currentCard.tags.length > 0 && (
              <div className="card-tags-list">
                {currentCard.tags.map(t => (
                  <span key={t} className="card-tag">#{t}</span>
                ))}
              </div>
            )}

            <div className="card-footer-tip">
              How well did you recall this?
            </div>
          </div>

        </div>
      </div>

      {/* Answer Panel Controls */}
      <div className="review-controls-panel">
        {!isFlipped ? (
          <button className="btn btn-primary btn-lg btn-reveal" onClick={handleReveal}>
            Reveal Answer (Space)
          </button>
        ) : (
          <div className="rating-controls animate-slide-up">
            <p className="rating-prompt">Rate your recall accuracy (or press keys 0-5):</p>
            <div className="rating-buttons-grid">
              {ratings.map(r => (
                <button
                  key={r.score}
                  className={`btn-rating ${r.className}`}
                  onClick={() => handleRate(r.score)}
                  title={r.desc}
                >
                  <span className="rating-score">{r.score}</span>
                  <span className="rating-label">{r.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
