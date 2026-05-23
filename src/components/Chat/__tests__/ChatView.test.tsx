/**
 * ChatView — 경량 데모 목록 렌더
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import ChatView from '../ChatView';
import { createMinimalChatViewProps } from '../chatViewDemoProps';

describe('Chat/ChatView', () => {
  it('데모 루트가 렌더된다', () => {
    render(<ChatView {...createMinimalChatViewProps()} />);
    expect(screen.getByTestId('chat-view-demo')).toBeInTheDocument();
  });

  it('메시지 본문이 목록으로 표시된다', () => {
    render(
      <ChatView
        {...createMinimalChatViewProps({
          messages: [
            {
              id: 'm1',
              role: 'user',
              content: '안녕하세요',
              timestamp: new Date().toISOString(),
            },
          ],
        })}
      />,
    );
    expect(screen.getByText('안녕하세요')).toBeInTheDocument();
    expect(screen.getByText('user')).toBeInTheDocument();
  });
});
