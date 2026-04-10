# YouTube 영상을 지식으로 활용하기

**YouTube 영상**을 자막 추출·이해(요약/핵심)해 지식으로 쌓고, 대화/질문·답변에서 근거로 사용합니다.  
별도 “유튜브 추가” 화면 없이 **입력창에 URL을 넣거나**, **답변 생성 과정에서 자료가 부족할 때 스스로 영상을 검색·습득**하는 방식으로 동작합니다.

---

## 요약

| 방식 | 설명 |
|------|------|
| **입력창에 URL 포함** | 메시지에 YouTube 링크가 있으면 자동으로 자막 추출·요약 후 이번 턴 지식으로 반영. 프로젝트가 있으면 노트북 소스로도 저장. |
| **근거 부족 시 자동 습득** | 질문·답변 파이프라인에서 evidence가 부족하면 검색어로 영상 검색 → 자막 추출·요약 → 지식으로 병합 후 재검색·답변 생성. |
| **(선택) API로 소스 추가** | `POST .../notebook-sources/from-youtube-url` / `from-youtube-search` 로 노트북 소스 직접 추가. |

추가된 지식은 `projectKnowledge`로 Retriever에 전달되어 evidence로 사용됩니다.

---

## 0. 별도 UI 없이 동작하는 흐름

- **입력창**: 사용자가 대화 메시지에 YouTube URL을 넣으면, 해당 영상 자막을 추출하고 LLM으로 요약·핵심만 뽑아 이번 답변의 지식으로 씁니다. 프로젝트가 있으면 같은 내용을 노트북 소스로 저장해 이후 대화에서도 사용합니다.
- **답변 생성 중**: 파이프라인에서 “근거 필요”로 판단했는데 evidence coverage가 낮으면, 질문 문장으로 YouTube를 검색해 영상 자막을 가져와 요약한 뒤 `projectKnowledge`에 붙이고 다시 검색합니다. 성공하면 그대로 synthesis → writer로 이어져 답변을 냅니다. 이때 **프로젝트가 있으면 습득한 영상 지식을 노트북 소스로 저장**해 두어, 다음 대화부터는 별도 검색 없이 해당 지식을 사용합니다.

둘 다 **영상 이해**(자막 원문이 아니라 요약·핵심 지식)로 쌓도록 하며, 기능 전용 화면은 두지 않습니다.

---

## 1. API로 URL 하나 추가 (선택)

특정 YouTube 영상 하나의 자막을 추출해 프로젝트 지식으로 등록합니다.

**요청**

- **Method**: `POST`
- **Path**: `/api/projects/{project_id}/notebook-sources/from-youtube-url`
- **Body (JSON)**:
  ```json
  { "url": "https://www.youtube.com/watch?v=VIDEO_ID" }
  ```
  - `youtu.be/VIDEO_ID` 형식도 가능합니다.

**응답 예시**

```json
{
  "success": true,
  "data": {
    "source": {
      "id": "source_...",
      "type": "youtube",
      "title": "영상 제목",
      "content": "(자막 전체 텍스트)"
    },
    "source_count": 3
  }
}
```

**실패 시**

- URL이 YouTube 형식이 아님 → 400, `"유효한 YouTube URL이 아닙니다"`
- 자막 추출 불가(자막 없음/비공개 등) → 400, `"해당 영상에서 자막을 추출할 수 없습니다"`
- 의존성 미설치 → 400/500 안내 메시지에 `youtube-transcript-api` 설치 안내 포함

---

## 2. 검색으로 여러 영상 지식 추가

검색어로 영상을 찾은 뒤, 각 영상 자막을 노트북 소스로 일괄 추가합니다.

**요청**

- **Method**: `POST`
- **Path**: `/api/projects/{project_id}/notebook-sources/from-youtube-search`
- **Body (JSON)**:
  ```json
  {
    "query": "특정인 이름 또는 주제",
    "max_videos": 5,
    "add_first_as_voice_source": false
  }
  ```
  - `max_videos`: 1~15 (기본 5)
  - `add_first_as_voice_source`: true면 첫 영상을 보이스 소스(TTS 학습용)로도 등록

**동작**

1. `yt-dlp`로 `query` 검색 → 영상 목록 조회
2. 각 영상에 대해 `youtube-transcript-api`로 자막 추출
3. 자막이 있는 영상만 `add_project_notebook_source(..., source_type="youtube")`로 추가

---

## 3. 파이프라인에서의 사용

- **노트북 컨텍스트**: `load_project_notebook_context_filtered(project_id)`에서 위에서 추가한 소스들이 포함된 `context_text`를 반환합니다.
- **Retriever**: `retriever_adapter`는 `context_pack["projectKnowledge"]`를 프로젝트 지식으로 사용하며, 이 텍스트를 청크로 나누어 evidence로 활용합니다.
- **대화**: 해당 프로젝트로 대화할 때, 유튜브에서 추가한 자막 내용이 근거로 인용될 수 있습니다.

자세한 흐름은 [QUESTION_ANSWER_PIPELINE_ARCHITECTURE.md](./QUESTION_ANSWER_PIPELINE_ARCHITECTURE.md), [BASIC_FLOW_PRIORITY.md](./BASIC_FLOW_PRIORITY.md)를 참고하세요.

---

## 4. 의존성

| 기능 | 패키지 | 비고 |
|------|--------|------|
| 자막 추출 | `youtube-transcript-api` | URL 하나 추가 / 검색 후 추가 공통 |
| 영상 검색·제목 조회 | `yt-dlp` | 검색 API 및 단일 URL 제목 조회 시 사용 |

설치 예시:

```bash
pip install youtube-transcript-api yt-dlp
```

---

## 5. 프론트엔드 연동 예시

- 프로젝트 설정/소스 추가 화면에 **「YouTube 링크 추가」** 입력란을 두고, URL을 입력한 뒤 `POST .../notebook-sources/from-youtube-url` 호출.
- 또는 **「주제/이름으로 YouTube 검색」** 필드에 검색어 입력 후 `POST .../notebook-sources/from-youtube-search` 호출.

추가된 소스는 기존 노트북 소스 목록(`GET .../notebook-sources`)에 `type: "youtube"`로 표시되며, 다른 소스와 동일하게 삭제·활성/비활성 제어가 가능합니다.
