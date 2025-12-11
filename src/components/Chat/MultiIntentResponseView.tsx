/**
 * MultiIntentResponseView 컴포넌트
 * 여러 의도를 가진 요청에 대한 응답을 표시
 */

import React, { useState, useMemo } from 'react';
import { errorLogger } from '../../utils/errorLogger';
import './MultiIntentResponseView.css';

export interface MultiIntentResponse {
    index: number;
    type: string;
    prompt: string;
    response: string;
    qualityScore?: number;
    confidence?: number;
    processingTime?: number;
}

interface MultiIntentResponseViewProps {
    /**
     * 요약 정보
     */
    summary?: string;

    /**
     * 응답 목록
     */
    responses: MultiIntentResponse[];

    /**
     * 총 응답 수
     */
    totalResponses: number;

    /**
     * 평균 품질 점수
     */
    averageQuality?: number;

    /**
     * 평균 신뢰도
     */
    averageConfidence?: number;

    /**
     * 총 처리 시간
     */
    totalProcessing?: number;

    /**
     * 액션 상태
     */
    actionStatus?: { key: string; message: string } | null;

    /**
     * 응답 복사 핸들러
     */
    onCopyResponse: (entry: MultiIntentResponse) => Promise<void>;

    /**
     * 프롬프트로 사용 핸들러
     */
    onUseAsPrompt: (entry: MultiIntentResponse) => void;

    /**
     * 후속 액션 핸들러
     */
    onFollowUpAction: (entry: MultiIntentResponse, action: string) => void;

    /**
     * 핀 토글 핸들러
     */
    onPin?: (index: number) => void;

    /**
     * 별표 토글 핸들러
     */
    onStar?: (index: number) => void;

    /**
     * 핀된 인덱스
     */
    pinnedIndices?: Set<number>;

    /**
     * 별표 표시된 인덱스
     */
    starredIndices?: Set<number>;
}

const MultiIntentResponseView: React.FC<MultiIntentResponseViewProps> = ({
    summary,
    responses,
    totalResponses,
    averageQuality,
    averageConfidence,
    totalProcessing,
    actionStatus,
    onCopyResponse,
    onUseAsPrompt,
    onFollowUpAction,
    onPin,
    onStar,
    pinnedIndices = new Set(),
    starredIndices = new Set(),
}) => {
    const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set());

    // 정렬된 응답 (핀된 항목 우선)
    const sortedResponses = useMemo(() => {
        return [...responses].sort((a, b) => {
            const aPinned = pinnedIndices.has(a.index);
            const bPinned = pinnedIndices.has(b.index);

            if (aPinned && !bPinned) return -1;
            if (!aPinned && bPinned) return 1;

            return a.index - b.index;
        });
    }, [responses, pinnedIndices]);

    const toggleExpand = (index: number) => {
        setExpandedIndices((prev) => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

    const handleCopy = async (entry: MultiIntentResponse) => {
        try {
            await onCopyResponse(entry);
        } catch (error) {
            errorLogger.error('복사 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'MultiIntentResponseView',
                action: 'handleCopy',
                entryIndex: entry.index,
            });
        }
    };

    const handlePin = (index: number) => {
        if (onPin) {
            onPin(index);
        }
    };

    const handleStar = (index: number) => {
        if (onStar) {
            onStar(index);
        }
    };

    const getQualityColor = (quality?: number): string => {
        if (!quality) return 'var(--text-secondary, #64748b)';
        if (quality >= 0.8) return 'var(--success-color, #10b981)';
        if (quality >= 0.6) return 'var(--warning-color, #f59e0b)';
        return 'var(--danger-color, #ef4444)';
    };

    const getConfidenceColor = (confidence?: number): string => {
        if (!confidence) return 'var(--text-secondary, #64748b)';
        if (confidence >= 0.8) return 'var(--success-color, #10b981)';
        if (confidence >= 0.6) return 'var(--warning-color, #f59e0b)';
        return 'var(--danger-color, #ef4444)';
    };

    return (
        <div className="multi-intent-response-view">
            {/* 헤더 */}
            <div className="multi-intent-header">
                <h3 className="multi-intent-title">다중 의도 응답</h3>
                <div className="multi-intent-stats">
                    <span className="stat-item">
                        총 {totalResponses}개 응답
                    </span>
                    {averageQuality !== undefined && (
                        <span className="stat-item">
                            평균 품질: {(averageQuality * 100).toFixed(1)}%
                        </span>
                    )}
                    {averageConfidence !== undefined && (
                        <span className="stat-item">
                            평균 신뢰도: {(averageConfidence * 100).toFixed(1)}%
                        </span>
                    )}
                    {totalProcessing !== undefined && (
                        <span className="stat-item">
                            처리 시간: {(totalProcessing / 1000).toFixed(2)}초
                        </span>
                    )}
                </div>
            </div>

            {/* 요약 */}
            {summary && (
                <div className="multi-intent-summary">
                    <p>{summary}</p>
                </div>
            )}

            {/* 액션 상태 */}
            {actionStatus && (
                <div className="multi-intent-action-status">
                    {actionStatus.message}
                </div>
            )}

            {/* 응답 목록 */}
            <div className="multi-intent-responses">
                {sortedResponses.map((entry) => {
                    const isExpanded = expandedIndices.has(entry.index);
                    const isPinned = pinnedIndices.has(entry.index);
                    const isStarred = starredIndices.has(entry.index);

                    return (
                        <div
                            key={entry.index}
                            className={`multi-intent-response-item ${isExpanded ? 'expanded' : ''} ${isPinned ? 'pinned' : ''}`}
                        >
                            {/* 응답 헤더 */}
                            <button
                                type="button"
                                className="multi-intent-response-header"
                                onClick={() => toggleExpand(entry.index)}
                                aria-expanded={isExpanded}
                                aria-label={isExpanded ? '응답 접기' : '응답 펼치기'}
                            >
                                <div className="response-header-left">
                                    <span className="response-index">#{entry.index + 1}</span>
                                    <span className="response-type">{entry.type}</span>
                                    {isPinned && <span className="response-badge pinned">📌</span>}
                                    {isStarred && <span className="response-badge starred">⭐</span>}
                                </div>
                                <div className="response-header-right">
                                    {entry.qualityScore !== undefined && (
                                        <span
                                            className="response-metric"
                                            style={{ color: getQualityColor(entry.qualityScore) }}
                                        >
                                            품질: {(entry.qualityScore * 100).toFixed(0)}%
                                        </span>
                                    )}
                                    {entry.confidence !== undefined && (
                                        <span
                                            className="response-metric"
                                            style={{ color: getConfidenceColor(entry.confidence) }}
                                        >
                                            신뢰도: {(entry.confidence * 100).toFixed(0)}%
                                        </span>
                                    )}
                                    {entry.processingTime !== undefined && (
                                        <span className="response-metric">
                                            {(entry.processingTime / 1000).toFixed(2)}초
                                        </span>
                                    )}
                                    <span className="expand-indicator">
                                        {isExpanded ? '▼' : '▶'}
                                    </span>
                                </div>
                            </button>

                            {/* 프롬프트 미리보기 */}
                            <div className="response-prompt-preview">
                        <strong>프롬프트:</strong> {entry.prompt}
                    </div>

                    {/* 응답 내용 (확장 시) */ }
                    {
                        isExpanded && (
                            <div className="multi-intent-response-content">
                                <div className="response-content-text">
                                    {entry.response}
                                </div>

                                {/* 액션 버튼 */}
                                <div className="response-actions">
                                    <button
                                        className="action-button copy"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCopy(entry);
                                        }}
                                    >
                                        📋 복사
                                    </button>
                                    <button
                                        className="action-button use-prompt"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onUseAsPrompt(entry);
                                        }}
                                    >
                                        💬 프롬프트로 사용
                                    </button>
                                    {onPin && (
                                        <button
                                            className={`action-button pin ${isPinned ? 'active' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePin(entry.index);
                                            }}
                                        >
                                            {isPinned ? '📌 핀 해제' : '📌 핀'}
                                        </button>
                                    )}
                                    {onStar && (
                                        <button
                                            className={`action-button star ${isStarred ? 'active' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleStar(entry.index);
                                            }}
                                        >
                                            {isStarred ? '⭐ 별표 해제' : '⭐ 별표'}
                                        </button>
                                    )}
                                    <button
                                        className="action-button follow-up"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onFollowUpAction(entry, 'improve');
                                        }}
                                    >
                                        ✨ 개선
                                    </button>
                                    <button
                                        className="action-button follow-up"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onFollowUpAction(entry, 'expand');
                                        }}
                                    >
                                        📝 확장
                                    </button>
                                </div>
                            </div>
                        )
                    }
                        </div>
            );
                })}
        </div>
        </div >
    );
};

export default MultiIntentResponseView;

