import React, { useState, useEffect } from 'react';
import { Message } from '../types/chat';
import DeepLearningAnalyzer from './DeepLearningAnalyzer';
import AIResponseGenerator from './AIResponseGenerator';

interface ChatRoomManagerProps {
  chatRoomId: string;
  messages: Message[];
  selectedMessage?: Message;
  onMessageSelect?: (message: Message) => void;
}

const ChatRoomManager: React.FC<ChatRoomManagerProps> = ({
  messages,
  selectedMessage
}) => {
  const [filteredMessages, setFilteredMessages] = useState<Message[]>(messages);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('default');
  const [authorCharacteristic, setAuthorCharacteristic] = useState<string>('');
  const [audiencePreference, setAudiencePreference] = useState<string>('');
  const [desiredContent, setDesiredContent] = useState<string>('');

  useEffect(() => {
    setFilteredMessages(messages);
  }, [messages]);

  return (
    <div className="flex flex-col space-y-4">
      {/* 딥러닝 분석 */}
      <div className="flex-1">
        <DeepLearningAnalyzer
          messages={filteredMessages}
          selectedMessage={selectedMessage}
        />
      </div>

      {/* AI 응답 생성 */}
      <div className="flex-1">
        <AIResponseGenerator
          messages={filteredMessages}
          selectedStrategy={selectedStrategy}
          authorCharacteristic={authorCharacteristic}
          audiencePreference={audiencePreference}
          desiredContent={desiredContent}
          selectedMessage={selectedMessage}
        />
      </div>
    </div>
  );
};

export default ChatRoomManager;
