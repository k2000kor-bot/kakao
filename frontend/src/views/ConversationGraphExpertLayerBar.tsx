import React from 'react';
import { EXPERT_LAYER_OPTIONS, type ExpertLayerId } from './conversationGraphExpertLayers';

export type ConversationGraphExpertLayerBarProps = {
  value: ExpertLayerId;
  onChange: (layer: ExpertLayerId) => void;
};

export function ConversationGraphExpertLayerBar({ value, onChange }: ConversationGraphExpertLayerBarProps) {
  return (
    <fieldset
      className="conversation-graph-expert-layers bw-mt-sm"
      data-testid="conversation-graph-expert-layers"
      style={{ border: 'none', padding: 0, margin: 0 }}
    >
      <legend className="bw-label-block">전문가 레이어</legend>
      <p className="bw-detail-meta-text" style={{ marginTop: 4 }}>
        분석 관점별로 참여자·연결을 좁혀 봅니다. 성향·연결 필터와 함께 적용됩니다.
      </p>
      <div className="conversation-graph-expert-layer-chips bw-mt-sm" role="group" aria-label="전문가 레이어 선택">
        {EXPERT_LAYER_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={value === opt.id ? 'bw-btn-primary' : 'bw-btn-secondary'}
            style={{ fontSize: 12 }}
            title={opt.hint}
            data-testid={`conversation-graph-expert-layer-${opt.id}`}
            aria-pressed={value === opt.id}
            onClick={() => onChange(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
