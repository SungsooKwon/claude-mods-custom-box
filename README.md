<h1 align="center">claude-mods-custom-box</h1>

<p align="center">
  <a href="https://github.com/SungsooKwon/claude-mods-custom-box"><img src="https://img.shields.io/github/stars/SungsooKwon/claude-mods-custom-box?style=flat&amp;label=%E2%98%85&amp;color=08C" alt="GitHub stars" /></a>
  <img src="https://img.shields.io/badge/license-MIT-08C?style=flat" alt="License: MIT" />
  <img src="https://img.shields.io/badge/Claude%20Code-mods-D97757?style=flat" alt="Claude Code mods" />
  <img src="https://img.shields.io/badge/terminal-macOS%20%7C%20Windows%20%7C%20Linux-4493F8?style=flat-square" alt="Runs in the Claude Code terminal on macOS, Windows and Linux" />
</p>

<p align="center">
  <img src="docs/assets/usagi-hero.gif" alt="Usagi thinking, typing at a keyboard while a tool runs, then standing still on a meadow" width="640" />
</p>

<details>
<summary><b>한국어</b></summary>

<p align="center">
  <strong>Claude Code 를 살아 움직이게 만드는 작은 mod 모음.</strong><br/>
  marketplace 하나에 mod 여럿 — 마음에 드는 것만 한 줄로 설치합니다.
</p>

<h3 align="center"><a href="#설치"><ins>mod 설치하기</ins></a></h3>


## Mods

<table>
<tr>
<td width="50%" valign="middle">

### Usagi code

프롬프트 위 pane 에서 Usagi 가 Claude 가 하는 일을 연기합니다. 도구가 도는 동안 키보드를 치고, 단계 사이엔 생각 말풍선을 띄우고, 사용자 차례면 가만히 기다립니다. 옆에는 지시 순서, 서브에이전트, 진행 상황이 실시간으로 나옵니다.

`/plugin install usagi-code --marketplace SungsooKwon/claude-mods-custom-box`

[사용법 ↓](#usagi-code-사용법)

</td>
<td width="50%">
  <img src="docs/assets/usagi-hero.gif" alt="Usagi code 무대" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### 화면보호기

자리를 비우면 무대가 90년대 화면보호기로 바뀝니다. 자라는 파이프, 별 사이 비행, 날아다니는 작은 마스코트가 나오고, Claude 가 다시 움직이면 돌아옵니다.

대기 시간(분)은 `/plugin configure usagi-code` 에서 정합니다 (0 이면 끔).

</td>
<td width="50%">
  <img src="docs/assets/usagi-screensaver.gif" alt="별 사이 비행과 파이프 화면보호기" width="100%" />
</td>
</tr>
</table>

**Usagi code 에 더 들어 있는 것:**

- **타임라인** — 이번 지시의 순서 트리, 지금 단계와 도구 사슬, 진행 줄(단계 수·완료·실패).
- **서브에이전트** — 띄운 에이전트마다 종류, 맡은 일, 상태, 지금 쓰는 도구.
- **알림 팝업** — 권한 요청이나 질문이 오면 대화창(“Usagi: hey! i need ur OK …”)이 뜨고, 도구가 실패하면 첫 오류 줄을 보여 줍니다.
- **사용량 경고** — 상태 표시줄에 컨텍스트 %, 5시간·주간 한도. 한도에 가까워지면 `/compact` 권유와 리셋 시각을 띄웁니다.
- **2010년대 스킨** — Windows 7, Mac OS X, Ubuntu 테마. OS 에 맞춰 고르거나 직접 지정합니다.
- **무대 크기 조절** — 상태 표시줄의 ▲ ▼ 또는 `/usagi +` / `/usagi -`. 크기는 세션이 바뀌어도 유지됩니다.

> pane 안의 문구는 현재 한국어입니다.

---

## 설치

Claude Code 터미널 세션의 프롬프트에서:

```
/plugin install usagi-code --marketplace SungsooKwon/claude-mods-custom-box
```

marketplace 추가 질문에 `y`, 범위는 Enter (user). 바로 켜집니다.

_셸에서:_

```bash
claude plugin install usagi-code --marketplace SungsooKwon/claude-mods-custom-box
```

_데스크톱 앱_ (`/plugin` 이 안 되는 곳): 프롬프트 옆 **+** → **Plugins** → **Add marketplace** 에 `SungsooKwon/claude-mods-custom-box` → **Add plugin**.

<a id="usagi-code-사용법"></a>

### Usagi code 사용법

| 명령 | 동작 |
| --- | --- |
| `/usagi` | pane 열기 / 닫기 |
| `/usagi +` · `/usagi -` · `/usagi size <n>` | Usagi 크기(줄 수) 조절 |
| `/usagi theme <windows7 \| macos \| ubuntu>` | 이번 세션의 테마 변경 |

계속 쓸 설정(시작할 때 열기, 화면보호기 분, 테마)은 `/plugin configure usagi-code` 에서 바꿉니다. 터미널 전용입니다.

---

## 커뮤니티 · 지원

- **피드백 · 아이디어:** [이슈 열기](https://github.com/SungsooKwon/claude-mods-custom-box/issues) — 버그, 요청, 보고 싶은 mod.
- **응원하기:** 새 mod 소식을 받으려면 [Star](https://github.com/SungsooKwon/claude-mods-custom-box) 를 눌러 주세요.

---

## 개발

mod 하나는 `plugins/<이름>/` 에 들어가고 `.claude-plugin/marketplace.json` 목록에 올라갑니다.

```bash
scripts/new-mod.sh <mod-name> "한 줄 설명"    # mod 뼈대 생성 + 목록 등록
claude --plugin-dir plugins/<mod-name>        # 그 mod 를 켠 채로 Claude Code 실행
scripts/check.sh [mod-name ...]               # validate + 테스트 (이름이 없으면 전부)
```

새 mod 는 `/plugin install <mod-name> --marketplace SungsooKwon/claude-mods-custom-box` 로 설치됩니다. `new-mod.sh` 는 `jq` 가 필요합니다.

## 출처

Usagi code 는 [clockendbader/mascot-studio](https://github.com/clockendbader/mascot-studio) (MIT) 를 옮겨 고친 것입니다.

## 라이선스

[MIT License](LICENSE) 로 공개합니다. Usagi code 는 원작자 저작권 표기를 [plugins/usagi-code/LICENSE](plugins/usagi-code/LICENSE) 에 함께 둡니다.

</details>

<details open>
<summary><b>English</b></summary>

<p align="center">
  <strong>Small mods that make Claude Code feel alive.</strong><br/>
  One marketplace, many mods — install the ones you like with a single line.
</p>

<h3 align="center"><a href="#install"><ins>Install a mod</ins></a></h3>


## Mods

<table>
<tr>
<td width="50%" valign="middle">

### Usagi code

A pane above the prompt where Usagi acts out what Claude is doing — typing while a tool runs, a thinking bubble between steps, standing by when it's your turn. Beside it: your order, the subagents, and live progress.

`/plugin install usagi-code --marketplace SungsooKwon/claude-mods-custom-box`

[Usage ↓](#usagi-code-usage)

</td>
<td width="50%">
  <img src="docs/assets/usagi-hero.gif" alt="Usagi code stage" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Screensaver

Walk away and the stage turns into a 90s screensaver — growing pipes, a starfield, and tiny flying mascots — until Claude moves again.

Set the idle minutes with `/plugin configure usagi-code` (0 turns it off).

</td>
<td width="50%">
  <img src="docs/assets/usagi-screensaver.gif" alt="Starfield and pipes screensaver" width="100%" />
</td>
</tr>
</table>

**Also in Usagi code:**

- **Timeline** — the order tree for this turn, the live step with its tool chain, and a progress line (steps, done, failed).
- **Subagents** — each spawned agent with its type, task, state and the tool it is using now.
- **Heads-up popups** — a permission prompt or a question pops a dialog (“Usagi: hey! i need ur OK …”); a failed tool shows its first error line.
- **Usage warnings** — context %, 5-hour and weekly limits in the status bar, with a nudge toward `/compact` and the reset time when you get close.
- **2010s skins** — Windows 7, Mac OS X and Ubuntu themes, picked from your OS or set by hand.
- **Resizable stage** — ▲ ▼ in the status bar, or `/usagi +` / `/usagi -`; the size is kept across sessions.

> The pane's labels are in Korean for now.

---

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install usagi-code --marketplace SungsooKwon/claude-mods-custom-box
```

Answer `y` to add the marketplace, then Enter for the user scope. It is active right away.

_Or from a shell:_

```bash
claude plugin install usagi-code --marketplace SungsooKwon/claude-mods-custom-box
```

_In the desktop app_ (where `/plugin` does not run): click **+** next to the prompt box → **Plugins** → **Add marketplace** with `SungsooKwon/claude-mods-custom-box` → **Add plugin**.

<a id="usagi-code-usage"></a>

### Usagi code usage

| Command | What it does |
| --- | --- |
| `/usagi` | Open or close the pane |
| `/usagi +` · `/usagi -` · `/usagi size <n>` | Resize Usagi (rows) |
| `/usagi theme <windows7 \| macos \| ubuntu>` | Switch the look for this session |

Lasting settings — open on startup, screensaver minutes, theme — live in `/plugin configure usagi-code`. Terminal only.

---

## Community &amp; Support

- **Feedback &amp; ideas:** [Open an issue](https://github.com/SungsooKwon/claude-mods-custom-box/issues) — bugs, requests, or a mod you'd like to see.
- **Show support:** [Star](https://github.com/SungsooKwon/claude-mods-custom-box) this repo to follow new mods.

---

## Developing

Each mod lives in `plugins/<name>/` and is listed in `.claude-plugin/marketplace.json`.

```bash
scripts/new-mod.sh <mod-name> "One-line description"   # scaffold a mod and list it
claude --plugin-dir plugins/<mod-name>                  # run Claude Code with it loaded
scripts/check.sh [mod-name ...]                         # validate + test (all mods when no name)
```

A new mod installs with `/plugin install <mod-name> --marketplace SungsooKwon/claude-mods-custom-box`. `new-mod.sh` needs `jq`.

## Credits

Usagi code is ported from [clockendbader/mascot-studio](https://github.com/clockendbader/mascot-studio) (MIT).

## License

Free and open source under the [MIT License](LICENSE). Usagi code keeps the original author's notice in [plugins/usagi-code/LICENSE](plugins/usagi-code/LICENSE).

</details>
