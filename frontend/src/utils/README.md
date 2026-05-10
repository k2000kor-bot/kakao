# Utils

## 대화·입력

| 유틸 | 용도 |
|------|------|
| **chatInputUtils** | buildFeatureContextFromMessage, extractResponseContent, cleanResponseText, parseQuestionRequirementSections, **coerceTrimmedString** / **coerceTrimmedEnd**(전송 입력·이벤트 오전달 방어), parsePipelineMessageExtras / extractPipelineMessageExtrasFromChatResponse |
| **koreanUnderstandingLayer** | 한국어 정규화·장르/화행 휴리스틱·프로필 JSON·모델용 내부 지시 블록 ([문서](../../docs/architecture/GENSPARK_DEEPSEEK_KOREAN_ENGINE_V3.md)) |
| **streamingClient** | streamChatMessage, 스트리밍 응답 |
| **apiClient** | API 호출·에러 처리 |

### chatInputUtils 주요 함수

- **coerceTrimmedString(primary, fallback)**: 전송 직전 입력 정규화(trim). `onClick={handler}`로 이벤트가 첫 인자로 들어와도 안전. 대화 컴포저·`NotebookLLM`·`AdvancedFeaturesPanel`·`WebResearchModal`/`DeepResearchModal`·`NewsSearch`·`ConversationGraphView`·`AICodeGenerator`/`AIDesignSystem`·`ProjectCreateModal`/`ProjectEditDialog`·`ProjectCreationModal`·`MarketingContent`/`PersuasionContent`/`CreativeWriting`·`AdvancedAIFeatures`·`MessageModifyRequestDialog`·`WritingQualityPanel`·`MessageEditor`·`AdvancedSearch`/`AdvancedSearchPanel`·`views/SimpleChatView` 등에 동일 적용.
- **coerceTrimmedEnd(primary, fallback)**: 앞쪽 공백은 유지하고 끝만 정리할 때(`trimEnd` + 비문자 방어). 구조화 입력 퀵 수정 등.
- **보조 트리 `frontend/src`**: 이 파일을 바꾼 뒤 루트에서 `npm run sync:frontend-chat-input-utils`로 미러 복사(AGENTS.md·TESTING_GUIDE — `test:routes`·`test:app-unified`·**`test:sidebar-context`** · 원격 push [docs/PUSH_BLOCK_HANDOFF.md](../../docs/PUSH_BLOCK_HANDOFF.md) 참고).
- **extractResponseContent**: API 응답에서 답변 텍스트 추출 (프롬프트 지시사항 자동 제거)
- **cleanResponseText**: 응답 텍스트에서 프롬프트 지시사항 및 생성 로직 제거
- **buildFeatureContextFromMessage**: 사용자 메시지에서 기능 플래그 추출 (웹검색, 조사모드 등)
- **parseQuestionRequirementSections**: 질문/요구사항 섹션 파싱
- **parsePipelineMessageExtras** / **mergePipelineMessageExtras** / **hasPipelineExtras**: Genspark·Q→A 파이프라인 SSE/JSON 메타 → UI용 객체

## 프로젝트·품질

| 유틸 | 용도 |
|------|------|
| **guidelineQuality** | analyzeGuidelines, getGuidelineQualityTrend |
| **guidelinePolicyPack** | 정책팩 복사/복원 |

## 기타

- **errorLogger** — 로깅
- **formatters** — formatDate, formatDuration, formatNumber
- **toast** — showToast, onToast
- **errorMessages** — getUserFriendlyError
- **rehypeHighlightSearch** — 검색어 하이라이트(마크) Rehype 플러그인
- **projectEvents** — notifyProjectsChanged, onProjectsChanged (사이드바 목록 갱신)

[docs/COMPONENT_ARCHITECTURE.md](../../docs/COMPONENT_ARCHITECTURE.md), [DEVELOPMENT_CONTINUITY](../../docs/DEVELOPMENT_CONTINUITY.md)
