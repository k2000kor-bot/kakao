/**
 * ConversationGraphView 테스트 — 대화 관계도 화면 렌더·섹션
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as conversationGraphService from '../services/conversationGraphService';

jest.mock('../services/conversationGraphService', () => ({
  uploadConversation: jest.fn(),
  uploadConversationText: jest.fn(),
  listConversations: jest.fn(),
  fetchRelationshipGraph: jest.fn(),
}));
jest.mock('../utils/toast', () => ({
  showToast: jest.fn(),
}));
jest.mock('./conversationGraphForceLayout', () => ({
  __esModule: true,
  mountConversationGraphForceLayout: jest.fn(() => ({
    destroy: jest.fn(),
    resetZoom: jest.fn(),
    focusOnNode: jest.fn(),
  })),
}));
jest.mock('./conversationGraphExport');
jest.mock('./conversationGraphCsvExport', () => ({
  downloadConversationGraphCsv: jest.fn(),
}));
jest.mock('./conversationGraphFullReportExport', () => ({
  downloadGraphFullReportMarkdown: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

jest.mock('./conversationGraphAnswerGeneration', () => {
  const actual = jest.requireActual('./conversationGraphAnswerGeneration');
  return {
    ...actual,
    generateGraphAnswerViaChat: jest.fn(
      (
        _msg: string,
        _ctx: unknown,
        opts?: { onChunk?: (acc: string, display: string) => void; onPhase?: (p: string) => void },
      ) => {
        opts?.onPhase?.('analyze');
        const text = '관계도 기반 생성 답변';
        opts?.onChunk?.(text, text);
        opts?.onPhase?.('verify');
        return Promise.resolve(text);
      },
    ),
  };
});

jest.mock('../utils/streamingClient', () => ({
  isStreamingSupported: jest.fn(() => true),
  streamChatMessage: jest.fn(),
}));
jest.mock('../components/genspark/gensparkAnswerMarkdown', () => ({
  GensparkAnswerMarkdown: ({ text }: { text: string }) => <div data-testid="genspark-answer-markdown-mock">{text}</div>,
}));
jest.mock('mermaid', () => ({
  __esModule: true,
  default: {
    initialize: jest.fn(),
    render: jest.fn().mockResolvedValue({ svg: '<svg data-testid="mock-mermaid-svg"></svg>' }),
  },
}));

import ConversationGraphView from './ConversationGraphView';
import {
  generateGraphAnswerViaChat,
  GRAPH_ANSWER_CONTEXT_FLAG,
} from './conversationGraphAnswerGeneration';
import {
  CONVERSATION_GRAPH_CHAT_AUTOSEND_STATE_KEY,
  CONVERSATION_GRAPH_CHAT_CONTEXT_STATE_KEY,
  CONVERSATION_GRAPH_CHAT_DRAFT_STATE_KEY,
} from '../config/routes';
import { mountConversationGraphForceLayout } from './conversationGraphForceLayout';
import { downloadConversationGraphCsv } from './conversationGraphCsvExport';
import { downloadGraphFullReportMarkdown } from './conversationGraphFullReportExport';
import { downloadConversationGraphPng, downloadConversationGraphSvg } from './conversationGraphExport';
import { showToast } from '../utils/toast';

const mockListConversations = jest.mocked(conversationGraphService.listConversations);
const mockUploadConversationText = jest.mocked(conversationGraphService.uploadConversationText);
const mockUploadConversation = jest.mocked(conversationGraphService.uploadConversation);
const mockFetchRelationshipGraph = jest.mocked(conversationGraphService.fetchRelationshipGraph);

function expectGraphFetchOpts(startDate?: string, endDate?: string) {
  return expect.objectContaining({
    startDate,
    endDate,
    analysisMode: 'ai_enhanced',
  });
}

describe('ConversationGraphView', () => {
  beforeEach(() => {
    localStorage.removeItem('corbu.conversationGraph.uiPrefs');
    sessionStorage.clear();
    mockNavigate.mockClear();
    jest.mocked(generateGraphAnswerViaChat).mockClear();
    jest.mocked(generateGraphAnswerViaChat).mockResolvedValue('관계도 기반 생성 답변');
    jest.mocked(mountConversationGraphForceLayout).mockClear();
    jest.mocked(downloadConversationGraphSvg).mockClear();
    jest.mocked(downloadConversationGraphPng).mockClear();
    jest.mocked(downloadConversationGraphPng).mockResolvedValue(undefined);
    jest.mocked(downloadConversationGraphCsv).mockClear();
    mockListConversations.mockResolvedValue([]);
    mockUploadConversationText.mockResolvedValue({
      upload_id: 'stub-upload',
      name: 'stub',
      filename: 'stub.txt',
      uploaded_at: '2026-05-10T00:00:00.000Z',
      message_count: 0,
    });
    mockUploadConversation.mockResolvedValue({
      upload_id: 'stub-file-upload',
      name: 'stub.csv',
      filename: 'stub.csv',
      uploaded_at: '2026-05-10T00:00:00.000Z',
      message_count: 0,
    });
    mockFetchRelationshipGraph.mockResolvedValue({
      upload_id: 'stub',
      nodes: [],
      edges: [],
    });
  });

  it('대화 관계도 뷰가 렌더되고 제목이 표시된다', async () => {
    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>
    );
    expect(screen.getByTestId('conversation-graph-view')).toBeInTheDocument();
    expect(screen.getByText(/족보형 관계도·입장·시공사 반응 신호/)).toBeInTheDocument();
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
    expect(screen.getByRole('form', { name: '기간 지정 및 관계도 검색' })).toBeInTheDocument();
    await screen.findByText(/업로드된 대화가 없습니다/);
  });

  it('기간 폼을 제출하면 관계도 검색이 실행된다', async () => {
    mockListConversations.mockReset();
    mockListConversations.mockResolvedValue([
      {
        id: 'g1',
        name: '샘플',
        filename: 'a.txt',
        uploaded_at: '2026-05-01T00:00:00.000Z',
        message_count: 1,
      },
    ]);
    mockFetchRelationshipGraph.mockResolvedValueOnce({
      upload_id: 'g1',
      nodes: [],
      edges: [],
    });

    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>
    );
    await screen.findByRole('radio', { name: /대화 선택: 샘플/ });
    fireEvent.submit(screen.getByRole('form', { name: '기간 지정 및 관계도 검색' }));
    await waitFor(() =>
      expect(mockFetchRelationshipGraph).toHaveBeenCalledWith('g1', expectGraphFetchOpts()),
    );
  });

  it('목록 API 실패 시 빈 목록과 구분되는 안내를 표시한다', async () => {
    mockListConversations.mockRejectedValueOnce(new Error('network'));
    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>
    );
    expect(await screen.findByText(/대화 목록을 불러오지 못했습니다/)).toBeInTheDocument();
    expect(screen.queryByText(/업로드된 대화가 없습니다/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument();
  });

  it('목록 실패 후 다시 시도하면 성공 시 빈 목록 안내로 전환된다', async () => {
    mockListConversations.mockReset();
    mockListConversations.mockRejectedValueOnce(new Error('network')).mockResolvedValue([]);
    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>
    );
    expect(await screen.findByText(/대화 목록을 불러오지 못했습니다/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    await waitFor(() => {
      expect(screen.getByText(/업로드된 대화가 없습니다/)).toBeInTheDocument();
    });
    expect(screen.queryByText(/대화 목록을 불러오지 못했습니다/)).not.toBeInTheDocument();
  });

  it('붙여넣기 업로드 성공 후 새 대화가 선택되고 해당 라디오에 포커스가 간다', async () => {
    mockListConversations.mockReset();
    let listCalls = 0;
    mockListConversations.mockImplementation(async () => {
      listCalls += 1;
      if (listCalls === 1) return [];
      return [
        {
          id: 'u-new',
          name: '붙여넣은 대화',
          filename: 'pasted.txt',
          uploaded_at: '2026-05-10T12:00:00.000Z',
          message_count: 3,
        },
      ];
    });
    mockUploadConversationText.mockResolvedValueOnce({
      upload_id: 'u-new',
      name: '붙여넣은 대화',
      filename: 'pasted.txt',
      uploaded_at: '2026-05-10T12:00:00.000Z',
      message_count: 3,
    });
    mockFetchRelationshipGraph.mockResolvedValueOnce({
      upload_id: 'u-new',
      nodes: [{ id: 'p1', label: '홍길동', message_count: 1 }],
      edges: [],
    });

    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>
    );
    await screen.findByText(/업로드된 대화가 없습니다/);

    fireEvent.change(screen.getByLabelText('대화 텍스트 붙여넣기'), { target: { value: '2026.5.10 오후 1:00, 홍길동, 안녕\n' } });
    fireEvent.click(screen.getByRole('button', { name: '붙여넣기 분석' }));

    await waitFor(() =>
      expect(mockFetchRelationshipGraph).toHaveBeenCalledWith('u-new', expectGraphFetchOpts()),
    );

    const radio = await screen.findByRole('radio', { name: /대화 선택: 붙여넣은 대화/ });
    expect(radio).toBeChecked();
    await waitFor(() => expect(radio).toHaveFocus());
    expect(mockUploadConversationText).toHaveBeenCalled();
  });

  it('파일 선택 업로드 성공 후 새 대화가 선택되고 해당 라디오에 포커스가 간다', async () => {
    mockListConversations.mockReset();
    let listCalls = 0;
    mockListConversations.mockImplementation(async () => {
      listCalls += 1;
      if (listCalls === 1) return [];
      return [
        {
          id: 'u-file',
          name: 'chat.csv',
          filename: 'chat.csv',
          uploaded_at: '2026-05-11T09:00:00.000Z',
          message_count: 5,
        },
      ];
    });
    mockUploadConversation.mockResolvedValueOnce({
      upload_id: 'u-file',
      name: 'chat.csv',
      filename: 'chat.csv',
      uploaded_at: '2026-05-11T09:00:00.000Z',
      message_count: 5,
    });
    mockFetchRelationshipGraph.mockResolvedValueOnce({
      upload_id: 'u-file',
      nodes: [{ id: 'p1', label: 'a', message_count: 1 }],
      edges: [],
    });

    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>
    );
    await screen.findByText(/업로드된 대화가 없습니다/);

    const file = new File(['date,user,msg\n2026-05-11,a,hi'], 'chat.csv', { type: 'text/csv' });
    fireEvent.change(screen.getByLabelText('대화 파일 선택 (TXT/CSV)'), { target: { files: [file] } });

    await waitFor(() =>
      expect(mockFetchRelationshipGraph).toHaveBeenCalledWith('u-file', expectGraphFetchOpts()),
    );

    const radio = await screen.findByRole('radio', { name: /대화 선택: chat\.csv/ });
    expect(radio).toBeChecked();
    await waitFor(() => expect(radio).toHaveFocus());
    expect(mockUploadConversation).toHaveBeenCalledWith(file, 'chat.csv');
  });

  it('대용량 카카오 CSV는 샘플링 옵션을 표시한다', async () => {
    mockListConversations.mockResolvedValue([]);
    const rows = Array.from({ length: 10_001 }, (_, i) => {
      const h = String(i % 24).padStart(2, '0');
      return `2026-05-11 ${h}:00:00,"유저","m${i}"`;
    });
    const csv = `Date,User,Message\n${rows.join('\n')}`;
    const file = new File([csv], 'big.csv', { type: 'text/csv' });

    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>
    );
    await screen.findByText(/업로드된 대화가 없습니다/);
    fireEvent.change(screen.getByLabelText('대화 파일 선택 (TXT/CSV)'), { target: { files: [file] } });

    expect(await screen.findByTestId('kakao-upload-sample-preset')).toBeInTheDocument();
    expect(screen.getByTestId('kakao-sample-preset-recent_20000')).toBeInTheDocument();
  });

  it('카카오톡 CSV는 미리보기 후 정규화 TXT로 업로드한다', async () => {
    mockListConversations.mockReset();
    let listCalls = 0;
    mockListConversations.mockImplementation(async () => {
      listCalls += 1;
      if (listCalls === 1) return [];
      return [
        {
          id: 'u-kakao',
          name: 'kakao.csv',
          filename: 'kakao.txt',
          uploaded_at: '2026-05-11T09:00:00.000Z',
          message_count: 1,
        },
      ];
    });
    mockUploadConversation.mockResolvedValueOnce({
      upload_id: 'u-kakao',
      name: 'kakao.csv',
      filename: 'kakao.txt',
      uploaded_at: '2026-05-11T09:00:00.000Z',
      message_count: 1,
    });
    mockFetchRelationshipGraph.mockResolvedValueOnce({
      upload_id: 'u-kakao',
      nodes: [{ id: 'p-alpha', label: '알파', message_count: 1, dominant_stance: '중립' }],
      edges: [],
    });

    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>
    );
    await screen.findByText(/업로드된 대화가 없습니다/);

    const csv = `Date,User,Message
2026-05-11 10:00:00,"알파","안녕"`;
    const file = new File([csv], 'kakao.csv', { type: 'text/csv' });
    fireEvent.change(screen.getByLabelText('대화 파일 선택 (TXT/CSV)'), { target: { files: [file] } });

    expect(await screen.findByTestId('kakao-upload-preview')).toBeInTheDocument();
    expect(screen.getByText(/카카오톡 CSV 분석 결과/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '업로드 후 관계도 보기' }));

    await waitFor(() => expect(mockUploadConversation).toHaveBeenCalled());
    const uploaded = mockUploadConversation.mock.calls[0][0] as File;
    expect(uploaded.name).toMatch(/kakao\.txt$/);
    await expect(uploaded.text()).resolves.toContain('2026-05-11 10:00:00, 알파 : 안녕');

    await waitFor(() =>
      expect(mockFetchRelationshipGraph).toHaveBeenCalledWith(
        'u-kakao',
        expectGraphFetchOpts('2026-05-11', '2026-05-11'),
      ),
    );
    await waitFor(() => {
      expect(screen.getByTestId('conversation-graph-status')).toHaveTextContent(/참여자 1명/);
    });
    expect(mountConversationGraphForceLayout).toHaveBeenCalled();
  });

  it('이미 대화가 선택된 상태에서 파일 업로드하면 새로 올린 대화가 선택된다', async () => {
    mockListConversations.mockReset();
    let listCalls = 0;
    const existing = {
      id: 'old-1',
      name: '기존.txt',
      filename: '기존.txt',
      uploaded_at: '2026-05-01T00:00:00.000Z',
      message_count: 1,
    };
    mockListConversations.mockImplementation(async () => {
      listCalls += 1;
      if (listCalls === 1) return [existing];
      return [
        existing,
        {
          id: 'u-newer',
          name: '추가.csv',
          filename: '추가.csv',
          uploaded_at: '2026-05-12T00:00:00.000Z',
          message_count: 2,
        },
      ];
    });
    mockUploadConversation.mockResolvedValueOnce({
      upload_id: 'u-newer',
      name: '추가.csv',
      filename: '추가.csv',
      uploaded_at: '2026-05-12T00:00:00.000Z',
      message_count: 2,
    });

    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>
    );
    expect(await screen.findByRole('radio', { name: /대화 선택: 기존\.txt/ })).toBeChecked();

    const file = new File(['x'], '추가.csv', { type: 'text/csv' });
    fireEvent.change(screen.getByLabelText('대화 파일 선택 (TXT/CSV)'), { target: { files: [file] } });

    expect(await screen.findByRole('radio', { name: /대화 선택: 추가\.csv/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /대화 선택: 기존\.txt/ })).not.toBeChecked();
  });

  it('관계도 검색 성공 시 상태 메시지가 참여자·연결 수로 갱신된다', async () => {
    mockListConversations.mockReset();
    mockListConversations.mockResolvedValue([
      {
        id: 'g1',
        name: '샘플',
        filename: 'a.txt',
        uploaded_at: '2026-05-01T00:00:00.000Z',
        message_count: 1,
      },
    ]);
    mockFetchRelationshipGraph.mockReset();
    let fetchSeq = 0;
    mockFetchRelationshipGraph.mockImplementation(() => {
      fetchSeq += 1;
      if (fetchSeq === 1) {
        return Promise.resolve({
          upload_id: 'g1',
          nodes: [
            { id: 'p1', label: '참여자1', message_count: 2 },
            { id: 'p2', label: '참여자2', message_count: 1 },
          ],
          edges: [{ source: 'p1', target: 'p2', weight: 1 }],
        });
      }
      return Promise.resolve({
        upload_id: 'stub',
        nodes: [],
        edges: [],
      });
    });

    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>
    );
    await screen.findByRole('radio', { name: /대화 선택: 샘플/ });
    fireEvent.click(screen.getByRole('button', { name: '관계도 검색' }));

    await waitFor(() => {
      const s = screen.getByTestId('conversation-graph-status');
      expect(s).toHaveTextContent(/참여자 2명/);
      expect(s).toHaveTextContent(/연결 1개/);
    });
    await waitFor(() => {
      expect(mountConversationGraphForceLayout).toHaveBeenCalled();
    });
    const [svgArg, graphArg, mountOpts] =
      jest.mocked(mountConversationGraphForceLayout).mock.calls.at(-1) ?? [];
    expect(svgArg).toBeInstanceOf(SVGSVGElement);
    expect(graphArg?.nodes).toHaveLength(2);
    expect(mountOpts?.onNodeSelect).toEqual(expect.any(Function));
    expect(await screen.findByTestId('conversation-graph-ai-panel')).toBeInTheDocument();
    expect(screen.getByTestId('conversation-graph-ai-trust')).toBeInTheDocument();
    expect(screen.getByTestId('conversation-graph-ai-export-json')).toBeInTheDocument();
    expect(screen.getByTestId('conversation-graph-answer-panel')).toBeInTheDocument();
    expect(screen.getByTestId('conversation-graph-answer-auto')).toBeInTheDocument();
  });

  it('통합 리포트 저장 버튼 클릭 시 Markdown export를 호출한다', async () => {
    mockListConversations.mockResolvedValue([
      {
        id: 'g1',
        name: '샘플',
        filename: 'a.txt',
        uploaded_at: '2026-05-01T00:00:00.000Z',
        message_count: 1,
      },
    ]);
    mockFetchRelationshipGraph.mockResolvedValue({
      upload_id: 'g1',
      nodes: [{ id: 'p1', label: '알파', message_count: 2, dominant_stance: '동조' }],
      edges: [],
    });

    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>
    );
    await screen.findByRole('radio', { name: /대화 선택: 샘플/ });
    fireEvent.click(screen.getByRole('button', { name: '관계도 검색' }));
    await screen.findByTestId('conversation-graph-answer-panel');

    fireEvent.click(screen.getByTestId('conversation-graph-full-report-download'));

    expect(downloadGraphFullReportMarkdown).toHaveBeenCalledWith(
      expect.objectContaining({
        narrative: expect.any(String),
      }),
    );
    expect(showToast).toHaveBeenCalledWith('통합 리포트 Markdown을 저장했습니다.', 'success');
  });

  it('자동 답변 생성이 켜져 있으면 관계도 표시 후 답변 API를 호출한다', async () => {
    localStorage.setItem(
      'corbu.conversationGraph.uiPrefs',
      JSON.stringify({ autoGenerateAnswer: true }),
    );

    mockListConversations.mockResolvedValue([
      {
        id: 'g1',
        name: '샘플',
        filename: 'a.txt',
        uploaded_at: '2026-05-01T00:00:00.000Z',
        message_count: 1,
      },
    ]);
    mockFetchRelationshipGraph.mockResolvedValue({
      upload_id: 'g1',
      nodes: [{ id: 'p1', label: '알파', message_count: 2, dominant_stance: '동조' }],
      edges: [],
    });

    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>,
    );
    await screen.findByRole('radio', { name: /대화 선택: 샘플/ });
    fireEvent.click(screen.getByRole('button', { name: '관계도 검색' }));

    await waitFor(
      () => {
        expect(generateGraphAnswerViaChat).toHaveBeenCalled();
      },
      { timeout: 8000 },
    );
  });

  it('답변 생성 중 다단계 파이프라인 UI가 표시된다', async () => {
    let resolveGen!: (value: string) => void;
    const pending = new Promise<string>((resolve) => {
      resolveGen = resolve;
    });
    jest.mocked(generateGraphAnswerViaChat).mockImplementation((_msg, _ctx, opts) => {
      opts?.onPhase?.('outline');
      return pending.then((text) => {
        opts?.onChunk?.(text, text);
        return text;
      });
    });

    mockListConversations.mockResolvedValue([
      {
        id: 'g1',
        name: '샘플',
        filename: 'a.txt',
        uploaded_at: '2026-05-01T00:00:00.000Z',
        message_count: 1,
      },
    ]);
    mockFetchRelationshipGraph.mockResolvedValue({
      upload_id: 'g1',
      nodes: [{ id: 'p1', label: '알파', message_count: 2, dominant_stance: '동조' }],
      edges: [],
    });

    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>,
    );
    await screen.findByRole('radio', { name: /대화 선택: 샘플/ });
    fireEvent.click(screen.getByRole('button', { name: '관계도 검색' }));
    await screen.findByTestId('conversation-graph-answer-panel');

    fireEvent.click(screen.getByTestId('conversation-graph-answer-preset-report'));
    fireEvent.click(screen.getByTestId('conversation-graph-answer-generate'));

    await waitFor(() => {
      expect(screen.getByTestId('conversation-graph-answer-pipeline')).toBeInTheDocument();
    });

    resolveGen('관계도 기반 생성 답변');

    await waitFor(() => {
      expect(screen.getByTestId('conversation-graph-answer-result')).toHaveTextContent('관계도 기반 생성 답변');
    });
    expect(screen.queryByTestId('conversation-graph-answer-pipeline')).not.toBeInTheDocument();
  });

  it('답변 생성 버튼 클릭 시 통합 API로 생성된 텍스트를 표시한다', async () => {
    mockListConversations.mockResolvedValue([
      {
        id: 'g1',
        name: '샘플',
        filename: 'a.txt',
        uploaded_at: '2026-05-01T00:00:00.000Z',
        message_count: 1,
      },
    ]);
    mockFetchRelationshipGraph.mockResolvedValue({
      upload_id: 'g1',
      nodes: [{ id: 'p1', label: '알파', message_count: 2, dominant_stance: '동조' }],
      edges: [],
    });

    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>
    );
    await screen.findByRole('radio', { name: /대화 선택: 샘플/ });
    fireEvent.click(screen.getByRole('button', { name: '관계도 검색' }));
    await screen.findByTestId('conversation-graph-answer-panel');

    fireEvent.click(screen.getByTestId('conversation-graph-answer-preset-report'));
    fireEvent.click(screen.getByTestId('conversation-graph-answer-generate'));

    await waitFor(() => {
      expect(generateGraphAnswerViaChat).toHaveBeenCalled();
      expect(screen.getByTestId('conversation-graph-answer-result')).toHaveTextContent(
        '관계도 기반 생성 답변',
      );
    });
  });

  it('답변 생성 결과에 mermaid 블록이 있으면 Mermaid 미리보기를 표시한다', async () => {
    const answerWithMermaid = [
      '## 요약',
      '',
      '```mermaid',
      'flowchart TB',
      '  A-->B',
      '```',
      '',
      '본문 설명입니다.',
    ].join('\n');
    jest.mocked(generateGraphAnswerViaChat).mockResolvedValue(answerWithMermaid);

    mockListConversations.mockResolvedValue([
      {
        id: 'g1',
        name: '샘플',
        filename: 'a.txt',
        uploaded_at: '2026-05-01T00:00:00.000Z',
        message_count: 1,
      },
    ]);
    mockFetchRelationshipGraph.mockResolvedValue({
      upload_id: 'g1',
      nodes: [{ id: 'p1', label: '알파', message_count: 2, dominant_stance: '동조' }],
      edges: [],
    });

    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>,
    );
    await screen.findByRole('radio', { name: /대화 선택: 샘플/ });
    fireEvent.click(screen.getByRole('button', { name: '관계도 검색' }));
    await screen.findByTestId('conversation-graph-answer-panel');

    fireEvent.click(screen.getByTestId('conversation-graph-answer-preset-report'));
    fireEvent.click(screen.getByTestId('conversation-graph-answer-generate'));

    await waitFor(() => {
      expect(screen.getByTestId('conversation-graph-answer-result')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByTestId('conversation-graph-mermaid-preview')).toBeInTheDocument();
    });
    const markdown = screen.getByTestId('genspark-answer-markdown-mock');
    expect(markdown).toHaveTextContent('본문 설명입니다.');
    expect(markdown.textContent).not.toMatch(/flowchart\s+TB/);
  });

  it('참여자 선택 시 답변 생성 패널에 참여자 프리셋이 표시된다', async () => {
    mockListConversations.mockResolvedValue([
      {
        id: 'g1',
        name: '샘플',
        filename: 'a.txt',
        uploaded_at: '2026-05-01T00:00:00.000Z',
        message_count: 1,
      },
    ]);
    mockFetchRelationshipGraph.mockResolvedValue({
      upload_id: 'g1',
      nodes: [
        { id: 'p1', label: '알파', message_count: 2, dominant_stance: '동조', stance_동조: 2 },
        { id: 'p2', label: '베타', message_count: 1, dominant_stance: '반대', stance_반대: 1 },
      ],
      edges: [{ source: 'p1', target: 'p2', weight: 1 }],
    });

    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>
    );
    await screen.findByRole('radio', { name: /대화 선택: 샘플/ });
    fireEvent.click(screen.getByRole('button', { name: '관계도 검색' }));
    await screen.findByTestId('conversation-graph-answer-panel');
    fireEvent.click(screen.getByTestId('conversation-graph-participant-p1'));
    expect(screen.getByTestId('conversation-graph-answer-preset-participant')).toBeInTheDocument();
    expect(screen.getByTestId('conversation-graph-answer-selected-hint')).toHaveTextContent(/알파/);
  });

  it('대화에서 답변 생성 클릭 시 /chat으로 관계도 context를 넘긴다', async () => {
    mockListConversations.mockResolvedValue([
      {
        id: 'g1',
        name: '샘플',
        filename: 'a.txt',
        uploaded_at: '2026-05-01T00:00:00.000Z',
        message_count: 1,
      },
    ]);
    mockFetchRelationshipGraph.mockResolvedValue({
      upload_id: 'g1',
      nodes: [{ id: 'p1', label: '알파', message_count: 2, dominant_stance: '동조' }],
      edges: [],
    });

    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>
    );
    await screen.findByRole('radio', { name: /대화 선택: 샘플/ });
    fireEvent.click(screen.getByRole('button', { name: '관계도 검색' }));
    await screen.findByTestId('conversation-graph-answer-panel');

    fireEvent.click(screen.getByTestId('conversation-graph-answer-preset-report'));
    fireEvent.click(screen.getByTestId('conversation-graph-answer-open-chat'));

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        state: expect.objectContaining({
          [CONVERSATION_GRAPH_CHAT_CONTEXT_STATE_KEY]: expect.objectContaining({
            [GRAPH_ANSWER_CONTEXT_FLAG]: true,
          }),
          [CONVERSATION_GRAPH_CHAT_DRAFT_STATE_KEY]: expect.stringContaining('보고서'),
        }),
      }),
    );
  });

  it('대화에서 바로 전송 클릭 시 /chat으로 autosend state를 넘긴다', async () => {
    mockListConversations.mockResolvedValue([
      {
        id: 'g1',
        name: '샘플',
        filename: 'a.txt',
        uploaded_at: '2026-05-01T00:00:00.000Z',
        message_count: 1,
      },
    ]);
    mockFetchRelationshipGraph.mockResolvedValue({
      upload_id: 'g1',
      nodes: [{ id: 'p1', label: '알파', message_count: 2, dominant_stance: '동조' }],
      edges: [],
    });

    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>,
    );
    await screen.findByRole('radio', { name: /대화 선택: 샘플/ });
    fireEvent.click(screen.getByRole('button', { name: '관계도 검색' }));
    await screen.findByTestId('conversation-graph-answer-panel');

    fireEvent.click(screen.getByTestId('conversation-graph-answer-preset-report'));
    fireEvent.click(screen.getByTestId('conversation-graph-answer-open-chat-send'));

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        state: expect.objectContaining({
          [CONVERSATION_GRAPH_CHAT_AUTOSEND_STATE_KEY]: true,
          [CONVERSATION_GRAPH_CHAT_CONTEXT_STATE_KEY]: expect.objectContaining({
            [GRAPH_ANSWER_CONTEXT_FLAG]: true,
          }),
        }),
      }),
    );
  });

  it('AI 성향 칩 클릭 시 입장 필터가 적용된다', async () => {
    mockListConversations.mockReset();
    mockListConversations.mockResolvedValue([
      {
        id: 'g1',
        name: '샘플',
        filename: 'a.txt',
        uploaded_at: '2026-05-01T00:00:00.000Z',
        message_count: 1,
      },
    ]);
    mockFetchRelationshipGraph.mockResolvedValueOnce({
      upload_id: 'g1',
      start_date: '2026-05-01',
      end_date: '2026-05-16',
      nodes: [
        { id: 'p1', label: '동조자', message_count: 1, dominant_stance: '동조' },
        { id: 'p2', label: '반대자', message_count: 1, dominant_stance: '반대' },
      ],
      edges: [{ source: 'p1', target: 'p2', weight: 1 }],
    });

    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>
    );
    await screen.findByRole('radio', { name: /대화 선택: 샘플/ });
    fireEvent.click(screen.getByRole('button', { name: '관계도 검색' }));

    await screen.findByTestId('conversation-graph-ai-panel');
    fireEvent.click(screen.getByTestId('conversation-graph-ai-chip-동조'));

    await waitFor(() => {
      expect(screen.getByTestId('conversation-graph-filter-summary')).toHaveTextContent(/표시 중 1명/);
    });
    expect(screen.getByTestId('conversation-graph-period-presets')).toBeInTheDocument();
  });

  it('참여자 목록 클릭 시 상세 패널에 메시지·연결 정보가 표시된다', async () => {
    mockListConversations.mockReset();
    mockListConversations.mockResolvedValue([
      {
        id: 'g1',
        name: '샘플',
        filename: 'a.txt',
        uploaded_at: '2026-05-01T00:00:00.000Z',
        message_count: 1,
      },
    ]);
    mockFetchRelationshipGraph.mockResolvedValueOnce({
      upload_id: 'g1',
      nodes: [
        {
          id: 'p1',
          label: '참여자1',
          message_count: 2,
          dominant_stance: '동조',
        },
        { id: 'p2', label: '참여자2', message_count: 1 },
      ],
      edges: [{ source: 'p1', target: 'p2', weight: 1 }],
    });

    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>
    );
    await screen.findByRole('radio', { name: /대화 선택: 샘플/ });
    fireEvent.click(screen.getByRole('button', { name: '관계도 검색' }));

    await waitFor(() => {
      expect(screen.getByTestId('conversation-graph-participant-list')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('conversation-graph-participant-p1'));

    await waitFor(() => {
      const detail = screen.getByTestId('conversation-graph-participant-detail');
      expect(detail).toHaveTextContent(/참여자1/);
      expect(detail).toHaveTextContent(/동조/);
      expect(detail).toHaveTextContent(/주고받기/);
      expect(detail).toHaveTextContent(/입장 신뢰/);
    });
    expect(screen.getByTestId('conversation-graph-ai-selected')).toBeInTheDocument();
  });

  it('SVG로 저장 버튼 클릭 시 export 유틸과 성공 토스트를 호출한다', async () => {
    mockListConversations.mockReset();
    mockListConversations.mockResolvedValue([
      {
        id: 'g1',
        name: '샘플 대화',
        filename: 'a.txt',
        uploaded_at: '2026-05-01T00:00:00.000Z',
        message_count: 1,
      },
    ]);
    mockFetchRelationshipGraph.mockResolvedValueOnce({
      upload_id: 'g1',
      nodes: [{ id: 'p1', label: 'A', message_count: 1 }],
      edges: [],
    });

    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>
    );
    await screen.findByRole('radio', { name: /대화 선택: 샘플 대화/ });
    fireEvent.click(screen.getByRole('button', { name: '관계도 검색' }));

    await waitFor(() => {
      expect(screen.getByTestId('conversation-graph-download-svg')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('conversation-graph-download-svg'));

    expect(downloadConversationGraphSvg).toHaveBeenCalledWith(
      expect.any(SVGSVGElement),
      '샘플-대화-graph.svg',
    );
    expect(showToast).toHaveBeenCalledWith('관계도 SVG를 저장했습니다.', 'success');
  });

  it('입장 필터를 바꾸면 표시 노드 수가 줄고 레이아웃이 다시 마운트된다', async () => {
    mockListConversations.mockReset();
    mockListConversations.mockResolvedValue([
      {
        id: 'g1',
        name: '샘플',
        filename: 'a.txt',
        uploaded_at: '2026-05-01T00:00:00.000Z',
        message_count: 1,
      },
    ]);
    mockFetchRelationshipGraph.mockResolvedValueOnce({
      upload_id: 'g1',
      nodes: [
        { id: 'p1', label: '동조자', message_count: 1, dominant_stance: '동조' },
        { id: 'p2', label: '반대자', message_count: 1, dominant_stance: '반대' },
      ],
      edges: [{ source: 'p1', target: 'p2', weight: 1 }],
    });

    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>
    );
    await screen.findByRole('radio', { name: /대화 선택: 샘플/ });
    fireEvent.click(screen.getByRole('button', { name: '관계도 검색' }));

    await waitFor(() => {
      expect(screen.getByTestId('conversation-graph-filter-summary')).toHaveTextContent(/표시 중 2명/);
    });

    const callsBefore = jest.mocked(mountConversationGraphForceLayout).mock.calls.length;
    fireEvent.click(screen.getByTestId('conversation-graph-stance-반대'));

    await waitFor(() => {
      expect(screen.getByTestId('conversation-graph-filter-summary')).toHaveTextContent(/표시 중 1명/);
    });
    expect(jest.mocked(mountConversationGraphForceLayout).mock.calls.length).toBeGreaterThan(callsBefore);
    const lastGraph = jest.mocked(mountConversationGraphForceLayout).mock.calls.at(-1)?.[1];
    expect(lastGraph?.nodes).toHaveLength(1);
    expect(lastGraph?.nodes?.[0]?.id).toBe('p1');
  });

  it('관계도 검색 후 요약 패널에 입장 분포가 표시된다', async () => {
    mockListConversations.mockReset();
    mockListConversations.mockResolvedValue([
      {
        id: 'g1',
        name: '샘플',
        filename: 'a.txt',
        uploaded_at: '2026-05-01T00:00:00.000Z',
        message_count: 1,
      },
    ]);
    mockFetchRelationshipGraph.mockResolvedValueOnce({
      upload_id: 'g1',
      nodes: [
        { id: 'p1', label: 'A', message_count: 1, dominant_stance: '동조' },
        { id: 'p2', label: 'B', message_count: 1, dominant_stance: '반대' },
      ],
      edges: [{ source: 'p1', target: 'p2', weight: 1 }],
    });

    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>
    );
    await screen.findByRole('radio', { name: /대화 선택: 샘플/ });
    fireEvent.click(screen.getByRole('button', { name: '관계도 검색' }));

    await waitFor(() => {
      expect(screen.getByTestId('conversation-graph-stats-panel')).toBeInTheDocument();
      expect(screen.getByTestId('conversation-graph-stats-stance')).toHaveTextContent(/동조 1/);
    });
  });

  it('연결 상대 버튼 클릭 시 해당 참여자가 선택된다', async () => {
    mockListConversations.mockReset();
    mockListConversations.mockResolvedValue([
      {
        id: 'g1',
        name: '샘플',
        filename: 'a.txt',
        uploaded_at: '2026-05-01T00:00:00.000Z',
        message_count: 1,
      },
    ]);
    mockFetchRelationshipGraph.mockResolvedValueOnce({
      upload_id: 'g1',
      nodes: [
        { id: 'p1', label: '알파', message_count: 1 },
        { id: 'p2', label: '베타', message_count: 1 },
      ],
      edges: [{ source: 'p1', target: 'p2', weight: 1 }],
    });

    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>
    );
    await screen.findByRole('radio', { name: /대화 선택: 샘플/ });
    fireEvent.click(screen.getByRole('button', { name: '관계도 검색' }));
    await waitFor(() => screen.getByTestId('conversation-graph-participant-p1'));
    fireEvent.click(screen.getByTestId('conversation-graph-participant-p1'));
    await waitFor(() => screen.getByTestId('conversation-graph-edge-link-p2'));
    fireEvent.click(screen.getByTestId('conversation-graph-edge-link-p2'));

    await waitFor(() => {
      expect(screen.getByTestId('conversation-graph-participant-p2')).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByTestId('conversation-graph-participant-detail')).toHaveTextContent(/베타/);
    });
  });

  it('선택 참여자의 연결 상대 목록이 표시된다', async () => {
    mockListConversations.mockReset();
    mockListConversations.mockResolvedValue([
      {
        id: 'g1',
        name: '샘플',
        filename: 'a.txt',
        uploaded_at: '2026-05-01T00:00:00.000Z',
        message_count: 1,
      },
    ]);
    mockFetchRelationshipGraph.mockResolvedValueOnce({
      upload_id: 'g1',
      nodes: [
        { id: 'p1', label: '알파', message_count: 1 },
        { id: 'p2', label: '베타', message_count: 1 },
      ],
      edges: [{ source: 'p1', target: 'p2', weight: 2, weight_동조: 2, edge_type: '동조' }],
    });

    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>
    );
    await screen.findByRole('radio', { name: /대화 선택: 샘플/ });
    fireEvent.click(screen.getByRole('button', { name: '관계도 검색' }));
    await waitFor(() => screen.getByTestId('conversation-graph-participant-p1'));
    fireEvent.click(screen.getByTestId('conversation-graph-participant-p1'));

    await waitFor(() => {
      const edges = screen.getByTestId('conversation-graph-participant-edges');
      expect(edges).toHaveTextContent(/베타/);
      expect(edges).toHaveTextContent(/↓|↑|\(동조/);
    });
  });

  it('활발한 연결 클릭 시 이미 선택된 참여자면 반대편으로 포커스한다', async () => {
    mockListConversations.mockReset();
    mockListConversations.mockResolvedValue([
      {
        id: 'g1',
        name: '샘플',
        filename: 'a.txt',
        uploaded_at: '2026-05-01T00:00:00.000Z',
        message_count: 1,
      },
    ]);
    mockFetchRelationshipGraph.mockResolvedValueOnce({
      upload_id: 'g1',
      nodes: [
        { id: 'p1', label: '알파', message_count: 1 },
        { id: 'p2', label: '베타', message_count: 1 },
      ],
      edges: [{ source: 'p1', target: 'p2', weight: 5, weight_동조: 3, edge_type: '동조' }],
    });

    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>
    );
    await screen.findByRole('radio', { name: /대화 선택: 샘플/ });
    fireEvent.click(screen.getByRole('button', { name: '관계도 검색' }));
    await waitFor(() => screen.getByTestId('conversation-graph-stats-panel'));
    fireEvent.click(screen.getByTestId('conversation-graph-participant-p1'));

    const topEdgeBtn = screen.getByTestId('conversation-graph-top-edge-p1--p2');
    fireEvent.click(topEdgeBtn);

    await waitFor(() => {
      expect(screen.getByTestId('conversation-graph-participant-p2')).toHaveAttribute('aria-pressed', 'true');
    });
  });

  it('CSV로 저장 버튼 클릭 시 필터된 그래프 CSV export를 호출한다', async () => {
    mockListConversations.mockReset();
    mockListConversations.mockResolvedValue([
      {
        id: 'g1',
        name: '샘플 대화',
        filename: 'a.txt',
        uploaded_at: '2026-05-01T00:00:00.000Z',
        message_count: 1,
      },
    ]);
    mockFetchRelationshipGraph.mockResolvedValueOnce({
      upload_id: 'g1',
      nodes: [
        { id: 'p1', label: 'A', message_count: 1, dominant_stance: '동조' },
        { id: 'p2', label: 'B', message_count: 1, dominant_stance: '반대' },
      ],
      edges: [{ source: 'p1', target: 'p2', weight: 1 }],
    });

    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>
    );
    await screen.findByRole('radio', { name: /대화 선택: 샘플 대화/ });
    fireEvent.click(screen.getByRole('button', { name: '관계도 검색' }));
    await waitFor(() => screen.getByTestId('conversation-graph-download-csv'));
    fireEvent.click(screen.getByTestId('conversation-graph-download-csv'));

    expect(downloadConversationGraphCsv).toHaveBeenCalledWith(
      expect.objectContaining({
        nodes: expect.arrayContaining([
          expect.objectContaining({ id: 'p1' }),
          expect.objectContaining({ id: 'p2' }),
        ]),
      }),
      '샘플-대화-graph.csv',
    );
    expect(showToast).toHaveBeenCalledWith('관계도 CSV를 저장했습니다.', 'success');
  });

  it('입장 프리셋 동조만 클릭 시 표시 참여자가 동조 입장만 남는다', async () => {
    mockListConversations.mockReset();
    mockListConversations.mockResolvedValue([
      {
        id: 'g1',
        name: '샘플',
        filename: 'a.txt',
        uploaded_at: '2026-05-01T00:00:00.000Z',
        message_count: 1,
      },
    ]);
    mockFetchRelationshipGraph.mockResolvedValueOnce({
      upload_id: 'g1',
      nodes: [
        { id: 'p1', label: '동조자', message_count: 1, dominant_stance: '동조' },
        { id: 'p2', label: '반대자', message_count: 1, dominant_stance: '반대' },
      ],
      edges: [{ source: 'p1', target: 'p2', weight: 1 }],
    });

    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>
    );
    await screen.findByRole('radio', { name: /대화 선택: 샘플/ });
    fireEvent.click(screen.getByRole('button', { name: '관계도 검색' }));
    await waitFor(() => screen.getByTestId('conversation-graph-preset-동조'));
    fireEvent.click(screen.getByTestId('conversation-graph-preset-동조'));

    await waitFor(() => {
      expect(screen.getByTestId('conversation-graph-filter-summary')).toHaveTextContent(/표시 중 1명/);
    });
    expect(screen.queryByTestId('conversation-graph-participant-p2')).not.toBeInTheDocument();
  });

  it('Escape 키로 참여자 선택을 해제한다', async () => {
    mockListConversations.mockReset();
    mockListConversations.mockResolvedValue([
      {
        id: 'g1',
        name: '샘플',
        filename: 'a.txt',
        uploaded_at: '2026-05-01T00:00:00.000Z',
        message_count: 1,
      },
    ]);
    mockFetchRelationshipGraph.mockResolvedValueOnce({
      upload_id: 'g1',
      nodes: [{ id: 'p1', label: 'A', message_count: 1 }],
      edges: [],
    });

    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>
    );
    await screen.findByRole('radio', { name: /대화 선택: 샘플/ });
    fireEvent.click(screen.getByRole('button', { name: '관계도 검색' }));
    await waitFor(() => screen.getByTestId('conversation-graph-participant-p1'));
    fireEvent.click(screen.getByTestId('conversation-graph-participant-p1'));
    expect(screen.getByTestId('conversation-graph-participant-p1')).toHaveAttribute('aria-pressed', 'true');

    fireEvent.keyDown(window, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.getByTestId('conversation-graph-participant-p1')).toHaveAttribute('aria-pressed', 'false');
    });
  });

  it('PNG로 저장 버튼 클릭 시 PNG export와 성공 토스트를 호출한다', async () => {
    mockListConversations.mockReset();
    mockListConversations.mockResolvedValue([
      {
        id: 'g1',
        name: '샘플',
        filename: 'a.txt',
        uploaded_at: '2026-05-01T00:00:00.000Z',
        message_count: 1,
      },
    ]);
    mockFetchRelationshipGraph.mockResolvedValueOnce({
      upload_id: 'g1',
      nodes: [{ id: 'p1', label: 'A', message_count: 1 }],
      edges: [],
    });

    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>
    );
    await screen.findByRole('radio', { name: /대화 선택: 샘플/ });
    fireEvent.click(screen.getByRole('button', { name: '관계도 검색' }));
    await waitFor(() => screen.getByTestId('conversation-graph-download-png'));
    fireEvent.click(screen.getByTestId('conversation-graph-download-png'));

    await waitFor(() => {
      expect(jest.mocked(downloadConversationGraphPng)).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith('관계도 PNG를 저장했습니다.', 'success');
    });
  });

  it('연결 유형 필터를 바꾸면 표시 연결 수가 줄어든다', async () => {
    mockListConversations.mockReset();
    mockListConversations.mockResolvedValue([
      {
        id: 'g1',
        name: '샘플',
        filename: 'a.txt',
        uploaded_at: '2026-05-01T00:00:00.000Z',
        message_count: 1,
      },
    ]);
    mockFetchRelationshipGraph.mockResolvedValueOnce({
      upload_id: 'g1',
      nodes: [
        { id: 'p1', label: 'A', message_count: 1 },
        { id: 'p2', label: 'B', message_count: 1 },
      ],
      edges: [
        { source: 'p1', target: 'p2', weight: 1, edge_type: '동조' },
        { source: 'p2', target: 'p1', weight: 1, edge_type: 'flow' },
      ],
    });

    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>
    );
    await screen.findByRole('radio', { name: /대화 선택: 샘플/ });
    fireEvent.click(screen.getByRole('button', { name: '관계도 검색' }));

    await waitFor(() => {
      expect(screen.getByTestId('conversation-graph-filter-summary')).toHaveTextContent(/연결 2개/);
    });

    fireEvent.click(screen.getByTestId('conversation-graph-edge-flow'));

    await waitFor(() => {
      expect(screen.getByTestId('conversation-graph-filter-summary')).toHaveTextContent(/연결 1개/);
    });
  });

  it('확대 초기화 버튼은 그래프 표시 시 노출된다', async () => {
    mockListConversations.mockReset();
    mockListConversations.mockResolvedValue([
      {
        id: 'g1',
        name: '샘플',
        filename: 'a.txt',
        uploaded_at: '2026-05-01T00:00:00.000Z',
        message_count: 1,
      },
    ]);
    mockFetchRelationshipGraph.mockResolvedValueOnce({
      upload_id: 'g1',
      nodes: [{ id: 'p1', label: 'A', message_count: 1 }],
      edges: [],
    });

    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>
    );
    await screen.findByRole('radio', { name: /대화 선택: 샘플/ });
    fireEvent.click(screen.getByRole('button', { name: '관계도 검색' }));

    await waitFor(() => {
      expect(screen.getByTestId('conversation-graph-reset-zoom')).toBeEnabled();
    });
  });

  it('관계도 결과에 노드가 없으면 D3 레이아웃을 마운트하지 않는다', async () => {
    mockListConversations.mockReset();
    mockListConversations.mockResolvedValue([
      {
        id: 'g1',
        name: '샘플',
        filename: 'a.txt',
        uploaded_at: '2026-05-01T00:00:00.000Z',
        message_count: 1,
      },
    ]);
    mockFetchRelationshipGraph.mockResolvedValueOnce({
      upload_id: 'g1',
      nodes: [],
      edges: [],
    });

    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>
    );
    await screen.findByRole('radio', { name: /대화 선택: 샘플/ });
    fireEvent.click(screen.getByRole('button', { name: '관계도 검색' }));

    await waitFor(() => {
      expect(screen.getByTestId('conversation-graph-status')).toHaveTextContent(/파싱된 참여자가 없습니다/);
    });
    expect(mountConversationGraphForceLayout).not.toHaveBeenCalled();
  });

  it('기간을 지정하고 검색하면 fetchRelationshipGraph에 날짜가 전달된다', async () => {
    mockListConversations.mockReset();
    mockListConversations.mockResolvedValue([
      {
        id: 'g1',
        name: '샘플',
        filename: 'a.txt',
        uploaded_at: '2026-05-01T00:00:00.000Z',
        message_count: 1,
      },
    ]);
    mockFetchRelationshipGraph.mockResolvedValueOnce({
      upload_id: 'g1',
      nodes: [{ id: 'p1', label: 'A', message_count: 1 }],
      edges: [],
    });

    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>
    );
    await screen.findByRole('radio', { name: /대화 선택: 샘플/ });
    fireEvent.change(screen.getByLabelText('시작 날짜'), { target: { value: '2026-01-01' } });
    fireEvent.change(screen.getByLabelText('끝 날짜'), { target: { value: '2026-01-31' } });
    fireEvent.click(screen.getByRole('button', { name: '관계도 검색' }));

    await waitFor(() => {
      expect(mockFetchRelationshipGraph).toHaveBeenCalledWith(
        'g1',
        expectGraphFetchOpts('2026-01-01', '2026-01-31'),
      );
    });
  });

  it('관계도 재검색 시작 시 이전 그래프가 비워진다', async () => {
    mockListConversations.mockReset();
    mockListConversations.mockResolvedValue([
      {
        id: 'g1',
        name: '샘플',
        filename: 'a.txt',
        uploaded_at: '2026-05-01T00:00:00.000Z',
        message_count: 1,
      },
    ]);
    mockFetchRelationshipGraph.mockReset();
    let fetchSeq = 0;
    mockFetchRelationshipGraph.mockImplementation(() => {
      fetchSeq += 1;
      if (fetchSeq === 1) {
        return Promise.resolve({
          upload_id: 'g1',
          nodes: [{ id: 'p1', label: '첫번째', message_count: 1 }],
          edges: [],
        });
      }
      if (fetchSeq === 2) {
        return new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                upload_id: 'g1',
                nodes: [{ id: 'p2', label: '두번째', message_count: 1 }],
                edges: [],
              }),
            100
          );
        });
      }
      return Promise.resolve({
        upload_id: 'stub',
        nodes: [],
        edges: [],
      });
    });

    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>
    );
    await screen.findByRole('radio', { name: /대화 선택: 샘플/ });
    fireEvent.click(screen.getByRole('button', { name: '관계도 검색' }));
    await waitFor(() => expect(screen.getByRole('img', { name: '대화 관계도 그래프' })).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: '관계도 검색' }));
    await waitFor(() => {
      expect(screen.getByTestId('conversation-graph-status')).toHaveTextContent(/생성하는 중/);
    });
    await waitFor(
      () => {
        expect(screen.getByTestId('conversation-graph-status')).toHaveTextContent(/관계도를 표시했습니다/);
        expect(screen.getByRole('img', { name: '대화 관계도 그래프' })).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    expect(mockFetchRelationshipGraph).toHaveBeenCalledTimes(2);
  });

  it('관계도 검색 결과가 비면 상태 메시지에 빈 결과 안내가 반영된다', async () => {
    mockListConversations.mockReset();
    mockListConversations.mockResolvedValue([
      {
        id: 'g1',
        name: '샘플',
        filename: 'a.txt',
        uploaded_at: '2026-05-01T00:00:00.000Z',
        message_count: 1,
      },
    ]);
    mockFetchRelationshipGraph.mockResolvedValueOnce({
      upload_id: 'g1',
      nodes: [],
      edges: [],
    });

    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>
    );
    await screen.findByRole('radio', { name: /대화 선택: 샘플/ });
    fireEvent.click(screen.getByRole('button', { name: '관계도 검색' }));

    await waitFor(() => {
      expect(screen.getByTestId('conversation-graph-status')).toHaveTextContent(/파싱된 참여자가 없습니다/);
    });
  });

  it('대화 붙여넣기만 있어도 답변 생성 패널과 관계도 만들기 프리셋이 보인다', async () => {
    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>,
    );
    await screen.findByText(/업로드된 대화가 없습니다/);

    fireEvent.change(screen.getByLabelText('대화 텍스트 붙여넣기'), {
      target: {
        value: 'Date,User,Message\n2026-05-01 10:00:00,알파,안녕',
      },
    });

    expect(await screen.findByTestId('conversation-graph-answer-panel')).toBeInTheDocument();
    expect(screen.getByTestId('conversation-graph-answer-preset-create-graph')).toBeInTheDocument();
  });

  it('매트릭스 보기 전환 시 분석표 패널이 표시되고 SVG 범례는 숨긴다', async () => {
    mockListConversations.mockResolvedValue([
      {
        id: 'g1',
        name: '샘플',
        filename: 'a.txt',
        uploaded_at: '2026-05-01T00:00:00.000Z',
        message_count: 3,
      },
    ]);
    mockFetchRelationshipGraph.mockResolvedValue({
      upload_id: 'g1',
      nodes: [
        { id: 'p1', label: '알파', message_count: 5, dominant_stance: '동조' },
        { id: 'p2', label: '베타', message_count: 2, dominant_stance: '반대' },
      ],
      edges: [{ source: 'p1', target: 'p2', weight: 2, edge_type: '동조' }],
    });

    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>,
    );
    await screen.findByRole('radio', { name: /대화 선택: 샘플/ });
    fireEvent.click(screen.getByRole('button', { name: '관계도 검색' }));
    await screen.findByTestId('conversation-graph-legend');

    fireEvent.click(screen.getByTestId('conversation-graph-view-matrix'));
    expect(await screen.findByTestId('conversation-graph-matrix')).toBeInTheDocument();
    expect(screen.queryByTestId('conversation-graph-legend')).not.toBeInTheDocument();
    expect(screen.getByTestId('conversation-graph-matrix-row-p1')).toHaveTextContent('알파');

    const viewPrefs = JSON.parse(localStorage.getItem('corbu.conversationGraph.uiPrefs') ?? '{}') as {
      graphViewMode?: string;
    };
    expect(viewPrefs.graphViewMode).toBe('matrix');
  });

  it('저장된 자유 배치 설정을 불러오면 관계도 검색 시 layoutMode force로 마운트한다', async () => {
    localStorage.setItem(
      'corbu.conversationGraph.uiPrefs',
      JSON.stringify({ graphLayoutMode: 'force' }),
    );

    mockListConversations.mockResolvedValue([
      {
        id: 'g1',
        name: '샘플',
        filename: 'a.txt',
        uploaded_at: '2026-05-01T00:00:00.000Z',
        message_count: 1,
      },
    ]);
    mockFetchRelationshipGraph.mockResolvedValue({
      upload_id: 'g1',
      nodes: [{ id: 'p1', label: 'A', message_count: 1 }],
      edges: [],
    });

    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>,
    );
    await screen.findByRole('radio', { name: /대화 선택: 샘플/ });
    fireEvent.click(screen.getByRole('button', { name: '관계도 검색' }));

    await waitFor(() => {
      expect(jest.mocked(mountConversationGraphForceLayout)).toHaveBeenCalled();
      const firstOpts = jest.mocked(mountConversationGraphForceLayout).mock.calls[0]?.[2];
      expect(firstOpts?.layoutMode).toBe('force');
    });
  });

  it('자유 배치 전환 시 mountConversationGraphForceLayout에 layoutMode force를 넘긴다', async () => {
    mockListConversations.mockResolvedValue([
      {
        id: 'g1',
        name: '샘플',
        filename: 'a.txt',
        uploaded_at: '2026-05-01T00:00:00.000Z',
        message_count: 1,
      },
    ]);
    mockFetchRelationshipGraph.mockResolvedValue({
      upload_id: 'g1',
      nodes: [{ id: 'p1', label: 'A', message_count: 1 }],
      edges: [],
    });

    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>,
    );
    await screen.findByRole('radio', { name: /대화 선택: 샘플/ });
    fireEvent.click(screen.getByRole('button', { name: '관계도 검색' }));

    await waitFor(() => {
      expect(jest.mocked(mountConversationGraphForceLayout)).toHaveBeenCalled();
    });
    const initialOpts = jest.mocked(mountConversationGraphForceLayout).mock.calls.at(-1)?.[2];
    expect(initialOpts?.layoutMode).toBe('genealogy');

    fireEvent.click(screen.getByTestId('conversation-graph-layout-force'));

    await waitFor(() => {
      const calls = jest.mocked(mountConversationGraphForceLayout).mock.calls;
      expect(calls.some((c) => c[2]?.layoutMode === 'force')).toBe(true);
    });
    const prefs = JSON.parse(localStorage.getItem('corbu.conversationGraph.uiPrefs') ?? '{}') as {
      graphLayoutMode?: string;
    };
    expect(prefs.graphLayoutMode).toBe('force');
  });

  it('전문가 레이어·타임라인 UI가 표시된다', async () => {
    mockListConversations.mockResolvedValue([
      {
        id: 'g1',
        name: '샘플',
        filename: 'a.txt',
        uploaded_at: '2026-05-01T00:00:00.000Z',
        message_count: 3,
      },
    ]);
    mockFetchRelationshipGraph.mockResolvedValue({
      upload_id: 'g1',
      start_date: '2026-05-01',
      end_date: '2026-05-30',
      nodes: [
        { id: 'p1', label: '알파', message_count: 5, dominant_stance: '동조' },
        { id: 'p2', label: '베타', message_count: 2, dominant_stance: '반대' },
      ],
      edges: [{ source: 'p1', target: 'p2', weight: 2, edge_type: '반대', weight_반대: 2 }],
    });

    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>,
    );
    await screen.findByRole('radio', { name: /대화 선택: 샘플/ });
    fireEvent.click(screen.getByRole('button', { name: '관계도 검색' }));
    await screen.findByTestId('conversation-graph-expert-layers');
    expect(screen.getByTestId('conversation-graph-timeline-seg-0')).toHaveTextContent('초반');

    fireEvent.click(screen.getByTestId('conversation-graph-expert-layer-stance_conflict'));
    await waitFor(() => {
      expect(screen.getByTestId('conversation-graph-filter-summary')).toHaveTextContent(/표시 중 2명/);
    });
  });

  it('관계도 검색 실패 시 상태 메시지에 실패 문구가 반영된다', async () => {
    mockListConversations.mockReset();
    mockListConversations.mockResolvedValue([
      {
        id: 'g1',
        name: '샘플',
        filename: 'a.txt',
        uploaded_at: '2026-05-01T00:00:00.000Z',
        message_count: 1,
      },
    ]);
    mockFetchRelationshipGraph.mockRejectedValueOnce(new Error('네트워크 오류'));

    render(
      <MemoryRouter>
        <ConversationGraphView />
      </MemoryRouter>
    );
    await screen.findByRole('radio', { name: /대화 선택: 샘플/ });
    fireEvent.click(screen.getByRole('button', { name: '관계도 검색' }));

    await waitFor(() => {
      expect(screen.getByTestId('conversation-graph-status')).toHaveTextContent(/네트워크 오류/);
    });
  });
});
