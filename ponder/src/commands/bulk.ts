import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import fs from 'node:fs'
import path from 'node:path'
import chalk from 'chalk'
import { addCard, getDecks } from '../store.js'

export async function bulkCommand(args: string[]) {
  const filePath = args[0]

  let lines: string[]

  if (filePath) {
    try {
      const text = fs.readFileSync(path.resolve(filePath), 'utf-8')
      lines = text.split('\n').filter(l => l.trim())
    } catch {
      console.log(chalk.red(`Cannot read file: ${filePath}`))
      return
    }
  } else {
    const rl = readline.createInterface({ input, output })
    console.log(chalk.dim('Paste cards (front | back | deck), one per line. Ctrl+C to finish:\n'))
    const inputLines: string[] = []
    for await (const line of rl) {
      if (!line.trim()) break
      inputLines.push(line)
    }
    lines = inputLines
    rl.close()
  }

  let count = 0
  for (const line of lines) {
    const parts = line.split('|').map(s => s.trim())
    if (parts.length >= 2) {
      const front = parts[0]
      const back = parts[1]
      const deck = parts[2] || 'default'
      const tags = parts[3] ? parts[3].split(',').map(t => t.trim()).filter(Boolean) : undefined
      const hint = parts[4] || undefined
      addCard(front, back, deck, tags, hint)
      count++
    }
  }

  console.log(chalk.green(`\nAdded ${count} card(s)`))
}
