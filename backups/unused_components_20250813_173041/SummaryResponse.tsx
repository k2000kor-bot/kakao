import React from 'react';
import { Message } from '../../types/chat';

interface SummaryResponseProps {
  message: Message;
}

const SummaryResponse: React.FC<SummaryResponseProps> = ({ message }) => {
  const getSummaryTypeIcon = () => {
    const type = message.summary?.type || 'brief';

    switch (type) {
      case 'brief':
        return (
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'detailed':
        return (
          <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case 'bullet_points':
        return (
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        );
      case 'timeline':
        return (
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  return (
    <div className="summary-response bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 card-corbu">
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          {getSummaryTypeIcon()}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-blue-900">
              요약
            </div>
            <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              {message.summary?.type === 'brief' ? '간단' :
                message.summary?.type === 'detailed' ? '상세' :
                  message.summary?.type === 'bullet_points' ? '핵심' : '타임라인'}
            </div>
          </div>

          <div className="text-sm text-gray-800 leading-relaxed mb-3">
            {message.content}
          </div>

          {message.summary?.keyPoints && message.summary.keyPoints.length > 0 && (
            <div className="mt-3">
              <div className="text-xs font-medium text-blue-700 mb-2">주요 포인트:</div>
              <ul className="space-y-1">
                {message.summary.keyPoints.map((point, index) => (
                  <li key={index} className="text-xs text-gray-700 flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {message.summary?.wordCount && (
            <div className="mt-3 text-xs text-gray-500">
              단어 수: {message.summary.wordCount}개
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryResponse; 