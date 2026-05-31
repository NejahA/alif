import chalk from 'chalk'
import { findCards } from '../store.js'
import { formatCardText } from '../utils/format.js'

export function searchCommand(args: string[]) {
  const query = args.join(' ')
  if (!query) {
    console.log(chalk.yellow('Usage: search <query>'))
    return
  }

  const results = findCards(query)
  if (results.length === 0) {
    console.log(chalk.dim(`No cards matching "${query}"`))
    return
  }

  console.log(chalk.bold(`\n${results.length} result(s) for "${query}"\n`))
  for (const card of results) {
    const tagsLabel = card.tags && card.tags.length > 0 ? chalk.cyan(` #${card.tags.join(' #')}`) : ''
    const hintLabel = card.hint ? chalk.italic.dim(` (hint: ${card.hint})`) : ''
    console.log(`  ${formatCardText(card.front)}${tagsLabel}${hintLabel}`)
    console.log(chalk.dim(`  └ ${card.back.slice(0, 80).replace(/\n/g, ' ')}`))
    console.log(chalk.dim(`    [${card.deck}]  id: ${card.id.slice(0, 8)}...`))
  }
  console.log()
}
