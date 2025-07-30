#!/usr/bin/env python3
"""
실시간 카카오톡 대화 대응 시스템 테스트 스크립트
- 메인 시스템의 모든 기능을 테스트
"""

import requests
import json
import time
from datetime import datetime

# 서버 설정
BASE_URL = "http://localhost:8004"

def test_health_check():
    """헬스 체크 테스트"""
    print("🔍 헬스 체크 테스트...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ 헬스 체크 성공")
            return True
        else:
            print(f"❌ 헬스 체크 실패: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 헬스 체크 오류: {str(e)}")
        return False

def test_root_endpoint():
    """루트 엔드포인트 테스트"""
    print("🔍 루트 엔드포인트 테스트...")
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            data = response.json()
            print("✅ 루트 엔드포인트 성공")
            print(f"   시스템: {data.get('message', 'N/A')}")
            print(f"   버전: {data.get('version', 'N/A')}")
            print(f"   상태: {data.get('status', 'N/A')}")
            return True
        else:
            print(f"❌ 루트 엔드포인트 실패: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 루트 엔드포인트 오류: {str(e)}")
        return False

def test_capabilities():
    """기능 확인 테스트"""
    print("🔍 기능 확인 테스트...")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/capabilities")
        if response.status_code == 200:
            data = response.json()
            print("✅ 기능 확인 성공")
            enabled_features = [k for k, v in data.items() if v == "enabled"]
            print(f"   활성화된 기능: {len(enabled_features)}개")
            for feature in enabled_features:
                print(f"     ✅ {feature}")
            return True
        else:
            print(f"❌ 기능 확인 실패: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 기능 확인 오류: {str(e)}")
        return False

def test_conversation(message, user_id="test_user"):
    """대화 처리 테스트"""
    print(f"🔍 대화 처리 테스트: {message[:30]}...")
    try:
        payload = {
            "user_message": message,
            "user_id": user_id,
            "conversation_context": {},
            "creativity_level": 0.5
        }
        
        response = requests.post(
            f"{BASE_URL}/api/v1/conversation",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ 대화 처리 성공")
            print(f"   입력: {message}")
            print(f"   출력: {data.get('response_message', 'N/A')}")
            print(f"   신뢰도: {data.get('confidence_score', 0):.2f}")
            print(f"   감정: {data.get('emotion_analysis', {}).get('type', 'N/A')}")
            print(f"   주제: {data.get('topic_classification', 'N/A')}")
            return True
        else:
            print(f"❌ 대화 처리 실패: {response.status_code}")
            print(f"   오류: {response.text}")
            return False
    except Exception as e:
        print(f"❌ 대화 처리 오류: {str(e)}")
        return False

def test_analytics():
    """분석 결과 테스트"""
    print("🔍 분석 결과 테스트...")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/analytics")
        if response.status_code == 200:
            data = response.json()
            print("✅ 분석 결과 성공")
            print(f"   총 대화 수: {data.get('total_conversations', 0)}")
            print(f"   감정 분포: {data.get('emotion_distribution', {})}")
            print(f"   주제 분포: {data.get('topic_distribution', {})}")
            return True
        else:
            print(f"❌ 분석 결과 실패: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 분석 결과 오류: {str(e)}")
        return False

def test_status():
    """시스템 상태 테스트"""
    print("🔍 시스템 상태 테스트...")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/status")
        if response.status_code == 200:
            data = response.json()
            print("✅ 시스템 상태 성공")
            print(f"   상태: {data.get('status', 'N/A')}")
            print(f"   총 요청: {data.get('total_requests', 0)}")
            print(f"   성공률: {data.get('success_rate', 0):.1f}%")
            return True
        else:
            print(f"❌ 시스템 상태 실패: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 시스템 상태 오류: {str(e)}")
        return False

def test_system_test():
    """시스템 테스트 엔드포인트"""
    print("🔍 시스템 테스트 엔드포인트...")
    try:
        response = requests.post(f"{BASE_URL}/api/v1/test")
        if response.status_code == 200:
            data = response.json()
            print("✅ 시스템 테스트 성공")
            print(f"   총 테스트: {data.get('total_tests', 0)}")
            print(f"   성공한 테스트: {data.get('successful_tests', 0)}")
            return True
        else:
            print(f"❌ 시스템 테스트 실패: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 시스템 테스트 오류: {str(e)}")
        return False

def test_batch_processing():
    """배치 처리 테스트"""
    print("🔍 배치 처리 테스트...")
    try:
        batch_requests = [
            {"user_message": "안녕하세요!", "user_id": "batch_user_1"},
            {"user_message": "아파트 시세가 어떻게 될까요?", "user_id": "batch_user_2"},
            {"user_message": "수영장이 정말 좋네요! 😊", "user_id": "batch_user_3"},
            {"user_message": "힘들어요 ㅠㅠ", "user_id": "batch_user_4"},
            {"user_message": "맞아요, 동감합니다", "user_id": "batch_user_5"}
        ]
        
        response = requests.post(
            f"{BASE_URL}/api/v1/batch",
            json=batch_requests,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ 배치 처리 성공")
            print(f"   총 요청: {data.get('total_requests', 0)}")
            print(f"   성공한 요청: {data.get('successful_requests', 0)}")
            return True
        else:
            print(f"❌ 배치 처리 실패: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 배치 처리 오류: {str(e)}")
        return False

def run_comprehensive_test():
    """종합 테스트 실행"""
    print("🚀 실시간 카카오톡 대화 대응 시스템 종합 테스트 시작")
    print("=" * 60)
    
    test_results = []
    
    # 기본 기능 테스트
    test_results.append(("헬스 체크", test_health_check()))
    test_results.append(("루트 엔드포인트", test_root_endpoint()))
    test_results.append(("기능 확인", test_capabilities()))
    test_results.append(("시스템 상태", test_status()))
    test_results.append(("분석 결과", test_analytics()))
    test_results.append(("시스템 테스트", test_system_test()))
    
    # 대화 처리 테스트
    test_messages = [
        "안녕하세요!",
        "아파트 시세가 어떻게 될까요?",
        "수영장이 정말 좋네요! 😊",
        "힘들어요 ㅠㅠ",
        "맞아요, 동감합니다",
        "아니에요, 그렇지 않아요",
        "궁금한 게 있어요",
        "고맙습니다!"
    ]
    
    for i, message in enumerate(test_messages, 1):
        test_results.append((f"대화 처리 {i}", test_conversation(message, f"test_user_{i}")))
        time.sleep(0.5)  # 서버 부하 방지
    
    # 배치 처리 테스트
    test_results.append(("배치 처리", test_batch_processing()))
    
    # 결과 요약
    print("\n" + "=" * 60)
    print("📊 테스트 결과 요약")
    print("=" * 60)
    
    successful_tests = 0
    total_tests = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ 성공" if result else "❌ 실패"
        print(f"{test_name:<20} {status}")
        if result:
            successful_tests += 1
    
    success_rate = (successful_tests / total_tests) * 100
    
    print("=" * 60)
    print(f"총 테스트: {total_tests}")
    print(f"성공: {successful_tests}")
    print(f"실패: {total_tests - successful_tests}")
    print(f"성공률: {success_rate:.1f}%")
    
    if success_rate >= 90:
        print("🎉 실시간 카카오톡 대화 대응 시스템이 정상적으로 작동합니다!")
    elif success_rate >= 70:
        print("⚠️  일부 기능에 문제가 있을 수 있습니다.")
    else:
        print("❌ 시스템에 심각한 문제가 있습니다.")
    
    print("=" * 60)

if __name__ == "__main__":
    run_comprehensive_test() 