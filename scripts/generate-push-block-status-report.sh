#!/usr/bin/env bash
# 상태 리포트. 절차: docs/PUSH_BLOCK_HANDOFF.md · 검증·회귀: TESTING_GUIDE.md · npm run test:sidebar-context
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_PATH="${PROJECT_ROOT}/docs/PUSH_BLOCK_STATUS.md"

BRANCH="$(git -C "${PROJECT_ROOT}" rev-parse --abbrev-ref HEAD)"
LATEST_COMMIT="$(git -C "${PROJECT_ROOT}" log -1 --oneline)"
ORIGIN_URL="$(git -C "${PROJECT_ROOT}" config --get remote.origin.url || echo "N/A")"

SSH_CHECK="$(ssh -T git@github.com 2>&1 || true)"
REMOTE_CHECK="$(git -C "${PROJECT_ROOT}" ls-remote "${ORIGIN_URL}" 2>&1 || true)"

DIAGNOSIS="원격 접근 확인 필요"
if [[ "${REMOTE_CHECK}" == *"Repository not found"* ]]; then
  DIAGNOSIS="저장소 경로 불일치 또는 계정 권한 부족"
elif [[ "${REMOTE_CHECK}" == *"Permission denied"* ]]; then
  DIAGNOSIS="SSH 인증 계정은 있으나 저장소 권한 부족"
elif [[ -z "${REMOTE_CHECK}" ]]; then
  DIAGNOSIS="원격 접근 가능(푸시 가능성 높음)"
fi

cat > "${OUTPUT_PATH}" <<EOF_REPORT
## Push Block Status

- 생성 시각: $(date '+%Y-%m-%d %H:%M:%S %Z')
- 브랜치: \`${BRANCH}\`
- 최신 커밋: \`${LATEST_COMMIT}\`
- origin: \`${ORIGIN_URL}\`

### SSH 확인

\`\`\`
${SSH_CHECK}
\`\`\`

### 원격 가시성 확인

\`\`\`
${REMOTE_CHECK}
\`\`\`

### 자동 진단

- ${DIAGNOSIS}

### 권장 다음 단계

1. 실제 저장소 URL 재확인 (\`https://github.com/<owner>/<repo>\`)
2. 해당 저장소에 인증 계정 write 권한 부여/초대 수락
3. 아래 명령으로 재시도

\`\`\`bash
bash scripts/retry-push-with-diagnostics.sh
\`\`\`
EOF_REPORT

echo "status report generated: ${OUTPUT_PATH}"
