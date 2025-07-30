import React, { useState, useEffect } from 'react';

const AdvancedAIAnalytics: React.FC = () => {
    const [analytics, setAnalytics] = useState({
        sentiment: { positive: 45, negative: 15, neutral: 40 },
        topics: ['시공사 선정', '분담금', '설계 변경', '이주 일정'],
        responseTime: 245,
        accuracy: 87.5
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setAnalytics(prev => ({
                ...prev,
                responseTime: Math.floor(Math.random() * 200) + 150,
                accuracy: Math.floor(Math.random() * 10) + 85
            }));
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="advanced-ai-analytics">
            <div className="analytics-header">
                <h2>📈 AI 분석</h2>
                <p>고급 AI 분석 및 인사이트</p>
            </div>

            <div className="analytics-grid">
                <div className="analytics-card">
                    <h3>감정 분석</h3>
                    <div className="sentiment-chart">
                        <div className="sentiment-item positive">
                            <span>긍정</span>
                            <div className="bar" style={{ width: `${analytics.sentiment.positive}%` }}></div>
                            <span>{analytics.sentiment.positive}%</span>
                        </div>
                        <div className="sentiment-item neutral">
                            <span>중립</span>
                            <div className="bar" style={{ width: `${analytics.sentiment.neutral}%` }}></div>
                            <span>{analytics.sentiment.neutral}%</span>
                        </div>
                        <div className="sentiment-item negative">
                            <span>부정</span>
                            <div className="bar" style={{ width: `${analytics.sentiment.negative}%` }}></div>
                            <span>{analytics.sentiment.negative}%</span>
                        </div>
                    </div>
                </div>

                <div className="analytics-card">
                    <h3>주요 토픽</h3>
                    <div className="topics-list">
                        {analytics.topics.map((topic, index) => (
                            <div key={index} className="topic-item">
                                <span className="topic-name">{topic}</span>
                                <span className="topic-count">{Math.floor(Math.random() * 50) + 10}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="analytics-card">
                    <h3>성능 지표</h3>
                    <div className="performance-metrics">
                        <div className="metric">
                            <span>응답 시간</span>
                            <span>{analytics.responseTime}ms</span>
                        </div>
                        <div className="metric">
                            <span>정확도</span>
                            <span>{analytics.accuracy}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvancedAIAnalytics; 