// The Stage scene: a character from characters.ts (Usagi by default),
// typing at a keyboard while a tool runs, a thinking bubble between steps,
// dozing after a quiet minute, standing still with open eyes otherwise.

import type { Hat, Pose } from '../../types'
import { TRANSPARENT, newGrid } from './pixels'
import type { Grid } from './pixels'
import { put, rect, stamp } from './clawd'
import { CHARACTERS } from './characters'
import type { CharacterId, SceneLayout } from './characters'

export const SCENE_W = 40
export const SCENE_H = 44

export const POSE_FRAMES: Readonly<Record<Pose, number>> = {
  coding: 8,
  thinking: 8,
  reading: 8,
  terminal: 8,
  browsing: 8,
  helper: 8,
  oops: 8,
  waving: 8,
  done: 8,
  idle: 8,
  asleep: 8,
}

/** 손으로 그린 장면이 있는 줄 수면 그 크기, 없으면 undefined (그때는 22줄 장면을 줄여 쓴다). */
export function sceneSize(rows: number, character: CharacterId = 'usagi'): { w: number; h: number } | undefined {
  const layout = CHARACTERS[character].layouts[rows]
  return layout === undefined ? undefined : { w: layout.w, h: layout.h }
}

const layoutOf = (rows: number, character: CharacterId): SceneLayout => {
  const { layouts } = CHARACTERS[character]
  return layouts[rows] ?? layouts[22]
}

// 일하는 포즈(생각 중 포함)는 키보드를 두드리고, 나머지는 멀뚱히 서 있는다
const TYPING: ReadonlySet<Pose> = new Set(['thinking', 'coding', 'reading', 'terminal', 'browsing', 'helper'])

// 생각 중 말풍선: 글자 칸 cells 를 감싼 흰 둥근 상자 (y 0~5) 와 캐릭터 쪽 꼬리, 글자는 stage 가 셀로 얹는다
const BUBBLE = 0xffffff
const BUBBLE_INK = 0x492821

function drawBubble(g: Grid, x: number, cells: number): void {
  const x1 = x + cells + 1
  rect(g, x, 0, x1, 5, BUBBLE)
  for (const [cx, cy] of [[x, 0], [x1, 0], [x, 5], [x1, 5]] as const) put(g, cx, cy, TRANSPARENT)
  if (cells < 3) return // 한 칸짜리는 꼬리가 머리에 닿아 뺀다
  put(g, x + 1, 6, BUBBLE)
  put(g, x, 7, BUBBLE)
}

export type SceneLabel = { x: number; row: number; text: string; fg: number; bg: number }

/** 장면 위에 얹을 글자 한 줄 (셀 단위 x·행), 없으면 null. */
export function sceneLabel(pose: Pose, tick: number, rows = 22, character: CharacterId = 'usagi'): SceneLabel | null {
  if (pose !== 'thinking') return null
  const { bubbleX, dots } = layoutOf(rows, character)
  const text = dots === undefined ? ('thinking' + '.'.repeat(tick % 4)).padEnd(12) : '.'.repeat(tick % (dots + 1)).padEnd(dots)
  return { x: bubbleX + 1, row: 1, text, fg: BUBBLE_INK, bg: BUBBLE }
}

/** 캐릭터 앞 키보드와 두 앞발, 프레임마다 한 발씩 들었다 내리며 누른 키가 반짝인다. */
function drawKeyboard(g: Grid, f: number, layout: SceneLayout, palette: Readonly<Record<string, number>>): void {
  const { keys: [x0, x1], top, mini } = layout
  const paw = mini ? ['dood'] : ['dood', 'dood', '.dd.']
  rect(g, x0, top, x1, top, 0x2b2f36)
  rect(g, x0, top + 1, x1, top + (mini ? 2 : 4), 0x8b9096)
  for (let kx = x0 + 1; kx < x1; kx += 2) {
    put(g, kx, top + 1, 0xc9cdd2)
    if (!mini) put(g, kx + 1, top + 3, 0xc9cdd2)
  }
  layout.paws.forEach((px, i) => {
    const up = f % 2 === i
    stamp(g, paw, px, up ? top - (mini ? 1 : 3) : top, palette)
    if (!up) rect(g, px + 1, top + paw.length, px + 2, top + paw.length, 0xffd54f)
  })
}

// 졸 때: 콧방울 반지름(프레임 8장), 감은 눈 ‿, 떠오르는 z 글꼴
const SNOT = [0, 1, 1, 2, 2, 2, 1, 0]
const SNOT_FILL = 0xbfe6ff
const CLOSED = ['oooo', 'oooo', 'dood', '.dd.']
const CLOSED_MINI = ['oo', 'dd']
const Z_SMALL = ['ddd', '..d', '.d.', 'd..', 'ddd']
const Z_BIG = ['dddd', '...d', '..d.', '.d..', 'd...', 'dddd']
const Z_INK = 0x6b5a8e

/** 조는 캐릭터 한 프레임(f 0~7): 눈을 감고 숨 쉬듯 1px 오르내리며, 콧방울이 커졌다 꺼지고 z 가 차례로 떠오른다. */
function drawAsleep(g: Grid, layout: SceneLayout, f: number, palette: Readonly<Record<string, number>>): void {
  const { art, rx, eyes, snot, zs, mini } = layout
  const ry = layout.ry + ((f >> 1) & 1)
  stamp(g, art, rx, ry, palette)
  for (const [ex, ey] of eyes) stamp(g, mini ? CLOSED_MINI : CLOSED, rx + ex, ry + ey, palette)
  const r = Math.min(snot?.max ?? 0, SNOT[f] ?? 0)
  if (snot !== undefined && r > 0) {
    const cx = rx + snot.at[0] + 1 + r
    const cy = ry + snot.at[1] + 1
    for (let y = cy - r; y <= cy + r; y++) {
      for (let x = cx - r; x <= cx + r; x++) if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r + r) put(g, x, y, SNOT_FILL)
    }
    put(g, cx - Math.floor(r / 2), cy - Math.floor(r / 2), 0xffffff)
  }
  zs.forEach(([zx, zy, big], k) => {
    if (f < k * 2) return // 둘째 z 는 두 프레임 늦게
    const top = zy - ((f - k * 2) % 6)
    ;(big ? Z_BIG : Z_SMALL).forEach((line, dy) => [...line].forEach((ch, dx) => ch === 'd' && put(g, zx + dx, top + dy, Z_INK)))
  })
}

/** One frame of a pose (40x44 px at 22 rows, else the size the character has hand-drawn art for), transparent where the backdrop shows. */
export function sceneFrame(pose: Pose, _hat: Hat, tick: number, rows = 22, character: CharacterId = 'usagi'): Grid {
  const layout = layoutOf(rows, character)
  const { palette } = CHARACTERS[character]
  const g = newGrid(layout.w, layout.h, TRANSPARENT)
  // 조는 건 느리게: 세 틱(약 0.5초)에 한 프레임
  if (pose === 'asleep') {
    drawAsleep(g, layout, Math.floor(tick / 3) % POSE_FRAMES.asleep, palette)
    return g
  }
  const f = tick % POSE_FRAMES[pose]
  stamp(g, layout.art, layout.rx, layout.ry, palette)
  if (TYPING.has(pose)) drawKeyboard(g, f, layout, palette)
  if (pose === 'thinking') drawBubble(g, layout.bubbleX, layout.dots ?? 12)
  return g
}
