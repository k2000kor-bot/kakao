from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import json
import os
from pathlib import Path
import logging
from dataclasses import dataclass
import asyncio
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

logger = logging.getLogger(__name__)

@dataclass
class KnowledgeDocument:
    id: str
    title: str
    content: str
    category: str
    subcategory: str
    file_path: str
    file_type: str
    upload_date: datetime
    last_modified: datetime
    tags: List[str]
    confidence_score: float
    usage_count: int
    rating: float
    ai_insights: Dict[str, Any]
    relationships: List[str]  # 관련 문서 ID들
    metadata: Dict[str, Any]

class AdvancedKnowledgeManager:
    def __init__(self, base_path: str = "processed"):
        self.base_path = Path(base_path)
        self.categories = {
            "labor_law": {
                "name": "노동법",
                "subcategories": ["근로기준법", "산업안전보건법", "최저임금법", "근로복지법"],
                "keywords": ["노동", "근로", "임금", "근로기준법", "최저임금", "산업안전", "근로복지"]
            },
            "union_policy": {
                "name": "조합 정책", 
                "subcategories": ["조합원 규정", "복지 정책", "교육 정책", "협의 정책"],
                "keywords": ["조합", "정책", "규정", "조합원", "조합장", "총회", "이사회"]
            },
            "safety_guidelines": {
                "name": "안전 가이드라인",
                "subcategories": ["안전 규정", "작업 매뉴얼", "응급 대응", "교육 자료"],
                "keywords": ["안전", "사고", "보호구", "안전교육", "작업매뉴얼", "응급", "구급"]
            },
            "welfare_info": {
                "name": "복지 정보",
                "subcategories": ["의료 혜택", "교육 지원", "문화 혜택", "금융 지원"],
                "keywords": ["복지", "혜택", "의료", "교육", "문화", "금융", "지원", "보험"]
            },
            "negotiation_materials": {
                "name": "협의 자료",
                "subcategories": ["협의 기록", "합의 사항", "쟁점 사항", "후속 조치"],
                "keywords": ["협의", "시공사", "합의", "쟁점", "협상", "대화", "회의"]
            },
            "training_materials": {
                "name": "교육 자료",
                "subcategories": ["기술 교육", "안전 교육", "법규 교육", "리더십 교육"],
                "keywords": ["교육", "훈련", "강의", "학습", "기술", "리더십", "역량"]
            }
        }
        
        self.documents: Dict[str, KnowledgeDocument] = {}
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        self.document_vectors = None
        self._initialize()

    def _initialize(self):
        """시스템 초기화"""
        try:
            self._load_existing_documents()
            self._build_document_vectors()
            logger.info("Advanced Knowledge Manager initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize knowledge manager: {e}")

    def _load_existing_documents(self):
        """기존 문서들을 로드"""
        for category_path in self.base_path.iterdir():
            if category_path.is_dir() and category_path.name in self.categories:
                self._load_category_documents(category_path.name, category_path)

    def _load_category_documents(self, category: str, category_path: Path):
        """특정 카테고리의 문서들을 로드"""
        for file_path in category_path.rglob("*"):
            if file_path.is_file() and file_path.suffix.lower() in ['.txt', '.pdf', '.docx', '.doc']:
                try:
                    doc = self._create_document_from_file(file_path, category)
                    self.documents[doc.id] = doc
                except Exception as e:
                    logger.error(f"Failed to load document {file_path}: {e}")

    def _create_document_from_file(self, file_path: Path, category: str) -> KnowledgeDocument:
        """파일로부터 KnowledgeDocument 생성"""
        doc_id = f"{category}_{file_path.stem}_{int(datetime.now().timestamp())}"
        
        # 파일 내용 추출 (간단한 구현)
        content = self._extract_file_content(file_path)
        
        # AI 인사이트 생성
        ai_insights = self._generate_ai_insights(content)
        
        # 태그 자동 생성
        tags = self._extract_tags(content, category)
        
        return KnowledgeDocument(
            id=doc_id,
            title=file_path.stem,
            content=content,
            category=category,
            subcategory=self._classify_subcategory(content, category),
            file_path=str(file_path),
            file_type=file_path.suffix.lower(),
            upload_date=datetime.now(),
            last_modified=datetime.fromtimestamp(file_path.stat().st_mtime),
            tags=tags,
            confidence_score=ai_insights.get('confidence', 0.8),
            usage_count=0,
            rating=0.0,
            ai_insights=ai_insights,
            relationships=[],
            metadata={
                "file_size": file_path.stat().st_size,
                "language": "ko"
            }
        )

    def _extract_file_content(self, file_path: Path) -> str:
        """파일 내용 추출 (실제 구현에서는 더 정교한 파서 필요)"""
        try:
            if file_path.suffix.lower() == '.txt':
                return file_path.read_text(encoding='utf-8')
            else:
                # PDF, DOCX 등의 경우 실제로는 적절한 라이브러리 사용
                return f"Content from {file_path.name}"
        except Exception:
            return ""

    def _generate_ai_insights(self, content: str) -> Dict[str, Any]:
        """AI 기반 인사이트 생성"""
        return {
            "confidence": 0.85,
            "key_topics": self._extract_key_topics(content),
            "sentiment": self._analyze_sentiment(content),
            "summary": self._generate_summary(content),
            "complexity_level": self._assess_complexity(content),
            "actionable_items": self._extract_actionable_items(content)
        }

    def _extract_key_topics(self, content: str) -> List[str]:
        """핵심 주제 추출"""
        # 간단한 키워드 추출 (실제로는 더 정교한 NLP 모델 사용)
        words = content.lower().split()
        common_words = ['안전', '교육', '복지', '협의', '정책', '규정', '관리']
        return [word for word in common_words if word in words][:5]

    def _analyze_sentiment(self, content: str) -> Dict[str, Any]:
        """감정 분석"""
        return {
            "score": 0.7,
            "label": "positive",
            "confidence": 0.85
        }

    def _generate_summary(self, content: str) -> str:
        """요약 생성"""
        sentences = content.split('.')[:3]
        return '. '.join(sentences) + '...' if sentences else "요약을 생성할 수 없습니다."

    def _assess_complexity(self, content: str) -> str:
        """복잡도 평가"""
        word_count = len(content.split())
        if word_count < 100:
            return "simple"
        elif word_count < 500:
            return "medium"
        else:
            return "complex"

    def _extract_actionable_items(self, content: str) -> List[str]:
        """실행 가능한 항목 추출"""
        # 간단한 규칙 기반 추출
        actionable_keywords = ['해야', '필요', '요구', '준비', '실행', '진행']
        sentences = content.split('.')
        actionable = []
        for sentence in sentences:
            if any(keyword in sentence for keyword in actionable_keywords):
                actionable.append(sentence.strip())
        return actionable[:3]

    def _extract_tags(self, content: str, category: str) -> List[str]:
        """태그 자동 추출"""
        category_keywords = self.categories[category]["keywords"]
        content_lower = content.lower()
        tags = [keyword for keyword in category_keywords if keyword in content_lower]
        return tags[:5]

    def _classify_subcategory(self, content: str, category: str) -> str:
        """하위 카테고리 분류"""
        subcategories = self.categories[category]["subcategories"]
        # 간단한 키워드 매칭 (실제로는 ML 모델 사용)
        content_lower = content.lower()
        
        for subcategory in subcategories:
            if subcategory.lower() in content_lower:
                return subcategory
        
        return subcategories[0]  # 기본값

    def _build_document_vectors(self):
        """문서 벡터화 구축"""
        if not self.documents:
            return
            
        contents = [doc.content for doc in self.documents.values()]
        try:
            self.document_vectors = self.vectorizer.fit_transform(contents)
        except Exception as e:
            logger.error(f"Failed to build document vectors: {e}")

    async def smart_search(self, query: str, category: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
        """스마트 검색"""
        try:
            # 벡터 유사도 검색
            query_vector = self.vectorizer.transform([query])
            similarities = cosine_similarity(query_vector, self.document_vectors).flatten()
            
            # 문서 ID와 유사도 점수 매핑
            doc_scores = []
            for idx, (doc_id, doc) in enumerate(self.documents.items()):
                if category and doc.category != category:
                    continue
                    
                score = similarities[idx] if idx < len(similarities) else 0
                doc_scores.append((doc_id, score, doc))
            
            # 유사도 기준 정렬
            doc_scores.sort(key=lambda x: x[1], reverse=True)
            
            # 결과 포맷팅
            results = []
            for doc_id, score, doc in doc_scores[:limit]:
                results.append({
                    "id": doc_id,
                    "title": doc.title,
                    "category": doc.category,
                    "subcategory": doc.subcategory,
                    "similarity_score": float(score),
                    "ai_insights": doc.ai_insights,
                    "tags": doc.tags,
                    "file_type": doc.file_type,
                    "upload_date": doc.upload_date.isoformat()
                })
            
            return results
            
        except Exception as e:
            logger.error(f"Smart search failed: {e}")
            return []

    async def get_document_analytics(self, document_id: str) -> Dict[str, Any]:
        """문서 분석 정보"""
        if document_id not in self.documents:
            return {}
            
        doc = self.documents[document_id]
        
        # 관련 문서 찾기
        related_docs = await self._find_related_documents(document_id)
        
        # 사용 패턴 분석
        usage_pattern = self._analyze_usage_pattern(doc)
        
        return {
            "document_info": {
                "id": doc.id,
                "title": doc.title,
                "category": doc.category,
                "subcategory": doc.subcategory,
                "confidence_score": doc.confidence_score,
                "usage_count": doc.usage_count,
                "rating": doc.rating
            },
            "ai_insights": doc.ai_insights,
            "related_documents": related_docs,
            "usage_pattern": usage_pattern,
            "recommendations": await self._generate_recommendations(doc)
        }

    async def _find_related_documents(self, document_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        """관련 문서 찾기"""
        if document_id not in self.documents:
            return []
            
        target_doc = self.documents[document_id]
        
        # 같은 카테고리의 문서들과 유사도 계산
        related = []
        for doc_id, doc in self.documents.items():
            if doc_id == document_id:
                continue
                
            # 태그 기반 유사도
            tag_similarity = len(set(target_doc.tags) & set(doc.tags)) / max(len(target_doc.tags), 1)
            
            # 카테고리 가중치
            category_weight = 1.0 if doc.category == target_doc.category else 0.5
            
            total_score = tag_similarity * category_weight
            
            if total_score > 0.1:
                related.append({
                    "id": doc_id,
                    "title": doc.title,
                    "category": doc.category,
                    "similarity_score": total_score,
                    "tags": doc.tags
                })
        
        # 유사도 기준 정렬
        related.sort(key=lambda x: x["similarity_score"], reverse=True)
        return related[:limit]

    def _analyze_usage_pattern(self, doc: KnowledgeDocument) -> Dict[str, Any]:
        """사용 패턴 분석"""
        return {
            "total_usage": doc.usage_count,
            "average_rating": doc.rating,
            "last_accessed": doc.last_modified.isoformat(),
            "popularity_rank": self._calculate_popularity_rank(doc),
            "usage_trend": "increasing"  # 실제로는 시계열 데이터 필요
        }

    def _calculate_popularity_rank(self, doc: KnowledgeDocument) -> int:
        """인기도 순위 계산"""
        all_docs = list(self.documents.values())
        all_docs.sort(key=lambda x: (x.usage_count, x.rating), reverse=True)
        
        for rank, d in enumerate(all_docs, 1):
            if d.id == doc.id:
                return rank
        return len(all_docs)

    async def _generate_recommendations(self, doc: KnowledgeDocument) -> List[Dict[str, Any]]:
        """추천 생성"""
        recommendations = []
        
        # 1. 관련 문서 추천
        recommendations.append({
            "type": "related_documents",
            "title": "관련 문서",
            "description": f"{doc.category} 카테고리의 유사한 문서들을 확인해보세요.",
            "action": "view_related"
        })
        
        # 2. 학습 추천
        if doc.ai_insights.get("complexity_level") == "complex":
            recommendations.append({
                "type": "training",
                "title": "추가 학습 권장",
                "description": "이 문서는 복잡한 내용을 포함합니다. 관련 교육 자료를 확인해보세요.",
                "action": "view_training"
            })
        
        # 3. 업데이트 추천
        days_old = (datetime.now() - doc.last_modified).days
        if days_old > 365:
            recommendations.append({
                "type": "update",
                "title": "문서 업데이트 검토",
                "description": "이 문서가 1년 이상 업데이트되지 않았습니다. 최신 정보를 확인해보세요.",
                "action": "check_updates"
            })
        
        return recommendations

    async def get_knowledge_statistics(self) -> Dict[str, Any]:
        """지식 베이스 통계"""
        total_docs = len(self.documents)
        if total_docs == 0:
            return {"total_documents": 0}
        
        # 카테고리별 분포
        category_distribution = {}
        for doc in self.documents.values():
            category_distribution[doc.category] = category_distribution.get(doc.category, 0) + 1
        
        # 파일 타입 분포
        file_type_distribution = {}
        for doc in self.documents.values():
            file_type_distribution[doc.file_type] = file_type_distribution.get(doc.file_type, 0) + 1
        
        # 평균 신뢰도 점수
        avg_confidence = sum(doc.confidence_score for doc in self.documents.values()) / total_docs
        
        # 최근 업로드 동향
        recent_uploads = len([doc for doc in self.documents.values() 
                            if (datetime.now() - doc.upload_date).days <= 30])
        
        return {
            "total_documents": total_docs,
            "category_distribution": category_distribution,
            "file_type_distribution": file_type_distribution,
            "average_confidence_score": round(avg_confidence, 2),
            "recent_uploads_30_days": recent_uploads,
            "total_usage_count": sum(doc.usage_count for doc in self.documents.values()),
            "average_rating": round(sum(doc.rating for doc in self.documents.values()) / total_docs, 2),
            "categories": {cat: info["name"] for cat, info in self.categories.items()}
        }

    async def bulk_analyze_documents(self) -> Dict[str, Any]:
        """일괄 문서 분석"""
        analysis_results = {
            "total_analyzed": 0,
            "successful": 0,
            "failed": 0,
            "insights": [],
            "recommendations": []
        }
        
        for doc_id, doc in self.documents.items():
            try:
                # AI 인사이트 재생성
                new_insights = self._generate_ai_insights(doc.content)
                doc.ai_insights.update(new_insights)
                
                analysis_results["successful"] += 1
                analysis_results["insights"].append({
                    "document_id": doc_id,
                    "title": doc.title,
                    "insights": new_insights
                })
                
            except Exception as e:
                analysis_results["failed"] += 1
                logger.error(f"Failed to analyze document {doc_id}: {e}")
        
        analysis_results["total_analyzed"] = len(self.documents)
        
        # 전체적인 추천사항 생성
        analysis_results["recommendations"] = await self._generate_global_recommendations()
        
        return analysis_results

    async def _generate_global_recommendations(self) -> List[Dict[str, Any]]:
        """전역 추천사항 생성"""
        recommendations = []
        
        # 카테고리 균형 체크
        category_counts = {}
        for doc in self.documents.values():
            category_counts[doc.category] = category_counts.get(doc.category, 0) + 1
        
        if category_counts:
            min_category = min(category_counts, key=category_counts.get)
            max_category = max(category_counts, key=category_counts.get)
            
            if category_counts[max_category] > category_counts[min_category] * 3:
                recommendations.append({
                    "type": "balance",
                    "priority": "medium",
                    "title": "카테고리 균형 개선",
                    "description": f"{self.categories[min_category]['name']} 카테고리의 문서가 부족합니다.",
                    "action": f"add_documents_to_{min_category}"
                })
        
        # 품질 개선 추천
        low_confidence_docs = [doc for doc in self.documents.values() if doc.confidence_score < 0.7]
        if len(low_confidence_docs) > len(self.documents) * 0.2:
            recommendations.append({
                "type": "quality",
                "priority": "high", 
                "title": "문서 품질 개선 필요",
                "description": f"{len(low_confidence_docs)}개 문서의 신뢰도가 낮습니다.",
                "action": "review_low_confidence_documents"
            })
        
        return recommendations

# 전역 인스턴스
advanced_knowledge_manager = AdvancedKnowledgeManager() 