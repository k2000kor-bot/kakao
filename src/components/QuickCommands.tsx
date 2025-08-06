import React, { useState } from 'react';

interface QuickCommand {
  id: string;
  name: string;
  description: string;
  command: string;
  icon: string;
  category: 'ai' | 'chat' | 'tools';
}

interface QuickCommandsProps {
  onCommandExecute: (command: string, type: string) => void;
}

const QuickCommands: React.FC<QuickCommandsProps> = ({ onCommandExecute }) => {
  const [showCommands, setShowCommands] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'ai' | 'chat' | 'tools'>('ai');

  const commands: QuickCommand[] = [
    // AI 명령어
    { id: 'ai-chat', name: 'AI 대화', description: '자연스러운 대화', command: '/ai', icon: '💬', category: 'ai' },
    { id: 'ai-summary', name: '내용 요약', description: '긴 내용을 간단히 요약', command: '/summary', icon: '📝', category: 'ai' },
    { id: 'ai-analyze', name: '데이터 분석', description: '텍스트 데이터 분석', command: '/analyze', icon: '📊', category: 'ai' },
    { id: 'ai-form', name: '폼 생성', description: '인터랙티브 폼 생성', command: '/form', icon: '📋', category: 'ai' },
    { id: 'ai-chart', name: '차트 생성', description: '데이터 시각화 차트', command: '/chart', icon: '📈', category: 'ai' },
    { id: 'ai-table', name: '테이블 생성', description: '정렬 가능한 테이블', command: '/table', icon: '📋', category: 'ai' },
    { id: 'ai-list', name: '목록 생성', description: '체크리스트 및 목록', command: '/list', icon: '✅', category: 'ai' },
    { id: 'ai-code', name: '코드 생성', description: '프로그래밍 코드 생성', command: '/code', icon: '💻', category: 'ai' },
    { id: 'ai-image', name: '이미지 생성', description: 'AI 이미지 생성', command: '/image', icon: '🎨', category: 'ai' },
    
    // 채팅 명령어
    { id: 'chat-search', name: '메시지 검색', description: '채팅 내역 검색', command: '/search', icon: '🔍', category: 'chat' },
    { id: 'chat-clear', name: '채팅 지우기', description: '채팅 기록 삭제', command: '/clear', icon: '🗑️', category: 'chat' },
    { id: 'chat-export', name: '내보내기', description: '대화 내용 내보내기', command: '/export', icon: '📤', category: 'chat' },
    { id: 'chat-stats', name: '통계 보기', description: '채팅 통계 확인', command: '/stats', icon: '📊', category: 'chat' },
    
    // 도구 명령어
    { id: 'tools-voice', name: '음성 메시지', description: '음성 녹음 및 전송', command: '/voice', icon: '🎤', category: 'tools' },
    { id: 'tools-file', name: '파일 업로드', description: '이미지 및 문서 업로드', command: '/file', icon: '📎', category: 'tools' },
    { id: 'tools-emoji', name: '이모지 선택', description: '이모지 팔레트 열기', command: '/emoji', icon: '😊', category: 'tools' },
    { id: 'tools-help', name: '도움말', description: '명령어 도움말 보기', command: '/help', icon: '❓', category: 'tools' }
  ];

  const filteredCommands = commands.filter(cmd => cmd.category === selectedCategory);

  const handleCommandClick = (command: QuickCommand) => {
    onCommandExecute(command.command, command.id);
    setShowCommands(false);
  };

  const categories = [
    { id: 'ai', name: 'AI 기능', icon: '🤖' },
    { id: 'chat', name: '채팅', icon: '💬' },
    { id: 'tools', name: '도구', icon: '🛠️' }
  ];

  return (
    <div className="w-full">
      {/* 빠른 명령어 버튼 */}
      <button
        onClick={() => setShowCommands(!showCommands)}
        className="w-full p-3 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center"
        aria-label="빠른 명령어"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        <span className="text-sm font-medium">빠른 명령어</span>
      </button>

      {/* 명령어 패널 */}
      {showCommands && (
        <div className="absolute bottom-full left-0 mb-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">빠른 명령어</h3>
              <button
                onClick={() => setShowCommands(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>

          {/* 카테고리 탭 */}
          <div className="flex border-b border-gray-200">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id as any)}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>

          {/* 명령어 목록 */}
          <div className="max-h-96 overflow-y-auto">
            <div className="p-2">
              {filteredCommands.map((command) => (
                <button
                  key={command.id}
                  onClick={() => handleCommandClick(command)}
                  className="w-full p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{command.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {command.name}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">
                        {command.description}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">
                      {command.command}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 도움말 */}
          <div className="p-3 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              명령어를 클릭하면 자동으로 실행됩니다. 채팅창에서 직접 입력할 수도 있습니다.
            </p>
          </div>
        </div>
      )}

      {/* 배경 오버레이 */}
      {showCommands && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowCommands(false)}
        />
      )}
    </div>
  );
};

export default QuickCommands; 