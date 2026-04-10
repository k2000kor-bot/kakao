#!/bin/bash
echo "🚀 프론트엔드 서버 시작 중..."
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
echo "서버가 http://localhost:3000 에서 실행됩니다."
npm start
