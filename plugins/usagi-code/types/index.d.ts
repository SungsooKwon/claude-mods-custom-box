export type ThemeName = 'windows7' | 'macos' | 'ubuntu'
export type Hat = 'none' | 'pumpkin' | 'santa' | 'party' | 'heart'
export type Pose = 'thinking' | 'coding' | 'reading' | 'terminal' | 'browsing' | 'helper' | 'oops' | 'waving' | 'done' | 'idle' | 'asleep'
/** 이번 지시로 만들어진 서브에이전트 하나: 종류, 맡은 일, 상태, 지금 쓰는 도구 */
export type SubAgent = { id: string; type: string; description: string; state: 'run' | 'done' | 'fail'; tool?: string; target?: string }
export type Keyframe = {
  id: string
  n: number
  tool: string
  target: string
  pose: Pose
  startedAt: number
  durationMs?: number
  isError?: boolean
  errorLine?: string
}
export type Activity = { pose: Pose; tool?: string; target?: string; since: number }
export type RateLimitView = { kind: string; percentUsed: number; resetsAt?: string }
export type UsageSnapshot = {
  contextPercent?: number
  contextTokens?: number
  contextWindow?: number
  rateLimits: RateLimitView[]
  costUsd?: number
  toolCalls: number
}
export type Dialog =
  | { kind: 'error'; tool: string; line: string; at: number }
  | { kind: 'needs-you'; text: string; at: number }
  | null

declare module 'claude-code' {
  interface PluginState {
    'usagi-code': {
      activity: Activity
      keyframes: Keyframe[]
      order: string
      subagents: SubAgent[]
      turnFrom: number | null
      themeOverride: ThemeName | null
      turnStartedAt: number | null
      idleSince: number | null
      usage: UsageSnapshot
      dialog: Dialog
      compactAt: number | null
      stageRows: number
    }
  }
}
