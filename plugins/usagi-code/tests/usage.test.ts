import { test, expect, describe } from 'claude-code/testing'
import {
  costLabel,
  level,
  pushHistory,
  snapshotFrom,
  usageWarning,
} from '../hooks/usage'
import { statusLine } from '../hooks/alerts'
import type { UsageSnapshot } from '../types'

const now = new Date(2026, 9, 5, 12, 0) // Monday noon, local
const at = (day: number, hour: number, minute = 0) => new Date(2026, 9, day, hour, minute).toISOString()

const snap = (over: Partial<UsageSnapshot> = {}): UsageSnapshot => ({ rateLimits: [], toolCalls: 0, ...over })

test('snapshotFrom keeps the figures the engine reported', () => {
  const s = snapshotFrom(
    { context: { tokens: 84000, percent: 42 }, rateLimits: [{ kind: 'five_hour', percentUsed: 31 }], cost: { usd: 0.84 } },
    27,
  )
  expect(s).toEqual({
    contextPercent: 42,
    contextTokens: 84000,
    rateLimits: [{ kind: 'five_hour', percentUsed: 31 }],
    costUsd: 0.84,
    toolCalls: 27,
  })
  expect(snapshotFrom({ context: {}, rateLimits: [] }, 0)).toEqual({ rateLimits: [], toolCalls: 0 })
})

test('level turns amber at 80 and red at 95', () => {
  expect(level(79)).toBe('ok')
  expect(level(80)).toBe('warn')
  expect(level(94.9)).toBe('warn')
  expect(level(95)).toBe('critical')
  expect(level(undefined)).toBe('ok')
})

test('costLabel says Est. on a plan and plain Cost on an API key', () => {
  expect(costLabel(snap({ rateLimits: [{ kind: 'five_hour', percentUsed: 1 }] }))).toBe('Est. cost')
  expect(costLabel(snap())).toBe('Cost')
})


describe('usageWarning', () => {
  test('warns about context', () => {
    expect(usageWarning(snap({ contextPercent: 84 }), now)).toBe('Usagi: context 84% · consider /compact')
  })

  test('warns about the 5-hour limit with its reset', () => {
    const s = snap({ rateLimits: [{ kind: 'five_hour', percentUsed: 82, resetsAt: at(5, 16, 10) }] })
    expect(usageWarning(s, now)).toBe('Usagi: 5-hour limit 82% · resets 4:10 PM')
  })

  test('warns about the weekly limit', () => {
    const s = snap({ rateLimits: [{ kind: 'seven_day', percentUsed: 90, resetsAt: at(12, 9) }] })
    expect(usageWarning(s, now)).toBe('Usagi: weekly limit 90% · resets Mon 9:00 AM')
  })

  test('the highest figure wins', () => {
    const s = snap({ contextPercent: 84, rateLimits: [{ kind: 'five_hour', percentUsed: 91 }] })
    expect(usageWarning(s, now)).toBe('Usagi: 5-hour limit 91%')
  })

  test('stays quiet under 80', () => {
    expect(usageWarning(snap({ contextPercent: 79, rateLimits: [{ kind: 'five_hour', percentUsed: 50 }] }), now)).toBeUndefined()
  })
})



test('pushHistory keeps the newest samples and skips missing ones', () => {
  expect(pushHistory([1, 2, 3], 4, 3)).toEqual([2, 3, 4])
  expect(pushHistory([1, 2], undefined, 3)).toEqual([1, 2])
})

describe('statusLine', () => {
  const warning = 'Usagi: context 84% · consider /compact'

  test('waiting on the person outranks a usage warning', () => {
    expect(statusLine({ kind: 'needs-you', text: 'x', at: 0 }, warning)).toBe('Usagi is waiting on you')
  })

  test('an error dialog leaves the usage warning showing', () => {
    expect(statusLine({ kind: 'error', tool: 'Read', line: 'boom', at: 0 }, warning)).toBe(warning)
  })

  test('nothing to say clears the line', () => {
    expect(statusLine(null, undefined)).toBeUndefined()
  })
})
