import React, { useState } from 'react';

interface CompanyBias {
    positive_mentions: number;
    negative_mentions: number;
    neutral_mentions: number;
    promotion_logic_count: number;
    opposition_count: number;
    bias_score: number;
    key_promoters: string[];
    key_opponents: string[];
    promotion_statements: string[];
    opposition_statements: string[];
    sentiment_distribution: Record<string, number>;
}

interface ParticipantBias {
    participant_name: string;
    company_bias: Record<string, number>;
    total_mentions: number;
    promotion_count: number;
    opposition_count: number;
    most_biased_company: string;
    bias_strength: number;
}

interface BiasAnalysisResult {
    company_analysis: Record<string, CompanyBias>;
    participant_analysis: Record<string, ParticipantBias>;
    summary: {
        total_companies_analyzed: number;
        most_biased_company: string;
        most_biased_participant: string;
        overall_bias_trend: string;
        promotion_vs_opposition: {
            total_promotion: number;
            total_opposition: number;
            promotion_ratio: number;
            opposition_ratio: number;
        };
    };
}

interface ConstructionCompanyBiasAnalysisProps {
    selectedRoomId: string;
}

const ConstructionCompanyBiasAnalysis: React.FC<ConstructionCompanyBiasAnalysisProps> = ({ selectedRoomId }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [biasAnalysisResult, setBiasAnalysisResult] = useState<BiasAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'companies' | 'participants' | 'details'>('overview');
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
    const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);

    // 시공사 성향 분석 실행
    const runBiasAnalysis = async () => {
        if (!startDate || !endDate) {
            setError('시작일과 종료일을 모두 선택해주세요.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8000/api/v7/construction-company/bias-analysis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    room_id: selectedRoomId,
                    start_date: startDate,
                    end_date: endDate
                })
            });

            if (response.ok) {
                const data = await response.json();
                setBiasAnalysisResult(data.bias_analysis);
            } else {
                throw new Error('분석 실패');
            }
        } catch (error) {
            console.error('시공사 성향 분석 실패:', error);
            setError('시공사 성향 분석 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const getBiasColor = (score: number) => {
        if (score >= 0.3) return 'text-green-600 bg-green-100';
        if (score <= -0.3) return 'text-red-600 bg-red-100';
        return 'text-gray-600 bg-gray-100';
    };

    const getBiasLabel = (score: number) => {
        if (score >= 0.5) return '강한 긍정';
        if (score >= 0.3) return '긍정';
        if (score >= -0.3) return '중립';
        if (score >= -0.5) return '부정';
        return '강한 부정';
    };

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case '긍정': return 'text-green-600';
            case '부정': return 'text-red-600';
            case '중립': return 'text-gray-600';
            default: return 'text-gray-600';
        }
    };

    return (
        <div className="construction-company-bias-analysis">
            <div className="analysis-header">
                <h2>
                    <span className="header-icon">🏗️</span>
                    시공사 성향 분석 시스템
                </h2>
                <p className="subtitle">홍보 논리, 긍정/부정 답변, 반대 의견 전체 파악</p>
            </div>

            <div className="analysis-controls">
                <div className="date-selection">
                    <div className="date-input">
                        <label htmlFor="bias-start-date">시작일:</label>
                        <input
                            id="bias-start-date"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="date-picker"
                        />
                    </div>
                    <div className="date-input">
                        <label htmlFor="bias-end-date">종료일:</label>
                        <input
                            id="bias-end-date"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="date-picker"
                        />
                    </div>
                </div>
                <button
                    onClick={runBiasAnalysis}
                    disabled={isLoading || !startDate || !endDate}
                    className="analyze-btn"
                >
                    {isLoading ? '분석 중...' : '시공사 성향 분석 실행'}
                </button>
            </div>

            {error && (
                <div className="error-message">
                    ❌ {error}
                </div>
            )}

            {biasAnalysisResult && (
                <div className="bias-analysis-content">
                    {/* 탭 네비게이션 */}
                    <div className="tab-navigation">
                        <button
                            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            📊 전체 개요
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'companies' ? 'active' : ''}`}
                            onClick={() => setActiveTab('companies')}
                        >
                            🏢 시공사별 분석
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'participants' ? 'active' : ''}`}
                            onClick={() => setActiveTab('participants')}
                        >
                            👥 참여자별 편향성
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                            onClick={() => setActiveTab('details')}
                        >
                            📋 상세 분석
                        </button>
                    </div>

                    {/* 전체 개요 탭 */}
                    {activeTab === 'overview' && (
                        <div className="overview-tab">
                            <div className="summary-stats">
                                <h3>시공사 성향 분석 요약</h3>
                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <div className="stat-number">{biasAnalysisResult.summary.total_companies_analyzed}</div>
                                        <div className="stat-label">분석된 시공사</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-number">{biasAnalysisResult.summary.most_biased_company}</div>
                                        <div className="stat-label">가장 편향된 시공사</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-number">{biasAnalysisResult.summary.most_biased_participant}</div>
                                        <div className="stat-label">가장 편향된 참여자</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-number">{biasAnalysisResult.summary.overall_bias_trend}</div>
                                        <div className="stat-label">전체 편향 트렌드</div>
                                    </div>
                                </div>
                            </div>

                            <div className="promotion-vs-opposition">
                                <h4>홍보 vs 반대 의견 분석</h4>
                                <div className="ratio-analysis">
                                    <div className="ratio-item">
                                        <span className="label">총 홍보 논리:</span>
                                        <span className="value">{biasAnalysisResult.summary.promotion_vs_opposition.total_promotion}건</span>
                                    </div>
                                    <div className="ratio-item">
                                        <span className="label">총 반대 의견:</span>
                                        <span className="value">{biasAnalysisResult.summary.promotion_vs_opposition.total_opposition}건</span>
                                    </div>
                                    <div className="ratio-item">
                                        <span className="label">홍보 비율:</span>
                                        <span className="value">{(biasAnalysisResult.summary.promotion_vs_opposition.promotion_ratio * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="ratio-item">
                                        <span className="label">반대 비율:</span>
                                        <span className="value">{(biasAnalysisResult.summary.promotion_vs_opposition.opposition_ratio * 100).toFixed(1)}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="company-bias-overview">
                                <h4>시공사별 편향성 개요</h4>
                                <div className="company-bias-grid">
                                    {Object.entries(biasAnalysisResult.company_analysis).map(([company, analysis]) => (
                                        <div key={company} className="company-bias-card">
                                            <h5>{company}</h5>
                                            <div className="bias-score">
                                                <span className={`bias-label ${getBiasColor(analysis.bias_score)}`}>
                                                    {getBiasLabel(analysis.bias_score)} ({analysis.bias_score.toFixed(2)})
                                                </span>
                                            </div>
                                            <div className="bias-stats">
                                                <div className="stat-item">
                                                    <span className="label">긍정:</span>
                                                    <span className="value">{analysis.positive_mentions}회</span>
                                                </div>
                                                <div className="stat-item">
                                                    <span className="label">부정:</span>
                                                    <span className="value">{analysis.negative_mentions}회</span>
                                                </div>
                                                <div className="stat-item">
                                                    <span className="label">홍보:</span>
                                                    <span className="value">{analysis.promotion_logic_count}회</span>
                                                </div>
                                                <div className="stat-item">
                                                    <span className="label">반대:</span>
                                                    <span className="value">{analysis.opposition_count}회</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 시공사별 분석 탭 */}
                    {activeTab === 'companies' && (
                        <div className="companies-tab">
                            <h3>시공사별 상세 성향 분석</h3>
                            <div className="companies-list">
                                {Object.entries(biasAnalysisResult.company_analysis).map(([company, analysis]) => (
                                    <div key={company} className="company-detail-card">
                                        <div className="company-header" onClick={() => setSelectedCompany(selectedCompany === company ? null : company)}>
                                            <h4 className="company-name">{company}</h4>
                                            <div className="company-meta">
                                                <span className={`bias-score ${getBiasColor(analysis.bias_score)}`}>
                                                    {getBiasLabel(analysis.bias_score)} ({analysis.bias_score.toFixed(2)})
                                                </span>
                                                <span className="mention-count">
                                                    총 언급: {analysis.positive_mentions + analysis.negative_mentions + analysis.neutral_mentions}회
                                                </span>
                                            </div>
                                            <span className="expand-icon">{selectedCompany === company ? '▼' : '▶'}</span>
                                        </div>
                                        
                                        {selectedCompany === company && (
                                            <div className="company-details">
                                                <div className="sentiment-analysis">
                                                    <h5>감정 분포</h5>
                                                    <div className="sentiment-chart">
                                                        {Object.entries(analysis.sentiment_distribution).map(([sentiment, ratio]) => (
                                                            <div key={sentiment} className="sentiment-item">
                                                                <span className="sentiment-name">{sentiment}</span>
                                                                <div className="sentiment-bar">
                                                                    <div
                                                                        className={`sentiment-fill ${getSentimentColor(sentiment)}`}
                                                                        style={{ width: `${ratio * 100}%` }}
                                                                    ></div>
                                                                </div>
                                                                <span className="sentiment-ratio">{(ratio * 100).toFixed(1)}%</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="key-actors">
                                                    <h5>주요 인물</h5>
                                                    <div className="actors-grid">
                                                        <div className="promoters">
                                                            <h6>주요 옹호자</h6>
                                                            <div className="actors-list">
                                                                {analysis.key_promoters.map((promoter, index) => (
                                                                    <span key={index} className="actor-tag promoter">{promoter}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="opponents">
                                                            <h6>주요 반대자</h6>
                                                            <div className="actors-list">
                                                                {analysis.key_opponents.map((opponent, index) => (
                                                                    <span key={index} className="actor-tag opponent">{opponent}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="statements-analysis">
                                                    <h5>주요 발언 분석</h5>
                                                    <div className="statements-grid">
                                                        <div className="promotion-statements">
                                                            <h6>홍보 논리 발언</h6>
                                                            <ul>
                                                                {analysis.promotion_statements.map((statement, index) => (
                                                                    <li key={index}>{statement}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        <div className="opposition-statements">
                                                            <h6>반대 의견 발언</h6>
                                                            <ul>
                                                                {analysis.opposition_statements.map((statement, index) => (
                                                                    <li key={index}>{statement}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 참여자별 편향성 탭 */}
                    {activeTab === 'participants' && (
                        <div className="participants-tab">
                            <h3>참여자별 시공사 편향성 분석</h3>
                            <div className="participants-grid">
                                {Object.entries(biasAnalysisResult.participant_analysis).map(([participantId, analysis]) => (
                                    <div key={participantId} className="participant-bias-card">
                                        <div className="participant-header">
                                            <h4>{analysis.participant_name}</h4>
                                            <span className="participant-id">({participantId})</span>
                                            <span className={`bias-strength ${getBiasColor(analysis.bias_strength)}`}>
                                                편향 강도: {analysis.bias_strength.toFixed(1)}
                                            </span>
                                        </div>
                                        <div className="participant-stats">
                                            <div className="stat-item">
                                                <span className="label">총 언급:</span>
                                                <span className="value">{analysis.total_mentions}회</span>
                                            </div>
                                            <div className="stat-item">
                                                <span className="label">홍보:</span>
                                                <span className="value">{analysis.promotion_count}회</span>
                                            </div>
                                            <div className="stat-item">
                                                <span className="label">반대:</span>
                                                <span className="value">{analysis.opposition_count}회</span>
                                            </div>
                                            <div className="stat-item">
                                                <span className="label">가장 편향:</span>
                                                <span className="value">{analysis.most_biased_company}</span>
                                            </div>
                                        </div>
                                        <div className="company-bias-chart">
                                            <h5>시공사별 편향성</h5>
                                            <div className="bias-bars">
                                                {Object.entries(analysis.company_bias).map(([company, bias]) => (
                                                    <div key={company} className="bias-bar-item">
                                                        <span className="company-name">{company}</span>
                                                        <div className="bias-bar">
                                                            <div
                                                                className={`bias-fill ${getBiasColor(bias)}`}
                                                                style={{ 
                                                                    width: `${Math.abs(bias) * 100}%`,
                                                                    marginLeft: bias < 0 ? 'auto' : '0'
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <span className="bias-score">{bias.toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 상세 분석 탭 */}
                    {activeTab === 'details' && (
                        <div className="details-tab">
                            <h3>시공사 성향 상세 분석</h3>
                            <div className="details-content">
                                <div className="analysis-metadata">
                                    <h4>분석 메타데이터</h4>
                                    <div className="metadata-grid">
                                        <div className="metadata-item">
                                            <span className="label">분석된 시공사:</span>
                                            <span className="value">{biasAnalysisResult.summary.total_companies_analyzed}개</span>
                                        </div>
                                        <div className="metadata-item">
                                            <span className="label">전체 편향 트렌드:</span>
                                            <span className="value">{biasAnalysisResult.summary.overall_bias_trend}</span>
                                        </div>
                                        <div className="metadata-item">
                                            <span className="label">홍보 vs 반대 비율:</span>
                                            <span className="value">
                                                {biasAnalysisResult.summary.promotion_vs_opposition.promotion_ratio.toFixed(2)} : 
                                                {biasAnalysisResult.summary.promotion_vs_opposition.opposition_ratio.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bias-trends">
                                    <h4>편향성 트렌드 분석</h4>
                                    <div className="trends-analysis">
                                        <div className="trend-item">
                                            <h5>가장 편향된 시공사</h5>
                                            <p>{biasAnalysisResult.summary.most_biased_company}</p>
                                        </div>
                                        <div className="trend-item">
                                            <h5>가장 편향된 참여자</h5>
                                            <p>{biasAnalysisResult.summary.most_biased_participant}</p>
                                        </div>
                                        <div className="trend-item">
                                            <h5>전체 편향성</h5>
                                            <p>{biasAnalysisResult.summary.overall_bias_trend}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!biasAnalysisResult && !isLoading && (
                <div className="empty-state">
                    <div className="empty-icon">🏗️</div>
                    <h3>시공사 성향 분석을 실행해보세요</h3>
                    <p>시작일과 종료일을 선택한 후 분석을 실행하세요.</p>
                    <div className="features-list">
                        <h4>주요 기능:</h4>
                        <ul>
                            <li>시공사별 홍보 논리 분석</li>
                            <li>참여자별 편향성 파악</li>
                            <li>긍정/부정 답변 분류</li>
                            <li>반대 의견 전체 파악</li>
                            <li>편향성 점수 계산</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConstructionCompanyBiasAnalysis; 