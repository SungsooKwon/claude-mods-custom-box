<h1 align="center">claude-mods-custom-box</h1>

<p align="center">
  <a href="https://github.com/SungsooKwon/claude-mods-custom-box"><img src="https://img.shields.io/github/stars/SungsooKwon/claude-mods-custom-box?style=flat&amp;label=%E2%98%85&amp;color=08C" alt="GitHub stars" /></a>
  <img src="https://img.shields.io/badge/license-MIT-08C?style=flat" alt="License: MIT" />
  <img src="https://img.shields.io/badge/Claude%20Code-mods-D97757?style=flat" alt="Claude Code mods" />
  <img src="https://img.shields.io/badge/terminal-macOS%20%7C%20Windows%20%7C%20Linux-4493F8?style=flat-square" alt="Runs in the Claude Code terminal on macOS, Windows and Linux" />
</p>

<details>
<summary><b>한국어</b></summary>

<p align="center">
  <strong>계속 늘어나는 Claude Code mod 상자.</strong><br/>
  mod 하나는 작은 일 하나만 합니다. 원하는 것만 골라 설치하세요.
</p>

## Mods

<!-- mods:ko:start -->
| 미리보기 | mod | 하는 일 |
| --- | --- | --- |
| <img src="plugins/usagi-code/assets/preview.gif" alt="usagi-code" width="200" /> | [**usagi-code**](plugins/usagi-code) | 프롬프트 위 pane 에서 Usagi 가 Claude 가 하는 일을 연기하고, 지시 순서·서브에이전트·진행 상황을 옆에 보여 줍니다. |
<!-- mods:ko:end -->

새 mod 는 계속 추가됩니다. 각 mod 의 이름을 누르면 기능과 사용법이 나옵니다.

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

올리기 전에: mod 의 `README.md` 를 채우고, 미리보기를 `plugins/<mod>/assets/preview.gif` 에 두고 README 표의 `—` 를 그 그림으로 바꾸고, `scripts/check.sh` 가 통과하는지 확인합니다. `new-mod.sh` 는 `jq` 가 필요합니다.

## 커뮤니티 · 지원

- **피드백 · 아이디어:** [이슈 열기](https://github.com/SungsooKwon/claude-mods-custom-box/issues) — 버그, 요청, 보고 싶은 mod.
- **응원하기:** 새 mod 소식을 받으려면 [Star](https://github.com/SungsooKwon/claude-mods-custom-box) 를 눌러 주세요.

## 라이선스

[MIT License](LICENSE). 다른 프로젝트에서 옮겨 온 mod 는 원작자 표기를 그 mod 폴더의 `LICENSE` 에 함께 둡니다.

</details>

<details open>
<summary><b>English</b></summary>

<p align="center">
  <strong>A growing box of Claude Code mods.</strong><br/>
  Each mod does one small thing. Install only the ones you want.
</p>

## Mods

<!-- mods:en:start -->
| Preview | Mod | What it does |
| --- | --- | --- |
| <img src="plugins/usagi-code/assets/preview.gif" alt="usagi-code" width="200" /> | [**usagi-code**](plugins/usagi-code) | Usagi acts out what Claude is doing in a pane above the prompt, with the order, subagents and progress beside it. |
<!-- mods:en:end -->

More mods are on the way. Click a mod's name for its features and usage.

## Install

Add the marketplace once, then install any mod in it by name. At the prompt of a Claude Code terminal session:

```
/plugin marketplace add SungsooKwon/claude-mods-custom-box
/plugin install <mod>@claude-mods-custom-box
```

To pick up newly added mods, refresh the list:

```
/plugin marketplace update claude-mods-custom-box
```

_In one line:_ `/plugin install <mod> --marketplace SungsooKwon/claude-mods-custom-box` (answer `y` to add the marketplace, then Enter for the user scope).

_From a shell:_ replace the leading `/` with `claude ` (e.g. `claude plugin install <mod>@claude-mods-custom-box`).

_In the desktop app_ (where `/plugin` does not run): click **+** next to the prompt box → **Plugins** → **Add marketplace** with `SungsooKwon/claude-mods-custom-box` → **Add plugin**.

## Making a mod

```
plugins/<mod>/                    one mod (plugin.json, hooks/, tests/, README.md, assets/)
.claude-plugin/marketplace.json   the list of installable mods
scripts/new-mod.sh                scaffold a mod and list it in the marketplace and README tables
scripts/check.sh                  check list, README and folders agree, then validate and test
```

```bash
scripts/new-mod.sh <mod-name> "One-line description" "한 줄 설명"
claude --plugin-dir plugins/<mod-name>      # run Claude Code with it loaded
scripts/check.sh [mod-name ...]             # all mods when no name
```

Before you push: fill in the mod's `README.md`, put a preview at `plugins/<mod>/assets/preview.gif` and swap the `—` in the README tables for it, and make sure `scripts/check.sh` passes. `new-mod.sh` needs `jq`.

## Community &amp; Support

- **Feedback &amp; ideas:** [Open an issue](https://github.com/SungsooKwon/claude-mods-custom-box/issues) — bugs, requests, or a mod you'd like to see.
- **Show support:** [Star](https://github.com/SungsooKwon/claude-mods-custom-box) this repo to follow new mods.

## License

[MIT License](LICENSE). A mod ported from another project keeps the original author's notice in its own folder's `LICENSE`.

</details>
