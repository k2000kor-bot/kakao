import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// 기존 컴포넌트들을 import
import AdvancedMessageComposer from '../messages/AdvancedMessageComposer';
import IntelligentMessageSuggester from '../messages/IntelligentMessageSuggester';
import SmartResponseGenerator from '../messages/SmartResponseGenerator';
import ResponseMessageGenerator from '../messages/ResponseMessageGenerator';
import MessageTemplateLibrary from '../messages/MessageTemplateLibrary';
import AdvancedResponseAnalyzer from '../messages/AdvancedResponseAnalyzer';
import IntegratedMessageGenerator from '../messages/IntegratedMessageGenerator';
import AIResponseQualityAnalyzer from '../messages/AIResponseQualityAnalyzer';

// 분석 컴포넌트들
import ConversationAnalyzer from './ConversationAnalyzer';
import MessageAnalyzer from './MessageAnalyzer';
import ConversationInsights from './ConversationInsights';
import ConversationQualityAnalyzer from './ConversationQualityAnalyzer';
import RealTimeChatMonitor from './RealTimeChatMonitor';
import RealTimeConversationOptimizer from './RealTimeConversationOptimizer';

// AI 및 관리 컴포넌트들
import AIConversationPredictor from './AIConversationPredictor';
import AdvancedConversationPredictor from './AdvancedConversationPredictor';
import KnowledgeManagementSystem from './KnowledgeManagementSystem';
import SmartNotificationCenter from './SmartNotificationCenter';
import ConnectionMonitor from './ConnectionMonitor';

interface MessageCenteredLayoutProps {
  chatRoomId?: string;
}

interface TabConfig {
  id: string;
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
  component: React.ComponentType<any>;
  description: string;
}

interface ToolConfig {
  id: string;
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
  component: React.ComponentType<any>;
  description: string;
}

const MessageCenteredLayout: React.FC<MessageCenteredLayoutProps> = ({
  chatRoomId = 'default'
}) => {
  const [activeTab, setActiveTab] = useState('composer');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const tabs: TabConfig[] = [
    {
      id: 'composer',
      name: '메시지 작성',
      icon: ChatBubbleLeftRightIcon,
      component: AdvancedMessageComposer,
      description: '고급 메시지 작성 도구'
    },
    {
      id: 'suggester',
      name: '메시지 제안',
      icon: UserGroupIcon,
      component: IntelligentMessageSuggester,
      description: 'AI 기반 메시지 제안'
    },
    {
      id: 'generator',
      name: '스마트 응답',
      icon: ChatBubbleLeftRightIcon,
      component: SmartResponseGenerator,
      description: '스마트 응답 생성'
    },
    {
      id: 'response',
      name: '응답 생성',
      icon: DocumentTextIcon,
      component: ResponseMessageGenerator,
      description: '고도화된 응답 생성'
    },
    {
      id: 'templates',
      name: '템플릿 라이브러리',
      icon: BookOpenIcon,
      component: MessageTemplateLibrary,
      description: '메시지 템플릿 관리'
    },
    {
      id: 'analyzer',
      name: '응답 분석',
      icon: ChartBarIcon,
      component: AdvancedResponseAnalyzer,
      description: '응답 품질 분석'
    },
    {
      id: 'integrated',
      name: '통합 생성',
      icon: UserGroupIcon,
      component: IntegratedMessageGenerator,
      description: '통합 메시지 생성'
    },
    {
      id: 'quality',
      name: '품질 분석',
      icon: CheckCircleIcon,
      component: AIResponseQualityAnalyzer,
      description: 'AI 응답 품질 분석'
    }
  ];

  const analysisTools: ToolConfig[] = [
    {
      id: 'conversation-analyzer',
      name: '대화 분석',
      icon: ChartBarIcon,
      component: ConversationAnalyzer,
      description: '대화 패턴 분석'
    },
    {
      id: 'message-analyzer',
      name: '메시지 분석',
      icon: DocumentTextIcon,
      component: MessageAnalyzer,
      description: '메시지 상세 분석'
    },
    {
      id: 'insights',
      name: '대화 인사이트',
      icon: UserGroupIcon,
      component: ConversationInsights,
      description: '대화 인사이트 제공'
    },
    {
      id: 'quality-analyzer',
      name: '품질 분석',
      icon: CheckCircleIcon,
      component: ConversationQualityAnalyzer,
      description: '대화 품질 분석'
    },
    {
      id: 'real-time-monitor',
      name: '실시간 모니터',
      icon: Bars3Icon,
      component: RealTimeChatMonitor,
      description: '실시간 채팅 모니터링'
    },
    {
      id: 'optimizer',
      name: '실시간 최적화',
      icon: CogIcon,
      component: RealTimeConversationOptimizer,
      description: '실시간 대화 최적화'
    }
  ];

  const aiTools: ToolConfig[] = [
    {
      id: 'ai-predictor',
      name: 'AI 예측',
      icon: UserGroupIcon,
      component: AIConversationPredictor,
      description: 'AI 대화 예측'
    },
    {
      id: 'advanced-predictor',
      name: '고급 예측',
      icon: UserGroupIcon,
      component: AdvancedConversationPredictor,
      description: '고급 대화 예측'
    },
    {
      id: 'knowledge-management',
      name: '지식 관리',
      icon: Bars3Icon,
      component: KnowledgeManagementSystem,
      description: '지식 관리 시스템'
    },
    {
      id: 'notifications',
      name: '스마트 알림',
      icon: Bars3Icon,
      component: SmartNotificationCenter,
      description: '스마트 알림 센터'
    },
    {
      id: 'connection-monitor',
      name: '연결 모니터',
      icon: CogIcon,
      component: ConnectionMonitor,
      description: '시스템 연결 모니터링'
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component ||
    analysisTools.find(tool => tool.id === activeTab)?.component ||
    aiTools.find(tool => tool.id === activeTab)?.component ||
    AdvancedMessageComposer;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 사이드바 */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        {/* 헤더 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-2">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  메시지 중심 레이아웃
                </h2>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 rounded-md hover:bg-gray-100"
              title={sidebarCollapsed ? "사이드바 확장" : "사이드바 축소"}
            >
              <CogIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* 네비게이션 */}
        <div className="flex-1 overflow-y-auto">
          {/* 메시지 도구 */}
          <div className="p-4">
            {!sidebarCollapsed && (
              <h3 className="text-sm font-medium text-gray-500 mb-3">메시지 도구</h3>
            )}
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${activeTab === tab.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  title={sidebarCollapsed ? tab.name : undefined}
                >
                  {tab.icon && React.createElement(tab.icon, { className: "w-5 h-5 mr-3" })}
                  {!sidebarCollapsed && (
                    <div className="flex-1 text-left">
                      <div className="font-medium">{tab.name}</div>
                      <div className="text-xs text-gray-500">{tab.description}</div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 분석 도구 */}
          <div className="p-4 border-t border-gray-200">
            {!sidebarCollapsed && (
              <h3 className="text-sm font-medium text-gray-500 mb-3">분석 도구</h3>
            )}
            <div className="space-y-1">
              {analysisTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTab(tool.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${activeTab === tool.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  title={sidebarCollapsed ? tool.name : undefined}
                >
                  {tool.icon && React.createElement(tool.icon, { className: "w-5 h-5 mr-3" })}
                  {!sidebarCollapsed && (
                    <div className="flex-1 text-left">
                      <div className="font-medium">{tool.name}</div>
                      <div className="text-xs text-gray-500">{tool.description}</div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* AI 도구 */}
          <div className="p-4 border-t border-gray-200">
            {!sidebarCollapsed && (
              <h3 className="text-sm font-medium text-gray-500 mb-3">AI 도구</h3>
            )}
            <div className="space-y-1">
              {aiTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTab(tool.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${activeTab === tool.id
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  title={sidebarCollapsed ? tool.name : undefined}
                >
                  {tool.icon && React.createElement(tool.icon, { className: "w-5 h-5 mr-3" })}
                  {!sidebarCollapsed && (
                    <div className="flex-1 text-left">
                      <div className="font-medium">{tool.name}</div>
                      <div className="text-xs text-gray-500">{tool.description}</div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col">
        {/* 헤더 */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">메시지 중심 레이아웃</h1>
              <p className="text-sm text-gray-500">
                {tabs.find(tab => tab.id === activeTab)?.description ||
                  analysisTools.find(tool => tool.id === activeTab)?.description ||
                  aiTools.find(tool => tool.id === activeTab)?.description ||
                  '고급 메시지 작성 도구'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>연결됨</span>
              </div>
              <div className="text-sm text-gray-500">
                채팅방: {chatRoomId}
              </div>
            </div>
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {(() => {
              const componentName = ActiveComponent.name;

              if (componentName === 'MessageAnalyzer') {
                return <MessageAnalyzer messages={[]} />;
              } else if (componentName === 'SmartResponseGenerator') {
                return <SmartResponseGenerator
                  selectedChatRoom={chatRoomId}
                  conversationContent=""
                  isActive={true}
                />;
              } else if (componentName === 'ConversationInsights') {
                return <ConversationInsights
                  messages={[]}
                  selectedChatRoom={chatRoomId}
                />;
              } else if (componentName === 'ConversationQualityAnalyzer') {
                return <ConversationQualityAnalyzer
                  messages={[]}
                  selectedChatRoom={chatRoomId}
                />;
              } else if (componentName === 'ConversationAnalyzer') {
                return <ConversationAnalyzer messages={[]} selectedPeriod="전체" />;
              } else if (componentName === 'AIConversationPredictor') {
                return <AIConversationPredictor
                  chatRoomId={chatRoomId}
                  isActive={true}
                />;
              } else if (componentName === 'AdvancedConversationPredictor') {
                return <AdvancedConversationPredictor
                  chatRoomId={chatRoomId}
                  isActive={true}
                />;
              } else if (componentName === 'KnowledgeManagementSystem') {
                return <KnowledgeManagementSystem />;
              } else if (componentName === 'SmartNotificationCenter') {
                return <SmartNotificationCenter
                  chatRoomId={chatRoomId}
                />;
              } else if (componentName === 'ConnectionMonitor') {
                return <ConnectionMonitor
                  isConnected={true}
                  isActive={true}
                  dataFlow={true}
                  blocks={[true, true, true, true]}
                />;
              } else {
                // Default fallback for other components
                return <AdvancedMessageComposer />;
              }
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageCenteredLayout; 