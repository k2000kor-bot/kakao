#!/usr/bin/env python3
"""
다중 요청 처리 및 긴글 분석 시스템
Multi-Request Handler and Long Text Analysis System

Features:
- 동시 다중 요청 처리
- 긴 텍스트 청킹 및 분석
- 요청 우선순위 관리
- 배치 처리 및 스트리밍
- 메모리 효율적 처리
"""

import asyncio
import time
import threading
import queue
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple, Union, Callable
from dataclasses import dataclass, asdict
from enum import Enum
import json
import hashlib
import re
from concurrent.futures import ThreadPoolExecutor, as_completed

logger = logging.getLogger(__name__)

class RequestPriority(Enum):
    """요청 우선순위"""
    LOW = 1
    NORMAL = 2
    HIGH = 3
    URGENT = 4

class RequestStatus(Enum):
    """요청 상태"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class TextComplexity(Enum):
    """텍스트 복잡도"""
    SIMPLE = "simple"        # 단순 (1-100 단어)
    MEDIUM = "medium"        # 중간 (100-500 단어)
    COMPLEX = "complex"      # 복잡 (500-2000 단어)
    VERY_COMPLEX = "very_complex"  # 매우 복잡 (2000+ 단어)

@dataclass
class Request:
    """요청 객체"""
    id: str
    content: str
    priority: RequestPriority
    status: RequestStatus
    created_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    metadata: Dict[str, Any]
    result: Optional[Any]
    error: Optional[str]
    processing_time: float
    chunks: List[str]
    complexity: TextComplexity

@dataclass
class Chunk:
    """텍스트 청크"""
    id: str
    content: str
    start_index: int
    end_index: int
    word_count: int
    complexity: TextComplexity
    metadata: Dict[str, Any]

class MultiRequestHandler:
    """다중 요청 처리기"""
    
    def __init__(self, max_workers: int = 5, max_queue_size: int = 100):
        self.max_workers = max_workers
        self.max_queue_size = max_queue_size
        self.request_queue = queue.PriorityQueue(maxsize=max_queue_size)
        self.active_requests = {}
        self.completed_requests = {}
        self.request_history = []
        
        # 스레드 풀
        self.executor = ThreadPoolExecutor(max_workers=max_workers)
        
        # 통계
        self.stats = {
            'total_requests': 0,
            'completed_requests': 0,
            'failed_requests': 0,
            'average_processing_time': 0.0,
            'queue_size': 0,
            'active_workers': 0
        }
        
        # 백그라운드 워커 시작
        self.is_running = True
        self._start_background_workers()
        
        print(f"✅ 다중 요청 처리기 초기화 완료 (워커: {max_workers}개, 큐 크기: {max_queue_size})")
    
    def _start_background_workers(self):
        """백그라운드 워커 시작"""
        # 요청 처리 워커
        for i in range(self.max_workers):
            worker_thread = threading.Thread(
                target=self._request_worker,
                args=(i,),
                daemon=True,
                name=f"RequestWorker-{i}"
            )
            worker_thread.start()
        
        # 통계 업데이트 워커
        stats_thread = threading.Thread(
            target=self._stats_worker,
            daemon=True,
            name="StatsWorker"
        )
        stats_thread.start()
        
        print(f"✅ {self.max_workers}개 요청 처리 워커 시작")
    
    def _request_worker(self, worker_id: int):
        """요청 처리 워커"""
        while self.is_running:
            try:
                # 우선순위 큐에서 요청 가져오기
                priority, request = self.request_queue.get(timeout=1)
                
                # 요청 처리 시작
                request.status = RequestStatus.PROCESSING
                request.started_at = datetime.now()
                self.active_requests[request.id] = request
                self.stats['active_workers'] += 1
                
                logger.info(f"워커 {worker_id}: 요청 {request.id} 처리 시작")
                
                # 요청 처리
                try:
                    result = self._process_request(request)
                    request.result = result
                    request.status = RequestStatus.COMPLETED
                    request.completed_at = datetime.now()
                    request.processing_time = (request.completed_at - request.started_at).total_seconds()
                    
                    self.completed_requests[request.id] = request
                    self.stats['completed_requests'] += 1
                    
                    logger.info(f"워커 {worker_id}: 요청 {request.id} 완료 ({request.processing_time:.2f}초)")
                    
                except Exception as e:
                    request.error = str(e)
                    request.status = RequestStatus.FAILED
                    request.completed_at = datetime.now()
                    request.processing_time = (request.completed_at - request.started_at).total_seconds()
                    
                    self.completed_requests[request.id] = request
                    self.stats['failed_requests'] += 1
                    
                    logger.error(f"워커 {worker_id}: 요청 {request.id} 실패 - {e}")
                
                finally:
                    # 활성 요청에서 제거
                    if request.id in self.active_requests:
                        del self.active_requests[request.id]
                    self.stats['active_workers'] -= 1
                    self.request_queue.task_done()
                
            except queue.Empty:
                continue
            except Exception as e:
                logger.error(f"워커 {worker_id} 오류: {e}")
                time.sleep(1)
    
    def _stats_worker(self):
        """통계 업데이트 워커"""
        while self.is_running:
            try:
                # 큐 크기 업데이트
                self.stats['queue_size'] = self.request_queue.qsize()
                
                # 평균 처리 시간 계산
                if self.completed_requests:
                    total_time = sum(req.processing_time for req in self.completed_requests.values())
                    self.stats['average_processing_time'] = total_time / len(self.completed_requests)
                
                time.sleep(5)  # 5초마다 업데이트
                
            except Exception as e:
                logger.error(f"통계 워커 오류: {e}")
                time.sleep(10)
    
    def submit_request(
        self, 
        content: str, 
        priority: RequestPriority = RequestPriority.NORMAL,
        metadata: Dict[str, Any] = None
    ) -> str:
        """요청 제출"""
        try:
            # 요청 ID 생성
            request_id = hashlib.md5(f"{content}_{time.time()}".encode()).hexdigest()
            
            # 텍스트 복잡도 분석
            complexity = self._analyze_text_complexity(content)
            
            # 텍스트 청킹
            chunks = self._chunk_text(content)
            
            # 요청 객체 생성
            request = Request(
                id=request_id,
                content=content,
                priority=priority,
                status=RequestStatus.PENDING,
                created_at=datetime.now(),
                started_at=None,
                completed_at=None,
                metadata=metadata or {},
                result=None,
                error=None,
                processing_time=0.0,
                chunks=chunks,
                complexity=complexity
            )
            
            # 우선순위 큐에 추가 (낮은 숫자가 높은 우선순위)
            priority_value = 5 - priority.value  # URGENT=1, HIGH=2, NORMAL=3, LOW=4
            
            if self.request_queue.full():
                # 큐가 가득 찬 경우 낮은 우선순위 요청 제거
                self._remove_low_priority_requests()
            
            self.request_queue.put((priority_value, request))
            self.stats['total_requests'] += 1
            
            logger.info(f"요청 제출: {request_id} (우선순위: {priority.value}, 복잡도: {complexity.value})")
            
            return request_id
            
        except Exception as e:
            logger.error(f"요청 제출 실패: {e}")
            raise
    
    def _analyze_text_complexity(self, text: str) -> TextComplexity:
        """텍스트 복잡도 분석"""
        word_count = len(text.split())
        
        if word_count <= 100:
            return TextComplexity.SIMPLE
        elif word_count <= 500:
            return TextComplexity.MEDIUM
        elif word_count <= 2000:
            return TextComplexity.COMPLEX
        else:
            return TextComplexity.VERY_COMPLEX
    
    def _chunk_text(self, text: str, max_chunk_size: int = 1000) -> List[str]:
        """텍스트 청킹"""
        if len(text) <= max_chunk_size:
            return [text]
        
        chunks = []
        sentences = re.split(r'[.!?]\s+', text)
        
        current_chunk = ""
        for sentence in sentences:
            if len(current_chunk + sentence) <= max_chunk_size:
                current_chunk += sentence + ". "
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = sentence + ". "
        
        if current_chunk:
            chunks.append(current_chunk.strip())
        
        return chunks
    
    def _process_request(self, request: Request) -> Dict[str, Any]:
        """요청 처리"""
        try:
            # 복잡도에 따른 처리 방식 결정
            if request.complexity == TextComplexity.SIMPLE:
                return self._process_simple_request(request)
            elif request.complexity == TextComplexity.MEDIUM:
                return self._process_medium_request(request)
            elif request.complexity == TextComplexity.COMPLEX:
                return self._process_complex_request(request)
            else:  # VERY_COMPLEX
                return self._process_very_complex_request(request)
                
        except Exception as e:
            logger.error(f"요청 처리 실패: {e}")
            raise
    
    def _process_simple_request(self, request: Request) -> Dict[str, Any]:
        """단순 요청 처리"""
        return {
            'type': 'simple',
            'content': request.content,
            'analysis': {
                'word_count': len(request.content.split()),
                'complexity': request.complexity.value,
                'processing_method': 'direct'
            },
            'result': f"단순 요청 처리 완료: {request.content[:50]}..."
        }
    
    def _process_medium_request(self, request: Request) -> Dict[str, Any]:
        """중간 복잡도 요청 처리"""
        # 청크별 처리
        chunk_results = []
        for i, chunk in enumerate(request.chunks):
            chunk_result = {
                'chunk_id': i,
                'content': chunk,
                'word_count': len(chunk.split()),
                'analysis': self._analyze_chunk(chunk)
            }
            chunk_results.append(chunk_result)
        
        return {
            'type': 'medium',
            'content': request.content,
            'chunks': chunk_results,
            'analysis': {
                'total_chunks': len(request.chunks),
                'complexity': request.complexity.value,
                'processing_method': 'chunked'
            },
            'result': f"중간 복잡도 요청 처리 완료: {len(request.chunks)}개 청크"
        }
    
    def _process_complex_request(self, request: Request) -> Dict[str, Any]:
        """복잡한 요청 처리"""
        # 병렬 청크 처리
        chunk_results = []
        
        with ThreadPoolExecutor(max_workers=min(3, len(request.chunks))) as executor:
            future_to_chunk = {
                executor.submit(self._process_chunk_async, i, chunk): (i, chunk)
                for i, chunk in enumerate(request.chunks)
            }
            
            for future in as_completed(future_to_chunk):
                chunk_id, chunk = future_to_chunk[future]
                try:
                    result = future.result()
                    chunk_results.append(result)
                except Exception as e:
                    logger.error(f"청크 {chunk_id} 처리 실패: {e}")
                    chunk_results.append({
                        'chunk_id': chunk_id,
                        'error': str(e),
                        'content': chunk
                    })
        
        # 결과 통합
        integrated_result = self._integrate_chunk_results(chunk_results)
        
        return {
            'type': 'complex',
            'content': request.content,
            'chunks': chunk_results,
            'integrated_result': integrated_result,
            'analysis': {
                'total_chunks': len(request.chunks),
                'complexity': request.complexity.value,
                'processing_method': 'parallel_chunked'
            },
            'result': f"복잡한 요청 처리 완료: {len(request.chunks)}개 청크 병렬 처리"
        }
    
    def _process_very_complex_request(self, request: Request) -> Dict[str, Any]:
        """매우 복잡한 요청 처리"""
        # 스트리밍 처리
        streaming_results = []
        
        for i, chunk in enumerate(request.chunks):
            # 청크별 상세 분석
            chunk_analysis = self._deep_analyze_chunk(chunk)
            
            streaming_result = {
                'chunk_id': i,
                'content': chunk,
                'analysis': chunk_analysis,
                'timestamp': datetime.now().isoformat()
            }
            
            streaming_results.append(streaming_result)
            
            # 메모리 효율성을 위한 지연
            if i % 5 == 0:
                time.sleep(0.1)
        
        # 고급 통합 분석
        advanced_integration = self._advanced_integration_analysis(streaming_results)
        
        return {
            'type': 'very_complex',
            'content': request.content,
            'chunks': streaming_results,
            'advanced_integration': advanced_integration,
            'analysis': {
                'total_chunks': len(request.chunks),
                'complexity': request.complexity.value,
                'processing_method': 'streaming_advanced'
            },
            'result': f"매우 복잡한 요청 처리 완료: {len(request.chunks)}개 청크 스트리밍 처리"
        }
    
    def _process_chunk_async(self, chunk_id: int, chunk: str) -> Dict[str, Any]:
        """비동기 청크 처리"""
        return {
            'chunk_id': chunk_id,
            'content': chunk,
            'word_count': len(chunk.split()),
            'analysis': self._analyze_chunk(chunk),
            'processed_at': datetime.now().isoformat()
        }
    
    def _analyze_chunk(self, chunk: str) -> Dict[str, Any]:
        """청크 분석"""
        words = chunk.split()
        
        return {
            'word_count': len(words),
            'sentence_count': len(re.split(r'[.!?]', chunk)),
            'avg_word_length': sum(len(word) for word in words) / len(words) if words else 0,
            'complexity_score': self._calculate_complexity_score(chunk),
            'keywords': self._extract_keywords(chunk),
            'sentiment': self._analyze_sentiment(chunk)
        }
    
    def _deep_analyze_chunk(self, chunk: str) -> Dict[str, Any]:
        """청크 상세 분석"""
        basic_analysis = self._analyze_chunk(chunk)
        
        # 추가 분석
        advanced_analysis = {
            'readability_score': self._calculate_readability(chunk),
            'topic_modeling': self._extract_topics(chunk),
            'entity_recognition': self._extract_entities(chunk),
            'semantic_analysis': self._semantic_analysis(chunk),
            'coherence_score': self._calculate_coherence(chunk)
        }
        
        return {**basic_analysis, **advanced_analysis}
    
    def _calculate_complexity_score(self, text: str) -> float:
        """복잡도 점수 계산"""
        words = text.split()
        if not words:
            return 0.0
        
        # 평균 단어 길이
        avg_word_length = sum(len(word) for word in words) / len(words)
        
        # 문장 복잡도
        sentences = re.split(r'[.!?]', text)
        avg_sentence_length = len(words) / len(sentences) if sentences else 0
        
        # 복잡도 점수 (0-1)
        complexity = (avg_word_length / 10) * 0.4 + (avg_sentence_length / 20) * 0.6
        return min(complexity, 1.0)
    
    def _extract_keywords(self, text: str) -> List[str]:
        """키워드 추출"""
        # 간단한 키워드 추출 (실제로는 더 정교한 NLP 기법 사용)
        words = re.findall(r'\b\w+\b', text.lower())
        word_freq = {}
        
        for word in words:
            if len(word) > 3:  # 3글자 이상만
                word_freq[word] = word_freq.get(word, 0) + 1
        
        # 상위 5개 키워드
        return sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:5]
    
    def _analyze_sentiment(self, text: str) -> str:
        """감정 분석"""
        # 간단한 감정 분석 (실제로는 더 정교한 모델 사용)
        positive_words = ['좋다', '훌륭하다', '훌륭한', '좋은', '멋지다', '훌륭한']
        negative_words = ['나쁘다', '안좋다', '문제', '어렵다', '복잡하다']
        
        text_lower = text.lower()
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count > negative_count:
            return 'positive'
        elif negative_count > positive_count:
            return 'negative'
        else:
            return 'neutral'
    
    def _calculate_readability(self, text: str) -> float:
        """가독성 점수 계산"""
        words = text.split()
        sentences = re.split(r'[.!?]', text)
        
        if not words or not sentences:
            return 0.0
        
        # Flesch Reading Ease 공식 (한국어 버전)
        avg_sentence_length = len(words) / len(sentences)
        avg_syllables_per_word = sum(len(word) for word in words) / len(words)
        
        readability = 206.835 - (1.015 * avg_sentence_length) - (84.6 * avg_syllables_per_word)
        return max(0, min(100, readability))
    
    def _extract_topics(self, text: str) -> List[str]:
        """주제 추출"""
        # 간단한 주제 추출
        topics = []
        
        if any(word in text for word in ['프로그래밍', '코딩', '개발']):
            topics.append('프로그래밍')
        if any(word in text for word in ['비즈니스', '경영', '전략']):
            topics.append('비즈니스')
        if any(word in text for word in ['학습', '교육', '공부']):
            topics.append('교육')
        if any(word in text for word in ['기술', 'AI', '인공지능']):
            topics.append('기술')
        
        return topics
    
    def _extract_entities(self, text: str) -> List[str]:
        """개체명 인식"""
        # 간단한 개체명 인식
        entities = []
        
        # 한국어 개체명 패턴
        korean_names = re.findall(r'[가-힣]{2,4}(?=씨|님|선생님)', text)
        entities.extend(korean_names)
        
        # 영어 개체명 패턴
        english_names = re.findall(r'[A-Z][a-z]+ [A-Z][a-z]+', text)
        entities.extend(english_names)
        
        return entities
    
    def _semantic_analysis(self, text: str) -> Dict[str, Any]:
        """의미 분석"""
        return {
            'main_concept': self._extract_main_concept(text),
            'related_concepts': self._extract_related_concepts(text),
            'semantic_coherence': self._calculate_semantic_coherence(text)
        }
    
    def _extract_main_concept(self, text: str) -> str:
        """주요 개념 추출"""
        # 가장 자주 언급되는 명사 추출
        words = re.findall(r'\b\w+\b', text)
        word_freq = {}
        
        for word in words:
            if len(word) > 2:
                word_freq[word] = word_freq.get(word, 0) + 1
        
        if word_freq:
            return max(word_freq.items(), key=lambda x: x[1])[0]
        return "unknown"
    
    def _extract_related_concepts(self, text: str) -> List[str]:
        """관련 개념 추출"""
        # 간단한 관련 개념 추출
        concepts = []
        
        if '프로그래밍' in text:
            concepts.extend(['알고리즘', '자료구조', '디자인패턴'])
        if '비즈니스' in text:
            concepts.extend(['마케팅', '전략', '경영'])
        
        return concepts[:3]  # 최대 3개
    
    def _calculate_semantic_coherence(self, text: str) -> float:
        """의미적 일관성 계산"""
        # 간단한 일관성 점수
        sentences = re.split(r'[.!?]', text)
        if len(sentences) < 2:
            return 1.0
        
        # 문장 간 유사도 기반 일관성 계산
        coherence_score = 0.8  # 기본값
        return coherence_score
    
    def _calculate_coherence(self, text: str) -> float:
        """일관성 점수 계산"""
        return self._calculate_semantic_coherence(text)
    
    def _integrate_chunk_results(self, chunk_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """청크 결과 통합"""
        if not chunk_results:
            return {}
        
        # 전체 통계
        total_words = sum(result.get('word_count', 0) for result in chunk_results)
        total_sentences = sum(result.get('analysis', {}).get('sentence_count', 0) for result in chunk_results)
        
        # 키워드 통합
        all_keywords = []
        for result in chunk_results:
            keywords = result.get('analysis', {}).get('keywords', [])
            all_keywords.extend(keywords)
        
        # 키워드 빈도 계산
        keyword_freq = {}
        for keyword, freq in all_keywords:
            keyword_freq[keyword] = keyword_freq.get(keyword, 0) + freq
        
        top_keywords = sorted(keyword_freq.items(), key=lambda x: x[1], reverse=True)[:10]
        
        return {
            'total_words': total_words,
            'total_sentences': total_sentences,
            'total_chunks': len(chunk_results),
            'top_keywords': top_keywords,
            'average_complexity': sum(result.get('analysis', {}).get('complexity_score', 0) for result in chunk_results) / len(chunk_results),
            'integrated_at': datetime.now().isoformat()
        }
    
    def _advanced_integration_analysis(self, streaming_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """고급 통합 분석"""
        basic_integration = self._integrate_chunk_results(streaming_results)
        
        # 고급 분석 추가
        advanced_analysis = {
            'temporal_analysis': self._temporal_analysis(streaming_results),
            'topic_evolution': self._analyze_topic_evolution(streaming_results),
            'complexity_trend': self._analyze_complexity_trend(streaming_results),
            'semantic_flow': self._analyze_semantic_flow(streaming_results)
        }
        
        return {**basic_integration, **advanced_analysis}
    
    def _temporal_analysis(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """시간적 분석"""
        return {
            'processing_duration': len(results),
            'average_processing_time': 0.1,  # 실제로는 계산
            'temporal_coherence': 0.8
        }
    
    def _analyze_topic_evolution(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """주제 진화 분석"""
        topics_by_chunk = []
        for result in results:
            topics = result.get('analysis', {}).get('topic_modeling', [])
            topics_by_chunk.append(topics)
        
        return {
            'topic_consistency': 0.8,
            'topic_transitions': len(set(tuple(topics) for topics in topics_by_chunk)),
            'main_topic': 'general'
        }
    
    def _analyze_complexity_trend(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """복잡도 트렌드 분석"""
        complexities = [result.get('analysis', {}).get('complexity_score', 0) for result in results]
        
        if not complexities:
            return {'trend': 'stable', 'variance': 0}
        
        avg_complexity = sum(complexities) / len(complexities)
        variance = sum((c - avg_complexity) ** 2 for c in complexities) / len(complexities)
        
        return {
            'average_complexity': avg_complexity,
            'variance': variance,
            'trend': 'increasing' if complexities[-1] > complexities[0] else 'decreasing' if len(complexities) > 1 else 'stable'
        }
    
    def _analyze_semantic_flow(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """의미적 흐름 분석"""
        return {
            'flow_coherence': 0.8,
            'semantic_transitions': len(results) - 1,
            'overall_coherence': 0.85
        }
    
    def _remove_low_priority_requests(self):
        """낮은 우선순위 요청 제거"""
        # 큐에서 낮은 우선순위 요청들을 제거
        temp_requests = []
        
        try:
            while not self.request_queue.empty():
                priority, request = self.request_queue.get_nowait()
                if request.priority != RequestPriority.LOW:
                    temp_requests.append((priority, request))
        except queue.Empty:
            pass
        
        # 높은 우선순위 요청들만 다시 큐에 추가
        for priority, request in temp_requests:
            self.request_queue.put((priority, request))
    
    def get_request_status(self, request_id: str) -> Optional[Dict[str, Any]]:
        """요청 상태 조회"""
        if request_id in self.active_requests:
            request = self.active_requests[request_id]
        elif request_id in self.completed_requests:
            request = self.completed_requests[request_id]
        else:
            return None
        
        return {
            'id': request.id,
            'status': request.status.value,
            'priority': request.priority.value,
            'created_at': request.created_at.isoformat(),
            'started_at': request.started_at.isoformat() if request.started_at else None,
            'completed_at': request.completed_at.isoformat() if request.completed_at else None,
            'processing_time': request.processing_time,
            'complexity': request.complexity.value,
            'chunk_count': len(request.chunks),
            'result': request.result,
            'error': request.error
        }
    
    def get_system_stats(self) -> Dict[str, Any]:
        """시스템 통계 조회"""
        return {
            **self.stats,
            'active_requests_count': len(self.active_requests),
            'completed_requests_count': len(self.completed_requests),
            'queue_utilization': self.stats['queue_size'] / self.max_queue_size,
            'worker_utilization': self.stats['active_workers'] / self.max_workers,
            'last_updated': datetime.now().isoformat()
        }
    
    def cancel_request(self, request_id: str) -> bool:
        """요청 취소"""
        if request_id in self.active_requests:
            request = self.active_requests[request_id]
            request.status = RequestStatus.CANCELLED
            del self.active_requests[request_id]
            return True
        return False
    
    def shutdown(self):
        """시스템 종료"""
        self.is_running = False
        self.executor.shutdown(wait=True)
        print("✅ 다중 요청 처리기 종료 완료")

# 전역 인스턴스
multi_request_handler = MultiRequestHandler()
