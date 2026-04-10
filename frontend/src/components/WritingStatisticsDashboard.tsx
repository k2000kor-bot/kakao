/**
 * 글쓰기 통계 대시보드 컴포넌트
 */

import React, { useState, useEffect } from 'react';
import writingQualityAnalyzer from '../services/writingQualityAnalyzer';
import { errorLogger } from '../utils/errorLogger';
import { WRITING_HISTORY_STORAGE_KEY } from '../services/writingUiStorageKeys';
import { coerceTrimmedString } from '../utils/chatInputUtils';
import PredictionChart from './PredictionChart';
import './WritingStatisticsDashboard.css';

interface WritingStatisticsDashboardProps {
    content: string;
}

interface DailyStats {
    date: string;
    wordCount: number;
    charCount: number;
    qualityScore: number;
    templatesUsed: number;
}

const WritingStatisticsDashboard: React.FC<WritingStatisticsDashboardProps> = ({ content }) => {
    const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
    const [totalStats, setTotalStats] = useState({
        totalWords: 0,
        totalChars: 0,
        totalWritings: 0,
        avgQuality: 0,
        templatesUsed: new Set<string>(),
    });

    useEffect(() => {
        loadStatistics();
    }, []);

    useEffect(() => {
        if (content && coerceTrimmedString(content, '').length > 0) {
            updateStatistics(content);
        }
    // updateStatistics 의존성 의도적 제외 (콜백 안정화)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content]);

    const loadStatistics = () => {
        try {
            const history = JSON.parse(localStorage.getItem(WRITING_HISTORY_STORAGE_KEY) || '[]');
            const stats: DailyStats[] = [];
            const dateMap = new Map<string, { words: number; chars: number; quality: number; templates: Set<string> }>();

            history.forEach((item: Record<string, unknown>) => {
                const createdAt = item.createdAt as string | number | undefined;
                const date = new Date(createdAt ?? Date.now()).toISOString().split('T')[0];
                const contentStr = String(item.content ?? '');
                const analysis = writingQualityAnalyzer.analyzeQuality(contentStr);
                const words = contentStr.split(/\s+/).filter(Boolean).length;
                const chars = contentStr.length;

                if (!dateMap.has(date)) {
                    dateMap.set(date, { words: 0, chars: 0, quality: 0, templates: new Set() });
                }

                const dayStats = dateMap.get(date)!;
                dayStats.words += words;
                dayStats.chars += chars;
                dayStats.quality += analysis.metrics.overall;
                if (item.template != null && item.template !== '') {
                    dayStats.templates.add(item.template as string);
                }
            });

            dateMap.forEach((dayStats, date) => {
                const historyForDate = history.filter(
                    (item: Record<string, unknown>) => new Date((item.createdAt as string | number | undefined) ?? Date.now()).toISOString().split('T')[0] === date
                );
                stats.push({
                    date,
                    wordCount: dayStats.words,
                    charCount: dayStats.chars,
                    qualityScore: dayStats.quality / historyForDate.length,
                    templatesUsed: dayStats.templates.size,
                });
            });

            stats.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            setDailyStats(stats);

            // 전체 통계 계산
            const totalWords = stats.reduce((sum, s) => sum + s.wordCount, 0);
            const totalChars = stats.reduce((sum, s) => sum + s.charCount, 0);
            const totalWritings = history.length;
            const avgQuality = stats.length > 0
                ? stats.reduce((sum, s) => sum + s.qualityScore, 0) / stats.length
                : 0;
            const templatesUsed = new Set<string>(
                history
                    .map((item: Record<string, unknown>) => item.template)
                    .filter((t: unknown): t is string => typeof t === 'string' && t !== '')
            );

            setTotalStats({
                totalWords,
                totalChars,
                totalWritings,
                avgQuality,
                templatesUsed,
            });
        } catch (error) {
            errorLogger.error('통계 로드 오류', error instanceof Error ? error : new Error(String(error)), {
                component: 'WritingStatisticsDashboard',
                action: 'loadStatistics',
            });
        }
    };

    const updateStatistics = (_newContent: string) => {
        // 실시간 통계 업데이트는 필요시 구현
        loadStatistics();
    };

    const getRecentDays = (days: number = 7) => {
        return dailyStats.slice(-days);
    };

    return (
        <div className="writing-statistics-dashboard">
            <div className="dashboard-header">
                <h3>글쓰기 통계</h3>
            </div>

            {/* 전체 통계 카드 */}
            <div className="stats-overview">
                <div className="stat-card">
                    <div className="stat-icon">📝</div>
                    <div className="stat-info">
                        <div className="stat-value">{totalStats.totalWritings}</div>
                        <div className="stat-label">총 작성 글</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-info">
                        <div className="stat-value">{totalStats.totalWords.toLocaleString()}</div>
                        <div className="stat-label">총 단어 수</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">✨</div>
                    <div className="stat-info">
                        <div className="stat-value">{totalStats.avgQuality.toFixed(1)}</div>
                        <div className="stat-label">평균 품질 점수</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-info">
                        <div className="stat-value">{totalStats.templatesUsed.size}</div>
                        <div className="stat-label">사용한 템플릿</div>
                    </div>
                </div>
            </div>

            {/* 일별 통계 차트 */}
            {dailyStats.length > 0 && (
                <div className="daily-stats-section">
                    <h4>최근 7일 통계</h4>
                    <PredictionChart
                        data={{
                            labels: getRecentDays(7).map((s) => new Date(s.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })),
                            values: getRecentDays(7).map((s) => s.wordCount / 100), // 정규화
                            colors: getRecentDays(7).map(() => 'var(--accent-info)'),
                        }}
                        type="line"
                        title="일별 단어 수"
                    />
                </div>
            )}

            {/* 품질 추이 */}
            {dailyStats.length > 0 && (
                <div className="quality-trend-section">
                    <h4>품질 추이</h4>
                    <PredictionChart
                        data={{
                            labels: getRecentDays(7).map((s) => new Date(s.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })),
                            values: getRecentDays(7).map((s) => s.qualityScore / 100),
                            colors: getRecentDays(7).map((s) => (s.qualityScore >= 80 ? 'var(--accent-success)' : s.qualityScore >= 60 ? 'var(--accent-warning)' : 'var(--accent-error)')),
                        }}
                        type="line"
                        title="일별 품질 점수"
                    />
                </div>
            )}

            {/* 템플릿 사용 현황 */}
            {totalStats.templatesUsed.size > 0 && (
                <div className="templates-section">
                    <h4>사용한 템플릿</h4>
                    <div className="templates-list">
                        {Array.from(totalStats.templatesUsed).map((template, idx) => (
                            <span key={idx} className="template-tag">
                                {template}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {dailyStats.length === 0 && (
                <div className="empty-stats">
                    <p>아직 통계 데이터가 없습니다.</p>
                    <p>글을 작성하면 통계가 표시됩니다.</p>
                </div>
            )}
        </div>
    );
};

export default WritingStatisticsDashboard;

