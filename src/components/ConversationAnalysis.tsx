import React, { useState, useEffect } from 'react';
import { advancedMessageAPI } from '../services/advancedMessageAPI';
import './ConversationAnalysis.css';

interface ConversationAnalysisProps {
  userId?: string;
  conversationId?: string;
}

interface AnalysisData {
  basic_stats?: {
    total_messages: number;
    avg_length: number;
    duration_seconds: number;
    messages_per_minute: number;
  };
  emotion_analysis?: {
    emotion_distribution: Record<string, number>;
    dominant_emotion: string;
    emotion_stability: number;
  };
  language_analysis?: {
    language_distribution: Record<string, number>;
    dominant_language: string;
    language_switches: number;
  };
  interaction_patterns?: {
    avg_response_time: number;
    turn_taking: Record<string, number>;
    engagement_level: string;
  };
  topic_analysis?: {
    topic_distribution: Record<string, number>;
    dominant_topic: string;
    topic_changes: number;
  };
  quality_metrics?: {
    quality_score: number;
    avg_length: number;
    emotion_diversity: number;
    response_consistency: number;
    suggestions: string[];
  };
}

const ConversationAnalysis: React.FC<ConversationAnalysisProps> = ({
  userId = "default",
  conversationId
}) => {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalysisData();
  }, [conversationId, userId]);

  const loadAnalysisData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 대화 분석 데이터 로드
      if (conversationId) {
        const analysisResponse = await advancedMessageAPI.getConversationAnalysis(conversationId);
        if (analysisResponse.success && analysisResponse.analysis) {
          setAnalysisData(analysisResponse.analysis);
        }
      }

      // 사용자 프로필 로드
      const profileResponse = await advancedMessageAPI.getUserConversationProfile(userId);
      if (profileResponse.success && profileResponse.user_profile) {
        setUserProfile(profileResponse.user_profile);
      }

    } catch (err) {
      console.error('분석 데이터 로드 실패:', err);
      setError('분석 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = async () => {
    if (window.confirm('모든 대화 분석 데이터를 초기화하시겠습니까?')) {
      try {
        await advancedMessageAPI.clearConversationData();
        setAnalysisData(null);
        setUserProfile(null);
        alert('대화 분석 데이터가 초기화되었습니다.');
      } catch (err) {
        console.error('데이터 초기화 실패:', err);
        alert('데이터 초기화 중 오류가 발생했습니다.');
      }
    }
  };

  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      positive: '#4CAF50',
      negative: '#F44336',
      neutral: '#9E9E9E',
      question: '#2196F3',
      request: '#FF9800'
    };
    return colors[emotion] || '#9E9E9E';
  };

  const getEngagementColor = (level: string) => {
    const colors: Record<string, string> = {
      high: '#4CAF50',
      medium: '#FF9800',
      low: '#F44336'
    };
    return colors[level] || '#9E9E9E';
  };

  if (isLoading) {
    return (
      <div className="conversation-analysis">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>분석 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="conversation-analysis">
        <div className="error-message">
          <span>❌ {error}</span>
          <button onClick={loadAnalysisData}>다시 시도</button>
        </div>
      </div>
    );
  }

  return (
    <div className="conversation-analysis">
      <div className="analysis-header">
        <h3>📊 대화 분석 결과</h3>
        <div className="header-actions">
          <button onClick={loadAnalysisData} className="refresh-btn">
            🔄 새로고침
          </button>
          <button onClick={handleClearData} className="clear-btn">
            🗑️ 데이터 초기화
          </button>
        </div>
      </div>

      {userProfile && (
        <div className="user-profile-section">
          <h4>👤 사용자 프로필</h4>
          <div className="profile-grid">
            <div className="profile-item">
              <span className="label">총 대화 수:</span>
              <span className="value">{userProfile.conversations}</span>
            </div>
            <div className="profile-item">
              <span className="label">총 메시지 수:</span>
              <span className="value">{userProfile.total_messages}</span>
            </div>
            <div className="profile-item">
              <span className="label">평균 메시지/대화:</span>
              <span className="value">{userProfile.avg_messages_per_conversation}</span>
            </div>
            <div className="profile-item">
              <span className="label">선호 감정:</span>
              <span className="value emotion-tag" style={{ backgroundColor: getEmotionColor(userProfile.preferred_emotion) }}>
                {userProfile.preferred_emotion}
              </span>
            </div>
            <div className="profile-item">
              <span className="label">평균 품질 점수:</span>
              <span className="value">{userProfile.avg_quality_score}/100</span>
            </div>
          </div>
        </div>
      )}

      {analysisData && (
        <div className="analysis-sections">
          {/* 기본 통계 */}
          {analysisData.basic_stats && (
            <div className="analysis-section">
              <h4>📈 기본 통계</h4>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-value">{analysisData.basic_stats.total_messages}</span>
                  <span className="stat-label">총 메시지</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{analysisData.basic_stats.avg_length.toFixed(1)}</span>
                  <span className="stat-label">평균 길이</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{analysisData.basic_stats.duration_seconds.toFixed(1)}s</span>
                  <span className="stat-label">대화 시간</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{analysisData.basic_stats.messages_per_minute.toFixed(1)}</span>
                  <span className="stat-label">메시지/분</span>
                </div>
              </div>
            </div>
          )}

          {/* 감정 분석 */}
          {analysisData.emotion_analysis && (
            <div className="analysis-section">
              <h4>😊 감정 분석</h4>
              <div className="emotion-analysis">
                <div className="dominant-emotion">
                  <span className="label">주요 감정:</span>
                  <span
                    className="emotion-tag"
                    style={{ backgroundColor: getEmotionColor(analysisData.emotion_analysis.dominant_emotion) }}
                  >
                    {analysisData.emotion_analysis.dominant_emotion}
                  </span>
                </div>
                <div className="emotion-distribution">
                  <span className="label">감정 분포:</span>
                  <div className="emotion-bars">
                    {Object.entries(analysisData.emotion_analysis.emotion_distribution).map(([emotion, count]) => (
                      <div key={emotion} className="emotion-bar">
                        <span className="emotion-name">{emotion}</span>
                        <div className="bar-container">
                          <div
                            className="bar"
                            style={{
                              width: `${(count / Math.max(...Object.values(analysisData.emotion_analysis?.emotion_distribution || {}))) * 100}%`,
                              backgroundColor: getEmotionColor(emotion)
                            }}
                          ></div>
                        </div>
                        <span className="count">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="stability-score">
                  <span className="label">감정 안정성:</span>
                  <span className="value">{((analysisData.emotion_analysis?.emotion_stability || 0) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )}

          {/* 상호작용 패턴 */}
          {analysisData.interaction_patterns && (
            <div className="analysis-section">
              <h4>🔄 상호작용 패턴</h4>
              <div className="interaction-patterns">
                <div className="pattern-item">
                  <span className="label">평균 응답 시간:</span>
                  <span className="value">{analysisData.interaction_patterns.avg_response_time.toFixed(1)}초</span>
                </div>
                <div className="pattern-item">
                  <span className="label">참여도 레벨:</span>
                  <span
                    className="engagement-tag"
                    style={{ backgroundColor: getEngagementColor(analysisData.interaction_patterns.engagement_level) }}
                  >
                    {analysisData.interaction_patterns.engagement_level}
                  </span>
                </div>
                <div className="turn-taking">
                  <span className="label">턴 테이킹:</span>
                  <div className="turn-distribution">
                    {Object.entries(analysisData.interaction_patterns.turn_taking).map(([speaker, count]) => (
                      <div key={speaker} className="turn-item">
                        <span className="speaker">{speaker}</span>
                        <span className="count">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 품질 지표 */}
          {analysisData.quality_metrics && (
            <div className="analysis-section">
              <h4>⭐ 품질 지표</h4>
              <div className="quality-metrics">
                <div className="quality-score">
                  <span className="label">전체 품질 점수:</span>
                  <span className="score">{analysisData.quality_metrics.quality_score}/100</span>
                </div>
                <div className="quality-details">
                  <div className="quality-item">
                    <span className="label">감정 다양성:</span>
                    <span className="value">{(analysisData.quality_metrics.emotion_diversity * 100).toFixed(1)}%</span>
                  </div>
                  <div className="quality-item">
                    <span className="label">응답 일관성:</span>
                    <span className="value">{(analysisData.quality_metrics.response_consistency * 100).toFixed(1)}%</span>
                  </div>
                </div>
                {analysisData.quality_metrics.suggestions.length > 0 && (
                  <div className="suggestions">
                    <span className="label">개선 제안:</span>
                    <ul className="suggestion-list">
                      {analysisData.quality_metrics.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {!analysisData && !userProfile && (
        <div className="no-data">
          <p>📊 분석할 대화 데이터가 없습니다.</p>
          <p>AI와 대화를 시작해보세요!</p>
        </div>
      )}
    </div>
  );
};

export default ConversationAnalysis; 