import { test, expect, describe } from 'claude-code/testing'
import { POSE_FRAMES, SCENE_H, SCENE_W, sceneFrame, sceneLabel } from '../hooks/art/scene'
import type { Pose } from '../types'

const POSES = Object.keys(POSE_FRAMES) as Pose[]
const TYPING: Pose[] = ['thinking', 'coding', 'reading', 'terminal', 'browsing', 'helper']
const CREAM = 0xfaf1d0
const KEYBOARD = 0x8b9096

const has = (pose: Pose, color: number, tick = 0) => [...sceneFrame(pose, 'none', tick).px].includes(color)

describe('every pose', () => {
  test('draws 40x44 frames with the cream rabbit', () => {
    for (const pose of POSES) {
      const g = sceneFrame(pose, 'none', 0)
      expect(g.w).toBe(SCENE_W)
      expect(g.h).toBe(SCENE_H)
      expect(has(pose, CREAM)).toBe(true)
    }
  })
})

test('work poses type at a keyboard, the paws moving from frame to frame', () => {
  for (const pose of TYPING) {
    expect(has(pose, KEYBOARD)).toBe(true)
    expect([...sceneFrame(pose, 'none', 0).px]).not.toEqual([...sceneFrame(pose, 'none', 1).px])
  }
})

test('the other poses stand still with open eyes', () => {
  for (const pose of POSES.filter(p => !TYPING.includes(p) && p !== 'asleep')) {
    expect(has(pose, KEYBOARD)).toBe(false)
    for (const tick of [1, 7]) expect([...sceneFrame(pose, 'none', tick).px]).toEqual([...sceneFrame(pose, 'none', 0).px])
  }
})

// 조용히 1분 지나면 눈을 감고 z 를 띄우며 존다
test('asleep dozes with closed eyes and a z drifting up', () => {
  const frame = (tick: number) => [...sceneFrame('asleep', 'none', tick).px]
  expect(frame(0)).not.toContain(0xf8fdf9)
  expect(frame(0)).toContain(0x6b5a8e)
  expect(frame(0)).not.toEqual(frame(3))
})

test('thinking shows a white bubble with its word laid over the stage', () => {
  expect(has('thinking', 0xffffff)).toBe(true)
  expect(has('idle', 0xffffff)).toBe(false)
  expect(sceneLabel('thinking', 2)?.text.trim()).toBe('thinking..')
  expect(sceneLabel('coding', 2)).toBeNull()
})
