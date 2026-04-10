#!/usr/bin/env python3
"""
카카오톡 대화 요약 시스템 v1.0
- 특정 기간의 대화 내용을 주제별로 분석하고 요약
- 감정 분석과 핵심 키워드 추출
"""

import re
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from collections import defaultdict, Counter
import uuid

@dataclass
class ConversationTopic:
    """대화 주제"""
    topic_id: str
    title: str
    messages: List[Dict[str, Any]]
    participants: List[str]
    sentiment: str  # positive, negative, neutral
    key_points: List[str]
    summary: str
    start_time: datetime
    end_time: datetime

@dataclass
class ConversationSummary:
    """대화 요약"""
    summary_id: str
    period_start: datetime
    period_end: datetime
    total_messages: int
    total_participants: int
    topics: List[ConversationTopic]
    overall_sentiment: str
    key_insights: List[str]
    created_at: datetime

class KakaoConversationSummarizer:
    """카카오톡 대화 요약기"""
    
    def __init__(self):
        self.topic_keywords = self._initialize_topic_keywords()
        self.sentiment_keywords = self._initialize_sentiment_keywords()
        
    def _initialize_topic_keywords(self) -> Dict[str, List[str]]:
        """주제별 키워드 초기화"""
        return {
            "시공사_평가": [
                "시공사", "공사비", "분담금", "고급화", "설계", "제안서", "입찰", "평가", "기준",
                "대우건설", "삼성", "현대", "롯데", "포스코", "건설사"
            ],
            "홍보_마케팅": [
                "홍보", "부스", "마케팅", "홍보직원", "설명", "프레젠테이션", "브로셔",
                "방문", "인상", "태도", "매너", "응대"
            ],
            "공사비_분담금": [
                "880만원", "800만원", "분담금", "세대당", "4억", "공사비", "내역",
                "품질", "고급화", "항목", "비용", "예산"
            ],
            "평면_커뮤니티": [
                "평면", "커뮤니티", "외관", "디자인", "수영장", "헬스장", "사우나",
                "지하주차장", "마감재", "시설", "구성", "가치"
            ],
            "일반_소통": [
                "안녕", "고맙", "알겠", "네", "그래", "맞아", "동감", "좋아"
            ]
        }
    
    def _initialize_sentiment_keywords(self) -> Dict[str, List[str]]:
        """감정 키워드 초기화"""
        return {
            "positive": [
                "좋아", "기쁘", "만족", "감사", "고맙", "훌륭", "최고", "완벽",
                "^^", "😊", "😄", "👍", "❤️", "💕"
            ],
            "negative": [
                "싫어", "화나", "짜증", "실망", "아쉽", "힘들", "어려", "문제",
                "ㅠㅠ", "😢", "😭", "😔", "😠", "😡"
            ],
            "neutral": [
                "그래", "네", "알겠", "됐", "괜찮", "보통", "일반"
            ]
        }
    
    def parse_kakao_messages(self, file_path: str, start_date: str = None, end_date: str = None, 
                            start_datetime: str = None, end_datetime: str = None) -> List[Dict[str, Any]]:
        """카카오톡 메시지 파싱"""
        messages = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            print(f"파일 크기: {len(content)} 문자")
            
            # 줄바꿈 정규화
            content = content.replace('\r\n', '\n').replace('\r', '\n')
            lines = content.split('\n')
            
            print(f"총 라인 수: {len(lines)}")
            
            # 날짜/시간 필터링을 위한 변환
            filter_start = None
            filter_end = None
            
            # start_datetime과 end_datetime이 우선순위 (더 정확한 시간 지정)
            if start_datetime:
                try:
                    filter_start = datetime.strptime(start_datetime, '%Y-%m-%d %H:%M:%S')
                except ValueError:
                    try:
                        filter_start = datetime.strptime(start_datetime, '%Y-%m-%d %H:%M')
                    except ValueError:
                        try:
                            filter_start = datetime.strptime(start_datetime, '%Y-%m-%d')
                        except ValueError:
                            print(f"시작 시간 파싱 오류: {start_datetime}")
                            filter_start = None
            
            if end_datetime:
                try:
                    filter_end = datetime.strptime(end_datetime, '%Y-%m-%d %H:%M:%S')
                except ValueError:
                    try:
                        filter_end = datetime.strptime(end_datetime, '%Y-%m-%d %H:%M')
                    except ValueError:
                        try:
                            filter_end = datetime.strptime(end_datetime, '%Y-%m-%d')
                            # 날짜만 지정된 경우 해당 날짜의 마지막 시간으로 설정
                            filter_end = filter_end.replace(hour=23, minute=59, second=59)
                        except ValueError:
                            print(f"종료 시간 파싱 오류: {end_datetime}")
                            filter_end = None
            
            # start_date와 end_date는 하위 호환성을 위해 유지
            if not filter_start and start_date:
                filter_start = datetime.strptime(start_date, '%Y-%m-%d')
            if not filter_end and end_date:
                filter_end = datetime.strptime(end_date, '%Y-%m-%d') + timedelta(days=1)  # 다음날 00:00까지 포함
            
            print(f"필터 시작: {filter_start}")
            print(f"필터 종료: {filter_end}")
            
            date_count = 0
            message_count = 0
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                # 메시지 라인 확인 (2025년으로 시작하고 쉼표가 있는 라인)
                if line.startswith('2025년') and ',' in line and ' : ' in line:
                    try:
                        # "2025년 6월 24일 오전 9:22, 0098 : 메시지내용" 형식 파싱
                        parts = line.split(', ', 1)
                        if len(parts) == 2:
                            timestamp_str = parts[0]
                            message_part = parts[1]
                            
                            # "0098 : 메시지내용" 파싱
                            if ' : ' in message_part:
                                sender_content = message_part.split(' : ', 1)
                                if len(sender_content) == 2:
                                    sender = sender_content[0]
                                    content = sender_content[1]
                                    
                                    # 타임스탬프 파싱
                                    try:
                                        ts = timestamp_str.replace('오전', 'AM').replace('오후', 'PM')
                                        timestamp = datetime.strptime(ts, '%Y년 %m월 %d일 %p %I:%M')
                                    except Exception as e:
                                        print(f"타임스탬프 파싱 오류: {e}")
                                        continue
                                    
                                    # 날짜/시간 범위 필터링
                                    if filter_start and timestamp < filter_start:
                                        continue
                                    if filter_end and timestamp > filter_end:
                                        continue
                                    
                                    # 메시지 정보 저장
                                    message_info = {
                                        "timestamp": timestamp,
                                        "sender": sender.strip(),
                                        "content": content.strip(),
                                        "sentiment": self._analyze_sentiment(content),
                                        "topic": self._classify_topic(content)
                                    }
                                    
                                    messages.append(message_info)
                                    message_count += 1
                                    
                                    if message_count % 100 == 0:
                                        print(f"메시지 발견: {sender} -> {content[:30]}...")
                                    
                    except Exception as e:
                        print(f"메시지 파싱 오류: {line}, {e}")
                        continue
            
            print(f"발견된 메시지: {message_count}개")
            print(f"필터링 후 메시지: {len(messages)}개")
            
            return messages
            
        except Exception as e:
            print(f"파일 읽기 오류: {e}")
            return []
    
    def _analyze_sentiment(self, content: str) -> str:
        """감정 분석"""
        content_lower = content.lower()
        
        positive_count = sum(1 for keyword in self.sentiment_keywords["positive"] if keyword in content_lower)
        negative_count = sum(1 for keyword in self.sentiment_keywords["negative"] if keyword in content_lower)
        
        if positive_count > negative_count:
            return "positive"
        elif negative_count > positive_count:
            return "negative"
        else:
            return "neutral"
    
    def _classify_topic(self, content: str) -> str:
        """주제 분류"""
        content_lower = content.lower()
        
        for topic, keywords in self.topic_keywords.items():
            if any(keyword in content_lower for keyword in keywords):
                return topic
        
        return "일반_소통"
    
    def group_messages_by_topic(self, messages: List[Dict[str, Any]]) -> List[ConversationTopic]:
        """메시지를 주제별로 그룹화"""
        topic_groups = defaultdict(list)
        
        for message in messages:
            topic = message["topic"]
            topic_groups[topic].append(message)
        
        topics = []
        for topic_name, topic_messages in topic_groups.items():
            if len(topic_messages) < 2:  # 2개 미만 메시지는 제외
                continue
            
            # 참여자 목록
            participants = list(set(msg["sender"] for msg in topic_messages))
            
            # 감정 분석
            sentiments = [msg["sentiment"] for msg in topic_messages]
            sentiment_counter = Counter(sentiments)
            overall_sentiment = sentiment_counter.most_common(1)[0][0]
            
            # 핵심 포인트 추출
            key_points = self._extract_key_points(topic_messages)
            
            # 요약 생성
            summary = self._generate_topic_summary(topic_name, topic_messages, key_points)
            
            # 시간 범위
            timestamps = [msg["timestamp"] for msg in topic_messages]
            start_time = min(timestamps)
            end_time = max(timestamps)
            
            topic = ConversationTopic(
                topic_id=str(uuid.uuid4()),
                title=self._get_topic_title(topic_name),
                messages=topic_messages,
                participants=participants,
                sentiment=overall_sentiment,
                key_points=key_points,
                summary=summary,
                start_time=start_time,
                end_time=end_time
            )
            
            topics.append(topic)
        
        return topics
    
    def _extract_key_points(self, messages: List[Dict[str, Any]]) -> List[str]:
        """핵심 포인트 추출"""
        key_points = []
        
        # 긴 메시지나 중요한 내용이 포함된 메시지 찾기
        important_messages = []
        for msg in messages:
            content = msg["content"]
            if len(content) > 50 or any(keyword in content.lower() for keyword in ["중요", "핵심", "문제", "해결", "제안", "평가"]):
                important_messages.append(msg)
        
        # 각 중요 메시지에서 핵심 내용 추출
        for msg in important_messages[:5]:  # 최대 5개
            content = msg["content"]
            sender = msg["sender"]
            
            # 핵심 문장 추출 (긴 메시지의 경우)
            if len(content) > 100:
                sentences = content.split('.')
                key_sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
                if key_sentences:
                    key_points.append(f"{sender}: {key_sentences[0]}")
            else:
                key_points.append(f"{sender}: {content}")
        
        return key_points[:5]  # 최대 5개
    
    def _generate_topic_summary(self, topic_name: str, messages: List[Dict[str, Any]], key_points: List[str]) -> str:
        """주제별 요약 생성"""
        if topic_name == "시공사_평가":
            return "시공사 선택 기준과 평가 방식에 대한 토론이 활발히 진행됨. 공사비뿐만 아니라 고급화 설계와 품질을 중시하는 목소리가 강조됨."
        elif topic_name == "홍보_마케팅":
            return "홍보 활동과 마케팅 방식에 대한 평가가 이루어짐. 일부 조합원들이 홍보 태도나 방식에 대해 부정적인 반응을 보임."
        elif topic_name == "공사비_분담금":
            return "공사비와 분담금에 대한 현실적인 논의가 진행됨. 비용 절감보다는 품질과 가치를 중시하는 관점이 우세함."
        elif topic_name == "평면_커뮤니티":
            return "평면 설계와 커뮤니티 시설에 대한 평가와 비교가 이루어짐. 실제 거주 경험과 자산 가치에 영향을 주는 요소들에 대한 논의가 활발함."
        else:
            return f"{topic_name} 주제에 대한 다양한 의견과 토론이 진행됨."
    
    def _get_topic_title(self, topic_name: str) -> str:
        """주제 제목 생성"""
        title_map = {
            "시공사_평가": "시공사 평가 방식 및 기준에 대한 토론",
            "홍보_마케팅": "홍보방식에 대한 감정적 반응과 평가",
            "공사비_분담금": "공사비·분담금 현실 인식 확대",
            "평면_커뮤니티": "평면·커뮤니티 등 비정량적 요소의 비교 필요성",
            "일반_소통": "일반적인 소통과 의견 교환"
        }
        return title_map.get(topic_name, topic_name)
    
    def generate_conversation_summary(self, file_path: str, start_date: str = None, end_date: str = None,
                                   start_datetime: str = None, end_datetime: str = None) -> ConversationSummary:
        """대화 요약 생성"""
        # 메시지 파싱 (새로운 datetime 파라미터 지원)
        messages = self.parse_kakao_messages(file_path, start_date, end_date, 
                                           start_datetime, end_datetime)
        
        if not messages:
            raise ValueError("해당 기간에 메시지가 없습니다.")
        
        # 주제별 그룹화
        topics = self.group_messages_by_topic(messages)
        
        # 전체 감정 분석
        sentiments = [msg["sentiment"] for msg in messages]
        overall_sentiment = Counter(sentiments).most_common(1)[0][0]
        
        # 핵심 인사이트 추출
        key_insights = self._extract_key_insights(messages, topics)
        
        # 시간 범위
        timestamps = [msg["timestamp"] for msg in messages]
        period_start = min(timestamps)
        period_end = max(timestamps)
        
        summary = ConversationSummary(
            summary_id=str(uuid.uuid4()),
            period_start=period_start,
            period_end=period_end,
            total_messages=len(messages),
            total_participants=len(set(msg["sender"] for msg in messages)),
            topics=topics,
            overall_sentiment=overall_sentiment,
            key_insights=key_insights,
            created_at=datetime.now()
        )
        
        return summary
    
    def _extract_key_insights(self, messages: List[Dict[str, Any]], topics: List[ConversationTopic]) -> List[str]:
        """핵심 인사이트 추출"""
        insights = []
        
        # 참여도 분석
        participant_counts = Counter(msg["sender"] for msg in messages)
        most_active = participant_counts.most_common(1)[0][0]
        insights.append(f"가장 활발한 참여자: {most_active}")
        
        # 주제별 관심도
        topic_counts = Counter(msg["topic"] for msg in messages)
        most_discussed = topic_counts.most_common(1)[0][0]
        insights.append(f"가장 많이 논의된 주제: {self._get_topic_title(most_discussed)}")
        
        # 감정 트렌드
        sentiment_counts = Counter(msg["sentiment"] for msg in messages)
        dominant_sentiment = sentiment_counts.most_common(1)[0][0]
        insights.append(f"전체적인 감정 분위기: {dominant_sentiment}")
        
        # 주요 이슈
        if topics:
            key_topics = [topic.title for topic in topics[:3]]
            insights.append(f"주요 논의 주제: {', '.join(key_topics)}")
        
        return insights
    
    def format_summary_for_display(self, summary: ConversationSummary) -> str:
        """요약을 표시용으로 포맷팅"""
        output = []
        
        # 헤더
        period_str = f"{summary.period_start.strftime('%Y년 %m월 %d일')} ~ {summary.period_end.strftime('%Y년 %m월 %d일')}"
        output.append(f"대화요약 - {period_str}")
        output.append("=" * 60)
        output.append(f"총 메시지: {summary.total_messages}개")
        output.append(f"참여자: {summary.total_participants}명")
        output.append(f"주요 주제: {len(summary.topics)}개")
        output.append("")
        
        # 주제별 요약
        for i, topic in enumerate(summary.topics, 1):
            output.append(f"{i}. {topic.title}")
            
            # 주요 발언자들
            key_speakers = []
            for msg in topic.messages[:3]:  # 최대 3개
                speaker = msg["sender"]
                content = msg["content"][:50] + "..." if len(msg["content"]) > 50 else msg["content"]
                key_speakers.append(f"{speaker}: {content}")
            
            for speaker in key_speakers:
                output.append(f"   {speaker}")
            
            output.append("")
            output.append(f"➡ 요약:")
            output.append(f"{topic.summary}")
            output.append("")
        
        # 핵심 인사이트
        if summary.key_insights:
            output.append("📊 핵심 인사이트:")
            for insight in summary.key_insights:
                output.append(f"   • {insight}")
            output.append("")
        
        return "\n".join(output)

# 사용 예시
if __name__ == "__main__":
    summarizer = KakaoConversationSummarizer()
    
    # 실제 카카오톡 대화 파일 경로
    chat_file = "../chat_rooms/sample_chat_room/sample_chat_room.txt"
    
    print("카카오톡 대화 요약 생성 중...")
    
    try:
        # 전체 기간 요약
        summary = summarizer.generate_conversation_summary(chat_file)
        
        # 표시용 포맷팅
        formatted_summary = summarizer.format_summary_for_display(summary)
        
        print(formatted_summary)
        
        # JSON으로 저장
        with open("conversation_summary.json", "w", encoding="utf-8") as f:
            json.dump(asdict(summary), f, ensure_ascii=False, indent=2, default=str)
        
        print("\n요약이 'conversation_summary.json'에 저장되었습니다.")
        
    except Exception as e:
        print(f"요약 생성 오류: {str(e)}") 