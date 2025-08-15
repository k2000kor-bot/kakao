import React, { useState, useEffect, useRef } from 'react';
import {
  UsersIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  CursorArrowRaysIcon,
  EyeIcon,
  MicrophoneIcon,
  VideoCameraIcon,
  ShareIcon,
  CogIcon,
  BellIcon
} from '@heroicons/react/24/outline';

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  currentActivity: string;
  cursorPosition?: { x: number; y: number };
  lastSeen: Date;
}

interface CollaborationSession {
  id: string;
  name: string;
  participants: Collaborator[];
  documents: string[];
  chatMessages: ChatMessage[];
  isActive: boolean;
  createdAt: Date;
}

interface ChatMessage {
  id: string;
  sender: Collaborator;
  content: string;
  timestamp: Date;
  type: 'text' | 'file' | 'system';
}

interface AdvancedRealTimeCollaborationProps {
  projectId: string;
  onSessionUpdate?: (session: CollaborationSession) => void;
}

const AdvancedRealTimeCollaboration: React.FC<AdvancedRealTimeCollaborationProps> = ({
  projectId,
  onSessionUpdate
}) => {
  const [session, setSession] = useState<CollaborationSession | null>(null);
  const [participants, setParticipants] = useState<Collaborator[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [showParticipants, setShowParticipants] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const chatRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  // 시뮬레이션된 참가자 데이터
  const mockParticipants: Collaborator[] = [
    {
      id: '1',
      name: '김개발',
      avatar: '👨‍💻',
      status: 'online',
      currentActivity: '코드 리뷰 중',
      lastSeen: new Date()
    },
    {
      id: '2',
      name: '이디자인',
      avatar: '👩‍🎨',
      status: 'online',
      currentActivity: 'UI 디자인 작업',
      lastSeen: new Date()
    },
    {
      id: '3',
      name: '박기획',
      avatar: '👨‍💼',
      status: 'away',
      currentActivity: '회의 참석 중',
      lastSeen: new Date(Date.now() - 5 * 60 * 1000)
    }
  ];

  useEffect(() => {
    // 초기 세션 설정
    const newSession: CollaborationSession = {
      id: `session-${projectId}`,
      name: '프로젝트 협업 세션',
      participants: mockParticipants,
      documents: ['requirements.md', 'design-system.pdf', 'api-docs.json'],
      chatMessages: [],
      isActive: true,
      createdAt: new Date()
    };
    
    setSession(newSession);
    setParticipants(mockParticipants);
    
    // 시뮬레이션된 채팅 메시지
    const initialMessages: ChatMessage[] = [
      {
        id: '1',
        sender: mockParticipants[0],
        content: '안녕하세요! 프로젝트 시작하겠습니다.',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        type: 'text'
      },
      {
        id: '2',
        sender: mockParticipants[1],
        content: '네! 디자인 작업 준비 완료했습니다.',
        timestamp: new Date(Date.now() - 8 * 60 * 1000),
        type: 'text'
      },
      {
        id: '3',
        sender: mockParticipants[2],
        content: '요구사항 문서를 업데이트했습니다.',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        type: 'file'
      }
    ];
    
    setChatMessages(initialMessages);
  }, [projectId]);

  useEffect(() => {
    // 채팅 자동 스크롤
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (newMessage.trim() && session) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        sender: {
          id: 'current-user',
          name: '나',
          avatar: '👤',
          status: 'online',
          currentActivity: '메시지 입력 중',
          lastSeen: new Date()
        },
        content: newMessage,
        timestamp: new Date(),
        type: 'text'
      };
      
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoice = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    if (!isVoiceEnabled) {
      // 음성 활성화 로직
      console.log('음성 채팅 활성화');
    }
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    if (!isVideoEnabled) {
      // 비디오 활성화 로직
      console.log('비디오 채팅 활성화');
    }
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    if (!isScreenSharing) {
      // 화면 공유 활성화 로직
      console.log('화면 공유 활성화');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'away': return 'text-yellow-500';
      case 'busy': return 'text-red-500';
      case 'offline': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return '온라인';
      case 'away': return '자리비움';
      case 'busy': return '바쁨';
      case 'offline': return '오프라인';
      default: return '알 수 없음';
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <UsersIcon className="w-6 h-6 text-blue-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{session.name}</h3>
              <p className="text-sm text-gray-500">{participants.length}명 참여 중</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleVoice}
              className={`p-2 rounded-lg transition-colors ${
                isVoiceEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="음성 채팅"
            >
              <MicrophoneIcon className="w-5 h-5" />
            </button>
            
            <button
              onClick={toggleVideo}
              className={`p-2 rounded-lg transition-colors ${
                isVideoEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="비디오 채팅"
            >
              <VideoCameraIcon className="w-5 h-5" />
            </button>
            
            <button
              onClick={toggleScreenShare}
              className={`p-2 rounded-lg transition-colors ${
                isScreenSharing ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="화면 공유"
            >
              <ShareIcon className="w-5 h-5" />
            </button>
            
            <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200" title="설정">
              <CogIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 참가자 목록 */}
        {showParticipants && (
          <div className="w-64 bg-white border-r">
            <div className="p-4 border-b">
              <h4 className="font-medium text-gray-900">참가자 ({participants.length})</h4>
            </div>
            
            <div className="p-4 space-y-3">
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm">
                      {participant.avatar}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(participant.status)}`}></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{participant.name}</p>
                    <p className="text-xs text-gray-500 truncate">{participant.currentActivity}</p>
                  </div>
                  
                  <div className="text-xs text-gray-400">
                    {getStatusText(participant.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 메인 콘텐츠 */}
        <div className="flex-1 flex flex-col">
          {/* 문서 공유 영역 */}
          <div className="flex-1 p-4">
            <div className="bg-white rounded-lg border p-4 h-full">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">공유 문서</h4>
                <button className="text-sm text-blue-600 hover:text-blue-700">문서 추가</button>
              </div>
              
              <div className="space-y-2">
                {session.documents.map((doc, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                    <DocumentTextIcon className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-gray-700">{doc}</span>
                    <div className="flex items-center space-x-1 ml-auto">
                      <EyeIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">{participants.length}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* 실시간 커서 추적 */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CursorArrowRaysIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">실시간 활동</span>
                </div>
                <div className="text-xs text-gray-500">
                  {participants.filter(p => p.status === 'online').length}명이 현재 문서를 보고 있습니다
                </div>
              </div>
            </div>
          </div>

          {/* 채팅 영역 */}
          {showChat && (
            <div className="h-80 bg-white border-t">
              <div className="flex items-center justify-between p-3 border-b">
                <h4 className="font-medium text-gray-900">팀 채팅</h4>
                <button className="text-sm text-gray-500 hover:text-gray-700">
                  <BellIcon className="w-4 h-4" />
                </button>
              </div>
              
              {/* 채팅 메시지 */}
              <div ref={chatRef} className="flex-1 overflow-y-auto p-3 space-y-3">
                {chatMessages.map((message) => (
                  <div key={message.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm flex-shrink-0">
                      {message.sender.avatar}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{message.sender.name}</span>
                        <span className="text-xs text-gray-500">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <div className="mt-1 p-2 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span>누군가 입력 중...</span>
                  </div>
                )}
              </div>
              
              {/* 메시지 입력 */}
              <div className="p-3 border-t">
                <div className="flex space-x-2">
                  <input
                    ref={messageInputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      setIsTyping(true);
                    }}
                    onKeyPress={handleKeyPress}
                    onBlur={() => setIsTyping(false)}
                    placeholder="메시지를 입력하세요..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    전송
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedRealTimeCollaboration;
