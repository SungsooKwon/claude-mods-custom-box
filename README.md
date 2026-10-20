# claude-mods-custom-box

Claude Code 용 mod 모음입니다. 저장소 하나가 marketplace 이고, mod 는 `plugins/` 아래에 하나씩 들어갑니다.

| mod | 설명 |
| --- | --- |
| [usagi-code](plugins/usagi-code) | 프롬프트 위 pane 에서 Usagi 가 Claude 가 하는 일을 연기하고, 지시 순서·서브에이전트·진행 상황을 옆에 보여 줍니다. [clockendbader/mascot-studio](https://github.com/clockendbader/mascot-studio) (MIT) 를 옮겨 고쳤습니다. |

## 설치

터미널의 Claude Code 프롬프트에서:

```
/plugin install usagi-code --marketplace SungsooKwon/claude-mods-custom-box
```

`Add marketplace?` 에 `y`, 범위는 Enter (user). 옵션 화면이 나오면 설정하고 넘어가면 바로 켜집니다.

셸에서:

```
claude plugin install usagi-code --marketplace SungsooKwon/claude-mods-custom-box
```

데스크톱 앱(`/plugin` 이 안 되는 곳): 프롬프트 옆 + → Plugins → Add marketplace 에 `SungsooKwon/claude-mods-custom-box` → Add plugin.

## usagi-code 사용법

| 명령 | 동작 |
| --- | --- |
| `/usagi` | pane 열기 / 닫기 |
| `/usagi +` · `/usagi -` · `/usagi size <n>` | Usagi 크기(줄 수) 조절 |
| `/usagi theme <windows7 \| macos \| ubuntu>` | 이번 세션의 테마 변경 |

계속 쓸 설정(시작할 때 열기, 화면보호기 분, 테마)은 `/plugin configure usagi-code` 로 바꿉니다. 터미널 전용입니다.

## mod 추가하기

```
scripts/new-mod.sh <mod-name> "한 줄 설명"   # plugins/<mod-name>/ 뼈대 + marketplace 등록
claude --plugin-dir plugins/<mod-name>      # 그 mod 를 켠 채로 Claude Code 실행
scripts/check.sh [mod-name ...]             # validate + 테스트 (이름이 없으면 전부)
```

새 mod 의 설치 명령은 `/plugin install <mod-name> --marketplace SungsooKwon/claude-mods-custom-box` 입니다. `new-mod.sh` 는 `jq` 를 씁니다.

## 라이선스

MIT. usagi-code 는 원작자 저작권 표기를 [plugins/usagi-code/LICENSE](plugins/usagi-code/LICENSE) 에 함께 둡니다.
