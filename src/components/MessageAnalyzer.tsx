import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, DocumentTextIcon, PhotoIcon, PaperClipIcon, LinkIcon, HeartIcon, ExclamationTriangleIcon, CheckCircleIcon, ClockIcon, UserIcon, ChartBarIcon, LightBulbIcon, EyeIcon, EyeSlashIcon, ChevronDownIcon, ChevronUpIcon, FireIcon, StarIcon } from '@heroicons/react/24/outline';
import { Message } from '../types/conversation';

interface MessageAnalyzerProps {
  messages: Message[];
  selectedMessageId?: string;
}

interface MessageAnalysis {
  id: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  importance: 'high' | 'medium' | 'low';
  complexity: number;
  keywords: string[];
  topics: string[];
  readability: number;
  urgency: number;
  emotion: string;
  suggestions: string[];
}

interface AnalysisStats {
  totalMessages: number;
  averageSentiment: number;
  highImportanceCount: number;
  urgentMessagesCount: number;
  complexMessagesCount: number;
}

const MessageAnalyzer: React.FC<MessageAnalyzerProps> = ({
  messages,
  selectedMessageId
}) => {
  const [analysis, setAnalysis] = useState<MessageAnalysis[]>([]);
  const [stats, setStats] = useState<AnalysisStats | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<MessageAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // 감정 분석
  const analyzeSentiment = (content: string): 'positive' | 'negative' | 'neutral' => {
    const positiveWords = ['좋다', '감사', '훌륭', '최고', '만족', '성공', '진행', '확인', '동의', '좋은', '훌륭한'];
    const negativeWords = ['문제', '불만', '실패', '어려움', '걱정', '반대', '불가', '취소', '중단', '나쁜', '실망'];

    const contentLower = content.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;

    positiveWords.forEach(word => {
      if (contentLower.includes(word)) positiveCount++;
    });

    negativeWords.forEach(word => {
      if (contentLower.includes(word)) negativeCount++;
    });

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  };

  // 중요도 분석
  const analyzeImportance = (message: Message): 'high' | 'medium' | 'low' => {
    const urgentKeywords = ['긴급', '즉시', '당장', '바로', '중요', '주의', '경고', '필수'];
    const content = message.content.toLowerCase();

    if (urgentKeywords.some(keyword => content.includes(keyword))) {
      return 'high';
    }

    if (message.content.length > 100 || content.includes('제안') || content.includes('검토')) {
      return 'medium';
    }

    return 'low';
  };

  // 복잡도 분석
  const analyzeComplexity = (content: string): number => {
    const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const avgWordsPerSentence = words.length / sentences.length;

    // 복잡도 점수 (0-100)
    let complexity = 0;
    complexity += Math.min(50, avgWordsPerSentence * 5); // 문장 길이
    complexity += Math.min(30, content.length / 10); // 전체 길이
    complexity += content.includes('검토') || content.includes('논의') ? 20 : 0; // 특정 키워드

    return Math.min(100, Math.round(complexity));
  };

  // 키워드 추출
  const extractKeywords = (content: string): string[] => {
    const keywords = [
      '제안', '검토', '논의', '확인', '진행', '완료', '시작', '종료',
      '문제', '해결', '개선', '변경', '수정', '업데이트', '통보',
      '회의', '일정', '계획', '보고', '결과', '분석', '검토'
    ];

    const contentLower = content.toLowerCase();
    return keywords.filter(keyword => contentLower.includes(keyword));
  };

  // 주제 분류
  const classifyTopics = (content: string): string[] => {
    const topics: string[] = [];

    if (content.includes('회의') || content.includes('미팅')) topics.push('회의');
    if (content.includes('일정') || content.includes('스케줄')) topics.push('일정');
    if (content.includes('보고') || content.includes('리포트')) topics.push('보고');
    if (content.includes('문제') || content.includes('이슈')) topics.push('문제해결');
    if (content.includes('제안') || content.includes('아이디어')) topics.push('제안');
    if (content.includes('확인') || content.includes('체크')) topics.push('확인');
    if (content.includes('진행') || content.includes('상황')) topics.push('진행상황');

    return topics;
  };

  // 가독성 분석
  const analyzeReadability = (content: string): number => {
    const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const avgWordsPerSentence = words.length / sentences.length;

    // 가독성 점수 (0-100, 높을수록 읽기 쉬움)
    let readability = 100;
    readability -= Math.max(0, (avgWordsPerSentence - 15) * 2); // 문장 길이
    readability -= Math.max(0, (content.length - 200) / 10); // 전체 길이
    readability += content.includes('예시') || content.includes('구체') ? 10 : 0;

    return Math.max(0, Math.min(100, Math.round(readability)));
  };

  // 긴급도 분석
  const analyzeUrgency = (message: Message): number => {
    const urgentKeywords = ['긴급', '즉시', '당장', '바로', '중요', '주의', '경고'];
    const content = message.content.toLowerCase();

    let urgency = 0;
    urgentKeywords.forEach(keyword => {
      if (content.includes(keyword)) urgency += 20;
    });

    if (content.includes('!') || content.includes('?')) urgency += 10;
    if (message.content.length < 50) urgency += 5; // 짧은 메시지는 긴급할 가능성

    return Math.min(100, urgency);
  };

  // 감정 분석
  const analyzeEmotion = (content: string): string => {
    const emotionKeywords = {
      '기쁨': ['좋다', '감사', '훌륭', '최고', '만족'],
      '화남': ['화나다', '짜증', '불만', '분노', '화'],
      '걱정': ['걱정', '우려', '불안', '염려', '근심'],
      '놀람': ['놀라다', '깜짝', '예상', '생각', '이상'],
      '중립': ['확인', '알겠다', '네', '예', '좋습니다']
    };

    const contentLower = content.toLowerCase();

    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (keywords.some(keyword => contentLower.includes(keyword))) {
        return emotion;
      }
    }

    return '중립';
  };

  // 제안사항 생성
  const generateSuggestions = (analysis: MessageAnalysis): string[] => {
    const suggestions: string[] = [];

    if (analysis.sentiment === 'negative') {
      suggestions.push('부정적인 감정이 감지되었습니다. 공감 표현을 추가해보세요.');
    }

    if (analysis.complexity > 70) {
      suggestions.push('복잡한 내용입니다. 더 간단하고 명확하게 표현해보세요.');
    }

    if (analysis.readability < 50) {
      suggestions.push('가독성이 낮습니다. 문장을 더 짧고 명확하게 작성해보세요.');
    }

    if (analysis.urgency > 80) {
      suggestions.push('긴급한 메시지입니다. 즉시 응답이 필요합니다.');
    }

    if (analysis.keywords.length === 0) {
      suggestions.push('구체적인 키워드가 부족합니다. 더 명확한 용어를 사용해보세요.');
    }

    return suggestions;
  };

  // 메시지 분석 실행
  const analyzeMessage = (message: Message): MessageAnalysis => {
    const sentiment = analyzeSentiment(message.content);
    const importance = analyzeImportance(message);
    const complexity = analyzeComplexity(message.content);
    const keywords = extractKeywords(message.content);
    const topics = classifyTopics(message.content);
    const readability = analyzeReadability(message.content);
    const urgency = analyzeUrgency(message);
    const emotion = analyzeEmotion(message.content);

    const analysis: MessageAnalysis = {
      id: message.id,
      sentiment,
      importance,
      complexity,
      keywords,
      topics,
      readability,
      urgency,
      emotion,
      suggestions: []
    };

    analysis.suggestions = generateSuggestions(analysis);

    return analysis;
  };

  // 통계 계산
  const calculateStats = (analysis: MessageAnalysis[]): AnalysisStats => {
    const totalMessages = analysis.length;
    const sentimentScores = analysis.map(a =>
      a.sentiment === 'positive' ? 1 : a.sentiment === 'negative' ? -1 : 0
    ) as number[];
    const totalSentiment = sentimentScores.reduce((sum: number, score: number) => sum + score, 0);
    const averageSentiment = totalMessages > 0 ? totalSentiment / totalMessages : 0;
    const highImportanceCount = analysis.filter(a => a.importance === 'high').length;
    const urgentMessagesCount = analysis.filter(a => a.urgency > 70).length;
    const complexMessagesCount = analysis.filter(a => a.complexity > 70).length;

    return {
      totalMessages,
      averageSentiment,
      highImportanceCount,
      urgentMessagesCount,
      complexMessagesCount
    };
  };

  // 분석 실행
  useEffect(() => {
    if (messages.length > 0) {
      setIsAnalyzing(true);

      setTimeout(() => {
        const messageAnalysis = messages.map(analyzeMessage);
        const analysisStats = calculateStats(messageAnalysis);

        setAnalysis(messageAnalysis);
        setStats(analysisStats);
        setIsAnalyzing(false);
      }, 1000);
    }
  }, [messages]);

  // 선택된 메시지 분석
  useEffect(() => {
    if (selectedMessageId) {
      const selectedAnalysis = analysis.find(a => a.id === selectedMessageId);
      setSelectedAnalysis(selectedAnalysis || null);
    }
  }, [selectedMessageId, analysis]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getMessageTypeIcon = (type?: string) => {
    switch (type) {
      case 'text':
        return <DocumentTextIcon className="w-4 h-4 text-blue-500" />;
      case 'image':
        return <PhotoIcon className="w-4 h-4 text-green-500" />;
      case 'file':
        return <PaperClipIcon className="w-4 h-4 text-purple-500" />;
      case 'link':
        return <LinkIcon className="w-4 h-4 text-orange-500" />;
      default:
        return <DocumentTextIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isAnalyzing) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MagnifyingGlassIcon className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">14</span>
              메시지 분석
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
            >
              {showDetails ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              <span>{showDetails ? '간소화' : '상세보기'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 통계 요약 */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">총 메시지</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalMessages}</div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <HeartIcon className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">평균 감정</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {stats.averageSentiment > 0 ? '+' : ''}{stats.averageSentiment.toFixed(1)}
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-gray-700">중요 메시지</span>
              </div>
              <div className="text-2xl font-bold text-red-600">{stats.highImportanceCount}</div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <FireIcon className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-gray-700">긴급 메시지</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">{stats.urgentMessagesCount}</div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <StarIcon className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">복잡한 메시지</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">{stats.complexMessagesCount}</div>
            </div>
          </div>
        )}

        {/* 메시지 분석 목록 */}
        <div className="space-y-3">
          {analysis.slice(0, showDetails ? analysis.length : 10).map((messageAnalysis) => {
            const message = messages.find(m => m.id === messageAnalysis.id);
            if (!message) return null;

            return (
              <div
                key={messageAnalysis.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${selectedMessageId === messageAnalysis.id ? 'ring-2 ring-blue-500' : 'border-gray-200'
                  }`}
                onClick={() => setSelectedAnalysis(messageAnalysis)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-0.5">
                      {getMessageTypeIcon(message.type || 'text')}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{message.sender}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                        {message.content}
                      </p>

                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getSentimentColor(messageAnalysis.sentiment)}`}>
                          {messageAnalysis.sentiment === 'positive' ? '긍정' :
                            messageAnalysis.sentiment === 'negative' ? '부정' : '중립'}
                        </span>

                        <span className={`px-2 py-1 text-xs rounded-full ${getImportanceColor(messageAnalysis.importance)}`}>
                          {messageAnalysis.importance === 'high' ? '높음' :
                            messageAnalysis.importance === 'medium' ? '보통' : '낮음'}
                        </span>

                        {messageAnalysis.urgency > 70 && (
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
                            긴급
                          </span>
                        )}

                        {messageAnalysis.keywords.length > 0 && (
                          <span className="text-xs text-gray-500">
                            키워드: {messageAnalysis.keywords.slice(0, 2).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="text-xs text-gray-500">
                      복잡도: {messageAnalysis.complexity}%
                    </div>
                    <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {selectedAnalysis?.id === messageAnalysis.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <span className="text-xs text-gray-500">가독성</span>
                        <div className="text-sm font-medium">{messageAnalysis.readability}%</div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">긴급도</span>
                        <div className="text-sm font-medium">{messageAnalysis.urgency}%</div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">감정</span>
                        <div className="text-sm font-medium">{messageAnalysis.emotion}</div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">주제</span>
                        <div className="text-sm font-medium">{(messageAnalysis.topics && messageAnalysis.topics.join(', ')) || '없음'}</div>
                      </div>
                    </div>

                    {messageAnalysis.suggestions.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">제안사항</h5>
                        <div className="space-y-1">
                          {messageAnalysis.suggestions.map((suggestion, index) => (
                            <div key={index} className="flex items-start space-x-2 text-xs text-gray-600">
                              <LightBulbIcon className="w-3 h-3 text-yellow-500 mt-0.5" />
                              <span>{suggestion}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {analysis.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MagnifyingGlassIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>분석할 메시지가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageAnalyzer; 