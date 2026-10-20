// The three 2010s skins. A theme is pure data: colours for every part of the
// pane and a Stage backdrop.

import type { ThemeName } from '../types'
import { lookup } from './text'

export type Theme = {
  name: ThemeName
  label: string
  title: { top: string; bottom: string; text: string; buttons: 'right' | 'traffic' | 'ubuntu' }
  tabs: { bar: string; idle: string; active: string; activeText: string; text: string; hover: string }
  body: string
  ink: string
  soft: string
  accent: string
  hover: string
  film: { film: string; hole: string; gap: string; playhead: string }
  status: { bg: string; text: string }
  dialog: { title: string; titleText: string; body: string; text: string; button: { fg: string; bg: string; hover: string } }
  levels: { ok: string; warn: string; critical: string }
  graph: { bg: string; grid: string; line: string }
  /** The Stage backdrop's colour at pixel (x, y) of the 40x24 scene, as 0xRRGGBB. */
  backdrop(x: number, y: number): number
}

function mix(from: number, to: number, t: number): number {
  const u = Math.min(1, Math.max(0, t))
  const channel = (shift: number) => {
    const a = (from >> shift) & 0xff
    const b = (to >> shift) & 0xff
    return Math.round(a + (b - a) * u) << shift
  }
  return channel(16) | channel(8) | channel(0)
}

export const THEMES: Readonly<Record<ThemeName, Theme>> = {
  windows7: {
    name: 'windows7',
    label: 'Windows 7',
    title: { top: '#DDEBFA', bottom: '#B9D3F0', text: '#1E395B', buttons: 'right' },
    tabs: { bar: '#E3EDF8', idle: '#E3EDF8', active: '#FFFFFF', activeText: '#1E395B', text: '#3D5A80', hover: '#FFF3C4' },
    body: '#F3F7FC',
    ink: '#1E395B',
    soft: '#56708F',
    accent: '#3B7FC4',
    hover: '#FFF3C4',
    film: { film: '#2A2F36', hole: '#9AA6B2', gap: '#1A1D22', playhead: '#E81123' },
    status: { bg: '#D6E4F3', text: '#1E395B' },
    dialog: { title: '#B9D3F0', titleText: '#1E395B', body: '#FFFFFF', text: '#1E395B', button: { fg: '#1E395B', bg: '#E3EDF8', hover: '#FFF3C4' } },
    levels: { ok: '#3FA9F5', warn: '#FFB000', critical: '#E5484D' },
    graph: { bg: '#000000', grid: '#008040', line: '#00FF00' },
    backdrop: (_x, y) => mix(0x3b7fc4, 0xa9d2f5, y / 23),
  },
  macos: {
    name: 'macos',
    label: 'Mac OS X',
    title: { top: '#EDEDED', bottom: '#C9C9C9', text: '#4D4D4D', buttons: 'traffic' },
    tabs: { bar: '#D8D8D8', idle: '#F7F7F7', active: '#3D8BE8', activeText: '#FFFFFF', text: '#333333', hover: '#E3EEFC' },
    body: '#ECECEC',
    ink: '#2E2E2E',
    soft: '#7A7A7A',
    accent: '#3D8BE8',
    hover: '#E3EEFC',
    film: { film: '#C9C9C9', hole: '#ECECEC', gap: '#ECECEC', playhead: '#F5C400' },
    status: { bg: '#D0D0D0', text: '#505050' },
    dialog: { title: '#E2E2E2', titleText: '#4D4D4D', body: '#ECECEC', text: '#2E2E2E', button: { fg: '#FFFFFF', bg: '#3D8BE8', hover: '#5AA0F0' } },
    levels: { ok: '#3D8BE8', warn: '#F5A623', critical: '#E5484D' },
    graph: { bg: '#1E1E1E', grid: '#3A3A3A', line: '#3D8BE8' },
    backdrop: (x, y) => ((x * 3 + y * 5) % 7 < 3 ? 0x3e4350 : 0x383d49),
  },
  ubuntu: {
    name: 'ubuntu',
    label: 'Ubuntu',
    title: { top: '#5A5954', bottom: '#3C3B37', text: '#DFDBD2', buttons: 'ubuntu' },
    tabs: { bar: '#E6E4E1', idle: '#E6E4E1', active: '#FFFFFF', activeText: '#3C3B37', text: '#5E5C57', hover: '#FBD9C8' },
    body: '#F2F1F0',
    ink: '#3C3B37',
    soft: '#7A776F',
    accent: '#E95420',
    hover: '#FBD9C8',
    film: { film: '#2C2C2C', hole: '#77746E', gap: '#1C1C1C', playhead: '#F07746' },
    status: { bg: '#DFDBD2', text: '#3C3B37' },
    dialog: { title: '#3C3B37', titleText: '#DFDBD2', body: '#F2F1F0', text: '#3C3B37', button: { fg: '#FFFFFF', bg: '#E95420', hover: '#F07746' } },
    levels: { ok: '#4E9A06', warn: '#F57900', critical: '#CC0000' },
    graph: { bg: '#2C001E', grid: '#4A1B3F', line: '#F07746' },
    backdrop: (x, y) => {
      const t = Math.min(1, (x * 0.6 + y * 1.4) / 44)
      return t < 0.6 ? mix(0x2c001e, 0x77216f, t / 0.6) : mix(0x77216f, 0xe95420, (t - 0.6) / 0.4)
    },
  },
}

export type Os = 'windows' | 'macos' | 'linux' | 'other'
const AUTO: Readonly<Record<Os, ThemeName>> = { windows: 'windows7', macos: 'macos', linux: 'ubuntu', other: 'ubuntu' }

/** The theme for a setting (`auto` or a theme name) on an OS; anything unknown behaves as `auto`. */
export function themeFor(setting: string, os: Os): Theme {
  return lookup<Theme>(THEMES, setting) ?? THEMES[AUTO[os]]
}
