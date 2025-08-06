import React, { useState, useEffect } from 'react';
import { advancedMessageAPI } from '../services/advancedMessageAPI';

interface ProjectData {
  totalMessages: number;
  participants: number;
  sentimentAnalysis: {
    positive: number;
    neutral: number;
    negative: number;
  };
  keyTopics: string[];
  topSpeakers: Array<{
    name: string;
    messageCount: number;
    influence: number;
  }>;
  timeline: Array<{
    date: string;
    events: string[];
  }>;
}

interface GaepoSungAnalysisProps {
  roomId: string;
}

const GaepoSungAnalysis: React.FC<GaepoSungAnalysisProps> = ({ roomId }) => {
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [analysisType, setAnalysisType] = useState('sentiment');

  useEffect(() => {
    if (roomId) {
      loadProjectData();
    }
  }, [roomId]);

  const loadProjectData = async () => {
    setIsLoading(true);
    try {
      const data = await advancedMessageAPI.analyzeProject(roomId);
      setProjectData(data);
    } catch (error) {
      console.error('프로젝트 데이터 로딩 실패:', error);
      // 샘플 데이터 로드
      setProjectData({
        totalMessages: 8504,
        participants: 15,
        sentimentAnalysis: {
          positive: 13,
          neutral: 60,
          negative: 27
        },
        keyTopics: [
          '시공사 평가 기준',
          '공사비 및 분담금',
          '홍보방식',
          '평면·커뮤니티 비교',
          '설계 품질'
        ],
        topSpeakers: [
          { name: '0035_우성7차', messageCount: 245, influence: 85 },
          { name: '0111', messageCount: 189, influence: 78 },
          { name: '0045', messageCount: 156, influence: 72 },
          { name: '0125', messageCount: 134, influence: 68 },
          { name: '0114', messageCount: 98, influence: 65 }
        ],
        timeline: [
          {
            date: '2025-07-15',
            events: ['채팅방 생성', '첫 번째 메시지']
          },
          {
            date: '2025-07-20',
            events: ['시공사 평가 논의 시작']
          },
          {
            date: '2025-07-25',
            events: ['공사비 분담금 이슈']
          },
          {
            date: '2025-08-01',
            events: ['홍보방식 논의', '설계 품질 비교']
          }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* 기본 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 메시지</p>
              <p className="text-2xl font-bold text-gray-900">
                {projectData?.totalMessages.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">참여자 수</p>
              <p className="text-2xl font-bold text-gray-900">
                {projectData?.participants}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">활성도</p>
              <p className="text-2xl font-bold text-gray-900">
                {projectData ? Math.round((projectData.totalMessages / projectData.participants) / 10) : 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 감정 분석 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">감정 분석</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">긍정적</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${projectData?.sentimentAnalysis.positive}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {projectData?.sentimentAnalysis.positive}%
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">중립적</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gray-500 h-2 rounded-full" 
                  style={{ width: `${projectData?.sentimentAnalysis.neutral}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {projectData?.sentimentAnalysis.neutral}%
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">부정적</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${projectData?.sentimentAnalysis.negative}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {projectData?.sentimentAnalysis.negative}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTopics = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">주요 논의 주제</h3>
        <div className="space-y-3">
          {projectData?.keyTopics.map((topic, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">{index + 1}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{topic}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSpeakers = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">주요 발언자</h3>
        <div className="space-y-4">
          {projectData?.topSpeakers.map((speaker, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {speaker.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{speaker.name}</p>
                  <p className="text-xs text-gray-500">{speaker.messageCount}개 메시지</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{speaker.influence}%</p>
                <p className="text-xs text-gray-500">영향도</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTimeline = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">프로젝트 타임라인</h3>
        <div className="space-y-4">
          {projectData?.timeline.map((item, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                {index < projectData.timeline.length - 1 && (
                  <div className="w-0.5 h-8 bg-gray-300 mt-2"></div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.date}</p>
                <div className="mt-1 space-y-1">
                  {item.events.map((event, eventIndex) => (
                    <p key={eventIndex} className="text-sm text-gray-600">• {event}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">데이터를 불러올 수 없습니다</h3>
        <p className="text-gray-500">채팅방을 선택하고 다시 시도해주세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">개포우성7차 프로젝트 분석</h2>
            <p className="text-sm text-gray-500 mt-1">채팅방: {roomId}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => loadProjectData()}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="새로고침"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: '개요', icon: '📊' },
              { id: 'topics', name: '주제', icon: '💬' },
              { id: 'speakers', name: '발언자', icon: '👥' },
              { id: 'timeline', name: '타임라인', icon: '📅' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'topics' && renderTopics()}
          {activeTab === 'speakers' && renderSpeakers()}
          {activeTab === 'timeline' && renderTimeline()}
        </div>
      </div>
    </div>
  );
};

export default GaepoSungAnalysis; 