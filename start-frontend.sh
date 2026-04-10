#!/usr/bin/env bash
# 프로젝트 폴더로 이동 후 프론트엔드 실행 (어디서 실행해도 동작)
cd "$(dirname "$0")"
echo "프로젝트 폴더: $(pwd)"
echo "프론트엔드 시작 (포트 3000)..."
echo "접속: http://localhost:3000"
echo ""
exec npm start
