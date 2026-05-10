# Cursor 바로 종료될 때 — Cursor 없이 해결

Cursor가 켜자마자 종료되거나, **자꾸 종료되고 다시 시작되는** 상태일 때입니다.  
**Cursor를 완전히 끄고** Terminal.app에서만 아래를 진행하세요.

---

## ⚡ 지금 바로 — 스크립트 실행 (가장 쉬움)

**Cursor를 완전히 끈 상태에서** Terminal.app을 열고:

```bash
cd /Users/a0/kakao-frontend/kakao-frontend
./scripts/fix-cursor-crash.sh
```

또는 수동으로:

```bash
cd /Users/a0/kakao-frontend/kakao-frontend
cat >> .cursorignore << 'EOF'

backups/
docs/reports/
*.sqlite
*.log
.DS_Store
corbu-ai/
frontend/node_modules/
EOF
rm -rf ~/Library/Application\ Support/Cursor/Cache/* ~/Library/Application\ Support/Cursor/CachedData/*
echo "완료. Cursor를 다시 열어 보세요."
```

실행 후:
1. **활동 모니터**에서 "Cursor" 프로세스가 모두 종료됐는지 확인
2. Cursor를 다시 실행

---

## 그래도 자꾸 재시작되면

- **Cursor 인덱싱 끄기**: Cursor가 잠깐이라도 열리면 Settings(⌘,) → "Enable Indexing" 끄기
- **이 프로젝트만 열기**: 다른 폴더/워크스페이스 모두 닫고, 이 프로젝트 하나만 열기
- **VS Code로 전환**: 같은 폴더를 VS Code로 열어서 당분간 작업 (Cursor보다 가벼움)

---

## 1. 단계별 실행

```bash
cd /Users/a0/kakao-frontend/kakao-frontend
```

### A. .cursorignore 보강 (인덱싱 줄이기)

```bash
cat >> .cursorignore << 'EOF'

# 긴급 크래시 완화용 추가
backups/
docs/reports/
*.sqlite
*.log
.DS_Store
corbu-ai/
frontend/node_modules/
EOF
```

### B. Cursor 캐시 삭제

```bash
rm -rf ~/Library/Application\ Support/Cursor/Cache/*
rm -rf ~/Library/Application\ Support/Cursor/CachedData/*
```

(캐시 삭제 후 Cursor 재시작 시 재인덱싱이 잠시 걸릴 수 있으나, 꽉 찬 캐시보다는 낫습니다.)

---

## 2. 프로젝트 폴더를 임시로 줄여서 열기

Cursor가 프로젝트 전체를 인덱싱하다 크래시한다면, **필요한 부분만** 폴더로 만들어 열어 보세요.

```bash
cd /Users/a0/kakao-frontend/kakao-frontend
mkdir -p ../kakao-minimal
cp -r src package.json tsconfig.json public ../kakao-minimal/
cp -r backend/api backend/main_server.py backend/requirements*.txt ../kakao-minimal/backend 2>/dev/null || true
```

그 다음 Cursor에서 `../kakao-minimal` 폴더만 엽니다. (node_modules 없음, 용량 작음)

---

## 3. Cursor 설정에서 AI 기능 일시 끄기

Cursor가 열리는 **순간만**이라도 있다면:

- **Settings (⌘,) → Cursor Settings → Features**
- **"Cursor Tab"**, **"Copilot"** 등 가능하면 **비활성화**
- 또는 **Settings → Application → Cursor** 에서 "Enable Indexing" 끄기

---

## 4. 시스템 메모리 확보

Activity Monitor(활성 상태 보기)에서:

1. **Cursor** 완전 종료
2. **Chrome/Safari** 불필요한 탭 정리
3. **node**, **python** 관련 불필요한 프로세스 종료
4. **Docker**, **Xcode** 등 무거운 앱 잠시 종료

---

## 5. Cursor 대신 사용할 도구 (임시)

- **VS Code**: 같은 프로젝트 폴�더를 열어서 작업 (에디터만 사용)
- **Sublime Text / Nova**: 가벼운 에디터로 코드 수정
- **터미널 + nano/vim**: `npm run dev:check:frontend` 등 명령 실행

---

## 6. 그래도 계속 바로 종료되면

- **Cursor 재설치**: 공식 사이트에서 최신 버전 받아서 재설치
- **다른 Mac 사용자 계정**에서 Cursor 실행 (설정/캐시 충돌 여부 확인)
- **Cursor 포럼/지원**에 "crashes immediately on large project" 로 문의

---

## 요약 체크리스트 (Cursor 없이)

| # | 터미널 명령 | 설명 |
|---|-------------|------|
| 1 | 위 "A. .cursorignore 보강" 실행 | 인덱싱 대상 축소 |
| 2 | 위 "B. Cursor 캐시 삭제" 실행 | 캐시 문제 제거 |
| 3 | Activity Monitor로 메모리 정리 | 여유 메모리 확보 |
| 4 | Cursor 재시작 | 변경사항 적용 후 테스트 |

작업 후 Cursor를 다시 열어 보세요.

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).
