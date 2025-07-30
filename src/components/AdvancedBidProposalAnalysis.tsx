import React, { useState } from 'react';

interface BidProposalAnalysis {
    positive_mentions: string[];
    negative_mentions: string[];
    political_factors: string[];
    regional_factors: string[];
    favoritism_indicators: string[];
    opposition_indicators: string[];
}

interface PoliticalAnalysis {
    political_affiliation: string;
    regional_bias: string;
    government_connection: string;
    local_politics: string;
    influence_score: number;
}

interface RegionalAnalysis {
    local_company: boolean;
    regional_advantage: string;
    local_employment: string;
    regional_economy: string;
    community_benefit: string;
}

interface FavoritismAnalysis {
    favoritism_type: string;
    favoritism_reasons: string[];
    opposition_reasons: string[];
    benefit_recipients: string[];
    risk_recipients: string[];
}

interface BenefitAnalysis {
    primary_beneficiaries: string[];
    secondary_beneficiaries: string[];
    benefit_reasons: string[];
    economic_impact: string;
    political_impact: string;
}

interface RiskAssessment {
    risk_factors: string[];
    risk_recipients: string[];
    risk_reasons: string[];
    mitigation_measures: string[];
}

interface ComprehensiveInsights {
    why_good: string[];
    why_bad: string[];
    who_benefits: string[];
    who_risks: string[];
    political_implications: Record<string, string>;
    economic_implications: Record<string, string>;
}

interface AdvancedAnalysisResult {
    company_name: string;
    bid_proposal_analysis: BidProposalAnalysis;
    political_analysis: PoliticalAnalysis;
    regional_analysis: RegionalAnalysis;
    favoritism_analysis: FavoritismAnalysis;
    benefit_analysis: BenefitAnalysis;
    risk_assessment: RiskAssessment;
    comprehensive_insights: ComprehensiveInsights;
}

interface AdvancedBidProposalAnalysisProps {
    selectedRoomId: string;
}

const AdvancedBidProposalAnalysis: React.FC<AdvancedBidProposalAnalysisProps> = ({ selectedRoomId }) => {
    const [content, setContent] = useState('');
    const [selectedCompany, setSelectedCompany] = useState('삼성물산');
    const [analysisResult, setAnalysisResult] = useState<AdvancedAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'analysis' | 'political' | 'regional' | 'favoritism' | 'benefits' | 'risks' | 'insights'>('analysis');

    const companies = [
        '삼성물산', '대우건설', '현대건설', 'GS건설', '포스코건설', '롯데건설'
    ];

    // 입찰제안서 기반 고도화된 분석 실행
    const runAdvancedAnalysis = async () => {
        if (!content.trim()) {
            setError('분석할 내용을 입력해주세요.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8000/api/v7/bid-proposal/advanced-analysis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: content,
                    company_name: selectedCompany,
                    room_id: selectedRoomId
                })
            });

            if (response.ok) {
                const data = await response.json();
                setAnalysisResult(data.advanced_analysis);
            } else {
                throw new Error('분석 실패');
            }
        } catch (error) {
            console.error('고도화된 분석 실패:', error);
            setError('고도화된 분석 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const getFavoritismColor = (type: string) => {
        switch (type) {
            case '친조': return 'text-blue-600 bg-blue-100';
            case '반조': return 'text-red-600 bg-red-100';
            case '중립': return 'text-gray-600 bg-gray-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getInfluenceColor = (score: number) => {
        if (score >= 0.8) return 'text-red-600 bg-red-100';
        if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
        return 'text-green-600 bg-green-100';
    };

    return (
        <div className="advanced-bid-proposal-analysis">
            <div className="analysis-header">
                <h2>
                    <span className="header-icon">📋</span>
                    입찰제안서 기반 고도화된 시공사 성향 분석
                </h2>
                <p className="subtitle">정치적, 지역적, 친조/반조 요소를 고려한 정교한 분석</p>
            </div>

            <div className="analysis-controls">
                <div className="input-section">
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
                            placeholder="입찰제안서 내용이나 홍보 논리를 입력하세요..."
                            className="content-textarea"
                            rows={6}
                        />
                    </div>
                </div>
                
                <button
                    onClick={runAdvancedAnalysis}
                    disabled={isLoading || !content.trim()}
                    className="analyze-btn"
                >
                    {isLoading ? '분석 중...' : '고도화된 분석 실행'}
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
                            className={`tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
                            onClick={() => setActiveTab('analysis')}
                        >
                            📊 기본 분석
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'political' ? 'active' : ''}`}
                            onClick={() => setActiveTab('political')}
                        >
                            🏛️ 정치적 요소
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'regional' ? 'active' : ''}`}
                            onClick={() => setActiveTab('regional')}
                        >
                            🗺️ 지역적 요소
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'favoritism' ? 'active' : ''}`}
                            onClick={() => setActiveTab('favoritism')}
                        >
                            ⚖️ 친조/반조
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'benefits' ? 'active' : ''}`}
                            onClick={() => setActiveTab('benefits')}
                        >
                            ✅ 이익 분석
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'risks' ? 'active' : ''}`}
                            onClick={() => setActiveTab('risks')}
                        >
                            ⚠️ 위험 분석
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'insights' ? 'active' : ''}`}
                            onClick={() => setActiveTab('insights')}
                        >
                            💡 종합 인사이트
                        </button>
                    </div>

                    {/* 기본 분석 탭 */}
                    {activeTab === 'analysis' && (
                        <div className="analysis-tab">
                            <h3>입찰제안서 기본 분석</h3>
                            <div className="analysis-grid">
                                <div className="positive-analysis">
                                    <h4>긍정적 언급</h4>
                                    <ul>
                                        {analysisResult.bid_proposal_analysis.positive_mentions.map((mention, index) => (
                                            <li key={index} className="positive-item">{mention}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="negative-analysis">
                                    <h4>부정적 언급</h4>
                                    <ul>
                                        {analysisResult.bid_proposal_analysis.negative_mentions.map((mention, index) => (
                                            <li key={index} className="negative-item">{mention}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="political-factors">
                                    <h4>정치적 요소</h4>
                                    <ul>
                                        {analysisResult.bid_proposal_analysis.political_factors.map((factor, index) => (
                                            <li key={index} className="political-item">{factor}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="regional-factors">
                                    <h4>지역적 요소</h4>
                                    <ul>
                                        {analysisResult.bid_proposal_analysis.regional_factors.map((factor, index) => (
                                            <li key={index} className="regional-item">{factor}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 정치적 요소 탭 */}
                    {activeTab === 'political' && (
                        <div className="political-tab">
                            <h3>정치적 요소 분석</h3>
                            <div className="political-analysis">
                                <div className="political-stats">
                                    <div className="stat-item">
                                        <span className="label">정치적 성향:</span>
                                        <span className="value">{analysisResult.political_analysis.political_affiliation}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="label">지역 편향:</span>
                                        <span className="value">{analysisResult.political_analysis.regional_bias}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="label">정부 연결도:</span>
                                        <span className="value">{analysisResult.political_analysis.government_connection}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="label">지역 정치:</span>
                                        <span className="value">{analysisResult.political_analysis.local_politics}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="label">영향력 점수:</span>
                                        <span className={`value ${getInfluenceColor(analysisResult.political_analysis.influence_score)}`}>
                                            {(analysisResult.political_analysis.influence_score * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 지역적 요소 탭 */}
                    {activeTab === 'regional' && (
                        <div className="regional-tab">
                            <h3>지역적 요소 분석</h3>
                            <div className="regional-analysis">
                                <div className="regional-stats">
                                    <div className="stat-item">
                                        <span className="label">지역 기업:</span>
                                        <span className="value">{analysisResult.regional_analysis.local_company ? '예' : '아니오'}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="label">지역 우대:</span>
                                        <span className="value">{analysisResult.regional_analysis.regional_advantage}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="label">지역 고용:</span>
                                        <span className="value">{analysisResult.regional_analysis.local_employment}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="label">지역 경제:</span>
                                        <span className="value">{analysisResult.regional_analysis.regional_economy}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="label">지역 사회:</span>
                                        <span className="value">{analysisResult.regional_analysis.community_benefit}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 친조/반조 탭 */}
                    {activeTab === 'favoritism' && (
                        <div className="favoritism-tab">
                            <h3>친조/반조 분석</h3>
                            <div className="favoritism-analysis">
                                <div className="favoritism-type">
                                    <h4>편향성 유형</h4>
                                    <span className={`favoritism-badge ${getFavoritismColor(analysisResult.favoritism_analysis.favoritism_type)}`}>
                                        {analysisResult.favoritism_analysis.favoritism_type}
                                    </span>
                                </div>
                                
                                <div className="favoritism-reasons">
                                    <h4>친조 이유</h4>
                                    <ul>
                                        {analysisResult.favoritism_analysis.favoritism_reasons.map((reason, index) => (
                                            <li key={index} className="favoritism-item">{reason}</li>
                                        ))}
                                    </ul>
                                </div>
                                
                                <div className="opposition-reasons">
                                    <h4>반조 이유</h4>
                                    <ul>
                                        {analysisResult.favoritism_analysis.opposition_reasons.map((reason, index) => (
                                            <li key={index} className="opposition-item">{reason}</li>
                                        ))}
                                    </ul>
                                </div>
                                
                                <div className="benefit-recipients">
                                    <h4>이익 수혜자</h4>
                                    <div className="recipients-list">
                                        {analysisResult.favoritism_analysis.benefit_recipients.map((recipient, index) => (
                                            <span key={index} className="recipient-tag">{recipient}</span>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="risk-recipients">
                                    <h4>위험 대상자</h4>
                                    <div className="recipients-list">
                                        {analysisResult.favoritism_analysis.risk_recipients.map((recipient, index) => (
                                            <span key={index} className="recipient-tag risk">{recipient}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 이익 분석 탭 */}
                    {activeTab === 'benefits' && (
                        <div className="benefits-tab">
                            <h3>이익 분석</h3>
                            <div className="benefits-analysis">
                                <div className="primary-beneficiaries">
                                    <h4>주요 수혜자</h4>
                                    <div className="beneficiaries-list">
                                        {analysisResult.benefit_analysis.primary_beneficiaries.map((beneficiary, index) => (
                                            <span key={index} className="beneficiary-tag primary">{beneficiary}</span>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="secondary-beneficiaries">
                                    <h4>부차적 수혜자</h4>
                                    <div className="beneficiaries-list">
                                        {analysisResult.benefit_analysis.secondary_beneficiaries.map((beneficiary, index) => (
                                            <span key={index} className="beneficiary-tag secondary">{beneficiary}</span>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="benefit-reasons">
                                    <h4>이익 이유</h4>
                                    <ul>
                                        {analysisResult.benefit_analysis.benefit_reasons.map((reason, index) => (
                                            <li key={index} className="benefit-reason">{reason}</li>
                                        ))}
                                    </ul>
                                </div>
                                
                                <div className="impact-analysis">
                                    <div className="economic-impact">
                                        <h4>경제적 영향</h4>
                                        <p>{analysisResult.benefit_analysis.economic_impact}</p>
                                    </div>
                                    <div className="political-impact">
                                        <h4>정치적 영향</h4>
                                        <p>{analysisResult.benefit_analysis.political_impact}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 위험 분석 탭 */}
                    {activeTab === 'risks' && (
                        <div className="risks-tab">
                            <h3>위험 분석</h3>
                            <div className="risks-analysis">
                                <div className="risk-factors">
                                    <h4>위험 요소</h4>
                                    <ul>
                                        {analysisResult.risk_assessment.risk_factors.map((factor, index) => (
                                            <li key={index} className="risk-factor">{factor}</li>
                                        ))}
                                    </ul>
                                </div>
                                
                                <div className="risk-recipients">
                                    <h4>위험 대상자</h4>
                                    <div className="recipients-list">
                                        {analysisResult.risk_assessment.risk_recipients.map((recipient, index) => (
                                            <span key={index} className="recipient-tag risk">{recipient}</span>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="risk-reasons">
                                    <h4>위험 이유</h4>
                                    <ul>
                                        {analysisResult.risk_assessment.risk_reasons.map((reason, index) => (
                                            <li key={index} className="risk-reason">{reason}</li>
                                        ))}
                                    </ul>
                                </div>
                                
                                <div className="mitigation-measures">
                                    <h4>완화 방안</h4>
                                    <ul>
                                        {analysisResult.risk_assessment.mitigation_measures.map((measure, index) => (
                                            <li key={index} className="mitigation-measure">{measure}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 종합 인사이트 탭 */}
                    {activeTab === 'insights' && (
                        <div className="insights-tab">
                            <h3>종합 인사이트</h3>
                            <div className="comprehensive-insights">
                                <div className="why-analysis">
                                    <div className="why-good">
                                        <h4>왜 좋은가?</h4>
                                        <ul>
                                            {analysisResult.comprehensive_insights.why_good.map((reason, index) => (
                                                <li key={index} className="good-reason">{reason}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="why-bad">
                                        <h4>왜 나쁜가?</h4>
                                        <ul>
                                            {analysisResult.comprehensive_insights.why_bad.map((reason, index) => (
                                                <li key={index} className="bad-reason">{reason}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                
                                <div className="who-analysis">
                                    <div className="who-benefits">
                                        <h4>누가 이익을 얻는가?</h4>
                                        <ul>
                                            {analysisResult.comprehensive_insights.who_benefits.map((benefit, index) => (
                                                <li key={index} className="benefit-item">{benefit}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="who-risks">
                                        <h4>누가 위험을 겪는가?</h4>
                                        <ul>
                                            {analysisResult.comprehensive_insights.who_risks.map((risk, index) => (
                                                <li key={index} className="risk-item">{risk}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                
                                <div className="implications-analysis">
                                    <div className="political-implications">
                                        <h4>정치적 함의</h4>
                                        <div className="implications-grid">
                                            {Object.entries(analysisResult.comprehensive_insights.political_implications).map(([key, value]) => (
                                                <div key={key} className="implication-item">
                                                    <span className="implication-key">{key}:</span>
                                                    <span className="implication-value">{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="economic-implications">
                                        <h4>경제적 함의</h4>
                                        <div className="implications-grid">
                                            {Object.entries(analysisResult.comprehensive_insights.economic_implications).map(([key, value]) => (
                                                <div key={key} className="implication-item">
                                                    <span className="implication-key">{key}:</span>
                                                    <span className="implication-value">{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!analysisResult && !isLoading && (
                <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h3>입찰제안서 기반 고도화된 분석을 실행해보세요</h3>
                    <p>시공사를 선택하고 분석할 내용을 입력한 후 분석을 실행하세요.</p>
                    <div className="features-list">
                        <h4>주요 기능:</h4>
                        <ul>
                            <li>입찰제안서 스타일 분석</li>
                            <li>정치적 요소 분석</li>
                            <li>지역적 요소 분석</li>
                            <li>친조/반조 분석</li>
                            <li>이익/위험 분석</li>
                            <li>종합 인사이트 제공</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedBidProposalAnalysis; 