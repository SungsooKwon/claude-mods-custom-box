import type { Hat } from '../types'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

/** The mascot's hat for a local date. */
export function hatFor(d: Date): Hat {
  const month = d.getMonth() + 1
  const day = d.getDate()
  if (month === 10) return 'pumpkin'
  if (month === 12) return 'santa'
  if (month === 1 && day === 1) return 'party'
  if (month === 2 && day === 14) return 'heart'
  return 'none'
}

function clockTime(d: Date): string {
  const hour = d.getHours() % 12 === 0 ? 12 : d.getHours() % 12
  const minute = String(d.getMinutes()).padStart(2, '0')
  return `${hour}:${minute} ${d.getHours() < 12 ? 'AM' : 'PM'}`
}

function sameLocalDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

/** `4:10 PM` for a reset later today, `Mon 9:00 AM` for another day, `''` when missing, malformed or past. */
export function formatReset(iso: string | undefined, now: Date): string {
  if (iso === undefined) return ''
  const at = new Date(iso)
  if (Number.isNaN(at.getTime()) || at.getTime() <= now.getTime()) return ''
  return sameLocalDay(at, now) ? clockTime(at) : `${DAYS[at.getDay()]} ${clockTime(at)}`
}

/** `m:ss`, minutes unbounded. */
export function formatElapsed(ms: number): string {
  const seconds = Math.max(0, Math.floor(ms / 1000))
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}
