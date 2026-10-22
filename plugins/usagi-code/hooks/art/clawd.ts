// 마스코트를 크림색 토끼로 바꾼 판: 둥근 몸, 분홍 속귀·볼, 반짝이는 점눈.
// 포즈 옵션(시선·깜빡임·팔·모자)은 원본 Clawd 와 같은 자리에 그린다.

import type { Hat } from '../../types'
import { TRANSPARENT } from './pixels'
import type { Grid } from './pixels'

export const CLAWD_PALETTE: Readonly<Record<string, number>> = {
  o: 0xfaf1d0, // body (cream rabbit)
  O: 0xfff8dc, // highlight
  d: 0x492821, // outline
  p: 0xf6c5cb, // inner ears, cheeks
  k: 0x1f1410, // eyes
  w: 0xf8fdf9, // glint
  B: 0x2b2f36, // laptop bezel
  G: 0x8b9096, // laptop body
  g: 0xc9cdd2, // keys
  s: 0x1e2433, // code screen
  S: 0x11151c, // sleeping screen
  K: 0x0b0d10, // terminal screen
  P: 0xc678dd, C: 0x61afef, Y: 0xe5c07b, L: 0x98c379, R: 0xe06c75, T: 0xabb2bf, // syntax
  M: 0x5c6370, // dimmed code
  x: 0xffffff, // white on screens, bubbles
  e: 0xe8ecf1, n: 0x7a8594, // page and its text
  A: 0x3b7fc4, // browser title strip
  E: 0x3366cc, F: 0x66cc66, // globe ocean and land (also the pumpkin stem)
  r: 0xd9534f, // error screen
  v: 0x4caf50, // done screen, sleep light
  q: 0x3a3a3a, // thought ink, Zzz
  u: 0xc8b39a, U: 0x9c8569, // desk
  z: 0xffd54f, // sparkle, key flash
  c: 0x8fd3ff, // sweat drop
  H: 0xf28c28, // pumpkin
  X: 0xd42a2a, // Santa red
  J: 0xf2d43c, // party yellow
  I: 0xe0457b, // heart
}

export function put(g: Grid, x: number, y: number, color: number): void {
  if (x >= 0 && y >= 0 && x < g.w && y < g.h) g.px[y * g.w + x] = color
}

export function rect(g: Grid, x0: number, y0: number, x1: number, y1: number, color: number): void {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(g, x, y, color)
}

/** Draws palette-character rows with their top-left at (x, y); `.` leaves the grid as it is. */
export function stamp(g: Grid, rows: readonly string[], x: number, y: number, palette = CLAWD_PALETTE): void {
  rows.forEach((row, dy) => {
    ;[...row].forEach((ch, dx) => {
      const color = palette[ch]
      if (ch !== '.' && color !== undefined) put(g, x + dx, y + dy, color)
    })
  })
}

const c = (ch: string): number => CLAWD_PALETTE[ch] ?? TRANSPARENT

const HATS: Readonly<Record<Exclude<Hat, 'none'>, readonly string[]>> = {
  pumpkin: ['.......FF.......', '....HHHHHHHH....', '...HHHqHHqHHH...', '..HHHHHHHHHHHH..'],
  santa: ['..........XXxx..', '......XXXXXX....', '....XXXXXXXX....', '..xxxxxxxxxxxx..'],
  party: ['.......XX.......', '......JIIJ......', '.....JIJJIJ.....', '....IJJIIJJI....'],
  heart: ['.....II.II......', '....IIIIIII.....', '.....IIIII......', '......III.......'],
}

export type Arms = 'none' | 'scratch' | 'facepalm' | 'up' | 'wave-left' | 'wave-right'

export type ClawdOptions = {
  look?: readonly [number, number]
  blink?: boolean
  arms?: Arms
  hat?: Hat
  slump?: boolean
  /** Animation frame, for the head scratch. */
  f?: number
}

// 크림색 토끼: 16x10 둥근 몸통, 귀는 몸통 위 4줄 (y0-4 ~ y0-1)
const RABBIT_EARS = ['.....dd...dd....', '....dpod.dpod...', '....dpod.dpod...', '....dpod.dpod...']
const RABBIT_BODY = [
  '.....dddddd.....',
  '...ddOOoooodd...',
  '..dOOooooooood..',
  '.dOoooooooooood.',
  'dOoooooooooooood',
  'dooooooooooooood',
  'dooooooooooooood',
  '.dooooooooooood.',
  '..ddoooooooodd..',
  '....dddddddd....',
]

/** The rabbit's 16x10 body with its top-left at (x0, y0), ears above, feet below, arms and hat as asked. */
export function drawClawd(g: Grid, x0: number, y0Base: number, o: ClawdOptions = {}): void {
  const y0 = y0Base + (o.slump === true ? 1 : 0)
  stamp(g, RABBIT_BODY, x0, y0)
  const [dx, dy] = o.look ?? [0, 0]
  for (const ex of [x0 + 4, x0 + 10]) {
    if (o.blink === true) {
      rect(g, ex + dx, y0 + 4 + dy, ex + 1 + dx, y0 + 4 + dy, c('k'))
    } else {
      rect(g, ex + dx, y0 + 3 + dy, ex + 1 + dx, y0 + 4 + dy, c('k'))
      put(g, ex + dx, y0 + 3 + dy, c('w'))
    }
  }
  for (const x of [1, 2, 13, 14]) put(g, x0 + x, y0 + 6, c('p'))
  for (const [x, y] of [[6, 6], [7, 7], [8, 7], [9, 6]] as const) put(g, x0 + x, y0 + y, c('k'))
  for (const fx of [x0 + 5, x0 + 9]) {
    rect(g, fx, y0 + 10, fx + 1, y0 + 10, c('o'))
    rect(g, fx, y0 + 11, fx + 1, y0 + 11, c('d'))
    put(g, fx - 1, y0 + 10, c('d'))
    put(g, fx + 2, y0 + 10, c('d'))
  }
  // 모자를 먼저 쓰고 귀가 모자를 뚫고 나온다
  if (o.hat !== undefined && o.hat !== 'none') stamp(g, HATS[o.hat], x0, y0 - 4)
  stamp(g, RABBIT_EARS, x0, y0 - 4)

  const ay = y0 + 5
  const f = o.f ?? 0
  switch (o.arms ?? 'none') {
    case 'scratch': {
      const hx = x0 + 1 + (f % 3)
      rect(g, x0 - 2, y0 - 2, x0 - 1, ay + 1, c('o'))
      rect(g, x0 - 1, y0 - 2, hx + 2, y0 - 1, c('o'))
      rect(g, hx, y0 - 2, hx + 2, y0 - 2, c('O'))
      if (f % 2 === 0) {
        put(g, hx + 4, y0 - 3, c('q'))
        put(g, hx - 2, y0 - 3, c('q'))
      }
      break
    }
    case 'facepalm':
      rect(g, x0 - 2, y0 + 2, x0 - 1, ay + 1, c('d'))
      rect(g, x0 - 1, y0 + 1, x0 + 7, y0 + 5, c('o'))
      rect(g, x0 - 1, y0 + 1, x0 + 7, y0 + 1, c('O'))
      rect(g, x0 + 7, y0 + 2, x0 + 7, y0 + 5, c('d'))
      break
    case 'up':
      rect(g, x0 - 2, y0 - 3, x0 - 1, ay + 1, c('o'))
      rect(g, x0 + 16, y0 - 3, x0 + 17, ay + 1, c('o'))
      put(g, x0 - 2, y0 - 3, c('O'))
      put(g, x0 + 16, y0 - 3, c('O'))
      break
    case 'wave-left':
    case 'wave-right': {
      const leftUp = o.arms === 'wave-left'
      if (leftUp) {
        rect(g, x0 - 3, y0 - 3, x0 - 2, ay, c('o'))
        put(g, x0 - 3, y0 - 3, c('O'))
        rect(g, x0 + 16, ay, x0 + 18, ay + 1, c('o'))
      } else {
        rect(g, x0 - 3, ay, x0 - 1, ay + 1, c('o'))
        rect(g, x0 + 17, y0 - 3, x0 + 18, ay, c('o'))
        put(g, x0 + 18, y0 - 3, c('O'))
      }
      break
    }
    case 'none':
      break
  }
}

/** Two outlined hands on the keyboard deck in front of Clawd; typing lifts them in turn and flashes the key. */
export function drawHands(g: Grid, mode: 'type' | 'rest', f: number): void {
  ;[10, 17].forEach((hx, i) => {
    const up = mode === 'type' && f % 2 === i
    stamp(g, ['dOOd', 'dood', '.dd.'], hx, up ? 13 : 14)
    if (mode === 'type' && !up) {
      put(g, hx + 1, 13, c('z'))
      put(g, hx + 2, 12, c('z'))
    }
  })
}
