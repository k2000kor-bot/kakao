import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface ConversationData {
  totalMessages: number;
  uniqueSpeakers: number;
  mainTopics: string[];
  keyIssues: string[];
  speakerSummaries: {
    [key: string]: {
      messageCount: number;
      sentiment: string;
      keyTopics: string[];
    };
  };
  sentimentAnalysis: {
    positive: number;
    neutral: number;
    negative: number;
  };
  timeDistribution: {
    [key: string]: number;
  };
}

interface ConversationVisualizerProps {
  data?: ConversationData;
  isLoading?: boolean;
}

const ConversationVisualizer: React.FC<ConversationVisualizerProps> = ({
  data,
  isLoading = false
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'speakers' | 'topics' | 'sentiment'>('overview');

  const sampleData: ConversationData = {
    totalMessages: 156,
    uniqueSpeakers: 8,
    mainTopics: ['조합원 복지', '시공사 협의', '안전 규정', '급여 문제', '근무 환경'],
    keyIssues: ['복지 혜택 부족', '협의 진행 지연', '안전 규정 미준수', '급여 체불'],
    speakerSummaries: {
      '김철수': {
        messageCount: 45,
        sentiment: 'negative',
        keyTopics: ['복지 혜택', '급여 문제']
      },
      '이영희': {
        messageCount: 32,
        sentiment: 'neutral',
        keyTopics: ['시공사 협의', '안전 규정']
      },
      '박민수': {
        messageCount: 28,
        sentiment: 'positive',
        keyTopics: ['근무 환경', '복지 혜택']
      },
      '정수진': {
        messageCount: 23,
        sentiment: 'negative',
        keyTopics: ['급여 문제', '안전 규정']
      },
      '최동욱': {
        messageCount: 18,
        sentiment: 'neutral',
        keyTopics: ['시공사 협의']
      }
    },
    sentimentAnalysis: {
      positive: 25,
      neutral: 45,
      negative: 30
    },
    timeDistribution: {
      '09:00-12:00': 35,
      '12:00-15:00': 45,
      '15:00-18:00': 40,
      '18:00-21:00': 36
    }
  };

  const currentData = data || sampleData;

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <HeartIcon className="w-4 h-4 text-green-600" />;
      case 'negative': return <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />;
      default: return <InformationCircleIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* 헤더 */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <span className="bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">24</span>
            <ChartBarIcon className="w-5 h-5 mr-2 text-blue-600" />
            대화 시각화
          </h3>
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1 text-sm rounded-md ${activeTab === 'overview'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              개요
            </button>
            <button
              onClick={() => setActiveTab('speakers')}
              className={`px-3 py-1 text-sm rounded-md ${activeTab === 'speakers'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              발화자
            </button>
            <button
              onClick={() => setActiveTab('topics')}
              className={`px-3 py-1 text-sm rounded-md ${activeTab === 'topics'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              주제
            </button>
            <button
              onClick={() => setActiveTab('sentiment')}
              className={`px-3 py-1 text-sm rounded-md ${activeTab === 'sentiment'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              감정
            </button>
          </div>
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 기본 통계 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <ChatBubbleLeftRightIcon className="w-8 h-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-600">총 메시지</p>
                    <p className="text-2xl font-bold text-blue-900">{currentData.totalMessages}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <UserGroupIcon className="w-8 h-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-600">참여자</p>
                    <p className="text-2xl font-bold text-green-900">{currentData.uniqueSpeakers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center">
                  <ClockIcon className="w-8 h-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-purple-600">평균 길이</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {Math.round(currentData.totalMessages / currentData.uniqueSpeakers)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircleIcon className="w-8 h-8 text-orange-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-orange-600">활성도</p>
                    <p className="text-2xl font-bold text-orange-900">
                      {Math.round((currentData.totalMessages / (currentData.uniqueSpeakers * 20)) * 100)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 주요 주제 */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">주요 주제</h4>
              <div className="flex flex-wrap gap-2">
                {currentData.mainTopics.map((topic, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* 주요 이슈 */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">주요 이슈</h4>
              <div className="space-y-2">
                {currentData.keyIssues.map((issue, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-700">{issue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'speakers' && (
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 mb-4">발화자 분석</h4>
            <div className="space-y-3">
              {Object.entries(currentData.speakerSummaries).map(([speaker, data]) => (
                <div key={speaker} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-gray-900">{speaker}</h5>
                    <div className="flex items-center space-x-2">
                      {getSentimentIcon(data.sentiment)}
                      <span className={`px-2 py-1 rounded-full text-xs ${getSentimentColor(data.sentiment)}`}>
                        {data.sentiment === 'positive' ? '긍정적' :
                          data.sentiment === 'negative' ? '부정적' : '중립적'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">메시지 수</p>
                      <p className="text-lg font-semibold text-gray-900">{data.messageCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">비율</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {Math.round((data.messageCount / currentData.totalMessages) * 100)}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">주요 관심사</p>
                    <div className="flex flex-wrap gap-1">
                      {data.keyTopics.map((topic, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'topics' && (
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 mb-4">주제 분석</h4>

            {/* 주제별 분포 */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-3">주제별 언급 빈도</h5>
              <div className="space-y-3">
                {currentData.mainTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{topic}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.random() * 60 + 20}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500 w-8 text-right">
                        {Math.floor(Math.random() * 40 + 10)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 시간대별 분포 */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-3">시간대별 활동</h5>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.entries(currentData.timeDistribution).map(([time, count]) => (
                  <div key={time} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">{time}</p>
                    <p className="text-lg font-semibold text-gray-900">{count}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sentiment' && (
          <div className="space-y-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">감정 분석</h4>

            {/* 감정 분포 */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-3">전체 감정 분포</h5>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <HeartIcon className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">긍정적</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${currentData.sentimentAnalysis.positive}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 w-8 text-right">
                      {currentData.sentimentAnalysis.positive}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <InformationCircleIcon className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">중립적</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gray-600 h-2 rounded-full"
                        style={{ width: `${currentData.sentimentAnalysis.neutral}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 w-8 text-right">
                      {currentData.sentimentAnalysis.neutral}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-gray-700">부정적</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{ width: `${currentData.sentimentAnalysis.negative}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 w-8 text-right">
                      {currentData.sentimentAnalysis.negative}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 감정 트렌드 */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-3">감정 변화 추이</h5>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-center h-32 text-gray-500">
                  <ChartBarIcon className="w-8 h-8 mr-2" />
                  <span>감정 변화 차트가 여기에 표시됩니다</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationVisualizer; 