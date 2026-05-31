import chalk from 'chalk'
import { getCards, deleteCard, deleteDeck, resetAll } from '../store.js'

export function deleteCommand(args: string[]) {
  const idOrSearch = args[0]
  if (!idOrSearch) {
    console.log(chalk.yellow('Usage: delete <card-id>'))
    return
  }

  const cards = getCards()
  const card = cards.find(c => c.id.startsWith(idOrSearch))

  if (!card) {
    console.log(chalk.red(`No card found matching "${idOrSearch}"`))
    return
  }

  deleteCard(card.id)
  console.log(chalk.green(`Deleted: ${card.front}`))
}

export function purgeCommand(args: string[]) {
  const deck = args[0]
  if (deck) {
    const count = deleteDeck(deck)
    console.log(chalk.green(`Deleted deck "${deck}" (${count} cards)`))
  } else {
    const count = getCards().length
    resetAll()
    console.log(chalk.green(`Deleted all ${count} cards`))
  }
}
