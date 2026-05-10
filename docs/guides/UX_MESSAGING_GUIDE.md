# UX 메시징 가이드 (로딩·에러·토스트)

프론트엔드에서 로딩·에러·토스트 문구를 일관되게 사용하기 위한 참고 문서입니다.

**프론트 회귀·원격 push**: [TESTING_GUIDE.md](../../TESTING_GUIDE.md) — **`npm run test:sidebar-context`**. [PUSH_BLOCK_HANDOFF.md](../PUSH_BLOCK_HANDOFF.md).

## 1. 로딩 상태

| 위치 | 문구 | 비고 |
|------|------|------|
| 대화 답변 대기(비스트리밍) | `생각 중...` | assistant 메시지 placeholder |
| 대화 입력 푸터/전송 버튼 툴팁 | `생각 중` | isLoading 시 |
| 스트리밍 중 푸터 | `스트리밍 중... (N초) — Esc로 중지` | streamingElapsedSec 표시 |

**규칙**: 응답 대기 시 "생각 중" 사용. 스트리밍은 "스트리밍 중"으로 구분.

## 2. 에러 UI

### ErrorBoundary (전역 폴백)

- **제목**: `오류가 발생했습니다`
- **본문**: `getUserFriendlyError()`의 `userMessage` (네트워크/타임아웃/서버/클라이언트/알 수 없는 오류)
- **버튼**: 홈으로 돌아가기 · 다시 시도 · 페이지 새로고침
- **해결 방법**: suggestions 목록 + "문제가 계속되면 다음을 시도해보세요"

참고: `src/utils/errorMessages.ts` — `getUserFriendlyError()`, `getErrorIcon()`.

### API/비동기 실패

- 사용자에게는 **토스트** 또는 **인라인 메시지**로 안내
- `errorLogger.error()`로 로깅 후 `showToast(메시지, 'error')` 권장

## 3. 토스트 (showToast)

- **성공**: `showToast('저장되었습니다', 'success')` — 완료·저장·삭제·복사 등
- **에러**: `showToast('작업에 실패했습니다.', 'error')` — 기본 type이 `'error'`이므로 생략 가능
- **안내**: `showToast('조건을 확인해 주세요.', 'info')` — 유효성·제한·준비 중 등

**규칙**: 문장 끝은 "~습니다" 또는 "~세요"로 통일. 새 기능 준비 중은 "~은 준비 중입니다." 사용.

## 4. 관련 파일

- 로딩 문구: `src/components/ChatGPTInterface.tsx` (placeholder, title, 푸터)
- 에러 메시지: `src/utils/errorMessages.ts`, `src/components/ErrorBoundary.tsx`
- 토스트: `src/utils/toast.ts`, `showToast(message, type?)`
