# 🤖 CORBU.AI 사용자 가이드

## 📋 목차

1. [시작하기](#시작하기)
2. [주요 기능](#주요-기능)
3. [AI 글쓰기 엔진](#ai-글쓰기-엔진)
4. [분석 기능](#분석-기능)
5. [고급 설정](#고급-설정)
6. [문제 해결](#문제-해결)
7. [API 문서](#api-문서)

---

## 🚀 시작하기

### 시스템 요구사항

- **Node.js**: 18.0 이상
- **Python**: 3.11 이상
- **메모리**: 4GB 이상 권장
- **디스크**: 2GB 이상 여유 공간

### 빠른 시작

```bash
# 1. 저장소 클론
git clone <repository-url>
cd kakao-frontend

# 2. 의존성 설치
npm install
pip install -r backend/requirements.txt

# 3. 서버 시작 (권장)
npm run restart:backend      # 통합 API (포트 5002, main_server)
npm start                    # 프론트엔드 (포트 3000)

# 레거시 다중 백엔드가 필요할 때만 (예시)
# cd backend && python3 analysis_server.py &
```

### 접속 방법

- **메인 애플리케이션**: <http://localhost:3000>
- **테스트 페이지**: <http://localhost:3000/test.html>
- **통합 API 문서**: <http://localhost:5002/api/docs>

---

## 🎯 주요 기능

### 1. 🧠 AI 기반 대화형 분석

CORBU.AI는 ChatGPT 스타일의 자연스러운 대화를 통해 다양한 분석을 제공합니다.

**사용 방법:**

```
👤 사용자: "이 텍스트의 정치적 성향을 분석해줘"
🤖 CORBU: [상세한 정치적 성향 분석 결과 제공]
```

### 2. ✍️ 전문가 스타일 글쓰기

다양한 전문가 스타일로 글을 작성할 수 있습니다.

**지원 스타일:**

- 📝 논술가 (essayist)
- 🎭 비평가 (critic)  
- 🗳️ 선거평론가 (election critic)
- 🎬 영화평론가 (film critic)
- 📊 여론평론가 (public opinion critic)
- 🏛️ 정치평론가 (political critic)

**사용 예시:**

```
👤 "영화평론가 스타일로 '기생충' 영화에 대한 글을 써줘"
🤖 [전문적인 영화 비평 글 생성]
```

### 3. 🎭 스타일 복제 및 분석

기존 텍스트의 스타일을 분석하고 동일한 스타일로 새로운 글을 작성합니다.

**기능:**

- **스타일 DNA 분석**: 문체, 어조, 논리 구조 파악
- **어조 복제**: 분석된 스타일을 새로운 주제에 적용
- **논리 구조 재현**: 원본의 논증 방식 모방

**사용 방법:**

```
👤 "이 글의 스타일을 분석해서 같은 어조로 다른 주제의 글을 써줘"
🤖 [스타일 분석 후 동일한 톤으로 새 글 생성]
```

### 4. 🎨 창의적 글쓰기

다양한 창작물을 생성할 수 있습니다.

**지원 형식:**

- 📖 소설
- 🎵 시
- 📄 에세이
- 🎭 대본
- 🎤 연설문
- 📜 선언문

---

## 🧠 AI 글쓰기 엔진

### 정치적 성향별 글쓰기

특정 정치적 관점에서 글을 작성할 수 있습니다.

**지원 성향:**

- 🔴 극우 (extreme_right)
- 🟠 보수 (conservative)  
- 🟡 중도우파 (center_right)
- 🟢 중도 (center)
- 🔵 중도좌파 (center_left)
- 🟣 진보 (progressive)
- ⚫ 극좌 (extreme_left)
- 💪 강성 (militant)

**사용 예시:**

```
👤 "중도 성향으로 부동산 정책에 대한 글을 써줘"
🤖 [균형잡힌 시각의 부동산 정책 분석글 생성]
```

### 연령대별 어조

특정 연령층의 말투와 관점을 반영한 글쓰기가 가능합니다.

**지원 연령대:**

- 👨‍💼 50대 남성/여성
- 👩‍💼 60대 남성/여성  
- 👴👵 70대 남성/여성

### 맞춤형 글쓰기 제어

세밀한 제어가 가능합니다.

**제어 요소:**

- **어투 (tone)**: 격식/비격식, 친근함 정도
- **글자수 (length)**: 원하는 분량 지정
- **문장 구조**: 단문/복문 비율
- **단락 구조**: 논증 전개 방식

---

## 📊 분석 기능

### 1. 카카오톡 성향 분석

카카오톡 대화 내용을 분석하여 참여자들의 성향을 파악합니다.

**분석 항목:**

- 참여자별 성향 분포
- 메시지 패턴 분석
- 커뮤니케이션 스타일
- 영향력 있는 참여자 식별

### 2. 시공사 편향 분석

건설 관련 대화에서 특정 업체에 대한 편향성을 분석합니다.

**분석 내용:**

- 전체적인 편향 점수
- 업체별 언급 빈도 및 감정
- 홍보성 콘텐츠 탐지
- 반대 의견 분석

### 3. 여론 동향 분석

시간에 따른 여론 변화를 추적합니다.

**제공 정보:**

- 전체적인 감정 추이
- 시간대별 변화 패턴
- 영향 요인 분석
- 예측 인사이트

---

## ⚙️ 고급 설정

### 환경 변수 설정

```bash
# .env 파일 생성
NODE_ENV=production
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
DB_HOST=localhost
DB_PORT=5432
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Docker 배포

```bash
# Docker Compose로 전체 스택 실행
docker-compose up -d

# 개별 서비스 확장
docker-compose up -d --scale corbu-ai=3
```

### 성능 최적화

- **캐싱**: Redis를 활용한 응답 캐싱
- **로드 밸런싱**: 여러 인스턴스 실행
- **CDN**: 정적 파일 캐싱
- **압축**: Gzip 압축 활성화

---

## 🔧 문제 해결

### 자주 발생하는 문제

#### 1. 포트 충돌 오류

```bash
# 포트 사용 중인 프로세스 확인 (백엔드 5002, 프론트 3000 등)
lsof -i :5002
lsof -i :3000

# 프로세스 종료
kill -9 <PID>
```

#### 2. Python 환경 문제

```bash
# 가상환경 활성화 (우선순위: backend/venv → backend/.venv → 루트 venv)
source backend/.venv/bin/activate
# 또는: bash -c 'source scripts/lib-activate-backend-venv.sh && backend_venv_activate "$(pwd)"'

# 의존성 재설치
pip install -r backend/requirements.txt
```

#### 3. TypeScript 컴파일 오류

```bash
# 타입 체크
npx tsc --noEmit

# 캐시 정리
rm -rf node_modules/.cache
npm start
```

#### 4. 데이터베이스 연결 실패

```bash
# PostgreSQL 상태 확인
docker-compose ps postgres

# 데이터베이스 재시작
docker-compose restart postgres
```

### 로그 확인

```bash
# 애플리케이션 로그
docker-compose logs -f corbu-ai

# 특정 서비스 로그
docker-compose logs -f postgres
```

---

## 📚 API 문서

### 주요 엔드포인트

#### 통합 분석 API

```http
POST /api/v1/integrated-analysis
Content-Type: application/json

{
  "content": "분석할 텍스트",
  "room_id": "room_001",
  "analysis_type": "integrated"
}
```

#### 카카오톡 성향 분석

```http
POST /api/v1/kakao-tendency
Content-Type: application/json

{
  "messages": ["메시지1", "메시지2"],
  "room_id": "room_001"
}
```

#### 시공사 편향 분석

```http
POST /api/v1/construction-bias
Content-Type: application/json

{
  "content": "건설 관련 대화 내용",
  "room_id": "room_001"
}
```

### 응답 형식

```json
{
  "success": true,
  "analysis_type": "integrated",
  "timestamp": "2025-08-07T16:51:06.501216",
  "results": {
    "kakao_tendency": { /* 성향 분석 결과 */ },
    "construction_bias": { /* 편향 분석 결과 */ },
    "opinion_trend": { /* 여론 동향 분석 */ }
  },
  "confidence_score": 0.88,
  "recommendations": ["권장사항1", "권장사항2"]
}
```

---

## 🎯 사용 팁

### 1. 효과적인 대화 방법

- **구체적인 요청**: "50대 남성 어조로 부동산 정책 글을 써줘"
- **맥락 제공**: "회사 임원진 대상 보고서 형식으로"
- **분량 지정**: "1000자 내외로"

### 2. 스타일 분석 활용

- **기존 글 첨부**: 분석하고 싶은 텍스트 전체 제공
- **명확한 지시**: "이 스타일로 환경 정책에 대해 써줘"
- **세부 조정**: "더 격식있게" 또는 "더 친근하게"

### 3. 분석 결과 해석

- **신뢰도 점수**: 0.8 이상이면 신뢰할 만함
- **상관관계**: 여러 분석 결과 간의 연관성 확인
- **시계열 분석**: 시간 변화 패턴 주목

---

## 🆘 지원 및 문의

### 기술 지원

- **이슈 트래커**: GitHub Issues
- **문서**: 이 가이드 및 API 문서
- **커뮤니티**: 개발자 포럼

### 업데이트 정보

- **릴리즈 노트**: 새로운 기능 및 버그 수정
- **로드맵**: 향후 개발 계획
- **마이그레이션 가이드**: 버전 업그레이드 방법

---

*🤖 CORBU.AI - 차세대 AI 기반 지능형 분석 플랫폼*  
*📅 최종 업데이트: 2025년 8월 7일*

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](../COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](../FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](../PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

