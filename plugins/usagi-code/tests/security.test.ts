import { test, expect, describe } from 'claude-code/testing'
import { firstLine, targetOf } from '../hooks/activity'
import { needsYouText, notifiedText } from '../hooks/alerts'
import { plainText } from '../hooks/text'
import { themeFor } from '../hooks/themes'
import { answerEngine } from './harness'

const ESC = '\u001b'
const BEL = '\u0007'

describe('plainText keeps outside text from steering the terminal', () => {
  test('drops colour codes and other CSI sequences', () => {
    expect(plainText(`${ESC}[31mnpm ERR!${ESC}[0m 3 failed`)).toBe('npm ERR! 3 failed')
    expect(plainText(`a${ESC}[2J${ESC}[1;1Hb`)).toBe('ab')
    expect(plainText('a\u009b31mb')).toBe('ab')
  })

  test('drops OSC sequences, ended by BEL or ST', () => {
    expect(plainText(`copy ${ESC}]52;c;SGVsbG8=${BEL}done`)).toBe('copy done')
    expect(plainText(`${ESC}]8;;https://x.example${ESC}\\link${ESC}]8;;${ESC}\\`)).toBe('link')
    expect(plainText(`${ESC}]0;title`)).toBe('')
  })

  test('drops other controls and bidi overrides, keeps a tab as a space', () => {
    expect(plainText(`a${BEL}b\u0000c\u007fd\u0085e`)).toBe('abcde')
    expect(plainText('a\tb\rc')).toBe('a bc')
    expect(plainText('safe\u202eexe.txt\u2066')).toBe('safeexe.txt')
    expect(plainText(`${ESC}c${ESC}7x`)).toBe('x')
  })

  test('leaves ordinary text alone', () => {
    expect(plainText('Beyoncé · 日本語 🎵 — ok')).toBe('Beyoncé · 日本語 🎵 — ok')
  })
})

describe('text from tools reaches the pane plain', () => {
  test('a failure line and a tool target', () => {
    expect(firstLine(`${ESC}[31mnpm ERR!${ESC}[0m boom\nmore`)).toBe('npm ERR! boom')
    expect(targetOf({ command: `echo ${ESC}]52;c;SGVsbG8=${BEL}hi` })).toBe('echo hi')
  })

  test('the instant messages', () => {
    expect(needsYouText(`Ba${ESC}[2Jsh`, `rm ${ESC}[31m-rf${BEL}`)).not.toMatch(/[\u0000-\u001f]/)
    expect(notifiedText(`needs ${ESC}]0;x${BEL}you`)).toContain('needs you')
  })
})

describe('names from outside never reach the prototype', () => {
  test('a theme setting', () => {
    expect(themeFor('constructor', 'windows').name).toBe('windows7')
    expect(themeFor('__proto__', 'macos').name).toBe('macos')
  })

  test('/usagi words', async ($, on) => {
    answerEngine(on)
    await $.session.start({ cwd: '/work/my-project' } as never)
    for (const word of ['constructor', 'toString', '__proto__', 'hasOwnProperty']) {
      expect(await $.command.run({ command: 'usagi', args: word } as never)).toMatchObject({ text: expect.stringContaining('Try /usagi') })
    }
    expect(await $.command.run({ command: 'usagi', args: 'theme constructor' } as never)).toMatchObject({
      text: 'Themes: windows7, macos, ubuntu. To keep one, set Theme with /plugin configure.',
    })
  })
})

test('the pane title keeps only the folder name, plain', async ($, on) => {
  const { rec } = answerEngine(on)
  await $.session.start({ cwd: `/work/${ESC}]0;pwned${BEL}proj` } as never)
  expect(rec.titles).toEqual(['Usagi code · proj'])
})

