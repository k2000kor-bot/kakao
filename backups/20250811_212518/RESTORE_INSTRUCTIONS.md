# CORBU AI 최적화된 시스템 복원 지침서

## 🔄 복원 방법

### 1. 서버 시작
```bash
# 최적화된 빌드로 서버 시작
npx serve -s backups/20250811_212518/optimized_build -l 3003
```

### 2. 아이콘 복원 (필요시)
```bash
# PWA 아이콘 복원
cp -r backups/20250811_212518/optimized_icons/* public/icons/
```

### 3. CSS 복원 (필요시)
```bash
# 최적화된 CSS 복원
cp backups/20250811_212518/optimized_app.css src/App.css
```

### 4. PWA 아이콘 재생성 (필요시)
```bash
# 아이콘 스크립트 실행
chmod +x backups/20250811_212518/optimize_pwa_icons.sh
./backups/20250811_212518/optimize_pwa_icons.sh
```

## 📋 복원 체크리스트

### 필수 확인 사항
- [ ] 포트 3003이 사용 가능한지 확인
- [ ] Node.js와 npm이 설치되어 있는지 확인
- [ ] serve 패키지가 설치되어 있는지 확인 (`npm install -g serve`)

### 성능 확인
- [ ] 페이지 로딩 시간: 35-69ms
- [ ] 아이콘 로딩: 2-3ms
- [ ] API 응답: 4-43ms
- [ ] 입력창 폭: 1400px 최대

### PWA 기능 확인
- [ ] 모바일에서 홈 화면 추가 가능
- [ ] 오프라인 기능 작동
- [ ] 스플래시 스크린 표시
- [ ] 아이콘 정상 표시

## 🚨 문제 해결

### 서버가 시작되지 않는 경우
```bash
# 포트 확인
lsof -i :3003

# 프로세스 종료
pkill -f "serve"

# 다시 시작
npx serve -s backups/20250811_212518/optimized_build -l 3003
```

### 아이콘이 표시되지 않는 경우
```bash
# 아이콘 재생성
./backups/20250811_212518/optimize_pwa_icons.sh

# 브라우저 캐시 삭제 후 새로고침
```

### CSS 스타일이 적용되지 않는 경우
```bash
# CSS 복원
cp backups/20250811_212518/optimized_app.css src/App.css

# 새 빌드 생성
npm run build
```

## 📞 지원 정보
- **백업 ID**: 20250811_212518
- **생성 일시**: 2025년 8월 11일 오후 9시 25분
- **버전**: v1.1.0 (최적화 완료)

---
**참고**: 이 백업은 최적화된 상태를 보존하기 위해 생성되었습니다.
