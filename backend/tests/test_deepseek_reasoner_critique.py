from api.question_answer_pipeline.deepseek_reasoner_critique import (
    wants_deepseek_reasoner_critique,
)


def test_wants_reasoner_requires_hints():
    assert wants_deepseek_reasoner_critique({"pipeline_deepseek_reasoner": True}) is False


def test_wants_reasoner_false_without_flag_or_env(monkeypatch):
    monkeypatch.delenv("PIPELINE_DEEPSEEK_REASONER", raising=False)
    assert (
        wants_deepseek_reasoner_critique(
            {
                "deepseek_review_layer_hints": True,
                "pipeline_deepseek_reasoner": False,
            }
        )
        is False
    )


def test_wants_reasoner_true_with_hints_flag_and_key(monkeypatch):
    monkeypatch.setenv("DEEPSEEK_API_KEY", "sk-test")
    monkeypatch.delenv("PIPELINE_DEEPSEEK_REASONER", raising=False)
    assert (
        wants_deepseek_reasoner_critique(
            {
                "deepseek_review_layer_hints": True,
                "pipeline_deepseek_reasoner": True,
            }
        )
        is True
    )


def test_wants_reasoner_env_global(monkeypatch):
    monkeypatch.setenv("DEEPSEEK_API_KEY", "sk-test")
    monkeypatch.setenv("PIPELINE_DEEPSEEK_REASONER", "true")
    assert wants_deepseek_reasoner_critique({"deepseek_review_layer_hints": True}) is True
