import React, { useState, useEffect } from 'react';

interface Participant {
    name: string;
    message_count: number;
    avg_message_length: number;
    emotion_distribution: Record<string, number>;
    topics_mentioned: string[];
    key_statements: string[];
    influence_score: number;
}

interface IssueSection {
    title: string;
    time_period: string;
    participants_involved: string[];
    key_statements: string[];
    summary: string;
    sentiment_analysis: {
        overall_sentiment: string;
        sentiment_score: number;
        emotion_distribution: Record<string, number>;
    };
    conflict_level: number;
    urgency_level: string;
    action_items: string[];
}

interface OverallAnalysis {
    total_messages: number;
    total_participants: number;
    analysis_period_days: number;
    avg_messages_per_day: number;
    most_active_participant: string;
    highest_conflict_issue: string;
    overall_sentiment: string;
    avg_sentiment_score: number;
    total_conflicts: number;
    high_conflict_issues: number;
    urgent_issues: number;
    recommended_actions: string[];
}

interface AnalysisResult {
    room_name: string;
    analysis_period: {
        start_date: string;
        end_date: string;
        total_days: number;
    };
    participants: Record<string, Participant>;
    issue_sections: IssueSection[];
    overall_analysis: OverallAnalysis;
    generated_at: string;
}

interface AdvancedKakaoAnalysisProps {
    selectedRoomId: string;
}

const AdvancedKakaoAnalysis: React.FC<AdvancedKakaoAnalysisProps> = ({ selectedRoomId }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'participants' | 'issues' | 'details'>('overview');
    const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);
    const [selectedIssue, setSelectedIssue] = useState<number | null>(null);

    // 분석 실행
    const runAnalysis = async () => {
        if (!startDate || !endDate) {
            setError('시작일과 종료일을 모두 선택해주세요.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8000/api/v7/kakao/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    room_id: selectedRoomId,
                    start_date: startDate,
                    end_date: endDate,
                    chat_data: "" // 실제 데이터는 여기에 입력
                })
            });

            if (response.ok) {
                const data = await response.json();
                setAnalysisResult(data.analysis);
            } else {
                throw new Error('분석 실패');
            }
        } catch (error) {
            console.error('카카오톡 대화 분석 실패:', error);
            setError('카카오톡 대화 분석 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case '긍정적': return 'text-green-600';
            case '부정적': return 'text-red-600';
            case '중립적': return 'text-gray-600';
            default: return 'text-gray-600';
        }
    };

    const getUrgencyColor = (level: string) => {
        switch (level) {
            case '높음': return 'text-red-600 bg-red-100';
            case '중간': return 'text-yellow-600 bg-yellow-100';
            case '낮음': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getConflictColor = (level: number) => {
        if (level >= 80) return 'text-red-600 bg-red-100';
        if (level >= 60) return 'text-orange-600 bg-orange-100';
        if (level >= 40) return 'text-yellow-600 bg-yellow-100';
        return 'text-green-600 bg-green-100';
    };

    const getInfluenceColor = (score: number) => {
        if (score >= 8) return 'text-purple-600 bg-purple-100';
        if (score >= 6) return 'text-blue-600 bg-blue-100';
        if (score >= 4) return 'text-green-600 bg-green-100';
        return 'text-gray-600 bg-gray-100';
    };

    return (
        <div className="advanced-kakao-analysis">
            <div className="analysis-header">
                <h2>
                    <span className="header-icon">📱</span>
                    사용자 결과물과 동일한 카카오톡 대화 분석
                </h2>
                <p className="subtitle">실제 대화 데이터 기반 이슈별 정리 및 관련자 발언 요약</p>
            </div>

            <div className="analysis-controls">
                <div className="date-selection">
                    <div className="date-input">
                        <label htmlFor="start-date">시작일:</label>
                        <input
                            id="start-date"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="date-picker"
                        />
                    </div>
                    <div className="date-input">
                        <label htmlFor="end-date">종료일:</label>
                        <input
                            id="end-date"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="date-picker"
                        />
                    </div>
                </div>
                <button
                    onClick={runAnalysis}
                    disabled={isLoading || !startDate || !endDate}
                    className="analyze-btn"
                >
                    {isLoading ? '분석 중...' : '카카오톡 대화 분석 실행'}
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
                            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            📊 전체 개요
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'participants' ? 'active' : ''}`}
                            onClick={() => setActiveTab('participants')}
                        >
                            👥 참여자 분석
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'issues' ? 'active' : ''}`}
                            onClick={() => setActiveTab('issues')}
                        >
                            ⚠️ 이슈별 정리
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
                            <div className="room-info">
                                <h3>{analysisResult.room_name}</h3>
                                <p className="period">
                                    {analysisResult.analysis_period.start_date} ~ {analysisResult.analysis_period.end_date}
                                    ({analysisResult.analysis_period.total_days}일간)
                                </p>
                            </div>

                            <div className="overall-stats">
                                <div className="stat-grid">
                                    <div className="stat-card">
                                        <div className="stat-number">{analysisResult.overall_analysis.total_messages}</div>
                                        <div className="stat-label">총 메시지</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-number">{analysisResult.overall_analysis.total_participants}</div>
                                        <div className="stat-label">참여자 수</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-number">{analysisResult.overall_analysis.avg_messages_per_day.toFixed(1)}</div>
                                        <div className="stat-label">일평균 메시지</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-number">{analysisResult.overall_analysis.total_conflicts}</div>
                                        <div className="stat-label">총 갈등</div>
                                    </div>
                                </div>
                            </div>

                            <div className="sentiment-overview">
                                <h4>전체 감정 분석</h4>
                                <div className="sentiment-info">
                                    <span className={`sentiment-label ${getSentimentColor(analysisResult.overall_analysis.overall_sentiment)}`}>
                                        {analysisResult.overall_analysis.overall_sentiment}
                                    </span>
                                    <span className="sentiment-score">
                                        감정 점수: {analysisResult.overall_analysis.avg_sentiment_score.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <div className="key-findings">
                                <h4>주요 발견사항</h4>
                                <ul>
                                    <li>가장 활발한 참여자: {analysisResult.overall_analysis.most_active_participant}</li>
                                    <li>최고 갈등 이슈: {analysisResult.overall_analysis.highest_conflict_issue}</li>
                                    <li>높은 갈등 이슈: {analysisResult.overall_analysis.high_conflict_issues}건</li>
                                    <li>긴급 이슈: {analysisResult.overall_analysis.urgent_issues}건</li>
                                </ul>
                            </div>

                            <div className="recommended-actions">
                                <h4>권장 조치사항</h4>
                                <ul>
                                    {analysisResult.overall_analysis.recommended_actions.map((action, index) => (
                                        <li key={index}>{action}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* 참여자 분석 탭 */}
                    {activeTab === 'participants' && (
                        <div className="participants-tab">
                            <h3>참여자별 상세 분석</h3>
                            <div className="participants-grid">
                                {Object.entries(analysisResult.participants).map(([id, participant]) => (
                                    <div key={id} className="participant-card">
                                        <div className="participant-header">
                                            <h4>{participant.name}</h4>
                                            <span className="participant-id">({id})</span>
                                            <span className={`influence-score ${getInfluenceColor(participant.influence_score)}`}>
                                                영향력: {participant.influence_score.toFixed(1)}
                                            </span>
                                        </div>
                                        <div className="participant-stats">
                                            <div className="stat-item">
                                                <span className="label">메시지 수:</span>
                                                <span className="value">{participant.message_count}개</span>
                                            </div>
                                            <div className="stat-item">
                                                <span className="label">평균 길이:</span>
                                                <span className="value">{participant.avg_message_length.toFixed(1)}자</span>
                                            </div>
                                        </div>
                                        <div className="emotion-distribution">
                                            <h5>감정 분포</h5>
                                            <div className="emotion-chart">
                                                {Object.entries(participant.emotion_distribution).map(([emotion, count]) => (
                                                    <div key={emotion} className="emotion-item">
                                                        <span className="emotion-name">{emotion}</span>
                                                        <div className="emotion-bar">
                                                            <div
                                                                className="emotion-fill"
                                                                style={{ width: `${(count / participant.message_count) * 100}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="emotion-count">{count}회</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="topics-mentioned">
                                            <h5>언급 주제</h5>
                                            <div className="topics-list">
                                                {participant.topics_mentioned.map((topic, index) => (
                                                    <span key={index} className="topic-tag">{topic}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="key-statements">
                                            <h5>주요 발언</h5>
                                            <ul>
                                                {participant.key_statements.map((statement, index) => (
                                                    <li key={index}>{statement}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 이슈별 정리 탭 */}
                    {activeTab === 'issues' && (
                        <div className="issues-tab">
                            <h3>이슈별 정리 및 관련자 발언 요약</h3>
                            <div className="issues-list">
                                {analysisResult.issue_sections.map((issue, index) => (
                                    <div key={index} className="issue-card">
                                        <div className="issue-header" onClick={() => setSelectedIssue(selectedIssue === index ? null : index)}>
                                            <h4 className="issue-title">{issue.title}</h4>
                                            <div className="issue-meta">
                                                <span className="time-period">{issue.time_period}</span>
                                                <span className={`urgency-level ${getUrgencyColor(issue.urgency_level)}`}>
                                                    {issue.urgency_level}
                                                </span>
                                                <span className={`conflict-level ${getConflictColor(issue.conflict_level)}`}>
                                                    갈등 {issue.conflict_level.toFixed(0)}%
                                                </span>
                                            </div>
                                            <span className="expand-icon">{selectedIssue === index ? '▼' : '▶'}</span>
                                        </div>
                                        
                                        {selectedIssue === index && (
                                            <div className="issue-details">
                                                <div className="participants-involved">
                                                    <h5>관련 참여자</h5>
                                                    <div className="participants-list">
                                                        {issue.participants_involved.map((pid, pIndex) => (
                                                            <span key={pIndex} className="participant-tag">
                                                                {analysisResult.participants[pid]?.name || pid}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="key-statements">
                                                    <h5>주요 발언</h5>
                                                    <ul>
                                                        {issue.key_statements.map((statement, sIndex) => (
                                                            <li key={sIndex}>{statement}</li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div className="issue-summary">
                                                    <h5>대화 요약</h5>
                                                    <p>{issue.summary}</p>
                                                </div>

                                                <div className="sentiment-analysis">
                                                    <h5>감정 분석</h5>
                                                    <div className="sentiment-info">
                                                        <span className={`sentiment-label ${getSentimentColor(issue.sentiment_analysis.overall_sentiment)}`}>
                                                            {issue.sentiment_analysis.overall_sentiment}
                                                        </span>
                                                        <span className="sentiment-score">
                                                            점수: {issue.sentiment_analysis.sentiment_score.toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div className="emotion-distribution">
                                                        {Object.entries(issue.sentiment_analysis.emotion_distribution).map(([emotion, score]) => (
                                                            <div key={emotion} className="emotion-item">
                                                                <span className="emotion-name">{emotion}</span>
                                                                <div className="emotion-bar">
                                                                    <div
                                                                        className="emotion-fill"
                                                                        style={{ width: `${score * 100}%` }}
                                                                    ></div>
                                                                </div>
                                                                <span className="emotion-score">{(score * 100).toFixed(1)}%</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="action-items">
                                                    <h5>권장 조치사항</h5>
                                                    <ul>
                                                        {issue.action_items.map((item, aIndex) => (
                                                            <li key={aIndex}>{item}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 상세 분석 탭 */}
                    {activeTab === 'details' && (
                        <div className="details-tab">
                            <h3>상세 분석 정보</h3>
                            <div className="details-content">
                                <div className="analysis-metadata">
                                    <h4>분석 메타데이터</h4>
                                    <div className="metadata-grid">
                                        <div className="metadata-item">
                                            <span className="label">분석 기간:</span>
                                            <span className="value">{analysisResult.analysis_period.total_days}일</span>
                                        </div>
                                        <div className="metadata-item">
                                            <span className="label">생성 시간:</span>
                                            <span className="value">{new Date(analysisResult.generated_at).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="statistical-summary">
                                    <h4>통계 요약</h4>
                                    <div className="stats-grid">
                                        <div className="stat-item">
                                            <span className="label">총 메시지:</span>
                                            <span className="value">{analysisResult.overall_analysis.total_messages}개</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="label">참여자 수:</span>
                                            <span className="value">{analysisResult.overall_analysis.total_participants}명</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="label">일평균 메시지:</span>
                                            <span className="value">{analysisResult.overall_analysis.avg_messages_per_day.toFixed(1)}개</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="label">총 갈등:</span>
                                            <span className="value">{analysisResult.overall_analysis.total_conflicts}건</span>
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
                    <div className="empty-icon">📱</div>
                    <h3>카카오톡 대화 분석을 실행해보세요</h3>
                    <p>시작일과 종료일을 선택한 후 분석을 실행하세요.</p>
                    <div className="features-list">
                        <h4>주요 기능:</h4>
                        <ul>
                            <li>사용자 결과물과 동일한 형태의 분석</li>
                            <li>참여자별 상세 분석 (영향력 점수 포함)</li>
                            <li>이슈별 정리 및 발언 요약</li>
                            <li>감정 분석 및 갈등 수준 평가</li>
                            <li>실무용 권장 조치사항</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedKakaoAnalysis; 