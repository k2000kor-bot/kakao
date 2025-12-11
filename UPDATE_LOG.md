# 업데이트 로그

**최신 업데이트**: 2025년 1월 27일

---

## 🆕 최신 업데이트

### 긴 글 자동 생성 기능 추가 (2025-01-27)

**기능**:
- 질문이나 요구를 입력하면 자동으로 상세하고 포괄적인 긴 글 생성
- 키워드 기반 자동 감지
- 구조화된 형식 (서론, 본론, 결론)
- 마크다운 형식 지원

**구현 파일**:
- `backend/llm_service.py`: 메인 로직 구현
- `LONG_FORM_WRITING_FEATURE.md`: 사용자 가이드
- `backend/LONG_FORM_WRITING_IMPLEMENTATION.md`: 구현 상세 문서

**변경사항**:
- `_enhance_with_knowledge`: 키워드 감지 및 프롬프트 강화
- `_get_system_prompt`: 모드별 시스템 프롬프트
- `_call_openai`, `_call_anthropic`, `_call_ollama`, `_call_notebook_llm`: `is_long_form` 파라미터 추가
- `generate_response`: 긴 글 생성 모드 통합

---

## 📋 이전 업데이트

### 프로젝트 관리 시스템 (2025-01-27)
- 프로젝트 생성 및 선택 기능
- 프로젝트별 대화 필터링
- 프로젝트 컨텍스트 전달

### 노트북 LLM 통합 (2025-01-27)
- 로컬 Ollama 기반 LLM 통합
- 하이브리드 모드 지원
- 프로젝트별 노트북 LLM 설정

### ChatGPT 스타일 인터페이스 (2025-01-27)
- 사이드바 및 대화 목록
- 마크다운 렌더링
- 메시지 복사 기능
- 로컬 스토리지 저장

---

**업데이트는 지속적으로 진행됩니다!** 🚀

