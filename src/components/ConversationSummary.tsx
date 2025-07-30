import React, { useState, useEffect } from 'react';

interface ConversationSummaryProps {
    selectedRoomId: string;
}

interface ContextAnalysis {
    situation_type: string;
    urgency_level: string;
    participants_involved: string[];
    power_dynamics: string;
    conflict_escalation?: boolean;
    communication_breakdown?: boolean;
    trust_erosion?: boolean;
}

interface SentimentAnalysis {
    overall_sentiment: string;
    sentiment_score: number;
    emotion_distribution: Record<string, number>;
}

interface TopicClassification {
    primary_topic: string;
    sub_topics: string[];
    keyword_frequency: Record<string, number>;
}

interface SummarySection {
    title: string;
    context_analysis: ContextAnalysis;
    key_points: string[];
    sentiment_analysis: SentimentAnalysis;
    topic_classification: TopicClassification;
    summary: string;
    action_items: string[];
}

interface OverallAnalysis {
    total_conflicts: number;
    escalation_level: string;
    communication_health: string;
    trust_level: string;
    recommended_actions: string[];
}

interface SummaryData {
    room_name: string;
    period: string;
    total_messages: number;
    active_participants: number;
    analysis_metadata: {
        analysis_type: string;
        analysis_engine: string;
        context_aware: boolean;
        keyword_extraction: boolean;
        sentiment_analysis: boolean;
        topic_classification: boolean;
    };
    summary_sections: SummarySection[];
    overall_analysis: OverallAnalysis;
    generated_at: string;
}

const ConversationSummary: React.FC<ConversationSummaryProps> = ({ selectedRoomId }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [chatRooms, setChatRooms] = useState<any[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<any>(null);
    const [activeSection, setActiveSection] = useState<number | null>(null);

    // 채팅방 목록 가져오기
    useEffect(() => {
        const fetchChatRooms = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/v7/chat-rooms/detailed');
                if (response.ok) {
                    const data = await response.json();
                    setChatRooms(data.chat_rooms);
                    const currentRoom = data.chat_rooms.find((room: any) => room.id === selectedRoomId);
                    setSelectedRoom(currentRoom);
                }
            } catch (error) {
                console.error('채팅방 목록 가져오기 실패:', error);
            }
        };

        fetchChatRooms();
    }, [selectedRoomId]);

    // 대화 요약 생성
    const generateSummary = async () => {
        if (!startDate || !endDate) {
            setError('시작일과 종료일을 모두 선택해주세요.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8000/api/v7/conversation/summary', {
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
                setSummaryData(data.summary);
            } else {
                throw new Error('요약 생성 실패');
            }
        } catch (error) {
            console.error('대화 요약 생성 실패:', error);
            setError('대화 요약 생성 중 오류가 발생했습니다.');
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

    return (
        <div className="conversation-summary">
            <div className="summary-header">
                <h2>
                    <span className="header-icon">📊</span>
                    실무용 대화 요약 생성
                </h2>
                <div className="room-info">
                    {selectedRoom && (
                        <div className="room-details">
                            <span className="room-name">{selectedRoom.name}</span>
                            <span className="participants">참여자: {selectedRoom.participants}명</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="summary-controls">
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
                    onClick={generateSummary}
                    disabled={isLoading || !startDate || !endDate}
                    className="generate-summary-btn"
                >
                    {isLoading ? '요약 생성 중...' : '실무용 대화 요약 생성'}
                </button>
            </div>

            {error && (
                <div className="error-message">
                    ❌ {error}
                </div>
            )}

            {summaryData && (
                <div className="summary-content">
                    <div className="summary-header-info">
                        <h3>{summaryData.room_name}</h3>
                        <p className="period">{summaryData.period}</p>
                        <div className="summary-stats">
                            <span>총 메시지: {summaryData.total_messages}개</span>
                            <span>활성 참여자: {summaryData.active_participants}명</span>
                        </div>

                        {/* 분석 메타데이터 */}
                        <div className="analysis-metadata">
                            <h4>분석 정보</h4>
                            <div className="metadata-grid">
                                <div className="metadata-item">
                                    <span className="label">분석 타입:</span>
                                    <span className="value">{summaryData.analysis_metadata.analysis_type}</span>
                                </div>
                                <div className="metadata-item">
                                    <span className="label">분석 엔진:</span>
                                    <span className="value">{summaryData.analysis_metadata.analysis_engine}</span>
                                </div>
                                <div className="metadata-item">
                                    <span className="label">맥락 인식:</span>
                                    <span className="value">{summaryData.analysis_metadata.context_aware ? '활성화' : '비활성화'}</span>
                                </div>
                            </div>
                        </div>

                        {/* 전체 분석 */}
                        <div className="overall-analysis">
                            <h4>전체 분석 결과</h4>
                            <div className="overall-stats">
                                <div className="stat-item">
                                    <span className="label">총 갈등:</span>
                                    <span className="value">{summaryData.overall_analysis.total_conflicts}건</span>
                                </div>
                                <div className="stat-item">
                                    <span className="label">갈등 수준:</span>
                                    <span className={`value ${getUrgencyColor(summaryData.overall_analysis.escalation_level)}`}>
                                        {summaryData.overall_analysis.escalation_level}
                                    </span>
                                </div>
                                <div className="stat-item">
                                    <span className="label">커뮤니케이션 상태:</span>
                                    <span className={`value ${getUrgencyColor(summaryData.overall_analysis.communication_health)}`}>
                                        {summaryData.overall_analysis.communication_health}
                                    </span>
                                </div>
                                <div className="stat-item">
                                    <span className="label">신뢰도:</span>
                                    <span className={`value ${getUrgencyColor(summaryData.overall_analysis.trust_level)}`}>
                                        {summaryData.overall_analysis.trust_level}
                                    </span>
                                </div>
                            </div>

                            <div className="recommended-actions">
                                <h5>권장 조치사항</h5>
                                <ul>
                                    {summaryData.overall_analysis.recommended_actions.map((action, index) => (
                                        <li key={index}>{action}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="summary-sections">
                        {summaryData.summary_sections.map((section, index) => (
                            <div key={index} className="summary-section">
                                <div className="section-header" onClick={() => setActiveSection(activeSection === index ? null : index)}>
                                    <h4 className="section-title">{section.title}</h4>
                                    <span className="expand-icon">{activeSection === index ? '▼' : '▶'}</span>
                                </div>

                                {activeSection === index && (
                                    <div className="section-content">
                                        {/* 맥락 분석 */}
                                        <div className="context-analysis">
                                            <h5>맥락 분석</h5>
                                            <div className="context-grid">
                                                <div className="context-item">
                                                    <span className="label">상황 타입:</span>
                                                    <span className="value">{section.context_analysis.situation_type}</span>
                                                </div>
                                                <div className="context-item">
                                                    <span className="label">긴급도:</span>
                                                    <span className={`value ${getUrgencyColor(section.context_analysis.urgency_level)}`}>
                                                        {section.context_analysis.urgency_level}
                                                    </span>
                                                </div>
                                                <div className="context-item">
                                                    <span className="label">참여자:</span>
                                                    <span className="value">{section.context_analysis.participants_involved.join(', ')}</span>
                                                </div>
                                                <div className="context-item">
                                                    <span className="label">권력 구조:</span>
                                                    <span className="value">{section.context_analysis.power_dynamics}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 감정 분석 */}
                                        <div className="sentiment-analysis">
                                            <h5>감정 분석</h5>
                                            <div className="sentiment-info">
                                                <div className="sentiment-overall">
                                                    <span className="label">전체 감정:</span>
                                                    <span className={`value ${getSentimentColor(section.sentiment_analysis.overall_sentiment)}`}>
                                                        {section.sentiment_analysis.overall_sentiment}
                                                    </span>
                                                </div>
                                                <div className="sentiment-score">
                                                    <span className="label">감정 점수:</span>
                                                    <span className="value">{section.sentiment_analysis.sentiment_score.toFixed(2)}</span>
                                                </div>
                                            </div>
                                            <div className="emotion-distribution">
                                                <h6>감정 분포</h6>
                                                <div className="emotion-chart">
                                                    {Object.entries(section.sentiment_analysis.emotion_distribution).map(([emotion, score]) => (
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
                                        </div>

                                        {/* 주제 분류 */}
                                        <div className="topic-classification">
                                            <h5>주제 분류</h5>
                                            <div className="topic-info">
                                                <div className="primary-topic">
                                                    <span className="label">주요 주제:</span>
                                                    <span className="value">{section.topic_classification.primary_topic}</span>
                                                </div>
                                                <div className="sub-topics">
                                                    <span className="label">세부 주제:</span>
                                                    <span className="value">{section.topic_classification.sub_topics.join(', ')}</span>
                                                </div>
                                            </div>
                                            <div className="keyword-frequency">
                                                <h6>키워드 빈도</h6>
                                                <div className="keyword-chart">
                                                    {Object.entries(section.topic_classification.keyword_frequency)
                                                        .sort(([, a], [, b]) => b - a)
                                                        .slice(0, 5)
                                                        .map(([keyword, frequency]) => (
                                                            <div key={keyword} className="keyword-item">
                                                                <span className="keyword-name">{keyword}</span>
                                                                <div className="keyword-bar">
                                                                    <div
                                                                        className="keyword-fill"
                                                                        style={{ width: `${(frequency / Math.max(...Object.values(section.topic_classification.keyword_frequency))) * 100}%` }}
                                                                    ></div>
                                                                </div>
                                                                <span className="keyword-count">{frequency}회</span>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="key-points">
                                            <h5>주요 발언</h5>
                                            <ul>
                                                {section.key_points.map((point, pointIndex) => (
                                                    <li key={pointIndex}>{point}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="section-summary">
                                            <h5>대화 요약</h5>
                                            <p>{section.summary}</p>
                                        </div>

                                        <div className="action-items">
                                            <h5>권장 조치사항</h5>
                                            <ul>
                                                {section.action_items.map((item, itemIndex) => (
                                                    <li key={itemIndex}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="summary-footer">
                        <p className="generated-time">
                            생성 시간: {new Date(summaryData.generated_at).toLocaleString()}
                        </p>
                    </div>
                </div>
            )}

            {!summaryData && !isLoading && (
                <div className="empty-state">
                    <div className="empty-icon">📝</div>
                    <h3>실무용 대화 요약을 생성해보세요</h3>
                    <p>시작일과 종료일을 선택한 후 요약을 생성하세요.</p>
                    <div className="features-list">
                        <h4>주요 기능:</h4>
                        <ul>
                            <li>맥락 인식 분석</li>
                            <li>감정 분석 및 분포</li>
                            <li>주제 분류 및 키워드 추출</li>
                            <li>갈등 수준 평가</li>
                            <li>실무용 권장 조치사항</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConversationSummary; 