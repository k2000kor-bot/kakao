from api.composer_self_develop_hint import attach_composer_self_develop_instruction


def test_attach_skips_when_disabled():
    ctx = {}
    attach_composer_self_develop_instruction(ctx)
    assert "_composer_self_develop_instruction" not in ctx


def test_attach_builds_instruction():
    ctx = {
        "composer_self_develop_enabled": True,
        "composer_self_develop_phase": "integrate",
        "composer_self_develop_lessons": ["항목별 번호 구분"],
    }
    attach_composer_self_develop_instruction(ctx)
    text = ctx["_composer_self_develop_instruction"]
    assert "intake" in text
    assert "integrate" in text
    assert "항목별" in text


def test_attach_proactive_mode():
    ctx = {
        "composer_self_develop_enabled": True,
        "composer_self_develop_proactive": True,
    }
    attach_composer_self_develop_instruction(ctx)
    assert "적극 모드" in ctx["_composer_self_develop_instruction"]
