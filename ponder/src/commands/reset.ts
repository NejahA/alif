import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import chalk from 'chalk'
import { getCards, resetAll } from '../store.js'

export async function resetCommand(args: string[], rl?: readline.Interface) {
  const ownRl = !rl
  if (!rl) {
    const readline = await import('node:readline/promises')
    rl = readline.createInterface({ input, output })
  }

  const force = args.includes('--force') || args.includes('-f')
  const count = getCards().length

  if (count === 0) {
    console.log(chalk.green('No cards to reset.'))
    if (ownRl) rl.close()
    return
  }

  if (!force) {
    const answer = await rl.question(chalk.yellow(`Reset all ${count} cards? Type "yes" to confirm: `))
    if (answer.trim().toLowerCase() !== 'yes') {
      console.log(chalk.dim('Reset cancelled.'))
      if (ownRl) rl.close()
      return
    }
  }

  resetAll()
  console.log(chalk.green(`Reset ${count} card(s). Deck is empty now.`))
  if (ownRl) rl.close()
}
