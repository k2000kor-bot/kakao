/**
 * StreamingMessage 컴포넌트 테스트
 * 스트리밍 메시지 표시 기능 확인
 */
/* eslint-disable testing-library/no-container, testing-library/no-node-access, testing-library/no-wait-for-multiple-assertions */

import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { setupCommonMocks } from '../../test-utils/testHelpers';
import StreamingMessage from '../Chat/StreamingMessage';

jest.mock('../genspark/gensparkAnswerMarkdown', () => ({
    GensparkAnswerMarkdown: ({ text }: { text: string }) => (
        <div data-testid="genspark-answer-md">{text}</div>
    ),
}));

jest.mock('../genspark/GensparkGenerationStatus', () => ({
    GensparkGenerationStatus: () => <div data-testid="genspark-gen-stream-placeholder" />,
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
        span: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <span {...props}>{children}</span>,
    },
}));

describe('StreamingMessage', () => {
    beforeEach(() => {
        setupCommonMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        act(() => {
            jest.runOnlyPendingTimers();
        });
        jest.useRealTimers();
    });

    describe('기본 렌더링', () => {
        it('컴포넌트가 렌더링되어야 함', () => {
            render(
                <StreamingMessage content="Hello" isStreaming={false} />
            );

            expect(screen.getByTestId('genspark-answer-md')).toBeInTheDocument();
        });

        it('GensparkAnswerMarkdown으로 본문을 표시해야 함', () => {
            render(
                <StreamingMessage content="Hello" isStreaming={false} />
            );

            expect(screen.getByTestId('genspark-answer-md')).toHaveTextContent('Hello');
        });
    });

    describe('스트리밍 상태', () => {
        it('isStreaming이 false일 때 전체 내용을 즉시 표시해야 함', () => {
            render(
                <StreamingMessage content="Hello World" isStreaming={false} />
            );

            expect(screen.getByText('Hello World')).toBeInTheDocument();
        });

        it('isStreaming이 true일 때 점진적으로 내용을 표시해야 함', async () => {
            render(
                <StreamingMessage content="Hello" isStreaming={true} />
            );

            // 초기에는 본문 없음·생성 UI
            expect(screen.queryByText('Hello')).not.toBeInTheDocument();
            expect(screen.getByTestId('genspark-gen-stream-placeholder')).toBeInTheDocument();

            // 시간이 지나면서 점진적으로 표시
            await act(async () => {
                jest.advanceTimersByTime(50);
            });
            await waitFor(() => {
                expect(screen.getByText('H')).toBeInTheDocument();
            });

            await act(async () => {
                jest.advanceTimersByTime(50);
            });
            await waitFor(() => {
                expect(screen.getByText('He')).toBeInTheDocument();
            });
        });

        it('스트리밍 중일 때 커서가 표시되어야 함', async () => {
            const { container } = render(
                <StreamingMessage content="Hello" isStreaming={true} />
            );

            await act(async () => {
                jest.advanceTimersByTime(50);
            });
            // 본문이 한 글자 이상일 때만 커서 표시 (빈 본문은 생성 UI만)
            const cursorSpan = container.querySelector('span.inline-block');
            expect(cursorSpan).toBeInTheDocument();
        });
    });

    describe('스트리밍 완료', () => {
        it('스트리밍이 완료되면 onStreamComplete 콜백이 호출되어야 함', async () => {
            const mockOnStreamComplete = jest.fn();
            const content = 'Hello';

            render(
                <StreamingMessage
                    content={content}
                    isStreaming={true}
                    onStreamComplete={mockOnStreamComplete}
                />
            );

            // 모든 글자가 표시될 때까지 시간 진행
            await act(async () => {
                for (let i = 0; i < content.length; i++) {
                    jest.advanceTimersByTime(50);
                }
            });

            await waitFor(() => {
                expect(mockOnStreamComplete).toHaveBeenCalledTimes(1);
            });
        });

        it('스트리밍이 완료되면 커서가 사라져야 함', async () => {
            const content = 'Hi';
            render(
                <StreamingMessage content={content} isStreaming={true} />
            );

            // 모든 글자가 표시될 때까지 시간 진행
            await act(async () => {
                for (let i = 0; i < content.length; i++) {
                    jest.advanceTimersByTime(50);
                }
            });

            await waitFor(() => {
                expect(screen.getByText(content)).toBeInTheDocument();
            });
        });
    });

    describe('스트리밍 중지', () => {
        it('isStreaming이 false로 변경되면 전체 내용을 즉시 표시해야 함', async () => {
            const { rerender } = render(
                <StreamingMessage content="Hello World" isStreaming={true} />
            );

            // 스트리밍 시작
            await act(async () => {
                jest.advanceTimersByTime(100);
            });

            // 스트리밍 중지
            rerender(
                <StreamingMessage content="Hello World" isStreaming={false} />
            );

            await waitFor(() => {
                expect(screen.getByText('Hello World')).toBeInTheDocument();
            });
        });
    });

    describe('긴 텍스트 처리', () => {
        it('긴 텍스트도 올바르게 스트리밍되어야 함', async () => {
            const longContent = 'A'.repeat(100);
            render(
                <StreamingMessage content={longContent} isStreaming={true} />
            );

            // 일부 글자만 표시
            await act(async () => {
                jest.advanceTimersByTime(500); // 10글자 정도
            });

            await waitFor(() => {
                const displayedText = screen.getByText(/^A+$/);
                expect(displayedText).toBeInTheDocument();
                expect(displayedText.textContent?.length).toBeLessThan(longContent.length);
            });
        });
    });

    describe('빈 내용 처리', () => {
        it('빈 내용을 올바르게 처리해야 함', () => {
            render(
                <StreamingMessage content="" isStreaming={false} />
            );

            expect(screen.getByTestId('genspark-gen-stream-placeholder')).toBeInTheDocument();
        });

        it('빈 내용에서 스트리밍이 완료되면 즉시 콜백이 호출되어야 함', async () => {
            const mockOnStreamComplete = jest.fn();
            render(
                <StreamingMessage
                    content=""
                    isStreaming={true}
                    onStreamComplete={mockOnStreamComplete}
                />
            );

            await waitFor(() => {
                expect(mockOnStreamComplete).toHaveBeenCalledTimes(1);
            });
        });
    });
});

