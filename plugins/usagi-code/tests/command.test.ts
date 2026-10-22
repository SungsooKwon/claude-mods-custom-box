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

// 넓은 전체 화면에선 Claude Code 가 pane 을 오른쪽에 붙이니, 그때 무대가 다 들어가는 폭을 청한다
test('asks for a 46-column dock wherever it opens the pane', async ($, on) => {
  const { rec } = answerEngine(on)
  await startSession($)
  await $.command.run({ command: 'usagi', args: '+' } as never)
  expect(rec.columns).toEqual([46, 46])
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

// 캐릭터 명령도 /usagi 와 같은 말로 크기를 바꾸고, 그 캐릭터를 무대에 세운다
test('/chiikawa - and /chiikawa size resize Chiikawa', async ($, on) => {
  const { ctl } = answerEngine(on)
  await startSession($)
  expect(await $.command.run({ command: 'chiikawa', args: '-' } as never)).toMatchObject({ text: 'Chiikawa size 20 rows.' })
  expect(await $.command.run({ command: 'chiikawa', args: 'size 14' } as never)).toMatchObject({ text: 'Chiikawa size 14 rows.' })
  expect(ctl.store.get('stageRows')).toBe(14)
})
