import random
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

class SimpleAIModel:
    """간단한 AI 모델 시뮬레이션"""
    
    def __init__(self):
        self.model_name = "simple-ai-v1.0"
        self.is_loaded = True
    
    def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """감정 분석 시뮬레이션"""
        sentiments = ['positive', 'negative', 'neutral']
        weights = [0.4, 0.3, 0.3]  # 긍정적이 더 많도록
        
        sentiment = random.choices(sentiments, weights=weights)[0]
        confidence = random.uniform(0.7, 0.95)
        
        return {
            "sentiment": sentiment,
            "confidence": round(confidence, 3),
            "score": random.uniform(-1, 1),
            "keywords": self._extract_keywords(text)
        }
    
    def extract_topics(self, text: str) -> List[Dict[str, Any]]:
        """주제 추출 시뮬레이션"""
        topics = [
            {"topic": "급여", "confidence": 0.85, "keywords": ["급여", "체불", "지급"]},
            {"topic": "복지", "confidence": 0.78, "keywords": ["복지", "혜택", "의료"]},
            {"topic": "안전", "confidence": 0.92, "keywords": ["안전", "규정", "보호"]},
            {"topic": "협의", "confidence": 0.75, "keywords": ["협의", "회의", "논의"]},
            {"topic": "일정", "confidence": 0.68, "keywords": ["일정", "시간", "날짜"]}
        ]
        
        # 텍스트에 따라 관련 주제 선택
        relevant_topics = []
        for topic in topics:
            if any(keyword in text for keyword in topic["keywords"]):
                relevant_topics.append(topic)
        
        return relevant_topics if relevant_topics else topics[:2]
    
    def generate_response(self, context: str, style: str = "neutral") -> str:
        """응답 생성 시뮬레이션"""
        responses = {
            "neutral": [
                "네, 말씀하신 내용을 확인했습니다. 관련 사항을 검토하여 답변드리겠습니다.",
                "조합원님의 의견을 잘 들었습니다. 적절한 조치를 취하도록 하겠습니다.",
                "문의해주신 내용에 대해 자세히 안내드리겠습니다."
            ],
            "empathetic": [
                "조합원님의 상황을 이해합니다. 함께 해결방안을 찾아보겠습니다.",
                "힘드신 상황이시군요. 조합에서 최선을 다해 도움드리겠습니다.",
                "말씀하신 내용에 공감합니다. 신속하게 처리하도록 하겠습니다."
            ],
            "formal": [
                "귀하의 문의사항을 접수하였습니다. 관련 부서에서 검토 후 답변드리겠습니다.",
                "제출해주신 내용을 바탕으로 적절한 조치를 취하도록 하겠습니다.",
                "문의하신 사항에 대해 정확한 정보를 제공하도록 하겠습니다."
            ]
        }
        
        return random.choice(responses.get(style, responses["neutral"]))
    
    def _extract_keywords(self, text: str) -> List[str]:
        """키워드 추출 시뮬레이션"""
        keywords = ["급여", "복지", "안전", "협의", "일정", "조합", "시공사", "조합원"]
        found_keywords = [kw for kw in keywords if kw in text]
        return found_keywords[:3]  # 최대 3개 키워드

class ConversationAnalyzer:
    """대화 분석기"""
    
    def __init__(self):
        self.ai_model = SimpleAIModel()
    
    def analyze_conversation(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """대화 분석"""
        if not messages:
            return {"error": "메시지가 없습니다."}
        
        # 전체 텍스트 결합
        full_text = " ".join([msg.get("content", "") for msg in messages])
        
        # 감정 분석
        sentiment_analysis = self.ai_model.analyze_sentiment(full_text)
        
        # 주제 추출
        topics = self.ai_model.extract_topics(full_text)
        
        # 참여자 분석
        participants = {}
        for msg in messages:
            sender = msg.get("sender", "Unknown")
            if sender not in participants:
                participants[sender] = {
                    "message_count": 0,
                    "avg_sentiment": 0,
                    "topics": []
                }
            participants[sender]["message_count"] += 1
        
        return {
            "sentiment_analysis": sentiment_analysis,
            "topics": topics,
            "participants": participants,
            "total_messages": len(messages),
            "analysis_timestamp": datetime.now().isoformat()
        }

class ResponseGenerator:
    """응답 생성기"""
    
    def __init__(self):
        self.ai_model = SimpleAIModel()
    
    def generate_smart_response(self, context: str, style: str = "neutral") -> Dict[str, Any]:
        """스마트 응답 생성"""
        response = self.ai_model.generate_response(context, style)
        
        return {
            "response": response,
            "style": style,
            "confidence": random.uniform(0.7, 0.95),
            "generated_at": datetime.now().isoformat(),
            "suggested_actions": self._generate_suggested_actions(context)
        }
    
    def _generate_suggested_actions(self, context: str) -> List[str]:
        """제안 액션 생성"""
        actions = [
            "관련 부서에 문의",
            "조합원 대표와 협의",
            "시공사와 논의",
            "법적 검토 진행",
            "즉시 조치 필요"
        ]
        
        # 컨텍스트에 따라 관련 액션 선택
        relevant_actions = []
        if "급여" in context or "체불" in context:
            relevant_actions.extend(["즉시 조치 필요", "관련 부서에 문의"])
        if "안전" in context:
            relevant_actions.extend(["시공사와 논의", "즉시 조치 필요"])
        if "복지" in context:
            relevant_actions.extend(["조합원 대표와 협의", "관련 부서에 문의"])
        
        return relevant_actions if relevant_actions else actions[:2]

class QualityAnalyzer:
    """품질 분석기"""
    
    def __init__(self):
        self.ai_model = SimpleAIModel()
    
    def analyze_response_quality(self, response: str, context: str) -> Dict[str, Any]:
        """응답 품질 분석"""
        # 간단한 품질 메트릭 계산
        length_score = min(len(response) / 100, 1.0)  # 길이 점수
        relevance_score = random.uniform(0.6, 0.95)  # 관련성 점수
        clarity_score = random.uniform(0.7, 0.95)  # 명확성 점수
        
        overall_score = (length_score + relevance_score + clarity_score) / 3
        
        return {
            "overall_score": round(overall_score, 3),
            "length_score": round(length_score, 3),
            "relevance_score": round(relevance_score, 3),
            "clarity_score": round(clarity_score, 3),
            "suggestions": self._generate_quality_suggestions(overall_score),
            "analyzed_at": datetime.now().isoformat()
        }
    
    def _generate_quality_suggestions(self, score: float) -> List[str]:
        """품질 개선 제안"""
        if score >= 0.8:
            return ["훌륭한 응답입니다!", "현재 수준을 유지하세요."]
        elif score >= 0.6:
            return ["좀 더 구체적인 정보를 추가하세요.", "명확성을 높이세요."]
        else:
            return ["응답을 더 자세히 작성하세요.", "관련성 있는 정보를 추가하세요."]

# 전역 인스턴스 생성
ai_model = SimpleAIModel()
conversation_analyzer = ConversationAnalyzer()
response_generator = ResponseGenerator()
quality_analyzer = QualityAnalyzer() 