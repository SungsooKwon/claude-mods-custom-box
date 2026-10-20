import { test, expect, describe } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'
import { answerEngine, mountPane, startSession, startTurn } from './harness'


async function threeSteps($: Engine, fail = false) {
  await startSession($)
  await startTurn($)
  await $.tool.call({ tool: 'Read', tool_use_id: 'u1', file_path: '/work/a.ts' } as never)
  await $.tool.call({ tool: 'Edit', tool_use_id: 'u2', file_path: '/work/hooks/usagi.tsx' } as never)
  await $.tool.call({ tool: 'Bash', tool_use_id: 'u3', command: fail ? 'false' : 'npm test' } as never)
}

const failingBash = (e: { tool: string }) => (e.tool === 'Bash' ? { result: null, text: 'exit 1\nmore', isError: true } : { result: 'ok', text: 'ok' })


test('the progress line counts the steps of this turn, done and failed', async ($, on) => {
  answerEngine(on, { tool: failingBash })
  await threeSteps($, true)
  const ui = await mountPane($, 60, 34)
  expect(await ui.find({ type: 'Text', text: /진행 중 · 단계 3개 \(완료 2 · 실패 1\)/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /prev|next/ })).toBeUndefined()
})



test('the header shows a thin bar of the context used before compaction', async ($, on) => {
  answerEngine(on)
  await threeSteps($)
  for (const cols of [60, 32]) {
    const ui = await mountPane($, cols, 24)
    expect(await ui.find({ type: 'Text', text: /auto-compact/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /─/ })).toBeDefined()
    await ui.unmount()
  }
})
