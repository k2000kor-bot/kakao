"""
CORBU.AI Advanced Language Processor - 고급 언어 처리 및 이해 엔진
"""
import re
import json
import asyncio
import logging
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional, Tuple, Union
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

class LanguageType(Enum):
    KOREAN = "ko"
    ENGLISH = "en"
    JAPANESE = "ja"
    CHINESE = "zh"
    MIXED = "mixed"
    UNKNOWN = "unknown"

class IntentType(Enum):
    QUESTION = "question"
    COMMAND = "command"
    STATEMENT = "statement"
    GREETING = "greeting"
    REQUEST = "request"
    COMPLAINT = "complaint"
    PRAISE = "praise"
    UNKNOWN = "unknown"

@dataclass
class LanguageAnalysis:
    """언어 분석 결과"""
    text: str
    language: LanguageType
    intent: IntentType
    confidence: float
    entities: List[Dict[str, Any]]
    sentiment: Dict[str, float]
    keywords: List[str]
    complexity: float
    context: Dict[str, Any]

class AdvancedLanguageProcessor:
    """고급 언어 처리 및 이해 엔진"""
    
    def __init__(self):
        self.context_memory = {}
        self.conversation_history = []
        self.language_patterns = self._initialize_language_patterns()
        self.intent_patterns = self._initialize_intent_patterns()
        self.entity_patterns = self._initialize_entity_patterns()
        
    def _initialize_language_patterns(self) -> Dict[str, List[str]]:
        """언어 패턴 초기화"""
        return {
            "korean": [
                r'[가-힣]',  # 한글 문자
                r'[ㄱ-ㅎㅏ-ㅣ]',  # 한글 자모
                r'[ㅏ-ㅣ]',  # 한글 모음
                r'[ㄱ-ㅎ]'   # 한글 자음
            ],
            "english": [
                r'[a-zA-Z]',  # 영문자
                r'\b[a-zA-Z]{2,}\b'  # 영단어
            ],
            "japanese": [
                r'[ひらがな]',  # 히라가나
                r'[カタカナ]',  # 가타카나
                r'[一-龯]'  # 한자
            ],
            "chinese": [
                r'[一-龯]',  # 한자
                r'[ㄅ-ㄩ]'  # 주음부호
            ]
        }
    
    def _initialize_intent_patterns(self) -> Dict[str, List[str]]:
        """의도 패턴 초기화"""
        return {
            "question": [
                r'[?？]',  # 물음표
                r'어떻게|무엇|언제|어디|왜|누구|어느|얼마나',  # 의문사
                r'알려주세요|설명해주세요|가르쳐주세요',  # 요청
                r'궁금합니다|궁금해요|궁금해'  # 궁금함
            ],
            "command": [
                r'해주세요|해줘|해봐|해봐요',  # 요청
                r'만들어주세요|생성해주세요|작성해주세요',  # 생성 요청
                r'분석해주세요|확인해주세요|체크해주세요',  # 분석 요청
                r'삭제해주세요|지워주세요|제거해주세요'  # 삭제 요청
            ],
            "greeting": [
                r'안녕하세요|안녕|하이|헬로|좋은 아침|좋은 저녁',  # 인사
                r'반갑습니다|반가워요|만나서 기뻐요'  # 반가움
            ],
            "complaint": [
                r'문제|오류|에러|실패|안되|안돼|안됩니다',  # 문제
                r'느려|느리다|느려요|느립니다',  # 느림
                r'복잡해|복잡하다|복잡해요|복잡합니다'  # 복잡함
            ],
            "praise": [
                r'좋아|좋다|좋아요|좋습니다|훌륭해|훌륭하다',  # 좋음
                r'멋져|멋지다|멋져요|멋집니다|대단해|대단하다',  # 멋짐
                r'완벽해|완벽하다|완벽해요|완벽합니다'  # 완벽함
            ]
        }
    
    def _initialize_entity_patterns(self) -> Dict[str, List[str]]:
        """엔티티 패턴 초기화"""
        return {
            "person": [
                r'[A-Z][a-z]+ [A-Z][a-z]+',  # 영문 이름
                r'[가-힣]{2,4}씨|[가-힣]{2,4}님'  # 한글 이름
            ],
            "email": [
                r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
            ],
            "phone": [
                r'\d{3}-\d{4}-\d{4}|\d{10,11}'
            ],
            "url": [
                r'https?://[^\s]+'
            ],
            "number": [
                r'\d+'
            ],
            "date": [
                r'\d{4}년\s*\d{1,2}월\s*\d{1,2}일',
                r'\d{4}-\d{2}-\d{2}',
                r'\d{1,2}/\d{1,2}/\d{4}'
            ],
            "time": [
                r'\d{1,2}:\d{2}',
                r'\d{1,2}시\s*\d{1,2}분'
            ]
        }
    
    async def analyze_text(self, text: str, user_id: str = "default") -> LanguageAnalysis:
        """고급 텍스트 분석"""
        try:
            # 기본 정보 추출
            language = self._detect_language(text)
            intent = self._detect_intent(text)
            entities = self._extract_entities(text)
            sentiment = self._analyze_sentiment(text)
            keywords = self._extract_keywords(text)
            complexity = self._calculate_complexity(text)
            context = self._analyze_context(text, user_id)
            
            # 신뢰도 계산
            confidence = self._calculate_confidence(text, language, intent, entities)
            
            # 분석 결과 생성
            analysis = LanguageAnalysis(
                text=text,
                language=language,
                intent=intent,
                confidence=confidence,
                entities=entities,
                sentiment=sentiment,
                keywords=keywords,
                complexity=complexity,
                context=context
            )
            
            # 대화 기록에 추가
            self._add_to_conversation_history(text, analysis, user_id)
            
            return analysis
            
        except Exception as e:
            logger.error(f"텍스트 분석 중 오류: {e}")
            return self._create_fallback_analysis(text)
    
    def _detect_language(self, text: str) -> LanguageType:
        """언어 감지"""
        korean_score = len(re.findall(r'[가-힣]', text))
        english_score = len(re.findall(r'[a-zA-Z]', text))
        japanese_score = len(re.findall(r'[ひらがなカタカナ]', text))
        chinese_score = len(re.findall(r'[一-龯]', text))
        
        total_chars = len(text.replace(' ', ''))
        if total_chars == 0:
            return LanguageType.UNKNOWN
        
        scores = {
            LanguageType.KOREAN: korean_score / total_chars,
            LanguageType.ENGLISH: english_score / total_chars,
            LanguageType.JAPANESE: japanese_score / total_chars,
            LanguageType.CHINESE: chinese_score / total_chars
        }
        
        max_score = max(scores.values())
        if max_score < 0.3:
            return LanguageType.MIXED
        
        return max(scores, key=scores.get)
    
    def _detect_intent(self, text: str) -> IntentType:
        """의도 감지"""
        text_lower = text.lower()
        
        for intent_type, patterns in self.intent_patterns.items():
            for pattern in patterns:
                if re.search(pattern, text_lower):
                    return IntentType(intent_type)
        
        return IntentType.UNKNOWN
    
    def _extract_entities(self, text: str) -> List[Dict[str, Any]]:
        """엔티티 추출"""
        entities = []
        
        for entity_type, patterns in self.entity_patterns.items():
            for pattern in patterns:
                matches = re.finditer(pattern, text)
                for match in matches:
                    entities.append({
                        "type": entity_type,
                        "value": match.group(),
                        "start": match.start(),
                        "end": match.end(),
                        "confidence": 0.8
                    })
        
        return entities
    
    def _analyze_sentiment(self, text: str) -> Dict[str, float]:
        """감정 분석"""
        positive_words = [
            '좋다', '좋은', '훌륭하다', '훌륭한', '멋지다', '멋진',
            '행복', '기쁨', '만족', '완벽', '완벽한', '대단하다',
            '감사', '고마워', '고맙다', '사랑', '사랑해', '좋아해'
        ]
        
        negative_words = [
            '나쁘다', '나쁜', '안좋다', '안좋은', '슬프다', '슬픈',
            '화나다', '화난', '불만', '실망', '실망스럽다', '짜증',
            '싫다', '싫어', '미워', '미워해', '혐오', '혐오스럽다'
        ]
        
        text_lower = text.lower()
        words = text_lower.split()
        
        if not words:
            return {"positive": 0.5, "negative": 0.5, "neutral": 0.0}
        
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        total_words = len(words)
        positive_score = min(positive_count / total_words * 2, 1.0)
        negative_score = min(negative_count / total_words * 2, 1.0)
        neutral_score = max(1 - positive_score - negative_score, 0.0)
        
        return {
            "positive": positive_score,
            "negative": negative_score,
            "neutral": neutral_score
        }
    
    def _extract_keywords(self, text: str) -> List[str]:
        """키워드 추출"""
        # 간단한 키워드 추출 (실제로는 TF-IDF나 Word2Vec 사용)
        words = re.findall(r'\b\w+\b', text.lower())
        
        # 불용어 제거
        stop_words = {
            '이', '가', '을', '를', '은', '는', '에', '에서', '로', '으로',
            '의', '와', '과', '도', '만', '부터', '까지', '에게', '한테',
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'
        }
        
        filtered_words = [word for word in words if word not in stop_words and len(word) > 1]
        
        # 빈도 계산
        word_freq = {}
        for word in filtered_words:
            word_freq[word] = word_freq.get(word, 0) + 1
        
        # 빈도순으로 정렬하여 상위 키워드 반환
        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        return [word for word, freq in sorted_words[:10]]
    
    def _calculate_complexity(self, text: str) -> float:
        """텍스트 복잡도 계산"""
        sentences = re.split(r'[.!?]', text)
        words = text.split()
        
        if not sentences or not words:
            return 0.0
        
        avg_sentence_length = len(words) / len(sentences)
        avg_word_length = sum(len(word) for word in words) / len(words)
        
        # 복잡도 점수 (0-1)
        complexity = min((avg_sentence_length * avg_word_length) / 100, 1.0)
        return round(complexity, 3)
    
    def _analyze_context(self, text: str, user_id: str) -> Dict[str, Any]:
        """맥락 분석"""
        context = {
            "user_id": user_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "previous_topics": [],
            "conversation_flow": "new",
            "emotional_state": "neutral",
            "urgency": "normal"
        }
        
        # 이전 대화 기록에서 맥락 추출
        if user_id in self.conversation_history:
            recent_conversations = self.conversation_history[user_id][-5:]  # 최근 5개 대화
            context["previous_topics"] = [conv.get("keywords", []) for conv in recent_conversations]
            
            if len(recent_conversations) > 0:
                context["conversation_flow"] = "continuing"
        
        # 긴급도 분석
        urgency_keywords = ['급해', '급합니다', '빨리', '즉시', '당장', 'urgent', 'asap']
        if any(keyword in text.lower() for keyword in urgency_keywords):
            context["urgency"] = "high"
        
        return context
    
    def _calculate_confidence(self, text: str, language: LanguageType, intent: IntentType, entities: List[Dict]) -> float:
        """신뢰도 계산"""
        confidence = 0.5  # 기본 신뢰도
        
        # 언어 감지 신뢰도
        if language != LanguageType.UNKNOWN:
            confidence += 0.2
        
        # 의도 감지 신뢰도
        if intent != IntentType.UNKNOWN:
            confidence += 0.2
        
        # 엔티티 추출 신뢰도
        if entities:
            confidence += 0.1
        
        # 텍스트 길이 신뢰도
        if len(text) > 10:
            confidence += 0.1
        
        return min(confidence, 1.0)
    
    def _add_to_conversation_history(self, text: str, analysis: LanguageAnalysis, user_id: str):
        """대화 기록에 추가"""
        if user_id not in self.conversation_history:
            self.conversation_history[user_id] = []
        
        conversation_entry = {
            "text": text,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "language": analysis.language.value,
            "intent": analysis.intent.value,
            "sentiment": analysis.sentiment,
            "keywords": analysis.keywords,
            "entities": analysis.entities
        }
        
        self.conversation_history[user_id].append(conversation_entry)
        
        # 최대 50개 대화만 유지
        if len(self.conversation_history[user_id]) > 50:
            self.conversation_history[user_id] = self.conversation_history[user_id][-50:]
    
    def _create_fallback_analysis(self, text: str) -> LanguageAnalysis:
        """기본 분석 결과 생성"""
        return LanguageAnalysis(
            text=text,
            language=LanguageType.UNKNOWN,
            intent=IntentType.UNKNOWN,
            confidence=0.3,
            entities=[],
            sentiment={"positive": 0.5, "negative": 0.5, "neutral": 0.0},
            keywords=text.split()[:5],
            complexity=0.5,
            context={"user_id": "default", "timestamp": datetime.now(timezone.utc).isoformat()}
        )
    
    async def get_conversation_context(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """대화 맥락 조회"""
        if user_id not in self.conversation_history:
            return []
        
        return self.conversation_history[user_id][-limit:]
    
    async def clear_conversation_history(self, user_id: str = None):
        """대화 기록 삭제"""
        if user_id:
            if user_id in self.conversation_history:
                del self.conversation_history[user_id]
        else:
            self.conversation_history.clear()
    
    async def get_language_statistics(self) -> Dict[str, Any]:
        """언어 처리 통계"""
        total_conversations = sum(len(conversations) for conversations in self.conversation_history.values())
        
        language_counts = {}
        intent_counts = {}
        
        for user_conversations in self.conversation_history.values():
            for conv in user_conversations:
                lang = conv.get("language", "unknown")
                intent = conv.get("intent", "unknown")
                
                language_counts[lang] = language_counts.get(lang, 0) + 1
                intent_counts[intent] = intent_counts.get(intent, 0) + 1
        
        return {
            "total_conversations": total_conversations,
            "active_users": len(self.conversation_history),
            "language_distribution": language_counts,
            "intent_distribution": intent_counts,
            "processor_status": "active"
        }
