import React, { useState, useEffect, useRef } from 'react';
import {
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  AcademicCapIcon,
  ClipboardDocumentIcon,
  ArrowPathIcon,
  StarIcon,
  DocumentTextIcon,
  BookmarkIcon,
  SparklesIcon,
  BeakerIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  HeartIcon,
  UserGroupIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon,
  HandThumbUpIcon,
  HandThumbDownIcon
} from '@heroicons/react/24/outline';
import { useModalClose } from '../hooks/useModalClose';

interface PersuasiveWritingAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onMessageGenerated?: (message: string) => void;
}

interface WritingRequest {
  id: string;
  type: 'persuasive' | 'informative' | 'emotional' | 'logical' | 'storytelling';
  target: string;
  goal: string;
  tone: 'formal' | 'casual' | 'friendly' | 'authoritative' | 'empathetic';
  length: 'short' | 'medium' | 'long';
  context: string;
  keywords: string[];
  createdAt: Date;
}

interface WritingResponse {
  id: string;
  content: string;
  confidence: number;
  persuasionScore: number;
  readabilityScore: number;
  emotionalImpact: number;
  suggestions: string[];
  alternatives: string[];
  metadata: {
    wordCount: number;
    sentenceCount: number;
    readingTime: number;
    complexityLevel: string;
    emotionalTone: string;
    persuasionTechniques: string[];
  };
}

interface ConversationTurn {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    writingType?: string;
    targetAudience?: string;
    goal?: string;
    feedback?: string;
    improvement?: string;
    confidence?: number;
    persuasionScore?: number;
    suggestions?: string[];
  };
}

const PersuasiveWritingAssistant: React.FC<PersuasiveWritingAssistantProps> = ({
  isOpen,
  onClose,
  onMessageGenerated
}) => {
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [currentRequest, setCurrentRequest] = useState<WritingRequest | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [writingType, setWritingType] = useState<'persuasive' | 'informative' | 'emotional' | 'logical' | 'storytelling'>('persuasive');
  const [targetAudience, setTargetAudience] = useState('');
  const [writingGoal, setWritingGoal] = useState('');
  const [tone, setTone] = useState<'formal' | 'casual' | 'friendly' | 'authoritative' | 'empathetic'>('friendly');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [context, setContext] = useState('');
  const [generatedResponse, setGeneratedResponse] = useState<WritingResponse | null>(null);
  const [userFeedback, setUserFeedback] = useState<'positive' | 'negative' | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState<'conversation' | 'analysis' | 'templates'>('conversation');

  const { modalRef, handleClose } = useModalClose({
    isOpen,
    onClose
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const addMessage = (type: 'user' | 'assistant', content: string, metadata?: any) => {
    const newMessage: ConversationTurn = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      metadata
    };
    setConversation(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!context.trim()) return;

    const request: WritingRequest = {
      id: Date.now().toString(),
      type: writingType,
      target: targetAudience,
      goal: writingGoal,
      tone,
      length,
      context,
      keywords,
      createdAt: new Date()
    };

    setCurrentRequest(request);
    addMessage('user', context, { writingType, targetAudience, goal: writingGoal });

    setIsGenerating(true);
    try {
      // 실제 API 호출 대신 시뮬레이션
      const response = await generatePersuasiveContent(request);
      setGeneratedResponse(response);
      addMessage('assistant', response.content, {
        confidence: response.confidence,
        persuasionScore: response.persuasionScore,
        suggestions: response.suggestions
      });
    } catch (error) {
      addMessage('assistant', '죄송합니다. 글 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePersuasiveContent = async (request: WritingRequest): Promise<WritingResponse> => {
    // 실제 구현에서는 AI API를 호출
    await new Promise(resolve => setTimeout(resolve, 2000));

    const templates: Record<string, Record<string, string>> = {
      persuasive: {
        formal: "귀하의 제안에 대해 깊이 검토한 결과, 다음과 같은 근거로 적극적으로 추천드립니다. 첫째, [논리적 근거]. 둘째, [감정적 호소]. 마지막으로, [행동 촉구]를 통해 더 나은 결과를 얻을 수 있을 것입니다.",
        friendly: "안녕하세요! [상황 설명]에 대해 이야기해보고 싶어요. 제가 생각하기에는 [제안 내용]이 정말 좋은 아이디어라고 생각해요. 왜냐하면 [이유 설명]이거든요. 함께 [목표]를 이루어보는 건 어떨까요?",
        empathetic: "저도 비슷한 경험을 해봐서 [상황]에 대한 걱정을 이해해요. 하지만 [해결책]을 통해 우리가 함께 [목표]를 이룰 수 있다고 믿어요. [감정적 지지]와 함께 [구체적 제안]을 제안드려요."
      },
      informative: {
        formal: "다음과 같은 정보를 제공드립니다. [주요 내용]에 대해 [상세 설명]을 통해 [목표]를 달성할 수 있습니다.",
        friendly: "안녕하세요! [주제]에 대한 정보를 공유하고 싶어요. [핵심 내용]을 통해 [유용한 정보]를 얻을 수 있을 거예요.",
        casual: "재미있는 정보를 알려드릴게요! [주제]에 대해 [흥미로운 사실]을 발견했어요. [실용적 팁]도 함께 알려드릴게요."
      },
      emotional: {
        empathetic: "저도 비슷한 경험을 해봐서 [상황]에 대한 걱정을 이해해요. 하지만 [해결책]을 통해 우리가 함께 [목표]를 이룰 수 있다고 믿어요.",
        friendly: "여러분의 마음을 이해해요. [감정적 상황]에서 [공감 표현]을 통해 [지지 메시지]를 전하고 싶어요.",
        casual: "정말 공감되는 이야기네요! [공감 표현]을 통해 [감정적 연결]을 만들고 싶어요."
      },
      logical: {
        formal: "데이터와 연구 결과를 바탕으로 [현상]을 분석한 결과, [논리적 결론]을 도출할 수 있습니다.",
        authoritative: "사실과 근거를 바탕으로 [주제]에 대해 [객관적 분석]을 통해 [논리적 제안]을 하겠습니다.",
        friendly: "객관적인 관점에서 [주제]를 살펴보면, [논리적 근거]를 통해 [합리적 결론]에 도달할 수 있어요."
      },
      storytelling: {
        casual: "재미있는 이야기를 들려드릴게요. [과거 경험]이 있었는데, 그때 [문제 상황]을 겪었어요. 하지만 [해결 과정]을 통해 [결과]를 얻었죠. 이 경험을 바탕으로 [현재 제안]을 하고 싶어요.",
        friendly: "여러분과 공유하고 싶은 특별한 이야기가 있어요. [시작 상황]에서 시작해서 [발전 과정]을 거쳐 [현재 상황]에 이르렀어요. 이 경험을 통해 [교훈]을 얻었고, [제안]을 하고 싶어요."
      }
    };

    const template = templates[request.type]?.[request.tone] || 
                   "귀하의 요청사항을 바탕으로 다음과 같은 내용을 제안드립니다. [주요 내용]을 중심으로 [보조 내용]을 더하여 [목표]를 달성할 수 있도록 구성했습니다.";

    const content = template
      .replace('[논리적 근거]', '데이터와 연구 결과를 바탕으로 한 객관적 분석')
      .replace('[감정적 호소]', '공감대 형성을 통한 감정적 연결')
      .replace('[행동 촉구]', '구체적이고 실현 가능한 다음 단계')
      .replace('[상황 설명]', request.context)
      .replace('[제안 내용]', request.goal)
      .replace('[이유 설명]', '실제 사례와 데이터를 통한 검증된 근거')
      .replace('[목표]', request.goal)
      .replace('[과거 경험]', '유사한 상황에서의 성공 경험')
      .replace('[문제 상황]', '당시 직면했던 도전과제')
      .replace('[해결 과정]', '체계적이고 창의적인 해결 방법')
      .replace('[결과]', '놀라운 성과와 긍정적 변화')
      .replace('[현재 제안]', request.goal)
      .replace('[시작 상황]', '처음 마주한 상황')
      .replace('[발전 과정]', '단계별 성장과 학습 과정')
      .replace('[현재 상황]', '현재의 성과와 위치')
      .replace('[교훈]', '가치 있는 인사이트와 경험')
      .replace('[주요 내용]', request.context)
      .replace('[보조 내용]', '지원적이고 보완적인 요소들');

    return {
      id: Date.now().toString(),
      content,
      confidence: 0.85,
      persuasionScore: 0.78,
      readabilityScore: 0.82,
      emotionalImpact: 0.75,
      suggestions: [
        '더 구체적인 사례를 추가하면 설득력이 높아집니다',
        '감정적 호소와 논리적 근거의 균형을 맞춰보세요',
        '청중의 관점에서 생각해보는 것이 중요합니다'
      ],
      alternatives: [
        '더 간결하고 직관적인 버전',
        '감정적 호소를 강화한 버전',
        '논리적 근거를 강화한 버전'
      ],
      metadata: {
        wordCount: content.split(' ').length,
        sentenceCount: content.split('.').length - 1,
        readingTime: Math.ceil(content.length / 200),
        complexityLevel: '보통',
        emotionalTone: request.tone,
        persuasionTechniques: ['감정적 호소', '논리적 근거', '신뢰성 구축']
      }
    };
  };

  const handleFeedback = (type: 'positive' | 'negative') => {
    setUserFeedback(type);
    addMessage('user', type === 'positive' ? '좋아요! 👍' : '개선이 필요해요 👎', { feedback: type });
    
    if (type === 'negative' && generatedResponse) {
      addMessage('assistant', '어떤 부분을 개선하면 좋을까요? 더 구체적인 피드백을 주시면 더 나은 글을 작성해드릴 수 있어요.', {
        improvement: '사용자 피드백 수집'
      });
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addMessage('assistant', '클립보드에 복사되었습니다! 📋');
  };

  const handleImproveContent = async () => {
    if (!generatedResponse) return;

    setIsGenerating(true);
    addMessage('user', '이 글을 더 개선해주세요.', { improvement: 'content_enhancement' });

    try {
      const improvedResponse = await generatePersuasiveContent({
        ...currentRequest!,
        context: generatedResponse.content + ' (개선 요청)'
      });
      
      setGeneratedResponse(improvedResponse);
      addMessage('assistant', improvedResponse.content, {
        confidence: improvedResponse.confidence,
        persuasionScore: improvedResponse.persuasionScore,
        suggestions: improvedResponse.suggestions
      });
    } catch (error) {
      addMessage('assistant', '개선 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const addKeyword = () => {
    if (currentKeyword.trim() && !keywords.includes(currentKeyword.trim())) {
      setKeywords([...keywords, currentKeyword.trim()]);
      setCurrentKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <ChatBubbleLeftRightIcon className="w-7 h-7 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-800">설득력 있는 글쓰기 어시스턴트</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="글쓰기 어시스턴트 닫기"
            title="ESC 키로도 닫을 수 있습니다"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-full">
          {/* 왼쪽 패널 - 설정 및 입력 */}
          <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* 글쓰기 유형 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  글쓰기 유형
                </label>
                <select
                  value={writingType}
                  onChange={(e) => setWritingType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="글쓰기 유형 선택"
                >
                  <option value="persuasive">설득적 글쓰기</option>
                  <option value="informative">정보 전달</option>
                  <option value="emotional">감정적 호소</option>
                  <option value="logical">논리적 설명</option>
                  <option value="storytelling">스토리텔링</option>
                </select>
              </div>

              {/* 대상 청중 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  대상 청중
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="예: 고객, 동료, 상사, 일반 대중"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 글쓰기 목표 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  글쓰기 목표
                </label>
                <input
                  type="text"
                  value={writingGoal}
                  onChange={(e) => setWritingGoal(e.target.value)}
                  placeholder="예: 제품 구매 유도, 동의 얻기, 정보 전달"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 톤 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  톤
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="글쓰기 톤 선택"
                >
                  <option value="formal">공식적</option>
                  <option value="casual">친근한</option>
                  <option value="friendly">우호적</option>
                  <option value="authoritative">권위적</option>
                  <option value="empathetic">공감적</option>
                </select>
              </div>

              {/* 길이 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  글 길이
                </label>
                <select
                  value={length}
                  onChange={(e) => setLength(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="글 길이 선택"
                >
                  <option value="short">짧게 (100-200자)</option>
                  <option value="medium">보통 (200-500자)</option>
                  <option value="long">길게 (500자 이상)</option>
                </select>
              </div>

              {/* 키워드 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  키워드
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={currentKeyword}
                    onChange={(e) => setCurrentKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                    placeholder="키워드 입력 후 Enter"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={addKeyword}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    추가
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {keyword}
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* 내용 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  작성할 내용
                </label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="설득하고 싶은 내용이나 전달하고 싶은 메시지를 입력하세요..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 생성 버튼 */}
              <button
                onClick={handleSendMessage}
                disabled={!context.trim() || isGenerating}
                className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    <span>생성 중...</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5" />
                    <span>설득력 있는 글 생성</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 오른쪽 패널 - 대화 및 결과 */}
          <div className="flex-1 flex flex-col">
            {/* 탭 네비게이션 */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('conversation')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === 'conversation'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                대화
              </button>
              <button
                onClick={() => setActiveTab('analysis')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === 'analysis'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                분석
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === 'templates'
                    ? 'text-blue-600 border-b-2 border-blue-600'
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
                  {conversation.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-4 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        {message.metadata && (
                          <div className="mt-2 text-xs opacity-75">
                            {message.metadata.writingType && (
                              <span className="inline-block bg-blue-200 text-blue-800 px-2 py-1 rounded mr-2">
                                {message.metadata.writingType}
                              </span>
                            )}
                            {message.metadata.confidence && (
                              <span className="inline-block bg-green-200 text-green-800 px-2 py-1 rounded">
                                신뢰도: {Math.round(message.metadata.confidence * 100)}%
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}

              {activeTab === 'analysis' && generatedResponse && (
                <div className="space-y-6">
                  {/* 생성된 글 */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">생성된 글</h3>
                    <p className="text-gray-800 leading-relaxed">{generatedResponse.content}</p>
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => handleCopyToClipboard(generatedResponse.content)}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                      >
                        복사
                      </button>
                      <button
                        onClick={handleImproveContent}
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                      >
                        개선
                      </button>
                    </div>
                  </div>

                  {/* 분석 결과 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-semibold mb-2">설득력 점수</h4>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${generatedResponse.persuasionScore * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {Math.round(generatedResponse.persuasionScore * 100)}%
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-semibold mb-2">가독성 점수</h4>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${generatedResponse.readabilityScore * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {Math.round(generatedResponse.readabilityScore * 100)}%
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-semibold mb-2">감정적 영향</h4>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ width: `${generatedResponse.emotionalImpact * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {Math.round(generatedResponse.emotionalImpact * 100)}%
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-semibold mb-2">신뢰도</h4>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-500 h-2 rounded-full"
                            style={{ width: `${generatedResponse.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {Math.round(generatedResponse.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 피드백 */}
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-semibold mb-3">피드백</h4>
                    <div className="flex space-x-4 mb-4">
                      <button
                        onClick={() => handleFeedback('positive')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                          userFeedback === 'positive'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-800'
                        }`}
                      >
                        <HandThumbUpIcon className="w-5 h-5" />
                        <span>좋아요</span>
                      </button>
                      <button
                        onClick={() => handleFeedback('negative')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                          userFeedback === 'negative'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-800'
                        }`}
                      >
                        <HandThumbDownIcon className="w-5 h-5" />
                        <span>개선 필요</span>
                      </button>
                    </div>

                    {/* 개선 제안 */}
                    {generatedResponse.suggestions.length > 0 && (
                      <div>
                        <h5 className="font-medium mb-2">개선 제안</h5>
                        <ul className="space-y-1">
                          {generatedResponse.suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start space-x-2 text-sm">
                              <LightBulbIcon className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'templates' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">글쓰기 템플릿</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        title: '설득적 제안',
                        description: '상품이나 서비스를 구매하도록 설득하는 글',
                        type: 'persuasive',
                        template: '귀하의 [문제/욕구]를 해결할 수 있는 [제품/서비스]를 소개드립니다. [핵심 가치]를 통해 [기대 효과]를 얻을 수 있습니다.'
                      },
                      {
                        title: '감정적 호소',
                        description: '공감대를 형성하고 감정적 연결을 만드는 글',
                        type: 'emotional',
                        template: '저도 비슷한 경험을 해봐서 [상황]에 대한 걱정을 이해해요. 하지만 [해결책]을 통해 우리가 함께 [목표]를 이룰 수 있다고 믿어요.'
                      },
                      {
                        title: '스토리텔링',
                        description: '이야기를 통해 메시지를 전달하는 글',
                        type: 'storytelling',
                        template: '재미있는 이야기를 들려드릴게요. [과거 경험]이 있었는데, 그때 [문제 상황]을 겪었어요. 하지만 [해결 과정]을 통해 [결과]를 얻었죠.'
                      },
                      {
                        title: '논리적 설명',
                        description: '사실과 데이터를 바탕으로 한 설명',
                        type: 'logical',
                        template: '데이터를 바탕으로 [현상]을 분석한 결과, [인사이트]를 발견했습니다. 이를 통해 [결론]을 도출할 수 있습니다.'
                      }
                    ].map((template, index) => (
                      <div
                        key={index}
                        className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => {
                          setWritingType(template.type as any);
                          setContext(template.template);
                        }}
                      >
                        <h4 className="font-semibold mb-2">{template.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                        <p className="text-xs text-gray-500 italic">{template.template}</p>
                      </div>
                    ))}
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

export default PersuasiveWritingAssistant; 