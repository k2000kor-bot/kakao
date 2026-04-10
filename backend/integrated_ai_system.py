#!/usr/bin/env python3
"""
통합 AI 메시지 생성 시스템 v7.0
- 카카오톡 대화 학습 데이터 통합
- 실제 대화 패턴 기반 메시지 생성
- 개인별 맞춤형 AI 메시지
- 정치인 스타일 + 개인 학습 데이터 융합
"""

import os
import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any, Tuple
from dataclasses import dataclass, asdict
import logging

# 기존 시스템들
from ai_message_generator import AIMessageGenerator, GeneratedMessage
from political_style_generator import PoliticalStyleGenerator
from conversation_learner import ConversationLearner, PersonProfile
from advanced_kakao_parser import AdvancedKakaoParser
from chat_conversation_analyzer import ChatConversationAnalyzer
from advanced_korean_ai_analyzer import AdvancedKoreanAIAnalyzer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class PersonalizedMessage:
    """개인 맞춤형 메시지"""
    message_id: str
    person_id: str
    content: str
    
    # 기본 메타데이터
    target_topic: str
    message_intent: str
    confidence_score: float
    
    # 개인화 정보
    personalization_level: str  # 높음, 보통, 낮음
    learning_data_usage: Dict[str, float]  # 학습 데이터 활용도
    
    # 스타일 융합 정보
    base_style: str  # personal, political, hybrid
    political_style_used: Optional[str] = None
    political_blend_ratio: float = 0.0
    
    # 품질 지표
    authenticity_score: float = 0.0
    consistency_score: float = 0.0
    natural_korean_score: float = 0.0
    
    # 생성 메타데이터
    generation_method: str = ""
    timestamp: datetime = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()


@dataclass
class ConversationContext:
    """대화 맥락 정보"""
    recent_messages: List[Dict[str, Any]]
    active_topic: str
    conversation_mood: str
    participant_states: Dict[str, str]
    time_context: str


class IntegratedAISystem:
    """통합 AI 메시지 생성 시스템"""
    
    def __init__(self, chat_rooms_path: str = "chat_rooms"):
        """시스템 초기화"""
        
        logger.info("🚀 통합 AI 시스템 v7.0 초기화 시작...")
        
        # 기존 시스템들 초기화
        self.analyzer = ChatConversationAnalyzer()
        self.ai_analyzer = AdvancedKoreanAIAnalyzer(self.analyzer)
        self.message_generator = AIMessageGenerator(self.analyzer, self.ai_analyzer)
        self.political_generator = PoliticalStyleGenerator()
        
        # 카카오톡 학습 시스템
        self.parser = AdvancedKakaoParser()
        self.learner = ConversationLearner()
        
        # 학습된 개인 프로필들
        self.person_profiles: Dict[str, PersonProfile] = {}
        self.conversation_contexts: Dict[str, ConversationContext] = {}
        
        # 학습 데이터 경로
        self.chat_rooms_path = chat_rooms_path
        self.profiles_file = "learned_profiles.json"
        
        # 시스템 초기화
        self._initialize_system()
        
    def _initialize_system(self):
        """시스템 초기화"""
        
        try:
            # 기존 프로필 로드
            if os.path.exists(self.profiles_file):
                self.person_profiles = self.learner.load_profiles(self.profiles_file)
                logger.info(f"✅ 기존 프로필 로드: {len(self.person_profiles)}명")
            
            # 카카오톡 데이터 학습
            self._learn_from_chat_rooms()
            
            logger.info("🏆 통합 AI 시스템 초기화 완료!")
            
        except Exception as e:
            logger.error(f"❌ 시스템 초기화 실패: {e}")
            
    def _learn_from_chat_rooms(self):
        """카카오톡 대화방에서 학습"""
        
        if not os.path.exists(self.chat_rooms_path):
            logger.warning(f"대화방 폴더 없음: {self.chat_rooms_path}")
            return
            
        chat_files = []
        for root, dirs, files in os.walk(self.chat_rooms_path):
            for file in files:
                if file.endswith('.txt') and not file.startswith('.'):
                    chat_files.append(os.path.join(root, file))
                    
        logger.info(f"발견된 대화방 파일: {len(chat_files)}개")
        
        for chat_file in chat_files:
            try:
                # 파싱 및 학습
                advanced_room = self.parser.parse_chat_file(chat_file)
                # AdvancedKakaoRoom을 KakaoRoom으로 변환
                from kakao_chat_parser import KakaoRoom, KakaoMessage
                kakao_messages = []
                for msg in advanced_room.messages:
                    kakao_msg = KakaoMessage(
                        timestamp=msg.timestamp,
                        sender=msg.sender,
                        content=msg.content,
                        message_type=msg.message_type,
                        is_deleted=msg.is_deleted,
                        room_name=advanced_room.room_name
                    )
                    kakao_messages.append(kakao_msg)
                
                kakao_room = KakaoRoom(
                    room_name=advanced_room.room_name,
                    participant_count=len(advanced_room.participants),
                    save_date=datetime.now(),  # AdvancedKakaoRoom에는 save_date가 없으므로 현재 시간 사용
                    messages=kakao_messages,
                    participants=advanced_room.participants
                )
                room_profiles = self.learner.learn_from_kakao_room(kakao_room)
                
                # 기존 프로필과 병합
                for person_id, profile in room_profiles.items():
                    if person_id in self.person_profiles:
                        # 기존 프로필 업데이트
                        self._merge_profiles(self.person_profiles[person_id], profile)
                    else:
                        # 새 프로필 추가
                        self.person_profiles[person_id] = profile
                        
                logger.info(f"✅ 학습 완료: {os.path.basename(chat_file)}")
                
            except Exception as e:
                logger.warning(f"학습 실패 {chat_file}: {e}")
                
        # 업데이트된 프로필 저장
        if self.person_profiles:
            self.learner.save_profiles(self.person_profiles, self.profiles_file)
            
    def _merge_profiles(self, existing: PersonProfile, new: PersonProfile):
        """프로필 병합"""
        
        # 메시지 수 누적
        existing.message_count += new.message_count
        existing.active_days += new.active_days
        
        # 평균 메시지 길이 재계산
        total_chars = (existing.avg_message_length * (existing.message_count - new.message_count) + 
                      new.avg_message_length * new.message_count)
        existing.avg_message_length = total_chars / existing.message_count
        
        # 빈도 데이터 병합
        for word, count in new.frequent_words.items():
            existing.frequent_words[word] = existing.frequent_words.get(word, 0) + count
            
        # 주제 전문성 업데이트
        for topic, score in new.topic_expertise.items():
            if topic in existing.topic_expertise:
                existing.topic_expertise[topic] = max(existing.topic_expertise[topic], score)
            else:
                existing.topic_expertise[topic] = score
                
        # 시그니처 표현 병합 (중복 제거)
        existing.signature_phrases.extend([phrase for phrase in new.signature_phrases 
                                         if phrase not in existing.signature_phrases])
        existing.signature_phrases = existing.signature_phrases[:10]  # 최대 10개
        
    def generate_personalized_message(
        self,
        person_id: str,
        target_topic: str,
        message_intent: str,
        context: Optional[ConversationContext] = None,
        use_political_style: Optional[str] = None,
        political_blend_ratio: float = 0.3
    ) -> PersonalizedMessage:
        """개인 맞춤형 메시지 생성"""
        
        logger.info(f"개인 맞춤형 메시지 생성: {person_id} - {target_topic}")
        
        # 개인 프로필 확인
        person_profile = self.person_profiles.get(person_id)
        if not person_profile:
            logger.warning(f"프로필 없음: {person_id}, 기본 메시지 생성")
            return self._generate_default_message(person_id, target_topic, message_intent)
            
        # 생성 방법 결정
        if use_political_style:
            # 정치인 스타일 + 개인 특성 융합
            message = self._generate_hybrid_personalized_message(
                person_profile, target_topic, message_intent, 
                use_political_style, political_blend_ratio, context
            )
        else:
            # 순수 개인 학습 데이터 기반
            message = self._generate_pure_personalized_message(
                person_profile, target_topic, message_intent, context
            )
            
        return message
        
    def _generate_pure_personalized_message(
        self,
        profile: PersonProfile,
        target_topic: str,
        message_intent: str,
        context: Optional[ConversationContext]
    ) -> PersonalizedMessage:
        """순수 개인 데이터 기반 메시지 생성"""
        
        # 개인 특성 기반 메시지 구성
        content_elements = []
        
        # 1. 인사/시작 부분 (개인 스타일 반영)
        greeting = self._generate_personalized_greeting(profile, context)
        if greeting:
            content_elements.append(greeting)
            
        # 2. 주요 내용 (주제 전문성 + 의도 반영)
        main_content = self._generate_main_content(profile, target_topic, message_intent)
        content_elements.append(main_content)
        
        # 3. 마무리/결론 (개인 스타일 반영)
        closing = self._generate_personalized_closing(profile, message_intent)
        if closing:
            content_elements.append(closing)
            
        # 메시지 조합
        final_content = self._combine_content_elements(content_elements, profile)
        
        # 품질 평가
        quality_scores = self._evaluate_message_quality(final_content, profile, target_topic)
        
        # 학습 데이터 활용도 계산
        learning_usage = self._calculate_learning_usage(profile, target_topic, message_intent)
        
        return PersonalizedMessage(
            message_id=f"pers_{profile.user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            person_id=profile.user_id,
            content=final_content,
            target_topic=target_topic,
            message_intent=message_intent,
            confidence_score=quality_scores['confidence'],
            personalization_level="높음",
            learning_data_usage=learning_usage,
            base_style="personal",
            authenticity_score=quality_scores['authenticity'],
            consistency_score=quality_scores['consistency'],
            natural_korean_score=quality_scores['natural_korean'],
            generation_method="pure_personalized"
        )
        
    def _generate_hybrid_personalized_message(
        self,
        profile: PersonProfile,
        target_topic: str,
        message_intent: str,
        political_style: str,
        blend_ratio: float,
        context: Optional[ConversationContext]
    ) -> PersonalizedMessage:
        """정치인 스타일 + 개인 특성 융합 메시지"""
        
        # 1. 개인 기반 메시지 생성
        personal_message = self._generate_pure_personalized_message(
            profile, target_topic, message_intent, context
        )
        
        # 2. 정치인 스타일 메시지 생성
        political_message = self.political_generator.generate_message(
            political_style, target_topic, message_intent
        )
        
        # 3. 두 스타일 융합
        hybrid_content = self._blend_messages(
            personal_message.content,
            political_message.content,
            blend_ratio,
            profile,
            political_style
        )
        
        # 품질 평가
        quality_scores = self._evaluate_hybrid_quality(
            hybrid_content, profile, political_style, target_topic
        )
        
        return PersonalizedMessage(
            message_id=f"hyb_{profile.user_id}_{political_style}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            person_id=profile.user_id,
            content=hybrid_content,
            target_topic=target_topic,
            message_intent=message_intent,
            confidence_score=quality_scores['confidence'],
            personalization_level="높음",
            learning_data_usage=self._calculate_learning_usage(profile, target_topic, message_intent),
            base_style="hybrid",
            political_style_used=political_style,
            political_blend_ratio=blend_ratio,
            authenticity_score=quality_scores['authenticity'],
            consistency_score=quality_scores['consistency'],
            natural_korean_score=quality_scores['natural_korean'],
            generation_method="hybrid_personalized"
        )
        
    def _generate_personalized_greeting(self, profile: PersonProfile, context: Optional[ConversationContext]) -> str:
        """개인화된 인사말 생성"""
        
        # 격식 수준에 따른 인사
        if profile.formality_level == "높음":
            greetings = ["안녕하세요.", "말씀드리자면", "의견을 드리면"]
        elif profile.formality_level == "낮음":
            greetings = ["안녕하세요~", "저는", "개인적으로는"]
        else:
            greetings = ["안녕하세요", "제 생각에는", "저는 이렇게 봅니다"]
            
        # 시그니처 표현이 있으면 활용
        if profile.signature_phrases:
            signature = profile.signature_phrases[0]
            if len(signature) < 20:  # 너무 길지 않은 경우만
                return f"{greetings[0]} {signature}"
                
        return greetings[0] if context and len(context.recent_messages) > 5 else ""
        
    def _generate_main_content(self, profile: PersonProfile, target_topic: str, message_intent: str) -> str:
        """주요 내용 생성"""
        
        # 주제별 전문성 반영
        expertise_level = profile.topic_expertise.get(target_topic, 0.3)
        
        # 기본 템플릿
        content_templates = {
            "제안형": [
                "제안하고 싶은 것은",
                "이런 방향으로 해보면 어떨까요?",
                "다음과 같은 방안을 고려해볼 수 있습니다"
            ],
            "의견형": [
                "제 생각에는",
                "개인적인 의견으로는",
                "이 문제에 대해서는"
            ],
            "질문형": [
                "궁금한 점이 있습니다",
                "질문이 있는데요",
                "이 부분이 궁금합니다"
            ],
            "지지형": [
                "저도 동의합니다",
                "좋은 의견이라고 생각합니다",
                "찬성하는 입장입니다"
            ],
            "우려형": [
                "조금 걱정되는 부분이 있습니다",
                "신중하게 고려해야 할 점이",
                "우려스러운 면이 있어서"
            ]
        }
        
        base_template = content_templates.get(message_intent, ["말씀드리고 싶은 것은"])[0]
        
        # 주제별 구체적 내용 추가
        topic_content = self._generate_topic_specific_content(target_topic, profile)
        
        # 개인 특성 반영
        if profile.decision_style == "합리형":
            rational_phrase = "객관적으로 보면"
            return f"{base_template} {rational_phrase} {topic_content}"
        elif profile.decision_style == "감정형":
            emotional_phrase = "솔직히 말씀드리면"
            return f"{base_template} {emotional_phrase} {topic_content}"
        else:
            return f"{base_template} {topic_content}"
            
    def _generate_topic_specific_content(self, topic: str, profile: PersonProfile) -> str:
        """주제별 구체적 내용 생성"""
        
        content_map = {
            "시공사_선정": "시공사 선택 시 신뢰성과 경험을 우선적으로 고려해야 한다고 봅니다.",
            "분담금": "분담금 관련해서는 투명한 정보 공개와 합리적인 산정이 중요하다고 생각합니다.",
            "커뮤니티": "커뮤니티 시설은 장기적인 자산 가치와 생활 편의성을 종합적으로 고려해야 합니다.",
            "총회": "총회에서는 모든 조합원의 의견이 충분히 반영될 수 있도록 해야 합니다.",
            "아파트가치": "아파트 가치 향상을 위해서는 품질과 브랜드 이미지가 핵심이라고 봅니다."
        }
        
        base_content = content_map.get(topic, "이 문제에 대해 신중한 검토가 필요하다고 생각합니다.")
        
        # 개인 선호도 반영
        if topic == "시공사_선정" and profile.preferred_construction_company:
            company = profile.preferred_construction_company
            confidence = profile.construction_company_confidence
            if confidence > 0.6:
                base_content += f" 특히 {company}의 경우 검토해볼 만한 가치가 있다고 봅니다."
                
        return base_content
        
    def _generate_personalized_closing(self, profile: PersonProfile, message_intent: str) -> str:
        """개인화된 마무리 생성"""
        
        # 격식 수준에 따른 마무리
        if profile.formality_level == "높음":
            closings = ["감사합니다.", "이상입니다.", "검토 부탁드립니다."]
        elif profile.formality_level == "낮음":
            closings = ["감사해요~", "이렇게 생각해요", "참고해주세요 ㅎㅎ"]
        else:
            closings = ["감사합니다", "참고 부탁드려요", "여러분의 의견도 듣고 싶습니다"]
            
        # 의도에 따른 조정
        if message_intent == "질문형":
            return "답변 부탁드립니다."
        elif message_intent == "제안형":
            return "검토해주시면 감사하겠습니다."
            
        return closings[0]
        
    def _combine_content_elements(self, elements: List[str], profile: PersonProfile) -> str:
        """내용 요소들을 조합"""
        
        # 개인 스타일에 따른 연결
        if profile.communication_style == "신중형":
            separator = " "
        elif profile.communication_style == "적극형":
            separator = " "
        else:
            separator = " "
            
        combined = separator.join([elem for elem in elements if elem])
        
        # 최대 길이 제한
        if len(combined) > 200:
            combined = combined[:197] + "..."
            
        return combined
        
    def _blend_messages(
        self,
        personal_content: str,
        political_content: str,
        blend_ratio: float,
        profile: PersonProfile,
        political_style: str
    ) -> str:
        """두 메시지 스타일 융합"""
        
        # blend_ratio에 따른 융합
        if blend_ratio < 0.3:
            # 개인 스타일 위주
            base_content = personal_content
            
            # 정치인 스타일의 특징적 표현만 일부 추가
            political_phrases = self._extract_key_phrases(political_content)
            if political_phrases:
                enhanced_content = f"{base_content} {political_phrases[0]}"
                return enhanced_content[:200] + ("..." if len(enhanced_content) > 200 else "")
                
        elif blend_ratio > 0.7:
            # 정치인 스타일 위주
            base_content = political_content
            
            # 개인의 격식 수준만 반영
            if profile.formality_level == "높음":
                base_content = base_content.replace("해요", "합니다").replace("이에요", "입니다")
            elif profile.formality_level == "낮음":
                base_content = base_content.replace("습니다", "해요").replace("입니다", "이에요")
                
        else:
            # 균형 융합
            personal_phrases = self._extract_key_phrases(personal_content)
            political_phrases = self._extract_key_phrases(political_content)
            
            combined_phrases = []
            if personal_phrases:
                combined_phrases.append(personal_phrases[0])
            if political_phrases:
                combined_phrases.append(political_phrases[0])
                
            base_content = " ".join(combined_phrases)
            
        return base_content
        
    def _extract_key_phrases(self, content: str) -> List[str]:
        """핵심 구문 추출"""
        
        sentences = content.split('.')
        key_phrases = []
        
        for sentence in sentences:
            sentence = sentence.strip()
            if 10 <= len(sentence) <= 50:  # 적절한 길이의 문장만
                key_phrases.append(sentence)
                
        return key_phrases[:2]  # 최대 2개
        
    def _evaluate_message_quality(self, content: str, profile: PersonProfile, topic: str) -> Dict[str, float]:
        """메시지 품질 평가"""
        
        # 신뢰도 (길이, 구체성)
        confidence = min(len(content) / 100, 1.0)
        if any(keyword in content for keyword in ["객관적", "구체적", "실제로"]):
            confidence += 0.1
            
        # 진정성 (개인 특성 반영도)
        authenticity = 0.7  # 기본값
        if profile.signature_phrases:
            for phrase in profile.signature_phrases[:2]:
                if phrase[:5] in content:  # 부분 일치
                    authenticity += 0.1
                    
        # 일관성 (격식 수준 일치)
        consistency = 0.8  # 기본값
        formal_indicators = content.count("습니다") + content.count("입니다")
        casual_indicators = content.count("해요") + content.count("이에요")
        
        if profile.formality_level == "높음" and formal_indicators > casual_indicators:
            consistency = 0.9
        elif profile.formality_level == "낮음" and casual_indicators > formal_indicators:
            consistency = 0.9
            
        # 한국어 자연성
        natural_korean = 0.85  # 기본값
        if "여러분의 의견을 듣고 싶습니다" in content:
            natural_korean += 0.05
        if len(content) > 150:  # 너무 긴 경우 감점
            natural_korean -= 0.1
            
        return {
            'confidence': min(confidence, 1.0),
            'authenticity': min(authenticity, 1.0),
            'consistency': consistency,
            'natural_korean': max(natural_korean, 0.6)
        }
        
    def _evaluate_hybrid_quality(self, content: str, profile: PersonProfile, political_style: str, topic: str) -> Dict[str, float]:
        """하이브리드 메시지 품질 평가"""
        
        base_scores = self._evaluate_message_quality(content, profile, topic)
        
        # 하이브리드 특성 평가
        political_elements = self._count_political_elements(content, political_style)
        personal_elements = self._count_personal_elements(content, profile)
        
        # 균형도 평가
        balance_score = min(political_elements, personal_elements) / max(political_elements, personal_elements, 1)
        
        # 하이브리드 보정
        base_scores['authenticity'] *= (0.8 + balance_score * 0.2)
        base_scores['confidence'] *= (0.9 + balance_score * 0.1)
        
        return base_scores
        
    def _count_political_elements(self, content: str, political_style: str) -> int:
        """정치인 스타일 요소 개수"""
        
        political_indicators = {
            "유시민": ["논리적", "객관적", "데이터", "합리적"],
            "진중권": ["철학적", "비판적", "모순", "상식"],
            "박형준": ["균형", "상호", "건설적", "협력"],
            # ... 다른 정치인들
        }
        
        indicators = political_indicators.get(political_style, [])
        return sum(content.count(indicator) for indicator in indicators)
        
    def _count_personal_elements(self, content: str, profile: PersonProfile) -> int:
        """개인 스타일 요소 개수"""
        
        count = 0
        
        # 시그니처 표현
        for phrase in profile.signature_phrases[:3]:
            if phrase[:5] in content:
                count += 1
                
        # 빈도 높은 단어들
        for word in list(profile.frequent_words.keys())[:5]:
            count += content.count(word)
            
        return count
        
    def _calculate_learning_usage(self, profile: PersonProfile, topic: str, intent: str) -> Dict[str, float]:
        """학습 데이터 활용도 계산"""
        
        return {
            "signature_phrases": 0.8 if profile.signature_phrases else 0.0,
            "topic_expertise": profile.topic_expertise.get(topic, 0.3),
            "communication_style": 0.9,
            "formality_adaptation": 0.85,
            "preferred_company": 0.7 if profile.preferred_construction_company else 0.0
        }
        
    def _generate_default_message(self, person_id: str, target_topic: str, message_intent: str) -> PersonalizedMessage:
        """기본 메시지 생성 (프로필이 없는 경우)"""
        
        # 기존 AI 시스템 활용
        basic_message = self.message_generator.generate_contextual_message(
            person_name=person_id,
            target_topic=target_topic,
            message_intent=message_intent
        )
        
        return PersonalizedMessage(
            message_id=f"def_{person_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            person_id=person_id,
            content=basic_message.generated_content,
            target_topic=target_topic,
            message_intent=message_intent,
            confidence_score=basic_message.confidence_score,
            personalization_level="낮음",
            learning_data_usage={},
            base_style="default",
            authenticity_score=0.6,
            consistency_score=0.7,
            natural_korean_score=0.8,
            generation_method="default_fallback"
        )
        
    def recommend_political_style_for_person(self, person_id: str, target_topic: str) -> Dict[str, Any]:
        """개인에게 맞는 정치인 스타일 추천"""
        
        profile = self.person_profiles.get(person_id)
        if not profile:
            return {"error": "프로필을 찾을 수 없습니다"}
            
        # 개인 특성 기반 매칭
        compatibility_scores = {}
        
        political_styles = {
            "유시민": {"rational": 0.9, "moderate": 0.8, "analytical": 0.9},
            "진중권": {"critical": 0.9, "intellectual": 0.9, "direct": 0.8},
            "박형준": {"diplomatic": 0.9, "balanced": 0.9, "cooperative": 0.8},
            "정준희": {"pragmatic": 0.8, "realistic": 0.9, "focused": 0.8},
            "정원책": {"progressive": 0.8, "passionate": 0.7, "reformist": 0.9},
            "이철희": {"systematic": 0.9, "detailed": 0.8, "policy_oriented": 0.9}
        }
        
        for politician, traits in political_styles.items():
            score = 0.0
            
            # 의사결정 스타일 매칭
            if profile.decision_style == "합리형" and traits.get("rational", 0) > 0.8:
                score += 0.3
            elif profile.decision_style == "감정형" and traits.get("passionate", 0) > 0.7:
                score += 0.3
                
            # 정치적 성향 매칭
            if profile.political_stance == "중도" and traits.get("balanced", 0) > 0.8:
                score += 0.2
            elif profile.political_stance == "진보" and traits.get("progressive", 0) > 0.8:
                score += 0.2
                
            # 커뮤니케이션 스타일 매칭
            if profile.communication_style == "신중형" and traits.get("analytical", 0) > 0.8:
                score += 0.2
            elif profile.communication_style == "적극형" and traits.get("direct", 0) > 0.8:
                score += 0.2
                
            # 주제 전문성 고려
            topic_expertise = profile.topic_expertise.get(target_topic, 0.3)
            score += topic_expertise * 0.3
            
            compatibility_scores[politician] = min(score, 1.0)
            
        # 상위 3개 추천
        sorted_recommendations = sorted(compatibility_scores.items(), key=lambda x: x[1], reverse=True)
        
        return {
            "person_id": person_id,
            "target_topic": target_topic,
            "recommendations": [
                {
                    "politician": politician,
                    "compatibility_score": score,
                    "reason": self._generate_recommendation_reason(politician, score, profile)
                }
                for politician, score in sorted_recommendations[:3]
            ],
            "person_characteristics": {
                "decision_style": profile.decision_style,
                "political_stance": profile.political_stance,
                "communication_style": profile.communication_style,
                "topic_expertise": profile.topic_expertise.get(target_topic, 0.3)
            }
        }
        
    def _generate_recommendation_reason(self, politician: str, score: float, profile: PersonProfile) -> str:
        """추천 이유 생성"""
        
        reasons = {
            "유시민": f"{profile.display_name}님의 합리적 사고와 잘 어울립니다",
            "진중권": f"{profile.display_name}님의 비판적 사고와 유사한 접근법입니다",
            "박형준": f"{profile.display_name}님의 균형잡힌 소통 방식과 일치합니다",
            "정준희": f"{profile.display_name}님의 현실적 접근과 맞습니다",
            "정원책": f"{profile.display_name}님의 개혁적 성향과 부합합니다",
            "이철희": f"{profile.display_name}님의 체계적 사고와 유사합니다"
        }
        
        base_reason = reasons.get(politician, "적합한 스타일입니다")
        
        if score > 0.8:
            return f"매우 {base_reason} (적합도: {score:.1%})"
        elif score > 0.6:
            return f"{base_reason} (적합도: {score:.1%})"
        else:
            return f"어느 정도 {base_reason} (적합도: {score:.1%})"
            
    def get_system_status(self) -> Dict[str, Any]:
        """시스템 상태 정보"""
        
        return {
            "system_version": "7.0",
            "initialization_time": datetime.now().isoformat(),
            "learned_profiles": len(self.person_profiles),
            "chat_rooms_processed": len([f for f in os.listdir(self.chat_rooms_path) 
                                        if os.path.isdir(os.path.join(self.chat_rooms_path, f))]) if os.path.exists(self.chat_rooms_path) else 0,
            "available_political_styles": len(self.political_generator.get_available_styles()),
            "total_learning_data": sum(profile.message_count for profile in self.person_profiles.values()),
            "system_capabilities": [
                "실제 대화 패턴 학습",
                "개인별 맞춤형 메시지 생성",
                "정치인 스타일 융합",
                "대화 맥락 인식",
                "품질 자동 평가",
                "스타일 추천"
            ]
        }


# 사용 예시
if __name__ == "__main__":
    print("🚀 통합 AI 메시지 시스템 v7.0 테스트")
    print("=" * 60)
    
    # 시스템 초기화
    integrated_system = IntegratedAISystem()
    
    # 시스템 상태 확인
    status = integrated_system.get_system_status()
    print(f"✅ 시스템 버전: {status['system_version']}")
    print(f"📊 학습된 프로필: {status['learned_profiles']}명")
    print(f"💾 총 학습 데이터: {status['total_learning_data']}개 메시지")
    
    # 개인 맞춤형 메시지 생성 테스트
    if integrated_system.person_profiles:
        test_person = list(integrated_system.person_profiles.keys())[0]
        print(f"\n🎯 테스트 대상: {test_person}")
        
        # 순수 개인 스타일 메시지
        personal_msg = integrated_system.generate_personalized_message(
            person_id=test_person,
            target_topic="시공사_선정",
            message_intent="의견형"
        )
        
        print(f"💬 개인 스타일 메시지:")
        print(f"   {personal_msg.content}")
        print(f"   신뢰도: {personal_msg.confidence_score:.2f}")
        
        # 하이브리드 메시지
        hybrid_msg = integrated_system.generate_personalized_message(
            person_id=test_person,
            target_topic="시공사_선정",
            message_intent="의견형",
            use_political_style="유시민",
            political_blend_ratio=0.5
        )
        
        print(f"\n🎭 하이브리드 메시지 (유시민 스타일):")
        print(f"   {hybrid_msg.content}")
        print(f"   신뢰도: {hybrid_msg.confidence_score:.2f}")
        
        # 스타일 추천
        recommendation = integrated_system.recommend_political_style_for_person(
            test_person, "시공사_선정"
        )
        
        if "recommendations" in recommendation:
            top_rec = recommendation["recommendations"][0]
            print(f"\n💡 추천 정치인 스타일: {top_rec['politician']}")
            print(f"   적합도: {top_rec['compatibility_score']:.1%}")
            print(f"   이유: {top_rec['reason']}")
    
    print(f"\n🏆 통합 AI 시스템 v7.0 테스트 완료!") 