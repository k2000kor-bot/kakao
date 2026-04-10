/**
 * ConversationGraphView 테스트 — 대화 관계도 화면 렌더·섹션
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as conversationGraphService from '../services/conversationGraphService';
import ConversationGraphView from './ConversationGraphView';

jest.mock('d3', () => ({
  forceSimulation: jest.fn(() => ({
    force: jest.fn(function (this: unknown) { return this; }),
    on: jest.fn(function (this: unknown) { return this; }),
    stop: jest.fn(),
    alphaTarget: jest.fn(function (this: unknown) { return this; }),
    restart: jest.fn(),
  })),
  forceLink: jest.fn(() => jest.fn()),
  forceManyBody: jest.fn(() => jest.fn()),
  forceCenter: jest.fn(() => jest.fn()),
  forceCollide: jest.fn(() => jest.fn()),
  select: jest.fn(() => ({
    selectAll: jest.fn(() => ({
      data: jest.fn(() => ({
        join: jest.fn(() => ({
          attr: jest.fn(function (this: unknown) { return this; }),
          call: jest.fn(function (this: unknown) { return this; }),
        })),
      })),
      append: jest.fn(() => ({
        selectAll: jest.fn(() => ({
          data: jest.fn(() => ({
            join: jest.fn(() => ({
              attr: jest.fn(function (this: unknown) { return this; }),
              call: jest.fn(function (this: unknown) { return this; }),
            })),
          })),
        })),
      })),
    })),
    remove: jest.fn(),
  })),
  drag: jest.fn(() => jest.fn(() => ({ on: jest.fn(function (this: unknown) { return this; }) }))),
}));

jest.mock('../services/conversationGraphService');

const mockListConversations: jest.MockedFunction<typeof conversationGraphService.listConversations> = jest.mocked(
  conversationGraphService.listConversations,
);

describe('ConversationGraphView', () => {
  beforeEach(() => {
    mockListConversations.mockResolvedValue([]);
  });

  it('대화 관계도 뷰가 렌더되고 제목이 표시된다', async () => {
    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>
    );
    expect(screen.getByTestId('conversation-graph-view')).toBeInTheDocument();
    expect(screen.getByText(/참여자 간 발화 흐름과 동조·반대·대립 관계도를 그립니다/)).toBeInTheDocument();
    await screen.findByText(/업로드된 대화가 없습니다/); // list fetch 완료 대기
  });

  it('대화 업로드·업로드된 대화·기간 지정·대화 관계도 섹션이 있다', async () => {
    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { level: 2, name: '대화 업로드' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '업로드된 대화' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '기간 지정 (선택)' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '대화 관계도' })).toBeInTheDocument();
    await screen.findByText(/업로드된 대화가 없습니다/);
  });
});
