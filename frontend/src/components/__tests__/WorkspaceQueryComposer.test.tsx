/**
 * @jest-environment jsdom
 */
/* eslint-disable testing-library/no-node-access */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WorkspaceQueryComposer } from '../WorkspaceQueryComposer';
import {
  WORKSPACE_COMPOSER_FORM_ARIA_LABEL,
  WORKSPACE_COMPOSER_PLACEHOLDER,
} from '../../constants/workspaceHomeCopy';

describe('WorkspaceQueryComposer', () => {
  it('기본(minimal) placeholder·폼 testid와 파일 첨부를 노출한다', () => {
    render(
      <MemoryRouter>
        <WorkspaceQueryComposer
          value=""
          onChange={() => {}}
          onCommit={() => {}}
          dataTestId="workspace-query-composer-unit"
          primaryAction={<button type="button" className="wq-composer__chat-cta">확인</button>}
        />
      </MemoryRouter>,
    );
    const form = screen.getByTestId('workspace-query-composer-unit');
    expect(form).toBeInTheDocument();
    expect(form).toHaveAttribute('aria-label', WORKSPACE_COMPOSER_FORM_ARIA_LABEL);
    expect(screen.getByPlaceholderText(WORKSPACE_COMPOSER_PLACEHOLDER)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '파일 첨부' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '스니펫' })).not.toBeInTheDocument();
  });

  it('minimal에서 스니펫·음성을 숨기고 주요 CTA와 첨부만 남긴다', () => {
    render(
      <MemoryRouter>
        <WorkspaceQueryComposer
          value=""
          onChange={() => {}}
          onCommit={() => {}}
          dataTestId="wq-minimal"
          toolbarVariant="minimal"
          primaryAction={<button type="button" className="wq-composer__chat-cta">대화</button>}
        />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: '파일 첨부' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '스니펫' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '음성 입력 시작' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '대화' })).toBeInTheDocument();
  });

  it('toolbarVariant=full이면 스니펫 버튼을 노출한다', () => {
    render(
      <MemoryRouter>
        <WorkspaceQueryComposer
          value=""
          onChange={() => {}}
          onCommit={() => {}}
          dataTestId="wq-full"
          toolbarVariant="full"
          primaryAction={<button type="button" className="wq-composer__chat-cta">확인</button>}
        />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: '스니펫' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '파일 첨부' })).toBeInTheDocument();
  });

  it('txt/csv 첨부 시 onConversationTextFileAttach를 호출한다', () => {
    const onConversationTextFileAttach = jest.fn();
    render(
      <MemoryRouter>
        <WorkspaceQueryComposer
          value=""
          onChange={() => {}}
          onCommit={() => {}}
          onConversationTextFileAttach={onConversationTextFileAttach}
          primaryAction={<button type="button">확인</button>}
        />
      </MemoryRouter>,
    );
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['Date,User,Message\na,b'], 'chat.csv', { type: 'text/csv' });
    fireEvent.change(input, { target: { files: [file] } });
    expect(onConversationTextFileAttach).toHaveBeenCalledWith(expect.objectContaining({ name: 'chat.csv' }));
  });

  it('showStructureChips 시 질문·요구·요청 삽입 칩을 노출한다', () => {
    const onChange = jest.fn();
    render(
      <MemoryRouter>
        <WorkspaceQueryComposer
          value=""
          onChange={onChange}
          onCommit={() => {}}
          showStructureChips
          primaryAction={<button type="button">확인</button>}
        />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: '질문 블록 삽입' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '요구 블록 삽입' }));
    expect(onChange).toHaveBeenCalledWith(expect.stringContaining('요구사항:'));
  });
});
