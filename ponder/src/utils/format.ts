import chalk from 'chalk'

export function formatCardText(text: string): string {
  if (!text) return ''

  const parts = text.split(/(```[\s\S]*?```)/g)

  return parts.map(part => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const lines = part.slice(3, -3).trim().split('\n')
      let codeLines = lines
      if (lines[0] && /^[a-zA-Z0-9+#-]+$/.test(lines[0]) && lines.length > 1) {
        codeLines = lines.slice(1)
      }

      const border = chalk.dim('  ┌' + '─'.repeat(50))
      const bottomBorder = chalk.dim('  └' + '─'.repeat(50))

      const formattedCode = codeLines
        .map(line => '  │ ' + chalk.cyan(line))
        .join('\n')

      return `\n${border}\n${formattedCode}\n${bottomBorder}\n`
    } else {
      return part.replace(/`([^`]+)`/g, (_, code) => chalk.yellow.bold(code))
    }
  }).join('')
}
