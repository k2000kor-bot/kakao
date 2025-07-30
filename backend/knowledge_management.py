import os
import shutil
import json
import hashlib
from datetime import datetime
from typing import List, Dict, Any, Optional
from pathlib import Path
import mimetypes
import uuid

# 파일 업로드 및 관리
class KnowledgeFileManager:
    def __init__(self, upload_dir: str = "uploads", processed_dir: str = "processed"):
        self.upload_dir = Path(upload_dir)
        self.processed_dir = Path(processed_dir)
        self.upload_dir.mkdir(exist_ok=True)
        self.processed_dir.mkdir(exist_ok=True)
        
        # 허용된 파일 타입
        self.allowed_extensions = {
            '.pdf', '.docx', '.doc', '.txt', '.xlsx', '.xls', 
            '.pptx', '.ppt', '.csv', '.json', '.xml'
        }
    
    def save_uploaded_file(self, file_content: bytes, filename: str) -> Dict[str, Any]:
        """업로드된 파일을 저장하고 메타데이터 반환"""
        try:
            # 파일 확장자 확인
            file_ext = Path(filename).suffix.lower()
            if file_ext not in self.allowed_extensions:
                raise ValueError(f"지원하지 않는 파일 형식: {file_ext}")
            
            # 고유한 파일명 생성
            file_id = str(uuid.uuid4())
            safe_filename = f"{file_id}_{filename}"
            file_path = self.upload_dir / safe_filename
            
            # 파일 저장
            with open(file_path, 'wb') as f:
                f.write(file_content)
            
            # 파일 메타데이터 생성
            file_size = len(file_content)
            file_hash = hashlib.md5(file_content).hexdigest()
            
            metadata = {
                'id': file_id,
                'original_name': filename,
                'stored_name': safe_filename,
                'file_path': str(file_path),
                'file_size': file_size,
                'file_hash': file_hash,
                'file_type': file_ext,
                'upload_date': datetime.now().isoformat(),
                'mime_type': mimetypes.guess_type(filename)[0] or 'application/octet-stream'
            }
            
            return metadata
            
        except Exception as e:
            raise Exception(f"파일 저장 실패: {str(e)}")
    
    def move_to_processed(self, file_id: str, category: str) -> str:
        """처리된 파일을 카테고리별로 이동"""
        try:
            # 원본 파일 찾기
            source_file = None
            for file_path in self.upload_dir.iterdir():
                if file_path.name.startswith(file_id):
                    source_file = file_path
                    break
            
            if not source_file:
                raise FileNotFoundError(f"파일을 찾을 수 없습니다: {file_id}")
            
            # 카테고리 디렉토리 생성
            category_dir = self.processed_dir / category
            category_dir.mkdir(exist_ok=True)
            
            # 파일 이동
            destination = category_dir / source_file.name
            shutil.move(str(source_file), str(destination))
            
            return str(destination)
            
        except Exception as e:
            raise Exception(f"파일 이동 실패: {str(e)}")
    
    def get_file_info(self, file_path: str) -> Dict[str, Any]:
        """파일 정보 조회"""
        try:
            path = Path(file_path)
            if not path.exists():
                raise FileNotFoundError("파일이 존재하지 않습니다")
            
            stat = path.stat()
            return {
                'size': stat.st_size,
                'created': datetime.fromtimestamp(stat.st_ctime).isoformat(),
                'modified': datetime.fromtimestamp(stat.st_mtime).isoformat(),
                'exists': True
            }
        except Exception as e:
            return {'error': str(e), 'exists': False}

# 문서 분류 및 분석
class DocumentClassifier:
    def __init__(self):
        self.categories = {
            'labor_law': {
                'name': '노동법',
                'keywords': ['노동', '근로', '임금', '근로기준법', '최저임금', '산업안전', '근로복지'],
                'subcategories': ['근로기준법', '산업안전보건법', '최저임금법', '근로복지법']
            },
            'union_policy': {
                'name': '조합 정책',
                'keywords': ['조합', '정책', '규정', '조합원', '조합장', '총회', '이사회'],
                'subcategories': ['조합원 규정', '복지 정책', '교육 정책', '협의 정책']
            },
            'safety_guidelines': {
                'name': '안전 가이드라인',
                'keywords': ['안전', '사고', '보호구', '안전교육', '작업매뉴얼', '응급', '구급'],
                'subcategories': ['안전 규정', '작업 매뉴얼', '응급 대응', '교육 자료']
            },
            'welfare_info': {
                'name': '복지 정보',
                'keywords': ['복지', '혜택', '의료', '교육', '문화', '금융', '지원', '보험'],
                'subcategories': ['의료 혜택', '교육 지원', '문화 혜택', '금융 지원']
            },
            'negotiation_materials': {
                'name': '협의 자료',
                'keywords': ['협의', '시공사', '합의', '쟁점', '협상', '대화', '회의'],
                'subcategories': ['협의 기록', '합의 사항', '쟁점 사항', '후속 조치']
            },
            'training_materials': {
                'name': '교육 자료',
                'keywords': ['교육', '훈련', '강의', '학습', '기술', '리더십', '역량'],
                'subcategories': ['기술 교육', '안전 교육', '법규 교육', '리더십 교육']
            }
        }
    
    def classify_document(self, content: str, filename: str = "") -> Dict[str, Any]:
        """문서를 자동으로 분류"""
        try:
            # 파일명과 내용을 결합하여 분석
            full_text = f"{filename} {content}".lower()
            
            # 각 카테고리별 점수 계산
            category_scores = {}
            for category_id, category_info in self.categories.items():
                score = 0
                for keyword in category_info['keywords']:
                    if keyword.lower() in full_text:
                        score += 1
                
                # 파일명 기반 추가 점수
                if any(keyword.lower() in filename.lower() for keyword in category_info['keywords']):
                    score += 2
                
                category_scores[category_id] = score
            
            # 가장 높은 점수의 카테고리 선택
            best_category = max(category_scores.items(), key=lambda x: x[1])
            
            # 신뢰도 계산 (0.7-1.0 범위)
            max_possible_score = len(self.categories[best_category[0]]['keywords']) + 2
            confidence = min(1.0, 0.7 + (best_category[1] / max_possible_score) * 0.3)
            
            # 서브카테고리 선택 (간단한 랜덤 선택)
            import random
            subcategory = random.choice(self.categories[best_category[0]]['subcategories'])
            
            return {
                'category': best_category[0],
                'category_name': self.categories[best_category[0]]['name'],
                'subcategory': subcategory,
                'confidence': round(confidence, 3),
                'scores': category_scores
            }
            
        except Exception as e:
            return {
                'category': 'union_policy',
                'category_name': '조합 정책',
                'subcategory': '기타',
                'confidence': 0.7,
                'error': str(e)
            }
    
    def extract_tags(self, content: str, filename: str = "") -> List[str]:
        """문서에서 태그 추출"""
        try:
            tags = []
            full_text = f"{filename} {content}".lower()
            
            # 연도 태그
            import re
            year_pattern = r'\b(20\d{2})\b'
            years = re.findall(year_pattern, full_text)
            tags.extend(years)
            
            # 일반적인 태그 키워드
            tag_keywords = [
                '가이드라인', '안내', '규정', '정책', '매뉴얼', '교육', '훈련',
                '복지', '혜택', '의료', '안전', '협의', '회의', '총회'
            ]
            
            for keyword in tag_keywords:
                if keyword in full_text:
                    tags.append(keyword)
            
            # 중복 제거 및 정렬
            return sorted(list(set(tags)))
            
        except Exception as e:
            return ['문서', '업로드']

# AI 인사이트 생성
class AIInsightGenerator:
    def __init__(self):
        self.insight_templates = {
            'topic': [
                '이 문서는 {category} 분야의 중요한 자료입니다.',
                '{category} 관련 최신 정보가 포함되어 있습니다.',
                '조합원들이 {category}에 대해 알아야 할 내용입니다.'
            ],
            'recommendation': [
                '이 자료를 기반으로 교육 프로그램을 개발하는 것을 권장합니다.',
                '관련 부서와의 협의가 필요할 것으로 보입니다.',
                '조합원들에게 적극적으로 홍보하는 것이 좋겠습니다.'
            ],
            'summary': [
                '이 문서는 {category} 분야의 핵심 내용을 담고 있습니다.',
                '조합원들의 업무에 직접적으로 도움이 될 내용입니다.',
                '현재 상황과 연관성이 높은 자료입니다.'
            ]
        }
    
    def generate_insights(self, document_info: Dict[str, Any]) -> List[Dict[str, Any]]:
        """문서에 대한 AI 인사이트 생성"""
        try:
            insights = []
            
            # 주제 인사이트
            topic_insight = {
                'id': str(uuid.uuid4()),
                'type': 'topic',
                'content': f"이 문서는 {document_info.get('category_name', '일반')} 분야의 중요한 자료입니다.",
                'confidence': 0.9,
                'timestamp': datetime.now().isoformat()
            }
            insights.append(topic_insight)
            
            # 추천 인사이트
            if document_info.get('confidence', 0) > 0.8:
                recommendation_insight = {
                    'id': str(uuid.uuid4()),
                    'type': 'recommendation',
                    'content': '이 자료를 기반으로 교육 프로그램을 개발하는 것을 권장합니다.',
                    'confidence': 0.85,
                    'timestamp': datetime.now().isoformat()
                }
                insights.append(recommendation_insight)
            
            # 요약 인사이트
            summary_insight = {
                'id': str(uuid.uuid4()),
                'type': 'summary',
                'content': f"조합원들의 {document_info.get('category_name', '업무')}에 직접적으로 도움이 될 내용입니다.",
                'confidence': 0.88,
                'timestamp': datetime.now().isoformat()
            }
            insights.append(summary_insight)
            
            return insights
            
        except Exception as e:
            return [{
                'id': str(uuid.uuid4()),
                'type': 'error',
                'content': f'인사이트 생성 중 오류가 발생했습니다: {str(e)}',
                'confidence': 0.0,
                'timestamp': datetime.now().isoformat()
            }]

# 딥러닝 학습 관리
class DeepLearningTrainer:
    def __init__(self):
        self.is_training = False
        self.training_progress = 0
        self.current_epoch = 0
        self.total_epochs = 10
        self.accuracy = 0.0
        self.loss = 1.0
        self.status = "대기 중"
    
    def start_training(self, documents: List[Dict[str, Any]]) -> Dict[str, Any]:
        """딥러닝 학습 시작"""
        try:
            self.is_training = True
            self.status = "학습 시작"
            
            # 학습 시뮬레이션
            for epoch in range(1, self.total_epochs + 1):
                self.current_epoch = epoch
                self.training_progress = (epoch / self.total_epochs) * 100
                
                # 정확도와 손실 시뮬레이션
                self.accuracy = 0.7 + (epoch / self.total_epochs) * 0.25
                self.loss = 0.5 - (epoch / self.total_epochs) * 0.4
                
                self.status = f"에포크 {epoch}/{self.total_epochs} 학습 중"
                
                # 실제로는 여기서 딥러닝 모델 학습
                import time
                time.sleep(1)  # 시뮬레이션용 대기
            
            self.is_training = False
            self.status = "학습 완료"
            self.accuracy = 0.95
            self.loss = 0.05
            
            return {
                'success': True,
                'final_accuracy': self.accuracy,
                'final_loss': self.loss,
                'total_documents': len(documents)
            }
            
        except Exception as e:
            self.is_training = False
            self.status = f"학습 실패: {str(e)}"
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_training_status(self) -> Dict[str, Any]:
        """학습 상태 조회"""
        return {
            'is_training': self.is_training,
            'progress': self.training_progress,
            'current_epoch': self.current_epoch,
            'total_epochs': self.total_epochs,
            'accuracy': round(self.accuracy, 3),
            'loss': round(self.loss, 3),
            'status': self.status
        }

# 지식 관리 시스템 메인 클래스
class KnowledgeManagementSystem:
    def __init__(self):
        self.file_manager = KnowledgeFileManager()
        self.classifier = DocumentClassifier()
        self.insight_generator = AIInsightGenerator()
        self.trainer = DeepLearningTrainer()
        self.documents = []
    
    def process_uploaded_file(self, file_content: bytes, filename: str) -> Dict[str, Any]:
        """업로드된 파일 처리"""
        try:
            # 1. 파일 저장
            file_metadata = self.file_manager.save_uploaded_file(file_content, filename)
            
            # 2. 파일 내용 추출 (실제로는 PDF, DOCX 파서 사용)
            content = self.extract_file_content(file_content, filename)
            
            # 3. 문서 분류
            classification = self.classifier.classify_document(content, filename)
            
            # 4. 태그 추출
            tags = self.classifier.extract_tags(content, filename)
            
            # 5. AI 인사이트 생성
            insights = self.insight_generator.generate_insights(classification)
            
            # 6. 문서 정보 생성
            document_info = {
                'id': file_metadata['id'],
                'title': filename.replace(Path(filename).suffix, ''),
                'content': content[:500] + "..." if len(content) > 500 else content,
                'category': classification['category'],
                'category_name': classification['category_name'],
                'subcategory': classification['subcategory'],
                'tags': tags,
                'fileType': file_metadata['file_type'],
                'fileSize': file_metadata['file_size'],
                'uploadDate': file_metadata['upload_date'],
                'lastModified': file_metadata['upload_date'],
                'confidence': classification['confidence'],
                'isProcessed': True,
                'isTraining': False,
                'aiInsights': [insight['content'] for insight in insights],
                'usage': 0,
                'rating': 0.0
            }
            
            # 7. 처리된 파일을 카테고리별로 이동
            processed_path = self.file_manager.move_to_processed(
                file_metadata['id'], 
                classification['category']
            )
            
            # 8. 문서 목록에 추가
            self.documents.append(document_info)
            
            return {
                'success': True,
                'document': document_info,
                'classification': classification,
                'insights': insights
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def extract_file_content(self, file_content: bytes, filename: str) -> str:
        """파일에서 텍스트 내용 추출"""
        try:
            # 실제로는 여기서 PDF, DOCX 등의 파서를 사용
            # 현재는 시뮬레이션용 더미 텍스트 반환
            return f"업로드된 문서 {filename}의 내용입니다. 이 문서는 조합원들의 업무에 도움이 되는 중요한 정보를 포함하고 있습니다."
        except Exception as e:
            return f"문서 내용 추출 실패: {str(e)}"
    
    def get_documents(self, category: str = None, search: str = None) -> List[Dict[str, Any]]:
        """문서 목록 조회"""
        try:
            filtered_docs = self.documents
            
            # 카테고리 필터
            if category and category != 'all':
                filtered_docs = [doc for doc in filtered_docs if doc['category'] == category]
            
            # 검색 필터
            if search:
                search_lower = search.lower()
                filtered_docs = [doc for doc in filtered_docs if 
                               search_lower in doc['title'].lower() or
                               search_lower in doc['content'].lower() or
                               any(search_lower in tag.lower() for tag in doc['tags'])]
            
            return filtered_docs
            
        except Exception as e:
            return []
    
    def start_ai_training(self) -> Dict[str, Any]:
        """AI 딥러닝 학습 시작"""
        return self.trainer.start_training(self.documents)
    
    def get_training_status(self) -> Dict[str, Any]:
        """학습 상태 조회"""
        return self.trainer.get_training_status()
    
    def delete_document(self, document_id: str) -> Dict[str, Any]:
        """문서 삭제"""
        try:
            self.documents = [doc for doc in self.documents if doc['id'] != document_id]
            return {'success': True, 'message': '문서가 삭제되었습니다.'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def update_document_usage(self, document_id: str) -> Dict[str, Any]:
        """문서 사용 횟수 업데이트"""
        try:
            for doc in self.documents:
                if doc['id'] == document_id:
                    doc['usage'] += 1
                    return {'success': True, 'usage': doc['usage']}
            return {'success': False, 'error': '문서를 찾을 수 없습니다.'}
        except Exception as e:
            return {'success': False, 'error': str(e)}

# 전역 인스턴스
knowledge_system = KnowledgeManagementSystem() 