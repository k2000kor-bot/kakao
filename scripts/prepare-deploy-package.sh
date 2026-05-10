#!/usr/bin/env bash
# build/를 zip으로 묶어 수동 업로드용 패키지 생성
# 프로젝트 루트에서 실행: bash scripts/prepare-deploy-package.sh
# 권장(별도): npm run test:sidebar-context — TESTING_GUIDE.md · 원격 push: docs/PUSH_BLOCK_HANDOFF.md
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

if [ ! -d "build" ]; then
  echo "build/ 없음. 먼저 npm run deploy:check 를 실행하세요."
  exit 1
fi

OUT_DIR="${PROJECT_ROOT}/deploy-package"
ZIP_NAME="corbu-frontend-$(date +%Y%m%d-%H%M).zip"
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"
cp -r build "$OUT_DIR/"
cat > "$OUT_DIR/SERVER_DEPLOY_README.txt" << 'EOF'
서버 반영 방법
================

1. 이 폴더의 build/ 내용 전체를 서버 웹 문서 루트에 업로드하세요.
   (예: /var/www/frontend, nginx root 경로)

2. 웹 서버에서 SPA 폴백 설정:
   try_files $uri $uri/ /index.html;

3. API 주소: 빌드 시 REACT_APP_API_URL 로 설정됨.
   서버 API가 다른 주소면 해당 값으로 다시 빌드 후 업로드.

자동 배포(rsync/scp)를 쓰려면 프로젝트 루트 .env 에
DEPLOY_DEV_HOST, DEPLOY_DEV_PATH 를 설정한 뒤
npm run deploy:dev 를 실행하세요.
EOF
cd "$OUT_DIR"
zip -r "$ZIP_NAME" build SERVER_DEPLOY_README.txt
cd "$PROJECT_ROOT"
echo "배포 패키지 생성됨: deploy-package/$ZIP_NAME"
echo "  - build/ 내용 + SERVER_DEPLOY_README.txt"
echo "  서버에 업로드한 뒤 build/ 안의 파일들을 문서 루트에 풀어두면 됩니다."
