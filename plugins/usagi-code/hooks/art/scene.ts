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
const RX = 5 // 토끼 왼쪽 위
const RY = 3

// 일하는 포즈(생각 중 포함)는 키보드를 두드리고, 나머지는 멀뚱히 서 있는다
const TYPING: ReadonlySet<Pose> = new Set(['thinking', 'coding', 'reading', 'terminal', 'browsing', 'helper'])

// 생각 중 말풍선: 흰 둥근 상자 (26~39, 0~5) 와 토끼 쪽 꼬리, 글자는 stage 가 셀로 얹는다
const BUBBLE = 0xffffff
const BUBBLE_INK = 0x492821

function drawBubble(g: Grid): void {
  rect(g, 26, 0, 39, 5, BUBBLE)
  for (const [x, y] of [[26, 0], [39, 0], [26, 5], [39, 5]] as const) put(g, x, y, TRANSPARENT)
  put(g, 27, 6, BUBBLE)
  put(g, 26, 7, BUBBLE)
}

export type SceneLabel = { x: number; row: number; text: string; fg: number; bg: number }

/** 장면 위에 얹을 글자 한 줄 (셀 단위 x·행), 없으면 null. */
export function sceneLabel(pose: Pose, tick: number): SceneLabel | null {
  if (pose !== 'thinking') return null
  const dots = '.'.repeat(tick % 4)
  return { x: 27, row: 1, text: ('thinking' + dots).padEnd(12), fg: BUBBLE_INK, bg: BUBBLE }
}

/** 토끼 앞 키보드와 두 앞발, 프레임마다 한 발씩 들었다 내리며 누른 키가 반짝인다. */
function drawKeyboard(g: Grid, f: number): void {
  rect(g, 3, 35, 36, 35, 0x2b2f36)
  rect(g, 3, 36, 36, 39, 0x8b9096)
  for (let kx = 4; kx < 36; kx += 2) {
    put(g, kx, 36, 0xc9cdd2)
    put(g, kx + 1, 38, 0xc9cdd2)
  }
  ;[10, 26].forEach((px, i) => {
    const up = f % 2 === i
    stamp(g, ['dood', 'dood', '.dd.'], px, up ? 32 : 35)
    if (!up) rect(g, px + 1, 38, px + 2, 38, 0xffd54f)
  })
}

/** One frame of a pose, 40x44 px, transparent where the theme's backdrop shows. */
export function sceneFrame(pose: Pose, _hat: Hat, tick: number): Grid {
  const g = newGrid(SCENE_W, SCENE_H, TRANSPARENT)
  const f = tick % POSE_FRAMES[pose]
  stamp(g, RABBIT, RX, RY)
  if (TYPING.has(pose)) drawKeyboard(g, f)
  if (pose === 'thinking') drawBubble(g)
  return g
}
