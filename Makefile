# CORBU.AI - 편의 명령어

.PHONY: setup start stop check plugins status help

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

help:
	@echo "CORBU.AI 명령어"
	@echo "  make setup   - 의존성 설치"
	@echo "  make start   - 시스템 시작"
	@echo "  make stop    - 시스템 종료"
	@echo "  make check   - 상태 확인"
	@echo "  make plugins - 플러그인 설치"
	@echo "  make status  - 플러그인 상태"
