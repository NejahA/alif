import chalk from 'chalk'
import { getCards, getDecks } from '../store.js'
import { formatCardText } from '../utils/format.js'

export function listCommand(args: string[]) {
  const cards = getCards()
  if (cards.length === 0) {
    console.log(chalk.yellow('No cards yet. Add one with: ponder add'))
    return
  }

  const argsCopy = [...args]
  let tagFilter: string | undefined
  const tagIdx = argsCopy.findIndex(arg => arg === '--tag' || arg === '--tags')
  if (tagIdx !== -1 && argsCopy[tagIdx + 1]) {
    tagFilter = argsCopy[tagIdx + 1].toLowerCase()
    argsCopy.splice(tagIdx, 2)
  }

  const deck = argsCopy[0]
  let filtered = deck ? cards.filter(c => c.deck === deck) : cards

  if (tagFilter) {
    filtered = filtered.filter(c => c.tags?.some(t => t.toLowerCase() === tagFilter))
  }

  if (filtered.length === 0) {
    const scope = deck ? ` in deck "${deck}"` : ''
    const tagScope = tagFilter ? ` with tag "${tagFilter}"` : ''
    console.log(chalk.yellow(`No cards${scope}${tagScope}`))
    return
  }

  const decks = getDecks()
  const now = Date.now()

  console.log(chalk.bold(`\n${decks.join(' · ')}\n`))

  for (const card of filtered) {
    const due = card.due <= now
    const tag = due ? chalk.green('●') : chalk.dim('○')
    const deckLabel = deck ? '' : chalk.dim(` [${card.deck}]`)
    const tagsLabel = card.tags && card.tags.length > 0 ? chalk.cyan(` #${card.tags.join(' #')}`) : ''
    const hintLabel = card.hint ? chalk.italic.dim(` (hint: ${card.hint})`) : ''

    console.log(`${tag} ${formatCardText(card.front)}${deckLabel}${tagsLabel}${hintLabel}`)
    console.log(chalk.dim(`   └ ${card.back.slice(0, 60).replace(/\n/g, ' ')}`))
    console.log(chalk.dim(`   id: ${card.id.slice(0, 8)}... | reviews: ${card.reviews}`))
  }
  console.log()
}
