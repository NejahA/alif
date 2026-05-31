import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import chalk from 'chalk'
import { getCards, updateCard, getDecks } from '../store.js'

export async function editCommand(args: string[]) {
  const rl = readline.createInterface({ input, output })

  const idOrSearch = args[0]
  if (!idOrSearch) {
    console.log(chalk.yellow('Usage: edit <card-id> [field] [new-value]'))
    rl.close()
    return
  }

  const cards = getCards()
  const card = cards.find(c => c.id.startsWith(idOrSearch))

  if (!card) {
    console.log(chalk.red(`No card found matching "${idOrSearch}"`))
    rl.close()
    return
  }

  const field = args[1]
  if (field && args[2]) {
    const value = args.slice(2).join(' ')
    let finalValue: any = value
    if (field === 'tags' || field === 'tag') {
      finalValue = value === '-' ? [] : value.split(',').map(t => t.trim()).filter(Boolean)
    } else if (field === 'hint' && value === '-') {
      finalValue = ''
    }
    const updates: Record<string, any> = { [field === 'tag' ? 'tags' : field]: finalValue }
    updateCard(card.id, updates as any)
    console.log(chalk.green(`Updated ${field} for card ${card.id.slice(0, 8)}...`))
    rl.close()
    return
  }

  console.log(chalk.bold(`\nEditing card: ${card.front}\n`))
  const newFront = await rl.question(chalk.cyan(`Front [${card.front}]: `)) || card.front
  const newBack = await rl.question(chalk.cyan(`Back [${card.back}]: `)) || card.back
  const decks = getDecks()
  const deckHint = decks.length > 0 ? ` (${decks.join(', ')})` : ''
  const newDeck = await rl.question(chalk.cyan(`Deck${deckHint} [${card.deck}]: `)) || card.deck

  const newTags = await rl.question(chalk.cyan(`Tags (comma separated, "-" to clear) [${card.tags?.join(', ') || 'none'}]: `))
  let parsedTags: string[] | undefined = card.tags
  if (newTags.trim() === '-') {
    parsedTags = []
  } else if (newTags.trim()) {
    parsedTags = newTags.split(',').map(t => t.trim()).filter(Boolean)
  }

  const newHint = await rl.question(chalk.cyan(`Hint ("-" to clear) [${card.hint || 'none'}]: `))
  let parsedHint: string | undefined = card.hint
  if (newHint.trim() === '-') {
    parsedHint = ''
  } else if (newHint.trim()) {
    parsedHint = newHint.trim()
  }

  updateCard(card.id, { front: newFront, back: newBack, deck: newDeck, tags: parsedTags, hint: parsedHint } as any)
  console.log(chalk.green(`\nCard updated.`))
  rl.close()
}
