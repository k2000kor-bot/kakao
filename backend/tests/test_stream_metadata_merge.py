"""stream_metadata_merge — SSE 메타 누적."""

from api.stream_metadata_merge import merge_round_into_aggregated_stream_metadata


def test_merge_skips_empty_round():
    acc = {"task_plan": {"a": 1}, "trace_id": "t1"}
    merge_round_into_aggregated_stream_metadata(acc, {})
    assert acc["trace_id"] == "t1"


def test_merge_round_overwrites_with_nonempty():
    acc = {"trace_id": "old"}
    merge_round_into_aggregated_stream_metadata(
        acc, {"trace_id": "new", "task_plan": {"x": 1}}
    )
    assert acc["trace_id"] == "new"
    assert acc["task_plan"] == {"x": 1}


def test_merge_does_not_overwrite_with_empty_string_or_empty_dict():
    acc = {"task_plan": {"keep": True}, "evidence_coverage": 0.5}
    merge_round_into_aggregated_stream_metadata(
        acc,
        {"task_plan": {}, "evidence_coverage": None, "note": "   "},
    )
    assert acc["task_plan"] == {"keep": True}
    assert acc["evidence_coverage"] == 0.5
    assert "note" not in acc


def test_false_and_zero_are_kept():
    acc: dict = {}
    merge_round_into_aggregated_stream_metadata(
        acc, {"verification_pass": False, "evidence_coverage": 0.0}
    )
    assert acc["verification_pass"] is False
    assert acc["evidence_coverage"] == 0.0
