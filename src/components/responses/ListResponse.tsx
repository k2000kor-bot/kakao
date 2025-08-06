import React from 'react';
import { Message } from '../../types/chat';

interface ListResponseProps {
  message: Message;
}

const ListResponse: React.FC<ListResponseProps> = ({ message }) => {
  const getListTypeIcon = () => {
    const type = message.list?.type || 'unordered';

    switch (type) {
      case 'ordered':
        return (
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        );
      case 'unordered':
        return (
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        );
      case 'checklist':
        return (
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      case 'timeline':
        return (
          <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        );
    }
  };

  const getListTypeLabel = () => {
    const type = message.list?.type || 'unordered';

    switch (type) {
      case 'ordered': return '순서 목록';
      case 'unordered': return '목록';
      case 'checklist': return '체크리스트';
      case 'timeline': return '타임라인';
      default: return '목록';
    }
  };

  const renderListItem = (item: string, index: number) => {
    const type = message.list?.type || 'unordered';
    const style = message.list?.style || 'compact';

    switch (type) {
      case 'ordered':
        return (
          <li key={index} className={`flex items-start space-x-2 ${style === 'detailed' ? 'py-2' : 'py-1'
            }`}>
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
              {index + 1}
            </span>
            <span className={`text-gray-700 ${style === 'detailed' ? 'text-sm' : 'text-sm'}`}>
              {item}
            </span>
          </li>
        );

      case 'unordered':
        return (
          <li key={index} className={`flex items-start space-x-2 ${style === 'detailed' ? 'py-2' : 'py-1'
            }`}>
            <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></span>
            <span className={`text-gray-700 ${style === 'detailed' ? 'text-sm' : 'text-sm'}`}>
              {item}
            </span>
          </li>
        );

      case 'checklist':
        return (
          <li key={index} className={`flex items-start space-x-2 ${style === 'detailed' ? 'py-2' : 'py-1'
            }`}>
            <div className="flex-shrink-0 w-5 h-5 border-2 border-purple-300 rounded flex items-center justify-center">
              <svg className="w-3 h-3 text-purple-600 hidden" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className={`text-gray-700 ${style === 'detailed' ? 'text-sm' : 'text-sm'}`}>
              {item}
            </span>
          </li>
        );

      case 'timeline':
        return (
          <li key={index} className={`flex items-start space-x-3 ${style === 'detailed' ? 'py-3' : 'py-2'
            }`}>
            <div className="flex-shrink-0">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              {index < (message.list?.items?.length || 0) - 1 && (
                <div className="w-0.5 h-8 bg-orange-200 mx-auto mt-1"></div>
              )}
            </div>
            <div className="flex-1">
              <span className={`text-gray-700 ${style === 'detailed' ? 'text-sm' : 'text-sm'}`}>
                {item}
              </span>
            </div>
          </li>
        );

      default:
        return (
          <li key={index} className={`flex items-start space-x-2 ${style === 'detailed' ? 'py-2' : 'py-1'
            }`}>
            <span className="flex-shrink-0 w-2 h-2 bg-gray-500 rounded-full mt-2"></span>
            <span className={`text-gray-700 ${style === 'detailed' ? 'text-sm' : 'text-sm'}`}>
              {item}
            </span>
          </li>
        );
    }
  };

  if (!message.list?.items || message.list.items.length === 0) {
    return (
      <div className="list-response bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200 card-corbu">
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <p className="text-sm">목록 데이터가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="list-response bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200 card-corbu">
      <div className="flex items-start space-x-3 mb-4">
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
          {getListTypeIcon()}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-gray-900">
              {getListTypeLabel()}
            </div>
            <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
              {message.list.items.length}개 항목
            </div>
          </div>

          <div className="text-sm text-gray-700 mb-3">
            {message.content}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 border">
        <ul className="space-y-1">
          {message.list.items.map(renderListItem)}
        </ul>
      </div>
    </div>
  );
};

export default ListResponse; 