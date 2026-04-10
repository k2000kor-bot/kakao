#!/usr/bin/env python3
"""
웹 연구 기능 테스트 스크립트
"""

import os
import requests
import json

_API_PORT = os.environ.get("API_PORT") or os.environ.get("BACKEND_PORT") or "5002"
_BASE = os.environ.get(
    "CORBU_TEST_API_BASE", f"http://localhost:{_API_PORT}"
).rstrip("/")

def test_web_research():
    """웹 연구 API 테스트"""
    
    # 테스트 데이터
    test_data = {
        "question": "샘플 재개발 프로젝트의 현재 진행 상황과 향후 전망을 분석해주세요.",
        "context": {
            "project_id": "gaeposung_project",
            "user_id": "test_user",
            "conversation_history": [],
            "uploaded_files": []
        }
    }
    
    try:
        # API 호출
        response = requests.post(
            f"{_BASE}/api/analysis/web-research",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ 웹 연구 API 테스트 성공!")
            print(f"응답 타입: {result.get('analysis_type')}")
            print(f"신뢰도: {result.get('result', {}).get('confidence_score', 0) * 100:.1f}%")
            print(f"주요 발견사항 수: {len(result.get('result', {}).get('research_results', {}).get('key_findings', []))}")
            print(f"논리적 반박 수: {len(result.get('result', {}).get('logical_refutations', []))}")
            print(f"권장사항 수: {len(result.get('result', {}).get('recommendations', []))}")
            
            # 상세 결과 출력
            print("\n📋 상세 결과:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        else:
            print(f"❌ API 호출 실패: {response.status_code}")
            print(f"응답: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ 서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.")
    except requests.exceptions.Timeout:
        print("❌ 요청 시간 초과")
    except Exception as e:
        print(f"❌ 오류 발생: {e}")

if __name__ == "__main__":
    print("🔍 웹 연구 기능 테스트 시작...")
    test_web_research()
