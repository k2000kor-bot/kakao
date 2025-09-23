# CORBU.AI 코드 편집 도구 사용 가이드

## 🎯 개요

긴 코드를 효율적으로 편집, 수정, 관리할 수 있는 고급 개발 도구들을 제공합니다.

## 🛠️ 사용 가능한 도구들

### 1. 웹 기반 코드 편집기
- **URL**: http://localhost:8080/web_code_editor.html
- **기능**: 
  - 파일 탐색기
  - 다중 탭 편집
  - 실시간 저장
  - 자동 백업
  - 코드 스니펫
  - 찾기/교체

### 2. Python 코드 편집 도구
- **파일**: `code_editor.py`
- **기능**:
  - 스마트 교체
  - 다중 편집
  - 파일 구조 분석
  - 백업 관리

### 3. Flask API 엔드포인트
- **URL**: http://localhost:5001
- **기능**:
  - 파일 CRUD 작업
  - 백업 관리
  - 파일 분석

## 🚀 시작하기

### 방법 1: 자동 시작 스크립트
```bash
cd /Users/aD/kakao-frontend
./start_dev_tools.sh
```

### 방법 2: 수동 시작
```bash
# 1. 백엔드 서버 시작
cd /Users/aD/kakao-frontend
source venv/bin/activate
python app.py &

# 2. 프론트엔드 서버 시작
BROWSER=none PORT=3000 npm start &

# 3. 웹 코드 편집기 시작
python -m http.server 8080 &
```

## 📝 웹 코드 편집기 사용법

### 기본 기능

#### 1. 파일 열기
- 왼쪽 사이드바에서 파일 클릭
- 여러 파일을 동시에 탭으로 열기 가능

#### 2. 파일 편집
- 코드 자동 완성
- 구문 강조
- 실시간 오류 검사

#### 3. 파일 저장
- **Ctrl+S**: 현재 파일 저장
- **Ctrl+Shift+S**: 다른 이름으로 저장
- 자동 백업 생성

#### 4. 찾기/교체
- **Ctrl+F**: 찾기/교체 패널 열기
- **F3**: 다음 찾기
- **Shift+F3**: 이전 찾기
- **Ctrl+H**: 모두 교체

### 고급 기능

#### 1. 코드 스니펫
사용 가능한 스니펫들:
- **React 컴포넌트**: 기본 React 컴포넌트 템플릿
- **React 훅**: 커스텀 React 훅 템플릿
- **API 엔드포인트**: Flask API 엔드포인트 템플릿
- **CSS 컴포넌트**: 스타일 컴포넌트 템플릿

#### 2. 파일 관리
- **새 파일 생성**: 템플릿 기반 자동 생성
- **새 폴더 생성**: 프로젝트 구조 관리
- **파일 삭제**: 안전한 파일 삭제

#### 3. 백업 관리
- **자동 백업**: 파일 저장 시 자동 백업 생성
- **백업 복원**: 이전 버전으로 되돌리기
- **백업 목록**: 모든 백업 파일 조회

## 🐍 Python 코드 편집 도구 사용법

### 기본 사용법

```python
from code_editor import AdvancedCodeEditor

# 편집기 인스턴스 생성
editor = AdvancedCodeEditor("/Users/aD/kakao-frontend")

# 파일 구조 분석
analysis = editor.analyze_file_structure("src/App.tsx")
print(analysis)

# 스마트 교체
result = editor.smart_replace(
    "src/App.tsx",
    "old_content",
    "new_content"
)
print(result)

# 다중 편집
edits = [
    {"type": "replace", "old": "old1", "new": "new1"},
    {"type": "replace", "old": "old2", "new": "new2"}
]
result = editor.multi_edit("src/App.tsx", edits)
print(result)
```

### 고급 기능

#### 1. 스마트 교체
- 컨텍스트를 고려한 안전한 교체
- 부분 매치 자동 감지
- 유사한 내용 제안

#### 2. 다중 편집
- 여러 변경사항을 한 번에 적용
- 원자적 작업 (모두 성공하거나 모두 실패)
- 자동 백업 생성

#### 3. 파일 분석
- 함수, 클래스, import 문 자동 감지
- 복잡도 점수 계산
- 코드 구조 시각화

## 🔧 API 사용법

### 파일 관리 API

#### 파일 목록 조회
```bash
curl http://localhost:5001/api/files
```

#### 파일 내용 조회
```bash
curl "http://localhost:5001/api/file?path=src/App.tsx"
```

#### 파일 저장
```bash
curl -X POST http://localhost:5001/api/save \
  -H "Content-Type: application/json" \
  -d '{"path": "src/App.tsx", "content": "file content"}'
```

#### 새 파일 생성
```bash
curl -X POST http://localhost:5001/api/create-file \
  -H "Content-Type: application/json" \
  -d '{"name": "MyComponent.jsx", "type": "jsx"}'
```

### 백업 관리 API

#### 백업 목록 조회
```bash
curl http://localhost:5001/api/backups
```

#### 백업에서 복원
```bash
curl -X POST http://localhost:5001/api/restore-backup \
  -H "Content-Type: application/json" \
  -d '{"filename": "App.tsx_20231201_143022.backup", "target_path": "src/App.tsx"}'
```

## 💡 개발 팁

### 1. 긴 코드 편집 전략

#### 단계별 접근
1. **파일 구조 분석**: 먼저 파일의 전체 구조를 파악
2. **섹션별 편집**: 큰 파일을 논리적 섹션으로 나누어 편집
3. **백업 생성**: 중요한 변경 전에 수동 백업 생성
4. **점진적 적용**: 작은 변경사항부터 단계적으로 적용

#### 안전한 편집
- 항상 백업을 확인하고 작업
- 변경사항을 작은 단위로 나누어 적용
- 각 변경 후 테스트 실행

### 2. 효율적인 코드 관리

#### 파일 구조화
- 관련 기능을 별도 파일로 분리
- 공통 컴포넌트는 재사용 가능하게 설계
- 명확한 네이밍 컨벤션 사용

#### 버전 관리
- 중요한 변경사항마다 백업 생성
- 변경 이력을 문서화
- 롤백 계획 수립

### 3. 문제 해결

#### 일반적인 문제들

**파일이 저장되지 않는 경우**
- 파일 권한 확인
- 디스크 공간 확인
- 백업 디렉토리 생성 확인

**백업이 생성되지 않는 경우**
- `code_backups` 디렉토리 권한 확인
- 백업 디렉토리 생성 권한 확인

**API 연결 실패**
- 서버 상태 확인
- 포트 충돌 확인
- 방화벽 설정 확인

## 🔒 보안 고려사항

### 파일 경로 보안
- 상대 경로 사용 금지 (`../` 패턴 차단)
- 절대 경로 사용 금지
- 프로젝트 루트 외부 접근 차단

### 권한 관리
- 파일 읽기/쓰기 권한 확인
- 백업 디렉토리 접근 권한 관리
- 시스템 파일 접근 차단

## 📊 성능 최적화

### 대용량 파일 처리
- 파일 크기 제한 설정
- 청크 단위 처리
- 메모리 사용량 모니터링

### 백업 관리
- 백업 파일 수 제한
- 오래된 백업 자동 삭제
- 백업 압축

## 🆘 지원 및 문의

문제가 발생하거나 추가 기능이 필요한 경우:
1. 로그 파일 확인 (`app.log`)
2. 백업 파일에서 복원 시도
3. 개발팀에 문의

---

**CORBU.AI 개발팀**  
*고급 코드 편집 도구로 효율적인 개발을 경험하세요!*
