import chalk from 'chalk'
import { getConfig, setConfig } from '../store.js'

export function configCommand(args: string[]) {
  if (args.length === 0) {
    const cfg = getConfig()
    console.log(chalk.bold('\nPonder Config\n'))
    console.log(`  ${chalk.cyan('Daily review limit:')}  ${cfg.dailyLimit}`)
    console.log()
    return
  }

  if (args[0] === 'daily-limit' && args[1]) {
    const limit = parseInt(args[1])
    if (isNaN(limit) || limit < 1) {
      console.log(chalk.red('Daily limit must be a positive number'))
      return
    }
    setConfig({ dailyLimit: limit })
    console.log(chalk.green(`Daily review limit set to ${limit}`))
    return
  }

  console.log(chalk.yellow('Usage: config [daily-limit <number>]'))
}
