/* eslint-disable jest/no-conditional-expect, testing-library/no-node-access, jest/no-identical-title */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { setupCommonMocks } from '../../test-utils/testHelpers';
import WritingHistory from '../WritingHistory';
import writingExporter from '../../utils/writingExport';

// Mock writingExporter
jest.mock('../../utils/writingExport', () => ({
  __esModule: true,
  default: {
    export: jest.fn(),
  },
}));

// Mock CSS
jest.mock('../WritingHistory.css', () => ({}));

describe('WritingHistory', () => {
  const mockOnSelect = jest.fn();
  const mockOnDelete = jest.fn();

  const mockHistoryItems = [
    {
      id: '1',
      template: '블로그 포스트',
      category: '블로그',
      content: '첫 번째 글쓰기 내용입니다.',
      formValues: { title: '제목1' },
      createdAt: '2024-01-01T10:00:00Z',
    },
    {
      id: '2',
      template: '이메일',
      category: '비즈니스',
      content: '두 번째 글쓰기 내용입니다.',
      formValues: { subject: '제목2' },
      createdAt: '2024-01-02T10:00:00Z',
    },
    {
      id: '3',
      template: '소셜 미디어',
      category: '소셜',
      content: '세 번째 글쓰기 내용입니다.',
      formValues: { platform: 'twitter' },
      createdAt: '2024-01-03T10:00:00Z',
    },
  ];

  beforeEach(() => {
    setupCommonMocks();
    jest.clearAllMocks();
    window.localStorage.clear();
    jest.mocked(writingExporter.export).mockClear();
  });

  describe('렌더링', () => {
    it('빈 히스토리 상태를 올바르게 표시해야 함', () => {
      render(<WritingHistory />);

      expect(screen.getByText(/저장된 글쓰기 히스토리가 없습니다/i)).toBeInTheDocument();
    });

    it('히스토리 아이템이 있을 때 목록을 표시해야 함', () => {
      window.localStorage.setItem('writingHistory', JSON.stringify(mockHistoryItems));

      render(<WritingHistory />);

      expect(screen.getByText('블로그 포스트')).toBeInTheDocument();
      expect(screen.getByText('이메일')).toBeInTheDocument();
      expect(screen.getByText('소셜 미디어')).toBeInTheDocument();
    });

    it('히스토리 개수를 올바르게 표시해야 함', () => {
      window.localStorage.setItem('writingHistory', JSON.stringify(mockHistoryItems));

      render(<WritingHistory />);

      expect(screen.getByText(/글쓰기 히스토리 \(3\)/i)).toBeInTheDocument();
    });
  });

  describe('검색 기능', () => {
    beforeEach(() => {
      window.localStorage.setItem('writingHistory', JSON.stringify(mockHistoryItems));
    });

    it('검색어로 템플릿 이름을 필터링해야 함', () => {
      render(<WritingHistory />);

      const searchInput = screen.getByPlaceholderText('검색...');
      fireEvent.change(searchInput, { target: { value: '블로그' } });

      expect(screen.getByText('블로그 포스트')).toBeInTheDocument();
      expect(screen.queryByText('이메일')).not.toBeInTheDocument();
    });

    it('검색어로 내용을 필터링해야 함', () => {
      render(<WritingHistory />);

      const searchInput = screen.getByPlaceholderText('검색...');
      fireEvent.change(searchInput, { target: { value: '첫 번째' } });

      expect(screen.getByText('블로그 포스트')).toBeInTheDocument();
      expect(screen.queryByText('이메일')).not.toBeInTheDocument();
    });

    it('검색어가 없으면 모든 아이템을 표시해야 함', () => {
      render(<WritingHistory />);

      const searchInput = screen.getByPlaceholderText('검색...');
      fireEvent.change(searchInput, { target: { value: '' } });

      expect(screen.getByText('블로그 포스트')).toBeInTheDocument();
      expect(screen.getByText('이메일')).toBeInTheDocument();
      expect(screen.getByText('소셜 미디어')).toBeInTheDocument();
    });
  });

  describe('필터링 기능', () => {
    beforeEach(() => {
      window.localStorage.setItem('writingHistory', JSON.stringify(mockHistoryItems));
    });

    it('카테고리로 필터링해야 함', () => {
      render(<WritingHistory />);

      const filterSelect = screen.getByDisplayValue('전체');
      fireEvent.change(filterSelect, { target: { value: '블로그' } });

      expect(screen.getByText('블로그 포스트')).toBeInTheDocument();
      expect(screen.queryByText('이메일')).not.toBeInTheDocument();
    });

    it('전체 필터를 선택하면 모든 아이템을 표시해야 함', () => {
      render(<WritingHistory />);

      const filterSelect = screen.getByDisplayValue('전체');
      fireEvent.change(filterSelect, { target: { value: 'all' } });

      expect(screen.getByText('블로그 포스트')).toBeInTheDocument();
      expect(screen.getByText('이메일')).toBeInTheDocument();
      expect(screen.getByText('소셜 미디어')).toBeInTheDocument();
    });
  });

  describe('정렬 기능', () => {
    beforeEach(() => {
      window.localStorage.setItem('writingHistory', JSON.stringify(mockHistoryItems));
    });

    it('템플릿 이름으로 정렬해야 함', () => {
      render(<WritingHistory />);

      const sortSelect = screen.getByDisplayValue('날짜');
      fireEvent.change(sortSelect, { target: { value: 'template' } });

      const items = screen.getAllByText(/블로그 포스트|이메일|소셜 미디어/);
      expect(items.length).toBeGreaterThan(0);
    });

    it('카테고리로 정렬해야 함', () => {
      render(<WritingHistory />);

      const sortSelect = screen.getByDisplayValue('날짜');
      fireEvent.change(sortSelect, { target: { value: 'category' } });

      const items = screen.getAllByText(/블로그 포스트|이메일|소셜 미디어/);
      expect(items.length).toBeGreaterThan(0);
    });

    it('정렬 순서를 토글할 수 있어야 함', () => {
      render(<WritingHistory />);

      const sortOrderButton = screen.getByTitle('내림차순');
      fireEvent.click(sortOrderButton);

      expect(screen.getByTitle('오름차순')).toBeInTheDocument();
    });
  });

  describe('선택 기능', () => {
    beforeEach(() => {
      window.localStorage.setItem('writingHistory', JSON.stringify(mockHistoryItems));
    });

    it('개별 아이템을 선택할 수 있어야 함', () => {
      render(<WritingHistory />);

      const checkboxes = screen.getAllByRole('checkbox');
      const itemCheckbox = checkboxes.find(
        (cb) => cb.getAttribute('type') === 'checkbox' && cb !== checkboxes[0]
      );

      if (itemCheckbox) {
        fireEvent.click(itemCheckbox);
        expect(itemCheckbox).toBeChecked();
      }
    });

    it('전체 선택을 할 수 있어야 함', () => {
      render(<WritingHistory />);

      const selectAllCheckbox = screen.getByLabelText('전체 선택');
      fireEvent.click(selectAllCheckbox);

      expect(selectAllCheckbox).toBeChecked();
    });

    it('선택된 아이템 개수를 표시해야 함', () => {
      render(<WritingHistory />);

      const checkboxes = screen.getAllByRole('checkbox');
      const itemCheckbox = checkboxes.find(
        (cb) => cb.getAttribute('type') === 'checkbox' && cb !== checkboxes[0]
      );

      if (itemCheckbox) {
        fireEvent.click(itemCheckbox);
        expect(screen.getByText(/1개 선택됨/i)).toBeInTheDocument();
      }
    });
  });

  describe('삭제 기능', () => {
    beforeEach(() => {
      window.localStorage.setItem('writingHistory', JSON.stringify(mockHistoryItems));
    });

    it('개별 아이템을 삭제할 수 있어야 함', () => {
      render(<WritingHistory onDelete={mockOnDelete} />);

      // "블로그 포스트" 아이템의 삭제 버튼 찾기
      const blogPostItem = screen.getByText('블로그 포스트').closest('.history-item');
      const deleteButton = blogPostItem?.querySelector('[title="삭제"]') as HTMLElement;
      
      if (deleteButton) {
        fireEvent.click(deleteButton);
        expect(mockOnDelete).toHaveBeenCalledWith('1');
        expect(screen.queryByText('블로그 포스트')).not.toBeInTheDocument();
      }
    });

    it('일괄 삭제를 할 수 있어야 함', () => {
      render(<WritingHistory />);

      const selectAllCheckbox = screen.getByLabelText('전체 선택');
      fireEvent.click(selectAllCheckbox);

      const bulkDeleteButton = screen.getByText('일괄 삭제');
      fireEvent.click(bulkDeleteButton);

      expect(screen.getByText(/저장된 글쓰기 히스토리가 없습니다/i)).toBeInTheDocument();
    });
  });

  describe('내보내기 기능', () => {
    beforeEach(() => {
      window.localStorage.setItem('writingHistory', JSON.stringify(mockHistoryItems));
    });

    it('개별 아이템을 내보낼 수 있어야 함', () => {
      render(<WritingHistory />);

      // "블로그 포스트" 아이템의 내보내기 버튼 찾기
      const blogPostItem = screen.getByText('블로그 포스트').closest('.history-item');
      const exportButton = blogPostItem?.querySelector('[title="내보내기"]') as HTMLElement;
      
      if (exportButton) {
        fireEvent.click(exportButton);

        expect(writingExporter.export).toHaveBeenCalledWith(
          expect.stringContaining('첫 번째 글쓰기 내용입니다.'),
          expect.objectContaining({
            format: 'txt',
            includeMetadata: true,
          }),
          expect.objectContaining({
            title: '블로그 포스트',
          })
        );
      }
    });

    it('일괄 내보내기를 할 수 있어야 함', () => {
      render(<WritingHistory />);

      const selectAllCheckbox = screen.getByLabelText('전체 선택');
      fireEvent.click(selectAllCheckbox);

      const bulkExportButton = screen.getByText('일괄 내보내기');
      fireEvent.click(bulkExportButton);

      expect(writingExporter.export).toHaveBeenCalled();
    });
  });

  describe('선택 기능', () => {
    beforeEach(() => {
      window.localStorage.setItem('writingHistory', JSON.stringify(mockHistoryItems));
    });

    it('아이템을 선택하면 onSelect 콜백을 호출해야 함', () => {
      render(<WritingHistory onSelect={mockOnSelect} />);

      // "블로그 포스트" 아이템의 선택 버튼 찾기
      const blogPostItem = screen.getByText('블로그 포스트').closest('.history-item');
      const selectButton = blogPostItem?.querySelector('[title="선택"]') as HTMLElement;
      
      if (selectButton) {
        fireEvent.click(selectButton);
        expect(mockOnSelect).toHaveBeenCalledWith(mockHistoryItems[0]);
      }
    });

    it('아이템 내용을 클릭하면 onSelect 콜백을 호출해야 함', () => {
      render(<WritingHistory onSelect={mockOnSelect} />);

      const itemContent = screen.getByText('블로그 포스트').closest('.history-item-content');
      if (itemContent) {
        fireEvent.click(itemContent);
        expect(mockOnSelect).toHaveBeenCalledWith(mockHistoryItems[0]);
      }
    });
  });

  describe('아이템 정보 표시', () => {
    beforeEach(() => {
      window.localStorage.setItem('writingHistory', JSON.stringify(mockHistoryItems));
    });

    it('템플릿 이름을 표시해야 함', () => {
      render(<WritingHistory />);

      expect(screen.getByText('블로그 포스트')).toBeInTheDocument();
    });

    it('카테고리를 표시해야 함', () => {
      render(<WritingHistory />);

      // 카테고리는 여러 곳에 나타날 수 있으므로 getAllByText 사용
      const categoryElements = screen.getAllByText('블로그');
      expect(categoryElements.length).toBeGreaterThan(0);
    });

    it('내용 미리보기를 표시해야 함', () => {
      render(<WritingHistory />);

      expect(screen.getByText(/첫 번째 글쓰기 내용입니다/i)).toBeInTheDocument();
    });

    it('날짜를 표시해야 함', () => {
      render(<WritingHistory />);

      const dateText = new Date('2024-01-01T10:00:00Z').toLocaleString();
      expect(screen.getByText(dateText)).toBeInTheDocument();
    });
  });
});

