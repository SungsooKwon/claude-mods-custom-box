import type { Dialog } from '../types'
import { plainText } from './text'

// 문구 속 이름은 무대에 선 캐릭터 이름 (mascot)
const waiting = (mascot: string) => `${mascot} is waiting on you`
export const questionText = (mascot = 'Usagi') => `${mascot}: hey! i have a question for you`
const asking = (mascot: string) => `${mascot}: hey! i need ur OK`

/** The instant message for a permission prompt on a tool and its target. */
export function needsYouText(tool: string, target: string, mascot = 'Usagi'): string {
  const name = plainText(tool)
  const what = plainText(target)
  return what === '' ? `${asking(mascot)} to run ${name}` : `${asking(mascot)} to run ${name}: ${what}`
}

/** The instant message for a permission notification, which names no tool. */
export function notifiedText(message: string, mascot = 'Usagi'): string {
  const words = plainText(message)
  return words === '' ? asking(mascot) : `${asking(mascot)} — ${words}`
}

/** The plugin's one status line: waiting on the person, else the usage warning, else nothing. */
export function statusLine(dialog: Dialog, warning: string | undefined, mascot = 'Usagi'): string | undefined {
  if (dialog?.kind === 'needs-you') return waiting(mascot)
  return warning
}
