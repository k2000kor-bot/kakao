"""
통합 분석 엔진
- 모든 개별 분석 모듈을 통합하여 종합적인 인사이트 제공
- 교차 분석 및 패턴 매칭
- 통합 위험도 평가 및 권장사항 생성
"""

from dataclasses import dataclass
from typing import List, Dict, Any, Optional
from datetime import datetime
import asyncio
import json

from advanced_kakao_parser import AdvancedKakaoParser
from construction_company_analyzer import ConstructionCompanyAnalyzer
from realtime_promotion_detector import RealTimePromotionDetector
from bid_proposal_analyzer import BidProposalAnalyzer
from multi_document_analyzer import MultiDocumentAnalyzer
from advanced_company_relationship_analyzer import AdvancedCompanyRelationshipAnalyzer


@dataclass
class IntegratedAnalysisResult:
    """통합 분석 결과"""
    timestamp: str
    content_length: int
    analysis_modules: List[str]
    cross_analysis: Dict[str, Any]
    risk_assessment: Dict[str, str]
    recommendations: List[str]
    confidence_score: float
    key_insights: List[str]
    bias_patterns: List[str]
    company_relationships: List[Dict]
    regional_biases: List[Dict]
    promotional_elements: List[Dict]
    document_analysis: Dict[str, Any]
    overall_bias_summary: Dict[str, float]


class IntegratedAnalysisEngine:
    """통합 분석 엔진"""
    
    def __init__(self):
        self.kakao_parser = AdvancedKakaoParser()
        self.construction_analyzer = ConstructionCompanyAnalyzer()
        self.promotion_detector = RealTimePromotionDetector()
        self.bid_analyzer = BidProposalAnalyzer()
        self.multi_document_analyzer = MultiDocumentAnalyzer()
        self.company_relationship_analyzer = AdvancedCompanyRelationshipAnalyzer()
        
        # 통합 분석 설정
        self.analysis_modules = [
            'kakao_conversation',
            'construction_bias',
            'promotion_detection',
            'bid_proposal',
            'multi_document',
            'company_relationship'
        ]
        
        # 위험도 임계값
        self.risk_thresholds = {
            'high_bias': 0.7,
            'medium_bias': 0.5,
            'conflict_level': 0.6,
            'promotion_intensity': 0.8
        }

    async def run_integrated_analysis(self, content: str, room_id: str) -> IntegratedAnalysisResult:
        """통합 분석 실행"""
        
        # 1. 개별 분석 모듈 실행
        analysis_results = await self._run_individual_analyses(content, room_id)
        
        # 2. 교차 분석 수행
        cross_analysis = self._perform_cross_analysis(analysis_results)
        
        # 3. 위험도 평가
        risk_assessment = self._assess_overall_risk(analysis_results)
        
        # 4. 권장사항 생성
        recommendations = self._generate_recommendations(analysis_results, risk_assessment)
        
        # 5. 핵심 인사이트 추출
        key_insights = self._extract_key_insights(analysis_results, cross_analysis)
        
        # 6. 편향 패턴 통합
        bias_patterns = self._integrate_bias_patterns(analysis_results)
        
        # 7. 기업 관계 통합
        company_relationships = self._integrate_company_relationships(analysis_results)
        
        # 8. 지역 편향 통합
        regional_biases = self._integrate_regional_biases(analysis_results)
        
        # 9. 홍보 요소 통합
        promotional_elements = self._integrate_promotional_elements(analysis_results)
        
        # 10. 문서 분석 통합
        document_analysis = self._integrate_document_analysis(analysis_results)
        
        # 11. 전체 편향성 요약
        overall_bias_summary = self._generate_overall_bias_summary(analysis_results)
        
        # 12. 신뢰도 점수 계산
        confidence_score = self._calculate_confidence_score(analysis_results)
        
        return IntegratedAnalysisResult(
            timestamp=datetime.now().isoformat(),
            content_length=len(content),
            analysis_modules=self.analysis_modules,
            cross_analysis=cross_analysis,
            risk_assessment=risk_assessment,
            recommendations=recommendations,
            confidence_score=confidence_score,
            key_insights=key_insights,
            bias_patterns=bias_patterns,
            company_relationships=company_relationships,
            regional_biases=regional_biases,
            promotional_elements=promotional_elements,
            document_analysis=document_analysis,
            overall_bias_summary=overall_bias_summary
        )

    async def _run_individual_analyses(self, content: str, room_id: str) -> Dict[str, Any]:
        """개별 분석 모듈 실행"""
        results = {}
        
        # 카카오톡 대화 분석
        try:
            kakao_result = self.kakao_parser.parse_kakao_content(content)
            results['kakao_conversation'] = kakao_result
        except Exception as e:
            print(f"카카오톡 분석 오류: {e}")
            results['kakao_conversation'] = None
        
        # 시공사 편향 분석
        try:
            construction_result = self.construction_analyzer.analyze_company_bias(content)
            results['construction_bias'] = construction_result
        except Exception as e:
            print(f"시공사 편향 분석 오류: {e}")
            results['construction_bias'] = None
        
        # 실시간 홍보 감지
        try:
            promotion_result = self.promotion_detector.detect_promotion_in_message(content)
            results['promotion_detection'] = promotion_result
        except Exception as e:
            print(f"홍보 감지 오류: {e}")
            results['promotion_detection'] = None
        
        # 입찰제안서 분석
        try:
            bid_result = self.bid_analyzer.analyze_bid_proposal(content)
            results['bid_proposal'] = bid_result
        except Exception as e:
            print(f"입찰제안서 분석 오류: {e}")
            results['bid_proposal'] = None
        
        # 다중 문서 분석
        try:
            document_result = self.multi_document_analyzer.analyze_document_type(
                content, "입찰계약서", "삼성물산"
            )
            results['multi_document'] = document_result
        except Exception as e:
            print(f"다중 문서 분석 오류: {e}")
            results['multi_document'] = None
        
        # 기업 관계 분석
        try:
            relationship_result = self.company_relationship_analyzer.analyze_company_relationships(content)
            results['company_relationship'] = relationship_result
        except Exception as e:
            print(f"기업 관계 분석 오류: {e}")
            results['company_relationship'] = None
        
        return results

    def _perform_cross_analysis(self, analysis_results: Dict[str, Any]) -> Dict[str, Any]:
        """교차 분석 수행"""
        cross_analysis = {
            'overall_bias': {},
            'key_patterns': [],
            'conflict_indicators': [],
            'promotional_intensity': 0,
            'regional_influence': {},
            'company_affiliations': {},
            'risk_factors': []
        }
        
        # 기업별 편향도 통합
        if analysis_results.get('company_relationship'):
            rel_analysis = analysis_results['company_relationship']
            if hasattr(rel_analysis, 'overall_bias_assessment'):
                cross_analysis['overall_bias'].update(rel_analysis.overall_bias_assessment)
        
        if analysis_results.get('construction_bias'):
            bias_analysis = analysis_results['construction_bias']
            if hasattr(bias_analysis, 'company_biases'):
                for bias in bias_analysis.company_biases:
                    company = bias.company_name
                    score = bias.bias_score
                    cross_analysis['overall_bias'][company] = cross_analysis['overall_bias'].get(company, 0) + score
        
        # 핵심 패턴 통합
        if analysis_results.get('company_relationship'):
            rel_analysis = analysis_results['company_relationship']
            if hasattr(rel_analysis, 'detected_bias_patterns'):
                cross_analysis['key_patterns'].extend(rel_analysis.detected_bias_patterns)
        
        if analysis_results.get('promotion_detection'):
            promo_analysis = analysis_results['promotion_detection']
            if hasattr(promo_analysis, 'detected_promotions'):
                for promo in promo_analysis.detected_promotions:
                    cross_analysis['key_patterns'].append(f"홍보 감지: {promo.company_name} - {promo.promotion_type}")
        
        # 갈등 지표 통합
        if analysis_results.get('kakao_conversation'):
            kakao_analysis = analysis_results['kakao_conversation']
            if hasattr(kakao_analysis, 'overall_analysis'):
                overall = kakao_analysis.overall_analysis
                if overall.conflict_level == '높음':
                    cross_analysis['conflict_indicators'].append('대화 내 갈등 수준 높음')
                if overall.urgency_level == '높음':
                    cross_analysis['conflict_indicators'].append('긴급도 높음')
        
        # 홍보 강도 계산
        if analysis_results.get('promotion_detection'):
            promo_analysis = analysis_results['promotion_detection']
            if hasattr(promo_analysis, 'detected_promotions'):
                cross_analysis['promotional_intensity'] = len(promo_analysis.detected_promotions) * 0.2
        
        return cross_analysis

    def _assess_overall_risk(self, analysis_results: Dict[str, Any]) -> Dict[str, str]:
        """전체 위험도 평가"""
        risk_assessment = {}
        
        # 기업별 위험도 평가
        overall_bias = {}
        if analysis_results.get('company_relationship'):
            rel_analysis = analysis_results['company_relationship']
            if hasattr(rel_analysis, 'overall_bias_assessment'):
                overall_bias.update(rel_analysis.overall_bias_assessment)
        
        for company, score in overall_bias.items():
            if abs(score) > self.risk_thresholds['high_bias']:
                risk_assessment[company] = '매우 높음'
            elif abs(score) > self.risk_thresholds['medium_bias']:
                risk_assessment[company] = '높음'
            else:
                risk_assessment[company] = '보통'
        
        # 갈등 위험도 평가
        if analysis_results.get('kakao_conversation'):
            kakao_analysis = analysis_results['kakao_conversation']
            if hasattr(kakao_analysis, 'overall_analysis'):
                overall = kakao_analysis.overall_analysis
                if overall.conflict_level == '높음':
                    risk_assessment['conversation_conflict'] = '높음'
                elif overall.conflict_level == '보통':
                    risk_assessment['conversation_conflict'] = '보통'
                else:
                    risk_assessment['conversation_conflict'] = '낮음'
        
        return risk_assessment

    def _generate_recommendations(self, analysis_results: Dict[str, Any], risk_assessment: Dict[str, str]) -> List[str]:
        """권장사항 생성"""
        recommendations = []
        
        # 높은 편향성 기업에 대한 권장사항
        high_risk_companies = [company for company, risk in risk_assessment.items() if risk in ['높음', '매우 높음']]
        if high_risk_companies:
            recommendations.append(f"높은 편향성이 감지된 기업들({', '.join(high_risk_companies)})에 대한 중립성 확보가 필요합니다.")
        
        # 갈등 수준에 대한 권장사항
        if risk_assessment.get('conversation_conflict') == '높음':
            recommendations.append("대화 내 갈등 수준이 높습니다. 중재나 조정이 필요할 수 있습니다.")
        
        # 홍보 감지에 대한 권장사항
        if analysis_results.get('promotion_detection'):
            promo_analysis = analysis_results['promotion_detection']
            if hasattr(promo_analysis, 'detected_promotions') and len(promo_analysis.detected_promotions) > 0:
                recommendations.append("홍보 논리가 감지되었습니다. 객관성 확보가 필요합니다.")
        
        # 다양한 편향 패턴에 대한 권장사항
        if analysis_results.get('company_relationship'):
            rel_analysis = analysis_results['company_relationship']
            if hasattr(rel_analysis, 'detected_bias_patterns') and len(rel_analysis.detected_bias_patterns) > 3:
                recommendations.append("다양한 편향 패턴이 감지되었습니다. 종합적인 분석과 대응이 필요합니다.")
        
        return recommendations

    def _extract_key_insights(self, analysis_results: Dict[str, Any], cross_analysis: Dict[str, Any]) -> List[str]:
        """핵심 인사이트 추출"""
        insights = []
        
        # 기업 관계 인사이트
        if analysis_results.get('company_relationship'):
            rel_analysis = analysis_results['company_relationship']
            if hasattr(rel_analysis, 'key_insights'):
                insights.extend(rel_analysis.key_insights)
        
        # 편향성 인사이트
        high_bias_companies = [company for company, score in cross_analysis['overall_bias'].items() if abs(score) > 0.5]
        if high_bias_companies:
            insights.append(f"높은 편향성이 감지된 기업들: {', '.join(high_bias_companies)}")
        
        # 갈등 인사이트
        if cross_analysis['conflict_indicators']:
            insights.append(f"갈등 지표: {'; '.join(cross_analysis['conflict_indicators'])}")
        
        # 홍보 인사이트
        if cross_analysis['promotional_intensity'] > 0.5:
            insights.append("높은 홍보 강도가 감지되었습니다.")
        
        return insights

    def _integrate_bias_patterns(self, analysis_results: Dict[str, Any]) -> List[str]:
        """편향 패턴 통합"""
        patterns = []
        
        if analysis_results.get('company_relationship'):
            rel_analysis = analysis_results['company_relationship']
            if hasattr(rel_analysis, 'detected_bias_patterns'):
                patterns.extend(rel_analysis.detected_bias_patterns)
        
        if analysis_results.get('construction_bias'):
            bias_analysis = analysis_results['construction_bias']
            if hasattr(bias_analysis, 'bias_patterns'):
                patterns.extend(bias_analysis.bias_patterns)
        
        return patterns

    def _integrate_company_relationships(self, analysis_results: Dict[str, Any]) -> List[Dict]:
        """기업 관계 통합"""
        relationships = []
        
        if analysis_results.get('company_relationship'):
            rel_analysis = analysis_results['company_relationship']
            if hasattr(rel_analysis, 'company_relationships'):
                for rel in rel_analysis.company_relationships:
                    relationships.append({
                        'parent': rel.parent_company,
                        'subsidiary': rel.subsidiary_company,
                        'region': rel.region,
                        'relationship': rel.relationship_type
                    })
        
        return relationships

    def _integrate_regional_biases(self, analysis_results: Dict[str, Any]) -> List[Dict]:
        """지역 편향 통합"""
        biases = []
        
        if analysis_results.get('company_relationship'):
            rel_analysis = analysis_results['company_relationship']
            if hasattr(rel_analysis, 'regional_biases'):
                for bias in rel_analysis.regional_biases:
                    biases.append({
                        'region': bias.region,
                        'companies': bias.companies,
                        'bias_type': bias.bias_type,
                        'score': bias.bias_score
                    })
        
        return biases

    def _integrate_promotional_elements(self, analysis_results: Dict[str, Any]) -> List[Dict]:
        """홍보 요소 통합"""
        elements = []
        
        if analysis_results.get('promotion_detection'):
            promo_analysis = analysis_results['promotion_detection']
            if hasattr(promo_analysis, 'detected_promotions'):
                for promo in promo_analysis.detected_promotions:
                    elements.append({
                        'company': promo.company_name,
                        'type': promo.promotion_type,
                        'confidence': promo.confidence_score,
                        'sentiment': promo.sentiment_score
                    })
        
        return elements

    def _integrate_document_analysis(self, analysis_results: Dict[str, Any]) -> Dict[str, Any]:
        """문서 분석 통합"""
        document_analysis = {}
        
        if analysis_results.get('multi_document'):
            doc_analysis = analysis_results['multi_document']
            if hasattr(doc_analysis, 'general_analysis'):
                document_analysis['general'] = doc_analysis.general_analysis
            if hasattr(doc_analysis, 'specific_analysis'):
                document_analysis['specific'] = doc_analysis.specific_analysis
            if hasattr(doc_analysis, 'comprehensive_insights'):
                document_analysis['insights'] = doc_analysis.comprehensive_insights
        
        return document_analysis

    def _generate_overall_bias_summary(self, analysis_results: Dict[str, Any]) -> Dict[str, float]:
        """전체 편향성 요약"""
        bias_summary = {}
        
        # 기업 관계 분석에서 편향성 가져오기
        if analysis_results.get('company_relationship'):
            rel_analysis = analysis_results['company_relationship']
            if hasattr(rel_analysis, 'overall_bias_assessment'):
                bias_summary.update(rel_analysis.overall_bias_assessment)
        
        # 시공사 편향 분석에서 편향성 추가
        if analysis_results.get('construction_bias'):
            bias_analysis = analysis_results['construction_bias']
            if hasattr(bias_analysis, 'company_biases'):
                for bias in bias_analysis.company_biases:
                    company = bias.company_name
                    score = bias.bias_score
                    bias_summary[company] = bias_summary.get(company, 0) + score
        
        return bias_summary

    def _calculate_confidence_score(self, analysis_results: Dict[str, Any]) -> float:
        """신뢰도 점수 계산"""
        completed_analyses = sum(1 for result in analysis_results.values() if result is not None)
        total_analyses = len(self.analysis_modules)
        
        base_confidence = (completed_analyses / total_analyses) * 100
        
        # 추가 신뢰도 조정
        if analysis_results.get('kakao_conversation') and analysis_results.get('company_relationship'):
            base_confidence += 10  # 핵심 분석 모듈 완료 보너스
        
        if analysis_results.get('promotion_detection') and analysis_results.get('construction_bias'):
            base_confidence += 5   # 편향 분석 모듈 완료 보너스
        
        return min(base_confidence, 100)  # 최대 100%

    def generate_integrated_report(self, result: IntegratedAnalysisResult) -> Dict[str, Any]:
        """통합 분석 보고서 생성"""
        return {
            "analysis_type": "통합 분석 시스템",
            "timestamp": result.timestamp,
            "content_length": result.content_length,
            "analysis_modules": result.analysis_modules,
            "cross_analysis": result.cross_analysis,
            "risk_assessment": result.risk_assessment,
            "recommendations": result.recommendations,
            "confidence_score": result.confidence_score,
            "key_insights": result.key_insights,
            "bias_patterns": result.bias_patterns,
            "company_relationships": result.company_relationships,
            "regional_biases": result.regional_biases,
            "promotional_elements": result.promotional_elements,
            "document_analysis": result.document_analysis,
            "overall_bias_summary": result.overall_bias_summary
        } 