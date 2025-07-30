#!/usr/bin/env python3
"""
실제 카카오톡 대화 분석 및 학습 시스템 v1.0
- 실제 카카오톡 대화 데이터를 분석하여 현실적인 대화 패턴 학습
- 감정, 주제, 대화 스타일, 이모티콘 사용 패턴 분석
"""

import re
import json
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from collections import defaultdict, Counter
import uuid

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class KakaoMessage:
    """카카오톡 메시지"""
    message_id: str
    timestamp: datetime
    sender: str
    content: str
    message_type: str  # text, image, file, etc.
    emotion_score: float = 0.0
    topic: str = ""
    emoji_count: int = 0
    word_count: int = 0

@dataclass
class ConversationPattern:
    """대화 패턴"""
    pattern_id: str
    pattern_type: str  # greeting, question, response, emotion, etc.
    frequency: int
    context: Dict[str, Any]
    examples: List[str]
    confidence: float

@dataclass
class UserProfile:
    """사용자 프로필"""
    user_id: str
    name: str
    message_count: int
    avg_message_length: float
    common_topics: List[str]
    emotion_tendency: Dict[str, float]
    emoji_usage: Dict[str, int]
    response_patterns: List[str]

class RealKakaoConversationAnalyzer:
    """실제 카카오톡 대화 분석기"""
    
    def __init__(self):
        self.conversations = []
        self.user_profiles = {}
        self.conversation_patterns = []
        self.topic_keywords = self._initialize_topic_keywords()
        self.emotion_keywords = self._initialize_emotion_keywords()
        self.emoji_patterns = self._initialize_emoji_patterns()
        
    def _initialize_topic_keywords(self) -> Dict[str, List[str]]:
        """주제별 키워드 초기화"""
        return {
            "부동산": ["아파트", "매매", "시세", "분양", "입주", "단지", "평수", "억", "환급금", "분담금"],
            "커뮤니티": ["수영장", "헬스장", "사우나", "조식", "관리비", "커뮤니티센터", "시설"],
            "일상": ["안녕", "고맙", "힘들", "좋", "나쁘", "맛있", "재미있"],
            "감정": ["좋아", "싫어", "화나", "기쁘", "슬프", "걱정", "안심"],
            "질문": ["어떻게", "언제", "어디", "왜", "무엇", "몇", "얼마"],
            "동의": ["맞", "동감", "그래", "네", "좋아", "괜찮"],
            "반대": ["아니", "싫어", "그렇지 않", "틀렸", "다르"]
        }
    
    def _initialize_emotion_keywords(self) -> Dict[str, List[str]]:
        """감정 키워드 초기화"""
        return {
            "기쁨": ["좋아", "기쁘", "행복", "만족", "감사", "고맙", "^^", "😊", "😄"],
            "슬픔": ["슬프", "우울", "힘들", "지치", "피곤", "😢", "😭", "😔"],
            "화남": ["화나", "짜증", "열받", "분노", "😠", "😡", "🤬"],
            "걱정": ["걱정", "불안", "염려", "우려", "😰", "😨", "😟"],
            "놀람": ["놀라", "깜짝", "어?", "뭐?", "😲", "😱", "🤔"],
            "중립": ["그래", "네", "알겠", "됐", "좋", "괜찮"]
        }
    
    def _initialize_emoji_patterns(self) -> Dict[str, str]:
        """이모티콘 패턴 초기화"""
        return {
            "^^": "기쁨",
            "ㅎㅎ": "웃음",
            "ㅠㅠ": "슬픔",
            "ㅋㅋ": "웃음",
            "😊": "기쁨",
            "😄": "기쁨",
            "😢": "슬픔",
            "😭": "슬픔",
            "😠": "화남",
            "😡": "화남",
            "😰": "걱정",
            "😨": "걱정",
            "😲": "놀람",
            "😱": "놀람",
            "🤔": "생각",
            "👍": "좋아",
            "👎": "싫어",
            "❤️": "사랑",
            "💕": "사랑"
        }
    
    def parse_kakao_chat_file(self, file_path: str) -> List[KakaoMessage]:
        """카카오톡 채팅 파일 파싱"""
        messages = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 날짜 패턴 매칭
            date_pattern = r'(\d{4}년 \d{1,2}월 \d{1,2}일 [오전|오후] \d{1,2}:\d{2})'
            message_pattern = r'(\d{4}년 \d{1,2}월 \d{1,2}일 [오전|오후] \d{1,2}:\d{2}), ([^:]+) : (.+)'
            
            lines = content.split('\n')
            current_date = None
            
            for line in lines:
                # 날짜 라인 확인
                date_match = re.search(date_pattern, line)
                if date_match:
                    current_date = date_match.group(1)
                    continue
                
                # 메시지 라인 확인
                message_match = re.search(message_pattern, line)
                if message_match and current_date:
                    timestamp_str = message_match.group(1)
                    sender = message_match.group(2)
                    content = message_match.group(3)
                    
                    # 타임스탬프 파싱
                    try:
                        timestamp = datetime.strptime(timestamp_str, '%Y년 %m월 %d일 %p %I:%M')
                    except:
                        timestamp = datetime.now()
                    
                    # 메시지 타입 결정
                    message_type = "text"
                    if "이미지" in content or "사진" in content:
                        message_type = "image"
                    elif "파일" in content:
                        message_type = "file"
                    
                    # 감정 점수 계산
                    emotion_score = self._calculate_emotion_score(content)
                    
                    # 주제 분류
                    topic = self._classify_topic(content)
                    
                    # 이모티콘 개수
                    emoji_count = self._count_emojis(content)
                    
                    # 단어 개수
                    word_count = len(content.split())
                    
                    message = KakaoMessage(
                        message_id=str(uuid.uuid4()),
                        timestamp=timestamp,
                        sender=sender,
                        content=content,
                        message_type=message_type,
                        emotion_score=emotion_score,
                        topic=topic,
                        emoji_count=emoji_count,
                        word_count=word_count
                    )
                    
                    messages.append(message)
            
            logger.info(f"파싱 완료: {len(messages)}개 메시지")
            return messages
            
        except Exception as e:
            logger.error(f"파일 파싱 오류: {str(e)}")
            return []
    
    def _calculate_emotion_score(self, content: str) -> float:
        """감정 점수 계산"""
        score = 0.0
        content_lower = content.lower()
        
        for emotion, keywords in self.emotion_keywords.items():
            for keyword in keywords:
                if keyword in content_lower:
                    if emotion == "기쁨":
                        score += 0.3
                    elif emotion == "슬픔":
                        score -= 0.3
                    elif emotion == "화남":
                        score -= 0.4
                    elif emotion == "걱정":
                        score -= 0.2
                    elif emotion == "놀람":
                        score += 0.1
                    elif emotion == "중립":
                        score += 0.0
        
        return max(-1.0, min(1.0, score))
    
    def _classify_topic(self, content: str) -> str:
        """주제 분류"""
        content_lower = content.lower()
        
        for topic, keywords in self.topic_keywords.items():
            for keyword in keywords:
                if keyword in content_lower:
                    return topic
        
        return "일반"
    
    def _count_emojis(self, content: str) -> int:
        """이모티콘 개수 계산"""
        count = 0
        for emoji in self.emoji_patterns.keys():
            count += content.count(emoji)
        return count
    
    def analyze_conversation_patterns(self, messages: List[KakaoMessage]) -> List[ConversationPattern]:
        """대화 패턴 분석"""
        patterns = []
        
        # 인사 패턴
        greeting_patterns = self._find_greeting_patterns(messages)
        patterns.extend(greeting_patterns)
        
        # 질문-답변 패턴
        qa_patterns = self._find_qa_patterns(messages)
        patterns.extend(qa_patterns)
        
        # 감정 표현 패턴
        emotion_patterns = self._find_emotion_patterns(messages)
        patterns.extend(emotion_patterns)
        
        # 동의/반대 패턴
        agreement_patterns = self._find_agreement_patterns(messages)
        patterns.extend(agreement_patterns)
        
        return patterns
    
    def _find_greeting_patterns(self, messages: List[KakaoMessage]) -> List[ConversationPattern]:
        """인사 패턴 찾기"""
        greetings = []
        greeting_keywords = ["안녕", "하이", "반가", "고맙", "수고"]
        
        for msg in messages:
            content_lower = msg.content.lower()
            for keyword in greeting_keywords:
                if keyword in content_lower:
                    greetings.append(msg.content)
                    break
        
        if greetings:
            return [ConversationPattern(
                pattern_id=str(uuid.uuid4()),
                pattern_type="greeting",
                frequency=len(greetings),
                context={"keywords": greeting_keywords},
                examples=greetings[:5],
                confidence=0.8
            )]
        
        return []
    
    def _find_qa_patterns(self, messages: List[KakaoMessage]) -> List[ConversationPattern]:
        """질문-답변 패턴 찾기"""
        questions = []
        answers = []
        
        for i, msg in enumerate(messages):
            content = msg.content
            if any(q in content for q in ["어떻게", "언제", "어디", "왜", "무엇", "몇", "얼마", "?"]):
                questions.append(content)
                
                # 다음 메시지가 답변일 가능성
                if i + 1 < len(messages):
                    next_msg = messages[i + 1]
                    if next_msg.sender != msg.sender:  # 다른 사람의 답변
                        answers.append(next_msg.content)
        
        patterns = []
        if questions:
            patterns.append(ConversationPattern(
                pattern_id=str(uuid.uuid4()),
                pattern_type="question",
                frequency=len(questions),
                context={"question_types": ["일반", "특정", "감정"]},
                examples=questions[:5],
                confidence=0.7
            ))
        
        if answers:
            patterns.append(ConversationPattern(
                pattern_id=str(uuid.uuid4()),
                pattern_type="answer",
                frequency=len(answers),
                context={"answer_types": ["정보제공", "감정표현", "동의"]},
                examples=answers[:5],
                confidence=0.6
            ))
        
        return patterns
    
    def _find_emotion_patterns(self, messages: List[KakaoMessage]) -> List[ConversationPattern]:
        """감정 표현 패턴 찾기"""
        emotions = defaultdict(list)
        
        for msg in messages:
            if msg.emotion_score > 0.3:
                emotions["positive"].append(msg.content)
            elif msg.emotion_score < -0.3:
                emotions["negative"].append(msg.content)
            elif msg.emoji_count > 0:
                emotions["emoji"].append(msg.content)
        
        patterns = []
        for emotion_type, examples in emotions.items():
            if examples:
                patterns.append(ConversationPattern(
                    pattern_id=str(uuid.uuid4()),
                    pattern_type=f"emotion_{emotion_type}",
                    frequency=len(examples),
                    context={"emotion_type": emotion_type},
                    examples=examples[:5],
                    confidence=0.7
                ))
        
        return patterns
    
    def _find_agreement_patterns(self, messages: List[KakaoMessage]) -> List[ConversationPattern]:
        """동의/반대 패턴 찾기"""
        agreements = []
        disagreements = []
        
        agreement_keywords = ["맞", "동감", "그래", "네", "좋아", "괜찮"]
        disagreement_keywords = ["아니", "싫어", "그렇지 않", "틀렸", "다르"]
        
        for msg in messages:
            content_lower = msg.content.lower()
            
            if any(keyword in content_lower for keyword in agreement_keywords):
                agreements.append(msg.content)
            elif any(keyword in content_lower for keyword in disagreement_keywords):
                disagreements.append(msg.content)
        
        patterns = []
        if agreements:
            patterns.append(ConversationPattern(
                pattern_id=str(uuid.uuid4()),
                pattern_type="agreement",
                frequency=len(agreements),
                context={"agreement_type": "positive"},
                examples=agreements[:5],
                confidence=0.8
            ))
        
        if disagreements:
            patterns.append(ConversationPattern(
                pattern_id=str(uuid.uuid4()),
                pattern_type="disagreement",
                frequency=len(disagreements),
                context={"disagreement_type": "negative"},
                examples=disagreements[:5],
                confidence=0.7
            ))
        
        return patterns
    
    def build_user_profiles(self, messages: List[KakaoMessage]) -> Dict[str, UserProfile]:
        """사용자 프로필 구축"""
        user_data = defaultdict(lambda: {
            'messages': [],
            'topics': Counter(),
            'emotions': defaultdict(float),
            'emojis': Counter(),
            'response_patterns': []
        })
        
        for msg in messages:
            user_data[msg.sender]['messages'].append(msg)
            user_data[msg.sender]['topics'][msg.topic] += 1
            user_data[msg.sender]['emotions'][msg.emotion_score] += 1
            
            # 이모티콘 분석
            for emoji in self.emoji_patterns.keys():
                if emoji in msg.content:
                    user_data[msg.sender]['emojis'][emoji] += 1
        
        profiles = {}
        for user_id, data in user_data.items():
            messages = data['messages']
            avg_length = sum(msg.word_count for msg in messages) / len(messages) if messages else 0
            
            # 감정 경향 계산
            emotion_tendency = {}
            for emotion_score, count in data['emotions'].items():
                if emotion_score > 0.3:
                    emotion_tendency['positive'] = emotion_tendency.get('positive', 0) + count
                elif emotion_score < -0.3:
                    emotion_tendency['negative'] = emotion_tendency.get('negative', 0) + count
                else:
                    emotion_tendency['neutral'] = emotion_tendency.get('neutral', 0) + count
            
            # 주요 주제
            common_topics = [topic for topic, count in data['topics'].most_common(5)]
            
            # 응답 패턴
            response_patterns = self._analyze_response_patterns(messages)
            
            profiles[user_id] = UserProfile(
                user_id=user_id,
                name=user_id,
                message_count=len(messages),
                avg_message_length=avg_length,
                common_topics=common_topics,
                emotion_tendency=emotion_tendency,
                emoji_usage=dict(data['emojis']),
                response_patterns=response_patterns
            )
        
        return profiles
    
    def _analyze_response_patterns(self, messages: List[KakaoMessage]) -> List[str]:
        """응답 패턴 분석"""
        patterns = []
        
        for msg in messages:
            content = msg.content.lower()
            
            if any(q in content for q in ["어떻게", "언제", "어디", "왜", "무엇", "몇", "얼마", "?"]):
                patterns.append("question")
            elif any(a in content for a in ["맞", "동감", "그래", "네", "좋아"]):
                patterns.append("agreement")
            elif any(d in content for d in ["아니", "싫어", "틀렸", "다르"]):
                patterns.append("disagreement")
            elif msg.emoji_count > 0:
                patterns.append("emoji_response")
            elif msg.emotion_score > 0.3:
                patterns.append("positive_emotion")
            elif msg.emotion_score < -0.3:
                patterns.append("negative_emotion")
            else:
                patterns.append("neutral")
        
        return patterns
    
    def generate_realistic_response(self, user_message: str, user_profile: Optional[UserProfile] = None) -> str:
        """현실적인 응답 생성"""
        # 주제 분류
        topic = self._classify_topic(user_message)
        
        # 감정 분석
        emotion_score = self._calculate_emotion_score(user_message)
        
        # 이모티콘 사용 여부
        has_emoji = self._count_emojis(user_message) > 0
        
        # 응답 생성
        response = self._generate_contextual_response(topic, emotion_score, has_emoji, user_profile)
        
        return response
    
    def _generate_contextual_response(self, topic: str, emotion_score: float, has_emoji: bool, user_profile: Optional[UserProfile]) -> str:
        """맥락에 맞는 응답 생성"""
        responses = {
            "부동산": {
                "positive": ["좋은 정보네요! 👍", "정말 유용한 정보입니다 😊", "도움이 많이 되네요"],
                "negative": ["걱정되시겠어요 😔", "힘드시겠어요", "어려운 상황이네요"],
                "neutral": ["그렇군요", "알겠습니다", "네, 맞습니다"]
            },
            "커뮤니티": {
                "positive": ["좋은 시설이네요! 😊", "정말 편리할 것 같아요", "기대되시겠어요"],
                "negative": ["아쉽네요 😔", "개선이 필요하겠어요", "힘드시겠어요"],
                "neutral": ["그렇군요", "알겠습니다", "네, 맞습니다"]
            },
            "일상": {
                "positive": ["좋은 하루 보내세요! 😊", "행복한 하루 되세요", "기분 좋은 하루네요"],
                "negative": ["힘드시겠어요 😔", "조금 쉬세요", "걱정하지 마세요"],
                "neutral": ["그렇군요", "알겠습니다", "네, 맞습니다"]
            }
        }
        
        # 감정에 따른 응답 선택
        if emotion_score > 0.3:
            emotion_type = "positive"
        elif emotion_score < -0.3:
            emotion_type = "negative"
        else:
            emotion_type = "neutral"
        
        # 주제별 응답 선택
        if topic in responses:
            topic_responses = responses[topic]
            if emotion_type in topic_responses:
                response_candidates = topic_responses[emotion_type]
            else:
                response_candidates = topic_responses["neutral"]
        else:
            # 기본 응답
            response_candidates = ["그렇군요", "알겠습니다", "네, 맞습니다"]
        
        # 사용자 프로필에 따른 응답 조정
        if user_profile:
            # 사용자의 이모티콘 사용 패턴 반영
            if has_emoji and user_profile.emoji_usage:
                # 사용자가 자주 사용하는 이모티콘 추가
                common_emoji = max(user_profile.emoji_usage.items(), key=lambda x: x[1])[0]
                response_candidates = [f"{resp} {common_emoji}" for resp in response_candidates]
        
        # 랜덤 선택
        import random
        return random.choice(response_candidates)

# 사용 예시
if __name__ == "__main__":
    analyzer = RealKakaoConversationAnalyzer()
    
    # 실제 카카오톡 대화 파일 분석
    chat_file = "../chat_rooms/[인증]행복한소유☆개포우성7차/[인증]행복한소유☆개포우성7차.txt"
    
    print("실제 카카오톡 대화 분석 시작...")
    
    # 메시지 파싱
    messages = analyzer.parse_kakao_chat_file(chat_file)
    print(f"파싱된 메시지: {len(messages)}개")
    
    # 대화 패턴 분석
    patterns = analyzer.analyze_conversation_patterns(messages)
    print(f"발견된 패턴: {len(patterns)}개")
    
    # 사용자 프로필 구축
    profiles = analyzer.build_user_profiles(messages)
    print(f"사용자 프로필: {len(profiles)}명")
    
    # 예시 응답 생성
    test_messages = [
        "아파트 시세가 어떻게 될까요?",
        "수영장이 정말 좋네요! 😊",
        "힘들어요 ㅠㅠ",
        "안녕하세요!"
    ]
    
    print("\n=== 현실적인 응답 생성 테스트 ===")
    for msg in test_messages:
        response = analyzer.generate_realistic_response(msg)
        print(f"입력: {msg}")
        print(f"응답: {response}")
        print()
    
    # 분석 결과 저장
    analysis_result = {
        "total_messages": len(messages),
        "patterns": [asdict(pattern) for pattern in patterns],
        "user_profiles": {uid: asdict(profile) for uid, profile in profiles.items()},
        "analysis_timestamp": datetime.now().isoformat()
    }
    
    with open("kakao_conversation_analysis.json", "w", encoding="utf-8") as f:
        json.dump(analysis_result, f, ensure_ascii=False, indent=2)
    
    print("분석 완료! 결과가 'kakao_conversation_analysis.json'에 저장되었습니다.") 