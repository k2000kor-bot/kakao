import React, { useState, useEffect } from 'react';

interface RealTimeChatProps {
  selectedRoomId: string;
  realTimeMode: boolean;
}

const RealTimeChat: React.FC<RealTimeChatProps> = ({ selectedRoomId, realTimeMode }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // WebSocket 연결 시뮬레이션
    setIsConnected(true);
    
    // 샘플 메시지 데이터
    const sampleMessages = [
      { id: 1, sender: '0116', content: '안녕하세요! 오늘도 좋은 하루 되세요.', timestamp: '2025-07-14 15:30' },
      { id: 2, sender: '0024', content: '네, 감사합니다. 오늘 회의 준비는 다 되셨나요?', timestamp: '2025-07-14 15:32' },
      { id: 3, sender: '0036', content: '회의 자료는 이미 업로드해두었습니다.', timestamp: '2025-07-14 15:35' }
    ];
    
    setMessages(sampleMessages);
  }, [selectedRoomId]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        sender: '나',
        content: newMessage,
        timestamp: new Date().toLocaleString()
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  return (
    <div className="h-96 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">실시간 채팅</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">
            {isConnected ? '연결됨' : '연결 안됨'}
          </span>
          {realTimeMode && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              실시간 모드
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 bg-gray-50 rounded-lg p-4 overflow-y-auto">
        <div className="space-y-3">
          {messages.map((message) => (
            <div key={message.id} className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {message.sender}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">{message.sender}</span>
                  <span className="text-xs text-gray-500">{message.timestamp}</span>
                </div>
                <p className="text-sm text-gray-700 mt-1">{message.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="메시지를 입력하세요..."
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSendMessage}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          전송
        </button>
      </div>
    </div>
  );
};

export default RealTimeChat; 