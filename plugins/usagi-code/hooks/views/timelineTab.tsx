import type { Elements } from 'claude-code'

import type { Activity, Keyframe, Pose, SubAgent } from '../../types'
import { poseForTool, truncateMiddle } from '../activity'
import { CRITICAL_AT, WARN_AT } from '../usage'
import type { Theme } from '../themes'
import { len } from './chrome'

type Els = Elements['terminal']
type Tree = ReturnType<Els['Box']>

export const POSE_WORDS: Readonly<Record<Pose, string>> = {
  thinking: '생각하는 중',
  coding: '코드 고치는 중',
  reading: '파일 읽는 중',
  terminal: '명령 실행 중',
  browsing: '웹 찾는 중',
  helper: '도우미 부르는 중',
  oops: '실패',
  waving: '사용자 기다리는 중',
  done: '완료',
  idle: '쉬는 중',
  asleep: '쉬는 중',
}

const ICONS: Readonly<Partial<Record<Pose, string>>> = {
  reading: '»',
  coding: '✎',
  terminal: '$',
  browsing: '@',
  helper: '+',
  waving: '?',
}
const OK_GREEN = '#2E8B57'
const FAIL_RED = '#E5484D'
const WARN_AMBER = '#E5A50A'

export type TimelineTabVM = {
  cols: number
  theme: Theme
  current: number
  activity: Activity
  elapsed: string
  /** 자동 압축 기준까지 찬 비율(%) */
  contextPct: number | undefined
  steps: readonly Keyframe[]
  /** 받은 지시 첫 줄 */
  order: string
  agents: readonly SubAgent[]
  /** 서브에이전트에 쓸 수 있는 줄 수 */
  treeRows: number
  now: number
  /** 이번 작업 시작 시각, 아직 없으면 null (전체 단계를 센다) */
  turnFrom: number | null
}

/** 이번 작업의 단계들 */
function turnSteps(vm: TimelineTabVM): readonly Keyframe[] {
  const from = vm.turnFrom
  return from === null ? vm.steps : vm.steps.filter(s => s.startedAt >= from)
}

/** 진행 상세 한 줄: 단계 수(완료·실패), 지금 단계 경과, 서브에이전트 실행 수 */
function progressLine(els: Els, vm: TimelineTabVM) {
  const { Text } = els
  const steps = turnSteps(vm)
  const failed = steps.filter(s => s.isError === true).length
  const finished = steps.filter(s => s.durationMs !== undefined).length - failed
  const counts = `단계 ${steps.length}개 (완료 ${finished} · 실패 ${failed})`
  const running = vm.elapsed !== ''
  const live = steps.at(-1)
  const step = live !== undefined && live.durationMs === undefined ? `이 단계 ${duration(vm.now - live.startedAt)}` : '다음 단계 준비 중'
  const run = vm.agents.filter(a => a.state === 'run').length
  const agents = vm.agents.length === 0 ? '' : ` · 서브에이전트 ${run}/${vm.agents.length} 실행 중`
  const text = running ? ` 진행 중 · ${counts} · ${step}${agents}` : ` 끝남 · ${counts}`
  return (
    <Text color={running ? vm.theme.ink : vm.theme.soft} wrap="truncate-end">
      {fit(text, Math.max(1, vm.cols - 1))}
    </Text>
  )
}

/** 터미널 칸 폭 w 에 맞게 자르고, 넘치면 끝을 … 로 */
function fit(text: string, w: number): string {
  if (len(text) <= w) return text
  let out = ''
  for (const ch of text) {
    if (len(out + ch) > w - 1) break
    out += ch
  }
  return out + '…'
}

const AGENT_MARK = { run: '●', done: '✓', fail: '✖' } as const

/** 받은 지시 → 만들어진 서브에이전트들 → 각자 지금 하는 일, 나무 모양 */
function orderTree(els: Els, vm: TimelineTabVM) {
  const { Box, Text } = els
  const { theme } = vm
  const w = Math.max(8, vm.cols - 1)
  const colorOf = { run: theme.accent, done: OK_GREEN, fail: FAIL_RED } as const
  const shown = vm.agents.slice(-vm.treeRows)
  const hidden = vm.agents.length - shown.length
  const lines = shown.map((a, i) => {
    const branch = i === shown.length - 1 ? ' └─ ' : ' ├─ '
    const head = `${AGENT_MARK[a.state]} ${a.type} · ${a.description}`
    const doing =
      a.state === 'run'
        ? a.tool === undefined ? ' ─ 시작하는 중' : ` ─ ${ICONS[poseForTool(a.tool)] ?? '•'} ${a.tool} ${shortTarget(a.target ?? '')}`
        : a.state === 'done' ? ' ─ 완료' : ' ─ 실패'
    const room = w - len(branch)
    const headText = fit(head, Math.max(4, room - Math.min(len(doing), Math.floor(room / 2))))
    return (
      <Box flexDirection="row">
        <Text color={theme.soft}>{branch}</Text>
        <Text color={colorOf[a.state]} bold={a.state === 'run'}>{headText}</Text>
        <Text color={theme.soft}>{fit(doing, Math.max(0, room - len(headText)))}</Text>
      </Box>
    )
  })
  return (
    <Box flexDirection="column">
      <Box flexDirection="row">
        <Text color={theme.accent} bold>{' ▶ 지시 '}</Text>
        <Text color={theme.ink}>{fit(vm.order === '' ? '아직 없음' : vm.order, Math.max(1, w - 7))}</Text>
      </Box>
      {hidden > 0 ? <Text color={theme.soft}>{` ├─ … 앞의 ${hidden}개`}</Text> : null}
      {lines.length === 0 ? <Text color={theme.soft}> └─ 서브에이전트 없음</Text> : lines}
    </Box>
  )
}

const ARROW = ' ─▶ '

/** 경로는 파일 이름만, 나머지는 14자로 줄인 대상 */
function shortTarget(target: string): string {
  const name = target.includes('/') ? (target.split('/').filter(Boolean).at(-1) ?? target) : target
  return truncateMiddle(name, 14)
}

/** 이번 turn 의 단계를 화살표로 이은 한 줄, 넘치면 오래된 단계부터 … 로 줄인다 */
function chain(els: Els, vm: TimelineTabVM) {
  const { Box, Text } = els
  const { theme } = vm
  const items = turnSteps(vm).map(s => ({
    text: `${ICONS[s.pose] ?? '•'} ${shortTarget(s.target) || s.tool}`,
    color: s.isError === true ? FAIL_RED : s.durationMs === undefined ? theme.accent : theme.soft,
    bold: s.durationMs === undefined,
  }))
  if (vm.activity.pose === 'thinking') items.push({ text: '… 생각 중', color: theme.accent, bold: true })
  if (items.length === 0) return <Text color={theme.soft}> 첫 단계를 기다리는 중</Text>
  const room = Math.max(1, vm.cols - 2 - len(' …' + ARROW))
  const shown: typeof items = []
  let used = 0
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i]
    if (item === undefined) continue
    const cost = len(item.text) + (shown.length > 0 ? len(ARROW) : 0)
    if (shown.length > 0 && used + cost > room) break
    shown.unshift(item)
    used += cost
  }
  const parts = shown.flatMap((item, i) => [
    ...(i > 0 ? [<Text color={theme.soft}>{ARROW}</Text>] : []),
    <Text color={item.color} bold={item.bold}>{item.text}</Text>,
  ])
  return (
    <Box flexDirection="row">
      <Text color={theme.soft}>{shown.length < items.length ? ' …' + ARROW : ' '}</Text>
      {parts}
    </Box>
  )
}

function duration(ms: number): string {
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} s`
}

function header(els: Els, vm: TimelineTabVM) {
  const { Box, Text } = els
  const { theme, contextPct: pct } = vm
  const label = ' auto-compact '
  const after = ` ${pct === undefined ? '측정 전' : `${Math.round(pct)}%`}${vm.elapsed === '' ? '' : ` · ${vm.elapsed}`} `
  const barW = Math.max(4, vm.cols - len(label) - len(after))
  const filled = pct === undefined ? 0 : Math.max(0, Math.min(barW, Math.round((pct / 100) * barW)))
  const color = pct === undefined || pct < WARN_AT ? theme.accent : pct < CRITICAL_AT ? WARN_AMBER : FAIL_RED
  return (
    <Box flexDirection="row">
      <Text color={theme.soft} bold>{label}</Text>
      <Text color={color}>{'━'.repeat(filled)}</Text>
      <Text color={theme.soft}>{'─'.repeat(barW - filled)}</Text>
      <Text color={theme.soft}>{after}</Text>
    </Box>
  )
}

function inspector(els: Els, vm: TimelineTabVM) {
  const { Box, Text } = els
  const { theme } = vm
  const width = Math.max(1, vm.cols - 2)
  const { activity } = vm
  const tool = activity.tool ?? 'Claude'
  return (
    <Box flexDirection="column">
      <Text color={theme.ink} wrap="truncate-end">
        {` ${ICONS[activity.pose] ?? '•'} ${tool}  ${truncateMiddle(activity.target ?? '', Math.max(1, width - tool.length - 3))}`}
      </Text>
      {chain(els, vm)}
      <Text color={theme.soft} wrap="truncate-end">
        {` ${POSE_WORDS[activity.pose]} · ${vm.current}단계`}
      </Text>
    </Box>
  )
}

/** The Timeline tab: compaction bar, order tree, the live step with its chain, and a detailed progress line. */
export function timelineTabView(els: Els, vm: TimelineTabVM): Tree {
  const { Box } = els
  return (
    <Box flexDirection="column">
      {header(els, vm)}
      {orderTree(els, vm)}
      {inspector(els, vm)}
      {progressLine(els, vm)}
    </Box>
  )
}
