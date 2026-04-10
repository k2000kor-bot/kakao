/**
 * Chat/TypingIndicator — 젠스파이크 초기 헤드라인과 기본 aria-label 정합
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import TypingIndicator from '../TypingIndicator';
import { ASSISTANT_GENSPARK_STATUS_HEADLINE_INITIAL_DEFAULT } from '../../../utils/chatInputUtils';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...rest }: { children?: React.ReactNode }) => <div {...rest}>{children}</div>,
  },
}));

jest.mock('../../genspark/AssistantGensparkBody', () => ({
  AssistantGensparkBody: () => <div data-testid="genspark-body" />,
}));

describe('Chat/TypingIndicator', () => {
  it('기본 aria-label이 젠스파이크 초기 헤드라인 상수와 같다', () => {
    render(<TypingIndicator />);
    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      ASSISTANT_GENSPARK_STATUS_HEADLINE_INITIAL_DEFAULT,
    );
  });
});
