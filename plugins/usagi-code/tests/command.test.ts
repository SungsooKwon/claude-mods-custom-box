import { test, expect } from 'claude-code/testing'
import { answerEngine, startSession } from './harness'

test('/usagi opens the pane, and closes it when open', { options: { openOnStartup: false } }, async ($, on) => {
  const { rec } = answerEngine(on)
  await startSession($)
  rec.opened.length = 0
  expect(await $.command.run({ command: 'usagi', args: '' } as never)).toMatchObject({ text: expect.stringContaining('opened') })
  expect(rec.opened).toEqual(['usagi-code'])
  expect(await $.command.run({ command: 'usagi', args: '' } as never)).toMatchObject({ text: expect.stringContaining('closed') })
  expect(rec.closed).toEqual(['usagi-code'])
})

test('the pane is titled Usagi code with the project folder', async ($, on) => {
  const { rec } = answerEngine(on)
  await startSession($)
  expect(rec.titles).toEqual(['Usagi code · my-project'])
})

test('/usagi + and /usagi size resize Usagi without a click', async ($, on) => {
  const { ctl } = answerEngine(on)
  await startSession($)
  expect(await $.command.run({ command: 'usagi', args: '+' } as never)).toMatchObject({ text: 'Usagi size 24 rows.' })
  expect(await $.command.run({ command: 'usagi', args: 'size 99' } as never)).toMatchObject({ text: 'Usagi size 44 rows.' })
  expect(ctl.store.get('stageRows')).toBe(44)
})
