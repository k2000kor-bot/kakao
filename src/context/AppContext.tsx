import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// 상태 타입 정의
interface AppState {
    // 채팅 관련 상태
    messages: Message[];
    selectedRoomId: string;
    isTyping: boolean;
    inputMessage: string;

    // AI 시스템 상태
    aiSystems: AISystem[];
    currentAIResponse: AIResponse | null;
    isAIProcessing: boolean;

    // UI 상태
    showSidebar: boolean;
    showAISystem: boolean;
    notifications: Notification[];

    // 채팅방 상태
    chatRooms: ChatRoom[];
}

// 액션 타입 정의
type AppAction =
    | { type: 'SET_MESSAGES'; payload: Message[] }
    | { type: 'ADD_MESSAGE'; payload: Message }
    | { type: 'SET_SELECTED_ROOM'; payload: string }
    | { type: 'SET_TYPING'; payload: boolean }
    | { type: 'SET_INPUT_MESSAGE'; payload: string }
    | { type: 'TOGGLE_AI_SYSTEM'; payload: string }
    | { type: 'SET_AI_RESPONSE'; payload: AIResponse | null }
    | { type: 'SET_AI_PROCESSING'; payload: boolean }
    | { type: 'TOGGLE_SIDEBAR' }
    | { type: 'TOGGLE_AI_PANEL' }
    | { type: 'ADD_NOTIFICATION'; payload: Notification }
    | { type: 'REMOVE_NOTIFICATION'; payload: string }
    | { type: 'SET_CHAT_ROOMS'; payload: ChatRoom[] };

// 인터페이스 정의
interface Message {
    id: string;
    content: string;
    sender: 'user' | 'ai' | 'system';
    timestamp: string;
    type: 'text' | 'chart' | 'stats' | 'summary' | 'analysis' | 'system' | 'command' | 'error' | 'success';
    data?: any;
    metadata?: {
        confidence?: number;
        processingTime?: number;
        suggestions?: string[];
        actions?: string[];
    };
}

interface AISystem {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    capabilities: string[];
    performance: {
        accuracy: number;
        speed: number;
        reliability: number;
    };
}

interface AIResponse {
    id: string;
    content: string;
    type: 'text' | 'analysis' | 'chart' | 'code' | 'image' | 'system';
    confidence: number;
    processingTime: number;
    metadata?: {
        suggestions?: string[];
        actions?: string[];
        data?: any;
    };
}

interface ChatRoom {
    id: string;
    name: string;
    type: 'general' | 'project' | 'analysis' | 'system';
    unreadCount: number;
    lastMessage?: string;
    lastMessageTime?: string;
}

interface Notification {
    id: string;
    type: 'success' | 'warning' | 'error' | 'info';
    title: string;
    message: string;
    timestamp: Date;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

// 초기 상태
const initialState: AppState = {
    messages: [
        {
            id: '1',
            content: '안녕하세요! CORBU AI입니다. 무엇을 도와드릴까요?',
            sender: 'ai',
            timestamp: new Date().toISOString(),
            type: 'text'
        }
    ],
    selectedRoomId: 'general',
    isTyping: false,
    inputMessage: '',

    aiSystems: [
        {
            id: 'conversational',
            name: '대화형 AI',
            description: '자연스러운 대화를 위한 AI 시스템',
            isActive: true,
            capabilities: ['자연어 처리', '맥락 이해', '감정 분석'],
            performance: { accuracy: 95, speed: 1000, reliability: 98 }
        },
        {
            id: 'analytical',
            name: '분석 AI',
            description: '데이터 분석 및 인사이트 생성',
            isActive: true,
            capabilities: ['데이터 분석', '패턴 인식', '예측 모델링'],
            performance: { accuracy: 92, speed: 2000, reliability: 95 }
        },
        {
            id: 'creative',
            name: '창작 AI',
            description: '콘텐츠 생성 및 창작 지원',
            isActive: false,
            capabilities: ['텍스트 생성', '이미지 생성', '코드 생성'],
            performance: { accuracy: 88, speed: 3000, reliability: 90 }
        },
        {
            id: 'predictive',
            name: '예측 AI',
            description: '미래 예측 및 트렌드 분석',
            isActive: false,
            capabilities: ['시계열 분석', '트렌드 예측', '리스크 평가'],
            performance: { accuracy: 85, speed: 5000, reliability: 87 }
        }
    ],
    currentAIResponse: null,
    isAIProcessing: false,

    showSidebar: true,
    showAISystem: false,
    notifications: [],

    chatRooms: [
        {
            id: 'general',
            name: '일반 채팅',
            type: 'general',
            unreadCount: 0,
            lastMessage: '안녕하세요! CORBU AI입니다.',
            lastMessageTime: new Date().toISOString()
        },
        {
            id: 'project',
            name: '프로젝트 관리',
            type: 'project',
            unreadCount: 2,
            lastMessage: '프로젝트 상태를 확인해보세요.',
            lastMessageTime: new Date().toISOString()
        },
        {
            id: 'analysis',
            name: 'AI 분석',
            type: 'analysis',
            unreadCount: 0,
            lastMessage: '분석 결과가 준비되었습니다.',
            lastMessageTime: new Date().toISOString()
        },
        {
            id: 'system',
            name: '시스템 모니터링',
            type: 'system',
            unreadCount: 1,
            lastMessage: '시스템 상태가 정상입니다.',
            lastMessageTime: new Date().toISOString()
        }
    ]
};

// 리듀서 함수
function appReducer(state: AppState, action: AppAction): AppState {
    switch (action.type) {
        case 'SET_MESSAGES':
            return { ...state, messages: action.payload };

        case 'ADD_MESSAGE':
            return { ...state, messages: [...state.messages, action.payload] };

        case 'SET_SELECTED_ROOM':
            return { ...state, selectedRoomId: action.payload };

        case 'SET_TYPING':
            return { ...state, isTyping: action.payload };

        case 'SET_INPUT_MESSAGE':
            return { ...state, inputMessage: action.payload };

        case 'TOGGLE_AI_SYSTEM':
            return {
                ...state,
                aiSystems: state.aiSystems.map(system =>
                    system.id === action.payload
                        ? { ...system, isActive: !system.isActive }
                        : system
                )
            };

        case 'SET_AI_RESPONSE':
            return { ...state, currentAIResponse: action.payload };

        case 'SET_AI_PROCESSING':
            return { ...state, isAIProcessing: action.payload };

        case 'TOGGLE_SIDEBAR':
            return { ...state, showSidebar: !state.showSidebar };

        case 'TOGGLE_AI_PANEL':
            return { ...state, showAISystem: !state.showAISystem };

        case 'ADD_NOTIFICATION':
            return { ...state, notifications: [...state.notifications, action.payload] };

        case 'REMOVE_NOTIFICATION':
            return {
                ...state,
                notifications: state.notifications.filter(n => n.id !== action.payload)
            };

        case 'SET_CHAT_ROOMS':
            return { ...state, chatRooms: action.payload };

        default:
            return state;
    }
}

// Context 생성
interface AppContextType {
    state: AppState;
    dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider 컴포넌트
interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
};

// Hook for using the context
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

// 편의 함수들
export const useMessages = () => {
    const { state, dispatch } = useAppContext();
    return {
        messages: state.messages,
        addMessage: (message: Message) => dispatch({ type: 'ADD_MESSAGE', payload: message }),
        setMessages: (messages: Message[]) => dispatch({ type: 'SET_MESSAGES', payload: messages })
    };
};

export const useAI = () => {
    const { state, dispatch } = useAppContext();
    return {
        aiSystems: state.aiSystems,
        currentAIResponse: state.currentAIResponse,
        isAIProcessing: state.isAIProcessing,
        toggleAISystem: (systemId: string) => dispatch({ type: 'TOGGLE_AI_SYSTEM', payload: systemId }),
        setAIResponse: (response: AIResponse | null) => dispatch({ type: 'SET_AI_RESPONSE', payload: response }),
        setAIProcessing: (processing: boolean) => dispatch({ type: 'SET_AI_PROCESSING', payload: processing })
    };
};

export const useNotifications = () => {
    const { state, dispatch } = useAppContext();
    return {
        notifications: state.notifications,
        addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => {
            const newNotification: Notification = {
                ...notification,
                id: Date.now().toString(),
                timestamp: new Date()
            };
            dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
        },
        removeNotification: (id: string) => dispatch({ type: 'REMOVE_NOTIFICATION', payload: id })
    };
};

export const useUI = () => {
    const { state, dispatch } = useAppContext();
    return {
        showSidebar: state.showSidebar,
        showAISystem: state.showAISystem,
        isTyping: state.isTyping,
        toggleSidebar: () => dispatch({ type: 'TOGGLE_SIDEBAR' }),
        toggleAIPanel: () => dispatch({ type: 'TOGGLE_AI_PANEL' }),
        setIsTyping: (typing: boolean) => dispatch({ type: 'SET_TYPING', payload: typing })
    };
};

export const useChat = () => {
    const { state, dispatch } = useAppContext();
    return {
        messages: state.messages,
        addMessage: (message: Message) => dispatch({ type: 'ADD_MESSAGE', payload: message }),
        setMessages: (messages: Message[]) => dispatch({ type: 'SET_MESSAGES', payload: messages }),
        selectedRoomId: state.selectedRoomId,
        chatRooms: state.chatRooms,
        isTyping: state.isTyping,
        inputMessage: state.inputMessage,
        setSelectedRoomId: (roomId: string) => dispatch({ type: 'SET_SELECTED_ROOM', payload: roomId }),
        setTyping: (typing: boolean) => dispatch({ type: 'SET_TYPING', payload: typing }),
        setInputMessage: (message: string) => dispatch({ type: 'SET_INPUT_MESSAGE', payload: message })
    };
}; 