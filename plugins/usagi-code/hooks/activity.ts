import { plainText } from './text'
import type { Keyframe, Pose } from '../types'

export const MAX_KEYFRAMES = 200
/** Future frames kept visible to the right of the playhead. */
const PLAYHEAD_MARGIN = 8

const POSES: Readonly<Record<string, Pose>> = {
  Read: 'reading',
  Grep: 'reading',
  Glob: 'reading',
  LS: 'reading',
  NotebookRead: 'reading',
  ToolSearch: 'reading',
  Edit: 'coding',
  Write: 'coding',
  MultiEdit: 'coding',
  NotebookEdit: 'coding',
  Bash: 'terminal',
  PowerShell: 'terminal',
  BashOutput: 'terminal',
  KillShell: 'terminal',
  Monitor: 'terminal',
  WebFetch: 'browsing',
  WebSearch: 'browsing',
  Agent: 'helper',
  Task: 'helper',
  AskUserQuestion: 'waving',
}

export function poseForTool(tool: string): Pose {
  const pose = POSES[tool]
  if (pose !== undefined) return pose
  const lower = tool.toLowerCase()
  if (lower.includes('browser') || lower.includes('chrome')) return 'browsing'
  return 'coding'
}

/** The first line of some outside text, plain. */
export function firstLine(text: string): string {
  return plainText(text.split(/\r?\n/, 1)[0] ?? '')
}

const TARGET_FIELDS = ['file_path', 'path', 'notebook_path', 'pattern', 'url', 'query', 'command', 'description'] as const

/** What a call works on: the first present of its path, pattern, url, query, command or description. */
export function targetOf(input: Readonly<Record<string, unknown>>): string {
  for (const field of TARGET_FIELDS) {
    const value = input[field]
    if (typeof value === 'string' && value !== '') return firstLine(value)
  }
  return ''
}

export function truncateMiddle(text: string, max: number): string {
  const chars = [...text]
  if (chars.length <= max) return text
  if (max <= 1) return '…'.slice(0, max)
  const head = Math.ceil((max - 1) / 2)
  const tail = max - 1 - head
  return chars.slice(0, head).join('') + '…' + (tail > 0 ? chars.slice(-tail).join('') : '')
}

export function startKeyframe(list: readonly Keyframe[], start: Omit<Keyframe, 'n'>): Keyframe[] {
  const n = (list.at(-1)?.n ?? 0) + 1
  return [...list, { ...start, n }].slice(-MAX_KEYFRAMES)
}

export function finishKeyframe(
  list: readonly Keyframe[],
  id: string,
  end: { durationMs: number; isError: boolean; errorLine?: string },
): Keyframe[] {
  return list.map(frame => (frame.id === id ? { ...frame, ...end } : frame))
}

/** The frames shown, scrolled so the playhead keeps 8 future frames to its right. */
export function timelineWindow(current: number, width: number): { start: number; end: number } {
  const end = Math.max(width, current + PLAYHEAD_MARGIN)
  return { start: end - width + 1, end }
}

export type LayerCell = 'key' | 'span' | 'playhead' | 'future'

export function layerCells(
  keys: ReadonlySet<number> | 'all',
  win: { start: number; end: number },
  current: number,
): LayerCell[] {
  const cells: LayerCell[] = []
  for (let n = win.start; n <= win.end; n++) {
    if (n === current) cells.push('playhead')
    else if (n > current) cells.push('future')
    else cells.push(keys === 'all' || keys.has(n) ? 'key' : 'span')
  }
  return cells
}

export type ClientMessage = { click: string } | { pick: number }

/** What a Client posted, if it is something the studio acts on: a click id, or a whole, non-negative step number. */
export function parseClientMessage(data: unknown): ClientMessage | null {
  if (typeof data !== 'object' || data === null) return null
  const d = data as { click?: unknown; pick?: unknown }
  if (typeof d.click === 'string') return { click: d.click }
  if (typeof d.pick === 'number' && Number.isInteger(d.pick) && d.pick >= 0) return { pick: d.pick }
  return null
}

export type StepAction = 'prev' | 'next' | 'live' | { pick: number }

/** The step to pin after an action, or null for live; a pick that names no kept step leaves the pin as it was. */
export function stepTarget(list: readonly Keyframe[], pinned: number | null, action: StepAction): number | null {
  if (action === 'live') return null
  if (action === 'prev') {
    const at = pinned === null ? list.length : list.findIndex(frame => frame.n === pinned)
    return list[Math.max(0, at - 1)]?.n ?? pinned
  }
  if (action === 'next') {
    if (pinned === null) return null
    const at = list.findIndex(frame => frame.n === pinned)
    return at >= 0 && at < list.length - 1 ? (list[at + 1]?.n ?? null) : null
  }
  return list.some(frame => frame.n === action.pick) ? action.pick : pinned
}
