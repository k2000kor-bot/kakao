import React from 'react';
import { Message } from '../../types/chat';

interface AnalysisResponseProps {
  message: Message;
}

const AnalysisResponse: React.FC<AnalysisResponseProps> = ({ message }) => {
  const getAnalysisTypeIcon = () => {
    const type = message.analysis?.type || 'sentiment';

    switch (type) {
      case 'sentiment':
        return (
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'trend':
        return (
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'comparison':
        return (
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'prediction':
        return (
          <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
    }
  };

  const getAnalysisTypeLabel = () => {
    const type = message.analysis?.type || 'sentiment';

    switch (type) {
      case 'sentiment': return '감정 분석';
      case 'trend': return '트렌드 분석';
      case 'comparison': return '비교 분석';
      case 'prediction': return '예측 분석';
      default: return '분석';
    }
  };

  return (
    <div className="analysis-response bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200 card-corbu">
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
          {getAnalysisTypeIcon()}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-green-900">
              {getAnalysisTypeLabel()}
            </div>
            <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
              AI 분석
            </div>
          </div>

          <div className="text-sm text-gray-800 leading-relaxed mb-3">
            {message.content}
          </div>

          {message.analysis?.insights && message.analysis.insights.length > 0 && (
            <div className="mt-3">
              <div className="text-xs font-medium text-green-700 mb-2">주요 인사이트:</div>
              <div className="space-y-2">
                {message.analysis.insights.map((insight, index) => (
                  <div key={index} className="text-xs text-gray-700 bg-white p-2 rounded border-l-4 border-green-400">
                    <div className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                      {insight}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {message.analysis?.data && (
            <div className="mt-3 p-2 bg-white rounded border">
              <div className="text-xs font-medium text-gray-700 mb-1">분석 데이터:</div>
              <pre className="text-xs text-gray-600 overflow-x-auto">
                {JSON.stringify(message.analysis.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisResponse; 