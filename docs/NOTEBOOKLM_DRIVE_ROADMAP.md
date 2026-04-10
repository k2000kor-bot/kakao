# NotebookLM Google Drive 연동 로드맵

**현재 상태**: UI 스텁 (준비 중 모달)  
**목표**: Google Drive에서 문서·PDF·스프레드시트를 가져와 노트북 소스로 추가

---

## 1. 지원 예정 형식

| 형식 | 우선순위 | 비고 |
|------|----------|------|
| Google Docs | P0 | 텍스트 직접 추출 |
| PDF | P0 | 기존 PDF 추출 로직 재사용 |
| Google Sheets | P1 | 스프레드시트 → 텍스트/CSV |
| Google Slides | P2 | 슬라이드 노트·텍스트 추출 |
| 폴더 단위 선택 | P1 | 한 번에 여러 파일 가져오기 |

---

## 2. 구현 단계

### Phase 1: OAuth·파일 선택 (필수)
1. **Google OAuth 2.0 설정**
   - Google Cloud Console에서 OAuth 클라이언트 ID 발급
   - Drive API v3 scope: `drive.readonly`, `drive.file`
   - 백엔드 `/api/auth/google/drive` 토큰 교환
2. **파일 피커 UI**
   - Google Picker API 또는 Drive API `files.list`로 파일 목록
   - MIME 타입 필터: Docs, PDF, Sheets
   - 다중 선택 지원

### Phase 2: 텍스트 추출·소스 등록
1. **Docs/Sheets**: Drive API `files.export` (text/plain, text/csv)
2. **PDF**: 기존 `projectService.addSourceFromFile` 또는 백엔드 추출 API 활용
3. **소스 등록**: `addNotebookSource`·`addSourceFromUrl` 플로우에 Drive 경로 연동

### Phase 3: 폴더·동기화 (선택)
- 폴더 선택 시 하위 파일 일괄 가져오기
- 변경 감지·증분 동기화 (Phase 4+)

---

## 3. 의존성

- **백엔드**: `google-auth`, `google-api-python-client` (requirements.txt 추가)
- **프론트**: Google Identity Services (gsi) 또는 Picker API 스크립트 로드
- **환경 변수**: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (또는 서버 측 인증)

---

## 4. 연관 문서

- [NOTEBOOKLM_FEATURE_ROADMAP.md](./NOTEBOOKLM_FEATURE_ROADMAP.md) — Phase 4 Drive 스텁
- [NOTEBOOKLM_FEATURE_AND_KNOWLEDGE_CHECKLIST.md](./NOTEBOOKLM_FEATURE_AND_KNOWLEDGE_CHECKLIST.md) — 소스 추가 현황
- [BACKLOG.md](./BACKLOG.md) — P3 NotebookLM Drive 연동
