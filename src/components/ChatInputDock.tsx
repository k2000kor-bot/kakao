/**
 * 채팅 입력 — 웰컴 중앙(inline) / 대화 하단(dock) 공통 컴포저 래퍼
 */
import React from 'react';
import { TEST_IDS } from '../constants/testIds';

export type ChatInputDockVariant = 'welcome' | 'conversation';

/** inline: 웰컴 중앙 · dock: 대화 진행 중 하단 고정 */
export type ChatInputDockPlacement = 'inline' | 'dock';

export type ChatInputDockProps = {
  children?: React.ReactNode;
  composer: React.ReactNode;
  showDisclaimer?: boolean;
  /** welcome: 웰컴 초기 화면 · conversation: 메시지 진행 중 */
  variant?: ChatInputDockVariant;
  /** inline=히어로 아래 중앙, dock=하단 고정(기본) */
  placement?: ChatInputDockPlacement;
};

export function ChatInputDock({
  children,
  composer,
  showDisclaimer = true,
  variant = 'conversation',
  placement = 'dock',
}: ChatInputDockProps) {
  const className = [
    placement === 'dock' ? 'input-container' : '',
    placement === 'dock' ? 'bw-page-input-dock' : '',
    'genspark-chat-input-wrap',
    'chat-input-dock',
    placement === 'inline' ? 'chat-input-dock--inline' : '',
    variant === 'welcome' ? 'chat-input-dock--welcome' : 'chat-input-dock--conversation',
  ]
    .filter(Boolean)
    .join(' ');

  const inner = (
    <>
      <div className="chat-input-dock-inner">
        {children}
        {composer}
      </div>
      {showDisclaimer && placement === 'dock' ? (
        <p className="bw-input-dock-disclaimer" role="contentinfo">
          CORBU.AI는 실수를 할 수 있습니다. 중요한 정보는 재차 확인하세요. 쿠키 기본 설정을 참고하세요.
        </p>
      ) : null}
    </>
  );

  if (placement === 'inline') {
    return (
      <div className={className} aria-label="메시지 입력 영역" data-testid={TEST_IDS.CHAT_INPUT_CONTAINER}>
        {inner}
      </div>
    );
  }

  return (
    <section className={className} aria-label="메시지 입력 영역" data-testid={TEST_IDS.CHAT_INPUT_CONTAINER}>
      {inner}
    </section>
  );
}
