import type { Elements } from 'claude-code'

import type { Dialog } from '../../types'
import type { RowSegment } from '../client/row'
import type { Theme } from '../themes'
import { fitRow } from './chrome'

type Els = Elements['terminal']
type Tree = ReturnType<Els['Box']>

const MAX_WIDTH = 40
/** Rows from the top of the Stage: a window sits low, so Clawd's face and arms stay in view; a Mac sheet drops from the title chrome. */
const WINDOW_TOP = 6

/** The dialog's outer width, border included, in a pane `cols` wide. */
export function dialogWidth(cols: number): number {
  return Math.max(20, Math.min(cols - 4, MAX_WIDTH))
}

/** The OK button row inside the error dialog's border, the button centred (key o). */
export function okSegments(theme: Theme, cols: number): RowSegment[] {
  const inner = dialogWidth(cols) - 2
  const { body, text, button } = theme.dialog
  const label = '   OK   '
  const before = Math.max(0, Math.floor((inner - label.length) / 2))
  return fitRow(
    [
      { id: '', text: ' '.repeat(before), fg: text, bg: body },
      { id: 'ok', text: label, fg: button.fg, bg: button.bg, hoverBg: button.hover, bold: true, key: 'o' },
    ],
    inner,
    body,
    text,
  )
}

/**
 * A dialog over the Stage in the theme's look: the error box (with its OK row), or the
 * instant-message window while Clawd needs you.
 */
export function dialogView(els: Els, dialog: Dialog, cols: number, theme: Theme, okRow: Tree | null): Tree | null {
  if (dialog === null) return null
  const { Box, Text } = els
  const width = dialogWidth(cols)
  const { title, titleText, body, text } = theme.dialog
  const isSheet = theme.name === 'macos'
  const titleBar = (words: string) => (
    <Text color={titleText} backgroundColor={title} bold wrap="truncate-end">
      {(isSheet ? words.padStart(Math.floor((width - 2 + words.length) / 2)) : ` ${words}`).padEnd(width - 2)}
    </Text>
  )
  const frame = (children: Tree[]) => (
    <Box
      key="dialog"
      position="absolute"
      top={isSheet ? 0 : WINDOW_TOP}
      left={Math.max(0, Math.floor((cols - width) / 2))}
      width={width}
      flexDirection="column"
      borderStyle={isSheet ? 'single' : 'round'}
      borderColor={title}
      backgroundColor={body}
    >
      {children}
    </Box>
  )

  if (dialog.kind === 'error') {
    return frame([
      titleBar('Usagi says'),
      <Text color={text} backgroundColor={body} wrap="truncate-end">
        {` ✖ ${dialog.tool} failed: ${dialog.line}`}
      </Text>,
      ...(okRow === null ? [] : [okRow]),
    ])
  }
  return frame([
    titleBar('Instant Message'),
    <Text color={text} backgroundColor={body} wrap="wrap">
      {dialog.text}
    </Text>,
  ])
}
