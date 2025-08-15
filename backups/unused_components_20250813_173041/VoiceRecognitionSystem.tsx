import React, { useState, useEffect, useCallback } from 'react';
import './VoiceRecognitionSystem.css';
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/outline';

// Web Speech API 타입 정의
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface VoiceRecognitionProps {
  onStart?: () => void;
  onStop?: () => void;
  onResult?: (text: string) => void;
  isRecording?: boolean;
  language?: 'ko' | 'en' | 'ja' | 'zh';
  className?: string;
}

interface VoiceResult {
  text: string;
  confidence: number;
  language: string;
  timestamp: Date;
}

const VoiceRecognitionSystem: React.FC<VoiceRecognitionProps> = ({
  onStart,
  onStop,
  onResult,
  isRecording = false,
  language = 'ko',
  className = ''
}) => {
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [results, setResults] = useState<VoiceResult[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Web Speech API 초기화
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = language === 'ko' ? 'ko-KR' :
        language === 'en' ? 'en-US' :
          language === 'ja' ? 'ja-JP' : 'zh-CN';

      recognitionInstance.onstart = () => {
        setIsListening(true);
        setError(null);
        onStart?.();
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        onStop?.();
      };

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          const result: VoiceResult = {
            text: finalTranscript,
            confidence: event.results[event.results.length - 1][0].confidence,
            language: language,
            timestamp: new Date()
          };

          setResults(prev => [...prev, result]);
          setCurrentText('');
          onResult?.(finalTranscript);
        } else {
          setCurrentText(interimTranscript);
        }
      };

      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        setError(`음성 인식 오류: ${event.error}`);
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    } else {
      setError('이 브라우저는 음성 인식을 지원하지 않습니다.');
    }
  }, [language, onStart, onStop, onResult]);

  // 음성 인식 시작
  const handleStartRecognition = useCallback(() => {
    if (recognition) {
      try {
        recognition.start();
      } catch (error) {
        setError('음성 인식을 시작할 수 없습니다.');
      }
    }
  }, [recognition]);

  // 음성 인식 중지
  const handleStopRecognition = useCallback(() => {
    if (recognition) {
      try {
        recognition.stop();
      } catch (error) {
        setError('음성 인식을 중지할 수 없습니다.');
      }
    }
  }, [recognition]);

  // 결과 삭제
  const clearResults = useCallback(() => {
    setResults([]);
    setCurrentText('');
  }, []);

  // 언어 변경
  const handleLanguageChange = useCallback((newLanguage: 'ko' | 'en' | 'ja' | 'zh') => {
    if (recognition) {
      recognition.stop();
      recognition.lang = newLanguage === 'ko' ? 'ko-KR' :
        newLanguage === 'en' ? 'en-US' :
          newLanguage === 'ja' ? 'ja-JP' : 'zh-CN';
    }
  }, [recognition]);

  // 외부에서 녹음 상태 변경 시
  useEffect(() => {
    if (isRecording && !isListening) {
      handleStartRecognition();
    } else if (!isRecording && isListening) {
      handleStopRecognition();
    }
  }, [isRecording, isListening, handleStartRecognition, handleStopRecognition]);

  return (
    <div className={`voice-recognition-system ${className}`}>
      {/* 상태 표시 */}
      <div className="voice-status">
        <div className={`status-indicator ${isListening ? 'listening' : 'idle'}`}>
          <div className="status-dot"></div>
          <span className="status-text">
            {isListening ? '음성 인식 중...' : '대기 중'}
          </span>
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* 컨트롤 버튼 */}
      <div className="voice-controls">
        <button
          onClick={isListening ? handleStopRecognition : handleStartRecognition}
          className={`control-btn ${isListening ? 'stop' : 'start'}`}
          disabled={!recognition}
        >
          {isListening ? '⏹️ 중지' : '🎤 시작'}
        </button>

        <button
          onClick={clearResults}
          className="control-btn clear"
          disabled={results.length === 0}
        >
          🗑️ 결과 삭제
        </button>
      </div>

      {/* 언어 선택 */}
      <div className="language-selector">
        <label>언어:</label>
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value as 'ko' | 'en' | 'ja' | 'zh')}
          disabled={isListening}
          title="음성 인식 언어 선택"
          aria-label="음성 인식 언어 선택"
        >
          <option value="ko">한국어</option>
          <option value="en">English</option>
          <option value="ja">日本語</option>
          <option value="zh">中文</option>
        </select>
      </div>

      {/* 현재 인식 중인 텍스트 */}
      {currentText && (
        <div className="current-text">
          <h4>인식 중...</h4>
          <p>{currentText}</p>
        </div>
      )}

      {/* 인식 결과 */}
      {results.length > 0 && (
        <div className="recognition-results">
          <h4>인식 결과 ({results.length}개)</h4>
          <div className="results-list">
            {results.map((result, index) => (
              <div key={index} className="result-item">
                <div className="result-header">
                  <span className="result-text">{result.text}</span>
                  <span className="result-confidence">
                    신뢰도: {(result.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="result-meta">
                  <span className="result-language">{result.language}</span>
                  <span className="result-time">
                    {result.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceRecognitionSystem; 