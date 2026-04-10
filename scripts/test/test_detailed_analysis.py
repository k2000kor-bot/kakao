#!/usr/bin/env python3
"""
상세 분석 테스트 클라이언트
구체적 사례와 실용적 인사이트를 포함한 분석 결과 테스트
"""

import requests
import json

def test_detailed_conversation_analysis():
    """상세한 대화 분석 테스트"""
    
    # 실제 상황을 반영한 테스트 데이터
    conversation_data = {
        "conversation_history": [
            {
                "participant_id": "0116",
                "message": "삼성물산이 가장 좋은 선택이라고 생각합니다. 다른 건 고려할 필요도 없어요.",
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
            },
            {
                "participant_id": "0024",
                "message": "어제부터 활발하던 의견들이 갑자기 사라졌다. 눈치 보는 분위기 생긴 듯하다.",
                "timestamp": "2025-07-12 14:50"
            }
        ],
        "current_message": "이런 식으로는 대화가 안 됩니다. 모두가 객관적으로 생각해야 합니다.",
        "room_id": "room_001",
        "analysis_mode": "detailed"
    }
    
    try:
        print("🔍 상세한 대화 분석 테스트")
        print("=" * 60)
        
        response = requests.post(
            "http://localhost:5002/api/v7/ai-assistant/conversation",
            json=conversation_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            
            if result["success"]:
                print("✅ 상세 분석 테스트 성공!")
                
                ai_response = result["ai_response"]
                
                # 1. 갈등 상황 상세 분석
                print("\n📊 갈등 상황 상세 분석:")
                if "detailed_analysis" in ai_response["ai_response"]:
                    analysis = ai_response["ai_response"]["detailed_analysis"]
                    print(f"• 갈등 상황: {analysis['conflict_situation']}")
                    print(f"• 근본 원인: {analysis['root_cause_analysis']}")
                    print(f"• 감정 역학: {analysis['emotional_dynamics']}")
                    print(f"• 권장 접근법: {analysis['recommended_approach']}")
                
                # 2. 구체적 사례 제시
                print("\n💡 구체적 사례와 개선 방안:")
                if "specific_examples" in ai_response["ai_response"]:
                    examples = ai_response["ai_response"]["specific_examples"]
                    for i, example in enumerate(examples, 1):
                        print(f"\n{i}. 상황: {example['situation']}")
                        print(f"   ✅ 좋은 응답: {example['better_response']}")
                        print(f"   ❌ 피해야 할 응답: {example['avoid_response']}")
                
                # 3. 실용적 팁
                print("\n🎯 실용적 팁:")
                if "practical_tips" in ai_response["ai_response"]:
                    tips = ai_response["ai_response"]["practical_tips"]
                    for tip in tips:
                        print(f"• {tip}")
                
                # 4. 대화 흐름 상세 분석
                print("\n📈 대화 흐름 상세 분석:")
                insights = ai_response["conversation_insights"]
                if "detailed_analysis" in insights:
                    detailed = insights["detailed_analysis"]
                    print(f"• 대화 역학: {detailed['conversation_dynamics']}")
                    print(f"• 참여자 행동: {detailed['participant_behavior']}")
                    print(f"• 의사소통 품질: {detailed['communication_quality']}")
                    print(f"• 참여도 추세: {detailed['engagement_trend']}")
                
                # 5. 핵심 순간 분석
                print("\n⏰ 핵심 순간 상세 분석:")
                key_moments = insights["key_moments"]
                for moment in key_moments:
                    print(f"\n• 시간: {moment['timestamp']}")
                    print(f"  이벤트: {moment['event']}")
                    print(f"  영향도: {moment['impact_score']:.1f}")
                    print(f"  영향받은 참여자: {', '.join(moment['participants_affected'])}")
                    print(f"  상세 설명: {moment['detailed_description']}")
                
                # 6. 갈등 해결 상세 분석
                print("\n⚔️ 갈등 해결 상세 분석:")
                conflicts = ai_response["conflict_resolution"]["active_conflicts"]
                for i, conflict in enumerate(conflicts, 1):
                    print(f"\n{i}. 갈등 유형: {conflict['conflict_type']}")
                    print(f"   심각도: {conflict['severity']}")
                    print(f"   참여자: {', '.join(conflict['participants'])}")
                    print(f"   상세 설명: {conflict['detailed_description']}")
                    print(f"   구체적 사례:")
                    for incident in conflict['specific_incidents']:
                        print(f"     - {incident}")
                    print(f"   해결 전략:")
                    strategy = conflict['resolution_strategy']
                    print(f"     즉시: {strategy['immediate']}")
                    print(f"     단기: {strategy['short_term']}")
                    print(f"     장기: {strategy['long_term']}")
                    print(f"     상세 접근법: {strategy['detailed_approach']}")
                
                # 7. 감정 상태 상세 분석
                print("\n😊 감정 상태 상세 분석:")
                emotions = ai_response["emotional_state"]["emotional_states"]
                for participant, emotion in emotions.items():
                    print(f"\n• {participant}님:")
                    print(f"  주요 감정: {emotion['primary_emotion']}")
                    print(f"  감정 강도: {emotion['emotional_intensity']:.1f}")
                    print(f"  감정 안정성: {emotion['emotional_stability']:.1f}")
                    print(f"  상세 분석: {emotion['detailed_analysis']}")
                    print(f"  행동 패턴:")
                    for pattern in emotion['behavioral_patterns']:
                        print(f"    - {pattern}")
                    print(f"  권장 접근법: {emotion['recommended_approach']}")
                
                # 8. 편향성 상세 분석
                print("\n🎯 편향성 상세 분석:")
                bias_detection = ai_response["bias_alerts"]["bias_detection"]
                for company, bias in bias_detection.items():
                    print(f"\n• {company}:")
                    print(f"  편향 점수: {bias['bias_score']:.1f}")
                    print(f"  편향 유형: {bias['bias_type']}")
                    print(f"  상세 분석: {bias['detailed_analysis']}")
                    print(f"  구체적 사례:")
                    for example in bias['specific_examples']:
                        print(f"    - {example}")
                    print(f"  잠재적 영향: {bias['potential_impact']}")
                
                # 9. 편향성 완화 전략
                print("\n🛠️ 편향성 완화 전략:")
                mitigation = ai_response["bias_alerts"]["bias_mitigation_strategies"]
                print("• 단기 전략:")
                for strategy in mitigation["short_term"]:
                    print(f"  - {strategy}")
                print("• 장기 전략:")
                for strategy in mitigation["long_term"]:
                    print(f"  - {strategy}")
                
                # 10. 시공사 비교 프레임워크
                if "comparison_framework" in ai_response["ai_response"]:
                    print("\n📋 시공사 비교 프레임워크:")
                    framework = ai_response["ai_response"]["comparison_framework"]
                    print("• 평가 기준:")
                    for criteria in framework["evaluation_criteria"]:
                        print(f"  - {criteria}")
                    print("• 삼성물산 강점:")
                    for strength in framework["samsung_strengths"]:
                        print(f"  - {strength}")
                    print("• 삼성물산 약점:")
                    for weakness in framework["samsung_weaknesses"]:
                        print(f"  - {weakness}")
                    print("• 대우건설 강점:")
                    for strength in framework["daewoo_strengths"]:
                        print(f"  - {strength}")
                    print("• 대우건설 약점:")
                    for weakness in framework["daewoo_weaknesses"]:
                        print(f"  - {weakness}")
                
            else:
                print(f"❌ 상세 분석 실패: {result.get('error')}")
        else:
            print(f"❌ HTTP 오류: {response.status_code}")
            
    except Exception as e:
        print(f"❌ 상세 분석 테스트 오류: {str(e)}")

def test_practical_insights():
    """실용적 인사이트 테스트"""
    
    print("\n💡 실용적 인사이트 테스트:")
    print("=" * 60)
    
    # 다양한 상황별 테스트
    test_scenarios = [
        {
            "name": "편향성 갈등 상황",
            "message": "삼성물산이 최고입니다. 다른 건 고려할 필요도 없어요.",
            "expected_insight": "편향적 발언으로 인한 갈등 감지 및 중재 방안"
        },
        {
            "name": "감정적 대립 상황",
            "message": "화가 납니다! 이런 편파적인 발언은 용납할 수 없어요!",
            "expected_insight": "감정적 불안정 감지 및 갈등 해결 방안"
        },
        {
            "name": "건설적 토론 상황",
            "message": "각 시공사의 장단점을 객관적으로 비교해보는 것이 어떨까요?",
            "expected_insight": "건설적 소통 패턴 인식 및 긍정적 강화"
        }
    ]
    
    for scenario in test_scenarios:
        print(f"\n📝 테스트 시나리오: {scenario['name']}")
        print(f"메시지: {scenario['message']}")
        print(f"예상 인사이트: {scenario['expected_insight']}")
        
        # 실시간 모니터링 테스트
        monitoring_data = {
            "message": scenario["message"],
            "participant_id": "test_user",
            "room_id": "room_001",
            "timestamp": "2025-07-12 15:00"
        }
        
        try:
            response = requests.post(
                "http://localhost:5002/api/v7/ai-assistant/monitor",
                json=monitoring_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                result = response.json()
                if result["success"]:
                    monitoring = result["monitoring_result"]
                    
                    # 위험 요소 분석
                    risks = monitoring["risk_indicators"]
                    if risks:
                        print("⚠️ 감지된 위험 요소:")
                        for risk in risks:
                            print(f"  - {risk['risk_type']}: {risk['trigger']}")
                    
                    # 감정 상태 분석
                    emotion = monitoring["emotional_state"]
                    print(f"😊 감정 상태: {emotion['primary_emotion']} (강도: {emotion['emotional_intensity']})")
                    
                    # 편향성 감지
                    bias = monitoring["bias_detection"]
                    if bias["bias_detected"]:
                        print(f"🎯 편향성 감지: {bias['bias_type']} (강도: {bias['bias_intensity']})")
                    
                    # 개입 필요성
                    intervention = monitoring["intervention_needed"]
                    if intervention["intervention_needed"]:
                        print(f"🚨 개입 필요: {intervention['urgency']} 긴급도")
                        print(f"  이유: {', '.join(intervention['intervention_reasons'])}")
                        
                        action = monitoring["immediate_action"]
                        print(f"  개입 방안: {action['suggested_response']}")
                    
                    print("✅ 실시간 분석 완료")
                else:
                    print(f"❌ 모니터링 실패: {result.get('error')}")
            else:
                print(f"❌ HTTP 오류: {response.status_code}")
                
        except Exception as e:
            print(f"❌ 시나리오 테스트 오류: {str(e)}")

def demonstrate_analysis_improvements():
    """분석 개선 사항 시연"""
    
    print("\n🚀 분석 개선 사항 시연:")
    print("=" * 60)
    
    improvements = [
        {
            "before": "편향성 점수: 0.7",
            "after": "0116님이 '삼성물산이 최고입니다'라는 발언을 통해 삼성물산에 대한 강한 편향성을 보이고 있습니다. 이는 다른 시공사들의 장점을 간과할 수 있는 위험한 상황입니다.",
            "improvement": "단순 수치에서 구체적 상황 설명으로 개선"
        },
        {
            "before": "갈등 수준: 높음",
            "after": "0116님과 0024님 간의 편향성 논란이 격화되고 있습니다. 0116님이 '삼성물산이 가장 좋은 선택'이라고 발언한 후, 0024님이 '편파적 발언은 부적절하다'고 반박하면서 갈등이 시작되었습니다.",
            "improvement": "추상적 수준에서 구체적 사례 기반 설명으로 개선"
        },
        {
            "before": "감정 상태: 부정적",
            "after": "0116님은 '화가 납니다'라는 표현을 사용하여 감정적 불안정을 보이고 있으며, 이는 갈등을 더욱 악화시킬 수 있는 상황입니다.",
            "improvement": "단순 분류에서 구체적 행동 패턴 분석으로 개선"
        },
        {
            "before": "해결 방안: 중재",
            "after": "중재자 역할을 통해 각자의 입장을 객관적으로 정리하고, 공동의 목표인 조합의 이익을 중심으로 대화 방향을 전환하는 것이 필요합니다.",
            "improvement": "일반적 해결책에서 구체적 실행 방안으로 개선"
        }
    ]
    
    for i, improvement in enumerate(improvements, 1):
        print(f"\n{i}. {improvement['improvement']}")
        print(f"   이전: {improvement['before']}")
        print(f"   개선: {improvement['after']}")

if __name__ == "__main__":
    print("🔍 상세 분석 시스템 테스트")
    print("=" * 60)
    
    # 1. 상세한 대화 분석 테스트
    test_detailed_conversation_analysis()
    
    # 2. 실용적 인사이트 테스트
    test_practical_insights()
    
    # 3. 분석 개선 사항 시연
    demonstrate_analysis_improvements()
    
    print("\n" + "=" * 60)
    print("✅ 상세 분석 시스템 테스트 완료!")
    print("\n💡 주요 개선 사항:")
    print("• 단순 수치 → 구체적 상황 설명")
    print("• 추상적 분석 → 실용적 인사이트")
    print("• 일반적 해결책 → 구체적 실행 방안")
    print("• 정량적 지표 → 정성적 분석")
    print("• 일관된 응답 → 상황별 맞춤형 대응")
    
    print("\n🎯 실용적 가치:")
    print("• 갈등 상황의 구체적 이해")
    print("• 참여자별 맞춤형 대응 방안")
    print("• 편향성 완화를 위한 실질적 전략")
    print("• 조합 운영 개선을 위한 구체적 제안") 