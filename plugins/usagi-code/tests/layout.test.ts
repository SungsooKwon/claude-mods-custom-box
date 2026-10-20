import { test, expect } from 'claude-code/testing'
import { layoutV2 } from '../hooks/layout'

test('the tab content takes the rows left after chrome, tabs, Stage and status, up to 16', () => {
  expect(layoutV2(46, 33).content).toBe(8)
  expect(layoutV2(46, 39).content).toBe(14)
  expect(layoutV2(46, 60).content).toBe(16)
  expect(layoutV2(46, 31).content).toBe(6)
})

test('the tab content keeps at least 4 rows', () => {
  expect(layoutV2(46, 29).content).toBe(4)
  expect(layoutV2(46, 22).content).toBe(4)
})

test('a pane under 32 columns is too narrow', () => {
  expect(layoutV2(31, 40).tooNarrow).toBe(true)
  expect(layoutV2(32, 40).tooNarrow).toBe(false)
})

test('the Stage takes the width inside a one-column margin', () => {
  expect(layoutV2(60, 24).stageCols).toBe(58)
  expect(layoutV2(46, 24).stageCols).toBe(44)
})

test('from 80 columns the info sits beside the Stage, which shrinks to the rows left', () => {
  expect(layoutV2(120, 25)).toMatchObject({ side: true, stageRows: 22, stageCols: 42, infoCols: 76, content: 22 })
  expect(layoutV2(120, 14)).toMatchObject({ side: true, stageRows: 11, stageCols: 22, infoCols: 96 })
  expect(layoutV2(120, 3).stageRows).toBe(4)
})

test('a chosen Stage height takes its rows from the tab content, and caps the side Stage', () => {
  expect(layoutV2(46, 33, 12)).toMatchObject({ stageRows: 12, content: 16 })
  expect(layoutV2(46, 33, 30).content).toBe(4)
  expect(layoutV2(120, 40, 10)).toMatchObject({ side: true, stageRows: 10 })
})
