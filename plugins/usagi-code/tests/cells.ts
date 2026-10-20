/** The u32 words of a Raster's base64 `cells`. */
export function decode(cells: string): number[] {
  const bytes = Uint8Array.fromBase64(cells)
  return [...new Uint32Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 4)]
}

/** The words of one cell: [codePoint, foreground, background]. */
export function cellAt(cells: string, columns: number, col: number, row: number): number[] {
  const at = (row * columns + col) * 3
  return decode(cells).slice(at, at + 3)
}
