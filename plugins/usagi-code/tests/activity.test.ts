import { test, expect, describe } from 'claude-code/testing'
import {
  finishKeyframe,
  firstLine,
  layerCells,
  parseClientMessage,
  poseForTool,
  stepTarget,
  startKeyframe,
  targetOf,
  timelineWindow,
  truncateMiddle,
} from '../hooks/activity'
import type { Keyframe } from '../types'

describe('poseForTool', () => {
  test('reading and searching tools read', () => {
    for (const tool of ['Read', 'Grep', 'Glob', 'LS', 'NotebookRead', 'ToolSearch']) expect(poseForTool(tool)).toBe('reading')
  })

  test('editing tools code', () => {
    for (const tool of ['Edit', 'Write', 'MultiEdit', 'NotebookEdit']) expect(poseForTool(tool)).toBe('coding')
  })

  test('shell tools use the terminal', () => {
    for (const tool of ['Bash', 'PowerShell', 'BashOutput', 'KillShell', 'Monitor']) expect(poseForTool(tool)).toBe('terminal')
  })

  test('web and browser tools browse', () => {
    for (const tool of ['WebFetch', 'WebSearch', 'mcp__claude-in-chrome__navigate', 'mcp__built-in-browser__click']) {
      expect(poseForTool(tool)).toBe('browsing')
    }
  })

  test('subagents call the helper cat', () => {
    expect(poseForTool('Agent')).toBe('helper')
    expect(poseForTool('Task')).toBe('helper')
  })

  test('a question to the person waves', () => {
    expect(poseForTool('AskUserQuestion')).toBe('waving')
  })

  test('anything else codes', () => {
    expect(poseForTool('Frobnicate')).toBe('coding')
  })
})

describe('targetOf', () => {
  test('takes the first line of a command', () => {
    expect(targetOf({ command: 'npm test\nmore' })).toBe('npm test')
  })

  test('prefers a file path over a pattern', () => {
    expect(targetOf({ file_path: '/a/b.ts', pattern: 'x' })).toBe('/a/b.ts')
  })

  test('falls back through url, query and description', () => {
    expect(targetOf({ url: 'https://x.dev', description: 'd' })).toBe('https://x.dev')
    expect(targetOf({ description: 'Explore the repo' })).toBe('Explore the repo')
  })

  test('is empty when nothing names a target', () => {
    expect(targetOf({})).toBe('')
    expect(targetOf({ file_path: 42 })).toBe('')
  })
})

test('firstLine drops everything after the first line break', () => {
  expect(firstLine('boom\r\nstack')).toBe('boom')
  expect(firstLine('one')).toBe('one')
})

test('truncateMiddle keeps both ends around an ellipsis', () => {
  const cut = truncateMiddle('hooks/views/studio.tsx', 12)
  expect(cut).toHaveLength(12)
  expect(cut).toContain('…')
  expect(cut).toStartWith('hooks')
  expect(cut).toEndWith('.tsx')
  expect(truncateMiddle('short', 12)).toBe('short')
})

const start = (id: string, startedAt = 0) => ({ id, tool: 'Read', target: '', pose: 'reading' as const, startedAt })

describe('keyframes', () => {
  test('keep the newest 200 and keep numbering past the cap', () => {
    let list: Keyframe[] = []
    for (let i = 0; i < 205; i++) list = startKeyframe(list, start(`k${i}`))
    expect(list).toHaveLength(200)
    expect(list.at(-1)?.n).toBe(205)
    expect(list[0]?.n).toBe(6)
  })

  test('finish by id when parallel calls end out of order', () => {
    let list: Keyframe[] = []
    for (const id of ['a', 'b', 'c']) list = startKeyframe(list, start(id))
    list = finishKeyframe(list, 'c', { durationMs: 30, isError: true, errorLine: 'boom' })
    list = finishKeyframe(list, 'a', { durationMs: 10, isError: false })
    expect(list.map(k => k.durationMs)).toEqual([10, undefined, 30])
    expect(list[2]).toMatchObject({ isError: true, errorLine: 'boom' })
    expect(list[0]?.isError).toBe(false)
  })

  test('finishing an unknown id changes nothing', () => {
    const list = startKeyframe([], start('a'))
    expect(finishKeyframe(list, 'zz', { durationMs: 1, isError: false })).toEqual(list)
  })
})

describe('timeline', () => {
  test('starts at frame 1 while the playhead fits', () => {
    expect(timelineWindow(5, 36)).toEqual({ start: 1, end: 36 })
  })

  test('scrolls so the playhead sits 8 frames from the right edge', () => {
    expect(timelineWindow(40, 36)).toEqual({ start: 13, end: 48 })
  })

  test('marks every past frame of the Cat layer a keyframe', () => {
    expect(layerCells('all', { start: 1, end: 5 }, 3)).toEqual(['key', 'key', 'playhead', 'future', 'future'])
  })

  test('marks only listed frames of the Sound layer', () => {
    expect(layerCells(new Set([1]), { start: 1, end: 4 }, 3)).toEqual(['key', 'span', 'playhead', 'future'])
  })
})

describe('parseClientMessage', () => {
  test('reads clicks and whole-number picks', () => {
    expect(parseClientMessage({ click: 'prev' })).toEqual({ click: 'prev' })
    expect(parseClientMessage({ pick: 3 })).toEqual({ pick: 3 })
  })

  test('ignores anything else', () => {
    for (const data of [{ pick: 'x' }, { pick: 1.5 }, { pick: -1 }, {}, null, 'click', { click: 7 }]) expect(parseClientMessage(data)).toBeNull()
  })
})

describe('stepTarget', () => {
  const list = [1, 2, 3].map(n => ({ id: `k${n}`, n, tool: 'Read', target: '', pose: 'reading' as const, startedAt: 0 }))

  test('prev from live pins the newest step, then walks back', () => {
    expect(stepTarget(list, null, 'prev')).toBe(3)
    expect(stepTarget(list, 3, 'prev')).toBe(2)
    expect(stepTarget(list, 1, 'prev')).toBe(1)
  })

  test('next walks forward and past the newest returns to live', () => {
    expect(stepTarget(list, 2, 'next')).toBe(3)
    expect(stepTarget(list, 3, 'next')).toBeNull()
    expect(stepTarget(list, null, 'next')).toBeNull()
  })

  test('a pick must name a kept step', () => {
    expect(stepTarget(list, null, { pick: 2 })).toBe(2)
    expect(stepTarget(list, 1, { pick: 999 })).toBe(1)
  })

  test('live unpins', () => expect(stepTarget(list, 2, 'live')).toBeNull())
})
