import chalk from 'chalk'
import { getCards, getDecks, renameDeck } from '../store.js'

export function decksCommand() {
  const cards = getCards()
  if (cards.length === 0) {
    console.log(chalk.yellow('No decks yet. Add cards first.'))
    return
  }

  const decks = getDecks()
  console.log(chalk.bold(`\n${decks.length} deck(s)\n`))
  for (const deck of decks) {
    const inDeck = cards.filter(c => c.deck === deck)
    const due = inDeck.filter(c => c.due <= Date.now()).length
    const label = due > 0 ? chalk.yellow(`${due} due`) : chalk.green('done')
    console.log(`  ${chalk.cyan(deck)}  (${inDeck.length} cards, ${label})`)
  }
  console.log()
}

export function renameCommand(args: string[]) {
  const oldName = args[0]
  const newName = args[1]

  if (!oldName || !newName) {
    console.log(chalk.yellow('Usage: rename <old-name> <new-name>'))
    return
  }

  if (oldName === newName) {
    console.log(chalk.yellow('Names are the same'))
    return
  }

  const count = renameDeck(oldName, newName)
  if (count === 0) {
    console.log(chalk.red(`No cards found in deck "${oldName}"`))
    return
  }

  console.log(chalk.green(`Renamed deck "${oldName}" → "${newName}" (${count} cards)`))
}
