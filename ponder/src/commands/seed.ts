import chalk from 'chalk'
import { importCards, addCard, getDecks } from '../store.js'

export function seedCommand() {
  const decks = [
    {
      name: 'JavaScript',
      cards: [
        { front: 'What is a closure?', back: 'A function plus its lexical environment' },
        { front: 'Array map vs forEach', back: 'map returns new array; forEach returns undefined' },
        { front: 'Describe event loop', back: 'Handles callbacks, microtasks, macrotasks order' },
      ],
    },
    {
      name: 'Algorithms',
      cards: [
        { front: 'Big-O of binary search', back: 'O(log n)' },
        { front: 'Big-O of quicksort average', back: 'O(n log n)' },
        { front: 'What is a heap?', back: 'A specialized tree-based data structure' },
      ],
    },
    {
      name: 'Git',
      cards: [
        { front: 'How to undo last commit (keep changes)?', back: '`git reset --soft HEAD~1`' },
        { front: 'Create new branch', back: '`git checkout -b branch-name`' },
        { front: 'Stash changes', back: '`git stash` / `git stash pop`' },
      ],
    },
    {
      name: 'Regex',
      cards: [
        { front: 'Regex: match start of line', back: '^' },
        { front: 'Regex: any digit', back: '\\d' },
        { front: 'Regex: one or more', back: '+' },
      ],
    },
  ]

  let total = 0
  for (const d of decks) {
    const created = d.cards.map(c => ({ ...c, deck: d.name }))
    const n = importCards(created)
    total += n
    console.log(chalk.green(`Added ${n} cards to deck: ${d.name}`))
  }

  const existing = getDecks()
  console.log(chalk.bold(`
Seed complete — ${total} cards added.`))
  console.log(chalk.dim(`Decks now: ${existing.join(', ')}`))
}

export default seedCommand
