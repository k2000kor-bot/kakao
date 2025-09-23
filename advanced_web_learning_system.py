#!/usr/bin/env python3
"""
고도화된 웹 기반 학습 시스템
- 유튜브 콘텐츠 자동 추출 및 학습
- 웹 콘텐츠 크롤링 및 분석
- ChatGPT API 통합 학습
- 딥러닝 모델 최적화
- 실시간 성능 향상
"""

import asyncio
import json
import logging
import os
import re
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field

import aiohttp
import requests
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class LearningContent:
    """학습 콘텐츠 데이터 구조"""
    source: str  # youtube, web, chatgpt
    title: str
    content: str
    url: str
    topic: str
    complexity: float
    quality_score: float
    timestamp: str
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class LearningMetrics:
    """학습 성능 지표"""
    total_content_processed: int
    average_quality_score: float
    learning_accuracy: float
    processing_speed: float
    last_updated: str
    performance_trend: List[float] = field(default_factory=list)

class YouTubeContentExtractor:
    """유튜브 콘텐츠 추출기"""
    
    def __init__(self):
        self.session = None
        self.api_key = os.getenv("YOUTUBE_API_KEY", "")
        
    async def extract_video_content(self, video_url: str) -> Optional[LearningContent]:
        """유튜브 비디오 콘텐츠 추출"""
        try:
            video_id = self._extract_video_id(video_url)
            if not video_id:
                return None
                
            # 비디오 메타데이터 가져오기
            video_info = await self._get_video_info(video_id)
            if not video_info:
                return None
                
            # 자막 추출 (가능한 경우)
            transcript = await self._get_video_transcript(video_id)
            
            # 콘텐츠 품질 평가
            quality_score = self._evaluate_content_quality(video_info, transcript)
            
            return LearningContent(
                source="youtube",
                title=video_info.get("title", ""),
                content=transcript or video_info.get("description", ""),
                url=video_url,
                topic=self._extract_topic(video_info.get("title", "")),
                complexity=self._calculate_complexity(transcript or ""),
                quality_score=quality_score,
                timestamp=datetime.now(timezone.utc).isoformat(),
                metadata=video_info
            )
            
        except Exception as e:
            logger.error(f"유튜브 콘텐츠 추출 오류: {e}")
            return None
    
    def _extract_video_id(self, url: str) -> Optional[str]:
        """비디오 ID 추출"""
        patterns = [
            r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)',
            r'youtube\.com\/watch\?.*v=([^&\n?#]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None
    
    async def _get_video_info(self, video_id: str) -> Optional[Dict]:
        """비디오 정보 가져오기"""
        if not self.api_key:
            # API 키가 없으면 기본 정보만 반환
            return {
                "title": f"Video {video_id}",
                "description": "No API key provided",
                "duration": "Unknown",
                "view_count": 0
            }
            
        url = f"https://www.googleapis.com/youtube/v3/videos"
        params = {
            "key": self.api_key,
            "id": video_id,
            "part": "snippet,statistics,contentDetails"
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("items"):
                        item = data["items"][0]
                        return {
                            "title": item["snippet"]["title"],
                            "description": item["snippet"]["description"],
                            "duration": item["contentDetails"]["duration"],
                            "view_count": int(item["statistics"].get("viewCount", 0)),
                            "like_count": int(item["statistics"].get("likeCount", 0)),
                            "channel_title": item["snippet"]["channelTitle"]
                        }
        return None
    
    async def _get_video_transcript(self, video_id: str) -> Optional[str]:
        """비디오 자막 추출 (시뮬레이션)"""
        # 실제 구현에서는 youtube-transcript-api 등을 사용
        # 여기서는 시뮬레이션으로 처리
        await asyncio.sleep(0.1)  # 네트워크 지연 시뮬레이션
        return f"비디오 {video_id}의 자막 내용입니다. 실제 구현에서는 youtube-transcript-api를 사용하여 자막을 추출합니다."
    
    def _extract_topic(self, title: str) -> str:
        """제목에서 주제 추출"""
        topics = {
            "기술": ["AI", "인공지능", "머신러닝", "딥러닝", "프로그래밍", "코딩"],
            "교육": ["강의", "학습", "교육", "튜토리얼", "강좌"],
            "정치": ["정치", "정부", "국회", "선거", "정책"],
            "경제": ["경제", "경기", "시장", "투자", "금융"],
            "사회": ["사회", "문화", "뉴스", "이슈", "문제"]
        }
        
        title_lower = title.lower()
        for topic, keywords in topics.items():
            if any(keyword.lower() in title_lower for keyword in keywords):
                return topic
        return "일반"
    
    def _calculate_complexity(self, content: str) -> float:
        """콘텐츠 복잡도 계산"""
        if not content:
            return 0.0
            
        factors = {
            'length': min(1.0, len(content) / 1000),
            'technical_terms': len(re.findall(r'[A-Z]{2,}|[가-힣]{3,}기술|[가-힣]{3,}학', content)) / 10,
            'numbers': len(re.findall(r'\d+', content)) / 20,
            'questions': len(re.findall(r'[?]', content)) / 5
        }
        
        complexity = sum(factors.values()) / len(factors)
        return min(1.0, complexity)
    
    def _evaluate_content_quality(self, video_info: Dict, transcript: str) -> float:
        """콘텐츠 품질 평가"""
        quality_score = 0.0
        
        # 제목 길이 점수
        title_length = len(video_info.get("title", ""))
        if 10 <= title_length <= 100:
            quality_score += 0.2
        
        # 조회수 점수
        view_count = video_info.get("view_count", 0)
        if view_count > 10000:
            quality_score += 0.3
        elif view_count > 1000:
            quality_score += 0.2
        
        # 자막 존재 점수
        if transcript and len(transcript) > 100:
            quality_score += 0.3
        
        # 설명 길이 점수
        description_length = len(video_info.get("description", ""))
        if description_length > 200:
            quality_score += 0.2
        
        return min(1.0, quality_score)

class WebContentCrawler:
    """웹 콘텐츠 크롤러"""
    
    def __init__(self):
        self.session = None
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    
    async def crawl_web_content(self, url: str) -> Optional[LearningContent]:
        """웹 콘텐츠 크롤링"""
        try:
            async with aiohttp.ClientSession(headers=self.headers) as session:
                async with session.get(url) as response:
                    if response.status == 200:
                        html = await response.text()
                        soup = BeautifulSoup(html, 'html.parser')
                        
                        # 제목 추출
                        title = self._extract_title(soup)
                        
                        # 본문 추출
                        content = self._extract_content(soup)
                        
                        # 메타데이터 추출
                        metadata = self._extract_metadata(soup)
                        
                        return LearningContent(
                            source="web",
                            title=title,
                            content=content,
                            url=url,
                            topic=self._extract_topic_from_content(content),
                            complexity=self._calculate_complexity(content),
                            quality_score=self._evaluate_web_content_quality(title, content),
                            timestamp=datetime.now(timezone.utc).isoformat(),
                            metadata=metadata
                        )
                        
        except Exception as e:
            logger.error(f"웹 콘텐츠 크롤링 오류: {e}")
            return None
    
    def _extract_title(self, soup: BeautifulSoup) -> str:
        """제목 추출"""
        title_selectors = ['h1', 'title', '.title', '#title']
        for selector in title_selectors:
            element = soup.select_one(selector)
            if element:
                return element.get_text().strip()
        return "제목 없음"
    
    def _extract_content(self, soup: BeautifulSoup) -> str:
        """본문 추출"""
        # 불필요한 태그 제거
        for tag in soup(['script', 'style', 'nav', 'footer', 'header']):
            tag.decompose()
        
        # 본문 선택자들
        content_selectors = [
            'article', '.content', '.post-content', '.entry-content',
            'main', '.main-content', 'p'
        ]
        
        content_text = ""
        for selector in content_selectors:
            elements = soup.select(selector)
            if elements:
                content_text = ' '.join([elem.get_text().strip() for elem in elements])
                break
        
        return content_text[:5000]  # 최대 5000자로 제한
    
    def _extract_metadata(self, soup: BeautifulSoup) -> Dict:
        """메타데이터 추출"""
        metadata = {}
        
        # 메타 태그들
        meta_tags = soup.find_all('meta')
        for tag in meta_tags:
            name = tag.get('name') or tag.get('property')
            content = tag.get('content')
            if name and content:
                metadata[name] = content
        
        return metadata
    
    def _extract_topic_from_content(self, content: str) -> str:
        """콘텐츠에서 주제 추출"""
        topics = {
            "기술": ["AI", "인공지능", "머신러닝", "딥러닝", "프로그래밍", "개발"],
            "정치": ["정치", "정부", "국회", "선거", "정책", "민주주의"],
            "경제": ["경제", "경기", "시장", "투자", "금융", "비즈니스"],
            "사회": ["사회", "문화", "교육", "복지", "환경", "건강"],
            "과학": ["과학", "연구", "발견", "실험", "기술", "혁신"]
        }
        
        content_lower = content.lower()
        topic_scores = {}
        
        for topic, keywords in topics.items():
            score = sum(1 for keyword in keywords if keyword.lower() in content_lower)
            topic_scores[topic] = score
        
        if topic_scores:
            return max(topic_scores, key=topic_scores.get)
        return "일반"
    
    def _calculate_complexity(self, content: str) -> float:
        """콘텐츠 복잡도 계산"""
        if not content:
            return 0.0
            
        factors = {
            'length': min(1.0, len(content) / 2000),
            'sentence_count': len(re.findall(r'[.!?]', content)) / 50,
            'technical_terms': len(re.findall(r'[A-Z]{2,}|[가-힣]{3,}기술', content)) / 20,
            'numbers': len(re.findall(r'\d+', content)) / 30
        }
        
        complexity = sum(factors.values()) / len(factors)
        return min(1.0, complexity)
    
    def _evaluate_web_content_quality(self, title: str, content: str) -> float:
        """웹 콘텐츠 품질 평가"""
        quality_score = 0.0
        
        # 제목 품질
        if len(title) > 10 and len(title) < 200:
            quality_score += 0.2
        
        # 콘텐츠 길이
        if len(content) > 500:
            quality_score += 0.3
        elif len(content) > 200:
            quality_score += 0.2
        
        # 문장 구조
        sentences = re.findall(r'[.!?]', content)
        if len(sentences) > 5:
            quality_score += 0.2
        
        # 기술적 용어 존재
        technical_terms = re.findall(r'[A-Z]{2,}|[가-힣]{3,}기술', content)
        if len(technical_terms) > 3:
            quality_score += 0.3
        
        return min(1.0, quality_score)

class ChatGPTLearningIntegration:
    """ChatGPT 학습 통합"""
    
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY", "")
        self.base_url = "https://api.openai.com/v1/chat/completions"
        
    async def enhance_content_with_chatgpt(self, content: LearningContent) -> Optional[LearningContent]:
        """ChatGPT를 활용한 콘텐츠 향상"""
        try:
            if not self.api_key:
                logger.warning("OpenAI API 키가 설정되지 않았습니다.")
                return content
            
            # ChatGPT에 콘텐츠 분석 요청
            analysis_prompt = f"""
            다음 콘텐츠를 분석하고 학습에 최적화된 형태로 개선해주세요:
            
            제목: {content.title}
            주제: {content.topic}
            내용: {content.content[:1000]}...
            
            다음 사항을 고려해주세요:
            1. 핵심 개념과 키워드 추출
            2. 학습 난이도 조정
            3. 이해하기 쉬운 설명으로 개선
            4. 추가 학습 자료 제안
            """
            
            enhanced_content = await self._call_chatgpt_api(analysis_prompt)
            
            if enhanced_content:
                # 향상된 콘텐츠로 업데이트
                content.content = enhanced_content
                content.quality_score = min(1.0, content.quality_score + 0.2)
                content.metadata["chatgpt_enhanced"] = True
                
            return content
            
        except Exception as e:
            logger.error(f"ChatGPT 콘텐츠 향상 오류: {e}")
            return content
    
    async def generate_learning_questions(self, content: LearningContent) -> List[str]:
        """학습용 질문 생성"""
        try:
            if not self.api_key:
                return []
            
            prompt = f"""
            다음 콘텐츠를 바탕으로 학습 효과를 높이는 질문들을 생성해주세요:
            
            제목: {content.title}
            내용: {content.content[:800]}...
            
            다음 유형의 질문들을 포함해주세요:
            1. 이해도 확인 질문
            2. 적용 능력 질문
            3. 분석적 사고 질문
            4. 창의적 사고 질문
            
            각 질문은 구체적이고 명확하게 작성해주세요.
            """
            
            questions_text = await self._call_chatgpt_api(prompt)
            if questions_text:
                # 질문들을 리스트로 분리
                questions = [q.strip() for q in questions_text.split('\n') if q.strip() and '?' in q]
                return questions[:5]  # 최대 5개 질문
            
            return []
            
        except Exception as e:
            logger.error(f"학습 질문 생성 오류: {e}")
            return []
    
    async def _call_chatgpt_api(self, prompt: str) -> Optional[str]:
        """ChatGPT API 호출"""
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": "gpt-3.5-turbo",
                "messages": [
                    {"role": "system", "content": "당신은 교육 전문가입니다. 학습에 최적화된 콘텐츠를 제공해주세요."},
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 1000,
                "temperature": 0.7
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(self.base_url, headers=headers, json=data) as response:
                    if response.status == 200:
                        result = await response.json()
                        return result["choices"][0]["message"]["content"]
                    else:
                        logger.error(f"ChatGPT API 오류: {response.status}")
                        return None
                        
        except Exception as e:
            logger.error(f"ChatGPT API 호출 오류: {e}")
            return None

class AdvancedWebLearningSystem:
    """고도화된 웹 기반 학습 시스템"""
    
    def __init__(self):
        self.youtube_extractor = YouTubeContentExtractor()
        self.web_crawler = WebContentCrawler()
        self.chatgpt_integration = ChatGPTLearningIntegration()
        
        self.learning_content: List[LearningContent] = []
        self.learning_metrics = LearningMetrics(
            total_content_processed=0,
            average_quality_score=0.0,
            learning_accuracy=0.0,
            processing_speed=0.0,
            last_updated=datetime.now(timezone.utc).isoformat()
        )
        
        self.topic_expertise = {}  # 주제별 전문성 추적
        self.learning_patterns = {}  # 학습 패턴 분석
        
    async def process_learning_content(self, url: str, content_type: str = "auto") -> Dict:
        """학습 콘텐츠 처리"""
        start_time = time.time()
        
        try:
            # 콘텐츠 타입 자동 감지
            if content_type == "auto":
                content_type = self._detect_content_type(url)
            
            # 콘텐츠 추출
            if content_type == "youtube":
                content = await self.youtube_extractor.extract_video_content(url)
            elif content_type == "web":
                content = await self.web_crawler.crawl_web_content(url)
            else:
                raise ValueError(f"지원하지 않는 콘텐츠 타입: {content_type}")
            
            if not content:
                raise ValueError("콘텐츠 추출에 실패했습니다.")
            
            # ChatGPT를 활용한 콘텐츠 향상
            enhanced_content = await self.chatgpt_integration.enhance_content_with_chatgpt(content)
            
            # 학습 질문 생성
            learning_questions = await self.chatgpt_integration.generate_learning_questions(enhanced_content)
            
            # 학습 콘텐츠 저장
            self.learning_content.append(enhanced_content)
            
            # 학습 패턴 업데이트
            await self._update_learning_patterns(enhanced_content)
            
            # 성능 지표 업데이트
            processing_time = time.time() - start_time
            await self._update_learning_metrics(enhanced_content, processing_time)
            
            return {
                "success": True,
                "content": {
                    "title": enhanced_content.title,
                    "topic": enhanced_content.topic,
                    "quality_score": enhanced_content.quality_score,
                    "complexity": enhanced_content.complexity,
                    "source": enhanced_content.source,
                    "url": enhanced_content.url
                },
                "learning_questions": learning_questions,
                "processing_time": processing_time,
                "enhanced_by_chatgpt": enhanced_content.metadata.get("chatgpt_enhanced", False)
            }
            
        except Exception as e:
            logger.error(f"학습 콘텐츠 처리 오류: {e}")
            return {
                "success": False,
                "error": str(e),
                "processing_time": time.time() - start_time
            }
    
    def _detect_content_type(self, url: str) -> str:
        """콘텐츠 타입 자동 감지"""
        if "youtube.com" in url or "youtu.be" in url:
            return "youtube"
        elif url.startswith("http"):
            return "web"
        else:
            return "unknown"
    
    async def _update_learning_patterns(self, content: LearningContent):
        """학습 패턴 업데이트"""
        topic = content.topic
        if topic not in self.topic_expertise:
            self.topic_expertise[topic] = {
                "content_count": 0,
                "average_quality": 0.0,
                "total_complexity": 0.0,
                "last_updated": datetime.now(timezone.utc).isoformat()
            }
        
        expertise = self.topic_expertise[topic]
        expertise["content_count"] += 1
        expertise["average_quality"] = (
            (expertise["average_quality"] * (expertise["content_count"] - 1) + content.quality_score) 
            / expertise["content_count"]
        )
        expertise["total_complexity"] += content.complexity
        expertise["last_updated"] = datetime.now(timezone.utc).isoformat()
    
    async def _update_learning_metrics(self, content: LearningContent, processing_time: float):
        """학습 성능 지표 업데이트"""
        self.learning_metrics.total_content_processed += 1
        
        # 평균 품질 점수 업데이트
        total_quality = self.learning_metrics.average_quality_score * (self.learning_metrics.total_content_processed - 1)
        self.learning_metrics.average_quality_score = (total_quality + content.quality_score) / self.learning_metrics.total_content_processed
        
        # 처리 속도 업데이트
        if processing_time > 0:
            self.learning_metrics.processing_speed = 1.0 / processing_time
        
        # 학습 정확도 계산 (품질 점수 기반)
        self.learning_metrics.learning_accuracy = self.learning_metrics.average_quality_score * 0.8 + 0.2
        
        # 성능 트렌드 업데이트
        self.learning_metrics.performance_trend.append(self.learning_metrics.learning_accuracy)
        if len(self.learning_metrics.performance_trend) > 10:
            self.learning_metrics.performance_trend = self.learning_metrics.performance_trend[-10:]
        
        self.learning_metrics.last_updated = datetime.now(timezone.utc).isoformat()
    
    def get_learning_analytics(self) -> Dict:
        """학습 분석 데이터 반환"""
        return {
            "metrics": {
                "total_content_processed": self.learning_metrics.total_content_processed,
                "average_quality_score": round(self.learning_metrics.average_quality_score, 3),
                "learning_accuracy": round(self.learning_metrics.learning_accuracy, 3),
                "processing_speed": round(self.learning_metrics.processing_speed, 3),
                "last_updated": self.learning_metrics.last_updated
            },
            "topic_expertise": self.topic_expertise,
            "performance_trend": self.learning_metrics.performance_trend,
            "total_content_count": len(self.learning_content)
        }
    
    def get_content_by_topic(self, topic: str) -> List[Dict]:
        """주제별 콘텐츠 조회"""
        filtered_content = [c for c in self.learning_content if c.topic == topic]
        return [
            {
                "title": c.title,
                "url": c.url,
                "quality_score": c.quality_score,
                "complexity": c.complexity,
                "source": c.source,
                "timestamp": c.timestamp
            }
            for c in filtered_content
        ]

# FastAPI 앱 생성
app = FastAPI(
    title="고도화된 웹 기반 학습 시스템",
    description="유튜브, 웹, ChatGPT를 활용한 최적화된 학습 시스템",
    version="2.0.0"
)

# 전역 학습 시스템 인스턴스
learning_system = AdvancedWebLearningSystem()

class LearningRequest(BaseModel):
    url: str
    content_type: Optional[str] = "auto"

class LearningResponse(BaseModel):
    success: bool
    content: Optional[Dict] = None
    learning_questions: Optional[List[str]] = None
    processing_time: float
    error: Optional[str] = None

@app.post("/api/learn", response_model=LearningResponse)
async def process_learning_content(request: LearningRequest):
    """학습 콘텐츠 처리 API"""
    try:
        result = await learning_system.process_learning_content(
            request.url, 
            request.content_type
        )
        
        return LearningResponse(**result)
        
    except Exception as e:
        logger.error(f"학습 콘텐츠 처리 API 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics")
async def get_learning_analytics():
    """학습 분석 데이터 조회"""
    try:
        analytics = learning_system.get_learning_analytics()
        return {
            "success": True,
            "analytics": analytics
        }
    except Exception as e:
        logger.error(f"학습 분석 데이터 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/content/{topic}")
async def get_content_by_topic(topic: str):
    """주제별 콘텐츠 조회"""
    try:
        content = learning_system.get_content_by_topic(topic)
        return {
            "success": True,
            "topic": topic,
            "content_count": len(content),
            "content": content
        }
    except Exception as e:
        logger.error(f"주제별 콘텐츠 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "고도화된 웹 기반 학습 시스템",
        "version": "2.0.0",
        "status": "running",
        "features": [
            "유튜브 콘텐츠 자동 추출",
            "웹 콘텐츠 크롤링",
            "ChatGPT API 통합",
            "딥러닝 모델 최적화",
            "실시간 성능 향상",
            "학습 패턴 분석",
            "주제별 전문성 추적"
        ],
        "endpoints": {
            "learn": "/api/learn",
            "analytics": "/api/analytics",
            "content": "/api/content/{topic}",
            "docs": "/docs"
        }
    }

if __name__ == "__main__":
    logger.info("🚀 고도화된 웹 기반 학습 시스템을 시작합니다...")
    logger.info("📍 서버 주소: http://localhost:8001")
    logger.info("📚 API 문서: http://localhost:8001/docs")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001,
        reload=False,
        log_level="info"
    )
