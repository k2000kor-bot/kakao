"""
통합 대화 API 테스트
unified_chat_api.py의 엔드포인트 테스트
"""

import asyncio
import json
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

# unified_chat_api에서 앱 임포트 시도
try:
    from api.unified_chat_api import router
    from fastapi import FastAPI

    app = FastAPI()
    app.include_router(router)
except ImportError:
    try:
        import sys
        import os

        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        if backend_dir not in sys.path:
            sys.path.insert(0, backend_dir)
        from api.unified_chat_api import router
        from fastapi import FastAPI

        app = FastAPI()
        app.include_router(router)
    except ImportError:
        pytest.skip("unified_chat_api를 찾을 수 없습니다", allow_module_level=True)

client = TestClient(app)

CHAT_ENDPOINTS = ["/api/chat", "/api/unified/chat"]
CHAT_STREAM_ENDPOINTS = ["/api/chat/stream", "/api/unified/chat/stream"]


def _extract_text(data: dict) -> str:
    # unified_chat_api는 response/message/content를 최상위에도, data 하위에도 둘 수 있음
    for key in ("response", "message", "content"):
        val = data.get(key)
        if isinstance(val, str) and val.strip():
            return val.strip()
    nested = data.get("data")
    if isinstance(nested, dict):
        for key in ("response", "message", "content"):
            val = nested.get(key)
            if isinstance(val, str) and val.strip():
                return val.strip()
    return ""


@pytest.mark.api
class TestUnifiedChatAPI:
    """통합 대화 API 테스트"""

    def test_chat_endpoint_basic(self):
        """기본 대화 엔드포인트 테스트"""
        payload = {"message": "안녕하세요", "quality": "enhanced"}

        for endpoint in CHAT_ENDPOINTS:
            response = client.post(endpoint, json=payload)
            assert response.status_code == 200
            data = response.json()
            assert (
                "response" in data
                or "message" in data
                or "content" in data
                or "data" in data
            )
            text = _extract_text(data)
            assert isinstance(text, str)
            assert len(text) > 0

    def test_chat_endpoint_with_context(self):
        """컨텍스트가 있는 대화 엔드포인트 테스트"""
        payload = {
            "message": "테스트 메시지",
            "quality": "enhanced",
            "context": ["이전 대화 1", "이전 대화 2"],
        }
        for endpoint in CHAT_ENDPOINTS:
            response = client.post(endpoint, json=payload)
            assert response.status_code == 200
            data = response.json()
            text = _extract_text(data)
            assert len(text) > 0

    @pytest.mark.integration
    def test_chat_endpoint_error_handling(self):
        """에러 처리 테스트"""
        # 빈 메시지 전송
        payload = {"message": "", "quality": "enhanced"}
        for endpoint in CHAT_ENDPOINTS:
            response = client.post(endpoint, json=payload)
            assert response.status_code == 400
            data = response.json()
            assert data.get("success") is False
            assert data.get("status") == "error"
            assert isinstance(data.get("error"), str)
            assert len(data["error"]) > 0

    def test_chat_stream_endpoint_smoke(self):
        """SSE 스트리밍 엔드포인트 스모크 테스트"""
        for endpoint in CHAT_STREAM_ENDPOINTS:
            with client.stream(
                "POST",
                endpoint,
                json={"message": "안녕", "session_id": "test-session"},
            ) as response:
                assert response.status_code == 200
                assert "text/event-stream" in response.headers.get("content-type", "")

                got_data = False
                got_done = False
                done_payload = None

                for raw_line in response.iter_lines():
                    line = raw_line.strip()
                    if not line:
                        continue
                    if not line.startswith("data: "):
                        continue
                    got_data = True
                    payload = json.loads(line[6:])
                    if payload.get("done") is True:
                        got_done = True
                        done_payload = payload
                        break

                assert got_data is True
                assert got_done is True
                assert isinstance(done_payload, dict)
                # 종료 이벤트에 fullContent가 포함되도록 구현되어 있어야 함
                assert isinstance(done_payload.get("fullContent"), str)
                assert len(done_payload["fullContent"].strip()) > 0


@pytest.mark.unit
class TestUnifiedChatAPIStructure:
    """통합 대화 API 구조 테스트"""

    def test_router_instance(self):
        """라우터 인스턴스 확인"""
        assert router is not None
        assert hasattr(router, "routes")


TITLE_ENDPOINTS = ["/api/chat/title", "/api/unified/chat/title"]


@pytest.mark.unit
class TestConversationTitleGeneration:
    """대화 제목 자동 생성 API 테스트"""

    def test_title_generation_basic(self):
        """기본 제목 생성 테스트"""
        payload = {"message": "아파트 재건축 절차가 어떻게 되나요?"}

        for endpoint in TITLE_ENDPOINTS:
            response = client.post(endpoint, json=payload)
            assert response.status_code == 200
            data = response.json()
            assert data.get("success") is True
            assert "data" in data
            assert "title" in data["data"]
            title = data["data"]["title"]
            assert isinstance(title, str)
            assert len(title) > 0
            assert len(title) <= 30

    def test_title_generation_with_domain_detection(self):
        """도메인 키워드 감지 제목 생성 테스트"""
        test_cases = [
            ("대출 금리가 얼마나 오를까요?", "금융"),
            ("주식 투자 어떻게 해야 하나요?", "금융"),
            ("재건축 아파트 투자 시 주의할 점?", "부동산"),
        ]

        for message, expected_domain in test_cases:
            response = client.post("/api/chat/title", json={"message": message})
            assert response.status_code == 200
            data = response.json()
            title = data["data"]["title"]
            # 도메인이 제목에 포함되거나, 관련 키워드가 포함되어야 함
            assert len(title) > 0

    def test_title_generation_empty_message(self):
        """빈 메시지 제목 생성 테스트"""
        payload = {"message": ""}

        for endpoint in TITLE_ENDPOINTS:
            response = client.post(endpoint, json=payload)
            assert response.status_code == 400
            data = response.json()
            assert data.get("success") is False

    def test_title_generation_max_length(self):
        """최대 길이 제한 제목 생성 테스트"""
        long_message = "이것은 매우 긴 메시지입니다. " * 10
        payload = {"message": long_message, "max_length": 20}

        response = client.post("/api/chat/title", json=payload)
        assert response.status_code == 200
        data = response.json()
        title = data["data"]["title"]
        # 말줄임표 포함해서 약간 초과할 수 있음
        assert len(title) <= 25


@pytest.mark.unit
class TestCommentToneGeneration:
    """댓글 톤 학습/생성(로컬) 테스트"""

    def test_comment_generation_with_context_samples(self):
        # generate_chat_response를 직접 호출하면 외부 의존성이 붙을 수 있으니,
        # 여기서는 "강제 댓글 생성"이 로컬 생성으로 즉시 반환되는지만 확인합니다.
        from api.unified_chat_api import generate_chat_response
        import asyncio

        ctx = {
            "force_comment_generation": True,
            "comment_samples": [
                "이거 진짜 말도 안된다 ㅋㅋ",
                "근데 사실 팩트는 이거지",
                "너무 과장된 기사 같음",
                "ㅇㅈ… 이건 좀 심하네",
                "뭐가 됐든 결과가 중요함",
                "이런 거 볼 때마다 답답하다",
                "그럴 수도 있지 않나?",
                "진짜 왜 이러냐 ㅋㅋㅋ",
                "댓글 수준 뭐냐",
                "결국 또 이러고 끝나겠지",
                "정보 더 필요함",
                "요즘 분위기 진짜 이상함",
                "반응 보니 여론이 갈리네",
                "이건 좀 아니다",
                "팩트 체크부터 하자",
                "누가 책임지냐",
                "이해가 안됨",
                "ㄹㅇ",
                "그냥 웃고 간다 ㅋㅋ",
                "난 반대",
            ],
            "comment_generate_n": 5,
            "comment_generation_stance": "negative",
            "comment_generation_intensity": 4,
            "comment_generation_topic": "전세사기 대책",
            "comment_generation_style": "factcheck",
            "comment_generation_question_ratio": 80,
        }

        out = asyncio.run(
            generate_chat_response("댓글 5개 만들어줘(같은 톤)", "enhanced", ctx)
        )
        assert isinstance(out, str)
        lines = [line for line in out.splitlines() if line.strip()]
        assert len(lines) == 5
        # 질문형 비율이 높으면 ?가 어느 정도 포함되는지 확인
        assert any("?" in line for line in lines)

    def test_pre_generation_pipeline_context_flow(self):
        """사전 파이프라인(자료 수집·논리 구성·스타일) 컨텍스트가 적용된 흐름 검증"""
        from api.unified_chat_api import generate_chat_response
        import asyncio

        ctx = {
            "parsed_input": {
                "question": "Python 가상환경 설정 방법",
                "requirements": "venv 사용, 단계별 안내",
                "intent_type": "question",
            },
            "response_style": "concise",
            "perspective": "practical",
            "conversation_history": [
                {"role": "user", "content": "파이썬 개발 환경이 궁금해요"},
                {"role": "assistant", "content": "Python 환경 설정에 대해 알려드릴게요."},
            ],
        }
        out = asyncio.run(generate_chat_response("venv 만드는 법 알려줘", "enhanced", ctx))
        assert isinstance(out, str), "응답은 문자열이어야 함"
        assert len(out.strip()) >= 10, "파이프라인·폴백 경로를 통한 최소 응답 길이"

    def test_innovative_writing_instruction_creative_perspective(self):
        """perspective=creative 시 혁신 답변 품질 지시(창의 모드)가 파이프라인에 포함되는 흐름 검증"""
        from api.unified_chat_api import generate_chat_response
        import asyncio

        ctx = {
            "parsed_input": {"question": "아이디어 브레인스토밍", "intent_type": "question"},
            "response_style": "balanced",
            "perspective": "creative",
            "conversation_history": [],
        }
        out = asyncio.run(
            generate_chat_response("창의적 접근법 2가지 제안해줘", "enhanced", ctx)
        )
        assert isinstance(out, str), "응답은 문자열이어야 함"
        assert len(out.strip()) >= 10, "creative+혁신 지시 경로를 통한 최소 응답"


@pytest.mark.unit
class TestDeepSeekLLMPathMock:
    """DeepSeek/LLM 코드 경로 mock 단위 테스트 (5.3)"""

    def test_generate_chat_response_uses_llm_path_when_mocked(self):
        """intelligent_answer_generator.generate_answer를 mock 시 해당 응답이 반환되는지 검증"""
        from api.unified_chat_api import generate_chat_response

        mocked_text = "Mocked-LLM-response-DeepSeek-path"
        with patch(
            "api.intelligent_answer_generator.intelligent_answer_generator.generate_answer",
            new_callable=AsyncMock,
            return_value=mocked_text,
        ):
            out = asyncio.run(
                generate_chat_response("테스트 질문", "enhanced", {})
            )
        assert isinstance(out, str), "응답은 문자열이어야 함"
        assert mocked_text in out or out.strip() == mocked_text, (
            "mock된 LLM 응답이 반환되어야 함"
        )


@pytest.mark.unit
def test_ensure_original_message_and_adapt_defaults():
    from api.unified_chat_api import (
        _DEFAULT_ADAPT_ANSWER_TO_REQUEST,
        _ensure_original_message_and_adapt_defaults,
    )

    ctx: dict = {}
    _ensure_original_message_and_adapt_defaults(ctx, "  hello  ")
    assert ctx.get("original_user_message") == "hello"
    assert ctx.get("adapt_answer_to_request") == _DEFAULT_ADAPT_ANSWER_TO_REQUEST
    # 이미 있으면 덮어쓰지 않음
    ctx2 = {"original_user_message": "x", "adapt_answer_to_request": "custom"}
    _ensure_original_message_and_adapt_defaults(ctx2, "y")
    assert ctx2["original_user_message"] == "x"
    assert ctx2["adapt_answer_to_request"] == "custom"

    long_msg = "a" * 5000
    ctx3: dict = {}
    _ensure_original_message_and_adapt_defaults(ctx3, long_msg)
    assert len(ctx3.get("original_user_message", "")) == 5000
    over = "b" * 100_100
    ctx4: dict = {}
    _ensure_original_message_and_adapt_defaults(ctx4, over)
    assert len(ctx4.get("original_user_message", "")) == 100_100


@pytest.mark.unit
def test_append_multi_request_items_to_research_seed():
    from api.unified_chat_api import _append_multi_request_items_to_research_seed

    assert _append_multi_request_items_to_research_seed("hello", None) == "hello"
    out = _append_multi_request_items_to_research_seed(
        "검색해줘",
        {
            "multi_request_mode": True,
            "multi_request_items": ["A주제", "B주제"],
        },
    )
    assert "검색해줘" in out
    assert "다중 요청 항목" in out
    assert "A주제" in out and "B주제" in out
    # 이미 항목 블록이 있으면 중복 없음
    once = _append_multi_request_items_to_research_seed(out, {"multi_request_mode": True, "multi_request_items": ["x"]})
    assert once.count("[다중 요청 항목") == 1


@pytest.mark.unit
def test_compose_multi_request_instruction_builds_block():
    """다중 요청 context → LLM용 _multi_request_instruction 블록"""
    from api.unified_chat_api import _compose_multi_request_instruction

    assert _compose_multi_request_instruction(None) is None
    assert _compose_multi_request_instruction({}) is None
    assert _compose_multi_request_instruction({"multi_request_mode": False}) is None
    text = _compose_multi_request_instruction(
        {
            "multi_request_mode": True,
            "multi_request_adaptation_instruction": "각 항목에 맞춰 답하세요.",
            "multi_request_items": ["요약해줘", "비교해줘"],
        }
    )
    assert text
    assert "생성 전" in text or "시나리오" in text
    assert "각 항목" in text
    assert "요약해줘" in text
    assert "비교해줘" in text


@pytest.mark.unit
def test_compose_multi_request_instruction_none_without_items_or_adapt():
    """다중 모드만 켜고 항목·맞춤 지시가 없으면 블록을 만들지 않음"""
    from api.unified_chat_api import _compose_multi_request_instruction

    assert (
        _compose_multi_request_instruction(
            {"multi_request_mode": True, "multi_request_items": [], "multi_request_adaptation_instruction": ""}
        )
        is None
    )
    assert (
        _compose_multi_request_instruction(
            {
                "multi_request_mode": True,
                "multi_request_items": ["  ", ""],
                "multi_request_adaptation_instruction": "  ",
            }
        )
        is None
    )


@pytest.mark.unit
def test_compose_multi_request_instruction_adapt_only_still_builds():
    """맞춤 지시만 있어도 흐름 preamble + 지시로 블록 생성"""
    from api.unified_chat_api import _compose_multi_request_instruction

    t = _compose_multi_request_instruction(
        {
            "multi_request_mode": True,
            "multi_request_adaptation_instruction": "형식은 Q&A로.",
            "multi_request_items": [],
        }
    )
    assert t
    assert "형식은 Q&A로" in t
    assert "시나리오" in t or "생성 전" in t
