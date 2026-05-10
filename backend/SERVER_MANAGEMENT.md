# 서버 관리 가이드

## 🚀 서버 시작 및 확인

### 방법 1: 자동 시작 및 확인 스크립트 (권장)

```bash
cd /path/to/kakao-frontend/kakao-frontend/backend
bash start_and_check_server.sh
```

이 스크립트는:

- 서버가 이미 실행 중인지 확인
- 실행 중이 아니면 자동으로 시작
- 서버 상태 확인 및 헬스 체크
- 서버 정보 출력

### 방법 2: 직접 실행

```bash
cd /path/to/kakao-frontend/kakao-frontend/backend
python3 start_simple_integrated_server.py
```

### 방법 3: 백그라운드 실행

```bash
cd /path/to/kakao-frontend/kakao-frontend/backend
python3 start_simple_integrated_server.py > /tmp/integrated_server.log 2>&1 &
echo $! > /tmp/integrated_server.pid
```

## 📊 서버 상태 확인

### 상태 확인 스크립트

```bash
cd /path/to/kakao-frontend/kakao-frontend/backend
bash server_status.sh
```

### 수동 확인

```bash
# 헬스 체크
curl http://localhost:5002/api/integrated/health

# 시스템 상태
curl http://localhost:5002/api/integrated/status

# 프로세스 확인
lsof -ti:8000
ps aux | grep start_simple_integrated_server
```

## 🛑 서버 중지

### 중지 스크립트

```bash
cd /path/to/kakao-frontend/kakao-frontend/backend
bash stop_server.sh
```

### 수동 중지

```bash
# PID로 중지
kill $(lsof -ti:8000)

# 또는 PID 파일 사용
kill $(cat /tmp/integrated_server.pid)
```

## 📝 서버 정보

- **포트**: 8000
- **헬스 체크**: <http://localhost:5002/api/integrated/health>
- **API 문서**: <http://localhost:5002/api/docs>
- **통합 API**: <http://localhost:5002/api/integrated>
- **로그 파일**: /tmp/integrated_server.log (백그라운드 실행 시)
- **PID 파일**: /tmp/integrated_server.pid (백그라운드 실행 시)

## 🔍 문제 해결

### 서버가 시작되지 않을 때

1. 포트가 이미 사용 중인지 확인:

   ```bash
   lsof -ti:8000
   ```

2. 다른 프로세스 종료:

   ```bash
   kill $(lsof -ti:8000)
   ```

3. 로그 확인:

   ```bash
   tail -f /tmp/integrated_server.log
   ```

### 서버가 응답하지 않을 때

1. 서버가 실행 중인지 확인:

   ```bash
   bash server_status.sh
   ```

2. 헬스 체크:

   ```bash
   curl http://localhost:5002/api/integrated/health
   ```

3. 서버 재시작:

   ```bash
   bash stop_server.sh
   bash start_and_check_server.sh
   ```

## ✅ 현재 서버 상태

서버가 정상적으로 실행 중입니다:

- ✅ 포트 8000에서 실행 중
- ✅ 헬스 체크: healthy
- ✅ API 응답: 정상

---

**서버 관리 스크립트를 사용하여 쉽게 서버를 관리할 수 있습니다!**

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](../docs/COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](../docs/FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](../docs/PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

