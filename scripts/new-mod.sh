#!/usr/bin/env bash
# 새 mod 뼈대를 plugins/<이름>/ 에 만들고 marketplace 목록과 README 표에 올린다.
# 사용: scripts/new-mod.sh <mod-name> ["English description"] ["한국어 설명"]
set -euo pipefail

name="${1:?usage: scripts/new-mod.sh <mod-name> [\"description\"] [\"한국어 설명\"]}"
desc="${2:-$name}"
desc_ko="${3:-$desc}"
[[ "$name" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]] || { echo "mod name must be kebab-case: $name" >&2; exit 1; }

root="$(cd "$(dirname "$0")/.." && pwd)"
dir="$root/plugins/$name"
[[ -e "$dir" ]] && { echo "already exists: plugins/$name" >&2; exit 1; }

mkdir -p "$dir/.claude-plugin" "$dir/hooks" "$dir/tests"
jq -n --arg n "$name" --arg d "$desc" \
  '{name: $n, version: "0.1.0", description: $d, author: {name: "SungsooKwon"}, license: "MIT"}' \
  > "$dir/.claude-plugin/plugin.json"
echo '{ "modules": ["./register.tsx"] }' > "$dir/hooks/hooks.json"
echo '{ "extends": "./.claude-plugin/types/tsconfig.json" }' > "$dir/tsconfig.json"
cat > "$dir/hooks/register.tsx" <<TSX
import type { Register } from 'claude-code'

export const register: Register = on => {
  on('session.start', async (\$, e, next) => {
    await \$.command.register({ name: '$name', description: '$desc' })
    return next(e)
  })

  on('command.run', { command: '$name' }, async () => ({ text: '$name is installed.' }))
}
TSX
switch() { printf '<p align="center">\n  <sub>%s</sub>\n</p>' "$1"; }
cat > "$dir/README.md" <<MD
<h1 align="center">$name</h1>

$(switch 'English · <a href="README.ko.md">한국어</a>')

$desc

\`\`\`
/plugin install $name@claude-mods-custom-box
\`\`\`

## Usage

| Command | What it does |
| --- | --- |
| \`/$name\` | |
MD
cat > "$dir/README.ko.md" <<MD
<h1 align="center">$name</h1>

$(switch '<a href="README.md">English</a> · 한국어')

$desc_ko

\`\`\`
/plugin install $name@claude-mods-custom-box
\`\`\`

## 사용법

| 명령 | 동작 |
| --- | --- |
| \`/$name\` | |
MD

m="$root/.claude-plugin/marketplace.json"
jq --arg n "$name" --arg d "$desc" \
  '.plugins += [{name: $n, source: ("./plugins/" + $n), description: $d}]' "$m" > "$m.tmp"
mv "$m.tmp" "$m"

# 두 README 표의 끝 표시 바로 위에 한 줄씩 (미리보기는 그림을 넣기 전까지 —)
add_row() {
  ROW="$(printf '| — | [**%s**](plugins/%s%s) | %s |' "$name" "$name" "$2" "$3")" awk '
    /<!-- mods:end -->/ { print ENVIRON["ROW"] }
    { print }' "$1" > "$1.tmp"
  mv "$1.tmp" "$1"
}
add_row "$root/README.md" "" "$desc"
add_row "$root/README.ko.md" "/README.ko.md" "$desc_ko"

echo "created plugins/$name"
echo "develop: claude --plugin-dir plugins/$name"
echo "check:   scripts/check.sh $name"
