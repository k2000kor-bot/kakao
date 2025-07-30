import json
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any
import logging
from dataclasses import dataclass, asdict
import asyncio
import hashlib
import uuid

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class ProjectDocument:
    """프로젝트 문서"""
    id: str
    title: str
    content: str
    document_type: str  # 'guideline', 'reference', 'template', 'example'
    category: str
    tags: List[str]
    created_at: str
    updated_at: str
    version: int
    metadata: Dict[str, Any]


@dataclass
class ProjectGuideline:
    """프로젝트 지침"""
    id: str
    title: str
    description: str
    logic_chain: List[Dict[str, Any]]  # 논리 체인
    conditions: List[str]
    recommendations: List[str]
    priority: int
    category: str
    created_at: str
    updated_at: str
    effectiveness_score: float


@dataclass
class Project:
    """프로젝트"""
    id: str
    name: str
    description: str
    project_type: str  # 'construction', 'management', 'analysis', 'custom'
    status: str  # 'active', 'archived', 'template'
    created_at: str
    updated_at: str
    documents: List[ProjectDocument]
    guidelines: List[ProjectGuideline]
    ai_config: Dict[str, Any]
    metadata: Dict[str, Any]


class IntelligentProjectManager:
    """지능형 프로젝트 관리 시스템"""
    
    def __init__(self, data_dir: str = "project_data"):
        self.data_dir = Path(data_dir)
        self.projects_dir = self.data_dir / "projects"
        self.templates_dir = self.data_dir / "templates"
        self.ai_models_dir = self.data_dir / "ai_models"
        
        self.ensure_directories()
        self.projects: Dict[str, Project] = {}
        self.load_projects()
        
        # AI 지침 생성 엔진
        self.guideline_engine = GuidelineEngine()
        
        # 재개발 전문 AI 시스템
        from redevelopment_ai_specialist import RedevelopmentAISpecialist
        self.redevelopment_specialist = RedevelopmentAISpecialist()
        
    def ensure_directories(self):
        """필요한 디렉토리 생성"""
        for directory in [self.projects_dir, self.templates_dir, self.ai_models_dir]:
            directory.mkdir(parents=True, exist_ok=True)
            
    def create_project(self, name: str, description: str, 
                      project_type: str = "custom", 
                      template_id: Optional[str] = None) -> str:
        """새 프로젝트 생성"""
        project_id = str(uuid.uuid4())
        
        # 템플릿 기반 생성
        if template_id and template_id in self.projects:
            template = self.projects[template_id]
            documents = [self._copy_document(doc) for doc in template.documents]
            guidelines = [self._copy_guideline(guide) for guide in template.guidelines]
            ai_config = template.ai_config.copy()
        else:
            documents = []
            guidelines = []
            ai_config = self._get_default_ai_config(project_type)
            
        project = Project(
            id=project_id,
            name=name,
            description=description,
            project_type=project_type,
            status="active",
            created_at=datetime.now().isoformat(),
            updated_at=datetime.now().isoformat(),
            documents=documents,
            guidelines=guidelines,
            ai_config=ai_config,
            metadata={}
        )
        
        self.projects[project_id] = project
        self.save_project(project_id)
        
        # 기본 지침 생성
        self._generate_initial_guidelines(project_id)
        
        logger.info(f"새 프로젝트 생성: {name} (ID: {project_id})")
        return project_id
        
    def add_document(self, project_id: str, title: str, content: str,
                    document_type: str, category: str, tags: List[str] = None) -> str:
        """프로젝트에 문서 추가"""
        if project_id not in self.projects:
            raise ValueError(f"프로젝트를 찾을 수 없습니다: {project_id}")
            
        doc_id = str(uuid.uuid4())
        document = ProjectDocument(
            id=doc_id,
            title=title,
            content=content,
            document_type=document_type,
            category=category,
            tags=tags or [],
            created_at=datetime.now().isoformat(),
            updated_at=datetime.now().isoformat(),
            version=1,
            metadata={}
        )
        
        self.projects[project_id].documents.append(document)
        self.projects[project_id].updated_at = datetime.now().isoformat()
        self.save_project(project_id)
        
        # 새 문서 기반 지침 업데이트
        asyncio.run(self._update_guidelines_based_on_document(project_id, document))
        
        logger.info(f"문서 추가: {title} -> 프로젝트 {project_id}")
        return doc_id
        
    def generate_intelligent_guideline(self, project_id: str, context: str,
                                     user_query: str) -> Dict[str, Any]:
        """지능형 지침 생성"""
        if project_id not in self.projects:
            raise ValueError(f"프로젝트를 찾을 수 없습니다: {project_id}")
            
        project = self.projects[project_id]
        
        # 관련 문서 검색
        relevant_docs = self._find_relevant_documents(project, user_query)
        
        # 기존 지침 분석
        relevant_guidelines = self._find_relevant_guidelines(project, user_query)
        
        # AI 지침 생성
        guideline = self.guideline_engine.generate_guideline(
            context=context,
            query=user_query,
            documents=relevant_docs,
            existing_guidelines=relevant_guidelines,
            project_config=project.ai_config
        )
        
        # 프로젝트에 지침 추가
        guideline_id = str(uuid.uuid4())
        project_guideline = ProjectGuideline(
            id=guideline_id,
            title=guideline["title"],
            description=guideline["description"],
            logic_chain=guideline["logic_chain"],
            conditions=guideline["conditions"],
            recommendations=guideline["recommendations"],
            priority=guideline["priority"],
            category=guideline["category"],
            created_at=datetime.now().isoformat(),
            updated_at=datetime.now().isoformat(),
            effectiveness_score=0.0
        )
        
        project.guidelines.append(project_guideline)
        project.updated_at = datetime.now().isoformat()
        self.save_project(project_id)
        
        return {
            "guideline_id": guideline_id,
            "guideline": asdict(project_guideline),
            "reasoning": guideline.get("reasoning", ""),
            "confidence": guideline.get("confidence", 0.0)
        }
        
    def query_project_intelligence(self, project_id: str, query: str) -> Dict[str, Any]:
        """프로젝트 지능형 질의응답"""
        if project_id not in self.projects:
            raise ValueError(f"프로젝트를 찾을 수 없습니다: {project_id}")
            
        project = self.projects[project_id]
        
        # 컨텍스트 구축
        context = self._build_project_context(project)
        
        # 질의 분석 및 응답 생성
        response = self.guideline_engine.process_query(
            query=query,
            context=context,
            project_config=project.ai_config
        )
        
        return {
            "query": query,
            "response": response["answer"],
            "reasoning": response["reasoning"],
            "confidence": response["confidence"],
            "related_documents": response.get("related_documents", []),
            "suggested_actions": response.get("suggested_actions", [])
        }
        
    def analyze_project_patterns(self, project_id: str) -> Dict[str, Any]:
        """프로젝트 패턴 분석"""
        if project_id not in self.projects:
            raise ValueError(f"프로젝트를 찾을 수 없습니다: {project_id}")
            
        project = self.projects[project_id]
        
        # 문서 패턴 분석
        doc_patterns = self._analyze_document_patterns(project.documents)
        
        # 지침 효과성 분석
        guideline_effectiveness = self._analyze_guideline_effectiveness(project.guidelines)
        
        # 개선 제안
        improvements = self._suggest_improvements(project)
        
        return {
            "document_patterns": doc_patterns,
            "guideline_effectiveness": guideline_effectiveness,
            "improvements": improvements,
            "project_health_score": self._calculate_project_health_score(project)
        }
        
    def export_project_knowledge(self, project_id: str) -> Dict[str, Any]:
        """프로젝트 지식 내보내기"""
        if project_id not in self.projects:
            raise ValueError(f"프로젝트를 찾을 수 없습니다: {project_id}")
            
        project = self.projects[project_id]
        
        return {
            "project_info": {
                "id": project.id,
                "name": project.name,
                "description": project.description,
                "type": project.project_type,
                "created_at": project.created_at
            },
            "knowledge_base": {
                "documents": [asdict(doc) for doc in project.documents],
                "guidelines": [asdict(guide) for guide in project.guidelines]
            },
            "ai_insights": self.analyze_project_patterns(project_id),
            "export_timestamp": datetime.now().isoformat()
        }
        
    def _copy_document(self, original: ProjectDocument) -> ProjectDocument:
        """문서 복사"""
        return ProjectDocument(
            id=str(uuid.uuid4()),
            title=f"[복사] {original.title}",
            content=original.content,
            document_type=original.document_type,
            category=original.category,
            tags=original.tags.copy(),
            created_at=datetime.now().isoformat(),
            updated_at=datetime.now().isoformat(),
            version=1,
            metadata=original.metadata.copy()
        )
        
    def _copy_guideline(self, original: ProjectGuideline) -> ProjectGuideline:
        """지침 복사"""
        return ProjectGuideline(
            id=str(uuid.uuid4()),
            title=f"[복사] {original.title}",
            description=original.description,
            logic_chain=original.logic_chain.copy(),
            conditions=original.conditions.copy(),
            recommendations=original.recommendations.copy(),
            priority=original.priority,
            category=original.category,
            created_at=datetime.now().isoformat(),
            updated_at=datetime.now().isoformat(),
            effectiveness_score=0.0
        )
        
    def _get_default_ai_config(self, project_type: str) -> Dict[str, Any]:
        """기본 AI 설정"""
        base_config = {
            "reasoning_depth": 3,
            "confidence_threshold": 0.7,
            "max_context_length": 4000,
            "creativity_level": 0.5
        }
        
        if project_type == "construction":
            base_config.update({
                "focus_areas": ["안전", "품질", "일정", "비용"],
                "compliance_check": True,
                "risk_assessment": True
            })
        elif project_type == "management":
            base_config.update({
                "focus_areas": ["효율성", "품질", "의사소통", "팀워크"],
                "performance_tracking": True,
                "optimization_suggestions": True
            })
            
        return base_config
        
    def _generate_initial_guidelines(self, project_id: str):
        """초기 지침 생성"""
        project = self.projects[project_id]
        
        initial_guidelines = [
            {
                "title": "프로젝트 시작 가이드",
                "description": "새 프로젝트를 시작할 때 따라야 할 기본 절차",
                "logic_chain": [
                    {"step": 1, "action": "목표 설정", "reasoning": "명확한 목표는 프로젝트 성공의 기반"},
                    {"step": 2, "action": "리소스 확인", "reasoning": "필요한 자원을 미리 파악하여 계획 수립"},
                    {"step": 3, "action": "일정 계획", "reasoning": "체계적인 일정 관리로 효율성 확보"}
                ],
                "conditions": ["새 프로젝트 시작 시"],
                "recommendations": ["목표 문서화", "팀 구성", "일정표 작성"],
                "priority": 1,
                "category": "시작"
            }
        ]
        
        for guideline_data in initial_guidelines:
            guideline = ProjectGuideline(
                id=str(uuid.uuid4()),
                title=guideline_data["title"],
                description=guideline_data["description"],
                logic_chain=guideline_data["logic_chain"],
                conditions=guideline_data["conditions"],
                recommendations=guideline_data["recommendations"],
                priority=guideline_data["priority"],
                category=guideline_data["category"],
                created_at=datetime.now().isoformat(),
                updated_at=datetime.now().isoformat(),
                effectiveness_score=0.0
            )
            project.guidelines.append(guideline)
            
        self.save_project(project_id)
        
    def save_project(self, project_id: str):
        """프로젝트 저장"""
        if project_id not in self.projects:
            return
            
        project_file = self.projects_dir / f"{project_id}.json"
        with open(project_file, 'w', encoding='utf-8') as f:
            json.dump(asdict(self.projects[project_id]), f, 
                     ensure_ascii=False, indent=2)
                     
    def load_projects(self):
        """프로젝트 로드"""
        for project_file in self.projects_dir.glob("*.json"):
            try:
                with open(project_file, 'r', encoding='utf-8') as f:
                    project_data = json.load(f)
                    
                # 데이터 클래스로 변환
                documents = [ProjectDocument(**doc) for doc in project_data.get("documents", [])]
                guidelines = [ProjectGuideline(**guide) for guide in project_data.get("guidelines", [])]
                
                project = Project(
                    id=project_data["id"],
                    name=project_data["name"],
                    description=project_data["description"],
                    project_type=project_data["project_type"],
                    status=project_data["status"],
                    created_at=project_data["created_at"],
                    updated_at=project_data["updated_at"],
                    documents=documents,
                    guidelines=guidelines,
                    ai_config=project_data.get("ai_config", {}),
                    metadata=project_data.get("metadata", {})
                )
                
                self.projects[project.id] = project
                
            except Exception as e:
                logger.error(f"프로젝트 로드 오류 {project_file}: {e}")
                
    async def _update_guidelines_based_on_document(self, project_id: str, document: ProjectDocument):
        """문서 기반 지침 업데이트"""
        # 간단한 구현 - 실제로는 더 정교한 분석 필요
        logger.info(f"문서 '{document.title}' 기반 지침 업데이트 예정")
        
    def _find_relevant_documents(self, project: Project, query: str) -> List[ProjectDocument]:
        """관련 문서 검색"""
        relevant_docs = []
        query_lower = query.lower()
        
        for doc in project.documents:
            if (query_lower in doc.title.lower() or 
                query_lower in doc.content.lower() or
                any(tag in query_lower for tag in doc.tags)):
                relevant_docs.append(doc)
                
        return relevant_docs[:5]  # 최대 5개 반환
        
    def _find_relevant_guidelines(self, project: Project, query: str) -> List[ProjectGuideline]:
        """관련 지침 검색"""
        relevant_guidelines = []
        query_lower = query.lower()
        
        for guideline in project.guidelines:
            if (query_lower in guideline.title.lower() or 
                query_lower in guideline.description.lower()):
                relevant_guidelines.append(guideline)
                
        return relevant_guidelines[:3]  # 최대 3개 반환
        
    def _build_project_context(self, project: Project) -> str:
        """프로젝트 컨텍스트 구축"""
        context_parts = [
            f"프로젝트: {project.name}",
            f"설명: {project.description}",
            f"유형: {project.project_type}",
            f"문서 수: {len(project.documents)}",
            f"지침 수: {len(project.guidelines)}"
        ]
        
        # 최근 문서 요약
        if project.documents:
            recent_docs = sorted(project.documents, 
                               key=lambda x: x.updated_at, reverse=True)[:3]
            context_parts.append("최근 문서:")
            for doc in recent_docs:
                context_parts.append(f"- {doc.title} ({doc.category})")
                
        return "\n".join(context_parts)
        
    def _analyze_document_patterns(self, documents: List[ProjectDocument]) -> Dict[str, Any]:
        """문서 패턴 분석"""
        if not documents:
            return {"message": "분석할 문서가 없습니다."}
            
        # 카테고리별 분포
        categories = {}
        for doc in documents:
            categories[doc.category] = categories.get(doc.category, 0) + 1
            
        # 문서 유형별 분포
        doc_types = {}
        for doc in documents:
            doc_types[doc.document_type] = doc_types.get(doc.document_type, 0) + 1
            
        return {
            "total_documents": len(documents),
            "categories": categories,
            "document_types": doc_types,
            "average_content_length": sum(len(doc.content) for doc in documents) // len(documents)
        }
        
    def _analyze_guideline_effectiveness(self, guidelines: List[ProjectGuideline]) -> Dict[str, Any]:
        """지침 효과성 분석"""
        if not guidelines:
            return {"message": "분석할 지침이 없습니다."}
            
        avg_score = sum(g.effectiveness_score for g in guidelines) / len(guidelines)
        high_priority = len([g for g in guidelines if g.priority <= 2])
        
        return {
            "total_guidelines": len(guidelines),
            "average_effectiveness": avg_score,
            "high_priority_count": high_priority,
            "categories": list(set(g.category for g in guidelines))
        }
        
    def _suggest_improvements(self, project: Project) -> List[str]:
        """개선 제안"""
        suggestions = []
        
        if len(project.documents) < 3:
            suggestions.append("더 많은 기본 문서를 추가하여 프로젝트 지식베이스를 확장하세요.")
            
        if len(project.guidelines) < 5:
            suggestions.append("프로젝트별 지침을 더 구체적으로 만들어 보세요.")
            
        doc_categories = set(doc.category for doc in project.documents)
        if len(doc_categories) < 3:
            suggestions.append("다양한 카테고리의 문서를 추가하여 포괄적인 지식을 구축하세요.")
            
        return suggestions
        
    def _calculate_project_health_score(self, project: Project) -> float:
        """프로젝트 건강도 점수 계산"""
        score = 0.0
        
        # 문서 점수 (40%)
        doc_score = min(len(project.documents) * 10, 40)
        score += doc_score
        
        # 지침 점수 (30%)
        guideline_score = min(len(project.guidelines) * 6, 30)
        score += guideline_score
        
        # 다양성 점수 (20%)
        doc_categories = len(set(doc.category for doc in project.documents))
        diversity_score = min(doc_categories * 5, 20)
        score += diversity_score
        
        # 최신성 점수 (10%)
        recent_activity = any(
            (datetime.now() - datetime.fromisoformat(doc.updated_at.replace('Z', '+00:00').replace('+00:00', ''))).days < 7
            for doc in project.documents
        )
        if recent_activity:
            score += 10
            
        return min(score, 100.0)


class GuidelineEngine:
    """지침 생성 엔진"""
    
    def __init__(self):
        self.reasoning_patterns = {
            "문제_해결": ["문제 파악", "원인 분석", "해결책 도출", "실행 계획"],
            "의사_결정": ["상황 분석", "옵션 검토", "기준 적용", "최적 선택"],
            "위험_관리": ["위험 식별", "영향 평가", "대응 전략", "모니터링"],
            "품질_보증": ["기준 설정", "점검 절차", "개선 방안", "지속 관리"]
        }
        
    def generate_guideline(self, context: str, query: str, 
                          documents: List[ProjectDocument],
                          existing_guidelines: List[ProjectGuideline],
                          project_config: Dict[str, Any]) -> Dict[str, Any]:
        """지침 생성"""
        
        # 질의 분석
        query_analysis = self._analyze_query(query)
        
        # 논리 체인 구축
        logic_chain = self._build_logic_chain(query_analysis, documents, project_config)
        
        # 조건 및 권장사항 도출
        conditions = self._extract_conditions(context, query_analysis)
        recommendations = self._generate_recommendations(logic_chain, documents)
        
        return {
            "title": f"{query_analysis['main_topic']} 가이드라인",
            "description": f"{query_analysis['main_topic']}에 대한 체계적 접근 방법",
            "logic_chain": logic_chain,
            "conditions": conditions,
            "recommendations": recommendations,
            "priority": query_analysis.get("urgency", 3),
            "category": query_analysis.get("category", "일반"),
            "reasoning": f"분석된 맥락과 기존 지식을 바탕으로 {query_analysis['reasoning_type']} 접근법 적용",
            "confidence": 0.8
        }
        
    def process_query(self, query: str, context: str, 
                     project_config: Dict[str, Any]) -> Dict[str, Any]:
        """질의 처리"""
        
        # 질의 분석
        query_analysis = self._analyze_query(query)
        
        # 응답 생성
        answer = self._generate_answer(query, context, query_analysis)
        
        # 추론 과정 설명
        reasoning = self._explain_reasoning(query_analysis, context)
        
        return {
            "answer": answer,
            "reasoning": reasoning,
            "confidence": 0.85,
            "related_documents": [],
            "suggested_actions": self._suggest_actions(query_analysis)
        }
        
    def _analyze_query(self, query: str) -> Dict[str, Any]:
        """질의 분석"""
        # 간단한 키워드 기반 분석 (실제로는 더 정교한 NLP 필요)
        
        keywords = {
            "문제": ["문제", "오류", "에러", "실패", "안됨"],
            "방법": ["방법", "어떻게", "절차", "순서", "단계"],
            "기준": ["기준", "표준", "규칙", "정책", "가이드"],
            "개선": ["개선", "향상", "최적화", "효율", "품질"]
        }
        
        query_lower = query.lower()
        detected_categories = []
        
        for category, words in keywords.items():
            if any(word in query_lower for word in words):
                detected_categories.append(category)
                
        # 주요 토픽 추출
        main_topic = query[:50] + "..." if len(query) > 50 else query
        
        # 추론 유형 결정
        if "문제" in detected_categories:
            reasoning_type = "문제_해결"
        elif "방법" in detected_categories:
            reasoning_type = "의사_결정"
        elif "기준" in detected_categories:
            reasoning_type = "품질_보증"
        else:
            reasoning_type = "문제_해결"
            
        return {
            "main_topic": main_topic,
            "categories": detected_categories,
            "reasoning_type": reasoning_type,
            "urgency": 3,
            "category": detected_categories[0] if detected_categories else "일반"
        }
        
    def _build_logic_chain(self, query_analysis: Dict[str, Any], 
                          documents: List[ProjectDocument],
                          project_config: Dict[str, Any]) -> List[Dict[str, Any]]:
        """논리 체인 구축"""
        
        reasoning_type = query_analysis["reasoning_type"]
        steps = self.reasoning_patterns.get(reasoning_type, ["분석", "계획", "실행", "검토"])
        
        logic_chain = []
        for i, step in enumerate(steps, 1):
            logic_chain.append({
                "step": i,
                "action": step,
                "reasoning": f"{step}을 통해 체계적 접근",
                "evidence": f"기존 문서 및 모범 사례 기반"
            })
            
        return logic_chain
        
    def _generate_answer(self, query: str, context: str, query_analysis: Dict[str, Any]) -> str:
        """응답 생성"""
        main_topic = query_analysis.get("main_topic", "")
        categories = query_analysis.get("categories", [])
        
        if "문제" in categories:
            return f"{main_topic}에 대한 문제 해결 방안을 체계적으로 접근하여 원인을 파악하고 단계별 해결책을 수립하는 것이 중요합니다."
        elif "방법" in categories:
            return f"{main_topic}에 대한 구체적인 방법론을 제시하며, 단계별 절차를 따라 진행하시기 바랍니다."
        else:
            return f"{main_topic}에 대해 프로젝트 컨텍스트를 고려한 맞춤형 지침을 제공합니다."
            
    def _explain_reasoning(self, query_analysis: Dict[str, Any], context: str) -> str:
        """추론 과정 설명"""
        reasoning_type = query_analysis.get("reasoning_type", "문제_해결")
        return f"{reasoning_type} 방식을 적용하여 현재 프로젝트 상황과 기존 지식을 종합적으로 고려한 분석입니다."
        
    def _suggest_actions(self, query_analysis: Dict[str, Any]) -> List[str]:
        """행동 제안"""
        actions = []
        categories = query_analysis.get("categories", [])
        
        if "문제" in categories:
            actions.extend(["문제 상황 정확한 파악", "관련 문서 검토", "단계별 해결 계획 수립"])
        if "방법" in categories:
            actions.extend(["절차 문서 작성", "단계별 체크리스트 준비", "결과 검증 방법 설정"])
        if "기준" in categories:
            actions.extend(["기준 문서화", "평가 지표 설정", "정기적 점검 계획"])
            
        return actions[:5]  # 최대 5개


# 사용 예시 및 테스트
if __name__ == "__main__":
    # 프로젝트 관리자 초기화
    pm = IntelligentProjectManager()
    
    # 테스트 프로젝트 생성
    project_id = pm.create_project(
        name="개포우성7차 건설 프로젝트",
        description="개포우성7차 아파트 건설 관리 프로젝트",
        project_type="construction"
    )
    
    print(f"생성된 프로젝트 ID: {project_id}")
    
    # 문서 추가
    doc_id = pm.add_document(
        project_id=project_id,
        title="안전 관리 지침",
        content="건설 현장에서의 안전 관리 기본 원칙과 절차",
        document_type="guideline",
        category="안전",
        tags=["안전", "건설", "관리"]
    )
    
    print(f"추가된 문서 ID: {doc_id}")
    
    # 지능형 질의
    response = pm.query_project_intelligence(
        project_id=project_id,
        query="건설 현장 안전사고를 예방하려면 어떻게 해야 하나요?"
    )
    
    print("\n=== AI 응답 ===")
    print(f"질문: {response['query']}")
    print(f"답변: {response['response']}")
    print(f"추론: {response['reasoning']}")
    
    # 프로젝트 분석
    analysis = pm.analyze_project_patterns(project_id)
    print(f"\n=== 프로젝트 분석 ===")
    print(f"프로젝트 건강도: {analysis['project_health_score']}") 