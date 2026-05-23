#!/usr/bin/env bash
# 로컬 tools/gh/bin/gh 설치 (brew/gh 미설치 환경용)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BIN="$ROOT/tools/gh/bin/gh"

if [[ -x "$BIN" ]]; then
  echo "$BIN"
  exit 0
fi

case "$(uname -s)" in
  Darwin)
    case "$(uname -m)" in
      arm64) GOARCH=macOS_arm64 ;;
      x86_64) GOARCH=macOS_amd64 ;;
      *) echo "FAIL: unsupported macOS arch $(uname -m)" >&2; exit 1 ;;
    esac
    ;;
  Linux)
    case "$(uname -m)" in
      x86_64) GOARCH=linux_amd64 ;;
      aarch64 | arm64) GOARCH=linux_arm64 ;;
      *) echo "FAIL: unsupported Linux arch $(uname -m)" >&2; exit 1 ;;
    esac
    ;;
  *)
    echo "FAIL: unsupported OS $(uname -s)" >&2
    exit 1
    ;;
esac

VER="${GH_CLI_VERSION:-2.67.0}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

curl -fsSL "https://github.com/cli/cli/releases/download/v${VER}/gh_${VER}_${GOARCH}.tar.gz" -o "$TMP/gh.tgz" 2>/dev/null \
  || curl -fsSL "https://github.com/cli/cli/releases/download/v${VER}/gh_${VER}_${GOARCH}.zip" -o "$TMP/gh.zip"

mkdir -p "$ROOT/tools/gh/bin"
if [[ -f "$TMP/gh.tgz" ]]; then
  tar -xzf "$TMP/gh.tgz" -C "$TMP"
  cp "$TMP/gh_${VER}_${GOARCH}/bin/gh" "$BIN"
elif [[ -f "$TMP/gh.zip" ]]; then
  unzip -q "$TMP/gh.zip" -d "$TMP"
  cp "$TMP/gh_${VER}_${GOARCH}/bin/gh" "$BIN"
else
  echo "FAIL: gh download failed" >&2
  exit 1
fi

chmod +x "$BIN"
echo "$BIN"
