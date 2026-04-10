# 반복 종료·팅김 대응 가이드

Cursor, 개발 서버, 터미널 명령이 **자꾸 종료되거나 팅길 때** 시도할 조치입니다.

---

## 🔴 뭘 할 수 없을 정도로 바로 종료될 때

→ **[CRASH_EMERGENCY_FIX.md](./CRASH_EMERGENCY_FIX.md)** 열어서 **Cursor 없이** Terminal.app에서만 순서대로 실행하세요.

> **핵심**: Cursor 내장 터미널·에이전트가 무거운 명령을 실행하면 Aborted·종료됩니다.  
> 긴 검증은 **외부 터미널**(iTerm, Terminal.app)에서 수동 실행하세요.

---

## ⚡ 적용됨: Cursor 부하 감소

- **`.vscode/settings.json`**: `files.watcherExclude`, `search.exclude`에 `backups/`, `corbu-ai/`, `coverage/`, `venv/` 추가 → Cursor가 감시·검색하는 파일 수 감소.

---

## ⚡ 자주 팅길 때 3단계 (10초)

| 1 | ⌘Q로 Cursor 완전 종료 후 재실행 |
| 2 | 에이전트에게 **"명령 실행 말고 코드만 수정해줘"** 또는 **"한 파일만 수정해줘"** |
| 3 | `verify`·`test`·`build`는 **iTerm/Terminal.app**에서 직접 실행 |

---

## 팅길 때 가장 먼저 (30초 체크리스트)

1. **⌘Q로 Cursor 완전 종료** → 다시 실행
2. **다른 프로젝트 탭·창 닫기** → 한 프로젝트만 유지
3. **에이전트에게 "명령은 실행하지 말고 코드만 수정해줘"**라고 요청
4. **verify/test/build** → 외부 터미널(iTerm 등)에서 직접 실행

---

## 1. 즉시 시도 (우선순위 순)

| 순서 | 조치 | 설명 |
|------|------|------|
| 1 | **Cursor 완전 종료** | ⌘Q(맥) / Alt+F4(윈도우)로 완전 종료 후 재실행. 작업 중이던 파일은 자동 저장됨 |
| 2 | **한 프로젝트만 열기** | Cursor에서 다른 폴더/프로젝트 탭 닫기. 메모리 부담 감소 |
| 3 | **다른 앱 정리** | 브라우저 탭·Docker·무거운 IDE 등 종료해 시스템 메모리 확보 |
| 4 | **요청 단순화** | 에이전트에게 "한 파일만 수정해줘", "다음 단계만 진행해줘" 처럼 1~2개 작업만 요청 |

---

## 2. Cursor 전용 설정

- **`.cursorignore` 확인**: 프로젝트 루트에서 `open .cursorignore` 후 아래 내용이 포함되는지 확인. **없으면 수동 추가** (에이전트는 .cursorignore 편집 권한 없을 수 있음):
  ```
  node_modules/
  frontend/node_modules/
  build/
  backup/
  backups/
  corbu-ai/
  .pytest_cache/
  .ruff_cache/
  *.db
  *.sqlite
  *.log
  .venv/
  venv/
  coverage/
  .git/
  .DS_Store
  ```
- **불필요한 확장 비활성화**: Cursor 확장 중 사용하지 않는 것 비활성화
- **대형 파일·폴더 첨부 금지**: @로 불필요한 대용량 경로 첨부하지 않기

---

## 3. 개발 서버(npm start)가 팅길 때

```bash
npm run start:safe
```

- 이미 `NODE_OPTIONS=--max-old-space-size=8192` 적용됨. 그래도 크래시하면:
  - `node_modules` 재설치: `rm -rf node_modules && npm install`
  - `npm start` 대신 **외부 터미널**(iTerm, Terminal.app)에서 실행 (Cursor 내장 터미널보다 안정적일 수 있음)

---

## 4. 터미널 명령이 Aborted될 때

- **긴 명령 회피**: `verify:completion`, `test:coverage`, `test:backend` 등 2분 이상 걸리는 명령은 Cursor 터미널 대신 **외부 터미널**에서 실행
- **가벼운 검증**: `npm run quick-check` (타입만, 약 30초~1분) 사용. 상세 검증은 외부 터미널에서 수동 실행

---

## 5. 에이전트(AI)에게 요청할 때

- **"한 가지만 해줘"**: 한 번에 1~2개 파일 수정만 요청
- **"명령은 실행하지 말고 알려줘"**: `verify:completion`, `test:backend` 등은 에이전트 대신 **직접 터미널에서 실행**
- **예시**: "extended_views_api 수정만 해줘. 테스트는 직접 돌릴게"

---

## 6. 외부 터미널에서 실행할 검증 명령 (복사용)

```bash
# 프로젝트 루트에서
cd /Users/a0/kakao-frontend/kakao-frontend

# 빠른 검증 (타입만, ~1분)
npm run quick-check

# 전체 검증 (타입+린트+P4 테스트, ~2분)
npm run verify:completion

# 백엔드 테스트
npm run test:backend
```

---

## 7. Cursor Composer·에이전트가 자꾸 종료될 때

- **요청 문장을 짧게**: "계속 진행해줘" 대신 "BACKLOG 62행 extended_views 실데이터 반영만 해줘"처럼 구체적으로
- **파일 첨부 최소화**: @로 여러 파일을 한꺼번에 첨부하지 않기 (1~2개만)
- **대화 이력이 길면**: 새 대화 시작. 이전 중요 내용은 BACKLOG나 주석에 요약해 두기
- **규칙 확인**: `.cursor/rules/session-continuity.mdc`가 alwaysApply인지 확인. 에이전트가 무거운 명령을 스스로 실행하지 않도록 규칙 존재

---

## 8. 관련 문서

- **CONNECT.md §8**: 크래시 코드 5 상세
- **.cursor/rules/session-continuity.mdc**: 세션·요청 단순화 규칙 (alwaysApply)
- **docs/guides/TROUBLESHOOTING_GUIDE.md**: 네트워크·브라우저 크래시
