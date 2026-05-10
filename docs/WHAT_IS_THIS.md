# 이걸 뭐 하려는 거야? (CORBU.AI 한눈에 보기)

## 한 줄 요약

**CORBU.AI**는 **ChatGPT처럼 대화하고, 프로젝트별로 정리하고, 목소리 생성 같은 도구까지 쓰는 AI 어시스턴트 웹앱**입니다.

---

## 뭘 할 수 있나요?

| 기능 | 설명 |
|------|------|
| **대화** | 메인 화면(/)에서 질문·요청을 입력하면 AI가 답변. 여러 대화를 만들 수 있고, 사이드바 "내 대화"에서 이전 대화로 이동. |
| **프로젝트** | 주제별로 대화를 묶을 수 있음. "OO 분석 프로젝트"처럼 만들고, 그 프로젝트 안에서만 대화·자료 관리. |
| **목소리 생성** | 텍스트를 음성으로 변환하는 TTS. 사이드바 "도구" → 목소리 생성. |
| **설정·분석·도움말 등** | 사이드바 "더 보기" 또는 라우트로 설정(/settings), 분석(/analytics), 도움말(/docs) 등 접근. |

---

## 화면 구성 (지금 프론트엔드)

- **왼쪽 사이드바**: 로고, 새 대화, 대화 검색, 프로젝트 목록, 도구(목소리), 내 대화 목록. 접기/펼치기 가능, 모바일에서는 메뉴 버튼으로 열기.
- **가운데 메인**: 대화 내용 또는 프로젝트 상세·목소리 생성·설정 등 선택한 페이지.

백엔드 API(대화·프로젝트·TTS 등)와 붙여서 쓰는 구조입니다.

**백엔드 없이 진행하기**: 백엔드 서버가 꺼져 있어도 앱은 동작합니다. 프로젝트·대화은 로컬 스토리지에 저장되고, 콘솔에 "백엔드 서버에 연결할 수 없습니다"가 한 번만 뜨면 정상입니다. 백엔드를 켜려면 터미널에서 `npm run restart:backend` 실행.

**검증·push(개발자)**: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:sidebar-context` · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

---

## 앱에서 확인하기

실행 중인 프론트엔드에서 **사이드바 상단 더 보기(⋮)** → **개발 현황**을 누르면, "이걸 뭐 하려는 거야?"와 지금까지 반영된 변경 사항을 화면에서 바로 볼 수 있습니다. (경로: `/dev-status`)

## 더 보기

- **처음 사용**: [README_FIRST.md](../README_FIRST.md)
- **주요 기능 상세**: [README.md §주요 기능](../README.md#-주요-기능)
- **최근 프론트 변경 사항**: [FRONTEND_CHANGES.md](./FRONTEND_CHANGES.md)

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).
