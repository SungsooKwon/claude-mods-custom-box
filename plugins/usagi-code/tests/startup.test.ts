import { test, expect } from 'claude-code/testing'
import { answerEngine, mountPane, startSession } from './harness'

test('the studio opens itself when a session starts', async ($, on) => {
  const { rec } = answerEngine(on)
  await startSession($)
  expect(rec.opened).toEqual(['usagi-code'])
})

test('openOnStartup off opens nothing', { options: { openOnStartup: false } }, async ($, on) => {
  const { rec } = answerEngine(on)
  await startSession($)
  expect(rec.opened).toEqual([])
})

test('a session with no terminal opens nothing and /usagi explains', async ($, on) => {
  const { rec } = answerEngine(on, { surfaces: ['desktop'] })
  await startSession($)
  expect(rec.opened).toEqual([])
  expect(await $.command.run({ command: 'usagi', args: '' } as never)).toMatchObject({
    text: 'Usagi code runs in the terminal for now.',
  })
  expect(rec.opened).toEqual([])
})

test('a startup pane placed inline stays open', async ($, on) => {
  const { rec, clock } = answerEngine(on)
  await startSession($)
  const ui = await mountPane($, 46, 30, 'inline')
  await clock.advance(0)
  expect(rec.closed).toEqual([])
  expect(rec.toasts).toEqual([])
  expect(await ui.find({ key: 'stage' })).toBeDefined()
})

test('a pane the person opened stays inline', { options: { openOnStartup: false } }, async ($, on) => {
  const { rec, clock } = answerEngine(on)
  await startSession($)
  await $.command.run({ command: 'usagi', args: '' } as never)
  const ui = await mountPane($, 46, 30, 'inline')
  await clock.advance(0)
  expect(rec.closed).toEqual([])
  expect(await ui.find({ key: 'stage' })).toBeDefined()
})
