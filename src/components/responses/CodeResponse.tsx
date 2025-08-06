import React, { useState } from 'react';
import { Message } from '../../types/chat';

interface CodeResponseProps {
  message: Message;
}

const CodeResponse: React.FC<CodeResponseProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.code?.code || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('코드 복사 실패:', error);
    }
  };

  const getLanguageIcon = () => {
    const language = message.code?.language || 'text';

    switch (language.toLowerCase()) {
      case 'javascript':
      case 'js':
        return (
          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path d="M12 14l3.2-3.2h-2.4V6h-1.6v4.8H8.8L12 14zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5h2.7l2.3 2.3L14.3 12H17l-5 5z" />
          </svg>
        );
      case 'typescript':
      case 'ts':
        return (
          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 011.299.34v2.458a3.95 3.95 0 00-.643-.361 5.093 5.093 0 00-.717-.26 5.453 5.453 0 00-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 00-.623.242c-.17.104-.3.229-.393.374a.888.888 0 00-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 01-1.012 1.085 4.38 4.38 0 01-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 01-1.84-.164 5.544 5.544 0 01-1.512-.493v-2.63a5.033 5.033 0 00.82.268 4.696 4.696 0 001.659.31c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 00.123-.534c0-.287-.092-.532-.277-.738-.185-.205-.456-.395-.813-.57-.359-.174-.782-.335-1.272-.482-.566-.174-1.056-.387-1.472-.64-.416-.252-.77-.544-1.06-.876-.29-.332-.508-.712-.653-1.14-.144-.43-.216-.92-.216-1.47 0-.598.123-1.07.369-1.42.246-.35.58-.638 1.004-.865.424-.227.91-.4 1.46-.52.55-.12 1.13-.18 1.75-.18.479 0 .94.05 1.386.15.445.1.868.242 1.27.428.401.185.762.41 1.082.676.32.265.598.57.834.914.236.344.42.728.553 1.152.133.424.2.884.2 1.38 0 .333-.03.644-.09.933-.06.29-.15.56-.27.81-.12.25-.26.48-.42.69-.16.21-.34.4-.54.57-.2.17-.42.32-.66.45.246.196.456.415.63.656.174.242.31.51.41.804.1.295.15.62.15.976 0 .539-.092 1.006-.277 1.4-.185.395-.456.72-.813.975-.357.255-.787.45-1.29.585-.503.135-1.063.202-1.68.202-.535 0-1.04-.06-1.515-.18-.475-.12-.91-.29-1.305-.51-.395-.22-.735-.49-1.02-.81-.285-.32-.51-.69-.675-1.11-.165-.42-.248-.88-.248-1.38 0-.287.03-.565.09-.834.06-.27.15-.52.27-.75.12-.23.26-.44.42-.63.16-.19.34-.36.54-.51.2-.15.42-.28.66-.39.246-.11.51-.2.795-.27.285-.07.59-.105.915-.105.285 0 .54.025.765.075.225.05.42.12.585.21.165.09.3.195.405.315.105.12.18.255.225.405.045.15.068.315.068.495 0 .196-.025.373-.075.53-.05.158-.125.3-.225.428-.1.128-.22.24-.36.336-.14.096-.3.18-.48.252-.18.072-.38.132-.6.18-.22.048-.46.084-.72.108-.26.024-.54.036-.84.036-.3 0-.58-.012-.84-.036-.26-.024-.5-.06-.72-.108-.2-.048-.4-.108-.6-.18-.18-.072-.34-.156-.48-.252-.14-.096-.26-.208-.36-.336-.1-.128-.175-.27-.225-.428-.05-.157-.075-.334-.075-.53 0-.18.023-.345.068-.495.045-.15.12-.285.225-.405.105-.12.24-.225.405-.315.165-.09.36-.16.585-.21.225-.05.48-.075.765-.075.325 0 .63.035.915.105.285.07.55.16.795.27.24.11.46.24.66.39.2.15.38.32.54.51.16.19.3.4.42.63.12.23.21.48.27.75.06.27.09.547.09.834 0 .5-.083.96-.248 1.38-.165.42-.39.79-.675 1.11-.285.32-.625.59-1.02.81-.395.22-.83.39-1.305.51-.475.12-.98.18-1.515.18-.617 0-1.177-.067-1.68-.202-.503-.135-.933-.33-1.29-.585-.357-.255-.628-.58-.813-.975-.185-.394-.277-.861-.277-1.4 0-.356.05-.681.15-.976.1-.295.236-.562.41-.804.174-.241.384-.46.63-.656-.24-.13-.46-.28-.66-.45-.2-.17-.38-.36-.54-.57-.16-.21-.3-.44-.42-.69-.12-.25-.21-.52-.27-.81-.06-.29-.09-.6-.09-.933 0-.496.067-.956.2-1.38.133-.424.317-.808.553-1.152.236-.344.514-.65.834-.914.32-.266.681-.491 1.082-.676.402-.186.825-.328 1.27-.428.446-.1.907-.15 1.386-.15.62 0 1.2.06 1.75.18.55.12 1.036.293 1.46.52.424.227.758.515 1.004.865.246.35.369.822.369 1.42 0 .55-.072 1.04-.216 1.47-.144.428-.363.808-.653 1.14-.29.332-.644.624-1.06.876-.416.253-.906.466-1.472.64-.49.147-.913.308-1.272.482-.357.175-.628.365-.813.57-.185.206-.277.451-.277.738 0 .3.041.566.123.534.083-.146.207-.272.373-.38.167-.106.374-.19.623-.25.248-.06.539-.09.872-.09.666 0 1.326.104 1.659.31.333.206.487.268.82.268z" />
          </svg>
        );
      case 'python':
      case 'py':
        return (
          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm0 2c5.514 0 10 4.486 10 10s-4.486 10-10 10S2 17.514 2 12 6.486 2 12 2zm-1 4v8h2V6h-2zm0 10v2h2v-2h-2z" />
          </svg>
        );
      case 'html':
        return (
          <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h5.369l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.544L12 19.351l5.379-1.443L18.691 4.41H9.531z" />
          </svg>
        );
      case 'css':
        return (
          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h5.369l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.544L12 19.351l5.379-1.443L18.691 4.41H9.531z" />
          </svg>
        );
      case 'json':
        return (
          <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm0 2c5.514 0 10 4.486 10 10s-4.486 10-10 10S2 17.514 2 12 6.486 2 12 2zm-1 4v8h2V6h-2zm0 10v2h2v-2h-2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        );
    }
  };

  const getLanguageLabel = () => {
    const language = message.code?.language || 'text';

    switch (language.toLowerCase()) {
      case 'javascript':
      case 'js': return 'JavaScript';
      case 'typescript':
      case 'ts': return 'TypeScript';
      case 'python':
      case 'py': return 'Python';
      case 'html': return 'HTML';
      case 'css': return 'CSS';
      case 'json': return 'JSON';
      default: return language;
    }
  };

  if (!message.code?.code) {
    return (
      <div className="code-response bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200 card-corbu">
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <p className="text-sm">코드 데이터가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="code-response bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200 card-corbu">
      <div className="flex items-start space-x-3 mb-4">
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
          {getLanguageIcon()}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-gray-900">
              코드
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                {getLanguageLabel()}
              </div>
              {message.code.executable && (
                <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  실행 가능
                </div>
              )}
            </div>
          </div>

          <div className="text-sm text-gray-700 mb-3">
            {message.content}
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">{getLanguageLabel()}</span>
            {message.code.syntaxHighlight && (
              <span className="text-xs text-green-400 bg-green-900 px-2 py-0.5 rounded">
                구문 강조
              </span>
            )}
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 text-xs text-gray-400 hover:text-gray-200 transition-colors"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>복사됨</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>복사</span>
              </>
            )}
          </button>
        </div>
        <div className="p-4">
          <pre className="text-sm text-gray-100 overflow-x-auto">
            <code>{message.code.code}</code>
          </pre>
        </div>
      </div>

      {message.code.executable && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-blue-900">실행 가능한 코드</span>
          </div>
          <p className="text-xs text-blue-700">
            이 코드는 실행할 수 있습니다. 실행 버튼을 클릭하여 결과를 확인하세요.
          </p>
        </div>
      )}
    </div>
  );
};

export default CodeResponse; 