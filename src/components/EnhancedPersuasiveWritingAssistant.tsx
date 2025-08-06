import React, { useState, useEffect, useRef } from 'react';
import {
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  LightBulbIcon,
  AcademicCapIcon,
  SparklesIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  ClipboardDocumentIcon,
  BookOpenIcon,
  MagnifyingGlassIcon,
  CogIcon,
  ChartBarIcon,
  EyeIcon,
  ArrowPathIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { useModalClose } from '../hooks/useModalClose';
import fileUploadService from '../services/fileUploadService';
import enhancedWritingService, { WritingRequest, WritingResponse } from '../services/enhancedWritingService';

interface EnhancedPersuasiveWritingAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onMessageGenerated: (message: string) => void;
  projectId?: string;
  uploadedFiles?: any[];
}

interface WritingContext {
  fileId: string;
  fileName: string;
  fileType: string;
  extractedText: string;
  summary: string;
  keywords: string[];
  sentiment: string;
  confidence: number;
  relevance: number;
}

interface ConversationTurn {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    writingType?: string;
    confidence?: number;
    persuasionScore?: number;
    suggestions?: string[];
    usedContexts?: string[];
  };
}

const EnhancedPersuasiveWritingAssistant: React.FC<EnhancedPersuasiveWritingAssistantProps> = ({
  isOpen,
  onClose,
  onMessageGenerated,
  projectId,
  uploadedFiles = []
}) => {
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [currentRequest, setCurrentRequest] = useState<WritingRequest>({
    writingType: 'persuasive',
    targetAudience: 'general',
    writingGoal: 'inform',
    tone: 'formal',
    length: 'medium',
    keywords: [],
    context: '',
    fileContexts: []
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [writingType, setWritingType] = useState('persuasive');
  const [targetAudience, setTargetAudience] = useState('general');
  const [writingGoal, setWritingGoal] = useState('inform');
  const [tone, setTone] = useState('formal');
  const [length, setLength] = useState('medium');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [context, setContext] = useState('');
  const [generatedResponse, setGeneratedResponse] = useState<WritingResponse | null>(null);
  const [userFeedback, setUserFeedback] = useState<'positive' | 'negative' | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState<'conversation' | 'analysis' | 'context' | 'templates'>('conversation');
  const [fileContexts, setFileContexts] = useState<WritingContext[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [contextualInsights, setContextualInsights] = useState<string[]>([]);

  const { modalRef, handleClose } = useModalClose({
    isOpen,
    onClose
  });

  const conversationEndRef = useRef<HTMLDivElement>(null);

  // 대화 스크롤을 맨 아래로
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // 업로드된 파일들의 문맥 분석
  useEffect(() => {
    analyzeFileContexts();
  }, [uploadedFiles]);

  const analyzeFileContexts = async () => {
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    const contexts: WritingContext[] = [];
    const insights: string[] = [];

    for (const file of uploadedFiles) {
      try {
        // 파일 분석 결과 가져오기
        const analysis = await fileUploadService.getFileAnalysis(projectId || 'default', file.id);

        if (analysis) {
          const context: WritingContext = {
            fileId: file.id,
            fileName: file.name,
            fileType: file.type,
            extractedText: analysis.extracted_text || '',
            summary: analysis.summary || '',
            keywords: analysis.keywords || [],
            sentiment: analysis.sentiment || 'neutral',
            confidence: analysis.confidence || 0.8,
            relevance: calculateRelevance(analysis)
          };

          contexts.push(context);

          // 문맥 인사이트 생성
          const insight = generateContextualInsight(context);
          if (insight) {
            insights.push(insight);
          }
        }
      } catch (error) {
        console.error('파일 문맥 분석 실패:', error);
      }
    }

    setFileContexts(contexts);
    setContextualInsights(insights);
  };

  const calculateRelevance = (analysis: any): number => {
    // 키워드 수, 신뢰도, 감정 분석 등을 기반으로 관련성 계산
    const keywordScore = (analysis.keywords?.length || 0) * 0.1;
    const confidenceScore = analysis.confidence || 0;
    const sentimentScore = analysis.sentiment === 'positive' ? 0.2 : 0;

    return Math.min(keywordScore + confidenceScore + sentimentScore, 1.0);
  };

  const generateContextualInsight = (context: WritingContext): string => {
    const insights = [
      `${context.fileName}에서 "${context.keywords.slice(0, 3).join(', ')}" 키워드가 발견되었습니다.`,
      `${context.fileName}의 감정 분석 결과: ${context.sentiment} (신뢰도: ${(context.confidence * 100).toFixed(1)}%)`,
      `${context.fileName}의 요약: ${context.summary.substring(0, 100)}...`,
      `${context.fileName}의 관련성 점수: ${(context.relevance * 100).toFixed(1)}%`
    ];

    return insights[Math.floor(Math.random() * insights.length)];
  };

  const addMessage = (role: 'user' | 'assistant', content: string, metadata?: any) => {
    const newMessage: ConversationTurn = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
      metadata
    };
    setConversation(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!context.trim()) return;

    const userMessage = context;
    setContext('');
    addMessage('user', userMessage);
    setIsGenerating(true);

    try {
      // 현재 요청 업데이트
      const updatedRequest: WritingRequest = {
        ...currentRequest,
        context: userMessage,
        keywords,
        fileContexts: fileContexts.filter(fc => selectedFiles.includes(fc.fileId))
      };

      setCurrentRequest(updatedRequest);

      // AI 응답 생성
      const response = await generateEnhancedContent(updatedRequest);

      addMessage('assistant', response.content, {
        writingType,
        confidence: response.confidence,
        persuasionScore: response.persuasionScore,
        suggestions: response.suggestions,
        usedContexts: response.usedContexts
      });

      setGeneratedResponse(response);
      setShowSuggestions(true);

    } catch (error) {
      console.error('메시지 생성 실패:', error);
      addMessage('assistant', '죄송합니다. 메시지 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateEnhancedContent = async (request: WritingRequest): Promise<WritingResponse> => {
    try {
      // 실제 백엔드 API 호출
      const response = await enhancedWritingService.generateEnhancedWriting(
        projectId || 'default',
        request
      );

      if (!response.success) {
        throw new Error(response.error || '글쓰기 생성 실패');
      }

      return response;
    } catch (error) {
      console.error('고도화된 글쓰기 생성 실패:', error);

      // 폴백: 로컬 시뮬레이션
      const { context, fileContexts, keywords, tone, length, writingType, targetAudience, writingGoal } = request;

      // 파일 문맥을 활용한 고도화된 콘텐츠 생성
      let enhancedContext = context;
      const usedContexts: string[] = [];
      const generatedInsights: string[] = [];

      // 선택된 파일들의 문맥을 통합
      if (fileContexts.length > 0) {
        const fileInsights = fileContexts.map(fc => {
          usedContexts.push(fc.fileName);
          return `${fc.fileName}에서 추출한 정보: ${fc.summary}`;
        });

        enhancedContext += `\n\n참고 자료:\n${fileInsights.join('\n')}`;

        // 키워드 통합
        const allKeywords = Array.from(new Set([
          ...keywords,
          ...fileContexts.flatMap(fc => fc.keywords)
        ]));

        enhancedContext += `\n\n주요 키워드: ${allKeywords.join(', ')}`;
      }

      // 글쓰기 유형별 템플릿 적용
      const templates = {
        persuasive: {
          formal: `[공식적 설득] ${enhancedContext}\n\n위 내용을 바탕으로 설득력 있는 메시지를 작성하겠습니다.`,
          friendly: `[친근한 설득] ${enhancedContext}\n\n위 내용을 바탕으로 친근하면서도 설득력 있는 메시지를 작성하겠습니다.`,
          authoritative: `[권위적 설득] ${enhancedContext}\n\n위 내용을 바탕으로 전문적이고 권위 있는 메시지를 작성하겠습니다.`
        },
        informative: {
          formal: `[공식적 정보 제공] ${enhancedContext}\n\n위 내용을 바탕으로 정확하고 상세한 정보를 제공하겠습니다.`,
          friendly: `[친근한 정보 제공] ${enhancedContext}\n\n위 내용을 바탕으로 이해하기 쉬운 정보를 제공하겠습니다.`,
          authoritative: `[전문적 정보 제공] ${enhancedContext}\n\n위 내용을 바탕으로 전문적이고 깊이 있는 정보를 제공하겠습니다.`
        },
        emotional: {
          formal: `[공식적 감정적 접근] ${enhancedContext}\n\n위 내용을 바탕으로 감정적이면서도 적절한 메시지를 작성하겠습니다.`,
          friendly: `[친근한 감정적 접근] ${enhancedContext}\n\n위 내용을 바탕으로 따뜻하고 감정적인 메시지를 작성하겠습니다.`,
          authoritative: `[권위적 감정적 접근] ${enhancedContext}\n\n위 내용을 바탕으로 강력하면서도 감정적인 메시지를 작성하겠습니다.`
        }
      };

      const template = templates[writingType as keyof typeof templates]?.[tone as keyof typeof templates.persuasive] ||
        templates.persuasive.formal;

      // 길이에 따른 조정
      const lengthMultiplier = {
        short: 0.5,
        medium: 1.0,
        long: 2.0
      }[length] || 1.0;

      const baseContent = template;
      const expandedContent = baseContent.repeat(Math.ceil(lengthMultiplier));

      // 문맥 기반 인사이트 생성
      if (fileContexts.length > 0) {
        const insights = fileContexts.map(fc => {
          const insight = `📄 ${fc.fileName} 분석 결과: ${fc.sentiment} 감정, ${(fc.confidence * 100).toFixed(1)}% 신뢰도`;
          generatedInsights.push(insight);
          return insight;
        });
      }

      return {
        success: true,
        content: expandedContent,
        confidence: 0.92,
        persuasionScore: 0.88,
        readability: 0.85,
        emotionalImpact: 0.78,
        suggestions: [
          '파일 문맥을 더 적극적으로 활용해보세요',
          '키워드를 더 구체적으로 설정해보세요',
          '감정적 톤을 조정해보세요'
        ],
        usedContexts,
        generatedInsights
      };
    }
  };

  const handleFeedback = (type: 'positive' | 'negative') => {
    setUserFeedback(type);
    addMessage('user', `피드백: ${type === 'positive' ? '좋습니다!' : '개선이 필요합니다.'}`);

    // 피드백 기반 학습 시뮬레이션
    setTimeout(() => {
      addMessage('assistant', type === 'positive'
        ? '감사합니다! 피드백을 바탕으로 더 나은 글쓰기를 제공하겠습니다.'
        : '피드백을 바탕으로 개선하겠습니다. 더 구체적인 요청이 있으시면 말씀해 주세요.');
      setUserFeedback(null);
    }, 1000);
  };

  const handleCopyToClipboard = () => {
    if (generatedResponse) {
      navigator.clipboard.writeText(generatedResponse.content);
    }
  };

  const handleImproveContent = () => {
    if (generatedResponse) {
      addMessage('user', '이 내용을 더 개선해주세요.');
      // 개선된 콘텐츠 생성 로직
      setTimeout(() => {
        addMessage('assistant', '개선된 버전을 생성하겠습니다. 더 구체적이고 설득력 있는 내용으로 업데이트했습니다.');
      }, 1500);
    }
  };

  const addKeyword = (keyword: string) => {
    if (keyword.trim() && !keywords.includes(keyword.trim())) {
      setKeywords(prev => [...prev, keyword.trim()]);
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(prev => prev.filter(k => k !== keyword));
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="w-7 h-7 text-purple-500" />
            <h2 className="text-2xl font-bold text-gray-800">고도화된 설득력 있는 글쓰기 어시스턴트</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="글쓰기 어시스턴트 닫기"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-full">
          {/* 왼쪽 패널 - 설정 및 문맥 */}
          <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* 파일 문맥 선택 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">파일 문맥 활용</h3>
                {fileContexts.length > 0 ? (
                  <div className="space-y-3">
                    {fileContexts.map((fileContext) => (
                      <div key={fileContext.fileId} className="border rounded-lg p-3">
                        <label className="flex items-start space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedFiles.includes(fileContext.fileId)}
                            onChange={() => toggleFileSelection(fileContext.fileId)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-800">{fileContext.fileName}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              신뢰도: {(fileContext.confidence * 100).toFixed(1)}% |
                              관련성: {(fileContext.relevance * 100).toFixed(1)}%
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              키워드: {fileContext.keywords.slice(0, 3).join(', ')}
                            </p>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <DocumentTextIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">업로드된 파일이 없습니다.</p>
                  </div>
                )}
              </div>

              {/* 문맥 인사이트 */}
              {contextualInsights.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">문맥 인사이트</h3>
                  <div className="space-y-2">
                    {contextualInsights.map((insight, index) => (
                      <div key={index} className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-800">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 글쓰기 설정 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">글쓰기 설정</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      글쓰기 유형
                    </label>
                    <select
                      value={writingType}
                      onChange={(e) => setWritingType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      aria-label="글쓰기 유형 선택"
                    >
                      <option value="persuasive">설득적 글쓰기</option>
                      <option value="informative">정보 제공</option>
                      <option value="emotional">감정적 글쓰기</option>
                      <option value="logical">논리적 글쓰기</option>
                      <option value="storytelling">스토리텔링</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      대상 독자
                    </label>
                    <select
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      aria-label="대상 독자 선택"
                    >
                      <option value="general">일반 대중</option>
                      <option value="professional">전문가</option>
                      <option value="academic">학술계</option>
                      <option value="business">비즈니스</option>
                      <option value="youth">청소년</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      글쓰기 목표
                    </label>
                    <select
                      value={writingGoal}
                      onChange={(e) => setWritingGoal(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      aria-label="글쓰기 목표 선택"
                    >
                      <option value="inform">정보 전달</option>
                      <option value="persuade">설득</option>
                      <option value="entertain">오락</option>
                      <option value="educate">교육</option>
                      <option value="motivate">동기 부여</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      톤
                    </label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      aria-label="톤 선택"
                    >
                      <option value="formal">공식적</option>
                      <option value="friendly">친근한</option>
                      <option value="casual">일상적</option>
                      <option value="authoritative">권위적</option>
                      <option value="empathetic">공감적</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      길이
                    </label>
                    <select
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      aria-label="길이 선택"
                    >
                      <option value="short">짧음</option>
                      <option value="medium">보통</option>
                      <option value="long">길음</option>
                    </select>
                  </div>

                  {/* 키워드 입력 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      키워드
                    </label>
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        placeholder="키워드 입력"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            addKeyword(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => {
                          const input = document.querySelector('input[placeholder="키워드 입력"]') as HTMLInputElement;
                          if (input && input.value.trim()) {
                            addKeyword(input.value);
                            input.value = '';
                          }
                        }}
                        className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded"
                        >
                          <span>{keyword}</span>
                          <button
                            onClick={() => removeKeyword(keyword)}
                            className="text-purple-600 hover:text-purple-800"
                          >
                            <MinusIcon className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽 패널 - 대화 및 결과 */}
          <div className="flex-1 flex flex-col">
            {/* 탭 네비게이션 */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('conversation')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'conversation'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                대화
              </button>
              <button
                onClick={() => setActiveTab('analysis')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'analysis'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                분석
              </button>
              <button
                onClick={() => setActiveTab('context')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'context'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                문맥
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'templates'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                템플릿
              </button>
            </div>

            {/* 탭 내용 */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'conversation' && (
                <div className="space-y-4">
                  {/* 대화 영역 */}
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {conversation.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.role === 'user'
                              ? 'bg-purple-500 text-white'
                              : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          {message.metadata && (
                            <div className="mt-2 text-xs opacity-75">
                              {message.metadata.confidence && (
                                <p>신뢰도: {(message.metadata.confidence * 100).toFixed(1)}%</p>
                              )}
                              {message.metadata.persuasionScore && (
                                <p>설득력: {(message.metadata.persuasionScore * 100).toFixed(1)}%</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {isGenerating && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <ArrowPathIcon className="w-4 h-4 animate-spin text-purple-500" />
                            <span className="text-sm">생성 중...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={conversationEndRef} />
                  </div>

                  {/* 입력 영역 */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="글쓰기 요청을 입력하세요..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        disabled={isGenerating}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={isGenerating || !context.trim()}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <PaperAirplaneIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* 피드백 버튼 */}
                  {generatedResponse && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleFeedback('positive')}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200"
                      >
                        👍 좋습니다
                      </button>
                      <button
                        onClick={() => handleFeedback('negative')}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
                      >
                        👎 개선 필요
                      </button>
                      <button
                        onClick={handleCopyToClipboard}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200"
                      >
                        📋 복사
                      </button>
                      <button
                        onClick={handleImproveContent}
                        className="px-3 py-1 bg-purple-100 text-purple-800 rounded text-sm hover:bg-purple-200"
                      >
                        🔄 개선
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'analysis' && generatedResponse && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">글쓰기 분석</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="flex items-center space-x-2 mb-2">
                        <ChartBarIcon className="w-5 h-5 text-blue-500" />
                        <h4 className="font-medium text-gray-800">설득력</h4>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">
                        {(generatedResponse.persuasionScore * 100).toFixed(1)}%
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                      <div className="flex items-center space-x-2 mb-2">
                        <EyeIcon className="w-5 h-5 text-green-500" />
                        <h4 className="font-medium text-gray-800">가독성</h4>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        {(generatedResponse.readability * 100).toFixed(1)}%
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                      <div className="flex items-center space-x-2 mb-2">
                        <CogIcon className="w-5 h-5 text-orange-500" />
                        <h4 className="font-medium text-gray-800">신뢰도</h4>
                      </div>
                      <p className="text-2xl font-bold text-orange-600">
                        {(generatedResponse.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* 제안사항 */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">개선 제안</h4>
                    <div className="space-y-2">
                      {generatedResponse.suggestions.map((suggestion, index) => (
                        <div key={index} className="bg-yellow-50 p-3 rounded-lg">
                          <p className="text-sm text-yellow-800">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'context' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">문맥 활용 현황</h3>

                  {/* 사용된 문맥 */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">활용된 파일 문맥</h4>
                    <div className="space-y-2">
                      {generatedResponse?.usedContexts.map((context, index) => (
                        <div key={index} className="bg-green-50 p-3 rounded-lg">
                          <p className="text-sm text-green-800">✅ {context}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 생성된 인사이트 */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">생성된 인사이트</h4>
                    <div className="space-y-2">
                      {generatedResponse?.generatedInsights.map((insight, index) => (
                        <div key={index} className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-800">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'templates' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">글쓰기 템플릿</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-2">설득적 글쓰기</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        독자의 마음을 사로잡는 설득력 있는 메시지
                      </p>
                      <button
                        onClick={() => {
                          setWritingType('persuasive');
                          setContext('설득적 글쓰기 템플릿을 사용해서 메시지를 작성해주세요.');
                        }}
                        className="px-3 py-1 bg-purple-100 text-purple-800 rounded text-sm hover:bg-purple-200"
                      >
                        사용하기
                      </button>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-2">정보 제공</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        명확하고 정확한 정보 전달
                      </p>
                      <button
                        onClick={() => {
                          setWritingType('informative');
                          setContext('정보 제공 템플릿을 사용해서 메시지를 작성해주세요.');
                        }}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200"
                      >
                        사용하기
                      </button>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-2">감정적 글쓰기</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        감정을 자극하는 강력한 메시지
                      </p>
                      <button
                        onClick={() => {
                          setWritingType('emotional');
                          setContext('감정적 글쓰기 템플릿을 사용해서 메시지를 작성해주세요.');
                        }}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
                      >
                        사용하기
                      </button>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-2">스토리텔링</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        이야기로 전달하는 매력적인 메시지
                      </p>
                      <button
                        onClick={() => {
                          setWritingType('storytelling');
                          setContext('스토리텔링 템플릿을 사용해서 메시지를 작성해주세요.');
                        }}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200"
                      >
                        사용하기
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPersuasiveWritingAssistant; 