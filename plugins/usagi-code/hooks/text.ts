// Strings from outside the plugin: tool targets, error output, words
// typed after /usagi. They are shown plain and never used as object keys
// that could reach Object.prototype.

/**
 * Escape sequences: CSI (ESC [ or the 8-bit CSI), OSC, DCS, SOS, PM and APC up to BEL or ST (or the
 * end of the text), and any other ESC sequence.
 */
const SEQUENCES = /\u001b\[[0-?]*[ -/]*[@-~]|\u009b[0-?]*[ -/]*[@-~]|\u001b[\]PX^_][\s\S]*?(?:\u0007|\u001b\\|\u009c|$)|\u001b[ -/]*[0-~]?/g
/** C0 and C1 controls, DEL, and the bidi marks and overrides that reorder what is shown. */
const CONTROLS = /[\u0000-\u001f\u007f-\u009f\u200e\u200f\u202a-\u202e\u2066-\u2069]/g

/** Text as it may be drawn: escape sequences and controls removed, a tab as a space. */
export function plainText(text: string): string {
  return text.replace(SEQUENCES, '').replace(/\t/g, ' ').replace(CONTROLS, '')
}

/** `table[key]` when the table itself has that key; never an inherited member such as `constructor`. */
export function lookup<T>(table: Readonly<Record<string, T>>, key: string): T | undefined {
  return Object.hasOwn(table, key) ? table[key] : undefined
}
