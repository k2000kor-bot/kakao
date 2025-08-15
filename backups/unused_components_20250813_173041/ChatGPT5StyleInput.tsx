import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PaperClipIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  Cog6ToothIcon,
  LightBulbIcon,
  AcademicCapIcon,
  BeakerIcon,
  ChartBarIcon,
  DocumentTextIcon,
  SparklesIcon,
  ArrowUpIcon,
  MagnifyingGlassIcon,
  CpuChipIcon,
  EyeIcon,
  PlusIcon,
  MinusIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface ChatGPT5StyleInputProps {
  onSendMessage: (message: string, context?: any) => void;
  onFileUpload?: (files: File[]) => void;
  onVoiceInput?: () => void;
  placeholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
  projectId?: string;
  roomId?: string;
}

interface AdvancedContext {
  complexity: 'basic' | 'intermediate' | 'advanced' | 'expert' | 'phd';
  domain: 'general' | 'academic' | 'technical' | 'creative' | 'analytical';
  style: 'conversational' | 'formal' | 'technical' | 'creative' | 'analytical';
  depth: 'surface' | 'moderate' | 'deep' | 'comprehensive' | 'exhaustive';
  output: 'text' | 'code' | 'analysis' | 'visualization' | 'multimodal';
}

const ChatGPT5StyleInput: React.FC<ChatGPT5StyleInputProps> = ({
  onSendMessage,
  onFileUpload,
  onVoiceInput,
  placeholder = "박사급 AI와 대화하세요. 복잡한 질문도 자연스럽게 해주세요...",
  isLoading = false,
  disabled = false,
  projectId,
  roomId
}) => {
  const [message, setMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAdvancedPanel, setShowAdvancedPanel] = useState(false);
  const [advancedContext, setAdvancedContext] = useState<AdvancedContext>({
    complexity: 'intermediate',
    domain: 'general',
    style: 'conversational',
    depth: 'moderate',
    output: 'text'
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [smartInsights, setSmartInsights] = useState<any>(null);
  const [showContextualHelp, setShowContextualHelp] = useState(false);
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 자동 높이 조절
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, 56), 200);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [message]);

  // 메시지 분석
  const analyzeMessage = useCallback(async (text: string) => {
    if (text.length < 10) return;

    setIsAnalyzing(true);
    try {
      // 복잡도 자동 감지
      const complexityPatterns = {
        basic: /기초|간단|쉬운|기본|초보/gi,
        intermediate: /중급|보통|일반|평균/gi,
        advanced: /고급|심화|전문|복잡/gi,
        expert: /전문가|박사|최고급|최첨단/gi,
        phd: /박사급|최고수준|최첨단|최고급|전문가급/gi
      };

      let detectedComplexity = 'intermediate';
      Object.entries(complexityPatterns).forEach(([level, pattern]) => {
        if (pattern.test(text)) {
          detectedComplexity = level;
        }
      });

      // 도메인 감지
      const domainPatterns = {
        academic: /연구|논문|학술|이론|가설|실험/gi,
        technical: /코드|프로그래밍|알고리즘|시스템|기술/gi,
        creative: /창작|아이디어|디자인|예술|창의/gi,
        analytical: /분석|통계|데이터|조사|연구/gi
      };

      let detectedDomain = 'general';
      Object.entries(domainPatterns).forEach(([domain, pattern]) => {
        if (pattern.test(text)) {
          detectedDomain = domain;
        }
      });

      // 스타일 감지
      const stylePatterns = {
        formal: /공식|정식|격식|공식적/gi,
        technical: /기술적|전문적|상세|정밀/gi,
        creative: /창의적|독창적|혁신적|새로운/gi,
        analytical: /분석적|논리적|체계적/gi
      };

      let detectedStyle = 'conversational';
      Object.entries(stylePatterns).forEach(([style, pattern]) => {
        if (pattern.test(text)) {
          detectedStyle = style;
        }
      });

      // 깊이 감지
      const depthPatterns = {
        surface: /간단히|요약|개요/gi,
        moderate: /보통|일반적|적당히/gi,
        deep: /깊이|상세히|자세히/gi,
        comprehensive: /포괄적|전체적|종합적/gi,
        exhaustive: /완전히|철저히|모든/gi
      };

      let detectedDepth = 'moderate';
      Object.entries(depthPatterns).forEach(([depth, pattern]) => {
        if (pattern.test(text)) {
          detectedDepth = depth;
        }
      });

      // 출력 형태 감지
      const outputPatterns = {
        code: /코드|프로그램|함수|클래스|알고리즘/gi,
        analysis: /분석|통계|차트|그래프/gi,
        visualization: /시각화|그래프|차트|표/gi,
        multimodal: /멀티미디어|이미지|동영상|음성/gi
      };

      let detectedOutput = 'text';
      Object.entries(outputPatterns).forEach(([output, pattern]) => {
        if (pattern.test(text)) {
          detectedOutput = output;
        }
      });

      setAdvancedContext({
        complexity: detectedComplexity as any,
        domain: detectedDomain as any,
        style: detectedStyle as any,
        depth: detectedDepth as any,
        output: detectedOutput as any
      });

      // 스마트 제안 생성
      generateSmartSuggestions(text, detectedComplexity, detectedDomain);

    } catch (error) {
      console.error('메시지 분석 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // 스마트 제안 생성
  const generateSmartSuggestions = useCallback((text: string, complexity: string, domain: string) => {
    const suggestions = [];

    if (complexity === 'phd' || complexity === 'expert') {
      suggestions.push('더 구체적인 연구 방향을 제시해주세요');
      suggestions.push('관련 논문이나 최신 연구 동향을 포함해주세요');
      suggestions.push('방법론적 접근을 상세히 설명해주세요');
    } else if (complexity === 'advanced') {
      suggestions.push('전문적인 관점에서 분석해주세요');
      suggestions.push('실무 적용 가능한 해결책을 제시해주세요');
    }

    if (domain === 'academic') {
      suggestions.push('학술적 근거를 포함한 답변을 원합니다');
      suggestions.push('관련 이론과 연구 동향을 포함해주세요');
    } else if (domain === 'technical') {
      suggestions.push('기술적 구현 방법을 상세히 설명해주세요');
      suggestions.push('코드 예시와 함께 설명해주세요');
    }

    setSuggestions(suggestions.slice(0, 3));
  }, []);

  // 메시지 전송
  const handleSendMessage = useCallback(() => {
    if (message.trim() && !isLoading) {
      const enrichedMessage = showAdvancedPanel ?
        `${message}\n\n[박사급 분석 컨텍스트]\n복잡도: ${advancedContext.complexity}\n도메인: ${advancedContext.domain}\n스타일: ${advancedContext.style}\n깊이: ${advancedContext.depth}\n출력: ${advancedContext.output}` :
        message;

      onSendMessage(enrichedMessage, showAdvancedPanel ? advancedContext : undefined);

      // 메시지 초기화 및 UI 상태 리셋
      setMessage('');
      setIsExpanded(false);
      setShowAdvancedPanel(false);
      setSuggestions([]);
      setSmartInsights(null);

      // 텍스트 영역 높이 강제 리셋
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = '56px';
      }

      // 히스토리에 추가
      setInputHistory(prev => [message.trim(), ...prev.slice(0, 9)]);
      setHistoryIndex(-1);
    }
  }, [message, isLoading, showAdvancedPanel, advancedContext, onSendMessage]);

  // 키보드 이벤트 처리
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === 'ArrowUp' && e.ctrlKey) {
      e.preventDefault();
      if (historyIndex < inputHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setMessage(inputHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown' && e.ctrlKey) {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setMessage(inputHistory[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setMessage('');
      }
    }
  }, [handleSendMessage, historyIndex, inputHistory]);

  // 메시지 변경 시 자동 분석
  useEffect(() => {
    if (message.length > 20) {
      const timeoutId = setTimeout(() => {
        analyzeMessage(message);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [message, analyzeMessage]);

  // 파일 업로드 처리
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0 && onFileUpload) {
      onFileUpload(files);
    }
  }, [onFileUpload]);

  // 음성 입력 처리
  const handleVoiceInput = useCallback(() => {
    if (onVoiceInput) {
      onVoiceInput();
    }
  }, [onVoiceInput]);

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* 박사급 분석 패널 */}
      {showAdvancedPanel && (
        <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-purple-900 flex items-center">
              <AcademicCapIcon className="w-4 h-4 mr-2" />
              박사급 분석 컨텍스트
            </h4>
            <button
              onClick={() => setShowAdvancedPanel(false)}
              className="text-purple-600 hover:text-purple-800"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div>
              <span className="font-medium text-purple-700">복잡도:</span>
              <select
                value={advancedContext.complexity}
                onChange={(e) => setAdvancedContext(prev => ({ ...prev, complexity: e.target.value as any }))}
                className="ml-1 px-2 py-1 border border-purple-200 rounded text-xs"
              >
                <option value="basic">기초</option>
                <option value="intermediate">중급</option>
                <option value="advanced">고급</option>
                <option value="expert">전문가</option>
                <option value="phd">박사급</option>
              </select>
            </div>

            <div>
              <span className="font-medium text-purple-700">도메인:</span>
              <select
                value={advancedContext.domain}
                onChange={(e) => setAdvancedContext(prev => ({ ...prev, domain: e.target.value as any }))}
                className="ml-1 px-2 py-1 border border-purple-200 rounded text-xs"
              >
                <option value="general">일반</option>
                <option value="academic">학술</option>
                <option value="technical">기술</option>
                <option value="creative">창작</option>
                <option value="analytical">분석</option>
              </select>
            </div>

            <div>
              <span className="font-medium text-purple-700">스타일:</span>
              <select
                value={advancedContext.style}
                onChange={(e) => setAdvancedContext(prev => ({ ...prev, style: e.target.value as any }))}
                className="ml-1 px-2 py-1 border border-purple-200 rounded text-xs"
              >
                <option value="conversational">대화형</option>
                <option value="formal">공식</option>
                <option value="technical">기술적</option>
                <option value="creative">창의적</option>
                <option value="analytical">분석적</option>
              </select>
            </div>

            <div>
              <span className="font-medium text-purple-700">깊이:</span>
              <select
                value={advancedContext.depth}
                onChange={(e) => setAdvancedContext(prev => ({ ...prev, depth: e.target.value as any }))}
                className="ml-1 px-2 py-1 border border-purple-200 rounded text-xs"
              >
                <option value="surface">표면</option>
                <option value="moderate">보통</option>
                <option value="deep">깊이</option>
                <option value="comprehensive">포괄적</option>
                <option value="exhaustive">철저</option>
              </select>
            </div>

            <div>
              <span className="font-medium text-purple-700">출력:</span>
              <select
                value={advancedContext.output}
                onChange={(e) => setAdvancedContext(prev => ({ ...prev, output: e.target.value as any }))}
                className="ml-1 px-2 py-1 border border-purple-200 rounded text-xs"
              >
                <option value="text">텍스트</option>
                <option value="code">코드</option>
                <option value="analysis">분석</option>
                <option value="visualization">시각화</option>
                <option value="multimodal">멀티미디어</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 스마트 제안 */}
      {suggestions.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-blue-900 flex items-center">
              <LightBulbIcon className="w-4 h-4 mr-2" />
              박사급 제안
            </h4>
            <button
              onClick={() => setSuggestions([])}
              className="text-blue-600 hover:text-blue-800"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setMessage(suggestion);
                  setSuggestions([]);
                }}
                className="block w-full text-left p-2 text-sm text-blue-800 hover:bg-blue-100 rounded transition-colors"
              >
                💡 {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 메인 입력 인터페이스 */}
      <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 focus-within:border-purple-500 focus-within:shadow-xl transition-all duration-300">
        <div className="flex items-end p-4 space-x-3">
          {/* 파일 업로드 버튼 */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="flex-shrink-0 p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
            title="파일 업로드"
          >
            <PaperClipIcon className="w-5 h-5" />
          </button>

          {/* 텍스트 입력 영역 */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full resize-none border-0 outline-none text-gray-800 placeholder-gray-400 bg-transparent text-base leading-relaxed"
              style={{ minHeight: '56px', maxHeight: '200px' }}
              rows={1}
            />

            {/* 문자 수 및 히스토리 인디케이터 */}
            {message.length > 0 && (
              <div className="absolute -bottom-1 right-0 text-xs text-gray-400">
                {message.length}자
                {historyIndex >= 0 && (
                  <span className="ml-2 text-purple-600">
                    히스토리 {historyIndex + 1}/{inputHistory.length}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 고급 설정 버튼 */}
          <button
            onClick={() => setShowAdvancedPanel(!showAdvancedPanel)}
            className={`flex-shrink-0 p-2 rounded-lg transition-colors ${showAdvancedPanel
              ? 'bg-purple-100 text-purple-600'
              : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50'
              }`}
            title="박사급 설정"
          >
            <AcademicCapIcon className="w-5 h-5" />
          </button>

          {/* 음성 입력 버튼 */}
          <button
            onClick={handleVoiceInput}
            disabled={disabled}
            className="flex-shrink-0 p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
            title="음성 입력"
          >
            <MicrophoneIcon className="w-5 h-5" />
          </button>

          {/* 전송 버튼 */}
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || isLoading || disabled}
            className={`flex-shrink-0 p-2 rounded-lg transition-all ${message.trim() && !isLoading && !disabled
              ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            title="메시지 전송 (Enter)"
          >
            <ArrowUpIcon className="w-5 h-5" />
          </button>
        </div>

        {/* 분석 중 인디케이터 */}
        {isAnalyzing && (
          <div className="px-4 pb-3">
            <div className="flex items-center text-xs text-purple-600">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600 mr-2"></div>
              박사급 AI가 메시지를 분석하고 있습니다...
            </div>
          </div>
        )}

        {/* 키보드 단축키 힌트 */}
        <div className="px-4 pb-2">
          <div className="text-xs text-gray-500">
            Enter: 전송 | Shift+Enter: 줄바꿈 | Ctrl+↑/↓: 히스토리 | 박사급 설정으로 더 정교한 응답을 받으세요
          </div>
        </div>
      </div>

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};

export default ChatGPT5StyleInput;
