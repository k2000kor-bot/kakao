#!/usr/bin/env bash
# 프론트엔드 정적 배포 (Vercel/Netlify용)
# deploy:check 실행 후, Vercel CLI가 있으면 vercel --prod 실행 가능 안내
# 반드시 프로젝트 루트에서 실행하거나, 이 스크립트를 프로젝트 루트에서 호출하세요.
# 권장(별도): npm run test:sidebar-context — TESTING_GUIDE.md · 원격 push: docs/PUSH_BLOCK_HANDOFF.md
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

if [ ! -f "package.json" ]; then
  echo "오류: package.json을 찾을 수 없습니다. 프로젝트 루트에서 실행하세요."
  echo "  예: cd $(dirname "$PROJECT_ROOT" 2>/dev/null || echo 'kakao-frontend/kakao-frontend') && npm run deploy:static"
  exit 1
fi

echo "=== 1. 배포 전 검증 (deploy:check) ==="
npm run deploy:check

echo ""
echo "=== 2. 실제 배포 ==="
echo "build/ 가 준비되었습니다. 다음 중 하나로 배포하세요:"
echo ""
echo "  [Vercel]"
echo "    • 대시보드: https://vercel.com → Add New Project → 이 저장소 연결 → REACT_APP_API_URL 설정 → Deploy"
echo "    • CLI: npm i -g vercel && vercel --prod  (프로젝트 연결 후)"
echo ""
echo "  [Netlify]"
echo "    • 대시보드: https://netlify.com → Add new site → Import project → REACT_APP_API_URL 설정 → Deploy"
echo ""
echo "  상세 절차: docs/FRONTEND_DEPLOYMENT.md §4.4"
echo ""
if command -v vercel &> /dev/null; then
  echo "  (Vercel CLI가 설치되어 있으므로, 배포 시: vercel --prod)"
fi
