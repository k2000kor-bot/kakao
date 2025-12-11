/**
 * WritingEditor 컴포넌트 테스트
 * 글쓰기 편집기 기능 확인
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import WritingEditor from '../WritingEditor';

// Mock CSS
jest.mock('../WritingEditor.css', () => ({}));

describe('WritingEditor', () => {
  const mockOnSave = jest.fn();
  const mockOnImprove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('기본 렌더링이 올바르게 작동해야 함', () => {
      render(<WritingEditor content="테스트 내용" />);
      expect(screen.getByPlaceholderText('여기에 글을 작성하세요...')).toBeInTheDocument();
    });

    it('초기 content가 textarea에 표시되어야 함', () => {
      render(<WritingEditor content="초기 내용입니다" />);
      const textarea = screen.getByPlaceholderText('여기에 글을 작성하세요...');
      expect(textarea).toHaveValue('초기 내용입니다');
    });

    it('단어 수와 글자 수가 표시되어야 함', () => {
      render(<WritingEditor content="테스트 내용입니다" />);
      expect(screen.getByText(/단어:/)).toBeInTheDocument();
      expect(screen.getByText(/글자:/)).toBeInTheDocument();
    });
  });

  describe('통계 표시', () => {
    it('단어 수를 올바르게 계산해야 함', () => {
      render(<WritingEditor content="하나 둘 셋" />);
      expect(screen.getByText(/단어: 3/)).toBeInTheDocument();
    });

    it('글자 수를 올바르게 계산해야 함', () => {
      render(<WritingEditor content="테스트" />);
      expect(screen.getByText(/글자: 3/)).toBeInTheDocument();
    });

    it('내용이 변경되면 통계가 업데이트되어야 함', () => {
      render(<WritingEditor content="초기" />);
      const textarea = screen.getByPlaceholderText('여기에 글을 작성하세요...');
      
      fireEvent.change(textarea, { target: { value: 'hello world' } });
      
      expect(screen.getByText(/단어: 2/)).toBeInTheDocument();
      expect(screen.getByText(/글자: 11/)).toBeInTheDocument();
    });

    it('빈 내용일 때 통계가 0으로 표시되어야 함', () => {
      render(<WritingEditor content="" />);
      const statsText = screen.getByText(/단어:/).closest('.editor-stats')?.textContent;
      expect(statsText).toContain('단어: 0');
      expect(statsText).toContain('글자: 0');
    });
  });

  describe('내용 편집', () => {
    it('textarea에서 내용을 편집할 수 있어야 함', () => {
      render(<WritingEditor content="초기 내용" />);
      const textarea = screen.getByPlaceholderText('여기에 글을 작성하세요...');
      
      fireEvent.change(textarea, { target: { value: '편집된 내용' } });
      
      expect(textarea).toHaveValue('편집된 내용');
    });

    it('내용이 변경되면 통계가 실시간으로 업데이트되어야 함', () => {
      render(<WritingEditor content="하나" />);
      const textarea = screen.getByPlaceholderText('여기에 글을 작성하세요...');
      
      fireEvent.change(textarea, { target: { value: '하나 둘 셋 넷' } });
      
      expect(screen.getByText(/단어: 4/)).toBeInTheDocument();
    });
  });

  describe('저장 기능', () => {
    it('저장 버튼을 클릭하면 onSave 콜백이 호출되어야 함', () => {
      render(<WritingEditor content="테스트 내용" onSave={mockOnSave} />);
      
      const saveButton = screen.getByText('💾 저장');
      fireEvent.click(saveButton);
      
      expect(mockOnSave).toHaveBeenCalledWith('테스트 내용');
    });

    it('내용을 편집한 후 저장하면 편집된 내용이 전달되어야 함', () => {
      render(<WritingEditor content="초기 내용" onSave={mockOnSave} />);
      const textarea = screen.getByPlaceholderText('여기에 글을 작성하세요...');
      
      fireEvent.change(textarea, { target: { value: '편집된 내용' } });
      
      const saveButton = screen.getByText('💾 저장');
      fireEvent.click(saveButton);
      
      expect(mockOnSave).toHaveBeenCalledWith('편집된 내용');
    });

    it('onSave가 제공되지 않아도 저장 버튼이 작동해야 함', () => {
      render(<WritingEditor content="테스트 내용" />);
      const saveButton = screen.getByText('💾 저장');
      
      expect(() => fireEvent.click(saveButton)).not.toThrow();
    });
  });

  describe('개선 기능', () => {
    it('문법 개선 버튼을 클릭하면 onImprove 콜백이 호출되어야 함', () => {
      render(<WritingEditor content="테스트 내용" onImprove={mockOnImprove} />);
      
      const grammarButton = screen.getByTitle('문법 개선');
      fireEvent.click(grammarButton);
      
      expect(mockOnImprove).toHaveBeenCalledWith('grammar');
    });

    it('스타일 개선 버튼을 클릭하면 onImprove 콜백이 호출되어야 함', () => {
      render(<WritingEditor content="테스트 내용" onImprove={mockOnImprove} />);
      
      const styleButton = screen.getByTitle('스타일 개선');
      fireEvent.click(styleButton);
      
      expect(mockOnImprove).toHaveBeenCalledWith('style');
    });

    it('톤 조정 버튼을 클릭하면 onImprove 콜백이 호출되어야 함', () => {
      render(<WritingEditor content="테스트 내용" onImprove={mockOnImprove} />);
      
      const toneButton = screen.getByTitle('톤 조정');
      fireEvent.click(toneButton);
      
      expect(mockOnImprove).toHaveBeenCalledWith('tone');
    });

    it('onImprove가 제공되지 않아도 개선 버튼이 작동해야 함', () => {
      render(<WritingEditor content="테스트 내용" />);
      const grammarButton = screen.getByTitle('문법 개선');
      
      expect(() => fireEvent.click(grammarButton)).not.toThrow();
    });
  });

  describe('포맷팅 기능', () => {
    it('대문자 버튼을 클릭하면 내용이 대문자로 변환되어야 함', () => {
      render(<WritingEditor content="hello world" />);
      const textarea = screen.getByPlaceholderText('여기에 글을 작성하세요...');
      
      const uppercaseButton = screen.getByTitle('대문자로 변환');
      fireEvent.click(uppercaseButton);
      
      expect(textarea).toHaveValue('HELLO WORLD');
    });

    it('소문자 버튼을 클릭하면 내용이 소문자로 변환되어야 함', () => {
      render(<WritingEditor content="HELLO WORLD" />);
      const textarea = screen.getByPlaceholderText('여기에 글을 작성하세요...');
      
      const lowercaseButton = screen.getByTitle('소문자로 변환');
      fireEvent.click(lowercaseButton);
      
      expect(textarea).toHaveValue('hello world');
    });

    it('첫 글자 대문자 버튼을 클릭하면 각 단어의 첫 글자가 대문자로 변환되어야 함', () => {
      render(<WritingEditor content="hello world" />);
      const textarea = screen.getByPlaceholderText('여기에 글을 작성하세요...');
      
      const capitalizeButton = screen.getByTitle('첫 글자 대문자');
      fireEvent.click(capitalizeButton);
      
      expect(textarea).toHaveValue('Hello World');
    });

    it('공백 제거 버튼을 클릭하면 앞뒤 공백이 제거되어야 함', () => {
      render(<WritingEditor content="  hello world  " />);
      const textarea = screen.getByPlaceholderText('여기에 글을 작성하세요...');
      
      const trimButton = screen.getByTitle('공백 제거');
      fireEvent.click(trimButton);
      
      expect(textarea).toHaveValue('hello world');
    });

    it('포맷팅 후 통계가 업데이트되어야 함', () => {
      render(<WritingEditor content="hello world" />);
      
      const uppercaseButton = screen.getByTitle('대문자로 변환');
      fireEvent.click(uppercaseButton);
      
      // 내용은 변경되었지만 단어 수는 동일해야 함
      expect(screen.getByText(/단어: 2/)).toBeInTheDocument();
    });
  });

  describe('복합 시나리오', () => {
    it('내용을 편집하고 포맷팅한 후 저장할 수 있어야 함', () => {
      render(<WritingEditor content="초기" onSave={mockOnSave} />);
      const textarea = screen.getByPlaceholderText('여기에 글을 작성하세요...');
      
      // 편집
      fireEvent.change(textarea, { target: { value: 'hello world' } });
      
      // 포맷팅
      const uppercaseButton = screen.getByTitle('대문자로 변환');
      fireEvent.click(uppercaseButton);
      
      // 저장
      const saveButton = screen.getByText('💾 저장');
      fireEvent.click(saveButton);
      
      expect(mockOnSave).toHaveBeenCalledWith('HELLO WORLD');
    });

    it('여러 번 포맷팅을 적용할 수 있어야 함', () => {
      render(<WritingEditor content="hello world" />);
      const textarea = screen.getByPlaceholderText('여기에 글을 작성하세요...');
      
      // 대문자로 변환
      const uppercaseButton = screen.getByTitle('대문자로 변환');
      fireEvent.click(uppercaseButton);
      expect(textarea).toHaveValue('HELLO WORLD');
      
      // 소문자로 변환
      const lowercaseButton = screen.getByTitle('소문자로 변환');
      fireEvent.click(lowercaseButton);
      expect(textarea).toHaveValue('hello world');
      
      // 첫 글자 대문자로 변환
      const capitalizeButton = screen.getByTitle('첫 글자 대문자');
      fireEvent.click(capitalizeButton);
      expect(textarea).toHaveValue('Hello World');
    });
  });
});

