import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import chalk from 'chalk'
import { addCard, getDecks } from '../store.js'

export async function addCommand(args: string[], rl?: readline.Interface) {
  const ownRl = !rl
  if (!rl) {
    const readline = await import('node:readline/promises')
    rl = readline.createInterface({ input, output })
  }

  const argsCopy = [...args]
  let tags: string[] | undefined
  let hint: string | undefined

  const tagIdx = argsCopy.findIndex(arg => arg === '--tag' || arg === '--tags')
  if (tagIdx !== -1 && argsCopy[tagIdx + 1]) {
    tags = argsCopy[tagIdx + 1].split(',').map(t => t.trim()).filter(Boolean)
    argsCopy.splice(tagIdx, 2)
  }

  const hintIdx = argsCopy.findIndex(arg => arg === '--hint')
  if (hintIdx !== -1 && argsCopy[hintIdx + 1]) {
    hint = argsCopy[hintIdx + 1]
    argsCopy.splice(hintIdx, 2)
  }

  const front = argsCopy[0] || await rl.question(chalk.cyan('Front: '))
  const back = argsCopy[1] || await rl.question(chalk.cyan('Back: '))

  if (!front || !back) {
    console.log(chalk.red('Both front and back are required'))
    if (ownRl) rl.close()
    return
  }

  const decks = getDecks()
  const deckHint = decks.length > 0 ? ` (${decks.join(', ')})` : ''
  const deck = argsCopy[2] || await rl.question(chalk.cyan(`Deck${deckHint}: `)) || 'default'

  if (tags === undefined) {
    const tagsInput = await rl.question(chalk.cyan('Tags (comma separated, optional): '))
    if (tagsInput.trim()) {
      tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    }
  }

  if (hint === undefined) {
    const hintInput = await rl.question(chalk.cyan('Hint (optional): '))
    if (hintInput.trim()) {
      hint = hintInput.trim()
    }
  }

  const card = addCard(front, back, deck, tags, hint)
  console.log(chalk.green(`\nAdded card to "${deck}"`))
  if (ownRl) rl.close()
}
