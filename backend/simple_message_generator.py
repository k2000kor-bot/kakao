"""
Simple Contextual Message Generator
간단한 맥락 기반 메시지 생성기

Minimal dependencies version for quick deployment
"""

import json
import re
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from datetime import datetime
from collections import defaultdict, Counter

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

@dataclass
class MessageGenerationRequest:
    chat_room_id: str
    target_person: str
    message_intent: str
    context_messages: List[Dict[str, Any]]
    tone_preference: str = "natural"
    length_preference: str = "medium"
    formality_level: str = "casual"

@dataclass
class GeneratedMessage:
    message_id: str
    content: str
    confidence_score: float
    reasoning: str
    style_match_score: float
    context_relevance_score: float
    alternatives: List[str]
    metadata: Dict[str, Any]

class SimpleContextualMessageGenerator:
    """간단한 맥락 기반 메시지 생성기"""
    
    def __init__(self):
        self.message_templates = self._initialize_templates()
        self.korean_patterns = self._initialize_korean_patterns()
    
    def _initialize_templates(self) -> Dict[str, Dict[str, List[str]]]:
        """메시지 템플릿 초기화"""
        return {
            'greeting': {
                'casual': [
                    "안녕! {name}님 잘 지내시나요?",
                    "안녕하세요~ 오랜만이에요!",
                    "안녕하세요 {name}님! 어떻게 지내세요?",
                    "좋은 {time_period}입니다! 잘 지내고 계신가요?"
                ],
                'formal': [
                    "안녕하세요 {name}님. 잘 지내셨나요?",
                    "안녕하세요. 오랜만에 인사드립니다.",
                    "{name}님, 안녕하세요. 최근 어떻게 지내시는지 궁금했습니다.",
                    "안녕하세요 {name}님. 요즘 어떤 일들로 바쁘신가요?"
                ],
                'professional': [
                    "{name}님, 안녕하세요. 업무는 잘 진행되고 계신가요?",
                    "안녕하세요 {name}님. 프로젝트 진행 상황이 궁금합니다.",
                    "{name}님, 안녕하세요. 최근 업무 상황은 어떠신지요?"
                ]
            },
            'question': {
                'casual': [
                    "{name}님, {topic}에 대해 어떻게 생각하세요?",
                    "{topic} 관련해서 궁금한 게 있는데요",
                    "요즘 {topic} 어떻게 보고 계신가요?",
                    "{name}님 의견이 궁금해요. {topic}에 대해서요"
                ],
                'formal': [
                    "{name}님, {topic}에 대한 의견을 여쭤보고 싶습니다.",
                    "{topic} 관련하여 질문이 있습니다.",
                    "{name}님께서는 {topic}에 대해 어떻게 생각하시는지 궁금합니다."
                ]
            },
            'suggestion': {
                'casual': [
                    "{suggestion} 어떨까요?",
                    "{suggestion}하면 좋을 것 같은데요",
                    "제 생각엔 {suggestion}가 괜찮을 것 같아요",
                    "{name}님, {suggestion} 해보시는 건 어떠세요?"
                ],
                'formal': [
                    "{suggestion}를 제안해 드립니다.",
                    "{suggestion}에 대해 검토해 보시면 어떨까요?",
                    "{name}님, {suggestion}를 고려해 보시기 바랍니다."
                ]
            },
            'response': {
                'agreement': [
                    "맞습니다! 저도 그렇게 생각해요",
                    "동감입니다",
                    "좋은 생각이네요",
                    "그 의견에 찬성합니다"
                ],
                'appreciation': [
                    "고맙습니다!",
                    "정말 도움이 됐어요",
                    "감사합니다 {name}님",
                    "많은 도움이 되었습니다"
                ]
            },
            'reminder': {
                'casual': [
                    "{name}님, {event} 잊지 마세요!",
                    "{event} 있다는 거 기억하시죠?",
                    "내일 {event} 있어요~",
                    "{name}님, {event} 준비는 되셨나요?"
                ],
                'formal': [
                    "{name}님, {event}에 대해 알려드립니다.",
                    "{event} 일정을 확인해 주시기 바랍니다.",
                    "{name}님께 {event} 관련하여 안내드립니다."
                ]
            }
        }
    
    def _initialize_korean_patterns(self) -> Dict[str, List[str]]:
        """한국어 패턴 분석용"""
        return {
            'formal_words': ['습니다', '입니다', '해주세요', '부탁드립니다', '안녕하세요'],
            'casual_words': ['야', '지', '어', '음', 'ㅋㅋ', 'ㅎㅎ', '~'],
            'business_words': ['회의', '프로젝트', '업무', '일정', '보고', '검토'],
            'time_words': {
                'morning': ['아침', '오전'],
                'afternoon': ['오후', '점심'],
                'evening': ['저녁', '밤']
            }
        }
    
    async def generate_contextual_message(self, request: MessageGenerationRequest) -> GeneratedMessage:
        """맥락 기반 메시지 생성"""
        try:
            # 1. 대화 패턴 분석
            conversation_analysis = self._analyze_conversation_simple(request.context_messages)
            
            # 2. 개인 스타일 분석  
            person_style = self._analyze_person_style(request.target_person, request.context_messages)
            
            # 3. 최근 대화 흐름 분석
            recent_context = self._analyze_recent_context(request.context_messages[-5:])
            
            # 4. 메시지 생성 전략 결정
            strategy = self._determine_strategy(request, person_style, recent_context)
            
            # 5. 메시지 생성
            generated_content = self._generate_message_content(request, strategy, recent_context)
            
            # 6. 품질 평가
            quality_scores = self._evaluate_quality(generated_content, person_style, recent_context)
            
            # 7. 대안 메시지 생성
            alternatives = self._generate_alternatives(request, strategy, 3)
            
            message_id = f"msg_{int(datetime.now().timestamp())}"
            
            return GeneratedMessage(
                message_id=message_id,
                content=generated_content,
                confidence_score=quality_scores['overall'],
                reasoning=strategy['reasoning'],
                style_match_score=quality_scores['style_match'],
                context_relevance_score=quality_scores['context_relevance'],
                alternatives=alternatives,
                metadata={
                    'strategy': strategy,
                    'person_style': person_style,
                    'recent_context': recent_context
                }
            )
            
        except Exception as e:
            return self._generate_fallback_message(request, str(e))
    
    def _analyze_conversation_simple(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """간단한 대화 분석"""
        if not messages:
            return {'tone': 'neutral', 'topics': [], 'participants': []}
        
        all_text = ' '.join([msg.get('content', '') for msg in messages])
        participants = list(set([msg.get('sender', '') for msg in messages if msg.get('sender')]))
        
        # 톤 분석
        formal_count = sum(1 for word in self.korean_patterns['formal_words'] if word in all_text)
        casual_count = sum(1 for word in self.korean_patterns['casual_words'] if word in all_text)
        
        if formal_count > casual_count:
            tone = 'formal'
        elif casual_count > formal_count:
            tone = 'casual'
        else:
            tone = 'neutral'
        
        # 간단한 토픽 추출 (키워드 기반)
        topics = []
        business_count = sum(1 for word in self.korean_patterns['business_words'] if word in all_text)
        if business_count > 0:
            topics.append('업무')
        
        if any(word in all_text for word in ['재개발', '분양', '아파트']):
            topics.append('부동산')
        if any(word in all_text for word in ['회의', '미팅']):
            topics.append('회의')
        
        return {
            'tone': tone,
            'topics': topics,
            'participants': participants,
            'message_count': len(messages)
        }
    
    def _analyze_person_style(self, person_name: str, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """개인 스타일 분석"""
        person_messages = [msg for msg in messages if msg.get('sender') == person_name]
        
        if not person_messages:
            return {'style': 'unknown', 'avg_length': 0, 'formality': 0.5}
        
        person_text = ' '.join([msg.get('content', '') for msg in person_messages])
        
        # 스타일 분석
        formal_score = sum(1 for word in self.korean_patterns['formal_words'] if word in person_text)
        casual_score = sum(1 for word in self.korean_patterns['casual_words'] if word in person_text)
        
        total_score = formal_score + casual_score
        if total_score > 0:
            formality = formal_score / total_score
        else:
            formality = 0.5
        
        avg_length = sum(len(msg.get('content', '')) for msg in person_messages) / len(person_messages)
        
        return {
            'style': 'formal' if formality > 0.6 else 'casual' if formality < 0.4 else 'neutral',
            'avg_length': avg_length,
            'formality': formality,
            'message_count': len(person_messages)
        }
    
    def _analyze_recent_context(self, recent_messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """최근 대화 맥락 분석"""
        if not recent_messages:
            return {'last_topic': '', 'momentum': 'low', 'last_sender': ''}
        
        last_message = recent_messages[-1]
        last_content = last_message.get('content', '')
        last_sender = last_message.get('sender', '')
        
        # 질문이 있는지 확인
        has_question = '?' in last_content or any(word in last_content for word in ['어떻게', '언제', '뭐', '왜'])
        
        # 감정 표현 확인
        has_excitement = '!' in last_content or any(word in last_content for word in ['와', '대박'])
        
        # 시간 간격 확인 (간단 버전)
        momentum = 'high' if has_excitement else 'normal' if has_question else 'low'
        
        return {
            'last_topic': self._extract_simple_topic(last_content),
            'momentum': momentum,
            'last_sender': last_sender,
            'has_question': has_question,
            'has_excitement': has_excitement
        }
    
    def _extract_simple_topic(self, text: str) -> str:
        """간단한 토픽 추출"""
        if any(word in text for word in ['회의', '미팅']):
            return '회의'
        elif any(word in text for word in ['재개발', '분양']):
            return '재개발'
        elif any(word in text for word in ['일정', '시간']):
            return '일정'
        elif any(word in text for word in ['업무', '일']):
            return '업무'
        else:
            return ''
    
    def _determine_strategy(self, request: MessageGenerationRequest, 
                          person_style: Dict[str, Any], recent_context: Dict[str, Any]) -> Dict[str, Any]:
        """메시지 생성 전략 결정"""
        
        # 기본 전략
        strategy = {
            'tone': request.tone_preference,
            'length': request.length_preference,
            'formality': request.formality_level,
            'reasoning': ''
        }
        
        # 개인 스타일에 맞춤
        if person_style['style'] == 'formal' and request.tone_preference == 'natural':
            strategy['tone'] = 'formal'
            strategy['reasoning'] = f"{request.target_person}님은 정중한 표현을 선호하시는 것 같습니다."
        elif person_style['style'] == 'casual' and request.tone_preference == 'natural':
            strategy['tone'] = 'casual' 
            strategy['reasoning'] = f"{request.target_person}님은 친근한 대화를 선호하시는 것 같습니다."
        
        # 최근 맥락 반영
        if recent_context['has_question']:
            strategy['approach'] = 'responsive'
            strategy['reasoning'] += " 질문에 대한 응답으로 작성했습니다."
        elif recent_context['momentum'] == 'high':
            strategy['approach'] = 'energetic'
            strategy['reasoning'] += " 활발한 대화 분위기를 이어가도록 했습니다."
        
        if not strategy['reasoning']:
            strategy['reasoning'] = "자연스러운 대화 흐름을 위해 작성했습니다."
        
        return strategy
    
    def _generate_message_content(self, request: MessageGenerationRequest,
                                strategy: Dict[str, Any], recent_context: Dict[str, Any]) -> str:
        """메시지 내용 생성"""
        
        intent = request.message_intent
        tone = strategy['tone']
        
        # 템플릿 선택
        if intent in self.message_templates:
            if tone in self.message_templates[intent]:
                templates = self.message_templates[intent][tone]
            else:
                templates = self.message_templates[intent]['casual']
        else:
            templates = self.message_templates['greeting']['casual']
        
        # 랜덤 템플릿 선택
        import random
        template = random.choice(templates)
        
        # 변수 치환
        content = template.format(
            name=request.target_person,
            topic=recent_context.get('last_topic', '최근 이야기'),
            suggestion='함께 논의',
            event='예정된 일정',
            time_period=self._get_time_period()
        )
        
        # 길이 조정
        content = self._adjust_message_length(content, strategy['length'])
        
        return content
    
    def _get_time_period(self) -> str:
        """현재 시간대 반환"""
        hour = datetime.now().hour
        if 6 <= hour < 12:
            return "아침"
        elif 12 <= hour < 18:
            return "오후"
        elif 18 <= hour < 22:
            return "저녁"
        else:
            return "밤"
    
    def _adjust_message_length(self, content: str, length_preference: str) -> str:
        """메시지 길이 조정"""
        if length_preference == 'short':
            # 첫 번째 문장만 사용
            sentences = content.split('.')
            return sentences[0] + ('.' if len(sentences) > 1 else '')
        elif length_preference == 'long':
            # 추가 문구 덧붙이기
            additions = [
                " 의견을 듣고 싶습니다.",
                " 어떻게 생각하세요?",
                " 시간 되실 때 답변 부탁드려요.",
                " 함께 이야기해보면 좋겠네요."
            ]
            import random
            return content + random.choice(additions)
        
        return content
    
    def _evaluate_quality(self, content: str, person_style: Dict[str, Any], 
                         recent_context: Dict[str, Any]) -> Dict[str, float]:
        """메시지 품질 평가"""
        
        # 스타일 매치 점수
        style_match = 0.7  # 기본 점수
        
        if person_style['style'] == 'formal' and any(word in content for word in self.korean_patterns['formal_words']):
            style_match += 0.2
        elif person_style['style'] == 'casual' and any(word in content for word in self.korean_patterns['casual_words']):
            style_match += 0.2
        
        # 맥락 관련성 점수
        context_relevance = 0.6  # 기본 점수
        
        if recent_context.get('last_topic') and recent_context['last_topic'] in content:
            context_relevance += 0.3
        
        overall = (style_match + context_relevance) / 2
        
        return {
            'style_match': min(1.0, style_match),
            'context_relevance': min(1.0, context_relevance),
            'overall': min(1.0, overall)
        }
    
    def _generate_alternatives(self, request: MessageGenerationRequest, 
                              strategy: Dict[str, Any], count: int = 3) -> List[str]:
        """대안 메시지 생성"""
        alternatives = []
        
        # 다른 톤으로 생성
        alt_tones = ['casual', 'formal', 'professional']
        for tone in alt_tones:
            if tone != strategy['tone'] and len(alternatives) < count:
                alt_strategy = strategy.copy()
                alt_strategy['tone'] = tone
                alt_content = self._generate_message_content(request, alt_strategy, {})
                alternatives.append(alt_content)
        
        return alternatives
    
    def _generate_fallback_message(self, request: MessageGenerationRequest, error: str) -> GeneratedMessage:
        """폴백 메시지 생성"""
        fallback_messages = [
            f"안녕하세요 {request.target_person}님! 잘 지내시나요?",
            f"{request.target_person}님, 안녕하세요. 요즘 어떻게 지내고 계신가요?",
            f"안녕하세요! {request.target_person}님께 인사드립니다.",
        ]
        
        import random
        content = random.choice(fallback_messages)
        
        return GeneratedMessage(
            message_id=f"fallback_{int(datetime.now().timestamp())}",
            content=content,
            confidence_score=0.5,
            reasoning=f"기본 템플릿을 사용했습니다. (오류: {error})",
            style_match_score=0.5,
            context_relevance_score=0.5,
            alternatives=[],
            metadata={'fallback': True, 'error': error}
        )

# FastAPI 애플리케이션
app = FastAPI(title="Simple Contextual Message Generator", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 전역 메시지 생성기
message_generator = SimpleContextualMessageGenerator()

@app.get("/")
async def root():
    return {"message": "Simple Contextual Message Generator API"}

@app.post("/api/generate-message")
async def generate_message(request_data: Dict[str, Any]):
    """맥락 기반 메시지 생성"""
    try:
        request = MessageGenerationRequest(
            chat_room_id=request_data['chat_room_id'],
            target_person=request_data['target_person'],
            message_intent=request_data.get('message_intent', 'greeting'),
            context_messages=request_data.get('context_messages', []),
            tone_preference=request_data.get('tone_preference', 'natural'),
            length_preference=request_data.get('length_preference', 'medium'),
            formality_level=request_data.get('formality_level', 'casual')
        )
        
        generated_message = await message_generator.generate_contextual_message(request)
        
        return asdict(generated_message)
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/analyze-conversation")
async def analyze_conversation(request_data: Dict[str, Any]):
    """대화 분석"""
    try:
        messages = request_data.get('messages', [])
        analysis = message_generator._analyze_conversation_simple(messages)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/analyze-person")
async def analyze_person(request_data: Dict[str, Any]):
    """개인 분석"""
    try:
        person_name = request_data['person_name']
        messages = request_data.get('messages', [])
        analysis = message_generator._analyze_person_style(person_name, messages)
        
        # 더 상세한 정보 추가
        person_messages = [msg for msg in messages if msg.get('sender') == person_name]
        
        return {
            'name': person_name,
            'message_count': len(person_messages),
            'avg_message_length': analysis['avg_length'],
            'communication_style': {
                'formal': analysis['formality'],
                'casual': 1 - analysis['formality'],
                'style': analysis['style']
            },
            'frequent_topics': ['대화', '소통'],  # 간단 버전
            'preferred_time_slots': ['morning', 'afternoon']  # 기본값
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/templates")
async def get_templates():
    """템플릿 조회"""
    return {"templates": message_generator.message_templates}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8007) 