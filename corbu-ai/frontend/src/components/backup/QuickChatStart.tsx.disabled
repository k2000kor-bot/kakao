import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, Sparkles } from 'lucide-react';
import { Chat } from '../types/project';
import { chatService, messageService } from '../services/projectService';

interface QuickChatStartProps {
  projectId: string;
  projectGuidelines?: string;
  onChatCreated: (chat: Chat) => void;
}

const QuickChatStart: React.FC<QuickChatStartProps> = ({
  projectId,
  projectGuidelines,
  onChatCreated
}) => {
  const [message, setMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const generateChatTitle = (firstMessage: string): string => {
    // 첫 메시지를 기반으로 채팅 제목 생성
    const cleanMessage = firstMessage.trim();
    
    // 질문 패턴 감지
    if (cleanMessage.includes('?') || cleanMessage.includes('어떻게') || cleanMessage.includes('무엇')) {
      const keywords = extractKeywords(cleanMessage);
      return keywords.length > 0 ? `${keywords[0]} 관련 질문` : '질문 채팅';
    }
    
    // 작업 패턴 감지
    if (cleanMessage.includes('만들어') || cleanMessage.includes('생성') || cleanMessage.includes('작성')) {
      const keywords = extractKeywords(cleanMessage);
      return keywords.length > 0 ? `${keywords[0]} 작업` : '작업 채팅';
    }
    
    // 분석 패턴 감지
    if (cleanMessage.includes('분석') || cleanMessage.includes('검토') || cleanMessage.includes('확인')) {
      const keywords = extractKeywords(cleanMessage);
      return keywords.length > 0 ? `${keywords[0]} 분석` : '분석 채팅';
    }
    
    // 기본적으로 첫 30자 사용
    return cleanMessage.length > 30 ? cleanMessage.substring(0, 30) + '...' : cleanMessage;
  };

  const extractKeywords = (text: string): string[] => {
    // 간단한 키워드 추출 로직
    const commonWords = ['을', '를', '이', '가', '에', '에서', '으로', '로', '와', '과', '의', '은', '는', '어떻게', '무엇', '왜', '언제', '어디서'];
    const words = text.split(/\s+/).filter(word => 
      word.length > 1 && !commonWords.includes(word) && !/[?!.,]/.test(word)
    );
    return words.slice(0, 2); // 최대 2개 키워드
  };

  const generateAIResponse = async (userMessage: string, guidelines?: string): Promise<string> => {
    // AI 응답 생성 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const responses = [
      `안녕하세요! "${userMessage}"에 대해 도움을 드리겠습니다.`,
      `좋은 질문이네요! "${userMessage}"에 대해 자세히 설명해드리겠습니다.`,
      `"${userMessage}"에 대한 답변을 준비했습니다.`,
      `프로젝트 컨텍스트를 고려하여 "${userMessage}"에 답변드리겠습니다.`,
      `"${userMessage}"에 대해 단계별로 설명해드리겠습니다.`
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    if (guidelines) {
      return `${randomResponse}\n\n📋 프로젝트 지침을 참고했습니다:\n${guidelines.substring(0, 200)}${guidelines.length > 200 ? '...' : ''}`;
    }

    return randomResponse;
  };

  const handleStartChat = async () => {
    if (!message.trim() || isCreating) return;

    setIsCreating(true);

    try {
      // 채팅 제목 생성
      const chatTitle = generateChatTitle(message);
      
      // 새 채팅 생성
      const newChat = chatService.createChat(projectId, chatTitle);
      
      // 사용자 메시지 추가
      const userMsg = messageService.addMessage(newChat.id, message.trim(), 'user');
      
      // AI 응답 생성
      const aiResponse = await generateAIResponse(message.trim(), projectGuidelines);
      
      // AI 메시지 추가
      const aiMsg = messageService.addMessage(newChat.id, aiResponse, 'assistant', {
        responseTime: Date.now() - userMsg.timestamp.getTime(),
        model: 'CORBU AI'
      });

      // 채팅 업데이트
      const updatedChat = chatService.getChat(newChat.id);
      if (updatedChat) {
        updatedChat.messages = [userMsg, aiMsg];
        chatService.updateChat(newChat.id, { messages: updatedChat.messages });
      }

      // 입력 초기화
      setMessage('');
      
      // 생성된 채팅으로 이동
      onChatCreated(updatedChat || newChat);

    } catch (error) {
      console.error('채팅 생성 실패:', error);
      alert('채팅 생성에 실패했습니다.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleStartChat();
    }
  };

  const suggestedQuestions = [
    '이 프로젝트의 목표는 무엇인가요?',
    '어떤 작업부터 시작해야 할까요?',
    '프로젝트 진행 상황을 확인하고 싶어요',
    '관련 자료를 정리해주세요'
  ];

  return (
    <div className="space-y-4">
      {/* Input Area */}
      <div className="flex items-end space-x-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="프로젝트에 대해 질문하거나 작업을 시작해보세요..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows={1}
            style={{
              minHeight: '48px',
              maxHeight: '120px'
            }}
          />
          <div className="absolute top-3 right-3">
            <Sparkles className="h-4 w-4 text-gray-400" />
          </div>
        </div>
        <button
          onClick={handleStartChat}
          disabled={!message.trim() || isCreating}
          className="flex-shrink-0 p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isCreating ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Bot className="h-5 w-5" />
            </motion.div>
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Suggested Questions */}
      <div>
        <p className="text-sm text-gray-600 mb-2">추천 질문:</p>
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => setMessage(question)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      {isCreating && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 text-sm text-gray-600"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Bot className="h-4 w-4 text-purple-600" />
          </motion.div>
          <span>새 채팅을 생성하고 있습니다...</span>
        </motion.div>
      )}
    </div>
  );
};

export default QuickChatStart;
