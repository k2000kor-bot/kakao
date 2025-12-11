/**
 * 글쓰기 품질 분석 패널 컴포넌트
 */

import React, { useState, useEffect } from 'react';
import writingQualityAnalyzer, { WritingAnalysis } from '../services/writingQualityAnalyzer';
import PredictionChart from './PredictionChart';
import './WritingQualityPanel.css';

interface WritingQualityPanelProps {
  content: string;
  onImprove?: (suggestion: string) => void;
}

const WritingQualityPanel: React.FC<WritingQualityPanelProps> = ({ content, onImprove }) => {
  const [analysis, setAnalysis] = useState<WritingAnalysis | null>(null);
  const [styleAnalysis, setStyleAnalysis] = useState<any>(null);

  useEffect(() => {
    if (content && content.trim().length > 0) {
      const qualityAnalysis = writingQualityAnalyzer.analyzeQuality(content);
      const style = writingQualityAnalyzer.analyzeStyle(content);
      setAnalysis(qualityAnalysis);
      setStyleAnalysis(style);
    } else {
      setAnalysis(null);
      setStyleAnalysis(null);
    }
  }, [content]);

  if (!analysis || !content.trim()) {
    return (
      <div className="writing-quality-panel empty">
        <p>글을 작성하면 품질 분석 결과가 표시됩니다.</p>
      </div>
    );
  }

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffc107';
    return '#dc3545';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 90) return '우수';
    if (score >= 80) return '양호';
    if (score >= 70) return '보통';
    if (score >= 60) return '개선 필요';
    return '부족';
  };

  return (
    <div className="writing-quality-panel">
      <div className="quality-header">
        <h3>글쓰기 품질 분석</h3>
        <div className="overall-score">
          <span className="score-value" style={{ color: getScoreColor(analysis.metrics.overall) }}>
            {analysis.metrics.overall.toFixed(1)}
          </span>
          <span className="score-label">{getScoreLabel(analysis.metrics.overall)}</span>
        </div>
      </div>

      {/* 메트릭 차트 */}
      <div className="metrics-chart">
        <PredictionChart
          data={{
            labels: ['가독성', '일관성', '문법', '어휘', '구조'],
            values: [
              analysis.metrics.readability / 100,
              analysis.metrics.coherence / 100,
              analysis.metrics.grammar / 100,
              analysis.metrics.vocabulary / 100,
              analysis.metrics.structure / 100,
            ],
            colors: [
              getScoreColor(analysis.metrics.readability),
              getScoreColor(analysis.metrics.coherence),
              getScoreColor(analysis.metrics.grammar),
              getScoreColor(analysis.metrics.vocabulary),
              getScoreColor(analysis.metrics.structure),
            ],
          }}
          type="bar"
          title="품질 메트릭"
        />
      </div>

      {/* 통계 정보 */}
      <div className="statistics-section">
        <h4>통계</h4>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">단어 수</span>
            <span className="stat-value">{analysis.statistics.wordCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">글자 수</span>
            <span className="stat-value">{analysis.statistics.charCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">문장 수</span>
            <span className="stat-value">{analysis.statistics.sentenceCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">단락 수</span>
            <span className="stat-value">{analysis.statistics.paragraphCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">읽기 시간</span>
            <span className="stat-value">{analysis.statistics.readingTime}분</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">고유 단어</span>
            <span className="stat-value">{analysis.statistics.uniqueWords}</span>
          </div>
        </div>
      </div>

      {/* 스타일 분석 */}
      {styleAnalysis && (
        <div className="style-section">
          <h4>스타일 분석</h4>
          <div className="style-tags">
            <span className={`style-tag ${styleAnalysis.formality}`}>
              {styleAnalysis.formality === 'formal' ? '격식있는' : styleAnalysis.formality === 'casual' ? '캐주얼한' : '혼합'}
            </span>
            <span className={`style-tag ${styleAnalysis.tone}`}>
              {styleAnalysis.tone === 'positive' ? '긍정적' : styleAnalysis.tone === 'negative' ? '부정적' : '중립적'}
            </span>
            <span className={`style-tag ${styleAnalysis.complexity}`}>
              {styleAnalysis.complexity === 'simple' ? '단순' : styleAnalysis.complexity === 'complex' ? '복잡' : '보통'}
            </span>
          </div>
        </div>
      )}

      {/* 강점 */}
      {analysis.strengths.length > 0 && (
        <div className="strengths-section">
          <h4>강점</h4>
          <ul className="strengths-list">
            {analysis.strengths.map((strength, idx) => (
              <li key={idx}>✅ {strength}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 약점 */}
      {analysis.weaknesses.length > 0 && (
        <div className="weaknesses-section">
          <h4>개선 필요</h4>
          <ul className="weaknesses-list">
            {analysis.weaknesses.map((weakness, idx) => (
              <li key={idx}>⚠️ {weakness}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 개선 제안 */}
      {analysis.suggestions.length > 0 && (
        <div className="suggestions-section">
          <h4>개선 제안</h4>
          <ul className="suggestions-list">
            {analysis.suggestions.map((suggestion, idx) => (
              <li key={idx}>
                💡 {suggestion}
                {onImprove && (
                  <button
                    className="apply-suggestion-btn"
                    onClick={() => onImprove(suggestion)}
                  >
                    적용
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default WritingQualityPanel;

