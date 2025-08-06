#!/usr/bin/env python3
"""
고도화된 자동 통합 시스템
파일 업로드 시 모든 시스템이 자동으로 연동되어 진행
"""

import os
import json
import sqlite3
import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
import threading
import queue
from pathlib import Path
import hashlib
import shutil
from concurrent.futures import ThreadPoolExecutor, as_completed

# 기존 시스템들 import
from auto_learning_system import AutoLearningSystem
from gaeposung_analyzer import GaepoSungAnalyzer

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnhancedAutoIntegrationSystem:
    """고도화된 자동 통합 시스템"""
    
    def __init__(self):
        self.auto_learning_system = AutoLearningSystem()
        self.gaeposung_analyzer = GaepoSungAnalyzer()
        self.integration_queue = queue.Queue()
        self.processing_status = {}
        self.system_connections = {}
        
        # 시스템별 작업자 스레드
        self.workers = {}
        self.start_workers()
    
    def start_workers(self):
        """시스템별 작업자 스레드 시작"""
        systems = [
            'file_analysis',
            'knowledge_extraction', 
            'ai_model_training',
            'project_analysis',
            'chat_integration',
            'notification_system'
        ]
        
        for system in systems:
            worker = threading.Thread(target=self._system_worker, args=(system,), daemon=True)
            worker.start()
            self.workers[system] = worker
    
    def _system_worker(self, system_name: str):
        """시스템별 작업자"""
        while True:
            try:
                task = self.integration_queue.get(timeout=1)
                if task['system'] == system_name:
                    self._process_system_task(task)
                else:
                    # 다른 시스템의 작업은 다시 큐에 넣기
                    self.integration_queue.put(task)
                self.integration_queue.task_done()
            except queue.Empty:
                continue
            except Exception as e:
                logger.error(f"{system_name} 작업자 오류: {e}")
    
    def _process_system_task(self, task: Dict[str, Any]):
        """시스템별 작업 처리"""
        try:
            if task['system'] == 'file_analysis':
                self._analyze_file_content(task)
            elif task['system'] == 'knowledge_extraction':
                self._extract_knowledge(task)
            elif task['system'] == 'ai_model_training':
                self._train_ai_models(task)
            elif task['system'] == 'project_analysis':
                self._analyze_project_context(task)
            elif task['system'] == 'chat_integration':
                self._integrate_with_chat(task)
            elif task['system'] == 'notification_system':
                self._send_notifications(task)
        except Exception as e:
            logger.error(f"작업 처리 실패: {e}")
    
    def process_file_upload(self, file_path: str, project_id: str = None, chat_id: str = None) -> Dict[str, Any]:
        """파일 업로드 처리 및 모든 시스템 자동 연동"""
        try:
            file_id = self._generate_file_id(file_path)
            
            # 초기 상태 설정
            self.processing_status[file_id] = {
                'status': 'processing',
                'progress': 0,
                'systems': {
                    'file_analysis': 'pending',
                    'knowledge_extraction': 'pending',
                    'ai_model_training': 'pending',
                    'project_analysis': 'pending',
                    'chat_integration': 'pending',
                    'notification_system': 'pending'
                },
                'results': {},
                'start_time': datetime.now().isoformat()
            }
            
            # 모든 시스템에 작업 배포
            self._distribute_tasks(file_id, file_path, project_id, chat_id)
            
            # 백그라운드에서 전체 진행 상황 모니터링
            asyncio.create_task(self._monitor_integration_progress(file_id))
            
            return {
                'success': True,
                'file_id': file_id,
                'message': '파일이 업로드되었습니다. 모든 시스템이 자동으로 연동되어 처리됩니다.',
                'integration_id': file_id
            }
            
        except Exception as e:
            logger.error(f"파일 업로드 처리 실패: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _distribute_tasks(self, file_id: str, file_path: str, project_id: str, chat_id: str):
        """모든 시스템에 작업 배포"""
        base_task = {
            'file_id': file_id,
            'file_path': file_path,
            'project_id': project_id,
            'chat_id': chat_id,
            'timestamp': datetime.now().isoformat()
        }
        
        # 1. 파일 분석 시스템
        self.integration_queue.put({
            **base_task,
            'system': 'file_analysis',
            'priority': 1
        })
        
        # 2. 지식 추출 시스템
        self.integration_queue.put({
            **base_task,
            'system': 'knowledge_extraction',
            'priority': 2
        })
        
        # 3. AI 모델 훈련 시스템
        self.integration_queue.put({
            **base_task,
            'system': 'ai_model_training',
            'priority': 3
        })
        
        # 4. 프로젝트 분석 시스템
        self.integration_queue.put({
            **base_task,
            'system': 'project_analysis',
            'priority': 4
        })
        
        # 5. 채팅 통합 시스템
        self.integration_queue.put({
            **base_task,
            'system': 'chat_integration',
            'priority': 5
        })
        
        # 6. 알림 시스템
        self.integration_queue.put({
            **base_task,
            'system': 'notification_system',
            'priority': 6
        })
    
    def _analyze_file_content(self, task: Dict[str, Any]):
        """파일 내용 분석"""
        try:
            file_id = task['file_id']
            file_path = task['file_path']
            
            # 파일 타입 분석
            file_type = self._get_file_type(file_path)
            
            # 파일 내용 추출
            content = self._extract_file_content(file_path, file_type)
            
            # 키워드 및 주제 추출
            keywords = self._extract_keywords(content)
            topics = self._classify_topics(content)
            
            # 감정 분석
            sentiment = self._analyze_sentiment(content)
            
            # 분석 결과 저장
            self._save_analysis_result(file_id, {
                'file_type': file_type,
                'content': content,
                'keywords': keywords,
                'topics': topics,
                'sentiment': sentiment,
                'analysis_time': datetime.now().isoformat()
            })
            
            # 상태 업데이트
            self.processing_status[file_id]['systems']['file_analysis'] = 'completed'
            self.processing_status[file_id]['results']['file_analysis'] = {
                'file_type': file_type,
                'keywords': keywords,
                'topics': topics,
                'sentiment': sentiment
            }
            
            logger.info(f"파일 분석 완료: {file_id}")
            
        except Exception as e:
            logger.error(f"파일 분석 실패: {e}")
            self.processing_status[file_id]['systems']['file_analysis'] = 'failed'
    
    def _extract_knowledge(self, task: Dict[str, Any]):
        """지식 추출 및 저장"""
        try:
            file_id = task['file_id']
            project_id = task['project_id']
            chat_id = task['chat_id']
            
            # 파일 분석 결과 가져오기
            analysis_result = self.processing_status[file_id]['results'].get('file_analysis', {})
            
            if analysis_result:
                # 지식 베이스에 저장
                knowledge_data = {
                    'content': analysis_result.get('content', ''),
                    'keywords': analysis_result.get('keywords', []),
                    'topics': analysis_result.get('topics', []),
                    'sentiment': analysis_result.get('sentiment', 'neutral'),
                    'confidence': 0.85,
                    'source_file_id': file_id,
                    'project_id': project_id,
                    'chat_id': chat_id
                }
                
                self._save_to_knowledge_base(knowledge_data)
                
                # 상태 업데이트
                self.processing_status[file_id]['systems']['knowledge_extraction'] = 'completed'
                self.processing_status[file_id]['results']['knowledge_extraction'] = knowledge_data
                
                logger.info(f"지식 추출 완료: {file_id}")
            
        except Exception as e:
            logger.error(f"지식 추출 실패: {e}")
            self.processing_status[file_id]['systems']['knowledge_extraction'] = 'failed'
    
    def _train_ai_models(self, task: Dict[str, Any]):
        """AI 모델 훈련"""
        try:
            file_id = task['file_id']
            
            # 분석 결과 가져오기
            analysis_result = self.processing_status[file_id]['results'].get('file_analysis', {})
            
            if analysis_result:
                # 텍스트 분류 모델 훈련
                self._train_text_classifier(analysis_result)
                
                # 감정 분석 모델 훈련
                self._train_sentiment_analyzer(analysis_result)
                
                # 주제 분류 모델 훈련
                self._train_topic_classifier(analysis_result)
                
                # 상태 업데이트
                self.processing_status[file_id]['systems']['ai_model_training'] = 'completed'
                self.processing_status[file_id]['results']['ai_model_training'] = {
                    'models_updated': ['text_classifier', 'sentiment_analyzer', 'topic_classifier'],
                    'training_time': datetime.now().isoformat()
                }
                
                logger.info(f"AI 모델 훈련 완료: {file_id}")
            
        except Exception as e:
            logger.error(f"AI 모델 훈련 실패: {e}")
            self.processing_status[file_id]['systems']['ai_model_training'] = 'failed'
    
    def _analyze_project_context(self, task: Dict[str, Any]):
        """프로젝트 컨텍스트 분석"""
        try:
            file_id = task['file_id']
            project_id = task['project_id']
            
            if project_id:
                # 프로젝트 관련 메시지 수집
                project_messages = self._get_project_messages(project_id)
                
                # 프로젝트 분석 실행
                project_analysis = self.gaeposung_analyzer.analyze_project(project_id)
                
                # 프로젝트 상태 업데이트
                self._update_project_status(project_id, project_analysis)
                
                # 상태 업데이트
                self.processing_status[file_id]['systems']['project_analysis'] = 'completed'
                self.processing_status[file_id]['results']['project_analysis'] = project_analysis
                
                logger.info(f"프로젝트 분석 완료: {file_id}")
            
        except Exception as e:
            logger.error(f"프로젝트 분석 실패: {e}")
            self.processing_status[file_id]['systems']['project_analysis'] = 'failed'
    
    def _integrate_with_chat(self, task: Dict[str, Any]):
        """채팅 시스템 통합"""
        try:
            file_id = task['file_id']
            chat_id = task['chat_id']
            
            # 분석 결과 가져오기
            analysis_result = self.processing_status[file_id]['results'].get('file_analysis', {})
            
            if analysis_result and chat_id:
                # 채팅에 자동 메시지 생성
                auto_message = self._generate_auto_message(analysis_result)
                
                # 채팅에 메시지 추가
                self._add_chat_message(chat_id, auto_message)
                
                # 채팅 상태 업데이트
                self._update_chat_status(chat_id, 'file_processed')
                
                # 상태 업데이트
                self.processing_status[file_id]['systems']['chat_integration'] = 'completed'
                self.processing_status[file_id]['results']['chat_integration'] = {
                    'auto_message': auto_message,
                    'chat_updated': True
                }
                
                logger.info(f"채팅 통합 완료: {file_id}")
            
        except Exception as e:
            logger.error(f"채팅 통합 실패: {e}")
            self.processing_status[file_id]['systems']['chat_integration'] = 'failed'
    
    def _send_notifications(self, task: Dict[str, Any]):
        """알림 시스템"""
        try:
            file_id = task['file_id']
            project_id = task['project_id']
            
            # 전체 진행 상황 확인
            all_completed = all(
                status == 'completed' 
                for status in self.processing_status[file_id]['systems'].values()
            )
            
            if all_completed:
                # 완료 알림 생성
                notification = {
                    'type': 'file_processing_completed',
                    'file_id': file_id,
                    'project_id': project_id,
                    'message': '파일 처리가 완료되었습니다. 모든 시스템이 연동되어 처리되었습니다.',
                    'timestamp': datetime.now().isoformat(),
                    'results': self.processing_status[file_id]['results']
                }
                
                # 알림 전송
                self._send_notification(notification)
                
                # 상태 업데이트
                self.processing_status[file_id]['systems']['notification_system'] = 'completed'
                self.processing_status[file_id]['status'] = 'completed'
                self.processing_status[file_id]['progress'] = 100
                
                logger.info(f"알림 전송 완료: {file_id}")
            
        except Exception as e:
            logger.error(f"알림 전송 실패: {e}")
            self.processing_status[file_id]['systems']['notification_system'] = 'failed'
    
    async def _monitor_integration_progress(self, file_id: str):
        """통합 진행 상황 모니터링"""
        while True:
            try:
                if file_id in self.processing_status:
                    status = self.processing_status[file_id]
                    
                    # 진행률 계산
                    completed_systems = sum(
                        1 for system_status in status['systems'].values()
                        if system_status == 'completed'
                    )
                    total_systems = len(status['systems'])
                    progress = (completed_systems / total_systems) * 100
                    
                    # 진행률 업데이트
                    self.processing_status[file_id]['progress'] = progress
                    
                    # 모든 시스템이 완료되면 종료
                    if progress >= 100:
                        logger.info(f"통합 처리 완료: {file_id}")
                        break
                    
                    await asyncio.sleep(2)  # 2초마다 확인
                else:
                    break
                    
            except Exception as e:
                logger.error(f"진행 상황 모니터링 실패: {e}")
                break
    
    def get_integration_status(self, file_id: str) -> Dict[str, Any]:
        """통합 처리 상태 조회"""
        if file_id in self.processing_status:
            return self.processing_status[file_id]
        return {'error': 'File ID not found'}
    
    def get_all_integration_status(self) -> Dict[str, Any]:
        """모든 통합 처리 상태 조회"""
        return {
            'active_processes': len(self.processing_status),
            'completed_processes': sum(
                1 for status in self.processing_status.values()
                if status['status'] == 'completed'
            ),
            'processing_status': self.processing_status
        }
    
    # 헬퍼 메서드들
    def _generate_file_id(self, file_path: str) -> str:
        """파일 ID 생성"""
        file_hash = hashlib.md5(file_path.encode()).hexdigest()
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        return f"{timestamp}_{file_hash[:8]}"
    
    def _get_file_type(self, file_path: str) -> str:
        """파일 타입 결정"""
        ext = os.path.splitext(file_path)[1].lower()
        
        if ext in ['.jpg', '.jpeg', '.png', '.gif', '.bmp']:
            return 'image'
        elif ext in ['.mp4', '.avi', '.mov', '.wmv']:
            return 'video'
        elif ext in ['.mp3', '.wav', '.aac', '.flac']:
            return 'audio'
        elif ext in ['.pdf', '.doc', '.docx', '.txt']:
            return 'document'
        else:
            return 'other'
    
    def _extract_file_content(self, file_path: str, file_type: str) -> str:
        """파일 내용 추출"""
        try:
            if file_type == 'document':
                # 문서 내용 추출 (실제로는 더 정교한 라이브러리 사용)
                with open(file_path, 'r', encoding='utf-8') as f:
                    return f.read()
            else:
                # 이미지, 비디오, 오디오의 경우 메타데이터 추출
                return f"File type: {file_type}, Path: {file_path}"
        except Exception as e:
            logger.error(f"파일 내용 추출 실패: {e}")
            return ""
    
    def _extract_keywords(self, content: str) -> List[str]:
        """키워드 추출"""
        # 간단한 키워드 추출 (실제로는 NLP 라이브러리 사용)
        words = content.lower().split()
        keywords = [word for word in words if len(word) > 3]
        return keywords[:10]
    
    def _classify_topics(self, content: str) -> List[str]:
        """주제 분류"""
        topics = []
        content_lower = content.lower()
        
        if any(word in content_lower for word in ['프로젝트', '계획', '일정']):
            topics.append('project_management')
        if any(word in content_lower for word in ['문제', '이슈', '해결']):
            topics.append('problem_solving')
        if any(word in content_lower for word in ['의견', '제안', '아이디어']):
            topics.append('suggestions')
        
        return topics
    
    def _analyze_sentiment(self, content: str) -> str:
        """감정 분석"""
        # 간단한 감정 분석 (실제로는 고급 NLP 사용)
        positive_words = ['좋다', '훌륭하다', '성공', '완료', '만족']
        negative_words = ['문제', '실패', '어렵다', '불만', '오류']
        
        content_lower = content.lower()
        positive_count = sum(1 for word in positive_words if word in content_lower)
        negative_count = sum(1 for word in negative_words if word in content_lower)
        
        if positive_count > negative_count:
            return 'positive'
        elif negative_count > positive_count:
            return 'negative'
        else:
            return 'neutral'
    
    def _save_analysis_result(self, file_id: str, result: Dict[str, Any]):
        """분석 결과 저장"""
        # 데이터베이스에 저장 (실제 구현 필요)
        pass
    
    def _save_to_knowledge_base(self, knowledge_data: Dict[str, Any]):
        """지식 베이스에 저장"""
        # 데이터베이스에 저장 (실제 구현 필요)
        pass
    
    def _train_text_classifier(self, analysis_result: Dict[str, Any]):
        """텍스트 분류기 훈련"""
        # 실제 모델 훈련 로직 (실제 구현 필요)
        pass
    
    def _train_sentiment_analyzer(self, analysis_result: Dict[str, Any]):
        """감정 분석기 훈련"""
        # 실제 모델 훈련 로직 (실제 구현 필요)
        pass
    
    def _train_topic_classifier(self, analysis_result: Dict[str, Any]):
        """주제 분류기 훈련"""
        # 실제 모델 훈련 로직 (실제 구현 필요)
        pass
    
    def _get_project_messages(self, project_id: str) -> List[Dict[str, Any]]:
        """프로젝트 메시지 조회"""
        # 데이터베이스에서 프로젝트 메시지 조회 (실제 구현 필요)
        return []
    
    def _update_project_status(self, project_id: str, analysis: Dict[str, Any]):
        """프로젝트 상태 업데이트"""
        # 프로젝트 상태 업데이트 (실제 구현 필요)
        pass
    
    def _generate_auto_message(self, analysis_result: Dict[str, Any]) -> str:
        """자동 메시지 생성"""
        file_type = analysis_result.get('file_type', 'unknown')
        keywords = analysis_result.get('keywords', [])
        topics = analysis_result.get('topics', [])
        
        message = f"파일이 업로드되었습니다. "
        message += f"파일 타입: {file_type}, "
        message += f"주요 키워드: {', '.join(keywords[:3])}, "
        message += f"주제: {', '.join(topics)}"
        
        return message
    
    def _add_chat_message(self, chat_id: str, message: str):
        """채팅에 메시지 추가"""
        # 채팅에 메시지 추가 (실제 구현 필요)
        pass
    
    def _update_chat_status(self, chat_id: str, status: str):
        """채팅 상태 업데이트"""
        # 채팅 상태 업데이트 (실제 구현 필요)
        pass
    
    def _send_notification(self, notification: Dict[str, Any]):
        """알림 전송"""
        # 알림 전송 (실제 구현 필요)
        logger.info(f"알림 전송: {notification}")
