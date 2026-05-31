import type { Card, Stats } from './types'

const CARDS_KEY = 'ponder_cards'
const CONFIG_KEY = 'ponder_config'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export function getConfig(): { dailyLimit: number } {
  const cfg = localStorage.getItem(CONFIG_KEY)
  if (cfg) {
    try {
      return JSON.parse(cfg)
    } catch {
      // Use default
    }
  }
  return { dailyLimit: 20 }
}

export function setConfig(updates: Partial<{ dailyLimit: number }>) {
  const cfg = getConfig()
  localStorage.setItem(CONFIG_KEY, JSON.stringify({ ...cfg, ...updates }))
}

export function getCards(): Card[] {
  const cards = localStorage.getItem(CARDS_KEY)
  if (cards) {
    try {
      return JSON.parse(cards)
    } catch {
      // Use default
    }
  }
  return []
}

export function saveCards(cards: Card[]) {
  localStorage.setItem(CARDS_KEY, JSON.stringify(cards))
}

export function addCard(front: string, back: string, deck: string = 'default', tags?: string[], hint?: string, type?: 'standard' | 'cloze' | 'mcq', options?: string[]): Card {
  const now = Date.now()
  const card: Card = {
    id: generateId(),
    front,
    back,
    deck: deck.trim() || 'default',
    created: now,
    lastReviewed: 0,
    ease: 2.5,
    interval: 0,
    due: now,
    reviews: 0,
    tags: tags?.map(t => t.trim()).filter(Boolean) || [],
    hint: hint?.trim() || undefined,
    type: type || 'standard',
    options: options || undefined,
  }
  const cards = getCards()
  saveCards([...cards, card])
  return card
}

export function getDueCards(deck?: string): Card[] {
  const now = Date.now()
  return getCards().filter(c => {
    if (deck && c.deck !== deck) return false
    return c.due <= now
  })
}

export function getDecks(): string[] {
  const decks = new Set(getCards().map(c => c.deck))
  return [...decks].sort()
}

export function findCards(query: string, deck?: string): Card[] {
  const q = query.toLowerCase()
  return getCards().filter(c => {
    if (deck && c.deck !== deck) return false
    const matchTags = c.tags?.some(t => t.toLowerCase().includes(q)) ?? false
    return c.front.toLowerCase().includes(q) || c.back.toLowerCase().includes(q) || matchTags
  })
}

export function updateCard(id: string, updates: Partial<Card>): Card | null {
  const cards = getCards()
  let found = false
  const newCards = cards.map(c => {
    if (c.id === id) {
      found = true
      // Process tags to trim and filter out empties if updating tags
      const updatedCard = { ...c, ...updates }
      if (updates.tags) {
        updatedCard.tags = updates.tags.map(t => t.trim()).filter(Boolean)
      }
      return updatedCard
    }
    return c
  })
  if (!found) return null
  saveCards(newCards)
  return newCards.find(c => c.id === id) ?? null
}

export function deleteCard(id: string): boolean {
  const cards = getCards()
  const filtered = cards.filter(c => c.id !== id)
  if (filtered.length === cards.length) return false
  saveCards(filtered)
  return true
}

export function deleteDeck(deck: string): number {
  const cards = getCards()
  const before = cards.length
  const filtered = cards.filter(c => c.deck !== deck)
  saveCards(filtered)
  return before - filtered.length
}

export function renameDeck(oldName: string, newName: string): number {
  const cards = getCards()
  let count = 0
  const newCards = cards.map(c => {
    if (c.deck === oldName) {
      count++
      return { ...c, deck: newName.trim() || 'default' }
    }
    return c
  })
  saveCards(newCards)
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

export function importCards(newCardsData: { front: string; back: string; deck?: string; tags?: string[]; hint?: string; type?: 'standard' | 'cloze' | 'mcq'; options?: string[] }[]): number {
  const existing = getCards()
  const now = Date.now()
  const imported = newCardsData.map(c => ({
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
    tags: c.tags || [],
    hint: c.hint,
    type: c.type || 'standard',
    options: c.options,
  }))
  saveCards([...existing, ...imported])
  return imported.length
}

export function exportCards(deck?: string) {
  let cards = getCards()
  if (deck) cards = cards.filter(c => c.deck === deck)
  return cards.map(c => ({ front: c.front, back: c.back, deck: c.deck, tags: c.tags, hint: c.hint, type: c.type, options: c.options }))
}

export function resetAll() {
  saveCards([])
}

export function countDue(): number {
  return getDueCards().length
}

export function getStats(): Stats {
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
    if (reviewDays.has(d)) {
      streak++
    } else if (streak > 0) {
      break
    }
  }
  return streak
}

export function seedInitialData() {
  const cards = getCards()
  if (cards.length > 0) return

  const seedDecks = [
    {
      name: 'JavaScript',
      cards: [
        { front: 'What is a closure?', back: 'A function bundled together with references to its surrounding state (the lexical environment).', tags: ['js', 'basics', 'scope'], type: 'standard' as const },
        { front: 'Array map() vs forEach()', back: 'map() returns a new array; forEach() mutates/iterates and returns undefined.', tags: ['js', 'arrays'], type: 'standard' as const },
        { front: 'To create side-effects in React, use the {{useEffect}} hook.', back: 'useEffect', tags: ['react', 'hooks'], type: 'cloze' as const, hint: 'Starts with use...' },
        { front: 'Which method schedules a microtask execution?', back: 'queueMicrotask()', tags: ['js', 'async'], type: 'mcq' as const, options: ['setTimeout()', 'queueMicrotask()', 'requestAnimationFrame()', 'setInterval()'] },
      ],
    },
    {
      name: 'Algorithms',
      cards: [
        { front: 'What is the Big-O time complexity of binary search?', back: 'O(log n) since the search space is cut in half at each step.', tags: ['algorithms', 'search'], type: 'standard' as const },
        { front: 'Average Big-O of Quicksort is {{O(n log n)}}.', back: 'O(n log n)', tags: ['algorithms', 'sorting'], type: 'cloze' as const, hint: 'Form of n and log n' },
        { front: 'What data structure operates on a FIFO basis?', back: 'Queue', tags: ['algorithms', 'data-structures'], type: 'mcq' as const, options: ['Stack', 'Queue', 'Graph', 'Binary Tree'] },
      ],
    },
    {
      name: 'Git',
      cards: [
        { front: 'Undo the last commit keeping changes local: {{git reset --soft HEAD~1}}', back: 'git reset --soft HEAD~1', tags: ['git', 'cli'], type: 'cloze' as const },
        { front: 'Stash changes and pop them back later: stashing command is {{git stash}}', back: 'git stash', tags: ['git', 'cli'], type: 'cloze' as const },
      ],
    },
    {
      name: 'Regex',
      cards: [
        { front: 'Match the start of a line with {{^}} and end of a line with {{$}}.', back: '^ and $', tags: ['regex'], type: 'cloze' as const },
        { front: 'Which pattern matches any digit in Regex?', back: '\\d', tags: ['regex'], type: 'mcq' as const, options: ['\\s', '\\w', '\\d', '\\b'] },
      ],
    },
  ]

  let total = 0
  const now = Date.now()
  const imported: Card[] = []
  
  for (const d of seedDecks) {
    for (const c of d.cards) {
      imported.push({
        id: generateId() + total,
        front: c.front,
        back: c.back,
        deck: d.name,
        created: now,
        lastReviewed: 0,
        ease: 2.5,
        interval: 0,
        due: now,
        reviews: 0,
        tags: c.tags,
        type: c.type,
        options: (c as any).options,
        hint: (c as any).hint,
      })
      total++
    }
  }
  saveCards(imported)
}
