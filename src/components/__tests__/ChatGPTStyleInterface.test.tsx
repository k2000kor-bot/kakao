/* eslint-disable jest/no-conditional-expect */
/**
 * ChatGPTStyleInterface 컴포넌트 테스트
 * ChatGPT 스타일 인터페이스 컴포넌트 기능 확인
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChatGPTStyleInterface } from '../ChatGPTStyleInterface';
import { renderWithTheme, setupCommonMocks } from '../../test-utils/testHelpers';
import { errorLogger } from '../../utils/errorLogger';

// Mock ChatGPTProjectService
const mockGetProjects = jest.fn();
const mockCreateProject = jest.fn();
const mockSendMessage = jest.fn();
const mockGenerateAIResponse = jest.fn();

jest.mock('../../services/chatGPTProjectService', () => {
  const mockGetInstance = jest.fn(() => ({
    getProjects: mockGetProjects,
    createProject: mockCreateProject,
    sendMessage: mockSendMessage,
    generateAIResponse: mockGenerateAIResponse,
  }));
  
  return {
    __esModule: true,
    default: {
      getInstance: mockGetInstance,
    },
  };
});

jest.mock('../../utils/errorLogger', () => ({
  errorLogger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock('../genspark/gensparkAnswerMarkdown', () => ({
  GensparkAnswerMarkdown: ({ text }: { text: string }) => (
    <div data-testid="genspark-answer-md">{text}</div>
  ),
}));

describe('ChatGPTStyleInterface', () => {
  beforeEach(() => {
    setupCommonMocks();
    jest.clearAllMocks();
    
    // 모킹된 인스턴스가 항상 같은 객체를 반환하도록 설정
    const mockInstance = {
      getProjects: mockGetProjects,
      createProject: mockCreateProject,
      sendMessage: mockSendMessage,
      generateAIResponse: mockGenerateAIResponse,
    };
    
    // getInstance가 항상 같은 인스턴스를 반환하도록 설정
    const ChatGPTProjectServiceModule = require('../../services/chatGPTProjectService');
    ChatGPTProjectServiceModule.default.getInstance = jest.fn(() => mockInstance);
    
    // 기본 모킹 설정
    mockGetProjects.mockResolvedValue([]);
    mockCreateProject.mockResolvedValue({
      id: '1',
      name: '송파한양2차',
      category: 'investment',
      memoryType: 'default',
      description: '송파한양2차 재건축 프로젝트',
      createdAt: new Date().toISOString(),
      fileCount: 3,
      sessionCount: 8,
    });
  });

  // 긴 비동기 작업을 위한 타임아웃 설정
  jest.setTimeout(30000);

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('기본 렌더링', () => {
    it('컴포넌트가 올바르게 렌더링되어야 함', async () => {
      renderWithTheme(<ChatGPTStyleInterface />);

      await waitFor(() => {
        // 프로젝트가 로드되면 UI가 표시됨
        const buttons = screen.queryAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
      }, { timeout: 5000 });
    });
  });

  describe('프로젝트 로드', () => {
    it('프로젝트를 로드할 수 있어야 함', async () => {
      renderWithTheme(<ChatGPTStyleInterface />);

      // 컴포넌트가 렌더링되고 UI가 표시되는지 확인
      // 프로젝트가 없으면 기본 프로젝트가 생성되거나 UI가 표시됨
      await waitFor(() => {
        // UI가 렌더링되었는지 확인 (버튼, 입력 필드 등)
        const buttons = screen.queryAllByRole('button');
        const inputs = screen.queryAllByRole('textbox');
        // 컴포넌트가 렌더링되었는지 확인
        expect(buttons.length > 0 || inputs.length > 0).toBe(true);
      }, { timeout: 20000 });
      
      // getProjects 또는 createProject가 호출되었는지 확인
      const hasGetProjectsCall = mockGetProjects.mock.calls.length > 0;
      const hasCreateProjectCall = mockCreateProject.mock.calls.length > 0;
      expect(hasGetProjectsCall || hasCreateProjectCall).toBe(true);
    });

    it('프로젝트 로드 실패 시 에러를 로깅해야 함', async () => {
      mockGetProjects.mockRejectedValueOnce(new Error('Network error'));

      renderWithTheme(<ChatGPTStyleInterface />);

      await waitFor(() => {
        expect(errorLogger.error).toHaveBeenCalled();
      }, { timeout: 5000 });
    });
  });
});
