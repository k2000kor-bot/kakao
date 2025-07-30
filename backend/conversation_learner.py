#!/usr/bin/env python3
"""
카카오톡 대화 학습 시스템
- 개인별 메시지 패턴 학습
- 성향 및 선호도 분석
- 커뮤니케이션 스타일 추출
- 정치적 입장 및 의견 성향 파악
"""

import re
import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any, Set
from dataclasses import dataclass, asdict
from collections import defaultdict, Counter
import logging

from kakao_chat_parser import KakaoRoom, KakaoMessage

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class PersonProfile:
    """개인 프로필 데이터"""
    user_id: str
    display_name: str
    
    # 기본 정보
    message_count: int = 0
    active_days: int = 0
    avg_message_length: float = 0.0
    
    # 커뮤니케이션 스타일
    formality_level: str = "보통"  # 높음, 보통, 낮음
    communication_style: str = "균형형"  # 적극형, 신중형, 균형형
    emotional_tone: str = "중립"  # 긍정, 부정, 중립
    
    # 정치적/의견 성향
    political_stance: str = "중도"  # 진보, 보수, 중도
    decision_style: str = "합리형"  # 감정형, 합리형, 혼합형
    
    # 선호도 및 관심사
    preferred_construction_company: Optional[str] = None
    construction_company_confidence: float = 0.0
    
    # 주요 관심 주제
    primary_interests: List[str] = None
    topic_expertise: Dict[str, float] = None
    
    # 시그니처 표현
    signature_phrases: List[str] = None
    frequent_words: Dict[str, int] = None
    
    # 메시지 의도 패턴
    intent_patterns: Dict[str, int] = None
    
    # 시간 패턴
    active_hours: List[int] = None
    response_speed: str = "보통"  # 빠름, 보통, 느림
    
    # 상호작용 패턴
    interaction_partners: Dict[str, int] = None
    leadership_score: float = 0.0
    
    def __post_init__(self):
        if self.primary_interests is None:
            self.primary_interests = []
        if self.topic_expertise is None:
            self.topic_expertise = {}
        if self.signature_phrases is None:
            self.signature_phrases = []
        if self.frequent_words is None:
            self.frequent_words = {}
        if self.intent_patterns is None:
            self.intent_patterns = {}
        if self.active_hours is None:
            self.active_hours = []
        if self.interaction_partners is None:
            self.interaction_partners = {}


@dataclass
class ConversationInsight:
    """대화 인사이트"""
    insight_type: str
    description: str
    confidence: float
    supporting_evidence: List[str]
    timestamp: datetime


class ConversationLearner:
    """카카오톡 대화 학습 시스템"""
    
    def __init__(self):
        self.construction_companies = [
            "GS", "파르나스", "현대", "대우", "삼성", "롯데", "포스코"
        ]
        
        self.topic_keywords = {
            "시공사_선정": ["시공사", "건설사", "GS", "파르나스", "현대", "대우", "삼성", "선정", "업체"],
            "분담금": ["분담금", "환급", "비용", "예산", "자금", "돈", "금액", "부담"],
            "커뮤니티": ["커뮤니티", "수영장", "사우나", "헬스", "식당", "시설", "편의"],
            "총회": ["총회", "투표", "안건", "승인", "결정", "회의", "논의"],
            "아파트가치": ["가치", "시세", "브랜드", "입지", "프리미엄", "자산"],
            "교통": ["지하철", "버스", "교통", "접근성", "역세권", "대청역"],
            "학군": ["학교", "학군", "교육", "아이", "자녀", "초등학교"]
        }
        
        self.formality_indicators = {
            "높음": ["습니다", "됩니다", "있습니다", "합니다", "입니다"],
            "보통": ["해요", "가요", "봐요", "되요", "이에요"],
            "낮음": ["해", "가", "봐", "야", "지", "ㅋㅋ", "ㅎㅎ"]
        }
        
        self.emotional_indicators = {
            "긍정": ["좋아", "좋은", "최고", "만족", "훌륭", "완벽", "감사", "기쁘", "행복", "👍", "😊", "ㅎㅎ"],
            "부정": ["싫어", "나쁜", "최악", "불만", "문제", "걱정", "우려", "반대", "😞", "😠", "ㅠㅠ"],
            "중립": ["생각", "의견", "판단", "고민", "검토", "분석", "객관적"]
        }
        
        self.intent_keywords = {
            "제안형": ["제안", "어떨까", "하면", "해보자", "해봐야", "하는게"],
            "의견형": ["생각", "봅니다", "같아", "것 같", "느낌"],
            "질문형": ["?", "궁금", "어떻게", "왜", "언제", "어디서"],
            "지지형": ["동의", "찬성", "맞다", "좋다", "옳다", "동감"],
            "우려형": ["걱정", "우려", "문제", "위험", "조심", "신중"]
        }
        
    def learn_from_kakao_room(self, kakao_room: KakaoRoom) -> Dict[str, PersonProfile]:
        """카카오톡 방에서 개인별 프로필 학습"""
        
        logger.info(f"대화 학습 시작: {kakao_room.room_name}")
        
        # 텍스트 메시지만 필터링
        text_messages = [msg for msg in kakao_room.messages 
                        if msg.message_type == "text" and not msg.is_deleted]
        
        # 개인별 메시지 그룹핑
        person_messages = defaultdict(list)
        for msg in text_messages:
            if msg.sender:
                person_messages[msg.sender].append(msg)
        
        # 각 개인별 프로필 생성
        profiles = {}
        for person_id, messages in person_messages.items():
            if len(messages) >= 3:  # 최소 3개 메시지 이상
                profile = self._analyze_person(person_id, messages, kakao_room)
                profiles[person_id] = profile
                
        logger.info(f"학습 완료: {len(profiles)}명의 프로필 생성")
        return profiles
        
    def _analyze_person(self, person_id: str, messages: List[KakaoMessage], kakao_room: KakaoRoom) -> PersonProfile:
        """개인 분석"""
        
        profile = PersonProfile(
            user_id=person_id,
            display_name=person_id
        )
        
        # 기본 통계
        profile.message_count = len(messages)
        profile.active_days = len(set(msg.timestamp.date() for msg in messages))
        profile.avg_message_length = sum(len(msg.content) for msg in messages) / len(messages)
        
        # 커뮤니케이션 스타일 분석
        self._analyze_communication_style(profile, messages)
        
        # 정치적/의견 성향 분석
        self._analyze_political_stance(profile, messages)
        
        # 선호도 분석
        self._analyze_preferences(profile, messages)
        
        # 주제별 전문성 분석
        self._analyze_topic_expertise(profile, messages)
        
        # 시그니처 표현 추출
        self._extract_signature_expressions(profile, messages)
        
        # 메시지 의도 패턴 분석
        self._analyze_intent_patterns(profile, messages)
        
        # 시간 패턴 분석
        self._analyze_time_patterns(profile, messages)
        
        # 상호작용 패턴 분석
        self._analyze_interaction_patterns(profile, messages, kakao_room)
        
        return profile
        
    def _analyze_communication_style(self, profile: PersonProfile, messages: List[KakaoMessage]):
        """커뮤니케이션 스타일 분석"""
        
        all_text = " ".join([msg.content for msg in messages])
        
        # 격식 수준 분석
        formality_scores = {}
        for level, indicators in self.formality_indicators.items():
            score = sum(all_text.count(indicator) for indicator in indicators)
            formality_scores[level] = score
            
        if formality_scores:
            profile.formality_level = max(formality_scores, key=formality_scores.get)
        
        # 감정 톤 분석
        emotion_scores = {}
        for emotion, indicators in self.emotional_indicators.items():
            score = sum(all_text.count(indicator) for indicator in indicators)
            emotion_scores[emotion] = score
            
        if emotion_scores:
            profile.emotional_tone = max(emotion_scores, key=emotion_scores.get)
        
        # 커뮤니케이션 스타일 결정
        avg_length = profile.avg_message_length
        message_frequency = profile.message_count / max(profile.active_days, 1)
        
        if avg_length > 100 and message_frequency < 5:
            profile.communication_style = "신중형"
        elif avg_length < 50 and message_frequency > 10:
            profile.communication_style = "적극형"
        else:
            profile.communication_style = "균형형"
            
    def _analyze_political_stance(self, profile: PersonProfile, messages: List[KakaoMessage]):
        """정치적/의견 성향 분석"""
        
        all_text = " ".join([msg.content for msg in messages])
        
        # 보수적 키워드
        conservative_keywords = ["안정", "전통", "신중", "안전", "검증", "기존", "보수적"]
        
        # 진보적 키워드  
        progressive_keywords = ["혁신", "변화", "개선", "새로운", "진보적", "발전", "개혁"]
        
        # 합리적 키워드
        rational_keywords = ["데이터", "분석", "객관적", "논리적", "근거", "통계", "팩트"]
        
        conservative_score = sum(all_text.count(kw) for kw in conservative_keywords)
        progressive_score = sum(all_text.count(kw) for kw in progressive_keywords)
        rational_score = sum(all_text.count(kw) for kw in rational_keywords)
        
        # 정치적 성향
        if conservative_score > progressive_score * 1.5:
            profile.political_stance = "보수"
        elif progressive_score > conservative_score * 1.5:
            profile.political_stance = "진보"
        else:
            profile.political_stance = "중도"
            
        # 의사결정 스타일
        emotional_keywords = ["느낌", "감정", "마음", "기분"]
        emotional_score = sum(all_text.count(kw) for kw in emotional_keywords)
        
        if rational_score > emotional_score * 2:
            profile.decision_style = "합리형"
        elif emotional_score > rational_score * 2:
            profile.decision_style = "감정형"
        else:
            profile.decision_style = "혼합형"
            
    def _analyze_preferences(self, profile: PersonProfile, messages: List[KakaoMessage]):
        """선호도 분석"""
        
        all_text = " ".join([msg.content for msg in messages])
        
        # 시공사 선호도 분석
        company_mentions = {}
        for company in self.construction_companies:
            mentions = all_text.count(company)
            if mentions > 0:
                company_mentions[company] = mentions
                
        if company_mentions:
            # 가장 많이 언급한 시공사
            preferred_company = max(company_mentions, key=company_mentions.get)
            total_mentions = sum(company_mentions.values())
            confidence = company_mentions[preferred_company] / total_mentions
            
            # 긍정적 언급인지 확인
            positive_context = False
            for msg in messages:
                if preferred_company in msg.content:
                    positive_indicators = ["좋", "선호", "최고", "훌륭", "믿을만", "안정적"]
                    if any(indicator in msg.content for indicator in positive_indicators):
                        positive_context = True
                        break
                        
            if positive_context or confidence > 0.5:
                profile.preferred_construction_company = preferred_company
                profile.construction_company_confidence = confidence
                
    def _analyze_topic_expertise(self, profile: PersonProfile, messages: List[KakaoMessage]):
        """주제별 전문성 분석"""
        
        all_text = " ".join([msg.content for msg in messages])
        
        topic_scores = {}
        for topic, keywords in self.topic_keywords.items():
            score = sum(all_text.count(keyword) for keyword in keywords)
            if score > 0:
                # 메시지 길이로 전문성 가중치 적용
                expertise_weight = min(profile.avg_message_length / 100, 2.0)
                topic_scores[topic] = score * expertise_weight
                
        # 정규화
        if topic_scores:
            max_score = max(topic_scores.values())
            profile.topic_expertise = {
                topic: score / max_score 
                for topic, score in topic_scores.items()
            }
            
            # 주요 관심사 (상위 3개)
            sorted_topics = sorted(topic_scores.items(), key=lambda x: x[1], reverse=True)
            profile.primary_interests = [topic for topic, _ in sorted_topics[:3]]
            
    def _extract_signature_expressions(self, profile: PersonProfile, messages: List[KakaoMessage]):
        """시그니처 표현 추출"""
        
        all_text = " ".join([msg.content for msg in messages])
        
        # 단어 빈도 분석
        words = re.findall(r'\b\w+\b', all_text)
        word_counts = Counter(words)
        
        # 일반적인 단어 제외
        common_words = {"이", "가", "을", "를", "의", "에", "으로", "와", "과", "도", "만", "부터", "까지"}
        filtered_words = {word: count for word, count in word_counts.items() 
                         if word not in common_words and len(word) >= 2 and count >= 2}
        
        profile.frequent_words = dict(sorted(filtered_words.items(), key=lambda x: x[1], reverse=True)[:10])
        
        # 특징적 표현 추출
        signature_patterns = [
            r'(.{0,10}생각(.{0,10})|(.{0,10}봅니다(.{0,10})',
            r'(.{0,10}같아(.{0,10})|(.{0,10}것 같(.{0,10})',
            r'(.{0,10}하면(.{0,10})|(.{0,10}해야(.{0,10})'
        ]
        
        signatures = []
        for pattern in signature_patterns:
            matches = re.findall(pattern, all_text)
            for match in matches[:3]:  # 상위 3개만
                if isinstance(match, tuple):
                    clean_match = ''.join(match).strip()
                else:
                    clean_match = match.strip()
                if clean_match and len(clean_match) > 3:
                    signatures.append(clean_match)
                    
        profile.signature_phrases = signatures[:5]  # 최대 5개
        
    def _analyze_intent_patterns(self, profile: PersonProfile, messages: List[KakaoMessage]):
        """메시지 의도 패턴 분석"""
        
        intent_counts = defaultdict(int)
        
        for msg in messages:
            content = msg.content.lower()
            
            for intent, keywords in self.intent_keywords.items():
                for keyword in keywords:
                    if keyword in content:
                        intent_counts[intent] += 1
                        break
                        
        profile.intent_patterns = dict(intent_counts)
        
    def _analyze_time_patterns(self, profile: PersonProfile, messages: List[KakaoMessage]):
        """시간 패턴 분석"""
        
        # 활동 시간대 분석
        hour_counts = defaultdict(int)
        for msg in messages:
            hour_counts[msg.timestamp.hour] += 1
            
        # 상위 활동 시간대 (상위 30%)
        sorted_hours = sorted(hour_counts.items(), key=lambda x: x[1], reverse=True)
        top_hours_count = max(1, len(sorted_hours) // 3)
        profile.active_hours = [hour for hour, _ in sorted_hours[:top_hours_count]]
        
        # 응답 속도 분석 (연속 메시지 간격 기준)
        response_times = []
        sorted_messages = sorted(messages, key=lambda x: x.timestamp)
        
        for i in range(1, len(sorted_messages)):
            time_diff = (sorted_messages[i].timestamp - sorted_messages[i-1].timestamp).total_seconds()
            if time_diff < 3600:  # 1시간 이내 응답만 고려
                response_times.append(time_diff)
                
        if response_times:
            avg_response_time = sum(response_times) / len(response_times)
            if avg_response_time < 300:  # 5분 이내
                profile.response_speed = "빠름"
            elif avg_response_time > 1800:  # 30분 이상
                profile.response_speed = "느림"
            else:
                profile.response_speed = "보통"
                
    def _analyze_interaction_patterns(self, profile: PersonProfile, messages: List[KakaoMessage], kakao_room: KakaoRoom):
        """상호작용 패턴 분석"""
        
        # 다른 참여자들과의 상호작용 빈도
        interaction_counts = defaultdict(int)
        
        person_messages = sorted([msg for msg in kakao_room.messages 
                                if msg.message_type == "text" and not msg.is_deleted], 
                               key=lambda x: x.timestamp)
        
        person_message_indices = {
            i: msg for i, msg in enumerate(person_messages) 
            if msg.sender == profile.user_id
        }
        
        # 연속된 메시지에서 상호작용 찾기
        for idx, msg in person_message_indices.items():
            # 앞뒤 3개 메시지 범위에서 다른 사람 메시지 확인
            for check_idx in range(max(0, idx-3), min(len(person_messages), idx+4)):
                if check_idx != idx:
                    other_msg = person_messages[check_idx]
                    if other_msg.sender != profile.user_id:
                        interaction_counts[other_msg.sender] += 1
                        
        profile.interaction_partners = dict(interaction_counts)
        
        # 리더십 점수 (질문 받는 빈도, 긴 메시지 비율 등)
        long_messages = len([msg for msg in messages if len(msg.content) > 100])
        question_responses = len([msg for msg in messages if "?" in msg.content])
        
        leadership_factors = [
            long_messages / len(messages),  # 상세한 설명 비율
            len(profile.interaction_partners) / max(len(kakao_room.participants), 1),  # 상호작용 범위
            question_responses / len(messages)  # 질문/토론 참여도
        ]
        
        profile.leadership_score = sum(leadership_factors) / len(leadership_factors)
        
    def generate_learning_insights(self, profiles: Dict[str, PersonProfile]) -> List[ConversationInsight]:
        """학습 인사이트 생성"""
        
        insights = []
        
        # 가장 적극적인 참여자
        most_active = max(profiles.values(), key=lambda p: p.message_count)
        insights.append(ConversationInsight(
            insight_type="참여도",
            description=f"{most_active.display_name}님이 가장 적극적으로 참여 ({most_active.message_count}개 메시지)",
            confidence=0.9,
            supporting_evidence=[f"총 {most_active.message_count}개 메시지 작성"],
            timestamp=datetime.now()
        ))
        
        # 전문성 높은 참여자들
        expertise_leaders = {}
        for profile in profiles.values():
            for topic, score in profile.topic_expertise.items():
                if score > 0.7:
                    if topic not in expertise_leaders or score > expertise_leaders[topic][1]:
                        expertise_leaders[topic] = (profile.display_name, score)
                        
        for topic, (name, score) in expertise_leaders.items():
            insights.append(ConversationInsight(
                insight_type="전문성",
                description=f"{name}님이 '{topic}' 주제에서 높은 전문성 보유",
                confidence=score,
                supporting_evidence=[f"주제 전문성 점수: {score:.2f}"],
                timestamp=datetime.now()
            ))
        
        # 시공사 선호도 패턴
        company_preferences = defaultdict(list)
        for profile in profiles.values():
            if profile.preferred_construction_company:
                company_preferences[profile.preferred_construction_company].append(
                    (profile.display_name, profile.construction_company_confidence)
                )
                
        for company, supporters in company_preferences.items():
            if len(supporters) >= 2:
                supporter_names = [name for name, _ in supporters]
                avg_confidence = sum(conf for _, conf in supporters) / len(supporters)
                
                insights.append(ConversationInsight(
                    insight_type="선호도",
                    description=f"{company} 시공사를 선호하는 참여자들: {', '.join(supporter_names)}",
                    confidence=avg_confidence,
                    supporting_evidence=[f"{len(supporters)}명이 선호"],
                    timestamp=datetime.now()
                ))
        
        return insights
        
    def save_profiles(self, profiles: Dict[str, PersonProfile], file_path: str):
        """프로필을 JSON 파일로 저장"""
        
        serializable_profiles = {}
        for user_id, profile in profiles.items():
            profile_dict = asdict(profile)
            serializable_profiles[user_id] = profile_dict
            
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(serializable_profiles, f, ensure_ascii=False, indent=2, default=str)
            
        logger.info(f"프로필 저장 완료: {file_path}")
        
    def load_profiles(self, file_path: str) -> Dict[str, PersonProfile]:
        """JSON 파일에서 프로필 로드"""
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            profiles = {}
            for user_id, profile_dict in data.items():
                profiles[user_id] = PersonProfile(**profile_dict)
                
            logger.info(f"프로필 로드 완료: {len(profiles)}개")
            return profiles
            
        except Exception as e:
            logger.error(f"프로필 로드 실패: {e}")
            return {}


# 사용 예시
if __name__ == "__main__":
    print("🧠 카카오톡 대화 학습 시스템 테스트")
    print("=" * 50)
    
    from kakao_chat_parser import KakaoChatParser
    
    # 파서와 학습자 초기화
    parser = KakaoChatParser()
    learner = ConversationLearner()
    
    # 테스트 파일
    test_file = "chat_rooms/[인증]행복한소유☆개포우성7차/[인증]행복한소유☆개포우성7차.txt"
    
    if os.path.exists(test_file):
        try:
            # 대화 파싱
            kakao_room = parser.parse_chat_file(test_file)
            
            # 학습 실행
            profiles = learner.learn_from_kakao_room(kakao_room)
            
            # 결과 출력
            print(f"✅ 학습 완료: {len(profiles)}명의 프로필 생성")
            
            for user_id, profile in list(profiles.items())[:3]:  # 상위 3명만 출력
                print(f"\n👤 {profile.display_name}:")
                print(f"   📊 메시지: {profile.message_count}개")
                print(f"   🎭 스타일: {profile.communication_style}")
                print(f"   🏛️ 성향: {profile.political_stance}")
                print(f"   🏗️ 선호 시공사: {profile.preferred_construction_company or '없음'}")
                print(f"   🎯 관심사: {', '.join(profile.primary_interests[:2])}")
                
            # 인사이트 생성
            insights = learner.generate_learning_insights(profiles)
            print(f"\n💡 생성된 인사이트: {len(insights)}개")
            
            # 프로필 저장
            learner.save_profiles(profiles, "learned_profiles.json")
            
        except Exception as e:
            print(f"❌ 테스트 실패: {e}")
    else:
        print(f"❌ 테스트 파일 없음: {test_file}") 