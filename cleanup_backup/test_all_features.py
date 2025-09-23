#!/usr/bin/env python3
"""
CORBU.AI 모든 기능 테스트 스크립트
"""

import requests
import json
import time
import sys

BASE_URL = "http://localhost:3000"

def test_health():
    """헬스 체크 테스트"""
    print("🔍 헬스 체크 테스트...")
    try:
        response = requests.get(f"{BASE_URL}/api/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 헬스 체크 성공: {data['status']}")
            return True
        else:
            print(f"❌ 헬스 체크 실패: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 헬스 체크 오류: {e}")
        return False

def test_chat():
    """채팅 기능 테스트"""
    print("\n💬 채팅 기능 테스트...")
    try:
        test_messages = [
            "안녕하세요!",
            "코딩 도움을 받고 싶습니다",
            "파이썬에 대해 알려주세요",
            "감정 분석을 해주세요"
        ]
        
        for i, message in enumerate(test_messages):
            print(f"  테스트 {i+1}: {message}")
            response = requests.post(f"{BASE_URL}/api/chat", 
                                   json={"message": message})
            
            if response.status_code == 200:
                data = response.json()
                if data['success']:
                    emotion = data['analysis']['emotion_analysis']['emotion']
                    intent = data['analysis']['intent_analysis']['intent']
                    print(f"    ✅ 응답 성공 (감정: {emotion}, 의도: {intent})")
                else:
                    print(f"    ❌ 응답 실패: {data.get('error', 'Unknown error')}")
                    return False
            else:
                print(f"    ❌ HTTP 오류: {response.status_code}")
                return False
            
            time.sleep(0.5)  # 서버 부하 방지
        
        print("✅ 채팅 기능 모든 테스트 통과")
        return True
        
    except Exception as e:
        print(f"❌ 채팅 테스트 오류: {e}")
        return False

def test_code_review():
    """코드 리뷰 기능 테스트"""
    print("\n🔍 코드 리뷰 기능 테스트...")
    try:
        test_codes = [
            {
                "code": "def hello():\n    print('Hello World')\n    return True",
                "language": "python"
            },
            {
                "code": "function greet(name) {\n    console.log('Hello ' + name);\n}",
                "language": "javascript"
            },
            {
                "code": "public class Hello {\n    public static void main(String[] args) {\n        System.out.println(\"Hello World\");\n    }\n}",
                "language": "java"
            }
        ]
        
        for i, test_case in enumerate(test_codes):
            print(f"  테스트 {i+1}: {test_case['language']} 코드")
            response = requests.post(f"{BASE_URL}/api/code-review", 
                                   json=test_case)
            
            if response.status_code == 200:
                data = response.json()
                if data['success']:
                    issues = data['issues_count']
                    quality = data['quality_score']
                    print(f"    ✅ 리뷰 성공 (문제점: {issues}개, 품질: {quality}/100)")
                else:
                    print(f"    ❌ 리뷰 실패: {data.get('error', 'Unknown error')}")
                    return False
            else:
                print(f"    ❌ HTTP 오류: {response.status_code}")
                return False
            
            time.sleep(0.5)
        
        print("✅ 코드 리뷰 기능 모든 테스트 통과")
        return True
        
    except Exception as e:
        print(f"❌ 코드 리뷰 테스트 오류: {e}")
        return False

def test_text_summarize():
    """텍스트 요약 기능 테스트"""
    print("\n📝 텍스트 요약 기능 테스트...")
    try:
        test_texts = [
            {
                "text": "인공지능은 현대 사회에서 매우 중요한 역할을 하고 있습니다. 머신러닝과 딥러닝 기술이 발전하면서 다양한 분야에서 활용되고 있습니다. 특히 자연어 처리, 컴퓨터 비전, 음성 인식 등의 분야에서 큰 성과를 거두고 있습니다.",
                "max_length": 100,
                "style": "general"
            },
            {
                "text": "Python은 간단하고 읽기 쉬운 문법을 가진 프로그래밍 언어입니다. 데이터 분석, 웹 개발, 머신러닝 등 다양한 분야에서 사용됩니다. 특히 데이터 사이언스 분야에서 가장 인기 있는 언어 중 하나입니다.",
                "max_length": 80,
                "style": "bullet"
            }
        ]
        
        for i, test_case in enumerate(test_texts):
            print(f"  테스트 {i+1}: {test_case['style']} 스타일")
            response = requests.post(f"{BASE_URL}/api/text-summarize", 
                                   json=test_case)
            
            if response.status_code == 200:
                data = response.json()
                if data['success']:
                    ratio = data['compression_ratio']
                    key_points = len(data['key_points'])
                    print(f"    ✅ 요약 성공 (압축률: {ratio}%, 키포인트: {key_points}개)")
                else:
                    print(f"    ❌ 요약 실패: {data.get('error', 'Unknown error')}")
                    return False
            else:
                print(f"    ❌ HTTP 오류: {response.status_code}")
                return False
            
            time.sleep(0.5)
        
        print("✅ 텍스트 요약 기능 모든 테스트 통과")
        return True
        
    except Exception as e:
        print(f"❌ 텍스트 요약 테스트 오류: {e}")
        return False

def test_performance_metrics():
    """성능 메트릭 테스트"""
    print("\n📊 성능 메트릭 테스트...")
    try:
        response = requests.get(f"{BASE_URL}/api/performance-metrics")
        
        if response.status_code == 200:
            data = response.json()
            if data['success']:
                metrics = data['metrics']
                app_metrics = metrics['application']
                print(f"    ✅ 메트릭 조회 성공")
                print(f"    📈 총 요청: {app_metrics['total_requests']}")
                print(f"    📈 성공 요청: {app_metrics['successful_requests']}")
                print(f"    📈 에러율: {app_metrics['error_rate']}%")
                print(f"    📈 활성 세션: {app_metrics['active_sessions']}")
                return True
            else:
                print(f"    ❌ 메트릭 조회 실패: {data.get('error', 'Unknown error')}")
                return False
        else:
            print(f"    ❌ HTTP 오류: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ 성능 메트릭 테스트 오류: {e}")
        return False

def test_sessions():
    """세션 관리 테스트"""
    print("\n🗂️ 세션 관리 테스트...")
    try:
        # 세션 목록 조회
        response = requests.get(f"{BASE_URL}/api/sessions")
        
        if response.status_code == 200:
            data = response.json()
            if data['success']:
                sessions = data['sessions']
                total = data['total_sessions']
                print(f"    ✅ 세션 목록 조회 성공 (총 {total}개 세션)")
                
                # 개별 세션 조회 (세션이 있는 경우)
                if sessions:
                    session_id = sessions[0]['session_id']
                    response2 = requests.get(f"{BASE_URL}/api/session/{session_id}")
                    if response2.status_code == 200:
                        print(f"    ✅ 개별 세션 조회 성공")
                    else:
                        print(f"    ❌ 개별 세션 조회 실패: {response2.status_code}")
                        return False
                else:
                    print(f"    ℹ️ 조회할 세션이 없습니다")
                
                return True
            else:
                print(f"    ❌ 세션 조회 실패: {data.get('error', 'Unknown error')}")
                return False
        else:
            print(f"    ❌ HTTP 오류: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ 세션 관리 테스트 오류: {e}")
        return False

def main():
    """메인 테스트 함수"""
    print("🚀 CORBU.AI 모든 기능 테스트 시작")
    print("=" * 50)
    
    tests = [
        ("헬스 체크", test_health),
        ("채팅 기능", test_chat),
        ("코드 리뷰", test_code_review),
        ("텍스트 요약", test_text_summarize),
        ("성능 메트릭", test_performance_metrics),
        ("세션 관리", test_sessions)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
            else:
                print(f"❌ {test_name} 테스트 실패")
        except Exception as e:
            print(f"❌ {test_name} 테스트 오류: {e}")
    
    print("\n" + "=" * 50)
    print(f"🎯 테스트 결과: {passed}/{total} 통과")
    
    if passed == total:
        print("🎉 모든 기능이 정상적으로 작동합니다!")
        print("✅ CORBU.AI 시스템이 완전히 준비되었습니다!")
        return True
    else:
        print("⚠️ 일부 기능에 문제가 있습니다.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
