import React, { useState, useEffect } from 'react';
import { advancedMessageAPI } from '../services/advancedMessageAPI';
import './AdvancedMLDashboard.css';

interface AdvancedMLDashboardProps {
    userId?: string;
}

interface UserProfile {
    user_id: string;
    personality_traits: Record<string, number>;
    communication_style: Record<string, number>;
    emotion_patterns: Record<string, number>;
    topic_preferences: Record<string, number>;
    response_patterns: Record<string, any>;
    learning_history: Array<Record<string, any>>;
    last_updated: string;
}

interface PredictionResult {
    predicted_engagement?: number;
    predicted_time?: number;
    confidence: number;
    factors: Array<[string, number]>;
}

interface PersonalizedStyle {
    response_style: string;
    tone: string;
    length: string;
    personality_match: Record<string, number>;
    emotion_consideration: string;
}

interface MLSystemStats {
    total_users: number;
    total_models: number;
    avg_profile_age: number;
    most_active_users: Array<Record<string, any>>;
    model_accuracy: Record<string, number>;
}

const AdvancedMLDashboard: React.FC<AdvancedMLDashboardProps> = ({
    userId = "default"
}) => {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [allProfiles, setAllProfiles] = useState<Record<string, UserProfile>>({});
    const [engagementPrediction, setEngagementPrediction] = useState<PredictionResult | null>(null);
    const [responseTimePrediction, setResponseTimePrediction] = useState<PredictionResult | null>(null);
    const [personalizedStyle, setPersonalizedStyle] = useState<PersonalizedStyle | null>(null);
    const [systemStats, setSystemStats] = useState<MLSystemStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [testMessage, setTestMessage] = useState("안녕하세요! 오늘 날씨가 좋네요.");
    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        loadMLData();

        // 자동 새로고침 설정
        let interval: NodeJS.Timeout;
        if (autoRefresh) {
            interval = setInterval(() => {
                loadMLData();
            }, 10000); // 10초마다 새로고침
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [userId, autoRefresh]);

    const loadMLData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // 사용자 프로필 로드
            const profileResponse = await advancedMessageAPI.getUserMLProfile(userId);
            if (profileResponse.success && profileResponse.profile) {
                setUserProfile(profileResponse.profile);
            }

            // 모든 사용자 프로필 로드
            const allProfilesResponse = await advancedMessageAPI.getAllUserMLProfiles();
            if (allProfilesResponse.success && allProfilesResponse.profiles) {
                const profilesMap: Record<string, UserProfile> = {};
                allProfilesResponse.profiles.forEach((profile: UserProfile) => {
                    profilesMap[profile.user_id] = profile;
                });
                setAllProfiles(profilesMap);
            }

            // 시스템 통계 로드
            const statsResponse = await advancedMessageAPI.getMLSystemStats();
            if (statsResponse.success && statsResponse.stats) {
                setSystemStats(statsResponse.stats);
            }

        } catch (err) {
            console.error('ML 데이터 로드 실패:', err);
            setError('ML 데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const testPredictions = async () => {
        if (!testMessage.trim()) return;

        try {
            const context = { user_id: userId };

            // 참여도 예측
            const engagementResponse = await advancedMessageAPI.predictUserEngagement(testMessage, JSON.stringify(context));
            if (engagementResponse.success && engagementResponse.prediction) {
                setEngagementPrediction(engagementResponse.prediction);
            }

            // 응답 시간 예측
            const responseTimeResponse = await advancedMessageAPI.predictResponseTime(testMessage, JSON.stringify(context));
            if (responseTimeResponse.success && responseTimeResponse.prediction) {
                setResponseTimePrediction(responseTimeResponse.prediction);
            }

            // 개인화된 응답 스타일
            const styleResponse = await advancedMessageAPI.getPersonalizedResponse(testMessage, JSON.stringify(context));
            if (styleResponse.success && styleResponse.personalized_style) {
                setPersonalizedStyle(styleResponse.personalized_style);
            }

        } catch (err) {
            console.error('예측 테스트 실패:', err);
            setError('예측 테스트 중 오류가 발생했습니다.');
        }
    };

    const clearUserData = async () => {
        if (window.confirm('사용자 ML 데이터를 삭제하시겠습니까?')) {
            try {
                await advancedMessageAPI.clearUserMLData(userId);
                alert('사용자 ML 데이터가 삭제되었습니다.');
                setUserProfile(null);
                setEngagementPrediction(null);
                setResponseTimePrediction(null);
                setPersonalizedStyle(null);
            } catch (err) {
                console.error('사용자 데이터 삭제 실패:', err);
                alert('사용자 데이터 삭제 중 오류가 발생했습니다.');
            }
        }
    };

    const getTraitColor = (value: number) => {
        if (value > 0.7) return '#4CAF50';
        if (value > 0.4) return '#FF9800';
        return '#F44336';
    };

    const getStyleColor = (value: number) => {
        if (value > 0.6) return '#2196F3';
        if (value > 0.3) return '#FF9800';
        return '#9E9E9E';
    };

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleString();
    };

    if (isLoading) {
        return (
            <div className="advanced-ml-dashboard">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>ML 데이터를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="advanced-ml-dashboard">
                <div className="error-message">
                    <span>❌ {error}</span>
                    <button onClick={loadMLData}>다시 시도</button>
                </div>
            </div>
        );
    }

    return (
        <div className="advanced-ml-dashboard">
            <div className="dashboard-header">
                <h3>🤖 고급 ML 대시보드</h3>
                <div className="header-controls">
                    <label className="auto-refresh-toggle">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                        />
                        <span>자동 새로고침</span>
                    </label>
                    <button onClick={loadMLData} className="refresh-btn">
                        🔄 새로고침
                    </button>
                    <button onClick={clearUserData} className="clear-btn">
                        🗑️ 데이터 삭제
                    </button>
                </div>
            </div>

            {/* 시스템 통계 */}
            {systemStats && (
                <div className="system-stats-section">
                    <h4>📊 ML 시스템 통계</h4>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <span className="stat-icon">👥</span>
                            <span className="stat-value">{systemStats.total_users}</span>
                            <span className="stat-label">총 사용자</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-icon">🧠</span>
                            <span className="stat-value">{systemStats.total_models}</span>
                            <span className="stat-label">총 모델</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-icon">⏰</span>
                            <span className="stat-value">{systemStats.avg_profile_age.toFixed(1)}h</span>
                            <span className="stat-label">평균 프로필 나이</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-icon">📈</span>
                            <span className="stat-value">{Object.keys(systemStats.model_accuracy).length}</span>
                            <span className="stat-label">활성 모델</span>
                        </div>
                    </div>
                </div>
            )}

            {/* 예측 테스트 섹션 */}
            <div className="prediction-test-section">
                <h4>🔮 예측 테스트</h4>
                <div className="test-input">
                    <textarea
                        value={testMessage}
                        onChange={(e) => setTestMessage(e.target.value)}
                        placeholder="테스트할 메시지를 입력하세요..."
                        rows={3}
                    />
                    <button onClick={testPredictions} className="test-btn">
                        🚀 예측 실행
                    </button>
                </div>

                {/* 예측 결과들 */}
                <div className="prediction-results">
                    {engagementPrediction && (
                        <div className="prediction-card">
                            <h5>📈 참여도 예측</h5>
                            <div className="prediction-content">
                                <div className="prediction-value">
                                    <span className="label">예측 참여도:</span>
                                    <span className="value">{(engagementPrediction.predicted_engagement! * 100).toFixed(1)}%</span>
                                </div>
                                <div className="prediction-confidence">
                                    <span className="label">신뢰도:</span>
                                    <span className="value">{(engagementPrediction.confidence * 100).toFixed(1)}%</span>
                                </div>
                                <div className="prediction-factors">
                                    <span className="label">주요 요인:</span>
                                    <div className="factors-list">
                                        {engagementPrediction.factors.map((factor, index) => (
                                            <span key={index} className="factor-tag">
                                                {factor[0]}: {factor[1].toFixed(2)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {responseTimePrediction && (
                        <div className="prediction-card">
                            <h5>⏱️ 응답 시간 예측</h5>
                            <div className="prediction-content">
                                <div className="prediction-value">
                                    <span className="label">예측 시간:</span>
                                    <span className="value">{responseTimePrediction.predicted_time!.toFixed(1)}초</span>
                                </div>
                                <div className="prediction-confidence">
                                    <span className="label">신뢰도:</span>
                                    <span className="value">{(responseTimePrediction.confidence * 100).toFixed(1)}%</span>
                                </div>
                                <div className="prediction-factors">
                                    <span className="label">주요 요인:</span>
                                    <div className="factors-list">
                                        {responseTimePrediction.factors.map((factor, index) => (
                                            <span key={index} className="factor-tag">
                                                {factor[0]}: {factor[1].toFixed(1)}초
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {personalizedStyle && (
                        <div className="prediction-card">
                            <h5>🎨 개인화된 응답 스타일</h5>
                            <div className="prediction-content">
                                <div className="style-item">
                                    <span className="label">응답 스타일:</span>
                                    <span className="value style-tag">{personalizedStyle.response_style}</span>
                                </div>
                                <div className="style-item">
                                    <span className="label">톤:</span>
                                    <span className="value tone-tag">{personalizedStyle.tone}</span>
                                </div>
                                <div className="style-item">
                                    <span className="label">길이:</span>
                                    <span className="value length-tag">{personalizedStyle.length}</span>
                                </div>
                                <div className="style-item">
                                    <span className="label">고려된 감정:</span>
                                    <span className="value emotion-tag">{personalizedStyle.emotion_consideration}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 사용자 프로필 */}
            {userProfile && (
                <div className="user-profile-section">
                    <h4>👤 사용자 프로필</h4>

                    {/* 성격 특성 */}
                    <div className="profile-section">
                        <h5>🧠 성격 특성</h5>
                        <div className="traits-grid">
                            {Object.entries(userProfile.personality_traits).map(([trait, value]) => (
                                <div key={trait} className="trait-item">
                                    <span className="trait-name">{trait}</span>
                                    <div className="trait-bar">
                                        <div
                                            className="trait-fill"
                                            style={{
                                                width: `${value * 100}%`,
                                                backgroundColor: getTraitColor(value)
                                            }}
                                        ></div>
                                    </div>
                                    <span className="trait-value">{(value * 100).toFixed(1)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 의사소통 스타일 */}
                    <div className="profile-section">
                        <h5>💬 의사소통 스타일</h5>
                        <div className="style-grid">
                            {Object.entries(userProfile.communication_style).map(([style, value]) => (
                                <div key={style} className="style-item">
                                    <span className="style-name">{style}</span>
                                    <div className="style-bar">
                                        <div
                                            className="style-fill"
                                            style={{
                                                width: `${value * 100}%`,
                                                backgroundColor: getStyleColor(value)
                                            }}
                                        ></div>
                                    </div>
                                    <span className="style-value">{(value * 100).toFixed(1)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 감정 패턴 */}
                    <div className="profile-section">
                        <h5>😊 감정 패턴</h5>
                        <div className="emotion-grid">
                            {Object.entries(userProfile.emotion_patterns).map(([emotion, value]) => (
                                <div key={emotion} className="emotion-item">
                                    <span className="emotion-name">{emotion}</span>
                                    <div className="emotion-bar">
                                        <div
                                            className="emotion-fill"
                                            style={{
                                                width: `${value * 100}%`,
                                                backgroundColor: getTraitColor(value)
                                            }}
                                        ></div>
                                    </div>
                                    <span className="emotion-value">{(value * 100).toFixed(1)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 주제 선호도 */}
                    <div className="profile-section">
                        <h5>📚 주제 선호도</h5>
                        <div className="topic-grid">
                            {Object.entries(userProfile.topic_preferences).map(([topic, value]) => (
                                <div key={topic} className="topic-item">
                                    <span className="topic-name">{topic}</span>
                                    <div className="topic-bar">
                                        <div
                                            className="topic-fill"
                                            style={{
                                                width: `${value * 100}%`,
                                                backgroundColor: getStyleColor(value)
                                            }}
                                        ></div>
                                    </div>
                                    <span className="topic-value">{(value * 100).toFixed(1)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 학습 히스토리 */}
                    <div className="profile-section">
                        <h5>📖 학습 히스토리</h5>
                        <div className="learning-history">
                            {userProfile.learning_history.slice(-5).map((record, index) => (
                                <div key={index} className="history-item">
                                    <span className="history-time">{formatTimestamp(record.timestamp)}</span>
                                    <span className="history-count">대화 {record.conversation_count}개</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 모든 사용자 프로필 요약 */}
            {Object.keys(allProfiles).length > 0 && (
                <div className="all-profiles-section">
                    <h4>👥 모든 사용자 요약</h4>
                    <div className="profiles-summary">
                        <div className="summary-stat">
                            <span className="label">총 사용자:</span>
                            <span className="value">{Object.keys(allProfiles).length}명</span>
                        </div>
                        <div className="summary-stat">
                            <span className="label">평균 학습 기록:</span>
                            <span className="value">
                                {Object.values(allProfiles).reduce((sum, profile) =>
                                    sum + profile.learning_history.length, 0) / Object.keys(allProfiles).length}개
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {!userProfile && !systemStats && (
                <div className="no-data">
                    <p>🤖 ML 데이터가 없습니다.</p>
                    <p>AI와 대화를 시작하면 개인화된 ML 모델이 학습됩니다!</p>
                </div>
            )}
        </div>
    );
};

export default AdvancedMLDashboard; 