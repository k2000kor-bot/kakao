import os
import json
import sqlite3
import logging
from typing import Dict, List, Any
import hashlib
from pathlib import Path
import threading
import queue

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AutoLearningSystem:
    """파일 업로드 후 자동 학습 및 지식 베이스 구축 시스템"""
    
    def __init__(self, db_path: str = "backend/auto_learning_system.db"):
        self.db_path = db_path
        self.upload_dir = "backend/uploads"
        self.knowledge_base_dir = "backend/knowledge_base"
        self.model_dir = "backend/models"
        self.analysis_queue = queue.Queue()
        self.learning_queue = queue.Queue()
        
        # 디렉토리 생성
        self._create_directories()
        
        # 데이터베이스 초기화
        self._init_database()
        
        # 백그라운드 작업 시작
        self._start_background_workers()
    
    def _create_directories(self):
        """필요한 디렉토리 생성"""
        directories = [self.upload_dir, self.knowledge_base_dir, self.model_dir]
        for directory in directories:
            Path(directory).mkdir(parents=True, exist_ok=True)
    
    def _init_database(self):
        """데이터베이스 초기화"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 파일 정보 테이블
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS uploaded_files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_name TEXT NOT NULL,
                file_path TEXT NOT NULL,
                file_hash TEXT UNIQUE NOT NULL,
                file_type TEXT NOT NULL,
                file_size INTEGER NOT NULL,
                project_id TEXT,
                chat_id TEXT,
                upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                processing_status TEXT DEFAULT 'pending',
                analysis_complete BOOLEAN DEFAULT FALSE,
                learning_complete BOOLEAN DEFAULT FALSE
            )
        """)
        
        # 지식 베이스 테이블
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS knowledge_base (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_id INTEGER,
                content_type TEXT NOT NULL,
                content TEXT NOT NULL,
                keywords TEXT,
                topics TEXT,
                sentiment TEXT,
                confidence REAL,
                created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (file_id) REFERENCES uploaded_files (id)
            )
        """)
        
        # AI 학습 모델 테이블
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ai_models (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                model_name TEXT NOT NULL,
                model_type TEXT NOT NULL,
                model_path TEXT NOT NULL,
                accuracy REAL,
                training_data_count INTEGER,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT TRUE
            )
        """)
        
        # 분석 결과 테이블
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS analysis_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_id INTEGER,
                analysis_type TEXT NOT NULL,
                result_data TEXT,
                confidence REAL,
                processing_time REAL,
                created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (file_id) REFERENCES uploaded_files (id)
            )
        """)
        
        # 딥러닝 모델 테이블
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS deep_learning_models (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                model_name TEXT NOT NULL,
                model_type TEXT NOT NULL,
                model_path TEXT NOT NULL,
                architecture TEXT,
                parameters TEXT,
                training_metrics TEXT,
                validation_metrics TEXT,
                created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT TRUE
            )
        """)
        
        conn.commit()
        conn.close()
    
    def _start_background_workers(self):
        """백그라운드 작업자 시작"""
        # 분석 작업자
        self.analysis_worker = threading.Thread(target=self._analysis_worker, daemon=True)
        self.analysis_worker.start()
        
        # 학습 작업자
        self.learning_worker = threading.Thread(target=self._learning_worker, daemon=True)
        self.learning_worker.start()
    
    def process_uploaded_file(self, file_path: str, project_id: str = None, chat_id: str = None) -> Dict[str, Any]:
        """업로드된 파일 처리"""
        try:
            # 파일 정보 추출
            file_info = self._extract_file_info(file_path, project_id, chat_id)
            
            # 데이터베이스에 저장
            file_id = self._save_file_info(file_info)
            
            # 분석 큐에 추가
            self.analysis_queue.put((file_id, file_path))
            
            # 학습 큐에 추가
            self.learning_queue.put((file_id, file_path))
            
            return {
                'success': True,
                'file_id': file_id,
                'message': '파일이 성공적으로 업로드되었습니다. 분석 및 학습이 시작됩니다.'
            }
            
        except Exception as e:
            logger.error(f"파일 처리 실패: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _extract_file_info(self, file_path: str, project_id: str, chat_id: str) -> Dict[str, Any]:
        """파일 정보 추출"""
        file_name = os.path.basename(file_path)
        file_size = os.path.getsize(file_path)
        file_type = self._get_file_type(file_name)
        
        # 파일 해시 생성
        with open(file_path, 'rb') as f:
            file_content = f.read()
            file_hash = hashlib.md5(file_content).hexdigest()
        
        return {
            'file_name': file_name,
            'file_path': file_path,
            'file_hash': file_hash,
            'file_type': file_type,
            'file_size': file_size,
            'project_id': project_id,
            'chat_id': chat_id
        }
    
    def _get_file_type(self, file_name: str) -> str:
        """파일 타입 결정"""
        ext = os.path.splitext(file_name)[1].lower()
        
        if ext in ['.jpg', '.jpeg', '.png', '.gif', '.bmp']:
            return 'image'
        elif ext in ['.mp4', '.avi', '.mov', '.wmv']:
            return 'video'
        elif ext in ['.mp3', '.wav', '.aac', '.flac']:
            return 'audio'
        elif ext in ['.pdf', '.doc', '.docx', '.txt', '.md', '.csv']:
            return 'document'
        else:
            return 'other'
    
    def _save_file_info(self, file_info: Dict[str, Any]) -> int:
        """파일 정보를 데이터베이스에 저장"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO uploaded_files 
            (file_name, file_path, file_hash, file_type, file_size, project_id, chat_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            file_info['file_name'],
            file_info['file_path'],
            file_info['file_hash'],
            file_info['file_type'],
            file_info['file_size'],
            file_info['project_id'],
            file_info['chat_id']
        ))
        
        file_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return file_id
    
    def _analysis_worker(self):
        """분석 작업자"""
        while True:
            try:
                file_id, file_path = self.analysis_queue.get(timeout=1)
                self._analyze_file(file_id, file_path)
                self.analysis_queue.task_done()
            except queue.Empty:
                continue
            except Exception as e:
                logger.error(f"분석 작업자 오류: {e}")
    
    def _learning_worker(self):
        """학습 작업자"""
        while True:
            try:
                file_id, file_path = self.learning_queue.get(timeout=1)
                self._learn_from_file(file_id, file_path)
                self.learning_queue.task_done()
            except queue.Empty:
                continue
            except Exception as e:
                logger.error(f"학습 작업자 오류: {e}")
    
    def _analyze_file(self, file_id: int, file_path: str):
        """파일 분석"""
        try:
            file_type = self._get_file_type_from_db(file_id)
            
            if file_type == 'document':
                self._analyze_document(file_id, file_path)
            elif file_type == 'image':
                self._analyze_image(file_id, file_path)
            elif file_type == 'video':
                self._analyze_video(file_id, file_path)
            elif file_type == 'audio':
                self._analyze_audio(file_id, file_path)
            
            # 분석 완료 상태 업데이트
            self._update_file_status(file_id, 'analysis_complete', True)
            
        except Exception as e:
            logger.error(f"파일 분석 실패 (file_id: {file_id}): {e}")
    
    def _learn_from_file(self, file_id: int, file_path: str):
        """파일로부터 학습"""
        try:
            # 지식 베이스 구축
            self._build_knowledge_base(file_id, file_path)
            
            # AI 모델 업데이트
            self._update_ai_models(file_id, file_path)
            
            # 딥러닝 모델 훈련
            self._train_deep_learning_models(file_id, file_path)
            
            # 학습 완료 상태 업데이트
            self._update_file_status(file_id, 'learning_complete', True)
            
        except Exception as e:
            logger.error(f"파일 학습 실패 (file_id: {file_id}): {e}")
    
    def _analyze_document(self, file_id: int, file_path: str):
        """문서 분석"""
        try:
            # 텍스트 추출
            text_content = self._extract_text_from_document(file_path)
            
            # 키워드 추출
            keywords = self._extract_keywords(text_content)
            
            # 주제 분석
            topics = self._analyze_topics(text_content)
            
            # 감정 분석
            sentiment = self._analyze_sentiment(text_content)
            
            # 분석 결과 저장
            self._save_analysis_result(file_id, 'document_analysis', {
                'text_content': text_content,
                'keywords': keywords,
                'topics': topics,
                'sentiment': sentiment
            })
            
        except Exception as e:
            logger.error(f"문서 분석 실패: {e}")
    
    def _analyze_image(self, file_id: int, file_path: str):
        """이미지 분석"""
        try:
            # 이미지 메타데이터 추출
            metadata = self._extract_image_metadata(file_path)
            
            # 이미지 분류
            classification = self._classify_image(file_path)
            
            # 분석 결과 저장
            self._save_analysis_result(file_id, 'image_analysis', {
                'metadata': metadata,
                'classification': classification
            })
            
        except Exception as e:
            logger.error(f"이미지 분석 실패: {e}")
    
    def _analyze_video(self, file_id: int, file_path: str):
        """비디오 분석"""
        try:
            # 비디오 메타데이터 추출
            metadata = self._extract_video_metadata(file_path)
            
            # 프레임 분석
            frame_analysis = self._analyze_video_frames(file_path)
            
            # 분석 결과 저장
            self._save_analysis_result(file_id, 'video_analysis', {
                'metadata': metadata,
                'frame_analysis': frame_analysis
            })
            
        except Exception as e:
            logger.error(f"비디오 분석 실패: {e}")
    
    def _analyze_audio(self, file_id: int, file_path: str):
        """오디오 분석"""
        try:
            # 오디오 메타데이터 추출
            metadata = self._extract_audio_metadata(file_path)
            
            # 음성 인식
            transcription = self._transcribe_audio(file_path)
            
            # 분석 결과 저장
            self._save_analysis_result(file_id, 'audio_analysis', {
                'metadata': metadata,
                'transcription': transcription
            })
            
        except Exception as e:
            logger.error(f"오디오 분석 실패: {e}")
    
    def _build_knowledge_base(self, file_id: int, file_path: str):
        """지식 베이스 구축"""
        try:
            # 파일 내용 추출
            content = self._extract_content(file_path)
            
            # 키워드 추출
            keywords = self._extract_keywords(content)
            
            # 주제 분류
            topics = self._classify_topics(content)
            
            # 지식 베이스에 저장
            self._save_to_knowledge_base(file_id, content, keywords, topics)
            
        except Exception as e:
            logger.error(f"지식 베이스 구축 실패: {e}")
    
    def _update_ai_models(self, file_id: int, file_path: str):
        """AI 모델 업데이트"""
        try:
            # 새로운 데이터로 모델 재훈련
            self._retrain_text_classifier(file_id, file_path)
            self._retrain_sentiment_analyzer(file_id, file_path)
            self._retrain_topic_classifier(file_id, file_path)
            
        except Exception as e:
            logger.error(f"AI 모델 업데이트 실패: {e}")
    
    def _train_deep_learning_models(self, file_id: int, file_path: str):
        """딥러닝 모델 훈련"""
        try:
            # 텍스트 임베딩 모델 훈련
            self._train_text_embedding_model(file_id, file_path)
            
            # 이미지 분류 모델 훈련
            if self._get_file_type_from_db(file_id) == 'image':
                self._train_image_classification_model(file_id, file_path)
            
            # 시계열 예측 모델 훈련
            self._train_time_series_model(file_id, file_path)
            
        except Exception as e:
            logger.error(f"딥러닝 모델 훈련 실패: {e}")
    
    def get_learning_progress(self, file_id: int) -> Dict[str, Any]:
        """학습 진행 상황 조회"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT processing_status, analysis_complete, learning_complete
            FROM uploaded_files WHERE id = ?
        """, (file_id,))
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return {
                'processing_status': result[0],
                'analysis_complete': bool(result[1]),
                'learning_complete': bool(result[2])
            }
        return {}
    
    def get_knowledge_base_summary(self) -> Dict[str, Any]:
        """지식 베이스 요약"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 총 파일 수
        cursor.execute("SELECT COUNT(*) FROM uploaded_files")
        total_files = cursor.fetchone()[0]
        
        # 처리 완료된 파일 수
        cursor.execute("SELECT COUNT(*) FROM uploaded_files WHERE analysis_complete = 1")
        processed_files = cursor.fetchone()[0]
        
        # 지식 베이스 항목 수
        cursor.execute("SELECT COUNT(*) FROM knowledge_base")
        knowledge_items = cursor.fetchone()[0]
        
        # AI 모델 수
        cursor.execute("SELECT COUNT(*) FROM ai_models WHERE is_active = 1")
        active_models = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            'total_files': total_files,
            'processed_files': processed_files,
            'knowledge_items': knowledge_items,
            'active_models': active_models,
            'processing_rate': (processed_files / total_files * 100) if total_files > 0 else 0
        }
    
    # 헬퍼 메서드들 (실제 구현은 별도로 필요)
    def _get_file_type_from_db(self, file_id: int) -> str:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT file_type FROM uploaded_files WHERE id = ?", (file_id,))
        result = cursor.fetchone()
        conn.close()
        return result[0] if result else 'unknown'
    
    def _update_file_status(self, file_id: int, status_field: str, value: Any):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(f"UPDATE uploaded_files SET {status_field} = ? WHERE id = ?", (value, file_id))
        conn.commit()
        conn.close()
    
    def _save_analysis_result(self, file_id: int, analysis_type: str, result_data: Dict[str, Any]):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO analysis_results (file_id, analysis_type, result_data)
            VALUES (?, ?, ?)
        """, (file_id, analysis_type, json.dumps(result_data)))
        conn.commit()
        conn.close()
    
    def _save_to_knowledge_base(self, file_id: int, content: str, keywords: List[str], topics: List[str]):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO knowledge_base (file_id, content_type, content, keywords, topics)
            VALUES (?, ?, ?, ?, ?)
        """, (file_id, 'text', content, json.dumps(keywords), json.dumps(topics)))
        conn.commit()
        conn.close()
    
    # 실제 구현이 필요한 메서드들 (스텁)
    def _extract_text_from_document(self, file_path: str) -> str:
        # 실제 텍스트 추출 로직 구현 필요
        return "추출된 텍스트 내용"
    
    def _extract_keywords(self, text: str) -> List[str]:
        # 키워드 추출 로직 구현 필요
        return ["키워드1", "키워드2"]
    
    def _analyze_topics(self, text: str) -> List[str]:
        # 주제 분석 로직 구현 필요
        return ["주제1", "주제2"]
    
    def _analyze_sentiment(self, text: str) -> str:
        # 감정 분석 로직 구현 필요
        return "positive"
    
    def _extract_image_metadata(self, file_path: str) -> Dict[str, Any]:
        # 이미지 메타데이터 추출 로직 구현 필요
        return {"width": 1920, "height": 1080}
    
    def _classify_image(self, file_path: str) -> str:
        # 이미지 분류 로직 구현 필요
        return "document"
    
    def _extract_video_metadata(self, file_path: str) -> Dict[str, Any]:
        # 비디오 메타데이터 추출 로직 구현 필요
        return {"duration": 120, "fps": 30}
    
    def _analyze_video_frames(self, file_path: str) -> List[Dict[str, Any]]:
        # 비디오 프레임 분석 로직 구현 필요
        return [{"frame": 1, "content": "분석 결과"}]
    
    def _extract_audio_metadata(self, file_path: str) -> Dict[str, Any]:
        # 오디오 메타데이터 추출 로직 구현 필요
        return {"duration": 60, "sample_rate": 44100}
    
    def _transcribe_audio(self, file_path: str) -> str:
        # 음성 인식 로직 구현 필요
        return "음성 인식 결과"
    
    def _extract_content(self, file_path: str) -> str:
        # 파일 내용 추출 로직 구현 필요
        return "파일 내용"
    
    def _classify_topics(self, content: str) -> List[str]:
        # 주제 분류 로직 구현 필요
        return ["주제1", "주제2"]
    
    def _retrain_text_classifier(self, file_id: int, file_path: str):
        # 텍스트 분류기 재훈련 로직 구현 필요
        pass
    
    def _retrain_sentiment_analyzer(self, file_id: int, file_path: str):
        # 감정 분석기 재훈련 로직 구현 필요
        pass
    
    def _retrain_topic_classifier(self, file_id: int, file_path: str):
        # 주제 분류기 재훈련 로직 구현 필요
        pass
    
    def _train_text_embedding_model(self, file_id: int, file_path: str):
        # 텍스트 임베딩 모델 훈련 로직 구현 필요
        pass
    
    def _train_image_classification_model(self, file_id: int, file_path: str):
        # 이미지 분류 모델 훈련 로직 구현 필요
        pass
    
    def _train_time_series_model(self, file_id: int, file_path: str):
        # 시계열 예측 모델 훈련 로직 구현 필요
        pass
