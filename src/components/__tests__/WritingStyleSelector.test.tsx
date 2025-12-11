import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import WritingStyleSelector from '../WritingStyleSelector';
import writingStyleService from '../../services/writingStyleService';

// Mock writingStyleService
jest.mock('../../services/writingStyleService');

const mockWritingStyleService = writingStyleService as jest.Mocked<typeof writingStyleService>;

describe('WritingStyleSelector', () => {
  const mockOnStyleSelect = jest.fn();

  const mockStyles = [
    {
      id: 'style-1',
      name: '소설',
      category: 'literature' as const,
      description: '소설 쓰기 스타일',
      characteristics: ['서사', '인물', '플롯'],
      tone: '문학적',
      structure: '3막 구조',
      examplePrompt: '소설을 작성해주세요',
      icon: '📖',
    },
    {
      id: 'style-2',
      name: '에세이',
      category: 'criticism' as const,
      description: '에세이 쓰기 스타일',
      characteristics: ['주관적', '사색적', '개인적'],
      tone: '사색적',
      structure: '자유 형식',
      examplePrompt: '에세이를 작성해주세요',
      icon: '✍️',
    },
    {
      id: 'style-3',
      name: '기사',
      category: 'journalism' as const,
      description: '기사 쓰기 스타일',
      characteristics: ['객관적', '사실 중심', '5W1H'],
      tone: '객관적',
      structure: '역피라미드',
      examplePrompt: '기사를 작성해주세요',
      icon: '📰',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockWritingStyleService.getAllStyles = jest.fn().mockReturnValue(mockStyles);
    mockWritingStyleService.getStylesByCategory = jest.fn().mockImplementation((category) => {
      return mockStyles.filter(style => style.category === category);
    });
  });

  describe('렌더링', () => {
    it('기본적으로 컴포넌트를 렌더링해야 함', () => {
      render(<WritingStyleSelector onStyleSelect={mockOnStyleSelect} />);

      expect(screen.getByPlaceholderText('글쓰기 스타일 검색...')).toBeInTheDocument();
      expect(screen.getByText('전체')).toBeInTheDocument();
      expect(screen.getByText('문학')).toBeInTheDocument();
    });

    it('스타일 목록을 표시해야 함', () => {
      render(<WritingStyleSelector onStyleSelect={mockOnStyleSelect} />);

      expect(screen.getByText('소설')).toBeInTheDocument();
      expect(screen.getByText('에세이')).toBeInTheDocument();
      expect(screen.getByText('기사')).toBeInTheDocument();
    });

    it('선택된 스타일을 하이라이트해야 함', () => {
      render(
        <WritingStyleSelector
          selectedStyleId="style-1"
          onStyleSelect={mockOnStyleSelect}
        />
      );

      const selectedCard = screen.getByText('소설').closest('.style-card');
      expect(selectedCard).toHaveClass('selected');
    });
  });

  describe('검색 기능', () => {
    it('검색어를 입력할 수 있어야 함', () => {
      render(<WritingStyleSelector onStyleSelect={mockOnStyleSelect} />);

      const searchInput = screen.getByPlaceholderText('글쓰기 스타일 검색...');
      fireEvent.change(searchInput, { target: { value: '소설' } });

      expect(searchInput).toHaveValue('소설');
    });

    it('검색어로 스타일을 필터링해야 함', () => {
      render(<WritingStyleSelector onStyleSelect={mockOnStyleSelect} />);

      const searchInput = screen.getByPlaceholderText('글쓰기 스타일 검색...');
      fireEvent.change(searchInput, { target: { value: '소설' } });

      expect(screen.getByText('소설')).toBeInTheDocument();
      expect(screen.queryByText('에세이')).not.toBeInTheDocument();
      expect(screen.queryByText('기사')).not.toBeInTheDocument();
    });

    it('검색 결과가 없을 때 안내 메시지를 표시해야 함', () => {
      render(<WritingStyleSelector onStyleSelect={mockOnStyleSelect} />);

      const searchInput = screen.getByPlaceholderText('글쓰기 스타일 검색...');
      fireEvent.change(searchInput, { target: { value: '존재하지않는스타일' } });

      expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });
  });

  describe('카테고리 필터', () => {
    it('카테고리 버튼을 클릭할 수 있어야 함', () => {
      render(<WritingStyleSelector onStyleSelect={mockOnStyleSelect} />);

      const literatureButton = screen.getByText('문학');
      fireEvent.click(literatureButton);

      expect(mockWritingStyleService.getStylesByCategory).toHaveBeenCalledWith('literature');
    });

    it('선택된 카테고리가 활성화되어야 함', () => {
      render(<WritingStyleSelector onStyleSelect={mockOnStyleSelect} />);

      const literatureButton = screen.getByText('문학');
      fireEvent.click(literatureButton);

      expect(literatureButton.closest('.category-filter')).toHaveClass('active');
    });

    it('전체 카테고리를 선택할 수 있어야 함', () => {
      render(<WritingStyleSelector onStyleSelect={mockOnStyleSelect} />);

      const allButton = screen.getByText('전체');
      fireEvent.click(allButton);

      expect(mockWritingStyleService.getAllStyles).toHaveBeenCalled();
    });
  });

  describe('스타일 선택', () => {
    it('스타일 카드를 클릭하면 onStyleSelect가 호출되어야 함', () => {
      render(<WritingStyleSelector onStyleSelect={mockOnStyleSelect} />);

      const styleCard = screen.getByText('소설').closest('.style-card');
      if (styleCard) {
        fireEvent.click(styleCard);
        expect(mockOnStyleSelect).toHaveBeenCalledWith('style-1');
      }
    });

    it('스타일 정보를 올바르게 표시해야 함', () => {
      render(<WritingStyleSelector onStyleSelect={mockOnStyleSelect} />);

      expect(screen.getByText('소설')).toBeInTheDocument();
      expect(screen.getByText('소설 쓰기 스타일')).toBeInTheDocument();
      expect(screen.getByText('톤: 문학적')).toBeInTheDocument();
    });

    it('스타일 특성을 표시해야 함', () => {
      render(<WritingStyleSelector onStyleSelect={mockOnStyleSelect} />);

      expect(screen.getByText('서사')).toBeInTheDocument();
      expect(screen.getByText('인물')).toBeInTheDocument();
      expect(screen.getByText('플롯')).toBeInTheDocument();
    });
  });

  describe('초기 props', () => {
    it('초기 검색어를 설정할 수 있어야 함', () => {
      render(
        <WritingStyleSelector
          searchQuery="소설"
          onStyleSelect={mockOnStyleSelect}
        />
      );

      const searchInput = screen.getByPlaceholderText('글쓰기 스타일 검색...');
      expect(searchInput).toHaveValue('소설');
    });

    it('초기 카테고리를 설정할 수 있어야 함', () => {
      render(
        <WritingStyleSelector
          category="literature"
          onStyleSelect={mockOnStyleSelect}
        />
      );

      const literatureButton = screen.getByText('문학');
      expect(literatureButton.closest('.category-filter')).toHaveClass('active');
    });
  });
});

