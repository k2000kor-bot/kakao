/**
 * CreativeWriting 컴포넌트 테스트
 * 창작 글쓰기 기능 확인
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreativeWriting from '../CreativeWriting';
import { setupCommonMocks } from '../../test-utils/testHelpers';

// 공통 모킹 설정
setupCommonMocks();

// Mock fetch
global.fetch = jest.fn();

// Mock writingExporter
jest.mock('../../utils/writingExport', () => ({
  writingExporter: {
    copyToClipboard: jest.fn().mockResolvedValue(true),
    export: jest.fn(),
    print: jest.fn(),
  },
}));

describe('CreativeWriting', () => {
  const mockOnContentGenerated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('기본 렌더링', () => {
    it('기본 렌더링이 올바르게 작동해야 함', () => {
      render(<CreativeWriting />);
      expect(screen.getByText(/창작 스토리 생성/)).toBeInTheDocument();
    });

    it('탭이 표시되어야 함', () => {
      render(<CreativeWriting />);
      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBeGreaterThanOrEqual(3);
      expect(tabs.some(tab => tab.textContent?.includes('스토리'))).toBe(true);
      expect(tabs.some(tab => tab.textContent?.includes('시'))).toBe(true);
      expect(tabs.some(tab => tab.textContent?.includes('에세이'))).toBe(true);
    });

    it('스토리 탭이 기본으로 선택되어야 함', () => {
      render(<CreativeWriting />);
      expect(screen.getByText(/창작 스토리 생성/)).toBeInTheDocument();
    });
  });

  describe('탭 전환', () => {
    it('시 탭 클릭 시 시 생성 폼이 표시되어야 함', () => {
      render(<CreativeWriting />);
      const tabs = screen.getAllByRole('tab');
      const poemTab = tabs.find(tab => tab.textContent?.includes('시'));
      if (poemTab) {
        fireEvent.click(poemTab);
        expect(screen.getByText(/창작 시 생성/)).toBeInTheDocument();
      }
    });

    it('에세이 탭 클릭 시 에세이 생성 폼이 표시되어야 함', () => {
      render(<CreativeWriting />);
      const tabs = screen.getAllByRole('tab');
      const essayTab = tabs.find(tab => tab.textContent?.includes('에세이'));
      if (essayTab) {
        fireEvent.click(essayTab);
        expect(screen.getByText(/창작 에세이 생성/)).toBeInTheDocument();
      }
    });
  });

  describe('스토리 생성', () => {
    it('스토리 생성 버튼이 표시되어야 함', () => {
      render(<CreativeWriting />);
      const buttons = screen.getAllByRole('button');
      const generateButton = buttons.find(btn => btn.textContent?.includes('스토리 생성'));
      expect(generateButton).toBeInTheDocument();
    });

    it('장르 선택이 작동해야 함', async () => {
      render(<CreativeWriting />);
      const genreSelects = screen.getAllByRole('combobox');
      const genreSelect = genreSelects.find((el: any) =>
        el.closest('.MuiFormControl-root')?.querySelector('label')?.textContent?.includes('장르')
      ) || genreSelects[0];

      if (genreSelect) {
        fireEvent.mouseDown(genreSelect);
        await waitFor(() => {
          const menuItems = screen.getAllByRole('option');
          const romanceOption = menuItems.find(item => item.textContent === '로맨스');
          expect(romanceOption).toBeInTheDocument();
        }, { timeout: 2000 });
      }
    });

    it('스토리 생성 성공 시 콜백이 호출되어야 함', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { content: '생성된 스토리 내용' }
        }),
      });

      render(<CreativeWriting onContentGenerated={mockOnContentGenerated} />);

      const buttons = screen.getAllByRole('button');
      const generateButton = buttons.find(btn => btn.textContent?.includes('스토리 생성'));

      if (generateButton) {
        fireEvent.click(generateButton);

        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalled();
        }, { timeout: 3000 });

        await waitFor(() => {
          expect(mockOnContentGenerated).toHaveBeenCalledWith('생성된 스토리 내용', 'story');
        }, { timeout: 3000 });
      }
    });

    it('스토리 생성 실패 시 에러 메시지가 표시되어야 함', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          error: '생성 실패'
        }),
      });

      render(<CreativeWriting />);

      const buttons = screen.getAllByRole('button');
      const generateButton = buttons.find(btn => btn.textContent?.includes('스토리 생성') && !btn.disabled);

      if (generateButton) {
        fireEvent.click(generateButton);

        await waitFor(() => {
          expect(screen.getByText(/생성 실패/)).toBeInTheDocument();
        }, { timeout: 3000 });
      }
    });
  });

  describe('시 생성', () => {
    it('시 탭에서 시 생성 버튼이 표시되어야 함', () => {
      render(<CreativeWriting />);
      const tabs = screen.getAllByRole('tab');
      const poemTab = tabs.find(tab => tab.textContent?.includes('시'));

      if (poemTab) {
        fireEvent.click(poemTab);
        const buttons = screen.getAllByRole('button');
        const generateButton = buttons.find(btn => btn.textContent?.includes('시 생성'));
        expect(generateButton).toBeInTheDocument();
      }
    });

    it('시 생성 성공 시 콜백이 호출되어야 함', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { content: '생성된 시 내용' }
        }),
      });

      render(<CreativeWriting onContentGenerated={mockOnContentGenerated} />);

      const tabs = screen.getAllByRole('tab');
      const poemTab = tabs.find(tab => tab.textContent?.includes('시'));

      if (poemTab) {
        fireEvent.click(poemTab);

        await waitFor(() => {
          const buttons = screen.getAllByRole('button');
          const generateButton = buttons.find(btn => btn.textContent?.includes('시 생성'));
          if (generateButton) {
            fireEvent.click(generateButton);
          }
        }, { timeout: 2000 });

        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalled();
        }, { timeout: 3000 });

        await waitFor(() => {
          expect(mockOnContentGenerated).toHaveBeenCalledWith('생성된 시 내용', 'poem');
        }, { timeout: 3000 });
      }
    });
  });

  describe('에세이 생성', () => {
    it('에세이 탭에서 에세이 생성 버튼이 표시되어야 함', () => {
      render(<CreativeWriting />);
      const tabs = screen.getAllByRole('tab');
      const essayTab = tabs.find(tab => tab.textContent?.includes('에세이'));

      if (essayTab) {
        fireEvent.click(essayTab);
        const buttons = screen.getAllByRole('button');
        const generateButton = buttons.find(btn => btn.textContent?.includes('에세이 생성'));
        expect(generateButton).toBeInTheDocument();
      }
    });

    it('에세이 생성 성공 시 콜백이 호출되어야 함', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { content: '생성된 에세이 내용' }
        }),
      });

      render(<CreativeWriting onContentGenerated={mockOnContentGenerated} />);

      const tabs = screen.getAllByRole('tab');
      const essayTab = tabs.find(tab => tab.textContent?.includes('에세이'));

      if (essayTab) {
        fireEvent.click(essayTab);

        await waitFor(() => {
          const buttons = screen.getAllByRole('button');
          const generateButton = buttons.find(btn => btn.textContent?.includes('에세이 생성'));
          if (generateButton) {
            fireEvent.click(generateButton);
          }
        }, { timeout: 2000 });

        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalled();
        }, { timeout: 3000 });

        await waitFor(() => {
          expect(mockOnContentGenerated).toHaveBeenCalledWith('생성된 에세이 내용', 'essay');
        }, { timeout: 3000 });
      }
    });
  });

  describe('로딩 상태', () => {
    it('생성 중에는 로딩 상태가 표시되어야 함', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(() => resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: { content: '생성된 내용' }
          }),
        }), 100))
      );

      render(<CreativeWriting />);

      const buttons = screen.getAllByRole('button');
      const generateButton = buttons.find(btn => btn.textContent?.includes('스토리 생성') && !btn.disabled);

      if (generateButton) {
        fireEvent.click(generateButton);
        expect(screen.getByText(/생성 중/)).toBeInTheDocument();
      }
    });
  });

  describe('생성된 콘텐츠 관리', () => {
    beforeEach(() => {
      // localStorage 초기화
      localStorage.clear();
      jest.clearAllMocks();
    });

    it('스토리 생성 후 복사 버튼이 표시되어야 함', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { content: '생성된 스토리 내용' }
        }),
      });

      render(<CreativeWriting />);

      const buttons = screen.getAllByRole('button');
      const generateButton = buttons.find(btn => btn.textContent?.includes('스토리 생성'));

      if (generateButton) {
        fireEvent.click(generateButton);

        await waitFor(() => {
          expect(screen.getByText('생성된 스토리 내용')).toBeInTheDocument();
        }, { timeout: 5000 });

        expect(screen.getByText(/복사/)).toBeInTheDocument();
      }
    });

    it('복사 버튼 클릭 시 클립보드에 복사되어야 함', async () => {
      const { writingExporter } = require('../../utils/writingExport');
      (writingExporter.copyToClipboard as jest.Mock).mockResolvedValueOnce(true);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { content: '생성된 스토리 내용' }
        }),
      });

      render(<CreativeWriting />);

      const buttons = screen.getAllByRole('button');
      const generateButton = buttons.find(btn => btn.textContent?.includes('스토리 생성'));

      if (generateButton) {
        fireEvent.click(generateButton);

        await waitFor(() => {
          expect(screen.getByText('생성된 스토리 내용')).toBeInTheDocument();
        }, { timeout: 5000 });

        const copyButton = screen.getByText(/^복사$/);
        fireEvent.click(copyButton);

        await waitFor(() => {
          expect(writingExporter.copyToClipboard).toHaveBeenCalledWith('생성된 스토리 내용');
        }, { timeout: 2000 });
      }
    });

    it('저장 버튼 클릭 시 localStorage에 저장되어야 함', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { content: '생성된 스토리 내용' }
        }),
      });

      render(<CreativeWriting />);

      const buttons = screen.getAllByRole('button');
      const generateButton = buttons.find(btn => btn.textContent?.includes('스토리 생성'));

      if (generateButton) {
        fireEvent.click(generateButton);

        await waitFor(() => {
          expect(screen.getByText('생성된 스토리 내용')).toBeInTheDocument();
        }, { timeout: 5000 });

        const saveButton = screen.getByText(/^저장$/);
        fireEvent.click(saveButton);

        await waitFor(() => {
          const savedWritings = JSON.parse(localStorage.getItem('creativeWritings') || '[]');
          expect(savedWritings.length).toBe(1);
          expect(savedWritings[0].content).toBe('생성된 스토리 내용');
          expect(savedWritings[0].type).toBe('story');
        }, { timeout: 2000 });
      }
    });

    it('내보내기 메뉴가 표시되어야 함', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { content: '생성된 스토리 내용' }
        }),
      });

      render(<CreativeWriting />);

      const buttons = screen.getAllByRole('button');
      const generateButton = buttons.find(btn => btn.textContent?.includes('스토리 생성'));

      if (generateButton) {
        fireEvent.click(generateButton);

        await waitFor(() => {
          expect(screen.getByText('생성된 스토리 내용')).toBeInTheDocument();
        }, { timeout: 5000 });

        expect(screen.getByText(/내보내기/)).toBeInTheDocument();
      }
    });

    it('인쇄 버튼이 표시되어야 함', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { content: '생성된 스토리 내용' }
        }),
      });

      render(<CreativeWriting />);

      const buttons = screen.getAllByRole('button');
      const generateButton = buttons.find(btn => btn.textContent?.includes('스토리 생성'));

      if (generateButton) {
        fireEvent.click(generateButton);

        await waitFor(() => {
          expect(screen.getByText('생성된 스토리 내용')).toBeInTheDocument();
        }, { timeout: 5000 });

        expect(screen.getByText(/인쇄/)).toBeInTheDocument();
      }
    });
  });

  describe('분석 탭', () => {
    it('분석 탭이 표시되어야 함', () => {
      render(<CreativeWriting />);
      const tabs = screen.getAllByRole('tab');
      const analysisTab = tabs.find(tab => tab.textContent?.includes('분석'));
      expect(analysisTab).toBeInTheDocument();
    });

    it('분석 탭 클릭 시 분석 폼이 표시되어야 함', () => {
      render(<CreativeWriting />);
      const tabs = screen.getAllByRole('tab');
      const analysisTab = tabs.find(tab => tab.textContent?.includes('분석'));

      if (analysisTab) {
        fireEvent.click(analysisTab);
        expect(screen.getByText(/글쓰기 분석/)).toBeInTheDocument();
        expect(screen.getByLabelText(/분석할 텍스트를 입력하세요/)).toBeInTheDocument();
      }
    });

    it('분석할 텍스트 입력 후 분석 버튼이 활성화되어야 함', () => {
      render(<CreativeWriting />);
      const tabs = screen.getAllByRole('tab');
      const analysisTab = tabs.find(tab => tab.textContent?.includes('분석'));

      if (analysisTab) {
        fireEvent.click(analysisTab);

        const textarea = screen.getByLabelText(/분석할 텍스트를 입력하세요/);
        fireEvent.change(textarea, { target: { value: '테스트 텍스트입니다.' } });

        const analyzeButton = screen.getByText(/분석하기/);
        expect(analyzeButton).not.toBeDisabled();
      }
    });

    it('분석 성공 시 결과가 표시되어야 함', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            word_count: 10,
            sentence_count: 2,
            reading_level: '보통',
            emotion_tone: '긍정적',
            writing_style: '서술형',
            suggestions: ['문장을 더 간결하게 작성하세요.']
          }
        }),
      });

      render(<CreativeWriting />);
      const tabs = screen.getAllByRole('tab');
      const analysisTab = tabs.find(tab => tab.textContent?.includes('분석'));

      if (analysisTab) {
        fireEvent.click(analysisTab);

        const textarea = screen.getByLabelText(/분석할 텍스트를 입력하세요/);
        fireEvent.change(textarea, { target: { value: '테스트 텍스트입니다.' } });

        const analyzeButton = screen.getByText(/분석하기/);
        fireEvent.click(analyzeButton);

        await waitFor(() => {
          expect(screen.getByText(/분석 결과/)).toBeInTheDocument();
          expect(screen.getByText(/10/)).toBeInTheDocument(); // 단어 수
          expect(screen.getByText(/2/)).toBeInTheDocument(); // 문장 수
        }, { timeout: 3000 });
      }
    });

    it('분석 실패 시 에러 메시지가 표시되어야 함', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          error: '분석 실패'
        }),
      });

      render(<CreativeWriting />);
      const tabs = screen.getAllByRole('tab');
      const analysisTab = tabs.find(tab => tab.textContent?.includes('분석'));

      if (analysisTab) {
        fireEvent.click(analysisTab);

        const textarea = screen.getByLabelText(/분석할 텍스트를 입력하세요/);
        fireEvent.change(textarea, { target: { value: '테스트 텍스트입니다.' } });

        const analyzeButton = screen.getByText(/분석하기/);
        fireEvent.click(analyzeButton);

        await waitFor(() => {
          expect(screen.getByText(/분석 실패/)).toBeInTheDocument();
        }, { timeout: 3000 });
      }
    });
  });
});

