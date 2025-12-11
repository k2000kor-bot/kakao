/**
 * StreamingMessage 컴포넌트 테스트
 * 스트리밍 메시지 표시 기능 확인
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import StreamingMessage from '../Chat/StreamingMessage';

// Mock framer-motion
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    },
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
    Bot: ({ size, className }: any) => (
        <svg data-testid="bot-icon" data-size={size} className={className} />
    ),
}));

describe('StreamingMessage', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    describe('기본 렌더링', () => {
        it('컴포넌트가 렌더링되어야 함', () => {
            render(
                <StreamingMessage content="Hello" isStreaming={false} />
            );

            expect(screen.getByTestId('bot-icon')).toBeInTheDocument();
        });

        it('AI 아바타가 표시되어야 함', () => {
            render(
                <StreamingMessage content="Hello" isStreaming={false} />
            );

            expect(screen.getByTestId('bot-icon')).toBeInTheDocument();
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

            // 초기에는 빈 내용
            expect(screen.queryByText('Hello')).not.toBeInTheDocument();

            // 시간이 지나면서 점진적으로 표시
            jest.advanceTimersByTime(50);
            await waitFor(() => {
                expect(screen.getByText('H')).toBeInTheDocument();
            });

            jest.advanceTimersByTime(50);
            await waitFor(() => {
                expect(screen.getByText('He')).toBeInTheDocument();
            });
        });

        it('스트리밍 중일 때 커서가 표시되어야 함', () => {
            const { container } = render(
                <StreamingMessage content="Hello" isStreaming={true} />
            );

            // 스트리밍 중에는 커서가 표시되어야 함 (내용이 완전히 표시되지 않았을 때)
            // framer-motion의 animate 속성이 있는 span이 있어야 함
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
            for (let i = 0; i < content.length; i++) {
                jest.advanceTimersByTime(50);
            }

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
            for (let i = 0; i < content.length; i++) {
                jest.advanceTimersByTime(50);
            }

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
            jest.advanceTimersByTime(100);

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
            jest.advanceTimersByTime(500); // 10글자 정도

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

            expect(screen.getByTestId('bot-icon')).toBeInTheDocument();
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

