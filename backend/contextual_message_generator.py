"""
Contextual Message Generator
맥락 기반 메시지 생성 시스템

Features:
- 특정 대화방/특정인 분석
- 대화 맥락 및 패턴 파악
- 개인별 대화 스타일 학습
- 상황에 맞는 메시지 생성
- 시간대별/상황별 메시지 적응
"""

import os
import json
import sqlite3
import asyncio
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from collections import defaultdict, Counter
import logging
import re

# NLP and ML
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import KMeans

# Korean NLP
from konlpy.tag import Okt
import kss

# FastAPI
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ConversationContext:
    """대화 맥락 정보"""
    chat_room_id: str
    chat_room_name: str
    participants: List[str]
    total_messages: int
    date_range: Tuple[datetime, datetime]
    main_topics: List[str]
    conversation_tone: str
    activity_patterns: Dict[str, Any]

@dataclass
class PersonProfile:
    """개인별 프로필 정보"""
    name: str
    chat_room_id: str
    message_count: int
    avg_message_length: float
    preferred_time_slots: List[str]
    communication_style: Dict[str, float]
    frequent_topics: List[str]
    common_phrases: List[str]
    response_patterns: Dict[str, Any]
    relationship_dynamics: Dict[str, float]

@dataclass
class MessageGenerationRequest:
    """메시지 생성 요청"""
    chat_room_id: str
    target_person: str
    message_intent: str  # greeting, question, suggestion, response, etc.
    context_messages: List[Dict[str, Any]]
    tone_preference: str = "natural"
    length_preference: str = "medium"
    formality_level: str = "casual"

@dataclass
class GeneratedMessage:
    """생성된 메시지"""
    message_id: str
    content: str
    confidence_score: float
    reasoning: str
    style_match_score: float
    context_relevance_score: float
    alternatives: List[str]
    metadata: Dict[str, Any]

class ConversationAnalyzer:
    """대화 분석기"""
    
    def __init__(self):
        self.korean_analyzer = Okt()
        self.conversation_cache = {}
    
    def analyze_conversation(self, chat_room_id: str, messages: List[Dict[str, Any]]) -> ConversationContext:
        """대화방 전체 맥락 분석"""
        try:
            if not messages:
                return self._empty_context(chat_room_id)
            
            # 기본 정보 추출
            participants = list(set(msg.get('sender', 'Unknown') for msg in messages))
            participants = [p for p in participants if p != 'Unknown']
            
            dates = [datetime.fromisoformat(msg['timestamp']) for msg in messages if 'timestamp' in msg]
            date_range = (min(dates), max(dates)) if dates else (datetime.now(), datetime.now())
            
            # 주요 토픽 추출
            all_text = ' '.join([msg.get('content', '') for msg in messages])
            main_topics = self._extract_main_topics(all_text)
            
            # 대화 톤 분석
            conversation_tone = self._analyze_conversation_tone(messages)
            
            # 활동 패턴 분석
            activity_patterns = self._analyze_activity_patterns(messages)
            
            context = ConversationContext(
                chat_room_id=chat_room_id,
                chat_room_name=self._extract_chat_room_name(messages),
                participants=participants,
                total_messages=len(messages),
                date_range=date_range,
                main_topics=main_topics,
                conversation_tone=conversation_tone,
                activity_patterns=activity_patterns
            )
            
            self.conversation_cache[chat_room_id] = context
            return context
            
        except Exception as e:
            logger.error(f"Error analyzing conversation: {e}")
            return self._empty_context(chat_room_id)
    
    def _empty_context(self, chat_room_id: str) -> ConversationContext:
        """빈 맥락 생성"""
        return ConversationContext(
            chat_room_id=chat_room_id,
            chat_room_name="Unknown",
            participants=[],
            total_messages=0,
            date_range=(datetime.now(), datetime.now()),
            main_topics=[],
            conversation_tone="neutral",
            activity_patterns={}
        )
    
    def _extract_chat_room_name(self, messages: List[Dict[str, Any]]) -> str:
        """대화방 이름 추출"""
        # 첫 번째 메시지에서 대화방 정보 추출
        for msg in messages[:5]:
            if 'metadata' in msg and 'chat_room_name' in msg['metadata']:
                return msg['metadata']['chat_room_name']
        return "Unknown Chat Room"
    
    def _extract_main_topics(self, text: str, max_topics: int = 5) -> List[str]:
        """주요 토픽 추출"""
        try:
            if not text.strip():
                return []
            
            # 명사 추출
            nouns = self.korean_analyzer.nouns(text)
            
            # 빈도 기반 주요 토픽 선정
            noun_freq = Counter([noun for noun in nouns if len(noun) > 1])
            main_topics = [topic for topic, freq in noun_freq.most_common(max_topics)]
            
            # 특정 도메인 키워드 우선 처리
            domain_keywords = {
                '부동산': ['재개발', '분양', '아파트', '주택', '투자'],
                '회의': ['회의', '미팅', '논의', '결정', '안건'],
                '일상': ['날씨', '음식', '영화', '여행', '건강'],
                '업무': ['프로젝트', '업무', '일정', '보고', '계획']
            }
            
            for domain, keywords in domain_keywords.items():
                if any(keyword in text for keyword in keywords):
                    if domain not in main_topics:
                        main_topics.insert(0, domain)
            
            return main_topics[:max_topics]
            
        except Exception as e:
            logger.error(f"Error extracting topics: {e}")
            return []
    
    def _analyze_conversation_tone(self, messages: List[Dict[str, Any]]) -> str:
        """대화 톤 분석"""
        try:
            formal_indicators = ['습니다', '입니다', '해주세요', '부탁드립니다']
            casual_indicators = ['야', '지', '어', '음', 'ㅋㅋ', 'ㅎㅎ']
            professional_indicators = ['검토', '보고', '승인', '진행', '협의']
            
            formal_count = 0
            casual_count = 0
            professional_count = 0
            
            for msg in messages:
                content = msg.get('content', '').lower()
                
                formal_count += sum(1 for indicator in formal_indicators if indicator in content)
                casual_count += sum(1 for indicator in casual_indicators if indicator in content)
                professional_count += sum(1 for indicator in professional_indicators if indicator in content)
            
            total_indicators = formal_count + casual_count + professional_count
            
            if total_indicators == 0:
                return "neutral"
            
            if professional_count / total_indicators > 0.4:
                return "professional"
            elif formal_count / total_indicators > 0.6:
                return "formal"
            elif casual_count / total_indicators > 0.6:
                return "casual"
            else:
                return "mixed"
                
        except Exception as e:
            logger.error(f"Error analyzing tone: {e}")
            return "neutral"
    
    def _analyze_activity_patterns(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """활동 패턴 분석"""
        try:
            hourly_activity = defaultdict(int)
            daily_activity = defaultdict(int)
            sender_activity = defaultdict(int)
            
            for msg in messages:
                if 'timestamp' in msg:
                    try:
                        dt = datetime.fromisoformat(msg['timestamp'])
                        hourly_activity[dt.hour] += 1
                        daily_activity[dt.weekday()] += 1
                    except:
                        continue
                
                sender = msg.get('sender', 'Unknown')
                if sender != 'Unknown':
                    sender_activity[sender] += 1
            
            # 최고 활동 시간대
            peak_hour = max(hourly_activity.items(), key=lambda x: x[1])[0] if hourly_activity else 12
            peak_day = max(daily_activity.items(), key=lambda x: x[1])[0] if daily_activity else 0
            
            # 주요 참여자
            main_participants = sorted(sender_activity.items(), key=lambda x: x[1], reverse=True)[:3]
            
            return {
                'peak_hour': peak_hour,
                'peak_day': peak_day,
                'hourly_distribution': dict(hourly_activity),
                'daily_distribution': dict(daily_activity),
                'main_participants': main_participants,
                'total_senders': len(sender_activity)
            }
            
        except Exception as e:
            logger.error(f"Error analyzing activity patterns: {e}")
            return {}

class PersonProfiler:
    """개인별 프로필 분석기"""
    
    def __init__(self):
        self.korean_analyzer = Okt()
        self.profile_cache = {}
    
    def analyze_person(self, chat_room_id: str, person_name: str, 
                      messages: List[Dict[str, Any]]) -> PersonProfile:
        """특정인 프로필 분석"""
        try:
            # 해당 인물의 메시지만 필터링
            person_messages = [msg for msg in messages if msg.get('sender') == person_name]
            
            if not person_messages:
                return self._empty_profile(person_name, chat_room_id)
            
            # 기본 통계
            message_count = len(person_messages)
            avg_message_length = np.mean([len(msg.get('content', '')) for msg in person_messages])
            
            # 선호 시간대 분석
            preferred_time_slots = self._analyze_preferred_times(person_messages)
            
            # 커뮤니케이션 스타일 분석
            communication_style = self._analyze_communication_style(person_messages)
            
            # 자주 언급하는 토픽
            frequent_topics = self._extract_frequent_topics(person_messages)
            
            # 자주 사용하는 표현
            common_phrases = self._extract_common_phrases(person_messages)
            
            # 응답 패턴 분석
            response_patterns = self._analyze_response_patterns(person_name, messages)
            
            # 관계 역학 분석
            relationship_dynamics = self._analyze_relationships(person_name, messages)
            
            profile = PersonProfile(
                name=person_name,
                chat_room_id=chat_room_id,
                message_count=message_count,
                avg_message_length=avg_message_length,
                preferred_time_slots=preferred_time_slots,
                communication_style=communication_style,
                frequent_topics=frequent_topics,
                common_phrases=common_phrases,
                response_patterns=response_patterns,
                relationship_dynamics=relationship_dynamics
            )
            
            cache_key = f"{chat_room_id}_{person_name}"
            self.profile_cache[cache_key] = profile
            
            return profile
            
        except Exception as e:
            logger.error(f"Error analyzing person {person_name}: {e}")
            return self._empty_profile(person_name, chat_room_id)
    
    def _empty_profile(self, person_name: str, chat_room_id: str) -> PersonProfile:
        """빈 프로필 생성"""
        return PersonProfile(
            name=person_name,
            chat_room_id=chat_room_id,
            message_count=0,
            avg_message_length=0.0,
            preferred_time_slots=[],
            communication_style={},
            frequent_topics=[],
            common_phrases=[],
            response_patterns={},
            relationship_dynamics={}
        )
    
    def _analyze_preferred_times(self, messages: List[Dict[str, Any]]) -> List[str]:
        """선호 시간대 분석"""
        try:
            hourly_counts = defaultdict(int)
            
            for msg in messages:
                if 'timestamp' in msg:
                    try:
                        dt = datetime.fromisoformat(msg['timestamp'])
                        hourly_counts[dt.hour] += 1
                    except:
                        continue
            
            if not hourly_counts:
                return []
            
            # 시간대별 분류
            time_slots = []
            sorted_hours = sorted(hourly_counts.items(), key=lambda x: x[1], reverse=True)
            
            for hour, count in sorted_hours[:3]:  # 상위 3개 시간대
                if 6 <= hour < 12:
                    time_slots.append("morning")
                elif 12 <= hour < 18:
                    time_slots.append("afternoon")
                elif 18 <= hour < 22:
                    time_slots.append("evening")
                else:
                    time_slots.append("night")
            
            return list(set(time_slots))
            
        except Exception as e:
            logger.error(f"Error analyzing preferred times: {e}")
            return []
    
    def _analyze_communication_style(self, messages: List[Dict[str, Any]]) -> Dict[str, float]:
        """커뮤니케이션 스타일 분석"""
        try:
            all_text = ' '.join([msg.get('content', '') for msg in messages])
            
            style_indicators = {
                'formal': ['습니다', '입니다', '해주세요', '부탁드립니다', '안녕하세요'],
                'casual': ['야', '지', '어', 'ㅋㅋ', 'ㅎㅎ', '~'],
                'enthusiastic': ['!', '대박', '완전', '정말', '너무'],
                'analytical': ['분석', '생각', '데이터', '결과', '검토'],
                'supportive': ['수고', '화이팅', '도움', '응원', '잘했어'],
                'questioning': ['?', '어떻게', '왜', '언제', '뭐'],
                'expressive': ['ㅠㅠ', 'ㅜㅜ', '♥', '♡', '❤️']
            }
            
            style_scores = {}
            total_length = len(all_text)
            
            if total_length == 0:
                return {}
            
            for style, indicators in style_indicators.items():
                count = sum(all_text.count(indicator) for indicator in indicators)
                style_scores[style] = min(1.0, count / (total_length / 100))  # 정규화
            
            return style_scores
            
        except Exception as e:
            logger.error(f"Error analyzing communication style: {e}")
            return {}
    
    def _extract_frequent_topics(self, messages: List[Dict[str, Any]], max_topics: int = 10) -> List[str]:
        """자주 언급하는 토픽 추출"""
        try:
            all_text = ' '.join([msg.get('content', '') for msg in messages])
            nouns = self.korean_analyzer.nouns(all_text)
            
            # 의미있는 명사만 필터링
            filtered_nouns = [noun for noun in nouns if len(noun) > 1 and noun not in ['것', '수', '때']]
            
            noun_freq = Counter(filtered_nouns)
            return [topic for topic, freq in noun_freq.most_common(max_topics)]
            
        except Exception as e:
            logger.error(f"Error extracting frequent topics: {e}")
            return []
    
    def _extract_common_phrases(self, messages: List[Dict[str, Any]], max_phrases: int = 5) -> List[str]:
        """자주 사용하는 표현 추출"""
        try:
            all_text = ' '.join([msg.get('content', '') for msg in messages])
            
            # 2-3단어 구문 추출
            sentences = kss.split_sentences(all_text)
            phrases = []
            
            for sentence in sentences:
                words = sentence.split()
                # 2-3단어 조합 생성
                for i in range(len(words) - 1):
                    if i < len(words) - 2:
                        phrase = ' '.join(words[i:i+3])
                        if len(phrase) > 3:
                            phrases.append(phrase)
                    phrase = ' '.join(words[i:i+2])
                    if len(phrase) > 2:
                        phrases.append(phrase)
            
            phrase_freq = Counter(phrases)
            return [phrase for phrase, freq in phrase_freq.most_common(max_phrases) if freq > 1]
            
        except Exception as e:
            logger.error(f"Error extracting common phrases: {e}")
            return []
    
    def _analyze_response_patterns(self, person_name: str, all_messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """응답 패턴 분석"""
        try:
            person_messages = [(i, msg) for i, msg in enumerate(all_messages) 
                             if msg.get('sender') == person_name]
            
            if not person_messages:
                return {}
            
            response_times = []
            response_lengths = []
            
            for i, (msg_idx, msg) in enumerate(person_messages):
                # 이전 메시지가 다른 사람의 메시지인지 확인
                if msg_idx > 0:
                    prev_msg = all_messages[msg_idx - 1]
                    if prev_msg.get('sender') != person_name:
                        try:
                            curr_time = datetime.fromisoformat(msg['timestamp'])
                            prev_time = datetime.fromisoformat(prev_msg['timestamp'])
                            response_time = (curr_time - prev_time).total_seconds()
                            
                            if response_time < 3600:  # 1시간 이내 응답만 고려
                                response_times.append(response_time)
                                response_lengths.append(len(msg.get('content', '')))
                        except:
                            continue
            
            patterns = {}
            
            if response_times:
                patterns['avg_response_time'] = np.mean(response_times)
                patterns['response_speed'] = 'fast' if np.mean(response_times) < 300 else 'normal'
            
            if response_lengths:
                patterns['avg_response_length'] = np.mean(response_lengths)
                patterns['response_style'] = 'concise' if np.mean(response_lengths) < 20 else 'detailed'
            
            return patterns
            
        except Exception as e:
            logger.error(f"Error analyzing response patterns: {e}")
            return {}
    
    def _analyze_relationships(self, person_name: str, all_messages: List[Dict[str, Any]]) -> Dict[str, float]:
        """관계 역학 분석"""
        try:
            person_messages = [msg for msg in all_messages if msg.get('sender') == person_name]
            other_senders = set(msg.get('sender') for msg in all_messages if msg.get('sender') != person_name)
            
            relationships = {}
            
            for other_person in other_senders:
                if other_person == 'Unknown':
                    continue
                
                # 서로 언급하는 빈도
                mentions_by_person = sum(1 for msg in person_messages 
                                       if other_person in msg.get('content', ''))
                
                other_messages = [msg for msg in all_messages if msg.get('sender') == other_person]
                mentions_of_person = sum(1 for msg in other_messages 
                                       if person_name in msg.get('content', ''))
                
                # 상호작용 강도 계산
                total_mentions = mentions_by_person + mentions_of_person
                interaction_score = min(1.0, total_mentions / 10.0)  # 정규화
                
                relationships[other_person] = interaction_score
            
            return relationships
            
        except Exception as e:
            logger.error(f"Error analyzing relationships: {e}")
            return {}

class ContextualMessageGenerator:
    """맥락 기반 메시지 생성기"""
    
    def __init__(self):
        self.conversation_analyzer = ConversationAnalyzer()
        self.person_profiler = PersonProfiler()
        self.message_templates = self._initialize_templates()
        self.generated_messages_cache = {}
    
    def _initialize_templates(self) -> Dict[str, Dict[str, List[str]]]:
        """메시지 템플릿 초기화"""
        return {
            'greeting': {
                'casual': [
                    "안녕! 잘 지내?",
                    "오랜만이야~",
                    "어떻게 지내고 있어?",
                    "요즘 어떤 일로 바쁘게 지내?"
                ],
                'formal': [
                    "안녕하세요. 잘 지내셨나요?",
                    "오랜만에 인사드립니다.",
                    "안녕하세요. 최근 어떻게 지내시는지 궁금했습니다.",
                    "안녕하세요. 요즘 어떤 일들로 바쁘신가요?"
                ],
                'professional': [
                    "안녕하세요. 업무는 잘 진행되고 계신가요?",
                    "안녕하세요. 프로젝트 진행 상황이 궁금합니다.",
                    "안녕하세요. 최근 업무 상황은 어떠신지요?"
                ]
            },
            'question': {
                'casual': [
                    "혹시 {topic}에 대해 어떻게 생각해?",
                    "{topic} 관련해서 궁금한 게 있는데",
                    "요즘 {topic} 어떻게 보고 있어?"
                ],
                'formal': [
                    "{topic}에 대한 의견을 여쭤보고 싶습니다.",
                    "{topic} 관련하여 질문이 있습니다.",
                    "{topic}에 대해 어떻게 생각하시는지 궁금합니다."
                ]
            },
            'suggestion': {
                'casual': [
                    "{suggestion} 어떨까?",
                    "{suggestion}하면 좋을 것 같은데",
                    "내 생각엔 {suggestion}가 괜찮을 것 같아"
                ],
                'formal': [
                    "{suggestion}를 제안해 드립니다.",
                    "{suggestion}에 대해 검토해 보시면 어떨까요?",
                    "{suggestion}를 고려해 보시기 바랍니다."
                ]
            },
            'response': {
                'agreement': [
                    "맞아, 그렇게 생각해",
                    "동감이야",
                    "좋은 생각이네",
                    "그 의견에 찬성해"
                ],
                'appreciation': [
                    "고마워!",
                    "정말 도움이 됐어",
                    "감사합니다",
                    "많은 도움이 되었습니다"
                ]
            }
        }
    
    async def generate_contextual_message(self, request: MessageGenerationRequest) -> GeneratedMessage:
        """맥락 기반 메시지 생성"""
        try:
            # 대화 맥락 분석
            conversation_context = self.conversation_analyzer.analyze_conversation(
                request.chat_room_id, request.context_messages
            )
            
            # 개인 프로필 분석
            person_profile = self.person_profiler.analyze_person(
                request.chat_room_id, request.target_person, request.context_messages
            )
            
            # 최근 대화 흐름 분석
            recent_flow = self._analyze_recent_flow(request.context_messages[-10:])
            
            # 메시지 생성 전략 결정
            generation_strategy = self._determine_strategy(
                request, conversation_context, person_profile, recent_flow
            )
            
            # 실제 메시지 생성
            generated_content = self._generate_message_content(
                request, generation_strategy, person_profile, recent_flow
            )
            
            # 품질 평가
            quality_scores = self._evaluate_message_quality(
                generated_content, person_profile, conversation_context
            )
            
            # 대안 메시지 생성
            alternatives = self._generate_alternatives(
                request, generation_strategy, person_profile, 3
            )
            
            message_id = f"msg_{int(datetime.now().timestamp())}"
            
            generated_message = GeneratedMessage(
                message_id=message_id,
                content=generated_content,
                confidence_score=quality_scores['overall'],
                reasoning=generation_strategy['reasoning'],
                style_match_score=quality_scores['style_match'],
                context_relevance_score=quality_scores['context_relevance'],
                alternatives=alternatives,
                metadata={
                    'generation_strategy': generation_strategy,
                    'person_profile_summary': {
                        'communication_style': person_profile.communication_style,
                        'frequent_topics': person_profile.frequent_topics[:3]
                    },
                    'conversation_context_summary': {
                        'tone': conversation_context.conversation_tone,
                        'main_topics': conversation_context.main_topics[:3]
                    }
                }
            )
            
            return generated_message
            
        except Exception as e:
            logger.error(f"Error generating contextual message: {e}")
            return self._generate_fallback_message(request)
    
    def _analyze_recent_flow(self, recent_messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """최근 대화 흐름 분석"""
        try:
            if not recent_messages:
                return {'flow_type': 'unknown', 'last_topic': '', 'momentum': 'neutral'}
            
            # 최근 메시지들의 토픽 추출
            recent_topics = []
            last_senders = []
            
            for msg in recent_messages:
                content = msg.get('content', '')
                if content:
                    nouns = self.korean_analyzer.nouns(content)
                    recent_topics.extend([noun for noun in nouns if len(noun) > 1])
                
                sender = msg.get('sender', '')
                if sender:
                    last_senders.append(sender)
            
            # 대화 흐름 타입 결정
            flow_type = 'discussion'
            if len(set(last_senders[-3:])) == 1:  # 같은 사람이 연속으로
                flow_type = 'monologue'
            elif any('?' in msg.get('content', '') for msg in recent_messages[-2:]):
                flow_type = 'question_answer'
            elif any('!' in msg.get('content', '') for msg in recent_messages[-2:]):
                flow_type = 'excited'
            
            # 대화 모멘텀
            momentum = 'neutral'
            time_gaps = []
            for i in range(1, len(recent_messages)):
                try:
                    curr_time = datetime.fromisoformat(recent_messages[i]['timestamp'])
                    prev_time = datetime.fromisoformat(recent_messages[i-1]['timestamp'])
                    gap = (curr_time - prev_time).total_seconds()
                    time_gaps.append(gap)
                except:
                    continue
            
            if time_gaps:
                avg_gap = np.mean(time_gaps)
                if avg_gap < 60:  # 1분 이내
                    momentum = 'high'
                elif avg_gap > 300:  # 5분 이상
                    momentum = 'low'
            
            return {
                'flow_type': flow_type,
                'last_topic': Counter(recent_topics).most_common(1)[0][0] if recent_topics else '',
                'momentum': momentum,
                'participant_activity': Counter(last_senders),
                'recent_topics': list(set(recent_topics))
            }
            
        except Exception as e:
            logger.error(f"Error analyzing recent flow: {e}")
            return {'flow_type': 'unknown', 'last_topic': '', 'momentum': 'neutral'}
    
    def _determine_strategy(self, request: MessageGenerationRequest, 
                          conversation_context: ConversationContext,
                          person_profile: PersonProfile,
                          recent_flow: Dict[str, Any]) -> Dict[str, Any]:
        """메시지 생성 전략 결정"""
        try:
            strategy = {
                'tone': 'casual',
                'length': 'medium',
                'approach': 'natural',
                'topic_focus': '',
                'reasoning': ''
            }
            
            # 개인의 커뮤니케이션 스타일에 맞춤
            style_scores = person_profile.communication_style
            if style_scores.get('formal', 0) > 0.6:
                strategy['tone'] = 'formal'
                strategy['reasoning'] = f"{person_profile.name}님은 정중한 표현을 선호하시는 것 같습니다."
            elif style_scores.get('casual', 0) > 0.6:
                strategy['tone'] = 'casual'
                strategy['reasoning'] = f"{person_profile.name}님은 친근한 대화를 선호하시는 것 같습니다."
            
            # 대화 길이 맞춤
            if person_profile.avg_message_length < 20:
                strategy['length'] = 'short'
            elif person_profile.avg_message_length > 100:
                strategy['length'] = 'long'
            
            # 최근 흐름에 따른 접근법
            if recent_flow['flow_type'] == 'question_answer':
                strategy['approach'] = 'responsive'
            elif recent_flow['momentum'] == 'high':
                strategy['approach'] = 'energetic'
            elif recent_flow['momentum'] == 'low':
                strategy['approach'] = 'reviving'
            
            # 토픽 포커스
            if recent_flow['last_topic']:
                strategy['topic_focus'] = recent_flow['last_topic']
            elif person_profile.frequent_topics:
                strategy['topic_focus'] = person_profile.frequent_topics[0]
            elif conversation_context.main_topics:
                strategy['topic_focus'] = conversation_context.main_topics[0]
            
            return strategy
            
        except Exception as e:
            logger.error(f"Error determining strategy: {e}")
            return {'tone': 'casual', 'length': 'medium', 'approach': 'natural'}
    
    def _generate_message_content(self, request: MessageGenerationRequest,
                                strategy: Dict[str, Any],
                                person_profile: PersonProfile,
                                recent_flow: Dict[str, Any]) -> str:
        """실제 메시지 내용 생성"""
        try:
            intent = request.message_intent
            tone = strategy['tone']
            topic = strategy.get('topic_focus', '')
            
            # 기본 템플릿 선택
            if intent in self.message_templates:
                if tone in self.message_templates[intent]:
                    templates = self.message_templates[intent][tone]
                else:
                    templates = self.message_templates[intent]['casual']
                
                base_template = np.random.choice(templates)
            else:
                base_template = "안녕하세요!"
            
            # 개인화 적용
            personalized_content = self._personalize_content(
                base_template, person_profile, topic, recent_flow
            )
            
            # 길이 조정
            adjusted_content = self._adjust_length(
                personalized_content, strategy['length'], person_profile
            )
            
            return adjusted_content
            
        except Exception as e:
            logger.error(f"Error generating message content: {e}")
            return "안녕하세요! 잘 지내시나요?"
    
    def _personalize_content(self, base_content: str, person_profile: PersonProfile,
                           topic: str, recent_flow: Dict[str, Any]) -> str:
        """메시지 개인화"""
        try:
            content = base_content
            
            # 토픽 삽입
            if '{topic}' in content and topic:
                content = content.replace('{topic}', topic)
            
            # 개인의 자주 사용하는 표현 반영
            if person_profile.common_phrases:
                # 가끔 개인의 표현 스타일 반영
                if np.random.random() < 0.3:
                    phrase = np.random.choice(person_profile.common_phrases[:3])
                    if len(phrase) < 10:
                        content += f" {phrase}"
            
            # 시간대별 인사 추가
            current_hour = datetime.now().hour
            if 6 <= current_hour < 12 and '안녕' in content:
                content = content.replace('안녕', '좋은 아침')
            elif 18 <= current_hour < 22 and '안녕' in content:
                content = content.replace('안녕', '좋은 저녁')
            
            return content
            
        except Exception as e:
            logger.error(f"Error personalizing content: {e}")
            return base_content
    
    def _adjust_length(self, content: str, target_length: str, 
                      person_profile: PersonProfile) -> str:
        """메시지 길이 조정"""
        try:
            if target_length == 'short':
                # 간결하게 만들기
                content = content.split('.')[0]  # 첫 번째 문장만
                if len(content) > 30:
                    content = content[:30] + "..."
            
            elif target_length == 'long':
                # 좀 더 자세하게 만들기
                additions = [
                    " 어떻게 생각하세요?",
                    " 의견을 듣고 싶습니다.",
                    " 최근에 관심이 많으시더라고요.",
                    " 함께 이야기해보면 좋겠네요."
                ]
                
                if len(content) < 50:
                    addition = np.random.choice(additions)
                    content += addition
            
            return content
            
        except Exception as e:
            logger.error(f"Error adjusting length: {e}")
            return content
    
    def _evaluate_message_quality(self, content: str, person_profile: PersonProfile,
                                conversation_context: ConversationContext) -> Dict[str, float]:
        """메시지 품질 평가"""
        try:
            scores = {}
            
            # 스타일 매치 점수
            style_match = 0.5
            person_style = person_profile.communication_style
            
            if person_style.get('formal', 0) > 0.6 and any(word in content for word in ['습니다', '입니다']):
                style_match += 0.3
            if person_style.get('casual', 0) > 0.6 and any(word in content for word in ['어', '야', '~']):
                style_match += 0.3
            
            scores['style_match'] = min(1.0, style_match)
            
            # 맥락 관련성 점수
            context_relevance = 0.5
            for topic in conversation_context.main_topics[:3]:
                if topic in content:
                    context_relevance += 0.2
            
            scores['context_relevance'] = min(1.0, context_relevance)
            
            # 전체 점수
            scores['overall'] = (scores['style_match'] + scores['context_relevance']) / 2
            
            return scores
            
        except Exception as e:
            logger.error(f"Error evaluating message quality: {e}")
            return {'style_match': 0.5, 'context_relevance': 0.5, 'overall': 0.5}
    
    def _generate_alternatives(self, request: MessageGenerationRequest,
                             strategy: Dict[str, Any], person_profile: PersonProfile,
                             count: int = 3) -> List[str]:
        """대안 메시지 생성"""
        try:
            alternatives = []
            
            for _ in range(count):
                # 전략을 약간씩 변경해서 대안 생성
                alt_strategy = strategy.copy()
                
                # 톤 변경
                if strategy['tone'] == 'casual':
                    alt_strategy['tone'] = 'formal'
                else:
                    alt_strategy['tone'] = 'casual'
                
                # 길이 변경
                lengths = ['short', 'medium', 'long']
                alt_strategy['length'] = np.random.choice(lengths)
                
                alt_content = self._generate_message_content(
                    request, alt_strategy, person_profile, {}
                )
                
                if alt_content not in alternatives:
                    alternatives.append(alt_content)
            
            return alternatives
            
        except Exception as e:
            logger.error(f"Error generating alternatives: {e}")
            return []
    
    def _generate_fallback_message(self, request: MessageGenerationRequest) -> GeneratedMessage:
        """폴백 메시지 생성"""
        fallback_messages = [
            "안녕하세요! 잘 지내시나요?",
            "요즘 어떻게 지내고 계신가요?",
            "오랜만에 인사드립니다.",
            "최근에 어떤 일들로 바쁘신가요?"
        ]
        
        content = np.random.choice(fallback_messages)
        
        return GeneratedMessage(
            message_id=f"fallback_{int(datetime.now().timestamp())}",
            content=content,
            confidence_score=0.5,
            reasoning="기본 템플릿을 사용한 안전한 메시지입니다.",
            style_match_score=0.5,
            context_relevance_score=0.5,
            alternatives=[],
            metadata={'fallback': True}
        )

# FastAPI 애플리케이션
app = FastAPI(title="Contextual Message Generator", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 전역 메시지 생성기 인스턴스
message_generator = ContextualMessageGenerator()

@app.on_event("startup")
async def startup_event():
    """서버 시작 시 초기화"""
    logger.info("Contextual Message Generator starting up...")

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
        
        return {
            "message_id": generated_message.message_id,
            "content": generated_message.content,
            "confidence_score": generated_message.confidence_score,
            "reasoning": generated_message.reasoning,
            "style_match_score": generated_message.style_match_score,
            "context_relevance_score": generated_message.context_relevance_score,
            "alternatives": generated_message.alternatives,
            "metadata": generated_message.metadata
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/analyze-conversation")
async def analyze_conversation(request_data: Dict[str, Any]):
    """대화 맥락 분석"""
    try:
        chat_room_id = request_data['chat_room_id']
        messages = request_data['messages']
        
        context = message_generator.conversation_analyzer.analyze_conversation(
            chat_room_id, messages
        )
        
        return {
            "chat_room_id": context.chat_room_id,
            "chat_room_name": context.chat_room_name,
            "participants": context.participants,
            "total_messages": context.total_messages,
            "main_topics": context.main_topics,
            "conversation_tone": context.conversation_tone,
            "activity_patterns": context.activity_patterns
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/analyze-person")
async def analyze_person(request_data: Dict[str, Any]):
    """개인 프로필 분석"""
    try:
        chat_room_id = request_data['chat_room_id']
        person_name = request_data['person_name']
        messages = request_data['messages']
        
        profile = message_generator.person_profiler.analyze_person(
            chat_room_id, person_name, messages
        )
        
        return {
            "name": profile.name,
            "message_count": profile.message_count,
            "avg_message_length": profile.avg_message_length,
            "preferred_time_slots": profile.preferred_time_slots,
            "communication_style": profile.communication_style,
            "frequent_topics": profile.frequent_topics,
            "common_phrases": profile.common_phrases,
            "response_patterns": profile.response_patterns,
            "relationship_dynamics": profile.relationship_dynamics
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/templates")
async def get_message_templates():
    """메시지 템플릿 조회"""
    return {"templates": message_generator.message_templates}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8007) 