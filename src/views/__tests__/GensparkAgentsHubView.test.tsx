/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  AGENTS_PATH,
  AGENTS_QUERY_PARAM_ID,
  AGENTS_QUERY_PARAM_TYPE,
  GENSPARK_AGENTS_TYPE_SUPER_AGENT,
} from '../../config/routes';
import { GENSPARK_REFERENCE_AGENT_ID } from '../../services/gensparkReferenceAgentPreset';
import GensparkAgentsHubView from '../GensparkAgentsHubView';

describe('GensparkAgentsHubView', () => {
  it('Super Agent 내부 링크가 /agents?type=super_agent 로 연결된다', () => {
    render(
      <MemoryRouter>
        <GensparkAgentsHubView />
      </MemoryRouter>,
    );
    const expected = `${AGENTS_PATH}?${AGENTS_QUERY_PARAM_TYPE}=${GENSPARK_AGENTS_TYPE_SUPER_AGENT}`;
    const link = screen.getByRole('link', { name: expected });
    expect(link).toHaveAttribute('href', expected);
  });

  it('참조 에이전트 내부 링크가 고정 id 쿼리로 /agents를 연다', () => {
    render(
      <MemoryRouter>
        <GensparkAgentsHubView />
      </MemoryRouter>,
    );
    const href = `${AGENTS_PATH}?${AGENTS_QUERY_PARAM_ID}=${encodeURIComponent(GENSPARK_REFERENCE_AGENT_ID)}`;
    const link = screen.getByRole('link', {
      name: new RegExp(`이 앱에서 열기 \\(${GENSPARK_REFERENCE_AGENT_ID.slice(0, 8)}`),
    });
    expect(link).toHaveAttribute('href', href);
  });

  it('허브 루트에 data-testid가 있다', () => {
    render(
      <MemoryRouter>
        <GensparkAgentsHubView />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('genspark-agents-hub')).toBeInTheDocument();
  });
});
