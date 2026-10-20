import { test, expect, describe } from 'claude-code/testing'
import {
  DEFAULT_COLOR,
  TRANSPARENT,
  drawSprite,
  gridToCells,
  newGrid,
  sanitizeForRaster,
  textWords,
  wordsToCells,
} from '../hooks/art/pixels'
import { decode } from './cells'

describe('gridToCells', () => {
  test('packs two stacked pixels into one upper-half-block cell', () => {
    const g = newGrid(1, 2, 0)
    g.px[0] = 0xff8800
    g.px[1] = 0x000000
    expect(decode(gridToCells(g))).toEqual([0x2580, 0xff8800, 0x000000])
  })

  test('draws transparent pixels in the terminal default color', () => {
    const g = newGrid(2, 2, TRANSPARENT)
    g.px[0] = 0x123456
    expect(decode(gridToCells(g))).toEqual([0x2580, 0x123456, DEFAULT_COLOR, 0x2580, DEFAULT_COLOR, DEFAULT_COLOR])
  })
})

test('drawSprite clips at the edges and skips transparent pixels', () => {
  const dst = newGrid(3, 3, 0x111111)
  const src = newGrid(4, 4, 0xaaaaaa)
  src.px[15] = TRANSPARENT
  expect(() => drawSprite(dst, src, -2, -2)).not.toThrow()
  expect([...dst.px]).toEqual([0xaaaaaa, 0xaaaaaa, 0x111111, 0xaaaaaa, 0x111111, 0x111111, 0x111111, 0x111111, 0x111111])
})

describe('textWords', () => {
  test('pads text to the column count', () => {
    const words = textWords('ab', 4, 1, 2)
    expect([...words]).toEqual([0x61, 1, 2, 0x62, 1, 2, 0x20, 1, 2, 0x20, 1, 2])
  })

  test('cuts long text to the column count', () => {
    expect(textWords('a'.repeat(300), 10, 1, 2)).toHaveLength(30)
  })

  test('takes a background per column', () => {
    const words = textWords('ab', 2, 1, i => 100 + i)
    expect([...words]).toEqual([0x61, 1, 100, 0x62, 1, 101])
  })

  test('round-trips through wordsToCells', () => {
    expect(decode(wordsToCells(textWords('x', 1, 5, 6)))).toEqual([0x78, 5, 6])
  })
})

test('sanitizeForRaster keeps only printable width-1 BMP characters', () => {
  expect(sanitizeForRaster('日本 🎵 é\tx')).toBe('?? ? é x')
  expect(sanitizeForRaster('áb')).toBe('a?b')
  expect(sanitizeForRaster('ＡＢ한')).toBe('???')
  expect(sanitizeForRaster('ok')).toBe('ok')
})
