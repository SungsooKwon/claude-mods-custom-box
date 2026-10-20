import { test, expect, describe } from 'claude-code/testing'
import { STAGE_ROWS, meadow, stageCells } from '../hooks/art/stage'
import { rasterFrames } from '../hooks/animator'
import { THEMES } from '../hooks/themes'
import { cellAt, decode } from './cells'

const sky = THEMES.windows7.backdrop
const base = { pose: 'coding' as const, hat: 'none' as const, tick: 0, backdrop: sky }

describe('stageCells', () => {
  test('fills the whole raster', () => {
    expect(decode(stageCells({ ...base, cols: 46 }))).toHaveLength(46 * STAGE_ROWS * 3)
  })

  test('shows the meadow at the edges of a wide stage', () => {
    const [, top] = cellAt(stageCells({ ...base, cols: 46 }), 46, 0, 0)
    expect(top).toBe(meadow(0, 0))
  })

  test('centres the 40-pixel scene when there is room', () => {
    const cells = stageCells({ ...base, cols: 46 })
    for (const col of [0, 1, 2]) {
      for (let row = 0; row < STAGE_ROWS; row++) {
        const [, fg] = cellAt(cells, 46, col, row)
        expect(fg).not.toBe(0xfaf1d0)
      }
    }
  })

  test('clips a narrow stage on the right, keeping Clawd', () => {
    const cells = stageCells({ ...base, cols: 34 })
    expect(decode(cells)).toHaveLength(34 * STAGE_ROWS * 3)
    expect(decode(cells)).toContain(0xfaf1d0)
  })

  test('shrinks the scene to fewer rows, Clawd still in it', () => {
    const cells = stageCells({ ...base, cols: 22, rows: 11 })
    expect(decode(cells)).toHaveLength(22 * 11 * 3)
    expect(decode(cells)).toContain(0xfaf1d0)
  })

  // 20·18·14줄은 손으로 그린 도안이라 줄여도 두 눈의 반짝임 4px 이 다 남는다
  test('keeps both eye glints at the hand-drawn 22, 20, 18 and 14 rows', () => {
    for (const [rows, cols] of [[22, 42], [20, 39], [18, 35], [14, 28]] as const) {
      const words = decode(stageCells({ ...base, pose: 'idle', cols, rows }))
      expect(words.filter((w, i) => i % 3 !== 0 && w === 0xf8fdf9)).toHaveLength(4)
    }
  })

  // 18줄 이하는 말풍선을 점으로 줄여 토끼를 무대 가운데 둔다
  test('centres Usagi on the small hand-drawn stages', () => {
    for (const [rows, cols] of [[18, 35], [14, 28], [8, 17]] as const) {
      const words = decode(stageCells({ ...base, pose: 'idle', cols, rows }))
      const inked = [...Array(cols).keys()].filter(col =>
        [...Array(rows).keys()].some(row => words.slice((row * cols + col) * 3 + 1, (row * cols + col) * 3 + 3).includes(0x492821)),
      )
      expect(Math.abs((inked[0]! + inked.at(-1)!) / 2 - (cols - 1) / 2)).toBeLessThanOrEqual(1)
    }
  })

  test('animates from tick to tick', () => {
    expect(stageCells({ ...base, cols: 46, tick: 0 })).not.toBe(stageCells({ ...base, cols: 46, tick: 1 }))
  })
})

describe('rasterFrames', () => {
  const stage = { cols: 46, rows: STAGE_ROWS, pose: 'coding' as const, hat: 'none' as const, theme: 'windows7' as const, idleSince: null }

  test('draws one stage raster for the studio', () => {
    const frames = rasterFrames({ stage }, 0, 0)
    expect(frames).toHaveLength(1)
    expect(frames[0]).toMatchObject({ key: 'stage', columns: 46, rows: STAGE_ROWS })
    expect(frames[0]?.cells).toBe(stageCells({ ...base, cols: 46 }))
  })

  test('an idle Clawd falls asleep after a quiet minute, without a redraw', () => {
    const idle = { ...stage, pose: 'idle' as const, idleSince: 0 }
    const awake = rasterFrames({ stage: idle }, 0, 1000)[0]?.cells
    const later = rasterFrames({ stage: idle }, 0, 61000)[0]?.cells
    expect(later).toBe(stageCells({ ...base, pose: 'asleep', cols: 46 }))
    expect(awake).toBe(stageCells({ ...base, pose: 'idle', cols: 46 }))
  })

  test('draws the meadow in every theme', () => {
    const ubuntu = rasterFrames({ stage: { ...stage, theme: 'ubuntu' } }, 0, 0)[0]?.cells ?? ''
    expect(cellAt(ubuntu, 46, 0, 0)[1]).toBe(meadow(0, 0))
  })
})
