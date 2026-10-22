import type { Hat, Pose, ThemeName } from '../types'
import { stageCells } from './art/stage'
import type { CharacterId } from './art/characters'
import { THEMES } from './themes'

export const TICK_MS = 166
const ASLEEP_AFTER_MS = 60_000

export type RasterKey = 'stage'
export type RasterFrame = { key: RasterKey; columns: number; rows: number; cells: string }

export type AnimModel = {
  /** `idleSince`: when the studio went quiet; a minute later an idle character dozes. */
  stage?: { cols: number; rows: number; pose: Pose; hat: Hat; theme: ThemeName; idleSince: number | null; character?: CharacterId }
}

/** Every raster the pane shows, drawn for one animation tick. */
export function rasterFrames(m: AnimModel, tick: number, now: number): RasterFrame[] {
  const frames: RasterFrame[] = []
  if (m.stage !== undefined) {
    const { cols, rows, hat, idleSince, character = 'usagi' } = m.stage
    const isAsleep = m.stage.pose === 'idle' && idleSince !== null && now - idleSince >= ASLEEP_AFTER_MS
    const pose: Pose = isAsleep ? 'asleep' : m.stage.pose
    const backdrop = THEMES[m.stage.theme].backdrop
    frames.push({ key: 'stage', columns: cols, rows, cells: stageCells({ cols, rows, pose, hat, tick, backdrop, character }) })
  }
  return frames
}
