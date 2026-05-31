#!/usr/bin/env node
import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import chalk from 'chalk'
import { addCommand } from './commands/add.js'
import { listCommand } from './commands/list.js'
import { reviewCommand } from './commands/review.js'
import { statsCommand } from './commands/stats.js'
import { searchCommand } from './commands/search.js'
import { editCommand } from './commands/edit.js'
import { deleteCommand, purgeCommand } from './commands/delete.js'
import { forgetCommand } from './commands/forget.js'
import { exportCommand } from './commands/export.js'
import { importCommand } from './commands/import.js'
import { configCommand } from './commands/config.js'
import { bulkCommand } from './commands/bulk.js'
import { decksCommand, renameCommand } from './commands/decks.js'
import { resetCommand } from './commands/reset.js'
import { countDue } from './store.js'
import { correctCommand } from './commands/correct.js'
import { rightCommand } from './commands/right.js'
import { seedCommand } from './commands/seed.js'

const [,, cmd, ...args] = process.argv

const help = `
${chalk.bold('ponder')}  -  terminal flashcards, remembered.

${chalk.dim('Commands:')}
  ${chalk.cyan('add [front] [back] [deck] [--tag <t>] [--hint <h>]')}  Add a new card with tags and hint
  ${chalk.cyan('review [deck] [--tag <tag>]')}                          Review due cards, optionally filtered by tag
  ${chalk.cyan('list [deck] [--tag <tag>]')}                            List cards, optionally filtered by tag
  ${chalk.cyan('search <query>')}                                       Search cards (matches front, back, or tags)
  ${chalk.cyan('edit <card-id>')}                                       Edit a card
  ${chalk.cyan('delete <card-id>')}                                     Delete a card
  ${chalk.cyan('forget <card-id>')}                                     Reset a card's progress
  ${chalk.cyan('correct <card-id>')}                                    Mark card as correct (highest quality)
  ${chalk.cyan('right <card-id>')}                                      Mark card correct and move to "right" deck
  ${chalk.cyan('seed')}                                                 Add sample decks and cards
  ${chalk.cyan('purge [deck]')}                                         Delete all cards or by deck
  ${chalk.cyan('bulk [file]')}                                          Batch add cards (front|back|deck|tags|hint)
  ${chalk.cyan('export [deck] [file]')}                                 Export cards to JSON
  ${chalk.cyan('import <file>')}                                        Import cards from JSON
  ${chalk.cyan('decks')}                                                List all decks
  ${chalk.cyan('rename <old> <new>')}                                   Rename a deck
  ${chalk.cyan('config [daily-limit <n>]')}                             View/set config
  ${chalk.cyan('reset [--force]')}                                      Reset all cards
  ${chalk.cyan('stats')}                                                Show statistics
  ${chalk.cyan('help')}                                                 Show this help
  ${chalk.cyan('exit')}                                                 Exit interactive mode
`

function showHelp() {
  console.log(help)
}

function makePrompt() {
  const due = countDue()
  const dueStr = due > 0 ? chalk.yellow(` ${due} due`) : chalk.green(' 0 due')
  return chalk.bold('ponder') + dueStr + chalk.bold('> ')
}

async function interactive() {
  const rl = readline.createInterface({ input, output, prompt: makePrompt() })
  console.log(chalk.bold('Ponder interactive mode. Type help for commands.\n'))
  rl.prompt()

  for await (const line of rl) {
    const trimmed = line.trim()
    if (!trimmed) { rl.prompt(); continue }

    const parts = trimmed.split(' ')
    const icmd = parts[0]
    const iargs = parts.slice(1)

    switch (icmd) {
      case 'add':
        await addCommand(iargs, rl)
        break
      case 'review':
        await reviewCommand(iargs, rl)
        break
      case 'list':
        listCommand(iargs)
        break
      case 'search':
        searchCommand(iargs)
        break
      case 'edit':
        await editCommand(iargs)
        break
      case 'delete':
        deleteCommand(iargs)
        break
      case 'forget':
        forgetCommand(iargs)
        break
      case 'correct':
        correctCommand(iargs)
        break
      case 'right':
        rightCommand(iargs)
        break
      case 'seed':
        seedCommand()
        break
      case 'purge':
        purgeCommand(iargs)
        break
      case 'bulk':
        await bulkCommand(iargs)
        break
      case 'export':
        exportCommand(iargs)
        break
      case 'import':
        importCommand(iargs)
        break
      case 'decks':
        decksCommand()
        break
      case 'rename':
        renameCommand(iargs)
        break
      case 'config':
        configCommand(iargs)
        break
      case 'reset':
        await resetCommand(iargs, rl)
        break
      case 'stats':
        statsCommand()
        break
      case 'help':
        showHelp()
        break
      case 'exit':
      case 'quit':
        rl.close()
        return
      default:
        console.log(chalk.red(`Unknown: ${icmd}`) + chalk.dim('  (try: add, review, list, search, edit, delete, help, exit)'))
    }
    rl.setPrompt(makePrompt())
    rl.prompt()
  }
}

async function main() {
  if (!cmd) {
    await interactive()
    return
  }

  switch (cmd) {
    case 'add':
      await addCommand(args)
      break
    case 'review':
      await reviewCommand(args)
      break
    case 'list':
      listCommand(args)
      break
    case 'search':
      searchCommand(args)
      break
    case 'edit':
      await editCommand(args)
      break
    case 'delete':
      deleteCommand(args)
      break
    case 'forget':
      forgetCommand(args)
      break
    case 'correct':
      correctCommand(args)
      break
    case 'right':
      rightCommand(args)
      break
    case 'seed':
      seedCommand()
      break
    case 'purge':
      purgeCommand(args)
      break
    case 'bulk':
      await bulkCommand(args)
      break
    case 'export':
      exportCommand(args)
      break
    case 'import':
      importCommand(args)
      break
    case 'decks':
      decksCommand()
      break
    case 'rename':
      renameCommand(args)
      break
    case 'config':
      configCommand(args)
      break
    case 'reset':
      await resetCommand(args)
      break
    case 'stats':
      statsCommand()
      break
    case 'help':
      showHelp()
      break
    default:
      console.log(chalk.red(`Unknown command: ${cmd}`))
      showHelp()
      process.exit(1)
  }
}

main().catch(err => {
  console.error(chalk.red('Error:'), err.message)
  process.exit(1)
})
