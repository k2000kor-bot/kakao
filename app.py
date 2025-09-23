from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from datetime import datetime
import random
import os
import uuid
import sqlite3
import secrets
from werkzeug.utils import secure_filename
from functools import wraps
import requests
import json
from urllib.parse import quote
import numpy as np
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum
import shutil
import difflib
import re

app = Flask(__name__)
CORS(app)

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 고도화된 대화 컨텍스트 저장
conversation_context = {}

class ConversationContext:
    """대화 컨텍스트 관리 클래스"""
    
    def __init__(self):
        self.contexts = {}
    
    def get_context(self, session_id: str) -> Dict[str, Any]:
        """세션별 컨텍스트 조회"""
        if session_id not in self.contexts:
            self.contexts[session_id] = {
                'last_topic': None,
                'last_question_type': None,
                'conversation_history': [],
                'user_preferences': {},
                'current_focus': None,
                'learning_progress': {},
                'emotion_trend': [],
                'question_pattern': []
            }
        return self.contexts[session_id]
    
    def update_context(self, session_id: str, message: str, analysis: Dict[str, Any], response: str):
        """컨텍스트 업데이트"""
        context = self.get_context(session_id)
        
        # 대화 히스토리 업데이트
        context['conversation_history'].append({
            'message': message,
            'analysis': analysis,
            'response': response,
            'timestamp': datetime.now().isoformat()
        })
        
        # 최근 10개 대화만 유지
        if len(context['conversation_history']) > 10:
            context['conversation_history'] = context['conversation_history'][-10:]
        
        # 주제 및 질문 유형 업데이트
        topics = analysis.get('topics', [])
        question_types = analysis.get('question_types', [])
        
        if topics:
            context['last_topic'] = topics[0]  # 주요 주제
        if question_types:
            context['last_question_type'] = question_types[0]
        
        # 감정 트렌드 업데이트
        emotion = analysis.get('detected_emotion', 'neutral')
        context['emotion_trend'].append(emotion)
        if len(context['emotion_trend']) > 5:
            context['emotion_trend'] = context['emotion_trend'][-5:]
        
        # 질문 패턴 분석
        complexity = analysis.get('complexity', 'simple')
        context['question_pattern'].append({
            'complexity': complexity,
            'topic_count': len(topics),
            'question_count': len(question_types)
        })
        if len(context['question_pattern']) > 5:
            context['question_pattern'] = context['question_pattern'][-5:]
    
    def get_contextual_suggestions(self, session_id: str) -> List[str]:
        """컨텍스트 기반 제안 생성"""
        context = self.get_context(session_id)
        suggestions = []
        
        # 최근 주제 기반 제안
        if context['last_topic']:
            topic_suggestions = {
                'python': [
                    "파이썬으로 웹 개발하는 방법은?",
                    "Django와 Flask의 차이점은?",
                    "파이썬 데이터 분석 라이브러리 추천해주세요"
                ],
                'javascript': [
                    "React와 Vue.js 중 어떤 것을 선택해야 할까요?",
                    "Node.js로 백엔드 개발하는 방법은?",
                    "자바스크립트 비동기 프로그래밍에 대해 알려주세요"
                ],
                'web_development': [
                    "풀스택 개발자가 되려면 어떻게 해야 할까요?",
                    "웹 개발 프로젝트 포트폴리오 만들기",
                    "웹 성능 최적화 방법은?"
                ],
                'machine_learning': [
                    "머신러닝 입문자를 위한 학습 로드맵",
                    "TensorFlow와 PyTorch 비교",
                    "실제 프로젝트에 ML 적용하는 방법"
                ]
            }
            
            if context['last_topic'] in topic_suggestions:
                suggestions.extend(topic_suggestions[context['last_topic']][:2])
        
        # 감정 트렌드 기반 제안
        if context['emotion_trend']:
            recent_emotions = context['emotion_trend'][-3:]
            if 'frustrated' in recent_emotions:
                suggestions.append("초보자도 쉽게 따라할 수 있는 튜토리얼을 찾고 있어요")
            elif 'curious' in recent_emotions:
                suggestions.append("더 깊이 있는 내용을 알고 싶어요")
        
        return suggestions[:3]  # 최대 3개 제안

# 컨텍스트 관리자 인스턴스
context_manager = ConversationContext()

# 성능 모니터링
performance_metrics = {
    'total_requests': 0,
    'successful_requests': 0,
    'failed_requests': 0,
    'average_response_time': 0,
    'response_times': []
}

# 고급 AI 기능을 위한 클래스들
class EmotionType(Enum):
    """감정 유형"""
    HAPPY = "happy"
    SAD = "sad"
    ANGRY = "angry"
    EXCITED = "excited"
    NEUTRAL = "neutral"
    CONFUSED = "confused"
    CURIOUS = "curious"
    FRUSTRATED = "frustrated"

class IntentType(Enum):
    """의도 유형"""
    QUESTION = "question"
    GREETING = "greeting"
    REQUEST = "request"
    COMPLAINT = "complaint"
    COMPLIMENT = "compliment"
    GOODBYE = "goodbye"
    HELP = "help"
    INFORMATION = "information"

@dataclass
class EmotionAnalysis:
    """감정 분석 결과"""
    emotion: EmotionType
    confidence: float
    intensity: float
    keywords: List[str]

@dataclass
class IntentAnalysis:
    """의도 분석 결과"""
    intent: IntentType
    confidence: float
    entities: List[str]
    context: str

# 고급 AI 분석기
class AdvancedAIAnalyzer:
    """고급 AI 분석기"""
    
    def __init__(self):
        self.emotion_keywords = {
            EmotionType.HAPPY: ['좋아', '행복', '기쁘', '즐거', '웃음', '만족', '감사'],
            EmotionType.SAD: ['슬프', '우울', '힘들', '아픔', '눈물', '실망', '좌절'],
            EmotionType.ANGRY: ['화나', '짜증', '분노', '열받', '불만', '화', '격분'],
            EmotionType.EXCITED: ['신나', '흥분', '기대', '설레', '재미', '놀라', '대단'],
            EmotionType.CONFUSED: ['혼란', '헷갈', '모르', '이해', '어려', '복잡', '난해'],
            EmotionType.CURIOUS: ['궁금', '알고싶', '궁금해', '궁금하', '물어', '질문'],
            EmotionType.FRUSTRATED: ['답답', '짜증', '불편', '어려움', '막막', '힘들어']
        }
        
        self.intent_keywords = {
            IntentType.QUESTION: ['?', '뭐', '어떻게', '왜', '언제', '어디', '누구', '무엇'],
            IntentType.GREETING: ['안녕', '하이', '헬로', '좋은', '반가', '인사'],
            IntentType.REQUEST: ['도와', '부탁', '요청', '해줘', '해주세요', '가능'],
            IntentType.COMPLAINT: ['불만', '문제', '이상', '오류', '잘못', '틀렸'],
            IntentType.COMPLIMENT: ['좋다', '훌륭', '대단', '멋져', '훌륭해', '잘했'],
            IntentType.GOODBYE: ['안녕히', '잘가', '또봐', '다음에', '나중에'],
            IntentType.HELP: ['도움', '도와줘', '어떻게', '방법', '가르쳐'],
            IntentType.INFORMATION: ['알려', '정보', '설명', '소개', '말해']
        }
    
    def analyze_emotion(self, text: str) -> EmotionAnalysis:
        """감정 분석"""
        try:
            text_lower = text.lower()
            emotion_scores = {}
            
            for emotion, keywords in self.emotion_keywords.items():
                score = sum(1 for keyword in keywords if keyword in text_lower)
                emotion_scores[emotion] = score
            
            if not emotion_scores or max(emotion_scores.values()) == 0:
                detected_emotion = EmotionType.NEUTRAL
                confidence = 0.5
            else:
                detected_emotion = max(emotion_scores, key=emotion_scores.get)
                confidence = min(emotion_scores[detected_emotion] / max(len(text.split()), 1), 1.0)
            
            # 감정 강도 계산
            intensity = min(len(text) / 50, 1.0)  # 텍스트 길이 기반
            
            # 감정 키워드 추출
            found_keywords = []
            for keyword in self.emotion_keywords[detected_emotion]:
                if keyword in text_lower:
                    found_keywords.append(keyword)
            
            return EmotionAnalysis(
                emotion=detected_emotion,
                confidence=confidence,
                intensity=intensity,
                keywords=found_keywords
            )
        except Exception as e:
            logger.error(f"감정 분석 오류: {e}")
            return EmotionAnalysis(
                emotion=EmotionType.NEUTRAL,
                confidence=0.5,
                intensity=0.5,
                keywords=[]
            )
    
    def analyze_intent(self, text: str) -> IntentAnalysis:
        """의도 분석"""
        try:
            text_lower = text.lower()
            intent_scores = {}
            
            for intent, keywords in self.intent_keywords.items():
                score = sum(1 for keyword in keywords if keyword in text_lower)
                intent_scores[intent] = score
            
            if not intent_scores or max(intent_scores.values()) == 0:
                detected_intent = IntentType.INFORMATION
                confidence = 0.3
            else:
                detected_intent = max(intent_scores, key=intent_scores.get)
                confidence = min(intent_scores[detected_intent] / max(len(text.split()), 1), 1.0)
            
            # 엔티티 추출 (간단한 버전)
            entities = []
            for intent, keywords in self.intent_keywords.items():
                for keyword in keywords:
                    if keyword in text_lower:
                        entities.append(keyword)
            
            # 컨텍스트 추출
            context = "일반적인 대화" if detected_intent == IntentType.INFORMATION else f"{detected_intent.value} 의도"
            
            return IntentAnalysis(
                intent=detected_intent,
                confidence=confidence,
                entities=entities,
                context=context
            )
        except Exception as e:
            logger.error(f"의도 분석 오류: {e}")
            return IntentAnalysis(
                intent=IntentType.INFORMATION,
                confidence=0.3,
                entities=[],
                context="일반적인 대화"
            )
    
    def generate_personalized_response(self, text: str, emotion: EmotionAnalysis, intent: IntentAnalysis) -> str:
        """개인화된 응답 생성"""
        base_response = self._get_base_response(intent.intent)
        
        # 감정에 따른 응답 조정
        if emotion.emotion == EmotionType.HAPPY:
            base_response = f"😊 {base_response} 좋은 기분이신 것 같네요!"
        elif emotion.emotion == EmotionType.SAD:
            base_response = f"😢 {base_response} 힘든 일이 있으신가요? 제가 도와드릴 수 있는 것이 있다면 말씀해주세요."
        elif emotion.emotion == EmotionType.ANGRY:
            base_response = f"😤 {base_response} 화가 나신 것 같네요. 차분히 이야기해보시죠."
        elif emotion.emotion == EmotionType.EXCITED:
            base_response = f"🎉 {base_response} 정말 신나시는군요! 함께 즐거운 시간을 보내요!"
        elif emotion.emotion == EmotionType.CONFUSED:
            base_response = f"🤔 {base_response} 혼란스러우신 것 같네요. 천천히 설명해드릴게요."
        elif emotion.emotion == EmotionType.CURIOUS:
            base_response = f"🔍 {base_response} 궁금한 점이 많으시군요! 자세히 알려드리겠습니다."
        
        return base_response
    
    def _get_base_response(self, intent: IntentType) -> str:
        """의도별 기본 응답"""
        responses = {
            IntentType.QUESTION: "좋은 질문이네요! 자세히 답변해드리겠습니다.",
            IntentType.GREETING: "안녕하세요! 반가워요!",
            IntentType.REQUEST: "네, 도와드리겠습니다!",
            IntentType.COMPLAINT: "문제를 해결해드리겠습니다.",
            IntentType.COMPLIMENT: "감사합니다! 더 열심히 하겠습니다.",
            IntentType.GOODBYE: "안녕히 가세요! 또 만나요!",
            IntentType.HELP: "도움이 필요하시군요. 무엇을 도와드릴까요?",
            IntentType.INFORMATION: "정보를 제공해드리겠습니다."
        }
        return responses.get(intent, "무엇을 도와드릴까요?")

# 고급 AI 분석기 인스턴스 생성
ai_analyzer = AdvancedAIAnalyzer()

# 학습 및 적응 시스템
class LearningSystem:
    """학습 및 적응 시스템"""
    
    def __init__(self):
        self.user_preferences = {}
        self.conversation_patterns = {}
        self.response_effectiveness = {}
        self.learning_data = {}
    
    def learn_from_interaction(self, session_id: str, user_message: str, ai_response: str, 
                             emotion_analysis: EmotionAnalysis, intent_analysis: IntentAnalysis):
        """상호작용으로부터 학습"""
        try:
            if session_id not in self.learning_data:
                self.learning_data[session_id] = {
                    'total_interactions': 0,
                    'emotion_history': [],
                    'intent_history': [],
                    'preferred_topics': {},
                    'response_ratings': []
                }
            
            # 상호작용 기록
            self.learning_data[session_id]['total_interactions'] += 1
            self.learning_data[session_id]['emotion_history'].append(emotion_analysis.emotion.value)
            self.learning_data[session_id]['intent_history'].append(intent_analysis.intent.value)
            
            # 주제 선호도 학습
            message_lower = user_message.lower()
            for topic in ['python', 'javascript', 'machine_learning', 'data_analysis', 'web_development']:
                if topic in message_lower:
                    if topic not in self.learning_data[session_id]['preferred_topics']:
                        self.learning_data[session_id]['preferred_topics'][topic] = 0
                    self.learning_data[session_id]['preferred_topics'][topic] += 1
            
            logger.info(f"학습 데이터 업데이트: 세션 {session_id}, 상호작용 {self.learning_data[session_id]['total_interactions']}")
            
        except Exception as e:
            logger.error(f"학습 시스템 오류: {e}")
    
    def get_personalized_suggestions(self, session_id: str) -> List[str]:
        """개인화된 제안 생성"""
        try:
            if session_id not in self.learning_data:
                return ["안녕하세요! 무엇을 도와드릴까요?"]
            
            data = self.learning_data[session_id]
            suggestions = []
            
            # 감정 기반 제안
            if data['emotion_history']:
                recent_emotions = data['emotion_history'][-3:]  # 최근 3개 감정
                most_common_emotion = max(set(recent_emotions), key=recent_emotions.count)
                
                if most_common_emotion == 'happy':
                    suggestions.append("좋은 기분이시군요! 더 즐거운 주제로 이야기해볼까요?")
                elif most_common_emotion == 'confused':
                    suggestions.append("혼란스러우신 것 같네요. 천천히 설명해드릴게요.")
                elif most_common_emotion == 'curious':
                    suggestions.append("궁금한 점이 많으시군요! 더 자세히 알아보시죠.")
            
            # 주제 선호도 기반 제안
            if data['preferred_topics']:
                top_topic = max(data['preferred_topics'], key=data['preferred_topics'].get)
                topic_suggestions = {
                    'python': "파이썬에 대해 더 자세히 알아보시겠어요?",
                    'javascript': "자바스크립트 관련 질문이 있으시나요?",
                    'machine_learning': "머신러닝의 어떤 부분이 궁금하신가요?",
                    'data_analysis': "데이터 분석에 대해 더 알고 싶으시나요?",
                    'web_development': "웹 개발 관련 도움이 필요하신가요?"
                }
                if top_topic in topic_suggestions:
                    suggestions.append(topic_suggestions[top_topic])
            
            return suggestions[:3]  # 최대 3개 제안
            
        except Exception as e:
            logger.error(f"개인화 제안 생성 오류: {e}")
            return ["무엇을 도와드릴까요?"]
    
    def adapt_response_style(self, session_id: str, base_response: str) -> str:
        """응답 스타일 적응"""
        try:
            if session_id not in self.learning_data:
                return base_response
            
            data = self.learning_data[session_id]
            
            # 감정 패턴에 따른 스타일 조정
            if data['emotion_history']:
                recent_emotions = data['emotion_history'][-5:]  # 최근 5개 감정
                if len(recent_emotions) >= 3:
                    happy_ratio = recent_emotions.count('happy') / len(recent_emotions)
                    if happy_ratio > 0.6:
                        # 사용자가 긍정적인 감정을 자주 표현하는 경우
                        base_response = f"😊 {base_response}"
                    elif happy_ratio < 0.2:
                        # 사용자가 부정적인 감정을 자주 표현하는 경우
                        base_response = f"💙 {base_response} 힘내세요!"
            
            # 상호작용 빈도에 따른 스타일 조정
            if data['total_interactions'] > 10:
                base_response = f"{base_response}\n\n💡 더 궁금한 점이 있으시면 언제든 말씀해주세요!"
            
            return base_response
            
        except Exception as e:
            logger.error(f"응답 스타일 적응 오류: {e}")
            return base_response

# 학습 시스템 인스턴스 생성
learning_system = LearningSystem()

def analyze_complex_message(message: str) -> Dict[str, Any]:
    """복잡한 메시지 분석"""
    try:
        message_lower = message.lower()
        
        # 주제 추출
        topics = []
        topic_keywords = {
            'python': ['파이썬', 'python', 'django', 'flask', 'fastapi', 'pandas', 'numpy', 'matplotlib', 'jupyter', 'beautifulsoup', 'scrapy', 'celery', 'pytest', '장고', '플라스크'],
            'javascript': ['자바스크립트', 'javascript', 'js', 'react', 'vue', 'angular', 'node.js', 'nodejs', 'express', 'next.js', 'typescript', 'webpack', 'babel', '리액트', '뷰'],
            'web_development': ['웹개발', '웹 개발', 'web development', 'frontend', 'backend', '풀스택', 'fullstack', 'html', 'css', 'bootstrap', 'tailwind', 'api', 'rest', 'graphql', '프론트엔드', '백엔드'],
            'machine_learning': ['머신러닝', 'machine learning', '딥러닝', 'deep learning', 'ai', '인공지능', 'tensorflow', 'pytorch', 'scikit-learn', 'keras', 'neural network', '신경망', 'ml'],
            'data_analysis': ['데이터분석', '데이터 분석', 'data analysis', '데이터시각화', '데이터 시각화', 'data visualization', 'sql', 'database', 'etl', 'bi', '대시보드'],
            'mobile_development': ['모바일', 'mobile', 'android', 'ios', 'react native', 'flutter', 'swift', 'kotlin', '앱 개발', '앱개발'],
            'devops': ['devops', '도커', 'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'ci/cd', 'jenkins', 'gitlab', '배포'],
            'blockchain': ['블록체인', 'blockchain', '비트코인', 'bitcoin', '이더리움', 'ethereum', '스마트컨트랙트', 'smart contract', 'web3', '암호화폐']
        }
        
        for topic, keywords in topic_keywords.items():
            if any(keyword in message_lower for keyword in keywords):
                topics.append(topic)
        
        # 질문 유형 분석 (더 세분화)
        question_types = []
        question_patterns = {
            'how_to': ['어떻게', 'how', '방법', '과정', '단계', '순서', '절차', '가이드', '튜토리얼'],
            'what_is': ['무엇', 'what', '뭐', '정의', '개념', '의미', '이해', '설명'],
            'why': ['왜', 'why', '이유', '원인', '목적', '필요성', '장점', '단점'],
            'when': ['언제', 'when', '시기', '타이밍', '적절한', '최적'],
            'where': ['어디서', 'where', '장소', '위치', '환경', '플랫폼'],
            'which': ['어떤', 'which', '선택', '추천', '비교', '차이'],
            'troubleshooting': ['문제', '오류', '에러', '해결', '디버깅', '수정', '고치', '안됨'],
            'optimization': ['최적화', '성능', '개선', '효율', '빠르게', '최적', '향상', '속도']
        }
        
        for qtype, patterns in question_patterns.items():
            if any(pattern in message_lower for pattern in patterns):
                question_types.append(qtype)
        
        # 복잡도 분석 (더 정교한 계산)
        word_count = len(message.split())
        char_count = len(message)
        sentence_count = len([s for s in message.split('.') if s.strip()])
        
        complexity_score = 0
        complexity_score += min(word_count / 10, 3)  # 단어 수 기반
        complexity_score += len(topics) * 0.5  # 주제 수 기반
        complexity_score += len(question_types) * 0.3  # 질문 유형 수 기반
        complexity_score += sentence_count * 0.2  # 문장 수 기반
        
        if complexity_score >= 2.5:
            complexity = 'complex'
        elif complexity_score >= 1.5:
            complexity = 'medium'
        else:
            complexity = 'simple'
        
        # 요청 사항 추출 (더 세분화)
        requests = []
        request_patterns = {
            'learning_guidance': ['학습', '배우', '가이드', '튜토리얼', '공부', '교육', '강의'],
            'getting_started': ['시작', '처음', '기초', '입문', '초보', '처음부터', '기본'],
            'practical_example': ['프로젝트', '실습', '예제', '코드', '구현', '만들기', '개발'],
            'comparison': ['비교', '차이', '장단점', '선택', 'vs', '대신', '대비'],
            'troubleshooting': ['문제', '오류', '해결', '디버깅', '수정', '고치', '안됨', '에러'],
            'optimization': ['최적화', '성능', '개선', '효율', '빠르게', '최적', '향상', '속도'],
            'setup_guidance': ['설치', '환경설정', '설정', '구성', '설치', '환경', '세팅'],
            'architecture_guidance': ['아키텍처', '구조', '설계', '패턴', '모델', '시스템', '구조'],
            'ui_ux_guidance': ['UI', 'UX', '디자인', '인터페이스', '화면', '사용자', '인터랙션'],
            'deployment': ['배포', '배치', '운영', '서버', '호스팅', '클라우드', '프로덕션'],
            'testing': ['테스트', '검증', '확인', '체크', '디버깅', '품질'],
            'documentation': ['문서', '설명서', '가이드', '매뉴얼', '레퍼런스', 'API 문서']
        }
        
        for request_type, patterns in request_patterns.items():
            if any(pattern in message_lower for pattern in patterns):
                requests.append(request_type)
        
        # 감정 및 의도 분석
        emotion_indicators = {
            'frustrated': ['짜증', '화나', '어려워', '복잡해', '모르겠', '힘들어'],
            'curious': ['궁금', '알고싶', '배우고싶', '관심', '흥미'],
            'urgent': ['급해', '빨리', '즉시', '당장', '시급'],
            'confident': ['잘해', '쉬워', '간단해', '알겠', '이해']
        }
        
        detected_emotion = 'neutral'
        for emotion, indicators in emotion_indicators.items():
            if any(indicator in message_lower for indicator in indicators):
                detected_emotion = emotion
                break
        
        # 다중 질문 감지 (더 정교한 분석)
        question_marks = message.count('?')
        conjunction_words = ['그리고', '또한', '추가로', '또', '그리고', '그런데', '하지만', '그러나']
        has_multiple_questions = (
            question_marks > 1 or 
            any(word in message_lower for word in conjunction_words) or
            len(topics) > 2 or
            len(question_types) > 2
        )
        
        # 우선순위 분석
        priority_keywords = ['급해', '빨리', '즉시', '당장', '중요', '필수']
        is_urgent = any(keyword in message_lower for keyword in priority_keywords)
        
        return {
            'topics': topics,
            'question_types': question_types,
            'complexity': complexity,
            'complexity_score': round(complexity_score, 2),
            'requests': requests,
            'has_multiple_questions': has_multiple_questions,
            'word_count': word_count,
            'char_count': char_count,
            'sentence_count': sentence_count,
            'detected_emotion': detected_emotion,
            'is_urgent': is_urgent,
            'confidence': min(0.9, 0.3 + (len(topics) * 0.1) + (len(question_types) * 0.05))
        }
        
    except Exception as e:
        logger.error(f"메시지 분석 오류: {e}")
        return {
            'topics': [],
            'question_types': ['question'],
            'complexity': 'simple',
            'requests': [],
            'word_count': len(message.split()),
            'has_multiple_questions': False
        }

def generate_advanced_fallback_response(message: str, analysis: Dict[str, Any], session_id: str = None) -> str:
    """고도화된 고급 기본 답변 생성"""
    try:
        topics = analysis.get('topics', [])
        question_types = analysis.get('question_types', [])
        complexity = analysis.get('complexity', 'simple')
        complexity_score = analysis.get('complexity_score', 0)
        requests = analysis.get('requests', [])
        detected_emotion = analysis.get('detected_emotion', 'neutral')
        is_urgent = analysis.get('is_urgent', False)
        confidence = analysis.get('confidence', 0.5)
        
        # 사용자 수준 분석
        user_level = analyze_user_level(message, topics)
        
        # 긴급도에 따른 응답 우선순위 조정
        if is_urgent:
            response_prefix = "🚨 긴급 질문이군요! 빠르게 답변드리겠습니다.\n\n"
        else:
            response_prefix = ""
        
        # 감정에 따른 응답 톤 조정
        emotion_prefix = ""
        if detected_emotion == 'frustrated':
            emotion_prefix = "💙 이해합니다. 차근차근 설명드릴게요.\n\n"
        elif detected_emotion == 'curious':
            emotion_prefix = "😊 좋은 질문이네요! 자세히 알려드리겠습니다.\n\n"
        elif detected_emotion == 'confident':
            emotion_prefix = "👍 좋습니다! 더 깊이 있는 내용으로 답변드리겠습니다.\n\n"
        
        # 복잡도와 신뢰도에 따른 답변 전략 선택
        if complexity_score >= 2.5 or analysis.get('has_multiple_questions', False):
            # 매우 복잡한 질문: 체계적이고 단계별 답변
            base_response = generate_complex_response(message, topics, requests)
        elif len(topics) >= 2:
            # 다중 주제: 통합적 답변
            base_response = generate_multi_topic_response(topics, question_types, requests, user_level)
        elif topics:
            # 단일 주제: 전문적 답변
            base_response = generate_topic_specific_response(topics, question_types, requests)
        else:
            # 일반적 질문: 범용 답변
            base_response = generate_general_response(message, question_types)
        
        # 답변 품질 향상
        enhanced_response = enhance_response_quality(base_response, analysis, user_level)
        
        # 최종 응답 조합
        final_response = response_prefix + emotion_prefix + enhanced_response
        
        # 학습 시스템에 상호작용 기록
        if session_id:
            learning_system.learn_from_interaction(
                session_id, message, final_response, 
                detected_emotion, 'information_request'
            )
        
        return final_response
        
    except Exception as e:
        logger.error(f"고급 기본 답변 생성 오류: {e}")
        return "죄송합니다. 답변을 생성하는 중에 오류가 발생했습니다. 다른 질문을 해주세요."

def analyze_user_level(message: str, topics: List[str]) -> str:
    """사용자 수준 분석"""
    message_lower = message.lower()
    
    # 초보자 키워드
    beginner_keywords = [
        '처음', '처음으로', '처음에', '기초', '기본', '시작', '배우고 싶어요', 
        '배우고 싶습니다', '어떻게 시작', '어디서 시작', '무엇부터', '뭘 배워야',
        '초보자', '입문', '기초부터', '처음 배우는', '처음 접하는'
    ]
    
    # 중급자 키워드
    intermediate_keywords = [
        '어떻게 하면', '어떻게 구현', '어떻게 만들', '어떻게 개발', '어떻게 구축',
        '프로젝트', '실제로', '실무에서', '업무에서', '회사에서', '팀에서',
        '개발하다', '구현하다', '만들다', '개선하다', '최적화하다'
    ]
    
    # 고급자 키워드
    advanced_keywords = [
        '아키텍처', '설계', '성능', '최적화', '확장성', '보안', '배포', '운영',
        '마이크로서비스', '클라우드', 'DevOps', 'CI/CD', '모니터링', '로깅',
        '테스트', '리팩토링', '코드 품질', '코드 리뷰', '문서화'
    ]
    
    # 키워드 매칭으로 수준 판단
    if any(keyword in message_lower for keyword in advanced_keywords):
        return 'advanced'
    elif any(keyword in message_lower for keyword in intermediate_keywords):
        return 'intermediate'
    elif any(keyword in message_lower for keyword in beginner_keywords):
        return 'beginner'
    else:
        return 'intermediate'  # 기본값

def generate_personalized_response_by_level(message: str, topics: List[str], user_level: str) -> str:
    """사용자 수준에 맞는 개인화된 답변 생성"""
    
    if user_level == 'beginner':
        return generate_beginner_response(message, topics)
    elif user_level == 'intermediate':
        return generate_intermediate_response(message, topics)
    elif user_level == 'advanced':
        return generate_advanced_response(message, topics)
    else:
        return generate_intermediate_response(message, topics)

def generate_beginner_response(message: str, topics: List[str]) -> str:
    """초보자용 답변 생성"""
    if 'web_development' in topics:
        return """🌱 **웹 개발 완전 초보자 가이드**

**🎯 첫 번째 목표: 간단한 웹사이트 만들기**

**1주차: HTML 기초**
- HTML이란? (웹페이지의 뼈대)
- 기본 태그: `<h1>`, `<p>`, `<div>`, `<img>`
- 간단한 자기소개 페이지 만들기

**2주차: CSS 기초**
- CSS란? (웹페이지 꾸미기)
- 색상, 폰트, 크기 조절
- 레이아웃 기초 (margin, padding)

**3주차: JavaScript 기초**
- JavaScript란? (웹페이지에 생명 불어넣기)
- 변수, 함수, 이벤트
- 간단한 계산기 만들기

**4주차: 첫 프로젝트**
- 개인 포트폴리오 사이트 만들기
- GitHub에 올리기
- 무료 호스팅으로 배포하기

**📚 초보자 추천 자료**
- **무료**: MDN Web Docs, FreeCodeCamp
- **유료**: Codecademy (인터랙티브 학습)
- **동영상**: 생활코딩 (한국어 강의)

**💡 초보자 팁**
- 매일 조금씩이라도 코딩하기
- 완벽하지 않아도 일단 만들어보기
- 커뮤니티에 질문하기 (Stack Overflow, Reddit)

**🚀 다음 단계**
- HTML/CSS/JavaScript 기초 완성 후
- React 또는 Vue 프레임워크 학습
- 백엔드 개발 (Node.js 또는 Python)

천천히 차근차근 배워가세요! 모든 개발자가 이 단계를 거쳤습니다. 😊"""

    elif 'python' in topics:
        return """🐍 **파이썬 완전 초보자 가이드**

**🎯 첫 번째 목표: 파이썬으로 간단한 프로그램 만들기**

**1주차: 파이썬 설치 및 기초**
- 파이썬 설치하기
- 변수와 데이터 타입 (숫자, 문자, 리스트)
- 간단한 계산기 만들기

**2주차: 조건문과 반복문**
- if문으로 조건 판단하기
- for문과 while문으로 반복하기
- 숫자 맞추기 게임 만들기

**3주차: 함수와 모듈**
- 함수 만들기와 사용하기
- 내장 함수 활용하기
- 간단한 텍스트 게임 만들기

**4주차: 파일 처리**
- 파일 읽기와 쓰기
- 데이터 저장하고 불러오기
- 간단한 메모장 프로그램 만들기

**📚 초보자 추천 자료**
- **무료**: Python 공식 튜토리얼, 점프 투 파이썬
- **유료**: Codecademy Python 코스
- **동영상**: 생활코딩 파이썬 강의

**💡 초보자 팁**
- 매일 조금씩 코딩하기
- 에러가 나도 포기하지 않기
- 다른 사람의 코드 보기

**🚀 다음 단계**
- 파이썬 기초 완성 후
- 웹 개발 (Django/Flask)
- 데이터 분석 (pandas, numpy)
- 자동화 스크립트 작성

파이썬은 정말 쉬운 언어입니다! 차근차근 배워보세요. 😊"""

    else:
        return f"""🌱 **'{message}'에 대한 초보자 가이드**

좋은 질문이네요! 처음 시작하는 분을 위해 차근차근 설명해드리겠습니다.

**🎯 초보자가 알아야 할 것들:**
- 기본 개념부터 차근차근
- 실습 위주의 학습
- 작은 프로젝트부터 시작
- 꾸준한 연습이 중요

**📚 추천 학습 방법:**
- 이론보다는 실습 중심
- 매일 조금씩이라도 코딩하기
- 완벽하지 않아도 일단 만들어보기
- 커뮤니티에서 질문하기

**💡 초보자 팁:**
- 에러가 나도 포기하지 마세요
- 다른 사람의 코드를 참고해보세요
- 작은 성공을 축하하세요

더 구체적인 질문이 있으시면 언제든 말씀해주세요! 😊"""

def generate_intermediate_response(message: str, topics: List[str]) -> str:
    """중급자용 답변 생성"""
    if 'web_development' in topics:
        return """🚀 **웹 개발 중급자 가이드**

**🎯 목표: 실무 수준의 웹 애플리케이션 개발**

**프론트엔드 마스터하기 (4-6주)**
- **React/Vue/Angular**: 프레임워크 선택과 심화 학습
- **상태 관리**: Redux, Vuex, Context API
- **빌드 도구**: Webpack, Vite, Parcel
- **테스팅**: Jest, Cypress, Testing Library

**백엔드 개발 (6-8주)**
- **API 설계**: RESTful API, GraphQL
- **데이터베이스**: SQL (PostgreSQL) vs NoSQL (MongoDB)
- **인증/보안**: JWT, OAuth, HTTPS
- **성능 최적화**: 캐싱, 압축, CDN

**실무 프로젝트 아이디어**
- **블로그 시스템**: CRUD, 댓글, 태그 시스템
- **쇼핑몰**: 결제, 장바구니, 주문 관리
- **채팅 앱**: 실시간 통신, 파일 업로드
- **대시보드**: 차트, 데이터 시각화

**🛠️ 중급자 기술 스택**
- **프론트엔드**: React + TypeScript + Tailwind CSS
- **백엔드**: Node.js + Express + PostgreSQL
- **배포**: Docker + AWS/Vercel
- **모니터링**: Sentry, LogRocket

**📚 중급자 추천 자료**
- **실무**: Udemy 실무 프로젝트 강의
- **문서**: 공식 문서와 튜토리얼
- **커뮤니티**: GitHub 오픈소스 참여

**💡 중급자 팁**
- 코드 품질에 신경쓰기
- 테스트 코드 작성하기
- 성능 최적화 고려하기
- 보안 취약점 점검하기

**🚀 다음 단계**
- 아키텍처 설계 능력 향상
- 팀 협업 경험 쌓기
- DevOps와 CI/CD 학습
- 특정 분야 전문성 개발

실무에서 바로 써먹을 수 있는 수준으로 발전하세요! 💪"""

    elif 'python' in topics:
        return """🐍 **파이썬 중급자 가이드**

**🎯 목표: 실무 수준의 파이썬 개발**

**웹 개발 전문가 (4-6주)**
- **Django**: 풀스택 웹 프레임워크
- **Flask**: 가벼운 웹 프레임워크
- **FastAPI**: 고성능 API 프레임워크
- **데이터베이스**: ORM, 마이그레이션

**데이터 분석 전문가 (4-6주)**
- **pandas**: 데이터 조작과 분석
- **numpy**: 수치 계산과 배열 처리
- **matplotlib/seaborn**: 데이터 시각화
- **Jupyter**: 인터랙티브 개발 환경

**자동화 전문가 (3-4주)**
- **웹 스크래핑**: BeautifulSoup, Scrapy
- **API 연동**: requests, aiohttp
- **파일 처리**: os, pathlib, shutil
- **스케줄링**: APScheduler, Celery

**실무 프로젝트 아이디어**
- **웹 애플리케이션**: Django로 블로그/쇼핑몰
- **데이터 분석**: 판매 데이터 분석 대시보드
- **자동화**: 엑셀 보고서 자동 생성
- **API 서비스**: FastAPI로 REST API 구축

**🛠️ 중급자 기술 스택**
- **웹 개발**: Django + PostgreSQL + Redis
- **데이터 분석**: pandas + matplotlib + Jupyter
- **자동화**: requests + BeautifulSoup + APScheduler
- **배포**: Docker + AWS/GCP

**📚 중급자 추천 자료**
- **실무**: Real Python, Python Tricks
- **프로젝트**: GitHub 오픈소스 참여
- **커뮤니티**: PyCon, Python Korea

**💡 중급자 팁**
- PEP 8 코딩 스타일 준수
- 가상환경과 패키지 관리
- 로깅과 에러 처리
- 성능 프로파일링

**🚀 다음 단계**
- 특정 분야 전문성 개발
- 오픈소스 기여하기
- 기술 블로그 운영하기
- 컨퍼런스 발표하기

파이썬의 진짜 매력을 느껴보세요! 🚀"""

    else:
        return f"""🚀 **'{message}'에 대한 중급자 가이드**

좋은 질문이네요! 중급자 수준에서 더 깊이 있게 설명해드리겠습니다.

**🎯 중급자가 집중해야 할 것들:**
- 실무 수준의 프로젝트 개발
- 코드 품질과 성능 최적화
- 아키텍처 설계 능력
- 팀 협업과 코드 리뷰

**🛠️ 중급자 기술 스택:**
- 프레임워크와 라이브러리 활용
- 데이터베이스 설계와 최적화
- API 설계와 문서화
- 테스트 코드 작성

**📚 중급자 추천 자료:**
- 공식 문서와 튜토리얼
- 실무 프로젝트 강의
- 오픈소스 코드 분석
- 기술 블로그와 컨퍼런스

**💡 중급자 팁:**
- 코드 리뷰 문화 참여하기
- 성능 모니터링과 최적화
- 보안 취약점 점검하기
- 지속적인 학습과 업데이트

더 구체적인 기술적 질문이 있으시면 언제든 말씀해주세요! 💪"""

def generate_advanced_response(message: str, topics: List[str]) -> str:
    """고급자용 답변 생성"""
    if 'web_development' in topics:
        return """🏗️ **웹 개발 고급자 가이드**

**🎯 목표: 엔터프라이즈급 웹 시스템 설계 및 운영**

**아키텍처 설계 (고급)**
- **마이크로서비스**: 서비스 분리, API 게이트웨이
- **이벤트 기반 아키텍처**: 메시지 큐, 이벤트 스토어
- **CQRS**: 명령과 조회 분리
- **도메인 주도 설계**: DDD, 헥사고날 아키텍처

**성능 최적화 (고급)**
- **프론트엔드**: 코드 스플리팅, 트리 쉐이킹, 번들 최적화
- **백엔드**: 캐싱 전략, 데이터베이스 최적화, CDN
- **모니터링**: APM, 로그 분석, 메트릭 수집
- **부하 테스트**: 성능 벤치마킹, 병목점 식별

**DevOps & 인프라 (고급)**
- **컨테이너화**: Docker, Kubernetes
- **CI/CD**: 자동화 파이프라인, 블루-그린 배포
- **클라우드**: AWS/GCP/Azure 고급 서비스
- **보안**: OWASP, 보안 스캔, 취약점 관리

**고급 기술 스택**
- **프론트엔드**: Next.js + TypeScript + GraphQL
- **백엔드**: Node.js + NestJS + PostgreSQL + Redis
- **인프라**: Kubernetes + Docker + Terraform
- **모니터링**: Prometheus + Grafana + ELK Stack

**🏢 엔터프라이즈 프로젝트**
- **대규모 시스템**: 수백만 사용자 지원
- **고가용성**: 99.9% 이상 가동률
- **확장성**: 수평/수직 확장 전략
- **보안**: 엔터프라이즈급 보안 정책

**📚 고급자 추천 자료**
- **아키텍처**: Clean Architecture, Microservices Patterns
- **성능**: High Performance Browser Networking
- **DevOps**: The Phoenix Project, Site Reliability Engineering
- **컨퍼런스**: AWS re:Invent, Google I/O, Microsoft Build

**💡 고급자 팁**
- 시스템 전체를 보는 관점
- 비즈니스 요구사항과 기술의 균형
- 팀 리딩과 멘토링
- 기술 트렌드 파악과 적용

**🚀 리더십 단계**
- 기술 아키텍트 역할
- 팀 빌딩과 멘토링
- 기술 전략 수립
- 컨퍼런스 발표와 기술 공유

엔터프라이즈급 시스템을 설계하고 운영하는 전문가가 되세요! 🏆"""

    elif 'python' in topics:
        return """🐍 **파이썬 고급자 가이드**

**🎯 목표: 파이썬 전문가 및 기술 리더**

**고급 파이썬 기술**
- **메타프로그래밍**: 데코레이터, 메타클래스, 디스크립터
- **비동기 프로그래밍**: asyncio, aiohttp, FastAPI
- **성능 최적화**: 프로파일링, C 확장, Cython
- **메모리 관리**: 가비지 컬렉션, 메모리 누수 방지

**고급 프레임워크**
- **Django 고급**: 커스텀 관리자, 미들웨어, 시그널
- **FastAPI**: 의존성 주입, 백그라운드 태스크
- **Celery**: 분산 태스크 큐, 워커 관리
- **Pydantic**: 데이터 검증, 직렬화

**데이터 사이언스 고급**
- **머신러닝**: scikit-learn, TensorFlow, PyTorch
- **데이터 파이프라인**: Apache Airflow, Luigi
- **빅데이터**: Apache Spark, Dask
- **MLOps**: 모델 배포, 모니터링, A/B 테스트

**시스템 설계 (고급)**
- **아키텍처 패턴**: 레이어드, 헥사고날, CQRS
- **분산 시스템**: 메시지 큐, 이벤트 소싱
- **캐싱 전략**: Redis, Memcached, CDN
- **데이터베이스**: 샤딩, 복제, 파티셔닝

**고급 기술 스택**
- **웹**: FastAPI + PostgreSQL + Redis + Celery
- **데이터**: pandas + scikit-learn + Jupyter
- **인프라**: Docker + Kubernetes + Terraform
- **모니터링**: Prometheus + Grafana + ELK

**🏢 엔터프라이즈 프로젝트**
- **대규모 웹 서비스**: 수백만 사용자 지원
- **데이터 파이프라인**: 실시간 데이터 처리
- **ML 시스템**: 모델 서빙, A/B 테스트
- **마이크로서비스**: 서비스 분리, API 게이트웨이

**📚 고급자 추천 자료**
- **파이썬**: Fluent Python, Effective Python
- **아키텍처**: Building Microservices, Designing Data-Intensive Applications
- **ML**: Hands-On Machine Learning, The Elements of Statistical Learning
- **컨퍼런스**: PyCon, Strata, O'Reilly AI Conference

**💡 고급자 팁**
- 코드 품질과 성능의 균형
- 팀 코드베이스 관리
- 기술 부채 관리
- 지속적인 학습과 혁신

**🚀 리더십 단계**
- 기술 아키텍트 역할
- 오픈소스 기여와 리딩
- 기술 블로그와 컨퍼런스 발표
- 팀 멘토링과 기술 전파

파이썬 생태계의 리더가 되세요! 🏆"""

    else:
        return f"""🏗️ **'{message}'에 대한 고급자 가이드**

훌륭한 질문이네요! 고급자 수준에서 깊이 있게 분석해드리겠습니다.

**🎯 고급자가 다루는 영역:**
- 시스템 아키텍처 설계
- 성능 최적화와 확장성
- 보안과 안정성
- 팀 리딩과 기술 전파

**🏗️ 고급 기술 스택:**
- 마이크로서비스 아키텍처
- 분산 시스템 설계
- 고성능 데이터베이스 최적화
- 클라우드 네이티브 개발

**📚 고급자 추천 자료:**
- 시스템 설계 관련 서적
- 아키텍처 패턴과 베스트 프랙티스
- 성능 튜닝과 최적화 가이드
- 기술 컨퍼런스와 논문

**💡 고급자 팁:**
- 전체 시스템을 보는 관점
- 비즈니스 요구사항과 기술의 균형
- 팀 협업과 코드 리뷰 문화
- 지속적인 기술 혁신

**🚀 리더십 역할:**
- 기술 아키텍트로서의 역할
- 팀 멘토링과 기술 전파
- 오픈소스 기여와 커뮤니티 리딩
- 기술 전략 수립과 의사결정

더 구체적인 아키텍처나 설계 관련 질문이 있으시면 언제든 말씀해주세요! 🏆"""

def generate_multi_topic_response(topics: List[str], question_types: List[str], requests: List[str], user_level: str) -> str:
    """다중 주제 통합 답변 생성"""
    try:
        response_parts = []
        
        # 주제 간 연관성 분석
        topic_combinations = {
            ('python', 'web_development'): '파이썬 웹 개발',
            ('javascript', 'web_development'): '자바스크립트 웹 개발',
            ('python', 'machine_learning'): '파이썬 머신러닝',
            ('python', 'data_analysis'): '파이썬 데이터 분석',
            ('web_development', 'mobile_development'): '웹-모바일 통합 개발',
            ('machine_learning', 'data_analysis'): 'ML-데이터 분석 통합'
        }
        
        # 주제 조합 확인
        topic_key = tuple(sorted(topics[:2]))  # 최대 2개 주제만 고려
        if topic_key in topic_combinations:
            combination_name = topic_combinations[topic_key]
            response_parts.append(f"🎯 **{combination_name} 통합 가이드**\n")
            
            # 통합 학습 로드맵
            if 'python' in topics and 'web_development' in topics:
                response_parts.append("""
**🐍 파이썬 웹 개발 통합 로드맵**

**1단계: 파이썬 기초 (2-3주)**
- 기본 문법과 자료구조
- 함수와 클래스 개념
- 모듈과 패키지 관리

**2단계: 웹 프레임워크 (3-4주)**
- Django: 풀스택 웹 프레임워크
- Flask: 가벼운 마이크로 프레임워크
- FastAPI: 고성능 API 프레임워크

**3단계: 데이터베이스 연동 (2-3주)**
- SQLAlchemy ORM
- PostgreSQL/MySQL 연동
- Redis 캐싱

**4단계: 배포와 운영 (2-3주)**
- Docker 컨테이너화
- AWS/GCP 클라우드 배포
- CI/CD 파이프라인 구축

**💡 통합 프로젝트 아이디어**
- 블로그 + 데이터 분석 대시보드
- 쇼핑몰 + 추천 시스템
- 소셜미디어 + 감정 분석""")
            
            elif 'javascript' in topics and 'web_development' in topics:
                response_parts.append("""
**⚡ 자바스크립트 웹 개발 통합 로드맵**

**1단계: 자바스크립트 기초 (2-3주)**
- ES6+ 문법과 모던 자바스크립트
- DOM 조작과 이벤트 처리
- 비동기 프로그래밍 (Promise, async/await)

**2단계: 프론트엔드 프레임워크 (4-6주)**
- React: 컴포넌트 기반 UI
- Vue.js: 점진적 프레임워크
- Angular: 엔터프라이즈급 프레임워크

**3단계: 백엔드 개발 (3-4주)**
- Node.js + Express
- RESTful API 설계
- GraphQL API 구현

**4단계: 풀스택 통합 (3-4주)**
- 프론트엔드-백엔드 연동
- 상태 관리 (Redux, Vuex)
- 실시간 통신 (WebSocket)

**💡 통합 프로젝트 아이디어**
- 실시간 채팅 애플리케이션
- 협업 도구 (Trello 클론)
- 전자상거래 플랫폼""")
            
            else:
                # 일반적인 다중 주제 답변
                response_parts.append(f"""
**📚 {combination_name} 학습 가이드**

각 주제별로 체계적인 학습 계획을 세워보겠습니다:

""")
                for topic in topics:
                    if topic == 'python':
                        response_parts.append("**🐍 파이썬**: 기본 문법 → 라이브러리 → 프로젝트")
                    elif topic == 'javascript':
                        response_parts.append("**⚡ 자바스크립트**: ES6+ → 프레임워크 → 풀스택")
                    elif topic == 'web_development':
                        response_parts.append("**🌐 웹 개발**: HTML/CSS → 프론트엔드 → 백엔드")
                    elif topic == 'machine_learning':
                        response_parts.append("**🤖 머신러닝**: 수학 기초 → 알고리즘 → 실습")
                    elif topic == 'data_analysis':
                        response_parts.append("**📊 데이터 분석**: 통계 → 시각화 → 인사이트")
        
        else:
            # 개별 주제별 답변
            response_parts.append("**📚 다중 주제 학습 가이드**\n")
            for topic in topics:
                if topic == 'python':
                    response_parts.append("**🐍 파이썬**: 실무 중심의 체계적 학습")
                elif topic == 'javascript':
                    response_parts.append("**⚡ 자바스크립트**: 모던 웹 개발 마스터")
                elif topic == 'web_development':
                    response_parts.append("**🌐 웹 개발**: 풀스택 개발자 성장")
                elif topic == 'machine_learning':
                    response_parts.append("**🤖 머신러닝**: AI 시대의 핵심 기술")
                elif topic == 'data_analysis':
                    response_parts.append("**📊 데이터 분석**: 데이터 기반 의사결정")
        
        # 사용자 수준별 추가 조언
        if user_level == 'beginner':
            response_parts.append("\n**🎯 초보자 팁**: 한 번에 하나씩 집중해서 학습하세요!")
        elif user_level == 'advanced':
            response_parts.append("\n**🚀 고급자 팁**: 주제 간 연관성을 활용한 통합 프로젝트를 추천합니다!")
        
        return "\n".join(response_parts)
        
    except Exception as e:
        logger.error(f"다중 주제 답변 생성 오류: {e}")
        return "다중 주제에 대한 답변을 생성하는 중 오류가 발생했습니다."

def enhance_response_quality(response: str, analysis: Dict[str, Any], user_level: str) -> str:
    """답변 품질 향상"""
    try:
        enhanced_response = response
        
        # 사용자 수준에 따른 조정
        if user_level == 'beginner':
            # 초보자용: 더 간단하고 친근한 표현
            enhanced_response = enhanced_response.replace("고급", "중급")
            enhanced_response = enhanced_response.replace("복잡한", "단계별")
        elif user_level == 'advanced':
            # 고급자용: 더 전문적이고 깊이 있는 내용 추가
            enhanced_response += "\n\n**🔬 심화 학습 자료**\n- 공식 문서와 소스코드 분석\n- 오픈소스 프로젝트 기여\n- 기술 블로그 작성과 발표"
        
        # 감정에 따른 마무리 메시지 추가
        detected_emotion = analysis.get('detected_emotion', 'neutral')
        if detected_emotion == 'frustrated':
            enhanced_response += "\n\n💪 포기하지 마세요! 차근차근 따라하시면 분명 성공할 수 있습니다!"
        elif detected_emotion == 'curious':
            enhanced_response += "\n\n🔍 더 궁금한 점이 있으시면 언제든 질문해주세요!"
        
        # 긴급도에 따른 추가 정보
        if analysis.get('is_urgent', False):
            enhanced_response += "\n\n⚡ 긴급한 상황이시라면 핵심 포인트만 먼저 확인하시고, 나중에 자세히 학습하시는 것을 추천합니다."
        
        return enhanced_response
        
    except Exception as e:
        logger.error(f"답변 품질 향상 오류: {e}")
        return response

def generate_complex_response(message: str, topics: List[str], requests: List[str]) -> str:
    """복잡한 질문에 대한 체계적인 답변"""
    response_parts = []
    
    # 인사 및 이해 확인
    response_parts.append("좋은 질문이네요! 여러 가지 주제에 대해 궁금하시군요. 체계적으로 답변해드리겠습니다.")
    
    # 주제별 답변
    if 'python' in topics and 'javascript' in topics:
        response_parts.append("""
🐍 **파이썬 vs 자바스크립트 선택 가이드**

**파이썬을 먼저 배우는 것을 추천합니다:**
- 문법이 간단하고 직관적
- 다양한 분야(웹, 데이터분석, AI)에 활용 가능
- 학습 곡선이 완만함

**자바스크립트는 그 다음에:**
- 웹 프론트엔드 필수 언어
- Node.js로 백엔드도 가능
- 풍부한 생태계와 라이브러리""")
    
    if 'machine_learning' in topics:
        response_parts.append("""
🤖 **머신러닝 학습 로드맵**

**기초 단계:**
1. 수학 기초 (선형대수, 통계, 확률)
2. 파이썬 프로그래밍
3. 데이터 처리 (pandas, numpy)

**중급 단계:**
4. 머신러닝 라이브러리 (scikit-learn)
5. 데이터 시각화 (matplotlib, seaborn)
6. 실습 프로젝트""")
    
    if 'web_development' in topics:
        response_parts.append("""
🌐 **웹 개발 완전 가이드**

**웹 개발이란?**
- 웹사이트나 웹 애플리케이션을 만드는 과정
- 프론트엔드(사용자 화면)와 백엔드(서버 로직)로 구분

**📚 학습 순서 (총 16-20주)**

**1단계: 기초 (4-5주)**
- HTML: 웹 페이지 구조 설계
- CSS: 스타일링과 레이아웃 (Flexbox, Grid)
- JavaScript: 동적 기능과 상호작용

**2단계: 프론트엔드 (6-8주)**
- 프레임워크 선택: React (추천), Vue, Angular
- 상태 관리: Redux, Context API
- 반응형 디자인과 모바일 최적화
- 빌드 도구: Webpack, Vite

**3단계: 백엔드 (6-8주)**
- 서버 언어 선택: Node.js (JavaScript) 또는 Python (Django/Flask)
- API 설계: RESTful, GraphQL
- 데이터베이스: MySQL, PostgreSQL, MongoDB
- 인증과 보안: JWT, OAuth

**4단계: 배포와 운영 (2-3주)**
- 클라우드 플랫폼: AWS, Vercel, Netlify
- CI/CD 파이프라인
- 성능 최적화

**🛠️ 추천 기술 스택**

**초보자용:**
- HTML + CSS + JavaScript
- 간단한 정적 사이트부터 시작

**프론트엔드 전문가:**
- React + TypeScript + Tailwind CSS
- Next.js (풀스택 프레임워크)

**백엔드 전문가:**
- Node.js + Express + MongoDB
- 또는 Python + Django + PostgreSQL

**풀스택 개발자:**
- MERN 스택: MongoDB + Express + React + Node.js
- 또는 JAMstack: JavaScript + APIs + Markup

**💡 실습 프로젝트 아이디어**

**초급 (1-2주):**
- 개인 포트폴리오 사이트
- 간단한 계산기
- 할 일 목록 앱

**중급 (3-4주):**
- 블로그 시스템
- 쇼핑몰 (기본 기능)
- 채팅 애플리케이션

**고급 (6-8주):**
- 소셜 미디어 플랫폼
- 실시간 협업 도구
- 복잡한 대시보드

**📖 추천 학습 자료**

**무료:**
- MDN Web Docs (공식 문서)
- FreeCodeCamp (실습 중심)
- Codecademy (인터랙티브)

**유료:**
- Udemy (실무 프로젝트)
- Coursera (대학 강의)
- Pluralsight (전문가 과정)

**커뮤니티:**
- Stack Overflow (질문/답변)
- GitHub (오픈소스 참여)
- Reddit r/webdev (토론)

**🚀 취업 준비**

**포트폴리오 구성:**
- 3-5개의 완성된 프로젝트
- GitHub에 코드 공개
- 라이브 데모 사이트 운영

**면접 준비:**
- 기술적 질문 (알고리즘, 자료구조)
- 프로젝트 설명 능력
- 문제 해결 과정 설명

웹 개발은 창의적이고 실용적인 기술로, 지속적인 학습과 실습이 중요합니다!""")
    
    if 'data_analysis' in topics:
        response_parts.append("""
📊 **데이터 분석 자동화 솔루션**

**엑셀 자동화 스택:**
- pandas: 데이터 읽기/쓰기 및 처리
- openpyxl: 복잡한 엑셀 조작
- xlwings: 엑셀과 Python 연동

**시각화 자동화:**
- matplotlib/seaborn: 정적 차트
- plotly: 인터랙티브 시각화
- bokeh: 대용량 데이터 시각화

**웹 대시보드 옵션:**
- Streamlit: 가장 빠른 프로토타이핑
- Dash: Plotly 기반 고급 대시보드
- Flask + Chart.js: 완전 커스텀 솔루션
- Jupyter + Voila: 노트북을 대시보드로""")
    
    # 통합 학습 조언
    if 'integration_advice' in requests:
        response_parts.append("""
🔄 **통합 학습 전략**

**단계별 접근:**
1. **기초 다지기**: 파이썬 → 웹 개발 기초
2. **전문화**: 관심 분야 집중 (웹 or AI)
3. **통합**: 선택한 분야에서 다른 기술 활용

**실용적 조합:**
- 웹 개발 + 데이터 시각화
- AI + 웹 API 개발
- 풀스택 개발 + 데이터 분석""")
    
    # 학습 계획 제안
    response_parts.append("""
📚 **추천 학습 계획**

**3개월 계획:**
- 1개월: 파이썬 기초 + 웹 개발 기초
- 2개월: 선택한 분야 심화 학습
- 3개월: 프로젝트 실습 + 포트폴리오

**학습 리소스:**
- 온라인 강의: Coursera, Udemy, 인프런
- 실습: GitHub 프로젝트 참여
- 커뮤니티: Stack Overflow, 개발자 모임""")
    
    return "\n".join(response_parts)

def generate_topic_specific_response(topics: List[str], question_types: List[str], requests: List[str]) -> str:
    """주제별 전문 답변"""
    responses = []
    
    # 사용자 수준 분석 (요청에서 추출)
    user_level = 'intermediate'  # 기본값
    if 'learning_guidance' in requests or 'getting_started' in requests:
        user_level = 'beginner'
    elif any(req in requests for req in ['architecture_guidance', 'performance_optimization']):
        user_level = 'advanced'
    
    for topic in topics:
        if topic == 'python':
            if user_level == 'beginner':
                responses.append(generate_beginner_response("파이썬 학습", ['python']))
            elif user_level == 'advanced':
                responses.append(generate_advanced_response("파이썬 학습", ['python']))
            else:
                responses.append(generate_intermediate_response("파이썬 학습", ['python']))
        
        elif topic == 'javascript':
            responses.append("""
⚡ **자바스크립트 학습 가이드**

**핵심 개념:**
- ES6+ 문법 (화살표 함수, 구조분해할당)
- DOM 조작
- 비동기 프로그래밍 (Promise, async/await)

**프레임워크 선택:**
- React: 컴포넌트 기반 개발
- Vue: 점진적 학습 가능
- Angular: 엔터프라이즈급 애플리케이션

**실습 프로젝트:**
- Todo 앱 만들기
- 날씨 앱 개발
- 간단한 게임 제작""")
        
        elif topic == 'machine_learning':
            responses.append("""
🤖 **머신러닝 입문 가이드**

**수학 기초:**
- 선형대수: 벡터, 행렬 연산
- 통계: 평균, 분산, 확률분포
- 미적분: 기울기, 최적화

**실습 도구:**
- Python: scikit-learn, pandas
- 시각화: matplotlib, seaborn
- 딥러닝: TensorFlow, PyTorch

**프로젝트 아이디어:**
- 주가 예측 모델
- 이미지 분류기
- 추천 시스템""")
        
        elif topic == 'data_analysis':
            responses.append("""
📊 **데이터 분석 자동화 가이드**

**엑셀 자동화:**
- pandas로 엑셀 파일 읽기/쓰기
- openpyxl로 복잡한 엑셀 조작
- 자동화 스크립트 작성

**데이터 처리:**
- 데이터 정제 및 변환
- 통계 분석 및 집계
- 이상치 탐지 및 처리

**시각화 자동화:**
- matplotlib/seaborn으로 차트 생성
- plotly로 인터랙티브 대시보드
- 자동 리포트 생성

**웹 대시보드:**
- Streamlit: 빠른 프로토타이핑
- Dash: 고급 대시보드
- Flask + Chart.js: 커스텀 솔루션""")
        
        elif topic == 'web_development':
            if user_level == 'beginner':
                responses.append(generate_beginner_response("웹 개발 학습", ['web_development']))
            elif user_level == 'advanced':
                responses.append(generate_advanced_response("웹 개발 학습", ['web_development']))
            else:
                responses.append(generate_intermediate_response("웹 개발 학습", ['web_development']))
    
    return "\n".join(responses)

def generate_general_response(message: str, question_types: List[str]) -> str:
    """일반적인 답변"""
    message_lower = message.lower()
    
    # 구체적인 질문에 대한 실제 답변 생성
    if any(word in message_lower for word in ['파이썬', 'python']):
        return """🐍 **파이썬에 대해 알려드리겠습니다!**

**파이썬이란?**
- 간단하고 읽기 쉬운 문법의 프로그래밍 언어
- 다양한 분야에서 활용되는 범용 언어
- 초보자도 쉽게 배울 수 있는 언어

**파이썬의 장점:**
- 문법이 직관적이고 간단함
- 풍부한 라이브러리와 프레임워크
- 웹 개발, 데이터 분석, AI/ML 등 다양한 분야 활용
- 활발한 커뮤니티와 풍부한 학습 자료

**학습 추천 순서:**
1. 기본 문법 (변수, 조건문, 반복문)
2. 함수와 클래스
3. 파일 입출력
4. 라이브러리 사용법
5. 프로젝트 실습

**추천 학습 자료:**
- Python 공식 튜토리얼
- 온라인 코딩 플랫폼 (Codecademy, Coursera)
- 실습 프로젝트 (간단한 계산기, 웹 크롤러)

더 구체적인 질문이 있으시면 언제든 말씀해주세요!"""
    
    elif any(word in message_lower for word in ['자바스크립트', 'javascript', 'js']):
        return """🟨 **자바스크립트에 대해 알려드리겠습니다!**

**자바스크립트란?**
- 웹 브라우저에서 실행되는 프로그래밍 언어
- 프론트엔드 개발의 핵심 언어
- Node.js로 백엔드 개발도 가능

**자바스크립트의 특징:**
- 동적 타입 언어 (타입을 미리 선언하지 않음)
- 이벤트 기반 프로그래밍
- 비동기 처리 지원 (Promise, async/await)
- 풍부한 생태계와 프레임워크

**주요 사용 분야:**
- 웹 프론트엔드 (React, Vue, Angular)
- 웹 백엔드 (Node.js, Express)
- 모바일 앱 (React Native, Ionic)
- 데스크톱 앱 (Electron)

**학습 로드맵:**
1. 기본 문법 (ES6+)
2. DOM 조작
3. 이벤트 처리
4. 비동기 프로그래밍
5. 프레임워크 학습

**추천 학습 자료:**
- MDN Web Docs
- JavaScript.info
- 실습 프로젝트 (할 일 목록, 계산기)

웹 개발에 관심이 있으시다면 자바스크립트는 필수입니다!"""
    
    elif any(word in message_lower for word in ['웹개발', '웹 개발', 'web development']):
        return """🌐 **웹 개발에 대해 알려드리겠습니다!**

**웹 개발이란?**
- 웹사이트나 웹 애플리케이션을 만드는 과정
- 프론트엔드와 백엔드로 구분

**프론트엔드 (Frontend):**
- 사용자가 보는 화면 부분
- HTML, CSS, JavaScript 사용
- React, Vue, Angular 등 프레임워크 활용

**백엔드 (Backend):**
- 서버에서 처리되는 로직
- 데이터베이스 관리
- API 개발
- Python, Node.js, Java 등 사용

**웹 개발 학습 순서:**
1. HTML (구조)
2. CSS (스타일링)
3. JavaScript (동작)
4. 프레임워크 선택
5. 백엔드 기술
6. 데이터베이스
7. 배포 및 운영

**추천 기술 스택:**
- **초보자**: HTML + CSS + JavaScript
- **프론트엔드**: React + TypeScript
- **백엔드**: Node.js + Express 또는 Python + Django
- **데이터베이스**: MySQL, PostgreSQL, MongoDB

**실습 프로젝트 아이디어:**
- 개인 포트폴리오 사이트
- 블로그 시스템
- 할 일 관리 앱
- 간단한 쇼핑몰

웹 개발은 창의적이고 실용적인 기술입니다!"""
    
    elif any(word in message_lower for word in ['머신러닝', 'machine learning', 'ml']):
        return """🤖 **머신러닝에 대해 알려드리겠습니다!**

**머신러닝이란?**
- 컴퓨터가 데이터를 통해 스스로 학습하는 기술
- 인공지능의 핵심 기술 중 하나
- 패턴 인식과 예측에 특화

**머신러닝의 종류:**
- **지도학습**: 정답이 있는 데이터로 학습
- **비지도학습**: 정답 없이 패턴 찾기
- **강화학습**: 시행착오를 통해 학습

**주요 알고리즘:**
- 선형 회귀, 로지스틱 회귀
- 결정 트리, 랜덤 포레스트
- SVM, K-means
- 신경망, 딥러닝

**학습 로드맵:**
1. 수학 기초 (통계, 선형대수)
2. Python 프로그래밍
3. 데이터 분석 (Pandas, NumPy)
4. 머신러닝 라이브러리 (Scikit-learn)
5. 딥러닝 (TensorFlow, PyTorch)

**실습 프로젝트:**
- 주가 예측 모델
- 이미지 분류
- 텍스트 감정 분석
- 추천 시스템

**추천 학습 자료:**
- Coursera Machine Learning (Andrew Ng)
- Kaggle Learn
- Hands-On Machine Learning

머신러닝은 데이터의 힘을 활용하는 흥미로운 분야입니다!"""
    
    elif any(word in message_lower for word in ['데이터분석', '데이터 분석', 'data analysis']):
        return """📊 **데이터 분석에 대해 알려드리겠습니다!**

**데이터 분석이란?**
- 데이터에서 의미 있는 정보를 추출하는 과정
- 비즈니스 인사이트 도출
- 의사결정 지원

**데이터 분석 과정:**
1. **데이터 수집**: 다양한 소스에서 데이터 수집
2. **데이터 정제**: 오류 수정, 결측값 처리
3. **데이터 탐색**: 패턴과 트렌드 발견
4. **데이터 모델링**: 통계적 모델 구축
5. **결과 해석**: 인사이트 도출 및 시각화

**주요 도구:**
- **Python**: Pandas, NumPy, Matplotlib
- **R**: 통계 분석에 특화
- **SQL**: 데이터베이스 쿼리
- **Excel**: 기본적인 분석 도구

**데이터 분석가 스킬:**
- 통계학 지식
- 프로그래밍 능력
- 비즈니스 이해도
- 시각화 기술
- 커뮤니케이션 능력

**실습 프로젝트:**
- 판매 데이터 분석
- 고객 행동 분석
- 웹사이트 트래픽 분석
- 소셜미디어 감정 분석

**추천 학습 자료:**
- DataCamp
- Kaggle Learn
- 실무 데이터셋 활용

데이터 분석은 데이터의 숨겨진 가치를 발견하는 기술입니다!"""
    
    elif any(word in message_lower for word in ['안녕', 'hello', 'hi', '하이']):
        return """👋 **안녕하세요! CORBU.AI입니다!**

저는 여러분의 코딩과 개발을 도와드리는 AI 어시스턴트입니다.

**제가 도와드릴 수 있는 것들:**
- 🐍 파이썬 프로그래밍
- 🟨 자바스크립트 개발
- 🌐 웹 개발 (프론트엔드/백엔드)
- 🤖 머신러닝과 AI
- 📊 데이터 분석
- 💻 일반적인 프로그래밍 질문

**어떤 질문이든 편하게 해주세요!**
- 구체적인 코드 문제
- 학습 방향 조언
- 프로젝트 아이디어
- 기술 스택 선택

무엇을 도와드릴까요? 😊"""
    
    elif any(word in message_lower for word in ['도움', 'help', '도와줘']):
        return """🆘 **CORBU.AI 도움말**

**제가 도와드릴 수 있는 것들:**

**📚 프로그래밍 언어**
- Python, JavaScript, Java, C++
- 문법, 개념, 실습 예제

**🌐 웹 개발**
- HTML, CSS, JavaScript
- React, Vue, Angular
- Node.js, Express, Django

**🤖 AI/ML**
- 머신러닝 알고리즘
- 딥러닝 프레임워크
- 데이터 전처리

**📊 데이터 분석**
- Pandas, NumPy
- 시각화 (Matplotlib, Seaborn)
- 통계 분석

**💡 학습 조언**
- 학습 로드맵
- 프로젝트 아이디어
- 기술 스택 선택

**🔧 문제 해결**
- 코드 디버깅
- 에러 해결
- 성능 최적화

**질문하는 방법:**
- 구체적으로 질문해주세요
- 코드가 있다면 함께 보여주세요
- 어떤 부분이 궁금한지 명확히 해주세요

예: "파이썬으로 웹 크롤링을 하고 싶은데 어떻게 시작해야 할까요?"

언제든지 질문해주세요! 😊"""
    
    else:
        # 기본적으로 질문을 분석해서 답변 생성
        if 'explanation_request' in question_types:
            return f"""🤔 **'{message}'에 대해 설명해드리겠습니다!**

좋은 질문이네요! 더 구체적으로 어떤 부분에 대해 알고 싶으신지 말씀해주시면, 자세히 설명해드리겠습니다.

**구체적으로 질문해주시면:**
- 단계별 설명
- 예제 코드
- 실습 방법
- 관련 자료

을 제공해드릴 수 있습니다!

예를 들어:
- "파이썬 함수를 어떻게 만드나요?"
- "React 컴포넌트는 어떻게 작동하나요?"
- "데이터베이스 연결은 어떻게 하나요?"

어떤 부분이 궁금하신가요? 😊"""
        
        elif 'recommendation_request' in question_types:
            return f"""💡 **'{message}'에 대한 추천을 드리겠습니다!**

추천을 요청하셨군요! 어떤 분야에 관심이 있으신지 알려주시면, 적합한 옵션들을 제안해드리겠습니다.

**추천해드릴 수 있는 것들:**
- 📚 학습 자료와 강의
- 🛠️ 개발 도구와 프레임워크
- 💻 프로젝트 아이디어
- 🎯 학습 로드맵
- 📖 참고 서적

**구체적으로 말씀해주세요:**
- "웹 개발을 시작하려면 뭘 배워야 하나요?"
- "파이썬 라이브러리 중 어떤 걸 써야 할까요?"
- "프로젝트 아이디어가 필요해요"

어떤 분야에 관심이 있으신가요? 😊"""
        
        else:
            return f"""🤖 **'{message}'에 대해 답변해드리겠습니다!**

흥미로운 질문이네요! 더 구체적인 정보를 주시면 정확한 답변을 제공해드릴 수 있습니다.

**도움을 드릴 수 있는 분야:**
- 🐍 파이썬 프로그래밍
- 🟨 자바스크립트 개발  
- 🌐 웹 개발
- 🤖 머신러닝/AI
- 📊 데이터 분석
- 💻 일반적인 프로그래밍

**구체적으로 질문해주시면:**
- 상세한 설명
- 예제 코드
- 실습 방법
- 관련 자료

을 제공해드릴 수 있습니다!

예: "파이썬으로 웹사이트를 만드는 방법을 알고 싶어요"

어떤 부분이 궁금하신가요? 😊"""

# AI 답변 생성 함수
def generate_ai_response(message: str, session_id: str = None) -> str:
    """AI를 사용하여 실제 답변 생성"""
    try:
        # 메시지 분석 및 전처리
        analyzed_message = analyze_complex_message(message)
        
        # OpenAI API 키 확인
        openai_api_key = os.getenv('OPENAI_API_KEY')
        
        if not openai_api_key or openai_api_key == 'your_openai_api_key_here':
            # API 키가 없으면 고급 기본 답변 생성
            return generate_advanced_fallback_response(message, analyzed_message, session_id)
        
        # OpenAI API 호출
        headers = {
            'Authorization': f'Bearer {openai_api_key}',
            'Content-Type': 'application/json'
        }
        
        # 시스템 프롬프트 개선
        system_prompt = f"""당신은 CORBU.AI라는 전문적이고 도움이 되는 AI 어시스턴트입니다.

사용자 메시지 분석 결과:
- 주요 주제: {analyzed_message.get('topics', [])}
- 질문 유형: {analyzed_message.get('question_types', [])}
- 복잡도: {analyzed_message.get('complexity', 'medium')}
- 요청 사항: {analyzed_message.get('requests', [])}

지침:
1. 사용자의 질문을 정확히 이해하고 구체적이고 실용적인 답변을 제공하세요
2. 복잡한 질문의 경우 단계별로 체계적으로 설명하세요
3. 관련된 추가 정보나 팁도 함께 제공하세요
4. 한국어로 자연스럽고 친근하게 대화하세요
5. 사용자의 수준에 맞는 설명을 제공하세요"""

        data = {
            'model': 'gpt-3.5-turbo',
            'messages': [
                {
                    'role': 'system',
                    'content': system_prompt
                },
                {
                    'role': 'user',
                    'content': message
                }
            ],
            'max_tokens': 800,
            'temperature': 0.7
        }
        
        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers=headers,
            json=data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            ai_response = result['choices'][0]['message']['content'].strip()
            
            # 학습 시스템에 상호작용 기록
            if session_id:
                learning_system.learn_from_interaction(session_id, message, ai_response, 
                                                     ai_analyzer.analyze_emotion(message),
                                                     ai_analyzer.analyze_intent(message))
            
            return ai_response
        else:
            logger.error(f"OpenAI API 오류: {response.status_code}")
            return generate_advanced_fallback_response(message, analyzed_message, session_id)
            
    except Exception as e:
        logger.error(f"AI 응답 생성 오류: {e}")
        return generate_advanced_fallback_response(message, analyze_complex_message(message), session_id)

def generate_fallback_response(message: str, session_id: str = None) -> str:
    """API 키가 없을 때 사용하는 기본 답변 생성"""
    # 대화 컨텍스트 확인
    if session_id and session_id in conversation_context:
        context = conversation_context[session_id]
        # 이전 대화 주제 확인
        if 'last_topic' in context:
            return generate_contextual_response(message, context['last_topic'])
    
    # 간단한 키워드 기반 응답
    message_lower = message.lower()
    
    if any(word in message_lower for word in ['안녕', 'hello', 'hi']):
        return "안녕하세요! CORBU.AI입니다. 무엇을 도와드릴까요?"
    
    elif any(word in message_lower for word in ['날씨', 'weather']):
        return "죄송하지만 현재 날씨 정보를 제공할 수 없습니다. 날씨 앱이나 웹사이트를 확인해보세요."
    
    elif any(word in message_lower for word in ['최신', '뉴스', 'news', '현재', '오늘']):
        # 웹 검색이 필요한 질문
        return search_web(message)
    
    elif any(word in message_lower for word in ['시간', 'time']):
        current_time = datetime.now().strftime("%Y년 %m월 %d일 %H시 %M분")
        return f"현재 시간은 {current_time}입니다."
    
    elif any(word in message_lower for word in ['도움', 'help', '도와']):
        return """CORBU.AI에서 도움을 드릴 수 있는 기능들:

🔍 **정보 검색**: 다양한 주제에 대한 정보를 제공합니다
💬 **대화**: 자연스러운 대화를 나눌 수 있습니다  
📊 **분석**: 데이터 분석과 인사이트를 제공합니다
🎯 **추천**: 맞춤형 추천을 제공합니다

구체적으로 무엇을 도와드릴까요?"""
    
    elif any(word in message_lower for word in ['코딩', '프로그래밍', 'code', 'programming']):
        return """프로그래밍 관련 질문이군요! 다음과 같은 도움을 드릴 수 있습니다:

💻 **언어별 도움**: Python, JavaScript, Java, C++ 등
🐛 **디버깅**: 코드 오류 해결
📚 **학습**: 프로그래밍 개념 설명
🛠️ **도구**: 개발 도구 사용법

어떤 프로그래밍 언어나 주제에 대해 알고 싶으신가요?"""
    
    elif any(word in message_lower for word in ['파이썬', 'python']):
        return """파이썬으로 웹 개발하는 방법을 알려드리겠습니다!

🐍 **파이썬 웹 개발 프레임워크**:
• **Django**: 대규모 웹 애플리케이션에 적합
• **Flask**: 가볍고 유연한 마이크로 프레임워크
• **FastAPI**: 고성능 API 개발에 특화

🚀 **시작하기**:
1. Python 설치 (3.8 이상 권장)
2. 가상환경 생성: `python -m venv myenv`
3. 프레임워크 설치: `pip install django` 또는 `pip install flask`
4. 프로젝트 생성 및 개발 시작

📚 **학습 순서**:
1. Python 기초 문법
2. HTML/CSS/JavaScript 기초
3. 웹 프레임워크 선택 및 학습
4. 데이터베이스 연동 (SQLite, PostgreSQL)
5. 배포 (Heroku, AWS, Vercel 등)

어떤 프레임워크부터 시작하고 싶으신가요?"""
    
    elif any(word in message_lower for word in ['머신러닝', 'machine learning', 'ml', '인공지능', 'ai']):
        return """머신러닝 기초 개념을 설명해드리겠습니다!

🤖 **머신러닝이란?**
머신러닝은 컴퓨터가 데이터를 통해 패턴을 학습하고, 새로운 데이터에 대해 예측이나 분류를 수행하는 기술입니다.

📚 **머신러닝의 종류**:
• **지도학습**: 정답이 있는 데이터로 학습 (분류, 회귀)
• **비지도학습**: 정답 없이 패턴 찾기 (클러스터링, 차원축소)
• **강화학습**: 보상을 통해 학습 (게임, 로봇 제어)

🛠️ **주요 알고리즘**:
• **선형회귀**: 연속값 예측
• **로지스틱회귀**: 이진 분류
• **의사결정나무**: 규칙 기반 분류
• **랜덤포레스트**: 앙상블 학습
• **SVM**: 복잡한 분류 문제
• **K-means**: 클러스터링

🐍 **Python 라이브러리**:
• **scikit-learn**: 머신러닝 전용 라이브러리
• **pandas**: 데이터 처리
• **numpy**: 수치 계산
• **matplotlib**: 시각화

어떤 부분에 대해 더 자세히 알고 싶으신가요?"""
    
    elif any(word in message_lower for word in ['데이터분석', '데이터 분석', 'data analysis', '분석']):
        return """데이터 분석에 대해 알려드리겠습니다!

📊 **데이터 분석이란?**
데이터를 수집, 정제, 분석하여 의미 있는 인사이트를 도출하는 과정입니다.

🛠️ **주요 분석 도구**:
• **Python**: pandas, numpy, matplotlib, seaborn
• **R**: 통계 분석에 특화
• **SQL**: 데이터베이스 쿼리
• **Excel**: 기본적인 분석
• **Tableau**: 데이터 시각화
• **Power BI**: 비즈니스 인텔리전스

📈 **분석 유형**:
• **기술통계**: 평균, 중앙값, 표준편차 등
• **탐색적 데이터 분석(EDA)**: 데이터 패턴 발견
• **회귀분석**: 변수 간 관계 분석
• **시계열 분석**: 시간에 따른 변화 분석
• **머신러닝**: 예측 모델 구축

🎯 **분석 과정**:
1. 문제 정의
2. 데이터 수집
3. 데이터 정제
4. 탐색적 분석
5. 모델링
6. 결과 해석 및 시각화

어떤 분석 도구나 기법에 대해 더 알고 싶으신가요?"""
    
    elif any(word in message_lower for word in ['자바스크립트', 'javascript', 'js']):
        return """자바스크립트 웹 개발에 대해 알려드리겠습니다!

⚡ **자바스크립트란?**
웹 브라우저에서 실행되는 프로그래밍 언어로, 동적인 웹 페이지를 만들 수 있습니다.

🌐 **웹 개발 스택**:
• **Frontend**: HTML, CSS, JavaScript
• **Backend**: Node.js, Express.js
• **Database**: MongoDB, MySQL, PostgreSQL
• **Framework**: React, Vue.js, Angular

🚀 **주요 프레임워크**:
• **React**: 컴포넌트 기반 UI 라이브러리
• **Vue.js**: 점진적 프레임워크
• **Angular**: 완전한 프레임워크
• **Next.js**: React 기반 풀스택 프레임워크

📚 **학습 순서**:
1. JavaScript 기초 문법
2. DOM 조작
3. 비동기 프로그래밍 (Promise, async/await)
4. ES6+ 문법
5. 프레임워크 선택 및 학습
6. 백엔드 개발 (Node.js)
7. 데이터베이스 연동

🛠️ **개발 도구**:
• **VS Code**: 코드 에디터
• **npm/yarn**: 패키지 관리자
• **Webpack**: 모듈 번들러
• **Babel**: JavaScript 트랜스파일러

어떤 프레임워크나 주제에 대해 더 알고 싶으신가요?"""
    
    elif any(word in message_lower for word in ['앱개발', '앱 개발', '모바일', 'mobile', 'ios', 'android']):
        return """모바일 앱 개발에 대해 알려드리겠습니다!

📱 **모바일 앱 개발 방식**:
• **네이티브 앱**: iOS(Swift), Android(Kotlin/Java)
• **크로스플랫폼**: React Native, Flutter, Xamarin
• **하이브리드**: Ionic, Cordova

🍎 **iOS 개발**:
• **언어**: Swift, Objective-C
• **IDE**: Xcode
• **프레임워크**: UIKit, SwiftUI
• **배포**: App Store

🤖 **Android 개발**:
• **언어**: Kotlin, Java
• **IDE**: Android Studio
• **프레임워크**: Android SDK
• **배포**: Google Play Store

⚛️ **크로스플랫폼**:
• **React Native**: JavaScript 기반
• **Flutter**: Dart 언어 사용
• **Xamarin**: C# 기반

📚 **학습 순서**:
1. 프로그래밍 기초
2. 플랫폼 선택
3. 개발 환경 설정
4. 기본 UI 구성
5. 데이터 관리
6. API 연동
7. 테스트 및 배포

어떤 플랫폼이나 기술에 대해 더 알고 싶으신가요?"""
    
    elif any(word in message_lower for word in ['블록체인', 'blockchain', '암호화폐', 'cryptocurrency', '비트코인']):
        return """블록체인과 암호화폐에 대해 알려드리겠습니다!

⛓️ **블록체인이란?**
분산된 네트워크에서 거래 기록을 안전하게 저장하는 기술입니다.

🔐 **주요 특징**:
• **분산화**: 중앙 서버 없이 네트워크 참여자들이 관리
• **불변성**: 한번 기록된 데이터는 수정 불가
• **투명성**: 모든 거래가 공개적으로 기록됨
• **보안성**: 암호화 기술로 보호

💰 **주요 암호화폐**:
• **비트코인(BTC)**: 최초의 암호화폐
• **이더리움(ETH)**: 스마트 컨트랙트 플랫폼
• **리플(XRP)**: 결제 시스템
• **카르다노(ADA)**: 학술적 접근

🛠️ **블록체인 개발**:
• **Solidity**: 이더리움 스마트 컨트랙트 언어
• **Web3.js**: 이더리움과 상호작용
• **Truffle**: 개발 프레임워크
• **MetaMask**: 지갑 연동

📚 **학습 순서**:
1. 블록체인 기초 개념
2. 암호화 기술 이해
3. 암호화폐 지갑 사용법
4. 스마트 컨트랙트 개발
5. DeFi(탈중앙화 금융) 이해

어떤 부분에 대해 더 자세히 알고 싶으신가요?"""
    
    else:
        return f"""'{message}'에 대한 질문을 받았습니다. 

CORBU.AI는 다양한 주제에 대해 도움을 드릴 수 있습니다. 더 구체적인 질문을 해주시면 더 정확한 답변을 제공할 수 있습니다.

예를 들어:
- "Python으로 웹 개발하는 방법 알려주세요"
- "머신러닝 기초 개념 설명해주세요"  
- "데이터 분석 도구 추천해주세요"

어떤 주제에 대해 알고 싶으신가요?"""

def generate_contextual_response(message: str, last_topic: str) -> str:
    """이전 대화 주제를 고려한 응답 생성"""
    message_lower = message.lower()
    
    if last_topic == 'python':
        if any(word in message_lower for word in ['django', '장고']):
            return """Django에 대해 더 자세히 알려드리겠습니다!

🎯 **Django란?**
Python으로 작성된 고수준 웹 프레임워크로, 빠른 개발과 깔끔한 디자인을 강조합니다.

🏗️ **Django의 특징**:
• **MTV 패턴**: Model, Template, View 구조
• **ORM**: 데이터베이스 추상화
• **관리자 인터페이스**: 자동 생성되는 관리 패널
• **보안**: CSRF, SQL 인젝션 등 자동 보호

📚 **Django 설치 및 시작**:
```bash
pip install django
django-admin startproject myproject
cd myproject
python manage.py runserver
```

🔧 **주요 구성요소**:
• **Models**: 데이터베이스 모델 정의
• **Views**: 비즈니스 로직 처리
• **Templates**: HTML 템플릿
• **URLs**: URL 라우팅
• **Forms**: 폼 처리

어떤 부분에 대해 더 알고 싶으신가요?"""
        
        elif any(word in message_lower for word in ['flask', '플라스크']):
            return """Flask에 대해 더 자세히 알려드리겠습니다!

🌶️ **Flask란?**
가볍고 유연한 Python 웹 프레임워크로, 마이크로 프레임워크라고도 불립니다.

✨ **Flask의 특징**:
• **간단함**: 최소한의 코드로 시작 가능
• **유연성**: 필요한 기능만 선택적으로 사용
• **확장성**: 다양한 확장(Extension) 제공
• **학습 용이성**: 직관적인 구조

🚀 **Flask 설치 및 시작**:
```bash
pip install flask
```

```python
from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello():
    return 'Hello World!'

if __name__ == '__main__':
    app.run()
```

🔧 **주요 확장**:
• **Flask-SQLAlchemy**: 데이터베이스 ORM
• **Flask-Login**: 사용자 인증
• **Flask-WTF**: 폼 처리
• **Flask-Mail**: 이메일 발송

어떤 부분에 대해 더 알고 싶으신가요?"""
    
    elif last_topic == 'machine_learning':
        if any(word in message_lower for word in ['지도학습', 'supervised learning']):
            return """지도학습에 대해 더 자세히 알려드리겠습니다!

🎯 **지도학습이란?**
정답(레이블)이 있는 데이터로 모델을 훈련시키는 머신러닝 방법입니다.

📊 **지도학습의 종류**:
• **분류(Classification)**: 카테고리 예측
• **회귀(Regression)**: 연속값 예측

🔍 **주요 알고리즘**:
• **선형회귀**: 연속값 예측의 기본
• **로지스틱회귀**: 이진 분류
• **의사결정나무**: 규칙 기반 분류
• **랜덤포레스트**: 앙상블 학습
• **SVM**: 복잡한 분류 문제
• **KNN**: 거리 기반 분류

📈 **평가 지표**:
• **분류**: 정확도, 정밀도, 재현율, F1-score
• **회귀**: MSE, RMSE, MAE, R²

어떤 알고리즘이나 평가 방법에 대해 더 알고 싶으신가요?"""
    
    # 기본 컨텍스트 응답
    return f"'{last_topic}' 주제에 대한 후속 질문이군요! 더 구체적으로 무엇을 알고 싶으신가요?"

def search_web(query: str) -> str:
    """웹 검색 기능"""
    try:
        logger.info(f"웹 검색 시작: {query}")
        
        # DuckDuckGo 검색 API 사용 (무료)
        search_url = f"https://api.duckduckgo.com/?q={quote(query)}&format=json&no_html=1&skip_disambig=1"
        
        response = requests.get(search_url, timeout=10)
        logger.info(f"검색 응답 상태: {response.status_code}")
        
        if response.status_code in [200, 202]:
            data = response.json()
            logger.info(f"검색 데이터 키: {list(data.keys())}")
            
            # 검색 결과 처리
            if data.get('Abstract') and data['Abstract'].strip():
                abstract = data['Abstract']
                source = data.get('AbstractSource', 'DuckDuckGo')
                logger.info(f"추상 정보 발견: {len(abstract)}자")
                return f"**{query}**에 대한 검색 결과:\n\n{abstract}\n\n출처: {source}"
            
            elif data.get('Answer') and data['Answer'].strip():
                answer = data['Answer']
                logger.info(f"답변 정보 발견: {len(answer)}자")
                return f"**{query}**에 대한 답변:\n\n{answer}"
            
            elif data.get('RelatedTopics'):
                topics = data['RelatedTopics'][:3]  # 상위 3개만
                result = f"**{query}**에 대한 관련 정보:\n\n"
                for topic in topics:
                    if isinstance(topic, dict) and 'Text' in topic:
                        result += f"• {topic['Text']}\n"
                logger.info(f"관련 주제 발견: {len(topics)}개")
                return result
            
            elif data.get('Results'):
                results = data['Results'][:3]  # 상위 3개만
                result = f"**{query}**에 대한 검색 결과:\n\n"
                for res in results:
                    if isinstance(res, dict) and 'Text' in res:
                        result += f"• {res['Text']}\n"
                logger.info(f"검색 결과 발견: {len(results)}개")
                return result
            
            else:
                logger.info("검색 결과 없음")
                return f"'{query}'에 대한 검색 결과를 찾을 수 없습니다. 다른 키워드로 검색해보세요."
        
        else:
            logger.error(f"검색 API 오류: {response.status_code}")
            return f"'{query}'에 대한 검색 중 오류가 발생했습니다. 다른 질문을 해주세요."
        
    except requests.exceptions.Timeout:
        logger.error("웹 검색 타임아웃")
        return f"'{query}'에 대한 검색이 시간 초과되었습니다. 다른 질문을 해주세요."
    except requests.exceptions.RequestException as e:
        logger.error(f"웹 검색 네트워크 오류: {e}")
        return f"'{query}'에 대한 검색 중 네트워크 오류가 발생했습니다. 다른 질문을 해주세요."
    except Exception as e:
        logger.error(f"웹 검색 일반 오류: {e}")
        return f"'{query}'에 대한 검색 중 오류가 발생했습니다. 다른 질문을 해주세요."

def update_performance_metrics(response_time: float, success: bool = True):
    """성능 메트릭 업데이트"""
    performance_metrics['total_requests'] += 1
    performance_metrics['response_times'].append(response_time)
    
    # 최근 100개 응답 시간만 유지
    if len(performance_metrics['response_times']) > 100:
        performance_metrics['response_times'] = performance_metrics['response_times'][-100:]
    
    if success:
        performance_metrics['successful_requests'] += 1
    else:
        performance_metrics['failed_requests'] += 1
    
    # 평균 응답 시간 계산
    performance_metrics['average_response_time'] = sum(performance_metrics['response_times']) / len(performance_metrics['response_times'])

def get_system_status() -> dict:
    """시스템 상태 조회"""
    return {
        'status': 'healthy',
        'performance': performance_metrics,
        'active_sessions': len(conversation_context),
        'memory_usage': f"{len(str(conversation_context))} bytes",
        'uptime': 'running',
        'timestamp': datetime.now().isoformat()
    }

# 설정
app.config['SECRET_KEY'] = secrets.token_hex(32)  # 보안 강화
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB

# API 키 관리
API_KEYS = {
    'admin': secrets.token_hex(32),
    'user': secrets.token_hex(32)
}

def require_api_key(f):
    """API 키 인증 데코레이터"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        if not api_key or api_key not in API_KEYS.values():
            return jsonify({
                'error': '유효하지 않은 API 키입니다.'
            }), 401
        return f(*args, **kwargs)
    return decorated_function

# 업로드 폴더 생성
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# 허용된 파일 확장자
ALLOWED_EXTENSIONS = {
    'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif',
    'doc', 'docx', 'xls', 'xlsx', 'csv', 'json'
}


def allowed_file(filename):
    return ('.' in filename and
            filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS)

# 데이터베이스 초기화


def init_database():
    """데이터베이스 초기화"""
    conn = sqlite3.connect('corbu_ai.db')
    cursor = conn.cursor()
    
    # 채팅 세션 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chat_sessions (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            message_count INTEGER DEFAULT 0
        )
    ''')
    
    # 메시지 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            session_id TEXT NOT NULL,
            content TEXT NOT NULL,
            is_user BOOLEAN NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES chat_sessions (id)
        )
    ''')
    
    # 파일 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS files (
            id TEXT PRIMARY KEY,
            filename TEXT NOT NULL,
            unique_filename TEXT NOT NULL,
            size INTEGER NOT NULL,
            upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            file_path TEXT NOT NULL
        )
    ''')
    
    # 시스템 메트릭 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            metric_name TEXT NOT NULL,
            metric_value REAL NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 사용자 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            api_key TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP,
            is_active BOOLEAN DEFAULT 1
        )
    ''')
    
    # API 요청 로그 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS api_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            api_key TEXT,
            endpoint TEXT NOT NULL,
            method TEXT NOT NULL,
            status_code INTEGER NOT NULL,
            response_time REAL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            ip_address TEXT,
            user_agent TEXT
        )
    ''')
    
    conn.commit()
    conn.close()
    logger.info("데이터베이스 초기화 완료")

# 데이터베이스 초기화 실행
init_database()

# 데이터베이스 헬퍼 함수들


def save_chat_session(session_id, title, message_count=0):
    """채팅 세션 저장"""
    conn = sqlite3.connect('corbu_ai.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT OR REPLACE INTO chat_sessions 
        (id, title, message_count, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ''', (session_id, title, message_count))
    
    conn.commit()
    conn.close()



def save_message(message_id, session_id, content, is_user):
    """메시지 저장"""
    conn = sqlite3.connect('corbu_ai.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO messages (id, session_id, content, is_user)
        VALUES (?, ?, ?, ?)
    ''', (message_id, session_id, content, is_user))
    
    # 세션의 메시지 수 업데이트
    cursor.execute('''
        UPDATE chat_sessions
        SET message_count = message_count + 1, 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ''', (session_id,))
    
    conn.commit()
    conn.close()



def get_chat_sessions():
    """채팅 세션 목록 조회"""
    conn = sqlite3.connect('corbu_ai.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, title, created_at, updated_at, message_count
        FROM chat_sessions
        ORDER BY updated_at DESC
    ''')
    
    sessions = []
    for row in cursor.fetchall():
        sessions.append({
            'id': row[0],
            'title': row[1],
            'created_at': row[2],
            'updated_at': row[3],
            'message_count': row[4]
        })
    
    conn.close()
    return sessions



def get_messages(session_id):
    """특정 세션의 메시지 조회"""
    conn = sqlite3.connect('corbu_ai.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, content, is_user, timestamp
        FROM messages
        WHERE session_id = ?
        ORDER BY timestamp ASC
    ''', (session_id,))
    
    messages = []
    for row in cursor.fetchall():
        messages.append({
            'id': row[0],
            'content': row[1],
            'is_user': bool(row[2]),
            'timestamp': row[3]
        })
    
    conn.close()
    return messages



def save_metric(metric_name, metric_value):
    """메트릭 저장"""
    conn = sqlite3.connect('corbu_ai.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO metrics (metric_name, metric_value)
        VALUES (?, ?)
    ''', (metric_name, metric_value))
    
    conn.commit()
    conn.close()



def log_api_request(api_key, endpoint, method, status_code,
                   response_time, ip_address, user_agent):
    """API 요청 로그 저장"""
    conn = sqlite3.connect('corbu_ai.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO api_logs 
        (api_key, endpoint, method, status_code, response_time, 
         ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (api_key, endpoint, method, status_code,
          response_time, ip_address, user_agent))
    
    conn.commit()
    conn.close()

# 요청 로깅 미들웨어


@app.before_request
def log_request_info():
    """요청 정보 로깅"""
    request.start_time = datetime.now()

@app.after_request
def log_response_info(response):
    """응답 정보 로깅"""
    if hasattr(request, 'start_time'):
        response_time = (datetime.now() - request.start_time).total_seconds()
        api_key = request.headers.get('X-API-Key', 'anonymous')
        ip_address = request.environ.get('REMOTE_ADDR', 'unknown')
        user_agent = request.headers.get('User-Agent', 'unknown')
        
        log_api_request(
            api_key=api_key,
            endpoint=request.endpoint or 'unknown',
            method=request.method,
            status_code=response.status_code,
            response_time=response_time,
            ip_address=ip_address,
            user_agent=user_agent
        )
    
    return response

# 로깅 설정


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('corbu_ai.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)



class CORBUAI:
    """CORBU.AI 통합 분석 엔진"""
    
    def __init__(self):
        """CORBU.AI 초기화"""
        self.conversation_history = []
        self.emotion_patterns = {}
        self.emotion_metrics = {
            'total_analyses': 0,
            'emotion_distribution': {},
            'average_confidence': 0.0
        }
        
        # 데이터 분석 관련 속성
        self.data_sources = []
        self.data_analyses = []
        self.data_visualizations = []
        self.data_insights = []
        
        # 품질 보증 관련 속성
        self.quality_tests = []
        self.quality_metrics = {}
        self.quality_reports = {}
        
        # 고급 품질 보증 관련 속성
        self.quality_test_suites = []
        self.quality_test_executions = []
        self.quality_test_results = []
        self.quality_performance_metrics = []
        self.quality_trends = []
        self.quality_validation_rules = []
        self.quality_automation_config = {
            'auto_execution': True,
            'execution_interval': 3600,  # 1시간
            'notification_enabled': True,
            'report_generation': True
        }
        
        # 성능 최적화 관련 속성
        self.performance_metrics = []
        self.optimization_rules = []
        self.system_health = {
            'overall_status': 'healthy',
            'systems': {},
            'recommendations': [],
            'alerts': []
        }
        
        # 샘플 데이터 초기화
        self._initialize_emotion_recognition_data()
        self._initialize_data_analytics_data()
        self._initialize_quality_assurance_data()
        self._initialize_performance_optimization_data()
    
    def analyze_sentiment(self, text):
        """감정 분석"""
        try:
            positive_words = [
                '좋다', '훌륭하다', '멋지다', '성공', '행복', '만족', '긍정'
            ]
            negative_words = [
                '나쁘다', '실패', '불만', '화나다', '슬프다', '부정', '문제'
            ]
            
            text_lower = text.lower()
            positive_count = sum(
                1 for word in positive_words if word in text_lower
            )
            negative_count = sum(
                1 for word in negative_words if word in text_lower
            )
            
            if positive_count > negative_count:
                sentiment = '긍정'
                score = min(
                    0.9, 0.5 + (positive_count - negative_count) * 0.1
                )
            elif negative_count > positive_count:
                sentiment = '부정'
                score = max(
                    0.1, 0.5 - (negative_count - positive_count) * 0.1
                )
            else:
                sentiment = '중립'
                score = 0.5
            
            return {
                'sentiment': sentiment,
                'confidence': score,
                'positive_score': positive_count / max(len(text.split()), 1),
                'negative_score': negative_count / max(len(text.split()), 1),
                'neutral_score': (1 - (positive_count + negative_count) /
                                 max(len(text.split()), 1)),
                'analysis_time': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"감정 분석 오류: {e}")
            return None
    
    def analyze_emotion(self, content, analysis_type='text', context=None):
        """감정 분석"""
        try:
            if analysis_type == 'text':
                return self._analyze_text_emotion(content, context)
            elif analysis_type == 'voice':
                return self._analyze_voice_emotion(content, context)
            elif analysis_type == 'facial':
                return self._analyze_facial_emotion(content, context)
            elif analysis_type == 'multimodal':
                return self._analyze_multimodal_emotion(content, context)
            else:
                return self._analyze_text_emotion(content, context)
        except Exception as e:
            logger.error(f"감정 분석 오류: {e}")
            return None

    def _analyze_text_emotion(self, text, context=None):
        """텍스트 감정 분석"""
        try:
            emotion_keywords = {
                'joy': ['기쁘다', '행복하다', '즐겁다', '신나다', 
                       '만족하다', '성공', '축하'],
                'sadness': ['슬프다', '우울하다', '실망하다', '아쉽다', 
                           '후회하다', '실패'],
                'anger': ['화나다', '분노하다', '짜증나다', '열받다', 
                         '불만', '문제'],
                'fear': ['무섭다', '겁나다', '걱정하다', '불안하다', 
                        '위험', '두렵다'],
                'surprise': ['놀랐다', '깜짝', '예상밖', '충격', 
                            '믿을수없다'],
                'love': ['사랑하다', '좋아하다', '애정', '관심', 
                        '따뜻하다'],
                'confusion': ['혼란', '어렵다', '이해안된다', '모르겠다', 
                             '복잡하다'],
                'excitement': ['흥미진진하다', '재미있다', '새롭다', 
                              '도전', '모험'],
                'anxiety': ['불안하다', '긴장하다', '스트레스', '압박', 
                           '부담'],
                'relief': ['안심하다', '다행이다', '해결', '완료', '성공']
            }

            text_lower = text.lower()
            detected_emotions = []

            for emotion, keywords in emotion_keywords.items():
                matches = sum(
                    1 for keyword in keywords if keyword in text_lower
                )
                if matches > 0:
                    intensity = min(1.0, matches * 0.3)
                    confidence = min(1.0, matches * 0.4)
                    
                    detected_emotions.append({
                        'emotion': emotion,
                        'intensity': intensity,
                        'confidence': confidence,
                        'valence': self._calculate_valence(emotion, intensity),
                        'arousal': self._calculate_arousal(emotion, intensity),
                        'dominance': self._calculate_dominance(
                            emotion, intensity)
                    })

            if not detected_emotions:
                detected_emotions.append({
                    'emotion': 'neutral',
                    'intensity': 0.3,
                    'confidence': 0.5,
                    'valence': 0.5,
                    'arousal': 0.3,
                    'dominance': 0.5
                })

            detected_emotions.sort(key=lambda x: x['intensity'], reverse=True)
            
            return {
                'id': f'emotion-{datetime.now().timestamp()}',
                'content': text,
                'type': 'text',
                'detected_emotions': detected_emotions,
                'dominant_emotion': detected_emotions[0],
                'context': context or {},
                'timestamp': datetime.now().isoformat(),
                'analysis_confidence': (sum(e['confidence'] 
                                          for e in detected_emotions) /
                                       len(detected_emotions))
            }
        except Exception as e:
            logger.error(f"텍스트 감정 분석 오류: {e}")
            return None
    
    def _analyze_voice_emotion(self, audio_data, context=None):
        """음성 감정 분석 (시뮬레이션)"""
        try:
            emotions = [
                'joy', 'sadness', 'anger', 'fear', 'surprise', 'love',
                'confusion', 'excitement', 'anxiety', 'relief'
            ]
            dominant_emotion = random.choice(emotions)
            
            detected_emotions = [{
                'emotion': dominant_emotion,
                'intensity': random.uniform(0.6, 0.9),
                'confidence': random.uniform(0.7, 0.95),
                'valence': self._calculate_valence(dominant_emotion, 0.7),
                'arousal': self._calculate_arousal(dominant_emotion, 0.7),
                'dominance': self._calculate_dominance(dominant_emotion, 0.7)
            }]

            return {
                'id': f'emotion-{datetime.now().timestamp()}',
                'content': '음성 데이터',
                'type': 'voice',
                'detected_emotions': detected_emotions,
                'dominant_emotion': detected_emotions[0],
                'context': context or {},
                'timestamp': datetime.now().isoformat(),
                'analysis_confidence': detected_emotions[0]['confidence']
            }
        except Exception as e:
            logger.error(f"음성 감정 분석 오류: {e}")
            return None

    def _analyze_facial_emotion(self, image_data, context=None):
        """표정 감정 분석 (시뮬레이션)"""
        try:
            emotions = [
                'joy', 'sadness', 'anger', 'fear', 'surprise', 'love',
                'confusion', 'excitement', 'anxiety', 'relief'
            ]
            dominant_emotion = random.choice(emotions)
            
            detected_emotions = [{
                'emotion': dominant_emotion,
                'intensity': random.uniform(0.5, 0.8),
                'confidence': random.uniform(0.6, 0.9),
                'valence': self._calculate_valence(dominant_emotion, 0.6),
                'arousal': self._calculate_arousal(dominant_emotion, 0.6),
                'dominance': self._calculate_dominance(dominant_emotion, 0.6)
            }]
            
            return {
                'id': f'emotion-{datetime.now().timestamp()}',
                'content': '이미지 데이터',
                'type': 'facial',
                'detected_emotions': detected_emotions,
                'dominant_emotion': detected_emotions[0],
                'context': context or {},
                'timestamp': datetime.now().isoformat(),
                'analysis_confidence': detected_emotions[0]['confidence']
            }
        except Exception as e:
            logger.error(f"표정 감정 분석 오류: {e}")
            return None
    
    def _analyze_multimodal_emotion(self, data, context=None):
        """멀티모달 감정 분석"""
        try:
            text_result = self._analyze_text_emotion(data.get('text', ''), context)
            voice_result = self._analyze_voice_emotion(data.get('voice', ''), context)
            facial_result = self._analyze_facial_emotion(data.get('facial', ''), context)

            all_emotions = []
            if text_result:
                all_emotions.extend(text_result['detected_emotions'])
            if voice_result:
                all_emotions.extend(voice_result['detected_emotions'])
            if facial_result:
                all_emotions.extend(facial_result['detected_emotions'])

            emotion_scores = {}
            for emotion in all_emotions:
                emo_type = emotion['emotion']
                if emo_type not in emotion_scores:
                    emotion_scores[emo_type] = {'total_intensity': 0, 'total_confidence': 0, 'count': 0}
                
                emotion_scores[emo_type]['total_intensity'] += emotion['intensity']
                emotion_scores[emo_type]['total_confidence'] += emotion['confidence']
                emotion_scores[emo_type]['count'] += 1

            integrated_emotions = []
            for emo_type, scores in emotion_scores.items():
                avg_intensity = scores['total_intensity'] / scores['count']
                avg_confidence = scores['total_confidence'] / scores['count']
                
                integrated_emotions.append({
                    'emotion': emo_type,
                    'intensity': avg_intensity,
                    'confidence': avg_confidence,
                    'valence': self._calculate_valence(emo_type, avg_intensity),
                    'arousal': self._calculate_arousal(emo_type, avg_intensity),
                    'dominance': self._calculate_dominance(emo_type, avg_intensity)
                })

            integrated_emotions.sort(key=lambda x: x['intensity'], reverse=True)
            
            return {
                'id': f'emotion-{datetime.now().timestamp()}',
                'content': '멀티모달 데이터',
                'type': 'multimodal',
                'detected_emotions': integrated_emotions,
                'dominant_emotion': (
                    integrated_emotions[0] if integrated_emotions else None
                ),
                'context': context or {},
                'timestamp': datetime.now().isoformat(),
                'analysis_confidence': (
                    sum(e['confidence'] for e in integrated_emotions) /
                    len(integrated_emotions) if integrated_emotions else 0.5
                )
            }
        except Exception as e:
            logger.error(f"멀티모달 감정 분석 오류: {e}")
            return None

    def _calculate_valence(self, emotion, intensity):
        """가치(긍정/부정) 계산"""
        positive_emotions = [
            'joy', 'love', 'excitement', 'relief'
        ]
        negative_emotions = [
            'sadness', 'anger', 'fear', 'anxiety'
        ]
        
        if emotion in positive_emotions:
            return 0.5 + (intensity * 0.5)
        elif emotion in negative_emotions:
            return 0.5 - (intensity * 0.5)
        else:
            return 0.5

    def _calculate_arousal(self, emotion, intensity):
        """각성 수준 계산"""
        high_arousal = [
            'joy', 'anger', 'fear', 'surprise', 'excitement', 'anxiety'
        ]
        low_arousal = [
            'sadness', 'love', 'confusion', 'relief'
        ]
        
        if emotion in high_arousal:
            return 0.5 + (intensity * 0.5)
        elif emotion in low_arousal:
            return 0.5 - (intensity * 0.3)
        else:
            return 0.5

    def _calculate_dominance(self, emotion, intensity):
        """지배성 계산"""
        high_dominance = [
            'joy', 'anger', 'excitement', 'love'
        ]
        low_dominance = [
            'fear', 'sadness', 'anxiety', 'confusion'
        ]
        
        if emotion in high_dominance:
            return 0.5 + (intensity * 0.5)
        elif emotion in low_dominance:
            return 0.5 - (intensity * 0.5)
        else:
            return 0.5

    def generate_emotional_response(self, emotion_data, user_context=None):
        """감정 기반 응답 생성"""
        try:
            if not emotion_data or 'dominant_emotion' not in emotion_data:
                return None

            dominant_emotion = emotion_data['dominant_emotion']
            emotion_type = dominant_emotion['emotion']
            intensity = dominant_emotion['intensity']

            response_strategies = {
                'joy': {
                    'type': 'celebratory',
                    'tone': 'warm',
                    'templates': [
                        '정말 기쁜 일이군요! 🎉 그런 긍정적인 에너지가 느껴집니다.',
                        '축하드립니다! 😊 이런 순간들이 삶을 아름답게 만드는 것 같아요.',
                        '정말 좋은 소식이네요! 🌟 계속해서 이런 기쁨을 유지하시길 바랍니다.'
                    ]
                },
                'sadness': {
                    'type': 'supportive',
                    'tone': 'warm',
                    'templates': [
                        '마음이 아프시겠어요. 😔 이런 때는 충분히 쉬시는 것도 중요해요.',
                        '슬픈 마음을 이해합니다. 🤗 시간이 해결해줄 거예요.',
                        '힘든 시간을 보내고 계시는군요. 💙 제가 함께 있어드릴게요.'
                    ]
                },
                'anger': {
                    'type': 'calming',
                    'tone': 'professional',
                    'templates': [
                        '화가 나시는 것 같아요. 😤 깊은 숨을 한 번 쉬어보세요.',
                        '분노를 이해합니다. 😔 차분히 생각해보면 해결책이 보일 거예요.',
                        '짜증나시는 상황이군요. 😌 잠시 마음을 가라앉혀보세요.'
                    ]
                },
                'fear': {
                    'type': 'supportive',
                    'tone': 'warm',
                    'templates': [
                        '걱정되시는군요. 😰 하지만 함께 해결해나갈 수 있어요.',
                        '두려운 마음이 드시겠어요. 🤗 차근차근 접근해보세요.',
                        '불안하시는 것 같아요. 💪 용기를 내세요, 잘 해낼 수 있을 거예요.'
                    ]
                },
                'surprise': {
                    'type': 'encouraging',
                    'tone': 'friendly',
                    'templates': [
                        '정말 놀라운 일이군요! 😲 이런 예상 밖의 상황이 흥미롭네요.',
                        '깜짝 놀라셨겠어요! 😱 새로운 경험이 될 것 같아요.',
                        '믿을 수 없는 일이네요! 🤯 어떻게 대응하실 건가요?'
                    ]
                },
                'love': {
                    'type': 'empathic',
                    'tone': 'warm',
                    'templates': [
                        '사랑스러운 마음이 느껴져요. 💕 그런 따뜻한 감정이 아름다워요.',
                        '애정이 가득하시군요. 💖 이런 순간들이 소중하죠.',
                        '따뜻한 마음이 전해져요. 💗 그런 감정을 소중히 여기세요.'
                    ]
                },
                'confusion': {
                    'type': 'analytical',
                    'tone': 'professional',
                    'templates': [
                        '혼란스러우시겠어요. 🤔 차근차근 정리해보면 도움이 될 거예요.',
                        '어려운 상황이군요. 💭 단계별로 접근해보는 건 어떨까요?',
                        '복잡한 문제네요. 🧠 천천히 생각해보시면 해결책이 보일 거예요.'
                    ]
                },
                'excitement': {
                    'type': 'encouraging',
                    'tone': 'playful',
                    'templates': [
                        '정말 흥미진진하시군요! 🎢 그런 열정이 멋져요!',
                        '신나는 일이 있으신가요? 🚀 계속해서 그 에너지를 유지하세요!',
                        '흥미로운 상황이네요! ⭐ 그런 호기심이 발전을 만들어요!'
                    ]
                },
                'anxiety': {
                    'type': 'calming',
                    'tone': 'warm',
                    'templates': [
                        '불안하시는군요. 😰 하지만 차분히 생각해보면 괜찮을 거예요.',
                        '긴장되시는 것 같아요. 😌 깊은 숨을 쉬며 마음을 가라앉혀보세요.',
                        '걱정이 많으시군요. 🤗 한 번에 하나씩 해결해나가면 됩니다.'
                    ]
                },
                'relief': {
                    'type': 'supportive',
                    'tone': 'warm',
                    'templates': [
                        '다행이네요! 😊 안심이 되셨겠어요.',
                        '해결되어서 좋으시겠어요! 😌 이제 마음이 편하실 거예요.',
                        '완료되어서 다행이에요! 🎉 수고하셨습니다.'
                    ]
                }
            }

            strategy = response_strategies.get(emotion_type, {
                'type': 'adaptive',
                'tone': 'friendly',
                'templates': ['현재 상황을 이해하고 있습니다. 어떻게 도움을 드릴까요?']
            })

            response_template = random.choice(strategy['templates'])
            
            if intensity > 0.8:
                response_template += ' 정말 강한 감정이 느껴져요.'
            elif intensity < 0.3:
                response_template += ' 조금은 차분한 상태인 것 같아요.'
            
            return {
                'id': f'response-{datetime.now().timestamp()}',
                'content': response_template,
                'response_type': strategy['type'],
                'tone': strategy['tone'],
                'target_emotion': emotion_type,
                'emotional_intelligence_score': (
                    self._calculate_emotional_intelligence(dominant_emotion)
                ),
                'appropriateness_score': (
                    self._calculate_appropriateness(dominant_emotion, strategy)
                ),
                'user_satisfaction_prediction': (
                    self._predict_user_satisfaction(dominant_emotion)
                ),
                'generated_at': datetime.now().isoformat(),
                'context': user_context or {}
            }
        except Exception as e:
            logger.error(f"감정 응답 생성 오류: {e}")
            return None
    
    def _calculate_emotional_intelligence(self, emotion):
        """감정 지능 점수 계산"""
        try:
            score = 0.7
            
            if emotion['intensity'] > 0.8:
                score += 0.1
            elif emotion['intensity'] < 0.3:
                score += 0.05
            
            if emotion['emotion'] in ['joy', 'love', 'excitement']:
                score += 0.1
            elif emotion['emotion'] in ['sadness', 'fear', 'anxiety']:
                score += 0.1
            
            return min(score, 1.0)
        except Exception as e:
            logger.error(f"감정 지능 점수 계산 오류: {e}")
            return 0.7

    def _calculate_appropriateness(self, emotion, strategy):
        """응답 적절성 점수 계산"""
        try:
            score = 0.8
            
            emotion_strategy_match = {
                'joy': ['celebratory', 'empathic'],
                'sadness': ['supportive', 'empathic'],
                'anger': ['calming', 'analytical'],
                'fear': ['supportive', 'calming'],
                'surprise': ['encouraging', 'analytical'],
                'love': ['empathic', 'supportive'],
                'confusion': ['analytical', 'supportive']
            }
            
            appropriate_strategies = emotion_strategy_match.get(
                emotion['emotion'], []
            )
            if strategy['type'] in appropriate_strategies:
                score += 0.1
            
            return min(score, 1.0)
        except Exception as e:
            logger.error(f"응답 적절성 점수 계산 오류: {e}")
            return 0.8

    def _predict_user_satisfaction(self, emotion):
        """사용자 만족도 예측"""
        try:
            prediction = 0.75
            
            if emotion['intensity'] > 0.7:
                prediction += 0.1
            elif emotion['intensity'] < 0.3:
                prediction += 0.05
            
            if emotion['emotion'] in ['joy', 'love']:
                prediction += 0.1
            elif emotion['emotion'] in ['sadness', 'fear']:
                prediction += 0.1
            
            return min(prediction, 1.0)
        except Exception as e:
            logger.error(f"사용자 만족도 예측 오류: {e}")
            return 0.75

    def get_emotion_patterns(self, user_id=None, limit=50):
        """감정 패턴 조회"""
        try:
            if user_id:
                patterns = self.emotion_patterns.get(user_id, [])
            else:
                patterns = []
                for user_patterns in self.emotion_patterns.values():
                    patterns.extend(user_patterns)
            
            return patterns[-limit:] if patterns else []
        except Exception as e:
            logger.error(f"감정 패턴 조회 오류: {e}")
            return []

    def get_emotion_metrics(self):
        """감정 인식 메트릭 조회"""
        try:
            return {
                'success': True,
                'data': self.emotion_metrics,
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"감정 메트릭 조회 오류: {e}")
            return {
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }

    def get_emotion_config(self):
        """감정 인식 설정 조회"""
        try:
            config = {
                'auto_analysis': True,
                'confidence_threshold': 0.7,
                'max_emotions': 5,
                'analysis_types': [
                    'text', 'voice', 'facial', 'multimodal'
                ],
                'response_generation': True,
                'pattern_tracking': True,
                'real_time_processing': True
            }
            return {
                'success': True,
                'data': config,
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"감정 설정 조회 오류: {e}")
            return {
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }

    def update_emotion_config(self, config_data):
        """감정 인식 설정 업데이트"""
        try:
            # 설정 업데이트 시뮬레이션
            updated_config = {
                'auto_analysis': config_data.get('auto_analysis', True),
                'confidence_threshold': config_data.get('confidence_threshold', 0.7),
                'max_emotions': config_data.get('max_emotions', 5),
                'analysis_types': config_data.get(
                    'analysis_types', ['text', 'voice', 'facial', 'multimodal']
                ),
                'response_generation': config_data.get('response_generation', True),
                'pattern_tracking': config_data.get('pattern_tracking', True),
                'real_time_processing': config_data.get('real_time_processing', True)
            }
            return {
                'success': True,
                'data': updated_config,
                'message': '감정 인식 설정이 업데이트되었습니다.',
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"감정 설정 업데이트 오류: {e}")
            return {
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }

    # 데이터 분석 시스템 메서드들
    def get_data_sources(self):
        """데이터 소스 조회"""
        return {
            'success': True,
            'data': self.data_sources,
            'timestamp': datetime.now().isoformat()
        }

    def create_data_source(self, source_data):
        """데이터 소스 생성"""
        source = {
            'id': f'source-{len(self.data_sources) + 1}',
            'name': source_data.get('name', '새 데이터 소스'),
            'type': source_data.get('type', 'database'),
            'url': source_data.get('url', ''),
            'status': 'active',
            'last_updated': datetime.now().isoformat()
        }
        self.data_sources.append(source)
        return {
            'success': True,
            'data': source,
            'timestamp': datetime.now().isoformat()
        }

    def get_data_analyses(self):
        """데이터 분석 작업 조회"""
        return {
            'success': True,
            'data': self.data_analyses,
            'timestamp': datetime.now().isoformat()
        }

    def create_data_analysis(self, analysis_data):
        """데이터 분석 작업 생성"""
        analysis = {
            'id': f'analysis-{len(self.data_analyses) + 1}',
            'name': analysis_data.get('name', '새 분석 작업'),
            'type': analysis_data.get('type', 'descriptive'),
            'status': 'pending',
            'source_id': analysis_data.get('source_id', ''),
            'created_at': datetime.now().isoformat()
        }
        self.data_analyses.append(analysis)
        return {
            'success': True,
            'data': analysis,
            'timestamp': datetime.now().isoformat()
        }

    def get_data_visualizations(self):
        """데이터 시각화 조회"""
        return {
            'success': True,
            'data': self.data_visualizations,
            'timestamp': datetime.now().isoformat()
        }

    def create_data_visualization(self, viz_data):
        """데이터 시각화 생성"""
        visualization = {
            'id': f'viz-{len(self.data_visualizations) + 1}',
            'name': viz_data.get('name', '새 시각화'),
            'type': viz_data.get('type', 'chart'),
            'analysis_id': viz_data.get('analysis_id', ''),
            'created_at': datetime.now().isoformat()
        }
        self.data_visualizations.append(visualization)
        return {
            'success': True,
            'data': visualization,
            'timestamp': datetime.now().isoformat()
        }

    def get_data_insights(self):
        """데이터 인사이트 조회"""
        return {
            'success': True,
            'data': self.data_insights,
            'timestamp': datetime.now().isoformat()
        }

    def get_data_analytics_metrics(self):
        """데이터 분석 메트릭 조회"""
        metrics = {
                'total_sources': len(self.data_sources),
                'total_analyses': len(self.data_analyses),
                'total_visualizations': len(self.data_visualizations),
                'total_insights': len(self.data_insights),
                'active_sources': len([
                    s for s in self.data_sources 
                    if s.get('status') == 'active'
                ]),
                'completed_analyses': len([
                    a for a in self.data_analyses 
                    if a.get('status') == 'completed'
                ])
            }
        return {
            'success': True,
            'data': metrics,
            'timestamp': datetime.now().isoformat()
        }

    # 품질 보증 시스템 메서드들
    def get_quality_tests(self):
        """품질 테스트 조회"""
        return self.quality_tests

    def create_quality_test(self, data):
        """품질 테스트 생성"""
        test = {
            'id': f'test-{len(self.quality_tests) + 1}',
            'name': data.get('name', '새 테스트'),
            'type': data.get('type', 'accuracy'),
            'category': data.get('category', 'ai_model'),
            'priority': data.get('priority', 'medium'),
            'status': 'pending',
            'created_at': datetime.now().isoformat()
        }
        self.quality_tests.append(test)
        return test

    def get_quality_metrics(self):
        """품질 메트릭 조회"""
        return self.quality_metrics

    def get_quality_reports(self):
        """품질 보고서 조회"""
        return self.quality_reports

    # 고급 품질 보증 메서드들
    def get_quality_test_suites(self):
        """테스트 스위트 조회"""
        return self.quality_test_suites

    def create_quality_test_suite(self, data):
        """테스트 스위트 생성"""
        suite = {
            'id': f'suite-{len(self.quality_test_suites) + 1}',
            'name': data.get('name', '새 테스트 스위트'),
            'description': data.get('description', ''),
            'category': data.get('category', 'functional'),
            'test_cases': data.get('test_cases', []),
            'execution_schedule': data.get('execution_schedule', '0 0 * * *'),
            'priority': data.get('priority', 'medium'),
            'created_date': datetime.now(),
            'last_executed': datetime.now(),
            'status': 'active'
        }
        self.quality_test_suites.append(suite)
        return suite

    def get_quality_test_executions(self):
        """테스트 실행 조회"""
        return self.quality_test_executions

    def create_quality_test_execution(self, data):
        """테스트 실행 생성"""
        execution = {
            'id': f'exec-{len(self.quality_test_executions) + 1}',
            'test_suite_id': data.get('test_suite_id'),
            'start_time': datetime.now(),
                'status': 'running',
            'progress_percentage': 0,
            'current_test_case': None,
            'results': [],
            'summary': {
                'total_tests': 0,
                'completed_tests': 0,
                'passed_tests': 0,
                'failed_tests': 0,
                'average_execution_time': 0,
                'quality_score': 0,
                'performance_score': 0
            }
        }
        self.quality_test_executions.append(execution)
        return execution

    def get_quality_test_results(self):
        """테스트 결과 조회"""
        return self.quality_test_results

    def get_quality_performance_metrics(self):
        """성능 메트릭 조회"""
        return self.quality_performance_metrics

    def get_quality_trends(self):
        """품질 트렌드 조회"""
        return self.quality_trends

    def start_automated_quality_test(self, data):
        """자동화된 품질 테스트 시작"""
        test_suite_id = data.get('test_suite_id')
        suite = next((s for s in self.quality_test_suites if s['id'] == test_suite_id), None)
        
        if not suite:
            raise ValueError(f"테스트 스위트를 찾을 수 없습니다: {test_suite_id}")
        
            execution = {
                'id': f'auto-exec-{len(self.quality_test_executions) + 1}',
                'test_suite_id': test_suite_id,
                'start_time': datetime.now(),
                'status': 'running',
                'progress_percentage': 0,
                'current_test_case': (
                    suite['test_cases'][0]['name'] 
                    if suite['test_cases'] else None
                ),
                'results': [],
                'summary': {
                    'total_tests': len(suite['test_cases']),
                    'completed_tests': 0,
                    'passed_tests': 0,
                    'failed_tests': 0,
                    'average_execution_time': 0,
                    'quality_score': 0,
                    'performance_score': 0
                }
            }
        
        self.quality_test_executions.append(execution)
        return execution

    def get_quality_execution_status(self, execution_id):
        """테스트 실행 상태 조회"""
        execution = next(
            (e for e in self.quality_test_executions 
             if e['id'] == execution_id), None
        )
        if not execution:
            raise ValueError(f"실행을 찾을 수 없습니다: {execution_id}")
        return execution

    def stop_quality_execution(self, execution_id):
        """테스트 실행 중지"""
        execution = next(
            (e for e in self.quality_test_executions 
             if e['id'] == execution_id), None
        )
        if not execution:
            raise ValueError(f"실행을 찾을 수 없습니다: {execution_id}")
        
        execution['status'] = 'cancelled'
        execution['end_time'] = datetime.now()
        return {'success': True, 'message': '실행이 중지되었습니다.'}

    def generate_quality_report(self, data):
        """품질 보고서 생성"""
        report = {
                'id': f'report-{len(self.quality_reports) + 1}',
                'title': data.get('title', '품질 보고서'),
                'summary': data.get('summary', ''),
                'status': 'completed',
                'created_at': datetime.now().isoformat(),
                'metrics': self.quality_metrics,
                'trends': (
                    self.quality_trends[-5:] if self.quality_trends else []
                ),
                'recommendations': [
                    '테스트 커버리지를 95% 이상으로 향상시키세요.',
                    '성능 테스트를 더 자주 실행하세요.',
                    '보안 테스트를 강화하세요.'
                ]
            }
        self.quality_reports.append(report)
        return report

    def analyze_quality_question(self, question):
        """품질 보증 관련 질문 분석 및 답변"""
        question_lower = question.lower()
        
        # 테스트 스위트 관련 질문
        if '테스트 스위트' in question or 'test suite' in question_lower:
            if '목록' in question or 'list' in question_lower:
                suites = self.get_quality_test_suites()
                response = f"현재 {len(suites)}개의 테스트 스위트가 있습니다:\n\n"
                for suite in suites:
                    response += f"• **{suite['name']}** ({suite['category']}) - {suite['status']}\n"
                    response += f"  {suite['description']}\n\n"
                return response
            elif '생성' in question or 'create' in question_lower:
                return "새 테스트 스위트를 생성하려면 다음 정보가 필요합니다:\n\n" \
                       "• 스위트 이름\n" \
                       "• 설명\n" \
                       "• 카테고리 (functional, performance, security, usability, reliability, compatibility)\n" \
                       "• 우선순위 (critical, high, medium, low)\n" \
                       "• 실행 스케줄 (cron 형식)\n\n" \
                       "어떤 정보를 제공해주시겠습니까?"
        
        # 테스트 실행 관련 질문
        elif '실행' in question or 'execution' in question_lower:
            if '상태' in question or 'status' in question_lower:
                executions = self.get_quality_test_executions()
                running_executions = [e for e in executions if e['status'] == 'running']
                response = f"현재 {len(running_executions)}개의 테스트가 실행 중입니다:\n\n"
                for execution in running_executions:
                    suite = next((s for s in self.quality_test_suites if s['id'] == execution['test_suite_id']), None)
                    suite_name = suite['name'] if suite else '알 수 없는 스위트'
                    response += f"• **{suite_name}** - {execution['progress_percentage']}% 완료\n"
                    if execution['current_test_case']:
                        response += f"  현재: {execution['current_test_case']}\n"
                    response += "\n"
                return response
            elif '시작' in question or 'start' in question_lower:
                return "테스트 실행을 시작하려면 테스트 스위트 ID가 필요합니다.\n\n" \
                       "사용 가능한 스위트:\n" \
                       "• functional-test-suite (AI 기능 테스트)\n" \
                       "• performance-test-suite (AI 성능 테스트)\n" \
                       "• security-test-suite (AI 보안 테스트)\n\n" \
                       "어떤 스위트를 실행하시겠습니까?"
        
        # 품질 메트릭 관련 질문
        elif '메트릭' in question or 'metrics' in question_lower or '지표' in question:
            metrics = self.get_quality_metrics()
            response = "현재 품질 메트릭:\n\n"
            response += f"• **테스트 스위트**: {metrics['total_test_suites']}개 (활성: {metrics['active_test_suites']}개)\n"
            response += f"• **테스트 케이스**: {metrics['total_test_cases']}개\n"
            response += f"• **전체 통과율**: {metrics['overall_pass_rate']*100:.1f}%\n"
            response += f"• **평균 품질 점수**: {metrics['average_quality_score']*100:.0f}%\n"
            response += f"• **중요 실패**: {metrics['critical_failures']}개\n"
            response += f"• **테스트 커버리지**: {metrics['test_coverage']:.1f}%\n"
            response += f"• **자동화율**: {metrics['automation_rate']:.1f}%\n"
            return response
        
        # 성능 관련 질문
        elif '성능' in question or 'performance' in question_lower:
            if '분석' in question or 'analysis' in question_lower:
                metrics = self.quality_performance_metrics[-1] if self.quality_performance_metrics else None
                if metrics:
                    response = "최신 성능 분석 결과:\n\n"
                    response += f"• **응답 시간**: {metrics['response_time_ms']}ms\n"
                    response += f"• **메모리 사용량**: {metrics['memory_usage_mb']}MB\n"
                    response += f"• **CPU 사용률**: {metrics['cpu_usage_percent']}%\n"
                    response += f"• **처리량**: {metrics['throughput_rps']} RPS\n"
                    response += f"• **오류율**: {metrics['error_rate']*100:.1f}%\n"
                    response += f"• **가용성**: {metrics['availability']*100:.1f}%\n\n"
                    
                    if metrics['response_time_ms'] > 1000:
                        response += "⚠️ **주의**: 응답 시간이 1초를 초과하고 있습니다. 최적화가 필요합니다.\n"
                    if metrics['cpu_usage_percent'] > 80:
                        response += "⚠️ **주의**: CPU 사용률이 높습니다. 리소스 모니터링이 필요합니다.\n"
                    
                    return response
                else:
                    return "성능 메트릭 데이터가 없습니다."
        
        # 품질 트렌드 관련 질문
        elif '트렌드' in question or 'trend' in question_lower or '추세' in question:
            trends = self.get_quality_trends()
            if trends:
                response = "품질 트렌드 분석:\n\n"
                for i, trend in enumerate(trends[-3:]):  # 최근 3개
                    response += f"**{trend['date'].strftime('%Y-%m-%d')}**:\n"
                    response += f"• 품질 점수: {trend['quality_score']*100:.0f}%\n"
                    response += f"• 통과율: {trend['pass_rate']*100:.0f}%\n"
                    response += f"• 성능 점수: {trend['performance_score']*100:.0f}%\n\n"
                
                # 트렌드 분석
                if len(trends) >= 2:
                    latest = trends[-1]
                    previous = trends[-2]
                    quality_change = latest['quality_score'] - previous['quality_score']
                    if quality_change > 0:
                        response += "📈 **품질 점수가 향상되고 있습니다.**\n"
                    elif quality_change < 0:
                        response += "📉 **품질 점수가 하락하고 있습니다.**\n"
                    else:
                        response += "➡️ **품질 점수가 안정적입니다.**\n"
                
                return response
            else:
                return "품질 트렌드 데이터가 없습니다."
        
        # 보고서 관련 질문
        elif '보고서' in question or 'report' in question_lower:
            reports = self.get_quality_reports()
            if reports:
                response = f"최근 품질 보고서 ({len(reports)}개):\n\n"
                for report in reports[-3:]:  # 최근 3개
                    response += f"• **{report['title']}** - {report['status']}\n"
                    response += f"  {report['summary']}\n\n"
                return response
            else:
                return "품질 보고서가 없습니다."
        
        # 일반적인 품질 보증 질문
        elif '품질' in question or 'quality' in question_lower:
            return "품질 보증 시스템에 대해 질문하셨습니다. 다음 중 어떤 정보를 원하시나요?\n\n" \
                   "• **테스트 스위트 목록** - 현재 구성된 테스트 스위트 확인\n" \
                   "• **실행 상태** - 현재 실행 중인 테스트 확인\n" \
                   "• **품질 메트릭** - 전체적인 품질 지표 확인\n" \
                   "• **성능 분석** - 시스템 성능 상태 확인\n" \
                   "• **품질 트렌드** - 시간에 따른 품질 변화 확인\n" \
                   "• **보고서** - 생성된 품질 보고서 확인\n\n" \
                   "구체적으로 어떤 정보를 원하시는지 말씀해 주세요."
        
        # 기본 응답
        else:
            return "품질 보증 시스템에 대한 질문을 받았습니다. 다음과 같은 정보를 제공할 수 있습니다:\n\n" \
                   "🔍 **테스트 관리**: 테스트 스위트 생성, 실행, 모니터링\n" \
                   "📊 **품질 분석**: 메트릭, 트렌드, 성능 분석\n" \
                   "📋 **보고서**: 자동 생성된 품질 보고서\n" \
                   "⚙️ **자동화**: 스케줄된 테스트 실행\n\n" \
                   "어떤 부분에 대해 더 자세히 알고 싶으신가요?"

    def get_performance_metrics(self):
        """성능 메트릭 조회"""
        return {
            'status': 'success',
            'data': self.performance_metrics,
            'message': f'{len(self.performance_metrics)}개의 성능 메트릭을 조회했습니다.'
        }

    def create_performance_metric(self, metric_data):
        """성능 메트릭 생성"""
        metric = {
            'id': f'metric-{len(self.performance_metrics) + 1}',
                'timestamp': datetime.now().isoformat(),
            'system': metric_data.get('system', 'unknown'),
            'metric_type': metric_data.get('metric_type', 'cpu'),
            'value': metric_data.get('value', 0),
            'unit': metric_data.get('unit', '%'),
            'threshold': metric_data.get('threshold', 80),
            'status': metric_data.get('status', 'normal'),
            'context': metric_data.get('context', {})
        }
        self.performance_metrics.append(metric)
        return {
            'status': 'success',
            'data': metric,
            'message': '성능 메트릭이 생성되었습니다.'
        }

    def get_optimization_rules(self):
        """최적화 규칙 조회"""
        return {
            'status': 'success',
            'data': self.optimization_rules,
            'message': f'{len(self.optimization_rules)}개의 최적화 규칙을 조회했습니다.'
        }

    def create_optimization_rule(self, rule_data):
        """최적화 규칙 생성"""
        rule = {
            'id': f'rule-{len(self.optimization_rules) + 1}',
            'name': rule_data.get('name', '새 최적화 규칙'),
            'description': rule_data.get('description', ''),
            'condition': rule_data.get('condition', {
                'metric_type': 'cpu',
                'operator': 'gt',
                'threshold': 80,
                'duration': 60
            }),
            'action': rule_data.get('action', {
                'type': 'scale',
                'parameters': {}
            }),
            'enabled': rule_data.get('enabled', True),
            'priority': rule_data.get('priority', 'medium'),
            'created_at': datetime.now().isoformat()
        }
        self.optimization_rules.append(rule)
        return {
            'status': 'success',
            'data': rule,
            'message': '최적화 규칙이 생성되었습니다.'
        }

    def get_system_health(self):
        """시스템 상태 조회"""
        return {
            'status': 'success',
            'data': self.system_health,
            'message': '시스템 상태를 조회했습니다.'
        }

    def perform_manual_optimization(self, optimization_data):
        """수동 최적화 수행"""
        optimization_type = optimization_data.get('type', 'scale')
        parameters = optimization_data.get('parameters', {})
        
        # 최적화 수행 시뮬레이션
        result = {
            'id': f'optimization-{len(self.performance_metrics) + 1}',
            'type': optimization_type,
            'parameters': parameters,
            'status': 'completed',
            'timestamp': datetime.now().isoformat(),
            'message': f'{optimization_type} 최적화가 성공적으로 수행되었습니다.'
        }
        
        return {
            'status': 'success',
            'data': result,
            'message': '수동 최적화가 완료되었습니다.'
        }

    def get_performance_report(self):
        """성능 보고서 생성"""
        report = {
                'timestamp': datetime.now().isoformat(),
                'overall_health': self.system_health['overall_status'],
                'systems': list(self.system_health['systems'].keys()),
                'metrics_count': len(self.performance_metrics),
                'optimization_rules': {
                    'total': len(self.optimization_rules),
                    'enabled': len([
                        r for r in self.optimization_rules 
                        if r.get('enabled', False)
                    ]),
                    'disabled': len([
                        r for r in self.optimization_rules 
                        if not r.get('enabled', False)
                    ])
                },
                'recommendations': self.system_health['recommendations'],
                'alerts': self.system_health['alerts']
            }
        
        return {
            'status': 'success',
            'data': report,
            'message': '성능 보고서가 생성되었습니다.'
        }

    def _initialize_performance_optimization_data(self):
        """성능 최적화 샘플 데이터 초기화"""
        # 샘플 성능 메트릭
        sample_metrics = [
            {
                'id': 'metric-1',
                'timestamp': datetime.now().isoformat(),
                'system': 'data_analytics',
                'metric_type': 'cpu',
                'value': 75.5,
                'unit': '%',
                'threshold': 80,
                'status': 'normal'
            },
            {
                'id': 'metric-2',
                'timestamp': datetime.now().isoformat(),
                'system': 'quality_assurance',
                'metric_type': 'memory',
                'value': 82.3,
                'unit': '%',
                'threshold': 85,
                'status': 'normal'
            },
            {
                'id': 'metric-3',
                'timestamp': datetime.now().isoformat(),
                'system': 'emotion_recognition',
                'metric_type': 'response_time',
                'value': 850,
                'unit': 'ms',
                'threshold': 1000,
                'status': 'normal'
            }
        ]
        self.performance_metrics = sample_metrics

        # 샘플 최적화 규칙
        sample_rules = [
            {
                'id': 'rule-1',
                'name': 'CPU 사용률 최적화',
                'description': 'CPU 사용률이 80%를 초과하면 자동 스케일링을 수행합니다.',
                'condition': {
                    'metric_type': 'cpu',
                    'operator': 'gt',
                    'threshold': 80,
                    'duration': 60
                },
                'action': {
                    'type': 'scale',
                    'parameters': {'scale_factor': 1.5, 'target': 'cpu'}
                },
                'enabled': True,
                'priority': 'high',
                'created_at': datetime.now().isoformat()
            },
            {
                'id': 'rule-2',
                'name': '응답 시간 최적화',
                'description': '응답 시간이 1초를 초과하면 캐싱을 활성화합니다.',
                'condition': {
                    'metric_type': 'response_time',
                    'operator': 'gt',
                    'threshold': 1000,
                    'duration': 30
                },
                'action': {
                    'type': 'cache',
                    'parameters': {'cache_duration': 300, 'strategy': 'aggressive'}
                },
                'enabled': True,
                'priority': 'medium',
                'created_at': datetime.now().isoformat()
            }
        ]
        self.optimization_rules = sample_rules

        # 샘플 시스템 상태
        self.system_health = {
            'overall_status': 'healthy',
            'systems': {
                'data_analytics': {
                    'status': 'healthy',
                    'metrics': sample_metrics[:1],
                    'last_updated': datetime.now().isoformat()
                },
                'quality_assurance': {
                    'status': 'healthy',
                    'metrics': sample_metrics[1:2],
                    'last_updated': datetime.now().isoformat()
                },
                'emotion_recognition': {
                    'status': 'healthy',
                    'metrics': sample_metrics[2:],
                    'last_updated': datetime.now().isoformat()
                }
            },
            'recommendations': [
                '시스템이 정상적으로 작동하고 있습니다.',
                '정기적인 성능 모니터링을 권장합니다.'
            ],
            'alerts': []
        }

    def _initialize_emotion_recognition_data(self):
        """감정 인식 샘플 데이터 초기화"""
        # 샘플 감정 패턴
        self.emotion_patterns = {
            'user-1': [
                {
                    'timestamp': datetime.now().isoformat(),
                    'emotion': 'joy',
                    'confidence': 0.85,
                    'context': 'positive_feedback'
                }
            ]
        }
        
        # 샘플 감정 메트릭
        self.emotion_metrics = {
            'total_analyses': 10,
            'emotion_distribution': {
                'joy': 0.4,
                'sadness': 0.2,
                'anger': 0.1,
                'fear': 0.1,
                'surprise': 0.1,
                'neutral': 0.1
            },
            'average_confidence': 0.78
        }

    def _initialize_data_analytics_data(self):
        """데이터 분석 샘플 데이터 초기화"""
        # 샘플 데이터 소스
        self.data_sources = [
            {
                'id': 'source-1',
                'name': '사용자 행동 데이터',
                'type': 'database',
                'url': 'postgresql://localhost/user_behavior',
                'status': 'active',
                'last_updated': datetime.now().isoformat()
            },
            {
                'id': 'source-2',
                'name': 'API 로그',
                'type': 'api',
                'url': 'https://api.example.com/logs',
                'status': 'active',
                'last_updated': datetime.now().isoformat()
            }
        ]
        
        # 샘플 분석 작업
        self.data_analyses = [
            {
                'id': 'analysis-1',
                'name': '사용자 패턴 분석',
                'type': 'descriptive',
                'status': 'completed',
                'source_id': 'source-1',
                'created_at': datetime.now().isoformat()
            }
        ]
        
        # 샘플 시각화
        self.data_visualizations = [
            {
                'id': 'viz-1',
                'name': '사용자 활동 차트',
                'type': 'line_chart',
                'analysis_id': 'analysis-1',
                'created_at': datetime.now().isoformat()
            }
        ]
        
        # 샘플 인사이트
        self.data_insights = [
            {
                'id': 'insight-1',
                'type': 'trend',
                'description': '사용자 활동이 주말에 증가하는 경향을 보입니다.',
                'confidence': 0.85,
                'created_at': datetime.now().isoformat()
            }
        ]

    def _initialize_quality_assurance_data(self):
        """품질 보증 샘플 데이터 초기화"""
        # 샘플 품질 테스트
        self.quality_tests = [
            {
                'id': 'test-1',
                'name': '감정 분석 정확도 테스트',
                'type': 'accuracy',
                'category': 'ai_model',
                'priority': 'high',
                'status': 'passed',
                'created_at': datetime.now().isoformat()
            },
            {
                'id': 'test-2',
                'name': 'API 응답 시간 테스트',
                'type': 'performance',
                'category': 'api',
                'priority': 'medium',
                'status': 'passed',
                'created_at': datetime.now().isoformat()
            }
        ]
        
        # 고급 테스트 스위트
        self.quality_test_suites = [
            {
                'id': 'functional-test-suite',
                'name': 'AI 기능 테스트 스위트',
                'description': 'AI 서비스의 기능적 정확성을 검증하는 테스트',
                'category': 'functional',
                'test_cases': [
                    {
                        'id': 'accuracy-test',
                        'name': '응답 정확성 테스트',
                        'description': 'AI 응답의 정확성을 검증',
                        'test_type': 'functional',
                        'input_data': {'question': '오늘 날씨는 어떤가요?'},
                        'expected_output': {'accuracy': 0.9},
                        'validation_rules': [
                            {
                                'id': 'accuracy-rule',
                                'name': '정확성 기준',
                                'rule_type': 'accuracy',
                                'condition': 'accuracy >= 0.85',
                                'threshold': 0.85,
                                'operator': 'greater_than',
                                'severity': 'high'
                            }
                        ],
                        'timeout_ms': 5000,
                        'retry_count': 3,
                        'tags': ['accuracy', 'functional']
                    }
                ],
                'execution_schedule': '0 */6 * * *',
                'priority': 'critical',
                'created_date': datetime.now(),
                'last_executed': datetime.now(),
                'status': 'active'
            },
            {
                'id': 'performance-test-suite',
                'name': 'AI 성능 테스트 스위트',
                'description': 'AI 서비스의 성능을 검증하는 테스트',
                'category': 'performance',
                'test_cases': [
                    {
                        'id': 'response-time-test',
                        'name': '응답 시간 테스트',
                        'description': 'AI 서비스의 응답 시간을 측정',
                        'test_type': 'performance',
                        'input_data': {'question': '간단한 질문입니다.'},
                        'expected_output': {'response_time': 500},
                        'validation_rules': [
                            {
                                'id': 'response-time-rule',
                                'name': '응답 시간 기준',
                                'rule_type': 'response_time',
                                'condition': 'response_time <= 1000',
                                'threshold': 1000,
                                'operator': 'less_than',
                                'severity': 'high'
                            }
                        ],
                        'timeout_ms': 2000,
                        'retry_count': 3,
                        'tags': ['performance', 'response-time']
                    }
                ],
                'execution_schedule': '0 */12 * * *',
                'priority': 'high',
                'created_date': datetime.now(),
                'last_executed': datetime.now(),
                'status': 'active'
            },
            {
                'id': 'security-test-suite',
                'name': 'AI 보안 테스트 스위트',
                'description': 'AI 서비스의 보안을 검증하는 테스트',
                'category': 'security',
                'test_cases': [
                    {
                        'id': 'injection-test',
                        'name': '인젝션 공격 테스트',
                        'description': 'SQL 인젝션 및 기타 인젝션 공격 방어 테스트',
                        'test_type': 'security',
                        'input_data': {'malicious_input': "'; DROP TABLE users; --"},
                        'expected_output': {'vulnerability_score': 0},
                        'validation_rules': [
                            {
                                'id': 'injection-rule',
                                'name': '인젝션 방어 기준',
                                'rule_type': 'security',
                                'condition': 'vulnerability_score <= 0.1',
                                'threshold': 0.1,
                                'operator': 'less_than',
                                'severity': 'critical'
                            }
                        ],
                        'timeout_ms': 5000,
                        'retry_count': 2,
                        'tags': ['security', 'injection']
                    }
                ],
                'execution_schedule': '0 0 * * *',
                'priority': 'critical',
                'created_date': datetime.now(),
                'last_executed': datetime.now(),
                'status': 'active'
            }
        ]
        
        # 테스트 실행 데이터
        self.quality_test_executions = [
            {
                'id': 'exec-running-1',
                'test_suite_id': 'functional-test-suite',
                'start_time': datetime.now(),
                'status': 'running',
                'progress_percentage': 65,
                'current_test_case': '응답 정확성 테스트',
                'results': [],
                'summary': {
                    'total_tests': 5,
                    'completed_tests': 3,
                    'passed_tests': 2,
                    'failed_tests': 1,
                    'average_execution_time': 850,
                    'quality_score': 0.82,
                    'performance_score': 0.78
                }
            }
        ]
        
        # 테스트 결과 데이터
        self.quality_test_results = [
            {
                'id': 'result-1',
                'test_case_id': 'accuracy-test',
                'test_suite_id': 'functional-test-suite',
                'execution_id': 'exec-1',
                'timestamp': datetime.now(),
                'status': 'passed',
                'execution_time_ms': 1250,
                'actual_output': {'accuracy': 0.92},
                'validation_results': [
                    {
                        'rule_id': 'accuracy-rule',
                        'rule_name': '정확성 기준',
                        'status': 'passed',
                        'actual_value': 0.92,
                        'expected_value': 0.85,
                        'deviation': 0.07,
                        'message': '정확도: 0.920 (기준: 0.85)'
                    }
                ],
                'performance_metrics': {
                    'response_time_ms': 245,
                    'memory_usage_mb': 85,
                    'cpu_usage_percent': 45,
                    'throughput_rps': 95,
                    'error_rate': 0.02,
                    'availability': 0.99
                },
                'quality_score': 0.94
            },
            {
                'id': 'result-2',
                'test_case_id': 'response-time-test',
                'test_suite_id': 'performance-test-suite',
                'execution_id': 'exec-2',
                'timestamp': datetime.now(),
                'status': 'failed',
                'execution_time_ms': 1850,
                'actual_output': {'response_time': 1200},
                'validation_results': [
                    {
                        'rule_id': 'response-time-rule',
                        'rule_name': '응답 시간 기준',
                        'status': 'failed',
                        'actual_value': 1200,
                        'expected_value': 1000,
                        'deviation': 200,
                        'message': '응답 시간: 1200ms (기준: 1000ms 이하)'
                    }
                ],
                'performance_metrics': {
                    'response_time_ms': 1200,
                    'memory_usage_mb': 120,
                    'cpu_usage_percent': 75,
                    'throughput_rps': 65,
                    'error_rate': 0.08,
                    'availability': 0.95
                },
                'quality_score': 0.68
            }
        ]
        
        # 성능 메트릭 데이터
        self.quality_performance_metrics = [
            {
                'timestamp': datetime.now(),
                'response_time_ms': 325,
                'memory_usage_mb': 95,
                'cpu_usage_percent': 55,
                'throughput_rps': 85,
                'error_rate': 0.04,
                'availability': 0.98
            }
        ]
        
        # 품질 트렌드 데이터
        self.quality_trends = [
            {
                'date': datetime.now(),
                'quality_score': 0.88,
                'test_count': 15,
                'pass_rate': 0.93,
                'performance_score': 0.82
            },
            {
                'date': datetime.now(),
                'quality_score': 0.85,
                'test_count': 15,
                'pass_rate': 0.90,
                'performance_score': 0.78
            },
            {
                'date': datetime.now(),
                'quality_score': 0.82,
                'test_count': 15,
                'pass_rate': 0.87,
                'performance_score': 0.75
            }
        ]
        
        # 샘플 품질 메트릭
        self.quality_metrics = {
            'total_test_suites': 3,
            'active_test_suites': 3,
            'total_test_cases': 15,
            'last_execution_date': datetime.now(),
            'overall_pass_rate': 0.89,
            'average_quality_score': 0.85,
            'critical_failures': 1,
            'performance_degradation': 0.05,
            'test_coverage': 92.5,
            'automation_rate': 98.5
        }
        
        # 샘플 품질 보고서
        self.quality_reports = [
            {
                'id': 'report-1',
                'title': '주간 품질 보고서',
                'summary': '모든 테스트가 성공적으로 통과했습니다.',
                'status': 'completed',
                'created_at': datetime.now().isoformat()
            }
        ]

# CORBU.AI 인스턴스 생성


corbu_ai = CORBUAI()

# 전역 에러 핸들러


@app.errorhandler(404)
def not_found(error):
    logger.warning(f"404 에러: {request.url}")
    return jsonify({
        'success': False,
        'error': '요청한 리소스를 찾을 수 없습니다.',
        'code': 404,
        'timestamp': datetime.now().isoformat()
    }), 404



@app.errorhandler(500)
def internal_error(error):
    logger.error(f"500 에러: {str(error)}")
    return jsonify({
        'success': False,
        'error': '서버 내부 오류가 발생했습니다.',
        'code': 500,
        'timestamp': datetime.now().isoformat()
    }), 500



@app.errorhandler(Exception)
def handle_exception(e):
    logger.error(f"예상치 못한 에러: {str(e)}")
    return jsonify({
        'success': False,
        'error': '예상치 못한 오류가 발생했습니다.',
        'code': 500,
        'timestamp': datetime.now().isoformat()
    }), 500

# API 라우트


@app.route('/api/chat', methods=['POST'])
def chat():
    """채팅 API"""
    start_time = datetime.now()
    try:
        data = request.get_json()
        message = data.get('message', '')
        session_id = data.get('session_id', str(uuid.uuid4()))
        
        if not message:
            return jsonify({'error': '메시지가 필요합니다.'}), 400
        
        # 사용자 메시지를 데이터베이스에 저장
        user_message_id = str(uuid.uuid4())
        save_message(user_message_id, session_id, message, True)
        
        # 품질 보증 관련 질문인지 확인
        quality_keywords = [
            '품질', 'quality', '테스트', 'test', '메트릭', 'metrics',
            '성능', 'performance', '보고서', 'report', '트렌드',
            'trend', '실행', 'execution'
        ]
        is_quality_question = any(keyword in message.lower() 
                                 for keyword in quality_keywords)
        
        if is_quality_question:
            # 품질 보증 관련 질문 처리
            response = corbu_ai.analyze_quality_question(message)
            response_type = 'quality_assurance'
        else:
            # 고급 AI 분석 수행
            emotion_analysis = ai_analyzer.analyze_emotion(message)
            intent_analysis = ai_analyzer.analyze_intent(message)
            
            # 일반 채팅 처리 - 실제 AI 답변 생성
            base_response = generate_ai_response(message, session_id)
            
            # 감정과 의도에 따른 개인화된 응답 생성
            personalized_response = ai_analyzer.generate_personalized_response(
                message, emotion_analysis, intent_analysis
            )
            
            # 두 응답을 결합
            response = f"{personalized_response}\n\n{base_response}"
            response_type = 'ai_chat_advanced'
            
            # 고도화된 대화 컨텍스트 업데이트
            analysis = analyze_complex_message(message)
            context_manager.update_context(session_id, message, analysis, response)
        
        # AI 응답을 데이터베이스에 저장
        ai_message_id = str(uuid.uuid4())
        save_message(ai_message_id, session_id, response, False)
        
        # 세션 정보 저장
        session_title = (
            message[:30] + '...' if len(message) > 30 else message
        )
        save_chat_session(session_id, session_title)
        
        # 성능 메트릭 업데이트
        response_time = (datetime.now() - start_time).total_seconds()
        update_performance_metrics(response_time, True)
        
        # 응답 데이터 구성
        response_data = {
            'success': True,
            'response': response,
            'type': response_type,
            'session_id': session_id,
            'timestamp': datetime.now().isoformat(),
            'response_time': response_time
        }
        
        # 고급 AI 분석 정보 추가
        if response_type == 'ai_chat_advanced':
            try:
                response_data.update({
                    'emotion_analysis': {
                        'emotion': emotion_analysis.emotion.value,
                        'confidence': float(emotion_analysis.confidence),
                        'intensity': float(emotion_analysis.intensity),
                        'keywords': emotion_analysis.keywords
                    },
                    'intent_analysis': {
                        'intent': intent_analysis.intent.value,
                        'confidence': float(intent_analysis.confidence),
                        'entities': intent_analysis.entities,
                        'context': intent_analysis.context
                    }
                })
            except Exception as e:
                logger.error(f"분석 정보 직렬화 오류: {e}")
                # 분석 정보 없이 기본 응답만 반환
        
        return jsonify(response_data)
    except Exception as e:
        logger.error(f"채팅 API 오류: {e}")
        response_time = (datetime.now() - start_time).total_seconds()
        update_performance_metrics(response_time, False)
        return jsonify({'error': str(e)}), 500

# AI 감정 인식 시스템 API


@app.route('/api/emotion-recognition/analyze', methods=['POST'])
def analyze_emotion():
    """감정 분석 API"""
    try:
        data = request.get_json()
        content = data.get('content', '')
        analysis_type = data.get('type', 'text')
        context = data.get('context', {})
        
        if not content:
            return jsonify({'error': '분석할 내용이 필요합니다.'}), 400
        
        emotion_result = corbu_ai.analyze_emotion(content, analysis_type, context)
        
        return jsonify({
            'success': True,
            'data': emotion_result,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"감정 분석 API 오류: {e}")
        return jsonify({'error': str(e)}), 500



@app.route('/api/emotion-recognition/generate-response', 
           methods=['POST'])
def generate_emotional_response():
    """감정 기반 응답 생성 API"""
    try:
        data = request.get_json()
        emotion_data = data.get('emotion_data', {})
        user_context = data.get('user_context', {})
        
        if not emotion_data:
            return jsonify({'error': '감정 데이터가 필요합니다.'}), 400
        
        response = corbu_ai.generate_emotional_response(emotion_data, user_context)
        
        return jsonify({
            'success': True,
            'data': response,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"감정 응답 생성 API 오류: {e}")
        return jsonify({'error': str(e)}), 500



@app.route('/api/emotion-recognition/patterns', methods=['GET'])
def get_emotion_patterns():
    """감정 패턴 조회 API"""
    try:
        user_id = request.args.get('user_id', '')
        limit = int(request.args.get('limit', 50))
        
        patterns = corbu_ai.get_emotion_patterns(user_id, limit)
        
        return jsonify({
            'success': True,
            'data': patterns,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"감정 패턴 조회 API 오류: {e}")
        return jsonify({'error': str(e)}), 500



@app.route('/api/emotion-recognition/metrics', methods=['GET'])
def get_emotion_metrics():
    """감정 인식 메트릭 조회 API"""
    try:
        metrics = corbu_ai.get_emotion_metrics()
        
        return jsonify({
            'success': True,
            'data': metrics,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"감정 메트릭 조회 API 오류: {e}")
        return jsonify({'error': str(e)}), 500



@app.route('/api/emotion-recognition/config', 
           methods=['GET', 'PUT'])
def emotion_recognition_config():
    """감정 인식 설정 관리 API"""
    try:
        if request.method == 'GET':
            config = corbu_ai.get_emotion_config()
            return jsonify({
                'success': True,
                'data': config,
                'timestamp': datetime.now().isoformat()
            })
        else:
            data = request.get_json()
            updated_config = corbu_ai.update_emotion_config(data)
        return jsonify({
            'success': True,
                'data': updated_config,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"감정 설정 관리 API 오류: {e}")
        return jsonify({'error': str(e)}), 500

# AI 데이터 분석 시스템 API


@app.route('/api/data-analytics/sources', 
           methods=['GET', 'POST'])
def data_analytics_sources():
    """데이터 소스 관리 API"""
    try:
        if request.method == 'GET':
            sources = corbu_ai.get_data_sources()
            return jsonify(sources)
        else:
            data = request.get_json()
            source = corbu_ai.create_data_source(data)
            return jsonify(source)
    except Exception as e:
        logger.error(f"데이터 소스 관리 API 오류: {e}")
        return jsonify({'error': str(e)}), 500



@app.route('/api/data-analytics/analyses', 
           methods=['GET', 'POST'])
def data_analytics_analyses():
    """데이터 분석 작업 관리 API"""
    try:
        if request.method == 'GET':
            analyses = corbu_ai.get_data_analyses()
            return jsonify(analyses)
        else:
            data = request.get_json()
            analysis = corbu_ai.create_data_analysis(data)
            return jsonify(analysis)
    except Exception as e:
        logger.error(f"데이터 분석 작업 관리 API 오류: {e}")
        return jsonify({'error': str(e)}), 500



@app.route('/api/data-analytics/visualizations', 
           methods=['GET', 'POST'])
def data_analytics_visualizations():
    """데이터 시각화 관리 API"""
    try:
        if request.method == 'GET':
            visualizations = corbu_ai.get_data_visualizations()
            return jsonify(visualizations)
        else:
            data = request.get_json()
            visualization = corbu_ai.create_data_visualization(data)
            return jsonify(visualization)
    except Exception as e:
        logger.error(f"데이터 시각화 관리 API 오류: {e}")
        return jsonify({'error': str(e)}), 500



@app.route('/api/data-analytics/insights', methods=['GET'])
def data_analytics_insights():
    """데이터 인사이트 조회 API"""
    try:
        insights = corbu_ai.get_data_insights()
        return jsonify(insights)
    except Exception as e:
        logger.error(f"데이터 인사이트 조회 API 오류: {e}")
        return jsonify({'error': str(e)}), 500



@app.route('/api/data-analytics/metrics', methods=['GET'])
def data_analytics_metrics():
    """데이터 분석 메트릭 조회 API"""
    try:
        metrics = corbu_ai.get_data_analytics_metrics()
        return jsonify(metrics)
    except Exception as e:
        logger.error(f"데이터 분석 메트릭 조회 API 오류: {e}")
        return jsonify({'error': str(e)}), 500

# AI 품질 보증 시스템 API


@app.route('/api/quality-assurance/tests', 
           methods=['GET', 'POST'])
def quality_assurance_tests():
    """품질 테스트 관리 API"""
    try:
        if request.method == 'GET':
            tests = corbu_ai.get_quality_tests()
            return jsonify(tests)
        else:
            data = request.get_json()
            test = corbu_ai.create_quality_test(data)
            return jsonify(test)
    except Exception as e:
        logger.error(f"품질 테스트 관리 API 오류: {e}")
        return jsonify({'error': str(e)}), 500



@app.route('/api/quality-assurance/test-suites', 
           methods=['GET', 'POST'])
def quality_assurance_test_suites():
    """테스트 스위트 관리 API"""
    try:
        if request.method == 'GET':
            test_suites = corbu_ai.get_quality_test_suites()
            return jsonify(test_suites)
        else:
            data = request.get_json()
            test_suite = corbu_ai.create_quality_test_suite(data)
            return jsonify(test_suite)
    except Exception as e:
        logger.error(f"테스트 스위트 관리 API 오류: {e}")
        return jsonify({'error': str(e)}), 500



@app.route('/api/quality-assurance/test-executions', 
           methods=['GET', 'POST'])
def quality_assurance_test_executions():
    """테스트 실행 관리 API"""
    try:
        if request.method == 'GET':
            executions = corbu_ai.get_quality_test_executions()
            return jsonify(executions)
        else:
            data = request.get_json()
            execution = corbu_ai.create_quality_test_execution(data)
            return jsonify(execution)
    except Exception as e:
        logger.error(f"테스트 실행 관리 API 오류: {e}")
        return jsonify({'error': str(e)}), 500



@app.route('/api/quality-assurance/test-results', methods=['GET'])
def quality_assurance_test_results():
    """테스트 결과 조회 API"""
    try:
        results = corbu_ai.get_quality_test_results()
        return jsonify(results)
    except Exception as e:
        logger.error(f"테스트 결과 조회 API 오류: {e}")
        return jsonify({'error': str(e)}), 500



@app.route('/api/quality-assurance/performance-metrics', 
           methods=['GET'])
def quality_assurance_performance_metrics():
    """성능 메트릭 조회 API"""
    try:
        metrics = corbu_ai.get_quality_performance_metrics()
        return jsonify(metrics)
    except Exception as e:
        logger.error(f"성능 메트릭 조회 API 오류: {e}")
        return jsonify({'error': str(e)}), 500



@app.route('/api/quality-assurance/quality-trends', methods=['GET'])
def quality_assurance_quality_trends():
    """품질 트렌드 조회 API"""
    try:
        trends = corbu_ai.get_quality_trends()
        return jsonify(trends)
    except Exception as e:
        logger.error(f"품질 트렌드 조회 API 오류: {e}")
        return jsonify({'error': str(e)}), 500



@app.route('/api/quality-assurance/automated-execution', 
           methods=['POST'])
def quality_assurance_automated_execution():
    """자동화된 테스트 실행 API"""
    try:
        data = request.get_json()
        execution = corbu_ai.start_automated_quality_test(data)
        return jsonify(execution)
    except Exception as e:
        logger.error(f"자동화된 테스트 실행 API 오류: {e}")
        return jsonify({'error': str(e)}), 500



@app.route('/api/quality-assurance/execution/<execution_id>/status', 
           methods=['GET'])
def quality_assurance_execution_status(execution_id):
    """테스트 실행 상태 조회 API"""
    try:
        status = corbu_ai.get_quality_execution_status(execution_id)
        return jsonify(status)
    except Exception as e:
        logger.error(f"테스트 실행 상태 조회 API 오류: {e}")
        return jsonify({'error': str(e)}), 500



@app.route('/api/quality-assurance/execution/<execution_id>/stop', 
           methods=['POST'])
def quality_assurance_stop_execution(execution_id):
    """테스트 실행 중지 API"""
    try:
        result = corbu_ai.stop_quality_execution(execution_id)
        return jsonify(result)
    except Exception as e:
        logger.error(f"테스트 실행 중지 API 오류: {e}")
        return jsonify({'error': str(e)}), 500



@app.route('/api/quality-assurance/metrics', methods=['GET'])
def quality_assurance_metrics():
    """품질 보증 메트릭 조회 API"""
    try:
        metrics = corbu_ai.get_quality_metrics()
        return jsonify(metrics)
    except Exception as e:
        logger.error(f"품질 보증 메트릭 조회 API 오류: {e}")
        return jsonify({'error': str(e)}), 500



@app.route('/api/quality-assurance/reports', methods=['GET'])
def quality_assurance_reports():
    """품질 보고서 조회 API"""
    try:
        reports = corbu_ai.get_quality_reports()
        return jsonify(reports)
    except Exception as e:
        logger.error(f"품질 보고서 조회 API 오류: {e}")
        return jsonify({'error': str(e)}), 500



@app.route('/api/quality-assurance/reports/generate', 
           methods=['POST'])
def quality_assurance_generate_report():
    """품질 보고서 생성 API"""
    try:
        data = request.get_json()
        report = corbu_ai.generate_quality_report(data)
        return jsonify(report)
    except Exception as e:
        logger.error(f"품질 보고서 생성 API 오류: {e}")
        return jsonify({'error': str(e)}), 500



@app.route('/api/performance-optimization/metrics', 
           methods=['GET'])
def get_performance_metrics():
    """성능 메트릭 조회 API"""
    return jsonify(corbu_ai.get_performance_metrics())



@app.route('/api/performance-optimization/metrics', 
           methods=['POST'])
def create_performance_metric():
    """성능 메트릭 생성 API"""
    data = request.get_json()
    return jsonify(corbu_ai.create_performance_metric(data))



@app.route('/api/performance-optimization/rules', methods=['GET'])
def get_optimization_rules():
    """최적화 규칙 조회 API"""
    return jsonify(corbu_ai.get_optimization_rules())



@app.route('/api/performance-optimization/rules', methods=['POST'])
def create_optimization_rule():
    """최적화 규칙 생성 API"""
    data = request.get_json()
    return jsonify(corbu_ai.create_optimization_rule(data))



@app.route('/api/performance-optimization/health', methods=['GET'])
def get_system_health():
    """시스템 상태 조회 API"""
    return jsonify(corbu_ai.get_system_health())



@app.route('/api/performance-optimization/optimize', 
           methods=['POST'])
def perform_manual_optimization():
    """수동 최적화 수행 API"""
    data = request.get_json()
    return jsonify(corbu_ai.perform_manual_optimization(data))



@app.route('/api/performance-optimization/report', methods=['GET'])
def get_performance_report():
    """성능 보고서 생성 API"""
    return jsonify(corbu_ai.get_performance_report())



@app.route('/', methods=['GET'])
def root():
    """루트 엔드포인트"""
    return jsonify({
        "message": "CORBU.AI 백엔드 서버가 정상적으로 실행 중입니다.",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "chat": "/api/chat",
            "emotion_recognition": "/api/emotion-recognition/analyze",
            "data_analytics": "/api/data-analytics/sources"
        }
    })



@app.route('/api/upload', methods=['POST'])
def upload_file():
    """파일 업로드 및 분석"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': '파일이 선택되지 않았습니다.'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': '파일이 선택되지 않았습니다.'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # 파일 분석
            analysis_result = analyze_uploaded_file(filepath, filename)
            
            return jsonify({
                'success': True,
                'filename': filename,
                'filepath': filepath,
                'analysis': analysis_result,
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({'error': '허용되지 않는 파일 형식입니다.'}), 400
            
    except Exception as e:
        logger.error(f"파일 업로드 오류: {e}")
        return jsonify({'error': '파일 업로드 중 오류가 발생했습니다.'}), 500

def analyze_uploaded_file(filepath: str, filename: str) -> dict:
    """업로드된 파일 분석"""
    try:
        file_ext = filename.split('.')[-1].lower()
        
        if file_ext == 'txt':
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            return {
                'type': 'text',
                'size': len(content),
                'word_count': len(content.split()),
                'summary': f"텍스트 파일입니다. 총 {len(content)}자, {len(content.split())}단어가 포함되어 있습니다."
            }
        
        elif file_ext in ['jpg', 'jpeg', 'png', 'gif']:
            return {
                'type': 'image',
                'summary': f"이미지 파일입니다. 이미지 분석 기능은 추후 추가될 예정입니다."
            }
        
        elif file_ext == 'pdf':
            return {
                'type': 'pdf',
                'summary': f"PDF 파일입니다. PDF 분석 기능은 추후 추가될 예정입니다."
            }
        
        else:
            return {
                'type': 'unknown',
                'summary': f"{file_ext.upper()} 파일입니다. 이 파일 형식에 대한 분석 기능은 아직 지원되지 않습니다."
            }
            
    except Exception as e:
        logger.error(f"파일 분석 오류: {e}")
        return {
            'type': 'error',
            'summary': '파일 분석 중 오류가 발생했습니다.'
        }

@app.route('/api/health', methods=['GET'])
def health_check():
    """헬스 체크 엔드포인트"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "CORBU.AI Backend",
        "version": "2.0.0",
        "uptime": "running"
    })

@app.route('/api/status', methods=['GET'])
def system_status():
    """시스템 상태 및 성능 메트릭 조회"""
    return jsonify(get_system_status())

@app.route('/api/analyze', methods=['POST'])
def analyze_text():
    """고급 AI 텍스트 분석 API"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': '분석할 텍스트가 필요합니다.'}), 400
        
        # 감정 분석
        emotion_analysis = ai_analyzer.analyze_emotion(text)
        
        # 의도 분석
        intent_analysis = ai_analyzer.analyze_intent(text)
        
        # 개인화된 응답 생성
        personalized_response = ai_analyzer.generate_personalized_response(
            text, emotion_analysis, intent_analysis
        )
        
        return jsonify({
            'success': True,
            'text': text,
            'emotion_analysis': {
                'emotion': emotion_analysis.emotion.value,
                'confidence': emotion_analysis.confidence,
                'intensity': emotion_analysis.intensity,
                'keywords': emotion_analysis.keywords
            },
            'intent_analysis': {
                'intent': intent_analysis.intent.value,
                'confidence': intent_analysis.confidence,
                'entities': intent_analysis.entities,
                'context': intent_analysis.context
            },
            'personalized_response': personalized_response,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"텍스트 분석 오류: {e}")
        return jsonify({'error': '분석 중 오류가 발생했습니다.'}), 500



@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    """시스템 메트릭 조회"""
    return jsonify({
        'total_requests': corbu_ai.total_requests,
        'successful_requests': corbu_ai.successful_requests,
        'failed_requests': corbu_ai.failed_requests,
        'average_response_time': corbu_ai.average_response_time,
        'active_sessions': len(corbu_ai.conversation_history),
        'timestamp': datetime.now().isoformat()
    })



@app.route('/api/sessions', methods=['GET'])
def get_sessions():
    """활성 세션 목록 조회"""
    sessions = []
    for i, session in enumerate(corbu_ai.conversation_history):
        sessions.append({
            'id': f'session_{i}',
            'created_at': session.get('timestamp', datetime.now().isoformat()),
            'message_count': len(session.get('messages', [])),
            'last_activity': session.get('last_activity', datetime.now().isoformat())
        })
    
    return jsonify({
        'sessions': sessions,
        'total_sessions': len(sessions),
        'timestamp': datetime.now().isoformat()
    })



@app.route('/api/sessions/<session_id>', methods=['DELETE'])
def delete_session(session_id):
    """특정 세션 삭제"""
    try:
        session_index = int(session_id.split('_')[1])
        if 0 <= session_index < len(corbu_ai.conversation_history):
            del corbu_ai.conversation_history[session_index]
            return jsonify({
                'message': '세션이 성공적으로 삭제되었습니다.',
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({
                'error': '세션을 찾을 수 없습니다.'
            }), 404
    except (ValueError, IndexError):
        return jsonify({
            'error': '잘못된 세션 ID입니다.'
        }), 400






@app.route('/api/files', methods=['GET'])
def list_files():
    """업로드된 파일 목록 조회"""
    try:
        files = []
        upload_folder = app.config['UPLOAD_FOLDER']
        
        if os.path.exists(upload_folder):
            for filename in os.listdir(upload_folder):
                file_path = os.path.join(upload_folder, filename)
                if os.path.isfile(file_path):
                    files.append({
                        'filename': filename,
                        'size': os.path.getsize(file_path),
                        'modified_time': datetime.fromtimestamp(
                            os.path.getmtime(file_path)
                        ).isoformat()
                    })
        
        return jsonify({
            'files': files,
            'total_files': len(files),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"파일 목록 조회 오류: {str(e)}")
        return jsonify({'error': '파일 목록 조회 중 오류가 발생했습니다.'}), 500



@app.route('/api/files/<filename>', methods=['DELETE'])
def delete_file(filename):
    """파일 삭제"""
    try:
        file_path = os.path.join(
            app.config['UPLOAD_FOLDER'], filename
        )
        
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"파일 삭제 성공: {filename}")
            return jsonify({
                'message': '파일이 성공적으로 삭제되었습니다.',
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({'error': '파일을 찾을 수 없습니다.'}), 404
            
    except Exception as e:
        logger.error(f"파일 삭제 오류: {str(e)}")
        return jsonify({'error': '파일 삭제 중 오류가 발생했습니다.'}), 500



@app.route('/api/monitoring/dashboard', methods=['GET'])
@require_api_key
def monitoring_dashboard():
    """모니터링 대시보드 데이터"""
    try:
        conn = sqlite3.connect('corbu_ai.db')
        cursor = conn.cursor()
        
        # 총 요청 수
        cursor.execute('SELECT COUNT(*) FROM api_logs')
        total_requests = cursor.fetchone()[0]
        
        # 성공/실패 요청 수
        cursor.execute(
            'SELECT COUNT(*) FROM api_logs WHERE status_code < 400'
        )
        successful_requests = cursor.fetchone()[0]
        
        cursor.execute(
            'SELECT COUNT(*) FROM api_logs WHERE status_code >= 400'
        )
        failed_requests = cursor.fetchone()[0]
        
        # 평균 응답 시간
        cursor.execute(
            'SELECT AVG(response_time) FROM api_logs '
            'WHERE response_time IS NOT NULL'
        )
        avg_response_time = cursor.fetchone()[0] or 0
        
        # 활성 세션 수
        cursor.execute('SELECT COUNT(*) FROM chat_sessions')
        active_sessions = cursor.fetchone()[0]
        
        # 총 메시지 수
        cursor.execute('SELECT COUNT(*) FROM messages')
        total_messages = cursor.fetchone()[0]
        
        # 최근 24시간 요청 트렌드
        cursor.execute('''
            SELECT strftime('%H', timestamp) as hour, COUNT(*) as count
            FROM api_logs
            WHERE timestamp >= datetime('now', '-24 hours')
            GROUP BY hour
            ORDER BY hour
        ''')
        hourly_requests = {
            row[0]: row[1] for row in cursor.fetchall()
        }
        
        # 상위 엔드포인트
        cursor.execute('''
            SELECT endpoint, COUNT(*) as count
            FROM api_logs
            GROUP BY endpoint
            ORDER BY count DESC
            LIMIT 10
        ''')
        top_endpoints = [
            {'endpoint': row[0], 'count': row[1]} 
            for row in cursor.fetchall()
        ]
        
        conn.close()
        
        return jsonify({
            'dashboard': {
                'total_requests': total_requests,
                'successful_requests': successful_requests,
                'failed_requests': failed_requests,
                'success_rate': (successful_requests / total_requests * 100) if total_requests > 0 else 0,
                'average_response_time': round(avg_response_time, 3),
                'active_sessions': active_sessions,
                'total_messages': total_messages,
                'hourly_requests': hourly_requests,
                'top_endpoints': top_endpoints
            },
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"모니터링 대시보드 오류: {str(e)}")
        return jsonify({'error': '모니터링 데이터 조회 중 오류가 발생했습니다.'}), 500



@app.route('/api/monitoring/logs', methods=['GET'])
@require_api_key
def get_api_logs():
    """API 로그 조회"""
    try:
        limit = request.args.get('limit', 100, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        conn = sqlite3.connect('corbu_ai.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT api_key, endpoint, method, status_code, 
                   response_time, timestamp, ip_address, user_agent
            FROM api_logs
            ORDER BY timestamp DESC
            LIMIT ? OFFSET ?
        ''', (limit, offset))
        
        logs = []
        for row in cursor.fetchall():
            # 보안을 위해 API 키 일부만 표시
            api_key_display = (
                row[0][:8] + '...' if row[0] else 'anonymous'
            )
            # 길이 제한
            user_agent_display = (
                row[7][:50] + '...' if len(row[7]) > 50 else row[7]
            )
            logs.append({
                'api_key': api_key_display,
                'endpoint': row[1],
                'method': row[2],
                'status_code': row[3],
                'response_time': row[4],
                'timestamp': row[5],
                'ip_address': row[6],
                'user_agent': user_agent_display
            })
        
        # 총 로그 수
        cursor.execute('SELECT COUNT(*) FROM api_logs')
        total_logs = cursor.fetchone()[0]
        
        conn.close()
        
        return jsonify({
            'logs': logs,
            'total_logs': total_logs,
            'limit': limit,
            'offset': offset,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"API 로그 조회 오류: {str(e)}")
        return jsonify({'error': 'API 로그 조회 중 오류가 발생했습니다.'}), 500



@app.route('/api/monitoring/health', methods=['GET'])
def system_health():
    """시스템 헬스 체크"""
    try:
        # 데이터베이스 연결 테스트
        conn = sqlite3.connect('corbu_ai.db')
        cursor = conn.cursor()
        cursor.execute('SELECT 1')
        db_status = 'healthy'
        conn.close()
    except Exception as e:
        db_status = f'unhealthy: {str(e)}'
    
        # 디스크 사용량 체크
        try:
            import shutil
            disk_usage = shutil.disk_usage('/')
            disk_free_gb = disk_usage.free / (1024**3)
            disk_status = (
                'healthy' if disk_free_gb > 1 else 'low_space'
            )
        except Exception:
            disk_status = 'unknown'
    
    return jsonify({
        'status': 'healthy',
        'components': {
            'database': db_status,
            'disk_space': disk_status,
            'api_server': 'healthy'
        },
        'timestamp': datetime.now().isoformat(),
        'version': '2.0.0'
    })



@app.route('/api/status', methods=['GET'])
def get_status():
    """시스템 상태 조회 엔드포인트"""
    try:
        status = {
            "status": "running",
            "version": "1.0.0",
            "timestamp": datetime.now().isoformat(),
            "services": {
                "chat": "active",
                "emotion_recognition": "active",
                "data_analytics": "active",
                "quality_assurance": "active",
                "performance_optimization": "active"
            },
            "uptime": "24h 15m 30s",
            "memory_usage": "45%",
            "cpu_usage": "23%"
        }
        return jsonify(status)
    except Exception as e:
        logger.error(f"상태 조회 오류: {e}")
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

# ===== 메시지 관련 API 엔드포인트 =====


@app.route('/api/message-formats', methods=['GET'])
def get_message_formats():
    """메시지 형식 목록 조회"""
    try:
        formats = [
            {"id": "formal", "name": "정중한 형식", "description": "비즈니스나 공식적인 상황에 적합"},
            {"id": "casual", "name": "친근한 형식", "description": "일상적인 대화에 적합"},
            {"id": "persuasive", "name": "설득적 형식", "description": "설득이나 권유에 적합"},
            {"id": "informative", "name": "정보 전달 형식", "description": "정보나 설명에 적합"},
            {"id": "creative", "name": "창의적 형식", "description": "창의적이고 독창적인 표현에 적합"}
        ]
        return jsonify({
            "success": True,
            "formats": formats,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"메시지 형식 조회 오류: {e}")
        return jsonify({"success": False, "error": str(e)}), 500



@app.route('/api/strategies', methods=['GET'])
def get_strategies():
    """전략 목록 조회"""
    try:
        strategies = [
            {"id": "emotional", "name": "감정적 전략", "description": "감정에 호소하는 방식"},
            {"id": "logical", "name": "논리적 전략", "description": "논리와 근거를 바탕으로 한 방식"},
            {"id": "social", "name": "사회적 전략", "description": "사회적 증명이나 동조심을 활용"},
            {"id": "urgency", "name": "긴급성 전략", "description": "시간의 제약이나 기회의 한정성을 강조"},
            {"id": "authority", "name": "권위 전략", "description": "전문성이나 권위를 활용"}
        ]
        return jsonify({
            "success": True,
            "strategies": strategies,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"전략 조회 오류: {e}")
        return jsonify({"success": False, "error": str(e)}), 500



@app.route('/api/tones', methods=['GET'])
def get_tones():
    """톤 목록 조회"""
    try:
        tones = [
            {"id": "professional", "name": "전문적", "description": "전문적이고 신뢰할 수 있는 톤"},
            {"id": "friendly", "name": "친근한", "description": "따뜻하고 친근한 톤"},
            {"id": "authoritative", "name": "권위적", "description": "강력하고 확신에 찬 톤"},
            {"id": "empathetic", "name": "공감적", "description": "이해하고 공감하는 톤"},
            {"id": "motivational", "name": "격려적", "description": "격려하고 동기부여하는 톤"}
        ]
        return jsonify({
            "success": True,
            "tones": tones,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"톤 조회 오류: {e}")
        return jsonify({"success": False, "error": str(e)}), 500



@app.route('/api/generate-ultimate-message', 
           methods=['POST'])
def generate_ultimate_message():
    """궁극적 메시지 생성"""
    try:
        data = request.get_json()
        message_content = data.get('content', '')
        format_type = data.get('format', 'casual')
        strategy = data.get('strategy', 'logical')
        tone = data.get('tone', 'friendly')
        
        # 메시지 생성 시뮬레이션
        generated_message = (
            f"[{format_type.upper()}] {message_content}\n\n"
            f"전략: {strategy}\n톤: {tone}\n\n"
            f"이 메시지는 {format_type} 형식으로 작성되었으며, "
            f"{strategy} 전략과 {tone} 톤을 사용했습니다."
        )
        
        return jsonify({
            "success": True,
            "message": {
                "id": f"msg-{datetime.now().timestamp()}",
                "content": generated_message,
                "format": format_type,
                "strategy": strategy,
                "tone": tone,
                "created_at": datetime.now().isoformat()
            },
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"메시지 생성 오류: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# ===== 보안 API 엔드포인트 =====


@app.route('/api/auth/login', methods=['POST'])
def auth_login():
    """사용자 로그인"""
    try:
        data = request.get_json()
        username = data.get('username', '')
        password = data.get('password', '')
        
        if not username or not password:
            return jsonify({
                'success': False,
                'error': '사용자명과 비밀번호를 입력해주세요.'
            }), 400
        
        # 간단한 인증 시뮬레이션
        # (실제로는 데이터베이스와 해시 검증 필요)
        if username == 'admin' and password == 'admin123':
            user = {
                'id': 'user-1',
                'username': username,
                'email': f'{username}@corbu.ai',
                'role': 'admin',
                'permissions': ['*'],
                'lastLogin': datetime.now().isoformat(),
                'isActive': True,
                'createdAt': datetime.now().isoformat()
            }
            
            token = {
                'accessToken': f'token-{datetime.now().timestamp()}',
                'refreshToken': f'refresh-{datetime.now().timestamp()}',
                'expiresIn': 3600,
                'tokenType': 'Bearer'
            }
            
            return jsonify({
                'success': True,
                'data': {
                    'user': user,
                    'token': token
                },
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({
                'success': False,
                'error': '잘못된 사용자명 또는 비밀번호입니다.'
            }), 401
            
    except Exception as e:
        logger.error(f"로그인 API 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500



@app.route('/api/auth/logout', methods=['POST'])
def auth_logout():
    """사용자 로그아웃"""
    try:
        data = request.get_json()
        refresh_token = data.get('refreshToken', '')
        
        # 토큰 무효화 로직
        # (실제로는 토큰 블랙리스트에 추가)
        logger.info(f"사용자 로그아웃: {refresh_token}")
        
        return jsonify({
            'success': True,
            'message': '로그아웃되었습니다.',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"로그아웃 API 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500



@app.route('/api/auth/register', methods=['POST'])
def auth_register():
    """사용자 회원가입"""
    try:
        data = request.get_json()
        username = data.get('username', '')
        email = data.get('email', '')
        password = data.get('password', '')
        confirm_password = data.get('confirmPassword', '')
        
        if not all([username, email, password, confirm_password]):
            return jsonify({
                'success': False,
                'error': '모든 필드를 입력해주세요.'
            }), 400
        
        if password != confirm_password:
            return jsonify({
                'success': False,
                'error': '비밀번호가 일치하지 않습니다.'
            }), 400
        
        # 사용자 생성 시뮬레이션
        user = {
            'id': f'user-{datetime.now().timestamp()}',
            'username': username,
            'email': email,
            'role': 'user',
            'permissions': ['read', 'write'],
            'isActive': True,
            'createdAt': datetime.now().isoformat()
        }
        
        return jsonify({
            'success': True,
            'data': {'user': user},
            'message': '회원가입이 완료되었습니다.',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"회원가입 API 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500



@app.route('/api/auth/refresh', methods=['POST'])
def auth_refresh():
    """토큰 갱신"""
    try:
        data = request.get_json()
        refresh_token = data.get('refreshToken', '')
        
        if not refresh_token:
            return jsonify({
                'success': False,
                'error': '리프레시 토큰이 필요합니다.'
            }), 400
        
        # 토큰 갱신 시뮬레이션
        new_token = {
            'accessToken': f'token-{datetime.now().timestamp()}',
            'refreshToken': f'refresh-{datetime.now().timestamp()}',
            'expiresIn': 3600,
            'tokenType': 'Bearer'
        }
        
        return jsonify({
            'success': True,
            'data': {'token': new_token},
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"토큰 갱신 API 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500



@app.route('/api/auth/change-password', methods=['POST'])
def auth_change_password():
    """비밀번호 변경"""
    try:
        data = request.get_json()
        current_password = data.get('currentPassword', '')
        new_password = data.get('newPassword', '')
        
        if not current_password or not new_password:
            return jsonify({
                'success': False,
                'error': '현재 비밀번호와 새 비밀번호를 입력해주세요.'
            }), 400
        
        # 비밀번호 변경 시뮬레이션
        return jsonify({
            'success': True,
            'message': '비밀번호가 성공적으로 변경되었습니다.',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"비밀번호 변경 API 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500



@app.route('/api/auth/reset-password', methods=['POST'])
def auth_reset_password():
    """비밀번호 재설정"""
    try:
        data = request.get_json()
        email = data.get('email', '')
        
        if not email:
            return jsonify({
                'success': False,
                'error': '이메일을 입력해주세요.'
            }), 400
        
        # 비밀번호 재설정 이메일 전송 시뮬레이션
        return jsonify({
            'success': True,
            'message': '비밀번호 재설정 링크가 이메일로 전송되었습니다.',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"비밀번호 재설정 API 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500



@app.route('/api/security/events', methods=['GET', 'POST'])
def security_events():
    """보안 이벤트 관리"""
    try:
        if request.method == 'GET':
            limit = int(request.args.get('limit', 100))
            
            # 보안 이벤트 시뮬레이션
            events = []
            for i in range(min(limit, 50)):
                event_type = (
                    'login' if i % 3 == 0 else
                    'failed_login' if i % 3 == 1 else 'logout'
                )
                events.append({
                    'id': f'event-{i}',
                    'type': event_type,
                    'userId': f'user-{i % 5}',
                    'ipAddress': f'192.168.1.{i % 255}',
                    'userAgent': ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                                'AppleWebKit/537.36'),
                    'timestamp': datetime.now().isoformat(),
                    'details': {
                        'reason': 'success' if i % 3 == 0 else 'invalid_password'
                    },
                    'severity': 'low' if i % 3 == 0 else 'medium'
                })
            
            return jsonify({
                'success': True,
                'data': events,
                'timestamp': datetime.now().isoformat()
            })
            
        else:  # POST
            data = request.get_json()
            
            # 보안 이벤트 저장 시뮬레이션
            event = {
                'id': f'event-{datetime.now().timestamp()}',
                'timestamp': datetime.now().isoformat(),
                **data
            }
            
            return jsonify({
                'success': True,
                'data': event,
                'message': '보안 이벤트가 기록되었습니다.',
                'timestamp': datetime.now().isoformat()
            })
            
    except Exception as e:
        logger.error(f"보안 이벤트 API 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500



@app.route('/api/security/metrics', methods=['GET'])
def security_metrics():
    """보안 메트릭 조회"""
    try:
        metrics = {
            'totalEvents': 1250,
            'failedLogins': 45,
            'suspiciousActivities': 12,
            'activeUsers': 89,
            'securityScore': 85,
            'lastUpdated': datetime.now().isoformat()
        }
        
        return jsonify({
            'success': True,
            'data': metrics,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"보안 메트릭 API 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500



@app.route('/api/security/config', methods=['GET', 'PUT'])
def security_config():
    """보안 설정 관리"""
    try:
        if request.method == 'GET':
            config = {
                'maxLoginAttempts': 5,
                'lockoutDuration': 15 * 60 * 1000,  # 15분
                'sessionTimeout': 30 * 60 * 1000,   # 30분
                'requireTwoFactor': False,
                'passwordPolicy': {
                    'minLength': 8,
                    'requireUppercase': True,
                    'requireLowercase': True,
                    'requireNumbers': True,
                    'requireSpecialChars': True
                },
                'encryptionEnabled': True,
                'auditLogging': True
            }
            
            return jsonify({
                'success': True,
                'data': config,
                'timestamp': datetime.now().isoformat()
            })
            
        else:  # PUT
            data = request.get_json()
            
            # 보안 설정 업데이트 시뮬레이션
            return jsonify({
                'success': True,
                'data': data,
                'message': '보안 설정이 업데이트되었습니다.',
                'timestamp': datetime.now().isoformat()
            })
            
    except Exception as e:
        logger.error(f"보안 설정 API 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500



if __name__ == '__main__':
    logger.info("🚀 CORBU.AI 백엔드 서버를 시작합니다...")
    logger.info("📍 서버 주소: http://localhost:5001")
    logger.info("🔗 프론트엔드: http://localhost:3000")
    
# =============================================================================
# 코드 편집 및 관리 API
# =============================================================================

@app.route('/api/files', methods=['GET'])
def get_files():
    """프로젝트 파일 목록 조회"""
    try:
        project_root = os.getcwd()
        files = []
        
        def scan_directory(path, level=0):
            items = []
            try:
                for item in os.listdir(path):
                    if item.startswith('.'):
                        continue
                    
                    item_path = os.path.join(path, item)
                    relative_path = os.path.relpath(item_path, project_root)
                    
                    if os.path.isdir(item_path):
                        # 폴더인 경우
                        folder_item = {
                            'name': item,
                            'path': relative_path,
                            'type': 'folder',
                            'expanded': False,
                            'children': []
                        }
                        
                        # 하위 항목 스캔 (최대 2단계까지만)
                        if level < 2:
                            try:
                                folder_item['children'] = scan_directory(item_path, level + 1)
                            except PermissionError:
                                pass
                        
                        items.append(folder_item)
                    else:
                        # 파일인 경우
                        if item.endswith(('.js', '.jsx', '.ts', '.tsx', '.py', '.css', '.html', '.json', '.md')):
                            file_item = {
                                'name': item,
                                'path': relative_path,
                                'type': 'file',
                                'size': os.path.getsize(item_path)
                            }
                            items.append(file_item)
            except PermissionError:
                pass
            
            return items
        
        files = scan_directory(project_root)
        return jsonify(files)
    
    except Exception as e:
        logger.error(f"파일 목록 조회 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/file', methods=['GET'])
def get_file_content():
    """파일 내용 조회"""
    try:
        file_path = request.args.get('path')
        if not file_path:
            return jsonify({'success': False, 'error': '파일 경로가 필요합니다'}), 400
        
        # 보안 검사
        if '..' in file_path or file_path.startswith('/'):
            return jsonify({'success': False, 'error': '잘못된 파일 경로입니다'}), 400
        
        full_path = os.path.join(os.getcwd(), file_path)
        
        if not os.path.exists(full_path):
            return jsonify({'success': False, 'error': '파일이 존재하지 않습니다'}), 404
        
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        return jsonify({
            'success': True,
            'content': content,
            'path': file_path,
            'size': len(content),
            'lines': len(content.split('\n'))
        })
    
    except Exception as e:
        logger.error(f"파일 내용 조회 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/save', methods=['POST'])
def save_file():
    """파일 저장"""
    try:
        data = request.get_json()
        file_path = data.get('path')
        content = data.get('content', '')
        
        if not file_path:
            return jsonify({'success': False, 'error': '파일 경로가 필요합니다'}), 400
        
        # 보안 검사
        if '..' in file_path or file_path.startswith('/'):
            return jsonify({'success': False, 'error': '잘못된 파일 경로입니다'}), 400
        
        full_path = os.path.join(os.getcwd(), file_path)
        
        # 백업 생성
        if os.path.exists(full_path):
            backup_dir = os.path.join(os.getcwd(), 'code_backups')
            os.makedirs(backup_dir, exist_ok=True)
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = os.path.basename(file_path)
            backup_filename = f"{filename}_{timestamp}.backup"
            backup_path = os.path.join(backup_dir, backup_filename)
            
            shutil.copy2(full_path, backup_path)
        
        # 파일 저장
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return jsonify({
            'success': True,
            'message': '파일이 저장되었습니다',
            'path': file_path,
            'size': len(content),
            'lines': len(content.split('\n'))
        })
    
    except Exception as e:
        logger.error(f"파일 저장 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/create-file', methods=['POST'])
def create_file():
    """새 파일 생성"""
    try:
        data = request.get_json()
        filename = data.get('name')
        file_type = data.get('type', 'jsx')
        
        if not filename:
            return jsonify({'success': False, 'error': '파일명이 필요합니다'}), 400
        
        # 기본 템플릿 생성
        templates = {
            'jsx': """import React, {{ useState, useEffect }} from 'react';
import './{filename}.css';

const {filename} = () => {{
  const [state, setState] = useState(null);
  
  useEffect(() => {{
    // 초기화 로직
  }}, []);
  
  return (
    <div className="{filename_lower}">
      <h1>{filename}</h1>
      <!-- 컴포넌트 내용 -->
    </div>
  );
}};

export default {filename};""",
            'tsx': """import React, {{ useState, useEffect }} from 'react';
import './{filename}.css';

interface {filename}Props {{
  // props 타입 정의
}}

const {filename}: React.FC<{filename}Props> = () => {{
  const [state, setState] = useState<null>(null);
  
  useEffect(() => {{
    // 초기화 로직
  }}, []);
  
  return (
    <div className="{filename_lower}">
      <h1>{filename}</h1>
      {/* 컴포넌트 내용 */}
    </div>
  );
}};

export default {filename};""",
            'py': """#!/usr/bin/env python3
\"\"\"
{filename} 모듈
\"\"\"

def main():
    \"\"\"메인 함수\"\"\"
    pass

if __name__ == '__main__':
    main()""",
            'css': """.{filename.lower()} {{
  display: flex;
  flex-direction: column;
  padding: 20px;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}}

.{filename.lower()} h1 {{
  font-size: 24px;
  font-weight: bold;
  color: #333333;
  margin-bottom: 16px;
}}""",
            'html': """<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{filename}</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
        }}
    </style>
</head>
<body>
    <h1>{filename}</h1>
    <!-- 내용 -->
</body>
</html>"""
        }
        
        # 파일명에서 확장자 제거
        base_name = filename.rsplit('.', 1)[0] if '.' in filename else filename
        
        # 템플릿 적용
        template = templates.get(file_type, templates['jsx'])
        content = template.format(filename=base_name, filename_lower=base_name.lower())
        
        # 파일 생성
        full_path = os.path.join(os.getcwd(), filename)
        
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return jsonify({
            'success': True,
            'message': '파일이 생성되었습니다',
            'path': filename,
            'size': len(content)
        })
    
    except Exception as e:
        logger.error(f"파일 생성 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/create-folder', methods=['POST'])
def create_folder():
    """새 폴더 생성"""
    try:
        data = request.get_json()
        folder_name = data.get('name')
        
        if not folder_name:
            return jsonify({'success': False, 'error': '폴더명이 필요합니다'}), 400
        
        # 보안 검사
        if '..' in folder_name or '/' in folder_name:
            return jsonify({'success': False, 'error': '잘못된 폴더명입니다'}), 400
        
        full_path = os.path.join(os.getcwd(), folder_name)
        
        if os.path.exists(full_path):
            return jsonify({'success': False, 'error': '폴더가 이미 존재합니다'}), 400
        
        os.makedirs(full_path)
        
        return jsonify({
            'success': True,
            'message': '폴더가 생성되었습니다',
            'path': folder_name
        })
    
    except Exception as e:
        logger.error(f"폴더 생성 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/backups', methods=['GET'])
def get_backups():
    """백업 파일 목록 조회"""
    try:
        backup_dir = os.path.join(os.getcwd(), 'code_backups')
        
        if not os.path.exists(backup_dir):
            return jsonify([])
        
        backups = []
        for filename in os.listdir(backup_dir):
            if filename.endswith('.backup'):
                file_path = os.path.join(backup_dir, filename)
                stat = os.stat(file_path)
                
                backups.append({
                    'filename': filename,
                    'size': stat.st_size,
                    'created': datetime.fromtimestamp(stat.st_ctime).strftime("%Y-%m-%d %H:%M:%S"),
                    'path': file_path
                })
        
        # 생성 시간순으로 정렬
        backups.sort(key=lambda x: x['created'], reverse=True)
        
        return jsonify(backups)
    
    except Exception as e:
        logger.error(f"백업 목록 조회 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/restore-backup', methods=['POST'])
def restore_backup():
    """백업에서 복원"""
    try:
        data = request.get_json()
        backup_filename = data.get('filename')
        target_path = data.get('target_path')
        
        if not backup_filename or not target_path:
            return jsonify({'success': False, 'error': '백업 파일명과 대상 경로가 필요합니다'}), 400
        
        backup_dir = os.path.join(os.getcwd(), 'code_backups')
        backup_path = os.path.join(backup_dir, backup_filename)
        
        if not os.path.exists(backup_path):
            return jsonify({'success': False, 'error': '백업 파일이 존재하지 않습니다'}), 404
        
        target_full_path = os.path.join(os.getcwd(), target_path)
        
        # 백업에서 복원
        shutil.copy2(backup_path, target_full_path)
        
        return jsonify({
            'success': True,
            'message': f'{backup_filename}에서 복원되었습니다'
        })
    
    except Exception as e:
        logger.error(f"백업 복원 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/analyze-file', methods=['GET'])
def analyze_file():
    """파일 구조 분석"""
    try:
        file_path = request.args.get('path')
        if not file_path:
            return jsonify({'success': False, 'error': '파일 경로가 필요합니다'}), 400
        
        full_path = os.path.join(os.getcwd(), file_path)
        
        if not os.path.exists(full_path):
            return jsonify({'success': False, 'error': '파일이 존재하지 않습니다'}), 404
        
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        analysis = {
            'file_size': len(content),
            'line_count': len(content.split('\n')),
            'functions': [],
            'classes': [],
            'imports': [],
            'complexity_score': 0
        }
        
        lines = content.split('\n')
        
        # 함수 찾기 (JavaScript/TypeScript)
        for i, line in enumerate(lines):
            if re.match(r'^\s*function\s+\w+', line) or re.match(r'^\s*const\s+\w+\s*=\s*\(', line):
                match = re.search(r'(\w+)', line)
                analysis['functions'].append({
                    'line': i + 1,
                    'name': match.group(1) if match else 'unknown'
                })
        
        # 클래스 찾기
        for i, line in enumerate(lines):
            if re.match(r'^\s*class\s+\w+', line):
                match = re.search(r'class\s+(\w+)', line)
                if match:
                    analysis['classes'].append({
                        'line': i + 1,
                        'name': match.group(1)
                    })
        
        # import 찾기
        for i, line in enumerate(lines):
            if line.strip().startswith('import '):
                analysis['imports'].append({
                    'line': i + 1,
                    'statement': line.strip()
                })
        
        # 복잡도 점수 계산
        analysis['complexity_score'] = len(analysis['functions']) + len(analysis['classes']) * 2
        
        return jsonify({
            'success': True,
            'analysis': analysis
        })
    
    except Exception as e:
        logger.error(f"파일 분석 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/auto-format', methods=['POST'])
def auto_format_code():
    """코드 자동 포맷팅"""
    try:
        data = request.get_json()
        file_path = data.get('path')
        content = data.get('content', '')
        
        if not file_path:
            return jsonify({'success': False, 'error': '파일 경로가 필요합니다'}), 400
        
        # 백업 생성
        full_path = os.path.join(os.getcwd(), file_path)
        if os.path.exists(full_path):
            backup_dir = os.path.join(os.getcwd(), 'code_backups')
            os.makedirs(backup_dir, exist_ok=True)
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = os.path.basename(file_path)
            backup_filename = f"{filename}_{timestamp}.backup"
            backup_path = os.path.join(backup_dir, backup_filename)
            
            shutil.copy2(full_path, backup_path)
        
        # 간단한 포맷팅 (실제로는 더 정교한 포맷터 사용)
        lines = content.split('\n')
        formatted_lines = []
        
        for line in lines:
            # 후행 공백 제거
            line = line.rstrip()
            
            # 탭을 공백으로 변환 (2칸)
            line = line.expandtabs(2)
            
            formatted_lines.append(line)
        
        formatted_content = '\n'.join(formatted_lines)
        
        return jsonify({
            'success': True,
            'formatted_content': formatted_content,
            'message': '코드가 포맷팅되었습니다'
        })
    
    except Exception as e:
        logger.error(f"코드 포맷팅 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/split-file', methods=['POST'])
def split_file():
    """큰 파일을 여러 파일로 분할"""
    try:
        data = request.get_json()
        file_path = data.get('path')
        max_lines = data.get('max_lines', 500)
        
        if not file_path:
            return jsonify({'success': False, 'error': '파일 경로가 필요합니다'}), 400
        
        full_path = os.path.join(os.getcwd(), file_path)
        
        if not os.path.exists(full_path):
            return jsonify({'success': False, 'error': '파일이 존재하지 않습니다'}), 404
        
        with open(full_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        if len(lines) <= max_lines:
            return jsonify({'success': False, 'error': '파일이 분할할 만큼 크지 않습니다'}), 400
        
        # 파일 분할
        base_name = os.path.splitext(full_path)[0]
        extension = os.path.splitext(full_path)[1]
        
        split_files = []
        for i in range(0, len(lines), max_lines):
            chunk_lines = lines[i:i+max_lines]
            chunk_file = f"{base_name}_part_{i//max_lines + 1}{extension}"
            
            with open(chunk_file, 'w', encoding='utf-8') as f:
                f.writelines(chunk_lines)
            
            split_files.append(os.path.relpath(chunk_file, os.getcwd()))
        
        return jsonify({
            'success': True,
            'split_files': split_files,
            'total_parts': len(split_files),
            'message': f'파일이 {len(split_files)}개 부분으로 분할되었습니다'
        })
    
    except Exception as e:
        logger.error(f"파일 분할 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/suggestions', methods=['GET'])
def get_suggestions():
    """컨텍스트 기반 제안 API"""
    try:
        session_id = request.args.get('session_id')
        
        if not session_id:
            return jsonify({'error': '세션 ID가 필요합니다.'}), 400
        
        # 컨텍스트 기반 제안 생성
        suggestions = context_manager.get_contextual_suggestions(session_id)
        
        # 컨텍스트 정보도 함께 반환
        context = context_manager.get_context(session_id)
        
        return jsonify({
            'success': True,
            'suggestions': suggestions,
            'context': {
                'last_topic': context['last_topic'],
                'last_question_type': context['last_question_type'],
                'conversation_count': len(context['conversation_history']),
                'emotion_trend': context['emotion_trend'][-3:],  # 최근 3개 감정
                'current_focus': context['current_focus']
            }
        })
        
    except Exception as e:
        logger.error(f"제안 생성 오류: {e}")
        return jsonify({'error': '제안 생성 중 오류가 발생했습니다.'}), 500

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=5001,
        debug=True,
        threaded=True
    )
