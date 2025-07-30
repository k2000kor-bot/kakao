#!/usr/bin/env python3
"""
ChatGPT 스타일 시스템 실시간 데모 v1.0
- 파일 업로드 시뮬레이션
- 지침 기반 메시지 생성
- 실제 상황 대응 메시지 생성
"""

import json
from datetime import datetime
from typing import Dict, List, Any

class ChatGPTStyleDemo:
    """ChatGPT 스타일 데모 시스템"""
    
    def __init__(self):
        self.uploaded_files = []
        self.instructions = self._init_instructions()
        self.message_history = []
        
    def _init_instructions(self) -> List[Dict]:
        """기본 지침들 초기화"""
        return [
            {
                "id": "professional_tone",
                "title": "전문적 톤",
                "description": "비즈니스 상황에서 격식있고 전문적인 톤 사용",
                "active": True
            },
            {
                "id": "persuasive_style", 
                "title": "설득적 스타일",
                "description": "논리적 근거와 함께 부드러운 설득 접근",
                "active": True
            },
            {
                "id": "fairness_focus",
                "title": "공정성 강조",
                "description": "공정한 경쟁과 투명성을 강조하는 메시지 구성",
                "active": True
            },
            {
                "id": "stakeholder_aware",
                "title": "이해관계자 인식",
                "description": "조합원, 참여사 등 모든 이해관계자를 고려한 메시지",
                "active": True
            }
        ]
    
    def simulate_file_upload(self, filename: str, content: str) -> Dict:
        """파일 업로드 시뮬레이션"""
        
        file_info = {
            "file_id": f"file_{len(self.uploaded_files)+1}",
            "filename": filename,
            "upload_time": datetime.now().isoformat(),
            "content_summary": self._analyze_content(content),
            "key_insights": self._extract_insights(content),
            "status": "processed"
        }
        
        self.uploaded_files.append(file_info)
        
        print(f"📁 파일 업로드 완료: {filename}")
        print(f"   🔍 분석 결과: {file_info['content_summary']}")
        print(f"   💡 주요 인사이트: {', '.join(file_info['key_insights'])}")
        
        return file_info
    
    def _analyze_content(self, content: str) -> str:
        """콘텐츠 분석"""
        word_count = len(content.split())
        
        if "설계" in content or "제안" in content:
            return f"설계/제안 관련 문서 ({word_count}단어)"
        elif "계약" in content or "조건" in content:
            return f"계약/조건 관련 문서 ({word_count}단어)"
        elif "분석" in content or "평가" in content:
            return f"분석/평가 문서 ({word_count}단어)"
        else:
            return f"일반 문서 ({word_count}단어)"
    
    def _extract_insights(self, content: str) -> List[str]:
        """인사이트 추출"""
        insights = []
        
        keywords = ["공정성", "경쟁", "투명성", "조합원", "설계", "허가", "기준"]
        
        for keyword in keywords:
            if keyword in content:
                insights.append(keyword)
                if len(insights) >= 3:
                    break
        
        return insights if insights else ["일반적 내용"]
    
    def generate_smart_message(self, user_input: str, context: Dict = None) -> Dict:
        """스마트 메시지 생성"""
        
        print(f"\n🤖 AI 메시지 생성 중...")
        print(f"📝 입력: {user_input}")
        
        # 상황 분석
        situation_analysis = self._analyze_situation(user_input)
        print(f"🔍 상황 분석: {situation_analysis['category']}")
        
        # 적용 가능한 지침 선택
        applicable_instructions = self._select_instructions(situation_analysis)
        print(f"📋 적용 지침: {[i['title'] for i in applicable_instructions]}")
        
        # 메시지 생성
        generated_message = self._generate_response_message(
            user_input, situation_analysis, applicable_instructions
        )
        
        # 품질 평가
        quality_score = self._evaluate_quality(generated_message, situation_analysis)
        
        # 대안 메시지 생성
        alternatives = self._generate_alternatives(user_input, situation_analysis)
        
        result = {
            "message_id": f"msg_{len(self.message_history)+1}",
            "original_input": user_input,
            "situation_analysis": situation_analysis,
            "applied_instructions": [i['title'] for i in applicable_instructions],
            "generated_message": generated_message,
            "quality_score": quality_score,
            "alternatives": alternatives,
            "reasoning": self._explain_reasoning(situation_analysis, applicable_instructions),
            "suggestions": self._generate_suggestions(generated_message),
            "timestamp": datetime.now().isoformat()
        }
        
        self.message_history.append(result)
        
        return result
    
    def _analyze_situation(self, text: str) -> Dict:
        """상황 분석"""
        
        if any(word in text for word in ["불공정", "공정", "경쟁"]):
            return {
                "category": "공정성 이슈",
                "tone_required": "assertive",
                "urgency": "high",
                "stakeholders": ["조합원", "시공사"],
                "key_issues": ["공정 경쟁", "투명성"]
            }
        elif any(word in text for word in ["제안", "검토", "의견"]):
            return {
                "category": "제안/의견",
                "tone_required": "consultative", 
                "urgency": "medium",
                "stakeholders": ["관련자"],
                "key_issues": ["협의", "검토"]
            }
        else:
            return {
                "category": "일반 커뮤니케이션",
                "tone_required": "neutral",
                "urgency": "low",
                "stakeholders": ["일반"],
                "key_issues": ["소통"]
            }
    
    def _select_instructions(self, situation: Dict) -> List[Dict]:
        """상황에 맞는 지침 선택"""
        
        selected = []
        
        # 기본 전문적 톤은 항상 적용
        selected.append(self.instructions[0])
        
        # 상황별 지침 선택
        if situation["category"] == "공정성 이슈":
            selected.extend([self.instructions[1], self.instructions[2], self.instructions[3]])
        elif situation["category"] == "제안/의견":
            selected.append(self.instructions[1])
        
        return selected
    
    def _generate_response_message(self, user_input: str, situation: Dict, instructions: List[Dict]) -> str:
        """응답 메시지 생성"""
        
        # 공정성 이슈 특별 처리
        if "삼성" in user_input and "허가 불가" in user_input:
            return self._generate_fairness_response(user_input, situation)
        
        # 일반적인 응답 생성
        if situation["category"] == "공정성 이슈":
            return f"말씀하신 공정성 우려에 대해 깊이 공감합니다. 모든 참여사에게 동등한 기회가 보장되어야 하며, 투명하고 객관적인 평가 기준이 적용되어야 합니다. 조합원 여러분의 이익을 위해 이 문제를 적극적으로 검토하겠습니다."
        
        elif situation["category"] == "제안/의견":
            return f"제안해주신 의견에 대해 신중히 검토해보겠습니다. 관련 이해관계자들과 충분한 협의를 통해 최선의 방향을 모색하도록 하겠습니다."
        
        else:
            return f"말씀해주신 내용을 잘 이해했습니다. 적절한 조치를 취하도록 하겠습니다."
    
    def _generate_fairness_response(self, user_input: str, situation: Dict) -> str:
        """공정성 이슈 전용 응답 생성"""
        
        templates = [
            "말씀하신 공정성 우려에 대해 깊이 공감합니다. 시공사 선정 과정에서 모든 참여업체에게 동등한 기회가 보장되어야 하며, 특정 업체의 설계 방식만을 기준으로 하는 것은 공정한 경쟁을 저해할 수 있습니다. 조합원 여러분께서 지켜보고 계신 만큼, 투명하고 객관적인 평가가 이루어질 수 있도록 적극 검토하겠습니다.",
            
            "공정한 경쟁 환경 조성에 대한 우려를 충분히 이해합니다. 경쟁사 설계에 없다는 이유만으로 허가를 불가하는 것은 경쟁의 공정성을 해칠 수 있는 문제입니다. 모든 조합원분들께서 관심을 가지고 지켜보고 계신 만큼, 객관적이고 합리적인 기준이 적용될 수 있도록 관련 절차를 점검해보겠습니다.",
            
            "지적해주신 공정성 이슈는 매우 중요한 문제입니다. 시공사 선정에 있어서는 기술적 우수성과 혁신성이 평가되어야 하며, 단순히 기존 설계와의 차이점을 이유로 배제되어서는 안 됩니다. 조합원들의 이익을 최우선으로 하여 공정하고 투명한 절차가 진행되도록 노력하겠습니다."
        ]
        
        # 상황에 가장 적합한 템플릿 선택 (여기서는 첫 번째)
        return templates[0]
    
    def _generate_alternatives(self, user_input: str, situation: Dict) -> List[str]:
        """대안 메시지들 생성"""
        
        if "공정성" in situation["category"]:
            return [
                "더 강력한 톤: 이는 명백한 공정 경쟁 위반 사항입니다. 즉시 시정이 필요합니다.",
                "더 온화한 톤: 이 부분에 대해 함께 논의해보면 좋겠습니다.",
                "제안 중심: 공정한 평가를 위한 명확한 기준 수립을 제안드립니다."
            ]
        else:
            return [
                "더 구체적 버전: 구체적인 개선 방안을 제시하겠습니다.",
                "더 간결한 버전: 검토 후 조치하겠습니다.",
                "질문 포함 버전: 추가로 필요한 정보가 있으시면 말씀해주세요."
            ]
    
    def _evaluate_quality(self, message: str, situation: Dict) -> float:
        """메시지 품질 평가"""
        
        score = 0.7  # 기본 점수
        
        # 길이 적절성
        if 100 <= len(message) <= 300:
            score += 0.1
        
        # 상황 적합성
        if situation["category"] == "공정성 이슈" and "공정" in message:
            score += 0.1
        
        # 전문성
        if any(word in message for word in ["검토", "절차", "기준"]):
            score += 0.1
        
        return min(score, 1.0)
    
    def _explain_reasoning(self, situation: Dict, instructions: List[Dict]) -> str:
        """생성 근거 설명"""
        
        parts = []
        parts.append(f"상황 카테고리: {situation['category']}")
        parts.append(f"적용된 지침: {len(instructions)}개")
        parts.append(f"고려된 이해관계자: {', '.join(situation['stakeholders'])}")
        
        return " | ".join(parts)
    
    def _generate_suggestions(self, message: str) -> List[str]:
        """개선 제안"""
        
        suggestions = []
        
        if len(message) > 300:
            suggestions.append("메시지를 더 간결하게 줄여보세요")
        
        if "구체적" not in message:
            suggestions.append("더 구체적인 행동 계획을 포함해보세요")
        
        if not any(word in message for word in ["시간", "일정", "기한"]):
            suggestions.append("시간 프레임을 명시해보세요")
        
        return suggestions if suggestions else ["현재 메시지가 적절합니다"]
    
    def display_result(self, result: Dict):
        """결과 표시"""
        
        print(f"\n🎯 생성된 메시지:")
        print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print(f"{result['generated_message']}")
        print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        
        print(f"\n📊 분석 정보:")
        print(f"   📈 품질 점수: {result['quality_score']:.1%}")
        print(f"   🎭 상황 분석: {result['situation_analysis']['category']}")
        print(f"   📋 적용 지침: {', '.join(result['applied_instructions'])}")
        print(f"   🧠 생성 근거: {result['reasoning']}")
        
        print(f"\n💡 대안 메시지:")
        for i, alt in enumerate(result['alternatives'], 1):
            print(f"   {i}. {alt}")
        
        print(f"\n🔧 개선 제안:")
        for suggestion in result['suggestions']:
            print(f"   • {suggestion}")

def main():
    """메인 데모 실행"""
    
    print("🚀 ChatGPT 스타일 시스템 데모 시작!")
    print("=" * 50)
    
    # 데모 시스템 생성
    demo = ChatGPTStyleDemo()
    
    # 1. 파일 업로드 시뮬레이션
    print("\n📁 1. 파일 업로드 시뮬레이션")
    print("-" * 30)
    
    demo.simulate_file_upload(
        "시공사_제안서_비교.pdf",
        "삼성물산 제안서와 다른 시공사들의 설계 비교 분석 자료입니다. 공정한 평가 기준과 투명성이 중요합니다."
    )
    
    demo.simulate_file_upload(
        "조합원_의견서.txt", 
        "조합원들의 시공사 선정에 대한 다양한 의견과 우려사항을 정리한 문서입니다."
    )
    
    # 2. 실제 상황 메시지 생성
    print(f"\n🤖 2. 실제 상황 메시지 생성")
    print("-" * 30)
    
    user_input = "삼성은 경쟁사 설계에 없는 것을 이유로 '허가 불가'라고 몰아붙이는데, 이건 공정 경쟁이 아닙니다. 조합원들이 다 지켜보고 있습니다."
    
    result = demo.generate_smart_message(user_input)
    demo.display_result(result)
    
    # 3. 다른 상황 테스트
    print(f"\n🔄 3. 추가 상황 테스트")
    print("-" * 30)
    
    test_inputs = [
        "새로운 설계 변경 사항에 대해 검토가 필요합니다.",
        "공사 일정 지연에 대한 대응 방안을 제안드립니다."
    ]
    
    for test_input in test_inputs:
        print(f"\n📝 테스트 입력: {test_input}")
        result = demo.generate_smart_message(test_input)
        print(f"🎯 생성 메시지: {result['generated_message']}")
        print(f"📊 품질 점수: {result['quality_score']:.1%}")
    
    # 4. 시스템 통계
    print(f"\n📊 4. 시스템 통계")
    print("-" * 30)
    print(f"📁 업로드된 파일: {len(demo.uploaded_files)}개")
    print(f"🤖 생성된 메시지: {len(demo.message_history)}개")
    print(f"📋 사용 가능한 지침: {len(demo.instructions)}개")
    print(f"⭐ 평균 품질 점수: {sum(m['quality_score'] for m in demo.message_history) / len(demo.message_history):.1%}")
    
    print(f"\n🎉 데모 완료!")
    print("=" * 50)

if __name__ == "__main__":
    main() 