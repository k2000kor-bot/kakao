import os
import json
import sqlite3
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from pathlib import Path
import logging
from dataclasses import dataclass
from enum import Enum
import re
from collections import defaultdict
import hashlib
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

logger = logging.getLogger(__name__)

class KnowledgeType(Enum):
    FACT = "fact"           # 사실 정보
    PROCEDURE = "procedure" # 절차 정보
    POLICY = "policy"       # 정책 정보
    CASE = "case"          # 사례 정보
    GUIDELINE = "guideline" # 가이드라인
    FAQ = "faq"           # 자주 묻는 질문

class KnowledgePriority(Enum):
    CRITICAL = "critical"   # 긴급
    HIGH = "high"          # 높음
    MEDIUM = "medium"      # 보통
    LOW = "low"            # 낮음

@dataclass
class KnowledgeItem:
    id: str
    title: str
    content: str
    knowledge_type: KnowledgeType
    category: str
    priority: KnowledgePriority
    keywords: List[str]
    related_items: List[str]
    created_at: datetime
    updated_at: datetime
    usage_count: int = 0
    confidence_score: float = 0.0
    source_documents: List[str] = None
    expert_verified: bool = False

class KnowledgeEnhancer:
    """고도화된 지식 관리 시스템"""
    
    def __init__(self, db_path: str = "knowledge.db"):
        self.db_path = db_path
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        self.knowledge_vectors = None
        self.knowledge_items = {}
        self.init_database()
        self.load_knowledge()
    
    def init_database(self):
        """데이터베이스 초기화"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 지식 아이템 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS knowledge_items (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                knowledge_type TEXT NOT NULL,
                category TEXT NOT NULL,
                priority TEXT NOT NULL,
                keywords TEXT,
                related_items TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                usage_count INTEGER DEFAULT 0,
                confidence_score REAL DEFAULT 0.0,
                source_documents TEXT,
                expert_verified BOOLEAN DEFAULT FALSE
            )
        ''')
        
        # 지식 사용 기록 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS knowledge_usage (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                knowledge_id TEXT,
                query TEXT,
                context TEXT,
                used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                helpful_rating INTEGER,
                FOREIGN KEY (knowledge_id) REFERENCES knowledge_items (id)
            )
        ''')
        
        # 지식 관계 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS knowledge_relations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source_id TEXT,
                target_id TEXT,
                relation_type TEXT,
                strength REAL DEFAULT 1.0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (source_id) REFERENCES knowledge_items (id),
                FOREIGN KEY (target_id) REFERENCES knowledge_items (id)
            )
        ''')
        
        # 전문가 검증 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS expert_verifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                knowledge_id TEXT,
                expert_name TEXT,
                verification_status TEXT,
                comments TEXT,
                verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (knowledge_id) REFERENCES knowledge_items (id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def load_knowledge(self):
        """지식 아이템 로드"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, title, content, knowledge_type, category, priority, keywords,
                   related_items, created_at, updated_at, usage_count, confidence_score,
                   source_documents, expert_verified
            FROM knowledge_items
        ''')
        
        for row in cursor.fetchall():
            knowledge_item = KnowledgeItem(
                id=row[0],
                title=row[1],
                content=row[2],
                knowledge_type=KnowledgeType(row[3]),
                category=row[4],
                priority=KnowledgePriority(row[5]),
                keywords=json.loads(row[6]) if row[6] else [],
                related_items=json.loads(row[7]) if row[7] else [],
                created_at=datetime.fromisoformat(row[8]),
                updated_at=datetime.fromisoformat(row[9]),
                usage_count=row[10],
                confidence_score=row[11],
                source_documents=json.loads(row[12]) if row[12] else [],
                expert_verified=bool(row[13])
            )
            self.knowledge_items[knowledge_item.id] = knowledge_item
        
        conn.close()
        
        # 벡터화 업데이트
        self.update_vectors()
    
    def update_vectors(self):
        """지식 아이템 벡터화"""
        if not self.knowledge_items:
            return
        
        texts = [item.content for item in self.knowledge_items.values()]
        self.knowledge_vectors = self.vectorizer.fit_transform(texts)
    
    def extract_knowledge_from_documents(self, documents: List[Dict[str, Any]]) -> List[KnowledgeItem]:
        """문서에서 지식 추출"""
        knowledge_items = []
        
        for doc in documents:
            # 문서 내용 분석
            content = doc.get('content', '')
            title = doc.get('title', '')
            category = doc.get('category', 'general')
            
            # 지식 타입 분류
            knowledge_type = self.classify_knowledge_type(content, title)
            
            # 키워드 추출
            keywords = self.extract_keywords(content)
            
            # 우선순위 결정
            priority = self.determine_priority(content, category)
            
            # 신뢰도 점수 계산
            confidence = self.calculate_confidence(content, doc.get('source', ''))
            
            knowledge_item = KnowledgeItem(
                id=f"knowledge_{len(knowledge_items) + 1}",
                title=title,
                content=content,
                knowledge_type=knowledge_type,
                category=category,
                priority=priority,
                keywords=keywords,
                related_items=[],
                created_at=datetime.now(),
                updated_at=datetime.now(),
                confidence_score=confidence,
                source_documents=[doc.get('file_path', '')]
            )
            
            knowledge_items.append(knowledge_item)
        
        return knowledge_items
    
    def classify_knowledge_type(self, content: str, title: str) -> KnowledgeType:
        """지식 타입 분류"""
        text = f"{title} {content}".lower()
        
        # FAQ 패턴
        if any(word in text for word in ['질문', '답변', 'faq', '자주 묻는']):
            return KnowledgeType.FAQ
        
        # 절차 패턴
        if any(word in text for word in ['절차', '순서', '단계', '방법', '과정']):
            return KnowledgeType.PROCEDURE
        
        # 정책 패턴
        if any(word in text for word in ['정책', '규정', '규칙', '법령', '조례']):
            return KnowledgeType.POLICY
        
        # 사례 패턴
        if any(word in text for word in ['사례', '예시', '케이스', '경험', '실제']):
            return KnowledgeType.CASE
        
        # 가이드라인 패턴
        if any(word in text for word in ['가이드라인', '지침', '안내', '매뉴얼']):
            return KnowledgeType.GUIDELINE
        
        # 기본값은 사실 정보
        return KnowledgeType.FACT
    
    def extract_keywords(self, content: str) -> List[str]:
        """키워드 추출"""
        # 기본 키워드
        base_keywords = [
            '급여', '체불', '안전', '규정', '복지', '혜택', '협의', '시공사', '조합',
            '노동법', '근로기준법', '산업안전', '최저임금', '근로복지', '조합원',
            '교육', '훈련', '보호구', '사고', '응급', '의료', '문화', '금융'
        ]
        
        # 내용에서 키워드 찾기
        found_keywords = []
        for keyword in base_keywords:
            if keyword in content:
                found_keywords.append(keyword)
        
        # 추가 키워드 추출 (간단한 패턴 매칭)
        additional_patterns = [
            r'\b\d{4}년\b',  # 연도
            r'\b\d+원\b',    # 금액
            r'\b\d+%?\b',    # 퍼센트
            r'\b[가-힣]+법\b',  # 법률
            r'\b[가-힣]+규정\b'  # 규정
        ]
        
        for pattern in additional_patterns:
            matches = re.findall(pattern, content)
            found_keywords.extend(matches)
        
        return list(set(found_keywords))
    
    def determine_priority(self, content: str, category: str) -> KnowledgePriority:
        """우선순위 결정"""
        # 긴급 키워드
        urgent_keywords = ['체불', '사고', '응급', '즉시', '긴급', '위험']
        if any(keyword in content for keyword in urgent_keywords):
            return KnowledgePriority.CRITICAL
        
        # 높은 우선순위 키워드
        high_keywords = ['급여', '안전', '복지', '협의', '법적']
        if any(keyword in content for keyword in high_keywords):
            return KnowledgePriority.HIGH
        
        # 카테고리별 우선순위
        if category in ['labor_law', 'safety_guidelines']:
            return KnowledgePriority.HIGH
        
        return KnowledgePriority.MEDIUM
    
    def calculate_confidence(self, content: str, source: str) -> float:
        """신뢰도 점수 계산"""
        confidence = 0.5  # 기본값
        
        # 내용 길이에 따른 점수
        if len(content) > 500:
            confidence += 0.2
        elif len(content) > 200:
            confidence += 0.1
        
        # 소스 신뢰도
        if '법령' in source or '규정' in source:
            confidence += 0.3
        elif '공식' in source or '정부' in source:
            confidence += 0.2
        elif '조합' in source:
            confidence += 0.1
        
        # 키워드 다양성
        keywords = self.extract_keywords(content)
        if len(keywords) >= 5:
            confidence += 0.1
        
        return min(confidence, 1.0)
    
    def search_knowledge(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """지식 검색"""
        if not self.knowledge_items or self.knowledge_vectors is None:
            return []
        
        # 쿼리 벡터화
        query_vector = self.vectorizer.transform([query])
        
        # 유사도 계산
        similarities = cosine_similarity(query_vector, self.knowledge_vectors).flatten()
        
        # 상위 결과 선택
        top_indices = np.argsort(similarities)[::-1][:limit]
        
        results = []
        for idx in top_indices:
            if similarities[idx] > 0.1:  # 임계값
                item = list(self.knowledge_items.values())[idx]
                results.append({
                    'id': item.id,
                    'title': item.title,
                    'content': item.content[:200] + '...' if len(item.content) > 200 else item.content,
                    'knowledge_type': item.knowledge_type.value,
                    'category': item.category,
                    'priority': item.priority.value,
                    'similarity': float(similarities[idx]),
                    'confidence': item.confidence_score,
                    'usage_count': item.usage_count
                })
        
        return results
    
    def get_knowledge_by_type(self, knowledge_type: KnowledgeType) -> List[KnowledgeItem]:
        """타입별 지식 조회"""
        return [item for item in self.knowledge_items.values() if item.knowledge_type == knowledge_type]
    
    def get_knowledge_by_category(self, category: str) -> List[KnowledgeItem]:
        """카테고리별 지식 조회"""
        return [item for item in self.knowledge_items.values() if item.category == category]
    
    def get_related_knowledge(self, knowledge_id: str, limit: int = 5) -> List[KnowledgeItem]:
        """관련 지식 조회"""
        if knowledge_id not in self.knowledge_items:
            return []
        
        target_item = self.knowledge_items[knowledge_id]
        
        # 키워드 기반 관련성 계산
        related_items = []
        for item in self.knowledge_items.values():
            if item.id == knowledge_id:
                continue
            
            # 키워드 겹침 계산
            common_keywords = set(target_item.keywords) & set(item.keywords)
            if len(common_keywords) > 0:
                related_items.append((item, len(common_keywords)))
        
        # 관련성 순으로 정렬
        related_items.sort(key=lambda x: x[1], reverse=True)
        
        return [item for item, score in related_items[:limit]]
    
    def update_knowledge_usage(self, knowledge_id: str, query: str = "", context: str = "", rating: int = None):
        """지식 사용 기록 업데이트"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # 사용 기록 추가
            cursor.execute('''
                INSERT INTO knowledge_usage (knowledge_id, query, context, helpful_rating)
                VALUES (?, ?, ?, ?)
            ''', (knowledge_id, query, context, rating))
            
            # 사용 횟수 업데이트
            cursor.execute('''
                UPDATE knowledge_items 
                SET usage_count = usage_count + 1, updated_at = ?
                WHERE id = ?
            ''', (datetime.now().isoformat(), knowledge_id))
            
            conn.commit()
            conn.close()
            
            # 메모리 업데이트
            if knowledge_id in self.knowledge_items:
                self.knowledge_items[knowledge_id].usage_count += 1
                self.knowledge_items[knowledge_id].updated_at = datetime.now()
            
        except Exception as e:
            logger.error(f"지식 사용 기록 업데이트 실패: {e}")
    
    def add_expert_verification(self, knowledge_id: str, expert_name: str, status: str, comments: str = ""):
        """전문가 검증 추가"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO expert_verifications (knowledge_id, expert_name, verification_status, comments)
                VALUES (?, ?, ?, ?)
            ''', (knowledge_id, expert_name, status, comments))
            
            # 검증 상태 업데이트
            if status == 'verified':
                cursor.execute('''
                    UPDATE knowledge_items 
                    SET expert_verified = TRUE, updated_at = ?
                    WHERE id = ?
                ''', (datetime.now().isoformat(), knowledge_id))
            
            conn.commit()
            conn.close()
            
            # 메모리 업데이트
            if knowledge_id in self.knowledge_items:
                self.knowledge_items[knowledge_id].expert_verified = (status == 'verified')
                self.knowledge_items[knowledge_id].updated_at = datetime.now()
            
        except Exception as e:
            logger.error(f"전문가 검증 추가 실패: {e}")
    
    def get_knowledge_statistics(self) -> Dict[str, Any]:
        """지식 통계 조회"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # 전체 지식 수
            cursor.execute('SELECT COUNT(*) FROM knowledge_items')
            total_knowledge = cursor.fetchone()[0]
            
            # 타입별 지식 수
            cursor.execute('''
                SELECT knowledge_type, COUNT(*) 
                FROM knowledge_items 
                GROUP BY knowledge_type
            ''')
            type_counts = dict(cursor.fetchall())
            
            # 카테고리별 지식 수
            cursor.execute('''
                SELECT category, COUNT(*) 
                FROM knowledge_items 
                GROUP BY category
            ''')
            category_counts = dict(cursor.fetchall())
            
            # 우선순위별 지식 수
            cursor.execute('''
                SELECT priority, COUNT(*) 
                FROM knowledge_items 
                GROUP BY priority
            ''')
            priority_counts = dict(cursor.fetchall())
            
            # 평균 사용 횟수
            cursor.execute('SELECT AVG(usage_count) FROM knowledge_items')
            avg_usage = cursor.fetchone()[0] or 0.0
            
            # 평균 신뢰도
            cursor.execute('SELECT AVG(confidence_score) FROM knowledge_items')
            avg_confidence = cursor.fetchone()[0] or 0.0
            
            # 전문가 검증된 지식 수
            cursor.execute('SELECT COUNT(*) FROM knowledge_items WHERE expert_verified = TRUE')
            verified_count = cursor.fetchone()[0]
            
            conn.close()
            
            return {
                "total_knowledge": total_knowledge,
                "type_counts": type_counts,
                "category_counts": category_counts,
                "priority_counts": priority_counts,
                "average_usage": round(avg_usage, 2),
                "average_confidence": round(avg_confidence, 3),
                "verified_count": verified_count,
                "verification_rate": round(verified_count / total_knowledge * 100, 1) if total_knowledge > 0 else 0
            }
            
        except Exception as e:
            logger.error(f"지식 통계 조회 실패: {e}")
            return {"error": str(e)}
    
    def save_knowledge_item(self, knowledge_item: KnowledgeItem):
        """지식 아이템 저장"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO knowledge_items 
            (id, title, content, knowledge_type, category, priority, keywords, 
             related_items, created_at, updated_at, usage_count, confidence_score,
             source_documents, expert_verified)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            knowledge_item.id,
            knowledge_item.title,
            knowledge_item.content,
            knowledge_item.knowledge_type.value,
            knowledge_item.category,
            knowledge_item.priority.value,
            json.dumps(knowledge_item.keywords),
            json.dumps(knowledge_item.related_items),
            knowledge_item.created_at.isoformat(),
            knowledge_item.updated_at.isoformat(),
            knowledge_item.usage_count,
            knowledge_item.confidence_score,
            json.dumps(knowledge_item.source_documents or []),
            knowledge_item.expert_verified
        ))
        
        conn.commit()
        conn.close()
        
        # 메모리 업데이트
        self.knowledge_items[knowledge_item.id] = knowledge_item
        self.update_vectors()

# 전역 인스턴스
knowledge_enhancer = KnowledgeEnhancer() 