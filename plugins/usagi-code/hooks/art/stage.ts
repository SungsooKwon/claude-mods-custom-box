import type { Hat, Pose } from '../../types'
import { SCENE_H, SCENE_W, sceneFrame, sceneLabel } from './scene'
import { drawSprite, gridToWords, newGrid, textWords, wordsToCells } from './pixels'
import type { Grid } from './pixels'

export const STAGE_ROWS = 22

// 풀밭 배경: 위는 연한 민트, 아래로 짙은 초록, 풀잎 결과 흰 꽃이 흩어진다 (프레임마다 같은 무늬)
const MEADOW_TOP = 0xd6efd0
const MEADOW_BOTTOM = 0x86c865
const BLADE = 0x5fa844
const FLOWER = 0xffffff
const FLOWER_CORE = 0xfff2a8

const mix = (a: number, b: number, t: number): number =>
  [16, 8, 0].reduce((out, s) => out | (Math.round(((a >> s) & 255) + (((b >> s) & 255) - ((a >> s) & 255)) * t) << s), 0)
const hash = (x: number, y: number): number => (((x * 73856093) ^ (y * 19349663) ^ (x * y * 83492791)) >>> 0) % 1000

/** 무대 (x, y) 픽셀의 풀밭 색. */
export function meadow(x: number, y: number): number {
  const base = mix(MEADOW_TOP, MEADOW_BOTTOM, (y / (SCENE_H - 1)) ** 0.8)
  const r = hash(x, y)
  if (y > 8 && r < 10) return FLOWER
  if (y > 8 && r < 13) return FLOWER_CORE
  if (y > 4 && hash(x, Math.floor(y / 3)) % 100 < 7 && y % 3 !== 0) return mix(base, BLADE, 0.45)
  if (r < 180) return mix(base, BLADE, 0.18)
  if (r < 260) return mix(base, 0xffffff, 0.15)
  return base
}

export type StageOptions = {
  cols: number
  pose: Pose
  hat: Hat
  tick: number
  /** 무대 줄 수, 22 보다 작으면 장면을 그만큼 줄여 그린다 (없으면 22). */
  rows?: number
  /** The theme's backdrop colour at scene pixel (x, y). */
  backdrop: (x: number, y: number) => number
}

/** The Stage: a meadow across the full width and the scene centred (or clipped on the right when narrow). */
export function stageCells(o: StageOptions): string {
  const rows = o.rows ?? STAGE_ROWS
  const scale = rows / STAGE_ROWS
  // 원래 크기로 그린 뒤 줄인다, 원래 크기면 그대로
  const cols = scale === 1 ? o.cols : Math.max(1, Math.round(o.cols / scale))
  const full = newGrid(cols, SCENE_H, 0)
  const x0 = cols >= SCENE_W + 2 ? Math.floor((cols - SCENE_W) / 2) : 1
  for (let y = 0; y < SCENE_H; y++) {
    for (let x = 0; x < cols; x++) full.px[y * cols + x] = meadow(x, y)
  }
  drawSprite(full, sceneFrame(o.pose, o.hat, o.tick), x0, 0)
  const words = gridToWords(scale === 1 ? full : shrink(full, o.cols, rows * 2))
  // 말풍선 글자는 셀째로 덮어쓴다, 줄인 만큼 글자 수도 줄이고 무대 밖은 자른다
  const label = sceneLabel(o.pose, o.tick)
  if (label !== null) {
    const x = Math.round((x0 + label.x) * scale)
    const row = Math.round(label.row * scale)
    const n = Math.max(0, Math.min(Math.round(label.text.length * scale), o.cols - x))
    if (row < rows) words.set(textWords(label.text, n, label.fg, label.bg), (row * o.cols + x) * 3)
  }
  return wordsToCells(words)
}

// ponytail: 최근접 축소라 작게 줄이면 1px 테두리가 끊긴다, 거슬리면 크기별 도안을 따로 둔다
/** 격자를 w×h 로 최근접 픽셀 축소. */
function shrink(g: Grid, w: number, h: number): Grid {
  const out = newGrid(w, h, 0)
  for (let y = 0; y < h; y++) {
    const sy = Math.min(g.h - 1, Math.floor(((y + 0.5) * g.h) / h))
    for (let x = 0; x < w; x++) {
      const sx = Math.min(g.w - 1, Math.floor(((x + 0.5) * g.w) / w))
      out.px[y * w + x] = g.px[sy * g.w + sx] ?? 0
    }
  }
  return out
}
