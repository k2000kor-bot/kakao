import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    Bot,
    User,
    Loader2,
    Copy,
    Check,
    RefreshCw,
    BookOpen,
    ExternalLink,
    Sparkles
} from 'lucide-react';
import { Chat, Message } from '../types/project';
import { messageService, chatService } from '../services/projectService';
import { projectKnowledgeService } from '../services/projectKnowledgeService';
import AdvancedContentGenerator from './AdvancedContentGenerator';

interface ChatInterfaceProps {
    chat: Chat | null;
    projectGuidelines?: string;
    onChatUpdate: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
    chat,
    projectGuidelines,
    onChatUpdate
}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
    const [showAdvancedGenerator, setShowAdvancedGenerator] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (chat) {
            loadMessages();
        }
    }, [chat]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadMessages = () => {
        if (chat) {
            const chatMessages = messageService.getChatMessages(chat.id);
            setMessages(chatMessages);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async () => {
        if (!chat || !inputMessage.trim() || isLoading) return;

        const userMessage = inputMessage.trim();
        setInputMessage('');
        setIsLoading(true);

        try {
            // 사용자 메시지 추가
            const userMsg = messageService.addMessage(chat.id, userMessage, 'user');
            setMessages(prev => [...prev, userMsg]);

            // AI 응답 생성
            const aiResponse = await generateAIResponse(userMessage, projectGuidelines);

            // AI 메시지 추가
            const aiMsg = messageService.addMessage(chat.id, aiResponse, 'assistant', {
                responseTime: Date.now() - userMsg.timestamp.getTime(),
                model: 'CORBU AI'
            });
            setMessages(prev => [...prev, aiMsg]);

            // AI 응답에서 지식 추출하여 지식베이스에 추가
            try {
                const extractedKnowledge = await projectKnowledgeService.extractKnowledgeFromChat(
                    chat.projectId,
                    chat.id,
                    aiMsg.id,
                    aiResponse,
                    true // AI 응답임을 표시
                );

                if (extractedKnowledge.length > 0) {
                    console.log(`${extractedKnowledge.length}개의 지식이 추출되어 지식베이스에 추가되었습니다.`);
                }
            } catch (error) {
                console.error('지식 추출 실패:', error);
            }

            // 채팅 제목 업데이트 (첫 번째 메시지인 경우)
            if (messages.length === 0) {
                const title = userMessage.length > 30 ? userMessage.substring(0, 30) + '...' : userMessage;
                chatService.updateChat(chat.id, { title });
                onChatUpdate();
            }

        } catch (error) {
            console.error('메시지 전송 실패:', error);
            // 에러 메시지 추가
            const errorMsg = messageService.addMessage(chat.id, '죄송합니다. 응답을 생성하는 중 오류가 발생했습니다.', 'assistant');
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const generateAIResponse = async (userMessage: string, guidelines?: string): Promise<string> => {
        // 실제 AI API 호출 대신 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        // 지식베이스 검색
        let knowledgeResults: any[] = [];
        if (chat) {
            try {
                const searchResults = projectKnowledgeService.searchKnowledge(chat.projectId, userMessage, 3);
                knowledgeResults = searchResults.map(result => ({
                    title: result.entry.title,
                    content: result.context,
                    relevance: result.relevanceScore
                }));
            } catch (error) {
                console.error('지식베이스 검색 실패:', error);
            }
        }

        // 웹 검색 시뮬레이션 (특정 키워드가 포함된 경우)
        const searchKeywords = ['최신', '트렌드', '기술', 'API', '라이브러리', '프레임워크', '업데이트', '뉴스'];
        const shouldSearch = searchKeywords.some(keyword => userMessage.includes(keyword));

        let webSearchResults: any[] = [];
        if (shouldSearch) {
            webSearchResults = await simulateWebSearch(userMessage);

            // 웹 검색 결과를 지식베이스에 추가
            if (chat && webSearchResults.length > 0) {
                try {
                    await projectKnowledgeService.addWebSearchResults(
                        chat.projectId,
                        userMessage,
                        webSearchResults,
                        chat.id,
                        'web-search-' + Date.now()
                    );
                } catch (error) {
                    console.error('웹 검색 결과 지식베이스 추가 실패:', error);
                }
            }
        }

        const responses = [
            `안녕하세요! "${userMessage}"에 대한 답변을 드리겠습니다. 프로젝트 지침을 참고하여 최적의 답변을 제공하겠습니다.`,
            `좋은 질문이네요! "${userMessage}"에 대해 자세히 설명드리겠습니다. 프로젝트 컨텍스트를 고려한 답변입니다.`,
            `"${userMessage}"에 대한 분석 결과입니다. 프로젝트 목표에 맞춰 답변을 구성했습니다.`,
            `프로젝트 지침을 바탕으로 "${userMessage}"에 답변드립니다. 더 자세한 정보가 필요하시면 언제든 말씀해 주세요.`,
            `"${userMessage}"에 대한 전문적인 답변입니다. 프로젝트의 성공적인 완료를 위해 도움이 되길 바랍니다.`
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        let finalResponse = randomResponse;

        // 지식베이스 정보 추가
        if (knowledgeResults.length > 0) {
            finalResponse += '\n\n📚 관련 지식베이스 정보:\n';
            knowledgeResults.forEach((result, index) => {
                finalResponse += `${index + 1}. ${result.title}\n   ${result.content}\n`;
            });
        }

        // 프로젝트 지침 추가
        if (guidelines) {
            finalResponse += `\n\n📋 프로젝트 지침을 참고했습니다:\n${guidelines.substring(0, 200)}${guidelines.length > 200 ? '...' : ''}`;
        }

        return finalResponse;
    };

    // 웹 검색 시뮬레이션
    const simulateWebSearch = async (query: string): Promise<any[]> => {
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

        const mockResults = [
            {
                title: `${query} 관련 최신 정보`,
                snippet: `${query}에 대한 최신 트렌드와 기술 정보를 제공합니다. 이는 프로젝트에 유용한 참고 자료가 될 수 있습니다.`,
                link: 'https://example.com/latest-info',
                author: 'Tech Blog',
                date: '2024-01-15'
            },
            {
                title: `${query} 가이드 및 튜토리얼`,
                snippet: `${query}를 효과적으로 활용하는 방법과 모범 사례를 다룹니다. 실무에서 바로 적용할 수 있는 팁들을 포함합니다.`,
                link: 'https://example.com/guide',
                author: 'Developer Hub',
                date: '2024-01-10'
            },
            {
                title: `${query} 공식 문서 및 API 레퍼런스`,
                snippet: `${query}의 공식 문서와 API 레퍼런스를 제공합니다. 정확하고 신뢰할 수 있는 정보를 확인할 수 있습니다.`,
                link: 'https://example.com/docs',
                author: 'Official Docs',
                date: '2024-01-12'
            }
        ];

        return mockResults;
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleCopyMessage = async (messageId: string, content: string) => {
        try {
            await navigator.clipboard.writeText(content);
            setCopiedMessageId(messageId);
            setTimeout(() => setCopiedMessageId(null), 2000);
        } catch (error) {
            console.error('복사 실패:', error);
        }
    };

    const handleAdvancedContentGenerated = (content: any) => {
        // 고도화된 콘텐츠가 생성되면 채팅에 추가
        if (chat) {
            const aiMsg = messageService.addMessage(chat.id, content.content, 'assistant', {
                responseTime: 0,
                model: 'CORBU AI Advanced',
                metadata: {
                    title: content.title,
                    qualityMetrics: content.qualityMetrics,
                    generatedBy: 'advanced_content_generator'
                }
            });
            setMessages(prev => [...prev, aiMsg]);
            onChatUpdate();
        }
        setShowAdvancedGenerator(false);
    };

    const handleRetryMessage = async (messageId: string) => {
        const message = messages.find(m => m.id === messageId);
        if (!message || message.role !== 'user' || !chat) return;

        // 해당 메시지 이후의 모든 메시지 삭제
        const messageIndex = messages.findIndex(m => m.id === messageId);
        const messagesToDelete = messages.slice(messageIndex + 1);

        messagesToDelete.forEach(msg => {
            messageService.deleteMessage(msg.id);
        });

        setMessages(messages.slice(0, messageIndex + 1));

        // AI 응답 재생성
        setIsLoading(true);
        try {
            const aiResponse = await generateAIResponse(message.content, projectGuidelines);
            const aiMsg = messageService.addMessage(chat.id, aiResponse, 'assistant', {
                model: 'CORBU AI'
            });
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error('재시도 실패:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!chat) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-50">
                <div className="text-center">
                    <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">채팅을 선택하거나 새 채팅을 시작하세요</p>
                </div>
            </div>
        );
    }

    return (
        <>
        <div className="flex flex-col h-full bg-white">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                        <Bot className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{chat.title}</h3>
                        <p className="text-sm text-gray-500">
                            {messages.length}개의 메시지
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setShowAdvancedGenerator(true)}
                        className="flex items-center px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100"
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        고도화 콘텐츠 생성
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex items-start space-x-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                                }`}>
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.role === 'user'
                                    ? 'bg-purple-600'
                                    : 'bg-gray-200'
                                    }`}>
                                    {message.role === 'user' ? (
                                        <User className="h-4 w-4 text-white" />
                                    ) : (
                                        <Bot className="h-4 w-4 text-gray-600" />
                                    )}
                                </div>

                                <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''
                                    }`}>
                                    <div className={`inline-block p-3 rounded-lg ${message.role === 'user'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-100 text-gray-900'
                                        }`}>
                                        <div className="whitespace-pre-wrap">{message.content}</div>
                                    </div>

                                    <div className={`flex items-center space-x-2 mt-2 text-xs text-gray-500 ${message.role === 'user' ? 'justify-end' : 'justify-start'
                                        }`}>
                                        <span>{formatTime(message.timestamp)}</span>

                                        {message.role === 'assistant' && (
                                            <>
                                                <button
                                                    onClick={() => handleCopyMessage(message.id, message.content)}
                                                    className="hover:text-gray-700 transition-colors"
                                                >
                                                    {copiedMessageId === message.id ? (
                                                        <Check className="h-3 w-3" />
                                                    ) : (
                                                        <Copy className="h-3 w-3" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleRetryMessage(message.id)}
                                                    className="hover:text-gray-700 transition-colors"
                                                >
                                                    <RefreshCw className="h-3 w-3" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                    >
                        <div className="flex items-start space-x-3 max-w-[80%]">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <Bot className="h-4 w-4 text-gray-600" />
                            </div>
                            <div className="flex-1">
                                <div className="inline-block p-3 rounded-lg bg-gray-100">
                                    <div className="flex items-center space-x-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                                        <span className="text-gray-600">답변을 생성하고 있습니다...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-end space-x-3">
                    <div className="flex-1 relative">
                        <textarea
                            ref={textareaRef}
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="메시지를 입력하세요... (Shift + Enter로 줄바꿈)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                            rows={1}
                            style={{
                                minHeight: '40px',
                                maxHeight: '120px',
                                height: 'auto'
                            }}
                            onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = 'auto';
                                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                            }}
                        />
                    </div>
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || isLoading}
                        className="flex-shrink-0 p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>

        {/* Advanced Content Generator Modal */}
        <AnimatePresence>
            {showAdvancedGenerator && (
                <AdvancedContentGenerator
                    projectId={chat?.projectId || ''}
                    initialQuery={inputMessage}
                    onContentGenerated={handleAdvancedContentGenerated}
                    onClose={() => setShowAdvancedGenerator(false)}
                />
            )}
        </AnimatePresence>
        </>
    );
};

export default ChatInterface;
