import { test, expect, describe } from 'claude-code/testing'
import { formatElapsed, formatReset, hatFor } from '../hooks/calendar'

const local = (month: number, day: number, hour = 12, minute = 0) => new Date(2026, month - 1, day, hour, minute)

describe('hatFor', () => {
  test('wears the pumpkin all October', () => {
    expect(hatFor(local(10, 5))).toBe('pumpkin')
    expect(hatFor(local(10, 31))).toBe('pumpkin')
  })

  test('wears the Santa hat in December', () => {
    expect(hatFor(local(12, 1))).toBe('santa')
  })

  test('wears the party hat on January 1 only', () => {
    expect(hatFor(local(1, 1))).toBe('party')
    expect(hatFor(local(1, 2))).toBe('none')
  })

  test('wears the heart beanie on February 14', () => {
    expect(hatFor(local(2, 14))).toBe('heart')
  })

  test('wears no hat on any other day', () => {
    expect(hatFor(local(7, 4))).toBe('none')
  })
})

describe('formatReset', () => {
  const now = local(10, 5, 12, 0) // a Monday

  test('shows the time alone for a reset later today', () => {
    expect(formatReset(local(10, 5, 16, 10).toISOString(), now)).toBe('4:10 PM')
  })

  test('adds the weekday for a reset on another day', () => {
    expect(formatReset(local(10, 12, 9, 0).toISOString(), now)).toBe('Mon 9:00 AM')
  })

  test('writes the midnight hour as 12', () => {
    expect(formatReset(local(10, 5, 0, 5).toISOString(), local(10, 5, 0, 1))).toBe('12:05 AM')
  })

  test('is empty when the reset is missing, malformed or past', () => {
    expect(formatReset(undefined, now)).toBe('')
    expect(formatReset('garbage', now)).toBe('')
    expect(formatReset(local(10, 5, 11, 0).toISOString(), now)).toBe('')
  })
})

test('formatElapsed writes minutes and zero-padded seconds', () => {
  expect(formatElapsed(42000)).toBe('0:42')
  expect(formatElapsed(3723000)).toBe('62:03')
})
