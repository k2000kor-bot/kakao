# 🔧 네트워크 연결 문제 해결 가이드

## 📍 현재 프로젝트 기본 포트 (CORBU.AI 메인)

| 서비스 | 포트 | URL |
|--------|------|-----|
| 프론트엔드 | 3000 | http://localhost:3000 |
| 백엔드 (main_server) | 5002 | http://localhost:5002 |

- **접속이 안 될 때**: [로컬 접속 가이드](../LOCAL_ACCESS_GUIDE.md) 참고. `npm run check:access`, http://localhost:3000/test.html 로 서버 동작 여부 확인.
- **API 검증**: `npm run verify:api`, `npm run test:integration` (백엔드 실행 중 필요).
- **오류·로딩·토스트 메시지**: 화면에 표시되는 오류 문구·"생각 중"·토스트 규칙은 [UX 메시징 가이드](UX_MESSAGING_GUIDE.md) 참고.

---

## 🪟 창이 예기치 않게 종료됨 (원인: crashed, 코드: 5)

브라우저 탭이나 앱 창이 **"예기치 않게 종료되었습니다(원인: 'crashed', 코드: '5')"** 메시지와 함께 닫히는 경우, 아래 순서로 시도하세요.

### 원인 요약

- **메모리 부족**: 탭/프로세스 메모리 한도 초과(OOM)
- **미처리 예외**: JavaScript 오류가 최상위에서 처리되지 않음
- **GPU/그래퉽 드라이버**: 하드웨어 가속 관련 크래시
- **확장 프로그램**: 브라우저 확장이 페이지 스크립트와 충돌

### 해결 단계

0. **메모리 확대 실행(권장)**  
   `npm start`에는 이미 `NODE_OPTIONS=--max-old-space-size=8192`가 적용되어 있습니다. 그래도 크래시하면 `npm run start:safe` 사용.  
   상세: [CONNECT.md §8](../CONNECT.md#8-창이-예기치-않게-종료될-때-크래시-코드-5)

1. **페이지 새로고침**  
   주소창에 `http://localhost:3000` 다시 입력하거나 F5로 새로고침.

2. **다른 탭 정리**  
   불필요한 탭을 닫아 메모리를 확보한 뒤 해당 페이지만 열고 재접속.

3. **시크릿/프라이빗 모드**  
   확장 프로그램을 끈 상태로 실행: Chrome `Ctrl+Shift+N`(Windows) / `Cmd+Shift+N`(Mac) → `http://localhost:3000` 접속.

4. **GPU 가속 끄기(Chrome)**  
   - 주소창에 `chrome://settings/system` 입력  
   - "가능한 경우 하드웨어 가속 사용" **끄기**  
   - 브라우저 재시작 후 다시 접속

5. **캐시·저장소 삭제**  
   - F12 → Application(또는 저장소) → "저장된 데이터 삭제" 또는 "Clear site data"  
   - 새로고침 후 재시도

6. **다른 브라우저에서 시도**  
   Chrome에서만 발생하면 Edge, Firefox 등으로 `http://localhost:3000` 접속해 동일 현상 여부 확인.

7. **개발 서버 재시작**  
   터미널에서 `npm start` 중인 프로세스를 Ctrl+C로 종료한 뒤 다시 `npm start` 실행.

8. **콘솔 로그 확인**  
   크래시 직전에 F12 → Console에 빨간 오류가 있는지 확인. `[CORBU.AI] Unhandled error:` 또는 `Unhandled rejection:` 로그가 있으면 해당 스택을 참고해 수정하거나 문의 시 전달.

프로젝트에서는 **미처리 예외·프로미스 거부**를 `index.tsx`에서 잡아 로그만 남기고, 가능한 경우 크래시로 이어지지 않도록 처리해 두었습니다. 그래도 반복되면 위 4·5·6번을 우선 적용해 보세요.

### Cursor IDE 창 자체가 크래시할 때 (코드 5)

- **Cursor 완전 종료 후 재실행**: Cmd+Q(맥)로 완전히 종료한 뒤 다시 실행
- **작업 분할·간결화**: `.cursor/rules/session-continuity.mdc` 참고. 한 번에 너무 많은 파일 편집·긴 명령 실행 시 메모리 압박으로 Cursor가 죽을 수 있음
- **개발 서버는 별도 터미널**: `npm start`는 터미널 앱에서 실행하고, Cursor에서는 가벼운 작업만 수행
- **불필요한 확장·탭 정리**: 사용하지 않는 Cursor 확장 비활성화, 열린 프로젝트 탭 줄이기

---

## ✅ 해결된 "Failed to fetch" 오류

### 🎯 **수정된 내용**

#### **1. 백엔드 API 연결 개선**

- ✅ CORS 설정 정상화
- ✅ 프록시 설정 추가 (`package.json`)
- ✅ 에러 처리 강화
- ✅ 네트워크 디버깅 로그 추가

#### **2. 데이터 저장소 설정**

- ✅ 메모리 기반 임시 데이터베이스 구현
- ✅ 업로드된 비교집 데이터 자동 저장
- ✅ 의사결정 이력 관리

---

## 🚀 **현재 시스템 상태**

### **✅ 백엔드 (포트 8002)**

```bash
curl http://localhost:5002/api/health
# {"message":"Construction Company Selection API","version":"1.0.0"}
```

### **✅ 프론트엔드 (포트 3003)**

```bash
curl http://localhost:3003/
# <!DOCTYPE html> (정상 응답)
```

### **✅ 프록시 연결**

- 개발 모드에서 자동 프록시 설정
- `/api/*` 요청을 백엔드로 자동 전달

---

## 🧪 **시스템 테스트 방법**

### **Step 1: 시스템 접속**

```
브라우저에서 http://localhost:3003 접속
```

### **Step 2: 시공사 선정 탭 클릭**

- 화면 상단 "시공사 선정" 탭 선택
- 파일 업로드 화면 확인

### **Step 3: 샘플 데이터 업로드**

1. **프로젝트 유형**: "대형_인프라" 선택
2. **파일 선택**: `public/sample_construction_data.json` 업로드
3. **업로드 버튼** 클릭

### **Step 4: 결과 확인**

- ✅ "5개 시공사 데이터 처리 완료" 메시지
- ✅ 다음 단계로 자동 진행
- ✅ 평가 기준 설정 화면 표시

---

## 🔍 **문제 진단 방법**

### **브라우저 개발자 도구 확인**

```
F12 → Console 탭에서 로그 확인:
- "Uploading to: /api/upload_comparison_data"
- "Response status: 200"
- "Upload result: {status: 'success', ...}"
```

### **네트워크 탭 확인**

```
F12 → Network 탭에서:
- upload_comparison_data 요청 상태: 200 OK
- 응답 데이터: JSON 형식 확인
```

### **백엔드 로그 확인**

```bash
터미널에서 확인:
INFO: 127.0.0.1:xxxxx - "POST /api/upload_comparison_data HTTP/1.1" 200 OK
```

---

## ⚠️ **문제 발생 시 해결 방법**

### **1. "Failed to fetch" 오류**

```bash
# 백엔드 재시작 (통합 API 권장)
npm run restart:backend
# 레거시 단일 API만 필요할 때:
# cd backend && source .venv/bin/activate && python3 construction_api.py &

# 프론트엔드 재시작
pkill -f react-scripts && PORT=3003 npm start &
```

### **2. 포트 충돌 문제**

```bash
# 사용 중인 포트 확인
lsof -i :8002  # 백엔드
lsof -i :3003  # 프론트엔드

# 프로세스 종료 후 재시작
pkill -f construction_api
pkill -f react-scripts
```

### **3. CORS 오류**

- ✅ 이미 해결됨 (프록시 설정)
- 개발 모드에서 자동 처리

### **4. 파일 업로드 실패**

```json
확인 사항:
- 파일 경로: public/sample_construction_data.json
- 파일 형식: JSON
- 파일 크기: < 10MB
```

---

## 📋 **정상 작동 확인 체크리스트**

### **✅ 백엔드 상태**

- [ ] 포트 8002에서 실행 중
- [ ] API 응답 정상 (200 OK)
- [ ] 샘플 데이터 업로드 성공

### **✅ 프론트엔드 상태**

- [ ] 포트 3003에서 실행 중
- [ ] 시공사 선정 탭 접근 가능
- [ ] 파일 업로드 UI 정상 표시

### **✅ 연결 상태**

- [ ] 프록시 설정 적용
- [ ] API 호출 성공 (개발자 도구 확인)
- [ ] 데이터 처리 완료 메시지 표시

---

## 🎉 **성공 시 기대 결과**

### **업로드 완료 후**

```
✅ "5개 시공사 데이터 처리 완료"
✅ 자동으로 다음 단계 진행
✅ 삼성물산건설부문, 대한건설, 포스코건설, 현대엔지니어링, GS건설 처리
```

### **분석 진행 가능**

```
✅ 평가 기준 설정 화면
✅ 가중치 조정 (총 100%)
✅ 위험 허용도 선택
✅ 분석 시작 버튼 활성화
```

---

## 💡 **추가 팁**

### **브라우저 캐시 초기화**

```
Ctrl+Shift+R (하드 새로고침)
또는 개발자 도구에서 "Disable cache" 체크
```

### **네트워크 상태 확인**

```bash
# 로컬 연결 테스트
ping localhost
telnet localhost 8002
telnet localhost 3003
```

### **로그 모니터링**

```bash
# 백엔드 로그 실시간 확인
tail -f backend/logs/* 2>/dev/null || echo "No log files yet"

# 프론트엔드 콘솔 로그
브라우저 F12 → Console 탭 항상 열어두기
```

---

**🎊 축하합니다! "Failed to fetch" 오류가 해결되었습니다.**

이제 시공사 선정 AI 시스템을 정상적으로 사용할 수 있습니다! 🚀
