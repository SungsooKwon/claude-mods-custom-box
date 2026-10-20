import type { Elements } from 'claude-code'

import type { RasterFrame } from '../animator'
import type { LayoutV2 } from '../layout'
import type { Theme } from '../themes'
import { chromeCells } from './chrome'

type Els = Elements['terminal']

type Tree = ReturnType<Els['Box']>

export type StudioVM = {
  cols: number
  layout: LayoutV2
  theme: Theme
  frames: Readonly<Partial<Record<string, RasterFrame>>>
}

/** The pieces the hooks module builds: the clickable rows (Client rows, or plain Text after a fault), the work content and the dialog. */
export type StudioParts = { title: Tree; status: Tree; timeline: Tree | null; dialog: Tree | null }


function rasterOf(els: Els, frame: RasterFrame | undefined) {
  const { Raster } = els
  return frame === undefined ? null : <Raster key={frame.key} columns={frame.columns} rows={frame.rows} cells={frame.cells} />
}

/** The whole pane: title chrome, the Stage, the work content and the status bar. */
export function studioView(els: Els, vm: StudioVM, parts: StudioParts) {
  const { Box, Text, Raster } = els
  const { cols, layout, theme } = vm
  if (layout.tooNarrow) {
    return (
      <Box backgroundColor={theme.body}>
        <Text color={theme.ink}>Widen the pane to see Usagi code.</Text>
      </Box>
    )
  }

  // 넓으면 캐릭터 오른쪽에, 좁으면 캐릭터 아래에
  const content = (
    <Box key="tab-content" flexDirection="column" width={layout.infoCols} height={layout.content} marginLeft={layout.side ? 1 : 0} overflow="hidden" backgroundColor={theme.body}>
      {parts.timeline}
    </Box>
  )
  return (
    <Box flexDirection="column" width={cols} backgroundColor={theme.body}>
      <Raster key="chrome" columns={cols} rows={1} cells={chromeCells(theme, cols)} />
      {parts.title}
      <Box key="stage-section" flexDirection="row" backgroundColor={theme.body}>
        <Text color={theme.body} backgroundColor={theme.body}>
          {' '}
        </Text>
        {rasterOf(els, vm.frames.stage)}
        {layout.side ? content : null}
        {parts.dialog}
      </Box>
      {layout.side ? null : content}
      {parts.status}
    </Box>
  )
}
