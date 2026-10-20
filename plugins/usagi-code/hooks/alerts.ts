import type { Dialog } from '../types'
import { plainText } from './text'

export const WAITING = 'Usagi is waiting on you'
export const QUESTION_TEXT = 'Usagi: hey! i have a question for you'
const ASKING = 'Usagi: hey! i need ur OK'

/** The instant message for a permission prompt on a tool and its target. */
export function needsYouText(tool: string, target: string): string {
  const name = plainText(tool)
  const what = plainText(target)
  return what === '' ? `${ASKING} to run ${name}` : `${ASKING} to run ${name}: ${what}`
}

/** The instant message for a permission notification, which names no tool. */
export function notifiedText(message: string): string {
  const words = plainText(message)
  return words === '' ? ASKING : `${ASKING} — ${words}`
}

/** The plugin's one status line: waiting on the person, else the usage warning, else nothing. */
export function statusLine(dialog: Dialog, warning: string | undefined): string | undefined {
  if (dialog?.kind === 'needs-you') return WAITING
  return warning
}
