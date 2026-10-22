import { test, expect, describe } from 'claude-code/testing'
import type { Engine, MockClock } from 'claude-code/testing'
import { questionText, needsYouText } from '../hooks/alerts'
import type { RowSegment } from '../hooks/client/row'
import { THEMES } from '../hooks/themes'
import type { ThemeName } from '../types'
import { answerEngine, completeTurn, measure, mountPane, startSession, startTurn, waitFor } from './harness'

const WAITING = 'Usagi is waiting on you'
const ENOENT = { result: null, text: 'ENOENT: no such file\n at x', isError: true }

async function view($: Engine) {
  const ui = await mountPane($, 46, 32)
  return {
    ui,
    pose: (await ui.find({ type: 'Text', text: /· \d+단계/ }))?.text ?? '',
    dialog: await ui.find({ key: 'dialog' }),
  }
}

test('needsYouText and the question text', () => {
  expect(needsYouText('Bash', 'npm test')).toBe('Usagi: hey! i need ur OK to run Bash: npm test')
  expect(questionText()).toBe('Usagi: hey! i have a question for you')
})

describe('error dialog', () => {
  async function failed($: Engine, clock: MockClock) {
    await startSession($)
    await startTurn($)
    await $.tool.call({ tool: 'Read', tool_use_id: 'u1', file_path: '/missing' } as never)
    await waitFor(clock, () => false)
  }

  test('a failed call facepalms and shows the error', async ($, on) => {
    let fail = true
    const { clock } = answerEngine(on, { tool: () => (fail ? ENOENT : { result: 'ok', text: 'ok' }) })
    await failed($, clock)
    fail = false
    const v = await view($)
    expect(v.pose).toMatch(/실패 · /)
    expect(v.dialog).toBeDefined()
    expect(await v.ui.find({ type: 'Text', text: /Usagi says/ })).toBeDefined()
    expect(await v.ui.find({ type: 'Text', text: /✖.*Read failed: ENOENT: no such file/ })).toBeDefined()
  })

  test('clicking OK closes it', async ($, on) => {
    const { clock } = answerEngine(on, { tool: () => ENOENT })
    await failed($, clock)
    const v = await view($)
    const node = await v.ui.find({ key: 'ok' })
    const segments = (node?.props as { props?: { segments?: RowSegment[] } } | undefined)?.props?.segments ?? []
    const at = segments.findIndex(s => s.id === 'ok')
    expect(at).toBeGreaterThanOrEqual(0)
    const x = segments.slice(0, at).reduce((sum, s) => sum + [...s.text].length, 0)
    await v.ui.pointer({ type: 'down', x, y: 0, button: 'left', in: 'ok' })
    await waitFor(clock, () => false)
    await v.ui.redraw()
    expect(await v.ui.find({ key: 'dialog' })).toBeUndefined()
  })

  for (const name of ['windows7', 'macos', 'ubuntu'] as ThemeName[]) {
    test(`it is drawn in the ${name} theme`, { options: { theme: name } }, async ($, on) => {
      const theme = THEMES[name]
      const { clock } = answerEngine(on, { tool: () => ENOENT })
      await failed($, clock)
      const v = await view($)
      const box = v.dialog?.props as { top?: number; backgroundColor?: string; borderColor?: string } | undefined
      expect(box?.top).toBe(name === 'macos' ? 0 : 6)
      expect(box?.backgroundColor).toBe(theme.dialog.body)
      expect((await v.ui.find({ type: 'Text', text: /Usagi says/ }))?.props).toMatchObject({ color: theme.dialog.titleText, backgroundColor: theme.dialog.title })
      expect((await v.ui.find({ type: 'Text', text: /Read failed/ }))?.props).toMatchObject({ color: theme.dialog.text })
    })
  }

  test('the next tool call closes it', async ($, on) => {
    let fail = true
    const { clock } = answerEngine(on, { tool: () => (fail ? ENOENT : { result: 'ok', text: 'ok' }) })
    await failed($, clock)
    fail = false
    await $.tool.call({ tool: 'Read', tool_use_id: 'u2', file_path: '/b' } as never)
    expect((await view($)).dialog).toBeUndefined()
  })

  test('it closes itself after eight seconds', async ($, on) => {
    const { clock } = answerEngine(on, { tool: () => ENOENT })
    await failed($, clock)
    await clock.advance(8000)
    expect((await view($)).dialog).toBeUndefined()
  })
})

describe('needs you', () => {
  test('a permission prompt waves, explains and sets the status line', async ($, on) => {
    const { rec } = answerEngine(on)
    await startSession($)
    await startTurn($)
    expect(await $.classic.PermissionRequest({ tool_name: 'Bash', tool_input: { command: 'npm test' } } as never)).toEqual({})
    const v = await view($)
    expect(v.pose).toMatch(/사용자 기다리는 중 · /)
    expect(await v.ui.find({ type: 'Text', text: 'Usagi: hey! i need ur OK to run Bash: npm test' })).toBeDefined()
    expect(rec.statuses.at(-1)).toBe(WAITING)
  })

  test('the next call settling clears it and the status falls back', async ($, on) => {
    const { rec } = answerEngine(on)
    await startSession($)
    await measure($, { percent: 84 })
    await startTurn($)
    await $.classic.PermissionRequest({ tool_name: 'Bash', tool_input: { command: 'npm test' } } as never)
    expect(rec.statuses.at(-1)).toBe(WAITING)
    await $.tool.call({ tool: 'Bash', tool_use_id: 'u1', command: 'npm test' } as never)
    expect((await view($)).dialog).toBeUndefined()
    expect(rec.statuses.at(-1)).toBe('Usagi: context 84% · consider /compact')
  })

  test('a finished turn clears it', async ($, on) => {
    const { rec } = answerEngine(on)
    await startSession($)
    await startTurn($)
    await $.classic.PermissionRequest({ tool_name: 'Bash', tool_input: { command: 'x' } } as never)
    await completeTurn($)
    expect((await view($)).dialog).toBeUndefined()
    expect(rec.statuses.at(-1)).toBeUndefined()
  })

  test('a new prompt clears it', async ($, on) => {
    answerEngine(on)
    await startSession($)
    await $.classic.PermissionRequest({ tool_name: 'Bash', tool_input: { command: 'x' } } as never)
    await $.prompt.submit({ text: 'never mind' } as never)
    expect((await view($)).dialog).toBeUndefined()
  })

  test('a permission notification does the same', async ($, on) => {
    const { rec } = answerEngine(on)
    await startSession($)
    await $.classic.Notification({ message: 'Claude needs your permission to use Bash', notification_type: 'permission_prompt' } as never)
    const v = await view($)
    expect(v.pose).toMatch(/사용자 기다리는 중 · /)
    expect(await v.ui.find({ type: 'Text', text: /Usagi: hey! i need ur OK/ })).toBeDefined()
    expect(rec.statuses.at(-1)).toBe(WAITING)
  })

  test('other notifications are ignored', async ($, on) => {
    answerEngine(on)
    await startSession($)
    await $.classic.Notification({ message: 'idle', notification_type: 'idle_prompt' } as never)
    expect((await view($)).dialog).toBeUndefined()
  })

  test('a question waits with the question text until answered', async ($, on) => {
    let answer: (() => void) | undefined
    const { clock } = answerEngine(on, {
      tool: e => (e.tool === 'AskUserQuestion' ? new Promise(resolve => (answer = () => resolve({ result: 'a', text: 'a' }))) : { result: 'ok', text: 'ok' }),
    })
    await startSession($)
    await startTurn($)
    const asked = $.tool.call({ tool: 'AskUserQuestion', tool_use_id: 'q1', questions: [] } as never)
    await waitFor(clock, () => answer !== undefined)
    const during = await view($)
    expect(await during.ui.find({ type: 'Text', text: questionText() })).toBeDefined()
    await during.ui.unmount()
    answer?.()
    await asked
    expect((await view($)).dialog).toBeUndefined()
  })
})
