#!/usr/bin/env bash
# 새 mod 뼈대를 plugins/<이름>/ 에 만들고 marketplace 목록에 추가한다.
# 사용: scripts/new-mod.sh <mod-name> ["한 줄 설명"]
set -euo pipefail

name="${1:?usage: scripts/new-mod.sh <mod-name> [\"description\"]}"
desc="${2:-$name}"
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

m="$root/.claude-plugin/marketplace.json"
jq --arg n "$name" --arg d "$desc" \
  '.plugins += [{name: $n, source: ("./plugins/" + $n), description: $d}]' "$m" > "$m.tmp"
mv "$m.tmp" "$m"

echo "created plugins/$name"
echo "develop: claude --plugin-dir plugins/$name"
echo "check:   scripts/check.sh $name"
