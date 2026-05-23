import React from 'react';
import type { GraphAiAnalysis, ParticipantAiInsight } from './conversationGraphAiAnalyzer';
import type { StanceKey } from './conversationGraphFilter';
import type { GraphFilterPresetId } from './conversationGraphFilterPresets';
import { graphFilterPresetLabel } from './conversationGraphFilterPresets';

const STANCE_BAR_COLOR: Record<StanceKey, string> = {
  동조: '#22c55e',
  반대: '#ef4444',
  중립: '#94a3b8',
};

function StanceMiniBar({ insight }: { insight: ParticipantAiInsight }) {
  const total =
    insight.stanceCounts.동조 + insight.stanceCounts.반대 + insight.stanceCounts.중립;
  if (total <= 0) {
    return <span className="bw-detail-meta-text">분류 데이터 없음</span>;
  }
  const segments: StanceKey[] = ['동조', '반대', '중립'];
  return (
    <div
      role="img"
      aria-label={`동조 ${insight.stanceCounts.동조}, 반대 ${insight.stanceCounts.반대}, 중립 ${insight.stanceCounts.중립}`}
      style={{
        display: 'flex',
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
        marginTop: 6,
        maxWidth: 280,
      }}
    >
      {segments.map((key) => {
        const count = insight.stanceCounts[key];
        if (count <= 0) return null;
        return (
          <span
            key={key}
            style={{
              flex: count,
              backgroundColor: STANCE_BAR_COLOR[key],
              minWidth: 2,
            }}
            title={`${key} ${count}건`}
          />
        );
      })}
    </div>
  );
}

function TrustMeter({ score, label }: { score: number; label: string }) {
  const color = score >= 70 ? '#22c55e' : score >= 45 ? '#eab308' : '#ef4444';
  return (
    <div data-testid="conversation-graph-ai-trust">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span className="bw-label-block">분석 신뢰도</span>
        <span className="bw-detail-meta-text">
          {score}/100 · {label}
        </span>
      </div>
      <div
        style={{
          marginTop: 8,
          height: 10,
          borderRadius: 5,
          background: 'var(--border-overlay)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${score}%`,
            height: '100%',
            backgroundColor: color,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
}

export type ConversationGraphAiPanelProps = {
  analysis: GraphAiAnalysis;
  narrative: string;
  loadingAiNarrative: boolean;
  aiNarrativeSource: 'heuristic' | 'ai';
  autoRequestAiNarrative: boolean;
  onAutoRequestAiNarrativeChange: (value: boolean) => void;
  onRequestAiNarrative: () => void;
  onExportJson: () => void;
  onApplyStancePreset: (preset: GraphFilterPresetId) => void;
  selectedInsight: ParticipantAiInsight | null;
};

export function ConversationGraphAiPanel({
  analysis,
  narrative,
  loadingAiNarrative,
  aiNarrativeSource,
  autoRequestAiNarrative,
  onAutoRequestAiNarrativeChange,
  onRequestAiNarrative,
  onExportJson,
  onApplyStancePreset,
  selectedInsight,
}: ConversationGraphAiPanelProps) {
  const stancePresets: GraphFilterPresetId[] = ['all', '동조', '반대', '중립'];
  return (
    <div
      className="bw-mt-md bw-features-card conversation-graph-answer-panel"
      data-testid="conversation-graph-ai-panel"
    >
      <div className="conversation-graph-ai-panel__header">
        <p className="bw-label-block" style={{ margin: 0 }}>
          AI 성향 분석
        </p>
        <div className="conversation-graph-ai-panel__actions">
          <button
            type="button"
            className="bw-btn-secondary"
            onClick={onRequestAiNarrative}
            disabled={loadingAiNarrative}
            data-testid="conversation-graph-ai-request"
          >
            {loadingAiNarrative ? '생성 중…' : 'AI 해석'}
          </button>
          <button
            type="button"
            className="bw-btn-secondary"
            onClick={onExportJson}
            data-testid="conversation-graph-ai-export-json"
          >
            JSON
          </button>
        </div>
      </div>

      <label
        className="bw-detail-meta-text bw-mt-sm"
        style={{ display: 'flex', gap: 8, alignItems: 'center' }}
        title="관계도 생성 직후 AI 종합 해석 자동 요청"
      >
        <input
          type="checkbox"
          checked={autoRequestAiNarrative}
          onChange={(e) => onAutoRequestAiNarrativeChange(e.target.checked)}
          data-testid="conversation-graph-ai-auto-request"
        />
        AI 해석 자동
      </label>

      <div
        className="bw-mt-sm"
        style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}
        data-testid="conversation-graph-ai-stance-chips"
      >
        <span className="bw-detail-meta-text">성향 그룹 필터:</span>
        {stancePresets.map((preset) => (
          <button
            key={preset}
            type="button"
            className="bw-btn-secondary"
            style={{ fontSize: 12, padding: '4px 10px' }}
            data-testid={`conversation-graph-ai-chip-${preset}`}
            onClick={() => onApplyStancePreset(preset)}
          >
            {graphFilterPresetLabel(preset)}
          </button>
        ))}
      </div>

      <TrustMeter score={analysis.trustScore} label={analysis.trustLabel} />

      <p className="bw-detail-meta-text bw-mt-sm" data-testid="conversation-graph-ai-stance-summary">
        {analysis.stanceSummary}
      </p>
      <p className="bw-detail-meta-text">{analysis.exchangeSummary}</p>
      <p className="bw-detail-meta-text">{analysis.alignmentSummary}</p>

      <details className="bw-mt-sm">
        <summary className="bw-detail-meta-text" style={{ cursor: 'pointer' }}>
          분석 기준·한계 (신뢰할 수 있는 해석을 위해)
        </summary>
        <ul className="bw-detail-meta-text" style={{ margin: '8px 0 0', paddingLeft: 20 }}>
          {analysis.methodology.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </details>

      <div className="bw-mt-sm" data-testid="conversation-graph-ai-narrative">
        <p className="bw-label-block" style={{ fontSize: 13 }}>
          종합 해석
          <span className="bw-detail-meta-text" style={{ marginLeft: 8, fontWeight: 'normal' }}>
            {aiNarrativeSource === 'ai' ? '(AI 생성)' : '(규칙 기반 · AI 갱신 가능)'}
          </span>
        </p>
        <p className="bw-detail-meta-text" style={{ marginTop: 6, lineHeight: 1.55 }}>
          {narrative}
        </p>
      </div>

      {selectedInsight ? (
        <div className="bw-mt-md" data-testid="conversation-graph-ai-selected">
          <p className="bw-label-block">선택 참여자 AI 프로필</p>
          <p className="bw-detail-meta-text">{selectedInsight.profileLine}</p>
          <StanceMiniBar insight={selectedInsight} />
        </div>
      ) : null}

      <div className="bw-mt-md">
        <p className="bw-label-block">영향력 상위</p>
        <ul className="bw-detail-meta-text" style={{ margin: '8px 0 0', paddingLeft: 20 }}>
          {analysis.topInfluencers.map((p) => (
            <li key={p.id}>
              {p.label}: {p.dominantStance} · {p.exchangeRole} · 신뢰 {Math.round(p.stanceConfidence * 100)}%
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
