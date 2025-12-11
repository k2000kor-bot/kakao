import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import WritingTemplatePreview from '../WritingTemplatePreview';
import { WritingTemplate } from '../../services/writingTemplates';

describe('WritingTemplatePreview', () => {
  const mockTemplate: WritingTemplate = {
    id: 'template-1',
    category: '비즈니스',
    title: '비즈니스 제안서',
    description: '비즈니스 제안서 작성 템플릿',
    prompt: '다음 주제에 대해 비즈니스 제안서를 작성해주세요: {{topic}}',
    example: '예시 제안서 내용',
    defaultTone: 'professional',
    defaultStyle: 'proposal',
    fields: [
      {
        name: 'topic',
        label: '주제',
        type: 'text',
        required: true,
      },
      {
        name: 'description',
        label: '설명',
        type: 'textarea',
        required: false,
      },
    ],
  };

  const mockOnSelect = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('렌더링', () => {
    it('기본적으로 컴포넌트를 렌더링해야 함', () => {
      render(
        <WritingTemplatePreview
          template={mockTemplate}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('비즈니스 제안서')).toBeInTheDocument();
      expect(screen.getByText('비즈니스 제안서 작성 템플릿')).toBeInTheDocument();
    });

    it('템플릿 정보를 올바르게 표시해야 함', () => {
      render(
        <WritingTemplatePreview
          template={mockTemplate}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('비즈니스')).toBeInTheDocument();
      expect(screen.getByText('professional')).toBeInTheDocument();
      expect(screen.getByText('proposal')).toBeInTheDocument();
    });

    it('필수 입력 항목을 표시해야 함', () => {
      render(
        <WritingTemplatePreview
          template={mockTemplate}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
        />
      );

      // 컴포넌트는 field.name을 표시하므로 "topic"을 찾아야 함
      expect(screen.getByText('topic')).toBeInTheDocument();
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('필수 입력 항목이 없을 때 안내 메시지를 표시해야 함', () => {
      const templateWithoutRequiredFields: WritingTemplate = {
        ...mockTemplate,
        fields: [
          {
            name: 'description',
            label: '설명',
            type: 'textarea',
            required: false,
          },
        ],
      };

      render(
        <WritingTemplatePreview
          template={templateWithoutRequiredFields}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('필수 입력 항목이 없습니다.')).toBeInTheDocument();
    });

    it('예시가 있을 때 예시를 표시해야 함', () => {
      render(
        <WritingTemplatePreview
          template={mockTemplate}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('예시')).toBeInTheDocument();
      expect(screen.getByText('예시 제안서 내용')).toBeInTheDocument();
    });

    it('예시가 없을 때 예시 섹션을 표시하지 않아야 함', () => {
      const templateWithoutExample: WritingTemplate = {
        ...mockTemplate,
        example: undefined,
      };

      render(
        <WritingTemplatePreview
          template={templateWithoutExample}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByText('예시')).not.toBeInTheDocument();
    });
  });

  describe('프롬프트 템플릿', () => {
    it('프롬프트 템플릿을 표시해야 함', () => {
      render(
        <WritingTemplatePreview
          template={mockTemplate}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('프롬프트 템플릿')).toBeInTheDocument();
      expect(screen.getByText(/다음 주제에 대해 비즈니스 제안서를 작성해주세요/i)).toBeInTheDocument();
    });

    it('프롬프트 템플릿 펼치기/접기 버튼을 클릭할 수 있어야 함', () => {
      render(
        <WritingTemplatePreview
          template={mockTemplate}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
        />
      );

      const toggleButton = screen.getByText('펼치기');
      expect(toggleButton).toBeInTheDocument();

      fireEvent.click(toggleButton);

      expect(screen.getByText('접기')).toBeInTheDocument();
    });
  });

  describe('액션', () => {
    it('템플릿 사용하기 버튼 클릭 시 onSelect를 호출해야 함', () => {
      render(
        <WritingTemplatePreview
          template={mockTemplate}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
        />
      );

      const selectButton = screen.getByText('이 템플릿 사용하기');
      fireEvent.click(selectButton);

      expect(mockOnSelect).toHaveBeenCalledTimes(1);
    });

    it('닫기 버튼 클릭 시 onClose를 호출해야 함', () => {
      render(
        <WritingTemplatePreview
          template={mockTemplate}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByText('✕');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('오버레이 클릭 시 onClose를 호출해야 함', () => {
      render(
        <WritingTemplatePreview
          template={mockTemplate}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
        />
      );

      const overlay = screen.getByText('비즈니스 제안서').closest('.template-preview-overlay');
      if (overlay) {
        fireEvent.click(overlay);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }
    });

    it('모달 내부 클릭 시 onClose를 호출하지 않아야 함', () => {
      render(
        <WritingTemplatePreview
          template={mockTemplate}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
        />
      );

      const modal = screen.getByText('비즈니스 제안서').closest('.template-preview-modal');
      if (modal) {
        fireEvent.click(modal);
        expect(mockOnClose).not.toHaveBeenCalled();
      }
    });
  });

  describe('선택적 속성', () => {
    it('defaultTone이 없을 때 기본 어투 섹션을 표시하지 않아야 함', () => {
      const templateWithoutTone: WritingTemplate = {
        ...mockTemplate,
        defaultTone: undefined,
      };

      render(
        <WritingTemplatePreview
          template={templateWithoutTone}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByText('기본 어투')).not.toBeInTheDocument();
    });

    it('defaultStyle이 없을 때 기본 스타일 섹션을 표시하지 않아야 함', () => {
      const templateWithoutStyle: WritingTemplate = {
        ...mockTemplate,
        defaultStyle: undefined,
      };

      render(
        <WritingTemplatePreview
          template={templateWithoutStyle}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByText('기본 스타일')).not.toBeInTheDocument();
    });
  });
});

