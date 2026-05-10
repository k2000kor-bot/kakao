# 타입캐스트(Typecast) 벤치마킹 및 핵심 기능 구현

**목적**: Typecast AI TTS의 핵심 구성·기능을 벤치마킹하고, 목소리 생성 기능을 Typecast 수준으로 정리·구현합니다.

**참고**: [Typecast Documentation](https://typecast.ai/docs/overview), [Typecast API Reference](https://typecast.ai/docs/api-reference/text-to-speech/text-to-speech)

---

## 1. Typecast 핵심 기능 (벤치마크 기준)

| 구분 | Typecast | 설명 |
|------|----------|------|
| **모델** | SSFM-v30 / SSFM-v21 | Speech Synthesis Foundation Model, prosody·pacing·emotional expression |
| **감정 제어** | **Smart Emotion** | 텍스트 맥락에서 적절한 감정을 자동 추론해 적용 |
| **감정 프리셋** | **7종** | `normal`, `happy`, `sad`, `angry`, `whisper`, `toneup`, `tonedown` (모든 보이스 공통) |
| **감정 제어 방식** | 2가지 | ① Smart Emotion(자동) ② Preset Emotion(수동 선택 + 강도) |
| **언어** | 37개 | 한국어, 영어, 일본어, 중국어, 스페인어, 베트남어 등 |
| **텍스트 길이** | 1~2,000자 | 요청당 |
| **출력 조절** | volume, pitch, tempo | 볼륨·피치·템포 조절 |
| **음성 클로닝** | 참조 오디오 업로드 | presigned URL → 업로드 → 생성 요청 → 상태 확인 |
| **오디오 형식** | WAV, MP3 | WAV 고품질, MP3 스트리밍·배포용 |

---

## 2. 현재 구현 vs Typecast 대비

| Typecast 핵심 | 현재 구현 | 상태 | 비고 |
|---------------|-----------|------|------|
| Smart Emotion (자동 감정) | 없음 | 🔄 추가 | 옵션으로 "자동 감정" 선택 시 instructions에 맥락 반영 또는 API에 smart_emotion 플래그 |
| 7 감정 프리셋 | 자유 텍스트 프롬프트 + 태그(#명료하게 등) | 🔄 보강 | Typecast 7종(normal, happy, sad, angry, whisper, toneup, tonedown) 프리셋 드롭다운 추가 |
| 감정 제어 2가지 (Smart / Preset) | 단일 프롬프트 입력 | 🔄 추가 | "Smart Emotion" vs "Preset 선택" 라디오/토글 도입 |
| volume / pitch / tempo | speed, pitch, pause(끊어읽기) | ✅ 유사 | pitch·속도·끊어읽기 있음. volume은 재생 볼륨으로 대체 가능 |
| 음성 클로닝 (참조 업로드) | URL/프로젝트 보이스 소스 | ✅ 유사 | speech-from-source, speech-from-project로 참조 기반 합성 |
| 상황(스타일) | situation (나레이션, 드라마 대사 등) | ✅ 있음 | TTS_SITUATION_LABELS 다수 |
| 다국어 | 백엔드·API 의존 | 🔄 백엔드 | 언어 선택 UI 확장 시 백엔드 지원 필요 |

---

## 3. 구현 우선순위 (Typecast 정렬)

1. **감정 제어 방식 통일**
   - **Smart Emotion**: "자동으로 텍스트에 맞는 감정 적용" 옵션. 선택 시 `instructions`에 "자동 감정" 또는 API 전달 시 `emotion: auto` 등으로 전달.
   - **Preset Emotion**: 7종 프리셋 드롭다운 (normal, happy, sad, angry, whisper, toneup, tonedown) + 기존 자유 프롬프트는 "추가 지시"로 유지.

2. **UI 구성 (Typecast 스타일)**
   - 감정: [Smart Emotion (자동)] [Preset (수동)] 선택 후, Preset일 때만 7종 드롭다운 표시.
   - 기존 "프롬프트 (Beta)"는 "추가 지시(선택)"로 라벨 변경하고, 프리셋과 병합해 instructions에 전달.

3. **줄 단위 감정**
   - Typecast는 줄/블록별로 감정·속도 설정 가능. 현재 ScriptLine에 tonePrompt·speed·pitch 있음 → 줄 단위에도 "Smart / Preset" 또는 7종 프리셋 선택 추가 가능(2차).

4. **문서·검증**
   - 이 벤치마크 문서 유지.
   - TTS_AND_SCRIPT_STYLE_GUIDE.md에 "Typecast 벤치마크 반영: Smart Emotion, 7 감정 프리셋" 요약 추가.

---

## 4. 검증

- 목소리 생성 탭에서 **Smart Emotion** / **Preset** 전환 시 UI 변경 확인.
- **Preset** 선택 시 7종(normal, happy, sad, angry, whisper, toneup, tonedown) 드롭다운 표시 및 선택 시 TTS 요청에 반영되는지 확인.
- 기존 테스트: `npm run test:tts:all`, `npm run test:p4:services`.

---

*이 문서는 Typecast 공식 문서(2025–2026)를 기준으로 작성되었으며, 구현 시 TTS_AND_SCRIPT_STYLE_GUIDE.md 및 backend TTS API와 함께 참고합니다.*

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](../COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](../FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](../PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

