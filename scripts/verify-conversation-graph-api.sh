#!/usr/bin/env bash
# 대화 관계도 API 스모크 (main_server 5002)
# - 업로드·relationship-graph
# - conversation_graph_analysis 맥락 POST /api/chat (enhanced, 다중요청·일반 채팅 회피)
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${BACKEND_PORT:-5002}"
BASE="http://127.0.0.1:${PORT}"
CHAT_TIMEOUT="${CONVERSATION_GRAPH_CHAT_SMOKE_TIMEOUT:-120}"

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

echo ""
echo "--- 관계도 답변 생성 (POST /api/chat, enhanced) ---"
chat_payload=$(python3 <<'PY'
import json

print(
    json.dumps(
        {
            "message": "대화 관계도를 작성해 주세요.",
            "quality": "enhanced",
            "context": {
                "conversation_graph_analysis": True,
                "multi_request_mode": False,
                "input_intent_hint": "conversation_graph_create",
                "conversation_graph_has_data": True,
                "conversation_graph_snapshot": (
                    "참여자: 알파(동조, 1발화), 베타(반대, 1발화)\n"
                    "연결: 알파→베타 동조"
                ),
                "answer_quality_instruction": (
                    "참여자 표·연결 표·Mermaid flowchart TB를 출력하세요."
                ),
            },
        },
        ensure_ascii=False,
    )
)
PY
)
chat_resp=$(curl -s --max-time "${CHAT_TIMEOUT}" -X POST "${BASE}/api/chat" \
  -H 'Content-Type: application/json' \
  -d "$chat_payload")
echo "$chat_resp" | python3 -c "
import sys, json

j = json.load(sys.stdin)

def collect_text(o):
    if isinstance(o, str):
        return o
    if isinstance(o, dict):
        parts = []
        for k in ('response', 'content', 'message'):
            if k in o:
                parts.append(collect_text(o[k]))
        if 'data' in o:
            parts.append(collect_text(o['data']))
        return '\n'.join(p for p in parts if p)
    return ''

text = collect_text(j)
if not text.strip():
    raise SystemExit(f'FAIL: empty chat response: {str(j)[:500]}')
if '[다중 요청]' in text:
    raise SystemExit('FAIL: response contains [다중 요청]')
low = text.lower()
if 'mermaid' not in low and 'flowchart' not in low and '참여자' not in text:
    raise SystemExit(f'FAIL: expected graph answer (mermaid/참여자), got: {text[:400]!r}')
if '더 정확한 답변을 위해' in text and 'mermaid' not in low:
    raise SystemExit('FAIL: generic chat fallback instead of graph answer')
print('OK POST /api/chat (conversation_graph_analysis) → graph-style answer')
" || {
  echo "FAIL POST /api/chat: ${chat_resp}"
  exit 1
}

echo ""
echo "결과: 대화 관계도 API·답변 생성 스모크 정상."
