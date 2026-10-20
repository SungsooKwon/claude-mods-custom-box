import type { Hat, Pose, ThemeName } from '../types'
import { screensaverCells, screensaverKindAt } from './art/screensavers'
import { stageCells } from './art/stage'
import { THEMES } from './themes'

export const TICK_MS = 166
const SCREENSAVER_TURN_MS = 60_000
const ASLEEP_AFTER_MS = 60_000

export type RasterKey = 'stage'
export type RasterFrame = { key: RasterKey; columns: number; rows: number; cells: string }

export type AnimModel = {
  /** `screensaver.since`: when the screensaver started; which one shows and how far it has run follow from the clock. */
  stage?: { cols: number; rows: number; pose: Pose; hat: Hat; theme: ThemeName; idleSince: number | null; screensaver: { since: number } | null }
}

/** Every raster the pane shows, drawn for one animation tick. */
export function rasterFrames(m: AnimModel, tick: number, now: number): RasterFrame[] {
  const frames: RasterFrame[] = []
  if (m.stage !== undefined) {
    const { cols, rows, hat, screensaver, idleSince } = m.stage
    const isAsleep = m.stage.pose === 'idle' && idleSince !== null && now - idleSince >= ASLEEP_AFTER_MS
    const pose: Pose = isAsleep ? 'asleep' : m.stage.pose
    const backdrop = THEMES[m.stage.theme].backdrop
    if (screensaver === null) {
      frames.push({ key: 'stage', columns: cols, rows, cells: stageCells({ cols, rows, pose, hat, tick, backdrop }) })
    } else {
      const running = Math.max(0, now - screensaver.since)
      const kind = screensaverKindAt(running)
      const local = Math.floor((running % SCREENSAVER_TURN_MS) / TICK_MS)
      const seed = screensaver.since + Math.floor(running / SCREENSAVER_TURN_MS)
      frames.push({ key: 'stage', columns: cols, rows, cells: screensaverCells(kind, cols, rows, local, seed) })
    }
  }
  return frames
}
