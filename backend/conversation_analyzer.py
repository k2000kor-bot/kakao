import os
import re
import json
import sqlite3
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from pathlib import Path
import logging
from collections import defaultdict, Counter
import pandas as pd

logger = logging.getLogger(__name__)

@dataclass
class ChatMessage:
    """채팅 메시지 데이터 클래스"""
    id: str
    sender: str
    content: str
    timestamp: datetime
    message_type: str = "text"
    media_files: List[str] = None
    links: List[str] = None
    sentiment: str = "neutral"
    topics: List[str] = None

@dataclass
class ConversationSummary:
    """대화 요약 데이터 클래스"""
    period_start: datetime
    period_end: datetime
    total_messages: int
    unique_speakers: int
    main_topics: List[str]
    key_issues: List[Dict[str, Any]]
    speaker_summaries: List[Dict[str, Any]]
    sentiment_analysis: Dict[str, Any]

class KakaoTalkAnalyzer:
    """카카오톡 대화 분석기"""
    
    def __init__(self, db_path: str = "conversations.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """데이터베이스 초기화"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 채팅방 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS chat_rooms (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # 메시지 테이블 (기존 테이블 확장)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS messages (
                id TEXT PRIMARY KEY,
                chat_room_id TEXT,
                sender TEXT NOT NULL,
                content TEXT NOT NULL,
                message_type TEXT DEFAULT 'text',
                timestamp TIMESTAMP,
                sentiment TEXT DEFAULT 'neutral',
                topics TEXT,
                media_files TEXT,
                links TEXT,
                FOREIGN KEY (chat_room_id) REFERENCES chat_rooms (id)
            )
        ''')
        
        # 대화 요약 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS conversation_summaries (
                id TEXT PRIMARY KEY,
                chat_room_id TEXT,
                period_start TIMESTAMP,
                period_end TIMESTAMP,
                summary_data TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (chat_room_id) REFERENCES chat_rooms (id)
            )
        ''')
        
        # 발언자 요약 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS speaker_summaries (
                id TEXT PRIMARY KEY,
                chat_room_id TEXT,
                speaker_name TEXT,
                period_start TIMESTAMP,
                period_end TIMESTAMP,
                message_count INTEGER,
                main_topics TEXT,
                sentiment_analysis TEXT,
                key_statements TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (chat_room_id) REFERENCES chat_rooms (id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def parse_kakao_chat_file(self, file_path: str, chat_room_id: str) -> List[ChatMessage]:
        """카카오톡 대화 파일 파싱"""
        messages = []
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 카카오톡 대화 형식 파싱
        # 형식: [날짜] [시간] [이름] : [메시지]
        pattern = r'\[([^\]]+)\] \[([^\]]+)\] ([^:]+) : (.+)'
        
        for line in content.split('\n'):
            if not line.strip():
                continue
            
            match = re.match(pattern, line)
            if match:
                date_str, time_str, sender, content = match.groups()
                
                # 날짜와 시간 결합
                datetime_str = f"{date_str} {time_str}"
                try:
                    timestamp = datetime.strptime(datetime_str, "%Y년 %m월 %d일 %H:%M")
                except ValueError:
                    try:
                        timestamp = datetime.strptime(datetime_str, "%Y. %m. %d. %H:%M")
                    except ValueError:
                        timestamp = datetime.now()
                
                # 메시지 타입 및 미디어 파일 추출
                message_type, media_files, links = self.extract_message_components(content)
                
                # 메시지 ID 생성
                message_id = f"{chat_room_id}_{timestamp.strftime('%Y%m%d_%H%M%S')}_{len(messages)}"
                
                message = ChatMessage(
                    id=message_id,
                    sender=sender.strip(),
                    content=content.strip(),
                    timestamp=timestamp,
                    message_type=message_type,
                    media_files=media_files,
                    links=links
                )
                
                messages.append(message)
        
        return messages
    
    def extract_message_components(self, content: str) -> Tuple[str, List[str], List[str]]:
        """메시지에서 타입, 미디어 파일, 링크 추출"""
        message_type = "text"
        media_files = []
        links = []
        
        # 이미지 파일 패턴
        image_patterns = [
            r'이미지\.(jpg|jpeg|png|gif|bmp)',
            r'사진\.(jpg|jpeg|png|gif|bmp)',
            r'\[이미지\]',
            r'\[사진\]'
        ]
        
        # 미디어 파일 패턴
        media_patterns = [
            r'동영상\.(mp4|avi|mov|mkv)',
            r'음성\.(mp3|wav|m4a)',
            r'\[동영상\]',
            r'\[음성\]'
        ]
        
        # 링크 패턴
        link_patterns = [
            r'https?://[^\s]+',
            r'www\.[^\s]+',
            r'\[링크\]([^\]]+)',
            r'\[URL\]([^\]]+)'
        ]
        
        # 파일 패턴
        file_patterns = [
            r'파일\.(pdf|doc|docx|xls|xlsx|ppt|pptx)',
            r'\[파일\]([^\]]+)',
            r'첨부파일\.([^\s]+)'
        ]
        
        # 이미지 확인
        for pattern in image_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                message_type = "image"
                media_files.append(content)
                break
        
        # 미디어 확인
        for pattern in media_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                message_type = "media"
                media_files.append(content)
                break
        
        # 파일 확인
        for pattern in file_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                message_type = "file"
                media_files.append(content)
                break
        
        # 링크 확인
        for pattern in link_patterns:
            matches = re.findall(pattern, content)
            links.extend(matches)
        
        return message_type, media_files, links
    
    def save_messages_to_db(self, messages: List[ChatMessage], chat_room_id: str):
        """메시지를 데이터베이스에 저장"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 채팅방 정보 저장
        cursor.execute('''
            INSERT OR REPLACE INTO chat_rooms (id, name, updated_at)
            VALUES (?, ?, ?)
        ''', (chat_room_id, f"채팅방_{chat_room_id}", datetime.now()))
        
        # 메시지 저장
        for message in messages:
            cursor.execute('''
                INSERT OR REPLACE INTO messages 
                (id, chat_room_id, sender, content, message_type, timestamp, 
                 media_files, links)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                message.id,
                chat_room_id,
                message.sender,
                message.content,
                message.message_type,
                message.timestamp,
                json.dumps(message.media_files) if message.media_files else None,
                json.dumps(message.links) if message.links else None
            ))
        
        conn.commit()
        conn.close()
    
    def analyze_conversation_period(self, chat_room_id: str, start_date: datetime, 
                                  end_date: datetime) -> ConversationSummary:
        """특정 기간의 대화 분석"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 기간 내 메시지 조회
        cursor.execute('''
            SELECT sender, content, timestamp, message_type, media_files, links
            FROM messages 
            WHERE chat_room_id = ? AND timestamp BETWEEN ? AND ?
            ORDER BY timestamp
        ''', (chat_room_id, start_date, end_date))
        
        messages = []
        for row in cursor.fetchall():
            sender, content, timestamp, message_type, media_files, links = row
            messages.append({
                'sender': sender,
                'content': content,
                'timestamp': datetime.fromisoformat(timestamp),
                'message_type': message_type,
                'media_files': json.loads(media_files) if media_files else [],
                'links': json.loads(links) if links else []
            })
        
        conn.close()
        
        if not messages:
            return ConversationSummary(
                period_start=start_date,
                period_end=end_date,
                total_messages=0,
                unique_speakers=0,
                main_topics=[],
                key_issues=[],
                speaker_summaries=[],
                sentiment_analysis={}
            )
        
        # 주요 이슈 분석
        key_issues = self.analyze_key_issues(messages)
        
        # 발언자별 요약
        speaker_summaries = self.analyze_speakers(messages)
        
        # 감정 분석
        sentiment_analysis = self.analyze_sentiment(messages)
        
        # 주요 주제 추출
        main_topics = self.extract_main_topics(messages)
        
        return ConversationSummary(
            period_start=start_date,
            period_end=end_date,
            total_messages=len(messages),
            unique_speakers=len(set(msg['sender'] for msg in messages)),
            main_topics=main_topics,
            key_issues=key_issues,
            speaker_summaries=speaker_summaries,
            sentiment_analysis=sentiment_analysis
        )
    
    def analyze_key_issues(self, messages: List[Dict]) -> List[Dict[str, Any]]:
        """주요 이슈 분석"""
        issues = []
        
        # 주제별로 메시지 그룹화
        topic_groups = defaultdict(list)
        
        for msg in messages:
            if msg['message_type'] == 'text':
                # 간단한 키워드 기반 주제 분류
                content = msg['content'].lower()
                
                if any(word in content for word in ['공사비', '분담금', '비용', '가격']):
                    topic_groups['cost'].append(msg)
                elif any(word in content for word in ['설계', '평면', '고급화', '품질']):
                    topic_groups['design'].append(msg)
                elif any(word in content for word in ['홍보', '마케팅', '브랜드']):
                    topic_groups['marketing'].append(msg)
                elif any(word in content for word in ['평가', '비교', '선택']):
                    topic_groups['evaluation'].append(msg)
                else:
                    topic_groups['general'].append(msg)
        
        # 각 주제별로 이슈 분석
        for topic, topic_messages in topic_groups.items():
            if len(topic_messages) < 3:  # 최소 3개 메시지 이상
                continue
            
            # 주요 발언자들
            speakers = Counter(msg['sender'] for msg in topic_messages)
            main_speakers = [speaker for speaker, count in speakers.most_common(5)]
            
            # 핵심 발언들
            key_statements = []
            for msg in topic_messages:
                if msg['sender'] in main_speakers:
                    key_statements.append({
                        'speaker': msg['sender'],
                        'content': msg['content'],
                        'timestamp': msg['timestamp'].isoformat()
                    })
            
            # 요약 생성
            summary = self.generate_issue_summary(topic, topic_messages, key_statements)
            
            issues.append({
                'topic': topic,
                'message_count': len(topic_messages),
                'main_speakers': main_speakers,
                'key_statements': key_statements,
                'summary': summary
            })
        
        return issues
    
    def generate_issue_summary(self, topic: str, messages: List[Dict], 
                             key_statements: List[Dict]) -> str:
        """이슈 요약 생성"""
        topic_names = {
            'cost': '공사비·분담금 현실 인식',
            'design': '평면·커뮤니티 등 비정량적 요소의 비교 필요성',
            'marketing': '홍보방식에 대한 감정적 반응과 평가',
            'evaluation': '시공사 평가 방식 및 기준에 대한 토론',
            'general': '일반적인 대화'
        }
        
        topic_name = topic_names.get(topic, topic)
        
        # 핵심 발언들을 기반으로 요약 생성
        if key_statements:
            summary_parts = []
            for statement in key_statements[:3]:  # 상위 3개 발언만 사용
                speaker = statement['speaker']
                content = statement['content']
                summary_parts.append(f"{speaker}: {content}")
            
            summary = f"{topic_name}\n" + "\n".join(summary_parts)
            summary += f"\n\n➡ 요약:\n{topic_name}에 대한 다양한 의견이 제시되었으며, "
            summary += f"총 {len(messages)}개의 메시지가 교환되었습니다."
            
            return summary
        
        return f"{topic_name}: {len(messages)}개의 메시지가 교환되었습니다."
    
    def analyze_speakers(self, messages: List[Dict]) -> List[Dict[str, Any]]:
        """발언자별 분석"""
        speaker_data = defaultdict(lambda: {
            'message_count': 0,
            'messages': [],
            'topics': Counter(),
            'sentiment': Counter()
        })
        
        for msg in messages:
            speaker = msg['sender']
            speaker_data[speaker]['message_count'] += 1
            speaker_data[speaker]['messages'].append(msg)
            
            # 주제 분류
            content = msg['content'].lower()
            if any(word in content for word in ['공사비', '분담금']):
                speaker_data[speaker]['topics']['cost'] += 1
            elif any(word in content for word in ['설계', '평면']):
                speaker_data[speaker]['topics']['design'] += 1
            elif any(word in content for word in ['홍보', '마케팅']):
                speaker_data[speaker]['topics']['marketing'] += 1
        
        speaker_summaries = []
        for speaker, data in speaker_data.items():
            if data['message_count'] < 2:  # 최소 2개 메시지 이상
                continue
            
            main_topics = [topic for topic, count in data['topics'].most_common(3)]
            
            # 주요 발언들
            key_statements = []
            for msg in data['messages']:
                if len(msg['content']) > 20:  # 긴 메시지만 선택
                    key_statements.append({
                        'content': msg['content'],
                        'timestamp': msg['timestamp'].isoformat()
                    })
            
            speaker_summaries.append({
                'speaker': speaker,
                'message_count': data['message_count'],
                'main_topics': main_topics,
                'key_statements': key_statements[:5],  # 상위 5개만
                'participation_rate': round(data['message_count'] / len(messages) * 100, 1)
            })
        
        return speaker_summaries
    
    def analyze_sentiment(self, messages: List[Dict]) -> Dict[str, Any]:
        """감정 분석"""
        sentiment_keywords = {
            'positive': ['좋다', '훌륭하다', '만족', '긍정', '찬성', '지지'],
            'negative': ['나쁘다', '불만', '반대', '비판', '우려', '문제'],
            'neutral': ['생각', '고려', '검토', '분석', '제안']
        }
        
        sentiment_counts = Counter()
        
        for msg in messages:
            content = msg['content'].lower()
            
            for sentiment, keywords in sentiment_keywords.items():
                if any(keyword in content for keyword in keywords):
                    sentiment_counts[sentiment] += 1
                    break
            else:
                sentiment_counts['neutral'] += 1
        
        total = len(messages)
        return {
            'positive_rate': round(sentiment_counts['positive'] / total * 100, 1),
            'negative_rate': round(sentiment_counts['negative'] / total * 100, 1),
            'neutral_rate': round(sentiment_counts['neutral'] / total * 100, 1),
            'total_messages': total
        }
    
    def extract_main_topics(self, messages: List[Dict]) -> List[str]:
        """주요 주제 추출"""
        topic_keywords = {
            '공사비 및 분담금': ['공사비', '분담금', '비용', '가격', '원가'],
            '설계 및 품질': ['설계', '평면', '고급화', '품질', '마감재'],
            '홍보 및 마케팅': ['홍보', '마케팅', '브랜드', '부스', '직원'],
            '평가 및 선택': ['평가', '비교', '선택', '입찰', '제안서'],
            '커뮤니티 시설': ['커뮤니티', '시설', '공용', '편의시설']
        }
        
        topic_counts = Counter()
        
        for msg in messages:
            content = msg['content'].lower()
            for topic, keywords in topic_keywords.items():
                if any(keyword in content for keyword in keywords):
                    topic_counts[topic] += 1
        
        return [topic for topic, count in topic_counts.most_common(5)]
    
    def save_conversation_summary(self, summary: ConversationSummary, chat_room_id: str):
        """대화 요약을 데이터베이스에 저장"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        summary_id = f"{chat_room_id}_{summary.period_start.strftime('%Y%m%d')}_{summary.period_end.strftime('%Y%m%d')}"
        
        cursor.execute('''
            INSERT OR REPLACE INTO conversation_summaries 
            (id, chat_room_id, period_start, period_end, summary_data)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            summary_id,
            chat_room_id,
            summary.period_start,
            summary.period_end,
            json.dumps({
                'total_messages': summary.total_messages,
                'unique_speakers': summary.unique_speakers,
                'main_topics': summary.main_topics,
                'key_issues': summary.key_issues,
                'speaker_summaries': summary.speaker_summaries,
                'sentiment_analysis': summary.sentiment_analysis
            })
        ))
        
        # 발언자별 요약도 저장
        for speaker_summary in summary.speaker_summaries:
            speaker_id = f"{summary_id}_{speaker_summary['speaker']}"
            cursor.execute('''
                INSERT OR REPLACE INTO speaker_summaries 
                (id, chat_room_id, speaker_name, period_start, period_end, 
                 message_count, main_topics, sentiment_analysis, key_statements)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                speaker_id,
                chat_room_id,
                speaker_summary['speaker'],
                summary.period_start,
                summary.period_end,
                speaker_summary['message_count'],
                json.dumps(speaker_summary['main_topics']),
                json.dumps({'participation_rate': speaker_summary['participation_rate']}),
                json.dumps(speaker_summary['key_statements'])
            ))
        
        conn.commit()
        conn.close()

# 전역 인스턴스 생성
conversation_analyzer = KakaoTalkAnalyzer()
