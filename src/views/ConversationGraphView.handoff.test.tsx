/**
 * location.state handoff — useNavigate mock 없이 RouterProvider로 검증
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import * as conversationGraphService from '../services/conversationGraphService';
import { CONVERSATION_GRAPH_PATH } from '../config/routes';
import { buildConversationGraphPasteNavState } from './conversationGraphNavigateHandoff';
import * as conversationGraphScroll from './conversationGraphScroll';
import ConversationGraphView from './ConversationGraphView';

jest.mock('../services/conversationGraphService', () => ({
  uploadConversation: jest.fn(),
  uploadConversationText: jest.fn(),
  listConversations: jest.fn(),
  fetchRelationshipGraph: jest.fn(),
}));
jest.mock('../utils/toast', () => ({ showToast: jest.fn() }));
import { showToast } from '../utils/toast';
jest.mock('./conversationGraphForceLayout', () => ({
  __esModule: true,
  mountConversationGraphForceLayout: jest.fn(() => ({
    destroy: jest.fn(),
    resetZoom: jest.fn(),
    focusOnNode: jest.fn(),
  })),
  CONVERSATION_GRAPH_SVG_WIDTH: 800,
  CONVERSATION_GRAPH_SVG_HEIGHT: 500,
}));
jest.mock('./conversationGraphExport');
jest.mock('./conversationGraphCsvExport', () => ({ downloadConversationGraphCsv: jest.fn() }));
jest.mock('./conversationGraphFullReportExport', () => ({ downloadGraphFullReportMarkdown: jest.fn() }));
const mockGenerateGraphAnswerViaChat = jest.fn().mockResolvedValue('handoff answer');
jest.mock('./conversationGraphAnswerGeneration', () => {
  const actual = jest.requireActual('./conversationGraphAnswerGeneration');
  return {
    ...actual,
    generateGraphAnswerViaChat: (...args: unknown[]) => mockGenerateGraphAnswerViaChat(...args),
  };
});
jest.mock('../utils/streamingClient', () => ({
  isStreamingSupported: jest.fn(() => false),
  streamChatMessage: jest.fn(),
}));
jest.mock('../components/genspark/gensparkAnswerMarkdown', () => ({
  GensparkAnswerMarkdown: ({ text }: { text: string }) => <div>{text}</div>,
}));

const mockList = jest.mocked(conversationGraphService.listConversations);

describe('ConversationGraphView handoff', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    mockGenerateGraphAnswerViaChat.mockClear();
    mockGenerateGraphAnswerViaChat.mockResolvedValue('handoff answer');
    mockList.mockResolvedValue([]);
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(() => ({ matches: false })),
    });
  });

  it('handoff 적용 시 붙여넣기·답변 패널·스크롤이 동작한다', async () => {
    const scrollSpy = jest.spyOn(conversationGraphScroll, 'scrollElementIntoViewSafe').mockImplementation(() => {});

    const router = createMemoryRouter(
      [{ path: CONVERSATION_GRAPH_PATH, element: <ConversationGraphView /> }],
      {
        initialEntries: [
          {
            pathname: CONVERSATION_GRAPH_PATH,
            state: buildConversationGraphPasteNavState(
              'Date,User,Message\n2026-05-01,알파,handoff-scroll',
              false,
            ),
          },
        ],
      },
    );

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith('대화 내용을 관계도 화면에 불러왔습니다.', 'success');
    });
    expect(screen.getByTestId('conversation-graph-answer-panel')).toBeInTheDocument();

    await waitFor(() => {
      expect(scrollSpy).toHaveBeenCalled();
    });
    const target = scrollSpy.mock.calls[0]?.[0] as Element | undefined;
    expect(target?.getAttribute?.('data-testid')).toBe('conversation-graph-answer-panel');

    scrollSpy.mockRestore();
  });

  it('autoCreate handoff 시 관계도 만들기 답변 생성을 시도한다', async () => {
    const router = createMemoryRouter(
      [{ path: CONVERSATION_GRAPH_PATH, element: <ConversationGraphView /> }],
      {
        initialEntries: [
          {
            pathname: CONVERSATION_GRAPH_PATH,
            state: buildConversationGraphPasteNavState(
              'Date,User,Message\n2026-05-01,알파,auto-create',
              true,
            ),
          },
        ],
      },
    );

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(mockGenerateGraphAnswerViaChat).toHaveBeenCalled();
    });
    const apiMessage = mockGenerateGraphAnswerViaChat.mock.calls[0]?.[0];
    expect(String(apiMessage)).toMatch(/관계도|Mermaid|참여자/i);
  });
});
