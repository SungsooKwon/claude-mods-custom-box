import type { RateLimitView, UsageSnapshot } from '../types'
import { formatReset } from './calendar'

export const WARN_AT = 80
export const CRITICAL_AT = 95
const MASCOT = 'Usagi:'

export type Level = 'ok' | 'warn' | 'critical'

export type RawUsage = {
  context: { tokens?: number; percent?: number; window?: number }
  rateLimits: readonly RateLimitView[]
  cost?: { usd: number }
}

export function snapshotFrom(raw: RawUsage, toolCalls: number): UsageSnapshot {
  return {
    ...(raw.context.percent !== undefined ? { contextPercent: raw.context.percent } : {}),
    ...(raw.context.tokens !== undefined ? { contextTokens: raw.context.tokens } : {}),
    ...(raw.context.window !== undefined ? { contextWindow: raw.context.window } : {}),
    rateLimits: raw.rateLimits.map(({ kind, percentUsed, resetsAt }) => ({ kind, percentUsed, ...(resetsAt !== undefined ? { resetsAt } : {}) })),
    ...(raw.cost !== undefined ? { costUsd: raw.cost.usd } : {}),
    toolCalls,
  }
}

export function level(pct: number | undefined): Level {
  if (pct === undefined || pct < WARN_AT) return 'ok'
  return pct < CRITICAL_AT ? 'warn' : 'critical'
}

const limit = (s: UsageSnapshot, kind: string) => s.rateLimits.find(l => l.kind === kind)


export function costLabel(s: UsageSnapshot): 'Est. cost' | 'Cost' {
  return s.rateLimits.length > 0 ? 'Est. cost' : 'Cost'
}



const LIMIT_NAMES: Readonly<Record<string, string>> = { five_hour: '5-hour limit', seven_day: 'weekly limit' }

/** The status-line warning for the highest figure at 80% or more. */
export function usageWarning(s: UsageSnapshot, now: Date): string | undefined {
  const candidates: { pct: number; text: string }[] = []
  if (s.contextPercent !== undefined) candidates.push({ pct: s.contextPercent, text: `context ${s.contextPercent}% · consider /compact` })
  for (const l of s.rateLimits) {
    const name = LIMIT_NAMES[l.kind] ?? `${l.kind.replace(/_/g, ' ')} limit`
    const reset = formatReset(l.resetsAt, now)
    candidates.push({ pct: l.percentUsed, text: `${name} ${l.percentUsed}%${reset === '' ? '' : ` · resets ${reset}`}` })
  }
  const top = candidates.filter(c => c.pct >= WARN_AT).sort((a, b) => b.pct - a.pct)[0]
  return top === undefined ? undefined : `${MASCOT} ${top.text}`
}


export function pushHistory(list: readonly number[], pct: number | undefined, max: number): number[] {
  return pct === undefined ? [...list] : [...list, pct].slice(-max)
}
