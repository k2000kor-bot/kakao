"""llm_service.py 순수 헬퍼·폴백 (네트워크·API 키 불필요)."""

import pytest

from llm_service import LLMService


class TestSafeTemperature:
    def test_clamps_to_cap(self) -> None:
        assert LLMService._safe_temperature(5.0, cap=2.0) == 2.0

    def test_clamps_negative_to_zero(self) -> None:
        assert LLMService._safe_temperature(-1.0) == 0.0

    def test_invalid_uses_default(self) -> None:
        assert LLMService._safe_temperature(None) == 0.7
        assert LLMService._safe_temperature("not-a-number") == 0.7

    def test_string_number(self) -> None:
        assert LLMService._safe_temperature("0.3") == pytest.approx(0.3)


class TestSafeMaxTokens:
    def test_invalid_uses_default(self) -> None:
        assert LLMService._safe_max_tokens(None, default=1024) == 1024

    def test_clamps_to_cap(self) -> None:
        assert LLMService._safe_max_tokens(999_999, default=512, cap=4096) == 4096

    def test_zero_becomes_at_least_one(self) -> None:
        assert LLMService._safe_max_tokens(0, default=512) == 1

    def test_string_number(self) -> None:
        assert LLMService._safe_max_tokens("128", default=64) == 128


class TestOpenaiCompatibleHistory:
    def test_skips_system_and_empty(self) -> None:
        hist = [
            {"role": "system", "content": "sys"},
            {"role": "user", "content": ""},
            {"role": "user", "content": "  hi  "},
            {"role": "assistant", "content": "yo"},
        ]
        out = LLMService._openai_compatible_history(hist)
        assert out == [
            {"role": "user", "content": "  hi  "},
            {"role": "assistant", "content": "yo"},
        ]

    def test_unknown_role_maps_to_user(self) -> None:
        out = LLMService._openai_compatible_history([{"role": "guest", "content": "x"}])
        assert out == [{"role": "user", "content": "x"}]

    def test_bot_maps_to_assistant(self) -> None:
        out = LLMService._openai_compatible_history([{"role": "bot", "content": "x"}])
        assert out == [{"role": "assistant", "content": "x"}]


class TestModelOverrideFromContext:
    def test_none(self) -> None:
        assert LLMService._model_override_from_context(None) is None

    def test_prefers_llm_model(self) -> None:
        ctx = {"llm_model": "  a  ", "model": "b"}
        assert LLMService._model_override_from_context(ctx) == "a"

    def test_model_when_no_llm_model(self) -> None:
        assert LLMService._model_override_from_context({"model": "gpt-test"}) == "gpt-test"


@pytest.fixture
def llm_service() -> LLMService:
    return LLMService()


class TestGenerateFallbackResponse:
    def test_greeting_branch(self, llm_service: LLMService) -> None:
        r = llm_service._generate_fallback_response("안녕하세요")
        assert r["model"] == "fallback"
        assert r["confidence"] == 0.6
        assert "content" in r and len(r["content"]) > 0

    def test_generic_branch_truncates_long_message(self, llm_service: LLMService) -> None:
        long_msg = "x" * 300
        r = llm_service._generate_fallback_response(long_msg)
        assert "…" in r["content"] or "..." in r["content"] or "200" in r["content"]


class TestEnhanceWithGenerationScenario:
    def test_generation_scenario_markdown_in_prefix(self, llm_service: LLMService) -> None:
        enhanced, _ = llm_service._enhance_with_knowledge(
            "간단 질문",
            {"_generation_scenario_markdown": "## 플랜\n- 단계 A"},
        )
        assert "[답변 생성 시나리오" in enhanced
        assert "단계 A" in enhanced
        assert "간단 질문" in enhanced
