# Hooks

## 주요 훅

| 훅 | 용도 |
|------|------|
| **useApiStatus** | API 상태(ok·ttsSpeech)·에러·refetch |
| **useChatManagement** | 대화·메시지·편집·재생성·대화 전환 (편집 저장·전송 문자열은 **`chatInputUtils.coerceTrimmedString`** 권장) |
| **useKeyboardShortcuts** | ⌘N·⌘?·⌘F 등 단축키 |
| **useDebounce** / **useThrottle** | 디바운스·스로틀 |
| **useResponsive** | 반응형 breakpoint |
| **useDarkMode** | 테마(다크/라이트) |

## 기타

- usePWA, useServiceWorker, useOfflineStatus — PWA·오프라인
- useMessageVirtualization, useOptimizedMessages — 메시지 성능
- useConfirmDialog, useLoadingState — UI 상태

상세: [docs/COMPONENT_ARCHITECTURE.md](../../docs/COMPONENT_ARCHITECTURE.md). 스토어: `src/store/README.md`. 입력 정규화: [utils/chatInputUtils.ts](../utils/chatInputUtils.ts), [docs/guides/RESPONSE_CLEANING.md](../../docs/guides/RESPONSE_CLEANING.md).
