import type { RefObject } from 'react';
import React from 'react';

export type ChatViewDemoMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

export type ChatViewDemoChat = {
  id: string;
  title: string;
  summary: string;
  date: string;
  messages: ChatViewDemoMessage[];
};

export interface MinimalChatViewProps {
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  loading: boolean;
  currentChat: ChatViewDemoChat;
  messages: ChatViewDemoMessage[];
}

const defaultChat: ChatViewDemoChat = {
  id: 'demo-chat',
  title: '데모',
  summary: '',
  date: '',
  messages: [],
};

/** 단위 테스트·데모에서 ref·기본 채팅을 채워 최소 props 생성 */
export function createMinimalChatViewProps(partial: Partial<MinimalChatViewProps> = {}): MinimalChatViewProps {
  return {
    scrollContainerRef: partial.scrollContainerRef ?? React.createRef<HTMLDivElement>(),
    messagesEndRef: partial.messagesEndRef ?? React.createRef<HTMLDivElement>(),
    inputRef: partial.inputRef ?? React.createRef<HTMLTextAreaElement>(),
    loading: partial.loading ?? false,
    currentChat: partial.currentChat ?? defaultChat,
    messages: partial.messages ?? [],
  };
}
