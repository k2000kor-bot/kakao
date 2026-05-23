/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GensparkMarketingHomeView, {
  OFFICIAL_GENSPARK_HOME_URL,
  WORKSPACE_MARKETING_HOME_SUBTITLE,
} from '../GensparkMarketingHomeView';
import { TEST_IDS } from '../../constants/testIds';
import {
  WORKSPACE_COMPOSER_FORM_ARIA_LABEL,
  WORKSPACE_HOME_HEADLINE,
  WORKSPACE_MARKETING_DOCUMENT_TITLE,
} from '../../constants/workspaceHomeCopy';

describe('GensparkMarketingHomeView', () => {
  it('마운트 시 document.title을 workspace 상수로 바꾸고 언마운트 시 복원한다', () => {
    const prev = 'jest-workspace-title-prev';
    document.title = prev;
    const { unmount } = render(
      <MemoryRouter>
        <GensparkMarketingHomeView />
      </MemoryRouter>,
    );
    expect(document.title).toBe(WORKSPACE_MARKETING_DOCUMENT_TITLE);
    unmount();
    expect(document.title).toBe(prev);
  });

  it('data-testid와 히어로 제목을 노출한다', () => {
    render(
      <MemoryRouter>
        <GensparkMarketingHomeView />
      </MemoryRouter>,
    );
    expect(screen.getByTestId(TEST_IDS.GENSPARK_MARKETING_HOME)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: WORKSPACE_HOME_HEADLINE })).toBeInTheDocument();
  });

  it('부제가 단순 한 줄 문구를 포함한다', () => {
    render(
      <MemoryRouter>
        <GensparkMarketingHomeView />
      </MemoryRouter>,
    );
    expect(screen.getByText(WORKSPACE_MARKETING_HOME_SUBTITLE)).toBeInTheDocument();
  });

  it('대화로 가는 내부 링크만 있다', () => {
    render(
      <MemoryRouter>
        <GensparkMarketingHomeView />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: '대화' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'AI 에이전트와 대화 시작' })).not.toBeInTheDocument();
  });

  it('질의 폼에 E2E용 testid가 붙어 있다', () => {
    render(
      <MemoryRouter>
        <GensparkMarketingHomeView />
      </MemoryRouter>,
    );
    const composers = screen.getAllByTestId(TEST_IDS.GENSPARK_MARKETING_COMPOSER);
    expect(composers.length).toBeGreaterThanOrEqual(1);
    expect(composers[0]).toBeInTheDocument();
    expect(composers[0]).toHaveAttribute('aria-label', WORKSPACE_COMPOSER_FORM_ARIA_LABEL);
  });

  it('참조 사이트 링크는 깨끗한 origin을 쓴다', () => {
    expect(OFFICIAL_GENSPARK_HOME_URL).toBe('https://www.genspark.ai/');
  });
});
