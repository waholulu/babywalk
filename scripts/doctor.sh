#!/usr/bin/env bash
set -u

printf 'SproutScout developer prerequisite check\n'
printf 'This script does not install or modify anything.\n\n'

failed=0

check_command() {
  local name="$1"
  local required="${2:-required}"
  if ! command -v "$name" >/dev/null 2>&1; then
    if [ "$required" = "required" ]; then
      printf '[MISSING] %s\n' "$name"
      failed=1
    else
      printf '[OPTIONAL MISSING] %s\n' "$name"
    fi
    return
  fi
  local version
  version="$($name --version 2>&1 | head -n 1 || true)"
  printf '[OK] %s - %s\n' "$name" "$version"
}

check_command git
check_command node
check_command npm
check_command npx
check_command docker optional
check_command adb optional
check_command eas optional

printf '\nSystem: %s\n' "$(uname -a)"

if command -v docker >/dev/null 2>&1; then
  if docker info >/dev/null 2>&1; then
    printf '[OK] Docker engine is running\n'
  else
    printf '[WARNING] Docker command exists but engine is not running\n'
  fi
fi

printf '\nManual items to record in PROJECT_STATE.md:\n'
printf '%s\n' '- Primary physical iOS or Android test device'
printf '%s\n' '- GitHub repository status'
printf '%s\n' '- Expo account status'

if [ "$failed" -ne 0 ]; then
  printf '\nRequired prerequisites are missing. Record the output before installing tools.\n'
  exit 1
fi

printf '\nRequired command checks passed.\n'
