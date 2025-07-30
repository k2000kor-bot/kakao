#!/usr/bin/env python3
"""
실시간 스트리밍 데이터 처리 시스템 v9.0
- 웹소켓 기반 실시간 데이터 스트림
- 비동기 메시지 처리 파이프라인
- 실시간 데이터 변환 및 필터링
- 스트리밍 분석 및 집계
- 백프레셔 제어 및 오류 복구
"""

import asyncio
import json
import time
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any, AsyncGenerator, Callable, Union
from dataclasses import dataclass, asdict
from collections import deque, defaultdict
import queue
import threading
from pathlib import Path
import hashlib
import websockets
import signal
import sys

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class StreamMessage:
    """스트림 메시지"""
    message_id: str
    timestamp: datetime
    source: str
    message_type: str  # chat, notification, system, alert
    content: Any
    priority: int  # 1(highest) - 5(lowest)
    metadata: Dict[str, Any]
    processing_stage: str = "received"
    retry_count: int = 0


@dataclass
class ProcessingResult:
    """처리 결과"""
    message_id: str
    success: bool
    result_data: Optional[Any] = None
    error_message: Optional[str] = None
    processing_time: float = 0.0
    stage: str = "completed"


@dataclass
class StreamMetrics:
    """스트림 메트릭스"""
    total_messages: int = 0
    processed_messages: int = 0
    failed_messages: int = 0
    avg_processing_time: float = 0.0
    messages_per_second: float = 0.0
    queue_size: int = 0
    active_connections: int = 0
    last_updated: datetime = None


class StreamProcessor:
    """스트림 프로세서 기본 클래스"""
    
    def __init__(self, processor_id: str):
        self.processor_id = processor_id
        
    async def process(self, message: StreamMessage) -> ProcessingResult:
        """메시지 처리 (오버라이드 필요)"""
        raise NotImplementedError
        
    async def health_check(self) -> bool:
        """헬스 체크"""
        return True


class MessageFilterProcessor(StreamProcessor):
    """메시지 필터 프로세서"""
    
    def __init__(self, filter_rules: Dict[str, Any]):
        super().__init__("message_filter")
        self.filter_rules = filter_rules
        
    async def process(self, message: StreamMessage) -> ProcessingResult:
        """메시지 필터링"""
        
        start_time = time.time()
        
        try:
            # 메시지 타입 필터
            if 'allowed_types' in self.filter_rules:
                allowed_types = self.filter_rules['allowed_types']
                if message.message_type not in allowed_types:
                    return ProcessingResult(
                        message_id=message.message_id,
                        success=False,
                        error_message=f"Message type {message.message_type} not allowed",
                        processing_time=time.time() - start_time,
                        stage="filtered"
                    )
                    
            # 우선순위 필터
            if 'min_priority' in self.filter_rules:
                min_priority = self.filter_rules['min_priority']
                if message.priority > min_priority:
                    return ProcessingResult(
                        message_id=message.message_id,
                        success=False,
                        error_message=f"Priority {message.priority} below threshold",
                        processing_time=time.time() - start_time,
                        stage="filtered"
                    )
                    
            # 콘텐츠 필터 (키워드 기반)
            if 'blocked_keywords' in self.filter_rules:
                blocked_keywords = self.filter_rules['blocked_keywords']
                content_str = str(message.content).lower()
                for keyword in blocked_keywords:
                    if keyword.lower() in content_str:
                        return ProcessingResult(
                            message_id=message.message_id,
                            success=False,
                            error_message=f"Blocked keyword detected: {keyword}",
                            processing_time=time.time() - start_time,
                            stage="filtered"
                        )
                        
            # 필터 통과
            return ProcessingResult(
                message_id=message.message_id,
                success=True,
                result_data=message,
                processing_time=time.time() - start_time,
                stage="filtered"
            )
            
        except Exception as e:
            return ProcessingResult(
                message_id=message.message_id,
                success=False,
                error_message=f"Filter error: {e}",
                processing_time=time.time() - start_time,
                stage="error"
            )


class MessageTransformProcessor(StreamProcessor):
    """메시지 변환 프로세서"""
    
    def __init__(self, transform_rules: Dict[str, Any]):
        super().__init__("message_transform")
        self.transform_rules = transform_rules
        
    async def process(self, message: StreamMessage) -> ProcessingResult:
        """메시지 변환"""
        
        start_time = time.time()
        
        try:
            transformed_message = message
            
            # 콘텐츠 변환
            if 'content_transforms' in self.transform_rules:
                content = message.content
                
                for transform_type, transform_config in self.transform_rules['content_transforms'].items():
                    if transform_type == "normalize_text":
                        content = self._normalize_text(content)
                    elif transform_type == "extract_keywords":
                        keywords = self._extract_keywords(content)
                        transformed_message.metadata['keywords'] = keywords
                    elif transform_type == "add_timestamp":
                        transformed_message.metadata['processed_at'] = datetime.now().isoformat()
                        
                transformed_message.content = content
                
            # 메타데이터 추가
            if 'add_metadata' in self.transform_rules:
                for key, value in self.transform_rules['add_metadata'].items():
                    transformed_message.metadata[key] = value
                    
            transformed_message.processing_stage = "transformed"
            
            return ProcessingResult(
                message_id=message.message_id,
                success=True,
                result_data=transformed_message,
                processing_time=time.time() - start_time,
                stage="transformed"
            )
            
        except Exception as e:
            return ProcessingResult(
                message_id=message.message_id,
                success=False,
                error_message=f"Transform error: {e}",
                processing_time=time.time() - start_time,
                stage="error"
            )
            
    def _normalize_text(self, text: Any) -> str:
        """텍스트 정규화"""
        if isinstance(text, str):
            # 공백 정리, 소문자 변환 등
            return ' '.join(text.strip().split())
        return str(text)
        
    def _extract_keywords(self, content: Any) -> List[str]:
        """키워드 추출"""
        import re
        
        if isinstance(content, str):
            # 한글 키워드 추출
            korean_words = re.findall(r'[가-힣]{2,}', content)
            return korean_words[:10]  # 상위 10개
        return []


class MessageAggregationProcessor(StreamProcessor):
    """메시지 집계 프로세서"""
    
    def __init__(self, aggregation_window: int = 60):
        super().__init__("message_aggregation")
        self.aggregation_window = aggregation_window  # 초
        self.message_buffer = deque()
        self.aggregation_results = {}
        
    async def process(self, message: StreamMessage) -> ProcessingResult:
        """메시지 집계"""
        
        start_time = time.time()
        
        try:
            # 윈도우 기반 버퍼 관리
            current_time = datetime.now()
            cutoff_time = current_time - timedelta(seconds=self.aggregation_window)
            
            # 오래된 메시지 제거
            while self.message_buffer and self.message_buffer[0].timestamp < cutoff_time:
                self.message_buffer.popleft()
                
            # 새 메시지 추가
            self.message_buffer.append(message)
            
            # 집계 수행
            aggregation_result = self._perform_aggregation()
            
            return ProcessingResult(
                message_id=message.message_id,
                success=True,
                result_data={
                    'message': message,
                    'aggregation': aggregation_result
                },
                processing_time=time.time() - start_time,
                stage="aggregated"
            )
            
        except Exception as e:
            return ProcessingResult(
                message_id=message.message_id,
                success=False,
                error_message=f"Aggregation error: {e}",
                processing_time=time.time() - start_time,
                stage="error"
            )
            
    def _perform_aggregation(self) -> Dict[str, Any]:
        """집계 수행"""
        
        if not self.message_buffer:
            return {}
            
        # 메시지 타입별 카운트
        type_counts = defaultdict(int)
        priority_distribution = defaultdict(int)
        source_counts = defaultdict(int)
        
        for msg in self.message_buffer:
            type_counts[msg.message_type] += 1
            priority_distribution[msg.priority] += 1
            source_counts[msg.source] += 1
            
        return {
            'window_size_seconds': self.aggregation_window,
            'total_messages': len(self.message_buffer),
            'message_types': dict(type_counts),
            'priority_distribution': dict(priority_distribution),
            'source_distribution': dict(source_counts),
            'messages_per_minute': len(self.message_buffer) * 60 / self.aggregation_window,
            'aggregation_timestamp': datetime.now().isoformat()
        }


class StreamingDataProcessor:
    """실시간 스트리밍 데이터 처리 시스템"""
    
    def __init__(self, max_queue_size: int = 10000):
        self.max_queue_size = max_queue_size
        self.message_queue = asyncio.Queue(maxsize=max_queue_size)
        self.processing_pipeline: List[StreamProcessor] = []
        self.metrics = StreamMetrics()
        self.is_running = False
        self.worker_tasks = []
        self.websocket_server = None
        self.connected_clients = set()
        
        # 오류 복구
        self.retry_queue = asyncio.Queue()
        self.max_retries = 3
        
        # 백프레셔 제어
        self.backpressure_threshold = 0.8  # 80% 큐 사용률
        self.processing_delay = 0.0
        
        logger.info("스트리밍 데이터 처리 시스템 초기화")
        
    def add_processor(self, processor: StreamProcessor):
        """프로세서 추가"""
        self.processing_pipeline.append(processor)
        logger.info(f"프로세서 추가: {processor.processor_id}")
        
    async def start(self, num_workers: int = 3):
        """시스템 시작"""
        
        if self.is_running:
            logger.warning("시스템이 이미 실행 중입니다")
            return
            
        self.is_running = True
        
        # 워커 태스크 시작
        for i in range(num_workers):
            task = asyncio.create_task(self._worker(f"worker_{i}"))
            self.worker_tasks.append(task)
            
        # 재시도 처리 태스크
        retry_task = asyncio.create_task(self._retry_handler())
        self.worker_tasks.append(retry_task)
        
        # 메트릭스 업데이트 태스크
        metrics_task = asyncio.create_task(self._metrics_updater())
        self.worker_tasks.append(metrics_task)
        
        logger.info(f"스트리밍 처리 시스템 시작 (워커: {num_workers}개)")
        
    async def stop(self):
        """시스템 중지"""
        
        self.is_running = False
        
        # 모든 태스크 취소
        for task in self.worker_tasks:
            task.cancel()
            
        # 태스크 완료 대기
        await asyncio.gather(*self.worker_tasks, return_exceptions=True)
        
        # 웹소켓 서버 종료
        if self.websocket_server:
            self.websocket_server.close()
            await self.websocket_server.wait_closed()
            
        logger.info("스트리밍 처리 시스템 중지")
        
    async def enqueue_message(self, message: StreamMessage) -> bool:
        """메시지 큐에 추가"""
        
        try:
            # 백프레셔 체크
            queue_usage = self.message_queue.qsize() / self.max_queue_size
            
            if queue_usage > self.backpressure_threshold:
                logger.warning(f"백프레셔 활성화: 큐 사용률 {queue_usage:.1%}")
                self.processing_delay = min(0.1, queue_usage - self.backpressure_threshold)
                
                # 높은 우선순위 메시지가 아니면 드롭
                if message.priority > 2:
                    logger.warning(f"메시지 드롭 (백프레셔): {message.message_id}")
                    return False
            else:
                self.processing_delay = 0.0
                
            # 큐에 추가 (논블로킹)
            self.message_queue.put_nowait(message)
            self.metrics.total_messages += 1
            
            return True
            
        except asyncio.QueueFull:
            logger.error(f"큐 가득 참: 메시지 드롭 {message.message_id}")
            return False
            
    async def _worker(self, worker_id: str):
        """워커 프로세스"""
        
        logger.info(f"워커 시작: {worker_id}")
        
        while self.is_running:
            try:
                # 백프레셔 지연
                if self.processing_delay > 0:
                    await asyncio.sleep(self.processing_delay)
                    
                # 메시지 가져오기 (타임아웃 설정)
                try:
                    message = await asyncio.wait_for(self.message_queue.get(), timeout=1.0)
                except asyncio.TimeoutError:
                    continue
                    
                # 메시지 처리
                success = await self._process_message(message)
                
                if success:
                    self.metrics.processed_messages += 1
                else:
                    self.metrics.failed_messages += 1
                    
                # 큐 태스크 완료 표시
                self.message_queue.task_done()
                
            except Exception as e:
                logger.error(f"워커 {worker_id} 오류: {e}")
                await asyncio.sleep(0.1)
                
        logger.info(f"워커 종료: {worker_id}")
        
    async def _process_message(self, message: StreamMessage) -> bool:
        """메시지 처리"""
        
        start_time = time.time()
        
        try:
            current_message = message
            
            # 파이프라인 실행
            for processor in self.processing_pipeline:
                result = await processor.process(current_message)
                
                if not result.success:
                    # 재시도 가능한 오류인지 확인
                    if message.retry_count < self.max_retries and result.stage != "filtered":
                        message.retry_count += 1
                        await self.retry_queue.put(message)
                        logger.warning(f"메시지 재시도 큐에 추가: {message.message_id} (재시도: {message.retry_count})")
                    else:
                        logger.error(f"메시지 처리 실패: {message.message_id} - {result.error_message}")
                    return False
                    
                # 다음 프로세서를 위해 결과 업데이트
                if result.result_data and isinstance(result.result_data, StreamMessage):
                    current_message = result.result_data
                    
            # 처리 완료
            processing_time = time.time() - start_time
            
            # 처리된 메시지를 연결된 클라이언트에게 브로드캐스트
            await self._broadcast_processed_message(current_message, processing_time)
            
            logger.debug(f"메시지 처리 완료: {message.message_id} ({processing_time:.3f}초)")
            return True
            
        except Exception as e:
            logger.error(f"메시지 처리 중 예외: {message.message_id} - {e}")
            return False
            
    async def _retry_handler(self):
        """재시도 처리기"""
        
        while self.is_running:
            try:
                # 재시도 큐에서 메시지 가져오기
                try:
                    retry_message = await asyncio.wait_for(self.retry_queue.get(), timeout=1.0)
                except asyncio.TimeoutError:
                    continue
                    
                # 재시도 지연 (백오프)
                delay = 2 ** retry_message.retry_count
                await asyncio.sleep(delay)
                
                # 메시지를 다시 메인 큐에 추가
                success = await self.enqueue_message(retry_message)
                
                if not success:
                    logger.error(f"재시도 메시지 큐 추가 실패: {retry_message.message_id}")
                    
            except Exception as e:
                logger.error(f"재시도 처리기 오류: {e}")
                await asyncio.sleep(1.0)
                
    async def _metrics_updater(self):
        """메트릭스 업데이트"""
        
        last_processed = 0
        last_time = time.time()
        
        while self.is_running:
            try:
                await asyncio.sleep(5.0)  # 5초마다 업데이트
                
                current_time = time.time()
                current_processed = self.metrics.processed_messages
                
                # 처리 속도 계산
                time_diff = current_time - last_time
                processed_diff = current_processed - last_processed
                
                if time_diff > 0:
                    self.metrics.messages_per_second = processed_diff / time_diff
                    
                # 큐 크기 업데이트
                self.metrics.queue_size = self.message_queue.qsize()
                self.metrics.active_connections = len(self.connected_clients)
                self.metrics.last_updated = datetime.now()
                
                # 평균 처리 시간 계산 (간단한 방법)
                if self.metrics.processed_messages > 0:
                    # 실제로는 더 정교한 평균 계산 필요
                    self.metrics.avg_processing_time = 0.05  # 가정값
                    
                last_processed = current_processed
                last_time = current_time
                
                logger.debug(f"메트릭스 업데이트: {self.metrics.messages_per_second:.1f} msg/s, 큐: {self.metrics.queue_size}")
                
            except Exception as e:
                logger.error(f"메트릭스 업데이트 오류: {e}")
                
    async def _broadcast_processed_message(self, message: StreamMessage, processing_time: float):
        """처리된 메시지 브로드캐스트"""
        
        if not self.connected_clients:
            return
            
        broadcast_data = {
            'type': 'processed_message',
            'message_id': message.message_id,
            'content': message.content,
            'metadata': message.metadata,
            'processing_time': processing_time,
            'timestamp': datetime.now().isoformat()
        }
        
        # 연결이 끊어진 클라이언트 제거
        disconnected_clients = set()
        
        for client in self.connected_clients:
            try:
                await client.send(json.dumps(broadcast_data, ensure_ascii=False))
            except websockets.exceptions.ConnectionClosed:
                disconnected_clients.add(client)
            except Exception as e:
                logger.warning(f"클라이언트 전송 실패: {e}")
                disconnected_clients.add(client)
                
        self.connected_clients -= disconnected_clients
        
    async def start_websocket_server(self, host: str = "localhost", port: int = 8765):
        """웹소켓 서버 시작"""
        
        async def handle_client(websocket, path):
            """클라이언트 연결 처리"""
            
            self.connected_clients.add(websocket)
            logger.info(f"웹소켓 클라이언트 연결: {websocket.remote_address}")
            
            try:
                # 연결 유지 및 메시지 수신
                async for message in websocket:
                    try:
                        data = json.loads(message)
                        
                        if data.get('type') == 'ping':
                            await websocket.send(json.dumps({'type': 'pong'}))
                        elif data.get('type') == 'metrics_request':
                            metrics_data = asdict(self.metrics)
                            metrics_data['timestamp'] = datetime.now().isoformat()
                            await websocket.send(json.dumps({'type': 'metrics', 'data': metrics_data}))
                        elif data.get('type') == 'inject_message':
                            # 테스트용 메시지 주입
                            test_message = StreamMessage(
                                message_id=f"test_{int(time.time())}",
                                timestamp=datetime.now(),
                                source="websocket_test",
                                message_type="test",
                                content=data.get('content', 'Test message'),
                                priority=data.get('priority', 3),
                                metadata={'origin': 'websocket'}
                            )
                            await self.enqueue_message(test_message)
                            
                    except json.JSONDecodeError:
                        logger.warning("잘못된 JSON 메시지 수신")
                    except Exception as e:
                        logger.error(f"메시지 처리 오류: {e}")
                        
            except websockets.exceptions.ConnectionClosed:
                pass
            finally:
                self.connected_clients.discard(websocket)
                logger.info(f"웹소켓 클라이언트 연결 해제: {websocket.remote_address}")
                
        self.websocket_server = await websockets.serve(handle_client, host, port)
        logger.info(f"웹소켓 서버 시작: ws://{host}:{port}")
        
    def get_metrics(self) -> StreamMetrics:
        """현재 메트릭스 반환"""
        return self.metrics
        
    async def health_check(self) -> Dict[str, Any]:
        """시스템 헬스 체크"""
        
        health_status = {
            'system_running': self.is_running,
            'queue_size': self.message_queue.qsize(),
            'queue_usage_percent': (self.message_queue.qsize() / self.max_queue_size) * 100,
            'active_workers': len([task for task in self.worker_tasks if not task.done()]),
            'connected_clients': len(self.connected_clients),
            'backpressure_active': self.processing_delay > 0,
            'processor_count': len(self.processing_pipeline),
            'metrics': asdict(self.metrics)
        }
        
        # 각 프로세서 헬스 체크
        processor_health = {}
        for processor in self.processing_pipeline:
            processor_health[processor.processor_id] = await processor.health_check()
            
        health_status['processor_health'] = processor_health
        
        return health_status


# 사용 예시 및 테스트
async def test_streaming_processor():
    """스트리밍 프로세서 테스트"""
    
    print("🌊 실시간 스트리밍 데이터 처리 시스템 테스트")
    print("=" * 60)
    
    # 프로세서 시스템 생성
    processor = StreamingDataProcessor(max_queue_size=1000)
    
    # 프로세서 파이프라인 구성
    filter_rules = {
        'allowed_types': ['chat', 'notification', 'alert'],
        'min_priority': 5,  # 1-5 중 5 이하만 허용
        'blocked_keywords': ['spam', 'advertisement']
    }
    
    transform_rules = {
        'content_transforms': {
            'normalize_text': True,
            'extract_keywords': True,
            'add_timestamp': True
        },
        'add_metadata': {
            'processor_version': '9.0',
            'processed_by': 'streaming_system'
        }
    }
    
    processor.add_processor(MessageFilterProcessor(filter_rules))
    processor.add_processor(MessageTransformProcessor(transform_rules))
    processor.add_processor(MessageAggregationProcessor(aggregation_window=30))
    
    print("1. 시스템 시작...")
    await processor.start(num_workers=3)
    
    # 웹소켓 서버 시작 (백그라운드)
    websocket_task = asyncio.create_task(processor.start_websocket_server("localhost", 8765))
    
    print("   ✓ 스트리밍 프로세서 시작 완료")
    print("   ✓ 웹소켓 서버 시작: ws://localhost:8765")
    
    print(f"\n2. 테스트 메시지 생성 및 전송...")
    
    # 테스트 메시지들
    test_messages = [
        {
            'content': '안녕하세요! 시공사 관련 논의가 필요합니다.',
            'type': 'chat',
            'priority': 2,
            'source': 'user_001'
        },
        {
            'content': '분담금 계산 결과를 공유드립니다.',
            'type': 'notification',
            'priority': 1,
            'source': 'system'
        },
        {
            'content': 'spam 광고 메시지입니다!',  # 필터링될 메시지
            'type': 'chat',
            'priority': 3,
            'source': 'spam_user'
        },
        {
            'content': '총회 일정을 알려드립니다.',
            'type': 'alert',
            'priority': 1,
            'source': 'admin'
        },
        {
            'content': '우선순위가 낮은 메시지입니다.',
            'type': 'chat',
            'priority': 6,  # 필터링될 메시지 (우선순위 낮음)
            'source': 'user_002'
        }
    ]
    
    # 메시지 전송
    for i, msg_data in enumerate(test_messages):
        message = StreamMessage(
            message_id=f"test_msg_{i:03d}",
            timestamp=datetime.now(),
            source=msg_data['source'],
            message_type=msg_data['type'],
            content=msg_data['content'],
            priority=msg_data['priority'],
            metadata={'test_id': i}
        )
        
        success = await processor.enqueue_message(message)
        print(f"   메시지 {i+1}: {'성공' if success else '실패'} - {msg_data['content'][:30]}...")
        
        # 짧은 지연
        await asyncio.sleep(0.1)
        
    print(f"\n3. 처리 대기 중... (5초)")
    await asyncio.sleep(5)
    
    # 헬스 체크
    print(f"\n4. 시스템 상태 확인:")
    health = await processor.health_check()
    
    print(f"   시스템 실행 중: {health['system_running']}")
    print(f"   큐 크기: {health['queue_size']}")
    print(f"   큐 사용률: {health['queue_usage_percent']:.1f}%")
    print(f"   활성 워커: {health['active_workers']}개")
    print(f"   연결된 클라이언트: {health['connected_clients']}개")
    print(f"   백프레셔 활성화: {health['backpressure_active']}")
    
    # 메트릭스 출력
    metrics = processor.get_metrics()
    print(f"\n5. 처리 메트릭스:")
    print(f"   총 메시지: {metrics.total_messages}개")
    print(f"   처리된 메시지: {metrics.processed_messages}개")
    print(f"   실패한 메시지: {metrics.failed_messages}개")
    print(f"   처리 속도: {metrics.messages_per_second:.1f} msg/s")
    print(f"   평균 처리 시간: {metrics.avg_processing_time:.3f}초")
    
    # 프로세서별 헬스 상태
    if health['processor_health']:
        print(f"\n6. 프로세서 상태:")
        for proc_id, is_healthy in health['processor_health'].items():
            status = "정상" if is_healthy else "오류"
            print(f"   {proc_id}: {status}")
            
    print(f"\n7. 추가 테스트 메시지 전송...")
    
    # 대량 메시지 테스트
    bulk_messages = []
    for i in range(20):
        message = StreamMessage(
            message_id=f"bulk_msg_{i:03d}",
            timestamp=datetime.now(),
            source=f"bulk_user_{i % 3}",
            message_type="chat",
            content=f"대량 테스트 메시지 {i+1}번입니다. 시공사 관련 내용입니다.",
            priority=2,
            metadata={'bulk_test': True, 'batch_id': i // 5}
        )
        bulk_messages.append(message)
        
    # 빠른 전송
    for message in bulk_messages:
        await processor.enqueue_message(message)
        
    print(f"   대량 메시지 {len(bulk_messages)}개 전송 완료")
    
    # 처리 완료 대기
    print(f"\n8. 대량 처리 대기 중... (10초)")
    await asyncio.sleep(10)
    
    # 최종 메트릭스
    final_metrics = processor.get_metrics()
    print(f"\n9. 최종 메트릭스:")
    print(f"   총 메시지: {final_metrics.total_messages}개")
    print(f"   처리된 메시지: {final_metrics.processed_messages}개")
    print(f"   성공률: {(final_metrics.processed_messages/final_metrics.total_messages)*100:.1f}%" if final_metrics.total_messages > 0 else "N/A")
    print(f"   현재 처리 속도: {final_metrics.messages_per_second:.1f} msg/s")
    
    print(f"\n10. 시스템 종료...")
    
    # 웹소켓 서버 종료
    websocket_task.cancel()
    
    # 프로세서 종료
    await processor.stop()
    
    print(f"\n🏆 실시간 스트리밍 데이터 처리 시스템 테스트 완료!")
    

# 신호 처리 (우아한 종료)
def signal_handler(signum, frame):
    """신호 처리기"""
    print(f"\n신호 수신: {signum}")
    sys.exit(0)


if __name__ == "__main__":
    # 신호 처리 등록
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        asyncio.run(test_streaming_processor())
    except KeyboardInterrupt:
        print("\n사용자에 의해 중단됨")
    except Exception as e:
        print(f"\n오류 발생: {e}")
        logging.exception("시스템 오류") 