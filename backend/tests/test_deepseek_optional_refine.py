import json

from api.question_answer_pipeline.deepseek_optional_refine import (
    deepseek_chat_refine_sync,
    wants_deepseek_pipeline_refine,
)


def test_wants_requires_hints():
    assert wants_deepseek_pipeline_refine({"pipeline_deepseek_refine": True}) is False


def test_wants_false_without_flag_or_env(monkeypatch):
    monkeypatch.delenv("PIPELINE_DEEPSEEK_REFINE", raising=False)
    assert (
        wants_deepseek_pipeline_refine(
            {"deepseek_review_layer_hints": True, "pipeline_deepseek_refine": False}
        )
        is False
    )


def test_deepseek_refine_user_message_includes_multilayer_style_hint(monkeypatch):
    monkeypatch.setattr(
        "api.question_answer_pipeline.deepseek_optional_refine.DEEPSEEK_API_KEY",
        "test-key-for-body-check",
    )

    captured: dict = {}

    class _FakeResp:
        def __init__(self, raw: bytes) -> None:
            self._raw = raw

        def read(self) -> bytes:
            return self._raw

        def __enter__(self):
            return self

        def __exit__(self, *args):
            return None

    def _fake_urlopen(req, timeout=None):
        captured["payload"] = json.loads(req.data.decode("utf-8"))
        body = json.dumps(
            {
                "choices": [{"message": {"content": "x" * 30}}],
                "model": "deepseek-chat",
                "usage": {"total_tokens": 10},
            },
            ensure_ascii=False,
        ).encode("utf-8")
        return _FakeResp(body)

    monkeypatch.setattr(
        "api.question_answer_pipeline.deepseek_optional_refine.urllib.request.urlopen",
        _fake_urlopen,
    )

    ctx = {
        "multilayer_style_hint": {
            "analysis_depth": "surface",
            "style_signature": {"uniqueness": 0.7},
        },
    }
    out, meta = deepseek_chat_refine_sync("초안 본문입니다. " * 3, ctx)
    assert meta.get("refine_applied") is True
    assert len(out) >= 20
    user_content = captured["payload"]["messages"][1]["content"]
    assert "[다층 스타일 힌트]" in user_content
    assert "surface" in user_content
    assert "uniqueness" in user_content
