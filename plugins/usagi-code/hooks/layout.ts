import { SCENE_W } from './art/scene'
import { STAGE_ROWS } from './art/stage'

export const MIN_COLS = 32
// 이 폭부터 캐릭터 옆에 정보 칸을 둔다 (위아래 분할의 넓은 창)
export const SIDE_MIN_COLS = 80

export type LayoutV2 = { tooNarrow: boolean; side: boolean; content: number; stageCols: number; stageRows: number; infoCols: number }

const CHROME_ROWS = 3 // title chrome 2, status 1
const CONTENT_MIN = 4
const CONTENT_MAX = 16
// 사용자가 ▲▼ 로 고르는 캐릭터 높이 범위
export const STAGE_ROWS_MIN = 4
export const STAGE_ROWS_MAX = 44
/** 캐릭터를 stageRows 줄로 다 보이는 데 드는 본문 줄 수, inline 으로 열 때 이만큼 청한다. */
export const paneRows = (stageRows: number = STAGE_ROWS) => CHROME_ROWS + stageRows

/** 넓으면 캐릭터 | 정보 가로 배치, 캐릭터는 남는 줄에 맞춰 줄인다. 좁으면 위아래로 쌓는다. */
export function layoutV2(cols: number, rows: number, wanted = STAGE_ROWS): LayoutV2 {
  if (cols >= SIDE_MIN_COLS) {
    const stageRows = Math.max(STAGE_ROWS_MIN, Math.min(wanted, rows - CHROME_ROWS))
    const stageCols = Math.ceil((SCENE_W * stageRows) / STAGE_ROWS) + 2
    return { tooNarrow: false, side: true, content: stageRows, stageCols, stageRows, infoCols: cols - stageCols - 2 }
  }
  return {
    tooNarrow: cols < MIN_COLS,
    side: false,
    content: Math.max(CONTENT_MIN, Math.min(CONTENT_MAX, rows - CHROME_ROWS - wanted)),
    stageCols: cols - 2,
    stageRows: wanted,
    infoCols: cols,
  }
}
