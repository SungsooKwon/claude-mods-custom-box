import { test, expect, describe } from 'claude-code/testing'
import { THEMES, themeFor } from '../hooks/themes'
import type { Theme } from '../hooks/themes'

describe('themeFor', () => {
  test('auto follows the operating system', () => {
    expect(themeFor('auto', 'windows').name).toBe('windows7')
    expect(themeFor('auto', 'macos').name).toBe('macos')
    expect(themeFor('auto', 'linux').name).toBe('ubuntu')
    expect(themeFor('auto', 'other').name).toBe('ubuntu')
  })

  test('a chosen theme wins over the operating system', () => {
    expect(themeFor('macos', 'windows').name).toBe('macos')
    expect(themeFor('windows7', 'linux').name).toBe('windows7')
  })

  test('an unknown setting behaves as auto', () => {
    expect(themeFor('neon', 'macos').name).toBe('macos')
  })
})

describe('backdrops', () => {
  test('Windows 7 is a sky gradient', () => {
    expect(THEMES.windows7.backdrop(0, 0)).toBe(0x3b7fc4)
  })

  test('Ubuntu runs from aubergine to orange', () => {
    expect(THEMES.ubuntu.backdrop(0, 0)).toBe(0x2c001e)
    expect((THEMES.ubuntu.backdrop(39, 18) >> 16) & 0xff).toBeGreaterThan(0xd0)
  })

  test('Mac is linen', () => {
    const seen = new Set<number>()
    for (let x = 0; x < 8; x++) seen.add(THEMES.macos.backdrop(x, 3))
    expect(seen).toEqual(new Set([0x3e4350, 0x383d49]))
  })
})

function colours(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string' && value.startsWith('#')) out.push(value)
  else if (typeof value === 'object' && value !== null) for (const v of Object.values(value)) colours(v, out)
  return out
}

test('every theme colour is #RRGGBB', () => {
  for (const theme of Object.values(THEMES) as Theme[]) {
    const all = colours(theme)
    expect(all.length).toBeGreaterThan(25)
    for (const c of all) expect(c).toMatch(/^#[0-9A-F]{6}$/i)
  }
})
