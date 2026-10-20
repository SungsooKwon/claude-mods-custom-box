// Pixel grids and the terminal Raster's cell encoding: every cell is three
// little-endian u32 words [codePoint, foreground, background], base64 packed.

declare global {
  interface Uint8Array {
    toBase64(): string
  }
  interface Uint8ArrayConstructor {
    fromBase64(base64: string): Uint8Array
  }
}

/** A pixel the next layer down shows through. */
export const TRANSPARENT = 0xff000000
/** The terminal's own default color (bit 24 alone). */
export const DEFAULT_COLOR = 0x01000000

const UPPER_HALF = 0x2580
const SPACE = 0x20
const QUESTION = 0x3f

export type Grid = { w: number; h: number; px: Uint32Array }

export function newGrid(w: number, h: number, fill: number): Grid {
  const px = new Uint32Array(w * h)
  px.fill(fill)
  return { w, h, px }
}

export function fillRect(g: Grid, x: number, y: number, w: number, h: number, color: number): void {
  const x0 = Math.max(0, x)
  const y0 = Math.max(0, y)
  const x1 = Math.min(g.w, x + w)
  const y1 = Math.min(g.h, y + h)
  for (let row = y0; row < y1; row++) {
    g.px.fill(color, row * g.w + x0, row * g.w + Math.max(x0, x1))
  }
}

/** Draws `src` onto `dst` with its top-left at (x, y), clipped, skipping transparent pixels. */
export function drawSprite(dst: Grid, src: Grid, x: number, y: number): void {
  for (let sy = 0; sy < src.h; sy++) {
    const dy = y + sy
    if (dy < 0 || dy >= dst.h) continue
    for (let sx = 0; sx < src.w; sx++) {
      const dx = x + sx
      if (dx < 0 || dx >= dst.w) continue
      const color = src.px[sy * src.w + sx] ?? TRANSPARENT
      if (color !== TRANSPARENT) dst.px[dy * dst.w + dx] = color
    }
  }
}

function visible(color: number): number {
  return color === TRANSPARENT ? DEFAULT_COLOR : color
}

/** A Raster of `g.w` columns by `g.h / 2` rows: each cell is `▀`, top pixel over bottom pixel. */
export function gridToCells(g: Grid): string {
  return wordsToCells(gridToWords(g))
}

/** The cell words of `gridToCells`, before packing, so text can be laid over them. */
export function gridToWords(g: Grid): Uint32Array {
  const rows = Math.floor(g.h / 2)
  const words = new Uint32Array(g.w * rows * 3)
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < g.w; col++) {
      const at = (row * g.w + col) * 3
      words[at] = UPPER_HALF
      words[at + 1] = visible(g.px[2 * row * g.w + col] ?? TRANSPARENT)
      words[at + 2] = visible(g.px[(2 * row + 1) * g.w + col] ?? TRANSPARENT)
    }
  }
  return words
}

/** One row of text cells, padded with spaces or cut to `cols`. */
export function textWords(text: string, cols: number, fg: number, bg: number | ((i: number) => number)): Uint32Array {
  const chars = [...sanitizeForRaster(text)]
  const words = new Uint32Array(cols * 3)
  for (let i = 0; i < cols; i++) {
    words[i * 3] = chars[i]?.codePointAt(0) ?? SPACE
    words[i * 3 + 1] = fg
    words[i * 3 + 2] = typeof bg === 'number' ? bg : bg(i)
  }
  return words
}

export function wordsToCells(words: Uint32Array): string {
  return new Uint8Array(words.buffer, words.byteOffset, words.byteLength).toBase64()
}

const WIDE: readonly (readonly [number, number])[] = [
  [0x1100, 0x115f],
  [0x2e80, 0xa4cf],
  [0xac00, 0xd7a3],
  [0xf900, 0xfaff],
  [0xfe30, 0xfe4f],
  [0xff00, 0xff60],
  [0xffe0, 0xffe6],
]

function rasterChar(cp: number): number {
  if (cp <= 0x1f || (cp >= 0x7f && cp <= 0x9f)) return SPACE
  if (cp > 0xffff) return QUESTION
  if (cp >= 0xd800 && cp <= 0xdfff) return QUESTION
  if (cp >= 0x0300 && cp <= 0x036f) return QUESTION
  if (WIDE.some(([lo, hi]) => cp >= lo && cp <= hi)) return QUESTION
  return cp
}

/** Replaces what a Raster cell cannot hold: controls become spaces, wide, astral and combining characters `?`. */
export function sanitizeForRaster(text: string): string {
  let out = ''
  for (const ch of text) out += String.fromCodePoint(rasterChar(ch.codePointAt(0) ?? SPACE))
  return out
}
