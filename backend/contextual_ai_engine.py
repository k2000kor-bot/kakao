#!/usr/bin/env python3
"""
문맥 분석 AI 엔진 - 고급 문맥 이해 및 응답 생성
- 긴 텍스트의 전체 맥락 이해
- 복합적인 요구사항 파악
- 지능형 응답 생성
"""
import os
import sqlite3
import json
import re
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="문맥 분석 AI 엔진",
    description="고급 문맥 이해 및 지능형 응답 생성",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 데이터 모델
class ContextualRequest(BaseModel):
    message: str
    conversation_history: List[Dict[str, Any]]
    context: Optional[Dict[str, Any]] = None
    user_preferences: Optional[Dict[str, Any]] = None

class ContextualAnalysis(BaseModel):
    intent: str
    requirements: List[str]
    topics: List[str]
    entities: List[str]
    sentiment: str
    urgency: str
    action_items: List[str]
    follow_up_questions: List[str]
    summary: str
    confidence: float

class ContextualResponse(BaseModel):
    analysis: ContextualAnalysis
    response: str
    suggestions: List[str]
    related_topics: List[str]
    next_actions: List[str]

# 데이터베이스 초기화
def init_database():
    conn = sqlite3.connect('contextual_ai_engine.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS contextual_analyses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message_id TEXT NOT NULL,
            intent TEXT NOT NULL,
            requirements TEXT,
            topics TEXT,
            entities TEXT,
            sentiment TEXT NOT NULL,
            urgency TEXT NOT NULL,
            action_items TEXT,
            confidence REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS conversation_contexts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            full_context TEXT NOT NULL,
            analysis_result TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

# 문맥 분석 엔진
class ContextualAnalysisEngine:
    def __init__(self):
        self.topic_patterns = {
            '재개발/재건축': r'(?:재개발|재건축|아파트|주택|건설|시공)',
            '시공사': r'(?:시공사|건설사|삼성|GS|대우|현대|롯데)',
            '분석/검토': r'(?:분석|검토|평가|리뷰|검토)',
            '글쓰기/작성': r'(?:글쓰기|작성|카드뉴스|포스팅|기사)',
            '비교/대조': r'(?:비교|대조|대비|상대)',
            '문제/이슈': r'(?:문제|이슈|논란|갈등|분쟁)',
            '법률/규정': r'(?:법률|규정|법령|조항|계약)',
            '금융/경제': r'(?:금융|경제|비용|예산|투자)'
        }
        
        self.entity_patterns = {
            'companies': r'(?:삼성물산|GS건설|대우건설|현대건설|롯데건설|포스코건설)',
            'locations': r'(?:강남|서울|부산|대구|인천)',
            'names': r'(?:이재헌|박재우|박은진|정지혜|김철수|이영희)',
            'organizations': r'(?:조합|협회|단체|위원회|협의회)'
        }
        
        self.intent_patterns = {
            'analysis_request': r'(?:분석|검토|평가|검토해줘|분석해줘)',
            'summary_request': r'(?:요약|정리|핵심|간단히)',
            'writing_request': r'(?:글쓰기|작성|카드뉴스|포스팅)',
            'comparison_request': r'(?:비교|대조|대비|어떤게)',
            'prediction_request': r'(?:예측|전망|미래|앞으로)',
            'solution_request': r'(?:해결|방안|대책|방법)'
        }
        
        self.requirement_patterns = {
            '카드뉴스 형식': r'(?:카드뉴스|카드)',
            '극우적 댓글 스타일': r'(?:극우적|극우|보수적)',
            '실명방 스타일': r'(?:실명|실명방|익명)',
            '요약/정리': r'(?:요약|정리|간단히)',
            '상세 분석': r'(?:상세|자세히|구체적으로)',
            '간단한 설명': r'(?:간단|간략|요약)'
        }

    def analyze_context(self, request: ContextualRequest) -> ContextualResponse:
        """전체 문맥을 분석하고 응답을 생성"""
        try:
            # 전체 컨텍스트 구축
            full_context = self.build_full_context(request)
            
            # 문맥 분석 수행
            analysis = self.perform_contextual_analysis(full_context, request.message)
            
            # 응답 생성
            response = self.generate_contextual_response(analysis, request)
            
            # 제안사항 생성
            suggestions = self.generate_suggestions(analysis)
            
            # 관련 토픽 생성
            related_topics = self.generate_related_topics(analysis)
            
            # 다음 액션 생성
            next_actions = self.generate_next_actions(analysis)
            
            return ContextualResponse(
                analysis=analysis,
                response=response,
                suggestions=suggestions,
                related_topics=related_topics,
                next_actions=next_actions
            )
            
        except Exception as e:
            logger.error(f"문맥 분석 오류: {e}")
            return self.create_fallback_response(request)

    def build_full_context(self, request: ContextualRequest) -> str:
        """전체 대화 컨텍스트 구축"""
        history_text = ""
        
        for msg in request.conversation_history:
            sender = "사용자" if msg.get('isUser', False) else "AI"
            content = msg.get('content', '')
            history_text += f"{sender}: {content}\n\n"
        
        return f"{history_text}사용자: {request.message}"

    def perform_contextual_analysis(self, full_context: str, new_message: str) -> ContextualAnalysis:
        """문맥 분석 수행"""
        # 주요 토픽 추출
        topics = self.extract_main_topics(full_context)
        
        # 핵심 엔티티 추출
        entities = self.extract_key_entities(full_context)
        
        # 의도 분석
        intent = self.analyze_intent(new_message, full_context)
        
        # 요구사항 추출
        requirements = self.extract_requirements(new_message, full_context)
        
        # 감정 분석
        sentiment = self.analyze_sentiment(full_context)
        
        # 긴급도 분석
        urgency = self.analyze_urgency(new_message, full_context)
        
        # 액션 아이템 추출
        action_items = self.extract_action_items(new_message, full_context)
        
        # 후속 질문 생성
        follow_up_questions = self.generate_follow_up_questions(topics, intent)
        
        # 요약 생성
        summary = self.generate_summary(full_context, topics, intent)
        
        # 신뢰도 계산
        confidence = self.calculate_confidence(topics, entities, intent)
        
        return ContextualAnalysis(
            intent=intent,
            requirements=requirements,
            topics=topics,
            entities=entities,
            sentiment=sentiment,
            urgency=urgency,
            action_items=action_items,
            follow_up_questions=follow_up_questions,
            summary=summary,
            confidence=confidence
        )

    def extract_main_topics(self, context: str) -> List[str]:
        """주요 토픽 추출"""
        topics = []
        
        for topic_name, pattern in self.topic_patterns.items():
            if re.search(pattern, context, re.IGNORECASE):
                topics.append(topic_name)
        
        return list(set(topics))

    def extract_key_entities(self, context: str) -> List[str]:
        """핵심 엔티티 추출"""
        entities = []
        
        for entity_type, pattern in self.entity_patterns.items():
            matches = re.findall(pattern, context, re.IGNORECASE)
            entities.extend(matches)
        
        return list(set(entities))

    def analyze_intent(self, message: str, context: str) -> str:
        """의도 분석"""
        for intent_name, pattern in self.intent_patterns.items():
            if re.search(pattern, message, re.IGNORECASE):
                return intent_name
        
        return 'general_inquiry'

    def extract_requirements(self, message: str, context: str) -> List[str]:
        """요구사항 추출"""
        requirements = []
        
        for req_name, pattern in self.requirement_patterns.items():
            if re.search(pattern, message + " " + context, re.IGNORECASE):
                requirements.append(req_name)
        
        return requirements

    def analyze_sentiment(self, context: str) -> str:
        """감정 분석"""
        positive_words = ['좋다', '긍정적', '유리', '성공', '개선', '해결', '진전', '희망']
        negative_words = ['문제', '논란', '부정적', '불리', '실패', '어려움', '갈등', '우려']
        
        positive_count = sum(1 for word in positive_words if word in context)
        negative_count = sum(1 for word in negative_words if word in context)
        
        if positive_count > negative_count:
            return 'positive'
        elif negative_count > positive_count:
            return 'negative'
        elif positive_count == negative_count and positive_count > 0:
            return 'mixed'
        else:
            return 'neutral'

    def analyze_urgency(self, message: str, context: str) -> str:
        """긴급도 분석"""
        urgent_keywords = ['긴급', '즉시', '바로', '당장', '시급', '중요']
        high_urgency_keywords = ['중요', '필수', '반드시', '꼭', '빨리']
        medium_urgency_keywords = ['가능하면', '시간되면', '나중에', '여유있게']
        
        if any(keyword in message for keyword in urgent_keywords):
            return 'critical'
        elif any(keyword in message for keyword in high_urgency_keywords):
            return 'high'
        elif any(keyword in message for keyword in medium_urgency_keywords):
            return 'medium'
        else:
            return 'low'

    def extract_action_items(self, message: str, context: str) -> List[str]:
        """액션 아이템 추출"""
        action_items = []
        
        if re.search(r'(?:분석해줘|검토해줘)', message):
            action_items.append('상세 분석 수행')
        
        if re.search(r'(?:글쓰기|작성해줘)', message):
            action_items.append('글 작성')
        
        if re.search(r'(?:비교|대조)', message):
            action_items.append('비교 분석')
        
        if re.search(r'(?:요약|정리)', message):
            action_items.append('요약 작성')
        
        if re.search(r'(?:해결방안|대책)', message):
            action_items.append('해결방안 제시')
        
        return action_items

    def generate_follow_up_questions(self, topics: List[str], intent: str) -> List[str]:
        """후속 질문 생성"""
        questions = []
        
        if '시공사' in topics:
            questions.append('다른 시공사와의 비교 분석이 필요하신가요?')
            questions.append('시공사 선정 기준에 대해 더 자세히 알고 싶으신가요?')
        
        if '재개발/재건축' in topics:
            questions.append('재개발 과정의 다른 단계에 대한 정보가 필요하신가요?')
            questions.append('재개발 혜택과 문제점을 비교해드릴까요?')
        
        if intent == 'analysis_request':
            questions.append('더 상세한 분석이 필요하시면 말씀해주세요.')
            questions.append('다른 관점에서의 분석도 가능합니다.')
        
        if intent == 'writing_request':
            questions.append('다른 형식으로도 작성 가능합니다.')
            questions.append('글의 톤과 스타일을 조정할 수 있습니다.')
        
        return questions

    def generate_summary(self, context: str, topics: List[str], intent: str) -> str:
        """요약 생성"""
        topic_text = ', '.join(topics) if topics else '일반적인'
        intent_text = self.get_intent_description(intent)
        
        return f"현재 대화는 {topic_text}에 대한 논의로, {intent_text} 의도를 가지고 있습니다."

    def get_intent_description(self, intent: str) -> str:
        """의도 설명"""
        descriptions = {
            'analysis_request': '분석 요청',
            'summary_request': '요약 요청',
            'writing_request': '글쓰기 요청',
            'comparison_request': '비교 요청',
            'prediction_request': '예측 요청',
            'solution_request': '해결방안 요청',
            'general_inquiry': '일반 문의'
        }
        
        return descriptions.get(intent, '일반 문의')

    def calculate_confidence(self, topics: List[str], entities: List[str], intent: str) -> float:
        """신뢰도 계산"""
        confidence = 0.5  # 기본값
        
        # 토픽이 명확할수록 신뢰도 증가
        if topics:
            confidence += 0.2
        if len(topics) > 2:
            confidence += 0.1
        
        # 엔티티가 많을수록 신뢰도 증가
        if entities:
            confidence += 0.1
        if len(entities) > 2:
            confidence += 0.1
        
        # 의도가 명확할수록 신뢰도 증가
        if intent != 'general_inquiry':
            confidence += 0.1
        
        return min(confidence, 1.0)

    def generate_contextual_response(self, analysis: ContextualAnalysis, request: ContextualRequest) -> str:
        """문맥 기반 응답 생성"""
        response = "전체 문맥을 파악했습니다. "
        
        if analysis.intent == 'analysis_request':
            response += f"{', '.join(analysis.topics)}에 대한 종합적인 분석을 제공하겠습니다. "
        elif analysis.intent == 'summary_request':
            response += "주요 내용을 요약하여 정리해드리겠습니다. "
        elif analysis.intent == 'writing_request':
            response += "요청하신 형식으로 글을 작성해드리겠습니다. "
        elif analysis.intent == 'comparison_request':
            response += "요청하신 비교 분석을 수행하겠습니다. "
        elif analysis.intent == 'solution_request':
            response += "해결방안을 제시해드리겠습니다. "
        
        if analysis.requirements:
            response += f"특별히 {', '.join(analysis.requirements)} 요구사항을 반영하여 처리하겠습니다."
        
        return response

    def generate_suggestions(self, analysis: ContextualAnalysis) -> List[str]:
        """제안사항 생성"""
        suggestions = []
        
        if analysis.intent == 'analysis_request':
            suggestions.append('더 상세한 분석이 필요하시면 말씀해주세요.')
            suggestions.append('다른 관점에서의 분석도 가능합니다.')
        
        if '시공사' in analysis.topics:
            suggestions.append('다른 시공사와의 비교 분석을 제공할 수 있습니다.')
        
        if '카드뉴스 형식' in analysis.requirements:
            suggestions.append('카드뉴스 외에도 다른 형식으로 제작 가능합니다.')
        
        if analysis.urgency in ['high', 'critical']:
            suggestions.append('긴급한 요청이므로 우선적으로 처리하겠습니다.')
        
        return suggestions

    def generate_related_topics(self, analysis: ContextualAnalysis) -> List[str]:
        """관련 토픽 생성"""
        related_topics = []
        
        if '시공사' in analysis.topics:
            related_topics.extend(['시공사 선정 기준', '시공사 평가 방법', '시공사 비교 분석'])
        
        if '재개발/재건축' in analysis.topics:
            related_topics.extend(['재개발 과정', '재개발 혜택', '재개발 문제점'])
        
        if '분석/검토' in analysis.topics:
            related_topics.extend(['상세 분석', '비교 분석', '예측 분석'])
        
        return related_topics

    def generate_next_actions(self, analysis: ContextualAnalysis) -> List[str]:
        """다음 액션 생성"""
        actions = []
        
        actions.extend(analysis.action_items)
        
        if analysis.intent == 'analysis_request':
            actions.append('데이터 수집 및 분석')
        
        if analysis.intent == 'writing_request':
            actions.append('글 작성 및 편집')
        
        if analysis.intent == 'comparison_request':
            actions.append('비교 기준 설정 및 분석')
        
        return actions

    def create_fallback_response(self, request: ContextualRequest) -> ContextualResponse:
        """폴백 응답 생성"""
        fallback_analysis = ContextualAnalysis(
            intent='general_inquiry',
            requirements=[],
            topics=[],
            entities=[],
            sentiment='neutral',
            urgency='low',
            action_items=[],
            follow_up_questions=[],
            summary='일반적인 문의로 인식되었습니다.',
            confidence=0.3
        )
        
        return ContextualResponse(
            analysis=fallback_analysis,
            response='메시지를 이해했습니다. 도움이 필요하시면 구체적으로 말씀해주세요.',
            suggestions=['더 구체적인 요청을 해주시면 정확한 답변을 드릴 수 있습니다.'],
            related_topics=[],
            next_actions=[]
        )

# 엔진 인스턴스 생성
contextual_engine = ContextualAnalysisEngine()

# API 엔드포인트
@app.post("/api/v7/contextual-analysis", response_model=ContextualResponse)
async def analyze_context(request: ContextualRequest):
    """문맥 분석 API"""
    try:
        result = contextual_engine.analyze_context(request)
        
        # 데이터베이스에 저장
        save_analysis_result(request.message, result.analysis)
        
        return result
    except Exception as e:
        logger.error(f"문맥 분석 API 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def save_analysis_result(message: str, analysis: ContextualAnalysis):
    """분석 결과를 데이터베이스에 저장"""
    try:
        conn = sqlite3.connect('contextual_ai_engine.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO contextual_analyses 
            (message_id, intent, requirements, topics, entities, sentiment, urgency, action_items, confidence)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            str(datetime.now().timestamp()),
            analysis.intent,
            json.dumps(analysis.requirements),
            json.dumps(analysis.topics),
            json.dumps(analysis.entities),
            analysis.sentiment,
            analysis.urgency,
            json.dumps(analysis.action_items),
            analysis.confidence
        ))
        
        conn.commit()
        conn.close()
    except Exception as e:
        logger.error(f"분석 결과 저장 오류: {e}")

@app.get("/api/v7/health")
async def health_check():
    """헬스 체크"""
    return {"status": "healthy", "service": "contextual_ai_engine", "version": "1.0.0"}

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "service": "문맥 분석 AI 엔진",
        "version": "1.0.0",
        "endpoints": {
            "contextual_analysis": "/api/v7/contextual-analysis",
            "health": "/api/v7/health"
        }
    }

# 서버 시작 시 데이터베이스 초기화
if __name__ == "__main__":
    init_database()
    import uvicorn

    _p = int(
        os.environ.get("CONTEXTUAL_AI_ENGINE_PORT", os.environ.get("PORT", "8003"))
    )
    uvicorn.run(app, host="0.0.0.0", port=_p)
