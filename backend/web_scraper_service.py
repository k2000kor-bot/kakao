#!/usr/bin/env python3
"""
웹 스크래핑 서비스 - 부동산 관련 정보 수집
"""

import asyncio
import aiohttp
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import re
from bs4 import BeautifulSoup
import json

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 초기화
app = FastAPI(
    title="CORBU AI 웹 스크래핑 서비스",
    description="부동산 관련 웹 정보 수집 및 분석",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic 모델들
class ScrapingRequest(BaseModel):
    query: str
    search_type: str = "negative_comments"  # negative_comments, general_info, reviews
    max_results: int = 20

class ScrapingResponse(BaseModel):
    results: List[Dict[str, Any]]
    total_found: int
    search_query: str
    timestamp: str
    summary: str

class WebScraper:
    def __init__(self):
        self.session = None
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(headers=self.headers)
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def search_naver_blog(self, query: str, max_results: int = 10) -> List[Dict[str, Any]]:
        """네이버 블로그에서 검색 (샘플 데이터 생성)"""
        results = []
        
        # 샘플 데이터 생성
        sample_data = [
            {
                'title': f'{query} 입주 후기 - 솔직한 리뷰',
                'content': f'{query}에 입주한 지 6개월이 지났습니다. 건물 상태는 전반적으로 양호하지만 소음 문제가 있어서 불편합니다. 특히 위층에서 나는 발소리가 심해서 밤에 잠을 못 이룰 때가 많아요.',
                'url': 'https://blog.naver.com/sample1',
                'date': '2024.01.15',
                'source': '네이버 블로그'
            },
            {
                'title': f'{query} 단지 정보 및 하자 관련 글',
                'content': f'{query} 단지에서 발견된 하자들에 대해 정리해봤습니다. 벽지 균열, 화장실 누수, 단열재 문제 등이 보고되었습니다. 관리사무소에서는 신속한 보수를 약속했지만 아직 진행되지 않았습니다.',
                'url': 'https://blog.naver.com/sample2',
                'date': '2024.01.10',
                'source': '네이버 블로그'
            },
            {
                'title': f'{query} 주차장 문제로 고민 중',
                'content': f'{query} 입주민으로서 가장 큰 문제는 주차장입니다. 지하 주차장이 좁고 출입이 불편합니다. 특히 주말에는 주차 공간을 찾기 어려워서 곤란합니다.',
                'url': 'https://blog.naver.com/sample3',
                'date': '2024.01.08',
                'source': '네이버 블로그'
            }
        ]
        
        # 쿼리에 따라 관련된 샘플 데이터 반환
        for data in sample_data[:max_results]:
            if query.lower() in data['title'].lower() or query.lower() in data['content'].lower():
                results.append(data)
        
        return results
    
    async def search_daum_blog(self, query: str, max_results: int = 10) -> List[Dict[str, Any]]:
        """다음 블로그에서 검색 (샘플 데이터 생성)"""
        results = []
        
        # 샘플 데이터 생성
        sample_data = [
            {
                'title': f'{query} 관리비 문제로 고민',
                'content': f'{query}의 관리비가 너무 비싸다고 생각합니다. 다른 단지와 비교해봐도 월 20만원은 과도한 것 같아요. 관리사무소에 문의했지만 명확한 답변을 받지 못했습니다.',
                'url': 'https://blog.daum.net/sample1',
                'date': '2024.01.12',
                'source': '다음 블로그'
            },
            {
                'title': f'{query} 입주민들의 소음 민원',
                'content': f'{query}에서 소음 문제로 많은 민원이 들어오고 있습니다. 특히 새벽 시간대의 발소리와 대화 소리가 문제가 되고 있어요. 방음 시설 개선이 필요해 보입니다.',
                'url': 'https://blog.daum.net/sample2',
                'date': '2024.01.09',
                'source': '다음 블로그'
            }
        ]
        
        # 쿼리에 따라 관련된 샘플 데이터 반환
        for data in sample_data[:max_results]:
            if query.lower() in data['title'].lower() or query.lower() in data['content'].lower():
                results.append(data)
        
        return results
    
    async def search_cafe_posts(self, query: str, max_results: int = 10) -> List[Dict[str, Any]]:
        """네이버 카페에서 검색 (샘플 데이터 생성)"""
        results = []
        
        # 샘플 데이터 생성
        sample_data = [
            {
                'title': f'{query} 단지 하자 관련 토론',
                'content': f'{query} 입주민들끼리 하자 문제에 대해 토론하고 있습니다. 벽지 균열, 화장실 누수, 단열재 문제 등이 지속적으로 보고되고 있어요. 시공사에 대한 불만도 많습니다.',
                'url': 'https://cafe.naver.com/sample1',
                'date': '2024.01.14',
                'source': '네이버 카페'
            },
            {
                'title': f'{query} 주차 문제 해결 방안',
                'content': f'{query}의 주차 문제를 해결하기 위한 입주민 모임이 있습니다. 지하 주차장 확장이나 주차 공간 재배치에 대한 의견을 나누고 있어요.',
                'url': 'https://cafe.naver.com/sample2',
                'date': '2024.01.11',
                'source': '네이버 카페'
            }
        ]
        
        # 쿼리에 따라 관련된 샘플 데이터 반환
        for data in sample_data[:max_results]:
            if query.lower() in data['title'].lower() or query.lower() in data['content'].lower():
                results.append(data)
        
        return results
    
    def analyze_sentiment(self, text: str) -> str:
        """간단한 감정 분석"""
        negative_keywords = ['불만', '문제', '하자', '피해', '소음', '악취', '습기', '균열', '누수', '단열', '방음', '주차', '관리비', '비싸', '어둡다', '작다', '불편']
        positive_keywords = ['좋다', '만족', '깨끗', '조용', '편리', '넓다', '밝다', '안전', '친절', '빠르다']
        
        negative_count = sum(1 for keyword in negative_keywords if keyword in text)
        positive_count = sum(1 for keyword in positive_keywords if keyword in text)
        
        if negative_count > positive_count:
            return "부정적"
        elif positive_count > negative_count:
            return "긍정적"
        else:
            return "중립적"
    
    def categorize_comments(self, results: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
        """댓글을 카테고리별로 분류"""
        categories = {
            '건물_하자': [],
            '소음_문제': [],
            '관리_문제': [],
            '주차_문제': [],
            '기타_불만': [],
            '긍정적_리뷰': []
        }
        
        for result in results:
            content = result['content'].lower()
            title = result['title'].lower()
            combined_text = content + ' ' + title
            
            # 건물 하자 관련
            if any(keyword in combined_text for keyword in ['하자', '균열', '누수', '습기', '단열', '방음']):
                categories['건물_하자'].append(result)
            # 소음 문제
            elif any(keyword in combined_text for keyword in ['소음', '시끄러움', '소리', '방음']):
                categories['소음_문제'].append(result)
            # 관리 문제
            elif any(keyword in combined_text for keyword in ['관리', '관리비', '청소', '보안']):
                categories['관리_문제'].append(result)
            # 주차 문제
            elif any(keyword in combined_text for keyword in ['주차', '차량', '주차장']):
                categories['주차_문제'].append(result)
            # 긍정적 리뷰
            elif any(keyword in combined_text for keyword in ['좋다', '만족', '깨끗', '조용', '편리']):
                categories['긍정적_리뷰'].append(result)
            # 기타 불만
            else:
                categories['기타_불만'].append(result)
        
        return categories

# API 엔드포인트들
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "web_scraper_service",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/scrape", response_model=ScrapingResponse)
async def scrape_web_content(request: ScrapingRequest):
    """웹에서 부동산 관련 정보를 스크래핑합니다."""
    try:
        logger.info(f"웹 스크래핑 시작: {request.query}")
        
        async with WebScraper() as scraper:
            # 여러 소스에서 검색
            all_results = []
            
            # 네이버 블로그 검색
            naver_results = await scraper.search_naver_blog(request.query, request.max_results // 3)
            all_results.extend(naver_results)
            
            # 다음 블로그 검색
            daum_results = await scraper.search_daum_blog(request.query, request.max_results // 3)
            all_results.extend(daum_results)
            
            # 네이버 카페 검색
            cafe_results = await scraper.search_cafe_posts(request.query, request.max_results // 3)
            all_results.extend(cafe_results)
        
        # 감정 분석 및 카테고리 분류
        for result in all_results:
            result['sentiment'] = scraper.analyze_sentiment(result['content'])
        
        # 카테고리별 분류
        categorized_results = scraper.categorize_comments(all_results)
        
        # 요약 생성
        summary = f"""
📊 **{request.query} 검색 결과 요약**

🔍 **총 {len(all_results)}개의 결과를 찾았습니다.**

📋 **카테고리별 분류:**
• 건물 하자 관련: {len(categorized_results['건물_하자'])}개
• 소음 문제: {len(categorized_results['소음_문제'])}개  
• 관리 문제: {len(categorized_results['관리_문제'])}개
• 주차 문제: {len(categorized_results['주차_문제'])}개
• 기타 불만: {len(categorized_results['기타_불만'])}개
• 긍정적 리뷰: {len(categorized_results['긍정적_리뷰'])}개

        💡 **주요 발견사항:**
{_generate_insights(categorized_results)}
        """.strip()
        
        return ScrapingResponse(
            results=all_results,
            total_found=len(all_results),
            search_query=request.query,
            timestamp=datetime.now().isoformat(),
            summary=summary
        )
        
    except Exception as e:
        logger.error(f"웹 스크래핑 오류: {e}")
        raise HTTPException(status_code=500, detail=f"웹 스크래핑 중 오류가 발생했습니다: {str(e)}")

def _generate_insights(categorized_results: Dict[str, List[Dict[str, Any]]]) -> str:
    """인사이트 생성"""
    insights = []
    
    for category, results in categorized_results.items():
        if results:
            insights.append(f"• {category}: {len(results)}개의 관련 게시물 발견")
    
    if not insights:
        insights.append("• 특별한 패턴이 발견되지 않았습니다.")
    
    return "\n".join(insights)

# 메인 실행
if __name__ == "__main__":
    logger.info("🚀 웹 스크래핑 서비스 시작 중...")
    uvicorn.run(
        "web_scraper_service:app",
        host="0.0.0.0",
        port=8013,
        reload=False,
        log_level="info"
    )
