import fs from 'node:fs'
import path from 'node:path'
import chalk from 'chalk'
import { importCards } from '../store.js'

export function importCommand(args: string[]) {
  const filePath = args[0]
  if (!filePath) {
    console.log(chalk.yellow('Usage: import <file.json>'))
    return
  }

  let data: string
  try {
    data = fs.readFileSync(path.resolve(filePath), 'utf-8')
  } catch {
    console.log(chalk.red(`Cannot read file: ${filePath}`))
    return
  }

  let cards: { front: string; back: string; deck?: string }[]
  try {
    cards = JSON.parse(data)
    if (!Array.isArray(cards)) throw new Error('not an array')
    for (const c of cards) {
      if (!c.front || !c.back) throw new Error('missing front/back')
    }
  } catch (e: any) {
    console.log(chalk.red(`Invalid JSON: ${e.message}`))
    return
  }

  const count = importCards(cards)
  console.log(chalk.green(`Imported ${count} card(s) from ${filePath}`))
}
