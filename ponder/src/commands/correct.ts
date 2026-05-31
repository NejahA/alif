import chalk from 'chalk'
import { reviewCard } from '../store.js'

export function correctCommand(args: string[]) {
  const id = args[0]
  if (!id) {
    console.log(chalk.red('Usage: correct <card-id>'))
    return
  }

  const updated = reviewCard(id, 5)
  if (!updated) {
    console.log(chalk.red(`No card found: ${id}`))
    return
  }

  console.log(chalk.green(`Marked correct: ${id} — next due ${new Date(updated.due).toLocaleDateString()}`))
}

export default correctCommand
