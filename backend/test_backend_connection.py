#!/usr/bin/env python3
"""
백엔드 API 서버 연결 테스트 스크립트
"""

import os
import requests
import json
import time
from datetime import datetime


def _legacy_integrated_api_base() -> str:
    """integrated_api_server(레거시) 테스트 베이스."""
    port = os.environ.get("INTEGRATED_API_SERVER_PORT") or "8095"
    return os.environ.get(
        "CORBU_INTEGRATED_API_TEST_BASE", f"http://localhost:{port}"
    ).rstrip("/")


def test_server_connection():
    """서버 연결 테스트"""

    base_url = _legacy_integrated_api_base()
    
    print("🔗 백엔드 API 서버 연결 테스트 시작")
    print("=" * 50)
    
    # 1. 서버 상태 확인
    try:
        print("1. 서버 상태 확인...")
        response = requests.get(f"{base_url}/", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 서버 연결 성공!")
            print(f"   - 시스템: {data.get('system')}")
            print(f"   - 버전: {data.get('version')}")
            print(f"   - 상태: {data.get('status')}")
            print(f"   - 대화 유형 수: {data.get('dialogue_types')}")
        else:
            print(f"❌ 서버 상태 확인 실패: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 서버 연결 실패: {e}")
        return False
    
    # 2. 대화 유형 목록 조회
    try:
        print("\n2. 대화 유형 목록 조회...")
        response = requests.get(f"{base_url}/api/dialogue-types", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 대화 유형 조회 성공!")
            print(f"   - 총 유형 수: {data.get('total_count')}")
            print(f"   - 카테고리 수: {len(data.get('categories', {}))}")
        else:
            print(f"❌ 대화 유형 조회 실패: {response.status_code}")
    except Exception as e:
        print(f"❌ 대화 유형 조회 오류: {e}")
    
    # 3. 문맥 분석 테스트
    try:
        print("\n3. 문맥 분석 테스트...")
        test_message = "삼성은 경쟁사 설계에 없는 것을 이유로 '허가 불가'라고 몰아붙이는데, 이건 공정 경쟁이 아닙니다."
        
        response = requests.post(
            f"{base_url}/api/analyze-context",
            json={
                "input_message": test_message,
                "conversation_history": []
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            context = data.get('context_analysis', {})
            print(f"✅ 문맥 분석 성공!")
            print(f"   - 감정: {context.get('dominant_emotion')}")
            print(f"   - 상황: {context.get('situation_type')}")
            print(f"   - 추천 유형: {data.get('recommended_type_name')}")
        else:
            print(f"❌ 문맥 분석 실패: {response.status_code}")
    except Exception as e:
        print(f"❌ 문맥 분석 오류: {e}")
    
    # 4. 대화 생성 테스트
    try:
        print("\n4. 대화 생성 테스트...")
        
        response = requests.post(
            f"{base_url}/api/generate-dialogue",
            json={
                "input_message": test_message,
                "conversation_context": [],
                "target_dialogue_type": "counter_question",
                "intensity_level": 3,
                "relationship_dynamic": "neutral"
            },
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            messages = data.get('generated_messages', [])
            print(f"✅ 대화 생성 성공!")
            print(f"   - 생성된 메시지 수: {len(messages)}")
            print(f"   - 최고 효과성: {data.get('best_effectiveness', 0):.1%}")
            
            if messages:
                best_message = max(messages, key=lambda x: x['effectiveness_estimate'])
                print(f"   - 최고 성능 메시지: \"{best_message['message'][:50]}...\"")
        else:
            print(f"❌ 대화 생성 실패: {response.status_code}")
            print(f"   응답: {response.text}")
    except Exception as e:
        print(f"❌ 대화 생성 오류: {e}")
    
    # 5. 통계 조회 테스트
    try:
        print("\n5. 통계 조회 테스트...")
        response = requests.get(f"{base_url}/api/analytics/stats", timeout=5)
        if response.status_code == 200:
            data = response.json()
            summary = data.get('summary', {})
            print(f"✅ 통계 조회 성공!")
            print(f"   - 총 메시지 수: {summary.get('total_messages', 0)}")
            print(f"   - 평균 효과성: {summary.get('avg_effectiveness', 0):.1%}")
            print(f"   - 활성 유형 수: {summary.get('active_types', 0)}")
        else:
            print(f"❌ 통계 조회 실패: {response.status_code}")
    except Exception as e:
        print(f"❌ 통계 조회 오류: {e}")
    
    print(f"\n🎉 테스트 완료!")
    print("=" * 50)
    return True

def test_performance():
    """성능 테스트"""
    
    print("\n⚡ 성능 테스트 시작")
    print("-" * 30)
    
    base_url = _legacy_integrated_api_base()
    test_messages = [
        "이 결정은 공정하지 않습니다.",
        "정말 화가 납니다!",
        "도움이 필요해요.",
        "좋은 제안이네요.",
        "반대합니다."
    ]
    
    total_time = 0
    success_count = 0
    
    for i, message in enumerate(test_messages, 1):
        try:
            start_time = time.time()
            
            response = requests.post(
                f"{base_url}/api/generate-dialogue",
                json={
                    "input_message": message,
                    "intensity_level": 3,
                    "relationship_dynamic": "neutral"
                },
                timeout=10
            )
            
            end_time = time.time()
            duration = end_time - start_time
            total_time += duration
            
            if response.status_code == 200:
                success_count += 1
                data = response.json()
                msg_count = len(data.get('generated_messages', []))
                print(f"  테스트 {i}: ✅ {duration:.2f}초 ({msg_count}개 메시지)")
            else:
                print(f"  테스트 {i}: ❌ 실패 ({response.status_code})")
                
        except Exception as e:
            print(f"  테스트 {i}: ❌ 오류 ({e})")
    
    if success_count > 0:
        avg_time = total_time / success_count
        print(f"\n📊 성능 결과:")
        print(f"   - 성공률: {success_count}/{len(test_messages)} ({success_count/len(test_messages)*100:.1f}%)")
        print(f"   - 평균 응답 시간: {avg_time:.2f}초")
        print(f"   - 총 소요 시간: {total_time:.2f}초")

if __name__ == "__main__":
    success = test_server_connection()
    
    if success:
        test_performance()
    else:
        print("\n❌ 기본 연결 테스트 실패로 성능 테스트를 건너뜁니다.")
        print("\n🔧 해결 방법:")
        print("1. 백엔드 서버가 실행 중인지 확인하세요:")
        print("   cd backend && python3 integrated_api_server.py")
        print("2. 포트 8095가 사용 가능한지 확인하세요:")
        print("   lsof -i :8095")
        print("3. 방화벽 설정을 확인하세요.") 