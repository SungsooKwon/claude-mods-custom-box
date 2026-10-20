import { test, expect, describe } from 'claude-code/testing'
import { screensaverCells, screensaverKindAt } from '../hooks/art/screensavers'
import type { ScreensaverKind } from '../hooks/art/screensavers'
import { answerEngine, completeTurn, mountPane, startSession, startTurn } from './harness'
import { decode } from './cells'
import { meadow } from '../hooks/art/stage'

const KINDS: ScreensaverKind[] = ['pipes', 'starfield', 'flying-clawds']

function lit(cells: string): number {
  const words = decode(cells)
  let count = 0
  for (let i = 0; i < words.length; i += 3) {
    if (words[i + 1] !== 0) count++
    if (words[i + 2] !== 0) count++
  }
  return count
}

describe('screensaverCells', () => {
  test('fills the raster and repeats exactly for the same tick and seed', () => {
    for (const kind of KINDS) {
      const cells = screensaverCells(kind, 30, 6, 10, 7)
      expect(decode(cells)).toHaveLength(30 * 6 * 3)
      expect(screensaverCells(kind, 30, 6, 10, 7)).toBe(cells)
    }
  })

  test('pipes keep growing', () => {
    expect(lit(screensaverCells('pipes', 46, 12, 50, 3))).toBeGreaterThan(lit(screensaverCells('pipes', 46, 12, 5, 3)))
  })

  test('stars and Clawds move', () => {
    expect(screensaverCells('starfield', 46, 12, 1, 3)).not.toBe(screensaverCells('starfield', 46, 12, 2, 3))
    expect(screensaverCells('flying-clawds', 46, 12, 1, 3)).not.toBe(screensaverCells('flying-clawds', 46, 12, 2, 3))
  })
})

test('the screensavers take turns a minute each', () => {
  expect(screensaverKindAt(0)).toBe('pipes')
  expect(screensaverKindAt(61_000)).toBe('starfield')
  expect(screensaverKindAt(121_000)).toBe('flying-clawds')
  expect(screensaverKindAt(181_000)).toBe('pipes')
})

// 깨어 있는 무대는 왼쪽 위 칸이 풀밭 색이다
function hasWorkArea(cells: string | undefined): boolean {
  return cells !== undefined && decode(cells)[1] === meadow(0, 0)
}

test('an idle studio starts the screensaver and a new turn wakes it', { options: { screensaverMinutes: 1 } }, async ($, on) => {
  const { clock } = answerEngine(on)
  await startSession($)
  await startTurn($)
  await completeTurn($)
  await clock.advance(61_800)
  const idle = await mountPane($, 46, 32)
  const saver = (await idle.find({ key: 'stage' }))?.props as { cells: string } | undefined
  expect(saver).toBeDefined()
  expect(hasWorkArea(saver?.cells)).toBe(false)
  await idle.unmount()
  await startTurn($, 't2')
  const awake = await mountPane($, 46, 32)
  expect(hasWorkArea(((await awake.find({ key: 'stage' }))?.props as { cells: string } | undefined)?.cells)).toBe(true)
})

test('screensaverMinutes 0 never starts it', { options: { screensaverMinutes: 0 }, timeoutMs: 20_000 }, async ($, on) => {
  const { clock } = answerEngine(on)
  await startSession($)
  await startTurn($)
  await completeTurn($)
  await clock.advance(600_000)
  const ui = await mountPane($, 46, 32)
  expect(hasWorkArea(((await ui.find({ key: 'stage' }))?.props as { cells: string } | undefined)?.cells)).toBe(true)
})
