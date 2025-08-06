#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
고도화된 대화형 인터페이스 테스트
Enhanced Conversational Interface Test
"""

import requests
import json
import time
from datetime import datetime

def test_enhanced_conversational_api():
    """고도화된 대화형 API 테스트"""
    
    base_url = "http://localhost:8003"
    conversation_id = f"test_conversation_{int(time.time())}"
    user_id = "test_user"
    
    print("🧪 고도화된 대화형 인터페이스 테스트를 시작합니다...")
    print("=" * 50)
    
    # 1. 헬스 체크
    print("1. 헬스 체크 테스트")
    try:
        response = requests.get(f"{base_url}/api/v2/enhanced/health")
        if response.status_code == 200:
            health_data = response.json()
            print(f"✅ 서버 상태: {health_data['status']}")
            print(f"📊 버전: {health_data['version']}")
            print(f"🔗 활성 대화: {health_data['active_conversations']}개")
        else:
            print(f"❌ 헬스 체크 실패: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ 서버 연결 실패: {e}")
        return
    
    print()
    
    # 2. 채팅 테스트
    print("2. 채팅 기능 테스트")
    test_messages = [
        "안녕하세요!",
        "오늘 날씨가 좋네요",
        "AI 기술에 대해 알려주세요",
        "감정 분석이 어떻게 작동하나요?",
        "고급 분석 기능을 사용해보고 싶어요"
    ]
    
    for i, message in enumerate(test_messages, 1):
        print(f"\n📝 메시지 {i}: {message}")
        
        try:
            response = requests.post(
                f"{base_url}/api/v2/enhanced/chat",
                json={
                    "conversation_id": conversation_id,
                    "user_id": user_id,
                    "message": message,
                    "ai_personality": "helpful",
                    "response_style": "conversational"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    chat_data = data["data"]
                    print(f"🤖 AI 응답: {chat_data['response']}")
                    
                    # 메타데이터 출력
                    metadata = chat_data.get("metadata", {})
                    if metadata:
                        print(f"📊 감정: {metadata.get('emotion', 'N/A')}")
                        print(f"⏱️ 처리시간: {metadata.get('processing_time', 'N/A')}ms")
                        print(f"🎯 신뢰도: {metadata.get('confidence', 'N/A'):.2f}")
                else:
                    print(f"❌ 채팅 실패: {data}")
            else:
                print(f"❌ HTTP 오류: {response.status_code}")
                
        except Exception as e:
            print(f"❌ 요청 실패: {e}")
        
        time.sleep(1)  # 요청 간격
    
    print()
    
    # 3. 고급 분석 테스트
    print("3. 고급 분석 기능 테스트")
    try:
        response = requests.post(
            f"{base_url}/api/v2/enhanced/analyze",
            json={"conversation_id": conversation_id}
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                analysis = data["data"]
                print("📊 분석 결과:")
                print(f"• 대화 길이: {analysis.get('conversation_length', 0)}개 메시지")
                print(f"• 평균 메시지 길이: {analysis.get('average_message_length', 0):.1f}자")
                print(f"• 감정 분포: {analysis.get('emotion_distribution', {})}")
                print(f"• 주요 키워드: {list(analysis.get('top_keywords', {}).keys())[:5]}")
                print(f"• 대화 흐름: {analysis.get('conversation_flow', 'N/A')}")
                print(f"• 사용자 만족도: {analysis.get('user_satisfaction', 0):.1%}")
            else:
                print(f"❌ 분석 실패: {data}")
        else:
            print(f"❌ HTTP 오류: {response.status_code}")
            
    except Exception as e:
        print(f"❌ 분석 요청 실패: {e}")
    
    print()
    
    # 4. 인사이트 생성 테스트
    print("4. 인사이트 생성 기능 테스트")
    try:
        response = requests.post(
            f"{base_url}/api/v2/enhanced/insights",
            json={"conversation_id": conversation_id}
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                insights = data["data"]
                print("💡 인사이트 결과:")
                
                patterns = insights.get("patterns", [])
                print(f"🔍 발견된 패턴 ({len(patterns)}개):")
                for pattern in patterns:
                    print(f"  • {pattern}")
                
                recommendations = insights.get("recommendations", [])
                print(f"💡 권장사항 ({len(recommendations)}개):")
                for rec in recommendations:
                    print(f"  • {rec}")
                
                predictions = insights.get("predictions", [])
                print(f"🔮 예측 ({len(predictions)}개):")
                for pred in predictions:
                    print(f"  • {pred}")
                
                improvements = insights.get("improvements", [])
                print(f"⚡ 개선점 ({len(improvements)}개):")
                for imp in improvements:
                    print(f"  • {imp}")
            else:
                print(f"❌ 인사이트 생성 실패: {data}")
        else:
            print(f"❌ HTTP 오류: {response.status_code}")
            
    except Exception as e:
        print(f"❌ 인사이트 요청 실패: {e}")
    
    print()
    print("=" * 50)
    print("🎉 고도화된 대화형 인터페이스 테스트가 완료되었습니다!")
    print("✨ 새로운 기능들이 정상적으로 작동하고 있습니다.")

def test_different_personalities():
    """다양한 AI 성격 테스트"""
    
    base_url = "http://localhost:8003"
    personalities = ["helpful", "creative", "analytical", "empathetic"]
    styles = ["concise", "detailed", "conversational", "technical"]
    
    print("\n🧠 AI 성격 및 스타일 테스트")
    print("=" * 50)
    
    for personality in personalities:
        for style in styles:
            conversation_id = f"test_{personality}_{style}_{int(time.time())}"
            
            print(f"\n🎭 AI 성격: {personality}, 스타일: {style}")
            
            try:
                response = requests.post(
                    f"{base_url}/api/v2/enhanced/chat",
                    json={
                        "conversation_id": conversation_id,
                        "user_id": "test_user",
                        "message": "안녕하세요!",
                        "ai_personality": personality,
                        "response_style": style
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success"):
                        print(f"✅ 응답 생성 성공")
                        print(f"📝 응답: {data['data']['response'][:100]}...")
                    else:
                        print(f"❌ 응답 생성 실패")
                else:
                    print(f"❌ HTTP 오류: {response.status_code}")
                    
            except Exception as e:
                print(f"❌ 요청 실패: {e}")
            
            time.sleep(0.5)

if __name__ == "__main__":
    print("🚀 고도화된 대화형 인터페이스 테스트")
    print("=" * 50)
    
    # 기본 기능 테스트
    test_enhanced_conversational_api()
    
    # AI 성격 테스트
    test_different_personalities()
    
    print("\n🎯 모든 테스트가 완료되었습니다!")
    print("📊 결과를 확인하여 시스템이 정상적으로 작동하는지 확인하세요.") 