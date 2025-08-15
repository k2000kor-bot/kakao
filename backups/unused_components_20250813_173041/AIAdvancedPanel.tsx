import React, { useState } from 'react';
import { advancedAIService } from '../services/advancedAIService';

interface AIAdvancedPanelProps {
  onAIRequest: (type: string, data: any) => void;
  isVisible: boolean;
  onClose: () => void;
}

const AIAdvancedPanel: React.FC<AIAdvancedPanelProps> = ({
  onAIRequest,
  isVisible,
  onClose
}) => {
  const [selectedMode, setSelectedMode] = useState('conversation');
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const aiModes = [
    {
      id: 'conversation',
      name: '자연스러운 대화',
      description: '자연스러운 대화를 나눠보세요',
      icon: '💬',
      color: 'blue'
    },
    {
      id: 'analysis',
      name: '심층 분석',
      description: '텍스트의 감정, 주제, 키워드를 분석합니다',
      icon: '🔍',
      color: 'purple'
    },
    {
      id: 'summary',
      name: '스마트 요약',
      description: '긴 내용을 핵심만 간단히 요약합니다',
      icon: '📝',
      color: 'green'
    },
    {
      id: 'creative',
      name: '창의적 생성',
      description: '아이디어, 스토리, 창작물을 생성합니다',
      icon: '🎨',
      color: 'pink'
    },
    {
      id: 'technical',
      name: '기술적 도움',
      description: '코드, 알고리즘, 기술적 문제를 해결합니다',
      icon: '💻',
      color: 'orange'
    },
    {
      id: 'business',
      name: '비즈니스 인사이트',
      description: '시장 분석, 전략 수립을 도와줍니다',
      icon: '📊',
      color: 'indigo'
    }
  ];

  const handleSubmit = async () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    try {
      // 고급 AI 서비스 사용
      const aiMessage = await advancedAIService.generateAdvancedResponse({
        type: selectedMode as any,
        text: inputText,
        style: 'friendly',
        length: 'medium'
      });

      await onAIRequest(selectedMode, {
        text: inputText,
        response: aiMessage.message
      });
      setInputText('');
    } catch (error) {
      console.error('AI 요청 실패:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900">고급 AI 패널</h2>
              <p className="text-sm text-gray-500">강력한 AI 기능을 활용해보세요</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="패널 닫기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* AI 모드 선택 */}
          <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI 모드 선택</h3>
            <div className="space-y-3">
              {aiModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${selectedMode === mode.id
                      ? `border-${mode.color}-500 bg-${mode.color}-50`
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{mode.icon}</span>
                    <div className="text-left">
                      <h4 className="font-medium text-gray-900">{mode.name}</h4>
                      <p className="text-sm text-gray-500">{mode.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 입력 및 설정 */}
          <div className="flex-1 p-6">
            <div className="space-y-6">
              {/* 선택된 모드 정보 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">
                    {aiModes.find(m => m.id === selectedMode)?.icon}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {aiModes.find(m => m.id === selectedMode)?.name}
                  </h3>
                </div>
                <p className="text-gray-600">
                  {aiModes.find(m => m.id === selectedMode)?.description}
                </p>
              </div>

              {/* 입력 영역 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedMode === 'conversation' && '자연스럽게 말해보세요'}
                  {selectedMode === 'analysis' && '분석할 텍스트를 입력하세요'}
                  {selectedMode === 'summary' && '요약할 내용을 입력하세요'}
                  {selectedMode === 'creative' && '창작 아이디어나 주제를 입력하세요'}
                  {selectedMode === 'technical' && '기술적 문제나 질문을 입력하세요'}
                  {selectedMode === 'business' && '비즈니스 관련 질문을 입력하세요'}
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    selectedMode === 'conversation' ? '안녕하세요! 무엇을 도와드릴까요?' :
                      selectedMode === 'analysis' ? '분석하고 싶은 텍스트를 입력하세요...' :
                        selectedMode === 'summary' ? '요약할 긴 내용을 입력하세요...' :
                          selectedMode === 'creative' ? '창작 아이디어나 주제를 입력하세요...' :
                            selectedMode === 'technical' ? '기술적 문제나 코드를 입력하세요...' :
                              '비즈니스 관련 질문을 입력하세요...'
                  }
                  className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
                />
              </div>

              {/* 고급 설정 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    응답 스타일
                  </label>
                  <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" aria-label="응답 스타일 선택">
                    <option value="friendly">친근한</option>
                    <option value="professional">전문적인</option>
                    <option value="creative">창의적인</option>
                    <option value="formal">공식적인</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    응답 길이
                  </label>
                  <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" aria-label="응답 길이 선택">
                    <option value="short">간단히</option>
                    <option value="medium">보통</option>
                    <option value="long">자세히</option>
                  </select>
                </div>
              </div>

              {/* 실행 버튼 */}
              <div className="flex space-x-3">
                <button
                  onClick={handleSubmit}
                  disabled={!inputText.trim() || isProcessing}
                  className="flex-1 btn-corbu disabled:opacity-50"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      처리 중...
                    </div>
                  ) : (
                    'AI 응답 생성'
                  )}
                </button>
                <button
                  onClick={() => setInputText('')}
                  className="px-6 py-3 text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  지우기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAdvancedPanel; 