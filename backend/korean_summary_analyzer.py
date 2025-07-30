from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime, timedelta
import logging
from collections import defaultdict

from chat_conversation_analyzer import ChatConversationAnalyzer, ChatMessage

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class KoreanPersonSummary:
    """한국어 특성 기반 개인 요약"""
    person_name: str
    role_category: str  # 실무진, 찬성파, 반대파, 중재자, 정보제공자
    speech_style: str   # 공식적, 비공식적, 감정적, 논리적
    politeness_level: str  # 높임말, 평어, 반말
    main_activities: List[str]  # 주요 활동 요약
    key_points: List[str]  # 핵심 발언 요약 (평어)
    topic_positions: Dict[str, str]  # 주제별 입장
    emotional_tone: str  # 감정적 톤


@dataclass
class KoreanConversationSummary:
    """한국어 특성 반영 대화 요약"""
    summary_id: str
    period: str
    participants_count: int
    person_summaries: List[KoreanPersonSummary]
    main_topics: List[str]
    key_discussions: List[str]
    cultural_characteristics: Dict[str, str]
    next_actions: List[str]


class KoreanSummaryAnalyzer:
    """한국어 요약본에 최적화된 분석기"""
    
    def __init__(self, analyzer: ChatConversationAnalyzer):
        self.analyzer = analyzer
        
        # 한국어 역할 패턴 (간단화)
        self.role_patterns = {
            "실무진": ["안내", "드립니다", "제공", "준비", "확인", "절차"],
            "찬성파": ["좋다", "찬성", "효율적", "적절", "긍정적", "동의"],
            "반대파": ["반대", "우려", "문제", "걱정", "의문", "비판"],
            "중재자": ["검토", "신중", "고려", "균형", "조정", "절충"],
            "정보제공자": ["공유", "참고", "자료", "정보", "확인", "첨부"]
        }
        
        # 높임말 → 평어 변환
        self.formal_to_casual = {
            "습니다": "함",
            "드립니다": "함", 
            "겠습니다": "할 예정",
            "해드리겠습니다": "해줄 예정",
            "부탁드립니다": "요청",
            "말씀드립니다": "언급",
            "안내드립니다": "안내",
            "확인해주시기 바랍니다": "확인 필요",
            "우려를 표명합니다": "우려됨",
            "지적하지 않을 수 없습니다": "지적 필요",
            "문제가 있다고 봅니다": "문제가 있음",
            "효과적이라고 생각합니다": "효과적임"
        }
        
    def create_korean_summary(self, 
                            start_time: datetime, 
                            end_time: datetime,
                            chat_room: Optional[str] = None) -> KoreanConversationSummary:
        """한국어 특성 반영 요약 생성"""
        
        # 메시지 조회
        messages = self.analyzer.get_messages_by_timerange(start_time, end_time, chat_room)
        
        if not messages:
            return self._create_empty_summary(start_time, end_time)
            
        # 개인별 분석
        person_summaries = self._analyze_persons(messages)
        
        # 주요 주제 추출
        main_topics = self._extract_main_topics(messages)
        
        # 핵심 토론 내용
        key_discussions = self._extract_key_discussions(messages)
        
        # 한국 문화적 특성
        cultural_characteristics = self._analyze_cultural_aspects(messages)
        
        # 후속 조치
        next_actions = self._suggest_next_actions(messages)
        
        return KoreanConversationSummary(
            summary_id=f"korean_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            period=f"{start_time.strftime('%Y년 %m월 %d일')} ~ {end_time.strftime('%Y년 %m월 %d일')}",
            participants_count=len(set(msg.sender for msg in messages)),
            person_summaries=person_summaries,
            main_topics=main_topics,
            key_discussions=key_discussions,
            cultural_characteristics=cultural_characteristics,
            next_actions=next_actions
        )
        
    def _analyze_persons(self, messages: List[ChatMessage]) -> List[KoreanPersonSummary]:
        """개인별 분석"""
        person_messages = defaultdict(list)
        for msg in messages:
            person_messages[msg.sender].append(msg)
            
        summaries = []
        for person_name, person_msgs in person_messages.items():
            summary = self._analyze_single_person(person_name, person_msgs)
            summaries.append(summary)
            
        return sorted(summaries, key=lambda x: len(x.key_points), reverse=True)
        
    def _analyze_single_person(self, person_name: str, messages: List[ChatMessage]) -> KoreanPersonSummary:
        """단일 개인 분석"""
        
        # 역할 분류
        role = self._classify_role(messages)
        
        # 말투 분석
        speech_style = self._analyze_speech_style(messages)
        
        # 경어법 분석
        politeness = self._analyze_politeness(messages)
        
        # 주요 활동 (간결하게)
        activities = self._extract_activities(messages)
        
        # 핵심 발언 (평어로 변환)
        key_points = self._extract_key_points(messages)
        
        # 주제별 입장
        positions = self._analyze_positions(messages)
        
        # 감정적 톤
        emotional_tone = self._analyze_emotional_tone(messages)
        
        return KoreanPersonSummary(
            person_name=person_name,
            role_category=role,
            speech_style=speech_style,
            politeness_level=politeness,
            main_activities=activities,
            key_points=key_points,
            topic_positions=positions,
            emotional_tone=emotional_tone
        )
        
    def _classify_role(self, messages: List[ChatMessage]) -> str:
        """역할 분류"""
        role_scores = defaultdict(int)
        
        for message in messages:
            content = message.content
            for role, keywords in self.role_patterns.items():
                score = sum(1 for keyword in keywords if keyword in content)
                role_scores[role] += score
                
        return max(role_scores, key=role_scores.get) if role_scores else "일반참여자"
        
    def _analyze_speech_style(self, messages: List[ChatMessage]) -> str:
        """말투 분석"""
        formal_count = 0
        emotional_count = 0
        logical_count = 0
        
        for message in messages:
            content = message.content
            
            if any(word in content for word in ["습니다", "드립니다", "부탁드립니다"]):
                formal_count += 1
                
            if any(word in content for word in ["정말", "너무", "매우", "완전"]):
                emotional_count += 1
                
            if any(word in content for word in ["따라서", "그러므로", "하지만", "그런데"]):
                logical_count += 1
                
        total = len(messages)
        if formal_count >= total * 0.6:
            return "공식적"
        elif emotional_count >= total * 0.4:
            return "감정적"
        elif logical_count >= total * 0.3:
            return "논리적"
        else:
            return "일반적"
            
    def _analyze_politeness(self, messages: List[ChatMessage]) -> str:
        """경어법 분석"""
        formal_count = 0
        casual_count = 0
        
        for message in messages:
            content = message.content
            
            if any(ending in content for ending in ["습니다", "드립니다", "세요"]):
                formal_count += 1
            elif any(ending in content for ending in ["해요", "어요", "죠"]):
                casual_count += 1
                
        if formal_count > casual_count:
            return "높임말"
        elif casual_count > formal_count:
            return "평어"
        else:
            return "혼용"
            
    def _extract_activities(self, messages: List[ChatMessage]) -> List[str]:
        """주요 활동 추출 (간결하게)"""
        activities = []
        
        activity_keywords = {
            "총회 관련 업무": ["총회", "안내", "서류", "준비"],
            "의견 제시": ["생각", "의견", "견해", "입장"],
            "정보 공유": ["공유", "참고", "자료", "확인"],
            "문제 제기": ["문제", "우려", "지적", "의문"],
            "지지 표명": ["찬성", "동의", "지지", "좋다"]
        }
        
        for activity, keywords in activity_keywords.items():
            related_count = sum(1 for msg in messages 
                              if any(keyword in msg.content for keyword in keywords))
            if related_count > 0:
                activities.append(f"{activity} ({related_count}회)")
                
        return activities[:3]  # 상위 3개
        
    def _extract_key_points(self, messages: List[ChatMessage]) -> List[str]:
        """핵심 발언 추출 (인용문은 원문 유지, 설명만 평어 변환)"""
        points = []
        
        for message in messages:
            content = message.content
            
            # 중요한 발언 판정
            importance_score = 0
            
            if len(content) > 80:
                importance_score += 2
                
            important_words = ["문제", "우려", "필요", "중요", "제안", "반대", "찬성"]
            importance_score += sum(1 for word in important_words if word in content)
            
            if importance_score >= 3:
                # 인용문은 원문 그대로 유지
                quoted_version = f'"{content}"'
                points.append(quoted_version)
                
        return points[:4]  # 상위 4개
        
    def _convert_to_casual(self, formal_text: str) -> str:
        """높임말을 평어로 변환"""
        casual = formal_text
        
        for formal, casual_form in self.formal_to_casual.items():
            casual = casual.replace(formal, casual_form)
            
        # 불필요한 수사 제거
        unnecessary = ["조합원 여러분께", "말씀드리면", "개인적으로는"]
        for phrase in unnecessary:
            casual = casual.replace(phrase, "")
            
        # 문장 정리
        casual = ' '.join(casual.split())
        
        # 길이 조정
        if len(casual) > 90:
            casual = casual[:87] + "..."
            
        return casual.strip()
        
    def _analyze_positions(self, messages: List[ChatMessage]) -> Dict[str, str]:
        """주제별 입장 분석"""
        positions = {}
        
        topics = {
            "운영권 논란": ["운영권", "위탁", "파르나스", "GS"],
            "시공사 선정": ["시공사", "건설사", "입찰", "계약"],
            "절차 문제": ["절차", "투명성", "검토", "신중"]
        }
        
        for topic_name, keywords in topics.items():
            topic_messages = [msg for msg in messages 
                            if any(keyword in msg.content for keyword in keywords)]
            
            if topic_messages:
                positive = sum(1 for msg in topic_messages 
                             if any(word in msg.content for word in ["좋다", "찬성", "효율적"]))
                negative = sum(1 for msg in topic_messages 
                             if any(word in msg.content for word in ["반대", "우려", "문제"]))
                
                if positive > negative:
                    positions[topic_name] = "긍정적"
                elif negative > positive:
                    positions[topic_name] = "부정적"
                else:
                    positions[topic_name] = "중립적"
                    
        return positions
        
    def _analyze_emotional_tone(self, messages: List[ChatMessage]) -> str:
        """감정적 톤 분석"""
        positive_words = ["좋다", "만족", "기쁘다", "훌륭하다"]
        negative_words = ["걱정", "우려", "불안", "화나다"]
        
        positive_count = sum(1 for msg in messages 
                           for word in positive_words if word in msg.content)
        negative_count = sum(1 for msg in messages 
                           for word in negative_words if word in msg.content)
        
        if positive_count > negative_count:
            return "긍정적"
        elif negative_count > positive_count:
            return "부정적"
        else:
            return "중립적"
            
    def _extract_main_topics(self, messages: List[ChatMessage]) -> List[str]:
        """주요 주제 추출"""
        topic_counts = defaultdict(int)
        
        topics = {
            "총회 운영": ["총회", "회의", "안건", "참석"],
            "운영권 논란": ["운영권", "위탁", "파르나스", "외부"],
            "시공사 문제": ["시공사", "GS", "건설", "계약"],
            "절차 투명성": ["절차", "투명성", "검토", "신중"],
            "분담금": ["분담금", "비용", "부담", "자금"]
        }
        
        for message in messages:
            for topic, keywords in topics.items():
                if any(keyword in message.content for keyword in keywords):
                    topic_counts[topic] += 1
                    
        # 상위 3개 주제
        return [topic for topic, count in topic_counts.most_common(3)]
        
    def _extract_key_discussions(self, messages: List[ChatMessage]) -> List[str]:
        """핵심 토론 내용 (인용문은 원문 유지)"""
        discussions = []
        
        # 긴 메시지들 중에서 토론성 내용 추출
        long_messages = [msg for msg in messages if len(msg.content) > 100]
        
        for message in long_messages:
            # 토론성 키워드가 포함된 경우
            if any(word in message.content for word in ["반대", "찬성", "우려", "제안", "의견"]):
                # 인용문으로 원문 그대로 표시
                discussions.append(f'{message.sender}: "{message.content}"')
                
        return discussions[:5]  # 상위 5개
        
    def _analyze_cultural_aspects(self, messages: List[ChatMessage]) -> Dict[str, str]:
        """한국 문화적 특성 분석"""
        harmony_words = ["조화", "화합", "협력", "상생"]
        respect_words = ["존중", "배려", "예의", "신중"]
        group_words = ["조합원", "전체", "공동", "함께"]
        
        harmony_count = sum(1 for msg in messages 
                          for word in harmony_words if word in msg.content)
        respect_count = sum(1 for msg in messages 
                          for word in respect_words if word in msg.content)
        group_count = sum(1 for msg in messages 
                        for word in group_words if word in msg.content)
        
        characteristics = {}
        
        if harmony_count >= 2:
            characteristics["조화추구"] = "높음"
        elif harmony_count >= 1:
            characteristics["조화추구"] = "보통"
        else:
            characteristics["조화추구"] = "낮음"
            
        if respect_count >= 3:
            characteristics["상호존중"] = "높음"
        else:
            characteristics["상호존중"] = "보통"
            
        if group_count >= 5:
            characteristics["집단의식"] = "강함"
        else:
            characteristics["집단의식"] = "보통"
            
        return characteristics
        
    def _suggest_next_actions(self, messages: List[ChatMessage]) -> List[str]:
        """후속 조치 제안"""
        actions = []
        
        # 메시지 내용 기반 제안
        if any("우려" in msg.content for msg in messages):
            actions.append("우려사항에 대한 추가 설명 및 해결방안 논의")
            
        if any("검토" in msg.content for msg in messages):
            actions.append("관련 사항 재검토 및 의견 수렴")
            
        if any("총회" in msg.content for msg in messages):
            actions.append("총회 준비사항 점검 및 참석률 제고")
            
        # 기본 제안
        if not actions:
            actions.append("지속적인 의견 교환 및 합의점 도출")
            
        return actions[:3]
        
    def format_korean_summary(self, summary: KoreanConversationSummary) -> str:
        """한국어 요약 포맷팅 (인용문은 원문 유지, 설명만 평어)"""
        
        formatted = f"""
📋 대화 요약
{'='*40}
📅 기간: {summary.period}
👥 참여자: {summary.participants_count}명

"""
        
        # 개인별 요약 (설명은 평어, 인용문은 원문)
        for person in summary.person_summaries:
            formatted += f"[{person.person_name}] - {person.role_category}\n"
            formatted += f"💬 말투: {person.speech_style} / 경어법: {person.politeness_level}\n"
            
            # 주요 활동 (설명 부분만 간결하게)
            if person.main_activities:
                formatted += f"주요 활동: {', '.join(person.main_activities)}\n"
                
            # 핵심 발언 (인용문은 원문 그대로)
            if person.key_points:
                formatted += f"핵심 발언:\n"
                for point in person.key_points:
                    # 인용문은 그대로, 추가 설명만 간결하게
                    formatted += f"  • {point}\n"
                    
            # 주제별 입장 (설명만 간결하게)
            if person.topic_positions:
                formatted += f"주제별 입장: "
                positions = [f"{topic}({stance})" for topic, stance in person.topic_positions.items()]
                formatted += ", ".join(positions) + "\n"
                
            formatted += "\n"
            
        # 주요 주제 (설명 부분만 간결하게)
        if summary.main_topics:
            formatted += f"🗨️ 주요 논의 주제\n"
            for i, topic in enumerate(summary.main_topics, 1):
                formatted += f"{i}. {topic}\n"
            formatted += "\n"
            
        # 핵심 토론 (인용문은 원문 그대로)
        if summary.key_discussions:
            formatted += f"💭 핵심 토론 내용\n"
            for discussion in summary.key_discussions:
                formatted += f"• {discussion}\n"
            formatted += "\n"
            
        # 문화적 특성 (설명만 간결하게)
        if summary.cultural_characteristics:
            formatted += f"🏮 한국 문화적 특성\n"
            for aspect, level in summary.cultural_characteristics.items():
                formatted += f"• {aspect}: {level}\n"
            formatted += "\n"
            
        # 후속 조치 (설명만 간결하게)
        if summary.next_actions:
            formatted += f"✅ 제안 사항\n"
            for i, action in enumerate(summary.next_actions, 1):
                formatted += f"{i}. {action}\n"
                
        return formatted
        
    def _create_empty_summary(self, start_time: datetime, end_time: datetime) -> KoreanConversationSummary:
        """빈 요약 생성"""
        return KoreanConversationSummary(
            summary_id=f"empty_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            period=f"{start_time.strftime('%Y년 %m월 %d일')} ~ {end_time.strftime('%Y년 %m월 %d일')}",
            participants_count=0,
            person_summaries=[],
            main_topics=[],
            key_discussions=[],
            cultural_characteristics={},
            next_actions=[]
        )


# 사용 예시
if __name__ == "__main__":
    print("🇰🇷 한국어 요약본 최적화 분석 시스템")
    print("=" * 50)
    print("✅ 높임말 → 평어 자동 변환")
    print("📝 요약본에 맞는 간결한 표현")
    print("🎯 한국인이 읽기 편한 자연스러운 문체")
    print("🚀 **요약본에 최적화된 한국어 분석 시스템 완성!**") 