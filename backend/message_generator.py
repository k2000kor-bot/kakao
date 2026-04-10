import re
import random
from typing import List, Dict, Any
from datetime import datetime
import json
import os

class MessageGenerator:
    def __init__(self):
        # 재개발·정비 프로젝트 일반 데모 응답 (특정 현장명 없음)
        self.redevelopment_demo_messages = {
            "시공사": [
                "시공사 평가 기준에 대해 논의해보시죠. 현재 검토 중인 업체들의 기술력과 실적을 종합적으로 분석해보겠습니다.",
                "각 시공사의 기술력과 경험을 체계적으로 평가하여 최적의 파트너를 선정해보겠습니다.",
                "시공사별 비교 분석표를 작성하여 객관적인 평가 기준으로 검토해보겠습니다."
            ],
            "공사비": [
                "공사비 분담금 분석 결과를 공유해주세요. 각 시공사별 제안 금액과 우리 조합원들의 부담을 고려한 최적안을 찾아보겠습니다.",
                "공사비 분담금 계산 방식을 명확히 하여 조합원들의 이해를 돕겠습니다.",
                "각 시공사의 공사비 제안을 비교 분석하여 투명하고 합리적인 기준을 마련해보겠습니다."
            ],
            "설계": [
                "설계 품질 비교 자료를 확인해보겠습니다. 평면도, 단면도, 상세도 등 각 시공사의 설계 완성도를 체계적으로 평가해보겠습니다.",
                "설계도면의 완성도와 실용성을 중심으로 각 시공사의 역량을 평가해보겠습니다.",
                "설계 품질 평가 기준을 정하여 객관적인 비교 분석을 진행하겠습니다."
            ],
            "홍보": [
                "홍보 전략에 대한 의견을 들려주세요. 조합원들의 이해를 돕기 위한 설명회 개최 계획과 자료 준비 상황을 점검해보겠습니다.",
                "조합원들에게 프로젝트의 진행 상황을 효과적으로 전달할 수 있는 홍보 방안을 마련해보겠습니다.",
                "투명하고 정확한 정보 전달을 위한 홍보 전략을 수립해보겠습니다."
            ],
            "투표": [
                "조합원 투표 일정을 확정해보겠습니다. 시공사 선정을 위한 투표 방법과 절차를 명확히 정리하여 공지하겠습니다.",
                "투표 절차와 방법을 투명하게 공개하여 모든 조합원이 참여할 수 있도록 하겠습니다.",
                "시공사 선정을 위한 투표 시스템을 구축하여 민주적인 의사결정을 도모하겠습니다."
            ],
            "계약": [
                "계약 조건 검토를 시작하겠습니다. 각 시공사가 제안한 계약 조건들을 비교하여 우리 조합에 가장 유리한 조건을 찾아보겠습니다.",
                "계약서의 주요 조건들을 면밀히 검토하여 조합원들의 이익을 최대한 보호하는 방안을 마련하겠습니다.",
                "계약 조건의 공정성과 합리성을 검토하여 최적의 계약을 체결할 수 있도록 하겠습니다."
            ],
            "일정": [
                "프로젝트 일정을 점검해보겠습니다. 각 단계별 마일스톤을 설정하여 체계적으로 진행하겠습니다.",
                "공사 일정과 조합원들의 일정을 조율하여 최적의 타이밍에 진행할 수 있도록 하겠습니다.",
                "전체 프로젝트 일정을 명확히 하여 모든 관계자가 이해할 수 있도록 공유하겠습니다."
            ],
            "품질": [
                "시공 품질 관리 방안을 검토해보겠습니다. 각 시공사의 품질 보증 체계를 비교 분석하겠습니다.",
                "건설 품질 기준을 명확히 하여 최고의 결과물을 만들어낼 수 있도록 하겠습니다.",
                "품질 관리 시스템을 구축하여 공사 전 과정에서 일관된 품질을 유지하겠습니다."
            ]
        }
        
        self.general_messages = {
            "동의": [
                "네, 알겠습니다. 해당 사항에 대해 검토해보겠습니다.",
                "좋은 제안이네요. 이에 대해 더 자세히 논의해보시죠.",
                "확인했습니다. 관련 자료를 준비해서 공유하겠습니다."
            ],
            "질문": [
                "좋은 질문이네요. 이 부분에 대해 더 자세히 설명드리겠습니다.",
                "궁금한 점이 있으시면 언제든 말씀해주세요. 함께 해결해보겠습니다.",
                "질문해주셔서 감사합니다. 명확하게 답변드리겠습니다."
            ],
            "감사": [
                "감사합니다. 더욱 열심히 노력하겠습니다.",
                "고맙습니다. 조합원 여러분의 신뢰에 보답하겠습니다.",
                "감사합니다. 최선을 다해 도움을 드리겠습니다."
            ],
            "안내": [
                "참고하실 수 있도록 관련 자료를 정리해서 공유하겠습니다.",
                "이해하기 쉽도록 단계별로 설명드리겠습니다.",
                "궁금한 점이 있으시면 언제든 연락주세요."
            ]
        }
        
        # 실제 대화 데이터에서 학습한 패턴들
        self.conversation_patterns = {
            "긍정적_반응": [
                "좋은 아이디어네요!",
                "훌륭한 제안입니다.",
                "정말 좋은 생각이에요.",
                "이런 방향으로 진행해보시죠."
            ],
            "부정적_반응": [
                "걱정되는 부분이 있으시군요.",
                "이해가 됩니다. 함께 해결방안을 찾아보겠습니다.",
                "우려되는 점을 말씀해주셔서 감사합니다.",
                "이 부분에 대해 더 자세히 논의해보시죠."
            ],
            "정보_요청": [
                "관련 자료를 준비해서 공유하겠습니다.",
                "더 자세한 정보를 제공해드리겠습니다.",
                "이 부분에 대해 상세히 설명드리겠습니다.",
                "참고하실 수 있도록 정리해서 보내드리겠습니다."
            ],
            "일정_확인": [
                "일정을 다시 한번 확인해보겠습니다.",
                "스케줄을 점검해서 알려드리겠습니다.",
                "진행 상황을 체크해서 공유하겠습니다.",
                "일정 조율이 필요한 부분이 있는지 검토해보겠습니다."
            ]
        }

    def load_conversation_data(self, room_id: str = "") -> List[str]:
        """실제 대화 데이터를 로드하여 학습"""
        try:
            candidates = []
            if room_id and room_id.strip():
                rid = room_id.strip()
                candidates.append(os.path.join("..", "chat_rooms", rid, f"{rid}.txt"))
            candidates.extend([
                os.path.join("..", "chat_rooms", "sample_room", "sample_export.txt"),
                os.path.join("..", "frontend", "public", "sample_chat.txt"),
            ])
            for chat_file in candidates:
                if os.path.exists(chat_file):
                    with open(chat_file, 'r', encoding='utf-8') as f:
                        content = f.read()
                        messages = re.findall(r'\[(.*?)\] (.*?): (.*)', content)
                        return [msg[2] for msg in messages if len(msg) > 2]
        except Exception as e:
            print(f"대화 데이터 로드 오류: {e}")
        return []

    def analyze_context(self, context: str) -> Dict[str, Any]:
        """대화 컨텍스트를 분석하여 키워드와 감정을 추출"""
        keywords = []
        emotion = "neutral"
        intent = "general"
        
        # 재개발·프로젝트 일반 키워드
        if any(word in context for word in ["시공사", "업체", "건설사"]):
            keywords.append("시공사")
        if any(word in context for word in ["공사비", "비용", "금액", "분담금"]):
            keywords.append("공사비")
        if any(word in context for word in ["설계", "도면", "평면도"]):
            keywords.append("설계")
        if any(word in context for word in ["홍보", "설명회", "공지"]):
            keywords.append("홍보")
        if any(word in context for word in ["투표", "선정", "선거"]):
            keywords.append("투표")
        if any(word in context for word in ["계약", "조건", "협약"]):
            keywords.append("계약")
        if any(word in context for word in ["일정", "스케줄", "계획"]):
            keywords.append("일정")
        if any(word in context for word in ["품질", "관리", "검사"]):
            keywords.append("품질")
            
        # 일반적인 키워드 추출
        if any(word in context for word in ["네", "알겠습니다", "확인"]):
            keywords.append("동의")
        if any(word in context for word in ["질문", "궁금", "어떻게"]):
            keywords.append("질문")
        if any(word in context for word in ["감사", "고맙", "thank"]):
            keywords.append("감사")
        if any(word in context for word in ["안내", "설명", "알려"]):
            keywords.append("안내")
            
        # 의도 분석
        if any(word in context for word in ["어떻게", "방법", "절차", "확인"]):
            intent = "정보_요청"
        elif any(word in context for word in ["언제", "일정", "스케줄", "진행"]):
            intent = "일정_확인"
        elif any(word in context for word in ["좋다", "훌륭", "완벽", "좋은", "정말"]):
            intent = "긍정적_반응"
        elif any(word in context for word in ["문제", "걱정", "우려", "걱정"]):
            intent = "부정적_반응"
            
        # 감정 분석
        if any(word in context for word in ["좋다", "훌륭", "완벽"]):
            emotion = "positive"
        elif any(word in context for word in ["문제", "걱정", "우려"]):
            emotion = "negative"
        elif any(word in context for word in ["급하다", "서둘러", "빨리"]):
            emotion = "urgent"
            
        return {
            "keywords": keywords,
            "emotion": emotion,
            "intent": intent,
            "context_length": len(context)
        }

    def generate_response(self, context: str, room_id: str = "", style: str = "professional") -> List[Dict[str, Any]]:
        """컨텍스트에 기반한 응답 메시지 생성"""
        analysis = self.analyze_context(context)
        responses = []
        
        # 실제 대화 데이터 로드
        conversation_data = self.load_conversation_data(room_id)
        
        if room_id and room_id.strip():
            for keyword in analysis["keywords"]:
                if keyword in self.redevelopment_demo_messages:
                    messages = self.redevelopment_demo_messages[keyword]
                    selected_message = random.choice(messages)
                    
                    # 스타일에 따른 조정
                    if style == "formal":
                        selected_message = selected_message.replace("해보겠습니다", "하겠습니다")
                        selected_message = selected_message.replace("해보시죠", "하시죠")
                    elif style == "casual":
                        selected_message = selected_message.replace("하겠습니다", "해보겠습니다")
                        selected_message = selected_message.replace("하시죠", "해보시죠")
                    
                    responses.append({
                        "text": selected_message,
                        "confidence": 0.9,
                        "category": keyword,
                        "type": "project_demo"
                    })
        
        # 의도 기반 응답
        if analysis["intent"] in self.conversation_patterns:
            intent_messages = self.conversation_patterns[analysis["intent"]]
            selected_message = random.choice(intent_messages)
            responses.append({
                "text": selected_message,
                "confidence": 0.85,
                "category": analysis["intent"],
                "type": "intent"
            })
        
        # 일반적인 응답
        if not responses:
            for keyword in analysis["keywords"]:
                if keyword in self.general_messages:
                    messages = self.general_messages[keyword]
                    selected_message = random.choice(messages)
                    responses.append({
                        "text": selected_message,
                        "confidence": 0.8,
                        "category": keyword,
                        "type": "general"
                    })
        
        # 컨텍스트가 비어있거나 키워드가 없는 경우 기본 응답
        if not responses:
            default_responses = [
                "네, 말씀해주세요. 어떤 도움이 필요하신가요?",
                "좋은 의견이네요. 더 자세히 들려주세요.",
                "확인했습니다. 관련하여 검토해보겠습니다."
            ]
            responses.append({
                "text": random.choice(default_responses),
                "confidence": 0.7,
                "category": "일반",
                "type": "default"
            })
        
        # 감정에 따른 추가 응답
        if analysis["emotion"] == "positive":
            responses.append({
                "text": "긍정적인 의견 감사합니다. 더욱 열심히 노력하겠습니다.",
                "confidence": 0.85,
                "category": "감정",
                "type": "emotion"
            })
        elif analysis["emotion"] == "negative":
            responses.append({
                "text": "걱정되는 부분이 있으시군요. 함께 해결방안을 찾아보겠습니다.",
                "confidence": 0.85,
                "category": "감정",
                "type": "emotion"
            })
        elif analysis["emotion"] == "urgent":
            responses.append({
                "text": "급한 사안이시군요. 우선순위를 정해서 빠르게 처리하겠습니다.",
                "confidence": 0.85,
                "category": "감정",
                "type": "emotion"
            })
        
        return responses[:3]  # 최대 3개 응답 반환

# 전역 인스턴스 생성
message_generator = MessageGenerator() 