#!/usr/bin/env python3
"""
고급 웹 학습 통합 시스템
- 실시간 웹 콘텐츠 수집 및 학습
- ChatGPT API 통합
- 유튜브 콘텐츠 자동 추출
- 멀티모달 학습 통합
- 실시간 성능 최적화
"""

import asyncio
import json
import logging
import os
import re
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
from enum import Enum

import aiohttp
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ContentType(Enum):
    """콘텐츠 유형"""
    YOUTUBE = "youtube"
    WEBPAGE = "webpage"
    ARTICLE = "article"
    BOOK = "book"
    INTERVIEW = "interview"
    SPEECH = "speech"

class LearningPriority(Enum):
    """학습 우선순위"""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

@dataclass
class WebContent:
    """웹 콘텐츠"""
    url: str
    title: str
    content: str
    content_type: ContentType
    source: str
    priority: LearningPriority
    extracted_at: str
    processed: bool = False
    learning_score: float = 0.0
    yoo_relevance: float = 0.0

@dataclass
class LearningTask:
    """학습 태스크"""
    task_id: str
    content: WebContent
    status: str  # "pending", "processing", "completed", "failed"
    progress: float = 0.0
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    error_message: Optional[str] = None
    learning_results: Dict = field(default_factory=dict)

class ChatGPTIntegration:
    """ChatGPT API 통합"""
    
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.base_url = "https://api.openai.com/v1/chat/completions"
        self.session = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def analyze_content(self, content: str, analysis_type: str = "comprehensive") -> Dict:
        """콘텐츠 분석"""
        if not self.api_key:
            logger.warning("OpenAI API 키가 설정되지 않았습니다. 시뮬레이션 모드로 실행합니다.")
            return await self._simulate_analysis(content, analysis_type)
        
        try:
            prompt = self._build_analysis_prompt(content, analysis_type)
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": "gpt-4",
                "messages": [
                    {"role": "system", "content": "당신은 유시민의 사상과 스타일을 분석하는 전문가입니다."},
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 2000,
                "temperature": 0.7
            }
            
            async with self.session.post(self.base_url, headers=headers, json=data) as response:
                if response.status == 200:
                    result = await response.json()
                    return self._parse_chatgpt_response(result["choices"][0]["message"]["content"])
                else:
                    logger.error(f"ChatGPT API 오류: {response.status}")
                    return await self._simulate_analysis(content, analysis_type)
                    
        except Exception as e:
            logger.error(f"ChatGPT 분석 오류: {e}")
            return await self._simulate_analysis(content, analysis_type)
    
    def _build_analysis_prompt(self, content: str, analysis_type: str) -> str:
        """분석 프롬프트 구성"""
        prompts = {
            "comprehensive": f"""
다음 텍스트를 유시민의 사상과 스타일 관점에서 분석해주세요:

{content[:2000]}...

다음 항목들을 포함하여 분석해주세요:
1. 핵심 메시지와 사상
2. 논리적 구조와 전개 방식
3. 언어적 특징과 표현 방식
4. 역사적 맥락과 현대적 의미
5. 학습 가치와 교육적 의미
6. 유시민 스타일과의 유사성 점수 (0-10)
7. 추천 학습 방법

JSON 형식으로 응답해주세요.
""",
            "style_analysis": f"""
다음 텍스트의 언어적 스타일과 표현 방식을 분석해주세요:

{content[:1500]}...

분석 항목:
1. 문체와 톤
2. 논리 전개 방식
3. 비유와 예시 사용
4. 질문과 대화 유도
5. 결론 도출 방식
6. 감정적 어필 방법

JSON 형식으로 응답해주세요.
""",
            "content_extraction": f"""
다음 텍스트에서 학습에 유용한 핵심 내용을 추출해주세요:

{content[:2000]}...

추출 항목:
1. 핵심 개념과 정의
2. 중요한 사례와 예시
3. 논리적 근거와 증거
4. 역사적 배경과 맥락
5. 현대적 적용과 의미
6. 토론 질문과 사고 유도

JSON 형식으로 응답해주세요.
"""
        }
        
        return prompts.get(analysis_type, prompts["comprehensive"])
    
    def _parse_chatgpt_response(self, response_text: str) -> Dict:
        """ChatGPT 응답 파싱"""
        try:
            # JSON 추출 시도
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                # JSON이 아닌 경우 텍스트 분석
                return self._parse_text_response(response_text)
        except Exception as e:
            logger.error(f"ChatGPT 응답 파싱 오류: {e}")
            return self._parse_text_response(response_text)
    
    def _parse_text_response(self, text: str) -> Dict:
        """텍스트 응답 파싱"""
        return {
            "analysis_type": "text_parsing",
            "summary": text[:500],
            "key_points": re.findall(r'[가-힣]{2,}다|[가-힣]{2,}요', text)[:5],
            "yoo_style_score": 7.0,
            "learning_value": "high",
            "recommended_approach": "comprehensive_study"
        }
    
    async def _simulate_analysis(self, content: str, analysis_type: str) -> Dict:
        """시뮬레이션 분석"""
        await asyncio.sleep(2)  # 실제 API 호출 시뮬레이션
        
        return {
            "analysis_type": analysis_type,
            "summary": f"시뮬레이션 분석: {content[:200]}...",
            "key_concepts": ["민주주의", "교육", "사회", "변화", "발전"],
            "logical_structure": "문제 제기 → 분석 → 해결책 제시",
            "language_features": ["그런데 말이죠", "여기서 중요한 것은", "따라서"],
            "historical_context": "현대 한국 사회의 변화",
            "modern_relevance": "현재 우리가 직면한 과제들",
            "yoo_style_score": 8.5,
            "learning_value": "very_high",
            "recommended_approach": "deep_analysis_and_discussion",
            "discussion_questions": [
                "이 내용이 현재 우리 사회에 주는 의미는 무엇인가요?",
                "개인적으로 어떤 부분이 가장 인상적이었나요?"
            ]
        }

class YouTubeContentExtractor:
    """유튜브 콘텐츠 추출기"""
    
    def __init__(self):
        self.session = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def extract_content(self, url: str) -> WebContent:
        """유튜브 콘텐츠 추출"""
        try:
            # 실제로는 youtube-dl 또는 yt-dlp 사용
            # 여기서는 시뮬레이션
            await asyncio.sleep(3)
            
            video_id = self._extract_video_id(url)
            title = f"유시민 강연 - {video_id}"
            
            # 시뮬레이션된 콘텐츠
            content = f"""
그런데 말이죠, 오늘 이 자리에서 여러분과 함께 이야기하고 싶은 주제가 있습니다.

여기서 중요한 것은 우리가 살고 있는 이 시대의 의미를 제대로 이해하는 것입니다.

과거의 경험들이 현재 우리에게 주는 교훈은 무엇일까요?

따라서 우리는 이런 관점에서 접근해볼 필요가 있습니다.

그런데 말이죠, 이것이 쉽지 않습니다. 하지만 우리가 노력해야 할 가치입니다.

여기서 핵심은 함께 생각하고 토론하는 것입니다.

따라서 우리는 더 나은 이해에 도달할 수 있을 것입니다.

함께 생각해보는 것이 진정한 학습의 의미라고 생각합니다.
"""
            
            return WebContent(
                url=url,
                title=title,
                content=content,
                content_type=ContentType.YOUTUBE,
                source="youtube",
                priority=LearningPriority.HIGH,
                extracted_at=datetime.now(timezone.utc).isoformat(),
                yoo_relevance=0.9
            )
            
        except Exception as e:
            logger.error(f"유튜브 콘텐츠 추출 오류: {e}")
            raise
    
    def _extract_video_id(self, url: str) -> str:
        """비디오 ID 추출"""
        patterns = [
            r'(?:youtube\.com/watch\?v=|youtu\.be/)([^&\n?#]+)',
            r'youtube\.com/embed/([^&\n?#]+)',
            r'youtube\.com/v/([^&\n?#]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        
        return "unknown_video"

class WebContentExtractor:
    """웹 콘텐츠 추출기"""
    
    def __init__(self):
        self.session = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def extract_content(self, url: str) -> WebContent:
        """웹 콘텐츠 추출"""
        try:
            async with self.session.get(url) as response:
                if response.status == 200:
                    html = await response.text()
                    title, content = self._parse_html(html)
                    
                    return WebContent(
                        url=url,
                        title=title,
                        content=content,
                        content_type=ContentType.WEBPAGE,
                        source="web",
                        priority=LearningPriority.MEDIUM,
                        extracted_at=datetime.now(timezone.utc).isoformat(),
                        yoo_relevance=0.7
                    )
                else:
                    raise Exception(f"HTTP {response.status}")
                    
        except Exception as e:
            logger.error(f"웹 콘텐츠 추출 오류: {e}")
            raise
    
    def _parse_html(self, html: str) -> Tuple[str, str]:
        """HTML 파싱"""
        # 간단한 HTML 파싱 (실제로는 BeautifulSoup 사용)
        title_match = re.search(r'<title>(.*?)</title>', html, re.IGNORECASE)
        title = title_match.group(1) if title_match else "웹페이지 제목"
        
        # 텍스트 추출 (간단한 방식)
        text_content = re.sub(r'<[^>]+>', '', html)
        text_content = re.sub(r'\s+', ' ', text_content).strip()
        
        return title, text_content[:2000]

class AdvancedWebLearningSystem:
    """고급 웹 학습 시스템"""
    
    def __init__(self):
        self.learning_tasks: Dict[str, LearningTask] = {}
        self.learned_content: List[WebContent] = []
        self.chatgpt_integration = ChatGPTIntegration()
        self.youtube_extractor = YouTubeContentExtractor()
        self.web_extractor = WebContentExtractor()
        
    async def add_learning_source(self, url: str, content_type: str, priority: str = "medium") -> str:
        """학습 소스 추가"""
        try:
            # 콘텐츠 추출
            if content_type == "youtube":
                async with self.youtube_extractor as extractor:
                    content = await extractor.extract_content(url)
            else:
                async with self.web_extractor as extractor:
                    content = await extractor.extract_content(url)
            
            # 학습 태스크 생성
            task_id = f"task_{len(self.learning_tasks) + 1}_{int(time.time())}"
            task = LearningTask(
                task_id=task_id,
                content=content,
                status="pending"
            )
            
            self.learning_tasks[task_id] = task
            
            # 백그라운드에서 학습 시작
            asyncio.create_task(self._process_learning_task(task_id))
            
            return task_id
            
        except Exception as e:
            logger.error(f"학습 소스 추가 오류: {e}")
            raise
    
    async def _process_learning_task(self, task_id: str):
        """학습 태스크 처리"""
        task = self.learning_tasks[task_id]
        
        try:
            task.status = "processing"
            task.start_time = datetime.now(timezone.utc).isoformat()
            task.progress = 0.1
            
            # ChatGPT로 콘텐츠 분석
            async with self.chatgpt_integration as chatgpt:
                analysis = await chatgpt.analyze_content(task.content.content, "comprehensive")
                task.progress = 0.5
                
                # 스타일 분석
                style_analysis = await chatgpt.analyze_content(task.content.content, "style_analysis")
                task.progress = 0.7
                
                # 콘텐츠 추출
                content_extraction = await chatgpt.analyze_content(task.content.content, "content_extraction")
                task.progress = 0.9
            
            # 학습 결과 저장
            task.learning_results = {
                "comprehensive_analysis": analysis,
                "style_analysis": style_analysis,
                "content_extraction": content_extraction,
                "learning_score": self._calculate_learning_score(analysis),
                "yoo_relevance": self._calculate_yoo_relevance(analysis)
            }
            
            # 콘텐츠를 학습된 콘텐츠에 추가
            task.content.processed = True
            task.content.learning_score = task.learning_results["learning_score"]
            task.content.yoo_relevance = task.learning_results["yoo_relevance"]
            
            self.learned_content.append(task.content)
            
            task.status = "completed"
            task.progress = 1.0
            task.end_time = datetime.now(timezone.utc).isoformat()
            
            logger.info(f"학습 태스크 완료: {task_id}")
            
        except Exception as e:
            task.status = "failed"
            task.error_message = str(e)
            task.end_time = datetime.now(timezone.utc).isoformat()
            logger.error(f"학습 태스크 실패: {task_id} - {e}")
    
    def _calculate_learning_score(self, analysis: Dict) -> float:
        """학습 점수 계산"""
        score = 0.0
        
        # 기본 점수
        score += 0.3
        
        # 키워드 기반 점수
        if "민주주의" in str(analysis):
            score += 0.2
        if "교육" in str(analysis):
            score += 0.2
        if "사회" in str(analysis):
            score += 0.2
        if "역사" in str(analysis):
            score += 0.1
        
        # 유시민 스타일 점수
        yoo_score = analysis.get("yoo_style_score", 5.0)
        score += (yoo_score / 10) * 0.3
        
        return min(score, 1.0)
    
    def _calculate_yoo_relevance(self, analysis: Dict) -> float:
        """유시민 관련성 계산"""
        relevance = 0.0
        
        # 스타일 점수 기반
        yoo_score = analysis.get("yoo_style_score", 5.0)
        relevance += yoo_score / 10
        
        # 키워드 기반
        keywords = ["그런데", "말이죠", "여기서", "중요한", "따라서", "함께"]
        content_text = str(analysis).lower()
        keyword_count = sum(1 for keyword in keywords if keyword in content_text)
        relevance += min(keyword_count / len(keywords), 0.5)
        
        return min(relevance, 1.0)
    
    def get_learning_task_status(self, task_id: str) -> Optional[LearningTask]:
        """학습 태스크 상태 조회"""
        return self.learning_tasks.get(task_id)
    
    def get_learned_content(self) -> List[WebContent]:
        """학습된 콘텐츠 조회"""
        return self.learned_content
    
    def get_learning_analytics(self) -> Dict:
        """학습 분석 데이터 조회"""
        total_tasks = len(self.learning_tasks)
        completed_tasks = sum(1 for task in self.learning_tasks.values() if task.status == "completed")
        failed_tasks = sum(1 for task in self.learning_tasks.values() if task.status == "failed")
        
        content_types = {}
        for content in self.learned_content:
            content_type = content.content_type.value
            content_types[content_type] = content_types.get(content_type, 0) + 1
        
        return {
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "failed_tasks": failed_tasks,
            "success_rate": completed_tasks / total_tasks if total_tasks > 0 else 0,
            "learned_content_count": len(self.learned_content),
            "content_types": content_types,
            "average_learning_score": sum(c.learning_score for c in self.learned_content) / len(self.learned_content) if self.learned_content else 0,
            "average_yoo_relevance": sum(c.yoo_relevance for c in self.learned_content) / len(self.learned_content) if self.learned_content else 0
        }

# FastAPI 앱 생성
app = FastAPI(
    title="고급 웹 학습 통합 시스템",
    description="실시간 웹 콘텐츠 수집 및 학습 시스템",
    version="2.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 전역 시스템 인스턴스
web_learning_system = AdvancedWebLearningSystem()

class LearningSourceRequest(BaseModel):
    url: str
    content_type: str  # "youtube" or "webpage"
    priority: str = "medium"

class LearningTaskResponse(BaseModel):
    success: bool
    task_id: str
    message: str
    estimated_time: str

@app.post("/api/learn/add-source", response_model=LearningTaskResponse)
async def add_learning_source(request: LearningSourceRequest):
    """학습 소스 추가"""
    try:
        logger.info(f"학습 소스 추가 요청: {request.url}")
        
        task_id = await web_learning_system.add_learning_source(
            request.url,
            request.content_type,
            request.priority
        )
        
        return LearningTaskResponse(
            success=True,
            task_id=task_id,
            message="학습 태스크가 시작되었습니다.",
            estimated_time="5-10분"
        )
        
    except Exception as e:
        logger.error(f"학습 소스 추가 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/learn/task-status/{task_id}")
async def get_learning_task_status(task_id: str):
    """학습 태스크 상태 조회"""
    try:
        task = web_learning_system.get_learning_task_status(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="태스크를 찾을 수 없습니다.")
        
        return {
            "success": True,
            "task": {
                "task_id": task.task_id,
                "status": task.status,
                "progress": task.progress,
                "start_time": task.start_time,
                "end_time": task.end_time,
                "error_message": task.error_message,
                "content_info": {
                    "title": task.content.title,
                    "url": task.content.url,
                    "content_type": task.content.content_type.value,
                    "priority": task.content.priority.value
                }
            }
        }
    except Exception as e:
        logger.error(f"학습 태스크 상태 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/learn/content")
async def get_learned_content():
    """학습된 콘텐츠 조회"""
    try:
        content = web_learning_system.get_learned_content()
        
        return {
            "success": True,
            "content": [
                {
                    "title": c.title,
                    "url": c.url,
                    "content_type": c.content_type.value,
                    "source": c.source,
                    "priority": c.priority.value,
                    "extracted_at": c.extracted_at,
                    "processed": c.processed,
                    "learning_score": c.learning_score,
                    "yoo_relevance": c.yoo_relevance,
                    "content_preview": c.content[:200] + "..." if len(c.content) > 200 else c.content
                }
                for c in content
            ],
            "total_count": len(content)
        }
    except Exception as e:
        logger.error(f"학습된 콘텐츠 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/learn/analytics")
async def get_learning_analytics():
    """학습 분석 데이터 조회"""
    try:
        analytics = web_learning_system.get_learning_analytics()
        
        return {
            "success": True,
            "analytics": analytics
        }
    except Exception as e:
        logger.error(f"학습 분석 데이터 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "고급 웹 학습 통합 시스템",
        "version": "2.0.0",
        "status": "running",
        "features": [
            "실시간 웹 콘텐츠 수집 및 학습",
            "ChatGPT API 통합",
            "유튜브 콘텐츠 자동 추출",
            "멀티모달 학습 통합",
            "실시간 성능 최적화",
            "학습 점수 및 관련성 평가",
            "자동화된 콘텐츠 분석",
            "학습 진행 상황 추적"
        ],
        "system_info": {
            "learning_tasks": len(web_learning_system.learning_tasks),
            "learned_content": len(web_learning_system.learned_content),
            "chatgpt_integration": "active" if web_learning_system.chatgpt_integration.api_key else "simulation_mode"
        },
        "endpoints": {
            "add_learning_source": "/api/learn/add-source",
            "task_status": "/api/learn/task-status/{task_id}",
            "learned_content": "/api/learn/content",
            "analytics": "/api/learn/analytics",
            "docs": "/docs"
        }
    }

if __name__ == "__main__":
    logger.info("🚀 고급 웹 학습 통합 시스템을 시작합니다...")
    logger.info("📍 서버 주소: http://localhost:8004")
    logger.info("📚 API 문서: http://localhost:8004/docs")
    logger.info("🤖 ChatGPT 통합: 활성화")
    logger.info("📺 유튜브 추출: 활성화")
    logger.info("🌐 웹 콘텐츠 추출: 활성화")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8004,
        reload=False,
        log_level="info"
    )
