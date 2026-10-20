import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Activity, Dialog, Keyframe, SubAgent, ThemeName, UsageSnapshot } from '../types'
import { finishKeyframe, firstLine, parseClientMessage, poseForTool, startKeyframe, targetOf } from './activity'
import { TICK_MS, rasterFrames } from './animator'
import type { AnimModel, RasterKey } from './animator'
import { formatElapsed, hatFor } from './calendar'
import { QUESTION_TEXT, needsYouText, notifiedText, statusLine } from './alerts'
import { DOCK_COLS, STAGE_ROWS_MAX, STAGE_ROWS_MIN, layoutV2, paneRows } from './layout'
import { STAGE_ROWS } from './art/stage'
import { THEMES, themeFor } from './themes'
import type { Os } from './themes'
import { segmentsText, statusSegments, titleSegments } from './views/chrome'
import type { RowSegment } from './client/row'
import { snapshotFrom, usageWarning } from './usage'
import type { RawUsage } from './usage'
import { dialogView, dialogWidth, okSegments } from './views/dialogs'
import { studioView } from './views/studio'
import { lookup, plainText } from './text'
import { timelineTabView } from './views/timelineTab'

const PANE = 'usagi-code'
const HOP_MS = 1000
const ERROR_DIALOG_MS = 8000

const activity = atom({ plugin: 'usagi-code', key: 'activity' } as const, { pose: 'idle', since: 0 } as Activity)
const keyframes = atom({ plugin: 'usagi-code', key: 'keyframes' } as const, [] as Keyframe[])
const themeOverride = atom({ plugin: 'usagi-code', key: 'themeOverride' } as const, null as ThemeName | null)
const turnStartedAt = atom({ plugin: 'usagi-code', key: 'turnStartedAt' } as const, null as number | null)
const idleSince = atom({ plugin: 'usagi-code', key: 'idleSince' } as const, null as number | null)
const usage = atom({ plugin: 'usagi-code', key: 'usage' } as const, { rateLimits: [], toolCalls: 0 } as UsageSnapshot)
const dialog = atom({ plugin: 'usagi-code', key: 'dialog' } as const, null as Dialog)
const screensaver = atom({ plugin: 'usagi-code', key: 'screensaver' } as const, false)
// 마지막으로 받은 사용자 지시 첫 줄과, 그 지시로 만들어진 서브에이전트들
const order = atom({ plugin: 'usagi-code', key: 'order' } as const, '')
const subagents = atom({ plugin: 'usagi-code', key: 'subagents' } as const, [] as SubAgent[])
// 메인 루프의 이번 작업이 시작된 시각, 단계 사슬·진행 줄은 이 뒤 단계만 센다
const turnFrom = atom({ plugin: 'usagi-code', key: 'turnFrom' } as const, null as number | null)
// 자동 압축이 시작되는 토큰 수, 꺼져 있거나 아직 못 읽었으면 null
const compactAt = atom({ plugin: 'usagi-code', key: 'compactAt' } as const, null as number | null)
// 캐릭터 높이(줄), ▲▼ 로 바꾸고 $.store 에 남겨 다음 세션에도 쓴다
const stageRows = atom({ plugin: 'usagi-code', key: 'stageRows' } as const, STAGE_ROWS)
const STAGE_STEP = 2

/** The cwd's last path segment, for the pane title. */
let folder = 'untitled'
/** Animation tick and the clock as of the last tick; both start over on a reload. */
let tick = 0
let now = 0
/** What the pane last drew: the ticker repaints these rasters until a repaint is refused. */
let drawn: { model: AnimModel; mounted: Set<RasterKey> } | null = null
/** Set while a tick's repaints are in flight. */
let isAnimating = false
/** Client rows that faulted on this surface: drawn as plain Text from then on. */
const faulted = new Set<string>()

const TERMINAL_ONLY = 'Usagi code runs in the terminal for now.'
const paneTitle = () => `Usagi code · ${folder}`
// 자동 테마는 OS 를 묻지 않고 리눅스 기준(Ubuntu)으로 고른다, 다른 OS 면 /usagi theme 로 바꾼다
const OS: Os = 'linux'
/** The status line as last set, so it is only set again when it changes. */
let lastStatus: string | undefined

/** Sets the plugin's status line from the dialog and the usage warning, when the text changed. */
async function refreshStatus($: EngineInterface): Promise<void> {
  const text = statusLine(await read($, dialog), usageWarning(await read($, usage), new Date(await $.clock.now())))
  if (text === lastStatus) return
  lastStatus = text
  $.ui.status(text)
}


/** Shows a dialog (or clears it with null) and sets the status line to match. */
async function setDialog($: EngineInterface, next: Dialog): Promise<void> {
  await update($, dialog, () => next)
  await refreshStatus($)
}

/** Clears the dialog if it is of this kind. */
async function clearDialog($: EngineInterface, kind: 'error' | 'needs-you'): Promise<void> {
  if ((await read($, dialog))?.kind === kind) await setDialog($, null)
}

/** The mascot waves beside an instant message. */
async function needsYou($: EngineInterface, text: string): Promise<void> {
  const at = await $.clock.now()
  await setDialog($, { kind: 'needs-you', text, at })
  await update($, activity, last => ({ ...last, pose: 'waving', since: at }) as Activity)
}

/** 받은 지시: 메인 루프의 새 지시만 기록, 알림(<...>)과 이어하기("")는 건너뛴다. 서브에이전트 turn 은 다시 실행 중으로. */
async function noteTurnStart($: EngineInterface, agentId: string | undefined, text: string, now: number): Promise<void> {
  if (agentId === undefined) await update($, turnFrom, () => now)
  if (agentId !== undefined) {
    await update($, subagents, list => list.map(a => (a.id === agentId ? { ...a, state: 'run' as const } : a)))
  } else if (text.trim() !== '' && !text.trimStart().startsWith('<')) {
    await update($, order, () => firstLine(text))
    await update($, subagents, list => list.filter(a => a.state === 'run'))
  }
}

/** 서브에이전트의 도구 호출로 그 에이전트가 지금 하는 일을 갱신한다. */
async function noteSubagentTool($: EngineInterface, agentId: string | undefined, tool: string, target: string): Promise<void> {
  if (agentId === undefined) return
  await update($, subagents, list => list.map(a => (a.id === agentId ? { ...a, tool, target } : a)))
}

/** 자동 압축 기준 토큰 수를 다시 읽는다, summary 는 로컬 추정이라 API 요청이 없다. */
async function refreshCompactAt($: EngineInterface): Promise<void> {
  try {
    const { context } = await $.session.usage({ breakdown: 'summary' })
    await update($, compactAt, () => context.breakdown?.autoCompactThreshold ?? null)
  } catch {
    // 다음 turn 끝에 다시 읽는다
  }
}

/** 압축 기준까지 찬 비율(%), 기준을 모르면 창 전체 대비 비율로 대신한다. */
function compactPercent(figures: UsageSnapshot, threshold: number | null): number | undefined {
  if (threshold !== null && threshold > 0 && figures.contextTokens !== undefined) return (figures.contextTokens / threshold) * 100
  return figures.contextPercent
}

/** 캐릭터 높이를 범위 안으로 맞춰 저장하고 pane 높이도 그만큼 청한다, 정한 높이를 돌려준다. */
async function resizeStage($: EngineInterface, change: (last: number) => number): Promise<number> {
  const size = await update($, stageRows, last => Math.max(STAGE_ROWS_MIN, Math.min(STAGE_ROWS_MAX, Math.round(change(last)))))
  await $.store.set('stageRows', size)
  // 사람이 테두리로 정한 크기가 있으면 그쪽이 이긴다
  await $.ui.open({ id: PANE, title: paneTitle(), columns: DOCK_COLS, rows: paneRows(size) })
  return size
}

/** Any activity wakes the screensaver. */
async function wake($: EngineInterface): Promise<void> {
  if (await read($, screensaver)) await update($, screensaver, () => false)
}

const SCREENSAVER_CHECK_TICKS = 6


/** Takes the engine's usage figures, if they look like figures. */
function isRawUsage(value: unknown): value is RawUsage {
  const v = value as { context?: unknown; rateLimits?: unknown } | null
  return typeof v === 'object' && v !== null && typeof v.context === 'object' && Array.isArray(v.rateLimits)
}

function folderOf(cwd: string): string {
  const parts = cwd.split(/[\\/]/).filter(part => part !== '')
  return plainText(parts.at(-1) ?? '') || 'untitled'
}

/** What a tool call's result says about failure: an error result or a refusal. */
function failureOf(result: unknown): string | undefined {
  const r = (result ?? {}) as { isError?: boolean; text?: unknown; deny?: unknown }
  if (typeof r.deny === 'string') return firstLine(r.deny)
  if (r.isError === true) return firstLine(typeof r.text === 'string' ? r.text : '')
  return undefined
}

export const register: Register = (on, options) => {
  const screensaverMs = Math.max(0, Number(options.screensaverMinutes ?? 5)) * 60_000

  on('session.start', async ($, e, next) => {
    folder = folderOf(e.cwd)
    await $.command.register({ name: 'usagi', description: 'Open or close Usagi code' })
    await refreshCompactAt($)
    const kept = Number(await $.store.get('stageRows'))
    if (Number.isFinite(kept) && kept > 0) await update($, stageRows, () => Math.max(STAGE_ROWS_MIN, Math.min(STAGE_ROWS_MAX, kept)))
    const animate = async () => {
      tick += 1
      now = await $.clock.now()
      if (screensaverMs > 0 && tick % SCREENSAVER_CHECK_TICKS === 0) {
        const quiet = await read($, idleSince)
        if (quiet !== null && now - quiet >= screensaverMs && !(await read($, screensaver))) await update($, screensaver, () => true)
      }
      const last = drawn
      if (last === null || last.mounted.size === 0) return
      for (const frame of rasterFrames(last.model, tick, now)) {
        if (!last.mounted.has(frame.key)) continue
        const painted = await $.ui.blit({ requestId: PANE, key: frame.key, cells: frame.cells })
        if (painted.deny !== undefined) last.mounted.delete(frame.key)
      }
    }
    $.clock.every(TICK_MS, () => {
      // a surface still taking the last frame skips this tick rather than stacking repaints
      if (isAnimating) return
      isAnimating = true
      void animate()
        .catch(() => undefined)
        .finally(() => {
          isAnimating = false
        })
    })
    try {
      const figures: unknown = await $.session.usage()
      if (isRawUsage(figures)) {
        const calls = (await read($, keyframes)).at(-1)?.n ?? 0
        await update($, usage, () => snapshotFrom(figures, calls))
        await refreshStatus($)
      }
    } catch {
      // no figures yet; session.measure brings them
    }
    const hasTerminal = (await $.session.surfaces()).includes('terminal')
    if (options.openOnStartup !== false && hasTerminal) {
      void $.ui.open({ id: PANE, title: paneTitle(), columns: DOCK_COLS, rows: paneRows(await read($, stageRows)) })
    }
    return next(e)
  })

  on('command.run', { command: 'usagi' }, async ($, e) => {
    if (!(await $.session.surfaces()).includes('terminal')) return { text: TERMINAL_ONLY }
    const [verb = '', arg = ''] = String((e as { args?: unknown }).args ?? '').trim().toLowerCase().split(/\s+/)
    const isOpen = (await $.ui.panes()).some(pane => pane.id === PANE)
    if (verb === 'theme') {
      const chosen = lookup<(typeof THEMES)[ThemeName]>(THEMES, arg)
      if (chosen === undefined) return { text: 'Themes: windows7, macos, ubuntu. To keep one, set Theme with /plugin configure.' }
      await update($, themeOverride, () => chosen.name)
      return { text: `Theme set to ${chosen.label} (this session).` }
    }
    // 일반 화면 모드에선 ▲▼ 클릭이 안 닿아서 명령으로도 받는다
    if (verb === '+' || verb === '-' || verb === 'size') {
      const wanted = Number(arg)
      if (verb === 'size' && !Number.isFinite(wanted)) return { text: `Usage: /usagi size <${STAGE_ROWS_MIN}-${STAGE_ROWS_MAX}>, or /usagi + / /usagi -.` }
      const size = await resizeStage($, last => (verb === 'size' ? wanted : last + (verb === '+' ? STAGE_STEP : -STAGE_STEP)))
      return { text: `Usagi size ${size} rows.` }
    }
    if (verb !== '') {
      return {
        text: 'Try /usagi, /usagi + | - | size <n>, or /usagi theme <windows7 | macos | ubuntu>.',
      }
    }
    if (isOpen) {
      await $.ui.close({ id: PANE })
      return { text: 'Usagi code closed.' }
    }
    await $.ui.open({ id: PANE, title: paneTitle(), columns: DOCK_COLS, rows: paneRows(await read($, stageRows)) })
    return { text: 'Usagi code opened.' }
  })

  on('tool.call', async ($, e, next) => {
    let id = ''
    let started = 0
    try {
      started = await $.clock.now()
      const tool = plainText(String(e.tool))
      const target = targetOf(e as unknown as Record<string, unknown>)
      const pose = poseForTool(tool)
      await noteSubagentTool($, e.agentId, tool, target)
      await update($, keyframes, list => {
        id = e.tool_use_id ?? `k${(list.at(-1)?.n ?? 0) + 1}`
        return startKeyframe(list, { id, tool, target, pose, startedAt: started })
      })
      await update($, activity, () => ({ pose, tool, target, since: started }))
      await update($, idleSince, () => null)
      await wake($)
      await clearDialog($, 'error')
      if (tool === 'AskUserQuestion') await setDialog($, { kind: 'needs-you', text: QUESTION_TEXT, at: started })
    } catch {
      // the studio never stands in the way of a tool call
    }
    const result = await next(e)
    try {
      const ended = await $.clock.now()
      const errorLine = failureOf(result)
      await update($, keyframes, list =>
        finishKeyframe(list, id, {
          durationMs: ended - started,
          isError: errorLine !== undefined,
          ...(errorLine !== undefined ? { errorLine } : {}),
        }),
      )
      await clearDialog($, 'needs-you')
      const isTurnRunning = (await read($, turnStartedAt)) !== null
      const isAllDone = (await read($, keyframes)).every(frame => frame.durationMs !== undefined)
      if (errorLine !== undefined) {
        const tool = String(e.tool)
        await update($, activity, last => ({ ...last, pose: 'oops', since: ended }) as Activity)
        await setDialog($, { kind: 'error', tool, line: errorLine, at: ended })
        $.clock.after(ERROR_DIALOG_MS, () => {
          void (async () => {
            const shown = await read($, dialog)
            if (shown?.kind === 'error' && shown.at === ended) await setDialog($, null)
          })()
        })
      } else if (isTurnRunning && isAllDone) {
        await update($, activity, last => ({ ...last, pose: 'thinking', since: ended }) as Activity)
      }
    } catch {
      // observing only
    }
    return result
  }).catch(($, e, next) => next(e))

  on('turn.start', async ($, e, next) => {
    try {
      const now = await $.clock.now()
      await update($, activity, () => ({ pose: 'thinking', since: now }) as Activity)
      await update($, turnStartedAt, () => now)
      await wake($)
      await update($, idleSince, () => null)
      await noteTurnStart($, e.agentId, e.text, now)
    } catch {
      // observing only
    }
    return next(e)
  }).catch(($, e, next) => next(e))

  // 서브에이전트가 만들어지면 종류와 맡은 일을 기록한다
  on('agent.spawn', async ($, e, next) => {
    const result = await next(e)
    try {
      if (result.agentId !== undefined) {
        const agent: SubAgent = { id: result.agentId, type: e.subagentType, description: firstLine(e.description), state: 'run' }
        await update($, subagents, list => [...list.filter(a => a.id !== agent.id), agent].slice(-20))
      }
    } catch {
      // observing only
    }
    return result
  }).catch(($, e, next) => next(e))

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    if (e.agentId !== undefined) {
      try {
        const state: SubAgent['state'] = e.reason === 'answer' ? 'done' : 'fail'
        await update($, subagents, list => list.map(a => (a.id === e.agentId ? { ...a, state } : a)))
      } catch {
        // observing only
      }
      return result
    }
    try {
      const now = await $.clock.now()
      await clearDialog($, 'needs-you')
      await update($, activity, () => ({ pose: 'done', since: now }) as Activity)
      await update($, turnStartedAt, () => null)
      await refreshCompactAt($)
      $.clock.after(HOP_MS, () => {
        void (async () => {
          if ((await read($, turnStartedAt)) !== null) return
          const at = await $.clock.now()
          await update($, activity, () => ({ pose: 'idle', since: at }) as Activity)
          await update($, idleSince, () => at)
        })()
      })
    } catch {
      // observing only
    }
    return result
  }).catch(($, e, next) => next(e))

  on('classic.PermissionRequest', async ($, e, next) => {
    try {
      const target = targetOf((e.tool_input ?? {}) as Record<string, unknown>)
      await needsYou($, needsYouText(e.tool_name, target))
    } catch {
      // observing only: the person decides, never the studio
    }
    return next(e)
  }).catch(($, e, next) => next(e))

  on('classic.Notification', async ($, e, next) => {
    try {
      if (e.notification_type === 'permission_prompt' && (await read($, dialog))?.kind !== 'needs-you') {
        await needsYou($, notifiedText(e.message))
      }
    } catch {
      // observing only
    }
    return next(e)
  }).catch(($, e, next) => next(e))

  on('prompt.submit', async ($, e, next) => {
    try {
      await clearDialog($, 'needs-you')
      await wake($)
    } catch {
      // observing only
    }
    return next(e)
  }).catch(($, e, next) => next(e))

  on('ui.message', { requestId: PANE }, async ($, e, next) => {
    try {
      const message = parseClientMessage(e.data)
      const click = message !== null && 'click' in message ? message.click : null
      if (click === 'ok') await setDialog($, null)
      if (click === 'close') await $.ui.close({ id: PANE })
      if (click === 'stage-grow') await resizeStage($, last => last + STAGE_STEP)
      if (click === 'stage-shrink') await resizeStage($, last => last - STAGE_STEP)
    } catch {
      // a click the studio cannot act on is ignored
    }
    return next(e)
  }).catch(($, e, next) => next(e))

  on('ui.fault', { requestId: PANE }, async ($, e, next) => {
    faulted.add(e.element)
    return next(e)
  }).catch(($, e, next) => next(e))

  on('session.measure', async ($, e, next) => {
    try {
      const calls = (await read($, keyframes)).at(-1)?.n ?? 0
      await update($, usage, () => snapshotFrom(e, calls))
      await refreshStatus($)
    } catch {
      // observing only
    }
    return next(e)
  }).catch(($, e, next) => next(e))

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    if (e.surface !== 'terminal') {
      const { Text } = $.ui.resolve(e)
      return <Text>{TERMINAL_ONLY}</Text>
    }
    const els = $.ui.resolve(e)
    const cols = e.props.bodyColumns
    const rows = e.props.scroll.bodyRows
    const at = await $.clock.now()
    const act = await read($, activity)
    const frames = await read($, keyframes)
    const override = await read($, themeOverride)
    const theme = themeFor(override ?? String(options.theme ?? 'auto'), OS)
    const startedAt = await read($, turnStartedAt)
    const figures = await read($, usage)
    const quietSince = await read($, idleSince)
    const shownDialog = await read($, dialog)
    const isSaving = (await read($, screensaver)) && screensaverMs > 0
    const threshold = await read($, compactAt)
    const orderText = await read($, order)
    const agentList = await read($, subagents)
    const layout = layoutV2(cols, rows, await read($, stageRows))
    const current = frames.at(-1)?.n ?? 0

    const model: AnimModel = {}
    if (!layout.tooNarrow) {
      model.stage = {
        cols: layout.stageCols,
        rows: layout.stageRows,
        pose: act.pose,
        hat: hatFor(new Date(at)),
        theme: theme.name,
        idleSince: quietSince,
        screensaver: isSaving ? { since: (quietSince ?? at) + screensaverMs } : null,
      }
    }
    const rasters = rasterFrames(model, tick, at)
    drawn = { model, mounted: new Set(rasters.map(frame => frame.key)) }

    const row = (key: string, segments: RowSegment[], width = cols) =>
      faulted.has(key) ? segmentsText(els, segments) : <els.Client key={key} module="./client/row.tsx" props={{ segments }} width={width} height={1} />
    const fiveHour = figures.rateLimits.find(limit => limit.kind === 'five_hour')?.percentUsed
    const fromAt = await read($, turnFrom)
    const timeline =
      !layout.tooNarrow
        ? timelineTabView(
            els,
            { cols: layout.infoCols, theme, current, activity: act, elapsed: startedAt === null ? '' : formatElapsed(at - startedAt), contextPct: compactPercent(figures, threshold), steps: frames, order: orderText, agents: agentList, treeRows: Math.max(1, layout.content - 6), now: at, turnFrom: fromAt },
          )
        : null
    const parts = {
      timeline,
      dialog: dialogView(els, shownDialog, cols, theme, shownDialog?.kind === 'error' ? row('ok', okSegments(theme, cols), dialogWidth(cols) - 2) : null),
      title: row('title', titleSegments(theme, cols)),
      status: row('status', statusSegments(theme, cols, {
        ...(figures.contextPercent !== undefined ? { context: figures.contextPercent } : {}),
        ...(fiveHour !== undefined ? { fiveHour } : {}),
      })),
    }

    return studioView(
      els,
      {
        cols,
        layout,
        theme,
        frames: Object.fromEntries(rasters.map(frame => [frame.key, frame])),
      },
      parts,
    )
  })
}
