"""notebook_llm_integration — context temperature·max_tokens 읽기"""
import pytest

from notebook_llm_integration import _read_temperature_max_tokens_from_context


def test_defaults_when_no_context():
    assert _read_temperature_max_tokens_from_context(None, 0.7, 1024) == (0.7, 1024)


def test_reads_from_context():
    ctx = {"temperature": 0.2, "max_tokens": 8192}
    assert _read_temperature_max_tokens_from_context(ctx, 0.7, 1024) == (0.2, 8192)


def test_invalid_values_fall_back_to_defaults():
    ctx = {"temperature": "bad", "max_tokens": -1}
    t, m = _read_temperature_max_tokens_from_context(ctx, 0.5, 2048)
    assert t == 0.5
    assert m == 2048  # <= 0 → default_max
