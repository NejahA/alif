import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import chalk from 'chalk'
import { getDueCards, reviewCard, getDecks, getConfig, updateCard, deleteCard } from '../store.js'
import { Card } from '../types.js'
import { formatCardText } from '../utils/format.js'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export async function reviewCommand(args: string[], rl?: readline.Interface) {
  const ownRl = !rl
  if (!rl) {
    const readline = await import('node:readline/promises')
    rl = readline.createInterface({ input, output })
  }

  const argsCopy = [...args]
  let tagFilter: string | undefined
  const tagIdx = argsCopy.findIndex(arg => arg === '--tag' || arg === '--tags')
  if (tagIdx !== -1 && argsCopy[tagIdx + 1]) {
    tagFilter = argsCopy[tagIdx + 1].toLowerCase()
    argsCopy.splice(tagIdx, 2)
  }

  const deck = argsCopy[0]
  let cards = getDueCards(deck)

  if (tagFilter) {
    cards = cards.filter(c => c.tags?.some(t => t.toLowerCase() === tagFilter))
  }

  if (cards.length === 0) {
    const decks = getDecks()
    const scope = deck ? ` in "${deck}"` : ''
    const tagScope = tagFilter ? ` with tag "${tagFilter}"` : ''
    console.log(chalk.green(`\nNo cards due${scope}${tagScope}! `) + (decks.length > 1 ? chalk.dim(`(decks: ${decks.join(', ')})`) : ''))
    if (ownRl) rl.close()
    return
  }

  const { dailyLimit } = getConfig()
  if (cards.length > dailyLimit) {
    console.log(chalk.yellow(`\n${cards.length} cards due, limiting to ${dailyLimit} (config daily-limit)\n`))
    cards = cards.slice(0, dailyLimit)
  } else {
    console.log(chalk.bold(`\n${cards.length} card(s) to review\n`))
  }

  const queue = shuffle(cards)
  let reviewedCount = 0
  const totalInQueue = queue.length

  while (queue.length > 0) {
    const card = queue.shift()!
    const completed = reviewedCount
    const total = totalInQueue
    const pctStr = `${completed}/${total}`
    const barSize = 15
    const barChars = Math.round((completed / total) * barSize)
    const bar = chalk.green('█'.repeat(barChars)) + chalk.dim('░'.repeat(barSize - barChars))
    console.log(chalk.bold(`\nReview Progress: [${bar}] ${pctStr}`))

    const action = await reviewOne(card, rl, queue)
    if (action === 'quit') {
      break
    } else if (action === 'skip') {
      queue.push(card)
    } else if (action === 'reviewed') {
      reviewedCount++
    }
  }

  console.log(chalk.dim(`\nReviewed ${reviewedCount}/${totalInQueue} card(s)`))
  if (ownRl) rl.close()
}

async function reviewOne(card: Card, rl: readline.Interface, queue: Card[]): Promise<'reviewed' | 'skip' | 'deleted' | 'quit'> {
  let hintShown = false
  let typedAnswer: string | undefined = undefined

  while (true) {
    console.log('\n' + formatCardText(card.front))
    if (hintShown && card.hint) {
      console.log(chalk.italic.cyan(`  Hint: ${card.hint}`))
    }

    const hintOption = card.hint && !hintShown ? ", 'h' for hint" : ""
    console.log(chalk.dim(`(Type answer, or press Enter to reveal${hintOption}, 'e' to edit, 'd' to delete, 's' to skip, 'q' to quit)`))

    const rawAction = (await rl.question('')).trim()
    const action = rawAction.toLowerCase()

    if (action === 'q') {
      return 'quit'
    } else if (action === 's') {
      console.log(chalk.yellow('  Skipped. Card moved to end of session.\n'))
      return 'skip'
    } else if (action === 'd') {
      const confirm = await rl.question(chalk.red('  Are you sure you want to delete this card? (y/N): '))
      if (confirm.toLowerCase() === 'y') {
        deleteCard(card.id)
        console.log(chalk.red('  Card deleted.\n'))
        return 'deleted'
      }
      continue
    } else if (action === 'e') {
      console.log(chalk.bold('\nEditing current card:'))
      const newFront = await rl.question(chalk.cyan(`  Front [${card.front}]: `)) || card.front
      const newBack = await rl.question(chalk.cyan(`  Back [${card.back}]: `)) || card.back
      const newHint = await rl.question(chalk.cyan(`  Hint [${card.hint || 'none'}]: `))

      let finalHint = card.hint
      if (newHint.trim() === '-') finalHint = ''
      else if (newHint.trim()) finalHint = newHint.trim()

      const updated = updateCard(card.id, { front: newFront, back: newBack, hint: finalHint })
      if (updated) {
        card.front = updated.front
        card.back = updated.back
        card.hint = updated.hint
        console.log(chalk.green('  Updated successfully!'))
      }
      continue
    } else if (action === 'h' && card.hint) {
      hintShown = true
      continue
    } else {
      if (rawAction !== '') {
        typedAnswer = rawAction
      }
      break
    }
  }

  const options = [
    { key: '1', label: 'Blackout', color: chalk.red },
    { key: '2', label: 'Hard', color: chalk.yellow },
    { key: '3', label: 'OK', color: chalk.blue },
    { key: '4', label: 'Easy', color: chalk.green },
  ]

  console.log(formatCardText(card.back) + '\n')

  if (typedAnswer !== undefined) {
    const normTyped = typedAnswer.toLowerCase().replace(/[^a-z0-9]/gi, '')
    const normBack = card.back.toLowerCase().replace(/[^a-z0-9]/gi, '')
    console.log(chalk.bold('  Your input: ') + chalk.dim(typedAnswer))
    if (normTyped === normBack) {
      console.log(chalk.green.bold('  ✓ Correct! (Matches back)\n'))
    } else {
      console.log(chalk.red.bold('  ✗ Mismatch\n'))
    }
  }

  const line = options.map(o => o.color(`${o.key}) ${o.label}`)).join('  ')
  console.log('  ' + line)

  while (true) {
    const answer = await rl.question(chalk.dim('  How did you do? [1-4, ' + chalk.cyan('e') + ' to edit, ' + chalk.red('d') + ' to delete, ' + chalk.yellow('s') + ' to skip, ' + chalk.dim('q') + ' to quit]: '))
    const trimmed = answer.trim().toLowerCase()

    if (trimmed === 'q') return 'quit'
    if (trimmed === 's') {
      console.log(chalk.yellow('  Skipped. Card moved to end of session.\n'))
      return 'skip'
    }
    if (trimmed === 'd') {
      const confirm = await rl.question(chalk.red('  Are you sure you want to delete this card? (y/N): '))
      if (confirm.toLowerCase() === 'y') {
        deleteCard(card.id)
        console.log(chalk.red('  Card deleted.\n'))
        return 'deleted'
      }
      continue
    }
    if (trimmed === 'e') {
      console.log(chalk.bold('\nEditing current card:'))
      const newFront = await rl.question(chalk.cyan(`  Front [${card.front}]: `)) || card.front
      const newBack = await rl.question(chalk.cyan(`  Back [${card.back}]: `)) || card.back
      const newHint = await rl.question(chalk.cyan(`  Hint [${card.hint || 'none'}]: `))

      let finalHint = card.hint
      if (newHint.trim() === '-') finalHint = ''
      else if (newHint.trim()) finalHint = newHint.trim()

      const updated = updateCard(card.id, { front: newFront, back: newBack, hint: finalHint })
      if (updated) {
        card.front = updated.front
        card.back = updated.back
        card.hint = updated.hint
        console.log(chalk.green('  Updated successfully!'))
      }
      console.log('\n' + formatCardText(card.front))
      console.log(formatCardText(card.back) + '\n')
      console.log('  ' + line)
      continue
    }

    const quality = parseInt(trimmed)
    if (quality >= 1 && quality <= 4) {
      reviewCard(card.id, quality)
      console.log(chalk.green('  Recorded!\n'))
      return 'reviewed'
    }
    console.log(chalk.red('  Invalid response.'))
  }
}
