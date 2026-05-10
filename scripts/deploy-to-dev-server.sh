#!/usr/bin/env bash
# 개발 서버에 build/ 배포 (rsync 또는 scp)
# 반드시 프로젝트 루트에서 실행하거나, 이 스크립트를 프로젝트 루트에서 호출하세요.
# 환경 변수: DEPLOY_DEV_HOST, DEPLOY_DEV_PATH (.env 또는 export)
# 권장(별도): npm run test:sidebar-context — TESTING_GUIDE.md · 원격 push: docs/PUSH_BLOCK_HANDOFF.md
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

if [ ! -f "package.json" ]; then
  echo "오류: package.json을 찾을 수 없습니다. 프로젝트 루트에서 실행하세요."
  exit 1
fi

# .env 로드 (있으면)
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

DEPLOY_DEV_HOST="${DEPLOY_DEV_HOST:-}"
DEPLOY_DEV_PATH="${DEPLOY_DEV_PATH:-}"

if [ -z "$DEPLOY_DEV_HOST" ] || [ -z "$DEPLOY_DEV_PATH" ]; then
  echo "오류: 개발 서버 배포를 위해 다음 환경 변수를 설정하세요."
  echo "  DEPLOY_DEV_HOST  예: user@dev.example.com"
  echo "  DEPLOY_DEV_PATH  예: /var/www/frontend (원격 경로)"
  echo ""
  echo "  .env 파일에 넣거나:"
  echo "    export DEPLOY_DEV_HOST=user@dev.example.com"
  echo "    export DEPLOY_DEV_PATH=/var/www/frontend"
  echo "  그 다음: npm run deploy:dev"
  exit 1
fi

if [ ! -d "build" ]; then
  echo "build/ 없음. deploy:check로 빌드한 뒤 다시 실행하세요."
  echo "  npm run deploy:check"
  exit 1
fi

echo "=== 개발 서버 배포 ==="
echo "  호스트: $DEPLOY_DEV_HOST"
echo "  경로:   $DEPLOY_DEV_PATH"
echo ""

if command -v rsync &> /dev/null; then
  echo "rsync로 동기화 중..."
  rsync -avz --delete build/ "$DEPLOY_DEV_HOST:$DEPLOY_DEV_PATH/"
  echo "배포 완료 (rsync)."
else
  echo "rsync 없음. scp로 업로드 중..."
  ssh "$DEPLOY_DEV_HOST" "mkdir -p $DEPLOY_DEV_PATH"
  scp -r build/* "$DEPLOY_DEV_HOST:$DEPLOY_DEV_PATH/"
  echo "배포 완료 (scp)."
fi
