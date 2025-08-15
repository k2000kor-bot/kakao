import React, { useState, useRef, useEffect, useCallback } from 'react';
import AdvancedFileUploadWithLearning from './AdvancedFileUploadWithLearning';
import { advancedMessageAPI } from '../services/advancedMessageAPI';

interface UniversalChatInputProps {
  onSendMessage: (message: string, type?: 'text' | 'file' | 'voice') => void;
  onFileUpload?: (files: File[]) => void;
  onVoiceInput?: () => void;
  onToolClick?: () => void;
  onMediaUpload?: (files: File[]) => void;
  onAutoLearning?: (fileData: any) => void;
  onTyping?: () => void;
  placeholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  showFileUpload?: boolean;
  showVoiceInput?: boolean;
  showToolButton?: boolean;
  showMediaUpload?: boolean;
  autoFocus?: boolean;
  maxHeight?: number;
  minHeight?: number;
  theme?: 'default' | 'dark' | 'minimal';
  size?: 'small' | 'medium' | 'large';
  projectId?: string;
  chatId?: string;
  roomId?: string;
}

interface Suggestion {
  id: string;
  text: string;
  type: 'recent' | 'common' | 'smart' | 'command' | 'generated';
  confidence?: number;
  category?: string;
}

const UniversalChatInput: React.FC<UniversalChatInputProps> = ({
  onSendMessage,
  onFileUpload,
  onVoiceInput,
  onToolClick,
  onMediaUpload,
  onAutoLearning,
  onTyping,
  placeholder = "메시지를 입력하세요...",
  isLoading = false,
  disabled = false,
  className = "",
  showFileUpload = true,
  showVoiceInput = true,
  showToolButton = true,
  showMediaUpload = true,
  autoFocus = true,
  maxHeight = 480,
  minHeight = 24,
  theme = 'default',
  size = 'medium',
  projectId,
  chatId,
  roomId
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showCommands, setShowCommands] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showMessageGenerator, setShowMessageGenerator] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [processingStatus, setProcessingStatus] = useState<{ [key: string]: string }>({});
  const [aiProcessingSteps, setAiProcessingSteps] = useState<{ [key: string]: any[] }>({});
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // 입력 변경 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onTyping?.();
  };

  // 키보드 이벤트 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 메시지 전송
  const handleSend = async () => {
    if (inputValue.trim() && !disabled) {
      const message = inputValue.trim();

      if (message) {
        setInputHistory(prev => [message, ...prev.slice(0, 9)]);
      }

      // 감정 분석 실행
      if (projectId || chatId) {
        try {
          const emotionResponse = await fetch('http://localhost:8000/api/v7/analyze-emotion', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text_content: message,
              user_id: projectId || chatId || 'default_user'
            })
          });

          if (emotionResponse.ok) {
            const emotionData = await emotionResponse.json();
            console.log('감정 분석 결과:', emotionData);

            // 감정 분석 결과를 메타데이터로 전달
            onSendMessage(message, 'text');

            // 감정 분석 결과에 따른 AI 응답 생성
            if (emotionData.status === 'success') {
              const emotion = emotionData.emotion_analysis;

              // 감정 분석 결과 표시
              setTimeout(() => {
                onSendMessage(
                  `🤖 감정 분석: ${emotion.primary_emotion} (${emotion.secondary_emotion}) - 신뢰도: ${(emotion.confidence * 100).toFixed(1)}%`,
                  'text'
                );
              }, 500);

              // 감정에 맞는 AI 응답 생성
              setTimeout(async () => {
                try {
                  const gptResponse = await fetch('http://localhost:8000/api/v7/generate-gpt-message', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      prompt: `사용자가 "${message}"라고 말했습니다. 감정: ${emotion.primary_emotion}`,
                      style: emotion.primary_emotion === 'positive' ? 'encouraging' :
                        emotion.primary_emotion === 'negative' ? 'supportive' : 'professional'
                    })
                  });

                  if (gptResponse.ok) {
                    const gptData = await gptResponse.json();
                    if (gptData.status === 'success') {
                      onSendMessage(gptData.generated_message, 'text');
                    }
                  }
                } catch (error) {
                  console.error('AI 응답 생성 오류:', error);
                }
              }, 1500);
            }
          }
        } catch (error) {
          console.error('감정 분석 오류:', error);
          // 오류가 있어도 메시지는 전송
          onSendMessage(message, 'text');
        }
      } else {
        onSendMessage(message, 'text');
      }

      setInputValue('');
      setShowSuggestions(false);
      setShowCommands(false);
      setSelectedSuggestionIndex(-1);
      setHistoryIndex(-1);

      // 텍스트 영역 높이 강제 리셋
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = '24px';
      }
    }
  };

  // 파일 업로드 처리
  const handleFileUpload = async (fileInfo: any) => {
    const file = fileInfo.file || fileInfo;
    const fileName = fileInfo.fileName || fileInfo.name || file.name;

    setAttachedFiles(prev => [...prev, file]);
    setIsProcessing(true);

    try {
      if (onFileUpload) {
        onFileUpload([file]);
      }

      // 파일 업로드 메시지 전송
      onSendMessage(`파일 "${fileName}" 업로드 완료! 📎`, 'file');

      // 실제 AI 분석 및 학습 실행
      if (onAutoLearning) {
        try {
          const learningResponse = await fetch('http://localhost:8000/api/v7/file/analyze-and-learn', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              file_name: file.name,
              file_type: file.type,
              file_size: file.size,
              user_id: projectId || chatId || 'default_user',
              room_id: projectId || chatId
            })
          });

          if (learningResponse.ok) {
            const learningData = await learningResponse.json();
            console.log('AI 학습 결과:', learningData);

            if (learningData.status === 'success') {
              const result = learningData.learning_result;

              // 학습 완료 메시지
              setTimeout(() => {
                onSendMessage(
                  `✅ AI 학습 완료!\n` +
                  `📊 추출된 키워드: ${result.extracted_knowledge.keywords.join(', ')}\n` +
                  `📈 지식 성장률: ${(result.learning_metrics.knowledge_growth * 100).toFixed(1)}%\n` +
                  `🎯 모델 정확도 향상: ${(result.learning_metrics.model_accuracy_improvement * 100).toFixed(1)}%`,
                  'text'
                );
              }, 1000);

              // AI 자동 학습 콜백 실행
              onAutoLearning({
                file,
                analysis: {
                  keywords: result.extracted_knowledge.keywords,
                  topics: result.extracted_knowledge.topics,
                  insights: result.extracted_knowledge.insights,
                  metrics: result.learning_metrics
                },
                projectId,
                chatId
              });
            }
          }
        } catch (error) {
          console.error('AI 학습 오류:', error);
          onSendMessage('❌ AI 학습 중 오류가 발생했습니다.', 'text');
        }
      }

    } catch (error) {
      console.error('파일 처리 오류:', error);
      onSendMessage(`파일 "${file.name}" 처리 중 오류가 발생했습니다.`, 'file');
    } finally {
      setIsProcessing(false);
    }
  };

  // 음성 입력 시작
  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsRecording(true);
      setIsListening(true);

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.lang = 'ko-KR';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = async (event: any) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }

        setInputValue(prev => prev + finalTranscript);

        // 음성 입력 완료 시 톤 매칭 분석
        if (finalTranscript.trim()) {
          try {
            const toneResponse = await fetch('http://localhost:8000/api/v7/tone-matching', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                user_message: finalTranscript,
                context: { input_type: 'voice' }
              })
            });

            if (toneResponse.ok) {
              const toneData = await toneResponse.json();
              console.log('톤 매칭 분석:', toneData);

              // 톤 매칭 결과를 콘솔에 출력 (필요시 UI에 표시)
              if (toneData.status === 'success') {
                const tone = toneData.tone_analysis;
                console.log(`🎤 음성 톤 분석: ${tone.detected_tone} → ${tone.suggested_tone} (신뢰도: ${(tone.confidence * 100).toFixed(1)}%)`);
              }
            }
          } catch (error) {
            console.error('톤 매칭 분석 오류:', error);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error('음성 인식 오류:', event.error);
        setIsRecording(false);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
        setIsListening(false);
      };

      recognition.start();
    } else {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다.');
    }
  };

  // 음성 입력 중지
  const stopVoiceInput = () => {
    setIsRecording(false);
    setIsListening(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* 기본 입력창 */}
      <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
        <div className="flex items-center space-x-3">
          {/* 파일 업로드 버튼 */}
          {showFileUpload && (
            <button
              onClick={() => setShowFileUploadModal(true)}
              className="text-gray-600 hover:text-gray-800 transition-colors p-2 rounded-lg hover:bg-gray-100"
              aria-label="파일 첨부"
              title="파일 첨부"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
          )}

          {/* 입력창 */}
          <div className="flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 음성 입력 버튼 */}
          {showVoiceInput && (
            <button
              onClick={isRecording ? stopVoiceInput : startVoiceInput}
              className={`p-2 rounded-lg transition-colors ${isRecording
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              aria-label={isRecording ? '음성 입력 중지' : '음성 입력 시작'}
              title={isRecording ? '음성 입력 중지' : '음성 입력 시작'}
            >
              <svg className={`w-5 h-5 ${isRecording ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          )}

          {/* 전송 버튼 */}
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || disabled || isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '전송 중...' : '전송'}
          </button>
        </div>
      </div>

      {/* 파일 업로드 모달 */}
      {showFileUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">파일 첨부</h3>
              <button
                onClick={() => setShowFileUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="닫기"
                title="닫기"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <AdvancedFileUploadWithLearning
              onFileProcessed={handleFileUpload}
              onClose={() => setShowFileUploadModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversalChatInput; 