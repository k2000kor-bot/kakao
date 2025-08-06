import React, { useState } from 'react';
import { Message } from '../../types/chat';

interface ImageResponseProps {
  message: Message;
}

const ImageResponse: React.FC<ImageResponseProps> = ({ message }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  const handleDownload = async () => {
    if (!message.generatedImage?.url) return;

    try {
      const response = await fetch(message.generatedImage.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('이미지 다운로드 실패:', error);
    }
  };

  const getImageTypeIcon = () => {
    const style = message.generatedImage?.style || 'realistic';

    switch (style.toLowerCase()) {
      case 'realistic':
        return (
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'artistic':
        return (
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
          </svg>
        );
      case 'cartoon':
        return (
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'abstract':
        return (
          <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  const getImageStyleLabel = () => {
    const style = message.generatedImage?.style || 'realistic';

    switch (style.toLowerCase()) {
      case 'realistic': return '사실적';
      case 'artistic': return '예술적';
      case 'cartoon': return '만화';
      case 'abstract': return '추상적';
      default: return style;
    }
  };

  if (!message.generatedImage?.url) {
    return (
      <div className="image-response bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200 card-corbu">
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">이미지 데이터가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="image-response bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200 card-corbu">
      <div className="flex items-start space-x-3 mb-4">
        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
          {getImageTypeIcon()}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-purple-900">
              생성된 이미지
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                {getImageStyleLabel()}
              </div>
              {message.generatedImage.size && (
                <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                  {message.generatedImage.size}
                </div>
              )}
            </div>
          </div>

          <div className="text-sm text-gray-700 mb-3">
            {message.content}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 border">
        <div className="relative">
          {!imageLoaded && !imageError && (
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          )}

          {imageError && (
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-sm text-gray-500">이미지를 로드할 수 없습니다.</p>
              </div>
            </div>
          )}

          <img
            src={message.generatedImage.url}
            alt={message.generatedImage.prompt || 'AI 생성 이미지'}
            className={`w-full h-auto rounded-lg transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ display: imageLoaded ? 'block' : 'none' }}
          />
        </div>

        {message.generatedImage.prompt && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="text-xs font-medium text-gray-700 mb-1">프롬프트:</div>
            <p className="text-sm text-gray-600">{message.generatedImage.prompt}</p>
          </div>
        )}

        <div className="mt-3 flex justify-end space-x-2">
          <button
            onClick={handleDownload}
            className="flex items-center space-x-1 px-3 py-2 text-sm text-purple-600 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>다운로드</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageResponse; 