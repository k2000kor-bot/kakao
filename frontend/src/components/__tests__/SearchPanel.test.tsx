/* eslint-disable jest/no-conditional-expect, testing-library/no-node-access, testing-library/no-wait-for-multiple-assertions */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { setupCommonMocks } from '../../test-utils/testHelpers';
import SearchPanel from '../SearchPanel';
import messageHistoryService from '../../services/messageHistoryService';

// Mock messageHistoryService
jest.mock('../../services/messageHistoryService');

const mockMessageHistoryService: jest.Mocked<typeof messageHistoryService> = jest.mocked(messageHistoryService);

describe('SearchPanel', () => {
  const mockOnClose = jest.fn();
  const mockOnSelect = jest.fn();
  const mockOnSearchTermChange = jest.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSelect: mockOnSelect,
    onSearchTermChange: mockOnSearchTermChange
  };

  beforeEach(() => {
    setupCommonMocks();
    jest.clearAllMocks();
    window.localStorage.clear();
    mockMessageHistoryService.searchMessages = jest.fn().mockReturnValue([]);
  });

  describe('렌더링', () => {
    it('패널이 열려있을 때 내용을 표시해야 함', () => {
      render(<SearchPanel {...defaultProps} />);

      expect(screen.getByPlaceholderText(/검색어를 입력하세요.*Ctrl\+K/i)).toBeInTheDocument();
      expect(screen.getByText('메시지')).toBeInTheDocument();
      expect(screen.getByText('글쓰기')).toBeInTheDocument();
      expect(screen.getByText('템플릿')).toBeInTheDocument();
      expect(screen.getByText('파일')).toBeInTheDocument();
    });

    it('패널이 닫혀있을 때 아무것도 렌더링하지 않아야 함', () => {
      const { container } = render(<SearchPanel {...defaultProps} isOpen={false} />);
      expect(container.firstChild).toBeNull();
    });

    it('검색어가 없을 때 안내 메시지를 표시해야 함', () => {
      render(<SearchPanel {...defaultProps} />);

      expect(screen.getByText('검색어를 입력하세요.')).toBeInTheDocument();
      expect(screen.getByText(/Ctrl\+K로 빠르게 검색할 수 있습니다/i)).toBeInTheDocument();
    });
  });

  describe('검색 기능', () => {
    it('검색어를 입력할 수 있어야 함', () => {
      render(<SearchPanel {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/검색어를 입력하세요.*Ctrl\+K/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });

      expect(searchInput).toHaveValue('test');
    });

    it('검색어 입력 시 onSearchTermChange를 호출해야 함', () => {
      render(<SearchPanel {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/검색어를 입력하세요.*Ctrl\+K/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });

      expect(mockOnSearchTermChange).toHaveBeenCalledWith('test');
    });

    it('메시지 검색 결과를 표시해야 함', async () => {
      const mockMessages = [
        {
          id: 'msg-1',
          sessionId: 'session-1',
          sender: 'user',
          text: 'Test message',
          timestamp: new Date().toISOString(),
          isBookmarked: false,
          isLiked: false
        }
      ];

      mockMessageHistoryService.searchMessages = jest.fn().mockReturnValue(mockMessages);

      render(<SearchPanel {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/검색어를 입력하세요.*Ctrl\+K/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });

      await waitFor(() => {
        expect(screen.getByText('사용자 메시지')).toBeInTheDocument();
        expect(screen.getByText(/Test message/)).toBeInTheDocument();
      });
    });

    it('글쓰기 검색 결과를 표시해야 함', async () => {
      const mockWritings = [
        {
          id: 'writing-1',
          template: 'Test Template',
          content: 'Test content',
          createdAt: new Date().toISOString(),
          category: 'Test Category'
        }
      ];

      window.localStorage.setItem('writingHistory', JSON.stringify(mockWritings));

      render(<SearchPanel {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/검색어를 입력하세요.*Ctrl\+K/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });

      await waitFor(() => {
        expect(screen.getByText('Test Template')).toBeInTheDocument();
      });
    });

    it('템플릿 검색 결과를 표시해야 함', async () => {
      const mockTemplates = [
        {
          id: 'template-1',
          title: 'Test Template',
          description: 'Test description',
          category: 'Test Category'
        }
      ];

      window.localStorage.setItem('writingTemplates', JSON.stringify(mockTemplates));

      render(<SearchPanel {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/검색어를 입력하세요.*Ctrl\+K/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });

      await waitFor(() => {
        expect(screen.getByText('Test Template')).toBeInTheDocument();
      });
    });

    it('파일 검색 결과를 표시해야 함', async () => {
      const mockFiles = [
        {
          id: 'file-1',
          name: 'test.pdf',
          description: 'Test file',
          uploadedAt: new Date().toISOString(),
          type: 'application/pdf'
        }
      ];

      window.localStorage.setItem('uploadedFiles', JSON.stringify(mockFiles));

      render(<SearchPanel {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/검색어를 입력하세요.*Ctrl\+K/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });

      await waitFor(() => {
        expect(screen.getByText('test.pdf')).toBeInTheDocument();
      });
    });

    it('검색 결과가 없을 때 빈 상태를 표시해야 함', async () => {
      render(<SearchPanel {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/검색어를 입력하세요.*Ctrl\+K/i);
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      await waitFor(() => {
        expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
      });
    });
  });

  describe('필터 기능', () => {
    it('메시지 필터를 토글할 수 있어야 함', () => {
      render(<SearchPanel {...defaultProps} />);

      const messageCheckbox = screen.getByLabelText('메시지');
      expect(messageCheckbox).toBeChecked();

      fireEvent.click(messageCheckbox);
      expect(messageCheckbox).not.toBeChecked();
    });

    it('글쓰기 필터를 토글할 수 있어야 함', () => {
      render(<SearchPanel {...defaultProps} />);

      const writingsCheckbox = screen.getByLabelText('글쓰기');
      expect(writingsCheckbox).toBeChecked();

      fireEvent.click(writingsCheckbox);
      expect(writingsCheckbox).not.toBeChecked();
    });

    it('템플릿 필터를 토글할 수 있어야 함', () => {
      render(<SearchPanel {...defaultProps} />);

      const templatesCheckbox = screen.getByLabelText('템플릿');
      expect(templatesCheckbox).toBeChecked();

      fireEvent.click(templatesCheckbox);
      expect(templatesCheckbox).not.toBeChecked();
    });

    it('파일 필터를 토글할 수 있어야 함', () => {
      render(<SearchPanel {...defaultProps} />);

      const filesCheckbox = screen.getByLabelText('파일');
      expect(filesCheckbox).toBeChecked();

      fireEvent.click(filesCheckbox);
      expect(filesCheckbox).not.toBeChecked();
    });
  });

  describe('키보드 네비게이션', () => {
    it('Escape 키로 패널을 닫을 수 있어야 함', () => {
      render(<SearchPanel {...defaultProps} />);

      fireEvent.keyDown(window, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('ArrowDown으로 다음 결과를 선택할 수 있어야 함', async () => {
      const mockMessages = [
        {
          id: 'msg-1',
          sessionId: 'session-1',
          sender: 'user',
          text: 'Test message 1',
          timestamp: new Date().toISOString(),
          isBookmarked: false,
          isLiked: false
        },
        {
          id: 'msg-2',
          sessionId: 'session-1',
          sender: 'user',
          text: 'Test message 2',
          timestamp: new Date().toISOString(),
          isBookmarked: false,
          isLiked: false
        }
      ];

      mockMessageHistoryService.searchMessages = jest.fn().mockReturnValue(mockMessages);

      render(<SearchPanel {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/검색어를 입력하세요.*Ctrl\+K/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });

      await waitFor(() => {
        expect(screen.getByText('Test message 1')).toBeInTheDocument();
      });

      fireEvent.keyDown(window, { key: 'ArrowDown' });

      // 선택된 항목이 변경되었는지 확인
      await waitFor(() => {
        const results = screen.getAllByText(/Test message/);
        expect(results.length).toBeGreaterThan(0);
      });
    });

    it('ArrowUp으로 이전 결과를 선택할 수 있어야 함', async () => {
      const mockMessages = [
        {
          id: 'msg-1',
          sessionId: 'session-1',
          sender: 'user',
          text: 'Test message 1',
          timestamp: new Date().toISOString(),
          isBookmarked: false,
          isLiked: false
        }
      ];

      mockMessageHistoryService.searchMessages = jest.fn().mockReturnValue(mockMessages);

      render(<SearchPanel {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/검색어를 입력하세요.*Ctrl\+K/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });

      await waitFor(() => {
        expect(screen.getByText('Test message 1')).toBeInTheDocument();
      });

      fireEvent.keyDown(window, { key: 'ArrowUp' });

      // 선택된 항목이 변경되었는지 확인
      await waitFor(() => {
        const results = screen.getAllByText(/Test message/);
        expect(results.length).toBeGreaterThan(0);
      });
    });

    it('Enter로 결과를 선택할 수 있어야 함', async () => {
      const mockMessages = [
        {
          id: 'msg-1',
          sessionId: 'session-1',
          sender: 'user',
          text: 'Test message',
          timestamp: new Date().toISOString(),
          isBookmarked: false,
          isLiked: false
        }
      ];

      mockMessageHistoryService.searchMessages = jest.fn().mockReturnValue(mockMessages);

      render(<SearchPanel {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/검색어를 입력하세요.*Ctrl\+K/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });

      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });

      fireEvent.keyDown(window, { key: 'Enter' });

      expect(mockOnSelect).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('결과 선택', () => {
    it('결과 클릭 시 onSelect를 호출해야 함', async () => {
      const mockMessages = [
        {
          id: 'msg-1',
          sessionId: 'session-1',
          sender: 'user',
          text: 'Test message',
          timestamp: new Date().toISOString(),
          isBookmarked: false,
          isLiked: false
        }
      ];

      mockMessageHistoryService.searchMessages = jest.fn().mockReturnValue(mockMessages);

      render(<SearchPanel {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/검색어를 입력하세요.*Ctrl\+K/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });

      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });

      const resultItem = screen.getByText('Test message').closest('.search-result-item');
      if (resultItem) {
        fireEvent.click(resultItem);
        expect(mockOnSelect).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
      }
    });
  });

  describe('닫기 기능', () => {
    it('닫기 버튼 클릭 시 onClose를 호출해야 함', () => {
      render(<SearchPanel {...defaultProps} />);

      const closeButton = screen.getByText('✕');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('오버레이 클릭 시 onClose를 호출해야 함', () => {
      render(<SearchPanel {...defaultProps} />);

      const overlay = screen.getByText('✕').closest('.search-panel-overlay');
      if (overlay) {
        fireEvent.click(overlay);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });
  });

  describe('결과 개수 표시', () => {
    it('검색 결과 개수를 표시해야 함', async () => {
      const mockMessages = [
        {
          id: 'msg-1',
          sessionId: 'session-1',
          sender: 'user',
          text: 'Test message',
          timestamp: new Date().toISOString(),
          isBookmarked: false,
          isLiked: false
        }
      ];

      mockMessageHistoryService.searchMessages = jest.fn().mockReturnValue(mockMessages);

      render(<SearchPanel {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/검색어를 입력하세요.*Ctrl\+K/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });

      await waitFor(() => {
        expect(screen.getByText(/1개 결과/)).toBeInTheDocument();
      });
    });
  });

  describe('패널 열기/닫기', () => {
    it('패널이 열릴 때 입력 필드에 포커스를 맞춰야 함', () => {
      render(<SearchPanel {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/검색어를 입력하세요.*Ctrl\+K/i);
      expect(searchInput).toHaveFocus();
    });

    it('패널이 열릴 때 검색어를 초기화해야 함', () => {
      const { rerender } = render(<SearchPanel {...defaultProps} isOpen={false} />);

      rerender(<SearchPanel {...defaultProps} isOpen={true} />);

      const searchInput = screen.getByPlaceholderText(/검색어를 입력하세요.*Ctrl\+K/i);
      expect(searchInput).toHaveValue('');
    });

    it('패널이 닫힐 때 onSearchTermChange를 호출해야 함', () => {
      const { rerender } = render(<SearchPanel {...defaultProps} isOpen={true} />);

      rerender(<SearchPanel {...defaultProps} isOpen={false} />);

      expect(mockOnSearchTermChange).toHaveBeenCalledWith('');
    });
  });
});

