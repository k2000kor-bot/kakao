import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Mic,
  Bot,
  User,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Download,
  Eye,
  X,
  MoreVertical,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Settings,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url?: string;
  }>;
  projectContext?: {
    projectId: string;
    projectName: string;
    guidelines?: string[];
  };
  analysis?: {
    quality?: number;
    relevance?: number;
    completeness?: number;
    suggestions?: string[];
  };
  metadata?: {
    model?: string;
    tokens?: number;
    responseTime?: number;
  };
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string, attachments?: File[]) => void;
  onFileUpload?: (files: File[]) => void;
  onMessageFeedback?: (messageId: string, feedback: 'positive' | 'negative') => void;
  onMessageRegenerate?: (messageId: string) => void;
  onMessageCopy?: (messageId: string) => void;
  selectedProject?: {
    id: string;
    name: string;
    description: string;
    guidelines: Array<{
      id: string;
      title: string;
      content: string;
      isActive: boolean;
    }>;
  };
  isTyping?: boolean;
  isConnected?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  onFileUpload,
  onMessageFeedback,
  onMessageRegenerate,
  onMessageCopy,
  selectedProject,
  isTyping = false,
  isConnected = true
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showProjectContext, setShowProjectContext] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() && attachedFiles.length === 0) return;

    onSendMessage(inputMessage.trim(), attachedFiles);
    setInputMessage('');
    setAttachedFiles([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles(prev => [...prev, ...files]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileRemove = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4 text-blue-500" />;
    if (type.startsWith('video/')) return <Video className="h-4 w-4 text-purple-500" />;
    if (type.startsWith('audio/')) return <Music className="h-4 w-4 text-green-500" />;
    if (type.includes('zip') || type.includes('rar') || type.includes('tar')) {
      return <Archive className="h-4 w-4 text-orange-500" />;
    }
    return <FileText className="h-4 w-4 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActiveGuidelines = () => {
    return selectedProject?.guidelines.filter(g => g.isActive) || [];
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Bot className="h-6 w-6 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">AI 채팅</h2>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-500">
              {isConnected ? '연결됨' : '연결 끊김'}
            </span>
          </div>
        </div>

        {selectedProject && (
          <button
            onClick={() => setShowProjectContext(!showProjectContext)}
            className="flex items-center space-x-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            <span className="text-sm font-medium">{selectedProject.name}</span>
          </button>
        )}
      </div>

      {/* Project Context Panel */}
      <AnimatePresence>
        {showProjectContext && selectedProject && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-200 bg-purple-50"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-purple-900">프로젝트 컨텍스트</h3>
                <button
                  onClick={() => setShowProjectContext(false)}
                  className="text-purple-600 hover:text-purple-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-purple-800 mb-1">프로젝트 설명</h4>
                  <p className="text-sm text-purple-700">{selectedProject.description}</p>
                </div>

                {getActiveGuidelines().length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-purple-800 mb-2">활성 지침 ({getActiveGuidelines().length}개)</h4>
                    <div className="space-y-2">
                      {getActiveGuidelines().map((guideline, index) => (
                        <div key={guideline.id} className="bg-white p-2 rounded border border-purple-200">
                          <p className="text-xs font-medium text-purple-800">{guideline.title}</p>
                          <p className="text-xs text-purple-700 mt-1">{guideline.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                <div className={`flex items-start space-x-3 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.type === 'user' ? 'bg-purple-600' : 'bg-gray-600'
                    }`}>
                    {message.type === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>

                  <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                    <div className={`rounded-lg p-3 ${message.type === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                      }`}>
                      <div className="whitespace-pre-wrap">{message.content}</div>

                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.attachments.map((attachment) => (
                            <div key={attachment.id} className="flex items-center space-x-2 p-2 bg-white bg-opacity-20 rounded">
                              {getFileIcon(attachment.type)}
                              <span className="text-sm truncate">{attachment.name}</span>
                              <span className="text-xs opacity-75">({formatFileSize(attachment.size)})</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Message Metadata */}
                    <div className={`flex items-center space-x-2 mt-2 text-xs text-gray-500 ${message.type === 'user' ? 'justify-end' : 'justify-start'
                      }`}>
                      <span>{formatTime(message.timestamp)}</span>

                      {message.type === 'ai' && (
                        <>
                          {message.metadata?.responseTime && (
                            <span>• {message.metadata.responseTime}ms</span>
                          )}
                          {message.metadata?.tokens && (
                            <span>• {message.metadata.tokens} tokens</span>
                          )}
                        </>
                      )}
                    </div>

                    {/* AI Message Actions */}
                    {message.type === 'ai' && (
                      <div className="flex items-center space-x-1 mt-2 justify-start">
                        {onMessageFeedback && (
                          <>
                            <button
                              onClick={() => onMessageFeedback(message.id, 'positive')}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title="좋아요"
                            >
                              <ThumbsUp className="h-3 w-3 text-gray-500" />
                            </button>
                            <button
                              onClick={() => onMessageFeedback(message.id, 'negative')}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title="싫어요"
                            >
                              <ThumbsDown className="h-3 w-3 text-gray-500" />
                            </button>
                          </>
                        )}

                        {onMessageCopy && (
                          <button
                            onClick={() => onMessageCopy(message.id)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="복사"
                          >
                            <Copy className="h-3 w-3 text-gray-500" />
                          </button>
                        )}

                        {onMessageRegenerate && (
                          <button
                            onClick={() => onMessageRegenerate(message.id)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="재생성"
                          >
                            <RefreshCw className="h-3 w-3 text-gray-500" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        {/* Attached Files */}
        {attachedFiles.length > 0 && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">첨부된 파일</span>
              <button
                onClick={() => setAttachedFiles([])}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              {attachedFiles.map((file, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-white rounded border">
                  {getFileIcon(file.type)}
                  <span className="text-sm truncate flex-1">{file.name}</span>
                  <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                  <button
                    onClick={() => handleFileRemove(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요... (Shift + Enter로 줄바꿈)"
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />

            <div className="absolute right-2 bottom-2 flex items-center space-x-1">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                title="파일 첨부"
              >
                <Paperclip className="h-4 w-4" />
              </button>
              <button
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                title="음성 입력"
              >
                <Mic className="h-4 w-4" />
              </button>
            </div>
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() && attachedFiles.length === 0}
            className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        {/* Drag & Drop Area */}
        <div
          className={`mt-2 border-2 border-dashed rounded-lg p-4 text-center transition-colors ${isDragOver
            ? 'border-purple-500 bg-purple-50'
            : 'border-gray-300'
            }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <p className="text-sm text-gray-500">
            파일을 여기에 드래그 앤 드롭하여 첨부하세요
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
