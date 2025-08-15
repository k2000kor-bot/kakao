# CORBU.AI - 지능형 AI 분석 플랫폼

🤖 **CORBU.AI**는 AI 기반 데이터 분석, 프로젝트 관리, 지능형 대화를 제공하는 차세대 분석 플랫폼입니다.

## 🚀 주요 기능

### 📊 **AI 분석 시스템**
- **지능형 대화형 AI**: 자연어로 질문하면 상세한 분석 제공
- **다중 AI 엔진**: 다양한 분석 모드와 응답 스타일 지원
- **실시간 분석**: 즉시 결과 생성 및 시각화

### 📁 **프로젝트 관리**
- **다중 프로젝트 지원**: 여러 프로젝트를 동시에 관리
- **파일 업로드**: 문서, 이미지, 데이터 파일 지원
- **프로젝트별 설정**: 각 프로젝트마다 맞춤형 AI 지침 설정

### 📈 **데이터 시각화**
- **실시간 차트**: Chart.js 기반 인터랙티브 차트
- **다양한 차트 타입**: 라인, 바, 도넛 차트 지원
- **데이터 분석**: 통계 및 인사이트 자동 생성

### 🔧 **시스템 모니터링**
- **실시간 성능 모니터링**: CPU, 메모리, 네트워크 사용량
- **연결 상태 확인**: 백엔드 API 연결 상태 실시간 모니터링
- **시스템 알림**: 실시간 알림 시스템

## 🏗️ 기술 스택

### Frontend
- **React 19** + **TypeScript**
- **Chart.js** + **React-Chartjs-2**
- **Tailwind CSS**
- **React Markdown**

### Backend
- **Python Flask**
- **고급 AI 분석 엔진**
- **NLP 처리 시스템**
- **파일 관리 시스템**

### 통신
- **RESTful API**
- **WebSocket** (실시간 통신)
- **CORS** 지원

## 🚀 시작하기

### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd corbu-ai
```

### 2. Frontend 설정
```bash
npm install
npm start
```

### 3. Backend 설정
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python gaeposung_analysis_api.py
```

### 4. 접속
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001

## 📱 사용법

### 프로젝트 생성
1. 사이드바의 "➕" 버튼 클릭
2. 프로젝트 이름 입력
3. AI 지침 설정 (선택사항)
4. 프로젝트 생성 완료

### AI 분석 사용
1. 프로젝트 선택
2. "✨ 새 대화" 버튼으로 대화 시작
3. 자연어로 질문 입력
4. AI 분석 결과 확인

### 파일 관리
1. 프로젝트 선택
2. "📎 파일 추가" 버튼 클릭
3. 파일 업로드
4. 업로드된 파일로 AI 분석

## 🎯 주요 특징

### 🤖 **지능형 AI**
- 자연어 이해 및 처리
- 컨텍스트 기반 대화
- 다중 분석 모드 지원

### 📊 **데이터 분석**
- 실시간 데이터 처리
- 자동 인사이트 생성
- 시각적 결과 표현

### 🔄 **실시간 모니터링**
- 시스템 성능 추적
- 연결 상태 확인
- 자동 알림 시스템

### 🎨 **사용자 친화적 UI**
- 직관적인 인터페이스
- 반응형 디자인
- 다크/라이트 모드 지원

## 📋 API 엔드포인트

### Health Check
```
GET /api/health
```

### 대화형 QA
```
POST /api/conversational/qa
```

### 파일 관리
```
GET /api/files
POST /api/files/upload
```

### 시스템 정보
```
GET /api/system/info
```

## 🔧 개발 환경

### 요구사항
- Node.js 18+
- Python 3.8+
- npm 또는 yarn

### 환경 변수
```env
REACT_APP_API_URL=http://localhost:5001
```

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 지원

- **이메일**: support@corbu.ai
- **문서**: [docs.corbu.ai](https://docs.corbu.ai)
- **이슈**: [GitHub Issues](https://github.com/corbu-ai/corbu-ai/issues)

---

**CORBU.AI** - 지능형 AI 분석 플랫폼으로 미래를 분석하세요! 🚀
