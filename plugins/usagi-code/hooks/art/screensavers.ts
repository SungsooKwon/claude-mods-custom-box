// Three original screensavers, drawn deterministically from a seed and the
// number of ticks since they started: growing pipes, a starfield, and mini Clawds
// (mini Clawds) with toast wings drifting across the Stage.

import { drawMiniClawd } from './clawd'
import { gridToCells, newGrid } from './pixels'
import type { Grid } from './pixels'

export type ScreensaverKind = 'pipes' | 'starfield' | 'flying-clawds'

const ORDER: readonly ScreensaverKind[] = ['pipes', 'starfield', 'flying-clawds']
const TURN_MS = 60_000
const BLACK = 0x000000

export function screensaverKindAt(idleMs: number): ScreensaverKind {
  return ORDER[Math.floor(Math.max(0, idleMs) / TURN_MS) % ORDER.length] ?? 'pipes'
}

/** mulberry32: a small seeded PRNG, so a frame is the same every time it is drawn. */
function prng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const set = (g: Grid, x: number, y: number, color: number) => {
  if (x >= 0 && y >= 0 && x < g.w && y < g.h) g.px[y * g.w + x] = color
}

// ── Pipes ───────────────────────────────────────────────────────────────

const PIPE_COLORS: readonly (readonly [number, number])[] = [
  [0x6fd3ff, 0x1f6f9f],
  [0xff8a5c, 0x9f3a1f],
  [0x9cff6f, 0x3f8f1f],
  [0xffe66f, 0x9f8a1f],
  [0xd38aff, 0x6a2f9f],
]
const STEPS_PER_TICK = 2
const PIPE_LENGTH = 60
const DIRS = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
] as const

function pipes(g: Grid, tick: number, seed: number): void {
  const rand = prng(seed)
  let x = 0
  let y = 0
  let dir = 0
  let colors = PIPE_COLORS[0] ?? [0xffffff, 0x888888]
  const restart = (n: number) => {
    x = Math.floor(rand() * g.w)
    y = Math.floor(rand() * (g.h - 1))
    dir = Math.floor(rand() * 4)
    colors = PIPE_COLORS[n % PIPE_COLORS.length] ?? colors
  }
  restart(0)
  for (let step = 0; step < tick * STEPS_PER_TICK; step++) {
    if (step > 0 && step % PIPE_LENGTH === 0) restart(step / PIPE_LENGTH)
    const [light, dark] = colors
    const horizontal = dir % 2 === 0
    set(g, x, y, light)
    set(g, horizontal ? x : x + 1, horizontal ? y + 1 : y, dark)
    let [dx, dy] = DIRS[dir] ?? [1, 0]
    const blocked = x + dx < 0 || x + dx >= g.w - 1 || y + dy < 0 || y + dy >= g.h - 1
    if (blocked || rand() < 0.08) {
      dir = (dir + (rand() < 0.5 ? 1 : 3)) % 4
      ;[dx, dy] = DIRS[dir] ?? [1, 0]
    }
    x = Math.min(g.w - 2, Math.max(0, x + dx))
    y = Math.min(g.h - 2, Math.max(0, y + dy))
  }
}

// ── Starfield ───────────────────────────────────────────────────────────

const STARS = 40

function starfield(g: Grid, tick: number, seed: number): void {
  const rand = prng(seed)
  const cx = g.w / 2
  const cy = g.h / 2
  const reach = Math.hypot(cx, cy)
  for (let i = 0; i < STARS; i++) {
    const angle = rand() * Math.PI * 2
    const speed = 0.004 + rand() * 0.012
    const phase = rand()
    const depth = (phase + tick * speed) % 1
    const r = depth * depth * reach
    const shade = Math.round(90 + depth * 165)
    set(g, Math.round(cx + Math.cos(angle) * r * 2), Math.round(cy + Math.sin(angle) * r), (shade << 16) | (shade << 8) | shade)
  }
}

// ── Flying cats ─────────────────────────────────────────────────────────

const CATS = 3
const WING_UP = 0xe8c48a
const WING_DOWN = 0xc68e3e

function flyingClawds(g: Grid, tick: number, seed: number): void {
  const rand = prng(seed)
  for (let i = 0; i < CATS; i++) {
    const x0 = rand() * (g.w + 16)
    const y0 = rand() * (g.h + 8)
    const x = Math.round(((x0 + tick) % (g.w + 16)) - 8)
    const y = Math.round(((y0 + tick / 2) % (g.h + 8)) - 8)
    const flap = (tick + i) % 2 === 0
    const wing = flap ? WING_UP : WING_DOWN
    for (const dx of [-3, -2, -1, 8, 9, 10]) {
      set(g, x + dx, y + (flap ? 2 : 3), wing)
      set(g, x + dx, y + (flap ? 3 : 4), wing)
    }
    drawMiniClawd(g, x, y + 1, tick + i)
  }
}

/** One screensaver frame, `cols` × `rows` cells, black behind it. */
export function screensaverCells(kind: ScreensaverKind, cols: number, rows: number, tick: number, seed: number): string {
  const g = newGrid(cols, rows * 2, BLACK)
  if (kind === 'pipes') pipes(g, tick, seed)
  else if (kind === 'starfield') starfield(g, tick, seed)
  else flyingClawds(g, tick, seed)
  return gridToCells(g)
}
