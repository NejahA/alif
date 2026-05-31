import chalk from 'chalk'
import { reviewCard, updateCard } from '../store.js'

export function rightCommand(args: string[]) {
  const id = args[0]
  if (!id) {
    console.log(chalk.red('Usage: right <card-id>'))
    return
  }

  const reviewed = reviewCard(id, 5)
  if (!reviewed) {
    console.log(chalk.red(`No card found: ${id}`))
    return
  }

  const moved = updateCard(id, { deck: 'right' })
  console.log(chalk.green(`Marked right: ${id} — deck: ${moved?.deck} — next due ${new Date(reviewed.due).toLocaleDateString()}`))
}

export default rightCommand
