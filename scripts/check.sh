#!/usr/bin/env bash
# plugins/ 폴더·marketplace 목록·README 표가 서로 맞는지 보고, mod 들을 validate·테스트한다.
# 사용: scripts/check.sh [mod-name ...]   (이름이 없으면 전부)
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"
claude plugin validate .

listed="$(jq -r '.plugins[].name' .claude-plugin/marketplace.json | sort)"
folders="$(ls plugins | sort)"
[[ "$listed" == "$folders" ]] || { echo "marketplace.json and plugins/ differ:"; diff <(echo "$listed") <(echo "$folders"); exit 1; }
for m in $folders; do
  for f in README.md README.ko.md; do
    [[ "$(grep -c "^|.*](plugins/$m[)/]" $f)" -eq 1 ]] || { echo "$f table needs one row for $m" >&2; exit 1; }
    [[ -f "plugins/$m/$f" ]] || { echo "missing plugins/$m/$f" >&2; exit 1; }
  done
done

mods=("$@")
[[ ${#mods[@]} -gt 0 ]] || mods=($folders)
for m in "${mods[@]}"; do
  echo "== $m"
  claude plugin validate "plugins/$m"
  if ls "plugins/$m/tests"/*.test.* >/dev/null 2>&1; then
    claude plugin test "plugins/$m"
  fi
done
