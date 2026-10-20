// The Stage scene: the cream rabbit from the reference pixel chart (29x37),
// typing at a keyboard while a tool runs, a thinking bubble between steps,
// standing still with open eyes otherwise.

import type { Hat, Pose } from '../../types'
import { TRANSPARENT, newGrid } from './pixels'
import type { Grid } from './pixels'
import { put, rect, stamp } from './clawd'

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

// 도안 그대로: d 테두리, o 몸, p 속귀·볼, w 눈 반짝임
const RABBIT = [
  '..........dd.....dd..........',
  '.........dpod...dopd.........',
  '.........dppod.doppd.........',
  '.........dppod.doppd.........',
  '.........dppod.doppd.........',
  '.........dppod.doppd.........',
  '.........dppod.doppd.........',
  '.........dppod.doppd.........',
  '..........dpod.dopd..........',
  '..........dood.dood..........',
  '.......ddoooodddoooodd.......',
  '.....ddoooooooooooooood......',
  '....dooooddooooooddooood.....',
  '...doooodoooooooooodooood....',
  '..doooodoooooooooooodooood...',
  '..dooodoooooooooooooodoood...',
  '.doooodoooooooooooooodooood..',
  '.doooooooddooooooddoooooood..',
  '.dooooooddwdooooddwdooooood..',
  '.doooooodwddoooodwddooooood..',
  '.dooopppoddooooooddopppoood..',
  '.doopdpdpooooodoooopdpdpood..',
  '.doopdpdpooodododoopdpdpood..',
  '.dooopppooooododoooopppoood..',
  '..dooooooooooooooooooooood...',
  '...doooooooooddoooooooood....',
  '....ddooooooooooooooooodd....',
  '....doooooooooooooooooood....',
  '....dodooooooooooooooodod....',
  '....dodooooooooooooooodod....',
  '.....doooooooooooooooodd.....',
  '......doooooooooooooood......',
  '......doooooooooooooood......',
  '......doooooooooooooood......',
  '......dodddooooooodddod......',
  '......dod..ddddddd..dod......',
  '.......d.............d.......',
]
// 20·18줄용: 얼굴(눈썹·눈·볼·입)은 22줄 그대로, 귀·몸·팔 길이와 양옆 한 열씩만 덜었다
const RABBIT_20 = [
  '.........dd.....dd.........',
  '........dpod...dopd........',
  '........dppod.doppd........',
  '........dppod.doppd........',
  '........dppod.doppd........',
  '........dppod.doppd........',
  '.........dpod.dopd.........',
  '.........dood.dood.........',
  '......ddoooodddoooodd......',
  '....ddoooooooooooooood.....',
  '...dooooddooooooddooood....',
  '..doooodoooooooooodooood...',
  '..dooodoooooooooooodoood...',
  '..doodoooooooooooooodood...',
  '.dooodoooooooooooooodoood..',
  '.dooooooddooooooddooooood..',
  '.doooooddwdooooddwdoooood..',
  '.dooooodwddoooodwddoooood..',
  '.doopppoddooooooddopppood..',
  '.dopdpdpooooodoooopdpdpod..',
  '.dopdpdpooodododoopdpdpod..',
  '.doopppooooododoooopppood..',
  '..dooooooooooooooooooood...',
  '..doooooooooddoooooooood...',
  '...ddooooooooooooooooodd...',
  '...doooooooooooooooooood...',
  '...dodooooooooooooooodod...',
  '...dodooooooooooooooodod...',
  '....doooooooooooooooodd....',
  '.....doooooooooooooood.....',
  '.....doooooooooooooood.....',
  '.....dodddooooooodddod.....',
  '.....dod..ddddddd..dod.....',
  '......d.............d......',
]
const RABBIT_18 = [
  '.........dd.....dd.........',
  '........dpod...dopd........',
  '........dppod.doppd........',
  '........dppod.doppd........',
  '........dppod.doppd........',
  '.........dpod.dopd.........',
  '.........dood.dood.........',
  '......ddoooodddoooodd......',
  '....ddoooooooooooooood.....',
  '...dooooddooooooddooood....',
  '..doooodoooooooooodooood...',
  '..dooodoooooooooooodoood...',
  '..doodoooooooooooooodood...',
  '.dooodoooooooooooooodoood..',
  '.dooooooddooooooddooooood..',
  '.doooooddwdooooddwdoooood..',
  '.dooooodwddoooodwddoooood..',
  '.doopppoddooooooddopppood..',
  '.dopdpdpooooodoooopdpdpod..',
  '.dopdpdpooodododoopdpdpod..',
  '.doopppooooododoooopppood..',
  '..dooooooooooooooooooood...',
  '..doooooooooddoooooooood...',
  '...ddooooooooooooooooodd...',
  '...dodooooooooooooooodod...',
  '....doooooooooooooooodd....',
  '.....doooooooooooooood.....',
  '.....dodddooooooodddod.....',
  '.....dod..ddddddd..dod.....',
  '......d.............d......',
]
// 14줄: 귀·눈썹·몸을 줄인 21폭, 눈 4x4·볼·입 무늬는 그대로
const RABBIT_14 = [
  '......dd.....dd......',
  '.....dpod...dopd.....',
  '.....dppod.doppd.....',
  '.....dppod.doppd.....',
  '......dood.dood......',
  '...ddoooodddoooodd...',
  '.ddooooooooooooooodd.',
  'doooooodooooodooooood',
  'dooooodooooooodoooood',
  'doooooooooooooooooood',
  'doooooddoooooddoooood',
  'dooooddwdoooddwdooood',
  'doooodwddooodwddooood',
  'dopppoddoooooddopppod',
  'dpdpdpoooodoooopdpdpd',
  'dpdpdpoodododoopdpdpd',
  'dopppoooododoooopppod',
  '.doooooooooooooooood.',
  '..doooooodddooooood..',
  '..dodddooooooodddod..',
  '..dod..ddddddd..dod..',
  '...d.............d...',
]
// 8줄: 11폭 작은 토끼, 눈은 2x2 (반짝임을 넣으면 ㄴ자로 보여 뺐다)
const RABBIT_8 = [
  '...d...d...',
  '..dpd.dpd..',
  '..dpd.dpd..',
  '..dpd.dpd..',
  '..dpd.dpd..',
  '.ddodddodd.',
  'doooooooood',
  'doddoooddod',
  'doddododdod',
  'dpoododoopd',
  '.doooooood.',
  '..dd...dd..',
]

/**
 * 줄 수마다 손으로 맞춘 장면: 토끼 도안과 왼쪽 위 자리, 키보드 가로 범위·윗줄 y, 두 앞발 x, 말풍선 왼쪽 x.
 * dots 가 있으면 말풍선에 thinking 대신 점 dots 개, mini 면 얇은 키보드와 한 줄짜리 앞발.
 */
type SceneLayout = {
  w: number
  h: number
  rabbit: readonly string[]
  rx: number
  ry: number
  keys: readonly [number, number]
  top: number
  paws: readonly [number, number]
  bubbleX: number
  dots?: number
  mini?: boolean
}

// pane 이 주는 무대 폭(22줄 42열, 20줄 39열, 18줄 35열, 14줄 28열, 8줄 17열)에 맞췄다, 18줄 이하는 토끼를 가운데 두고 점 말풍선
const LAYOUTS: Readonly<Record<number, SceneLayout>> = {
  22: { w: SCENE_W, h: SCENE_H, rabbit: RABBIT, rx: 5, ry: 3, keys: [3, 36], top: 35, paws: [10, 26], bubbleX: 26 },
  20: { w: 37, h: 40, rabbit: RABBIT_20, rx: 3, ry: 2, keys: [1, 32], top: 31, paws: [7, 23], bubbleX: 23 },
  18: { w: 33, h: 36, rabbit: RABBIT_18, rx: 3, ry: 2, keys: [1, 32], top: 27, paws: [7, 23], bubbleX: 23, dots: 3 },
  14: { w: 26, h: 28, rabbit: RABBIT_14, rx: 2, ry: 2, keys: [0, 25], top: 21, paws: [5, 16], bubbleX: 20, dots: 3 },
  8: { w: 15, h: 16, rabbit: RABBIT_8, rx: 2, ry: 1, keys: [1, 13], top: 12, paws: [3, 8], bubbleX: 12, dots: 1, mini: true },
}

/** 손으로 그린 장면이 있는 줄 수면 그 크기, 없으면 undefined (그때는 22줄 장면을 줄여 쓴다). */
export function sceneSize(rows: number): { w: number; h: number } | undefined {
  const layout = LAYOUTS[rows]
  return layout === undefined ? undefined : { w: layout.w, h: layout.h }
}

const layoutOf = (rows: number): SceneLayout => LAYOUTS[rows] ?? LAYOUTS[22]!

// 일하는 포즈(생각 중 포함)는 키보드를 두드리고, 나머지는 멀뚱히 서 있는다
const TYPING: ReadonlySet<Pose> = new Set(['thinking', 'coding', 'reading', 'terminal', 'browsing', 'helper'])

// 생각 중 말풍선: 글자 칸 cells 를 감싼 흰 둥근 상자 (y 0~5) 와 토끼 쪽 꼬리, 글자는 stage 가 셀로 얹는다
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
export function sceneLabel(pose: Pose, tick: number, rows = 22): SceneLabel | null {
  if (pose !== 'thinking') return null
  const { bubbleX, dots } = layoutOf(rows)
  const text = dots === undefined ? ('thinking' + '.'.repeat(tick % 4)).padEnd(12) : '.'.repeat(tick % (dots + 1)).padEnd(dots)
  return { x: bubbleX + 1, row: 1, text, fg: BUBBLE_INK, bg: BUBBLE }
}

/** 토끼 앞 키보드와 두 앞발, 프레임마다 한 발씩 들었다 내리며 누른 키가 반짝인다. */
function drawKeyboard(g: Grid, f: number, layout: SceneLayout): void {
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
    stamp(g, paw, px, up ? top - (mini ? 1 : 3) : top)
    if (!up) rect(g, px + 1, top + paw.length, px + 2, top + paw.length, 0xffd54f)
  })
}

/** One frame of a pose (40x44 px at 22 rows, the hand-drawn size at 20, 18, 14 and 8), transparent where the backdrop shows. */
export function sceneFrame(pose: Pose, _hat: Hat, tick: number, rows = 22): Grid {
  const layout = layoutOf(rows)
  const g = newGrid(layout.w, layout.h, TRANSPARENT)
  const f = tick % POSE_FRAMES[pose]
  stamp(g, layout.rabbit, layout.rx, layout.ry)
  if (TYPING.has(pose)) drawKeyboard(g, f, layout)
  if (pose === 'thinking') drawBubble(g, layout.bubbleX, layout.dots ?? 12)
  return g
}
