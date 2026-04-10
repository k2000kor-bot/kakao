#!/usr/bin/env bash
# docx 추출용 python-docx 설치. 서버 또는 venv에서 실행하세요.
set -e
cd "$(dirname "$0")/.."
if [[ -n "$VIRTUAL_ENV" ]]; then
  pip install python-docx
  echo "OK: python-docx installed in current venv."
elif [[ -d .venv ]]; then
  .venv/bin/pip install python-docx
  echo "OK: python-docx installed in .venv."
else
  echo "가상환경이 없습니다. 다음 중 하나를 실행하세요:"
  echo "  python3 -m venv .venv && .venv/bin/pip install python-docx"
  echo "  pip install python-docx   # (서버에서 venv 활성화 후)"
  exit 1
fi
