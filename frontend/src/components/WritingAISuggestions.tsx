/**
 * AI 글쓰기 제안 컴포넌트
 */

import {
    API_V7_WRITING_SUGGESTIONS_PATH,
    joinApiHealthCheckUrl,
    resolveApiBaseUrl,
} from '../config/api';
import React, { useState, useEffect } from 'react';
import { errorLogger } from '../utils/errorLogger';
import { coerceTrimmedString } from '../utils/chatInputUtils';
import { getPriorityColor } from '../styles/themeColors';
import './WritingAISuggestions.css';

interface AISuggestion {
    id: string;
    type: 'improvement' | 'expansion' | 'simplification' | 'tone' | 'structure';
    title: string;
    description: string;
    suggestion: string;
    confidence: number;
    priority: 'high' | 'medium' | 'low';
}

interface WritingAISuggestionsProps {
    content: string;
    template?: string;
    onApply?: (suggestion: AISuggestion) => void;
    onDismiss?: (suggestionId: string) => void;
}

const WritingAISuggestions: React.FC<WritingAISuggestionsProps> = ({
    content,
    template,
    onApply,
    onDismiss,
}) => {
    const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        if (content && coerceTrimmedString(content, '').length > 50) {
            generateSuggestions();
        } else {
            setSuggestions([]);
        }
    // generateSuggestions 의존성 의도적 제외 (콜백 안정화)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content, template]);

    const generateSuggestions = async () => {
        setLoading(true);
        try {
            // AI 제안 생성 (백엔드 API 호출)
            const apiBase = resolveApiBaseUrl();
            const response = await fetch(joinApiHealthCheckUrl(apiBase, API_V7_WRITING_SUGGESTIONS_PATH), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content,
                    template,
                    max_suggestions: 5,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setSuggestions(data.suggestions || generateLocalSuggestions());
            } else {
                // 백엔드 실패 시 로컬 제안 생성
                setSuggestions(generateLocalSuggestions());
            }
        } catch (error) {
            errorLogger.error('AI 제안 생성 오류', error instanceof Error ? error : new Error(String(error)), {
                component: 'WritingAISuggestions',
                action: 'generateSuggestions',
            });
            setSuggestions(generateLocalSuggestions());
        } finally {
            setLoading(false);
        }
    };

    const generateLocalSuggestions = (): AISuggestion[] => {
        const localSuggestions: AISuggestion[] = [];
        const wordCount = content.split(/\s+/).filter(Boolean).length;
        const sentenceCount = content
          .split(/[.!?。！？]/)
          .filter((s) => coerceTrimmedString(s, '').length > 0).length;

        // 구조 개선 제안
        if (sentenceCount < 3 && wordCount > 100) {
            localSuggestions.push({
                id: 'struct-1',
                type: 'structure',
                title: '구조 개선',
                description: '내용을 더 명확한 단락으로 나누면 가독성이 향상됩니다.',
                suggestion: '주제별로 단락을 나누고 각 단락에 소제목을 추가하는 것을 고려해보세요.',
                confidence: 0.8,
                priority: 'high',
            });
        }

        // 문장 길이 제안
        const avgWordsPerSentence = wordCount / (sentenceCount || 1);
        if (avgWordsPerSentence > 25) {
            localSuggestions.push({
                id: 'simplify-1',
                type: 'simplification',
                title: '문장 간소화',
                description: '긴 문장을 짧게 나누면 이해하기 쉬워집니다.',
                suggestion: '복잡한 문장을 두 개 이상의 짧은 문장으로 나누어보세요.',
                confidence: 0.75,
                priority: 'medium',
            });
        }

        // 확장 제안
        if (wordCount < 200 && template) {
            localSuggestions.push({
                id: 'expand-1',
                type: 'expansion',
                title: '내용 확장',
                description: '주제를 더 깊이 있게 다루면 글의 완성도가 높아집니다.',
                suggestion: '구체적인 예시나 경험, 데이터를 추가하여 내용을 보강해보세요.',
                confidence: 0.7,
                priority: 'medium',
            });
        }

        // 어투 제안
        if (template && ['이메일', '공식 문서', '보고서'].some((t) => template.includes(t))) {
            localSuggestions.push({
                id: 'tone-1',
                type: 'tone',
                title: '어투 조정',
                description: '공식적인 문서에는 격식 있는 어투가 적합합니다.',
                suggestion: '격식 있는 표현(예: ~입니다, ~합니다)을 사용하여 전문성을 높이세요.',
                confidence: 0.85,
                priority: 'high',
            });
        }

        return localSuggestions;
    };

    const handleApply = (suggestion: AISuggestion) => {
        onApply?.(suggestion);
        setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
    };

    const handleDismiss = (suggestionId: string) => {
        onDismiss?.(suggestionId);
        setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
    };

    if (loading) {
        return (
            <div className="ai-suggestions loading">
                <p>AI 제안을 생성하는 중...</p>
            </div>
        );
    }

    if (suggestions.length === 0) {
        return null;
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'improvement':
                return '✨';
            case 'expansion':
                return '📈';
            case 'simplification':
                return '✂️';
            case 'tone':
                return '🎭';
            case 'structure':
                return '📐';
            default:
                return '💡';
        }
    };

    return (
        <div className="ai-suggestions">
            <div className="suggestions-header">
                <h4>💡 AI 제안</h4>
                <span className="suggestions-count">{suggestions.length}</span>
            </div>
            <div className="suggestions-list">
                {suggestions.map((suggestion) => (
                    <div
                        key={suggestion.id}
                        className={`suggestion-item ${expandedId === suggestion.id ? 'expanded' : ''} priority-${suggestion.priority}`}
                    >
                        <div
                            className="suggestion-header"
                            onClick={() => setExpandedId(expandedId === suggestion.id ? null : suggestion.id)}
                        >
                            <div className="suggestion-icon">{getTypeIcon(suggestion.type)}</div>
                            <div className="suggestion-info">
                                <div className="suggestion-title-row">
                                    <span className="suggestion-title">{suggestion.title}</span>
                                    <span
                                        className="priority-badge"
                                        style={{ backgroundColor: getPriorityColor(suggestion.priority) }}
                                    >
                                        {suggestion.priority === 'high' ? '높음' : suggestion.priority === 'medium' ? '보통' : '낮음'}
                                    </span>
                                </div>
                                <p className="suggestion-description">{suggestion.description}</p>
                            </div>
                            <div className="suggestion-confidence">
                                {Math.round(suggestion.confidence * 100)}%
                            </div>
                        </div>
                        {expandedId === suggestion.id && (
                            <div className="suggestion-details">
                                <div className="suggestion-content">
                                    <p>{suggestion.suggestion}</p>
                                </div>
                                <div className="suggestion-actions">
                                    <button
                                        className="apply-btn"
                                        onClick={() => handleApply(suggestion)}
                                    >
                                        적용하기
                                    </button>
                                    <button
                                        className="dismiss-btn"
                                        onClick={() => handleDismiss(suggestion.id)}
                                    >
                                        무시하기
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WritingAISuggestions;

