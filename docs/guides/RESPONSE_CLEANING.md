# 응답 정리 시스템 가이드

## 개요

백엔드에서 반환되는 AI 응답에 프롬프트 지시사항이나 생성 로직이 포함되어 화면에 표시되는 문제를 해결하기 위해 구현된 응답 정리 시스템입니다.

## 주요 기능

### `cleanResponseText(text: string): string`

응답 텍스트에서 프롬프트 지시사항 및 생성 로직을 제거하는 함수입니다.

**특징:**
- 50개 이상의 패턴을 자동으로 제거
- 성능 최적화: 짧은 텍스트 빠른 경로, 프롬프트 마커 사전 검사
- 안전장치: 과도한 제거 방지 로직 포함

**제거되는 패턴:**
- `[출력 형식 지시]`, `[응답 스타일 지시]`, `[품질 검증 지시]` 등 모든 지시사항 섹션
- `[강제]`, `[필수]` 태그
- "답변 생성 로직", "프롬프트 지시" 등의 텍스트
- 백엔드 내부 지시사항 (예: "실무 적용 가능한 세부 항목까지...")

### `extractResponseContent(response: unknown): string`

API 응답에서 답변 텍스트를 추출하고 자동으로 정리합니다.

**특징:**
- 다양한 백엔드 응답 형식 지원
- 자동으로 `cleanResponseText` 적용
- 에러 응답 처리

## 적용 위치

### 1. ChatGPTInterface
- 일반 메시지 전송: 스트리밍/비스트리밍 모두 정리
- 재생성 기능: 스트리밍 중 실시간 정리
- 편집 기능: 스트리밍 중 실시간 정리

### 2. NotebookLLM
- 스트리밍 중 실시간 정리 (`onChunk`)
- 완료 시 최종 정리 (`onComplete`)

### 3. 기타 컴포넌트
- `FileAnalysisChatSystem`: `extractResponseContent` 사용으로 자동 적용
- `UltimateChatGPTInterface`: `extractResponseContent` 사용으로 자동 적용

## 성능 최적화

1. **빠른 경로**: 20자 미만 텍스트는 즉시 반환
2. **사전 검사**: 프롬프트 마커가 없으면 패턴 검사 스킵
3. **배치 업데이트**: 스트리밍 중 `requestAnimationFrame`으로 배치 처리
4. **패턴별 독립 테스트**: 각 패턴을 독립적으로 테스트하여 불필요한 처리 방지

## 입력·메타 문자열 정규화 (`coerceTrimmedString` / `coerceTrimmedEnd`)

전송·검색·파싱·파이프라인 메타 등 **사용자 입력과 API 문자열**은 가능하면 `chatInputUtils`의 다음 API로 통일합니다.

- **`coerceTrimmedString(primary, fallback?)`**: `String` 변환 후 **앞뒤** 공백 제거. `onClick={handler}`로 이벤트 객체가 넘어와도 예외 없이 처리.
- **`coerceTrimmedEnd(primary, fallback?)`**: **뒤쪽** 공백만 제거(`trimEnd`). 앞쪽 들여쓰기·줄바꿈을 남겨야 할 때(예: 구조화 입력 보조).

모듈 내부 파싱·`extractResponseContent` 전처리·스트리밍 폴백 등도 동일 함수를 경유합니다. 원시 `.trim()`은 **`coerceTrimmedString` 구현 한 곳**에만 둡니다.

**보조 트리 `frontend/src`**: 메인과 동일 유틸을 쓰려면 루트에서 `npm run sync:frontend-chat-input-utils` 실행.

상세 모듈 예시는 루트 [AGENTS.md](../../AGENTS.md)의 대화 전송(UI) 절을 참고하세요.

## 사용 예시

```typescript
import { cleanResponseText, extractResponseContent } from '../utils/chatInputUtils';

// 직접 정리
const dirty = '답변입니다.\n\n[출력 형식 지시]\n구조화하세요.';
const clean = cleanResponseText(dirty);
// '답변입니다.'

// API 응답에서 추출 및 정리
const response = await axios.post('/api/chat', { message: '질문' });
const content = extractResponseContent(response);
// 자동으로 프롬프트 지시사항이 제거된 답변
```

## 테스트

단위 테스트는 `src/utils/__tests__/chatInputUtils.test.ts`에 포함되어 있습니다.

## 참고

- 모든 대화 인터페이스에서 일관되게 동작
- 스트리밍 중에도 실시간으로 정리
- 사용자에게는 실제 답변만 표시됨
