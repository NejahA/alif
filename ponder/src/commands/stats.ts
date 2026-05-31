import chalk from 'chalk'
import { getStats } from '../store.js'

export function statsCommand() {
  const stats = getStats()

  console.log(chalk.bold('\nPonder Stats\n'))

  const streakStr = stats.streak > 0
    ? chalk.green(`${stats.streak} day(s) `) + chalk.red('🔥')
    : chalk.dim('none')

  console.log(chalk.dim('  Overview'))
  console.log(`    ${chalk.cyan('Total cards:')}   ${stats.totalCards}`)
  console.log(`    ${chalk.cyan('Total decks:')}   ${stats.decks}`)
  console.log(`    ${chalk.cyan('Reviews done:')}  ${stats.totalReviews}`)
  console.log(`    ${chalk.cyan('Due today:')}     ${stats.dueToday > 0 ? chalk.yellow(stats.dueToday) : chalk.green(stats.dueToday)}`)
  console.log(`    ${chalk.cyan('Retention:')}     ${stats.retention >= 80 ? chalk.green(`${stats.retention}%`) : chalk.yellow(`${stats.retention}%`)}`)
  console.log(`    ${chalk.cyan('Streak:')}        ${streakStr}`)

  console.log(chalk.dim('\n  Card Status'))
  console.log(`    ${chalk.blue('New:')} ${stats.newCards}  |  ${chalk.yellow('Learning:')} ${stats.learningCards}  |  ${chalk.green('Mature:')} ${stats.matureCards}`)

  if (stats.totalCards > 0) {
    console.log(chalk.dim('\n  Decks Distribution'))
    const deckNames = Object.keys(stats.totalPerDeck).sort()
    const maxDeckNameLen = Math.max(...deckNames.map(n => n.length), 10)

    for (const deck of deckNames) {
      const total = stats.totalPerDeck[deck]
      const due = stats.duePerDeck[deck] || 0
      const ratio = total / stats.totalCards
      const barSize = 20
      const barChars = Math.round(ratio * barSize)
      const bar = chalk.cyan('█'.repeat(barChars)) + chalk.dim('░'.repeat(barSize - barChars))

      const dueLabel = due > 0 ? chalk.yellow(`${due} due`) : chalk.green('done')
      const namePadding = ' '.repeat(maxDeckNameLen - deck.length)
      console.log(`    ${chalk.cyan(deck)}${namePadding} [${bar}] ${total} cards (${dueLabel})`)
    }
  }

  const tags = Object.entries(stats.tagCounts)
  if (tags.length > 0) {
    console.log(chalk.dim('\n  Top Tags'))
    const topTags = tags.sort((a, b) => b[1] - a[1]).slice(0, 5)
    const tagLine = topTags.map(([tag, count]) => `${chalk.cyan('#' + tag)} (${count})`).join('  ')
    console.log(`    ${tagLine}`)
  }

  console.log()
}
