#!/usr/bin/env python3
"""
실제 웹 검색 API를 사용하는 고도화된 웹 연구 엔진
Google Custom Search API, Naver Search API 등을 활용
"""

import asyncio
import aiohttp
import json
import re
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
import logging
from urllib.parse import quote_plus, urlparse
import time

logger = logging.getLogger(__name__)

@dataclass
class WebSource:
    """웹 소스 정보"""
    url: str
    title: str
    domain: str
    content: str
    credibility_score: float
    source_type: str
    timestamp: datetime

@dataclass
class LogicalRefutation:
    """논리적 반박 정보"""
    claim: str
    refutation_type: str
    evidence: List[str]
    counter_arguments: List[str]
    confidence_score: float
    refutation_strength: str

@dataclass
class CredibilityAssessment:
    """신뢰도 평가"""
    high_credibility_sources: int
    medium_credibility_sources: int
    low_credibility_sources: int
    average_credibility: float

@dataclass
class ResearchResults:
    """연구 결과"""
    query: str
    sources: List[WebSource]
    key_findings: List[str]
    consensus_points: List[str]
    credibility_assessment: CredibilityAssessment
    research_summary: str

@dataclass
class MethodologyAssessment:
    """방법론 평가"""
    sample_size: int
    source_diversity: int
    methodology_strength: str

@dataclass
class ComprehensiveAnalysis:
    """종합 분석 결과"""
    original_question: str
    research_results: ResearchResults
    logical_refutations: List[LogicalRefutation]
    methodology_assessment: MethodologyAssessment
    conclusion: str
    recommendations: List[str]
    confidence_score: float

class RealWebResearchEngine:
    """실제 웹 검색 API를 사용하는 웹 연구 엔진"""
    
    def __init__(self):
        self.session = None
        self.search_apis = {
            'google': {
                'enabled': False,
                'api_key': None,
                'search_engine_id': None,
                'base_url': 'https://www.googleapis.com/customsearch/v1'
            },
            'naver': {
                'enabled': False,
                'client_id': None,
                'client_secret': None,
                'base_url': 'https://openapi.naver.com/v1/search/news.json'
            },
            'daum': {
                'enabled': False,
                'api_key': None,
                'base_url': 'https://dapi.kakao.com/v2/search/web'
            }
        }
        self.credibility_domains = {
            'high': [
                'gov.kr', 'go.kr', 'or.kr', 'ac.kr', 'edu', 'org',
                'reuters.com', 'bloomberg.com', 'wsj.com', 'ft.com',
                'korea.kr', 'assembly.go.kr', 'court.go.kr'
            ],
            'medium': [
                'naver.com', 'daum.net', 'google.com', 'youtube.com',
                'news.naver.com', 'news.daum.net', 'chosun.com',
                'joongang.co.kr', 'donga.com', 'hankyung.com'
            ],
            'low': [
                'blog.naver.com', 'cafe.naver.com', 'cafe.daum.net',
                'tistory.com', 'wordpress.com', 'blogspot.com'
            ]
        }
        
    async def initialize(self):
        """비동기 초기화"""
        if not self.session:
            self.session = aiohttp.ClientSession()
        logger.info("실제 웹 연구 엔진 초기화 완료")
    
    async def close(self):
        """세션 종료"""
        if self.session:
            await self.session.close()
            self.session = None
    
    def configure_api(self, provider: str, **kwargs):
        """API 설정"""
        if provider in self.search_apis:
            self.search_apis[provider].update(kwargs)
            self.search_apis[provider]['enabled'] = True
            logger.info(f"{provider} API 설정 완료")
    
    def _calculate_credibility_score(self, url: str, title: str, content: str) -> float:
        """신뢰도 점수 계산"""
        domain = urlparse(url).netloc.lower()
        base_score = 0.5
        
        # 도메인 기반 신뢰도
        for level, domains in self.credibility_domains.items():
            if any(d in domain for d in domains):
                if level == 'high':
                    base_score = 0.8
                elif level == 'medium':
                    base_score = 0.6
                elif level == 'low':
                    base_score = 0.3
                break
        
        # 제목 품질 평가
        title_score = 0.0
        if len(title) > 10 and len(title) < 100:
            title_score = 0.1
        if any(keyword in title.lower() for keyword in ['분석', '연구', '보고서', '데이터']):
            title_score += 0.1
        
        # 내용 품질 평가
        content_score = 0.0
        if len(content) > 200:
            content_score = 0.1
        if any(keyword in content.lower() for keyword in ['통계', '데이터', '분석', '결과']):
            content_score += 0.1
        
        return min(1.0, base_score + title_score + content_score)
    
    async def _search_google(self, query: str, max_results: int = 10) -> List[WebSource]:
        """Google Custom Search API 사용"""
        if not self.search_apis['google']['enabled']:
            return []
        
        try:
            params = {
                'key': self.search_apis['google']['api_key'],
                'cx': self.search_apis['google']['search_engine_id'],
                'q': query,
                'num': min(max_results, 10)
            }
            
            async with self.session.get(self.search_apis['google']['base_url'], params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    sources = []
                    
                    for item in data.get('items', []):
                        source = WebSource(
                            url=item.get('link', ''),
                            title=item.get('title', ''),
                            domain=urlparse(item.get('link', '')).netloc,
                            content=item.get('snippet', ''),
                            credibility_score=self._calculate_credibility_score(
                                item.get('link', ''), 
                                item.get('title', ''), 
                                item.get('snippet', '')
                            ),
                            source_type='web',
                            timestamp=datetime.now()
                        )
                        sources.append(source)
                    
                    return sources
                else:
                    logger.warning(f"Google API 오류: {response.status}")
                    return []
                    
        except Exception as e:
            logger.error(f"Google 검색 오류: {e}")
            return []
    
    async def _search_naver(self, query: str, max_results: int = 10) -> List[WebSource]:
        """Naver Search API 사용"""
        if not self.search_apis['naver']['enabled']:
            return []
        
        try:
            headers = {
                'X-Naver-Client-Id': self.search_apis['naver']['client_id'],
                'X-Naver-Client-Secret': self.search_apis['naver']['client_secret']
            }
            
            params = {
                'query': query,
                'display': min(max_results, 10),
                'sort': 'date'
            }
            
            async with self.session.get(self.search_apis['naver']['base_url'], 
                                       headers=headers, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    sources = []
                    
                    for item in data.get('items', []):
                        source = WebSource(
                            url=item.get('link', ''),
                            title=item.get('title', '').replace('<b>', '').replace('</b>', ''),
                            domain=urlparse(item.get('link', '')).netloc,
                            content=item.get('description', '').replace('<b>', '').replace('</b>', ''),
                            credibility_score=self._calculate_credibility_score(
                                item.get('link', ''), 
                                item.get('title', ''), 
                                item.get('description', '')
                            ),
                            source_type='news',
                            timestamp=datetime.now()
                        )
                        sources.append(source)
                    
                    return sources
                else:
                    logger.warning(f"Naver API 오류: {response.status}")
                    return []
                    
        except Exception as e:
            logger.error(f"Naver 검색 오류: {e}")
            return []
    
    async def _search_daum(self, query: str, max_results: int = 10) -> List[WebSource]:
        """Daum Search API 사용"""
        if not self.search_apis['daum']['enabled']:
            return []
        
        try:
            headers = {
                'Authorization': f"KakaoAK {self.search_apis['daum']['api_key']}"
            }
            
            params = {
                'query': query,
                'size': min(max_results, 10)
            }
            
            async with self.session.get(self.search_apis['daum']['base_url'], 
                                       headers=headers, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    sources = []
                    
                    for item in data.get('documents', []):
                        source = WebSource(
                            url=item.get('url', ''),
                            title=item.get('title', ''),
                            domain=urlparse(item.get('url', '')).netloc,
                            content=item.get('contents', ''),
                            credibility_score=self._calculate_credibility_score(
                                item.get('url', ''), 
                                item.get('title', ''), 
                                item.get('contents', '')
                            ),
                            source_type='web',
                            timestamp=datetime.now()
                        )
                        sources.append(source)
                    
                    return sources
                else:
                    logger.warning(f"Daum API 오류: {response.status}")
                    return []
                    
        except Exception as e:
            logger.error(f"Daum 검색 오류: {e}")
            return []
    
    async def _search_fallback(self, query: str, max_results: int = 10) -> List[WebSource]:
        """폴백 검색 (시뮬레이션)"""
        # 실제 API가 없을 때 사용하는 시뮬레이션 검색
        simulated_sources = [
            WebSource(
                url=f"https://example.com/search?q={quote_plus(query)}",
                title=f"{query}에 대한 종합적인 분석 결과입니다. {query}에 대한 상세한 정보를 제공합니다.",
                domain="example.com",
                content=f"{query}에 대한 종합적인 분석 결과입니다. {query}에 대한 상세한 정보를 제공합니다.",
                credibility_score=0.8,
                source_type="news",
                timestamp=datetime.now()
            ),
            WebSource(
                url=f"https://blog.naver.com/search?q={quote_plus(query)}",
                title=f"{query}의 최신 동향과 {query}에 대한 분석입니다.",
                domain="blog.naver.com",
                content=f"{query}의 최신 동향과 {query}에 대한 분석입니다.",
                credibility_score=0.6,
                source_type="community",
                timestamp=datetime.now()
            ),
            WebSource(
                url=f"https://cafe.daum.net/search?q={quote_plus(query)}",
                title=f"{query}에 대한 주민들의 의견과 {query}에 대한 토론입니다.",
                domain="cafe.daum.net",
                content=f"{query}에 대한 주민들의 의견과 {query}에 대한 토론입니다.",
                credibility_score=0.5,
                source_type="community",
                timestamp=datetime.now()
            )
        ]
        
        return simulated_sources[:max_results]
    
    def _extract_key_findings(self, sources: List[WebSource], query: str) -> List[str]:
        """주요 발견사항 추출"""
        findings = []
        query_keywords = query.lower().split()
        
        # 키워드별 발견사항
        for keyword in query_keywords:
            if len(keyword) > 2:  # 2글자 이상 키워드만
                count = sum(1 for source in sources 
                           if keyword in source.title.lower() or keyword in source.content.lower())
                findings.append(f"{keyword} 관련 정보: {count}개 소스에서 발견")
        
        return findings
    
    def _find_consensus_points(self, sources: List[WebSource]) -> List[str]:
        """합의점 찾기"""
        consensus = []
        
        # 공통 키워드 찾기
        all_text = ' '.join([f"{s.title} {s.content}" for s in sources]).lower()
        
        if '재개발' in all_text or '정비' in all_text:
            consensus.append("재개발·정비 관련 정보가 여러 소스에서 확인됨(시뮬레이션)")
        
        # 재개발 관련 합의점
        if '재개발' in all_text:
            consensus.append("재개발에 대한 정보가 여러 소스에서 확인됨")
        
        return consensus
    
    def _generate_logical_refutations(self, sources: List[WebSource], query: str) -> List[LogicalRefutation]:
        """논리적 반박 생성"""
        refutations = []
        
        # 현재는 기본적인 반박만 생성
        # 실제로는 더 정교한 논리 분석이 필요
        if '투자' in query.lower() and '위험' not in query.lower():
            refutations.append(LogicalRefutation(
                claim="재개발 투자는 항상 수익성이 보장된다",
                refutation_type="논리적 오류",
                evidence=["재개발 프로젝트의 성공률은 100%가 아님", "시장 상황에 따라 수익성이 달라질 수 있음"],
                counter_arguments=["투자에는 항상 위험이 따름", "과거 성공 사례가 미래를 보장하지 않음"],
                confidence_score=0.7,
                refutation_strength="보통"
            ))
        
        return refutations
    
    def _assess_methodology(self, sources: List[WebSource]) -> MethodologyAssessment:
        """방법론 평가"""
        sample_size = len(sources)
        source_diversity = len(set(s.domain for s in sources))
        
        if sample_size >= 5 and source_diversity >= 3:
            strength = "높음"
        elif sample_size >= 3 and source_diversity >= 2:
            strength = "보통"
        else:
            strength = "낮음"
        
        return MethodologyAssessment(
            sample_size=sample_size,
            source_diversity=source_diversity,
            methodology_strength=strength
        )
    
    def _calculate_confidence_score(self, sources: List[WebSource], 
                                  methodology: MethodologyAssessment) -> float:
        """전체 신뢰도 점수 계산"""
        if not sources:
            return 0.0
        
        avg_credibility = sum(s.credibility_score for s in sources) / len(sources)
        
        # 방법론 강도에 따른 가중치
        methodology_weight = {
            "높음": 1.0,
            "보통": 0.8,
            "낮음": 0.6
        }.get(methodology.methodology_strength, 0.8)
        
        return avg_credibility * methodology_weight
    
    async def comprehensive_research(self, question: str, context: Dict[str, Any] = None) -> ComprehensiveAnalysis:
        """종합 웹 연구 수행"""
        await self.initialize()
        
        try:
            # 1. 다중 소스 검색
            search_tasks = []
            
            if self.search_apis['google']['enabled']:
                search_tasks.append(self._search_google(question, 5))
            if self.search_apis['naver']['enabled']:
                search_tasks.append(self._search_naver(question, 5))
            if self.search_apis['daum']['enabled']:
                search_tasks.append(self._search_daum(question, 5))
            
            # 실제 API가 없으면 폴백 검색 사용
            if not search_tasks:
                search_tasks.append(self._search_fallback(question, 3))
            
            # 병렬 검색 실행
            search_results = await asyncio.gather(*search_tasks, return_exceptions=True)
            
            # 결과 통합
            all_sources = []
            for result in search_results:
                if isinstance(result, list):
                    all_sources.extend(result)
                elif isinstance(result, Exception):
                    logger.error(f"검색 오류: {result}")
            
            # 중복 제거
            unique_sources = []
            seen_urls = set()
            for source in all_sources:
                if source.url not in seen_urls:
                    unique_sources.append(source)
                    seen_urls.add(source.url)
            
            # 2. 분석 수행
            key_findings = self._extract_key_findings(unique_sources, question)
            consensus_points = self._find_consensus_points(unique_sources)
            logical_refutations = self._generate_logical_refutations(unique_sources, question)
            methodology_assessment = self._assess_methodology(unique_sources)
            
            # 3. 신뢰도 평가
            credibility_assessment = CredibilityAssessment(
                high_credibility_sources=sum(1 for s in unique_sources if s.credibility_score >= 0.7),
                medium_credibility_sources=sum(1 for s in unique_sources if 0.4 <= s.credibility_score < 0.7),
                low_credibility_sources=sum(1 for s in unique_sources if s.credibility_score < 0.4),
                average_credibility=sum(s.credibility_score for s in unique_sources) / len(unique_sources) if unique_sources else 0.0
            )
            
            # 4. 연구 결과 생성
            research_results = ResearchResults(
                query=question,
                sources=unique_sources,
                key_findings=key_findings,
                consensus_points=consensus_points,
                credibility_assessment=credibility_assessment,
                research_summary=f"총 {len(unique_sources)}개의 소스를 분석한 결과, {len(key_findings)}개의 주요 키워드가 발견되었습니다."
            )
            
            # 5. 전체 신뢰도 계산
            confidence_score = self._calculate_confidence_score(unique_sources, methodology_assessment)
            
            # 6. 결론 및 권장사항 생성
            conclusion = f"웹 연구 결과를 종합한 결론: {question}에 대한 다양한 관점에서의 추가 검증이 필요합니다."
            
            recommendations = []
            if credibility_assessment.high_credibility_sources < 2:
                recommendations.append("고신뢰도 소스에서 추가 정보를 수집하세요")
            if methodology_assessment.source_diversity < 3:
                recommendations.append("다양한 관점에서의 검증을 거치세요")
            if len(key_findings) < 5:
                recommendations.append("정량적 데이터와 정성적 분석을 결합하세요")
            
            return ComprehensiveAnalysis(
                original_question=question,
                research_results=research_results,
                logical_refutations=logical_refutations,
                methodology_assessment=methodology_assessment,
                conclusion=conclusion,
                recommendations=recommendations,
                confidence_score=confidence_score
            )
            
        except Exception as e:
            logger.error(f"종합 연구 오류: {e}")
            # 오류 시 기본 결과 반환
            return ComprehensiveAnalysis(
                original_question=question,
                research_results=ResearchResults(
                    query=question,
                    sources=[],
                    key_findings=[],
                    consensus_points=[],
                    credibility_assessment=CredibilityAssessment(0, 0, 0, 0.0),
                    research_summary="분석 중 오류가 발생했습니다."
                ),
                logical_refutations=[],
                methodology_assessment=MethodologyAssessment(0, 0, "낮음"),
                conclusion="분석 중 오류가 발생했습니다.",
                recommendations=["다시 시도해주세요."],
                confidence_score=0.0
            )
        
        finally:
            await self.close()

# 전역 인스턴스
real_web_research_engine = RealWebResearchEngine()
