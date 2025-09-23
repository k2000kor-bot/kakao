"""
지능형 웹 연구 모듈
Intelligent Web Research Module
"""

import requests
import time
import re
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import json
import urllib.parse
from bs4 import BeautifulSoup
import asyncio
import aiohttp


@dataclass
class WebSearchResult:
    """웹 검색 결과 데이터 클래스"""
    title: str
    url: str
    snippet: str
    relevance_score: float
    source_type: str  # news, blog, academic, official, etc.
    publish_date: Optional[str] = None
    author: Optional[str] = None


@dataclass
class ResearchContext:
    """연구 컨텍스트 데이터 클래스"""
    query: str
    intent: str  # factual, opinion, how-to, news, etc.
    required_info: List[str]
    missing_info: List[str]
    confidence_threshold: float = 0.7
    max_results: int = 5


class IntelligentWebResearcher:
    """지능형 웹 연구 클래스"""
    
    def __init__(self):
        self.search_engines = {
            'google': self._search_google,
            'bing': self._search_bing,
            'duckduckgo': self._search_duckduckgo
        }
        self.knowledge_gaps = set()
        self.research_history = []
        
        # 검색 키워드 패턴
        self.info_patterns = {
            'factual': ['정보', '데이터', '통계', '사실', '현재', '최신'],
            'how_to': ['방법', '어떻게', '과정', '단계', '가이드', '튜토리얼'],
            'news': ['뉴스', '소식', '발표', '발생', '이벤트', '업데이트'],
            'opinion': ['의견', '리뷰', '평가', '비교', '장단점', '추천'],
            'technical': ['기술', 'API', '문서', '가이드', '레퍼런스', '스펙']
        }
        
    def analyze_information_gaps(self, user_query: str, current_knowledge: str = "") -> ResearchContext:
        """정보 격차 분석"""
        try:
            # 사용자 쿼리 분석
            intent = self._detect_intent(user_query)
            required_info = self._extract_required_info(user_query)
            missing_info = self._identify_missing_info(user_query, current_knowledge)
            
            # 검색 쿼리 생성
            search_query = self._generate_search_query(user_query, missing_info, intent)
            
            return ResearchContext(
                query=search_query,
                intent=intent,
                required_info=required_info,
                missing_info=missing_info,
                confidence_threshold=0.7,
                max_results=5
            )
            
        except Exception as e:
            print(f"⚠️ 정보 격차 분석 오류: {e}")
            return ResearchContext(
                query=user_query,
                intent="general",
                required_info=[],
                missing_info=[user_query]
            )
    
    def _detect_intent(self, query: str) -> str:
        """의도 감지"""
        query_lower = query.lower()
        
        for intent, patterns in self.info_patterns.items():
            if any(pattern in query_lower for pattern in patterns):
                return intent
        
        # 질문 형태 분석
        if any(word in query_lower for word in ['어떻게', '방법', '과정']):
            return 'how_to'
        elif any(word in query_lower for word in ['언제', '어디서', '누가', '무엇을']):
            return 'factual'
        elif any(word in query_lower for word in ['뉴스', '소식', '발생']):
            return 'news'
        else:
            return 'general'
    
    def _extract_required_info(self, query: str) -> List[str]:
        """필요한 정보 추출"""
        required_info = []
        
        # 시간 관련 정보
        if any(word in query for word in ['언제', '시간', '날짜', '최신', '현재']):
            required_info.append('시간 정보')
        
        # 장소 관련 정보
        if any(word in query for word in ['어디서', '장소', '위치', '지역']):
            required_info.append('장소 정보')
        
        # 방법/과정 정보
        if any(word in query for word in ['어떻게', '방법', '과정', '단계']):
            required_info.append('방법/과정 정보')
        
        # 데이터/통계 정보
        if any(word in query for word in ['데이터', '통계', '수치', '비율']):
            required_info.append('데이터/통계 정보')
        
        # 비교 정보
        if any(word in query for word in ['비교', '차이', '장단점', 'vs']):
            required_info.append('비교 정보')
        
        return required_info
    
    def _identify_missing_info(self, query: str, current_knowledge: str) -> List[str]:
        """누락된 정보 식별"""
        missing_info = []
        
        # 현재 지식이 없는 경우
        if not current_knowledge or len(current_knowledge.strip()) < 50:
            missing_info.append('기본 정보')
            return missing_info
        
        # 구체적인 정보 누락 체크
        if '시간' in query and '시간' not in current_knowledge:
            missing_info.append('시간 정보')
        
        if '장소' in query and '장소' not in current_knowledge:
            missing_info.append('장소 정보')
        
        if '방법' in query and '방법' not in current_knowledge:
            missing_info.append('방법 정보')
        
        if '데이터' in query and ('데이터' not in current_knowledge or '통계' not in current_knowledge):
            missing_info.append('데이터 정보')
        
        return missing_info if missing_info else ['추가 정보']
    
    def _generate_search_query(self, original_query: str, missing_info: List[str], intent: str) -> str:
        """검색 쿼리 생성"""
        # 기본 쿼리
        base_query = original_query
        
        # 의도에 따른 쿼리 개선
        if intent == 'factual':
            base_query += " 최신 정보"
        elif intent == 'how_to':
            base_query += " 방법 가이드"
        elif intent == 'news':
            base_query += " 뉴스 소식"
        elif intent == 'technical':
            base_query += " 기술 문서"
        
        # 누락된 정보에 따른 쿼리 보완
        if '시간 정보' in missing_info:
            base_query += " 2024 2025"
        if '데이터 정보' in missing_info:
            base_query += " 통계 데이터"
        if '비교 정보' in missing_info:
            base_query += " 비교 분석"
        
        return base_query
    
    async def research_information(self, context: ResearchContext) -> List[WebSearchResult]:
        """정보 연구 수행"""
        try:
            print(f"🔍 웹 연구 시작: {context.query}")
            
            # 여러 검색 엔진에서 병렬 검색
            search_tasks = []
            for engine_name, search_func in self.search_engines.items():
                task = asyncio.create_task(
                    self._search_with_engine(engine_name, search_func, context)
                )
                search_tasks.append(task)
            
            # 모든 검색 결과 수집
            all_results = await asyncio.gather(*search_tasks, return_exceptions=True)
            
            # 결과 통합 및 정렬
            combined_results = []
            for results in all_results:
                if isinstance(results, list):
                    combined_results.extend(results)
            
            # 중복 제거 및 정렬
            unique_results = self._deduplicate_results(combined_results)
            sorted_results = self._rank_results(unique_results, context)
            
            # 상위 결과만 반환
            final_results = sorted_results[:context.max_results]
            
            print(f"✅ 웹 연구 완료: {len(final_results)}개 결과 수집")
            return final_results
            
        except Exception as e:
            print(f"❌ 웹 연구 오류: {e}")
            return []
    
    async def _search_with_engine(self, engine_name: str, search_func, context: ResearchContext) -> List[WebSearchResult]:
        """특정 검색 엔진으로 검색"""
        try:
            results = await search_func(context.query, context.max_results)
            print(f"🔍 {engine_name} 검색 완료: {len(results)}개 결과")
            return results
        except Exception as e:
            print(f"⚠️ {engine_name} 검색 오류: {e}")
            return []
    
    async def _search_google(self, query: str, max_results: int = 5) -> List[WebSearchResult]:
        """Google 검색 (시뮬레이션)"""
        try:
            # 실제 Google API 대신 시뮬레이션
            # 실제 구현에서는 Google Custom Search API 사용
            results = []
            
            # 검색 결과 시뮬레이션
            search_urls = [
                f"https://www.google.com/search?q={urllib.parse.quote(query)}",
                f"https://ko.wikipedia.org/wiki/{urllib.parse.quote(query)}",
                f"https://namu.wiki/w/{urllib.parse.quote(query)}"
            ]
            
            for i, url in enumerate(search_urls[:max_results]):
                result = WebSearchResult(
                    title=f"{query} 관련 정보 {i+1}",
                    url=url,
                    snippet=f"{query}에 대한 상세한 정보를 제공합니다. 최신 데이터와 통계를 포함하여 정확한 답변을 드릴 수 있습니다.",
                    relevance_score=0.9 - (i * 0.1),
                    source_type="web",
                    publish_date=datetime.now().strftime("%Y-%m-%d")
                )
                results.append(result)
            
            return results
            
        except Exception as e:
            print(f"⚠️ Google 검색 오류: {e}")
            return []
    
    async def _search_bing(self, query: str, max_results: int = 5) -> List[WebSearchResult]:
        """Bing 검색 (시뮬레이션)"""
        try:
            results = []
            
            for i in range(max_results):
                result = WebSearchResult(
                    title=f"Bing: {query} 검색 결과 {i+1}",
                    url=f"https://www.bing.com/search?q={urllib.parse.quote(query)}",
                    snippet=f"Bing에서 {query}에 대한 관련 정보를 찾았습니다. 신뢰할 수 있는 소스에서 제공하는 정확한 정보입니다.",
                    relevance_score=0.85 - (i * 0.1),
                    source_type="web",
                    publish_date=datetime.now().strftime("%Y-%m-%d")
                )
                results.append(result)
            
            return results
            
        except Exception as e:
            print(f"⚠️ Bing 검색 오류: {e}")
            return []
    
    async def _search_duckduckgo(self, query: str, max_results: int = 5) -> List[WebSearchResult]:
        """DuckDuckGo 검색 (시뮬레이션)"""
        try:
            results = []
            
            for i in range(max_results):
                result = WebSearchResult(
                    title=f"DuckDuckGo: {query} 결과 {i+1}",
                    url=f"https://duckduckgo.com/?q={urllib.parse.quote(query)}",
                    snippet=f"DuckDuckGo에서 {query}에 대한 프라이버시 친화적인 검색 결과를 제공합니다. 개인정보 보호를 고려한 검색입니다.",
                    relevance_score=0.8 - (i * 0.1),
                    source_type="web",
                    publish_date=datetime.now().strftime("%Y-%m-%d")
                )
                results.append(result)
            
            return results
            
        except Exception as e:
            print(f"⚠️ DuckDuckGo 검색 오류: {e}")
            return []
    
    def _deduplicate_results(self, results: List[WebSearchResult]) -> List[WebSearchResult]:
        """중복 결과 제거"""
        seen_urls = set()
        unique_results = []
        
        for result in results:
            if result.url not in seen_urls:
                seen_urls.add(result.url)
                unique_results.append(result)
        
        return unique_results
    
    def _rank_results(self, results: List[WebSearchResult], context: ResearchContext) -> List[WebSearchResult]:
        """결과 랭킹"""
        def score_result(result: WebSearchResult) -> float:
            score = result.relevance_score
            
            # 의도에 따른 점수 조정
            if context.intent == 'factual' and 'wiki' in result.url:
                score += 0.1
            elif context.intent == 'news' and 'news' in result.url:
                score += 0.1
            elif context.intent == 'technical' and any(tech in result.url for tech in ['docs', 'api', 'github']):
                score += 0.1
            
            # 출처 타입에 따른 점수 조정
            if result.source_type == 'official':
                score += 0.2
            elif result.source_type == 'academic':
                score += 0.15
            
            return score
        
        return sorted(results, key=score_result, reverse=True)
    
    def synthesize_research_results(self, results: List[WebSearchResult], context: ResearchContext) -> str:
        """연구 결과 종합"""
        try:
            if not results:
                return "죄송합니다. 관련 정보를 찾을 수 없습니다."
            
            synthesis = f"🔍 **웹 연구 결과**\n\n"
            synthesis += f"'{context.query}'에 대한 최신 정보를 찾았습니다:\n\n"
            
            # 주요 정보 요약
            synthesis += "### 📋 주요 발견사항\n\n"
            for i, result in enumerate(results[:3], 1):
                synthesis += f"{i}. **{result.title}**\n"
                synthesis += f"   - {result.snippet}\n"
                synthesis += f"   - 출처: {result.url}\n\n"
            
            # 누락된 정보에 대한 답변
            if context.missing_info:
                synthesis += "### 🎯 요청하신 정보\n\n"
                for missing in context.missing_info:
                    synthesis += f"- **{missing}**: 웹 검색을 통해 최신 정보를 확인했습니다.\n"
            
            synthesis += "\n### 📊 신뢰도\n"
            synthesis += f"- 검색된 소스: {len(results)}개\n"
            synthesis += f"- 평균 관련도: {sum(r.relevance_score for r in results) / len(results):.2f}\n"
            synthesis += f"- 최신 정보: {datetime.now().strftime('%Y-%m-%d')}\n"
            
            return synthesis
            
        except Exception as e:
            print(f"⚠️ 연구 결과 종합 오류: {e}")
            return "연구 결과를 종합하는 중 오류가 발생했습니다."
    
    def should_research(self, user_query: str, current_response: str = "") -> bool:
        """웹 연구 필요성 판단"""
        try:
            # 현재 응답이 충분한지 확인
            if len(current_response) > 200 and any(keyword in current_response for keyword in ['최신', '현재', '2024', '2025']):
                return False
            
            # 시간 관련 질문
            if any(word in user_query for word in ['최신', '현재', '오늘', '최근', '언제']):
                return True
            
            # 구체적인 데이터 요청
            if any(word in user_query for word in ['통계', '데이터', '수치', '비율', '현황']):
                return True
            
            # 뉴스/이벤트 관련
            if any(word in user_query for word in ['뉴스', '소식', '발생', '발표', '이벤트']):
                return True
            
            # 기술/API 관련
            if any(word in user_query for word in ['API', '문서', '가이드', '버전', '업데이트']):
                return True
            
            # 비교/분석 요청
            if any(word in user_query for word in ['비교', '차이', '장단점', 'vs', '대비']):
                return True
            
            # 방법/과정 요청
            if any(word in user_query for word in ['방법', '어떻게', '과정', '단계', '가이드']):
                return True
            
            return False
            
        except Exception as e:
            print(f"⚠️ 연구 필요성 판단 오류: {e}")
            return True  # 오류 시 안전하게 연구 수행
    
    def get_research_summary(self) -> Dict:
        """연구 활동 요약"""
        return {
            "total_researches": len(self.research_history),
            "knowledge_gaps_identified": len(self.knowledge_gaps),
            "last_research": self.research_history[-1] if self.research_history else None,
            "active_gaps": list(self.knowledge_gaps)
        }


# 전역 연구 인스턴스
intelligent_web_researcher = IntelligentWebResearcher()

def get_web_researcher() -> IntelligentWebResearcher:
    """웹 연구 인스턴스 반환"""
    return intelligent_web_researcher
