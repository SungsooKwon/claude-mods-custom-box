import { test, expect, describe } from 'claude-code/testing'
import { THEMES } from '../hooks/themes'
import { answerEngine, mountPane, startSession, PANE } from './harness'

type Mounted = Awaited<ReturnType<typeof mountPane>>
type Node = { type?: string; props?: Record<string, unknown>; children?: unknown[] }

/** The Text runs a Client row drew, in order, with the column each starts at. */
async function runs(ui: Mounted, key: string): Promise<{ text: string; x: number; props: Record<string, unknown> }[]> {
  const tree = (await ui.drawn({ in: key })) as unknown as Node
  const out: { text: string; x: number; props: Record<string, unknown> }[] = []
  let x = 0
  const walk = (n: unknown) => {
    if (typeof n !== 'object' || n === null) return
    const node = n as Node
    if (node.type === 'Text') {
      const text = (node.children ?? []).filter(c => typeof c === 'string').join('')
      out.push({ text, x, props: node.props ?? {} })
      x += [...text].length
      return
    }
    for (const child of node.children ?? []) walk(child)
  }
  walk(tree)
  return out
}

async function xOf(ui: Mounted, key: string, label: string): Promise<number> {
  const run = (await runs(ui, key)).find(r => r.text.includes(label))
  if (run === undefined) throw new Error(`${label} not in ${key}`)
  return run.x + run.text.indexOf(label)
}

async function bgOf(ui: Mounted, key: string, label: string): Promise<unknown> {
  return (await runs(ui, key)).find(r => r.text.includes(label))?.props.backgroundColor
}

const win7 = THEMES.windows7

describe('title chrome', () => {
  test('shows Usagi code in each theme', async ($, on) => {
    answerEngine(on, { os: 'windows' })
    await startSession($)
    const ui = await mountPane($, 46, 24)
    expect((await runs(ui, 'title')).map(r => r.text).join('')).toContain('Usagi code')
    expect(await ui.find({ key: 'chrome' })).toBeDefined()
  })

  test('the Mac title is centred', { options: { theme: 'macos' } }, async ($, on) => {
    answerEngine(on)
    await startSession($)
    const ui = await mountPane($, 46, 24)
    const x = await xOf(ui, 'title', 'Usagi code')
    expect(Math.abs(x - (46 - 'Usagi code'.length) / 2)).toBeLessThanOrEqual(1)
  })

  test('the close button closes the pane', { options: { theme: 'windows7' } }, async ($, on) => {
    const { rec } = answerEngine(on)
    await startSession($)
    const ui = await mountPane($, 46, 24)
    await ui.pointer({ type: 'down', x: await xOf(ui, 'title', '✕'), y: 0, button: 'left', in: 'title' })
    expect(rec.closed).toContain(PANE)
  })

  test('▲ in the status bar grows Usagi, keeps the size and asks the pane for the rows', async ($, on) => {
    const { rec, ctl } = answerEngine(on)
    await startSession($)
    const ui = await mountPane($, 120, 25, 'inline')
    const opens = rec.opened.length
    await ui.pointer({ type: 'down', x: await xOf(ui, 'status', '▲'), y: 0, button: 'left', in: 'status' })
    expect(ctl.store.get('stageRows')).toBe(24)
    expect(rec.opened.length).toBe(opens + 1)
    await ui.unmount()
    const grown = await mountPane($, 120, 27, 'inline')
    expect((await grown.find({ key: 'stage' }))?.props).toMatchObject({ rows: 24 })
  })

  test('/usagi theme macos switches the look for this session', async ($, on) => {
    answerEngine(on, { os: 'windows' })
    await startSession($)
    expect(await $.command.run({ command: 'usagi', args: 'theme macos' } as never)).toMatchObject({ text: 'Theme set to Mac OS X (this session).' })
    const ui = await mountPane($, 46, 24)
    expect(await bgOf(ui, 'title', 'Usagi code')).toBe(THEMES.macos.title.bottom)
  })

  test('the theme setting picks the look', { options: { theme: 'ubuntu' } }, async ($, on) => {
    answerEngine(on, { os: 'windows' })
    await startSession($)
    const ui = await mountPane($, 46, 24)
    expect(await bgOf(ui, 'title', 'Usagi code')).toBe(THEMES.ubuntu.title.bottom)
  })
})

describe('legible on any terminal', () => {
  for (const theme of ['windows7', 'macos', 'ubuntu'] as const) {
    for (const [cols, rows] of [[32, 20], [46, 24], [60, 30]] as const) {
      test(`${theme} at ${cols} by ${rows}: every chrome text sets its colour`, { options: { theme } }, async ($, on) => {
        answerEngine(on, { os: 'windows' })
        await startSession($)
        const ui = await mountPane($, cols, rows)
        for (const key of ['title', 'status']) for (const run of await runs(ui, key)) expect(run.props.color).toBeDefined()
      })
    }
  }
})

