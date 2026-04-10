/**
 * VoiceGenerationView 뷰 테스트 — 목소리 생성 페이지 로드·접근성
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import VoiceGenerationView from '../VoiceGenerationView';

jest.mock('../../components/AdvancedFeaturesPanel', () => {
  return function MockAdvancedFeaturesPanel() {
    return <div data-testid="advanced-features-panel">AdvancedFeaturesPanel</div>;
  };
});

describe('VoiceGenerationView', () => {
  it('TTS 뷰 루트와 aria-label을 렌더한다', () => {
    render(<VoiceGenerationView />);
    const root = screen.getByTestId('voice-generation-view');
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute('aria-label', '음성 생성');
    expect(root).toHaveAttribute('role', 'main');
  });

  it('AdvancedFeaturesPanel을 기본 탭 voiceGen으로 렌더한다', () => {
    render(<VoiceGenerationView />);
    expect(screen.getByTestId('advanced-features-panel')).toBeInTheDocument();
  });
});
