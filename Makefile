# CORBU.AI - 편의 명령어
# 프론트: 캐논은 루트 src/, CRA 미러는 frontend/src/ — npm run sync:frontend-src 또는 make sync-frontend (QUICK_REFERENCE.md · AGENTS.md · scripts/README.md)
# chatInputUtils.ts만: npm run sync:frontend-chat-input-utils 또는 make sync-frontend-chat-input
# 통합 대화(UI) 등 부분 미러: npm run sync:frontend-unified-chat 또는 make sync-frontend-unified-chat(전체·패리티는 sync-frontend·check-frontend-parity)
# 패리티만: npm run check:src-frontend-parity 또는 make check-frontend-parity
# 사이드바·앱 셸·맥락 회귀: npm run test:sidebar-context 또는 make test-sidebar-context (TESTING_GUIDE.md; 수동 첨부·재생성·편집 docs/guides/CHAT_UI_TEST_SCENARIOS §14.5)
# 원격 push 막힘 시 로컬 점검: npm run maintain:push-block 또는 make maintain-push-block (docs/PUSH_BLOCK_HANDOFF.md)
# 활성 경로 md 허브 단락: npm run check:doc-verification-hub 또는 make check-doc-verification-hub (DOC_HUB_STRICT=1 → 실패 시 exit 1, TESTING_GUIDE.md)

.PHONY: setup start stop check plugins status help sync-frontend sync-frontend-chat-input sync-frontend-unified-chat check-frontend-parity test-sidebar-context test-composer-pipeline test-conversation-graph-unit verify-pre-deploy maintain-push-block check-doc-verification-hub

setup:
	./setup.sh

start:
	./start_all.sh

stop:
	./stop_all.sh

check:
	npm run check:system

plugins:
	./install-plugins.sh

status:
	./install-plugins.sh status

sync-frontend:
	npm run sync:frontend-src

sync-frontend-chat-input:
	npm run sync:frontend-chat-input-utils

sync-frontend-unified-chat:
	npm run sync:frontend-unified-chat

check-frontend-parity:
	npm run check:src-frontend-parity

test-sidebar-context:
	npm run test:sidebar-context

test-composer-pipeline:
	npm run verify:composer-pipeline

test-conversation-graph-unit:
	npm run verify:conversation-graph:unit

verify-pre-deploy:
	npm run verify:pre-deploy

maintain-push-block:
	npm run maintain:push-block

check-doc-verification-hub:
	npm run check:doc-verification-hub

help:
	@echo "CORBU.AI 명령어"
	@echo "  make setup   - 의존성 설치"
	@echo "  make start   - 시스템 시작"
	@echo "  make stop    - 시스템 종료"
	@echo "  make check   - 상태 확인"
	@echo "  make plugins - 플러그인 설치"
	@echo "  make status  - 플러그인 상태"
	@echo "  make sync-frontend - 루트 src/ → frontend/src/ 미러(npm run sync:frontend-src)"
	@echo "  make sync-frontend-chat-input - chatInputUtils.ts만 미러(npm run sync:frontend-chat-input-utils)"
	@echo "  make sync-frontend-unified-chat - 통합 대화(UI) 등 부분 미러(npm run sync:frontend-unified-chat; 전체는 sync-frontend)"
	@echo "  make check-frontend-parity - src ↔ frontend/src 핵심 파일 바이트 검사(npm run check:src-frontend-parity)"
	@echo "  make test-sidebar-context - 사이드바·앱 셸·맥락 Jest 회귀(npm run test:sidebar-context, TESTING_GUIDE.md; 수동 §14.5 CHAT_UI_TEST_SCENARIOS)"
	@echo "  make test-composer-pipeline - 컴포저 다중 요청·순차·다단계 Jest(npm run verify:composer-pipeline; §14.7 CHAT_UI_TEST_SCENARIOS)"
	@echo "  make test-conversation-graph-unit - 관계도 Jest·백엔드(npm run verify:conversation-graph:unit; E2E는 verify:conversation-graph)"
	@echo "  make verify-pre-deploy - 배포 전 Jest 묶음(sidebar + composer + 관계도 unit; npm run verify:pre-deploy)"
	@echo "  make maintain-push-block - 원격 push 막힘 시 아티팩트·회귀·진단·리포트 한 번에(npm run maintain:push-block, docs/PUSH_BLOCK_HANDOFF.md)"
	@echo "  make check-doc-verification-hub - 활성 경로 추적 md에 허브 문단 포함 여부(npm run check:doc-verification-hub, TESTING_GUIDE.md; 엄격: DOC_HUB_STRICT=1 npm run check:doc-verification-hub)"
