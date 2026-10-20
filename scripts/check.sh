#!/usr/bin/env bash
# marketplace 와 mod 들을 validate 하고, tests/ 가 있는 mod 는 테스트까지 돌린다.
# 사용: scripts/check.sh [mod-name ...]   (이름이 없으면 전부)
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"
claude plugin validate .

mods=("$@")
[[ ${#mods[@]} -gt 0 ]] || mods=($(ls plugins))
for m in "${mods[@]}"; do
  echo "== $m"
  claude plugin validate "plugins/$m"
  if [[ -d "plugins/$m/tests" ]] && ls "plugins/$m/tests"/*.test.* >/dev/null 2>&1; then
    claude plugin test "plugins/$m"
  fi
done
