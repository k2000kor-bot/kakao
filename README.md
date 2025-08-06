# CORBU AI - 통합 AI 채팅 시스템

다양한 AI 시스템을 통합한 강력한 채팅 플랫폼입니다.

## 🚀 주요 기능

### 💬 실시간 채팅
- 실시간 메시지 전송/수신
- 타이핑 상태 표시
- 채팅방 관리
- 메시지 히스토리

### 🤖 AI 시스템 통합
- 대화형 AI
- 분석 AI
- 창작 AI
- 예측 AI
- 실시간 AI 상태 모니터링

### 🔧 고급 기능
- 전역 상태 관리
- 실시간 WebSocket 통신
- 에러 처리 및 복구
- 성능 최적화
- 반응형 UI

## 🛠️ 기술 스택

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context + useReducer
- **Real-time**: WebSocket
- **Build Tool**: Create React App
- **Performance**: React.memo, useCallback, useMemo

## 📦 설치 및 실행

### 필수 요구사항
- Node.js 16.0.0 이상
- npm 8.0.0 이상

### 설치
```bash
# 저장소 클론
git clone https://github.com/your-username/corbu-ai.git
cd corbu-ai

# 의존성 설치
npm install
```

### 개발 서버 실행
```bash
npm start
```
애플리케이션이 http://localhost:3000 에서 실행됩니다.

### 프로덕션 빌드
```bash
npm run build
```

### 테스트 실행
```bash
npm test
```

## 🏗️ 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── IntegratedChatSystem.tsx
│   ├── IntegratedAISystem.tsx
│   ├── ChatSidebar.tsx
│   ├── NotificationSystem.tsx
│   └── ...
├── context/            # 전역 상태 관리
│   └── AppContext.tsx
├── services/           # API 및 실시간 서비스
│   ├── api.ts
│   ├── realtimeService.ts
│   └── mockAPI.ts
├── hooks/              # 커스텀 훅
│   └── useAPI.ts
├── utils/              # 유틸리티 함수
│   ├── performance.ts
│   └── errorHandler.ts
└── App.tsx            # 메인 앱 컴포넌트
```

## 🔧 환경 변수

`.env` 파일을 생성하여 다음 변수들을 설정할 수 있습니다:

```env
# API 설정
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_WS_URL=ws://localhost:8000/ws

# 개발 환경 설정
REACT_APP_ENV=development
REACT_APP_DEBUG=true

# AI 시스템 설정
REACT_APP_AI_SYSTEM_ENABLED=true
REACT_APP_AI_TIMEOUT=30000

# 채팅 설정
REACT_APP_CHAT_HISTORY_LIMIT=100
REACT_APP_MESSAGE_RETENTION_DAYS=30
```

## 🚀 배포

### 정적 호스팅 (Netlify, Vercel 등)
```bash
npm run build
```
`build` 폴더의 내용을 호스팅 서비스에 업로드합니다.

### Docker 배포
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔍 성능 최적화

### 구현된 최적화 기법
- **React.memo**: 불필요한 리렌더링 방지
- **useCallback/useMemo**: 함수 및 값 메모이제이션
- **가상화**: 대량 데이터 렌더링 최적화
- **지연 로딩**: 컴포넌트 및 이미지 지연 로딩
- **코드 스플리팅**: 번들 크기 최적화

### 성능 모니터링
- 메모리 사용량 모니터링
- 네트워크 상태 모니터링
- 에러 로깅 및 분석

## 🐛 에러 처리

### 에러 분류
- **네트워크 에러**: 연결 문제
- **인증 에러**: 로그인 필요
- **권한 에러**: 접근 권한 없음
- **서버 에러**: 백엔드 문제
- **타임아웃**: 요청 시간 초과

### 복구 전략
- 자동 재시도 (지수 백오프)
- 사용자 친화적 에러 메시지
- 글로벌 에러 핸들러

## 📱 반응형 디자인

- **Desktop**: 1024px 이상
- **Tablet**: 768px - 1023px
- **Mobile**: 767px 이하

## 🔒 보안

- HTTPS 강제 적용
- XSS 방지
- CSRF 토큰 사용
- 입력 데이터 검증

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 지원

- **이메일**: support@corbu-ai.com
- **문서**: https://docs.corbu-ai.com
- **이슈**: https://github.com/your-username/corbu-ai/issues

## 🙏 감사의 말

이 프로젝트는 다음 오픈소스 프로젝트들을 기반으로 합니다:
- React
- TypeScript
- Tailwind CSS
- Create React App

---

**CORBU AI** - 미래를 만드는 AI 채팅 플랫폼
