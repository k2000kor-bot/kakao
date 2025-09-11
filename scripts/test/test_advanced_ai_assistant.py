#!/usr/bin/env python3
"""
고도화된 AI 어시스턴트 테스트 클라이언트
ChatGPT를 능가하는 실시간 대화형 AI 기능 테스트
"""

import requests
import json
import time

def test_advanced_conversation_assistant():
    """고도화된 대화형 AI 어시스턴트 테스트"""
    
    # 테스트 대화 데이터
    conversation_data = {
        "conversation_history": [
            {
                "participant_id": "0116",
                "message": "삼성물산이 가장 좋은 선택이라고 생각합니다.",
                "timestamp": "2025-07-12 14:30"
            },
            {
                "participant_id": "0024",
                "message": "편파적 발언은 부적절합니다. 대우건설도 고려해야 합니다.",
                "timestamp": "2025-07-12 14:35"
            },
            {
                "participant_id": "0116",
                "message": "화가 나네요. 왜 항상 반대만 하시나요?",
                "timestamp": "2025-07-12 14:40"
            },
            {
                "participant_id": "0036",
                "message": "조합 임원이 이런 편향적 발언을 하는 것은 문제입니다.",
                "timestamp": "2025-07-12 14:45"
            }
        ],
        "current_message": "이런 식으로는 대화가 안 됩니다. 모두가 객관적으로 생각해야 합니다.",
        "room_id": "room_001",
        "user_context": {
            "user_role": "조합원",
            "preferred_style": "중재자",
            "concerns": ["편향성", "갈등 해결"]
        },
        "analysis_mode": "advanced"
    }
    
    try:
        print("🚀 고도화된 AI 어시스턴트 테스트 시작")
        print("=" * 60)
        
        # 1. 대화형 AI 어시스턴트 테스트
        print("\n1️⃣ 대화형 AI 어시스턴트 테스트:")
        response = requests.post(
            "http://localhost:8000/api/v7/ai-assistant/conversation",
            json=conversation_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            
            if result["success"]:
                print("✅ 대화형 AI 어시스턴트 테스트 성공!")
                
                ai_response = result["ai_response"]
                
                # 대화 인사이트 출력
                print("\n📊 대화 인사이트:")
                insights = ai_response["conversation_insights"]
                print(f"• 대화 흐름: {' → '.join(insights['conversation_flow']['topic_evolution'])}")
                print(f"• 참여자 참여도: 높음({insights['conversation_flow']['participant_engagement']['high_engagement']})")
                print(f"• 의사소통 스타일: 대립적({insights['conversation_flow']['communication_style']['confrontational']:.1%})")
                print(f"• 메시지 속도: {insights['conversation_flow']['message_velocity']['current_rate']}/시간")
                
                # 갈등 해결 분석
                print("\n⚔️ 갈등 해결 분석:")
                conflicts = ai_response["conflict_resolution"]["active_conflicts"]
                for i, conflict in enumerate(conflicts, 1):
                    print(f"• 갈등 {i}: {conflict['conflict_type']} (심각도: {conflict['severity']})")
                    print(f"  - 참여자: {', '.join(conflict['participants'])}")
                    print(f"  - 원인: {conflict['root_cause']}")
                    print(f"  - 확대 위험: {conflict['escalation_risk']:.1%}")
                
                # 감정 상태 분석
                print("\n😊 감정 상태 분석:")
                emotions = ai_response["emotional_state"]["emotional_states"]
                for participant, emotion in emotions.items():
                    print(f"• {participant}: {emotion['primary_emotion']} (강도: {emotion['emotional_intensity']:.1f})")
                
                # 편향성 알림
                print("\n🎯 편향성 알림:")
                bias_alerts = ai_response["bias_alerts"]["bias_alerts"]
                for alert in bias_alerts:
                    print(f"• {alert['alert_type']}: {alert['message']} (심각도: {alert['severity']})")
                
                # 예측적 제안
                print("\n🔮 예측적 개입 제안:")
                interventions = ai_response["predictive_suggestions"]["immediate_interventions"]
                for intervention in interventions:
                    print(f"• {intervention['intervention_type']}: {intervention['suggested_approach']}")
                    print(f"  - 긴급도: {intervention['urgency']}")
                    print(f"  - 예상 결과: {intervention['expected_outcome']}")
                
                # AI 응답
                print("\n🤖 AI 응답:")
                ai_message = ai_response["ai_response"]
                print(f"• 응답 유형: {ai_message['response_type']}")
                print(f"• 메시지: {ai_message['message']}")
                print("• 제안된 행동:")
                for action in ai_message['suggested_actions']:
                    print(f"  - {action}")
                
                # 선제적 행동
                print("\n⚡ 선제적 행동:")
                proactive = ai_response["proactive_actions"]
                print("• 즉시 행동:")
                for action in proactive["immediate_actions"]:
                    print(f"  - {action}")
                
                # 실시간 권장사항
                print("\n💡 실시간 권장사항:")
                recommendations = ai_response["real_time_recommendations"]
                print("• 의사소통 권장사항:")
                for rec in recommendations["communication_recommendations"]:
                    print(f"  - {rec}")
                
            else:
                print(f"❌ 대화형 AI 어시스턴트 테스트 실패: {result.get('error')}")
        else:
            print(f"❌ HTTP 오류: {response.status_code}")
            
    except Exception as e:
        print(f"❌ 대화형 AI 어시스턴트 테스트 오류: {str(e)}")

def test_realtime_monitoring():
    """실시간 모니터링 테스트"""
    
    print("\n2️⃣ 실시간 모니터링 테스트:")
    
    # 위험한 메시지 테스트
    risky_messages = [
        {
            "message": "정말 화가 납니다! 이런 편파적인 발언은 용납할 수 없어요!",
            "participant_id": "0116",
            "room_id": "room_001",
            "timestamp": "2025-07-12 15:00"
        },
        {
            "message": "삼성물산이 최고입니다. 다른 건 고려할 필요도 없어요.",
            "participant_id": "0024",
            "room_id": "room_001",
            "timestamp": "2025-07-12 15:05"
        },
        {
            "message": "조합 임원이 이런 식으로 편들면 안 됩니다.",
            "participant_id": "0036",
            "room_id": "room_001",
            "timestamp": "2025-07-12 15:10"
        }
    ]
    
    for i, test_message in enumerate(risky_messages, 1):
        print(f"\n📝 테스트 메시지 {i}: {test_message['message']}")
        
        try:
            response = requests.post(
                "http://localhost:8000/api/v7/ai-assistant/monitor",
                json=test_message,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                result = response.json()
                
                if result["success"]:
                    monitoring = result["monitoring_result"]
                    
                    # 위험 요소 출력
                    risks = monitoring["risk_indicators"]
                    if risks:
                        print("⚠️ 감지된 위험 요소:")
                        for risk in risks:
                            print(f"  - {risk['risk_type']} (심각도: {risk['severity']})")
                    
                    # 감정 상태 출력
                    emotion = monitoring["emotional_state"]
                    print(f"😊 감정 상태: {emotion['primary_emotion']} (강도: {emotion['emotional_intensity']})")
                    
                    # 편향성 감지 출력
                    bias = monitoring["bias_detection"]
                    if bias["bias_detected"]:
                        print(f"🎯 편향성 감지: {bias['bias_type']} (강도: {bias['bias_intensity']})")
                    
                    # 개입 필요성 출력
                    intervention = monitoring["intervention_needed"]
                    if intervention["intervention_needed"]:
                        print(f"🚨 개입 필요: {intervention['urgency']} 긴급도")
                        print(f"  - 이유: {', '.join(intervention['intervention_reasons'])}")
                        
                        # 즉시 개입 방안
                        action = monitoring["immediate_action"]
                        print(f"  - 개입 방안: {action['suggested_response']}")
                    
                else:
                    print(f"❌ 모니터링 실패: {result.get('error')}")
            else:
                print(f"❌ HTTP 오류: {response.status_code}")
                
        except Exception as e:
            print(f"❌ 모니터링 테스트 오류: {str(e)}")
        
        time.sleep(1)  # 요청 간격

def test_comprehensive_analysis():
    """종합 분석 테스트"""
    
    print("\n3️⃣ 종합 분석 테스트:")
    
    comprehensive_data = {
        "conversation_history": [
            {"participant_id": "0116", "message": "삼성물산이 최고입니다.", "timestamp": "2025-07-12 14:30"},
            {"participant_id": "0024", "message": "편파적 발언입니다.", "timestamp": "2025-07-12 14:35"},
            {"participant_id": "0116", "message": "화가 납니다!", "timestamp": "2025-07-12 14:40"},
            {"participant_id": "0036", "message": "조합 임원이 편들면 안 됩니다.", "timestamp": "2025-07-12 14:45"},
            {"participant_id": "0024", "message": "객관적으로 생각해야 합니다.", "timestamp": "2025-07-12 14:50"}
        ],
        "current_message": "모두가 조합의 이익을 위해 협력해야 합니다.",
        "room_id": "room_001",
        "analysis_mode": "comprehensive"
    }
    
    try:
        # 대화형 AI 어시스턴트 호출
        response = requests.post(
            "http://localhost:8000/api/v7/ai-assistant/conversation",
            json=comprehensive_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            
            if result["success"]:
                print("✅ 종합 분석 테스트 성공!")
                
                ai_response = result["ai_response"]
                
                # 핵심 분석 결과 요약
                print("\n📋 핵심 분석 결과:")
                print(f"• 응답 신뢰도: {result['response_confidence']:.1%}")
                print(f"• 분석 시간: {result['analysis_timestamp']}")
                
                # 갈등 상황 요약
                conflicts = ai_response["conflict_resolution"]["active_conflicts"]
                print(f"• 활성 갈등: {len(conflicts)}개")
                
                # 감정 상태 요약
                emotions = ai_response["emotional_state"]["emotional_states"]
                high_emotion = [p for p, e in emotions.items() if e['emotional_intensity'] > 0.7]
                print(f"• 높은 감정 강도 참여자: {', '.join(high_emotion)}")
                
                # 편향성 요약
                bias_alerts = ai_response["bias_alerts"]["bias_alerts"]
                critical_alerts = [a for a in bias_alerts if a['severity'] == 'critical']
                print(f"• 긴급 편향성 알림: {len(critical_alerts)}개")
                
                # AI 응답 요약
                ai_message = ai_response["ai_response"]
                print(f"• AI 응답 유형: {ai_message['response_type']}")
                print(f"• 제안된 행동: {len(ai_message['suggested_actions'])}개")
                
                # JSON 형태로 전체 결과 출력
                print("\n📄 전체 분석 결과 (JSON):")
                print(json.dumps(result, ensure_ascii=False, indent=2))
                
            else:
                print(f"❌ 종합 분석 실패: {result.get('error')}")
        else:
            print(f"❌ HTTP 오류: {response.status_code}")
            
    except Exception as e:
        print(f"❌ 종합 분석 테스트 오류: {str(e)}")

def compare_with_chatgpt():
    """ChatGPT와의 차별점 설명"""
    
    print("\n4️⃣ ChatGPT 대비 차별점:")
    print("=" * 60)
    
    advantages = [
        {
            "feature": "실시간 갈등 감지 및 해결",
            "chatgpt": "단순 응답만 가능",
            "our_ai": "실시간 갈등 감지 → 즉시 중재 방안 제시 → 예측적 개입"
        },
        {
            "feature": "참여자별 감정 상태 분석",
            "chatgpt": "일반적인 감정 분석",
            "our_ai": "개별 참여자 감정 추적 → 감정 변화 패턴 분석 → 개인화된 대응"
        },
        {
            "feature": "시공사 편향성 실시간 모니터링",
            "chatgpt": "도메인 특화 기능 없음",
            "our_ai": "건설업계 특화 편향성 감지 → 시공사별 편향 점수 → 실시간 알림"
        },
        {
            "feature": "예측적 개입 시스템",
            "chatgpt": "반응형 응답만",
            "our_ai": "갈등 예측 → 선제적 개입 → 예방적 조치"
        },
        {
            "feature": "동적 응답 생성",
            "chatgpt": "고정된 응답 패턴",
            "our_ai": "상황별 맞춤형 응답 → 갈등/편향/건설적 상황 구분 → 적응형 대응"
        },
        {
            "feature": "실시간 모니터링",
            "chatgpt": "메시지별 개별 처리",
            "our_ai": "연속적 대화 모니터링 → 패턴 분석 → 즉시 개입"
        }
    ]
    
    for i, advantage in enumerate(advantages, 1):
        print(f"\n{i}. {advantage['feature']}")
        print(f"   ChatGPT: {advantage['chatgpt']}")
        print(f"   우리 AI: {advantage['our_ai']}")

if __name__ == "__main__":
    print("🚀 ChatGPT를 능가하는 고도화된 AI 어시스턴트 테스트")
    print("=" * 60)
    
    # 1. 대화형 AI 어시스턴트 테스트
    test_advanced_conversation_assistant()
    
    # 2. 실시간 모니터링 테스트
    test_realtime_monitoring()
    
    # 3. 종합 분석 테스트
    test_comprehensive_analysis()
    
    # 4. ChatGPT 대비 차별점
    compare_with_chatgpt()
    
    print("\n" + "=" * 60)
    print("✅ 고도화된 AI 어시스턴트 테스트 완료!")
    print("\n💡 주요 차별점:")
    print("• 실시간 갈등 감지 및 해결")
    print("• 참여자별 감정 상태 분석")
    print("• 시공사 편향성 실시간 모니터링")
    print("• 예측적 개입 시스템")
    print("• 동적 응답 생성")
    print("• 실시간 모니터링")
    
    print("\n🎯 ChatGPT를 능가하는 특화 기능:")
    print("• 건설업계 특화 분석")
    print("• 실시간 갈등 중재")
    print("• 예측적 문제 해결")
    print("• 적응형 AI 응답")
    print("• 연속적 대화 모니터링") 