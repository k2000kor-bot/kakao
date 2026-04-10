import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    Chip,
    Card,
    CardContent,
    Divider
} from '@mui/material';
import { Psychology, Analytics, Speed } from '@mui/icons-material';
import { integratedAPIService, IntegratedAnalysisResponse } from '../services/integratedAPIService';
import { errorLogger } from '../utils/errorLogger';
import { getSentimentColor } from '../styles/themeColors';
import SystemStatus from './SystemStatus';
import QuickActions from './QuickActions';
import SystemHealthMonitor from './SystemHealthMonitor';
import CreativeWriting from './CreativeWriting';
import PersuasionContent from './PersuasionContent';
import MarketingContent from './MarketingContent';
import AdvancedAnalytics from './AdvancedAnalytics';
import AIManagement from './AIManagement';
import { buildUnifiedGenerationPrompt } from '../services/generationPromptBuilder';
import { DEFAULT_CHAT_PERSPECTIVE, DEFAULT_CHAT_RESPONSE_STYLE } from '../utils/modernChatUrlStyle';
import {
    coerceTrimmedString,
    scheduleAssistantNonStreamLoadingPhaseTimers,
    runAssistantNonStreamPostResponsePhases,
    ASSISTANT_PLACEHOLDER_ANALYZING,
    ASSISTANT_GENSPARK_QA_BADGE_QUESTION,
    ASSISTANT_GENSPARK_QA_BADGE_ANSWER,
} from '../utils/chatInputUtils';
import { AssistantGensparkBody } from './genspark/AssistantGensparkBody';
import './IntegratedAIChat.css';

interface Message {
    id: string;
    text: string;
    timestamp: Date;
    analysis?: IntegratedAnalysisResponse['analysis'];
    isUser: boolean;
    sender?: string;
    /** 생성 단계 임시 답변 행 — 별도 로딩 카드와 중복 표시 방지용 */
    generationPlaceholder?: boolean;
}

const IntegratedAIChat: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
    const [systemMetrics, setSystemMetrics] = useState<{
        total_requests: number;
        successful_requests: number;
        failed_requests: number;
        average_response_time: number;
        last_updated: string;
    } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 컴포넌트 마운트 시 연결 상태 확인
    useEffect(() => {
        checkConnection();
        loadSystemMetrics();
    }, []);

    // 메시지가 추가될 때마다 스크롤을 맨 아래로
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const checkConnection = async () => {
        setConnectionStatus('checking');
        try {
            const isConnected = await integratedAPIService.testConnection();
            setConnectionStatus(isConnected ? 'connected' : 'disconnected');
        } catch (error) {
            setConnectionStatus('disconnected');
        }
    };

    const loadSystemMetrics = async () => {
        try {
            const status = await integratedAPIService.getSystemStatus();
            setSystemMetrics(status.metrics);
        } catch (error) {
            errorLogger.error('시스템 메트릭 로드 실패', error instanceof Error ? error : new Error(String(error)), { component: 'IntegratedAIChat', action: 'loadSystemMetrics' });
        }
    };

    const handleSendMessage = async (overrideText?: string) => {
        const trimmed = coerceTrimmedString(overrideText, inputMessage);
        if (!trimmed || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: trimmed,
            timestamp: new Date(),
            isUser: true
        };

        const placeholderId = `${Date.now() + 1}`;
        const placeholderAi: Message = {
            id: placeholderId,
            text: ASSISTANT_PLACEHOLDER_ANALYZING,
            timestamp: new Date(),
            isUser: false,
            generationPlaceholder: true,
        };

        setMessages((prev) => [...prev, userMessage, placeholderAi]);
        setInputMessage('');
        setIsLoading(true);

        let clearIntegratedNsPhases = scheduleAssistantNonStreamLoadingPhaseTimers((text) => {
            setMessages((prev) =>
                prev.map((m) => (m.id === placeholderId ? { ...m, text } : m)),
            );
        });

        try {
            const requestMessage = buildUnifiedGenerationPrompt(trimmed, {
                responseStyle: DEFAULT_CHAT_RESPONSE_STYLE,
                perspective: DEFAULT_CHAT_PERSPECTIVE,
            });
            const response = await integratedAPIService.analyzeMessage(requestMessage);

            clearIntegratedNsPhases();
            clearIntegratedNsPhases = () => {};

            await runAssistantNonStreamPostResponsePhases((text) => {
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === placeholderId
                            ? { ...m, text, generationPlaceholder: true }
                            : m,
                    ),
                );
            });

            const aiMessage: Message = {
                id: placeholderId,
                text: response.response,
                timestamp: new Date(),
                analysis: response.analysis,
                isUser: false,
            };

            setMessages((prev) => prev.map((m) => (m.id === placeholderId ? aiMessage : m)));

            // 메트릭 업데이트
            loadSystemMetrics();
        } catch (error) {
            clearIntegratedNsPhases();
            clearIntegratedNsPhases = () => {};
            errorLogger.error('메시지 전송 실패', error instanceof Error ? error : new Error(String(error)), { component: 'IntegratedAIChat', action: 'handleSendMessage' });
            const errText =
                error instanceof Error ? error.message : '알 수 없는 오류';
            const errorMessage: Message = {
                id: placeholderId,
                text: `죄송합니다. 메시지를 처리하는 중 오류가 발생했습니다.\n\n${errText}`,
                timestamp: new Date(),
                isUser: false,
            };
            setMessages((prev) => prev.map((m) => (m.id === placeholderId ? errorMessage : m)));
        } finally {
            clearIntegratedNsPhases();
            clearIntegratedNsPhases = () => {};
            setIsLoading(false);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            void handleSendMessage();
        }
    };

    const handleQuickAction = (message: string) => {
        setInputMessage(message);
        void handleSendMessage(message);
    };

    return (
        <div className="bw-detail-root" data-testid="page-integrated">
            {/* 헤더 */}
            <div className="bw-detail-header">
                <div className="bw-detail-header-inner">
                    <div className="bw-detail-header-left">
                        <div className="bw-detail-header-icon">
                            <Psychology aria-hidden />
                        </div>
                        <div>
                            <h2 className="bw-detail-header-title">CORBU.AI 통합 대화</h2>
                            <p className="bw-detail-header-desc">분석·메트릭 연동 대화</p>
                        </div>
                    </div>
                    <div className="bw-detail-header-actions">
                        <Chip
                            label={connectionStatus === 'connected' ? '연결됨' : '연결 끊김'}
                            color={connectionStatus === 'connected' ? 'success' : 'error'}
                            size="small"
                        />
                        {systemMetrics && (
                            <>
                                <Chip
                                    icon={<Speed />}
                                    label={`${(systemMetrics.average_response_time * 1000).toFixed(0)}ms`}
                                    size="small"
                                    variant="outlined"
                                />
                                <Chip
                                    icon={<Analytics />}
                                    label={`${systemMetrics.successful_requests} 요청`}
                                    size="small"
                                    variant="outlined"
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="bw-detail-content bw-detail-tab-content bw-detail-stack">
            {/* 시스템 상태 모니터링 */}
            <div className="bw-detail-section">
                <SystemStatus onStatusChange={(status) => setConnectionStatus(status)} />
            </div>

            {/* 빠른 테스트 액션 */}
            <div className="bw-detail-section">
                <QuickActions onActionClick={handleQuickAction} />
            </div>

            {/* 시스템 헬스 모니터 */}
            <div className="bw-detail-section">
                <SystemHealthMonitor />
            </div>

            {/* 창작 글쓰기 */}
            <div className="bw-detail-section">
                <CreativeWriting onContentGenerated={(content, type) => {
                    // 생성된 콘텐츠를 메시지로 추가
                    const newMessage: Message = {
                        id: Date.now().toString(),
                        text: `[${type === 'story' ? '스토리' : type === 'poem' ? '시' : '에세이'} 생성]\n\n${content}`,
                        timestamp: new Date(),
                        sender: 'ai',
                        isUser: false
                    };
                    setMessages(prev => [...prev, newMessage]);
                }} />
            </div>

            {/* 설득 콘텐츠 생성 */}
            <div className="bw-detail-section">
                <PersuasionContent onContentGenerated={(content, type) => {
                    // 생성된 콘텐츠를 메시지로 추가
                    const newMessage: Message = {
                        id: Date.now().toString(),
                        text: `[${type === 'construction' ? '건설사 설득' : '시공사 긍정'} 콘텐츠 생성]\n\n${content}`,
                        timestamp: new Date(),
                        sender: 'ai',
                        isUser: false
                    };
                    setMessages(prev => [...prev, newMessage]);
                }} />
            </div>

            {/* 마케팅 콘텐츠 생성 */}
            <div className="bw-detail-section">
                <MarketingContent onContentGenerated={(content, type) => {
                    // 생성된 콘텐츠를 메시지로 추가
                    const newMessage: Message = {
                        id: Date.now().toString(),
                        text: `[${type === 'social' ? '소셜미디어' : '이메일'} 마케팅 콘텐츠 생성]\n\n${content}`,
                        timestamp: new Date(),
                        sender: 'ai',
                        isUser: false
                    };
                    setMessages(prev => [...prev, newMessage]);
                }} />
            </div>

            {/* 고급 분석 대시보드 */}
            <div className="bw-detail-section">
                <AdvancedAnalytics onInsightGenerated={(insight) => {
                    // 생성된 인사이트를 메시지로 추가
                    const newMessage: Message = {
                        id: Date.now().toString(),
                        text: `[인사이트] ${insight}`,
                        timestamp: new Date(),
                        sender: 'ai',
                        isUser: false
                    };
                    setMessages(prev => [...prev, newMessage]);
                }} />
            </div>

            {/* AI 관리 */}
            <div className="bw-detail-section">
                <AIManagement onOptimizationComplete={(result) => {
                    // 최적화 결과를 메시지로 추가
                    const newMessage: Message = {
                        id: Date.now().toString(),
                        text: `[AI 관리] ${result}`,
                        timestamp: new Date(),
                        sender: 'ai',
                        isUser: false
                    };
                    setMessages(prev => [...prev, newMessage]);
                }} />
            </div>

            {/* 메시지 영역 */}
            <Box className="bw-detail-scroll integrated-chat-scroll genspark-chat-column">
                {messages.length === 0 && (
                    <Box className="integrated-chat-empty">
                        <Typography variant="h6" className="integrated-chat-empty-title">
                            안녕하세요! CORBU.AI 통합 시스템입니다.
                        </Typography>
                        <Typography variant="body2" className="integrated-chat-empty-desc">
                            감정 분석, 의도 파악, 키워드 추출을 통한 종합적인 AI 분석을 제공합니다.
                        </Typography>
                    </Box>
                )}

                {messages.map((message) => (
                    <Box
                        key={message.id}
                        className={`integrated-chat-row ${message.isUser ? 'user' : 'ai'}`}
                    >
                        <Card
                            className={`integrated-chat-card ${message.isUser ? 'user' : 'ai'}`}
                        >
                            <CardContent className="integrated-chat-card-content">
                                <div
                                    className="genspark-qa-role-row"
                                    style={{
                                        display: 'flex',
                                        width: '100%',
                                        justifyContent: message.isUser ? 'flex-end' : 'flex-start',
                                        marginBottom: 8,
                                    }}
                                >
                                    <span
                                        className={`genspark-qa-badge ${message.isUser ? 'genspark-qa-badge--question' : 'genspark-qa-badge--answer'}`}
                                    >
                                        {message.isUser ? ASSISTANT_GENSPARK_QA_BADGE_QUESTION : ASSISTANT_GENSPARK_QA_BADGE_ANSWER}
                                    </span>
                                </div>
                                {message.isUser ? (
                                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{message.text}</Typography>
                                ) : (
                                    <div className="integrated-chat-ai-body bw-text-primary">
                                        <AssistantGensparkBody
                                            text={message.text}
                                            embedded
                                            enhancedCodeBlocks
                                        />
                                    </div>
                                )}
                                <Typography variant="caption" className="integrated-chat-time">
                                    {message.timestamp.toLocaleTimeString()}
                                </Typography>

                                {/* AI 메시지의 경우 분석 결과 표시 */}
                                {!message.isUser && message.analysis && (message.analysis.emotion || message.analysis.intent) && (
                                    <Box className="integrated-chat-analysis">
                                        <Divider className="integrated-chat-analysis-divider" />
                                        <Box className="integrated-chat-analysis-chips">
                                            {message.analysis.emotion?.sentiment != null && (
                                            <Chip
                                                label={`감정: ${message.analysis.emotion.sentiment}`}
                                                size="small"
                                                sx={{
                                                    bgcolor: getSentimentColor(message.analysis.emotion.sentiment),
                                                    color: 'var(--on-accent)',
                                                    fontSize: '0.7rem'
                                                }}
                                            />
                                            )}
                                            {message.analysis.intent?.type != null && (
                                            <Chip
                                                label={`의도: ${message.analysis.intent.type}`}
                                                size="small"
                                                sx={{
                                                    bgcolor: getSentimentColor(message.analysis.intent.type),
                                                    color: 'var(--on-accent)',
                                                    fontSize: '0.7rem'
                                                }}
                                            />
                                            )}
                                            {message.analysis.emotion?.confidence != null && (
                                            <Chip
                                                label={`신뢰도: ${(message.analysis.emotion.confidence * 100).toFixed(0)}%`}
                                                size="small"
                                                variant="outlined"
                                                className="integrated-chat-confidence-chip"
                                            />
                                            )}
                                        </Box>
                                        {message.analysis.keywords?.length > 0 && (
                                            <Box className="integrated-chat-keywords">
                                                <Typography variant="caption" className="integrated-chat-keywords-text">
                                                    키워드: {message.analysis.keywords.join(', ')}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Box>
                ))}

                {isLoading &&
                    !messages.some((m) => !m.isUser && m.generationPlaceholder) && (
                    <Box className="integrated-chat-loading-row">
                        <Card className="integrated-chat-loading-card">
                            <CardContent className="integrated-chat-loading-content">
                                <div
                                    className="genspark-qa-role-row"
                                    style={{
                                        display: 'flex',
                                        width: '100%',
                                        justifyContent: 'flex-start',
                                        marginBottom: 4,
                                    }}
                                >
                                    <span className="genspark-qa-badge genspark-qa-badge--answer">{ASSISTANT_GENSPARK_QA_BADGE_ANSWER}</span>
                                </div>
                                <AssistantGensparkBody text="" embedded enhancedCodeBlocks />
                            </CardContent>
                        </Card>
                    </Box>
                )}

                <div ref={messagesEndRef} />
            </Box>
            </div>

            {/* 입력 영역 */}
            <div className="bw-page-input-dock">
                <div className="bw-figma-composer">
                    <button
                        type="button"
                        className="bw-figma-composer-add"
                        onClick={() => {
                            const input = document.getElementById('integrated-chat-input');
                            input?.focus();
                        }}
                        aria-label="메시지 입력 포커스"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                    </button>
                    <textarea
                        id="integrated-chat-input"
                        className="bw-figma-composer-field"
                        placeholder="질문을 입력하세요. (Shift+Enter 줄바꿈)"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                        rows={1}
                        aria-label="메시지 입력"
                    />
                    <button
                        type="button"
                        className="bw-figma-composer-action bw-figma-composer-action--primary"
                        onClick={() => void handleSendMessage()}
                        disabled={!coerceTrimmedString(inputMessage, '') || isLoading}
                        aria-label="메시지 전송"
                        data-testid="send-button"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="m22 2-7 20-4-9-9-4L22 2z" />
                            <path d="M22 2 11 13" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IntegratedAIChat;
