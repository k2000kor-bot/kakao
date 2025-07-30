import re
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
import logging
from pathlib import Path
import sqlite3
from collections import defaultdict, Counter
import hashlib

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class ChatMessage:
    """채팅 메시지 데이터"""
    message_id: str
    chat_room: str
    sender: str
    content: str
    timestamp: datetime
    message_type: str  # text, image, file, system
    reply_to: Optional[str] = None
    mentions: List[str] = None
    hashtags: List[str] = None
    sentiment: Optional[str] = None
    topic_category: Optional[str] = None
    
    def __post_init__(self):
        if self.mentions is None:
            self.mentions = []
        if self.hashtags is None:
            self.hashtags = []


@dataclass
class ConversationTopic:
    """대화 주제"""
    topic_id: str
    topic_name: str
    category: str  # 재개발, 시공사, 분담금, 투표, 일정, 기타
    start_time: datetime
    end_time: datetime
    participants: List[str]
    message_count: int
    key_points: List[str]
    sentiment_distribution: Dict[str, int]


@dataclass
class PersonProfile:
    """개인별 프로필 분석"""
    person_name: str
    total_messages: int
    active_periods: List[Tuple[datetime, datetime]]
    main_topics: List[str]
    sentiment_tendency: str  # positive, negative, neutral
    influence_score: float  # 영향력 점수
    key_opinions: List[Dict[str, Any]]
    interaction_partners: List[str]


class ChatConversationAnalyzer:
    """채팅방 대화 분석 시스템"""
    
    def __init__(self, db_path: str = "chat_analysis.db"):
        self.db_path = db_path
        self.init_database()
        
        # 주제 분류 키워드
        self.topic_keywords = self._initialize_topic_keywords()
        
        # 감정 분석 키워드
        self.sentiment_keywords = self._initialize_sentiment_keywords()
        
        # 중요 키워드 (재개발 관련)
        self.important_keywords = self._initialize_important_keywords()
        
    def _initialize_topic_keywords(self) -> Dict[str, List[str]]:
        """주제 분류 키워드 초기화"""
        return {
            "재개발": [
                "재개발", "재건축", "정비사업", "조합", "조합장", "총회", "추진위", 
                "안전진단", "분담금", "사업성", "용적률", "준공", "이주"
            ],
            "시공사": [
                "시공사", "건설사", "대우", "현대", "삼성", "GS", "포스코", "롯데",
                "시공능력", "브랜드", "품질", "A/S", "준공사례", "선정", "계약"
            ],
            "분담금": [
                "분담금", "추가분담금", "정산", "조합비", "계약금", "중도금", "잔금",
                "자금조달", "대출", "금융", "분담금산정", "개산분담금"
            ],
            "투표": [
                "투표", "찬성", "반대", "기권", "총회", "의결", "가결", "부결",
                "정족수", "의사진행", "안건", "결의"
            ],
            "일정": [
                "일정", "스케줄", "진행", "공사", "착공", "준공", "입주", "이주",
                "단계", "절차", "기간", "연기", "지연"
            ],
            "법적사항": [
                "법", "규정", "조례", "인허가", "승인", "신고", "허가", "법령",
                "소송", "재판", "변호사", "법무법인"
            ],
            "민원": [
                "민원", "항의", "불만", "문제", "해결", "개선", "요구", "건의",
                "신고", "고발", "진정"
            ]
        }
        
    def _initialize_sentiment_keywords(self) -> Dict[str, List[str]]:
        """감정 분석 키워드 초기화"""
        return {
            "positive": [
                "좋다", "찬성", "동의", "옳다", "맞다", "최고", "훌륭", "완벽",
                "성공", "만족", "기대", "희망", "응원", "지지", "추천"
            ],
            "negative": [
                "싫다", "반대", "틀렸다", "나쁘다", "문제", "실패", "불만", "화나",
                "걱정", "우려", "위험", "손해", "피해", "반발", "거부"
            ],
            "neutral": [
                "그냥", "보통", "그럭저럭", "모르겠다", "애매", "확실하지", "글쎄",
                "일단", "나중에", "생각해보자"
            ]
        }
        
    def _initialize_important_keywords(self) -> List[str]:
        """중요 키워드 초기화"""
        return [
            "분담금", "시공사", "재개발", "조합장", "총회", "투표", "찬성", "반대",
            "안전진단", "사업성", "용적률", "이주", "준공", "입주", "정산",
            "현대건설", "대우건설", "삼성물산", "GS건설", "포스코건설"
        ]
        
    def init_database(self):
        """데이터베이스 초기화"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 채팅 메시지 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS chat_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                message_id TEXT UNIQUE,
                chat_room TEXT,
                sender TEXT,
                content TEXT,
                timestamp TEXT,
                message_type TEXT,
                reply_to TEXT,
                mentions TEXT,
                hashtags TEXT,
                sentiment TEXT,
                topic_category TEXT,
                created_at TEXT
            )
        ''')
        
        # 대화 주제 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS conversation_topics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                topic_id TEXT UNIQUE,
                topic_name TEXT,
                category TEXT,
                start_time TEXT,
                end_time TEXT,
                participants TEXT,
                message_count INTEGER,
                key_points TEXT,
                sentiment_distribution TEXT
            )
        ''')
        
        # 개인 프로필 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS person_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                person_name TEXT UNIQUE,
                total_messages INTEGER,
                active_periods TEXT,
                main_topics TEXT,
                sentiment_tendency TEXT,
                influence_score REAL,
                key_opinions TEXT,
                interaction_partners TEXT,
                last_updated TEXT
            )
        ''')
        
        # 대화 요약 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS conversation_summaries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                summary_id TEXT UNIQUE,
                chat_room TEXT,
                start_time TEXT,
                end_time TEXT,
                participants TEXT,
                main_topics TEXT,
                key_discussions TEXT,
                decisions TEXT,
                action_items TEXT,
                created_at TEXT
            )
        ''')
        
        conn.commit()
        conn.close()
        
    def parse_chat_file(self, chat_file_path: str) -> List[ChatMessage]:
        """채팅 파일 파싱"""
        chat_file = Path(chat_file_path)
        
        if not chat_file.exists():
            raise FileNotFoundError(f"채팅 파일을 찾을 수 없습니다: {chat_file_path}")
            
        messages = []
        
        with open(chat_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # 파일 형식에 따라 다른 파싱 로직
        if chat_file.suffix == '.txt':
            messages = self._parse_txt_format(content, chat_file.stem)
        elif chat_file.suffix == '.json':
            messages = self._parse_json_format(content, chat_file.stem)
        else:
            logger.warning(f"지원하지 않는 파일 형식: {chat_file.suffix}")
            
        return messages
        
    def _parse_txt_format(self, content: str, chat_room: str) -> List[ChatMessage]:
        """텍스트 형식 채팅 파싱"""
        messages = []
        lines = content.strip().split('\n')
        
        # 카카오톡 형식 파싱 패턴
        kakao_pattern = r'(\d{4}\.\s*\d{1,2}\.\s*\d{1,2}\.\s*\S+\s+\d{1,2}:\d{2}),\s*(.+?)\s*:\s*(.*)'
        
        for line_num, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue
                
            match = re.match(kakao_pattern, line)
            if match:
                timestamp_str, sender, content = match.groups()
                
                # 타임스탬프 파싱
                try:
                    # "2024. 7. 18. 목요일 오후 2:30" 형식 처리
                    timestamp_clean = re.sub(r'\s+', ' ', timestamp_str)
                    timestamp_clean = re.sub(r'[월화수목금토일]요일', '', timestamp_clean)
                    timestamp_clean = re.sub(r'오전|오후', '', timestamp_clean).strip()
                    
                    # 간단한 파싱 (실제로는 더 정교한 파싱 필요)
                    timestamp = datetime.now()  # 임시로 현재 시간 사용
                except:
                    timestamp = datetime.now()
                    
                # 메시지 ID 생성
                message_id = hashlib.md5(
                    f"{chat_room}_{sender}_{timestamp.isoformat()}_{line_num}".encode()
                ).hexdigest()[:16]
                
                # 멘션 추출
                mentions = self._extract_mentions(content)
                
                # 해시태그 추출
                hashtags = self._extract_hashtags(content)
                
                # 감정 분석
                sentiment = self._analyze_sentiment(content)
                
                # 주제 분류
                topic_category = self._classify_topic(content)
                
                message = ChatMessage(
                    message_id=message_id,
                    chat_room=chat_room,
                    sender=sender.strip(),
                    content=content.strip(),
                    timestamp=timestamp,
                    message_type="text",
                    mentions=mentions,
                    hashtags=hashtags,
                    sentiment=sentiment,
                    topic_category=topic_category
                )
                
                messages.append(message)
                
        return messages
        
    def _parse_json_format(self, content: str, chat_room: str) -> List[ChatMessage]:
        """JSON 형식 채팅 파싱"""
        try:
            data = json.loads(content)
            messages = []
            
            for item in data.get('messages', []):
                message = ChatMessage(
                    message_id=item.get('id', ''),
                    chat_room=chat_room,
                    sender=item.get('sender', ''),
                    content=item.get('content', ''),
                    timestamp=datetime.fromisoformat(item.get('timestamp', datetime.now().isoformat())),
                    message_type=item.get('type', 'text'),
                    mentions=item.get('mentions', []),
                    hashtags=item.get('hashtags', []),
                    sentiment=self._analyze_sentiment(item.get('content', '')),
                    topic_category=self._classify_topic(item.get('content', ''))
                )
                messages.append(message)
                
            return messages
            
        except json.JSONDecodeError:
            logger.error("JSON 파싱 오류")
            return []
            
    def _extract_mentions(self, content: str) -> List[str]:
        """멘션 추출"""
        # @사용자명 패턴
        mentions = re.findall(r'@([가-힣a-zA-Z0-9_]+)', content)
        return list(set(mentions))
        
    def _extract_hashtags(self, content: str) -> List[str]:
        """해시태그 추출"""
        # #태그 패턴
        hashtags = re.findall(r'#([가-힣a-zA-Z0-9_]+)', content)
        return list(set(hashtags))
        
    def _analyze_sentiment(self, content: str) -> str:
        """감정 분석"""
        positive_count = sum(1 for keyword in self.sentiment_keywords["positive"] if keyword in content)
        negative_count = sum(1 for keyword in self.sentiment_keywords["negative"] if keyword in content)
        neutral_count = sum(1 for keyword in self.sentiment_keywords["neutral"] if keyword in content)
        
        if positive_count > negative_count and positive_count > neutral_count:
            return "positive"
        elif negative_count > positive_count and negative_count > neutral_count:
            return "negative"
        else:
            return "neutral"
            
    def _classify_topic(self, content: str) -> str:
        """주제 분류"""
        topic_scores = {}
        
        for topic, keywords in self.topic_keywords.items():
            score = sum(1 for keyword in keywords if keyword in content)
            if score > 0:
                topic_scores[topic] = score
                
        if topic_scores:
            return max(topic_scores, key=topic_scores.get)
        else:
            return "기타"
            
    def save_messages(self, messages: List[ChatMessage]):
        """메시지 데이터베이스 저장"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        for message in messages:
            try:
                cursor.execute('''
                    INSERT OR REPLACE INTO chat_messages 
                    (message_id, chat_room, sender, content, timestamp, message_type,
                     reply_to, mentions, hashtags, sentiment, topic_category, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    message.message_id, message.chat_room, message.sender, message.content,
                    message.timestamp.isoformat(), message.message_type, message.reply_to,
                    json.dumps(message.mentions), json.dumps(message.hashtags),
                    message.sentiment, message.topic_category, datetime.now().isoformat()
                ))
            except Exception as e:
                logger.error(f"메시지 저장 실패 {message.message_id}: {e}")
                continue
                
        conn.commit()
        conn.close()
        logger.info(f"{len(messages)}개 메시지 저장 완료")
        
    def get_messages_by_person(self, person_name: str, 
                              start_date: Optional[datetime] = None,
                              end_date: Optional[datetime] = None) -> List[ChatMessage]:
        """특정인의 메시지 조회"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        query = "SELECT * FROM chat_messages WHERE sender = ?"
        params = [person_name]
        
        if start_date:
            query += " AND timestamp >= ?"
            params.append(start_date.isoformat())
            
        if end_date:
            query += " AND timestamp <= ?"
            params.append(end_date.isoformat())
            
        query += " ORDER BY timestamp ASC"
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        messages = []
        for row in rows:
            message = ChatMessage(
                message_id=row[1],
                chat_room=row[2],
                sender=row[3],
                content=row[4],
                timestamp=datetime.fromisoformat(row[5]),
                message_type=row[6],
                reply_to=row[7],
                mentions=json.loads(row[8]) if row[8] else [],
                hashtags=json.loads(row[9]) if row[9] else [],
                sentiment=row[10],
                topic_category=row[11]
            )
            messages.append(message)
            
        conn.close()
        return messages
        
    def get_messages_by_timerange(self, start_time: datetime, end_time: datetime,
                                 chat_room: Optional[str] = None) -> List[ChatMessage]:
        """특정 시간대의 메시지 조회"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        query = "SELECT * FROM chat_messages WHERE timestamp >= ? AND timestamp <= ?"
        params = [start_time.isoformat(), end_time.isoformat()]
        
        if chat_room:
            query += " AND chat_room = ?"
            params.append(chat_room)
            
        query += " ORDER BY timestamp ASC"
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        messages = []
        for row in rows:
            message = ChatMessage(
                message_id=row[1],
                chat_room=row[2],
                sender=row[3],
                content=row[4],
                timestamp=datetime.fromisoformat(row[5]),
                message_type=row[6],
                reply_to=row[7],
                mentions=json.loads(row[8]) if row[8] else [],
                hashtags=json.loads(row[9]) if row[9] else [],
                sentiment=row[10],
                topic_category=row[11]
            )
            messages.append(message)
            
        conn.close()
        return messages
        
    def analyze_person_profile(self, person_name: str) -> PersonProfile:
        """개인별 프로필 분석"""
        messages = self.get_messages_by_person(person_name)
        
        if not messages:
            return PersonProfile(
                person_name=person_name,
                total_messages=0,
                active_periods=[],
                main_topics=[],
                sentiment_tendency="neutral",
                influence_score=0.0,
                key_opinions=[],
                interaction_partners=[]
            )
            
        # 활동 기간 분석
        active_periods = self._analyze_active_periods(messages)
        
        # 주요 주제 분석
        topic_counter = Counter(msg.topic_category for msg in messages if msg.topic_category)
        main_topics = [topic for topic, count in topic_counter.most_common(5)]
        
        # 감정 성향 분석
        sentiment_counter = Counter(msg.sentiment for msg in messages if msg.sentiment)
        sentiment_tendency = sentiment_counter.most_common(1)[0][0] if sentiment_counter else "neutral"
        
        # 영향력 점수 계산
        influence_score = self._calculate_influence_score(person_name, messages)
        
        # 주요 의견 추출
        key_opinions = self._extract_key_opinions(messages)
        
        # 상호작용 파트너 분석
        interaction_partners = self._analyze_interactions(person_name)
        
        profile = PersonProfile(
            person_name=person_name,
            total_messages=len(messages),
            active_periods=active_periods,
            main_topics=main_topics,
            sentiment_tendency=sentiment_tendency,
            influence_score=influence_score,
            key_opinions=key_opinions,
            interaction_partners=interaction_partners
        )
        
        # 프로필 저장
        self._save_person_profile(profile)
        
        return profile
        
    def _analyze_active_periods(self, messages: List[ChatMessage]) -> List[Tuple[datetime, datetime]]:
        """활동 기간 분석"""
        if not messages:
            return []
            
        # 메시지를 시간순 정렬
        sorted_messages = sorted(messages, key=lambda x: x.timestamp)
        
        periods = []
        current_start = sorted_messages[0].timestamp
        last_time = current_start
        
        # 1시간 이상 간격이 있으면 새로운 활동 기간으로 간주
        for message in sorted_messages[1:]:
            if (message.timestamp - last_time).total_seconds() > 3600:  # 1시간
                periods.append((current_start, last_time))
                current_start = message.timestamp
            last_time = message.timestamp
            
        # 마지막 기간 추가
        periods.append((current_start, last_time))
        
        return periods
        
    def _calculate_influence_score(self, person_name: str, messages: List[ChatMessage]) -> float:
        """영향력 점수 계산"""
        base_score = len(messages) * 0.1  # 메시지 수
        
        # 중요 키워드 사용 빈도
        important_keyword_count = 0
        for message in messages:
            for keyword in self.important_keywords:
                if keyword in message.content:
                    important_keyword_count += 1
                    
        keyword_score = important_keyword_count * 0.5
        
        # 멘션 받은 횟수 (다른 사람들이 이 사람을 언급한 횟수)
        mention_score = self._count_mentions_received(person_name) * 2.0
        
        # 긴 메시지 작성 (상세한 설명, 의견 제시)
        long_message_score = len([msg for msg in messages if len(msg.content) > 100]) * 0.3
        
        total_score = base_score + keyword_score + mention_score + long_message_score
        
        # 0-100 스케일로 정규화
        return min(total_score, 100.0)
        
    def _count_mentions_received(self, person_name: str) -> int:
        """다른 사람들이 이 사람을 언급한 횟수"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT mentions FROM chat_messages 
            WHERE sender != ? AND mentions IS NOT NULL AND mentions != '[]'
        ''', (person_name,))
        
        count = 0
        for row in cursor.fetchall():
            mentions = json.loads(row[0])
            if person_name in mentions:
                count += 1
                
        conn.close()
        return count
        
    def _extract_key_opinions(self, messages: List[ChatMessage]) -> List[Dict[str, Any]]:
        """주요 의견 추출"""
        key_opinions = []
        
        # 긴 메시지나 중요 키워드가 포함된 메시지를 주요 의견으로 간주
        for message in messages:
            is_key_opinion = False
            
            # 긴 메시지 (100자 이상)
            if len(message.content) > 100:
                is_key_opinion = True
                
            # 중요 키워드 포함
            if any(keyword in message.content for keyword in self.important_keywords):
                is_key_opinion = True
                
            # 강한 감정 표현
            if message.sentiment in ["positive", "negative"]:
                is_key_opinion = True
                
            if is_key_opinion:
                key_opinions.append({
                    "timestamp": message.timestamp.isoformat(),
                    "content": message.content,
                    "topic": message.topic_category,
                    "sentiment": message.sentiment
                })
                
        # 최대 10개까지만 반환
        return sorted(key_opinions, key=lambda x: x["timestamp"])[-10:]
        
    def _analyze_interactions(self, person_name: str) -> List[str]:
        """상호작용 파트너 분석"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 이 사람이 멘션한 사람들
        cursor.execute('''
            SELECT mentions FROM chat_messages 
            WHERE sender = ? AND mentions IS NOT NULL AND mentions != '[]'
        ''', (person_name,))
        
        mentioned_people = set()
        for row in cursor.fetchall():
            mentions = json.loads(row[0])
            mentioned_people.update(mentions)
            
        # 이 사람을 멘션한 사람들
        cursor.execute('''
            SELECT sender, mentions FROM chat_messages 
            WHERE sender != ? AND mentions IS NOT NULL AND mentions != '[]'
        ''', (person_name,))
        
        mentioning_people = set()
        for row in cursor.fetchall():
            sender, mentions = row
            if person_name in json.loads(mentions):
                mentioning_people.add(sender)
                
        # 같은 시간대에 활발히 대화한 사람들 (시간 기반 상호작용)
        cursor.execute('''
            SELECT DISTINCT sender FROM chat_messages 
            WHERE sender != ? 
            AND timestamp IN (
                SELECT timestamp FROM chat_messages 
                WHERE sender = ?
            )
        ''', (person_name, person_name))
        
        concurrent_people = {row[0] for row in cursor.fetchall()}
        
        conn.close()
        
        # 모든 상호작용 파트너 통합
        all_partners = mentioned_people | mentioning_people | concurrent_people
        
        return list(all_partners)[:10]  # 상위 10명만 반환
        
    def _save_person_profile(self, profile: PersonProfile):
        """개인 프로필 저장"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO person_profiles 
            (person_name, total_messages, active_periods, main_topics, 
             sentiment_tendency, influence_score, key_opinions, interaction_partners, last_updated)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            profile.person_name, profile.total_messages,
            json.dumps([(start.isoformat(), end.isoformat()) for start, end in profile.active_periods]),
            json.dumps(profile.main_topics), profile.sentiment_tendency, profile.influence_score,
            json.dumps(profile.key_opinions), json.dumps(profile.interaction_partners),
            datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()
        
    def get_conversation_participants(self, chat_room: str) -> List[Dict[str, Any]]:
        """채팅방 참여자 목록 및 통계"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT sender, COUNT(*) as message_count,
                   MIN(timestamp) as first_message,
                   MAX(timestamp) as last_message
            FROM chat_messages 
            WHERE chat_room = ?
            GROUP BY sender
            ORDER BY message_count DESC
        ''', (chat_room,))
        
        participants = []
        for row in cursor.fetchall():
            participants.append({
                "name": row[0],
                "message_count": row[1],
                "first_message": row[2],
                "last_message": row[3]
            })
            
        conn.close()
        return participants


# 사용 예시
if __name__ == "__main__":
    # 분석기 초기화
    analyzer = ChatConversationAnalyzer()
    
    # 샘플 채팅 파일 분석
    try:
        # 실제 채팅 파일 경로
        chat_file_path = "../chat_rooms/[인증]행복한소유☆개포우성7차/[인증]행복한소유☆개포우성7차.txt"
        
        print("📱 채팅방 대화 분석 시작...")
        
        # 채팅 파일 파싱
        messages = analyzer.parse_chat_file(chat_file_path)
        print(f"✅ {len(messages)}개 메시지 파싱 완료")
        
        # 메시지 저장
        analyzer.save_messages(messages)
        print("✅ 메시지 데이터베이스 저장 완료")
        
        # 참여자 분석
        participants = analyzer.get_conversation_participants("개포우성7차")
        print(f"✅ 채팅방 참여자: {len(participants)}명")
        
        for participant in participants[:5]:
            print(f"   - {participant['name']}: {participant['message_count']}건")
        
        # 개인별 프로필 분석 (상위 3명)
        for participant in participants[:3]:
            profile = analyzer.analyze_person_profile(participant["name"])
            print(f"\n👤 {profile.person_name} 프로필:")
            print(f"   - 총 메시지: {profile.total_messages}건")
            print(f"   - 주요 주제: {profile.main_topics[:3]}")
            print(f"   - 감정 성향: {profile.sentiment_tendency}")
            print(f"   - 영향력 점수: {profile.influence_score:.1f}")
            print(f"   - 상호작용: {len(profile.interaction_partners)}명")
            
    except FileNotFoundError:
        print("❌ 채팅 파일을 찾을 수 없습니다. 샘플 데이터로 테스트합니다.")
        
        # 샘플 메시지 생성
        sample_messages = [
            ChatMessage(
                message_id="msg_001",
                chat_room="테스트방",
                sender="김조합장",
                content="재개발 사업 진행 관련해서 시공사 선정 회의를 진행하겠습니다. 대우건설과 현대건설 두 곳을 검토중입니다.",
                timestamp=datetime.now(),
                message_type="text",
                sentiment="neutral",
                topic_category="시공사"
            ),
            ChatMessage(
                message_id="msg_002",
                chat_room="테스트방",
                sender="이주민",
                content="현대건설이 품질면에서 더 좋다고 생각합니다. 과거 시공사례도 우수하고요.",
                timestamp=datetime.now(),
                message_type="text",
                sentiment="positive",
                topic_category="시공사"
            )
        ]
        
        analyzer.save_messages(sample_messages)
        print("✅ 샘플 데이터 저장 완료")
        
        # 프로필 분석
        profile = analyzer.analyze_person_profile("김조합장")
        print(f"\n👤 {profile.person_name} 프로필 분석 완료")
        print(f"   - 영향력 점수: {profile.influence_score:.1f}")
        print(f"   - 주요 주제: {profile.main_topics}")
        print(f"   - 감정 성향: {profile.sentiment_tendency}") 