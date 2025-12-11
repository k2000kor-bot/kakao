# 정적 파일 404 오류 해결 가이드

## 🔍 문제 분석

다음 오류들이 발생하고 있습니다:
- `GET http://localhost:3000/manifest.json 404 (Not Found)`
- `GET http://localhost:3000/favicon.ico 404 (Not Found)`
- `GET http://localhost:3000/icons/icon-32x32.png 404 (Not Found)`
- `GET http://localhost:3000/icons/icon-16x16.png 404 (Not Found)`

## 🎯 원인

**Service Worker가 정적 파일 요청을 가로채고 있지만, 캐시에 파일이 없어서 404를 반환하고 있습니다.**

React 개발 서버는 `public` 폴더의 파일들을 정상적으로 서빙할 수 있지만, Service Worker가 먼저 요청을 가로채서 캐시에서 찾으려고 시도합니다. 캐시에 파일이 없으면 404를 반환합니다.

## ✅ 해결 방법

### 방법 1: Service Worker 업데이트 (완료)

`public/sw.js` 파일을 수정하여 개발 모드에서는 네트워크 우선 전략을 사용하도록 변경했습니다.

**변경 사항:**
- 개발 모드(localhost)에서는 `manifest.json`, `favicon.ico`, `icons/*` 파일을 Service Worker를 우회하여 직접 네트워크에서 가져오도록 수정
- 정적 리소스 요청 처리 함수를 네트워크 우선 전략으로 변경

### 방법 2: 브라우저에서 Service Worker 재등록

1. 브라우저 개발자 도구 열기 (F12)
2. **Application** 탭 선택
3. 왼쪽 메뉴에서 **Service Workers** 클릭
4. **Unregister** 버튼 클릭하여 기존 Service Worker 제거
5. 페이지 새로고침 (Ctrl+Shift+R 또는 Cmd+Shift+R)

### 방법 3: Service Worker 일시 비활성화 (테스트용)

개발 중에는 Service Worker를 일시적으로 비활성화할 수 있습니다:

1. `public/index.html`에서 Service Worker 등록 코드를 주석 처리
2. 또는 브라우저 개발자 도구에서 Service Worker를 비활성화

### 방법 4: 하드 리프레시

브라우저 캐시를 완전히 지우고 새로고침:

- **Chrome/Edge**: Ctrl+Shift+R (Windows) 또는 Cmd+Shift+R (Mac)
- **Firefox**: Ctrl+F5 (Windows) 또는 Cmd+Shift+R (Mac)
- **Safari**: Cmd+Option+R (Mac)

## 🔧 확인 방법

Service Worker 업데이트 후 다음을 확인하세요:

1. **브라우저 콘솔에서 확인:**
```javascript
// manifest.json 확인
fetch('/manifest.json')
  .then(r => r.json())
  .then(data => console.log('✅ manifest.json:', data))
  .catch(err => console.error('❌ manifest.json 오류:', err));

// favicon 확인
fetch('/favicon.ico')
  .then(r => r.ok ? console.log('✅ favicon.ico: OK') : console.error('❌ favicon.ico: NOT FOUND'))
  .catch(err => console.error('❌ favicon.ico 오류:', err));
```

2. **Network 탭에서 확인:**
   - 개발자 도구 → Network 탭
   - `manifest.json`, `favicon.ico` 요청이 200 OK로 응답하는지 확인

## 📝 참고 사항

### 개발 모드 vs 프로덕션 모드

- **개발 모드**: 네트워크 우선 전략 사용 (Service Worker 우회)
- **프로덕션 모드**: 캐시 우선 전략 사용 (오프라인 지원)

### 파일 위치

모든 정적 파일은 `public` 폴더에 있어야 합니다:
- ✅ `public/manifest.json`
- ✅ `public/favicon.ico`
- ✅ `public/icons/icon-32x32.png`
- ✅ `public/icons/icon-16x16.png`

### React 개발 서버

React 개발 서버(`react-scripts start`)는 자동으로 `public` 폴더의 파일들을 루트 경로(`/`)에서 서빙합니다.

## 🚀 다음 단계

1. Service Worker 업데이트 완료 ✅
2. 브라우저에서 Service Worker 재등록
3. 하드 리프레시로 캐시 클리어
4. 오류가 사라졌는지 확인

## ⚠️ 주의사항

이 오류들은 앱의 핵심 기능에는 영향을 주지 않지만, 다음 기능에 영향을 줄 수 있습니다:
- PWA (Progressive Web App) 설치 기능
- 브라우저 탭 아이콘 표시
- 모바일 홈 화면 아이콘

개발 중에는 이 오류들을 무시해도 되지만, 프로덕션 배포 전에는 반드시 해결해야 합니다.

