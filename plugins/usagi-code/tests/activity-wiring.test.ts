import { test, expect } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'
import { stageCells } from '../hooks/art/stage'
import { THEMES } from '../hooks/themes'
import { answerEngine, completeTurn, mountPane, startSession, startTurn, waitFor } from './harness'

async function view($: Engine) {
  const ui = await mountPane($)
  const pose = (await ui.find({ type: 'Text', text: /· \d+단계/ }))?.text ?? ''
  const line = (await ui.find({ type: 'Text', text: /단계 \d+개 \(완료/ }))?.text ?? ''
  const [, total = '0', failed = '0'] = /단계 (\d+)개 \(완료 \d+ · 실패 (\d+)\)/.exec(line) ?? []
  const keyframes = Number(total)
  const errors = Number(failed)
  const isStudio = (await ui.find({ key: 'stage' })) !== undefined
  return { ui, pose, keyframes, errors, isStudio }
}

test('a tool call passes through unchanged', async ($, on) => {
  answerEngine(on)
  await startSession($)
  expect(await $.tool.call({ tool: 'Read', tool_use_id: 'u1', file_path: '/a.ts' } as never)).toMatchObject({ text: 'ok' })
})

test('tool calls add keyframes and the pose returns to thinking', async ($, on) => {
  answerEngine(on)
  await startSession($)
  await startTurn($)
  await $.tool.call({ tool: 'Read', tool_use_id: 'u1', file_path: '/a.ts' } as never)
  await $.tool.call({ tool: 'Bash', tool_use_id: 'u2', command: 'ls' } as never)
  const v = await view($)
  expect(v.pose).toMatch(/생각하는 중 · /)
  expect(v.keyframes).toBe(2)
  expect(v.isStudio).toBe(true)
})

test('a failed call shows its keyframe as ✖ with its first error line', async ($, on) => {
  answerEngine(on, { tool: () => ({ result: null, text: 'boom\nstack', isError: true }) })
  await startSession($)
  await startTurn($)
  await $.tool.call({ tool: 'Bash', tool_use_id: 'u1', command: 'x' } as never)
  const v = await view($)
  expect(v.errors).toBe(1)
  expect(await v.ui.find({ type: 'Text', text: /boom/ })).toBeDefined()
})

test('a finished turn hops, then rests idle at the laptop', async ($, on) => {
  const { clock } = answerEngine(on)
  await startSession($)
  await startTurn($)
  await completeTurn($)
  const hop = await view($)
  expect(hop.pose).toMatch(/완료 · /)
  expect(hop.isStudio).toBe(true)
  await hop.ui.unmount()
  await clock.advance(1500)
  const later = await view($)
  expect(later.pose).toMatch(/쉬는 중 · /)
  expect(later.isStudio).toBe(true)
})

test('a subagent finishing changes nothing', async ($, on) => {
  const { clock } = answerEngine(on)
  await startSession($)
  await startTurn($)
  await completeTurn($, 't2', 'a1')
  await clock.advance(1500)
  const v = await view($)
  expect(v.pose).toMatch(/생각하는 중 · /)
  expect(v.isStudio).toBe(true)
})

test('parallel calls keep the newest pose until all have settled', async ($, on) => {
  const pending = new Map<string, () => void>()
  const { clock } = answerEngine(on, {
    tool: e => new Promise(resolve => pending.set(e.tool_use_id ?? '', () => resolve({ result: 'ok', text: 'ok' }))),
  })
  await startSession($)
  await startTurn($)
  const p1 = $.tool.call({ tool: 'Read', tool_use_id: 'p1', file_path: '/a' } as never)
  await waitFor(clock, () => pending.has('p1'))
  const p2 = $.tool.call({ tool: 'Bash', tool_use_id: 'p2', command: 'ls' } as never)
  await waitFor(clock, () => pending.has('p2'))
  pending.get('p1')?.()
  await p1
  const during = await view($)
  expect(during.pose).toMatch(/명령 실행 중 · /)
  await during.ui.unmount()
  pending.get('p2')?.()
  await p2
  expect((await view($)).pose).toMatch(/생각하는 중 · /)
})

test('a quiet minute after a turn puts Clawd to sleep, without a redraw', { timeoutMs: 20_000 }, async ($, on) => {
  const { rec, clock } = answerEngine(on, { now: new Date(2026, 6, 4, 12).getTime(), os: 'windows' })
  await startSession($)
  await startTurn($)
  await completeTurn($)
  await clock.advance(1000)
  await waitFor(clock, () => false)
  await mountPane($, 46, 30)
  const backdrop = THEMES.windows7.backdrop
  const frames = (pose: 'idle' | 'asleep') =>
    new Set(Array.from({ length: 64 }, (_, tick) => stageCells({ cols: 44, pose, hat: 'none', tick, backdrop })))
  const lastStage = () => rec.blits.filter(blit => blit.key === 'stage').at(-1)?.cells ?? ''
  await clock.advance(166 * 3)
  expect(frames('idle').has(lastStage())).toBe(true)
  await clock.advance(61_000)
  expect(frames('asleep').has(lastStage())).toBe(true)
})
