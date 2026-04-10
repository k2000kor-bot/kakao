# Chat 컴포넌트

대화 메시지 렌더링용 컴포넌트(ChatMessage 스택).

## 구성

| 컴포넌트 | 용도 |
|----------|------|
| **ChatMessage** | 메시지 래퍼 (역할·강조·편집 모드) |
| **MessageContent** | 메시지 본문 렌더링 |
| **MessageActions** | 복사·재생성·편집·좋아요 등 액션 버튼 |
| **MessageEditForm** | 편집 폼 |
| **MessageBubble** | 메시지 버블(별도 사용처) |
| **MessageReactions** | 반응 UI |

## 사용처

- **ChatView** — ChatMessage·MessageContent·MessageActions 사용
- **components/MessageItem** — components/MessageActions 사용 (Chat/MessageActions와 별도)
- **components/MessageBubble** — Chat 폴더 외 독립 사용

ChatGPTInterface는 자체 메시지 렌더링 사용. 상세: [docs/COMPONENT_ARCHITECTURE.md](../../../docs/COMPONENT_ARCHITECTURE.md) §2.

## 입력 정규화

전송·검색 등 사용자 문자열은 상위 화면에서 **`chatInputUtils.coerceTrimmedString`** / **`coerceTrimmedEnd`** 로 통일합니다. 이 폴더의 편집 저장 등도 동일 패턴 권장 — [utils/README.md](../../utils/README.md), [guides/RESPONSE_CLEANING.md](../../../docs/guides/RESPONSE_CLEANING.md).
