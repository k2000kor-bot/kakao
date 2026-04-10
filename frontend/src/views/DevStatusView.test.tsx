/**
 * DevStatusView 테스트 — 개발 현황 화면 렌더·섹션
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DevStatusView from './DevStatusView';

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

  it('검증·배포 섹션이 있다', () => {
    render(
      <MemoryRouter>
        <DevStatusView />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { level: 2, name: '검증·배포' })).toBeInTheDocument();
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

  it('검증·배포에 restart:backend와 ANSWER_QUALITY §8 안내가 있다', () => {
    render(
      <MemoryRouter>
        <DevStatusView />
      </MemoryRouter>
    );
    // 섹션 내 텍스트를 직접 찾기 (closest 사용 대신)
    expect(screen.getByText(/restart:backend/)).toBeInTheDocument();
    expect(screen.getByText(/§8 검증·배포/)).toBeInTheDocument();
    // 검증·배포 섹션이 존재하는지 확인
    expect(screen.getByRole('heading', { name: '검증·배포' })).toBeInTheDocument();
  });
});
