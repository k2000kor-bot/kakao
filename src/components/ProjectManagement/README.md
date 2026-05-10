# ProjectManagement 컴포넌트

## 활성 (현재 사용)

| 컴포넌트 | 용도 |
|----------|------|
| **ProjectEditModal** | 프로젝트 편집·지침·가이드라인·파일·품질 점검. ProjectsPage·ChatGPTInterface에서 사용 |
| **ProjectHub** | 프로젝트 목록·생성·편집·삭제. ProjectsPage에서 사용 |

## 비활성 (backup)

| 컴포넌트 | 비고 |
|----------|------|
| ProjectCreationModal | backup/UnifiedProjectInterface.tsx.disabled에서만 사용 |
| ProjectList | backup/UnifiedProjectInterface.tsx.disabled에서만 사용 |

현재 프로젝트 생성: ProjectsPage → ProjectHub "새 프로젝트" → projectService.createProject → ProjectEditModal로 바로 편집.

**이름·검색어 등 문자열**: 생성 모달·사이드바 입력은 **`chatInputUtils.coerceTrimmedString`** 권장 — [utils/README.md](../../utils/README.md), [guides/RESPONSE_CLEANING.md](../../../docs/guides/RESPONSE_CLEANING.md).

상세 매핑: [docs/COMPONENT_ARCHITECTURE.md](../../../docs/COMPONENT_ARCHITECTURE.md) §3

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../../../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](../../../docs/COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](../../../docs/FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](../../../docs/PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

