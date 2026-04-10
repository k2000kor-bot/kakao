# 2단계 검증 가이드: 백엔드 한국어 프로필 수신 확인

**목적**: 프론트엔드에서 전송한 `korean_understanding` 프로필이 백엔드에서 제대로 수신되는지 검증

---

## ✅ 완료된 작업

1. **백엔드 수신 로그 추가**
   - `unified_chat_api.py`의 `unified_chat` 함수에 한국어 프로필 수신 로그 추가
   - `unified_chat_stream` 함수에도 스트리밍 경로 로그 추가
   - `generate_chat_response` 함수에 프로필 전달 확인 로그 추가

2. **프론트엔드 디버깅 로그**
   - `ChatGPTInterface.tsx`에 개발 환경에서 프로필 생성 로그 추가

---

## 🧪 검증 방법

### 1. 프론트엔드 검증

1. 개발 서버 실행
   ```bash
   cd kakao-frontend
   npm run start:dev
   ```

2. 브라우저에서 한글 입력 테스트
   - 예: "위 내용 카톡용으로 반박해줘"
   - 브라우저 개발자 도구 콘솔 열기 (F12)

3. 콘솔에서 다음 로그 확인:
   ```
   [Korean Layer] Profile generated: {
     genre: "kakao_message",
     speech_act: "rebuttal_request",
     formality: "semi_formal",
     ...
   }
   ```

4. 네트워크 탭에서 API 요청 확인:
   - `/api/chat` 또는 `/api/unified/chat` 요청 선택
   - Payload 탭에서 `context.korean_understanding` 필드 확인

### 2. 백엔드 검증

1. 백엔드 서버 실행
   ```bash
   cd kakao-frontend/backend
   python -m uvicorn main_server:app --port 5002
   ```

2. 백엔드 로그에서 다음 메시지 확인:
   ```
   [Korean Layer] Received profile: genre=kakao_message, speech_act=rebuttal_request, formality=semi_formal, tone_hint=strong
   [Korean Layer] Genre control: output_genre=kakao_message, sentence_length=short, line_break_style=chat, politeness=semi_formal
   ```

3. 스트리밍 경로 테스트:
   - 프론트엔드에서 스트리밍 모드로 한글 입력
   - 백엔드 로그에서 `[Korean Layer Stream]` 메시지 확인

---

## 🔍 예상 로그 출력

### 정상 케이스

**프론트엔드 콘솔:**
```javascript
[Korean Layer] Profile generated: {
  genre: "kakao_message",
  speech_act: "rebuttal_request",
  formality: "semi_formal",
  tone_hint: "strong",
  audience_hint: "unspecified",
  ellipsis_notes: 1
}
[Korean Layer] Genre Control: {
  output_genre: "kakao_message",
  sentence_length: "short",
  line_break_style: "chat",
  politeness: "semi_formal"
}
```

**백엔드 로그:**
```
INFO: [Korean Layer] Received profile: genre=kakao_message, speech_act=rebuttal_request, formality=semi_formal, tone_hint=strong
INFO: [Korean Layer] Genre control: output_genre=kakao_message, sentence_length=short, line_break_style=chat, politeness=semi_formal
DEBUG: [Korean Layer] Profile passed to generate_chat_response: genre=kakao_message, speech_act=rebuttal_request
```

### 비정상 케이스 (프로필 누락)

**백엔드 로그:**
```
WARNING: [Korean Layer] enable_korean_depth is True but korean_understanding is missing
```

이 경우 프론트엔드에서 프로필 생성이 실패했거나 전송되지 않은 것입니다.

---

## 🐛 문제 해결

### 문제 1: 프론트엔드에서 프로필이 생성되지 않음

**원인**: 한글이 포함되지 않은 입력 또는 `containsHangul` 함수 오작동

**해결**:
1. 입력에 한글이 포함되어 있는지 확인
2. 브라우저 콘솔에서 `containsHangul("테스트")` 직접 테스트

### 문제 2: 백엔드에서 프로필을 받지 못함

**원인**: API 요청 페이로드에 `context`가 누락되었거나 형식이 잘못됨

**해결**:
1. 네트워크 탭에서 실제 전송 페이로드 확인
2. `context`가 객체(dict) 형식인지 확인
3. `context.korean_understanding` 필드 존재 확인

### 문제 3: 로그가 출력되지 않음

**원인**: 로깅 레벨 설정 문제

**해결**:
1. 백엔드 로깅 레벨이 `INFO` 이상인지 확인
2. `logger.info` 대신 `logger.warning` 사용 (임시)

---

## ✅ 2단계 완료 기준

- [x] 백엔드에 한국어 프로필 수신 로그 추가 완료
- [ ] 프론트엔드에서 한글 입력 시 프로필 생성 확인
- [ ] 네트워크 탭에서 API 요청에 프로필 포함 확인
- [ ] 백엔드 로그에서 프로필 수신 확인
- [ ] 스트리밍 경로에서도 프로필 수신 확인

---

## 📝 다음 단계 (3단계 준비)

2단계 검증이 완료되면 다음 작업을 진행합니다:

1. **Task Planner 통합**: 한국어 프로필을 받아 모드/형식 결정
2. **프롬프트 빌더 통합**: 한국어 지시 블록 주입
3. **Blueprint Generator 통합**: 장르별 구조 설계

자세한 내용은 [`KOREAN_LAYER_IMPLEMENTATION_ROADMAP.md`](./KOREAN_LAYER_IMPLEMENTATION_ROADMAP.md) 3단계 섹션 참고.

---

**마지막 업데이트**: 2026-03-03
