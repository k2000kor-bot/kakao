"""
api.intent_analysis 공유 모듈 단위 테스트
"""

import pytest
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from api.intent_analysis import (
    analyze_intent,
    analyze_intent_only,
    extract_keywords,
)


class TestExtractKeywords:
    def test_extract_keywords_two_chars(self):
        # 2글자 이상 단어만 포함 (한글 단일 문자 '가','나','다'는 len==1이라 제외)
        assert extract_keywords("ab cd ef") == ["ab", "cd", "ef"]
        assert extract_keywords("Python 프로그래밍") == ["Python", "프로그래밍"]

    def test_extract_keywords_skips_single_char(self):
        assert "a" not in extract_keywords("a bc d ef")
        assert extract_keywords("a bc d ef") == ["bc", "ef"]

    def test_extract_keywords_max_10(self):
        words = " ".join(f"word{i}" for i in range(15))
        result = extract_keywords(words)
        assert len(result) == 10

    def test_extract_keywords_empty(self):
        assert extract_keywords("") == []
        assert extract_keywords("  ") == []


class TestAnalyzeIntent:
    def test_greeting(self):
        r = analyze_intent("안녕하세요")
        assert r["type"] == "greeting"
        assert "confidence" in r

    def test_gratitude(self):
        r = analyze_intent("감사합니다")
        assert r["type"] == "gratitude"

    def test_question(self):
        r = analyze_intent("질문이 있습니다. 어떻게 하면 될까요?")
        assert r["type"] == "question"

    def test_request(self):
        r = analyze_intent("도와주세요")
        assert r["type"] == "request"

    def test_general_fallback(self):
        r = analyze_intent("xyz unknown text")
        assert r["type"] == "general"
        assert r["confidence"] == 0.5


class TestAnalyzeIntentOnly:
    def test_returns_intent_and_keywords(self):
        r = analyze_intent_only("안녕하세요")
        assert "intent" in r
        assert "keywords" in r
        assert r["intent"]["type"] == "greeting"
        assert isinstance(r["keywords"], list)
        assert len(r["keywords"]) <= 10

    def test_keywords_from_message(self):
        r = analyze_intent_only("Python 프로그래밍 배우고 싶어요")
        assert "intent" in r
        assert "keywords" in r
        assert any("Python" in k or "프로그래밍" in k for k in r["keywords"])
