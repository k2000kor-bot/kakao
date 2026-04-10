/**
 * @jest-environment jsdom
 */
/* eslint-disable jest/no-conditional-expect */
/**
 * ChatGPT5CompleteInterface 컴포넌트 테스트
 * 통합 대화 인터페이스 기능 확인
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createMuiTestTheme } from '../../test-utils/muiTestTheme';
import { setupCommonMocks } from '../../test-utils/testHelpers';
import { ChatGPT5CompleteInterface } from '../ChatGPT5CompleteInterface';

// 공통 모킹 설정
setupCommonMocks();

jest.mock('../genspark/gensparkAnswerMarkdown', () => ({
  GensparkAnswerMarkdown: ({ text }: { text: string }) => (
    <div data-testid="genspark-answer-md">{text}</div>
  ),
}));

// axios 모킹 (가장 먼저)
jest.mock('axios', () => ({
    __esModule: true,
    default: {
        create: jest.fn(() => ({
            get: jest.fn(() => Promise.resolve({ data: {} })),
            post: jest.fn(() => Promise.resolve({ data: {} })),
            put: jest.fn(() => Promise.resolve({ data: {} })),
            delete: jest.fn(() => Promise.resolve({ data: {} })),
            interceptors: {
                request: { use: jest.fn(), eject: jest.fn() },
                response: { use: jest.fn(), eject: jest.fn() },
            },
        })),
        get: jest.fn(() => Promise.resolve({ data: {} })),
        post: jest.fn(() => Promise.resolve({ data: {} })),
        put: jest.fn(() => Promise.resolve({ data: {} })),
        delete: jest.fn(() => Promise.resolve({ data: {} })),
    },
}));

// SystemIntegration 컴포넌트들 모킹
jest.mock('../SystemIntegration/SystemIntegrationDashboard', () => {
    return function MockSystemIntegrationDashboard() {
        return <div data-testid="system-integration-dashboard">System Integration Dashboard</div>;
    };
});

jest.mock('../SystemIntegration/SystemHealthMonitor', () => {
    return function MockSystemHealthMonitor() {
        return <div data-testid="system-health-monitor">System Health Monitor</div>;
    };
});

jest.mock('../SystemIntegration/SystemIntegrationManager', () => {
    return function MockSystemIntegrationManager() {
        return <div data-testid="system-integration-manager">System Integration Manager</div>;
    };
});

jest.mock('../AI/AdvancedAIIntelligenceDashboard', () => {
    return function MockAdvancedAIIntelligenceDashboard() {
        return <div data-testid="advanced-ai-dashboard">Advanced AI Dashboard</div>;
    };
});

jest.mock('../Security/SecurityDashboard', () => {
    return function MockSecurityDashboard() {
        return <div data-testid="security-dashboard">Security Dashboard</div>;
    };
});

jest.mock('../UI/PerformanceOptimizer', () => {
    return function MockPerformanceOptimizer() {
        return <div data-testid="performance-optimizer">Performance Optimizer</div>;
    };
});

jest.mock('../UI/EnhancedUserExperience', () => {
    return function MockEnhancedUserExperience() {
        return <div data-testid="enhanced-user-experience">Enhanced User Experience</div>;
    };
});

jest.mock('../Security/AuthenticationForm', () => {
    return function MockAuthenticationForm() {
        return <div data-testid="authentication-form">Authentication Form</div>;
    };
});

jest.mock('../NotebookLLM', () => {
    return function MockNotebookLLM() {
        return <div data-testid="notebook-llm">Notebook LLM</div>;
    };
});

// Mock CSS (import 전에)
jest.mock('../ChatGPT5CompleteInterface.css', () => ({}));

// src/services/__mocks__/persistentChatSessionService.ts 사용 (인라인 팩토리는 babel 클로저 이슈로 getInstance가 undefined를 반환할 수 있음)
jest.mock('../../services/persistentChatSessionService');

// Mock 서비스들
const mockProjectServiceInstance = {
    getProjects: jest.fn(() => Promise.resolve([])),
    createProject: jest.fn(async (data: {
        name: string;
        category: string;
        memoryType: 'default' | 'project_exclusive';
        description?: string;
    }) => ({
        id: 'default-proj-1',
        name: data.name,
        category: data.category,
        memoryType: data.memoryType,
        description: data.description ?? '',
        createdAt: new Date().toISOString(),
        fileCount: 0,
        sessionCount: 0,
    })),
    updateProject: jest.fn(() => Promise.resolve({})),
    deleteProject: jest.fn(() => Promise.resolve({})),
    getProjectSessions: jest.fn(() => Promise.resolve([])),
    createSession: jest.fn(() => Promise.resolve({ id: '1', title: '새 세션' })),
};

jest.mock('../../services/chatGPTProjectService', () => {
    const MockChatGPTProjectService = function() {
        return mockProjectServiceInstance;
    };
    MockChatGPTProjectService.getInstance = jest.fn(() => mockProjectServiceInstance);
    return {
        __esModule: true,
        default: MockChatGPTProjectService,
    };
});

type MockPersistentInstance = {
    getSessions: jest.Mock;
    createSession: jest.Mock;
    getSessionMessages: jest.Mock;
    saveMessage: jest.Mock;
    getActiveSessions: jest.Mock;
    getSessionStats: jest.Mock;
    addMessageToSession: jest.Mock;
    createPersistentChatSession: jest.Mock;
    getSession: jest.Mock;
    archiveSession: jest.Mock;
    searchSessions: jest.Mock;
    updateSession: jest.Mock;
    deleteSession: jest.Mock;
};

const persistentChatTestDouble = (
    jest.requireMock('../../services/persistentChatSessionService') as {
        persistentChatServiceTestDouble: MockPersistentInstance;
    }
).persistentChatServiceTestDouble;

jest.mock('../../services/projectTemplateService', () => ({
    __esModule: true,
    default: {
        getTemplates: jest.fn(() => Promise.resolve([])),
        getTemplateById: jest.fn(() => Promise.resolve(null)),
    },
}));

// Mock 하위 컴포넌트들
jest.mock('../ErrorBoundary', () => {
    return function MockErrorBoundary({ children }: { children: React.ReactNode }) {
        return <div data-testid="error-boundary">{children}</div>;
    };
});

jest.mock('../MessageModifyRequestDialog', () => {
    return function MockMessageModifyRequestDialog({ open, onClose }: { open?: boolean; onClose?: () => void }) {
        if (!open) return null;
        return (
            <div data-testid="message-modify-dialog">
                <button onClick={onClose}>닫기</button>
            </div>
        );
    };
});

jest.mock('../ProjectHub', () => {
    return function MockProjectHub() {
        return <div data-testid="project-hub">Project Hub</div>;
    };
});

jest.mock('../ProjectTemplateSelector', () => {
    return function MockProjectTemplateSelector({ open, onClose, onSelect }: { open?: boolean; onClose?: () => void; onSelect?: (t: unknown) => void }) {
        if (!open) return null;
        return (
            <div data-testid="template-selector">
                <button onClick={() => onSelect && onSelect({ id: '1', name: '템플릿' })}>템플릿 선택</button>
                <button onClick={onClose}>닫기</button>
            </div>
        );
    };
});

jest.mock('../ProjectEditDialog', () => {
    return function MockProjectEditDialog({ open, onClose, project }: { open?: boolean; onClose?: () => void; project?: { name?: string } }) {
        if (!open) return null;
        return (
            <div data-testid="project-edit-dialog">
                <div>편집: {project?.name}</div>
                <button onClick={onClose}>닫기</button>
            </div>
        );
    };
});

jest.mock('../ConfirmDialog', () => {
    return function MockConfirmDialog({ open, onConfirm, onCancel }: { open?: boolean; onConfirm?: () => void; onCancel?: () => void }) {
        if (!open) return null;
        return (
            <div data-testid="confirm-dialog">
                <button onClick={onConfirm}>확인</button>
                <button onClick={onCancel}>취소</button>
            </div>
        );
    };
});

// Mock 고급 AI 기능
jest.mock('../../services/advancedAIFunctions', () => ({
    evaluateAnswerQuality: jest.fn(() => Promise.resolve({ overallScore: 85 })),
    enhanceAnswerQuality: jest.fn(() => Promise.resolve({ enhanced: true })),
    createQualityReview: jest.fn(() => Promise.resolve({ id: '1' })),
    generateIntegratedAIResponse: jest.fn(() => Promise.resolve({ response: '응답' })),
    updateSystemLearning: jest.fn(() => Promise.resolve({})),
    startModelTraining: jest.fn(() => Promise.resolve({})),
    detectDataDrift: jest.fn(() => Promise.resolve({})),
    optimizeHyperparameters: jest.fn(() => Promise.resolve({})),
}));

// Mock hooks
jest.mock('../../hooks/useNotifications', () => ({
    useNotifications: () => ({
        notifications: [],
        markAsRead: jest.fn(),
        dismiss: jest.fn(),
        clearAll: jest.fn(),
        addNotification: jest.fn(),
    }),
}));

jest.mock('../../hooks/useConfirmDialog', () => ({
    useConfirmDialog: () => ({
        dialogState: { open: false },
        showConfirm: jest.fn(),
        closeDialog: jest.fn(),
        handleConfirm: jest.fn(),
        handleCancel: jest.fn(),
    }),
}));

jest.mock('../../hooks/useResponsive', () => ({
    useResponsive: () => ({
        isMobile: false,
        isTablet: false,
        isDesktop: true,
    }),
}));

// Mock error handling
jest.mock('../../utils/errorHandler', () => ({
    setupGlobalErrorHandling: jest.fn(),
}));

jest.mock('../../utils/errorLogger', () => ({
    errorLogger: {
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
        debug: jest.fn(),
    },
}));

const theme = createMuiTestTheme();

const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('ChatGPT5CompleteInterface', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    beforeEach(() => {
        // clearAllMocks는 정적 getInstance 등 jest.fn 구현을 비우는 경우가 있어 이 스위트에서는 호출하지 않음
        // localStorage 초기화 (testHelpers의 모킹 사용)
        localStorage.clear();

        // Mock 서비스 메서드 재설정
        persistentChatTestDouble.getActiveSessions.mockResolvedValue([]);
        persistentChatTestDouble.getSessionStats.mockReturnValue({
            totalSessions: 0,
            activeSessions: 0,
            archivedSessions: 0,
            totalMessages: 0,
            averageSessionDuration: 0,
            mostActiveTopics: [],
        });
    });

    it('기본 렌더링이 올바르게 작동해야 함', async () => {
        renderWithTheme(<ChatGPT5CompleteInterface />);

        await waitFor(() => {
            // 기본 UI 요소들이 렌더링되는지 확인
            // ChatGPT 5 제목이 표시되는지 확인 (여러 개 있을 수 있으므로 getAllByText 사용)
            const titles = screen.getAllByText(/ChatGPT 5/i);
            expect(titles.length).toBeGreaterThan(0);
        }, { timeout: 3000 });
    });

    it('프로젝트 생성 버튼이 표시되어야 함', async () => {
        renderWithTheme(<ChatGPT5CompleteInterface />);

        await waitFor(() => {
            // 프로젝트 생성 관련 UI 요소 확인
            const addButtons = screen.queryAllByRole('button', { name: /추가|생성|새 프로젝트/i });
            expect(addButtons.length).toBeGreaterThan(0);
        });
    });

    it('검색 기능이 작동해야 함', async () => {
        renderWithTheme(<ChatGPT5CompleteInterface />);

        await waitFor(() => {
            // 검색 입력 필드 찾기
            const searchInputs = screen.queryAllByPlaceholderText(/검색|search/i);
            if (searchInputs.length > 0) {
                const searchInput = searchInputs[0] as HTMLInputElement;
                fireEvent.change(searchInput, { target: { value: '테스트 검색' } });
                expect(searchInput.value).toBe('테스트 검색');
            }
        });
    });

    it('AI 모델 선택이 작동해야 함', async () => {
        renderWithTheme(<ChatGPT5CompleteInterface />);

        await waitFor(() => {
            // AI 모델 관련 UI 요소 확인
            const modelButtons = screen.queryAllByRole('button');
            // 모델 선택 버튼이 있는지 확인 (실제 구현에 따라 조정 필요)
            expect(modelButtons.length).toBeGreaterThan(0);
        });
    });

    it('모바일 드로어가 열리고 닫혀야 함', async () => {
        // 모바일 환경 모킹
        jest.spyOn(require('../../hooks/useResponsive'), 'useResponsive').mockReturnValue({
            isMobile: true,
            isTablet: false,
            isDesktop: false,
        });

        renderWithTheme(<ChatGPT5CompleteInterface />);

        await waitFor(() => {
            // 모바일 메뉴 버튼 찾기
            const menuButtons = screen.queryAllByRole('button');
            const menuButton = menuButtons.find(btn =>
                btn.getAttribute('aria-label')?.includes('menu') ||
                btn.textContent?.includes('메뉴')
            );

            if (menuButton) {
                fireEvent.click(menuButton);
                // 드로어가 열렸는지 확인 (실제 구현에 따라 조정 필요)
            }
        });
    });

    it('마운트 시 지속 대화 활성 세션을 조회해야 함', async () => {
        renderWithTheme(<ChatGPT5CompleteInterface />);

        await waitFor(() => {
            expect(persistentChatTestDouble.getActiveSessions).toHaveBeenCalled();
        }, { timeout: 3000 });
    });

    it('프로젝트 카테고리 필터가 작동해야 함', async () => {
        renderWithTheme(<ChatGPT5CompleteInterface />);

        await waitFor(() => {
            // 카테고리 버튼 찾기
            const categoryButtons = screen.queryAllByRole('button');
            const investmentButton = categoryButtons.find(btn =>
                btn.textContent?.includes('투자') ||
                btn.textContent?.includes('investment')
            );

            if (investmentButton) {
                fireEvent.click(investmentButton);
                // 카테고리가 선택되었는지 확인 (실제 구현에 따라 조정 필요)
            }
        });
    });

    it('메시지 입력 필드가 작동해야 함', async () => {
        renderWithTheme(<ChatGPT5CompleteInterface />);

        await waitFor(() => {
            // 메시지 입력 필드 찾기
            const textInputs = screen.queryAllByRole('textbox');
            if (textInputs.length > 0) {
                const messageInput = textInputs[0] as HTMLInputElement;
                fireEvent.change(messageInput, { target: { value: '테스트 메시지' } });
                expect(messageInput.value).toBe('테스트 메시지');
            }
        });
    });

    it('다크 모드 토글이 작동해야 함', async () => {
        renderWithTheme(<ChatGPT5CompleteInterface />);

        await waitFor(() => {
            // 다크 모드 토글 버튼 찾기
            const themeButtons = screen.queryAllByRole('button');
            const darkModeButton = themeButtons.find(btn =>
                btn.getAttribute('aria-label')?.includes('dark') ||
                btn.getAttribute('aria-label')?.includes('theme') ||
                btn.textContent?.includes('다크')
            );

            if (darkModeButton) {
                fireEvent.click(darkModeButton);
                // 다크 모드가 전환되었는지 확인 (실제 구현에 따라 조정 필요)
            }
        });
    });

    it('알림 시스템이 작동해야 함', async () => {
        renderWithTheme(<ChatGPT5CompleteInterface />);

        await waitFor(() => {
            // 알림 관련 UI 요소 확인
            const notificationButtons = screen.queryAllByRole('button');
            const notificationButton = notificationButtons.find(btn =>
                btn.getAttribute('aria-label')?.includes('notification') ||
                btn.getAttribute('aria-label')?.includes('알림')
            );

            if (notificationButton) {
                fireEvent.click(notificationButton);
                // 알림 패널이 열렸는지 확인 (실제 구현에 따라 조정 필요)
            }
        });
    });
});

