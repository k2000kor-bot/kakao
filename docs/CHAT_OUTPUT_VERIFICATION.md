# 대화 질문·답변 실제 출력 검증

입력창에 텍스트를 넣었을 때 **질문 내용(오른쪽)** 과 **답변 생성 내용(왼쪽)** 이 실제로 출력되는지 확인하는 방법입니다.

## 자동 검증 (테스트)

다음 명령으로 관련 로직이 정상 동작하는지 확인할 수 있습니다.

```bash
# 스트리밍: onChunk/onComplete 호출로 최종 텍스트 전달 검증
npm test -- --testPathPattern="streamingClient" --watchAll=false

# 대화 API·응답 처리 검증
npm test -- --testPathPattern="chatService" --watchAll=false

# 전체 완성도 검증 (타입·린트·P4 148 tests)
npm run verify:completion
```

- **streamingClient.test**: `streamChatMessage`가 스트림 완료 시 `onComplete(fullText)` 호출 → UI에서 이 값으로 최종 답변이 그려짐.
- **chatService.test**: 대화 API 호출·응답 추출·폴백 처리 검증.
- **verify:completion**: P4 서비스 148 tests 포함, 대화·노트북 스트리밍·프로젝트 등 통과 시 출력 파이프라인 정상으로 간주.

## 수동 확인 (브라우저)

1. **프론트 실행**  
   `npm start` 후 http://localhost:3000 접속.

2. **질문 출력 확인**  
   - 입력창에 예: `안녕하세요` 입력 후 Enter 또는 전송 버튼 클릭.  
   - **오른쪽**에 방금 입력한 질문 내용이 말풍선으로 바로 보여야 함.

3. **답변 출력 확인**  
   - **백엔드 실행 중**(`npm run restart:backend` 등으로 5002 기동)  
     - **왼쪽**에 AI 답변이 스트리밍 또는 한 번에 표시됨.  
   - **백엔드 미실행**  
     - **왼쪽**에 “백엔드에 연결할 수 없습니다. 실제 답변 생성에는…” 안내 문구가 표시됨.  
   - 둘 다 “답변 영역에 무언가 출력됨”이면 정상.

4. **레이아웃**  
   - 사용자 메시지: 화면 **오른쪽** 정렬.  
   - AI 메시지: 화면 **왼쪽** 정렬.

## 구현 요약

- **flushSync**: 스트리밍/비스트리밍/에러 모든 경로에서 최종 대화 상태를 `flushSync`로 반영해, 질문·답변이 화면에 즉시 그려지도록 함.
- **에러 시**: 네트워크/연결 실패 시 `getErrorMessage`에서 백엔드 연결 안내 문구를 반환해, 왼쪽에 안내가 출력됨.
- **CSS**: `.user-message`(오른쪽), `.assistant-message`(왼쪽)로 대화창 레이아웃 적용.

최종 확인: `npm run verify:completion` 통과 후, 위 수동 절차로 한 번 전송해 보면 실제 출력 여부를 확인할 수 있습니다.
