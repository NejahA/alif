import Conf from 'conf'
import { Card } from './types.js'

const projectName = process.env.PONDER_PROJECT_NAME || 'ponder'
const config = new Conf<{ cards: Card[]; config: { dailyLimit: number } }>({
  projectName,
  defaults: { cards: [], config: { dailyLimit: 20 } },
})

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export function getConfig() {
  return config.get('config')
}

export function setConfig(updates: Partial<{ dailyLimit: number }>) {
  const cfg = getConfig()
  config.set('config', { ...cfg, ...updates })
}

export function addCard(front: string, back: string, deck: string = 'default', tags?: string[], hint?: string): Card {
  const now = Date.now()
  const card: Card = {
    id: generateId(),
    front,
    back,
    deck,
    created: now,
    lastReviewed: 0,
    ease: 2.5,
    interval: 0,
    due: now,
    reviews: 0,
    tags,
    hint,
  }
  const cards = config.get('cards')
  const newCards = [...cards, card]
  config.set('cards', newCards)
  return card
}

export function getCards(): Card[] {
  return config.get('cards')
}

export function getDueCards(deck?: string): Card[] {
  const now = Date.now()
  return config.get('cards').filter(c => {
    if (deck && c.deck !== deck) return false
    return c.due <= now
  })
}

export function getDecks(): string[] {
  const decks = new Set(config.get('cards').map(c => c.deck))
  return [...decks].sort()
}

export function findCards(query: string, deck?: string): Card[] {
  const q = query.toLowerCase()
  return config.get('cards').filter(c => {
    if (deck && c.deck !== deck) return false
    const matchTags = c.tags?.some(t => t.toLowerCase().includes(q)) ?? false
    return c.front.toLowerCase().includes(q) || c.back.toLowerCase().includes(q) || matchTags
  })
}

export function updateCard(id: string, updates: Partial<Card>): Card | null {
  const cards = config.get('cards')
  let found = false
  const newCards = cards.map(c => {
    if (c.id === id) {
      found = true
      return { ...c, ...updates }
    }
    return c
  })
  if (!found) return null
  config.set('cards', newCards)
  return newCards.find(c => c.id === id) ?? null
}

export function deleteCard(id: string): boolean {
  const cards = config.get('cards')
  const filtered = cards.filter(c => c.id !== id)
  if (filtered.length === cards.length) return false
  config.set('cards', filtered)
  return true
}

export function deleteDeck(deck: string): number {
  const cards = config.get('cards')
  const before = cards.length
  const filtered = cards.filter(c => c.deck !== deck)
  config.set('cards', filtered)
  return before - filtered.length
}

export function renameDeck(oldName: string, newName: string): number {
  const cards = config.get('cards')
  let count = 0
  const newCards = cards.map(c => {
    if (c.deck === oldName) {
      count++
      return { ...c, deck: newName }
    }
    return c
  })
  config.set('cards', newCards)
  return count
}

export function reviewCard(id: string, quality: number): Card | null {
  const card = getCards().find(c => c.id === id)
  if (!card) return null

  const newEase = Math.max(1.3, card.ease + (0.1 - (5 - quality) * 0.08))
  let newInterval: number

  if (quality < 3) {
    newInterval = 0
  } else if (card.interval === 0) {
    newInterval = 1
  } else if (card.interval === 1) {
    newInterval = 6
  } else {
    newInterval = Math.round(card.interval * newEase)
  }

  const now = Date.now()
  const msInDay = 86400000

  return updateCard(id, {
    ease: newEase,
    interval: newInterval,
    due: now + newInterval * msInDay,
    reviews: card.reviews + 1,
    lastReviewed: now,
  })
}

export function forgetCard(id: string): Card | null {
  return updateCard(id, {
    ease: 2.5,
    interval: 0,
    due: Date.now(),
    reviews: 0,
    lastReviewed: 0,
  })
}

export function importCards(cards: { front: string; back: string; deck?: string; tags?: string[]; hint?: string }[]): number {
  const existing = config.get('cards')
  const now = Date.now()
  const imported = cards.map(c => ({
    id: generateId(),
    front: c.front,
    back: c.back,
    deck: c.deck || 'default',
    created: now,
    lastReviewed: 0,
    ease: 2.5,
    interval: 0,
    due: now,
    reviews: 0,
    tags: c.tags,
    hint: c.hint,
  }))
  config.set('cards', [...existing, ...imported])
  return imported.length
}

export function exportCards(deck?: string) {
  let cards = config.get('cards')
  if (deck) cards = cards.filter(c => c.deck === deck)
  return cards.map(c => ({ front: c.front, back: c.back, deck: c.deck, tags: c.tags, hint: c.hint }))
}

export function resetAll() {
  config.set('cards', [])
}

export function countDue(): number {
  return getDueCards().length
}

export function getStats() {
  const cards = getCards()
  const now = Date.now()
  const reviewed = cards.filter(c => c.reviews > 0)
  const due = cards.filter(c => c.due <= now)

  const retention = reviewed.length > 0
    ? Math.round((reviewed.filter(c => c.interval > 1).length / reviewed.length) * 100)
    : 0

  const { duePerDeck, totalPerDeck, newCards, learningCards, matureCards, tagCounts } = cards.reduce(
    (acc, c) => {
      acc.totalPerDeck[c.deck] = (acc.totalPerDeck[c.deck] || 0) + 1
      if (c.due <= now) acc.duePerDeck[c.deck] = (acc.duePerDeck[c.deck] || 0) + 1

      if (c.reviews === 0) {
        acc.newCards++
      } else if (c.interval <= 6) {
        acc.learningCards++
      } else {
        acc.matureCards++
      }

      if (c.tags && Array.isArray(c.tags)) {
        for (const t of c.tags) {
          acc.tagCounts[t] = (acc.tagCounts[t] || 0) + 1
        }
      }

      return acc
    },
    {
      duePerDeck: {} as Record<string, number>,
      totalPerDeck: {} as Record<string, number>,
      newCards: 0,
      learningCards: 0,
      matureCards: 0,
      tagCounts: {} as Record<string, number>
    }
  )

  return {
    totalCards: cards.length,
    totalReviews: cards.reduce((s, c) => s + c.reviews, 0),
    dueToday: due.length,
    decks: Object.keys(totalPerDeck).length,
    retention,
    duePerDeck,
    totalPerDeck,
    streak: calcStreak(cards),
    newCards,
    learningCards,
    matureCards,
    tagCounts,
  }
}

function calcStreak(cards: Card[]): number {
  const reviewDays = new Set<number>()
  for (const c of cards) {
    if (c.reviews > 0) {
      const reviewedAt = c.lastReviewed ?? c.created
      if (reviewedAt > 0) {
        const day = Math.floor(reviewedAt / 86400000)
        reviewDays.add(day)
      }
    }
  }
  if (reviewDays.size === 0) return 0

  const today = Math.floor(Date.now() / 86400000)
  let streak = 0
  for (let d = today; d >= today - 365; d--) {
    if (reviewDays.has(d)) streak++
    else if (streak > 0) break
  }
  return streak
}
