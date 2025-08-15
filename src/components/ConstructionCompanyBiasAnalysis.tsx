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
    projectId?: string;
}

const ConstructionCompanyBiasAnalysis: React.FC<ConstructionCompanyBiasAnalysisProps> = ({ projectId }) => {
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
            // 시뮬레이션된 분석 결과 생성
            const mockResult: BiasAnalysisResult = {
                company_analysis: {
                    '대우건설': {
                        positive_mentions: 45,
                        negative_mentions: 12,
                        neutral_mentions: 23,
                        promotion_logic_count: 38,
                        opposition_count: 8,
                        bias_score: 0.72,
                        key_promoters: ['김철수', '이영희', '박민수'],
                        key_opponents: ['최동욱'],
                        promotion_statements: [
                            '대우건설의 기술력이 우수합니다',
                            '안전성 검토가 철저히 이루어졌습니다'
                        ],
                        opposition_statements: [
                            '공사비가 너무 높습니다'
                        ],
                        sentiment_distribution: {
                            'positive': 0.56,
                            'negative': 0.15,
                            'neutral': 0.29
                        }
                    },
                    '삼성물산': {
                        positive_mentions: 32,
                        negative_mentions: 18,
                        neutral_mentions: 30,
                        promotion_logic_count: 25,
                        opposition_count: 15,
                        bias_score: 0.25,
                        key_promoters: ['김영수', '박지영'],
                        key_opponents: ['이철수', '최영희'],
                        promotion_statements: [
                            '삼성물산의 경험이 풍부합니다'
                        ],
                        opposition_statements: [
                            '공사 기간이 너무 깁니다',
                            '비용 효율성이 낮습니다'
                        ],
                        sentiment_distribution: {
                            'positive': 0.40,
                            'negative': 0.23,
                            'neutral': 0.37
                        }
                    }
                },
                participant_analysis: {
                    '김철수': {
                        participant_name: '김철수',
                        company_bias: {
                            '대우건설': 0.85,
                            '삼성물산': 0.15
                        },
                        total_mentions: 25,
                        promotion_count: 20,
                        opposition_count: 5,
                        most_biased_company: '대우건설',
                        bias_strength: 0.85
                    },
                    '이영희': {
                        participant_name: '이영희',
                        company_bias: {
                            '대우건설': 0.70,
                            '삼성물산': 0.30
                        },
                        total_mentions: 18,
                        promotion_count: 15,
                        opposition_count: 3,
                        most_biased_company: '대우건설',
                        bias_strength: 0.70
                    }
                },
                summary: {
                    total_companies_analyzed: 2,
                    most_biased_company: '대우건설',
                    most_biased_participant: '김철수',
                    overall_bias_trend: '대우건설에 대한 긍정적 성향이 강함',
                    promotion_vs_opposition: {
                        total_promotion: 63,
                        total_opposition: 23,
                        promotion_ratio: 0.73,
                        opposition_ratio: 0.27
                    }
                }
            };

            // 실제 API 호출 대신 시뮬레이션
            setTimeout(() => {
                setBiasAnalysisResult(mockResult);
                setIsLoading(false);
            }, 2000);

        } catch (error) {
            console.error('시공사 성향 분석 실패:', error);
            setError('시공사 성향 분석 중 오류가 발생했습니다.');
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

    if (!biasAnalysisResult) {
        return (
            <div className="bias-analysis">
                <div className="bias-analysis-header">
                    <h2>🏗️ 시공사 성향 분석 시스템</h2>
                    <p>대화 데이터를 기반으로 시공사에 대한 참여자들의 성향을 분석합니다.</p>
                </div>

                <div className="bias-analysis-controls">
                    <div className="date-inputs">
                        <div className="date-input">
                            <label>시작일:</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="date-input">
                            <label>종료일:</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        className="analysis-button"
                        onClick={runBiasAnalysis}
                        disabled={isLoading || !startDate || !endDate}
                    >
                        {isLoading ? '분석 중...' : '시공사 성향 분석 실행'}
                    </button>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <div className="bias-analysis-info">
                    <h3>시공사 성향 분석을 실행해보세요</h3>
                    <p>선택한 기간의 대화 데이터를 분석하여 시공사에 대한 참여자들의 성향을 파악합니다.</p>
                    <ul>
                        <li>📊 시공사별 언급 빈도 및 감정 분석</li>
                        <li>👥 참여자별 성향 패턴 분석</li>
                        <li>📈 홍보 vs 반대 비율 분석</li>
                        <li>🎯 핵심 발언자 및 주요 의견 분석</li>
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <div className="bias-analysis">
            <div className="bias-analysis-header">
                <h2>🏗️ 시공사 성향 분석 결과</h2>
                <div className="analysis-tabs">
                    <button
                        className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        📊 개요
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'companies' ? 'active' : ''}`}
                        onClick={() => setActiveTab('companies')}
                    >
                        🏢 시공사별
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'participants' ? 'active' : ''}`}
                        onClick={() => setActiveTab('participants')}
                    >
                        👥 참여자별
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
                        onClick={() => setActiveTab('details')}
                    >
                        📋 상세
                    </button>
                </div>
            </div>

            {activeTab === 'overview' && (
                <div className="bias-overview">
                    <div className="summary-cards">
                        <div className="summary-card">
                            <h3>시공사 성향 분석 요약</h3>
                            <div className="summary-stats">
                                <div className="stat-item">
                                    <span className="stat-label">분석된 시공사</span>
                                    <span className="stat-value">{biasAnalysisResult.summary.total_companies_analyzed}개</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">가장 편향된 시공사</span>
                                    <span className="stat-value">{biasAnalysisResult.summary.most_biased_company}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">가장 편향된 참여자</span>
                                    <span className="stat-value">{biasAnalysisResult.summary.most_biased_participant}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">전체 성향 트렌드</span>
                                    <span className="stat-value">{biasAnalysisResult.summary.overall_bias_trend}</span>
                                </div>
                            </div>
                        </div>

                        <div className="summary-card">
                            <h3>홍보 vs 반대 비율</h3>
                            <div className="promotion-opposition">
                                <div className="promotion-bar">
                                    <div 
                                        className="promotion-fill"
                                        style={{ width: `${biasAnalysisResult.summary.promotion_vs_opposition.promotion_ratio * 100}%` }}
                                    />
                                    <span>홍보: {biasAnalysisResult.summary.promotion_vs_opposition.total_promotion}건</span>
                                </div>
                                <div className="opposition-bar">
                                    <div 
                                        className="opposition-fill"
                                        style={{ width: `${biasAnalysisResult.summary.promotion_vs_opposition.opposition_ratio * 100}%` }}
                                    />
                                    <span>반대: {biasAnalysisResult.summary.promotion_vs_opposition.total_opposition}건</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'companies' && (
                <div className="bias-companies">
                    <h3>시공사별 상세 성향 분석</h3>
                    <div className="companies-grid">
                        {Object.entries(biasAnalysisResult.company_analysis).map(([companyName, analysis]) => (
                            <div key={companyName} className="company-card">
                                <div className="company-header">
                                    <h4>{companyName}</h4>
                                    <span className={`bias-score ${getBiasColor(analysis.bias_score)}`}>
                                        {getBiasLabel(analysis.bias_score)} ({analysis.bias_score.toFixed(2)})
                                    </span>
                                </div>
                                <div className="company-stats">
                                    <div className="stat-row">
                                        <span>긍정 언급:</span>
                                        <span>{analysis.positive_mentions}건</span>
                                    </div>
                                    <div className="stat-row">
                                        <span>부정 언급:</span>
                                        <span>{analysis.negative_mentions}건</span>
                                    </div>
                                    <div className="stat-row">
                                        <span>중립 언급:</span>
                                        <span>{analysis.neutral_mentions}건</span>
                                    </div>
                                    <div className="stat-row">
                                        <span>홍보 논리:</span>
                                        <span>{analysis.promotion_logic_count}건</span>
                                    </div>
                                    <div className="stat-row">
                                        <span>반대 의견:</span>
                                        <span>{analysis.opposition_count}건</span>
                                    </div>
                                </div>
                                <div className="company-key-players">
                                    <div className="key-promoters">
                                        <h5>주요 홍보자:</h5>
                                        <ul>
                                            {analysis.key_promoters.map((promoter, index) => (
                                                <li key={index}>{promoter}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="key-opponents">
                                        <h5>주요 반대자:</h5>
                                        <ul>
                                            {analysis.key_opponents.map((opponent, index) => (
                                                <li key={index}>{opponent}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'participants' && (
                <div className="bias-participants">
                    <h3>참여자별 성향 분석</h3>
                    <div className="participants-grid">
                        {Object.entries(biasAnalysisResult.participant_analysis).map(([participantName, analysis]) => (
                            <div key={participantName} className="participant-card">
                                <div className="participant-header">
                                    <h4>{analysis.participant_name}</h4>
                                    <span className="bias-strength">
                                        편향 강도: {analysis.bias_strength.toFixed(2)}
                                    </span>
                                </div>
                                <div className="participant-stats">
                                    <div className="stat-row">
                                        <span>총 언급:</span>
                                        <span>{analysis.total_mentions}건</span>
                                    </div>
                                    <div className="stat-row">
                                        <span>홍보 횟수:</span>
                                        <span>{analysis.promotion_count}건</span>
                                    </div>
                                    <div className="stat-row">
                                        <span>반대 횟수:</span>
                                        <span>{analysis.opposition_count}건</span>
                                    </div>
                                    <div className="stat-row">
                                        <span>가장 편향된 시공사:</span>
                                        <span>{analysis.most_biased_company}</span>
                                    </div>
                                </div>
                                <div className="participant-bias-chart">
                                    <h5>시공사별 편향도:</h5>
                                    {Object.entries(analysis.company_bias).map(([company, bias]) => (
                                        <div key={company} className="bias-bar">
                                            <span className="company-name">{company}</span>
                                            <div className="bias-bar-container">
                                                <div 
                                                    className={`bias-bar-fill ${getBiasColor(bias)}`}
                                                    style={{ width: `${Math.abs(bias) * 100}%` }}
                                                />
                                            </div>
                                            <span className="bias-value">{bias.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'details' && (
                <div className="bias-details">
                    <h3>시공사 성향 상세 분석</h3>
                    <div className="details-content">
                        <div className="sentiment-analysis">
                            <h4>감정 분포 분석</h4>
                            {Object.entries(biasAnalysisResult.company_analysis).map(([companyName, analysis]) => (
                                <div key={companyName} className="sentiment-card">
                                    <h5>{companyName}</h5>
                                    <div className="sentiment-bars">
                                        <div className="sentiment-bar">
                                            <span>긍정</span>
                                            <div className="sentiment-bar-container">
                                                <div 
                                                    className="sentiment-bar-fill positive"
                                                    style={{ width: `${analysis.sentiment_distribution.positive * 100}%` }}
                                                />
                                            </div>
                                            <span>{(analysis.sentiment_distribution.positive * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="sentiment-bar">
                                            <span>부정</span>
                                            <div className="sentiment-bar-container">
                                                <div 
                                                    className="sentiment-bar-fill negative"
                                                    style={{ width: `${analysis.sentiment_distribution.negative * 100}%` }}
                                                />
                                            </div>
                                            <span>{(analysis.sentiment_distribution.negative * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="sentiment-bar">
                                            <span>중립</span>
                                            <div className="sentiment-bar-container">
                                                <div 
                                                    className="sentiment-bar-fill neutral"
                                                    style={{ width: `${analysis.sentiment_distribution.neutral * 100}%` }}
                                                />
                                            </div>
                                            <span>{(analysis.sentiment_distribution.neutral * 100).toFixed(1)}%</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConstructionCompanyBiasAnalysis;
