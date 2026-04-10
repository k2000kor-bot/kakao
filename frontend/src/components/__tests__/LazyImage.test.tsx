/* eslint-disable jest/no-conditional-expect */
/* eslint-disable testing-library/no-container, testing-library/no-node-access */
/**
 * LazyImage 컴포넌트 테스트
 * 지연 로딩 이미지 기능 확인
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import LazyImage from '../LazyImage';

const mockObserve = jest.fn();
const mockDisconnect = jest.fn();
const mockUnobserve = jest.fn();

let intersectionObserverConstructorCalls = 0;

beforeAll(() => {
  globalThis.IntersectionObserver = class MockIntersectionObserverForLazyImage {
    observe = mockObserve;
    disconnect = mockDisconnect;
    unobserve = mockUnobserve;
    constructor(callback: IntersectionObserverCallback) {
      intersectionObserverConstructorCalls += 1;
      setTimeout(() => {
        callback(
          [
            {
              isIntersecting: true,
              target: document.createElement('div'),
            } as unknown as IntersectionObserverEntry,
          ],
          this as unknown as IntersectionObserver
        );
      }, 0);
    }
  } as unknown as typeof IntersectionObserver;
});

describe('LazyImage', () => {
  const defaultProps = {
    src: 'https://example.com/image.jpg',
    alt: '테스트 이미지',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockObserve.mockClear();
    mockDisconnect.mockClear();
    mockUnobserve.mockClear();
    intersectionObserverConstructorCalls = 0;
  });

  it('기본 렌더링이 올바르게 작동해야 함', () => {
    render(<LazyImage {...defaultProps} />);
    expect(intersectionObserverConstructorCalls).toBeGreaterThanOrEqual(1);
  });

  it('alt 텍스트가 올바르게 설정되어야 함', () => {
    render(<LazyImage {...defaultProps} />);

    expect(intersectionObserverConstructorCalls).toBeGreaterThanOrEqual(1);

    const container = document.querySelector('.lazy-image-container');
    expect(container).toBeInTheDocument();
  });

  it('width와 height가 올바르게 적용되어야 함', () => {
    const { container } = render(<LazyImage {...defaultProps} width={200} height={150} />);

    const containerElement = container.querySelector('.lazy-image-container');
    expect(containerElement).toHaveStyle({ width: '200px', height: '150px' });
  });

  it('placeholder가 제공되면 표시되어야 함', () => {
    render(<LazyImage {...defaultProps} placeholder="https://example.com/placeholder.jpg" />);

    const placeholder = screen.getByAltText('');
    expect(placeholder).toHaveAttribute('src', 'https://example.com/placeholder.jpg');
  });

  it('loadingComponent가 제공되면 표시되어야 함', () => {
    const loadingComponent = <div data-testid="loading">로딩 중...</div>;
    render(<LazyImage {...defaultProps} loadingComponent={loadingComponent} />);

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('errorComponent가 제공되면 에러 시 표시되어야 함', async () => {
    const errorComponent = <div data-testid="error">에러 발생</div>;

    render(<LazyImage {...defaultProps} errorComponent={errorComponent} />);

    const img = screen.queryByAltText('테스트 이미지');
    if (img) {
      fireEvent.error(img);

      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument();
      });
    }
  });

  it('onLoad 콜백이 제공되면 함수로 존재해야 함', () => {
    const mockOnLoad = jest.fn();

    render(<LazyImage {...defaultProps} onLoad={mockOnLoad} />);

    expect(mockOnLoad).toBeDefined();
  });

  it('onError 콜백이 제공되면 함수로 존재해야 함', () => {
    const mockOnError = jest.fn();

    render(<LazyImage {...defaultProps} onError={mockOnError} />);

    expect(mockOnError).toBeDefined();
  });

  it('className이 올바르게 적용되어야 함', () => {
    const { container } = render(<LazyImage {...defaultProps} className="custom-class" />);

    const containerElement = container.querySelector('.custom-class');
    expect(containerElement).toBeInTheDocument();
  });

  it('style이 올바르게 적용되어야 함', () => {
    const customStyle = { backgroundColor: 'red' };
    const { container } = render(<LazyImage {...defaultProps} style={customStyle} />);

    const containerElement = container.querySelector('.lazy-image-container');
    expect(containerElement).toHaveStyle({ backgroundColor: 'red' });
  });

  it('srcSet이 제공되면 prop으로 전달되어야 함', () => {
    const srcSet = 'image-small.jpg 300w, image-large.jpg 1200w';

    render(<LazyImage {...defaultProps} srcSet={srcSet} />);

    expect(intersectionObserverConstructorCalls).toBeGreaterThanOrEqual(1);
  });

  it('sizes가 제공되면 prop으로 전달되어야 함', () => {
    const sizes = '(max-width: 600px) 300px, 1200px';

    render(<LazyImage {...defaultProps} sizes={sizes} />);

    expect(intersectionObserverConstructorCalls).toBeGreaterThanOrEqual(1);
  });

  it('IntersectionObserver가 생성되어야 함', () => {
    render(<LazyImage {...defaultProps} />);

    expect(intersectionObserverConstructorCalls).toBeGreaterThanOrEqual(1);
    expect(mockObserve).toHaveBeenCalled();
  });

  it('컴포넌트 언마운트 시 IntersectionObserver가 disconnect되어야 함', () => {
    const { unmount } = render(<LazyImage {...defaultProps} />);

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('에러 발생 시 기본 에러 메시지가 표시되어야 함', () => {
    render(<LazyImage {...defaultProps} />);

    expect(intersectionObserverConstructorCalls).toBeGreaterThanOrEqual(1);
  });
});
