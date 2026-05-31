export interface Card {
  id: string
  front: string
  back: string
  deck: string
  created: number
  lastReviewed?: number
  ease: number
  interval: number
  due: number
  reviews: number
  tags?: string[]
  hint?: string
  type?: 'standard' | 'cloze' | 'mcq'
  options?: string[] // Used for Multiple Choice questions
}

export interface Deck {
  name: string
  cardCount: number
  dueCount: number
}

export interface Stats {
  totalCards: number
  totalReviews: number
  dueToday: number
  decks: number
  retention: number
  streak: number
  newCards: number
  learningCards: number
  matureCards: number
  tagCounts: Record<string, number>
  duePerDeck: Record<string, number>
  totalPerDeck: Record<string, number>
}
