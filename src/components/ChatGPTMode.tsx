import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    BookOpen,
    Clock,
    Mic,
    Send,
    Folder,
    ChevronDown,
    MoreVertical,
    Share2,
    X,
    Play,
    Grid,
    Bot,
    AlertTriangle,
    CheckCircle,
    Info,
    BarChart3,
    Smartphone,
    Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import websocketService from '../services/websocketService';
import errorHandlingService from '../services/errorHandlingService';
import performanceOptimizationService from '../services/performanceOptimizationService';
import webCommentAnalysisService from '../services/webCommentAnalysisService';
import mobileOptimizationService from '../services/mobileOptimizationService';
import advancedSecurityService from '../services/advancedSecurityService';
import ErrorFeedbackContainer from './ErrorFeedback/ErrorFeedbackContainer';

interface Message {
    id: string;
    type: 'user' | 'ai';
    content: string;
    timestamp: Date;
    projectId?: string;
    attachments?: Array<{
        id: string;
        name: string;
        type: string;
        size: number;
        url?: string;
    }>;
    analysis?: {
        score?: number;
        issues?: string[];
        improvements?: string[];
        recommendations?: string[];
    };
}

interface Project {
    id: string;
    name: string;
    type: 'project' | 'chat';
    isSelected?: boolean;
    subItems?: string[];
    description?: string;
    instructions?: string;
    files?: Array<{
        id: string;
        name: string;
        type: string;
        size: number;
        url?: string;
        uploadedAt: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

const ChatGPTMode: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const [showInstructionsModal, setShowInstructionsModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [projectInstructions, setProjectInstructions] = useState('');
    const [currentModel] = useState('ChatGPT 5');
    const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState<Array<{
        id: string;
        name: string;
        type: string;
        size: number;
        url?: string;
    }>>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [showProjectFiles, setShowProjectFiles] = useState(false);
    const [projectFiles, setProjectFiles] = useState<Array<{
        id: string;
        name: string;
        type: string;
        size: number;
        url?: string;
        uploadedAt: Date;
    }>>([]);
    const [monitoringStatus, setMonitoringStatus] = useState<{
        isConnected: boolean;
        lastUpdate: string;
        alerts: string[];
        active_topics?: number;
        total_alerts?: number;
        topics?: Array<{
            topic: string;
            alert_threshold: number;
            alert_count: number;
        }>;
    }>({
        isConnected: false,
        lastUpdate: '',
        alerts: []
    });

    // 에러 처리 및 성능 최적화 상태
    const [showPerformanceReport, setShowPerformanceReport] = useState(false);
    const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
    const [optimizationSuggestions, setOptimizationSuggestions] = useState<any[]>([]);
    const [showMonitoringModal, setShowMonitoringModal] = useState(false);

    // 웹 댓글 분석 상태
    const [showCommentAnalysisModal, setShowCommentAnalysisModal] = useState(false);
    const [commentAnalysis, setCommentAnalysis] = useState<any>(null);
    const [generatedComment, setGeneratedComment] = useState<any>(null);
    const [commentGenerationSettings, setCommentGenerationSettings] = useState({
        style: 'supportive' as const,
        tone: 'friendly' as const,
        length: 'medium' as const,
        specificTopics: [] as string[],
        avoidKeywords: [] as string[]
    });

    // 모바일 최적화 상태
    const [showMobileOptimizationModal, setShowMobileOptimizationModal] = useState(false);
    const [deviceInfo, setDeviceInfo] = useState<any>(null);
    const [optimizationSettings, setOptimizationSettings] = useState<any>(null);
    const [isOnline, setIsOnline] = useState(true);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);

    // 고급 보안 상태
    const [showSecurityModal, setShowSecurityModal] = useState(false);
    const [securityMetrics, setSecurityMetrics] = useState<any>(null);
    const [securityConfig, setSecurityConfig] = useState<any>(null);
    const [auditLog, setAuditLog] = useState<any[]>([]);
    const [currentSession, setCurrentSession] = useState<any>(null);

    // WebSocket 연결
    useEffect(() => {
        const connectWebSocket = async () => {
            try {
                await websocketService.connect();
                setIsWebSocketConnected(true);
                console.log('WebSocket 연결 성공');
            } catch (error) {
                console.error('WebSocket 연결 실패:', error);
                setIsWebSocketConnected(false);
            }
        };

        connectWebSocket();

        return () => {
            websocketService.disconnect();
        };
    }, []);

    // WebSocket 이벤트 리스너
    useEffect(() => {
        const handleAIResponse = (event: CustomEvent) => {
            const aiMessage: Message = {
                id: Date.now().toString(),
                type: 'ai',
                content: event.detail.content,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
        };

        const handleSentimentResult = (event: CustomEvent) => {
            console.log('감정 분석 결과:', event.detail);
            // 감정 분석 결과를 UI에 표시하거나 처리
        };

        window.addEventListener('aiResponse', handleAIResponse as EventListener);
        window.addEventListener('sentimentResult', handleSentimentResult as EventListener);

        return () => {
            window.removeEventListener('aiResponse', handleAIResponse as EventListener);
            window.removeEventListener('sentimentResult', handleSentimentResult as EventListener);
        };
    }, []);

    // 모니터링 상태 주기적 확인
    useEffect(() => {
        const checkStatus = async () => {
            const status = await getMonitoringStatus();
            if (status) {
                setMonitoringStatus(status);
            }
        };

        checkStatus();
        const interval = setInterval(checkStatus, 30000); // 30초마다 확인

        return () => clearInterval(interval);
    }, []);

    // 성능 최적화 및 에러 처리 초기화
    useEffect(() => {
        // 성능 메트릭 주기적 업데이트
        const updatePerformanceMetrics = () => {
            const metrics = performanceOptimizationService.getCurrentMetrics();
            const suggestions = performanceOptimizationService.getOptimizationSuggestions();

            setPerformanceMetrics(metrics);
            setOptimizationSuggestions(suggestions);
        };

        updatePerformanceMetrics();
        const performanceInterval = setInterval(updatePerformanceMetrics, 60000); // 1분마다

        return () => clearInterval(performanceInterval);
    }, []);

    // 모바일 최적화 초기화
    useEffect(() => {
        const initializeMobileOptimization = () => {
            const device = mobileOptimizationService.getDeviceInfo();
            const settings = mobileOptimizationService.getOptimizationSettings();
            const onlineStatus = mobileOptimizationService.isOnlineStatus();

            setDeviceInfo(device);
            setOptimizationSettings(settings);
            setIsOnline(onlineStatus);
        };

        initializeMobileOptimization();

        // 온라인 상태 변경 감지
        const handleOnlineStatusChange = () => {
            setIsOnline(mobileOptimizationService.isOnlineStatus());
        };

        window.addEventListener('online', handleOnlineStatusChange);
        window.addEventListener('offline', handleOnlineStatusChange);

        return () => {
            window.removeEventListener('online', handleOnlineStatusChange);
            window.removeEventListener('offline', handleOnlineStatusChange);
        };
    }, []);

    // 고급 보안 초기화
    useEffect(() => {
        const initializeSecurity = async () => {
            try {
                const metrics = advancedSecurityService.getSecurityMetrics();
                const config = advancedSecurityService.getSecurityConfig();
                const audit = advancedSecurityService.getAuditLog(50);
                const sessions = advancedSecurityService.getActiveSessions();

                setSecurityMetrics(metrics);
                setSecurityConfig(config);
                setAuditLog(audit);
                setCurrentSession(sessions[0] || null);

                // 보안 초기화 (임시 비밀번호)
                if (!metrics.encryptionOperations) {
                    await advancedSecurityService.initializeSecurity('CORBU_AI_SECURE_2024');
                }
            } catch (error) {
                console.error('보안 초기화 실패:', error);
            }
        };

        initializeSecurity();

        // 보안 메트릭 주기적 업데이트
        const updateSecurityMetrics = () => {
            const metrics = advancedSecurityService.getSecurityMetrics();
            const audit = advancedSecurityService.getAuditLog(50);
            setSecurityMetrics(metrics);
            setAuditLog(audit);
        };

        const securityInterval = setInterval(updateSecurityMetrics, 30000); // 30초마다

        return () => clearInterval(securityInterval);
    }, []);

    // 프로젝트 목록
    const projects: Project[] = [
        {
            id: '1',
            name: '개포',
            type: 'project',
            isSelected: true,
            description: '개포 지역 부동산 프로젝트',
            instructions: '부동산 관련 질문에 대해 전문적이고 실용적인 답변을 제공하세요.',
            subItems: [
                '바이럴',
                '재미있는 삼성물산 댓글',
                '시공사 선택 고민',
                '법적 반박글 작성',
                '설계 변경 필요 사항',
                '홍보관 방문 비교 분석',
                '모두 보기'
            ],
            files: [],
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date()
        },
        {
            id: '2',
            name: '개포우성',
            type: 'project',
            description: '개포우성 아파트 관련 프로젝트',
            instructions: '아파트 관련 정보와 분석을 제공하세요.',
            files: [],
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date()
        },
        {
            id: '3',
            name: '대화요약',
            type: 'project',
            description: '대화 내용 요약 및 분석',
            instructions: '대화 내용을 간결하고 명확하게 요약해주세요.',
            files: [],
            createdAt: new Date('2024-02-01'),
            updatedAt: new Date()
        },
        {
            id: '4',
            name: '개포우성7차',
            type: 'project',
            description: '개포우성 7차 분양 관련 프로젝트',
            instructions: '분양 관련 정보와 시장 분석을 제공하세요.',
            files: [],
            createdAt: new Date('2024-02-15'),
            updatedAt: new Date()
        },
    ];

    const recentChats = [
        '온도 단위 해석',
        '소수점 반올림 방법',
        'laixi 글자 지우기 문제',
        'Mac 원격 데스크탑 한글 변환',
        '한글 백스페이스 문제'
    ];

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isSending) return;

        // 성능 추적 시작
        performanceOptimizationService.trackComponentRender('ChatGPTMode', Date.now());

        setIsSending(true);
        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: inputMessage,
            timestamp: new Date(),
            attachments: attachedFiles.length > 0 ? attachedFiles.map(file => ({
                id: file.id,
                name: file.name,
                type: file.type,
                size: file.size,
                url: file.url
            })) : undefined
        };

        setMessages(prev => [...prev, userMessage]);
        const currentInput = inputMessage;
        const currentAttachments = attachedFiles;
        setInputMessage('');
        setAttachedFiles([]);

        try {
            // WebSocket이 연결되어 있으면 실시간 채팅 사용
            if (isWebSocketConnected) {
                websocketService.sendChatMessage(currentInput);
                // WebSocket 응답은 이벤트 리스너에서 처리됨
            } else {
                // WebSocket이 연결되지 않았으면 HTTP API 사용
                const response = await fetch('http://localhost:5000/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        content: currentInput,
                        role: 'user'
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('백엔드 응답:', data);

                    let aiContent = data.ai_response.content;

                    // 프로젝트 컨텍스트 추가
                    if (selectedProject) {
                        const projectInfo = `
**프로젝트 컨텍스트:**
📁 프로젝트: ${selectedProject.name}
📝 설명: ${selectedProject.description || '설명 없음'}
💡 지침: ${selectedProject.instructions || '지침 없음'}
📎 프로젝트 파일: ${selectedProject.files?.length || 0}개
📅 생성일: ${selectedProject.createdAt.toLocaleDateString()}
🔄 수정일: ${selectedProject.updatedAt.toLocaleDateString()}
                        `.trim();
                        aiContent = `${projectInfo}\n\n${aiContent}`;
                    }

                    // 첨부파일이 있는 경우 AI 응답에 파일 정보 포함
                    if (currentAttachments.length > 0) {
                        const fileInfo = currentAttachments.map(file =>
                            `📎 ${file.name} (${file.type}, ${(file.size / 1024).toFixed(1)}KB)`
                        ).join('\n');
                        aiContent = `${aiContent}\n\n**첨부파일 분석:**\n${fileInfo}\n\n*첨부파일을 분석하여 더 정확한 답변을 제공했습니다.*`;
                    }

                    const aiMessage: Message = {
                        id: (Date.now() + 1).toString(),
                        type: 'ai',
                        content: aiContent,
                        timestamp: new Date()
                    };
                    setMessages(prev => [...prev, aiMessage]);

                    // 모니터링 키워드가 포함된 경우 자동으로 모니터링 시작
                    if (currentInput.includes('모니터링') || currentInput.includes('추적')) {
                        const topic = currentInput.replace(/모니터링|추적/g, '').trim();
                        if (topic) {
                            try {
                                await addMonitoringTopic(topic, 0.7);
                            } catch (error) {
                                console.error('모니터링 추가 실패:', error);
                            }
                        }
                    }

                    // 웹 댓글 분석 요청 처리
                    if (currentInput.includes('댓글') && (currentInput.includes('분석') || currentInput.includes('생성'))) {
                        try {
                            await handleCommentAnalysis(currentInput);
                        } catch (error) {
                            console.error('댓글 분석 실패:', error);
                        }
                    }
                } else {
                    // 백엔드 연결 실패 시 기본 응답
                    let fallbackContent = `안녕하세요! "${currentInput}"에 대한 답변을 준비했습니다. CORBU AI가 도움을 드리겠습니다! 🤖`;

                    // 프로젝트 컨텍스트 추가
                    if (selectedProject) {
                        const projectInfo = `
**프로젝트 컨텍스트:**
📁 프로젝트: ${selectedProject.name}
📝 설명: ${selectedProject.description || '설명 없음'}
💡 지침: ${selectedProject.instructions || '지침 없음'}
📎 프로젝트 파일: ${selectedProject.files?.length || 0}개
                        `.trim();
                        fallbackContent = `${projectInfo}\n\n${fallbackContent}`;
                    }

                    if (currentAttachments.length > 0) {
                        const fileInfo = currentAttachments.map(file =>
                            `📎 ${file.name} (${file.type}, ${(file.size / 1024).toFixed(1)}KB)`
                        ).join('\n');
                        fallbackContent += `\n\n**첨부파일 확인:**\n${fileInfo}\n\n*첨부파일을 확인했습니다. 서버 연결 후 더 정확한 분석을 제공하겠습니다.*`;
                    }

                    const aiMessage: Message = {
                        id: (Date.now() + 1).toString(),
                        type: 'ai',
                        content: fallbackContent,
                        timestamp: new Date()
                    };
                    setMessages(prev => [...prev, aiMessage]);
                }
            }
        } catch (error) {
            console.error('API 호출 오류:', error);

            // 에러 처리 서비스에 에러 보고
            await errorHandlingService.reportError(
                error instanceof Error ? error : new Error(String(error)),
                {
                    component: 'ChatGPTMode',
                    action: 'handleSendMessage',
                    metadata: {
                        inputMessage: currentInput,
                        attachmentsCount: currentAttachments.length,
                        selectedProject: selectedProject?.name
                    }
                },
                'API 호출 중 오류가 발생했습니다.'
            );

            // 오류 시 기본 응답
            let errorContent = `안녕하세요! "${currentInput}"에 대한 답변을 준비했습니다. CORBU AI가 도움을 드리겠습니다! 🤖`;

            // 프로젝트 컨텍스트 추가
            if (selectedProject) {
                const projectInfo = `
**프로젝트 컨텍스트:**
📁 프로젝트: ${selectedProject.name}
📝 설명: ${selectedProject.description || '설명 없음'}
💡 지침: ${selectedProject.instructions || '지침 없음'}
📎 프로젝트 파일: ${selectedProject.files?.length || 0}개
                `.trim();
                errorContent = `${projectInfo}\n\n${errorContent}`;
            }

            if (currentAttachments.length > 0) {
                const fileInfo = currentAttachments.map(file =>
                    `📎 ${file.name} (${file.type}, ${(file.size / 1024).toFixed(1)}KB)`
                ).join('\n');
                errorContent += `\n\n**첨부파일 확인:**\n${fileInfo}\n\n*첨부파일을 확인했습니다. 연결 문제 해결 후 더 정확한 분석을 제공하겠습니다.*`;
            }

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                content: errorContent,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // 웹 댓글 분석 처리
    const handleCommentAnalysis = async (input: string) => {
        try {
            // 검색어 추출
            const searchQuery = input.replace(/댓글|분석|생성|해줘|요/g, '').trim();
            
            if (!searchQuery) {
                console.error('검색어를 찾을 수 없습니다.');
                return;
            }

            // 웹 검색 결과에서 댓글 추출
            const comments = await webCommentAnalysisService.extractCommentsFromWebSearch(searchQuery);
            
            // 댓글 분석
            const analysis = webCommentAnalysisService.analyzeComments(comments);
            setCommentAnalysis(analysis);

            // 댓글 생성
            const generatedComment = await webCommentAnalysisService.generateComment({
                originalContent: searchQuery,
                comments: comments,
                targetStyle: commentGenerationSettings.style,
                targetTone: commentGenerationSettings.tone,
                targetLength: commentGenerationSettings.length,
                specificTopics: commentGenerationSettings.specificTopics,
                avoidKeywords: commentGenerationSettings.avoidKeywords
            });

            setGeneratedComment(generatedComment);
            setShowCommentAnalysisModal(true);

        } catch (error) {
            console.error('댓글 분석 중 오류:', error);
            await errorHandlingService.reportError(
                error instanceof Error ? error : new Error(String(error)),
                {
                    component: 'ChatGPTMode',
                    action: 'handleCommentAnalysis',
                    metadata: { input }
                },
                '댓글 분석 중 오류가 발생했습니다.'
            );
        }
    };

    // 고급 기능 API 호출 함수들
    const addMonitoringTopic = async (topic: string, alertThreshold: number = 0.7) => {
        try {
            const response = await fetch('http://localhost:5000/api/monitoring/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    topic: topic,
                    user_id: 'default_user',
                    alert_threshold: alertThreshold
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('모니터링 추가 성공:', data);
                return data;
            }
        } catch (error) {
            console.error('모니터링 추가 실패:', error);
        }
    };

    // 모니터링 알림 확인 함수 (향후 사용 예정)
    // const checkMonitoringAlerts = async () => {
    //     try {
    //         const response = await fetch('http://localhost:5000/api/monitoring/alerts');
    //         if (response.ok) {
    //             const data = await response.json();
    //             return data.data || [];
    //         }
    //     } catch (error) {
    //         console.error('알림 확인 실패:', error);
    //     }
    //     return [];
    // };

    const getMonitoringStatus = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/monitoring/status');
            if (response.ok) {
                const data = await response.json();
                return data.data;
            }
        } catch (error) {
            console.error('모니터링 상태 확인 실패:', error);
        }
        return null;
    };

    // 감정 분석 함수 (향후 사용 예정)
    // const analyzeSentiment = async (text: string) => {
    //     if (isWebSocketConnected) {
    //         websocketService.sendSentimentAnalysis(text);
    //     } else {
    //         try {
    //         const response = await fetch('http://localhost:5000/ai/sentiment-analysis', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({ text })
    //         });

    //         if (response.ok) {
    //             const data = await response.json();
    //             console.log('감정 분석 결과:', data.data);
    //         }
    //     } catch (error) {
    //         console.error('감정 분석 오류:', error);
    //     }
    // }
    // };

    const createNewProject = async () => {
        if (newProjectName.trim()) {
            try {
                // 백엔드에 프로젝트 생성 요청
                const response = await fetch('http://localhost:5000/api/projects', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id: Date.now().toString(),
                        name: newProjectName,
                        description: `새로운 프로젝트: ${newProjectName}`,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const newProject: Project = {
                        id: data.project.id,
                        name: data.project.name,
                        type: 'project',
                        description: `새로운 프로젝트: ${data.project.name}`,
                        instructions: '',
                        files: [],
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                    setSelectedProject(newProject);
                    setShowNewProjectModal(false);
                    setNewProjectName('');

                    // 성공 메시지 추가
                    const successMessage: Message = {
                        id: Date.now().toString(),
                        type: 'ai',
                        content: `프로젝트 "${newProjectName}"이 성공적으로 생성되었습니다! 🎉`,
                        timestamp: new Date()
                    };
                    setMessages(prev => [...prev, successMessage]);
                }
            } catch (error) {
                console.error('프로젝트 생성 오류:', error);
                // 오류 시에도 로컬에서 프로젝트 생성
                const newProject: Project = {
                    id: Date.now().toString(),
                    name: newProjectName,
                    type: 'project',
                    description: `새로운 프로젝트: ${newProjectName}`,
                    instructions: '',
                    files: [],
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                setSelectedProject(newProject);
                setShowNewProjectModal(false);
                setNewProjectName('');
            }
        }
    };

    return (
        <div className="flex h-screen bg-white" data-component="ChatGPTMode">
            {/* 컴포넌트 식별자 - 개발용 */}
            <div className="fixed top-0 left-0 bg-red-500 text-white px-2 py-1 text-xs z-50">
                ChatGPTMode 컴포넌트 - 프로젝트: {selectedProject?.name || '없음'} | 파일: {attachedFiles.length}개
            </div>
            {/* Left Sidebar - ChatGPT Style */}
            <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
                {/* 연결 상태 표시 */}
                <div className="p-2 bg-gray-100 border-b border-gray-200">
                    <div className="flex items-center space-x-2 text-xs">
                        <div className={`w-2 h-2 rounded-full ${isWebSocketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={isWebSocketConnected ? 'text-green-700' : 'text-red-700'}>
                            {isWebSocketConnected ? '실시간 연결됨' : 'HTTP 모드'}
                        </span>
                    </div>
                </div>
                {/* Top Navigation */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-2 mb-4">
                        <button className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 px-2 py-1 rounded">
                            <Plus size={16} />
                            <span className="text-sm">새 채팅</span>
                        </button>
                    </div>
                    <div className="flex items-center space-x-2 mb-4">
                        <button className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 px-2 py-1 rounded">
                            <Search size={16} />
                            <span className="text-sm">Q 채팅 검색</span>
                        </button>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 px-2 py-1 rounded">
                            <BookOpen size={16} />
                            <span className="text-sm">라이브러리</span>
                        </button>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setShowMonitoringModal(true)}
                            className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 px-2 py-1 rounded"
                        >
                            <BarChart3 size={16} />
                            <span className="text-sm">모니터링</span>
                        </button>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setShowPerformanceReport(true)}
                            className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 px-2 py-1 rounded"
                        >
                            <CheckCircle size={16} />
                            <span className="text-sm">성능</span>
                        </button>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setShowCommentAnalysisModal(true)}
                            className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 px-2 py-1 rounded"
                        >
                            <BookOpen size={16} />
                            <span className="text-sm">댓글 분석</span>
                        </button>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setShowMobileOptimizationModal(true)}
                            className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 px-2 py-1 rounded"
                        >
                            <Smartphone size={16} />
                            <span className="text-sm">모바일</span>
                        </button>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setShowSecurityModal(true)}
                            className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 px-2 py-1 rounded"
                        >
                            <Shield size={16} />
                            <span className="text-sm">보안</span>
                        </button>
                    </div>
                </div>

                {/* AI Models */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-2 mb-2">
                        <Clock size={16} />
                        <span className="text-sm font-medium">Codex</span>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                        <Play size={16} />
                        <span className="text-sm font-medium">Sora</span>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                        <Grid size={16} />
                        <span className="text-sm font-medium">GPT</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Bot size={16} />
                        <span className="text-sm font-medium">챗</span>
                    </div>
                </div>

                {/* Projects */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="mb-4">
                        <button
                            onClick={() => setShowNewProjectModal(true)}
                            className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 px-2 py-1 rounded w-full"
                        >
                            <Folder size={16} />
                            <span className="text-sm">새 프로젝트</span>
                        </button>
                    </div>

                    <div className="space-y-1">
                        {projects.map((project) => (
                            <div key={project.id}>
                                <button
                                    onClick={() => {
                                        setSelectedProject(project);
                                        // 프로젝트 선택 시 해당 프로젝트의 파일들 로드
                                        if (project.files) {
                                            setProjectFiles(project.files);
                                        }
                                    }}
                                    className={`flex items-center space-x-2 px-2 py-1 rounded w-full text-left ${project.isSelected ? 'bg-gray-200' : 'hover:bg-gray-100'
                                        }`}
                                >
                                    <Folder size={16} />
                                    <span className="text-sm truncate">{project.name}</span>
                                </button>
                                {project.isSelected && project.subItems && (
                                    <div className="ml-6 mt-1 space-y-1">
                                        {project.subItems.map((item, index) => (
                                            <button
                                                key={index}
                                                className="flex items-center px-2 py-1 rounded w-full text-left hover:bg-gray-100"
                                            >
                                                <span className="text-sm text-gray-600 truncate">{item}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Recent Chats */}
                    <div className="mt-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">채팅</h3>
                        <div className="space-y-1">
                            {recentChats.map((chat, index) => (
                                <button
                                    key={index}
                                    className="flex items-center px-2 py-1 rounded w-full text-left hover:bg-gray-100"
                                >
                                    <span className="text-sm text-gray-600 truncate">{chat}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* User Profile */}
                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">K</span>
                        </div>
                        <div>
                            <div className="text-sm font-medium">KIM HOBUM</div>
                            <div className="text-xs text-gray-500">Plus</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Top Bar */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <span className="text-lg font-medium">{currentModel}</span>
                            <ChevronDown size={16} />
                        </div>
                        {selectedProject ? (
                            <div className="flex items-center space-x-2">
                                <Folder size={16} />
                                <div>
                                    <span className="text-sm font-medium">{selectedProject.name}</span>
                                    <div className="text-xs text-gray-500">
                                        {selectedProject.files?.length || 0}개 파일 • {selectedProject.instructions ? '지침 설정됨' : '지침 없음'}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2 text-gray-500">
                                <Folder size={16} />
                                <span className="text-sm">프로젝트를 선택하세요</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-gray-100 rounded">
                            <Share2 size={16} />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded">
                            <MoreVertical size={16} />
                        </button>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4">
                    {messages.length === 0 ? (
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="mb-8">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Folder size={32} className="text-gray-600" />
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedProject?.name || '프로젝트'}</h1>
                            </div>

                            <div className="max-w-2xl mx-auto mb-8">
                                <div className="flex items-center space-x-2 mb-4">
                                    <Plus size={20} />
                                    <span className="text-lg">{selectedProject?.name || '프로젝트'}에서 새 채팅</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Mic size={16} />
                                    <div className="w-8 h-2 bg-gray-300 rounded-full"></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                                <button
                                    onClick={() => setShowProjectFiles(true)}
                                    className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-left hover:bg-gray-100 transition-colors"
                                >
                                    <h3 className="font-medium mb-2">파일 추가</h3>
                                    <p className="text-sm text-gray-600">
                                        이 프로젝트의 채팅이 파일 콘텐츠에 액세스할 수 있습니다
                                    </p>
                                </button>
                                <button
                                    onClick={() => {
                                        setProjectInstructions(selectedProject?.instructions || '');
                                        setShowInstructionsModal(true);
                                    }}
                                    className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-left hover:bg-gray-100 transition-colors"
                                >
                                    <h3 className="font-medium mb-2">지침 추가</h3>
                                    <p className="text-sm text-gray-600">
                                        ChatGPT가 프로젝트에 응답하는 방식을 직접 짜세요
                                    </p>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto">
                            <AnimatePresence>
                                {messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className={`mb-6 ${message.type === 'user' ? 'text-right' : 'text-left'}`}
                                    >
                                        <div className={`inline-block max-w-3xl ${message.type === 'user'
                                            ? 'bg-blue-500 text-white rounded-lg px-4 py-2'
                                            : 'bg-gray-100 text-gray-800 rounded-lg px-4 py-2'
                                            }`}>
                                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                            {message.attachments && message.attachments.length > 0 && (
                                                <div className="mt-2 pt-2 border-t border-opacity-20 border-white">
                                                    <div className="text-xs opacity-70 mb-1">첨부파일:</div>
                                                    <div className="space-y-1">
                                                        {message.attachments.map((attachment, idx) => (
                                                            <div key={idx} className="text-xs opacity-80 flex items-center space-x-1">
                                                                <span>📎</span>
                                                                <span>{attachment.name}</span>
                                                                <span>({(attachment.size / 1024).toFixed(1)}KB)</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <p className="text-xs opacity-70 mt-1">
                                                {message.timestamp.toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-200">
                    <div className="max-w-4xl mx-auto">
                        {/* 첨부파일 미리보기 */}
                        {attachedFiles.length > 0 && (
                            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-lg">📎</span>
                                        <span className="text-sm font-semibold text-blue-900">첨부파일 ({attachedFiles.length}개)</span>
                                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">질문과 함께 전송됩니다</span>
                                    </div>
                                    <button
                                        onClick={() => setAttachedFiles([])}
                                        className="text-xs text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition-colors font-medium"
                                    >
                                        모두 제거
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {attachedFiles.map((file, index) => {
                                        const getFileIcon = (fileName: string, fileType: string) => {
                                            const extension = fileName.split('.').pop()?.toLowerCase();
                                            if (fileType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '')) {
                                                return '🖼️';
                                            } else if (fileType.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv'].includes(extension || '')) {
                                                return '🎥';
                                            } else if (fileType.startsWith('audio/') || ['mp3', 'wav', 'flac', 'aac'].includes(extension || '')) {
                                                return '🎵';
                                            } else if (['pdf'].includes(extension || '')) {
                                                return '📄';
                                            } else if (['doc', 'docx'].includes(extension || '')) {
                                                return '📝';
                                            } else if (['xls', 'xlsx'].includes(extension || '')) {
                                                return '📊';
                                            } else if (['ppt', 'pptx'].includes(extension || '')) {
                                                return '📋';
                                            } else if (['txt', 'md'].includes(extension || '')) {
                                                return '📄';
                                            } else {
                                                return '📁';
                                            }
                                        };

                                        const getFileTypeName = (fileName: string, fileType: string) => {
                                            const extension = fileName.split('.').pop()?.toLowerCase();
                                            if (fileType.startsWith('image/')) return '이미지';
                                            if (fileType.startsWith('video/')) return '비디오';
                                            if (fileType.startsWith('audio/')) return '오디오';
                                            if (extension === 'pdf') return 'PDF 문서';
                                            if (['doc', 'docx'].includes(extension || '')) return 'Word 문서';
                                            if (['xls', 'xlsx'].includes(extension || '')) return 'Excel 문서';
                                            if (['ppt', 'pptx'].includes(extension || '')) return 'PowerPoint';
                                            if (['txt', 'md'].includes(extension || '')) return '텍스트';
                                            return '파일';
                                        };

                                        const formatFileSize = (bytes: number) => {
                                            if (bytes < 1024) return `${bytes}B`;
                                            if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
                                            return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
                                        };

                                        return (
                                            <div key={file.id} className="bg-white rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-shadow p-3">
                                                <div className="flex items-start space-x-3">
                                                    <div className="flex-shrink-0">
                                                        <span className="text-2xl">{getFileIcon(file.name, file.type)}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-sm font-medium text-gray-900 truncate">{file.name}</span>
                                                            <button
                                                                onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== index))}
                                                                className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                                                                title="제거"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                                                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                                                {getFileTypeName(file.name, file.type)}
                                                            </span>
                                                            <span>{formatFileSize(file.size)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div
                            className={`flex items-end space-x-2 transition-all duration-200 ${isDragOver ? 'bg-blue-50 border-blue-500 rounded-lg p-2' : ''}`}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setIsDragOver(true);
                            }}
                            onDragLeave={(e) => {
                                e.preventDefault();
                                setIsDragOver(false);
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                setIsDragOver(false);

                                const files = Array.from(e.dataTransfer.files);
                                if (files.length > 0) {
                                    const newAttachments = files.map((file, index) => ({
                                        id: `file-${Date.now()}-${index}`,
                                        name: file.name,
                                        type: file.type,
                                        size: file.size,
                                        url: URL.createObjectURL(file)
                                    }));
                                    setAttachedFiles(prev => [...prev, ...newAttachments]);
                                }
                            }}
                        >
                            <div className="flex-1 relative">
                                <textarea
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        const files = Array.from(e.dataTransfer.files);
                                        if (files.length > 0) {
                                            const newAttachments = files.map(file => ({
                                                id: Date.now().toString() + Math.random(),
                                                name: file.name,
                                                type: file.type,
                                                size: file.size,
                                                url: URL.createObjectURL(file)
                                            }));
                                            setAttachedFiles(prev => [...prev, ...newAttachments]);
                                        }
                                    }}
                                    placeholder={isDragOver ? "파일을 여기에 놓으세요!" : "+ 무엇이든 물어보세요 (파일을 드래그하여 첨부 가능)"}
                                    className={`w-full border rounded-lg px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:border-transparent transition-all ${isDragOver
                                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                        : 'border-gray-300 hover:border-gray-400 focus:ring-blue-500 focus:border-blue-500'
                                        }`}
                                    rows={1}
                                    style={{ minHeight: '48px', maxHeight: '120px' }}
                                />
                                <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                                    <button className="p-1 hover:bg-gray-100 rounded">
                                        <Mic size={16} />
                                    </button>
                                </div>
                            </div>
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputMessage.trim() || isSending}
                                className={`p-3 rounded-lg transition-all duration-200 ${inputMessage.trim() && !isSending
                                    ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-md'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                                title={isSending ? '전송 중...' : '메시지 전송'}
                            >
                                {isSending ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                ) : (
                                    <Send size={16} />
                                )}
                            </button>
                        </div>

                        <p className="text-xs text-gray-500 mt-2 text-center">
                            ChatGPT는 실수를 할 수 있습니다. 중요한 정보는 재차 확인하세요.
                        </p>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showNewProjectModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-lg p-6 w-96"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-medium">프로젝트 이름</h2>
                                <button onClick={() => setShowNewProjectModal(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <input
                                type="text"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                placeholder="예: 생일 파티 계획"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            <div className="flex items-start space-x-2 mb-4">
                                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                                    <span className="text-blue-600 text-xs">i</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                    프로젝트란 무엇인가요? 프로젝트에서는 한 곳에 파일, 맞춤형 지침을 보관합니다.
                                    지속적으로 진행되는 작업에, 또는 작업을 깔끔히 정리하기에 좋죠.
                                </p>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={() => setShowNewProjectModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={createNewProject}
                                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                                >
                                    프로젝트 만들기
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Project Files Modal */}
            <AnimatePresence>
                {showProjectFiles && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-medium">프로젝트 파일 관리</h2>
                                <button onClick={() => setShowProjectFiles(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-medium">현재 프로젝트: {selectedProject?.name}</h3>
                                    <button
                                        onClick={() => {
                                            const input = document.createElement('input');
                                            input.type = 'file';
                                            input.multiple = true;
                                            input.accept = '.txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4,.mp3';
                                            input.onchange = (e) => {
                                                const files = Array.from((e.target as HTMLInputElement).files || []);
                                                if (files.length > 0) {
                                                    const newFiles = files.map((file, index) => ({
                                                        id: `project-file-${Date.now()}-${index}`,
                                                        name: file.name,
                                                        type: file.type,
                                                        size: file.size,
                                                        url: URL.createObjectURL(file),
                                                        uploadedAt: new Date()
                                                    }));
                                                    setProjectFiles(prev => [...prev, ...newFiles]);

                                                    // 프로젝트에도 파일 추가
                                                    if (selectedProject) {
                                                        const updatedProject = {
                                                            ...selectedProject,
                                                            files: [...(selectedProject.files || []), ...newFiles],
                                                            updatedAt: new Date()
                                                        };
                                                        setSelectedProject(updatedProject);
                                                    }
                                                }
                                            };
                                            input.click();
                                        }}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        파일 추가
                                    </button>
                                </div>
                            </div>

                            {projectFiles.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {projectFiles.map((file, index) => {
                                        const getFileIcon = (fileName: string, fileType: string) => {
                                            const extension = fileName.split('.').pop()?.toLowerCase();
                                            if (fileType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '')) {
                                                return '🖼️';
                                            } else if (fileType.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv'].includes(extension || '')) {
                                                return '🎥';
                                            } else if (fileType.startsWith('audio/') || ['mp3', 'wav', 'flac', 'aac'].includes(extension || '')) {
                                                return '🎵';
                                            } else if (['pdf'].includes(extension || '')) {
                                                return '📄';
                                            } else if (['doc', 'docx'].includes(extension || '')) {
                                                return '📝';
                                            } else if (['xls', 'xlsx'].includes(extension || '')) {
                                                return '📊';
                                            } else if (['ppt', 'pptx'].includes(extension || '')) {
                                                return '📋';
                                            } else if (['txt', 'md'].includes(extension || '')) {
                                                return '📄';
                                            } else {
                                                return '📁';
                                            }
                                        };

                                        const getFileTypeName = (fileName: string, fileType: string) => {
                                            const extension = fileName.split('.').pop()?.toLowerCase();
                                            if (fileType.startsWith('image/')) return '이미지';
                                            if (fileType.startsWith('video/')) return '비디오';
                                            if (fileType.startsWith('audio/')) return '오디오';
                                            if (extension === 'pdf') return 'PDF 문서';
                                            if (['doc', 'docx'].includes(extension || '')) return 'Word 문서';
                                            if (['xls', 'xlsx'].includes(extension || '')) return 'Excel 문서';
                                            if (['ppt', 'pptx'].includes(extension || '')) return 'PowerPoint';
                                            if (['txt', 'md'].includes(extension || '')) return '텍스트';
                                            return '파일';
                                        };

                                        const formatFileSize = (bytes: number) => {
                                            if (bytes < 1024) return `${bytes}B`;
                                            if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
                                            return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
                                        };

                                        return (
                                            <div key={file.id} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                                                <div className="flex items-start space-x-3">
                                                    <div className="flex-shrink-0">
                                                        <span className="text-2xl">{getFileIcon(file.name, file.type)}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-sm font-medium text-gray-900 truncate">{file.name}</span>
                                                            <button
                                                                onClick={() => {
                                                                    setProjectFiles(prev => prev.filter((_, i) => i !== index));
                                                                    if (selectedProject) {
                                                                        const updatedProject = {
                                                                            ...selectedProject,
                                                                            files: (selectedProject.files || []).filter((_, i) => i !== index),
                                                                            updatedAt: new Date()
                                                                        };
                                                                        setSelectedProject(updatedProject);
                                                                    }
                                                                }}
                                                                className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                                                                title="제거"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                                                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                                                {getFileTypeName(file.name, file.type)}
                                                            </span>
                                                            <span>{formatFileSize(file.size)}</span>
                                                        </div>
                                                        <div className="text-xs text-gray-400 mt-1">
                                                            업로드: {file.uploadedAt.toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <div className="text-4xl mb-2">📁</div>
                                    <p>아직 업로드된 파일이 없습니다.</p>
                                    <p className="text-sm">파일을 추가하여 프로젝트에서 활용하세요.</p>
                                </div>
                            )}

                            <div className="flex justify-end mt-6">
                                <button
                                    onClick={() => setShowProjectFiles(false)}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    닫기
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Instructions Modal */}
            <AnimatePresence>
                {showInstructionsModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-lg p-6 w-96"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-medium">지침</h2>
                                <button onClick={() => setShowInstructionsModal(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <h3 className="font-medium mb-2">
                                어떻게 하면 ChatGPT가 이 프로젝트를 최대한 도와드릴 수 있을까요?
                            </h3>

                            <p className="text-sm text-gray-600 mb-4">
                                ChatGPT에게 특정 토픽에 집중해 달라고 하거나, 특정한 톤이나 포맷으로 응답해 달라고 할 수 있습니다.
                            </p>

                            <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                <p className="text-sm text-gray-700">
                                    예: "스페인어로 대답해 줘. 최신 JavaScript 문서를 레퍼런스로 삼아 줘. 대답을 간결히 핵심만 담아서 해 줘."
                                </p>
                            </div>

                            <textarea
                                value={projectInstructions}
                                onChange={(e) => setProjectInstructions(e.target.value)}
                                placeholder="프로젝트 지침을 입력하세요..."
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            <div className="flex justify-end space-x-2 mt-4">
                                <button
                                    onClick={() => setShowInstructionsModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={() => {
                                        if (selectedProject) {
                                            const updatedProject = {
                                                ...selectedProject,
                                                instructions: projectInstructions,
                                                updatedAt: new Date()
                                            };
                                            setSelectedProject(updatedProject);
                                        }
                                        setShowInstructionsModal(false);
                                    }}
                                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                                >
                                    저장
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 모니터링 상태 모달 */}
            <AnimatePresence>
                {showMonitoringModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-medium">실시간 모니터링 상태</h2>
                                <button onClick={() => setShowMonitoringModal(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            {monitoringStatus ? (
                                <div className="space-y-4">
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <h3 className="font-medium text-blue-800">활성 모니터링</h3>
                                        <p className="text-blue-600">{monitoringStatus.active_topics || 0}개 주제 모니터링 중</p>
                                        <p className="text-blue-600">총 {monitoringStatus.total_alerts || 0}개 알림 발생</p>
                                    </div>

                                    {monitoringStatus.topics && monitoringStatus.topics.length > 0 && (
                                        <div>
                                            <h3 className="font-medium mb-2">모니터링 주제</h3>
                                            <div className="space-y-2">
                                                {monitoringStatus.topics.map((topic, index) => (
                                                    <div key={index} className="bg-gray-50 p-2 rounded">
                                                        <p className="font-medium">{topic.topic}</p>
                                                        <p className="text-sm text-gray-600">
                                                            알림 임계값: {topic.alert_threshold}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            알림 수: {topic.alert_count}개
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-500">모니터링 정보를 불러오는 중...</p>
                            )}

                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={() => setShowMonitoringModal(false)}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                    닫기
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 성능 모니터링 패널 */}
            <AnimatePresence>
                {showPerformanceReport && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-medium">성능 모니터링</h2>
                                <button onClick={() => setShowPerformanceReport(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            {performanceMetrics ? (
                                <div className="space-y-4">
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <h3 className="font-medium text-blue-800">메모리 사용량</h3>
                                        <p className="text-blue-600">
                                            {performanceMetrics.memoryUsage.percentage.toFixed(1)}% 사용 중
                                        </p>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                            <div
                                                className={`h-2 rounded-full ${performanceMetrics.memoryUsage.percentage > 80 ? 'bg-red-500' :
                                                    performanceMetrics.memoryUsage.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                                                    }`}
                                                style={{ width: `${performanceMetrics.memoryUsage.percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="bg-green-50 p-3 rounded-lg">
                                        <h3 className="font-medium text-green-800">렌더링 성능</h3>
                                        <p className="text-green-600">
                                            평균 렌더링 시간: {performanceMetrics.renderTime.toFixed(2)}ms
                                        </p>
                                        <p className="text-green-600">
                                            컴포넌트 렌더링: {performanceMetrics.componentRenderCount}회
                                        </p>
                                    </div>

                                    {optimizationSuggestions.length > 0 && (
                                        <div className="bg-yellow-50 p-3 rounded-lg">
                                            <h3 className="font-medium text-yellow-800">최적화 제안</h3>
                                            <div className="space-y-2">
                                                {optimizationSuggestions.slice(0, 3).map((suggestion, index) => (
                                                    <div key={index} className="text-sm">
                                                        <p className="font-medium">{suggestion.message}</p>
                                                        <p className="text-yellow-600">{suggestion.impact}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-500">성능 메트릭을 불러오는 중...</p>
                            )}

                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={() => setShowPerformanceReport(false)}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                    닫기
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 웹 댓글 분석 모달 */}
            <AnimatePresence>
                {showCommentAnalysisModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-lg p-6 w-4/5 max-w-4xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">웹 댓글 분석 및 생성</h2>
                                <button onClick={() => setShowCommentAnalysisModal(false)}>
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* 댓글 분석 결과 */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">댓글 분석 결과</h3>
                                    
                                    {commentAnalysis ? (
                                        <div className="space-y-3">
                                            <div className="bg-blue-50 p-3 rounded-lg">
                                                <h4 className="font-medium text-blue-800">전체 감정</h4>
                                                <p className="text-blue-600 capitalize">{commentAnalysis.overallSentiment}</p>
                                            </div>

                                            <div className="bg-green-50 p-3 rounded-lg">
                                                <h4 className="font-medium text-green-800">주요 토픽</h4>
                                                <p className="text-green-600">{commentAnalysis.dominantTopics.join(', ')}</p>
                                            </div>

                                            <div className="bg-yellow-50 p-3 rounded-lg">
                                                <h4 className="font-medium text-yellow-800">공통 키워드</h4>
                                                <p className="text-yellow-600">{commentAnalysis.commonKeywords.join(', ')}</p>
                                            </div>

                                            <div className="bg-purple-50 p-3 rounded-lg">
                                                <h4 className="font-medium text-purple-800">참여도</h4>
                                                <p className="text-purple-600 capitalize">{commentAnalysis.engagementLevel}</p>
                                            </div>

                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <h4 className="font-medium text-gray-800">톤</h4>
                                                <p className="text-gray-600 capitalize">{commentAnalysis.tone}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">분석 결과를 불러오는 중...</p>
                                    )}
                                </div>

                                {/* 생성된 댓글 */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">생성된 댓글</h3>
                                    
                                    {generatedComment ? (
                                        <div className="space-y-3">
                                            <div className="bg-white border border-gray-200 p-4 rounded-lg">
                                                <h4 className="font-medium text-gray-800 mb-2">댓글 내용</h4>
                                                <p className="text-gray-700">{generatedComment.content}</p>
                                            </div>

                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <h4 className="font-medium text-gray-800 mb-2">생성 설정</h4>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div>
                                                        <span className="font-medium">스타일:</span> {generatedComment.style}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">톤:</span> {generatedComment.tone}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">길이:</span> {generatedComment.length}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">대상:</span> {generatedComment.targetAudience}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-blue-50 p-3 rounded-lg">
                                                <h4 className="font-medium text-blue-800 mb-2">생성 근거</h4>
                                                <p className="text-blue-700 text-sm">{generatedComment.reasoning}</p>
                                            </div>

                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(generatedComment.content);
                                                        // 복사 완료 알림
                                                    }}
                                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                                >
                                                    복사
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setInputMessage(generatedComment.content);
                                                        setShowCommentAnalysisModal(false);
                                                    }}
                                                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                                >
                                                    입력창에 추가
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">댓글을 생성하는 중...</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end mt-6">
                                <button
                                    onClick={() => setShowCommentAnalysisModal(false)}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                                >
                                    닫기
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 모바일 최적화 모달 */}
            <AnimatePresence>
                {showMobileOptimizationModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-lg p-6 w-4/5 max-w-4xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">모바일 최적화 및 PWA</h2>
                                <button onClick={() => setShowMobileOptimizationModal(false)}>
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* 디바이스 정보 */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">디바이스 정보</h3>
                                    
                                    {deviceInfo ? (
                                        <div className="space-y-3">
                                            <div className="bg-blue-50 p-3 rounded-lg">
                                                <h4 className="font-medium text-blue-800">디바이스 타입</h4>
                                                <p className="text-blue-600 capitalize">{deviceInfo.type}</p>
                                            </div>

                                            <div className="bg-green-50 p-3 rounded-lg">
                                                <h4 className="font-medium text-green-800">운영체제</h4>
                                                <p className="text-green-600 capitalize">{deviceInfo.os}</p>
                                            </div>

                                            <div className="bg-yellow-50 p-3 rounded-lg">
                                                <h4 className="font-medium text-yellow-800">브라우저</h4>
                                                <p className="text-yellow-600 capitalize">{deviceInfo.browser}</p>
                                            </div>

                                            <div className="bg-purple-50 p-3 rounded-lg">
                                                <h4 className="font-medium text-purple-800">화면 크기</h4>
                                                <p className="text-purple-600">{deviceInfo.screenSize.width} x {deviceInfo.screenSize.height}</p>
                                            </div>

                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <h4 className="font-medium text-gray-800">방향</h4>
                                                <p className="text-gray-600 capitalize">{deviceInfo.orientation}</p>
                                            </div>

                                            <div className="bg-indigo-50 p-3 rounded-lg">
                                                <h4 className="font-medium text-indigo-800">터치 지원</h4>
                                                <p className="text-indigo-600">{deviceInfo.touchSupport ? '지원' : '미지원'}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">디바이스 정보를 불러오는 중...</p>
                                    )}
                                </div>

                                {/* 최적화 설정 */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">최적화 설정</h3>
                                    
                                    {optimizationSettings ? (
                                        <div className="space-y-3">
                                            <div className="bg-white border border-gray-200 p-4 rounded-lg">
                                                <h4 className="font-medium text-gray-800 mb-3">기능 설정</h4>
                                                <div className="space-y-2">
                                                    {Object.entries(optimizationSettings).map(([key, value]) => (
                                                        <div key={key} className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-600">
                                                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                            </span>
                                                            <span className={`text-sm font-medium ${value ? 'text-green-600' : 'text-red-600'}`}>
                                                                {value ? '활성화' : '비활성화'}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="bg-blue-50 p-3 rounded-lg">
                                                <h4 className="font-medium text-blue-800 mb-2">네트워크 상태</h4>
                                                <div className="flex items-center space-x-2">
                                                    <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                    <span className="text-blue-700">{isOnline ? '온라인' : '오프라인'}</span>
                                                </div>
                                            </div>

                                            {showInstallPrompt && (
                                                <div className="bg-green-50 p-3 rounded-lg">
                                                    <h4 className="font-medium text-green-800 mb-2">PWA 설치</h4>
                                                    <p className="text-green-700 text-sm mb-2">이 앱을 홈 화면에 설치할 수 있습니다.</p>
                                                    <button
                                                        onClick={() => mobileOptimizationService.showInstallPrompt()}
                                                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                                                    >
                                                        설치하기
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">설정을 불러오는 중...</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end mt-6">
                                <button
                                    onClick={() => setShowMobileOptimizationModal(false)}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                                >
                                    닫기
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 고급 보안 모달 */}
            <AnimatePresence>
                {showSecurityModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-lg p-6 w-4/5 max-w-6xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">고급 보안 및 암호화</h2>
                                <button onClick={() => setShowSecurityModal(false)}>
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* 보안 메트릭 */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">보안 메트릭</h3>
                                    
                                    {securityMetrics ? (
                                        <div className="space-y-3">
                                            <div className="bg-blue-50 p-3 rounded-lg">
                                                <h4 className="font-medium text-blue-800">보안 점수</h4>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div 
                                                            className={`h-2 rounded-full ${
                                                                securityMetrics.securityScore >= 80 ? 'bg-green-500' :
                                                                securityMetrics.securityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                            }`}
                                                            style={{ width: `${securityMetrics.securityScore}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-blue-600 font-medium">{securityMetrics.securityScore}/100</span>
                                                </div>
                                            </div>

                                            <div className="bg-green-50 p-3 rounded-lg">
                                                <h4 className="font-medium text-green-800">로그인 통계</h4>
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex justify-between">
                                                        <span>총 로그인:</span>
                                                        <span className="font-medium">{securityMetrics.totalLogins}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>실패 로그인:</span>
                                                        <span className="font-medium text-red-600">{securityMetrics.failedLogins}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>활성 세션:</span>
                                                        <span className="font-medium">{securityMetrics.activeSessions}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-purple-50 p-3 rounded-lg">
                                                <h4 className="font-medium text-purple-800">암호화 작업</h4>
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex justify-between">
                                                        <span>총 작업:</span>
                                                        <span className="font-medium">{securityMetrics.encryptionOperations}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>오디트 이벤트:</span>
                                                        <span className="font-medium">{securityMetrics.auditEvents}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-yellow-50 p-3 rounded-lg">
                                                <h4 className="font-medium text-yellow-800">마지막 스캔</h4>
                                                <p className="text-yellow-600 text-sm">
                                                    {securityMetrics.lastSecurityScan ? 
                                                        new Date(securityMetrics.lastSecurityScan).toLocaleString() : 
                                                        '스캔 없음'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">보안 메트릭을 불러오는 중...</p>
                                    )}
                                </div>

                                {/* 취약점 및 권장사항 */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">취약점 및 권장사항</h3>
                                    
                                    {securityMetrics?.vulnerabilities ? (
                                        <div className="space-y-3">
                                            {securityMetrics.vulnerabilities.length > 0 ? (
                                                securityMetrics.vulnerabilities.map((vuln: any, index: number) => (
                                                    <div key={index} className={`p-3 rounded-lg ${
                                                        vuln.severity === 'critical' ? 'bg-red-50 border border-red-200' :
                                                        vuln.severity === 'high' ? 'bg-orange-50 border border-orange-200' :
                                                        vuln.severity === 'medium' ? 'bg-yellow-50 border border-yellow-200' :
                                                        'bg-blue-50 border border-blue-200'
                                                    }`}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h4 className={`font-medium ${
                                                                vuln.severity === 'critical' ? 'text-red-800' :
                                                                vuln.severity === 'high' ? 'text-orange-800' :
                                                                vuln.severity === 'medium' ? 'text-yellow-800' :
                                                                'text-blue-800'
                                                            }`}>
                                                                {vuln.type}
                                                            </h4>
                                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                                vuln.severity === 'critical' ? 'bg-red-200 text-red-800' :
                                                                vuln.severity === 'high' ? 'bg-orange-200 text-orange-800' :
                                                                vuln.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                                                                'bg-blue-200 text-blue-800'
                                                            }`}>
                                                                {vuln.severity.toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-700 mb-2">{vuln.description}</p>
                                                        <p className="text-xs text-gray-600">{vuln.recommendation}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                                    <div className="flex items-center space-x-2">
                                                        <CheckCircle className="text-green-600" size={20} />
                                                        <span className="text-green-800 font-medium">보안 상태 양호</span>
                                                    </div>
                                                    <p className="text-green-700 text-sm mt-1">현재 발견된 취약점이 없습니다.</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">취약점 정보를 불러오는 중...</p>
                                    )}
                                </div>

                                {/* 보안 설정 */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">보안 설정</h3>
                                    
                                    {securityConfig ? (
                                        <div className="space-y-3">
                                            <div className="bg-white border border-gray-200 p-4 rounded-lg">
                                                <h4 className="font-medium text-gray-800 mb-3">암호화 설정</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span>암호화 활성화:</span>
                                                        <span className={`font-medium ${securityConfig.encryptionEnabled ? 'text-green-600' : 'text-red-600'}`}>
                                                            {securityConfig.encryptionEnabled ? '활성화' : '비활성화'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>알고리즘:</span>
                                                        <span className="font-medium">{securityConfig.encryptionAlgorithm}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>키 반복:</span>
                                                        <span className="font-medium">{securityConfig.keyDerivationIterations.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <h4 className="font-medium text-gray-800 mb-3">세션 관리</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span>세션 타임아웃:</span>
                                                        <span className="font-medium">{securityConfig.sessionTimeout}분</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>최대 로그인 시도:</span>
                                                        <span className="font-medium">{securityConfig.maxLoginAttempts}회</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>오디트 로깅:</span>
                                                        <span className={`font-medium ${securityConfig.auditLogging ? 'text-green-600' : 'text-red-600'}`}>
                                                            {securityConfig.auditLogging ? '활성화' : '비활성화'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-blue-50 p-3 rounded-lg">
                                                <h4 className="font-medium text-blue-800 mb-2">현재 세션</h4>
                                                {currentSession ? (
                                                    <div className="space-y-1 text-sm">
                                                        <div className="flex justify-between">
                                                            <span>세션 ID:</span>
                                                            <span className="font-mono text-xs">{currentSession.id.slice(0, 8)}...</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>만료 시간:</span>
                                                            <span className="font-medium">
                                                                {new Date(currentSession.expiresAt).toLocaleTimeString()}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>IP 주소:</span>
                                                            <span className="font-medium">{currentSession.ipAddress}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-blue-700 text-sm">활성 세션이 없습니다.</p>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">보안 설정을 불러오는 중...</p>
                                    )}
                                </div>
                            </div>

                            {/* 오디트 로그 */}
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold mb-4">최근 보안 이벤트</h3>
                                <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                                    {auditLog.length > 0 ? (
                                        <div className="space-y-2">
                                            {auditLog.slice(0, 10).map((event, index) => (
                                                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-2 h-2 rounded-full ${
                                                            event.success ? 'bg-green-500' : 'bg-red-500'
                                                        }`}></div>
                                                        <span className="text-sm font-medium">{event.action}</span>
                                                        <span className="text-xs text-gray-500">{event.resource}</span>
                                                    </div>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(event.timestamp).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-center">보안 이벤트가 없습니다.</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end mt-6">
                                <button
                                    onClick={() => setShowSecurityModal(false)}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                                >
                                    닫기
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pull to Refresh 인디케이터 */}
            <div
                id="pull-to-refresh-indicator"
                className="fixed top-0 left-0 right-0 h-16 bg-blue-500 text-white flex items-center justify-center transform -translate-y-full transition-all duration-300 opacity-0 z-40"
            >
                <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                    <span className="text-sm font-medium">새로고침 중...</span>
                </div>
            </div>

            {/* 에러 피드백 컨테이너 */}
            <ErrorFeedbackContainer />
        </div>
    );
};

export default ChatGPTMode;
