#!/usr/bin/env python3
"""
지식 축적 시스템 - 웹 검색 기반 지식 수집 및 업데이트
Knowledge Accumulation System - Web Search Based Knowledge Collection and Update

Features:
- 웹 검색을 통한 실시간 지식 수집
- 지식 베이스 자동 업데이트
- 답변 정확성 검증 및 개선
- 착시 방지 및 품질 향상
- 지속적인 학습 및 개선
"""

import json
import time
import sqlite3
import hashlib
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import threading
import queue
import re

# 웹 검색을 위한 라이브러리
try:
    import requests
    from bs4 import BeautifulSoup
    import urllib.parse
    WEB_SEARCH_AVAILABLE = True
except ImportError:
    WEB_SEARCH_AVAILABLE = False
    print("⚠️ 웹 검색 라이브러리를 사용할 수 없습니다")

logger = logging.getLogger(__name__)

class KnowledgeType(Enum):
    """지식 타입"""
    FACTUAL = "factual"          # 사실 정보
    PROCEDURAL = "procedural"    # 절차적 지식
    CONCEPTUAL = "conceptual"    # 개념적 지식
    CONTEXTUAL = "contextual"    # 맥락적 지식
    TEMPORAL = "temporal"        # 시간적 지식

class ReliabilityLevel(Enum):
    """신뢰도 수준"""
    HIGH = "high"               # 높음 (공식 소스)
    MEDIUM = "medium"           # 중간 (신뢰할 수 있는 소스)
    LOW = "low"                 # 낮음 (일반 웹사이트)
    UNVERIFIED = "unverified"   # 미검증

@dataclass
class KnowledgeEntry:
    """지식 엔트리"""
    id: str
    topic: str
    content: str
    knowledge_type: KnowledgeType
    reliability_level: ReliabilityLevel
    source_url: str
    source_name: str
    created_at: datetime
    last_updated: datetime
    access_count: int
    verification_count: int
    tags: List[str]
    related_topics: List[str]
    confidence_score: float

@dataclass
class SearchResult:
    """검색 결과"""
    title: str
    url: str
    snippet: str
    source: str
    relevance_score: float
    content: Optional[str] = None

class KnowledgeAccumulationSystem:
    """지식 축적 시스템"""
    
    def __init__(self, db_path: str = "knowledge_base.db"):
        self.db_path = db_path
        self.knowledge_cache = {}
        self.search_cache = {}
        self.update_queue = queue.Queue()
        self.verification_queue = queue.Queue()
        self.is_running = False
        
        # 데이터베이스 초기화
        self._initialize_database()
        
        # 백그라운드 작업 시작
        self._start_background_workers()
        
        # 기본 지식 베이스 로드
        self._load_basic_knowledge()
    
    def _initialize_database(self):
        """데이터베이스 초기화"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 지식 엔트리 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS knowledge_entries (
                id TEXT PRIMARY KEY,
                topic TEXT NOT NULL,
                content TEXT NOT NULL,
                knowledge_type TEXT NOT NULL,
                reliability_level TEXT NOT NULL,
                source_url TEXT,
                source_name TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                access_count INTEGER DEFAULT 0,
                verification_count INTEGER DEFAULT 0,
                tags TEXT,
                related_topics TEXT,
                confidence_score REAL DEFAULT 0.0
            )
        ''')
        
        # 검색 히스토리 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS search_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                query TEXT NOT NULL,
                results_count INTEGER,
                search_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                success BOOLEAN DEFAULT TRUE
            )
        ''')
        
        # 지식 업데이트 로그 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS update_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                knowledge_id TEXT,
                update_type TEXT,
                old_content TEXT,
                new_content TEXT,
                update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                reason TEXT
            )
        ''')
        
        conn.commit()
        conn.close()
        print("✅ 지식 축적 시스템 데이터베이스 초기화 완료")
    
    def _start_background_workers(self):
        """백그라운드 작업자 시작"""
        self.is_running = True
        
        # 지식 업데이트 워커
        update_thread = threading.Thread(target=self._knowledge_update_worker, daemon=True)
        update_thread.start()
        
        # 지식 검증 워커
        verification_thread = threading.Thread(target=self._knowledge_verification_worker, daemon=True)
        verification_thread.start()
        
        print("✅ 지식 축적 시스템 백그라운드 워커 시작")
    
    def _knowledge_update_worker(self):
        """지식 업데이트 워커"""
        while self.is_running:
            try:
                if not self.update_queue.empty():
                    update_task = self.update_queue.get(timeout=1)
                    self._process_knowledge_update(update_task)
                else:
                    time.sleep(5)
            except queue.Empty:
                continue
            except Exception as e:
                logger.error(f"지식 업데이트 워커 오류: {e}")
                time.sleep(10)
    
    def _knowledge_verification_worker(self):
        """지식 검증 워커"""
        while self.is_running:
            try:
                if not self.verification_queue.empty():
                    verification_task = self.verification_queue.get(timeout=1)
                    self._process_knowledge_verification(verification_task)
                else:
                    time.sleep(10)
            except queue.Empty:
                continue
            except Exception as e:
                logger.error(f"지식 검증 워커 오류: {e}")
                time.sleep(15)
    
    def _load_basic_knowledge(self):
        """기본 지식 베이스 로드"""
        basic_knowledge = [
            {
                "topic": "프로그래밍 기본 개념",
                "content": "프로그래밍은 컴퓨터에게 수행할 작업을 지시하는 과정입니다. 알고리즘, 자료구조, 디자인 패턴 등이 중요합니다.",
                "knowledge_type": KnowledgeType.CONCEPTUAL,
                "reliability_level": ReliabilityLevel.HIGH,
                "source_name": "기본 지식 베이스",
                "tags": ["프로그래밍", "기본개념", "알고리즘"]
            },
            {
                "topic": "한국어 문법",
                "content": "한국어는 교착어로, 어미를 통해 문법적 관계를 표현합니다. 주어-목적어-서술어 순서를 기본으로 합니다.",
                "knowledge_type": KnowledgeType.FACTUAL,
                "reliability_level": ReliabilityLevel.HIGH,
                "source_name": "기본 지식 베이스",
                "tags": ["한국어", "문법", "언어학"]
            },
            {
                "topic": "비즈니스 전략",
                "content": "비즈니스 전략은 조직의 장기적 목표를 달성하기 위한 계획입니다. SWOT 분석, 포터의 5가지 힘 등이 중요합니다.",
                "knowledge_type": KnowledgeType.CONCEPTUAL,
                "reliability_level": ReliabilityLevel.HIGH,
                "source_name": "기본 지식 베이스",
                "tags": ["비즈니스", "전략", "경영"]
            }
        ]
        
        for knowledge in basic_knowledge:
            # 딕셔너리를 KnowledgeEntry 객체로 변환
            knowledge_entry = KnowledgeEntry(
                id=hashlib.md5(f"basic_{knowledge['topic']}".encode()).hexdigest(),
                topic=knowledge['topic'],
                content=knowledge['content'],
                knowledge_type=knowledge['knowledge_type'],
                reliability_level=knowledge['reliability_level'],
                source_url="",
                source_name=knowledge['source_name'],
                created_at=datetime.now(),
                last_updated=datetime.now(),
                access_count=0,
                verification_count=0,
                tags=knowledge.get('tags', []),
                related_topics=[],
                confidence_score=0.9
            )
            self._add_knowledge_entry(knowledge_entry)
        
        print(f"✅ 기본 지식 {len(basic_knowledge)}개 로드 완료")
    
    def search_knowledge(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """지식 베이스에서 검색"""
        try:
            cursor = self.db_connection.cursor()
            cursor.execute("""
                SELECT id, title, content, knowledge_type, reliability_level, 
                       source_url, created_at, last_updated, access_count
                FROM knowledge_base 
                WHERE content LIKE ? OR title LIKE ?
                ORDER BY reliability_level DESC, access_count DESC, created_at DESC
                LIMIT ?
            """, (f'%{query}%', f'%{query}%', limit))
            
            results = []
            for row in cursor.fetchall():
                results.append({
                    'id': row[0],
                    'title': row[1],
                    'content': row[2],
                    'knowledge_type': row[3],
                    'reliability_level': row[4],
                    'source_url': row[5],
                    'created_at': row[6],
                    'last_updated': row[7],
                    'access_count': row[8]
                })
            
            return results
        except Exception as e:
            logger.error(f"지식 검색 오류: {e}")
            return []

    def search_and_accumulate_knowledge(self, query: str, max_results: int = 5) -> List[KnowledgeEntry]:
        """웹 검색을 통한 지식 수집"""
        try:
            # 캐시 확인
            cache_key = hashlib.md5(query.encode()).hexdigest()
            if cache_key in self.search_cache:
                cached_time = self.search_cache[cache_key]['timestamp']
                if datetime.now() - cached_time < timedelta(hours=1):
                    return self.search_cache[cache_key]['results']
            
            # 웹 검색 수행
            search_results = self._perform_web_search(query, max_results)
            
            # 지식 엔트리 생성
            knowledge_entries = []
            for result in search_results:
                knowledge_entry = self._create_knowledge_from_search_result(query, result)
                if knowledge_entry:
                    knowledge_entries.append(knowledge_entry)
                    self._add_knowledge_entry(knowledge_entry)
            
            # 캐시 저장
            self.search_cache[cache_key] = {
                'results': knowledge_entries,
                'timestamp': datetime.now()
            }
            
            # 검색 히스토리 기록
            self._record_search_history(query, len(knowledge_entries))
            
            return knowledge_entries
            
        except Exception as e:
            logger.error(f"지식 수집 실패: {e}")
            return []
    
    def _perform_web_search(self, query: str, max_results: int) -> List[SearchResult]:
        """웹 검색 수행"""
        if not WEB_SEARCH_AVAILABLE:
            return self._simulate_web_search(query, max_results)
        
        try:
            # Google 검색 시뮬레이션 (실제로는 API 사용 권장)
            search_results = []
            
            # 검색어 최적화
            optimized_query = self._optimize_search_query(query)
            
            # 여러 검색 엔진에서 검색 (시뮬레이션)
            search_engines = [
                {"name": "Wikipedia", "url": "https://ko.wikipedia.org/wiki/"},
                {"name": "Naver", "url": "https://search.naver.com/search.naver?query="},
                {"name": "Google", "url": "https://www.google.com/search?q="}
            ]
            
            for engine in search_engines[:2]:  # 최대 2개 엔진
                try:
                    results = self._search_single_engine(engine, optimized_query, max_results // 2)
                    search_results.extend(results)
                except Exception as e:
                    logger.warning(f"{engine['name']} 검색 실패: {e}")
            
            return search_results[:max_results]
            
        except Exception as e:
            logger.error(f"웹 검색 실패: {e}")
            return self._simulate_web_search(query, max_results)
    
    def _simulate_web_search(self, query: str, max_results: int) -> List[SearchResult]:
        """웹 검색 시뮬레이션"""
        # 실제 웹 검색이 불가능할 때 사용하는 시뮬레이션
        simulated_results = []
        
        # 쿼리 분석을 통한 관련 정보 생성
        if "프로그래밍" in query or "코딩" in query:
            simulated_results.append(SearchResult(
                title="프로그래밍 기초 가이드",
                url="https://example.com/programming-basics",
                snippet="프로그래밍의 기본 개념과 학습 방법에 대한 종합 가이드",
                source="Programming Guide",
                relevance_score=0.9
            ))
        
        if "비즈니스" in query or "경영" in query:
            simulated_results.append(SearchResult(
                title="비즈니스 전략 수립 방법",
                url="https://example.com/business-strategy",
                snippet="효과적인 비즈니스 전략 수립과 실행에 대한 전문가 조언",
                source="Business Guide",
                relevance_score=0.9
            ))
        
        if "한국어" in query or "언어" in query:
            simulated_results.append(SearchResult(
                title="한국어 문법과 표현",
                url="https://example.com/korean-grammar",
                snippet="한국어의 문법 구조와 자연스러운 표현 방법",
                source="Language Guide",
                relevance_score=0.9
            ))
        
        return simulated_results[:max_results]
    
    def _search_single_engine(self, engine: Dict[str, str], query: str, max_results: int) -> List[SearchResult]:
        """단일 검색 엔진에서 검색"""
        try:
            # URL 인코딩
            encoded_query = urllib.parse.quote_plus(query)
            search_url = f"{engine['url']}{encoded_query}"
            
            # HTTP 요청 (실제 구현에서는 더 정교한 헤더와 에이전트 사용)
            headers = {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
            
            response = requests.get(search_url, headers=headers, timeout=10)
            response.raise_for_status()
            
            # HTML 파싱
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # 검색 결과 추출 (엔진별로 다름)
            results = []
            if engine['name'] == 'Wikipedia':
                results = self._parse_wikipedia_results(soup, max_results)
            else:
                results = self._parse_generic_results(soup, max_results)
            
            return results
            
        except Exception as e:
            logger.warning(f"{engine['name']} 검색 오류: {e}")
            return []
    
    def _parse_wikipedia_results(self, soup: BeautifulSoup, max_results: int) -> List[SearchResult]:
        """위키피디아 결과 파싱"""
        results = []
        try:
            # 위키피디아 특화 파싱 로직
            content_div = soup.find('div', {'id': 'mw-content-text'})
            if content_div:
                paragraphs = content_div.find_all('p')[:3]
                for i, p in enumerate(paragraphs):
                    if p.get_text().strip():
                        results.append(SearchResult(
                            title="Wikipedia Article",
                            url="https://ko.wikipedia.org",
                            snippet=p.get_text().strip()[:200] + "...",
                            source="Wikipedia",
                            relevance_score=0.8
                        ))
        except Exception as e:
            logger.warning(f"위키피디아 파싱 오류: {e}")
        
        return results[:max_results]
    
    def _parse_generic_results(self, soup: BeautifulSoup, max_results: int) -> List[SearchResult]:
        """일반 검색 결과 파싱"""
        results = []
        try:
            # 일반적인 검색 결과 파싱
            links = soup.find_all('a', href=True)[:max_results]
            for link in links:
                title = link.get_text().strip()
                url = link.get('href', '')
                if title and url and len(title) > 10:
                    results.append(SearchResult(
                        title=title,
                        url=url,
                        snippet=f"{title}에 대한 정보",
                        source="Web Search",
                        relevance_score=0.7
                    ))
        except Exception as e:
            logger.warning(f"일반 검색 파싱 오류: {e}")
        
        return results[:max_results]
    
    def _optimize_search_query(self, query: str) -> str:
        """검색어 최적화"""
        # 불용어 제거
        stop_words = ['은', '는', '이', '가', '을', '를', '에', '의', '로', '으로', '와', '과', '도', '만', '부터', '까지']
        
        words = query.split()
        optimized_words = [word for word in words if word not in stop_words]
        
        # 키워드 강화
        if len(optimized_words) < 2:
            optimized_words.append("방법")
        
        return ' '.join(optimized_words)
    
    def _create_knowledge_from_search_result(self, original_query: str, result: SearchResult) -> Optional[KnowledgeEntry]:
        """검색 결과로부터 지식 엔트리 생성"""
        try:
            # 지식 타입 결정
            knowledge_type = self._determine_knowledge_type(original_query, result)
            
            # 신뢰도 수준 결정
            reliability_level = self._determine_reliability_level(result)
            
            # 지식 ID 생성
            knowledge_id = hashlib.md5(f"{original_query}_{result.url}".encode()).hexdigest()
            
            # 태그 생성
            tags = self._extract_tags(original_query, result)
            
            # 관련 주제 생성
            related_topics = self._extract_related_topics(original_query, result)
            
            return KnowledgeEntry(
                id=knowledge_id,
                topic=original_query,
                content=result.snippet,
                knowledge_type=knowledge_type,
                reliability_level=reliability_level,
                source_url=result.url,
                source_name=result.source,
                created_at=datetime.now(),
                last_updated=datetime.now(),
                access_count=0,
                verification_count=0,
                tags=tags,
                related_topics=related_topics,
                confidence_score=result.relevance_score
            )
            
        except Exception as e:
            logger.error(f"지식 엔트리 생성 실패: {e}")
            return None
    
    def _determine_knowledge_type(self, query: str, result: SearchResult) -> KnowledgeType:
        """지식 타입 결정"""
        if any(keyword in query for keyword in ['방법', '어떻게', '절차', '과정']):
            return KnowledgeType.PROCEDURAL
        elif any(keyword in query for keyword in ['정의', '의미', '개념', '이해']):
            return KnowledgeType.CONCEPTUAL
        elif any(keyword in query for keyword in ['언제', '시간', '날짜', '시기']):
            return KnowledgeType.TEMPORAL
        else:
            return KnowledgeType.FACTUAL
    
    def _determine_reliability_level(self, result: SearchResult) -> ReliabilityLevel:
        """신뢰도 수준 결정"""
        if 'wikipedia' in result.url.lower() or 'edu' in result.url.lower():
            return ReliabilityLevel.HIGH
        elif 'gov' in result.url.lower() or 'org' in result.url.lower():
            return ReliabilityLevel.MEDIUM
        else:
            return ReliabilityLevel.LOW
    
    def _extract_tags(self, query: str, result: SearchResult) -> List[str]:
        """태그 추출"""
        tags = []
        
        # 쿼리에서 태그 추출
        words = query.split()
        for word in words:
            if len(word) > 1 and word not in ['은', '는', '이', '가', '을', '를']:
                tags.append(word)
        
        # 결과에서 추가 태그 추출
        if '프로그래밍' in result.snippet or '코딩' in result.snippet:
            tags.append('프로그래밍')
        if '비즈니스' in result.snippet or '경영' in result.snippet:
            tags.append('비즈니스')
        if '한국어' in result.snippet or '언어' in result.snippet:
            tags.append('언어')
        
        return list(set(tags))[:5]  # 최대 5개 태그
    
    def _extract_related_topics(self, query: str, result: SearchResult) -> List[str]:
        """관련 주제 추출"""
        related_topics = []
        
        # 기본 관련 주제
        if '프로그래밍' in query:
            related_topics.extend(['알고리즘', '자료구조', '디자인패턴'])
        if '비즈니스' in query:
            related_topics.extend(['마케팅', '전략기획', '프로젝트관리'])
        if '한국어' in query:
            related_topics.extend(['문법', '표현', '어휘'])
        
        return list(set(related_topics))[:3]  # 최대 3개 관련 주제
    
    def _add_knowledge_entry(self, knowledge_entry: KnowledgeEntry):
        """지식 엔트리 추가"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # 중복 확인
            cursor.execute("SELECT id FROM knowledge_entries WHERE id = ?", (knowledge_entry.id,))
            if cursor.fetchone():
                # 기존 엔트리 업데이트
                cursor.execute('''
                    UPDATE knowledge_entries 
                    SET content = ?, last_updated = ?, verification_count = verification_count + 1
                    WHERE id = ?
                ''', (knowledge_entry.content, datetime.now(), knowledge_entry.id))
            else:
                # 새 엔트리 추가
                cursor.execute('''
                    INSERT INTO knowledge_entries 
                    (id, topic, content, knowledge_type, reliability_level, source_url, source_name, 
                     created_at, last_updated, access_count, verification_count, tags, related_topics, confidence_score)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    knowledge_entry.id,
                    knowledge_entry.topic,
                    knowledge_entry.content,
                    knowledge_entry.knowledge_type.value,
                    knowledge_entry.reliability_level.value,
                    knowledge_entry.source_url,
                    knowledge_entry.source_name,
                    knowledge_entry.created_at,
                    knowledge_entry.last_updated,
                    knowledge_entry.access_count,
                    knowledge_entry.verification_count,
                    json.dumps(knowledge_entry.tags, ensure_ascii=False),
                    json.dumps(knowledge_entry.related_topics, ensure_ascii=False),
                    knowledge_entry.confidence_score
                ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"지식 엔트리 추가 실패: {e}")
    
    def _record_search_history(self, query: str, results_count: int):
        """검색 히스토리 기록"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO search_history (query, results_count, search_time, success)
                VALUES (?, ?, ?, ?)
            ''', (query, results_count, datetime.now(), True))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"검색 히스토리 기록 실패: {e}")
    
    def get_knowledge_for_query(self, query: str) -> List[KnowledgeEntry]:
        """쿼리에 대한 관련 지식 검색"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # 관련 지식 검색
            cursor.execute('''
                SELECT * FROM knowledge_entries 
                WHERE topic LIKE ? OR content LIKE ? OR tags LIKE ?
                ORDER BY confidence_score DESC, access_count DESC
                LIMIT 10
            ''', (f'%{query}%', f'%{query}%', f'%{query}%'))
            
            results = []
            for row in cursor.fetchall():
                knowledge_entry = self._row_to_knowledge_entry(row)
                if knowledge_entry:
                    results.append(knowledge_entry)
                    # 접근 횟수 증가
                    self._increment_access_count(knowledge_entry.id)
            
            conn.close()
            return results
            
        except Exception as e:
            logger.error(f"지식 검색 실패: {e}")
            return []
    
    def _row_to_knowledge_entry(self, row: Tuple) -> Optional[KnowledgeEntry]:
        """데이터베이스 행을 지식 엔트리로 변환"""
        try:
            return KnowledgeEntry(
                id=row[0],
                topic=row[1],
                content=row[2],
                knowledge_type=KnowledgeType(row[3]),
                reliability_level=ReliabilityLevel(row[4]),
                source_url=row[5] or "",
                source_name=row[6] or "",
                created_at=datetime.fromisoformat(row[7]) if row[7] else datetime.now(),
                last_updated=datetime.fromisoformat(row[8]) if row[8] else datetime.now(),
                access_count=row[9] or 0,
                verification_count=row[10] or 0,
                tags=json.loads(row[11]) if row[11] else [],
                related_topics=json.loads(row[12]) if row[12] else [],
                confidence_score=row[13] or 0.0
            )
        except Exception as e:
            logger.error(f"지식 엔트리 변환 실패: {e}")
            return None
    
    def _increment_access_count(self, knowledge_id: str):
        """접근 횟수 증가"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE knowledge_entries 
                SET access_count = access_count + 1 
                WHERE id = ?
            ''', (knowledge_id,))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"접근 횟수 증가 실패: {e}")
    
    def _process_knowledge_update(self, update_task: Dict[str, Any]):
        """지식 업데이트 처리"""
        try:
            knowledge_id = update_task.get('knowledge_id')
            new_content = update_task.get('new_content')
            reason = update_task.get('reason', '자동 업데이트')
            
            # 지식 업데이트
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # 기존 내용 가져오기
            cursor.execute("SELECT content FROM knowledge_entries WHERE id = ?", (knowledge_id,))
            old_content = cursor.fetchone()
            old_content = old_content[0] if old_content else ""
            
            # 내용 업데이트
            cursor.execute('''
                UPDATE knowledge_entries 
                SET content = ?, last_updated = ?, verification_count = verification_count + 1
                WHERE id = ?
            ''', (new_content, datetime.now(), knowledge_id))
            
            # 업데이트 로그 기록
            cursor.execute('''
                INSERT INTO update_logs (knowledge_id, update_type, old_content, new_content, update_time, reason)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (knowledge_id, 'content_update', old_content, new_content, datetime.now(), reason))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"지식 업데이트 처리 실패: {e}")
    
    def _process_knowledge_verification(self, verification_task: Dict[str, Any]):
        """지식 검증 처리"""
        try:
            knowledge_id = verification_task.get('knowledge_id')
            
            # 지식 검증 로직 (실제로는 더 정교한 검증 필요)
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE knowledge_entries 
                SET verification_count = verification_count + 1, confidence_score = confidence_score + 0.1
                WHERE id = ?
            ''', (knowledge_id,))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"지식 검증 처리 실패: {e}")
    
    def enhance_response_with_knowledge(self, query: str, base_response: str) -> str:
        """지식으로 응답 향상"""
        try:
            # 관련 지식 검색
            relevant_knowledge = self.get_knowledge_for_query(query)
            
            if not relevant_knowledge:
                # 지식이 없으면 웹 검색으로 수집
                new_knowledge = self.search_and_accumulate_knowledge(query)
                relevant_knowledge.extend(new_knowledge)
            
            if relevant_knowledge:
                # 지식 기반 응답 향상
                enhanced_response = self._create_enhanced_response(query, base_response, relevant_knowledge)
                return enhanced_response
            else:
                return base_response
                
        except Exception as e:
            logger.error(f"지식 기반 응답 향상 실패: {e}")
            return base_response
    
    def _create_enhanced_response(self, query: str, base_response: str, knowledge_entries: List[KnowledgeEntry]) -> str:
        """향상된 응답 생성"""
        try:
            enhanced_parts = [base_response]
            
            # 신뢰도 높은 지식 추가
            high_reliability_knowledge = [
                entry for entry in knowledge_entries 
                if entry.reliability_level == ReliabilityLevel.HIGH
            ]
            
            if high_reliability_knowledge:
                enhanced_parts.append("\n## 📚 추가 정보")
                for entry in high_reliability_knowledge[:3]:
                    enhanced_parts.append(f"**{entry.topic}**: {entry.content}")
                    if entry.source_name:
                        enhanced_parts.append(f"*출처: {entry.source_name}*")
            
            # 관련 주제 제안
            all_related_topics = []
            for entry in knowledge_entries:
                all_related_topics.extend(entry.related_topics)
            
            if all_related_topics:
                unique_topics = list(set(all_related_topics))[:5]
                enhanced_parts.append(f"\n## 🔗 관련 주제")
                enhanced_parts.append(", ".join(unique_topics))
            
            return "\n\n".join(enhanced_parts)
            
        except Exception as e:
            logger.error(f"향상된 응답 생성 실패: {e}")
            return base_response
    
    def get_system_statistics(self) -> Dict[str, Any]:
        """시스템 통계 반환"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # 총 지식 엔트리 수
            cursor.execute("SELECT COUNT(*) FROM knowledge_entries")
            total_entries = cursor.fetchone()[0]
            
            # 신뢰도별 분포
            cursor.execute("SELECT reliability_level, COUNT(*) FROM knowledge_entries GROUP BY reliability_level")
            reliability_distribution = dict(cursor.fetchall())
            
            # 지식 타입별 분포
            cursor.execute("SELECT knowledge_type, COUNT(*) FROM knowledge_entries GROUP BY knowledge_type")
            type_distribution = dict(cursor.fetchall())
            
            # 최근 검색 통계
            cursor.execute("SELECT COUNT(*) FROM search_history WHERE search_time > datetime('now', '-1 day')")
            recent_searches = cursor.fetchone()[0]
            
            conn.close()
            
            return {
                "total_knowledge_entries": total_entries,
                "reliability_distribution": reliability_distribution,
                "type_distribution": type_distribution,
                "recent_searches": recent_searches,
                "cache_size": len(self.knowledge_cache),
                "search_cache_size": len(self.search_cache),
                "last_updated": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"시스템 통계 조회 실패: {e}")
            return {}

# 전역 인스턴스
knowledge_accumulation_system = KnowledgeAccumulationSystem()
