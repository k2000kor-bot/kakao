import React, { useState } from 'react';

interface ContentAnalysis {
    document_type: string;
    keyword_matches: string[];
    bias_indicators: string[];
    risk_factors: string[];
    content_length: number;
    complexity_score: number;
}

interface DeliveryAnalysis {
    delivery_method: string;
    timing_analysis: {
        strategic_timing: boolean;
        delayed_delivery: boolean;
        rush_delivery: boolean;
        timing_indicators: string[];
    };
    audience_reach: {
        targeted_delivery: boolean;
        broad_delivery: boolean;
        selective_delivery: boolean;
        audience_indicators: string[];
    };
    effectiveness_metrics: {
        delivery_success: number;
        information_quality: number;
        bias_impact: number;
    };
}

interface GeneralAnalysis {
    content_analysis: ContentAnalysis;
    bias_indicators: string[];
    promotional_elements: string[];
    contractual_terms: string[];
    delivery_analysis: DeliveryAnalysis;
}

interface SpecificAnalysis {
    contract_type: string;
    favorable_terms: string[];
    unfavorable_terms: string[];
    risk_clauses: string[];
    benefit_clauses: string[];
    bias_score: number;
}

interface RiskAssessment {
    legal_risks: string[];
    reputation_risks: string[];
    financial_risks: string[];
    operational_risks: string[];
}

interface ComprehensiveInsights {
    document_purpose: string;
    target_audience: string[];
    bias_level: string;
    risk_assessment: RiskAssessment;
    recommendations: string[];
}

interface DocumentTypeSpecificInsights {
    contract_fairness: string;
    risk_distribution: string;
    benefit_concentration: string;
    legal_compliance: string;
    transparency_level: string;
}

interface CompanySpecificPatterns {
    document_bias_pattern: string;
    promotional_style: string;
    delivery_strategy: string;
    risk_tolerance: string;
    benefit_focus: string;
}

interface CrossDocumentAnalysis {
    consistency_level: string;
    bias_pattern: string;
    risk_trend: string;
    transparency_trend: string;
    compliance_risk: string;
}

interface MultiDocumentAnalysisResult {
    document_type: string;
    company_name: string;
    general_analysis: GeneralAnalysis;
    specific_analysis: SpecificAnalysis;
    comprehensive_insights: ComprehensiveInsights;
    document_type_specific_insights: Record<string, DocumentTypeSpecificInsights>;
    company_specific_patterns: Record<string, CompanySpecificPatterns>;
    cross_document_analysis: CrossDocumentAnalysis;
}

interface MultiDocumentAnalysisProps {
    selectedRoomId: string;
}

const MultiDocumentAnalysis: React.FC<MultiDocumentAnalysisProps> = ({ selectedRoomId }) => {
    const [content, setContent] = useState('');
    const [selectedDocumentType, setSelectedDocumentType] = useState('입찰계약서');
    const [selectedCompany, setSelectedCompany] = useState('삼성물산');
    const [analysisResult, setAnalysisResult] = useState<MultiDocumentAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'general' | 'specific' | 'insights' | 'patterns' | 'cross'>('general');

    const documentTypes = [
        '입찰계약서', '홍보물', '전달', '제안서', '평가서'
    ];

    const companies = [
        '삼성물산', '대우건설', '현대건설', 'GS건설', '포스코건설', '롯데건설'
    ];

    // 다중 문서 유형 기반 고도화된 분석 실행
    const runMultiDocumentAnalysis = async () => {
        if (!content.trim()) {
            setError('분석할 내용을 입력해주세요.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8000/api/v7/multi-document/advanced-analysis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: content,
                    document_type: selectedDocumentType,
                    company_name: selectedCompany,
                    room_id: selectedRoomId
                })
            });

            if (response.ok) {
                const data = await response.json();
                setAnalysisResult(data.multi_document_analysis);
            } else {
                throw new Error('분석 실패');
            }
        } catch (error) {
            console.error('다중 문서 분석 실패:', error);
            setError('다중 문서 분석 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const getBiasLevelColor = (level: string) => {
        switch (level) {
            case '매우 높음': return 'text-red-600 bg-red-100';
            case '높음': return 'text-orange-600 bg-orange-100';
            case '보통': return 'text-yellow-600 bg-yellow-100';
            case '낮음': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getBiasScoreColor = (score: number) => {
        if (score >= 0.8) return 'text-red-600 bg-red-100';
        if (score >= 0.6) return 'text-orange-600 bg-orange-100';
        if (score >= 0.4) return 'text-yellow-600 bg-yellow-100';
        return 'text-green-600 bg-green-100';
    };

    return (
        <div className="multi-document-analysis">
            <div className="analysis-header">
                <h2>
                    <span className="header-icon">📋</span>
                    다중 문서 유형 기반 고도화된 분석
                </h2>
                <p className="subtitle">입찰계약서, 홍보물, 전달 등 다양한 문서 유형을 고려한 포괄적 분석</p>
            </div>

            <div className="analysis-controls">
                <div className="input-section">
                    <div className="document-type-selection">
                        <label htmlFor="document-type-select">문서 유형 선택:</label>
                        <select
                            id="document-type-select"
                            value={selectedDocumentType}
                            onChange={(e) => setSelectedDocumentType(e.target.value)}
                            className="document-type-select"
                        >
                            {documentTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="company-selection">
                        <label htmlFor="company-select">시공사 선택:</label>
                        <select
                            id="company-select"
                            value={selectedCompany}
                            onChange={(e) => setSelectedCompany(e.target.value)}
                            className="company-select"
                        >
                            {companies.map((company) => (
                                <option key={company} value={company}>{company}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="content-input">
                        <label htmlFor="analysis-content">분석할 내용:</label>
                        <textarea
                            id="analysis-content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="문서 내용을 입력하세요..."
                            className="content-textarea"
                            rows={6}
                        />
                    </div>
                </div>
                
                <button
                    onClick={runMultiDocumentAnalysis}
                    disabled={isLoading || !content.trim()}
                    className="analyze-btn"
                >
                    {isLoading ? '분석 중...' : '다중 문서 분석 실행'}
                </button>
            </div>

            {error && (
                <div className="error-message">
                    ❌ {error}
                </div>
            )}

            {analysisResult && (
                <div className="analysis-content">
                    {/* 탭 네비게이션 */}
                    <div className="tab-navigation">
                        <button
                            className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
                            onClick={() => setActiveTab('general')}
                        >
                            📊 일반 분석
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'specific' ? 'active' : ''}`}
                            onClick={() => setActiveTab('specific')}
                        >
                            📋 특정 분석
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'insights' ? 'active' : ''}`}
                            onClick={() => setActiveTab('insights')}
                        >
                            💡 종합 인사이트
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'patterns' ? 'active' : ''}`}
                            onClick={() => setActiveTab('patterns')}
                        >
                            🎯 패턴 분석
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'cross' ? 'active' : ''}`}
                            onClick={() => setActiveTab('cross')}
                        >
                            🔄 교차 분석
                        </button>
                    </div>

                    {/* 일반 분석 탭 */}
                    {activeTab === 'general' && (
                        <div className="general-tab">
                            <h3>일반 분석</h3>
                            <div className="analysis-grid">
                                <div className="content-analysis">
                                    <h4>문서 내용 분석</h4>
                                    <div className="analysis-stats">
                                        <div className="stat-item">
                                            <span className="label">문서 유형:</span>
                                            <span className="value">{analysisResult.general_analysis.content_analysis.document_type}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="label">내용 길이:</span>
                                            <span className="value">{analysisResult.general_analysis.content_analysis.content_length}자</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="label">복잡성 점수:</span>
                                            <span className="value">{(analysisResult.general_analysis.content_analysis.complexity_score * 100).toFixed(1)}%</span>
                                        </div>
                                    </div>
                                    <div className="keyword-matches">
                                        <h5>키워드 매칭</h5>
                                        <ul>
                                            {analysisResult.general_analysis.content_analysis.keyword_matches.map((keyword, index) => (
                                                <li key={index} className="keyword-item">{keyword}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                
                                <div className="bias-analysis">
                                    <h4>편향성 분석</h4>
                                    <ul>
                                        {analysisResult.general_analysis.bias_indicators.map((indicator, index) => (
                                            <li key={index} className="bias-item">{indicator}</li>
                                        ))}
                                    </ul>
                                </div>
                                
                                <div className="promotional-analysis">
                                    <h4>홍보 요소 분석</h4>
                                    <ul>
                                        {analysisResult.general_analysis.promotional_elements.map((element, index) => (
                                            <li key={index} className="promotional-item">{element}</li>
                                        ))}
                                    </ul>
                                </div>
                                
                                <div className="contractual-analysis">
                                    <h4>계약 조건 분석</h4>
                                    <ul>
                                        {analysisResult.general_analysis.contractual_terms.map((term, index) => (
                                            <li key={index} className="contractual-item">{term}</li>
                                        ))}
                                    </ul>
                                </div>
                                
                                <div className="delivery-analysis">
                                    <h4>전달 분석</h4>
                                    <div className="delivery-stats">
                                        <div className="stat-item">
                                            <span className="label">전달 방법:</span>
                                            <span className="value">{analysisResult.general_analysis.delivery_analysis.delivery_method}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="label">전달 성공률:</span>
                                            <span className="value">{(analysisResult.general_analysis.delivery_analysis.effectiveness_metrics.delivery_success * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="label">정보 품질:</span>
                                            <span className="value">{(analysisResult.general_analysis.delivery_analysis.effectiveness_metrics.information_quality * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="label">편향성 영향:</span>
                                            <span className="value">{(analysisResult.general_analysis.delivery_analysis.effectiveness_metrics.bias_impact * 100).toFixed(1)}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 특정 분석 탭 */}
                    {activeTab === 'specific' && (
                        <div className="specific-tab">
                            <h3>특정 분석</h3>
                            <div className="specific-analysis">
                                <div className="contract-analysis">
                                    <h4>계약서 분석</h4>
                                    <div className="analysis-stats">
                                        <div className="stat-item">
                                            <span className="label">계약 유형:</span>
                                            <span className="value">{analysisResult.specific_analysis.contract_type}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="label">편향성 점수:</span>
                                            <span className={`value ${getBiasScoreColor(analysisResult.specific_analysis.bias_score)}`}>
                                                {(analysisResult.specific_analysis.bias_score * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="terms-analysis">
                                        <div className="favorable-terms">
                                            <h5>유리한 조건</h5>
                                            <ul>
                                                {analysisResult.specific_analysis.favorable_terms.map((term, index) => (
                                                    <li key={index} className="favorable-item">{term}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        
                                        <div className="unfavorable-terms">
                                            <h5>불리한 조건</h5>
                                            <ul>
                                                {analysisResult.specific_analysis.unfavorable_terms.map((term, index) => (
                                                    <li key={index} className="unfavorable-item">{term}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        
                                        <div className="risk-clauses">
                                            <h5>위험 조항</h5>
                                            <ul>
                                                {analysisResult.specific_analysis.risk_clauses.map((clause, index) => (
                                                    <li key={index} className="risk-item">{clause}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        
                                        <div className="benefit-clauses">
                                            <h5>이익 조항</h5>
                                            <ul>
                                                {analysisResult.specific_analysis.benefit_clauses.map((clause, index) => (
                                                    <li key={index} className="benefit-item">{clause}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 종합 인사이트 탭 */}
                    {activeTab === 'insights' && (
                        <div className="insights-tab">
                            <h3>종합 인사이트</h3>
                            <div className="comprehensive-insights">
                                <div className="insights-overview">
                                    <div className="insight-item">
                                        <h4>문서 목적</h4>
                                        <p>{analysisResult.comprehensive_insights.document_purpose}</p>
                                    </div>
                                    
                                    <div className="insight-item">
                                        <h4>대상자</h4>
                                        <div className="audience-tags">
                                            {analysisResult.comprehensive_insights.target_audience.map((audience, index) => (
                                                <span key={index} className="audience-tag">{audience}</span>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="insight-item">
                                        <h4>편향성 수준</h4>
                                        <span className={`bias-level-badge ${getBiasLevelColor(analysisResult.comprehensive_insights.bias_level)}`}>
                                            {analysisResult.comprehensive_insights.bias_level}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="risk-assessment">
                                    <h4>위험 평가</h4>
                                    <div className="risk-categories">
                                        <div className="risk-category">
                                            <h5>법적 위험</h5>
                                            <ul>
                                                {analysisResult.comprehensive_insights.risk_assessment.legal_risks.map((risk, index) => (
                                                    <li key={index} className="legal-risk">{risk}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        
                                        <div className="risk-category">
                                            <h5>평판 위험</h5>
                                            <ul>
                                                {analysisResult.comprehensive_insights.risk_assessment.reputation_risks.map((risk, index) => (
                                                    <li key={index} className="reputation-risk">{risk}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        
                                        <div className="risk-category">
                                            <h5>재무 위험</h5>
                                            <ul>
                                                {analysisResult.comprehensive_insights.risk_assessment.financial_risks.map((risk, index) => (
                                                    <li key={index} className="financial-risk">{risk}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        
                                        <div className="risk-category">
                                            <h5>운영 위험</h5>
                                            <ul>
                                                {analysisResult.comprehensive_insights.risk_assessment.operational_risks.map((risk, index) => (
                                                    <li key={index} className="operational-risk">{risk}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="recommendations">
                                    <h4>권장사항</h4>
                                    <ul>
                                        {analysisResult.comprehensive_insights.recommendations.map((recommendation, index) => (
                                            <li key={index} className="recommendation-item">{recommendation}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 패턴 분석 탭 */}
                    {activeTab === 'patterns' && (
                        <div className="patterns-tab">
                            <h3>패턴 분석</h3>
                            <div className="patterns-analysis">
                                <div className="document-type-patterns">
                                    <h4>문서 유형별 특성</h4>
                                    <div className="pattern-grid">
                                        {Object.entries(analysisResult.document_type_specific_insights).map(([docType, insights]) => (
                                            <div key={docType} className="pattern-card">
                                                <h5>{docType}</h5>
                                                <div className="pattern-stats">
                                                    <div className="stat-item">
                                                        <span className="label">공정성:</span>
                                                        <span className="value">{insights.contract_fairness}</span>
                                                    </div>
                                                    <div className="stat-item">
                                                        <span className="label">위험 분배:</span>
                                                        <span className="value">{insights.risk_distribution}</span>
                                                    </div>
                                                    <div className="stat-item">
                                                        <span className="label">이익 집중:</span>
                                                        <span className="value">{insights.benefit_concentration}</span>
                                                    </div>
                                                    <div className="stat-item">
                                                        <span className="label">법적 준수:</span>
                                                        <span className="value">{insights.legal_compliance}</span>
                                                    </div>
                                                    <div className="stat-item">
                                                        <span className="label">투명성:</span>
                                                        <span className="value">{insights.transparency_level}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="company-patterns">
                                    <h4>시공사별 패턴</h4>
                                    <div className="pattern-grid">
                                        {Object.entries(analysisResult.company_specific_patterns).map(([company, patterns]) => (
                                            <div key={company} className="pattern-card">
                                                <h5>{company}</h5>
                                                <div className="pattern-stats">
                                                    <div className="stat-item">
                                                        <span className="label">문서 편향:</span>
                                                        <span className="value">{patterns.document_bias_pattern}</span>
                                                    </div>
                                                    <div className="stat-item">
                                                        <span className="label">홍보 스타일:</span>
                                                        <span className="value">{patterns.promotional_style}</span>
                                                    </div>
                                                    <div className="stat-item">
                                                        <span className="label">전달 전략:</span>
                                                        <span className="value">{patterns.delivery_strategy}</span>
                                                    </div>
                                                    <div className="stat-item">
                                                        <span className="label">위험 감수도:</span>
                                                        <span className="value">{patterns.risk_tolerance}</span>
                                                    </div>
                                                    <div className="stat-item">
                                                        <span className="label">이익 집중도:</span>
                                                        <span className="value">{patterns.benefit_focus}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 교차 분석 탭 */}
                    {activeTab === 'cross' && (
                        <div className="cross-tab">
                            <h3>교차 분석</h3>
                            <div className="cross-analysis">
                                <div className="cross-insights">
                                    <h4>문서 간 교차 분석</h4>
                                    <div className="cross-stats">
                                        <div className="stat-item">
                                            <span className="label">일관성 수준:</span>
                                            <span className="value">{analysisResult.cross_document_analysis.consistency_level}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="label">편향 패턴:</span>
                                            <span className="value">{analysisResult.cross_document_analysis.bias_pattern}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="label">위험 트렌드:</span>
                                            <span className="value">{analysisResult.cross_document_analysis.risk_trend}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="label">투명성 트렌드:</span>
                                            <span className="value">{analysisResult.cross_document_analysis.transparency_trend}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="label">준수 위험:</span>
                                            <span className="value">{analysisResult.cross_document_analysis.compliance_risk}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="cross-recommendations">
                                    <h4>교차 분석 권장사항</h4>
                                    <ul>
                                        <li>문서 간 일관성 확보 필요</li>
                                        <li>편향성 패턴 통일성 검토</li>
                                        <li>위험 관리 체계 강화</li>
                                        <li>투명성 제고 방안 수립</li>
                                        <li>법적 준수성 모니터링 강화</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!analysisResult && !isLoading && (
                <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h3>다중 문서 유형 기반 고도화된 분석을 실행해보세요</h3>
                    <p>문서 유형과 시공사를 선택하고 분석할 내용을 입력한 후 분석을 실행하세요.</p>
                    <div className="features-list">
                        <h4>주요 기능:</h4>
                        <ul>
                            <li>입찰계약서, 홍보물, 전달 등 다양한 문서 유형 분석</li>
                            <li>문서 유형별 특정 분석</li>
                            <li>시공사별 패턴 분석</li>
                            <li>교차 문서 분석</li>
                            <li>종합 위험 평가</li>
                            <li>권장사항 제공</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MultiDocumentAnalysis; 