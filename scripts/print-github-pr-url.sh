#!/usr/bin/env bash
# push 후 GitHub PR 생성 URL 출력 (본문은 PR_COMPOSER_GRAPH_DRAFT.md)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

OWNER="${GITHUB_OWNER:-k2000kor}"
REPO="${GITHUB_REPO:-kakao}"
BASE="${PR_BASE_BRANCH:-main}"
HEAD="${PR_HEAD_BRANCH:-dev-continue-2026-01-20}"
SHORT="$(git rev-parse --short HEAD 2>/dev/null || echo '?')"

echo "HEAD: ${SHORT}"
echo "Compare: https://github.com/${OWNER}/${REPO}/compare/${BASE}...${HEAD}?expand=1"
echo ""
echo "PR 본문: npm run pr:composer-graph-body"
echo "  또는 docs/PR_COMPOSER_GRAPH_DRAFT.md"
