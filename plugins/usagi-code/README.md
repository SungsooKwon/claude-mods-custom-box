<h1 align="center">Usagi code</h1>

<p align="center">
  <img src="assets/preview.gif" alt="Usagi thinking, typing at a keyboard while a tool runs, then standing still on a meadow" width="640" />
</p>

<details>
<summary><b>한국어</b></summary>

프롬프트 위 pane 에서 Usagi 가 Claude 가 하는 일을 연기합니다. 도구가 도는 동안 키보드를 치고, 단계 사이엔 생각 말풍선을 띄우고, 사용자 차례면 가만히 기다립니다. 옆에는 지시 순서, 서브에이전트, 진행 상황이 실시간으로 나옵니다.

```
/plugin install usagi-code@claude-mods-custom-box
```

marketplace 를 아직 추가하지 않았다면 [저장소 README 의 설치](../../README.md) 를 먼저 보세요.

## 기능

<table>
<tr>
<td width="50%" valign="middle">

### 무대

도구가 돌면 키보드를 치고, 단계 사이엔 생각 말풍선, 차례가 넘어오면 가만히 서서 기다립니다.

</td>
<td width="50%">
  <img src="assets/preview.gif" alt="Usagi code 무대" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### 화면보호기

자리를 비우면 무대가 90년대 화면보호기로 바뀝니다. 자라는 파이프, 별 사이 비행, 날아다니는 작은 마스코트가 나오고, Claude 가 다시 움직이면 돌아옵니다.

</td>
<td width="50%">
  <img src="assets/screensaver.gif" alt="별 사이 비행과 파이프 화면보호기" width="100%" />
</td>
</tr>
</table>

- **타임라인** — 이번 지시의 순서 트리, 지금 단계와 도구 사슬, 진행 줄(단계 수·완료·실패).
- **서브에이전트** — 띄운 에이전트마다 종류, 맡은 일, 상태, 지금 쓰는 도구.
- **알림 팝업** — 권한 요청이나 질문이 오면 대화창(“Usagi: hey! i need ur OK …”)이 뜨고, 도구가 실패하면 첫 오류 줄을 보여 줍니다.
- **사용량 경고** — 상태 표시줄에 컨텍스트 %, 5시간·주간 한도. 한도에 가까워지면 `/compact` 권유와 리셋 시각을 띄웁니다.
- **2010년대 스킨** — Windows 7, Mac OS X, Ubuntu 테마. OS 에 맞춰 고르거나 직접 지정합니다.
- **무대 크기 조절** — 상태 표시줄의 ▲ ▼ 또는 `/usagi +` / `/usagi -`. 크기는 세션이 바뀌어도 유지됩니다. 기본 22줄에서 그림이 가장 또렷합니다.

> pane 안의 문구는 현재 한국어입니다.

## 사용법

| 명령 | 동작 |
| --- | --- |
| `/usagi` | pane 열기 / 닫기 |
| `/usagi +` · `/usagi -` · `/usagi size <n>` | Usagi 크기(줄 수) 조절 |
| `/usagi theme <windows7 \| macos \| ubuntu>` | 이번 세션의 테마 변경 |

계속 쓸 설정(시작할 때 열기, 화면보호기 분, 테마)은 `/plugin configure usagi-code` 에서 바꿉니다. 터미널 전용입니다.

## 출처

[clockendbader/mascot-studio](https://github.com/clockendbader/mascot-studio) (MIT) 를 옮겨 고쳤습니다. 원작자 저작권 표기는 [LICENSE](LICENSE) 에 함께 있습니다.

</details>

<details open>
<summary><b>English</b></summary>

A pane above the prompt where Usagi acts out what Claude is doing: typing while a tool runs, a thinking bubble between steps, standing by when it's your turn. Beside it are your order, the subagents and live progress.

```
/plugin install usagi-code@claude-mods-custom-box
```

Haven't added the marketplace yet? See [Install in the repository README](../../README.md) first.

## Features

<table>
<tr>
<td width="50%" valign="middle">

### Stage

Types while a tool runs, shows a thinking bubble between steps, and stands by when it's your turn.

</td>
<td width="50%">
  <img src="assets/preview.gif" alt="Usagi code stage" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Screensaver

Walk away and the stage turns into a 90s screensaver (growing pipes, a starfield, tiny flying mascots) until Claude moves again.

</td>
<td width="50%">
  <img src="assets/screensaver.gif" alt="Starfield and pipes screensaver" width="100%" />
</td>
</tr>
</table>

- **Timeline** — the order tree for this turn, the live step with its tool chain, and a progress line (steps, done, failed).
- **Subagents** — each spawned agent with its type, task, state and the tool it is using now.
- **Heads-up popups** — a permission prompt or a question pops a dialog (“Usagi: hey! i need ur OK …”); a failed tool shows its first error line.
- **Usage warnings** — context %, 5-hour and weekly limits in the status bar, with a nudge toward `/compact` and the reset time when you get close.
- **2010s skins** — Windows 7, Mac OS X and Ubuntu themes, picked from your OS or set by hand.
- **Resizable stage** — ▲ ▼ in the status bar, or `/usagi +` / `/usagi -`; the size is kept across sessions. The art is sharpest at the default 22 rows.

> The pane's labels are in Korean for now.

## Usage

| Command | What it does |
| --- | --- |
| `/usagi` | Open or close the pane |
| `/usagi +` · `/usagi -` · `/usagi size <n>` | Resize Usagi (rows) |
| `/usagi theme <windows7 \| macos \| ubuntu>` | Switch the look for this session |

Lasting settings (open on startup, screensaver minutes, theme) live in `/plugin configure usagi-code`. Terminal only.

## Credits

Ported from [clockendbader/mascot-studio](https://github.com/clockendbader/mascot-studio) (MIT). The original author's notice is kept in [LICENSE](LICENSE).

</details>
