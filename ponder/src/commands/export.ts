import fs from 'node:fs'
import path from 'node:path'
import chalk from 'chalk'
import { exportCards } from '../store.js'

export function exportCommand(args: string[]) {
  const deck = args[0]
  const filePath = args[1] || (deck ? `ponder-${deck}.json` : 'ponder-all.json')

  const cards = exportCards(deck)
  if (cards.length === 0) {
    const scope = deck ? ` in deck "${deck}"` : ''
    console.log(chalk.yellow(`No cards${scope} to export`))
    return
  }

  const data = JSON.stringify(cards, null, 2)
  fs.writeFileSync(path.resolve(filePath), data, 'utf-8')
  console.log(chalk.green(`Exported ${cards.length} card(s) to ${filePath}`))
}
