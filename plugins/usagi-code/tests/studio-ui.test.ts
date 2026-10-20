import { test, expect, describe } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'
import { answerEngine, mountPane, startSession, startTurn } from './harness'

const SIZES = [
  [46, 30],
  [60, 30],
  [32, 20],
] as const

async function threeCalls($: Engine) {
  await startSession($)
  await startTurn($)
  await $.tool.call({ tool: 'Read', tool_use_id: 'u1', file_path: '/work/a.ts' } as never)
  await $.tool.call({ tool: 'Edit', tool_use_id: 'u2', file_path: '/work/hooks/usagi.tsx' } as never)
  await $.tool.call({ tool: 'Bash', tool_use_id: 'u3', command: 'npm test' } as never)
}

for (const [cols, rows] of SIZES) {
  describe(`${cols} by ${rows}`, () => {
    test('shows a keyframe per call and the stage raster', async ($, on) => {
      answerEngine(on)
      await threeCalls($)
      const ui = await mountPane($, cols, rows)
      expect(await ui.find({ type: 'Text', text: /단계 3개/ })).toBeDefined()
      expect((await ui.find({ key: 'stage' }))?.props).toMatchObject({ columns: cols - 2, rows: 22 })
    })

  })
}

test('a wide inline pane puts the steps beside a Clawd that shrinks with the rows', async ($, on) => {
  answerEngine(on)
  await threeCalls($)
  const full = await mountPane($, 120, 25, 'inline')
  expect((await full.find({ key: 'stage' }))?.props).toMatchObject({ columns: 42, rows: 22 })
  expect((await full.find({ key: 'tab-content' }))?.props).toMatchObject({ width: 76 })
  expect(await full.find({ type: 'Text', text: /단계 3개/ })).toBeDefined()
  await full.unmount()
  const short = await mountPane($, 120, 14, 'inline')
  expect((await short.find({ key: 'stage' }))?.props).toMatchObject({ columns: 22, rows: 11 })
})

test('a pane under 32 columns asks to be widened', async ($, on) => {
  answerEngine(on)
  await threeCalls($)
  const ui = await mountPane($, 31, 30)
  expect(await ui.find({ type: 'Text', text: 'Widen the pane to see Usagi code.' })).toBeDefined()
  expect(await ui.findAll({ type: 'Button' })).toHaveLength(0)
})

test('the ticker repaints the stage', async ($, on) => {
  const { rec, clock } = answerEngine(on)
  await startSession($)
  await mountPane($)
  await clock.advance(166)
  expect(rec.blits.some(blit => blit.key === 'stage')).toBe(true)
})

test('a denied repaint stops until the stage is drawn again', async ($, on) => {
  let deny = true
  const { rec, clock } = answerEngine(on, { blitDeny: key => (deny && key === 'stage' ? 'size' : undefined) })
  await startSession($)
  const ui = await mountPane($)
  await clock.advance(166)
  const denied = rec.blits.filter(blit => blit.key === 'stage').length
  expect(denied).toBe(1)
  await clock.advance(166 * 3)
  expect(rec.blits.filter(blit => blit.key === 'stage')).toHaveLength(denied)
  deny = false
  await ui.redraw()
  await clock.advance(166)
  expect(rec.blits.filter(blit => blit.key === 'stage').length).toBeGreaterThan(denied)
})

test('a slow repaint is not stacked up by later ticks', async ($, on) => {
  const { rec, clock } = answerEngine(on, { blitGate: () => new Promise<void>(() => undefined) })
  await startSession($)
  await mountPane($)
  await clock.advance(166 * 5)
  expect(rec.blits).toHaveLength(1)
})

for (const theme of ['windows7', 'macos', 'ubuntu']) {
  test(`${theme}: every text in every tab sets its colour and nothing is a plain Button`, { options: { theme } }, async ($, on) => {
    answerEngine(on, { tool: e => (e.tool === 'Bash' ? { result: null, text: 'exit 1', isError: true } : { result: 'ok', text: 'ok' }) })
    await threeCalls($)
    for (const tab of ['timeline', 'usage']) {
      await $.command.run({ command: 'usagi', args: tab } as never)
      const ui = await mountPane($, 46, 30)
      expect(await ui.find({ key: 'dialog' })).toBeDefined()
      expect(await ui.findAll({ type: 'Button' })).toHaveLength(0)
      let texts = 0
      const walk = (n: unknown): void => {
        if (typeof n !== 'object' || n === null) return
        const node = n as { type?: string; props?: { color?: string }; children?: unknown[] }
        if (node.type === 'Text') {
          texts += 1
          expect(node.props?.color).toBeDefined()
        }
        for (const child of node.children ?? []) walk(child)
      }
      walk(await ui.find({ key: 'stage-section' }))
      walk(await ui.find({ key: 'tab-content' }))
      expect(texts).toBeGreaterThan(2)
      await ui.unmount()
    }
  })
}
