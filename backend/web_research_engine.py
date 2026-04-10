#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
웹 검색 기반 고도화된 연구 및 논리적 반박 엔진
Advanced Web Research and Logical Refutation Engine
"""

import requests
import json
import logging
import asyncio
import aiohttp
from typing import Dict, List, Any
from dataclasses import dataclass
from datetime import datetime
import re
import sqlite3
from pathlib import Path

logger = logging.getLogger(__name__)

@dataclass
class ResearchSource:
    """연구 소스 정보"""
    url: str
    title: str
    content: str
    domain: str
    credibility_score: float
    timestamp: str
    source_type: str  # 'news', 'academic', 'government', 'expert', 'other'

@dataclass
class ResearchResult:
    """연구 결과"""
    query: str
    sources: List[ResearchSource]
    key_findings: List[str]
    conflicting_info: List[str]
    consensus_points: List[str]
    credibility_assessment: Dict[str, Any]
    research_summary: str
    timestamp: str

@dataclass
class LogicalRefutation:
    """논리적 반박"""
    claim: str
    refutation_type: str  # 'factual_error', 'logical_fallacy', 'bias', 'outdated', 'context_missing'
    evidence: List[str]
    counter_arguments: List[str]
    credibility_sources: List[str]
    confidence_score: float
    refutation_strength: str  # 'strong', 'moderate', 'weak'

@dataclass
class ComprehensiveAnalysis:
    """종합 분석 결과"""
    original_question: str
    research_results: ResearchResult
    logical_refutations: List[LogicalRefutation]
    methodology_assessment: Dict[str, Any]
    conclusion: str
    recommendations: List[str]
    confidence_score: float
    timestamp: str

class WebResearchEngine:
    """웹 검색 기반 고도화된 연구 엔진"""
    
    def __init__(self):
        self.search_apis = {
            'google': self._search_google,
            'bing': self._search_bing,
            'naver': self._search_naver,
            'daum': self._search_daum
        }
        
        self.credibility_domains = {
            'high': [
                'ac.kr', 'edu', 'gov.kr', 'go.kr', 'or.kr',
                'nature.com', 'science.org', 'arxiv.org',
                'reuters.com', 'bloomberg.com', 'ft.com'
            ],
            'medium': [
                'naver.com', 'daum.net', 'google.com',
                'wikipedia.org', 'stackoverflow.com'
            ],
            'low': [
                'blog.naver.com', 'cafe.naver.com',
                'tistory.com', 'wordpress.com'
            ]
        }
        
        self.cache_db = self._init_cache_db()
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        logger.info("웹 연구 엔진 초기화 완료")
    
    def _init_cache_db(self) -> sqlite3.Connection:
        """캐시 데이터베이스 초기화"""
        db_path = Path("backend/research_cache.db")
        conn = sqlite3.connect(str(db_path))
        
        conn.execute("""
            CREATE TABLE IF NOT EXISTS research_cache (
                query_hash TEXT PRIMARY KEY,
                query TEXT,
                results TEXT,
                timestamp TEXT
            )
        """)
        
        return conn
    
    async def comprehensive_research(self, question: str, context: Dict[str, Any] = None) -> ComprehensiveAnalysis:
        """종합 연구 수행"""
        try:
            # 1. 질문 분석 및 검색 쿼리 생성
            search_queries = self._generate_search_queries(question, context)
            
            # 2. 병렬 웹 검색 수행
            research_results = await self._parallel_web_search(search_queries)
            
            # 3. 정보 분석 및 신뢰도 평가
            analyzed_results = self._analyze_research_results(research_results, question)
            
            # 4. 논리적 반박 생성
            logical_refutations = self._generate_logical_refutations(analyzed_results, question)
            
            # 5. 방법론 평가
            methodology_assessment = self._assess_methodology(analyzed_results)
            
            # 6. 종합 분석 결과 생성
            comprehensive_analysis = ComprehensiveAnalysis(
                original_question=question,
                research_results=analyzed_results,
                logical_refutations=logical_refutations,
                methodology_assessment=methodology_assessment,
                conclusion=self._generate_conclusion(analyzed_results, logical_refutations),
                recommendations=self._generate_recommendations(analyzed_results, logical_refutations),
                confidence_score=self._calculate_confidence(analyzed_results, logical_refutations),
                timestamp=datetime.now().isoformat()
            )
            
            return comprehensive_analysis
            
        except Exception as e:
            logger.error(f"종합 연구 수행 중 오류: {e}")
            raise
    
    def _generate_search_queries(self, question: str, context: Dict[str, Any] = None) -> List[str]:
        """검색 쿼리 생성"""
        queries = []
        
        # 기본 질문 기반 쿼리
        queries.append(question)
        
        # 핵심 키워드 추출
        keywords = self._extract_keywords(question)
        for keyword in keywords:
            queries.append(f'"{keyword}" 재개발 정비')
            queries.append(f'"{keyword}" 부동산 시장')
            queries.append(f'"{keyword}" 정책 분석')
        
        # 맥락 기반 추가 쿼리
        if context:
            if 'project_type' in context:
                queries.append(f'재개발 {context["project_type"]} 사례')
            if 'region' in context:
                queries.append(f'{context["region"]} 재개발 프로젝트')
        
        # 최신 정보 쿼리
        current_year = datetime.now().year
        queries.append(f'재개발 정비 {current_year} 최신 동향')
        queries.append(f'재개발 정책 변경 {current_year}')
        
        return list(set(queries))  # 중복 제거
    
    def _extract_keywords(self, question: str) -> List[str]:
        """핵심 키워드 추출"""
        keywords = []
        
        if any(word in question for word in ['단지', '조합', '아파트', '재건축']):
            keywords.extend(['재건축', '정비', '주거'])
        
        # 재개발 관련 키워드
        if any(word in question for word in ['재개발', '개발', '투자']):
            keywords.extend(['재개발', '도시개발', '투자'])
        
        # 정책 관련 키워드
        if any(word in question for word in ['정책', '법', '규제']):
            keywords.extend(['정책', '법규', '규제'])
        
        # 경제 관련 키워드
        if any(word in question for word in ['경제', '투자', '수익']):
            keywords.extend(['경제', '투자', '수익성'])
        
        return list(set(keywords))
    
    async def _parallel_web_search(self, queries: List[str]) -> List[ResearchSource]:
        """병렬 웹 검색 수행"""
        all_sources = []
        
        async with aiohttp.ClientSession() as session:
            tasks = []
            for query in queries[:5]:  # 상위 5개 쿼리만 사용
                for api_name in ['google', 'naver', 'daum']:
                    task = self._search_with_api(session, api_name, query)
                    tasks.append(task)
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for result in results:
                if isinstance(result, list):
                    all_sources.extend(result)
        
        # 중복 제거 및 신뢰도 순 정렬
        unique_sources = self._deduplicate_sources(all_sources)
        return sorted(unique_sources, key=lambda x: x.credibility_score, reverse=True)
    
    async def _search_with_api(self, session: aiohttp.ClientSession, api_name: str, query: str) -> List[ResearchSource]:
        """API별 검색 수행"""
        try:
            if api_name == 'google':
                return await self._search_google_async(session, query)
            elif api_name == 'naver':
                return await self._search_naver_async(session, query)
            elif api_name == 'daum':
                return await self._search_daum_async(session, query)
            else:
                return []
        except Exception as e:
            logger.error(f"{api_name} 검색 중 오류: {e}")
            return []
    
    async def _search_google_async(self, session: aiohttp.ClientSession, query: str) -> List[ResearchSource]:
        """Google 검색 (시뮬레이션)"""
        # 실제 구현에서는 Google Custom Search API 사용
        sources = []
        
        # 시뮬레이션된 검색 결과
        mock_results = [
            {
                'url': 'https://example.com/project-analysis',
                'title': f'재개발·정비 프로젝트 분석(예시) - {query}',
                'content': f'프로젝트에 대한 종합 분석(시뮬레이션)입니다. {query}에 대한 상세 정보를 제공합니다.',
                'domain': 'example.com'
            }
        ]
        
        for result in mock_results:
            source = ResearchSource(
                url=result['url'],
                title=result['title'],
                content=result['content'],
                domain=result['domain'],
                credibility_score=self._calculate_domain_credibility(result['domain']),
                timestamp=datetime.now().isoformat(),
                source_type=self._classify_source_type(result['domain'])
            )
            sources.append(source)
        
        return sources
    
    async def _search_naver_async(self, session: aiohttp.ClientSession, query: str) -> List[ResearchSource]:
        """Naver 검색 (시뮬레이션)"""
        sources = []
        
        mock_results = [
            {
                'url': 'https://blog.naver.com/sample-project-info',
                'title': f'프로젝트 최신 정보(예시) - {query}',
                'content': f'프로젝트 최신 동향과 {query}에 대한 분석(시뮬레이션)입니다.',
                'domain': 'blog.naver.com'
            }
        ]
        
        for result in mock_results:
            source = ResearchSource(
                url=result['url'],
                title=result['title'],
                content=result['content'],
                domain=result['domain'],
                credibility_score=self._calculate_domain_credibility(result['domain']),
                timestamp=datetime.now().isoformat(),
                source_type=self._classify_source_type(result['domain'])
            )
            sources.append(source)
        
        return sources
    
    async def _search_daum_async(self, session: aiohttp.ClientSession, query: str) -> List[ResearchSource]:
        """Daum 검색 (시뮬레이션)"""
        sources = []
        
        mock_results = [
            {
                'url': 'https://cafe.daum.net/sample-community',
                'title': f'이해관계자 커뮤니티(예시) - {query}',
                'content': f'프로젝트 관련 의견과 {query}에 대한 토론(시뮬레이션)입니다.',
                'domain': 'cafe.daum.net'
            }
        ]
        
        for result in mock_results:
            source = ResearchSource(
                url=result['url'],
                title=result['title'],
                content=result['content'],
                domain=result['domain'],
                credibility_score=self._calculate_domain_credibility(result['domain']),
                timestamp=datetime.now().isoformat(),
                source_type=self._classify_source_type(result['domain'])
            )
            sources.append(source)
        
        return sources
    
    def _calculate_domain_credibility(self, domain: str) -> float:
        """도메인 신뢰도 계산"""
        for level, domains in self.credibility_domains.items():
            for cred_domain in domains:
                if cred_domain in domain:
                    if level == 'high':
                        return 0.9
                    elif level == 'medium':
                        return 0.7
                    elif level == 'low':
                        return 0.4
        
        return 0.5  # 기본값
    
    def _classify_source_type(self, domain: str) -> str:
        """소스 타입 분류"""
        if any(edu in domain for edu in ['ac.kr', 'edu']):
            return 'academic'
        elif any(gov in domain for gov in ['gov.kr', 'go.kr']):
            return 'government'
        elif any(news in domain for news in ['reuters.com', 'bloomberg.com']):
            return 'news'
        elif 'blog' in domain or 'cafe' in domain:
            return 'community'
        else:
            return 'other'
    
    def _deduplicate_sources(self, sources: List[ResearchSource]) -> List[ResearchSource]:
        """소스 중복 제거"""
        seen_urls = set()
        unique_sources = []
        
        for source in sources:
            if source.url not in seen_urls:
                seen_urls.add(source.url)
                unique_sources.append(source)
        
        return unique_sources
    
    def _analyze_research_results(self, sources: List[ResearchSource], question: str) -> ResearchResult:
        """연구 결과 분석"""
        key_findings = []
        conflicting_info = []
        consensus_points = []
        
        # 키워드별 정보 수집
        keyword_info = {}
        for source in sources:
            for keyword in self._extract_keywords(question):
                if keyword in source.content:
                    if keyword not in keyword_info:
                        keyword_info[keyword] = []
                    keyword_info[keyword].append(source.content)
        
        # 핵심 발견사항 추출
        for keyword, contents in keyword_info.items():
            if len(contents) >= 2:
                consensus_points.append(f"{keyword}에 대한 정보가 여러 소스에서 확인됨")
            key_findings.append(f"{keyword} 관련 정보: {len(contents)}개 소스에서 발견")
        
        # 신뢰도 평가
        credibility_assessment = {
            'high_credibility_sources': len([s for s in sources if s.credibility_score >= 0.8]),
            'medium_credibility_sources': len([s for s in sources if 0.5 <= s.credibility_score < 0.8]),
            'low_credibility_sources': len([s for s in sources if s.credibility_score < 0.5]),
            'average_credibility': sum(s.credibility_score for s in sources) / len(sources) if sources else 0
        }
        
        return ResearchResult(
            query=question,
            sources=sources,
            key_findings=key_findings,
            conflicting_info=conflicting_info,
            consensus_points=consensus_points,
            credibility_assessment=credibility_assessment,
            research_summary=self._generate_research_summary(sources, key_findings),
            timestamp=datetime.now().isoformat()
        )
    
    def _generate_research_summary(self, sources: List[ResearchSource], key_findings: List[str]) -> str:
        """연구 요약 생성"""
        summary = f"총 {len(sources)}개의 소스를 분석한 결과:\n\n"
        
        if key_findings:
            summary += "주요 발견사항:\n"
            for finding in key_findings:
                summary += f"- {finding}\n"
            summary += "\n"
        
        high_cred_sources = [s for s in sources if s.credibility_score >= 0.8]
        if high_cred_sources:
            summary += f"고신뢰도 소스: {len(high_cred_sources)}개\n"
        
        return summary
    
    def _generate_logical_refutations(self, research_result: ResearchResult, question: str) -> List[LogicalRefutation]:
        """논리적 반박 생성"""
        refutations = []
        
        # 일반적인 논리적 오류 패턴 검사
        logical_fallacies = [
            ('확증 편향', '일부 정보만을 선택적으로 인용하는 경향'),
            ('인과관계 오류', '상관관계를 인과관계로 잘못 해석'),
            ('성급한 일반화', '제한된 사례로부터 과도한 일반화'),
            ('권위에의 호소', '전문성 없이 권위만을 근거로 주장'),
            ('감정적 호소', '논리적 근거 없이 감정에만 호소')
        ]
        
        for fallacy_name, fallacy_desc in logical_fallacies:
            if self._detect_logical_fallacy(question, fallacy_name):
                refutation = LogicalRefutation(
                    claim=question,
                    refutation_type='logical_fallacy',
                    evidence=[fallacy_desc],
                    counter_arguments=[f"{fallacy_name}의 가능성을 고려해야 합니다"],
                    credibility_sources=[s.url for s in research_result.sources[:3]],
                    confidence_score=0.7,
                    refutation_strength='moderate'
                )
                refutations.append(refutation)
        
        # 사실 오류 검사
        factual_errors = self._detect_factual_errors(research_result, question)
        for error in factual_errors:
            refutation = LogicalRefutation(
                claim=error['claim'],
                refutation_type='factual_error',
                evidence=error['evidence'],
                counter_arguments=error['counter_arguments'],
                credibility_sources=error['sources'],
                confidence_score=error['confidence'],
                refutation_strength=error['strength']
            )
            refutations.append(refutation)
        
        return refutations
    
    def _detect_logical_fallacy(self, question: str, fallacy_type: str) -> bool:
        """논리적 오류 검출"""
        fallacy_patterns = {
            '확증 편향': ['확실히', '분명히', '틀림없이'],
            '인과관계 오류': ['때문에', '결과적으로', '따라서'],
            '성급한 일반화': ['모든', '항상', '절대'],
            '권위에의 호소': ['전문가', '연구결과', '보고서'],
            '감정적 호소': ['중요한', '심각한', '위험한']
        }
        
        if fallacy_type in fallacy_patterns:
            patterns = fallacy_patterns[fallacy_type]
            return any(pattern in question for pattern in patterns)
        
        return False
    
    def _detect_factual_errors(self, research_result: ResearchResult, question: str) -> List[Dict[str, Any]]:
        """사실 오류 검출"""
        errors = []
        
        # 시점 관련 오류 검사
        if '완료' in question and '진행 중' in research_result.research_summary:
            errors.append({
                'claim': '프로젝트 완료 주장',
                'evidence': ['프로젝트가 현재 진행 중임을 확인'],
                'counter_arguments': ['진행 중인 프로젝트의 완료 시점을 정확히 확인해야 함'],
                'sources': [s.url for s in research_result.sources[:2]],
                'confidence': 0.8,
                'strength': 'strong'
            })
        
        # 수치 관련 오류 검사
        if any(word in question for word in ['100%', '완벽', '절대']):
            errors.append({
                'claim': '완벽한 정확성 주장',
                'evidence': ['모든 분석에는 불확실성이 존재함'],
                'counter_arguments': ['상대적 관점에서 분석해야 함'],
                'sources': [s.url for s in research_result.sources[:2]],
                'confidence': 0.9,
                'strength': 'strong'
            })
        
        return errors
    
    def _assess_methodology(self, research_result: ResearchResult) -> Dict[str, Any]:
        """방법론 평가"""
        return {
            'sample_size': len(research_result.sources),
            'credibility_distribution': research_result.credibility_assessment,
            'source_diversity': len(set(s.domain for s in research_result.sources)),
            'temporal_coverage': 'recent',  # 최신 정보 포함 여부
            'methodology_strength': 'moderate' if len(research_result.sources) >= 5 else 'weak'
        }
    
    def _generate_conclusion(self, research_result: ResearchResult, refutations: List[LogicalRefutation]) -> str:
        """결론 생성"""
        conclusion = "웹 연구 결과를 종합한 결론:\n\n"
        
        if research_result.consensus_points:
            conclusion += "확인된 사실:\n"
            for point in research_result.consensus_points:
                conclusion += f"- {point}\n"
            conclusion += "\n"
        
        if refutations:
            conclusion += "주의사항:\n"
            for refutation in refutations:
                conclusion += f"- {refutation.evidence[0]}\n"
            conclusion += "\n"
        
        conclusion += "전반적으로 다양한 관점에서의 추가 검증이 필요합니다."
        
        return conclusion
    
    def _generate_recommendations(self, research_result: ResearchResult, refutations: List[LogicalRefutation]) -> List[str]:
        """권장사항 생성"""
        recommendations = []
        
        if research_result.credibility_assessment['high_credibility_sources'] < 3:
            recommendations.append("고신뢰도 소스에서 추가 정보를 수집하세요")
        
        if refutations:
            recommendations.append("논리적 오류 가능성을 고려하여 재검토하세요")
        
        recommendations.extend([
            "최신 정보로 업데이트된 분석을 수행하세요",
            "다양한 관점에서의 검증을 거치세요",
            "정량적 데이터와 정성적 분석을 결합하세요"
        ])
        
        return recommendations
    
    def _calculate_confidence(self, research_result: ResearchResult, refutations: List[LogicalRefutation]) -> float:
        """신뢰도 계산"""
        base_confidence = research_result.credibility_assessment['average_credibility']
        
        # 소스 수에 따른 보정
        source_penalty = max(0, (10 - len(research_result.sources)) * 0.05)
        
        # 반박 수에 따른 보정
        refutation_penalty = len(refutations) * 0.1
        
        final_confidence = base_confidence - source_penalty - refutation_penalty
        return max(0.1, min(1.0, final_confidence))

# 전역 인스턴스
web_research_engine = WebResearchEngine()
