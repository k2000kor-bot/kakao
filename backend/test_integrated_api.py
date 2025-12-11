#!/usr/bin/env python3
"""
통합 API 테스트 스크립트
"""

import requests
import json
from typing import Dict, Any

BASE_URL = "http://localhost:8000/api/integrated"


def test_endpoint(
    method: str, endpoint: str, data: Dict[str, Any] = None
) -> Dict[str, Any]:
    """엔드포인트 테스트"""
    url = f"{BASE_URL}{endpoint}"
    print(f"\n{'=' * 60}")
    print(f"Testing: {method} {endpoint}")
    print(f"{'=' * 60}")

    try:
        if method == "GET":
            response = requests.get(url, timeout=10)
        elif method == "POST":
            response = requests.post(
                url, json=data, headers={"Content-Type": "application/json"}, timeout=10
            )
        else:
            return {"error": f"Unsupported method: {method}"}

        print(f"Status Code: {response.status_code}")
        result = response.json()
        print(f"Response: {json.dumps(result, indent=2, ensure_ascii=False)}")
        return result

    except requests.exceptions.ConnectionError:
        print("❌ 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.")
        return {"error": "Connection failed"}
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        return {"error": str(e)}


def main():
    """메인 테스트 함수"""
    print("🚀 통합 API 테스트 시작")
    print(f"Base URL: {BASE_URL}")

    # 기본 기능 테스트
    print("\n📋 기본 기능 테스트")
    test_endpoint("GET", "/health")
    test_endpoint("GET", "/status")
    test_endpoint("GET", "/metrics")
    test_endpoint("GET", "/analytics")
    test_endpoint("GET", "/logs")

    # 메시지 분석 테스트
    print("\n💬 메시지 분석 테스트")
    test_endpoint(
        "POST",
        "/analyze",
        {"message": "안녕하세요! 정말 좋은 서비스네요! 감사합니다!"},
    )

    # 창작 콘텐츠 테스트
    print("\n✍️ 창작 콘텐츠 테스트")
    test_endpoint("POST", "/creative/story", {"genre": "romance", "theme": "사랑"})
    test_endpoint("POST", "/creative/poem", {"type": "lyric", "theme": "희망"})
    test_endpoint("POST", "/creative/essay", {"type": "personal", "topic": "성장"})
    test_endpoint(
        "POST",
        "/creative/analyze",
        {
            "text": "이것은 테스트 텍스트입니다. 여러 문장으로 구성되어 있습니다. 가독성을 높이기 위해 문단을 나누어 작성했습니다."
        },
    )

    # 설득 콘텐츠 테스트
    print("\n🎯 설득 콘텐츠 테스트")
    test_endpoint(
        "POST",
        "/persuasion/construction",
        {
            "company_name": "테스트 건설사",
            "project_type": "주택건설",
            "persuasion_level": "high",
        },
    )
    test_endpoint(
        "POST",
        "/persuasion/contractor",
        {
            "company_name": "테스트 시공사",
            "service_type": "인테리어",
            "persuasion_level": "medium",
        },
    )

    # 마케팅 콘텐츠 테스트
    print("\n📱 마케팅 콘텐츠 테스트")
    test_endpoint(
        "POST",
        "/marketing/social",
        {
            "platform": "instagram",
            "content_type": "post",
            "industry": "건설업",
            "company_name": "테스트 회사",
            "tone": "professional",
        },
    )
    test_endpoint(
        "POST",
        "/marketing/email",
        {
            "email_type": "promotional",
            "industry": "건설업",
            "company_name": "테스트 회사",
            "urgency_level": "high",
        },
    )

    # 고급 분석 테스트
    print("\n📊 고급 분석 테스트")
    test_endpoint(
        "POST",
        "/analytics/advanced",
        {"analysis_type": "sentiment_trend", "time_range": "7d"},
    )
    test_endpoint(
        "POST",
        "/analytics/predictions",
        {"prediction_type": "user_satisfaction", "prediction_horizon": "30d"},
    )
    test_endpoint(
        "POST", "/analytics/insights", {"insight_type": "general", "focus_area": "all"}
    )

    # AI 최적화 테스트
    print("\n🤖 AI 최적화 테스트")
    test_endpoint(
        "POST",
        "/ai/optimize",
        {"optimization_type": "performance", "target_metric": "response_time"},
    )
    test_endpoint(
        "POST",
        "/ai/benchmark",
        {"benchmark_type": "comprehensive", "test_data_size": "medium"},
    )
    test_endpoint(
        "POST",
        "/ai/feedback",
        {
            "feedback_type": "user_rating",
            "content": "테스트 피드백",
            "rating": 5,
            "correction": "",
            "context": {},
        },
    )

    print("\n✅ 테스트 완료!")


if __name__ == "__main__":
    main()
