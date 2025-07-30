#!/usr/bin/env python3
"""
연구용 고급 메시지 생성 시스템 실시간 데모 v1.0
- 다양한 메시지 생성 전략 시연
- 심리학적 접근법 연구
- 효과성 분석 및 비교
"""

import json
from datetime import datetime
from typing import Dict, List, Any

class ResearchMessageDemo:
    """연구용 메시지 데모"""
    
    def __init__(self):
        self.research_data = self._initialize_research_framework()
        self.test_results = []
    
    def _initialize_research_framework(self) -> Dict[str, Any]:
        """연구 프레임워크 초기화"""
        
        return {
            "psychological_techniques": {
                "cognitive_biases": {
                    "authority_bias": "전문가나 권위있는 출처의 신뢰성 활용",
                    "social_proof": "다수의 의견이나 행동 사례 제시",
                    "loss_aversion": "손실 가능성 강조로 행동 유도",
                    "confirmation_bias": "기존 믿음과 일치하는 정보 제시"
                },
                "persuasion_principles": {
                    "reciprocity": "상호 호혜성 원리 활용",
                    "commitment": "일관성과 약속 준수 원리",
                    "scarcity": "희소성과 긴급성 강조",
                    "liking": "호감과 친밀감 형성"
                },
                "emotional_appeals": {
                    "fear_appeal": "부정적 결과에 대한 우려 제기",
                    "hope_appeal": "긍정적 미래 비전 제시",
                    "empathy_connection": "감정적 공감대 형성",
                    "pride_appeal": "자존감과 명예 어필"
                }
            },
            "linguistic_strategies": {
                "framing_effects": {
                    "positive_framing": "긍정적 측면으로 상황 재구성",
                    "loss_framing": "손실 방지 관점으로 접근",
                    "gain_framing": "이익 획득 관점으로 접근"
                },
                "rhetorical_devices": {
                    "repetition": "핵심 메시지 반복 강조",
                    "analogy": "이해하기 쉬운 비유 활용",
                    "rhetorical_questions": "생각을 유도하는 질문",
                    "contrast": "대조를 통한 강조"
                }
            },
            "intensity_modulation": {
                1: "부드러운 제안",
                2: "논리적 설득",
                3: "강화된 어필",
                4: "강력한 주장",
                5: "최대 강도 접근"
            }
        }
    
    def generate_logical_approach(self, situation: str, intensity: int) -> Dict[str, Any]:
        """논리적 접근법"""
        
        base_elements = [
            "객관적 분석에 따르면",
            "현재 상황을 종합적으로 검토한 결과",
            "합리적 판단 기준에 의하면"
        ]
        
        if "공정" in situation:
            logical_core = "공정한 경쟁 원칙은 모든 민주적 절차의 기반입니다"
            
            if intensity >= 3:
                logical_core += ". 이는 법적 의무이자 윤리적 책임입니다"
            
            if intensity >= 4:
                logical_core += ". 공정성 훼손 시 전체 시스템의 신뢰도가 붕괴될 수 있습니다"
            
            if intensity >= 5:
                logical_core += ". 따라서 즉각적이고 단호한 조치가 필요합니다"
        
        message = f"{base_elements[0]}, {logical_core}. 객관적 근거와 투명한 절차를 통해 이 문제를 해결해야 합니다."
        
        if intensity >= 4:
            message += " 이는 모든 이해관계자의 장기적 이익을 위한 필수적 조치입니다."
        
        return {
            "strategy": "logical",
            "intensity": intensity,
            "message": message,
            "techniques_used": ["objective_analysis", "evidence_based", "systematic_reasoning"],
            "psychological_elements": ["authority_bias", "logical_consistency"],
            "effectiveness_estimate": 0.75 + (intensity * 0.05)
        }
    
    def generate_emotional_approach(self, situation: str, intensity: int) -> Dict[str, Any]:
        """감정적 접근법"""
        
        empathy_openings = [
            "말씀하신 우려에 깊이 공감합니다",
            "이런 상황에서 느끼시는 마음을 충분히 이해합니다",
            "조합원 여러분의 답답한 심정이 충분히 전해집니다"
        ]
        
        emotional_core = ""
        if "조합원" in situation:
            emotional_core = "조합원 여러분께서 바라시는 것은 공정하고 투명한 절차입니다"
            
            if intensity >= 3:
                emotional_core += ". 여러분의 신뢰와 기대를 결코 저버릴 수 없습니다"
            
            if intensity >= 4:
                emotional_core += ". 정의롭고 공정한 결과를 위해 끝까지 함께 노력하겠습니다"
            
            if intensity >= 5:
                emotional_core += ". 여러분의 권익과 이익을 지키는 것이 저희의 사명입니다"
        
        message = f"{empathy_openings[min(intensity-1, 2)]}. {emotional_core}. 함께 힘을 모아 반드시 만족스러운 해결책을 찾아내겠습니다."
        
        if intensity >= 4:
            message += " 여러분의 신뢰를 지키기 위해 최선을 다하겠습니다."
        
        return {
            "strategy": "emotional",
            "intensity": intensity,
            "message": message,
            "techniques_used": ["empathy_connection", "trust_building", "emotional_validation"],
            "psychological_elements": ["empathy_connection", "group_identity", "emotional_resonance"],
            "effectiveness_estimate": 0.70 + (intensity * 0.06)
        }
    
    def generate_psychological_approach(self, situation: str, intensity: int) -> Dict[str, Any]:
        """심리학적 접근법"""
        
        message_parts = []
        techniques_used = []
        psychological_elements = []
        
        # Authority bias 활용
        if intensity >= 2:
            message_parts.append("법적 전문가들과 업계 권위자들의 일치된 견해에 따르면")
            techniques_used.append("authority_appeal")
            psychological_elements.append("authority_bias")
        
        # Social proof 활용
        if "조합원" in situation:
            message_parts.append("대다수의 조합원분들께서 공정성을 가장 중요하게 여기고 계십니다")
            techniques_used.append("social_proof")
            psychological_elements.append("social_validation")
        
        # Loss aversion 활용
        if intensity >= 3:
            message_parts.append("현재의 불공정한 상황이 지속될 경우, 향후 더 큰 법적 분쟁과 신뢰도 손상을 겪게 될 수 있습니다")
            techniques_used.append("loss_aversion")
            psychological_elements.append("loss_aversion")
        
        # Commitment and consistency
        message_parts.append("처음 합의했던 '공정하고 투명한 절차'라는 원칙을 일관되게 지켜나가야 합니다")
        techniques_used.append("commitment_consistency")
        psychological_elements.append("consistency_principle")
        
        # Reciprocity 원칙
        if intensity >= 4:
            message_parts.append("조합원 여러분께서 보여주신 신뢰에 상응하는 책임감을 가지고 행동하겠습니다")
            techniques_used.append("reciprocity")
            psychological_elements.append("reciprocity_principle")
        
        # Scarcity/Urgency
        if intensity >= 5:
            message_parts.append("이 중요한 시점을 놓치면 다시는 이런 기회가 오지 않을 수 있습니다")
            techniques_used.append("scarcity_urgency")
            psychological_elements.append("scarcity_effect")
        
        message = ". ".join(message_parts) + "."
        
        return {
            "strategy": "psychological",
            "intensity": intensity,
            "message": message,
            "techniques_used": techniques_used,
            "psychological_elements": psychological_elements,
            "effectiveness_estimate": 0.80 + (intensity * 0.04)
        }
    
    def generate_hybrid_approach(self, situation: str, intensity: int) -> Dict[str, Any]:
        """통합적 접근법"""
        
        # 각 접근법의 핵심 요소들을 조합
        logical_result = self.generate_logical_approach(situation, max(intensity-1, 1))
        emotional_result = self.generate_emotional_approach(situation, max(intensity-1, 1))
        psychological_result = self.generate_psychological_approach(situation, max(intensity-1, 1))
        
        # 강도별 조합 비율
        if intensity <= 2:
            # 논리 중심 (70%), 감정 보조 (30%)
            main_message = logical_result["message"]
            supporting_elements = emotional_result["message"].split(". ")[:1]
        elif intensity <= 4:
            # 균형적 접근 (논리 40%, 감정 30%, 심리 30%)
            logical_parts = logical_result["message"].split(". ")[:2]
            emotional_parts = emotional_result["message"].split(". ")[:1]
            psychological_parts = psychological_result["message"].split(". ")[:1]
            
            all_parts = logical_parts + emotional_parts + psychological_parts
            main_message = ". ".join([part for part in all_parts if part.strip()])
        else:
            # 모든 요소 통합 (각각 33%)
            logical_parts = logical_result["message"].split(". ")[:2]
            emotional_parts = emotional_result["message"].split(". ")[:2]
            psychological_parts = psychological_result["message"].split(". ")[:2]
            
            all_parts = logical_parts + emotional_parts + psychological_parts
            main_message = ". ".join([part for part in all_parts if part.strip()])
        
        # 기법 통합
        combined_techniques = (logical_result["techniques_used"] + 
                             emotional_result["techniques_used"] + 
                             psychological_result["techniques_used"])
        
        combined_psychological = (logical_result["psychological_elements"] + 
                                emotional_result["psychological_elements"] + 
                                psychological_result["psychological_elements"])
        
        # 효과성 계산 (가중 평균)
        effectiveness = (logical_result["effectiveness_estimate"] * 0.4 + 
                        emotional_result["effectiveness_estimate"] * 0.3 + 
                        psychological_result["effectiveness_estimate"] * 0.3)
        
        return {
            "strategy": "hybrid",
            "intensity": intensity,
            "message": main_message,
            "techniques_used": list(set(combined_techniques)),
            "psychological_elements": list(set(combined_psychological)),
            "effectiveness_estimate": min(effectiveness + 0.1, 1.0),  # 통합 보너스
            "composition": {
                "logical_ratio": 0.4,
                "emotional_ratio": 0.3,
                "psychological_ratio": 0.3
            }
        }
    
    def analyze_message_effectiveness(self, message_data: Dict[str, Any]) -> Dict[str, Any]:
        """메시지 효과성 분석"""
        
        message = message_data["message"]
        
        analysis = {
            "length_analysis": {
                "character_count": len(message),
                "word_count": len(message.split()),
                "sentence_count": len(message.split(".")),
                "optimal_length": 50 <= len(message) <= 300
            },
            "technique_analysis": {
                "techniques_count": len(message_data["techniques_used"]),
                "psychological_elements_count": len(message_data["psychological_elements"]),
                "diversity_score": len(set(message_data["techniques_used"])) / max(len(message_data["techniques_used"]), 1)
            },
            "content_analysis": {
                "authority_indicators": len([word for word in ["전문가", "법적", "공식"] if word in message]),
                "emotional_indicators": len([word for word in ["공감", "이해", "마음", "신뢰"] if word in message]),
                "urgency_indicators": len([word for word in ["즉시", "긴급", "중요", "놓치면"] if word in message]),
                "social_indicators": len([word for word in ["대부분", "모든", "일반적", "조합원"] if word in message])
            },
            "predicted_effectiveness": message_data["effectiveness_estimate"],
            "improvement_suggestions": []
        }
        
        # 개선 제안 생성
        if analysis["length_analysis"]["character_count"] > 300:
            analysis["improvement_suggestions"].append("메시지 길이를 300자 이내로 단축 권장")
        
        if analysis["content_analysis"]["authority_indicators"] == 0:
            analysis["improvement_suggestions"].append("권위나 전문성 언급으로 신뢰도 향상 가능")
        
        if analysis["content_analysis"]["emotional_indicators"] == 0:
            analysis["improvement_suggestions"].append("감정적 연결 요소 추가로 공감대 형성 가능")
        
        if not analysis["improvement_suggestions"]:
            analysis["improvement_suggestions"].append("현재 메시지 구성이 적절합니다")
        
        return analysis
    
    def run_comprehensive_test(self, test_situation: str) -> Dict[str, Any]:
        """종합적 테스트 실행"""
        
        print(f"🔬 연구용 메시지 생성 종합 테스트")
        print("=" * 60)
        print(f"📝 테스트 상황: {test_situation}")
        print()
        
        strategies = ["logical", "emotional", "psychological", "hybrid"]
        intensity_levels = [2, 3, 4, 5]
        
        all_results = []
        
        for strategy in strategies:
            print(f"🎯 {strategy.upper()} 전략 테스트")
            print("-" * 40)
            
            for intensity in intensity_levels:
                if strategy == "logical":
                    result = self.generate_logical_approach(test_situation, intensity)
                elif strategy == "emotional":
                    result = self.generate_emotional_approach(test_situation, intensity)
                elif strategy == "psychological":
                    result = self.generate_psychological_approach(test_situation, intensity)
                else:  # hybrid
                    result = self.generate_hybrid_approach(test_situation, intensity)
                
                # 효과성 분석
                analysis = self.analyze_message_effectiveness(result)
                result["detailed_analysis"] = analysis
                
                all_results.append(result)
                
                print(f"  📊 강도 {intensity}: 효과성 {result['effectiveness_estimate']:.1%}")
                print(f"     메시지: {result['message'][:100]}...")
                print(f"     기법: {', '.join(result['techniques_used'][:3])}")
                print()
        
        # 최고 성능 메시지 선별
        best_message = max(all_results, key=lambda x: x["effectiveness_estimate"])
        
        print(f"🏆 최고 성능 메시지")
        print("=" * 60)
        print(f"📈 전략: {best_message['strategy'].upper()}")
        print(f"📊 강도: {best_message['intensity']}")
        print(f"⭐ 효과성: {best_message['effectiveness_estimate']:.1%}")
        print(f"🎯 메시지:")
        print(f"   {best_message['message']}")
        print()
        print(f"🧠 사용된 심리학적 요소:")
        for element in best_message['psychological_elements']:
            print(f"   • {element}")
        print()
        print(f"🔧 적용된 기법:")
        for technique in best_message['techniques_used']:
            print(f"   • {technique}")
        
        return {
            "test_situation": test_situation,
            "total_tested": len(all_results),
            "all_results": all_results,
            "best_performing": best_message,
            "research_insights": {
                "most_effective_strategy": best_message["strategy"],
                "optimal_intensity": best_message["intensity"],
                "key_success_factors": best_message["psychological_elements"],
                "effective_techniques": best_message["techniques_used"]
            },
            "comparative_analysis": {
                strategy: {
                    "average_effectiveness": sum(r["effectiveness_estimate"] for r in all_results if r["strategy"] == strategy) / len([r for r in all_results if r["strategy"] == strategy]),
                    "best_intensity": max([r for r in all_results if r["strategy"] == strategy], key=lambda x: x["effectiveness_estimate"])["intensity"]
                }
                for strategy in strategies
            }
        }

def main():
    """메인 데모 실행"""
    
    print("🔬 연구용 고급 메시지 생성 시스템 실시간 데모")
    print("=" * 60)
    
    demo = ResearchMessageDemo()
    
    # 테스트 상황
    test_situation = "삼성은 경쟁사 설계에 없는 것을 이유로 '허가 불가'라고 몰아붙이는데, 이건 공정 경쟁이 아닙니다. 조합원들이 다 지켜보고 있습니다."
    
    # 종합 테스트 실행
    results = demo.run_comprehensive_test(test_situation)
    
    # 연구 통계 요약
    print(f"\n📊 연구 결과 요약")
    print("=" * 60)
    print(f"🧪 총 테스트된 메시지: {results['total_tested']}개")
    print(f"🏆 최고 효과성: {results['best_performing']['effectiveness_estimate']:.1%}")
    print(f"🎯 최적 전략: {results['best_performing']['strategy']}")
    print(f"📈 최적 강도: {results['best_performing']['intensity']}")
    
    print(f"\n📈 전략별 평균 효과성:")
    for strategy, data in results['comparative_analysis'].items():
        print(f"   {strategy}: {data['average_effectiveness']:.1%} (최적 강도: {data['best_intensity']})")
    
    print(f"\n🔬 연구 인사이트:")
    insights = results['research_insights']
    print(f"   • 가장 효과적인 전략: {insights['most_effective_strategy']}")
    print(f"   • 최적 강도 수준: {insights['optimal_intensity']}")
    print(f"   • 핵심 성공 요인: {len(insights['key_success_factors'])}개 심리학적 요소")
    print(f"   • 효과적 기법: {len(insights['effective_techniques'])}가지 설득 기법")
    
    print(f"\n🎉 연구 데모 완료!")
    print("=" * 60)
    
    return results

if __name__ == "__main__":
    main() 