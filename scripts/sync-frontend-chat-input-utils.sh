#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
cp src/utils/chatInputUtils.ts frontend/src/utils/chatInputUtils.ts
echo "synced src/utils/chatInputUtils.ts -> frontend/src/utils/chatInputUtils.ts"
npm run pretest
