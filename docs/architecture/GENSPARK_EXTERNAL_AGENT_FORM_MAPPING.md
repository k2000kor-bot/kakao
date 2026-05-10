# Genspark 외부 에이전트 폼 ↔ 레포 매핑

**참조 URL(사용자 제공)**  
`https://www.genspark.ai/agents?id=eb7747f5-0399-48ff-b436-68a0a23365c9`

해당 페이지는 Cloudflare 보호 등으로 **자동 크롤링이 불가**할 수 있습니다. 에이전트 **지시문(Instructions) 원문**은 Genspark UI에서 복사해 아래 환경 변수에 넣으면 이 레포 동작과 1:1에 가깝게 맞출 수 있습니다.

## 폼 필드(일반적인 Custom / Agents 편집 UI) → 코드·API

| Genspark UI (개념) | 이 레포 |
|-------------------|---------|
| 에이전트 이름 | `gensparkReferenceAgentPreset.ts`의 `displayName` (기본값) 또는 프로필 마크다운 상단 |
| 한 줄 설명 | `oneLineDescription` → `genspark_external_agent_profile` 마크다운 |
| 지시문 / Instructions / System | `instructions` → **`REACT_APP_GENSPARK_REFERENCE_AGENT_INSTRUCTIONS`** (프론트 빌드 시) 또는 **`GENSPARK_REFERENCE_AGENT_INSTRUCTIONS`** (백엔드, 추가 블록) |
| 지식·도구 (RAG, 웹 등) | `knowledgeAndTools` + 파이프라인의 `projectKnowledge` / 웹 증거 |
| 기대 산출물 | `expectedDeliverables` + `genspark_output_structure` |
| 품질·검증 | `qualityAndVerification` + Verifier / DeepSeek 메타 (`GensparkPipelineExtrasPanel`) |

## 전달 경로

1. **프론트** `buildGensparkAgenticContextHints()` → `buildGensparkReferenceAgentContext()`가 `genspark_external_agent_profile`, `genspark_reference_agent_id`, `genspark_reference_agent_url`을 채움.
2. **통합 대화 context**에 `agentic_genspark_style: true`와 함께 전송.
3. **백엔드** `llm_service._enhance_with_knowledge`가 `agentic_genspark_style`일 때 `genspark_external_agent_profile`, `genspark_agentic_system`, `genspark_output_structure`를 **실제 LLM 프롬프트 prefix**에 붙임 (이전에는 context에만 있고 본 생성 경로에 안 붙을 수 있음).

## 환경 변수

| 변수 | 용도 |
|------|------|
| `REACT_APP_GENSPARK_REFERENCE_AGENT_INSTRUCTIONS` | Genspark 편집 화면의 **지시문 전체**를 붙여넣기 → `genspark_external_agent_profile`의 Instructions 섹션을 덮어씀 |
| `REACT_APP_GENSPARK_REFERENCE_AGENT_PROFILE=0` | 참조 프로필 마크다운은 끄고 ID·URL 메타만 전송 |
| `GENSPARK_REFERENCE_AGENT_INSTRUCTIONS` | 서버 측 **추가** 지시문 (프롬프트 끝에 `[서버: Genspark 참조 에이전트 추가 지시문]` 블록) |
| `REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT=0` | `ModernChatInterface`·**`IntegratedMasterInterface`**·**`ChatService` / `integratedSystemAPI` / `unifiedAPI.sendChatMessage`**(`mergeApiChatContextPayload`)에서 파이프라인 블록을 붙이지 않음. 미설정 시 구조화·웹 의도가 있을 때만 전송 |

## 관련 코드

- `src/services/gensparkReferenceAgentPreset.ts` — 폼 스키마·기본값·env 병합
- `src/services/gensparkAgenticPrompts.ts` — Genspark 템플릿 + 참조 프로필 병합
- `backend/llm_service.py` — 프롬프트 prefix 주입
- `docs/architecture/GENSPARK_REPO_IMPLEMENTATION_ORDER.md` — 전체 파이프라인 순서

## 사용자 체크리스트

1. 브라우저에서 위 agents URL을 열고 **Instructions**(또는 동등 필드) 전체 복사  
2. 배포 환경에 `REACT_APP_GENSPARK_REFERENCE_AGENT_INSTRUCTIONS` 설정 후 프론트 재빌드  
3. (선택) 서버에만 둘 공통 지시가 있으면 `GENSPARK_REFERENCE_AGENT_INSTRUCTIONS` 추가  
4. `npm run test:frontend:chat-pipeline`으로 프론트 계약 회귀 확인

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](../COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](../FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](../PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

