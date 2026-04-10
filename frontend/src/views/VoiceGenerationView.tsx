/**
 * 목소리 생성 전용 뷰 — AdvancedFeaturesPanel의 목소리 생성 탭만 노출
 * 사이드바 "목소리 생성" 메뉴로 접근
 */
import React from 'react';
import AdvancedFeaturesPanel from '../components/AdvancedFeaturesPanel';

function VoiceGenerationView() {
  return (
    <div className="main-content bw-detail-root" role="main" aria-label="음성 생성" data-testid="voice-generation-view">
      <AdvancedFeaturesPanel defaultTab="voiceGen" />
    </div>
  );
}

export default VoiceGenerationView;
