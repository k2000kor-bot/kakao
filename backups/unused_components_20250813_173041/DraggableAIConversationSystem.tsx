import React, { useState, useEffect, useCallback } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import {
    StarIcon,
    ChatBubbleLeftRightIcon,
    UserIcon,
    ArrowPathIcon,
    CalendarIcon,
    ChartBarIcon,
    BellIcon,
    FireIcon,
    EyeIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    BoltIcon,
    Bars3Icon,
    LockClosedIcon,
    LockOpenIcon,
    ArrowsPointingOutIcon,
    MinusIcon,
    XMarkIcon,
    CpuChipIcon
} from '@heroicons/react/24/outline';
import {
    advancedBrainwashAPI,
    type BrainwashRequest,
    type BrainwashResponse,
    type GeneratedBrainwashMessage,
    type PsychologicalProfile
} from '../services/advancedBrainwashAPI';

interface ChatRoom {
    id: string;
    name: string;
    messageCount: number;
    lastActivity: string;
    isActive: boolean;
}

interface Message {
    id: string;
    content: string;
    sender: string;
    timestamp: string;
    isSelected?: boolean;
}

interface GeneratedMessage {
    id: string;
    content: string;
    confidence: number;
    type: 'neural' | 'quantum' | 'extreme' | 'personalized';
    psychological_score: number;
    psychological_metrics: {
        persuasion_potential: number;
        emotional_impact: number;
        cognitive_load: number;
        neural_activation: number;
        manipulation_score: number;
    };
    safety_score: number;
    generation_engine: string;
}

interface PanelPosition {
    x: number;
    y: number;
    width: number;
    height: number;
    isLocked: boolean;
    isMinimized: boolean;
    zIndex: number;
}

interface LayoutState {
    leftPanel: PanelPosition;
    centerPanel: PanelPosition;
    rightPanel: PanelPosition;
    isEditMode: boolean;
}

const DraggableAIConversationSystem: React.FC = () => {
    // 레이아웃 상태 관리
    const [layoutState, setLayoutState] = useState<LayoutState>({
        leftPanel: { x: 0, y: 0, width: 320, height: 600, isLocked: false, isMinimized: false, zIndex: 1 },
        centerPanel: { x: 340, y: 0, width: 600, height: 600, isLocked: false, isMinimized: false, zIndex: 2 },
        rightPanel: { x: 960, y: 0, width: 320, height: 600, isLocked: false, isMinimized: false, zIndex: 3 },
        isEditMode: false
    });

    // 기존 상태들
    const [selectedChatRoom, setSelectedChatRoom] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
    const [selectedParticipant, setSelectedParticipant] = useState('참여자를 선택하세요');
    const [messageStrategy, setMessageStrategy] = useState('논리적 번박');
    const [messageIntent, setMessageIntent] = useState('');
    const [generatedMessages, setGeneratedMessages] = useState<GeneratedMessage[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [startDate, setStartDate] = useState('2020.01.01');
    const [endDate, setEndDate] = useState('2026.12.31');
    const [psychologicalProfile, setPsychologicalProfile] = useState<PsychologicalProfile | null>(null);
    const [influenceLevel, setInfluenceLevel] = useState<'gentle' | 'moderate' | 'assertive' | 'intensive'>('moderate');
    const [ethicalConstraints, setEthicalConstraints] = useState(true);
    const [activeEngines, setActiveEngines] = useState<string[]>(['neural', 'context']);

    // 채팅방 리스트
    const chatRooms: ChatRoom[] = [
        {
            id: '1',
            name: '[인증]행복한소유☆개포우성7차',
            messageCount: 4106,
            lastActivity: '활성 상태',
            isActive: true
        }
    ];

    // 레이아웃 저장/로드
    const saveLayout = () => {
        localStorage.setItem('aiConversationLayout', JSON.stringify(layoutState));
        alert('💾 레이아웃이 저장되었습니다!');
    };

    const loadLayout = () => {
        const saved = localStorage.getItem('aiConversationLayout');
        if (saved) {
            setLayoutState(JSON.parse(saved));
            alert('📂 저장된 레이아웃을 불러왔습니다!');
        }
    };

    const resetLayout = () => {
        setLayoutState({
            leftPanel: { x: 0, y: 0, width: 320, height: 600, isLocked: false, isMinimized: false, zIndex: 1 },
            centerPanel: { x: 340, y: 0, width: 600, height: 600, isLocked: false, isMinimized: false, zIndex: 2 },
            rightPanel: { x: 960, y: 0, width: 320, height: 600, isLocked: false, isMinimized: false, zIndex: 3 },
            isEditMode: false
        });
    };

    // 패널 핸들러들
    const handleDrag = (panelName: keyof LayoutState, e: DraggableEvent, data: DraggableData) => {
        if (panelName === 'isEditMode') return;

        setLayoutState(prev => ({
            ...prev,
            [panelName]: {
                ...(prev[panelName] as PanelPosition),
                x: data.x,
                y: data.y
            }
        }));
    };

    const toggleLock = (panelName: keyof LayoutState) => {
        if (panelName === 'isEditMode') return;

        setLayoutState(prev => ({
            ...prev,
            [panelName]: {
                ...(prev[panelName] as PanelPosition),
                isLocked: !(prev[panelName] as PanelPosition).isLocked
            }
        }));
    };

    const toggleMinimize = (panelName: keyof LayoutState) => {
        if (panelName === 'isEditMode') return;

        setLayoutState(prev => ({
            ...prev,
            [panelName]: {
                ...(prev[panelName] as PanelPosition),
                isMinimized: !(prev[panelName] as PanelPosition).isMinimized
            }
        }));
    };

    const bringToFront = (panelName: keyof LayoutState) => {
        if (panelName === 'isEditMode') return;

        const maxZ = Math.max(layoutState.leftPanel.zIndex, layoutState.centerPanel.zIndex, layoutState.rightPanel.zIndex);
        setLayoutState(prev => ({
            ...prev,
            [panelName]: {
                ...(prev[panelName] as PanelPosition),
                zIndex: maxZ + 1
            }
        }));
    };

    // 메시지 생성 함수 (기존과 동일)
    const generateMessages = async () => {
        if (!selectedMessageId || !messageIntent.trim()) {
            alert('메시지를 선택하고 취지를 입력해주세요.');
            return;
        }

        setIsGenerating(true);

        try {
            const selectedMessage = messages.find(m => m.id === selectedMessageId);
            if (!selectedMessage) return;

            const request: BrainwashRequest = {
                target_message: selectedMessage,
                target_intent: messageIntent,
                personality_setting: selectedParticipant,
                construction_preference: '강삼성',
                influence_level: influenceLevel,
                active_engines: activeEngines,
                ethical_constraints: ethicalConstraints,
                strategy_type: messageStrategy
            };

            let response: BrainwashResponse;

            if (activeEngines.includes('extreme') && !ethicalConstraints) {
                response = await advancedBrainwashAPI.generateExtremePressure(request);
            } else if (activeEngines.includes('quantum')) {
                response = await advancedBrainwashAPI.generateQuantumManipulation(request);
            } else if (activeEngines.length > 1) {
                response = await advancedBrainwashAPI.generateHybridBrainwash(request);
            } else {
                response = await advancedBrainwashAPI.generateNeuralBrainwash(request);
            }

            const convertedMessages: GeneratedMessage[] = response.generated_messages.map(msg => ({
                ...msg,
                psychological_score: Math.round(msg.psychological_metrics.persuasion_potential * 100)
            }));

            setGeneratedMessages(convertedMessages);
            setPsychologicalProfile(response.psychological_analysis);

        } catch (error) {
            console.error('메시지 생성 실패:', error);
            alert('메시지 생성 중 오류가 발생했습니다.');
        } finally {
            setIsGenerating(false);
        }
    };

    // 샘플 메시지 로딩
    const loadSampleMessages = useCallback(() => {
        const sampleMessages: Message[] = [
            {
                id: '1',
                content: '조합원들의 의사가 중요한게 루체하임의 경우는 조합원들이 환급금을 받는걸 최우선 과제로 삼았기에 물산은 고객의 입맛에 맞춰줄 수 밖에 없었다고 알고 있습니다.',
                sender: '0098',
                timestamp: '2025년 6월 24일 오전 9:22'
            },
            {
                id: '2',
                content: '환급금 3억 받은걸로 알고 있습니다! 2',
                sender: '0124우성',
                timestamp: '2025년 6월 24일 오전 9:25'
            },
            {
                id: '3',
                content: '개인적 2',
                sender: '0124우성',
                timestamp: '2025년 6월 24일 오전 9:26'
            },
            {
                id: '4',
                content: '저도 동감합니다 2',
                sender: '0035_우성7차',
                timestamp: '2025년 6월 24일 오전 9:54'
            }
        ];
        setMessages(sampleMessages);
    }, []);

    useEffect(() => {
        if (selectedChatRoom) {
            loadSampleMessages();
        }
    }, [selectedChatRoom, loadSampleMessages]);

    // 드래그 가능한 패널 컴포넌트
    const DraggablePanel: React.FC<{
        panelName: keyof LayoutState;
        title: string;
        icon: React.ElementType;
        children: React.ReactNode;
    }> = ({ panelName, title, icon: Icon, children }) => {
        if (panelName === 'isEditMode') return null;

        const panel = layoutState[panelName] as PanelPosition;

        return (
            <Draggable
                position={{ x: panel.x, y: panel.y }}
                disabled={panel.isLocked}
                onDrag={(e: DraggableEvent, data: DraggableData) => handleDrag(panelName, e, data)}
                handle=".drag-handle"
            >
                <div
                    className={`absolute bg-white border-2 rounded-lg shadow-xl transition-all duration-200 ${panel.isLocked ? 'border-green-400' : 'border-gray-300'
                        } ${layoutState.isEditMode ? 'ring-2 ring-blue-400' : ''}`}
                    style={{
                        width: panel.width,
                        height: panel.isMinimized ? 60 : panel.height,
                        zIndex: panel.zIndex
                    }}
                    onClick={() => bringToFront(panelName)}
                >
                    {/* 패널 헤더 */}
                    <div className={`drag-handle flex items-center justify-between p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg cursor-move ${panel.isLocked ? 'cursor-not-allowed' : 'cursor-move'
                        }`}>
                        <div className="flex items-center space-x-2">
                            <Icon className="w-5 h-5" />
                            <span className="font-semibold text-sm">{title}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleMinimize(panelName);
                                }}
                                className="p-1 hover:bg-white/20 rounded"
                            >
                                <MinusIcon className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleLock(panelName);
                                }}
                                className="p-1 hover:bg-white/20 rounded"
                            >
                                {panel.isLocked ? (
                                    <LockClosedIcon className="w-4 h-4" />
                                ) : (
                                    <LockOpenIcon className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* 패널 내용 */}
                    {!panel.isMinimized && (
                        <div className="p-4 h-full overflow-y-auto">
                            {children}
                        </div>
                    )}
                </div>
            </Draggable>
        );
    };

    return (
        <div className="h-screen bg-gradient-to-br from-slate-100 to-blue-50 relative overflow-hidden">
            {/* 상단 컨트롤 바 */}
            <div className="absolute top-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-b border-gray-200 px-6 py-3 z-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <StarIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">AI 대화분석시스템</h1>
                            <p className="text-xs text-gray-500">드래그 가능한 레이아웃</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setLayoutState(prev => ({ ...prev, isEditMode: !prev.isEditMode }))}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${layoutState.isEditMode
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            {layoutState.isEditMode ? '🔧 편집 모드' : '✏️ 편집 모드'}
                        </button>
                        <button
                            onClick={saveLayout}
                            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                        >
                            💾 저장
                        </button>
                        <button
                            onClick={loadLayout}
                            className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
                        >
                            📂 불러오기
                        </button>
                        <button
                            onClick={resetLayout}
                            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                        >
                            🔄 초기화
                        </button>
                    </div>
                </div>
            </div>

            {/* 메인 컨테이너 */}
            <div className="pt-16 h-full relative">

                {/* 왼쪽 패널 - 채팅방 및 통계 */}
                <DraggablePanel panelName="leftPanel" title="채팅방 & 통계" icon={ChatBubbleLeftRightIcon}>
                    <div className="space-y-4">
                        {/* 채팅방 섹션 */}
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-2 flex items-center space-x-2">
                                <ChatBubbleLeftRightIcon className="w-4 h-4 text-green-600" />
                                <span>채팅방</span>
                            </h3>
                            <div className="space-y-2">
                                {chatRooms.map((room) => (
                                    <div
                                        key={room.id}
                                        onClick={() => setSelectedChatRoom(room.id)}
                                        className={`p-2 rounded border cursor-pointer transition-all text-sm ${selectedChatRoom === room.id
                                            ? 'bg-blue-50 border-blue-200'
                                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                            }`}
                                    >
                                        <div className="font-medium text-gray-800 truncate text-xs">
                                            {room.name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {room.messageCount}개 • {room.lastActivity}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 분석 기간 */}
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-2 flex items-center space-x-2">
                                <CalendarIcon className="w-4 h-4 text-blue-600" />
                                <span>분석 기간</span>
                            </h3>
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                    placeholder="시작 날짜"
                                />
                                <input
                                    type="text"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                    placeholder="종료 날짜"
                                />
                                <button className="w-full bg-blue-500 text-white py-1 rounded text-xs hover:bg-blue-600">
                                    기간 적용
                                </button>
                            </div>
                        </div>

                        {/* AI 성취 통계 */}
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-2 flex items-center space-x-2">
                                <ChartBarIcon className="w-4 h-4 text-purple-600" />
                                <span>AI 통계</span>
                            </h3>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span>생성수:</span>
                                    <span className="font-semibold">{generatedMessages.length}개</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>신뢰도:</span>
                                    <span className="font-semibold">
                                        {generatedMessages.length > 0
                                            ? Math.round(generatedMessages.reduce((sum, msg) => sum + msg.confidence, 0) / generatedMessages.length)
                                            : 0}%
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>활성 엔진:</span>
                                    <span className="font-semibold">{activeEngines.length}개</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </DraggablePanel>

                {/* 가운데 패널 - 대화 내용 */}
                <DraggablePanel panelName="centerPanel" title="대화 내용" icon={ChatBubbleLeftRightIcon}>
                    <div className="h-full flex flex-col">
                        {/* 검색바 */}
                        <div className="mb-3">
                            <input
                                type="text"
                                placeholder="메시지 검색..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                        </div>

                        {/* 메시지 리스트 */}
                        <div className="flex-1 overflow-y-auto space-y-3">
                            {selectedChatRoom ? messages.map((message) => (
                                <div key={message.id} className="space-y-2">
                                    {/* 원본 메시지 */}
                                    <div
                                        onClick={() => setSelectedMessageId(message.id)}
                                        className={`p-3 rounded border cursor-pointer transition-all ${selectedMessageId === message.id
                                            ? 'bg-blue-50 border-blue-300'
                                            : 'bg-white border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium text-blue-600">
                                                {message.sender}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {message.timestamp}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-800 leading-relaxed">
                                            {message.content}
                                        </p>
                                    </div>

                                    {/* 생성된 메시지들 */}
                                    {selectedMessageId === message.id && generatedMessages.length > 0 && (
                                        <div className="ml-4 space-y-2">
                                            {generatedMessages.map((genMsg, index) => (
                                                <div
                                                    key={genMsg.id}
                                                    className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded p-3"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center space-x-2">
                                                            <FireIcon className="w-4 h-4 text-green-600" />
                                                            <span className="text-sm font-medium text-green-800">
                                                                브레인워시 메시지 {index + 1}
                                                            </span>
                                                        </div>
                                                        <div className="flex space-x-2 text-xs">
                                                            <span className="text-green-700">신뢰도: {genMsg.confidence}%</span>
                                                            <span className={`${genMsg.safety_score > 0.7 ? 'text-green-700' : 'text-red-700'}`}>
                                                                안전도: {Math.round(genMsg.safety_score * 100)}%
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {genMsg.safety_score < 0.7 && (
                                                        <div className="mb-2 p-2 bg-red-100 border border-red-300 rounded text-xs text-red-800">
                                                            ⚠️ 주의: 강한 심리적 조작 요소 포함
                                                        </div>
                                                    )}

                                                    <p className="text-gray-800 leading-relaxed mb-2 text-sm">
                                                        {genMsg.content}
                                                    </p>
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(genMsg.content);
                                                            alert('메시지가 복사되었습니다!');
                                                        }}
                                                        className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                                                    >
                                                        복사
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )) : (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center text-gray-500">
                                        <ChatBubbleLeftRightIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                        <p className="text-sm">채팅방을 선택하세요</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </DraggablePanel>

                {/* 오른쪽 패널 - 설정 및 제어 */}
                <DraggablePanel panelName="rightPanel" title="브레인워시 설정" icon={CpuChipIcon}>
                    <div className="space-y-4">
                        {/* 영향력 수준 */}
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-2 flex items-center space-x-2">
                                <BoltIcon className="w-4 h-4 text-orange-600" />
                                <span>영향력 수준</span>
                            </h3>
                            <div className="space-y-1">
                                {[
                                    { id: 'gentle', label: '순화적', color: 'green' },
                                    { id: 'moderate', label: '보통', color: 'blue' },
                                    { id: 'assertive', label: '적극적', color: 'orange' },
                                    { id: 'intensive', label: '극도', color: 'red' }
                                ].map((level) => (
                                    <button
                                        key={level.id}
                                        onClick={() => setInfluenceLevel(level.id as any)}
                                        disabled={level.id === 'intensive' && ethicalConstraints}
                                        className={`w-full p-2 rounded text-left text-xs transition-all ${influenceLevel === level.id
                                            ? `bg-${level.color}-100 border-${level.color}-300 border`
                                            : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                                            } ${level.id === 'intensive' && ethicalConstraints ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {level.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* AI 엔진 선택 */}
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-2">AI 엔진</h3>
                            <div className="space-y-1">
                                {[
                                    { id: 'neural', label: '신경망', icon: CpuChipIcon },
                                    { id: 'quantum', label: '양자', icon: BoltIcon },
                                    { id: 'context', label: '컨텍스트', icon: EyeIcon },
                                    { id: 'extreme', label: '극도설득', icon: FireIcon }
                                ].map((engine) => {
                                    const Icon = engine.icon;
                                    const isActive = activeEngines.includes(engine.id);
                                    const isExtreme = engine.id === 'extreme';

                                    return (
                                        <button
                                            key={engine.id}
                                            onClick={() => {
                                                if (isExtreme && ethicalConstraints) return;

                                                if (isActive) {
                                                    setActiveEngines(activeEngines.filter(e => e !== engine.id));
                                                } else {
                                                    setActiveEngines([...activeEngines, engine.id]);
                                                }
                                            }}
                                            disabled={isExtreme && ethicalConstraints}
                                            className={`w-full p-2 rounded text-left text-xs transition-all flex items-center space-x-2 ${isActive
                                                ? (isExtreme ? 'bg-red-100 border-red-300' : 'bg-blue-100 border-blue-300')
                                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                                } border ${isExtreme && ethicalConstraints ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <Icon className="w-3 h-3" />
                                            <span>{engine.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 윤리적 제약 */}
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-2">윤리적 제약</h3>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={ethicalConstraints}
                                    onChange={(e) => {
                                        setEthicalConstraints(e.target.checked);
                                        if (e.target.checked) {
                                            setActiveEngines(activeEngines.filter(e => e !== 'extreme'));
                                            if (influenceLevel === 'intensive') {
                                                setInfluenceLevel('assertive');
                                            }
                                        }
                                    }}
                                    className="w-3 h-3"
                                />
                                <span className="text-xs">윤리적 사용 모드</span>
                            </label>
                        </div>

                        {/* 메시지 취지 */}
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-2">메시지 취지</h3>
                            <textarea
                                value={messageIntent}
                                onChange={(e) => setMessageIntent(e.target.value)}
                                placeholder="브레인워시 목표를 입력하세요..."
                                className="w-full h-16 p-2 border border-gray-300 rounded text-xs resize-none"
                            />
                        </div>

                        {/* 생성 버튼 */}
                        <button
                            onClick={generateMessages}
                            disabled={!selectedMessageId || !messageIntent.trim() || isGenerating}
                            className={`w-full py-2 rounded font-medium transition-colors text-sm ${selectedMessageId && messageIntent.trim() && !isGenerating
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {isGenerating ? '🧠 브레인워시 생성 중...' : '🚀 브레인워시 생성'}
                        </button>

                        {/* 상태 정보 */}
                        <div className="text-xs text-gray-500 space-y-1">
                            <div>메시지 선택: {selectedMessageId ? '✅' : '❌'}</div>
                            <div>취지 입력: {messageIntent.trim() ? '✅' : '❌'}</div>
                            <div>활성 엔진: {activeEngines.length}개</div>
                        </div>
                    </div>
                </DraggablePanel>
            </div>
        </div>
    );
};

export default DraggableAIConversationSystem; 