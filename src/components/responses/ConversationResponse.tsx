import React from 'react';
import { Message } from '../../types/chat';

interface ConversationResponseProps {
  message: Message;
}

const ConversationResponse: React.FC<ConversationResponseProps> = ({ message }) => {
  const getStyleClass = () => {
    const style = message.conversation?.style || 'casual';
    const tone = message.conversation?.tone || 'neutral';

    const styleClasses = {
      casual: 'bg-blue-50 border-blue-200',
      formal: 'bg-gray-50 border-gray-200',
      professional: 'bg-indigo-50 border-indigo-200',
      friendly: 'bg-green-50 border-green-200'
    };

    const toneClasses = {
      neutral: 'text-gray-800',
      positive: 'text-green-800',
      negative: 'text-red-800',
      empathetic: 'text-purple-800'
    };

    return `${styleClasses[style]} ${toneClasses[tone]}`;
  };

  return (
    <div className={`conversation-response p-4 rounded-lg border card-corbu ${getStyleClass()}`}>
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
            <span className="text-sm font-medium text-gray-700">AI 응답</span>
          </div>
          <div className="text-sm leading-relaxed">
            {message.content}
          </div>
          {message.aiResponse?.metadata && (
            <div className="mt-2 text-xs text-gray-500">
              <span>신뢰도: {message.aiResponse.metadata.confidence}%</span>
              {message.aiResponse.metadata.processingTime && (
                <span className="ml-2">처리시간: {message.aiResponse.metadata.processingTime}ms</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationResponse; 