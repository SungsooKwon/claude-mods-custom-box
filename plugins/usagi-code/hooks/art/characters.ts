// 무대에 세울 캐릭터들: 이름, 색, 줄 수마다 손으로 그린 도안과 배치표.
// 새 캐릭터는 도안과 22줄 배치표를 만들어 CHARACTERS 에 올린다, 배치표가 없는 줄 수는 22줄 장면을 줄여 쓴다.

import type { CharacterId } from '../../types'
import { CLAWD_PALETTE } from './clawd'

export type { CharacterId }

/**
 * 줄 수마다 손으로 맞춘 장면: 캐릭터 도안(art)과 왼쪽 위 자리, 키보드 가로 범위·윗줄 y, 두 앞발 x, 말풍선 왼쪽 x.
 * dots 가 있으면 말풍선에 thinking 대신 점 dots 개, mini 면 얇은 키보드와 한 줄짜리 앞발.
 * 졸 때: eyes 는 감길 눈 왼쪽 위(도안 기준), snot 은 콧방울이 매달릴 코 자리와 최대 반지름, zs 는 떠오를 z 의 시작 자리(장면 기준)와 큰 글씨 여부.
 */
export type SceneLayout = {
  w: number
  h: number
  art: readonly string[]
  rx: number
  ry: number
  keys: readonly [number, number]
  top: number
  paws: readonly [number, number]
  bubbleX: number
  dots?: number
  mini?: boolean
  eyes: readonly (readonly [number, number])[]
  snot?: { at: readonly [number, number]; max: number }
  zs: readonly (readonly [number, number, boolean])[]
}

export type Character = {
  name: string
  /** 도안 글자의 색: d 테두리, o 몸, p 속귀·볼, w 눈 반짝임 (키보드 앞발·감은 눈도 이 색으로 그린다) */
  palette: Readonly<Record<string, number>>
  /** 줄 수마다 손으로 맞춘 장면, 22줄은 꼭 있어야 한다 */
  layouts: Readonly<Record<number, SceneLayout>> & { readonly 22: SceneLayout }
}

// Usagi: 도안 그대로, d 테두리, o 몸, p 속귀·볼, w 눈 반짝임
const RABBIT = [
  '..........dd.....dd..........',
  '.........dpod...dopd.........',
  '.........dppod.doppd.........',
  '.........dppod.doppd.........',
  '.........dppod.doppd.........',
  '.........dppod.doppd.........',
  '.........dppod.doppd.........',
  '.........dppod.doppd.........',
  '..........dpod.dopd..........',
  '..........dood.dood..........',
  '.......ddoooodddoooodd.......',
  '.....ddoooooooooooooood......',
  '....dooooddooooooddooood.....',
  '...doooodoooooooooodooood....',
  '..doooodoooooooooooodooood...',
  '..dooodoooooooooooooodoood...',
  '.doooodoooooooooooooodooood..',
  '.doooooooddooooooddoooooood..',
  '.dooooooddwdooooddwdooooood..',
  '.doooooodwddoooodwddooooood..',
  '.dooopppoddooooooddopppoood..',
  '.doopdpdpooooodoooopdpdpood..',
  '.doopdpdpooodododoopdpdpood..',
  '.dooopppooooododoooopppoood..',
  '..dooooooooooooooooooooood...',
  '...doooooooooddoooooooood....',
  '....ddooooooooooooooooodd....',
  '....doooooooooooooooooood....',
  '....dodooooooooooooooodod....',
  '....dodooooooooooooooodod....',
  '.....doooooooooooooooodd.....',
  '......doooooooooooooood......',
  '......doooooooooooooood......',
  '......doooooooooooooood......',
  '......dodddooooooodddod......',
  '......dod..ddddddd..dod......',
  '.......d.............d.......',
]
// 20·18줄용: 얼굴(눈썹·눈·볼·입)은 22줄 그대로, 귀·몸·팔 길이와 양옆 한 열씩만 덜었다
const RABBIT_20 = [
  '.........dd.....dd.........',
  '........dpod...dopd........',
  '........dppod.doppd........',
  '........dppod.doppd........',
  '........dppod.doppd........',
  '........dppod.doppd........',
  '.........dpod.dopd.........',
  '.........dood.dood.........',
  '......ddoooodddoooodd......',
  '....ddoooooooooooooood.....',
  '...dooooddooooooddooood....',
  '..doooodoooooooooodooood...',
  '..dooodoooooooooooodoood...',
  '..doodoooooooooooooodood...',
  '.dooodoooooooooooooodoood..',
  '.dooooooddooooooddooooood..',
  '.doooooddwdooooddwdoooood..',
  '.dooooodwddoooodwddoooood..',
  '.doopppoddooooooddopppood..',
  '.dopdpdpooooodoooopdpdpod..',
  '.dopdpdpooodododoopdpdpod..',
  '.doopppooooododoooopppood..',
  '..dooooooooooooooooooood...',
  '..doooooooooddoooooooood...',
  '...ddooooooooooooooooodd...',
  '...doooooooooooooooooood...',
  '...dodooooooooooooooodod...',
  '...dodooooooooooooooodod...',
  '....doooooooooooooooodd....',
  '.....doooooooooooooood.....',
  '.....doooooooooooooood.....',
  '.....dodddooooooodddod.....',
  '.....dod..ddddddd..dod.....',
  '......d.............d......',
]
const RABBIT_18 = [
  '.........dd.....dd.........',
  '........dpod...dopd........',
  '........dppod.doppd........',
  '........dppod.doppd........',
  '........dppod.doppd........',
  '.........dpod.dopd.........',
  '.........dood.dood.........',
  '......ddoooodddoooodd......',
  '....ddoooooooooooooood.....',
  '...dooooddooooooddooood....',
  '..doooodoooooooooodooood...',
  '..dooodoooooooooooodoood...',
  '..doodoooooooooooooodood...',
  '.dooodoooooooooooooodoood..',
  '.dooooooddooooooddooooood..',
  '.doooooddwdooooddwdoooood..',
  '.dooooodwddoooodwddoooood..',
  '.doopppoddooooooddopppood..',
  '.dopdpdpooooodoooopdpdpod..',
  '.dopdpdpooodododoopdpdpod..',
  '.doopppooooododoooopppood..',
  '..dooooooooooooooooooood...',
  '..doooooooooddoooooooood...',
  '...ddooooooooooooooooodd...',
  '...dodooooooooooooooodod...',
  '....doooooooooooooooodd....',
  '.....doooooooooooooood.....',
  '.....dodddooooooodddod.....',
  '.....dod..ddddddd..dod.....',
  '......d.............d......',
]
// 14줄: 귀·눈썹·몸을 줄인 21폭, 눈 4x4·볼·입 무늬는 그대로
const RABBIT_14 = [
  '......dd.....dd......',
  '.....dpod...dopd.....',
  '.....dppod.doppd.....',
  '.....dppod.doppd.....',
  '......dood.dood......',
  '...ddoooodddoooodd...',
  '.ddooooooooooooooodd.',
  'doooooodooooodooooood',
  'dooooodooooooodoooood',
  'doooooooooooooooooood',
  'doooooddoooooddoooood',
  'dooooddwdoooddwdooood',
  'doooodwddooodwddooood',
  'dopppoddoooooddopppod',
  'dpdpdpoooodoooopdpdpd',
  'dpdpdpoodododoopdpdpd',
  'dopppoooododoooopppod',
  '.doooooooooooooooood.',
  '..doooooodddooooood..',
  '..dodddooooooodddod..',
  '..dod..ddddddd..dod..',
  '...d.............d...',
]
// 8줄: 11폭 작은 토끼, 눈은 2x2 (반짝임을 넣으면 ㄴ자로 보여 뺐다)
const RABBIT_8 = [
  '...d...d...',
  '..dpd.dpd..',
  '..dpd.dpd..',
  '..dpd.dpd..',
  '..dpd.dpd..',
  '.ddodddodd.',
  'doooooooood',
  'doddoooddod',
  'doddododdod',
  'dpoododoopd',
  '.doooooood.',
  '..dd...dd..',
]

// pane 이 주는 무대 폭(22줄 42열, 20줄 39열, 18줄 35열, 14줄 28열, 8줄 17열)에 맞췄다, 18줄 이하는 캐릭터를 가운데 두고 점 말풍선
const USAGI: Character = {
  name: 'Usagi',
  palette: CLAWD_PALETTE,
  layouts: {
    22: {
      w: 40, h: 44, art: RABBIT, rx: 5, ry: 3, keys: [3, 36], top: 35, paws: [10, 26], bubbleX: 26,
      eyes: [[8, 17], [16, 17]], snot: { at: [14, 21], max: 2 }, zs: [[32, 13, false], [36, 9, true]],
    },
    20: {
      w: 37, h: 40, art: RABBIT_20, rx: 3, ry: 2, keys: [1, 32], top: 31, paws: [7, 23], bubbleX: 23,
      eyes: [[7, 15], [15, 15]], snot: { at: [13, 19], max: 2 }, zs: [[29, 12, false], [33, 8, true]],
    },
    18: {
      w: 33, h: 36, art: RABBIT_18, rx: 3, ry: 2, keys: [1, 32], top: 27, paws: [7, 23], bubbleX: 23, dots: 3,
      eyes: [[7, 14], [15, 14]], snot: { at: [13, 18], max: 2 }, zs: [[29, 11, false]],
    },
    14: {
      w: 26, h: 28, art: RABBIT_14, rx: 2, ry: 2, keys: [0, 25], top: 21, paws: [5, 16], bubbleX: 20, dots: 3,
      eyes: [[5, 10], [12, 10]], snot: { at: [10, 14], max: 1 }, zs: [[23, 8, false]],
    },
    8: {
      w: 15, h: 16, art: RABBIT_8, rx: 2, ry: 1, keys: [1, 13], top: 12, paws: [3, 8], bubbleX: 12, dots: 1, mini: true,
      eyes: [[2, 7], [7, 7]], zs: [[12, 6, false]],
    },
  },
}

// Chiikawa: 29x29 도안 그대로, 아래 몸통은 Usagi 와 같은 틀이고 귀가 짧아 머리가 8줄 낮다
const CHIIKAWA_ART = [
  '......dd...........dd........',
  '.....dood.........dood.......',
  '.....doodddddddddddood.......',
  '......dooooooooooooood.......',
  '....dooooooooooooooooood.....',
  '...dooooooooooooooooooood....',
  '..dooooooooooooooooooooood...',
  '..dooooooddooooooddooooood...',
  '.dooooooooooooooooooooooood..',
  '.doooooooddooooooddoooooood..',
  '.dooooooddwdooooddwdooooood..',
  '.dooopppdwddoooodwddpppoood..',
  '.doopdpdpddooodooddpdpdpood..',
  '.doopdpdpooodododoopdpdpood..',
  '.dooopppooooododoooopppoood..',
  '.dooooooooooooooooooooooood..',
  '..dooooooooooddooooooooood...',
  '...dooooooooooooooooooood....',
  '....ddooooooooooooooooodd....',
  '....doooooooooooooooooood....',
  '....dodooooooooooooooodod....',
  '....dodooooooooooooooodod....',
  '.....doooooooooooooooodd.....',
  '......doooooooooooooood......',
  '......doooooooooooooood......',
  '......doooooooooooooood......',
  '......dodddooooooodddod......',
  '......dod..ddddddd..dod......',
  '.......d.............d.......',
]

// 20·18줄: 얼굴은 22줄 그대로, 양옆 한 열씩과 몸통 길이만 덜었다 (Usagi 20·18 과 같은 방식)
const CHIIKAWA_20 = [
  '.....dd...........dd.......',
  '....dood.........dood......',
  '....doodddddddddddood......',
  '.....dooooooooooooood......',
  '...dooooooooooooooooood....',
  '..dooooooooooooooooooood...',
  '..dooooooooooooooooooood...',
  '..doooooddooooooddoooood...',
  '.dooooooooooooooooooooood..',
  '.dooooooddooooooddooooood..',
  '.doooooddwdooooddwdoooood..',
  '.doopppdwddoooodwddpppood..',
  '.dopdpdpddooodooddpdpdpod..',
  '.dopdpdpooodododoopdpdpod..',
  '.doopppooooododoooopppood..',
  '.dooooooooooooooooooooood..',
  '..doooooooooddoooooooood...',
  '..dooooooooooooooooooood...',
  '...ddooooooooooooooooodd...',
  '...doooooooooooooooooood...',
  '...dodooooooooooooooodod...',
  '...dodooooooooooooooodod...',
  '....doooooooooooooooodd....',
  '.....doooooooooooooood.....',
  '.....doooooooooooooood.....',
  '.....dodddooooooodddod.....',
  '.....dod..ddddddd..dod.....',
  '......d.............d......',
]
// 18줄: 20줄에서 팔 위·팔·아래 몸통을 한 줄씩 더 덜었다
const CHIIKAWA_18 = [
  '.....dd...........dd.......',
  '....dood.........dood......',
  '....doodddddddddddood......',
  '.....dooooooooooooood......',
  '...dooooooooooooooooood....',
  '..dooooooooooooooooooood...',
  '..dooooooooooooooooooood...',
  '..doooooddooooooddoooood...',
  '.dooooooooooooooooooooood..',
  '.dooooooddooooooddooooood..',
  '.doooooddwdooooddwdoooood..',
  '.doopppdwddoooodwddpppood..',
  '.dopdpdpddooodooddpdpdpod..',
  '.dopdpdpooodododoopdpdpod..',
  '.doopppooooododoooopppood..',
  '.dooooooooooooooooooooood..',
  '..doooooooooddoooooooood...',
  '..dooooooooooooooooooood...',
  '...ddooooooooooooooooodd...',
  '...dodooooooooooooooodod...',
  '....doooooooooooooooodd....',
  '.....doooooooooooooood.....',
  '.....dodddooooooodddod.....',
  '.....dod..ddddddd..dod.....',
  '......d.............d......',
]
// 14줄: 21폭, 눈 4x4·볼·입 무늬는 Usagi 14 와 같고 볼·입이 눈 쪽으로 한 줄 올라간다
const CHIIKAWA_14 = [
  '....dd.........dd....',
  '...dood.......dood...',
  '...doodddddddddood...',
  '..doooooooooooooood..',
  '.doooooooooooooooood.',
  'doooooddoooooddoooood',
  'doooooooooooooooooood',
  'doooooddoooooddoooood',
  'dooooddwdoooddwdooood',
  'dopppdwddooodwddpppod',
  'dpdpdpddoodooddpdpdpd',
  'dpdpdpoodododoopdpdpd',
  'dopppoooododoooopppod',
  '.doooooooooooooooood.',
  '..doooooodddooooood..',
  '..dodddooooooodddod..',
  '..dod..ddddddd..dod..',
  '...d.............d...',
]
// 8줄: 11폭, 눈 2x2, 짧고 둥근 귀
const CHIIKAWA_8 = [
  '.dd.....dd.',
  '.dodddddod.',
  'doooooooood',
  'doddoooddod',
  'doddododdod',
  'dpoododoopd',
  'doooooooood',
  '.doooooood.',
  '..dd...dd..',
]

// 발끝 높이·키보드·앞발·말풍선 자리는 같은 줄 수의 Usagi 와 맞췄다
const CHIIKAWA: Character = {
  name: 'Chiikawa',
  palette: { ...CLAWD_PALETTE, o: 0xfdfcf8, d: 0x3c271c, p: 0xf3c0c5 },
  layouts: {
    22: {
      w: 40, h: 44, art: CHIIKAWA_ART, rx: 5, ry: 11, keys: [3, 36], top: 35, paws: [10, 26], bubbleX: 26,
      eyes: [[8, 9], [16, 9]], snot: { at: [15, 14], max: 2 }, zs: [[32, 18, false], [36, 14, true]],
    },
    20: {
      w: 37, h: 40, art: CHIIKAWA_20, rx: 3, ry: 8, keys: [1, 32], top: 31, paws: [7, 23], bubbleX: 23,
      eyes: [[7, 9], [15, 9]], snot: { at: [14, 14], max: 2 }, zs: [[29, 15, false], [33, 11, true]],
    },
    18: {
      w: 33, h: 36, art: CHIIKAWA_18, rx: 3, ry: 7, keys: [1, 32], top: 27, paws: [7, 23], bubbleX: 23, dots: 3,
      eyes: [[7, 9], [15, 9]], snot: { at: [14, 14], max: 2 }, zs: [[29, 14, false]],
    },
    14: {
      w: 26, h: 28, art: CHIIKAWA_14, rx: 2, ry: 6, keys: [0, 25], top: 21, paws: [5, 16], bubbleX: 20, dots: 3,
      eyes: [[5, 7], [12, 7]], snot: { at: [11, 12], max: 1 }, zs: [[23, 11, false]],
    },
    8: {
      w: 15, h: 16, art: CHIIKAWA_8, rx: 2, ry: 4, keys: [1, 13], top: 12, paws: [3, 8], bubbleX: 12, dots: 1, mini: true,
      eyes: [[2, 3], [7, 3]], zs: [[12, 5, false]],
    },
  },
}

export const CHARACTERS: Readonly<Record<CharacterId, Character>> = { usagi: USAGI, chiikawa: CHIIKAWA }

/** 설정값(캐릭터 id)의 캐릭터, 모르는 값이면 usagi. */
export function characterFor(setting: string): CharacterId {
  return Object.hasOwn(CHARACTERS, setting) ? (setting as CharacterId) : 'usagi'
}
