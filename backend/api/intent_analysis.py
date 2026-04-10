"""
공통 의도·키워드 분석 로직 (Flask main.py / FastAPI intent_api 공유)
메시지의 의도(type, confidence)와 키워드 리스트만 반환.
"""

from typing import Any, Dict, List

INTENT_PATTERNS = {
    "question": {
        "keywords": [
            "질문", "물어", "궁금", "?", "어떻게", "왜", "언제", "어디", "누구", "무엇",
        ],
        "patterns": [
            "어떻게", "왜", "언제", "어디서", "누가", "무엇을", "어느", "몇",
        ],
    },
    "request": {
        "keywords": [
            "요청", "부탁", "해줘", "도와", "도움", "부탁해", "해주세요", "해주시면",
        ],
        "patterns": ["해줘", "해주세요", "도와줘", "부탁해", "해주시면"],
    },
    "gratitude": {
        "keywords": [
            "감사", "고마워", "감사해", "고맙", "감사합니다", "고마워요", "감사드려",
        ],
        "patterns": ["감사", "고마워", "고맙", "감사드려", "감사합니다"],
    },
    "greeting": {
        "keywords": [
            "안녕", "인사", "하이", "헬로", "안녕하세요", "안녕히", "반가워",
        ],
        "patterns": ["안녕", "하이", "헬로", "반가워"],
    },
    "complaint": {
        "keywords": [
            "불만", "문제", "화나", "짜증", "실망", "불만족", "문제가",
        ],
        "patterns": ["문제가", "불만", "화나", "짜증", "실망"],
    },
    "compliment": {
        "keywords": ["칭찬", "좋다", "훌륭", "멋져", "최고", "대단", "완벽"],
        "patterns": ["좋다", "훌륭", "멋져", "최고", "대단"],
    },
}


def extract_keywords(text: str, max_keywords: int = 10) -> List[str]:
    """2글자 이상 단어만 키워드로 추출, 최대 max_keywords개 반환."""
    words = text.split()
    keywords = [w for w in words if len(w) >= 2]
    return keywords[:max_keywords]


def analyze_intent(text: str) -> Dict[str, Any]:
    """의도 분석: type, confidence 반환."""
    text_lower = text.lower()
    intent_scores: Dict[str, int] = {}
    confidence = 0.5

    for intent_type, patterns in INTENT_PATTERNS.items():
        score = 0
        for keyword in patterns["keywords"]:
            if keyword in text_lower:
                score += 1
        for pattern in patterns["patterns"]:
            if pattern in text_lower:
                score += 2
        intent_scores[intent_type] = score

    if intent_scores:
        best_intent = max(intent_scores, key=intent_scores.get)
        max_score = intent_scores[best_intent]
        if max_score > 0:
            confidence = min(0.95, 0.5 + max_score * 0.1)
            return {"type": best_intent, "confidence": confidence}

    return {"type": "general", "confidence": confidence}


def analyze_intent_only(message: str) -> Dict[str, Any]:
    """
    의도·키워드만 분석. 메시지 분석 없이 intent + keywords만 반환.
    Returns:
        {"intent": {"type": str, "confidence": float}, "keywords": List[str]}
    """
    intent = analyze_intent(message)
    keywords = extract_keywords(message)
    return {"intent": intent, "keywords": keywords}
