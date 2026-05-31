import chalk from 'chalk'
import { getCards, forgetCard } from '../store.js'

export function forgetCommand(args: string[]) {
  const idOrSearch = args[0]
  if (!idOrSearch) {
    console.log(chalk.yellow('Usage: forget <card-id>'))
    return
  }

  const cards = getCards()
  const card = cards.find(c => c.id.startsWith(idOrSearch))

  if (!card) {
    console.log(chalk.red(`No card found matching "${idOrSearch}"`))
    return
  }

  forgetCard(card.id)
  console.log(chalk.yellow(`Reset progress for: ${card.front} (will be due again today)`))
}
