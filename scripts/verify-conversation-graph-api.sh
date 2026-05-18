#!/usr/bin/env bash
# 대화 관계도 API 스모크 (main_server 5002)
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${BACKEND_PORT:-5002}"
BASE="http://127.0.0.1:${PORT}"

echo "=== 대화 관계도 API: ${BASE} ==="

code=$(curl -s -o /dev/null -w "%{http_code}" "${BASE}/api/conversations" || echo "000")
if [ "$code" != "200" ]; then
  echo "FAIL GET /api/conversations → HTTP ${code}"
  echo "  npm run restart:backend 후 다시 시도하세요."
  exit 1
fi
echo "OK GET /api/conversations → 200"

payload='{"text":"2026-05-11 10:00:00, 알파 : 찬성합니다\n2026-05-11 10:01:00, 베타 : 반대합니다","name":"smoke","filename":"s.txt"}'
resp=$(curl -s -X POST "${BASE}/api/conversations/upload" -H 'Content-Type: application/json' -d "$payload")
echo "$resp" | python3 -c "import sys,json; j=json.load(sys.stdin); assert j.get('success'), j; print('OK POST /api/conversations/upload →', j['data']['upload_id'])" || {
  echo "FAIL POST upload: $resp"
  exit 1
}

upload_id=$(echo "$resp" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['upload_id'])")
graph=$(curl -s "${BASE}/api/conversations/${upload_id}/relationship-graph")
echo "$graph" | python3 -c "import sys,json; j=json.load(sys.stdin); d=j.get('data') or {}; assert j.get('success') and len(d.get('nodes',[]))>=2, j; print('OK GET relationship-graph → nodes', len(d['nodes']))" || {
  echo "FAIL relationship-graph: $graph"
  exit 1
}

echo "결과: 대화 관계도 API 정상."
