# CORBU.AI - 편의 명령어
# 프론트: 캐논은 루트 src/, CRA 미러는 frontend/src/ — npm run sync:frontend-src 또는 make sync-frontend (QUICK_REFERENCE.md · AGENTS.md · scripts/README.md)
# chatInputUtils.ts만: npm run sync:frontend-chat-input-utils 또는 make sync-frontend-chat-input
# 통합 대화(UI) 등 부분 미러: npm run sync:frontend-unified-chat 또는 make sync-frontend-unified-chat(전체·패리티는 sync-frontend·check-frontend-parity)
# 패리티만: npm run check:src-frontend-parity 또는 make check-frontend-parity
# 사이드바 컨텍스트 회귀: npm run test:sidebar-context 또는 make test-sidebar-context
# 원격 push 막힘 시 로컬 점검: npm run maintain:push-block 또는 make maintain-push-block (docs/PUSH_BLOCK_HANDOFF.md)

.PHONY: setup start stop check plugins status help sync-frontend sync-frontend-chat-input sync-frontend-unified-chat check-frontend-parity test-sidebar-context maintain-push-block

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

maintain-push-block:
	npm run maintain:push-block

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
	@echo "  make test-sidebar-context - 사이드바 컨텍스트 관련 Jest 회귀(npm run test:sidebar-context)"
	@echo "  make maintain-push-block - 원격 push 막힘 시 아티팩트·회귀·진단·리포트 한 번에(npm run maintain:push-block)"
