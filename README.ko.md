<h1 align="center">claude-mods-custom-box</h1>

<p align="center">
  <a href="https://github.com/SungsooKwon/claude-mods-custom-box"><img src="https://img.shields.io/github/stars/SungsooKwon/claude-mods-custom-box?style=flat&amp;label=%E2%98%85&amp;color=08C" alt="GitHub stars" /></a>
  <img src="https://img.shields.io/badge/license-MIT-08C?style=flat" alt="License: MIT" />
  <img src="https://img.shields.io/badge/Claude%20Code-mods-D97757?style=flat" alt="Claude Code mods" />
  <img src="https://img.shields.io/badge/terminal-macOS%20%7C%20Windows%20%7C%20Linux-4493F8?style=flat-square" alt="Runs in the Claude Code terminal on macOS, Windows and Linux" />
</p>

<p align="center">
  <sub><a href="README.md">English</a> · 한국어</sub>
</p>

<p align="center">
  <strong>계속 늘어나는 Claude Code mod 상자.</strong><br/>
  mod 하나는 작은 일 하나만 합니다. 원하는 것만 골라 설치하세요.
</p>

## Mods

<!-- mods:start -->
| 미리보기 | mod | 하는 일 |
| --- | --- | --- |
| <img src="plugins/usagi-code/assets/preview.gif" alt="usagi-code" width="200" /> | [**usagi-code**](plugins/usagi-code/README.ko.md) | 프롬프트 위 pane 에서 Usagi 가 Claude 가 하는 일을 연기하고, 지시 순서·서브에이전트·진행 상황을 옆에 보여 줍니다. |
<!-- mods:end -->

새 mod 는 계속 추가됩니다. 각 mod 의 기능과 사용법은 바로 아래에 있습니다.

## usagi-code

프롬프트 위 pane 에서 Usagi 가 Claude 가 하는 일을 연기합니다. 도구가 도는 동안 키보드를 치고, 단계 사이엔 생각 말풍선을 띄우고, 사용자 차례면 가만히 기다립니다. 옆에는 지시 순서, 서브에이전트, 진행 상황이 실시간으로 나옵니다.

```
/plugin install usagi-code@claude-mods-custom-box
```

### 기능

<table>
<tr>
<td width="50%" valign="middle">

#### 무대

도구가 돌면 키보드를 치고, 단계 사이엔 생각 말풍선, 차례가 넘어오면 가만히 서서 기다립니다.

</td>
<td width="50%">
  <img src="plugins/usagi-code/assets/preview.gif" alt="Usagi code 무대" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

#### 화면보호기

자리를 비우면 무대가 90년대 화면보호기로 바뀝니다. 자라는 파이프, 별 사이 비행, 날아다니는 작은 마스코트가 나오고, Claude 가 다시 움직이면 돌아옵니다.

</td>
<td width="50%">
  <img src="plugins/usagi-code/assets/screensaver.gif" alt="별 사이 비행과 파이프 화면보호기" width="100%" />
</td>
</tr>
</table>

- **타임라인** — 이번 지시의 순서 트리, 지금 단계와 도구 사슬, 진행 줄(단계 수·완료·실패).
- **서브에이전트** — 띄운 에이전트마다 종류, 맡은 일, 상태, 지금 쓰는 도구.
- **알림 팝업** — 권한 요청이나 질문이 오면 대화창(“Usagi: hey! i need ur OK …”)이 뜨고, 도구가 실패하면 첫 오류 줄을 보여 줍니다.
- **사용량 경고** — 상태 표시줄에 컨텍스트 %, 5시간·주간 한도. 한도에 가까워지면 `/compact` 권유와 리셋 시각을 띄웁니다.
- **2010년대 스킨** — Windows 7, Mac OS X, Ubuntu 테마. OS 에 맞춰 고르거나 직접 지정합니다.
- **무대 크기 조절** — 상태 표시줄의 ▲ ▼ 또는 `/usagi +` / `/usagi -`. 크기는 세션이 바뀌어도 유지됩니다. 22·20·18줄은 크기마다 손으로 그린 도안입니다.

> pane 안의 문구는 현재 한국어입니다.

### 사용법

| 명령 | 동작 |
| --- | --- |
| `/usagi` | pane 열기 / 닫기 |
| `/usagi +` · `/usagi -` · `/usagi size <n>` | Usagi 크기(줄 수) 조절 |
| `/usagi theme <windows7 \| macos \| ubuntu>` | 이번 세션의 테마 변경 |

> **22·20·18줄이 가장 자연스럽습니다.** 이 세 크기는 손으로 그린 도안을 그대로 쓰고, 다른 크기는 22줄 그림을 줄이거나 늘려서 픽셀이 빠지면 눈 모양이 어색해질 수 있습니다. `/usagi size 22` 로 기본 크기에 돌아옵니다.
>
> 크기별 해상도 차이는 아래 그림과 같습니다(왼쪽부터 생각 중, 키보드 치는 중, 서 있음). 크기를 고를 때 참고하세요.

<p align="center">
  <img src="plugins/usagi-code/assets/sizes.png" alt="22·20·18줄 크기별 Usagi 해상도 비교" width="720" />
</p>

계속 쓸 설정(시작할 때 열기, 화면보호기 분, 테마)은 `/plugin configure usagi-code` 에서 바꿉니다. 터미널 전용입니다.

### 출처

[clockendbader/mascot-studio](https://github.com/clockendbader/mascot-studio) (MIT) 를 옮겨 고쳤습니다. 원작자 저작권 표기는 [LICENSE](plugins/usagi-code/LICENSE) 에 함께 있습니다.

## 설치

marketplace 를 한 번 추가하면, 그 안의 mod 를 이름으로 골라 설치합니다. Claude Code 터미널 세션의 프롬프트에서:

```
/plugin marketplace add SungsooKwon/claude-mods-custom-box
/plugin install <mod>@claude-mods-custom-box
```

새로 올라온 mod 를 받으려면 목록을 갱신합니다:

```
/plugin marketplace update claude-mods-custom-box
```

_한 줄로:_ `/plugin install <mod> --marketplace SungsooKwon/claude-mods-custom-box` (marketplace 추가 질문에 `y`, 범위는 Enter).

_셸에서:_ 위 명령 앞의 `/` 를 `claude ` 로 바꿉니다 (예: `claude plugin install <mod>@claude-mods-custom-box`).

_데스크톱 앱_ (`/plugin` 이 안 되는 곳): 프롬프트 옆 **+** → **Plugins** → **Add marketplace** 에 `SungsooKwon/claude-mods-custom-box` → **Add plugin**.

## mod 만들기

```
plugins/<mod>/               mod 하나 (plugin.json, hooks/, tests/, README.md, assets/)
.claude-plugin/marketplace.json   설치 가능한 mod 목록
scripts/new-mod.sh           새 mod 뼈대 + 목록·README 표 등록
scripts/check.sh             목록·README·폴더 일치 확인 + validate + 테스트
```

```bash
scripts/new-mod.sh <mod-name> "One-line description" "한 줄 설명"
claude --plugin-dir plugins/<mod-name>      # 그 mod 를 켠 채로 Claude Code 실행
scripts/check.sh [mod-name ...]             # 이름이 없으면 전부
```

올리기 전에: mod 의 `README.md` 를 채우고 같은 내용을 이 README 의 Mods 아래 `## <mod>` 절로 넣고, 미리보기를 `plugins/<mod>/assets/preview.gif` 에 두고 README 표의 `—` 를 그 그림으로 바꾸고, `scripts/check.sh` 가 통과하는지 확인합니다. `new-mod.sh` 는 `jq` 가 필요합니다.

## 커뮤니티 · 지원

- **피드백 · 아이디어:** [이슈 열기](https://github.com/SungsooKwon/claude-mods-custom-box/issues) — 버그, 요청, 보고 싶은 mod.
- **응원하기:** 새 mod 소식을 받으려면 [Star](https://github.com/SungsooKwon/claude-mods-custom-box) 를 눌러 주세요.

## 라이선스

[MIT License](LICENSE). 다른 프로젝트에서 옮겨 온 mod 는 원작자 표기를 그 mod 폴더의 `LICENSE` 에 함께 둡니다.
