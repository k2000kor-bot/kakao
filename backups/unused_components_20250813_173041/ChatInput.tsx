import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, ArrowUpIcon, DocumentTextIcon, PhotoIcon, MicrophoneIcon, Cog6ToothIcon, SparklesIcon, LightBulbIcon, AcademicCapIcon, BeakerIcon, ChartBarIcon, CpuChipIcon } from '@heroicons/react/24/outline';
import IntelligentResponseSystem from '../services/intelligentResponseSystem';

interface ChatInputProps {
  onSendMessage: (message: string, context?: any) => void;
  isLoading?: boolean;
  placeholder?: string;
  conversationHistory?: any[];
  uploadedFiles?: any[];
  projectContext?: any;
}

interface MessageContext {
  type: 'analysis' | 'research' | 'writing' | 'coding' | 'design' | 'planning' | 'review' | 'synthesis';
  complexity: 'basic' | 'intermediate' | 'advanced' | 'expert';
  topics: string[];
  requirements: string[];
  constraints: string[];
  expectedOutput: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading = false,
  placeholder = "ChatGPT 5처럼 자연스럽게 말씀해 주세요...",
  conversationHistory = [],
  uploadedFiles = [],
  projectContext = {}
}) => {
  const [message, setMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [contextMode, setContextMode] = useState(false);
  const [messageContext, setMessageContext] = useState<MessageContext>({
    type: 'analysis',
    complexity: 'intermediate',
    topics: [],
    requirements: [],
    constraints: [],
    expectedOutput: ''
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [smartInsights, setSmartInsights] = useState<any>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const intelligentSystem = IntelligentResponseSystem.getInstance();

  // 자동 높이 조정
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // 메시지 분석 및 컨텍스트 추출
  const analyzeMessage = async (text: string) => {
    setIsAnalyzing(true);

    try {
      // 지능형 응답 시스템을 사용한 분석
      const context = {
        conversationHistory,
        uploadedFiles,
        projectContext
      };

      const smartResponse = await intelligentSystem.generateSmartResponse(text, context);
      setSmartInsights(smartResponse);

      // 기존 분석 로직도 유지
      const patterns = {
        analysis: /분석|검토|평가|조사|연구|탐구/gi,
        research: /연구|조사|탐구|수집|정리|분류/gi,
        writing: /작성|글쓰기|문서|보고서|기사|에세이/gi,
        coding: /코딩|프로그래밍|개발|알고리즘|코드|함수/gi,
        design: /디자인|설계|레이아웃|UI|UX|인터페이스/gi,
        planning: /계획|전략|로드맵|일정|목표|방향/gi,
        review: /검토|리뷰|평가|비평|토론/gi,
        synthesis: /종합|통합|요약|정리|결합/gi
      };

      const complexity = {
        basic: /기초|간단|쉬운|기본/gi,
        intermediate: /중급|보통|일반/gi,
        advanced: /고급|심화|전문/gi,
        expert: /전문가|박사|최고급|최첨단/gi
      };

      // 메시지 타입 분석
      let detectedType = 'analysis';
      let maxMatches = 0;

      Object.entries(patterns).forEach(([type, pattern]) => {
        const matches = text.match(pattern)?.length || 0;
        if (matches > maxMatches) {
          maxMatches = matches;
          detectedType = type;
        }
      });

      // 복잡도 분석
      let detectedComplexity = 'intermediate';
      Object.entries(complexity).forEach(([level, pattern]) => {
        if (pattern.test(text)) {
          detectedComplexity = level;
        }
      });

      // 키워드 추출
      const keywords = text.match(/[가-힣a-zA-Z]+/g) || [];
      const uniqueKeywords = Array.from(new Set(keywords)).slice(0, 10);

      // 요구사항 추출
      const requirements = text.match(/[가-힣a-zA-Z\s]+(?:해주세요|해주시면|부탁드립니다|요청합니다|필요합니다|원합니다)/g) || [];

      // 제약사항 추출
      const constraints = text.match(/(?:제한|제약|조건|범위|한계|제외|포함)[가-힣a-zA-Z\s]*/g) || [];

      // 예상 출력 형태 추출
      const outputPatterns = [
        /(?:형태|형식|스타일|방식|구조|틀|템플릿)[가-힣a-zA-Z\s]*/g,
        /(?:표|차트|그래프|목록|요약|정리|분류)/g,
        /(?:코드|함수|클래스|모듈|알고리즘)/g
      ];

      let expectedOutput = '';
      outputPatterns.forEach(pattern => {
        const match = text.match(pattern);
        if (match) {
          expectedOutput = match[0];
        }
      });

      // 컨텍스트 업데이트
      setMessageContext({
        type: detectedType as any,
        complexity: detectedComplexity as any,
        topics: uniqueKeywords,
        requirements: requirements,
        constraints: constraints,
        expectedOutput: expectedOutput
      });

      // 스마트 제안 생성
      generateSmartSuggestions(text, detectedType, detectedComplexity, smartResponse);

    } catch (error) {
      console.error('메시지 분석 중 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 스마트 제안 생성
  const generateSmartSuggestions = (text: string, type: string, complexity: string, smartResponse?: any) => {
    const suggestions = [];

    // 지능형 시스템의 인사이트 활용
    if (smartResponse) {
      if (smartResponse.followUpQuestions.length > 0) {
        suggestions.push(...smartResponse.followUpQuestions.slice(0, 2));
      }
      if (smartResponse.suggestedActions.length > 0) {
        suggestions.push(...smartResponse.suggestedActions.slice(0, 2));
      }
    }

    // 메시지 길이에 따른 제안
    if (text.length < 50) {
      suggestions.push('더 구체적인 요구사항을 추가해보세요');
      suggestions.push('예시나 샘플을 포함해보세요');
    } else if (text.length > 500) {
      suggestions.push('요구사항을 단계별로 나누어보세요');
      suggestions.push('핵심 요구사항을 우선순위로 정리해보세요');
    }

    // 타입별 제안
    switch (type) {
      case 'analysis':
        suggestions.push('분석 기준과 평가 지표를 명시해보세요');
        suggestions.push('비교 대상이나 참고 자료를 추가해보세요');
        break;
      case 'research':
        suggestions.push('연구 범위와 기간을 구체화해보세요');
        suggestions.push('참고 자료나 출처를 명시해보세요');
        break;
      case 'writing':
        suggestions.push('글의 목적과 대상 독자를 명시해보세요');
        suggestions.push('글의 길이와 스타일을 지정해보세요');
        break;
      case 'coding':
        suggestions.push('프로그래밍 언어와 프레임워크를 명시해보세요');
        suggestions.push('입력과 출력 형식을 구체화해보세요');
        break;
    }

    // 복잡도별 제안
    switch (complexity) {
      case 'basic':
        suggestions.push('기초 개념부터 단계별로 설명해주세요');
        break;
      case 'advanced':
        suggestions.push('전문적인 용어와 고급 개념을 포함해주세요');
        break;
      case 'expert':
        suggestions.push('최신 연구나 트렌드를 반영해주세요');
        suggestions.push('다양한 관점과 대안을 제시해주세요');
        break;
    }

    setSuggestions(suggestions);
  };

  // 메시지 전송
  const handleSendMessage = () => {
    if (message.trim() && !isLoading) {
      // 지능형 응답 시스템의 인사이트를 포함한 메시지 전송
      const enrichedMessage = contextMode && smartInsights ?
        `${message}\n\n[지능형 분석 결과]\n의도: ${smartInsights.confidence > 0.8 ? '명확' : '추정'}\n신뢰도: ${(smartInsights.confidence * 100).toFixed(1)}%\n응답타입: ${smartInsights.responseType}\n관련주제: ${smartInsights.relatedTopics.join(', ')}` :
        message;

      onSendMessage(enrichedMessage, contextMode ? { ...messageContext, smartInsights } : undefined);
      
      // 메시지 초기화 및 UI 상태 리셋
      setMessage('');
      setIsExpanded(false);
      setContextMode(false);
      setSuggestions([]);
      setSmartInsights(null);
      
      // 텍스트 영역 높이 강제 리셋
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = '24px';
      }
    }
  };

  // 키보드 이벤트 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === 'Enter' && e.shiftKey) {
      // 줄바꿈 허용
    }
  };

  // 메시지 변경 시 자동 분석
  useEffect(() => {
    if (message.length > 20) {
      const timeoutId = setTimeout(() => {
        analyzeMessage(message);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [message]);

  return (
    <div className="relative">
      {/* 지능형 인사이트 표시 */}
      {smartInsights && (
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-blue-900 flex items-center">
              <SparklesIcon className="w-4 h-4 mr-2" />
              ChatGPT 5 스타일 분석
            </h4>
            <button
              onClick={() => setSmartInsights(null)}
              className="text-blue-600 hover:text-blue-800"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="font-medium">의도:</span> {smartInsights.detectedIntent || '분석 중'}
            </div>
            <div>
              <span className="font-medium">감정:</span> {smartInsights.detectedEmotion || '중립'}
            </div>
            <div>
              <span className="font-medium">신뢰도:</span> {(smartInsights.confidence * 100).toFixed(1)}%
            </div>
            <div>
              <span className="font-medium">응답타입:</span> {smartInsights.responseType}
            </div>
            {smartInsights.relatedTopics.length > 0 && (
              <div className="col-span-2">
                <span className="font-medium">관련주제:</span> {smartInsights.relatedTopics.slice(0, 3).join(', ')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 컨텍스트 모드 표시 */}
      {contextMode && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-blue-900">메시지 컨텍스트 분석</h4>
            <button
              onClick={() => setContextMode(false)}
              className="text-blue-600 hover:text-blue-800"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="font-medium">타입:</span> {messageContext.type}
            </div>
            <div>
              <span className="font-medium">복잡도:</span> {messageContext.complexity}
            </div>
            <div className="col-span-2">
              <span className="font-medium">주제:</span> {messageContext.topics.join(', ')}
            </div>
            {messageContext.requirements.length > 0 && (
              <div className="col-span-2">
                <span className="font-medium">요구사항:</span> {messageContext.requirements.join(', ')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 스마트 제안 */}
      {suggestions.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center mb-2">
            <LightBulbIcon className="w-4 h-4 text-yellow-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">ChatGPT 5 스타일 제안</span>
          </div>
          <div className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="text-xs text-gray-600 flex items-center">
                <SparklesIcon className="w-3 h-3 mr-1" />
                {suggestion}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 입력 영역 */}
      <div className={`relative border rounded-lg transition-all duration-300 ${isExpanded ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}>
        {/* 도구 모음 */}
        <div className="flex items-center justify-between p-2 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setContextMode(!contextMode)}
              className={`p-1 rounded ${contextMode ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              title="지능형 분석 모드"
            >
              <CpuChipIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-1 rounded ${isExpanded ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              title="확장 모드"
            >
              <DocumentTextIcon className="w-4 h-4" />
            </button>
          </div>

          {isAnalyzing && (
            <div className="flex items-center text-xs text-blue-600">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
              ChatGPT 5 스타일 분석 중...
            </div>
          )}
        </div>

        {/* 텍스트 입력 영역 */}
        <div className="p-3">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full resize-none border-none outline-none bg-transparent text-gray-900 placeholder-gray-500"
            rows={isExpanded ? 8 : 3}
            maxLength={5000}
          />
        </div>

        {/* 하단 도구 모음 */}
        <div className="flex items-center justify-between p-2 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <button className="p-1 text-gray-500 hover:text-gray-700" title="이미지 첨부">
              <PhotoIcon className="w-4 h-4" />
            </button>
            <button className="p-1 text-gray-500 hover:text-gray-700" title="음성 입력">
              <MicrophoneIcon className="w-4 h-4" />
            </button>
            <button className="p-1 text-gray-500 hover:text-gray-700" title="고급 설정">
              <Cog6ToothIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              {message.length}/5000
            </span>
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading}
              className={`p-2 rounded-lg transition-all ${message.trim() && !isLoading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              title="메시지 전송 (Enter)"
            >
              <ArrowUpIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 복잡도 표시 */}
      {message.length > 50 && (
        <div className="mt-2 flex items-center space-x-2 text-xs text-gray-600">
          <AcademicCapIcon className="w-3 h-3" />
          <span>복잡도: {messageContext.complexity}</span>
          <BeakerIcon className="w-3 h-3" />
          <span>타입: {messageContext.type}</span>
          <ChartBarIcon className="w-3 h-3" />
          <span>키워드: {messageContext.topics.length}개</span>
          {smartInsights && (
            <>
              <SparklesIcon className="w-3 h-3" />
              <span>신뢰도: {(smartInsights.confidence * 100).toFixed(1)}%</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatInput;
