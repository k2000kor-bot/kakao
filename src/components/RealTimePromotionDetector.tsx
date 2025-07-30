import React, { useState, useEffect } from 'react';

interface PromotionDetection {
    detected: boolean;
    promotion_type: string;
    company_mentioned: string;
    confidence_score: number;
    keywords_found: string[];
    promotion_logic: string;
    sentiment_score: number;
    risk_level: string;
    sender_id: string;
    timestamp: string;
    content: string;
}

interface PromotionAnalysis {
    total_promotions: number;
    promotions_by_company: Record<string, number>;
    promotions_by_type: Record<string, number>;
    recent_promotions: Array<{
        sender_id: string;
        timestamp: string;
        content: string;
        promotion_type: string;
        company_mentioned: string;
        confidence_score: number;
    }>;
    top_promoters: string[];
    promotion_trend: string;
    risk_level: string;
    alerts: Array<{
        type: string;
        message: string;
        severity: string;
        timestamp: string;
    }>;
}

interface RealTimePromotionDetectorProps {
    selectedRoomId: string;
}

const RealTimePromotionDetector: React.FC<RealTimePromotionDetectorProps> = ({ selectedRoomId }) => {
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [detectionResult, setDetectionResult] = useState<PromotionDetection | null>(null);
    const [analysisResult, setAnalysisResult] = useState<PromotionAnalysis | null>(null);
    const [testMessage, setTestMessage] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'monitor' | 'analysis' | 'alerts'>('monitor');

    // 실시간 모니터링 시작/중지
    const toggleMonitoring = () => {
        setIsMonitoring(!isMonitoring);
        if (!isMonitoring) {
            // 실시간 분석 결과 가져오기
            fetchAnalysisResult();
        }
    };

    // 테스트 메시지로 홍보 논리 감지
    const testPromotionDetection = async () => {
        if (!testMessage.trim()) {
            setError('테스트 메시지를 입력해주세요.');
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/v7/realtime/promotion-detection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    room_id: selectedRoomId,
                    message: {
                        content: testMessage,
                        sender_id: 'test_user',
                        timestamp: new Date().toISOString()
                    }
                })
            });

            if (response.ok) {
                const data = await response.json();
                setDetectionResult(data.detection);
                setError('');
            } else {
                throw new Error('감지 실패');
            }
        } catch (error) {
            console.error('홍보 논리 감지 실패:', error);
            setError('홍보 논리 감지 중 오류가 발생했습니다.');
        }
    };

    // 실시간 분석 결과 가져오기
    const fetchAnalysisResult = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/v7/realtime/promotion-analysis?room_id=${selectedRoomId}`);

            if (response.ok) {
                const data = await response.json();
                setAnalysisResult(data.analysis);
            } else {
                throw new Error('분석 실패');
            }
        } catch (error) {
            console.error('실시간 분석 실패:', error);
            setError('실시간 분석 중 오류가 발생했습니다.');
        }
    };

    // 주기적으로 분석 결과 업데이트
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isMonitoring) {
            fetchAnalysisResult();
            interval = setInterval(fetchAnalysisResult, 30000); // 30초마다 업데이트
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isMonitoring, selectedRoomId]);

    const getConfidenceColor = (score: number) => {
        if (score >= 0.8) return 'text-green-600 bg-green-100';
        if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case '높음': return 'text-red-600 bg-red-100';
            case '중간': return 'text-yellow-600 bg-yellow-100';
            case '낮음': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getAlertColor = (severity: string) => {
        switch (severity) {
            case 'warning': return 'border-yellow-500 bg-yellow-50';
            case 'error': return 'border-red-500 bg-red-50';
            case 'info': return 'border-blue-500 bg-blue-50';
            default: return 'border-gray-500 bg-gray-50';
        }
    };

    return (
        <div className="realtime-promotion-detector">
            <div className="detector-header">
                <h2>
                    <span className="header-icon">🔍</span>
                    실시간 홍보 논리 감지 시스템
                </h2>
                <p className="subtitle">대화 중에 올라오는 홍보 논리를 실시간으로 파악</p>
            </div>

            <div className="detector-controls">
                <button
                    onClick={toggleMonitoring}
                    className={`monitor-btn ${isMonitoring ? 'monitoring' : ''}`}
                >
                    {isMonitoring ? '🛑 모니터링 중지' : '▶️ 실시간 모니터링 시작'}
                </button>

                <div className="test-section">
                    <h3>테스트 메시지로 홍보 논리 감지</h3>
                    <div className="test-input">
                        <textarea
                            value={testMessage}
                            onChange={(e) => setTestMessage(e.target.value)}
                            placeholder="홍보 논리가 포함된 메시지를 입력하세요..."
                            className="test-textarea"
                            rows={3}
                        />
                        <button
                            onClick={testPromotionDetection}
                            disabled={!testMessage.trim()}
                            className="test-btn"
                        >
                            홍보 논리 감지 테스트
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    ❌ {error}
                </div>
            )}

            {/* 탭 네비게이션 */}
            <div className="tab-navigation">
                <button
                    className={`tab-btn ${activeTab === 'monitor' ? 'active' : ''}`}
                    onClick={() => setActiveTab('monitor')}
                >
                    📊 실시간 모니터링
                </button>
                <button
                    className={`tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
                    onClick={() => setActiveTab('analysis')}
                >
                    📈 분석 결과
                </button>
                <button
                    className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('alerts')}
                >
                    ⚠️ 알림 및 경고
                </button>
            </div>

            {/* 실시간 모니터링 탭 */}
            {activeTab === 'monitor' && (
                <div className="monitor-tab">
                    <div className="monitor-status">
                        <h3>모니터링 상태</h3>
                        <div className="status-indicator">
                            <span className={`status-dot ${isMonitoring ? 'active' : 'inactive'}`}></span>
                            <span className="status-text">
                                {isMonitoring ? '실시간 모니터링 중...' : '모니터링 중지됨'}
                            </span>
                        </div>
                    </div>

                    {detectionResult && (
                        <div className="detection-result">
                            <h3>최근 감지된 홍보 논리</h3>
                            <div className="detection-card">
                                <div className="detection-header">
                                    <h4>감지 결과</h4>
                                    <span className={`confidence-badge ${getConfidenceColor(detectionResult.confidence_score)}`}>
                                        신뢰도: {(detectionResult.confidence_score * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="detection-details">
                                    <div className="detail-item">
                                        <span className="label">홍보 유형:</span>
                                        <span className="value">{detectionResult.promotion_type}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">언급된 시공사:</span>
                                        <span className="value">{detectionResult.company_mentioned}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">발신자:</span>
                                        <span className="value">{detectionResult.sender_id}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">감정 점수:</span>
                                        <span className="value">{detectionResult.sentiment_score.toFixed(2)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">위험도:</span>
                                        <span className={`value ${getRiskColor(detectionResult.risk_level)}`}>
                                            {detectionResult.risk_level}
                                        </span>
                                    </div>
                                </div>
                                <div className="detection-content">
                                    <h5>감지된 메시지:</h5>
                                    <p className="message-content">{detectionResult.content}</p>
                                </div>
                                <div className="keywords-found">
                                    <h5>발견된 키워드:</h5>
                                    <div className="keyword-tags">
                                        {detectionResult.keywords_found.map((keyword, index) => (
                                            <span key={index} className="keyword-tag">{keyword}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="promotion-logic">
                                    <h5>홍보 논리:</h5>
                                    <p>{detectionResult.promotion_logic}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* 분석 결과 탭 */}
            {activeTab === 'analysis' && analysisResult && (
                <div className="analysis-tab">
                    <div className="analysis-overview">
                        <h3>홍보 논리 분석 개요</h3>
                        <div className="overview-stats">
                            <div className="stat-card">
                                <div className="stat-number">{analysisResult.total_promotions}</div>
                                <div className="stat-label">총 감지된 홍보</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-number">{analysisResult.promotion_trend}</div>
                                <div className="stat-label">홍보 트렌드</div>
                            </div>
                            <div className="stat-card">
                                <div className={`stat-number ${getRiskColor(analysisResult.risk_level)}`}>
                                    {analysisResult.risk_level}
                                </div>
                                <div className="stat-label">위험도</div>
                            </div>
                        </div>
                    </div>

                    <div className="company-analysis">
                        <h4>시공사별 홍보 분석</h4>
                        <div className="company-chart">
                            {Object.entries(analysisResult.promotions_by_company).map(([company, count]) => (
                                <div key={company} className="company-bar">
                                    <span className="company-name">{company}</span>
                                    <div className="bar-container">
                                        <div
                                            className="bar-fill"
                                            style={{ width: `${(count / Math.max(...Object.values(analysisResult.promotions_by_company))) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="count">{count}회</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="type-analysis">
                        <h4>홍보 유형별 분석</h4>
                        <div className="type-grid">
                            {Object.entries(analysisResult.promotions_by_type).map(([type, count]) => (
                                <div key={type} className="type-card">
                                    <h5>{type}</h5>
                                    <div className="type-count">{count}회</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="recent-promotions">
                        <h4>최근 감지된 홍보 논리</h4>
                        <div className="promotions-list">
                            {analysisResult.recent_promotions.map((promotion, index) => (
                                <div key={index} className="promotion-item">
                                    <div className="promotion-header">
                                        <span className="sender">{promotion.sender_id}</span>
                                        <span className="timestamp">{new Date(promotion.timestamp).toLocaleString()}</span>
                                        <span className={`confidence ${getConfidenceColor(promotion.confidence_score)}`}>
                                            {(promotion.confidence_score * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="promotion-content">{promotion.content}</div>
                                    <div className="promotion-meta">
                                        <span className="type">{promotion.promotion_type}</span>
                                        <span className="company">{promotion.company_mentioned}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="top-promoters">
                        <h4>상위 홍보자</h4>
                        <div className="promoters-list">
                            {analysisResult.top_promoters.map((promoter, index) => (
                                <div key={index} className="promoter-item">
                                    <span className="rank">{index + 1}</span>
                                    <span className="promoter-id">{promoter}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 알림 및 경고 탭 */}
            {activeTab === 'alerts' && analysisResult && (
                <div className="alerts-tab">
                    <h3>알림 및 경고</h3>
                    <div className="alerts-list">
                        {analysisResult.alerts.map((alert, index) => (
                            <div key={index} className={`alert-item ${getAlertColor(alert.severity)}`}>
                                <div className="alert-header">
                                    <span className={`alert-type ${alert.severity}`}>
                                        {alert.severity === 'warning' ? '⚠️' :
                                            alert.severity === 'error' ? '🚨' : 'ℹ️'}
                                        {alert.type}
                                    </span>
                                    <span className="alert-time">
                                        {new Date(alert.timestamp).toLocaleString()}
                                    </span>
                                </div>
                                <div className="alert-message">{alert.message}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!analysisResult && !detectionResult && (
                <div className="empty-state">
                    <div className="empty-icon">🔍</div>
                    <h3>실시간 홍보 논리 감지를 시작해보세요</h3>
                    <p>모니터링을 시작하거나 테스트 메시지를 입력하여 홍보 논리를 감지해보세요.</p>
                    <div className="features-list">
                        <h4>주요 기능:</h4>
                        <ul>
                            <li>실시간 홍보 논리 감지</li>
                            <li>시공사별 홍보 분석</li>
                            <li>홍보 유형별 분류</li>
                            <li>위험도 평가</li>
                            <li>알림 및 경고 시스템</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RealTimePromotionDetector; 