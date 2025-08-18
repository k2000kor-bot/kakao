import React, { useState } from 'react';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSetInstructions: (instructions: string) => Promise<void>;
  isLoading?: boolean;
}

const InstructionsModal: React.FC<InstructionsModalProps> = ({
  isOpen,
  onClose,
  onSetInstructions,
  isLoading = false
}) => {
  const [instructions, setInstructions] = useState('');
  const [localSaving, setLocalSaving] = useState(false);

  const handleSave = async () => {
    if (isLoading || localSaving) return;

    setLocalSaving(true);
    try {
      await onSetInstructions(instructions);
      setInstructions('');
      onClose();
    } catch (error) {
      console.error('지침 저장 실패:', error);
    } finally {
      setLocalSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  const exampleInstructions = [
    "스페인어로 대답해 줘. 최신 JavaScript 문서를 레퍼런스로 삼아 줘. 대답을 간결히 핵심만 담아서 해 줘.",
    "개포우성7차 재개발 사업에 특화된 전문적인 답변을 제공해주세요. 부동산 관련 법규와 시장 동향을 고려해서 답변해주세요.",
    "시공사 관점에서 기술적이고 실무적인 조언을 제공해주세요. 안전성과 효율성을 우선으로 고려해주세요.",
    "투자자 관점에서 위험과 수익성을 분석해주세요. 시장 동향과 정책 변화를 고려한 전망을 제공해주세요."
  ];

  const insertExample = (example: string) => {
    setInstructions(prev => prev + (prev ? '\n\n' : '') + example);
  };

  const isProcessing = isLoading || localSaving;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">지침</h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* 메인 질문 */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              어떻게 하면 ChatGPT가 이 프로젝트를 최대한 도와드릴 수 있을까요?
            </h3>
            <p className="text-gray-600">
              ChatGPT에게 특정 토픽에 집중해 달라고 하거나, 특정한 톤이나 포맷으로 응답해 달라고 할 수 있습니다.
            </p>
          </div>

          {/* 예시 버튼들 */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">예시 지침:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {exampleInstructions.map((example, index) => (
                <button
                  key={index}
                  onClick={() => insertExample(example)}
                  disabled={isProcessing}
                  className="text-left p-3 text-sm bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {example.length > 60 ? example.substring(0, 60) + '...' : example}
                </button>
              ))}
            </div>
          </div>

          {/* 지침 입력 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              프로젝트 지침
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="ChatGPT가 이 프로젝트에서 어떻게 응답해야 하는지 지침을 입력하세요..."
              disabled={isProcessing}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              rows={8}
            />
            <p className="text-xs text-gray-500 mt-2">
              Ctrl+Enter (또는 Cmd+Enter)로 저장할 수 있습니다.
            </p>
          </div>

          {/* 정보 박스 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-900 mb-1">지침 설정 팁</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 특정 언어나 톤으로 응답하도록 요청</li>
                  <li>• 전문 분야나 관점을 명시</li>
                  <li>• 응답 형식이나 길이를 지정</li>
                  <li>• 참고할 자료나 기준을 제시</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={!instructions.trim() || isProcessing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isProcessing && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            )}
            {isProcessing ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructionsModal;
