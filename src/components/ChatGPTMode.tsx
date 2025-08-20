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
    Upload,
    Lightbulb,
    Play,
    Grid,
    Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import websocketService from '../services/websocketService';

interface Message {
    id: string;
    type: 'user' | 'ai';
    content: string;
    timestamp: Date;
    projectId?: string;
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
    const [monitoringStatus, setMonitoringStatus] = useState<any>(null);
    const [showMonitoringModal, setShowMonitoringModal] = useState(false);

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

    // 프로젝트 목록
    const projects: Project[] = [
        {
            id: '1',
            name: '개포',
            type: 'project',
            isSelected: true,
            subItems: [
                '바이럴',
                '재미있는 삼성물산 댓글',
                '시공사 선택 고민',
                '법적 반박글 작성',
                '설계 변경 필요 사항',
                '홍보관 방문 비교 분석',
                '모두 보기'
            ]
        },
        { id: '2', name: '개포우성', type: 'project' },
        { id: '3', name: '대화요약', type: 'project' },
        { id: '4', name: '개포우성7차', type: 'project' },
    ];

    const recentChats = [
        '온도 단위 해석',
        '소수점 반올림 방법',
        'laixi 글자 지우기 문제',
        'Mac 원격 데스크탑 한글 변환',
        '한글 백스페이스 문제'
    ];

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: inputMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        const currentInput = inputMessage;
        setInputMessage('');

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

                    const aiMessage: Message = {
                        id: (Date.now() + 1).toString(),
                        type: 'ai',
                        content: data.ai_response.content,
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
                } else {
                    // 백엔드 연결 실패 시 기본 응답
                    const aiMessage: Message = {
                        id: (Date.now() + 1).toString(),
                        type: 'ai',
                        content: `안녕하세요! "${currentInput}"에 대한 답변을 준비했습니다. CORBU AI가 도움을 드리겠습니다! 🤖`,
                        timestamp: new Date()
                    };
                    setMessages(prev => [...prev, aiMessage]);
                }
            }
        } catch (error) {
            console.error('API 호출 오류:', error);
            // 오류 시 기본 응답
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                content: `안녕하세요! "${currentInput}"에 대한 답변을 준비했습니다. CORBU AI가 도움을 드리겠습니다! 🤖`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
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

    const checkMonitoringAlerts = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/monitoring/alerts');
            if (response.ok) {
                const data = await response.json();
                return data.data || [];
            }
        } catch (error) {
            console.error('알림 확인 실패:', error);
        }
        return [];
    };

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

    const analyzeSentiment = async (text: string) => {
        if (isWebSocketConnected) {
            websocketService.sendSentimentAnalysis(text);
        } else {
            try {
                const response = await fetch('http://localhost:5000/ai/sentiment-analysis', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ text })
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('감정 분석 결과:', data.data);
                }
            } catch (error) {
                console.error('감정 분석 오류:', error);
            }
        }
    };

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
                        type: 'project'
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
                    type: 'project'
                };
                setSelectedProject(newProject);
                setShowNewProjectModal(false);
                setNewProjectName('');
            }
        }
    };

    return (
        <div className="flex h-screen bg-white">
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
                                    onClick={() => setSelectedProject(project)}
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
                        {selectedProject && (
                            <div className="flex items-center space-x-2">
                                <Folder size={16} />
                                <span className="text-sm">{selectedProject.name}</span>
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
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-left">
                                    <h3 className="font-medium mb-2">파일 추가</h3>
                                    <p className="text-sm text-gray-600">
                                        이 프로젝트의 채팅이 파일 콘텐츠에 액세스할 수 있습니다
                                    </p>
                                </div>
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-left">
                                    <h3 className="font-medium mb-2">지침 추가</h3>
                                    <p className="text-sm text-gray-600">
                                        ChatGPT가 프로젝트에 응답하는 방식을 직접 짜세요
                                    </p>
                                </div>
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
                                            <p className="text-sm">{message.content}</p>
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
                        <div className="flex items-center space-x-2 mb-4">
                            <button
                                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                            >
                                <Upload size={16} />
                                <span className="text-sm">파일 추가</span>
                            </button>
                            <span className="text-gray-400">|</span>
                            <button
                                onClick={() => setShowInstructionsModal(true)}
                                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                            >
                                <Lightbulb size={16} />
                                <span className="text-sm">지침 추가</span>
                            </button>
                        </div>

                        <div className="flex items-end space-x-2">
                            <div className="flex-1 relative">
                                <textarea
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="+ 무엇이든 물어보세요"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                disabled={!inputMessage.trim()}
                                className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={16} />
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
                                    onClick={() => setShowInstructionsModal(false)}
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
                                        <p className="text-blue-600">{monitoringStatus.active_topics}개 주제 모니터링 중</p>
                                        <p className="text-blue-600">총 {monitoringStatus.total_alerts}개 알림 발생</p>
                                    </div>

                                    {monitoringStatus.topics && monitoringStatus.topics.length > 0 && (
                                        <div>
                                            <h3 className="font-medium mb-2">모니터링 주제</h3>
                                            <div className="space-y-2">
                                                {monitoringStatus.topics.map((topic: any, index: number) => (
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
        </div>
    );
};

export default ChatGPTMode;
