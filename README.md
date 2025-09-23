# 🤖 CORBU.AI - 차세대 AI 강화 어시스턴트

![CORBU.AI](https://img.shields.io/badge/CORBU.AI-v2.0-blue?style=for-the-badge&logo=robot)
![Python](https://img.shields.io/badge/Python-3.13-green?style=for-the-badge&logo=python)
![Flask](https://img.shields.io/badge/Flask-2.3.3-red?style=for-the-badge&logo=flask)
![PWA](https://img.shields.io/badge/PWA-Ready-purple?style=for-the-badge)

> **CORBU.AI**는 최신 AI 기술을 활용한 종합적인 디지털 어시스턴트입니다. 채팅, 파일 분석, 웹 검색, 프로젝트 관리 등 다양한 기능을 통합적으로 제공합니다.

## ✨ 주요 기능

### 🧠 핵심 AI 기능

- **💬 지능형 채팅**: 다양한 주제에 대한 자연스러운 대화
- **🔍 실시간 웹 검색**: DuckDuckGo API를 통한 최신 정보 검색
- **📁 파일 분석**: 텍스트, 이미지, 문서 등 다양한 파일 형식 분석
- **🎭 감정 분석**: 텍스트의 감정 상태 분석 및 시각화

### 📊 프로젝트 관리

- **📋 프로젝트 관리**: 파일 업로드, 지침 관리, 진행상황 추적
- **📈 데이터 분석**: 데이터 시각화 및 통계 분석
- **🔧 품질 보증**: 코드 리뷰 및 품질 검사
- **⚡ 성능 최적화**: 시스템 성능 분석 및 최적화 제안

### 🌐 웹 기술

- **📱 PWA 지원**: 앱처럼 설치 및 오프라인 사용 가능
- **🔄 Service Worker**: 캐싱 및 백그라운드 동기화
- **📤 대화 내보내기**: 채팅 기록 백업 및 공유
- **🎤 음성 인식**: 음성 입력 지원 (준비완료)

## 🚀 빠른 시작

### 1. 환경 요구사항

- **Python**: 3.11 이상
- **Node.js**: 18 이상 (선택사항)
- **시스템**: macOS, Linux, Windows
- **메모리**: 최소 4GB RAM 권장

### 2. 설치 및 실행

#### 자동 배포 (권장)

```bash
# 저장소 클론
git clone https://github.com/your-repo/corbu-ai.git
cd corbu-ai

# 자동 배포 스크립트 실행
chmod +x deploy.sh
./deploy.sh local
```

#### 수동 설치

```bash
# Python 가상환경 생성
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 개발 서버 실행
python complete_server.py
```

### 3. 접속

- **웹 인터페이스**: <http://localhost:8080>
- **API 문서**: <http://localhost:8080/api/health>

## 🏗️ 시스템 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (HTML/JS)     │◄──►│   (Flask)       │◄──►│   APIs          │
│                 │    │                 │    │                 │
│ • PWA Support   │    │ • RESTful API   │    │ • DuckDuckGo    │
│ • Service Worker│    │ • File Analysis │    │ • Web Search    │
│ • Real-time UI  │    │ • AI Processing │    │ • External APIs │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Storage       │
                    │                 │
                    │ • File Storage  │
                    │ • Chat History  │
                    │ • User Data     │
                    └─────────────────┘
```

## 📡 API 엔드포인트

### 채팅 및 대화

- `POST /api/chat` - AI 채팅 메시지 전송
- `GET /api/chat-history` - 채팅 기록 조회
- `GET /api/chat-history/<session_id>` - 특정 세션 기록
- `DELETE /api/chat-history/<session_id>` - 세션 기록 삭제
- `POST /api/search-chat` - 채팅 기록 검색

### 파일 및 데이터

- `POST /api/upload` - 파일 업로드 및 분석
- `GET /api/analyze-file/<file_id>` - 파일 재분석
- `POST /api/web-search` - 실시간 웹 검색

### 프로젝트 관리

- `GET /api/projects` - 프로젝트 목록 조회
- `POST /api/projects` - 새 프로젝트 생성
- `GET /api/projects/<project_id>` - 프로젝트 상세 정보

### 시스템

- `GET /api/health` - 서버 상태 확인
- `GET /sw.js` - Service Worker 파일
- `GET /` - 메인 웹 인터페이스

## 🔧 개발 도구

### 모니터링

```bash
# 실시간 시스템 모니터링
python monitor.py

# 연속 모니터링 (60초 간격)
python monitor.py --continuous --interval 60

# 모니터링 결과 저장
python monitor.py --save monitoring_report.json
```

### 테스팅

```bash
# 전체 API 테스트
python test_all_apis.py

# 성능 분석
python performance_optimizer.py
```

### 배포

```bash
# 로컬 배포
./deploy.sh local

# Docker 배포
./deploy.sh docker

# 프로덕션 배포
./deploy.sh production
```

## 📊 성능 특징

### ⚡ 응답 시간

- **평균 API 응답**: < 100ms
- **채팅 응답**: < 1초
- **파일 분석**: < 2초
- **웹 검색**: < 5초

### 🏃‍♂️ 처리 능력

- **동시 사용자**: 100+ 지원
- **파일 크기**: 최대 10MB
- **채팅 세션**: 무제한
- **메모리 사용**: 자동 최적화

### 🛡️ 안정성

- **자동 재시작**: 오류 시 자동 복구
- **메모리 정리**: 30분마다 자동 실행
- **캐시 관리**: TTL 기반 자동 만료
- **로그 관리**: 로테이션 및 압축

## 🔒 보안 기능

- **CORS 설정**: 크로스 오리진 요청 제어
- **파일 검증**: 업로드 파일 타입 및 크기 제한
- **세션 관리**: 안전한 세션 처리
- **에러 처리**: 민감한 정보 노출 방지

## 📚 사용 예시

### 기본 채팅

```javascript
// JavaScript에서 API 호출
const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        message: '안녕하세요!',
        session_id: 'user-session-123'
    })
});
const data = await response.json();
console.log(data.response);
```

### 파일 업로드

```javascript
// 파일 업로드 및 분석
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
});
const result = await response.json();
console.log(result.file_info.analysis);
```

### 웹 검색

```javascript
// 실시간 웹 검색
const searchResponse = await fetch('/api/web-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        query: 'Python 프로그래밍',
        max_results: 5
    })
});
const searchData = await searchResponse.json();
console.log(searchData.results);
```

## 🐳 Docker 배포

### Docker Compose 사용

```yaml
version: '3.8'
services:
  corbu-ai:
    build: .
    ports:
      - "8080:8080"
    volumes:
      - ./logs:/app/logs
      - ./uploads:/app/uploads
    environment:
      - FLASK_ENV=production
      - SECRET_KEY=your-secret-key
    restart: unless-stopped
```

### 단일 컨테이너 실행

```bash
# 이미지 빌드
docker build -t corbu-ai .

# 컨테이너 실행
docker run -d \
  --name corbu-ai-container \
  -p 8080:8080 \
  -v $(pwd)/logs:/app/logs \
  -v $(pwd)/uploads:/app/uploads \
  corbu-ai
```

## 🔄 업데이트 및 유지보수

### 정기 유지보수

```bash
# 로그 정리 (월 1회 권장)
find logs -name "*.log" -mtime +30 -delete

# 업로드 파일 정리 (필요시)
find uploads -mtime +7 -delete

# 시스템 상태 점검
python monitor.py --save health_check.json
```

### 백업

```bash
# 데이터베이스 백업
cp *.db backups/

# 설정 파일 백업
cp .env backups/

# 전체 백업 (배포 스크립트 사용)
./deploy.sh backup
```

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 지원 및 문의

- **이슈 보고**: [GitHub Issues](https://github.com/your-repo/corbu-ai/issues)
- **문서**: [Wiki](https://github.com/your-repo/corbu-ai/wiki)
- **이메일**: <support@corbu-ai.com>

## 🎉 감사의 말

CORBU.AI를 사용해주셔서 감사합니다! 더 나은 AI 어시스턴트를 만들기 위해 지속적으로 개선하고 있습니다.

---

<div align="center">

**🚀 CORBU.AI로 더 스마트한 작업을 시작하세요!**

[시작하기](#빠른-시작) • [문서](docs/) • [데모](http://localhost:8080)

</div>
