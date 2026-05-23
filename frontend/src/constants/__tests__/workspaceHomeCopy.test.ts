/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import {
  WORKSPACE_CHAT_EMPTY_THREAD_PLACEHOLDER,
  WORKSPACE_COMPOSER_FORM_ARIA_LABEL,
  WORKSPACE_COMPOSER_PLACEHOLDER,
  WORKSPACE_HOME_HEADLINE,
  WORKSPACE_MARKETING_DOCUMENT_TITLE,
  WORKSPACE_WELCOME_AGENT_STRIP_ARIA_LABEL,
} from '../workspaceHomeCopy';

describe('workspaceHomeCopy', () => {
  it('히어로 제목이 비어 있지 않다', () => {
    expect(WORKSPACE_HOME_HEADLINE.trim().length).toBeGreaterThan(0);
  });

  it('마케팅 홈 탭 제목·폼 라벨이 비어 있지 않다', () => {
    expect(WORKSPACE_MARKETING_DOCUMENT_TITLE).toMatch(/CORBU\.AI/);
    expect(WORKSPACE_MARKETING_DOCUMENT_TITLE).toContain('—');
    expect(WORKSPACE_MARKETING_DOCUMENT_TITLE).not.toBe(WORKSPACE_HOME_HEADLINE);
    expect(WORKSPACE_COMPOSER_FORM_ARIA_LABEL.trim().length).toBeGreaterThan(0);
  });

  it('웰컴 도구 스트립 nav 라벨이 비어 있지 않다', () => {
    expect(WORKSPACE_WELCOME_AGENT_STRIP_ARIA_LABEL.trim().length).toBeGreaterThan(0);
  });

  it('질의창 placeholder가 비어 있지 않다', () => {
    expect(WORKSPACE_COMPOSER_PLACEHOLDER.trim().length).toBeGreaterThan(0);
  });

  it('빈 대화 입력창 placeholder가 질의창 문구를 포함한다', () => {
    expect(WORKSPACE_CHAT_EMPTY_THREAD_PLACEHOLDER).toContain(WORKSPACE_COMPOSER_PLACEHOLDER);
    expect(WORKSPACE_CHAT_EMPTY_THREAD_PLACEHOLDER).toMatch(/^CORBU\.AI에게/);
  });
});
