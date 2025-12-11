/**
 * WritingAISuggestions 컴포넌트 테스트
 * AI 글쓰기 제안 기능 확인
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock CSS
jest.mock('../WritingAISuggestions.css', () => ({}));

// Mock fetch
global.fetch = jest.fn();

import WritingAISuggestions from '../WritingAISuggestions';

describe('WritingAISuggestions', () => {
  const mockOnApply = jest.fn();
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('기본 렌더링', () => {
    it('짧은 내용일 때 제안을 표시하지 않아야 함', () => {
      render(<WritingAISuggestions content="짧은 내용" />);
      expect(screen.queryByText(/AI 제안/i)).not.toBeInTheDocument();
    });

    it('긴 내용일 때 제안을 생성해야 함', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      render(<WritingAISuggestions content="이것은 충분히 긴 내용입니다. 최소 50자 이상이어야 합니다. 이 내용은 테스트를 위한 충분한 길이를 가지고 있습니다." />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('로딩 상태', () => {
    it('제안 생성 중 로딩 메시지를 표시해야 함', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(
        () => new Promise(() => {}) // 무한 대기
      );

      render(<WritingAISuggestions content="이것은 충분히 긴 내용입니다. 최소 50자 이상이어야 합니다. 이 내용은 테스트를 위한 충분한 길이를 가지고 있습니다." />);

      await waitFor(() => {
        expect(screen.getByText(/AI 제안을 생성하는 중/i)).toBeInTheDocument();
      });
    });
  });

  describe('로컬 제안 생성', () => {
    it('구조 개선 제안을 생성해야 함', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const longContent = Array(150).fill('단어').join(' ');
      render(<WritingAISuggestions content={longContent} />);

      await waitFor(() => {
        expect(screen.getByText(/구조 개선/i)).toBeInTheDocument();
      });
    });

    it('문장 간소화 제안을 생성해야 함', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      // 평균 단어 수가 25 이상인 긴 문장들
      const longSentences = Array(5).fill(Array(30).fill('단어').join(' ')).join('. ');
      render(<WritingAISuggestions content={longSentences} />);

      await waitFor(() => {
        expect(screen.getByText(/문장 간소화/i)).toBeInTheDocument();
      });
    });

    it('내용 확장 제안을 생성해야 함', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const shortContent = Array(100).fill('단어').join(' ');
      render(<WritingAISuggestions content={shortContent} template="블로그 포스트" />);

      await waitFor(() => {
        expect(screen.getByText(/내용 확장/i)).toBeInTheDocument();
      });
    });

    it('어투 조정 제안을 생성해야 함', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const content = Array(100).fill('단어').join(' ');
      render(<WritingAISuggestions content={content} template="이메일" />);

      await waitFor(() => {
        expect(screen.getByText(/어투 조정/i)).toBeInTheDocument();
      });
    });
  });

  describe('백엔드 API 호출', () => {
    it('백엔드 API를 호출해야 함', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          suggestions: [
            {
              id: 'api-1',
              type: 'improvement',
              title: 'API 제안',
              description: '백엔드에서 생성된 제안',
              suggestion: '이것은 API 제안입니다.',
              confidence: 0.9,
              priority: 'high',
            },
          ],
        }),
      });

      const content = Array(100).fill('단어').join(' ');
      render(<WritingAISuggestions content={content} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/v7/writing/suggestions',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          })
        );
      });
    });

    it('API 응답이 성공하면 제안을 표시해야 함', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          suggestions: [
            {
              id: 'api-1',
              type: 'improvement',
              title: 'API 제안',
              description: '백엔드에서 생성된 제안',
              suggestion: '이것은 API 제안입니다.',
              confidence: 0.9,
              priority: 'high',
            },
          ],
        }),
      });

      const content = Array(100).fill('단어').join(' ');
      render(<WritingAISuggestions content={content} />);

      await waitFor(() => {
        expect(screen.getByText(/API 제안/i)).toBeInTheDocument();
      });
    });

    it('API 응답이 실패하면 로컬 제안을 생성해야 함', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const longContent = Array(150).fill('단어').join(' ');
      render(<WritingAISuggestions content={longContent} />);

      await waitFor(() => {
        expect(screen.getByText(/구조 개선/i)).toBeInTheDocument();
      });
    });

    it('API 호출 에러 시 로컬 제안을 생성해야 함', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const longContent = Array(150).fill('단어').join(' ');
      render(<WritingAISuggestions content={longContent} />);

      await waitFor(() => {
        expect(screen.getByText(/구조 개선/i)).toBeInTheDocument();
      });
    });
  });

  describe('제안 표시', () => {
    beforeEach(async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          suggestions: [
            {
              id: 'suggestion-1',
              type: 'improvement',
              title: '제안 제목',
              description: '제안 설명',
              suggestion: '제안 내용',
              confidence: 0.8,
              priority: 'high',
            },
          ],
        }),
      });
    });

    it('제안 제목을 표시해야 함', async () => {
      const content = Array(100).fill('단어').join(' ');
      render(<WritingAISuggestions content={content} />);

      await waitFor(() => {
        expect(screen.getByText(/제안 제목/i)).toBeInTheDocument();
      });
    });

    it('제안 설명을 표시해야 함', async () => {
      const content = Array(100).fill('단어').join(' ');
      render(<WritingAISuggestions content={content} />);

      await waitFor(() => {
        expect(screen.getByText(/제안 설명/i)).toBeInTheDocument();
      });
    });

    it('제안 내용을 표시해야 함', async () => {
      const content = Array(100).fill('단어').join(' ');
      render(<WritingAISuggestions content={content} />);

      await waitFor(() => {
        expect(screen.getByText(/제안 제목/i)).toBeInTheDocument();
      });

      // 제안 헤더를 클릭하여 확장
      const suggestionHeader = screen.getByText(/제안 제목/i).closest('.suggestion-header');
      if (suggestionHeader) {
        fireEvent.click(suggestionHeader);
      }

      await waitFor(() => {
        expect(screen.getByText(/제안 내용/i)).toBeInTheDocument();
      });
    });
  });

  describe('제안 적용', () => {
    beforeEach(async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          suggestions: [
            {
              id: 'suggestion-1',
              type: 'improvement',
              title: '제안 제목',
              description: '제안 설명',
              suggestion: '제안 내용',
              confidence: 0.8,
              priority: 'high',
            },
          ],
        }),
      });
    });

    it('적용 버튼을 클릭하면 onApply 콜백이 호출되어야 함', async () => {
      const content = Array(100).fill('단어').join(' ');
      render(<WritingAISuggestions content={content} onApply={mockOnApply} />);

      await waitFor(() => {
        expect(screen.getByText(/제안 제목/i)).toBeInTheDocument();
      });

      // 제안 헤더를 클릭하여 확장
      const suggestionHeader = screen.getByText(/제안 제목/i).closest('.suggestion-header');
      if (suggestionHeader) {
        fireEvent.click(suggestionHeader);
      }

      await waitFor(() => {
        const applyButton = screen.getByText(/적용하기/i);
        fireEvent.click(applyButton);
      });

      expect(mockOnApply).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'suggestion-1',
          title: '제안 제목',
        })
      );
    });

    it('제안 적용 후 제안이 제거되어야 함', async () => {
      const content = Array(100).fill('단어').join(' ');
      render(<WritingAISuggestions content={content} onApply={mockOnApply} />);

      await waitFor(() => {
        expect(screen.getByText(/제안 제목/i)).toBeInTheDocument();
      });

      // 제안 헤더를 클릭하여 확장
      const suggestionHeader = screen.getByText(/제안 제목/i).closest('.suggestion-header');
      if (suggestionHeader) {
        fireEvent.click(suggestionHeader);
      }

      await waitFor(() => {
        const applyButton = screen.getByText(/적용하기/i);
        fireEvent.click(applyButton);
      });

      await waitFor(() => {
        expect(screen.queryByText(/제안 제목/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('제안 무시', () => {
    beforeEach(async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          suggestions: [
            {
              id: 'suggestion-1',
              type: 'improvement',
              title: '제안 제목',
              description: '제안 설명',
              suggestion: '제안 내용',
              confidence: 0.8,
              priority: 'high',
            },
          ],
        }),
      });
    });

    it('무시 버튼을 클릭하면 onDismiss 콜백이 호출되어야 함', async () => {
      const content = Array(100).fill('단어').join(' ');
      render(<WritingAISuggestions content={content} onDismiss={mockOnDismiss} />);

      await waitFor(() => {
        expect(screen.getByText(/제안 제목/i)).toBeInTheDocument();
      });

      // 제안 헤더를 클릭하여 확장
      const suggestionHeader = screen.getByText(/제안 제목/i).closest('.suggestion-header');
      if (suggestionHeader) {
        fireEvent.click(suggestionHeader);
      }

      await waitFor(() => {
        const dismissButton = screen.getByText(/무시하기/i);
        fireEvent.click(dismissButton);
      });

      expect(mockOnDismiss).toHaveBeenCalledWith('suggestion-1');
    });

    it('제안 무시 후 제안이 제거되어야 함', async () => {
      const content = Array(100).fill('단어').join(' ');
      render(<WritingAISuggestions content={content} onDismiss={mockOnDismiss} />);

      await waitFor(() => {
        expect(screen.getByText(/제안 제목/i)).toBeInTheDocument();
      });

      // 제안 헤더를 클릭하여 확장
      const suggestionHeader = screen.getByText(/제안 제목/i).closest('.suggestion-header');
      if (suggestionHeader) {
        fireEvent.click(suggestionHeader);
      }

      await waitFor(() => {
        const dismissButton = screen.getByText(/무시하기/i);
        fireEvent.click(dismissButton);
      });

      await waitFor(() => {
        expect(screen.queryByText(/제안 제목/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('내용 변경', () => {
    it('내용이 변경되면 새로운 제안을 생성해야 함', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
      });

      const { rerender } = render(
        <WritingAISuggestions content="이것은 충분히 긴 내용입니다. 최소 50자 이상이어야 합니다. 이 내용은 테스트를 위한 충분한 길이를 가지고 있습니다." />
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const callCountBefore = (global.fetch as jest.Mock).mock.calls.length;

      rerender(
        <WritingAISuggestions content="이것은 변경된 충분히 긴 내용입니다. 최소 50자 이상이어야 합니다. 이 내용은 테스트를 위한 충분한 길이를 가지고 있습니다." />
      );

      await waitFor(() => {
        expect((global.fetch as jest.Mock).mock.calls.length).toBeGreaterThan(callCountBefore);
      });
    });

    it('내용이 짧아지면 제안을 제거해야 함', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { rerender } = render(
        <WritingAISuggestions content="이것은 충분히 긴 내용입니다. 최소 50자 이상이어야 합니다. 이 내용은 테스트를 위한 충분한 길이를 가지고 있습니다." />
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      rerender(<WritingAISuggestions content="짧은 내용" />);

      await waitFor(() => {
        expect(screen.queryByText(/AI 제안/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('템플릿 변경', () => {
    it('템플릿이 변경되면 새로운 제안을 생성해야 함', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
      });

      const content = Array(100).fill('단어').join(' ');
      const { rerender } = render(<WritingAISuggestions content={content} template="블로그 포스트" />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const callCountBefore = (global.fetch as jest.Mock).mock.calls.length;

      rerender(<WritingAISuggestions content={content} template="이메일" />);

      await waitFor(() => {
        expect((global.fetch as jest.Mock).mock.calls.length).toBeGreaterThan(callCountBefore);
      });
    });
  });
});

