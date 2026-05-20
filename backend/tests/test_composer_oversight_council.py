"""composer_oversight_council — Council v2 백엔드 연동"""

from api.composer_oversight_council import (
    attach_composer_oversight_council_instruction,
    council_verifier_supplement,
    enrich_task_plan_with_council,
    is_oversight_council_active,
)


def test_is_oversight_council_active() -> None:
    assert is_oversight_council_active({"composer_oversight_council_v2": True})
    assert not is_oversight_council_active({"conversation_graph_analysis": True, "composer_oversight_council_v2": True})


def test_enrich_task_plan() -> None:
    tp = enrich_task_plan_with_council(
        {"pipeline_status": "ok"},
        {"composer_oversight_council_v2": True, "composer_oversight_work_items": [{}, {}]},
    )
    assert tp.get("oversight_council_phases")
    assert tp.get("oversight_work_item_count") == 2


def test_council_verifier_supplement_generic_chat() -> None:
    issues = council_verifier_supplement(
        "좋은 질문이네요! 더 정확한 답변을 위해 알려주세요.",
        {"composer_oversight_council_v2": True},
    )
    assert any("일반 채팅" in i for i in issues)


def test_attach_council_instruction() -> None:
    ctx = {
        "composer_oversight_enabled": True,
        "composer_oversight_council_v2": True,
        "composer_oversight_council_instruction": "Council 본문",
        "composer_oversight_execution_brief": "브리프",
    }
    attach_composer_oversight_council_instruction(ctx)
    assert "_composer_oversight_instruction" in ctx
    assert "_oversight_council_writer_brief" in ctx
