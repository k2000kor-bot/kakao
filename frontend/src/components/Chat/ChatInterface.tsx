import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Bot,
  User,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  X,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  coerceTrimmedString,
  ASSISTANT_PLACEHOLDER_DRAFT,
  ASSISTANT_GENSPARK_QA_BADGE_QUESTION,
  ASSISTANT_GENSPARK_QA_BADGE_ANSWER,
} from '../../utils/chatInputUtils';
import { AssistantGensparkBody } from '../genspark/AssistantGensparkBody';

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

export interface ChatInterfaceProps {
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
  onFileUpload: _onFileUpload,
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
    const trimmed = coerceTrimmedString(inputMessage, '');
    if (!trimmed && attachedFiles.length === 0) return;

    onSendMessage(trimmed, attachedFiles);
    setInputMessage('');
    setAttachedFiles([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
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
    if (type.startsWith('image/')) return <Image className="h-4 w-4 bw-text-info" />;
    if (type.startsWith('video/')) return <Video className="h-4 w-4 bw-text-info" />;
    if (type.startsWith('audio/')) return <Music className="h-4 w-4 bw-text-success" />;
    if (type.includes('zip') || type.includes('rar') || type.includes('tar')) {
      return <Archive className="h-4 w-4 bw-text-warning" />;
    }
    return <FileText className="h-4 w-4 bw-text-muted" />;
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
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Bot className="h-6 w-6 bw-text-info" />
            <h2 className="text-lg font-semibold bw-text-primary">AI 대화</h2>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full" style={{ background: isConnected ? 'var(--accent-success)' : 'var(--accent-error)' }} />
            <span className="text-sm bw-text-muted">
              {isConnected ? '연결됨' : '연결 끊김'}
            </span>
          </div>
        </div>

        {selectedProject && (
          <button
            type="button"
            onClick={() => setShowProjectContext(!showProjectContext)}
            className="bw-btn-secondary flex items-center space-x-2 px-3 py-1 rounded-lg"
            aria-label={showProjectContext ? '프로젝트 컨텍스트 숨기기' : '프로젝트 컨텍스트 보기'}
            aria-expanded={showProjectContext}
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
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
            className="border-b bw-card-secondary"
            style={{ borderColor: 'var(--border-color)', background: 'var(--accent-info-muted)' }}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium bw-text-primary">프로젝트 컨텍스트</h3>
                <button type="button" onClick={() => setShowProjectContext(false)} className="bw-btn-ghost" aria-label="프로젝트 컨텍스트 패널 닫기">
                  <X className="h-4 w-4 bw-text-muted" aria-hidden="true" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium bw-text-primary mb-1">프로젝트 설명</h4>
                  <p className="text-sm bw-text-secondary">{selectedProject.description}</p>
                </div>

                {getActiveGuidelines().length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium bw-text-primary mb-2">활성 지침 ({getActiveGuidelines().length}개)</h4>
                    <div className="space-y-2">
                      {getActiveGuidelines().map((guideline, _index) => (
                        <div key={guideline.id} className="bw-card p-2 rounded border" style={{ borderColor: 'var(--accent-info-border)' }}>
                          <p className="text-xs font-medium bw-text-primary">{guideline.title}</p>
                          <p className="text-xs bw-text-secondary mt-1">{guideline.content}</p>
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
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white"
                    style={{ background: message.type === 'user' ? 'var(--accent-info)' : 'var(--text-tertiary)' }}
                  >
                    {message.type === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>

                  <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                    <div
                      className={`rounded-lg p-3 ${message.type === 'ai' ? 'bw-card-secondary bw-text-primary' : ''}`}
                      style={message.type === 'user' ? { background: 'var(--accent-info)', color: 'white' } : undefined}
                    >
                      {message.type === 'ai' ? (
                        <>
                          <div
                            className="genspark-qa-role-row"
                            style={{
                              display: 'flex',
                              width: '100%',
                              justifyContent: 'flex-start',
                              marginBottom: 6,
                            }}
                          >
                            <span className="genspark-qa-badge genspark-qa-badge--answer">{ASSISTANT_GENSPARK_QA_BADGE_ANSWER}</span>
                          </div>
                          <AssistantGensparkBody
                            text={message.content}
                            embedded
                            enhancedCodeBlocks
                            documentContext={
                              !!(
                                selectedProject &&
                                selectedProject.guidelines?.some(
                                  (g) => g.isActive && coerceTrimmedString(g.content, ''),
                                )
                              )
                            }
                          />
                        </>
                      ) : (
                        <>
                          <div
                            className="genspark-qa-role-row"
                            style={{
                              display: 'flex',
                              width: '100%',
                              justifyContent: 'flex-end',
                              marginBottom: 6,
                            }}
                          >
                            <span className="genspark-qa-badge genspark-qa-badge--question">{ASSISTANT_GENSPARK_QA_BADGE_QUESTION}</span>
                          </div>
                          <div className="whitespace-pre-wrap break-words text-left">{message.content}</div>
                        </>
                      )}

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
                    <div className={`flex items-center space-x-2 mt-2 text-xs bw-text-muted ${message.type === 'user' ? 'justify-end' : 'justify-start'
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
                            <button type="button" onClick={() => onMessageFeedback(message.id, 'positive')} className="bw-btn-ghost p-1 rounded" title="좋아요" aria-label="응답에 좋아요">
                              <ThumbsUp className="h-3 w-3 bw-text-muted" aria-hidden="true" />
                            </button>
                            <button type="button" onClick={() => onMessageFeedback(message.id, 'negative')} className="bw-btn-ghost p-1 rounded" title="싫어요" aria-label="응답에 싫어요">
                              <ThumbsDown className="h-3 w-3 bw-text-muted" aria-hidden="true" />
                            </button>
                          </>
                        )}

                        {onMessageCopy && (
                          <button type="button" onClick={() => onMessageCopy(message.id)} className="bw-btn-ghost p-1 rounded" title="복사" aria-label="응답 복사">
                            <Copy className="h-3 w-3 bw-text-muted" aria-hidden="true" />
                          </button>
                        )}

                        {onMessageRegenerate && (
                          <button type="button" onClick={() => onMessageRegenerate(message.id)} className="bw-btn-ghost p-1 rounded" title="재생성" aria-label="응답 재생성">
                            <RefreshCw className="h-3 w-3 bw-text-muted" aria-hidden="true" />
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

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
            aria-live="polite"
            aria-busy="true"
            aria-label={ASSISTANT_PLACEHOLDER_DRAFT}
          >
            <div className="flex items-start space-x-3 flex-1 min-w-0">
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white"
                style={{ background: 'var(--text-tertiary)' }}
              >
                <Bot className="h-4 w-4" aria-hidden />
              </div>
              <div className="bw-card-secondary rounded-lg p-3 flex-1 min-w-0 text-left">
                <div
                  className="genspark-qa-role-row"
                  style={{
                    display: 'flex',
                    width: '100%',
                    justifyContent: 'flex-start',
                    marginBottom: 6,
                  }}
                >
                  <span className="genspark-qa-badge genspark-qa-badge--answer">{ASSISTANT_GENSPARK_QA_BADGE_ANSWER}</span>
                </div>
                <AssistantGensparkBody
                  text=""
                  embedded
                  enhancedCodeBlocks
                  documentContext={
                    !!(
                      selectedProject &&
                      selectedProject.guidelines?.some((g) => g.isActive && coerceTrimmedString(g.content, ''))
                    )
                  }
                />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4" style={{ borderColor: 'var(--border-color)' }}>
        {attachedFiles.length > 0 && (
          <div className="mb-3 p-3 bw-card-secondary rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium bw-text-primary">첨부된 파일</span>
              <button type="button" onClick={() => setAttachedFiles([])} className="bw-btn-ghost" aria-label="모든 첨부 파일 제거">
                <X className="h-4 w-4 bw-text-muted" aria-hidden="true" />
              </button>
            </div>
            <div className="space-y-2">
              {attachedFiles.map((file, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bw-card rounded border border-[var(--border-color)]">
                  {getFileIcon(file.type)}
                  <span className="text-sm truncate flex-1 bw-text-primary">{file.name}</span>
                  <span className="text-xs bw-text-muted">({formatFileSize(file.size)})</span>
                  <button type="button" onClick={() => handleFileRemove(index)} className="bw-btn-ghost bw-text-error" aria-label={`${file.name} 첨부 파일 제거`}>
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요... (Shift + Enter로 줄바꿈)"
              className="bw-input w-full px-4 py-3 pr-12 rounded-lg resize-none"
              aria-label="메시지 입력"
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
                aria-label="파일 선택"
              />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="bw-btn-ghost p-1" title="파일 첨부" aria-label="파일 첨부">
                <Paperclip className="h-4 w-4 bw-text-muted" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleSendMessage()}
            disabled={!coerceTrimmedString(inputMessage, '') && attachedFiles.length === 0}
            className="bw-btn-primary px-4 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="메시지 전송"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        <div
          className={`mt-2 border-2 border-dashed rounded-lg p-4 text-center transition-colors ${isDragOver ? 'bw-card-secondary' : ''}`}
          style={{ borderColor: isDragOver ? 'var(--accent-info)' : 'var(--border-color)' }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <p className="text-sm bw-text-muted">
            파일을 여기에 드래그 앤 드롭하여 첨부하세요
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
