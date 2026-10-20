// A surface module: one row of coloured text segments. Segments with a
// `hoverBg` are clickable: they light up under the pointer and post
// `{ click: id }` to the plugin on a left click, or on their `key` once the
// row has the focus. Every segment sets its own colours, so the row reads the
// same on light and dark terminals.

import type { ClientSurface } from 'claude-code'

export type RowSegment = {
  id: string
  text: string
  fg: string
  bg: string
  hoverBg?: string
  bold?: boolean
  key?: string
}

export type RowProps = { segments: RowSegment[] }

type RowState = { hover: string | null }

// 터미널 칸 폭: 한글·한자 같은 넓은 글자는 두 칸
const widthOf = (text: string) => [...text].reduce((n, ch) => n + (/[\u1100-\u115f\u2e80-\ua4cf\uac00-\ud7a3\uf900-\ufaff\ufe30-\ufe4f\uff00-\uff60\uffe0-\uffe6]/.test(ch) ? 2 : 1), 0)

export default function Row(props: RowProps, surface: ClientSurface<RowState>) {
  const { Box, Text } = surface.elements
  const hover = surface.state?.hover ?? null
  const spans: { seg: RowSegment; from: number; to: number }[] = []
  let x = 0
  for (const seg of props.segments) {
    spans.push({ seg, from: x, to: x + widthOf(seg.text) })
    x += widthOf(seg.text)
  }
  const clickableAt = (col: number) => spans.find(s => col >= s.from && col < s.to && s.seg.hoverBg !== undefined)?.seg

  surface.onPointer(e => {
    const seg = clickableAt(e.x)
    if (e.type === 'down' && e.button === 'left' && seg !== undefined) {
      surface.post({ click: seg.id })
      return
    }
    const next = e.type === 'leave' ? null : (seg?.id ?? null)
    if ((e.type === 'move' || e.type === 'enter' || e.type === 'leave') && next !== hover) surface.setState({ hover: next })
  })
  surface.onKey(e => {
    const seg = props.segments.find(s => s.key !== undefined && s.key === e.key)
    if (seg !== undefined) surface.post({ click: seg.id })
  })

  return (
    <Box flexDirection="row">
      {props.segments.map(seg => (
        <Text color={seg.fg} backgroundColor={seg.id === hover && seg.hoverBg !== undefined ? seg.hoverBg : seg.bg} bold={seg.bold === true}>
          {seg.text}
        </Text>
      ))}
    </Box>
  )
}
