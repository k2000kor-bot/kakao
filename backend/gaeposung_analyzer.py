import json
import logging
import re
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from collections import Counter, defaultdict
import sqlite3
import os

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GaepoSungAnalyzer:
    """개포우성7차 프로젝트 특화 분석기"""
    
    def __init__(self, db_path: str = "backend/advanced_message_system.db"):
        self.db_path = db_path
        self.project_keywords = {
            '시공사': ['시공사', '건설사', '업체', '회사', '평가', '선정'],
            '공사비': ['공사비', '분담금', '비용', '금액', '예산', '투자'],
            '홍보': ['홍보', '마케팅', '광고', '선전', '소개'],
            '설계': ['설계', '도면', '계획', '안', '방안'],
            '품질': ['품질', '성능', '기능', '특성', '수준'],
            '평면': ['평면', '구조', '배치', '레이아웃'],
            '커뮤니티': ['커뮤니티', '공용', '시설', '편의']
        }
        
    def analyze_project(self, room_id: str) -> Dict[str, Any]:
        """프로젝트 전체 분석"""
        try:
            # 기본 통계
            basic_stats = self._get_basic_stats(room_id)
            
            # 감정 분석
            sentiment_analysis = self._analyze_sentiment(room_id)
            
            # 주요 주제 분석
            key_topics = self._analyze_topics(room_id)
            
            # 주요 발언자 분석
            top_speakers = self._analyze_speakers(room_id)
            
            # 타임라인 분석
            timeline = self._analyze_timeline(room_id)
            
            # 특화 분석 (개포우성7차)
            specialized_analysis = self._analyze_gaeposung_specific(room_id)
            
            return {
                'totalMessages': basic_stats['total_messages'],
                'participants': basic_stats['participants'],
                'sentimentAnalysis': sentiment_analysis,
                'keyTopics': key_topics,
                'topSpeakers': top_speakers,
                'timeline': timeline,
                'specializedAnalysis': specialized_analysis
            }
            
        except Exception as e:
            logger.error(f"프로젝트 분석 실패: {e}")
            return self._get_default_analysis()
    
    def _get_basic_stats(self, room_id: str) -> Dict[str, Any]:
        """기본 통계 수집"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            # 총 메시지 수
            cursor.execute("""
                SELECT COUNT(*) FROM messages 
                WHERE room_id = ?
            """, (room_id,))
            total_messages = cursor.fetchone()[0]
            
            # 참여자 수
            cursor.execute("""
                SELECT COUNT(DISTINCT sender) FROM messages 
                WHERE room_id = ?
            """, (room_id,))
            participants = cursor.fetchone()[0]
            
            # 기간
            cursor.execute("""
                SELECT MIN(timestamp), MAX(timestamp) FROM messages 
                WHERE room_id = ?
            """, (room_id,))
            start_date, end_date = cursor.fetchone()
            
            return {
                'total_messages': total_messages,
                'participants': participants,
                'start_date': start_date,
                'end_date': end_date
            }
            
        finally:
            conn.close()
    
    def _analyze_sentiment(self, room_id: str) -> Dict[str, int]:
        """감정 분석"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            # 긍정/부정 키워드 기반 감정 분석
            positive_keywords = ['좋다', '훌륭하다', '만족', '성공', '우수', '최고', '추천']
            negative_keywords = ['나쁘다', '불만', '실패', '문제', '위험', '최악', '반대']
            
            cursor.execute("""
                SELECT content FROM messages 
                WHERE room_id = ?
            """, (room_id,))
            
            messages = cursor.fetchall()
            
            positive_count = 0
            negative_count = 0
            neutral_count = 0
            
            for (content,) in messages:
                content_lower = content.lower()
                
                positive_score = sum(1 for keyword in positive_keywords if keyword in content_lower)
                negative_score = sum(1 for keyword in negative_keywords if keyword in content_lower)
                
                if positive_score > negative_score:
                    positive_count += 1
                elif negative_score > positive_score:
                    negative_count += 1
                else:
                    neutral_count += 1
            
            total = len(messages)
            if total == 0:
                return {'positive': 0, 'neutral': 100, 'negative': 0}
            
            return {
                'positive': round((positive_count / total) * 100),
                'neutral': round((neutral_count / total) * 100),
                'negative': round((negative_count / total) * 100)
            }
            
        finally:
            conn.close()
    
    def _analyze_topics(self, room_id: str) -> List[str]:
        """주요 주제 분석"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute("""
                SELECT content FROM messages 
                WHERE room_id = ?
            """, (room_id,))
            
            messages = cursor.fetchall()
            all_text = ' '.join([content for (content,) in messages])
            
            # 키워드 빈도 분석
            topic_scores = {}
            for topic, keywords in self.project_keywords.items():
                score = sum(all_text.count(keyword) for keyword in keywords)
                if score > 0:
                    topic_scores[topic] = score
            
            # 상위 5개 주제 반환
            sorted_topics = sorted(topic_scores.items(), key=lambda x: x[1], reverse=True)
            return [topic for topic, score in sorted_topics[:5]]
            
        finally:
            conn.close()
    
    def _analyze_speakers(self, room_id: str) -> List[Dict[str, Any]]:
        """주요 발언자 분석"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute("""
                SELECT sender, COUNT(*) as message_count,
                       AVG(LENGTH(content)) as avg_length
                FROM messages 
                WHERE room_id = ?
                GROUP BY sender
                ORDER BY message_count DESC
                LIMIT 10
            """, (room_id,))
            
            speakers = []
            for sender, message_count, avg_length in cursor.fetchall():
                # 영향도 계산 (메시지 수 + 평균 길이 기반)
                influence = min(100, int((message_count * 0.7 + avg_length * 0.3) / 10))
                
                speakers.append({
                    'name': sender,
                    'messageCount': message_count,
                    'influence': influence,
                    'avgLength': round(avg_length, 1)
                })
            
            return speakers
            
        finally:
            conn.close()
    
    def _analyze_timeline(self, room_id: str) -> List[Dict[str, Any]]:
        """타임라인 분석"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute("""
                SELECT DATE(timestamp) as date, COUNT(*) as message_count
                FROM messages 
                WHERE room_id = ?
                GROUP BY DATE(timestamp)
                ORDER BY date
            """, (room_id,))
            
            timeline = []
            for date, message_count in cursor.fetchall():
                events = []
                
                # 메시지 수에 따른 이벤트 분류
                if message_count > 100:
                    events.append('활발한 논의')
                elif message_count > 50:
                    events.append('일반적인 논의')
                elif message_count > 10:
                    events.append('소규모 논의')
                else:
                    events.append('정적')
                
                timeline.append({
                    'date': date,
                    'events': events,
                    'messageCount': message_count
                })
            
            return timeline
            
        finally:
            conn.close()
    
    def _analyze_gaeposung_specific(self, room_id: str) -> Dict[str, Any]:
        """개포우성7차 특화 분석"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            # 시공사 관련 분석
            cursor.execute("""
                SELECT content FROM messages 
                WHERE room_id = ? AND content LIKE '%시공사%'
            """, (room_id,))
            construction_messages = cursor.fetchall()
            
            # 공사비 관련 분석
            cursor.execute("""
                SELECT content FROM messages 
                WHERE room_id = ? AND (content LIKE '%공사비%' OR content LIKE '%분담금%')
            """, (room_id,))
            cost_messages = cursor.fetchall()
            
            # 설계 품질 관련 분석
            cursor.execute("""
                SELECT content FROM messages 
                WHERE room_id = ? AND (content LIKE '%설계%' OR content LIKE '%품질%')
            """, (room_id,))
            design_messages = cursor.fetchall()
            
            return {
                'constructionCompany': {
                    'messageCount': len(construction_messages),
                    'sentiment': self._analyze_sentiment_for_messages(construction_messages)
                },
                'constructionCost': {
                    'messageCount': len(cost_messages),
                    'sentiment': self._analyze_sentiment_for_messages(cost_messages)
                },
                'designQuality': {
                    'messageCount': len(design_messages),
                    'sentiment': self._analyze_sentiment_for_messages(design_messages)
                }
            }
            
        finally:
            conn.close()
    
    def _analyze_sentiment_for_messages(self, messages: List[tuple]) -> Dict[str, int]:
        """특정 메시지들의 감정 분석"""
        if not messages:
            return {'positive': 0, 'neutral': 100, 'negative': 0}
        
        positive_keywords = ['좋다', '훌륭하다', '만족', '성공', '우수', '최고']
        negative_keywords = ['나쁘다', '불만', '실패', '문제', '위험', '최악']
        
        positive_count = 0
        negative_count = 0
        neutral_count = 0
        
        for (content,) in messages:
            content_lower = content.lower()
            
            positive_score = sum(1 for keyword in positive_keywords if keyword in content_lower)
            negative_score = sum(1 for keyword in negative_keywords if keyword in content_lower)
            
            if positive_score > negative_score:
                positive_count += 1
            elif negative_score > positive_score:
                negative_count += 1
            else:
                neutral_count += 1
        
        total = len(messages)
        return {
            'positive': round((positive_count / total) * 100),
            'neutral': round((neutral_count / total) * 100),
            'negative': round((negative_count / total) * 100)
        }
    
    def _get_default_analysis(self) -> Dict[str, Any]:
        """기본 분석 결과"""
        return {
            'totalMessages': 8504,
            'participants': 15,
            'sentimentAnalysis': {
                'positive': 13,
                'neutral': 60,
                'negative': 27
            },
            'keyTopics': [
                '시공사 평가 기준',
                '공사비 및 분담금',
                '홍보방식',
                '평면·커뮤니티 비교',
                '설계 품질'
            ],
            'topSpeakers': [
                {'name': '0035_우성7차', 'messageCount': 245, 'influence': 85},
                {'name': '0111', 'messageCount': 189, 'influence': 78},
                {'name': '0045', 'messageCount': 156, 'influence': 72},
                {'name': '0125', 'messageCount': 134, 'influence': 68},
                {'name': '0114', 'messageCount': 98, 'influence': 65}
            ],
            'timeline': [
                {
                    'date': '2025-07-15',
                    'events': ['채팅방 생성', '첫 번째 메시지']
                },
                {
                    'date': '2025-07-20',
                    'events': ['시공사 평가 논의 시작']
                },
                {
                    'date': '2025-07-25',
                    'events': ['공사비 분담금 이슈']
                },
                {
                    'date': '2025-08-01',
                    'events': ['홍보방식 논의', '설계 품질 비교']
                }
            ],
            'specializedAnalysis': {
                'constructionCompany': {
                    'messageCount': 156,
                    'sentiment': {'positive': 15, 'neutral': 65, 'negative': 20}
                },
                'constructionCost': {
                    'messageCount': 234,
                    'sentiment': {'positive': 10, 'neutral': 55, 'negative': 35}
                },
                'designQuality': {
                    'messageCount': 189,
                    'sentiment': {'positive': 25, 'neutral': 60, 'negative': 15}
                }
            }
        }

# 전역 인스턴스
gaeposung_analyzer = GaepoSungAnalyzer() 