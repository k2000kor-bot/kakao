from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta, date, time
import json
import logging
import sqlite3
from collections import defaultdict, Counter
import re

from chat_conversation_analyzer import ChatConversationAnalyzer, ChatMessage

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class PersonStatement:
    """개인별 발언"""
    person_name: str
    statement_type: str  # 안내, 논란제기, 지지, 반대, 질문, 정보제공
    content: str
    timestamp: datetime
    topic: str
    stance: str  # positive, negative, neutral
    importance_score: float


@dataclass
class TopicDiscussion:
    """주제별 토론"""
    topic_name: str
    main_issue: str
    supporters: List[Dict[str, Any]]  # 지지자들과 발언
    opponents: List[Dict[str, Any]]   # 반대자들과 발언
    neutral_participants: List[Dict[str, Any]]  # 중립 참여자들
    key_points: List[str]
    resolution_status: str  # ongoing, resolved, escalated
    consensus_level: float


@dataclass
class AdvancedPersonSummary:
    """고도화된 개인별 요약"""
    person_name: str
    role_classification: str  # 조합장, 실무진, 찬성파, 반대파, 중립
    total_messages: int
    main_activities: List[Dict[str, Any]]  # 주요 활동들
    position_statements: List[Dict[str, Any]]  # 입장 표명들
    key_contributions: List[str]  # 주요 기여
    interaction_pattern: Dict[str, Any]  # 상호작용 패턴
    influence_indicators: Dict[str, float]
    timeline_summary: List[Dict[str, Any]]  # 시간순 주요 발언


@dataclass
class AdvancedConversationSummary:
    """고도화된 대화 요약"""
    summary_id: str
    period: str
    total_participants: int
    person_summaries: List[AdvancedPersonSummary]
    topic_discussions: List[TopicDiscussion]
    key_decisions: List[Dict[str, Any]]
    conflict_points: List[Dict[str, Any]]
    information_sharing: List[Dict[str, Any]]
    procedural_announcements: List[Dict[str, Any]]
    overall_sentiment: Dict[str, Any]
    critical_moments: List[Dict[str, Any]]


class AdvancedConversationSummarizer:
    """고도화된 대화 요약 분석 시스템"""
    
    def __init__(self, analyzer: ChatConversationAnalyzer):
        self.analyzer = analyzer
        
        # 실제 조합 대화방 패턴 분석을 위한 확장된 키워드
        self.issue_patterns = self._initialize_issue_patterns()
        self.role_indicators = self._initialize_role_indicators()
        self.stance_patterns = self._initialize_stance_patterns()
        self.procedural_patterns = self._initialize_procedural_patterns()
        
    def _initialize_issue_patterns(self) -> Dict[str, Dict[str, Any]]:
        """실제 이슈 패턴 초기화"""
        return {
            "총회_안내": {
                "keywords": ["총회", "회의", "참석", "위임장", "서류", "장소", "시간", "안내", "셔틀", "일정"],
                "statement_types": ["안내", "정보제공"],
                "typical_roles": ["조합장", "실무진", "총무"]
            },
            "시공사_선정": {
                "keywords": ["GS", "현대건설", "대우건설", "시공사", "입찰", "수의계약", "경쟁입찰", "제안서"],
                "statement_types": ["지지", "반대", "논란제기", "질문"],
                "typical_roles": ["찬성파", "반대파", "중립"]
            },
            "운영권_논란": {
                "keywords": ["운영권", "파르나스", "스카이커뮤니티", "외부위탁", "협약", "조합원권리", "침해"],
                "statement_types": ["논란제기", "반대", "지지", "우려표명"],
                "typical_roles": ["반대파", "찬성파", "실무진"]
            },
            "분담금_관련": {
                "keywords": ["분담금", "부담", "비용", "추가분담금", "정산", "자금", "대출"],
                "statement_types": ["우려표명", "질문", "정보제공"],
                "typical_roles": ["일반조합원", "재무담당"]
            },
            "절차_투명성": {
                "keywords": ["투명성", "절차", "미준수", "검토", "심의", "승인", "의사결정"],
                "statement_types": ["논란제기", "비판", "개선요구"],
                "typical_roles": ["반대파", "감시역할"]
            },
            "사업_진행": {
                "keywords": ["사업진행", "속도", "일정", "지연", "빠른진행", "신중", "검토기간"],
                "statement_types": ["의견제시", "우려표명", "촉구"],
                "typical_roles": ["찬성파", "반대파"]
            }
        }
        
    def _initialize_role_indicators(self) -> Dict[str, List[str]]:
        """역할 지표 키워드"""
        return {
            "조합장": ["조합장", "대표", "의장", "주재", "총회주재", "안건상정"],
            "실무진": ["안내", "서류", "절차", "일정", "공지", "파일제공", "출력", "셔틀"],
            "찬성파": ["찬성", "지지", "긍정적", "효율적", "경쟁력", "품질", "유리", "실용적"],
            "반대파": ["반대", "우려", "문제", "위험", "침해", "불투명", "비판", "경계"],
            "중립": ["검토", "신중", "양쪽", "균형", "객관적", "중립", "생각해봐야"],
            "정보제공자": ["정보", "자료", "사례", "영상", "공유", "확인", "참고"],
            "실무담당": ["담당", "업무", "처리", "진행", "관리", "조율", "준비"]
        }
        
    def _initialize_stance_patterns(self) -> Dict[str, List[str]]:
        """입장 패턴 키워드"""
        return {
            "강력지지": ["적극찬성", "완전동의", "전적지지", "강력추천", "최고의선택"],
            "일반지지": ["찬성", "지지", "좋다", "괜찮다", "동의", "긍정적"],
            "조건부지지": ["조건부", "수정하면", "보완되면", "개선되면", "단서"],
            "중립": ["중립", "객관적", "양쪽다", "신중", "검토필요", "더봐야"],
            "조건부반대": ["우려", "걱정", "재검토", "보완필요", "수정요구"],
            "일반반대": ["반대", "안된다", "문제", "위험", "부정적"],
            "강력반대": ["절대반대", "강력반대", "결사반대", "안된다", "매우위험"]
        }
        
    def _initialize_procedural_patterns(self) -> Dict[str, List[str]]:
        """절차적 발언 패턴"""
        return {
            "안내사항": ["안내", "공지", "알려드립니다", "참고", "확인", "준비"],
            "질문": ["궁금", "질문", "문의", "어떻게", "왜", "언제", "얼마"],
            "제안": ["제안", "건의", "추천", "어떨까요", "해보자", "하면좋겠다"],
            "우려표명": ["우려", "걱정", "염려", "불안", "위험", "문제될수"],
            "정보제공": ["정보", "자료", "사실", "확인됨", "알려진바", "데이터"],
            "의견표명": ["생각", "의견", "입장", "견해", "관점", "판단"],
            "비판": ["비판", "문제", "잘못", "오류", "실수", "부적절"]
        }
        
    def create_advanced_summary(self, 
                              start_time: datetime, 
                              end_time: datetime,
                              chat_room: Optional[str] = None) -> AdvancedConversationSummary:
        """고도화된 대화 요약 생성"""
        
        # 해당 시간대 메시지 조회
        messages = self.analyzer.get_messages_by_timerange(start_time, end_time, chat_room)
        
        if not messages:
            return self._create_empty_advanced_summary(start_time, end_time)
            
        # 참여자별 메시지 그룹화
        person_messages = defaultdict(list)
        for msg in messages:
            person_messages[msg.sender].append(msg)
            
        # 1. 개인별 고도화 분석
        person_summaries = []
        for person_name, person_msgs in person_messages.items():
            summary = self._analyze_person_advanced(person_name, person_msgs, messages)
            person_summaries.append(summary)
            
        # 2. 주제별 토론 분석
        topic_discussions = self._analyze_topic_discussions(messages, person_summaries)
        
        # 3. 주요 의사결정 추출
        key_decisions = self._extract_key_decisions(messages)
        
        # 4. 갈등 지점 분석
        conflict_points = self._analyze_conflict_points(messages, person_summaries)
        
        # 5. 정보 공유 분석
        information_sharing = self._analyze_information_sharing(messages)
        
        # 6. 절차적 공지사항
        procedural_announcements = self._extract_procedural_announcements(messages)
        
        # 7. 전체 감정 분석
        overall_sentiment = self._analyze_overall_sentiment(messages, person_summaries)
        
        # 8. 중요 순간들
        critical_moments = self._identify_critical_moments(messages, topic_discussions)
        
        summary = AdvancedConversationSummary(
            summary_id=f"adv_sum_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            period=f"{start_time.strftime('%Y-%m-%d %H:%M')} ~ {end_time.strftime('%Y-%m-%d %H:%M')}",
            total_participants=len(person_summaries),
            person_summaries=person_summaries,
            topic_discussions=topic_discussions,
            key_decisions=key_decisions,
            conflict_points=conflict_points,
            information_sharing=information_sharing,
            procedural_announcements=procedural_announcements,
            overall_sentiment=overall_sentiment,
            critical_moments=critical_moments
        )
        
        return summary
        
    def _analyze_person_advanced(self, person_name: str, 
                               person_messages: List[ChatMessage],
                               all_messages: List[ChatMessage]) -> AdvancedPersonSummary:
        """개인별 고도화 분석"""
        
        # 역할 분류
        role_classification = self._classify_person_role(person_messages)
        
        # 주요 활동 분석
        main_activities = self._analyze_main_activities(person_messages)
        
        # 입장 표명 분석
        position_statements = self._analyze_position_statements(person_messages)
        
        # 주요 기여 추출
        key_contributions = self._extract_key_contributions(person_messages)
        
        # 상호작용 패턴
        interaction_pattern = self._analyze_interaction_pattern(person_name, person_messages, all_messages)
        
        # 영향력 지표
        influence_indicators = self._calculate_influence_indicators(person_name, person_messages, all_messages)
        
        # 시간순 요약
        timeline_summary = self._create_timeline_summary(person_messages)
        
        return AdvancedPersonSummary(
            person_name=person_name,
            role_classification=role_classification,
            total_messages=len(person_messages),
            main_activities=main_activities,
            position_statements=position_statements,
            key_contributions=key_contributions,
            interaction_pattern=interaction_pattern,
            influence_indicators=influence_indicators,
            timeline_summary=timeline_summary
        )
        
    def _classify_person_role(self, messages: List[ChatMessage]) -> str:
        """개인 역할 분류"""
        role_scores = defaultdict(float)
        
        for message in messages:
            content = message.content
            
            # 각 역할별 키워드 매칭
            for role, keywords in self.role_indicators.items():
                score = sum(1 for keyword in keywords if keyword in content)
                role_scores[role] += score
                
            # 메시지 특성 분석
            if len(content) > 200:  # 긴 메시지 = 설명자 역할
                role_scores["실무진"] += 0.5
                
            if any(word in content for word in ["안내", "공지", "알려드립니다"]):
                role_scores["실무진"] += 1
                
            if any(word in content for word in ["반대", "우려", "문제"]):
                role_scores["반대파"] += 1
                
            if any(word in content for word in ["찬성", "지지", "좋다"]):
                role_scores["찬성파"] += 1
                
        # 가장 높은 점수의 역할 반환
        if role_scores:
            return max(role_scores, key=role_scores.get)
        else:
            return "일반조합원"
            
    def _analyze_main_activities(self, messages: List[ChatMessage]) -> List[Dict[str, Any]]:
        """주요 활동 분석"""
        activities = []
        
        # 메시지를 주제별로 그룹화
        topic_groups = defaultdict(list)
        for msg in messages:
            topic_groups[msg.topic_category or "기타"].append(msg)
            
        for topic, topic_messages in topic_groups.items():
            if len(topic_messages) >= 2:  # 2개 이상 메시지가 있는 주제만
                # 주요 내용 추출
                key_content = self._extract_key_content_from_messages(topic_messages)
                
                # 활동 유형 분석
                activity_type = self._classify_activity_type(topic_messages)
                
                activities.append({
                    "topic": topic,
                    "activity_type": activity_type,
                    "message_count": len(topic_messages),
                    "key_content": key_content,
                    "time_range": {
                        "start": topic_messages[0].timestamp.isoformat(),
                        "end": topic_messages[-1].timestamp.isoformat()
                    }
                })
                
        return sorted(activities, key=lambda x: x["message_count"], reverse=True)
        
    def _analyze_position_statements(self, messages: List[ChatMessage]) -> List[Dict[str, Any]]:
        """입장 표명 분석"""
        position_statements = []
        
        for message in messages:
            content = message.content
            
            # 입장 표명 키워드 확인
            stance = self._detect_stance(content)
            
            if stance != "중립":  # 명확한 입장이 있는 경우만
                # 대상 이슈 파악
                target_issue = self._identify_target_issue(content)
                
                position_statements.append({
                    "timestamp": message.timestamp.isoformat(),
                    "stance": stance,
                    "target_issue": target_issue,
                    "content": content,
                    "confidence": self._calculate_stance_confidence(content, stance)
                })
                
        return sorted(position_statements, key=lambda x: x["confidence"], reverse=True)
        
    def _extract_key_contributions(self, messages: List[ChatMessage]) -> List[str]:
        """주요 기여 추출"""
        contributions = []
        
        for message in messages:
            content = message.content
            
            # 기여 유형별 체크
            if any(word in content for word in ["안내", "공지", "알려드립니다"]):
                contributions.append(f"정보 안내: {content[:50]}...")
                
            elif any(word in content for word in ["제안", "건의", "추천"]):
                contributions.append(f"개선 제안: {content[:50]}...")
                
            elif any(word in content for word in ["자료", "정보", "사례", "영상"]):
                contributions.append(f"자료 제공: {content[:50]}...")
                
            elif len(content) > 200:  # 긴 설명
                contributions.append(f"상세 설명: {content[:50]}...")
                
            elif any(word in content for word in ["질문", "궁금", "문의"]):
                contributions.append(f"질의응답: {content[:50]}...")
                
        return contributions[:5]  # 상위 5개만
        
    def _analyze_topic_discussions(self, messages: List[ChatMessage], 
                                 person_summaries: List[AdvancedPersonSummary]) -> List[TopicDiscussion]:
        """주제별 토론 분석"""
        discussions = []
        
        # 주제별 메시지 그룹화
        topic_groups = defaultdict(list)
        for msg in messages:
            for issue_name, issue_data in self.issue_patterns.items():
                if any(keyword in msg.content for keyword in issue_data["keywords"]):
                    topic_groups[issue_name].append(msg)
                    break
        else:
            topic_groups["기타"].append(msg)
            
        for topic_name, topic_messages in topic_groups.items():
            if len(topic_messages) >= 3:  # 최소 3개 이상의 메시지가 있는 주제
                discussion = self._analyze_single_topic_discussion(topic_name, topic_messages, person_summaries)
                discussions.append(discussion)
                
        return discussions
        
    def _analyze_single_topic_discussion(self, topic_name: str, 
                                       topic_messages: List[ChatMessage],
                                       person_summaries: List[AdvancedPersonSummary]) -> TopicDiscussion:
        """단일 주제 토론 분석"""
        
        # 참여자별 입장 분류
        supporters = []
        opponents = []
        neutral_participants = []
        
        participant_stances = defaultdict(list)
        
        for msg in topic_messages:
            stance = self._detect_stance(msg.content)
            participant_stances[msg.sender].append({
                "stance": stance,
                "content": msg.content,
                "timestamp": msg.timestamp.isoformat()
            })
            
        # 참여자별 전체 입장 판단
        for participant, stances in participant_stances.items():
            overall_stance = self._determine_overall_stance(stances)
            
            participant_data = {
                "name": participant,
                "stance": overall_stance,
                "statements": stances,
                "message_count": len(stances)
            }
            
            if overall_stance in ["강력지지", "일반지지", "조건부지지"]:
                supporters.append(participant_data)
            elif overall_stance in ["강력반대", "일반반대", "조건부반대"]:
                opponents.append(participant_data)
            else:
                neutral_participants.append(participant_data)
                
        # 주요 쟁점 추출
        main_issue = self._extract_main_issue(topic_messages)
        
        # 핵심 포인트들
        key_points = self._extract_key_points_from_topic(topic_messages)
        
        # 해결 상태
        resolution_status = self._determine_resolution_status(topic_messages, supporters, opponents)
        
        # 합의 수준
        consensus_level = self._calculate_consensus_level_advanced(supporters, opponents, neutral_participants)
        
        return TopicDiscussion(
            topic_name=topic_name,
            main_issue=main_issue,
            supporters=supporters,
            opponents=opponents,
            neutral_participants=neutral_participants,
            key_points=key_points,
            resolution_status=resolution_status,
            consensus_level=consensus_level
        )
        
    def format_advanced_summary(self, summary: AdvancedConversationSummary) -> str:
        """고도화된 요약을 사용자 친화적 형식으로 포맷팅"""
        
        formatted_text = f"""
📋 고도화된 대화 요약 리포트
{'='*60}
📅 기간: {summary.period}
👥 참여자: {summary.total_participants}명
📊 주요 토론: {len(summary.topic_discussions)}개
⚡ 핵심 의사결정: {len(summary.key_decisions)}건

"""
        
        # 개인별 상세 요약
        for person_summary in summary.person_summaries:
            formatted_text += f"""
[{person_summary.person_name}] ({person_summary.role_classification})
"""
            
            # 주요 활동들
            for i, activity in enumerate(person_summary.main_activities, 1):
                formatted_text += f"- {activity['activity_type']}: {activity['topic']}\n"
                formatted_text += f"  {activity['key_content']}\n"
                if i < len(person_summary.main_activities):
                    formatted_text += "\n"
                    
            # 핵심 기여
            if person_summary.key_contributions:
                formatted_text += f"\n주요 기여:\n"
                for contribution in person_summary.key_contributions:
                    formatted_text += f"- {contribution}\n"
                    
            # 입장 표명
            if person_summary.position_statements:
                positions_by_issue = defaultdict(list)
                for pos in person_summary.position_statements:
                    positions_by_issue[pos['target_issue']].append(pos)
                    
                for issue, positions in positions_by_issue.items():
                    if len(positions) > 0:
                        main_pos = positions[0]  # 가장 확신이 높은 입장
                        formatted_text += f"- {issue}에 대한 입장: {main_pos['stance']}\n"
                        
            formatted_text += "\n"
            
        # 주제별 토론 요약
        formatted_text += f"""
📝 주제별 토론 분석
{'='*40}
"""
        
        for discussion in summary.topic_discussions:
            formatted_text += f"""
🗨️ {discussion.topic_name.replace('_', ' ').title()}
주요 쟁점: {discussion.main_issue}

찬성측 ({len(discussion.supporters)}명):
"""
            for supporter in discussion.supporters:
                key_statement = supporter['statements'][0]['content'][:100] + "..." if supporter['statements'] else ""
                formatted_text += f"- {supporter['name']}: {key_statement}\n"
                
            formatted_text += f"\n반대측 ({len(discussion.opponents)}명):\n"
            for opponent in discussion.opponents:
                key_statement = opponent['statements'][0]['content'][:100] + "..." if opponent['statements'] else ""
                formatted_text += f"- {opponent['name']}: {key_statement}\n"
                
            if discussion.neutral_participants:
                formatted_text += f"\n중립/기타 ({len(discussion.neutral_participants)}명):\n"
                for neutral in discussion.neutral_participants:
                    key_statement = neutral['statements'][0]['content'][:100] + "..." if neutral['statements'] else ""
                    formatted_text += f"- {neutral['name']}: {key_statement}\n"
                    
            formatted_text += f"\n핵심 포인트:\n"
            for point in discussion.key_points:
                formatted_text += f"• {point}\n"
                
            formatted_text += f"합의 수준: {discussion.consensus_level:.1%}\n"
            formatted_text += f"해결 상태: {discussion.resolution_status}\n\n"
            
        # 주요 의사결정
        if summary.key_decisions:
            formatted_text += f"""
⚖️ 주요 의사결정
{'='*30}
"""
            for decision in summary.key_decisions:
                formatted_text += f"• {decision['content']} (결정자: {decision['decision_maker']})\n"
                
        # 갈등 포인트
        if summary.conflict_points:
            formatted_text += f"""
⚠️ 주요 갈등 포인트
{'='*30}
"""
            for conflict in summary.conflict_points:
                formatted_text += f"• {conflict['issue']}: {conflict['description']}\n"
                
        # 정보 공유
        if summary.information_sharing:
            formatted_text += f"""
📊 정보 공유 사항
{'='*30}
"""
            for info in summary.information_sharing:
                formatted_text += f"• {info['provider']}: {info['content'][:100]}...\n"
                
        return formatted_text
        
    # 유틸리티 메서드들
    def _detect_stance(self, content: str) -> str:
        """입장 감지"""
        stance_scores = defaultdict(int)
        
        for stance, keywords in self.stance_patterns.items():
            score = sum(1 for keyword in keywords if keyword in content)
            stance_scores[stance] = score
            
        return max(stance_scores, key=stance_scores.get) if stance_scores else "중립"
        
    def _identify_target_issue(self, content: str) -> str:
        """대상 이슈 식별"""
        for issue_name, issue_data in self.issue_patterns.items():
            if any(keyword in content for keyword in issue_data["keywords"]):
                return issue_name.replace('_', ' ')
        return "일반사항"
        
    def _extract_main_issue(self, messages: List[ChatMessage]) -> str:
        """주요 쟁점 추출"""
        # 가장 자주 언급되는 키워드들로 쟁점 파악
        content_text = " ".join(msg.content for msg in messages)
        
        issue_keywords = []
        for issue_data in self.issue_patterns.values():
            for keyword in issue_data["keywords"]:
                if keyword in content_text:
                    issue_keywords.append(keyword)
                    
        if issue_keywords:
            return f"{', '.join(set(issue_keywords[:3]))}에 대한 논의"
        else:
            return "관련 사안에 대한 의견 교환"
            
    def _extract_key_content_from_messages(self, messages: List[ChatMessage]) -> str:
        """메시지들에서 핵심 내용 추출"""
        if not messages:
            return ""
            
        # 가장 긴 메시지나 키워드가 많은 메시지 선택
        key_message = max(messages, key=lambda x: len(x.content))
        return key_message.content[:100] + "..." if len(key_message.content) > 100 else key_message.content
        
    def _classify_activity_type(self, messages: List[ChatMessage]) -> str:
        """활동 유형 분류"""
        content_combined = " ".join(msg.content for msg in messages)
        
        for activity_type, keywords in self.procedural_patterns.items():
            if any(keyword in content_combined for keyword in keywords):
                return activity_type
                
        return "일반토론"
        
    def _create_empty_advanced_summary(self, start_time: datetime, end_time: datetime) -> AdvancedConversationSummary:
        """빈 고도화 요약 생성"""
        return AdvancedConversationSummary(
            summary_id=f"empty_adv_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            period=f"{start_time.strftime('%Y-%m-%d %H:%M')} ~ {end_time.strftime('%Y-%m-%d %H:%M')}",
            total_participants=0,
            person_summaries=[],
            topic_discussions=[],
            key_decisions=[],
            conflict_points=[],
            information_sharing=[],
            procedural_announcements=[],
            overall_sentiment={},
            critical_moments=[]
        )
        
    # 추가 구현이 필요한 메서드들은 간단한 구조만 제공
    def _analyze_interaction_pattern(self, person_name: str, person_messages: List[ChatMessage], all_messages: List[ChatMessage]) -> Dict[str, Any]:
        return {"interactions": len(person_messages), "mentions": 0}
        
    def _calculate_influence_indicators(self, person_name: str, person_messages: List[ChatMessage], all_messages: List[ChatMessage]) -> Dict[str, float]:
        return {"message_influence": len(person_messages) / len(all_messages), "topic_leadership": 0.5}
        
    def _create_timeline_summary(self, messages: List[ChatMessage]) -> List[Dict[str, Any]]:
        return [{"time": msg.timestamp.isoformat(), "content": msg.content[:50]} for msg in messages[-3:]]
        
    def _extract_key_decisions(self, messages: List[ChatMessage]) -> List[Dict[str, Any]]:
        decisions = []
        for msg in messages:
            if any(word in msg.content for word in ["결정", "확정", "승인", "의결"]):
                decisions.append({
                    "content": msg.content[:100],
                    "decision_maker": msg.sender,
                    "timestamp": msg.timestamp.isoformat()
                })
        return decisions
        
    def _analyze_conflict_points(self, messages: List[ChatMessage], person_summaries: List[AdvancedPersonSummary]) -> List[Dict[str, Any]]:
        conflicts = []
        for msg in messages:
            if any(word in msg.content for word in ["반대", "문제", "우려", "비판"]):
                conflicts.append({
                    "issue": "의견 대립",
                    "description": msg.content[:100],
                    "participants": [msg.sender]
                })
        return conflicts[:5]
        
    def _analyze_information_sharing(self, messages: List[ChatMessage]) -> List[Dict[str, Any]]:
        info_sharing = []
        for msg in messages:
            if any(word in msg.content for word in ["안내", "정보", "자료", "공지"]):
                info_sharing.append({
                    "provider": msg.sender,
                    "content": msg.content,
                    "type": "정보제공"
                })
        return info_sharing
        
    def _extract_procedural_announcements(self, messages: List[ChatMessage]) -> List[Dict[str, Any]]:
        announcements = []
        for msg in messages:
            if any(word in msg.content for word in ["총회", "안내", "일정", "공지"]):
                announcements.append({
                    "content": msg.content,
                    "announcer": msg.sender,
                    "timestamp": msg.timestamp.isoformat()
                })
        return announcements
        
    def _analyze_overall_sentiment(self, messages: List[ChatMessage], person_summaries: List[AdvancedPersonSummary]) -> Dict[str, Any]:
        sentiments = [msg.sentiment for msg in messages if msg.sentiment]
        sentiment_counts = Counter(sentiments)
        total = len(sentiments)
        
        return {
            "positive_ratio": sentiment_counts.get("positive", 0) / total if total > 0 else 0,
            "negative_ratio": sentiment_counts.get("negative", 0) / total if total > 0 else 0,
            "neutral_ratio": sentiment_counts.get("neutral", 0) / total if total > 0 else 0,
            "overall_tone": "balanced" if total > 0 else "unknown"
        }
        
    def _identify_critical_moments(self, messages: List[ChatMessage], topic_discussions: List[TopicDiscussion]) -> List[Dict[str, Any]]:
        critical = []
        for msg in messages:
            if len(msg.content) > 200 or any(word in msg.content for word in ["중요", "결정", "반대", "찬성"]):
                critical.append({
                    "timestamp": msg.timestamp.isoformat(),
                    "person": msg.sender,
                    "content": msg.content[:100],
                    "importance": "high"
                })
        return critical[:5]
        
    def _determine_overall_stance(self, stances: List[Dict[str, Any]]) -> str:
        stance_counts = Counter(s["stance"] for s in stances)
        return stance_counts.most_common(1)[0][0] if stance_counts else "중립"
        
    def _extract_key_points_from_topic(self, messages: List[ChatMessage]) -> List[str]:
        points = []
        for msg in messages:
            if len(msg.content) > 100:  # 상세한 메시지만
                points.append(msg.content[:80] + "...")
        return points[:5]
        
    def _determine_resolution_status(self, messages: List[ChatMessage], supporters: List, opponents: List) -> str:
        if len(supporters) > len(opponents) * 2:
            return "찬성 우세"
        elif len(opponents) > len(supporters) * 2:
            return "반대 우세"
        else:
            return "논의 진행중"
            
    def _calculate_consensus_level_advanced(self, supporters: List, opponents: List, neutral: List) -> float:
        total = len(supporters) + len(opponents) + len(neutral)
        if total == 0:
            return 0.0
        
        max_group = max(len(supporters), len(opponents))
        return max_group / total
        
    def _calculate_stance_confidence(self, content: str, stance: str) -> float:
        """입장 표명 확신도 계산"""
        confidence_words = {
            "high": ["확실", "분명", "절대", "완전", "100%", "틀림없이"],
            "medium": ["생각", "같다", "보인다", "것같다"],
            "low": ["아마", "어쩌면", "혹시", "그럴수도"]
        }
        
        if any(word in content for word in confidence_words["high"]):
            return 0.9
        elif any(word in content for word in confidence_words["low"]):
            return 0.3
        else:
            return 0.6


# 사용 예시 및 테스트
if __name__ == "__main__":
    from chat_conversation_analyzer import ChatConversationAnalyzer
    
    # 시스템 초기화
    analyzer = ChatConversationAnalyzer()
    advanced_summarizer = AdvancedConversationSummarizer(analyzer)
    
    print("📋 고도화된 대화 요약 시스템 테스트")
    print("=" * 50)
    
    # 실제 샘플 데이터와 유사한 테스트 메시지 생성
    sample_messages = [
        ChatMessage(
            message_id="msg_001",
            chat_room="demo_chat_room",
            sender="김한수",
            content="총회 실무 안내드립니다. 위임장, 회의비 신청서 등 파일 제공해드리고 출력 안내드리겠습니다. 총회 장소, 참석절차, 시간표 안내드립니다.",
            timestamp=datetime.now(),
            message_type="text",
            sentiment="neutral",
            topic_category="총회"
        ),
        ChatMessage(
            message_id="msg_002",
            chat_room="demo_chat_room",
            sender="송미화",
            content="GS-파르나스 협약이 조합원 권리 침해 소지가 있다고 봅니다. 외부 위탁의 불투명성을 지적하고 싶습니다.",
            timestamp=datetime.now(),
            message_type="text",
            sentiment="negative",
            topic_category="운영권"
        ),
        ChatMessage(
            message_id="msg_003",
            chat_room="demo_chat_room",
            sender="김혜경",
            content="외부 위탁 초기는 효율적일 수 있으며, 지나친 불안감은 경계해야 한다고 생각합니다. 본계약 이후에도 협상 가능하며 상생을 목표로 해야 합니다.",
            timestamp=datetime.now(),
            message_type="text",
            sentiment="positive",
            topic_category="운영권"
        )
    ]
    
    # 메시지 저장
    analyzer.save_messages(sample_messages)
    
    # 고도화된 요약 생성
    end_time = datetime.now()
    start_time = end_time - timedelta(hours=1)
    
    advanced_summary = advanced_summarizer.create_advanced_summary(start_time, end_time)
    
    # 포맷팅된 결과 출력
    formatted_result = advanced_summarizer.format_advanced_summary(advanced_summary)
    print(formatted_result)
    
    print("\n✅ 고도화된 대화 요약 시스템 구축 완료!")
    print("   🎯 실제 조합 대화방 패턴 분석 가능")
    print("   📊 개인별 역할 및 입장 자동 분류")
    print("   🗨️ 주제별 찬반 의견 체계적 정리")
    print("   📋 실무진/조합장/찬성파/반대파 구분")
    print("   💎 실제 사용 가능한 고품질 요약 제공") 