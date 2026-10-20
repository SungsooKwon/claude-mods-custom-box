import { mock } from 'claude-code/testing'
import type { Engine, MockClock } from 'claude-code/testing'
import type { On } from 'claude-code'

export const PANE = 'usagi-code'
export const PLUGIN = 'usagi-code'

export type ProcResult = { exitCode: number; stdout: string; stderr: string }
export type Piece = { stream: 'stdout' | 'stderr'; text: string }

export type Recorder = {
  opened: string[]
  titles: string[]
  columns: (number | undefined)[]
  closed: string[]
  statuses: (string | undefined)[]
  toasts: string[]
  blits: { key: string; cells: string }[]
  runs: string[][]
  spawns: string[][]
}

export type BootOptions = {
  os?: 'windows' | 'macos' | 'linux' | 'other'
  usage?: unknown
  run?: (argv: string[]) => ProcResult
  spawn?: (argv: string[]) => AsyncIterable<Piece>
  store?: Record<string, unknown>
  now?: number
  surfaces?: string[]
  blitDeny?: (key: string) => string | undefined
  /** Holds every repaint until this resolves, as a slow surface would. */
  blitGate?: () => Promise<void>
  /** Answers a tool call in place of the default `{ result: 'ok', text: 'ok' }`. */
  tool?: (e: { tool: string; tool_use_id?: string }) => unknown
}

/** 2026-10-05 12:00 local time. */
export const DEFAULT_NOW = new Date(2026, 9, 5, 12, 0, 0).getTime()

export const DEFAULT_USAGE = {
  startedAt: 0,
  context: { tokens: 84000, window: 200000, percent: 42 },
  rateLimits: [],
  cost: { usd: 0.84 },
}

const UNAME: Record<string, string> = { macos: 'Darwin\n', linux: 'Linux\n', other: 'FreeBSD\n' }

function defaultRun(os: BootOptions['os'], argv: string[]): ProcResult {
  if (argv[0] === 'uname' && os !== undefined && os !== 'windows') {
    return { exitCode: 0, stdout: UNAME[os] ?? '', stderr: '' }
  }
  return { exitCode: 1, stdout: '', stderr: 'not answered by the test' }
}

async function* noOutput(): AsyncIterable<Piece> {}

/**
 * Stands beneath the plugin as the engine: answers every call the plugin
 * makes on `$` and records what it asked for.
 */
export type Control = { usage: unknown; usageDeny?: string; store: Map<string, unknown>; storeDeny?: string }

export function answerEngine(on: On, opts: BootOptions = {}): { rec: Recorder; clock: MockClock; ctl: Control } {
  const ctl: Control = { usage: opts.usage ?? DEFAULT_USAGE, store: new Map(Object.entries(opts.store ?? {})) }
  const rec: Recorder = { opened: [], titles: [], columns: [], closed: [], statuses: [], toasts: [], blits: [], runs: [], spawns: [] }
  const open = new Map<string, string>()
  const clock = mock.clock(on, { now: opts.now ?? DEFAULT_NOW })
  mock.env(on, opts.os === 'windows' ? { OS: 'Windows_NT' } : {})
  on('store.get', async (_$, e) => ({ value: ctl.store.get(e.key) }) as never)
  on('store.set', async (_$, e) => {
    if (ctl.storeDeny !== undefined) return { deny: ctl.storeDeny } as never
    ctl.store.set(e.key, e.value)
    return { value: undefined } as never
  })

  on('session.start', async (_$, e) => ({ cwd: e.cwd }))
  on('session.usage', async () => (ctl.usageDeny !== undefined ? { deny: ctl.usageDeny } : { value: ctl.usage }) as never)
  on('session.measure', async (_$, e) => ({ changed: e.changed }) as never)
  on('session.surfaces', async () => ({ value: opts.surfaces ?? ['terminal'] }) as never)
  on('command.register', async () => ({ value: undefined }) as never)
  on('ui.open', async (_$, e) => {
    open.set(e.id, e.title ?? e.id)
    rec.opened.push(e.id)
    rec.titles.push(e.title ?? '')
    rec.columns.push(e.columns)
    return { value: { isPlaced: true } } as never
  })
  on('ui.close', async (_$, e) => {
    open.delete(e.id)
    rec.closed.push(e.id)
    return { value: undefined } as never
  })
  on('ui.panes', async () => ({
    value: [...open].map(([id, title]) => ({ id, title, isShown: true, isFocused: false, isPlaced: true })),
  }) as never)
  on('ui.status', async (_$, e) => {
    rec.statuses.push(e.text)
    return { value: undefined } as never
  })
  on('ui.toast', async (_$, e) => {
    rec.toasts.push(e.text)
    return { value: undefined } as never
  })
  on('ui.blit', async (_$, e) => {
    const key = (e as { key: string }).key
    rec.blits.push({ key, cells: (e as { cells?: string }).cells ?? '' })
    if (opts.blitGate !== undefined) await opts.blitGate()
    const deny = opts.blitDeny?.(key)
    return { value: deny === undefined ? {} : { deny } } as never
  })
  on('process.run', async (_$, e) => {
    const argv = [...e.argv]
    rec.runs.push(argv)
    return { value: (opts.run ?? (a => defaultRun(opts.os, a)))(argv) } as never
  })
  on('process.spawn', async function* (_$, e) {
    const argv = [...e.argv]
    rec.spawns.push(argv)
    for await (const piece of (opts.spawn ?? noOutput)(argv)) yield piece
    return { value: { code: 0, signal: null } } as never
  })
  on('turn.start', async (_$, e) => ({ turnId: e.turnId }))
  on('turn.complete', async (_$, e) => ({ text: e.answer }))
  on('prompt.submit', async (_$, e) => ({ text: e.text }) as never)
  on('ui.message', async () => ({}) as never)
  on('ui.fault', async () => ({}) as never)
  on('classic.PermissionRequest', async () => ({}) as never)
  on('classic.Notification', async () => ({}) as never)
  on('tool.call', async (_$, e) => (opts.tool ? await opts.tool(e as never) : { result: 'ok', text: 'ok' }) as never)

  return { rec, clock, ctl }
}

export async function startSession($: Engine): Promise<void> {
  await $.session.start({ cwd: '/work/my-project' } as never)
}

export function paneProps(cols: number, rows: number, placement: 'dock' | 'inline' = 'dock') {
  return {
    title: 'Usagi code · my-project',
    isFocused: true,
    bodyColumns: cols,
    placement,
    scroll: { offset: 0, bodyRows: rows },
  }
}

export async function mountPane($: Engine, cols = 46, rows = 30, placement: 'dock' | 'inline' = 'dock') {
  return $.ui.mount({
    plugin: PLUGIN,
    surface: 'terminal',
    component: 'Pane',
    requestId: PANE,
    props: paneProps(cols, rows, placement) as never,
    viewport: { columns: cols, rows, isFullscreen: placement === 'dock' } as never,
  })
}

export async function startTurn($: Engine, turnId = 't1'): Promise<void> {
  await $.turn.start({ text: 'go', turnId } as never)
}

export async function completeTurn($: Engine, turnId = 't1', agentId?: string): Promise<void> {
  await $.turn.complete({ answer: 'done', durationMs: 1000, isAborted: false, turnId, reason: 'answer', ...(agentId ? { agentId } : {}) } as never)
}

/** Lets pending hook work run until `done()` holds (or gives up after many turns of the event loop). */
export async function waitFor(clock: MockClock, done: () => boolean): Promise<void> {
  for (let i = 0; i < 200 && !done(); i++) {
    await clock.settle()
    await Promise.resolve()
  }
}

export async function measure($: Engine, figures: { percent?: number; rateLimits?: unknown[]; usd?: number }): Promise<void> {
  await $.session.measure({
    context: { window: 200000, ...(figures.percent !== undefined ? { percent: figures.percent, tokens: figures.percent * 2000 } : {}) },
    rateLimits: figures.rateLimits ?? [],
    ...(figures.usd !== undefined ? { cost: { usd: figures.usd } } : {}),
    changed: ['context'],
  } as never)
}
