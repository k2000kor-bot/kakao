/**
 * DevStatusView 테스트 — 개발 현황 화면 렌더·섹션
 */
import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DevStatusView from './DevStatusView';

jest.mock('../components/genspark/AssistantGensparkBody', () => ({
  AssistantGensparkBody: ({ text }: { text: string }) => (
    <div data-testid="assistant-genspark-body-mock">{text}</div>
  ),
}));

describe('DevStatusView', () => {
  it('개발 현황 뷰가 렌더되고 제목이 표시된다', () => {
    render(
      <MemoryRouter>
        <DevStatusView />
      </MemoryRouter>
    );
    expect(screen.getByTestId('dev-status-view')).toBeInTheDocument();
    expect(screen.getByText(/지금까지 프론트엔드에 반영된 기능과 변경 사항을 확인할 수 있습니다/)).toBeInTheDocument();
  });

  it('이걸 뭐 하려는 거야? 섹션이 있다', () => {
    render(
      <MemoryRouter>
        <DevStatusView />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { level: 2, name: '이걸 뭐 하려는 거야?' })).toBeInTheDocument();
  });

  it('프론트엔드 변경 사항 섹션이 있다', () => {
    render(
      <MemoryRouter>
        <DevStatusView />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { level: 2, name: '프론트엔드 변경 사항' })).toBeInTheDocument();
  });

  it('업데이트 안내 상수 섹션이 표시된다', () => {
    render(
      <MemoryRouter>
        <DevStatusView />
      </MemoryRouter>
    );
    const notice = within(screen.getByTestId('dev-status-update-notice-section'));
    expect(screen.getByRole('heading', { level: 2, name: /업데이트 안내 \(v2026\.05\.06\)/ })).toBeInTheDocument();
    expect(notice.getByText('채팅 첫 전송 시 대화 제목이 즉시 간결하게 저장되도록 안정화했습니다.')).toBeInTheDocument();
    expect(notice.getByText(/액션 버튼 권장 문구/)).toBeInTheDocument();
  });

  it('문서·배포 변경 목록에 DevStatusView·verify:final 안내가 있다', () => {
    render(
      <MemoryRouter>
        <DevStatusView />
      </MemoryRouter>,
    );
    expect(screen.getAllByText('src/views/DevStatusView.tsx').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/verify:final·FINAL_CHECKLIST/).length).toBeGreaterThan(0);
  });

  it('CHANGES에 chatViewDemoProps·realTimeSyncJestMock·Lazy·ChatGPTInterface.test 경로와 LazyComponents displayName 안내가 표시된다', () => {
    render(
      <MemoryRouter>
        <DevStatusView />
      </MemoryRouter>,
    );
    expect(screen.getByText('src/components/Chat/chatViewDemoProps.ts')).toBeInTheDocument();
    expect(screen.getByText('src/test-utils/realTimeSyncJestMock.ts')).toBeInTheDocument();
    expect(screen.getByText('src/components/__tests__/LazyComponents.test.tsx')).toBeInTheDocument();
    expect(screen.getByText('src/components/__tests__/ChatGPTInterface.test.tsx')).toBeInTheDocument();
    expect(screen.getByText('src/ModernChatInterface.tsx')).toBeInTheDocument();
    expect(
      screen.getByText(/글쓰기\(onGenerate\) 패널은 콜백 useCallback\+useMemo/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/LazyProps\(하단 export type.*satisfies·패널 props useMemo·콜백 useCallback\)/),
    ).toBeInTheDocument();
    expect(screen.getByText(/LazyChunk·\(Lazy\) 래퍼·LazyProps\(하단 export type.*displayName 규칙/)).toBeInTheDocument();
    expect(screen.getByText(/test:views·sidebar-context 수치 등 15 tests/)).toBeInTheDocument();
    expect(screen.getAllByText(/LazyComponentsSuspenseWrapper/).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/LazyComponentsSuspenseWrapper 2곳/)).toBeInTheDocument();
    expect(screen.getByText(/동기 자식 렌더 스모크/)).toBeInTheDocument();
    expect(screen.getByText(/realTimeSync mock·11 tests/)).toBeInTheDocument();
  });

  it('검증·배포 섹션이 있다', () => {
    render(
      <MemoryRouter>
        <DevStatusView />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { level: 2, name: '검증·배포' })).toBeInTheDocument();
  });

  it('검증·배포에 test:views 스위트·테스트 수가 표시된다', () => {
    render(
      <MemoryRouter>
        <DevStatusView />
      </MemoryRouter>,
    );
    expect(screen.getAllByText(/22 suites, 142 tests/).length).toBeGreaterThan(0);
  });

  it('검증·배포에 test:sidebar-context 명령이 표시된다', () => {
    render(
      <MemoryRouter>
        <DevStatusView />
      </MemoryRouter>,
    );
    expect(screen.getByText(/npm run test:sidebar-context/)).toBeInTheDocument();
  });

  it('문서·배포 목록에 대화 흐름 검증 문서가 포함된다', () => {
    render(
      <MemoryRouter>
        <DevStatusView />
      </MemoryRouter>
    );
    expect(screen.getByText('대화 입력→질문 표시→답변 생성·품질 흐름 검증')).toBeInTheDocument();
    expect(screen.getByText(/CHAT_ANSWER_FLOW_VERIFICATION\.md/)).toBeInTheDocument();
  });

  it('검증·배포에 verify:final과 백엔드 미기동 시 SKIP 안내가 있다', () => {
    render(
      <MemoryRouter>
        <DevStatusView />
      </MemoryRouter>,
    );
    const inVerify = within(screen.getByTestId('dev-status-verify-section'));
    expect(inVerify.getByText(/npm run verify:final/)).toBeInTheDocument();
    expect(inVerify.getByText('docs/FINAL_CHECKLIST.md')).toBeInTheDocument();
    expect(inVerify.getByText(/SKIP\/FAIL/)).toBeInTheDocument();
  });

  it('검증·배포에 restart:backend와 ANSWER_QUALITY §8 안내가 있다', () => {
    render(
      <MemoryRouter>
        <DevStatusView />
      </MemoryRouter>
    );
    const inVerify = within(screen.getByTestId('dev-status-verify-section'));
    expect(inVerify.getByText(/restart:backend/)).toBeInTheDocument();
    expect(inVerify.getByText(/§8 검증·배포/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '검증·배포' })).toBeInTheDocument();
  });

  it('반응형·접근성 목록에 ChatGPTInterface prefers-reduced-motion 안내가 있다', () => {
    render(
      <MemoryRouter>
        <DevStatusView />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: '반응형·접근성' })).toBeInTheDocument();
    expect(screen.getByText(/prefers-reduced-motion/)).toBeInTheDocument();
    expect(screen.getByText(/src\/components\/ChatGPTInterface\.css/)).toBeInTheDocument();
  });

  it('LazyComponents.ChatInterface 데모가 지연 로드 후 헤더를 표시한다', async () => {
    render(
      <MemoryRouter>
        <DevStatusView />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: '임베드 대화 UI (LazyComponents.ChatInterface)' })).toBeInTheDocument();
    const embed = screen.getByTestId('dev-status-embed-chat');
    await waitFor(() => {
      expect(within(embed).getByText('AI 대화')).toBeInTheDocument();
    });
  });

  it('LazyComponents.ChatView 데모가 지연 로드 후 세션 제목을 표시한다', async () => {
    render(
      <MemoryRouter>
        <DevStatusView />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: '대화 메시지 목록 (LazyComponents.ChatView)' })).toBeInTheDocument();
    const embed = screen.getByTestId('dev-status-embed-chatview');
    await waitFor(() => {
      expect(within(embed).getByRole('heading', { name: 'ChatView 지연 로드 데모' })).toBeInTheDocument();
    });
  });
});
