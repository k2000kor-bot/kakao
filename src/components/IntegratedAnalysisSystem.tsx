import React, { useState, useEffect } from 'react';
import AdvancedKakaoAnalysis from './AdvancedKakaoAnalysis';
import ConstructionCompanyBiasAnalysis from './ConstructionCompanyBiasAnalysis';
import RealTimePromotionDetector from './RealTimePromotionDetector';
import AdvancedBidProposalAnalysis from './AdvancedBidProposalAnalysis';
import MultiDocumentAnalysis from './MultiDocumentAnalysis';
import AdvancedCompanyRelationshipAnalysis from './AdvancedCompanyRelationshipAnalysis';

interface IntegratedAnalysisResult {
    kakaoAnalysis: any;
    constructionBias: any;
    promotionDetection: any;
    bidProposal: any;
    multiDocument: any;
    companyRelationship: any;
    crossAnalysis: {
        overallBias: Record<string, number>;
        keyPatterns: string[];
        riskAssessment: Record<string, string>;
        recommendations: string[];
        confidenceScore: number;
    };
}

interface IntegratedAnalysisSystemProps {
    selectedRoomId: string;
}

const IntegratedAnalysisSystem: React.FC<IntegratedAnalysisSystemProps> = ({ selectedRoomId }) => {
    const [activeAnalysis, setActiveAnalysis] = useState('integrated');
    const [analysisResults, setAnalysisResults] = useState<IntegratedAnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [testContent, setTestContent] = useState('');
    const [analysisProgress, setAnalysisProgress] = useState(0);

    const runIntegratedAnalysis = async () => {
        if (!testContent.trim()) {
            alert('분석할 내용을 입력해주세요.');
            return;
        }

        setLoading(true);
        setAnalysisProgress(0);

        try {
            const results: IntegratedAnalysisResult = {
                kakaoAnalysis: null,
                constructionBias: null,
                promotionDetection: null,
                bidProposal: null,
                multiDocument: null,
                companyRelationship: null,
                crossAnalysis: {
                    overallBias: {},
                    keyPatterns: [],
                    riskAssessment: {},
                    recommendations: [],
                    confidenceScore: 0
                }
            };

            // 1. 카카오톡 대화 분석
            setAnalysisProgress(10);
            try {
                const kakaoResponse = await fetch('http://localhost:8000/api/v7/kakao/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: testContent, room_id: selectedRoomId })
                });
                const kakaoData = await kakaoResponse.json();
                if (kakaoData.success) {
                    results.kakaoAnalysis = kakaoData.kakao_analysis;
                }
            } catch (error) {
                console.error('카카오톡 분석 오류:', error);
            }

            // 2. 시공사 편향 분석
            setAnalysisProgress(25);
            try {
                const biasResponse = await fetch('http://localhost:8000/api/v7/construction-company/bias-analysis', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: testContent, room_id: selectedRoomId })
                });
                const biasData = await biasResponse.json();
                if (biasData.success) {
                    results.constructionBias = biasData.bias_analysis;
                }
            } catch (error) {
                console.error('시공사 편향 분석 오류:', error);
            }

            // 3. 실시간 홍보 감지
            setAnalysisProgress(40);
            try {
                const promotionResponse = await fetch('http://localhost:8000/api/v7/realtime/promotion-detection', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: testContent, room_id: selectedRoomId })
                });
                const promotionData = await promotionResponse.json();
                if (promotionData.success) {
                    results.promotionDetection = promotionData.detection;
                }
            } catch (error) {
                console.error('홍보 감지 오류:', error);
            }

            // 4. 입찰제안서 분석
            setAnalysisProgress(55);
            try {
                const bidResponse = await fetch('http://localhost:8000/api/v7/bid-proposal/advanced-analysis', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: testContent, room_id: selectedRoomId })
                });
                const bidData = await bidResponse.json();
                if (bidData.success) {
                    results.bidProposal = bidData.advanced_analysis;
                }
            } catch (error) {
                console.error('입찰제안서 분석 오류:', error);
            }

            // 5. 다중 문서 분석
            setAnalysisProgress(70);
            try {
                const documentResponse = await fetch('http://localhost:8000/api/v7/multi-document/advanced-analysis', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: testContent,
                        document_type: '입찰계약서',
                        company_name: '삼성물산',
                        room_id: selectedRoomId
                    })
                });
                const documentData = await documentResponse.json();
                if (documentData.success) {
                    results.multiDocument = documentData.multi_document_analysis;
                }
            } catch (error) {
                console.error('다중 문서 분석 오류:', error);
            }

            // 6. 기업 관계 분석
            setAnalysisProgress(85);
            try {
                const relationshipResponse = await fetch('http://localhost:8000/api/v7/company-relationship/advanced-analysis', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: testContent, room_id: selectedRoomId })
                });
                const relationshipData = await relationshipResponse.json();
                if (relationshipData.success) {
                    results.companyRelationship = relationshipData.company_relationship_analysis;
                }
            } catch (error) {
                console.error('기업 관계 분석 오류:', error);
            }

            // 7. 교차 분석 및 통합 인사이트 생성
            setAnalysisProgress(95);
            results.crossAnalysis = generateCrossAnalysis(results);

            setAnalysisProgress(100);
            setAnalysisResults(results);

        } catch (error) {
            console.error('통합 분석 오류:', error);
            alert('분석 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const generateCrossAnalysis = (results: IntegratedAnalysisResult): any => {
        const overallBias: Record<string, number> = {};
        const keyPatterns: string[] = [];
        const riskAssessment: Record<string, string> = {};
        const recommendations: string[] = [];
        let confidenceScore = 0;

        // 기업별 편향도 통합
        if (results.companyRelationship?.overall_bias) {
            Object.assign(overallBias, results.companyRelationship.overall_bias);
        }

        if (results.constructionBias?.company_biases) {
            results.constructionBias.company_biases.forEach((bias: any) => {
                overallBias[bias.company_name] = (overallBias[bias.company_name] || 0) + bias.bias_score;
            });
        }

        // 핵심 패턴 통합
        if (results.companyRelationship?.bias_patterns) {
            keyPatterns.push(...results.companyRelationship.bias_patterns);
        }

        if (results.promotionDetection?.detected_promotions) {
            keyPatterns.push(...results.promotionDetection.detected_promotions.map((p: any) =>
                `홍보 감지: ${p.company_name} - ${p.promotion_type}`
            ));
        }

        // 위험도 평가
        const highBiasCompanies = Object.entries(overallBias)
            .filter(([_, score]) => Math.abs(score) > 0.5)
            .map(([company, score]) => ({ company, score }));

        highBiasCompanies.forEach(({ company, score }) => {
            riskAssessment[company] = score > 0.7 ? '매우 높음' : score > 0.5 ? '높음' : '보통';
        });

        // 권장사항 생성
        if (highBiasCompanies.length > 0) {
            recommendations.push('높은 편향성이 감지된 기업들이 있습니다. 중립성 확보가 필요합니다.');
        }

        if (keyPatterns.length > 3) {
            recommendations.push('다양한 편향 패턴이 감지되었습니다. 종합적인 분석이 필요합니다.');
        }

        if (results.kakaoAnalysis?.overall_analysis?.conflict_level === '높음') {
            recommendations.push('대화 내 갈등 수준이 높습니다. 중재가 필요할 수 있습니다.');
        }

        // 신뢰도 점수 계산
        const completedAnalyses = [
            results.kakaoAnalysis,
            results.constructionBias,
            results.promotionDetection,
            results.bidProposal,
            results.multiDocument,
            results.companyRelationship
        ].filter(Boolean).length;

        confidenceScore = (completedAnalyses / 6) * 100;

        return {
            overallBias,
            keyPatterns,
            riskAssessment,
            recommendations,
            confidenceScore
        };
    };

    const getBiasColor = (score: number) => {
        if (score > 0.6) return 'text-red-600';
        if (score > 0.3) return 'text-orange-600';
        if (score < -0.3) return 'text-blue-600';
        return 'text-gray-600';
    };

    return (
        <div className="integrated-analysis-system p-6 bg-white rounded-lg shadow-lg">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    통합 분석 시스템
                </h2>
                <p className="text-gray-600">
                    모든 분석 기능을 통합하여 종합적인 인사이트를 제공합니다.
                </p>
            </div>

            {/* 테스트 입력 */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">분석할 내용 입력</h3>
                <textarea
                    value={testContent}
                    onChange={(e) => setTestContent(e.target.value)}
                    placeholder="예: 중흥건설이 쓰레기 같다. 전라도 기업이라 문제가 많다. 삼성물산이 최고다. 홍보 논리가 보인다."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24"
                />
                <button
                    onClick={runIntegratedAnalysis}
                    disabled={loading}
                    className="mt-3 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? `통합 분석 중... ${analysisProgress}%` : '통합 분석 실행'}
                </button>
            </div>

            {loading && (
                <div className="mb-6">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${analysisProgress}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">분석 진행률: {analysisProgress}%</p>
                </div>
            )}

            {analysisResults && (
                <div className="space-y-6">
                    {/* 탭 네비게이션 */}
                    <div className="flex space-x-1 border-b border-gray-200 overflow-x-auto">
                        {[
                            { id: 'integrated', label: '통합 결과', icon: '🔗' },
                            { id: 'kakao', label: '카카오톡', icon: '📱' },
                            { id: 'construction', label: '시공사 편향', icon: '🏗️' },
                            { id: 'promotion', label: '홍보 감지', icon: '🔍' },
                            { id: 'bid', label: '입찰제안서', icon: '📄' },
                            { id: 'document', label: '다중 문서', icon: '📋' },
                            { id: 'relationship', label: '기업 관계', icon: '🏢' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveAnalysis(tab.id)}
                                className={`px-4 py-2 rounded-t-lg flex items-center space-x-2 whitespace-nowrap ${activeAnalysis === tab.id
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* 탭 콘텐츠 */}
                    <div className="min-h-96">
                        {activeAnalysis === 'integrated' && (
                            <div className="space-y-6">
                                {/* 통합 요약 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                        <h4 className="font-semibold text-blue-800">신뢰도</h4>
                                        <p className="text-2xl font-bold text-blue-600">
                                            {analysisResults.crossAnalysis.confidenceScore.toFixed(0)}%
                                        </p>
                                        <p className="text-sm text-blue-600">분석 정확도</p>
                                    </div>
                                    <div className="p-4 bg-orange-50 rounded-lg">
                                        <h4 className="font-semibold text-orange-800">편향 패턴</h4>
                                        <p className="text-2xl font-bold text-orange-600">
                                            {analysisResults.crossAnalysis.keyPatterns.length}
                                        </p>
                                        <p className="text-sm text-orange-600">감지된 패턴</p>
                                    </div>
                                    <div className="p-4 bg-red-50 rounded-lg">
                                        <h4 className="font-semibold text-red-800">위험 기업</h4>
                                        <p className="text-2xl font-bold text-red-600">
                                            {Object.keys(analysisResults.crossAnalysis.riskAssessment).length}
                                        </p>
                                        <p className="text-sm text-red-600">높은 편향성</p>
                                    </div>
                                    <div className="p-4 bg-green-50 rounded-lg">
                                        <h4 className="font-semibold text-green-800">권장사항</h4>
                                        <p className="text-2xl font-bold text-green-600">
                                            {analysisResults.crossAnalysis.recommendations.length}
                                        </p>
                                        <p className="text-sm text-green-600">제안사항</p>
                                    </div>
                                </div>

                                {/* 전체 편향성 */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">전체 편향성 평가</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {Object.entries(analysisResults.crossAnalysis.overallBias).map(([company, score]) => (
                                            <div key={company} className="p-3 border border-gray-200 rounded-lg">
                                                <p className="font-semibold">{company}</p>
                                                <p className={`text-lg font-bold ${getBiasColor(score)}`}>
                                                    {score > 0 ? '+' : ''}{score.toFixed(2)}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {score > 0.3 ? '우호적' : score < -0.3 ? '비하적' : '중립적'}
                                                </p>
                                                {analysisResults.crossAnalysis.riskAssessment[company] && (
                                                    <p className="text-xs text-red-600">
                                                        위험도: {analysisResults.crossAnalysis.riskAssessment[company]}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 핵심 패턴 */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">감지된 핵심 패턴</h3>
                                    <div className="space-y-2">
                                        {analysisResults.crossAnalysis.keyPatterns.map((pattern, index) => (
                                            <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                <p className="text-sm font-medium text-yellow-800">{pattern}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 권장사항 */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">권장사항</h3>
                                    <div className="space-y-3">
                                        {analysisResults.crossAnalysis.recommendations.map((rec, index) => (
                                            <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                <p className="text-sm text-blue-800">{rec}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeAnalysis === 'kakao' && analysisResults.kakaoAnalysis && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">카카오톡 대화 분석</h3>
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <pre className="text-sm overflow-auto">
                                        {JSON.stringify(analysisResults.kakaoAnalysis, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {activeAnalysis === 'construction' && analysisResults.constructionBias && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">시공사 편향 분석</h3>
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <pre className="text-sm overflow-auto">
                                        {JSON.stringify(analysisResults.constructionBias, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {activeAnalysis === 'promotion' && analysisResults.promotionDetection && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">실시간 홍보 감지</h3>
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <pre className="text-sm overflow-auto">
                                        {JSON.stringify(analysisResults.promotionDetection, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {activeAnalysis === 'bid' && analysisResults.bidProposal && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">입찰제안서 분석</h3>
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <pre className="text-sm overflow-auto">
                                        {JSON.stringify(analysisResults.bidProposal, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {activeAnalysis === 'document' && analysisResults.multiDocument && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">다중 문서 분석</h3>
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <pre className="text-sm overflow-auto">
                                        {JSON.stringify(analysisResults.multiDocument, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {activeAnalysis === 'relationship' && analysisResults.companyRelationship && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">기업 관계 분석</h3>
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <pre className="text-sm overflow-auto">
                                        {JSON.stringify(analysisResults.companyRelationship, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default IntegratedAnalysisSystem; 