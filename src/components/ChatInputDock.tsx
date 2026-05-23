/**
 * 채팅 하단 입력 도크 — Genspark 52rem 컬럼·첨부·컴포저 정렬
 */
import React from 'react';
import { TEST_IDS } from '../constants/testIds';

export type ChatInputDockVariant = 'welcome' | 'conversation';

export type ChatInputDockProps = {
  children?: React.ReactNode;
  composer: React.ReactNode;
  showDisclaimer?: boolean;
  /** welcome: 웰컴 초기 화면 · conversation: 메시지 진행 중 */
  variant?: ChatInputDockVariant;
};

export function ChatInputDock({
  children,
  composer,
  showDisclaimer = true,
  variant = 'conversation',
}: ChatInputDockProps) {
  return (
    <section
      className={[
        'input-container',
        'bw-page-input-dock',
        'genspark-chat-input-wrap',
        'chat-input-dock',
        variant === 'welcome' ? 'chat-input-dock--welcome' : 'chat-input-dock--conversation',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="메시지 입력 영역"
      data-testid={TEST_IDS.CHAT_INPUT_CONTAINER}
    >
      <div className="chat-input-dock-inner">
        {children}
        {composer}
      </div>
      {showDisclaimer ? (
        <p className="bw-input-dock-disclaimer" role="contentinfo">
          CORBU.AI는 실수를 할 수 있습니다. 중요한 정보는 재차 확인하세요. 쿠키 기본 설정을 참고하세요.
        </p>
      ) : null}
    </section>
  );
}
