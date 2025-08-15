import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  MicrophoneIcon, 
  StopIcon, 
  SpeakerWaveIcon,
  Cog6ToothIcon,
  LanguageIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface VoiceRecognitionState {
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  confidence: number;
  language: string;
  audioLevel: number;
  error: string | null;
}

interface VoiceCommand {
  command: string;
  action: string;
  description: string;
}

const AdvancedVoiceRecognition: React.FC = () => {
  const [state, setState] = useState<VoiceRecognitionState>({
    isListening: false,
    isProcessing: false,
    transcript: '',
    confidence: 0,
    language: 'ko-KR',
    audioLevel: 0,
    error: null
  });

  const [settings, setSettings] = useState({
    autoLanguageDetection: true,
    noiseReduction: true,
    voiceCommands: true,
    realtimeTranslation: false
  });

  const [voiceCommands] = useState<VoiceCommand[]>([
    { command: '시작', action: 'start_recording', description: '음성 인식 시작' },
    { command: '중지', action: 'stop_recording', description: '음성 인식 중지' },
    { command: '번역', action: 'translate', description: '텍스트 번역' },
    { command: '요약', action: 'summarize', description: '텍스트 요약' },
    { command: '분석', action: 'analyze', description: '감정 분석' }
  ]);

  const [analytics, setAnalytics] = useState({
    totalWords: 0,
    averageConfidence: 0,
    recognitionTime: 0,
    accuracyRate: 0
  });

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Web Speech API 초기화
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = state.language;

      recognitionRef.current.onstart = () => {
        setState(prev => ({ ...prev, isListening: true, error: null }));
        startAudioVisualization();
      };

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        let totalConfidence = 0;
        let resultCount = 0;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            totalConfidence += confidence;
            resultCount++;
          } else {
            interimTranscript += transcript;
          }
        }

        setState(prev => ({
          ...prev,
          transcript: finalTranscript + interimTranscript,
          confidence: resultCount > 0 ? totalConfidence / resultCount : 0
        }));

        // 실시간 분석
        if (finalTranscript) {
          analyzeTranscript(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        setState(prev => ({ 
          ...prev, 
          error: `음성 인식 오류: ${event.error}`,
          isListening: false 
        }));
        stopAudioVisualization();
      };

      recognitionRef.current.onend = () => {
        setState(prev => ({ ...prev, isListening: false }));
        stopAudioVisualization();
      };
    } else {
      setState(prev => ({ 
        ...prev, 
        error: '이 브라우저는 음성 인식을 지원하지 않습니다.' 
      }));
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopAudioVisualization();
    };
  }, [state.language]);

  // 오디오 시각화 시작
  const startAudioVisualization = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      microphoneRef.current.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateAudioLevel = () => {
        if (analyserRef.current && state.isListening) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / bufferLength;
          const normalizedLevel = (average / 255) * 100;
          
          setState(prev => ({ ...prev, audioLevel: normalizedLevel }));
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
    } catch (error) {
      console.error('오디오 시각화 시작 실패:', error);
    }
  }, [state.isListening]);

  // 오디오 시각화 중지
  const stopAudioVisualization = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
      microphoneRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setState(prev => ({ ...prev, audioLevel: 0 }));
  }, []);

  // 음성 인식 시작
  const startRecognition = useCallback(() => {
    if (recognitionRef.current && !state.isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: '음성 인식을 시작할 수 없습니다.' 
        }));
      }
    }
  }, [state.isListening]);

  // 음성 인식 중지
  const stopRecognition = useCallback(() => {
    if (recognitionRef.current && state.isListening) {
      recognitionRef.current.stop();
    }
  }, [state.isListening]);

  // 텍스트 분석
  const analyzeTranscript = useCallback(async (text: string) => {
    setState(prev => ({ ...prev, isProcessing: true }));
    
    try {
      // 감정 분석
      const emotionResponse = await fetch('/api/v7/analyze-emotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text_content: text })
      });
      
      if (emotionResponse.ok) {
        const emotionData = await emotionResponse.json();
        console.log('감정 분석 결과:', emotionData);
      }

      // 음성 명령 처리
      if (settings.voiceCommands) {
        const matchedCommand = voiceCommands.find(cmd => 
          text.toLowerCase().includes(cmd.command.toLowerCase())
        );
        
        if (matchedCommand) {
          handleVoiceCommand(matchedCommand.action, text);
        }
      }

      // 통계 업데이트
      setAnalytics(prev => ({
        ...prev,
        totalWords: prev.totalWords + text.split(' ').length,
        averageConfidence: (prev.averageConfidence + state.confidence) / 2
      }));

    } catch (error) {
      console.error('텍스트 분석 오류:', error);
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [settings.voiceCommands, voiceCommands, state.confidence]);

  // 음성 명령 처리
  const handleVoiceCommand = useCallback((action: string, text: string) => {
    switch (action) {
      case 'translate':
        // 번역 기능
        console.log('번역 요청:', text);
        break;
      case 'summarize':
        // 요약 기능
        console.log('요약 요청:', text);
        break;
      case 'analyze':
        // 분석 기능
        console.log('분석 요청:', text);
        break;
      default:
        console.log('알 수 없는 명령:', action);
    }
  }, []);

  // 언어 변경
  const changeLanguage = useCallback((language: string) => {
    setState(prev => ({ ...prev, language }));
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, []);

  // 설정 토글
  const toggleSetting = useCallback((key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // 텍스트 클리어
  const clearTranscript = useCallback(() => {
    setState(prev => ({ ...prev, transcript: '' }));
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <MicrophoneIcon className="w-6 h-6 mr-2" />
          고급 음성 인식 시스템
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => toggleSetting('autoLanguageDetection')}
            className={`p-2 rounded-lg ${
              settings.autoLanguageDetection 
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
            }`}
            title="자동 언어 감지"
          >
            <LanguageIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => toggleSetting('voiceCommands')}
            className={`p-2 rounded-lg ${
              settings.voiceCommands 
                ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
            }`}
            title="음성 명령"
          >
            <Cog6ToothIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 오디오 레벨 시각화 */}
      <div className="mb-6">
        <div className="flex items-center justify-center h-20 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="flex items-end space-x-1 h-16">
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className="w-2 bg-blue-500 rounded-t transition-all duration-100"
                style={{
                  height: `${Math.max(4, (state.audioLevel / 100) * 60 * Math.random())}px`,
                  opacity: state.isListening ? 1 : 0.3
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 컨트롤 버튼 */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <button
          onClick={startRecognition}
          disabled={state.isListening}
          className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
            state.isListening
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
          }`}
        >
          <MicrophoneIcon className="w-5 h-5 mr-2" />
          음성 인식 시작
        </button>

        <button
          onClick={stopRecognition}
          disabled={!state.isListening}
          className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
            !state.isListening
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl'
          }`}
        >
          <StopIcon className="w-5 h-5 mr-2" />
          음성 인식 중지
        </button>

        <button
          onClick={clearTranscript}
          className="flex items-center px-4 py-3 rounded-lg font-medium bg-gray-600 hover:bg-gray-700 text-white"
        >
          텍스트 지우기
        </button>
      </div>

      {/* 언어 선택 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          언어 선택
        </label>
        <select
          value={state.language}
          onChange={(e) => changeLanguage(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          aria-label="언어 선택"
        >
          <option value="ko-KR">한국어</option>
          <option value="en-US">English (US)</option>
          <option value="ja-JP">日本語</option>
          <option value="zh-CN">中文 (简体)</option>
        </select>
      </div>

      {/* 상태 표시 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="text-sm text-blue-600 dark:text-blue-400">상태</div>
          <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
            {state.isListening ? '음성 인식 중' : '대기 중'}
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="text-sm text-green-600 dark:text-green-400">신뢰도</div>
          <div className="text-lg font-semibold text-green-900 dark:text-green-100">
            {(state.confidence * 100).toFixed(1)}%
          </div>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="text-sm text-purple-600 dark:text-purple-400">오디오 레벨</div>
          <div className="text-lg font-semibold text-purple-900 dark:text-purple-100">
            {state.audioLevel.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* 음성 명령 목록 */}
      {settings.voiceCommands && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            음성 명령
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {voiceCommands.map((cmd, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"
              >
                <div className="font-medium text-gray-900 dark:text-white">
                  "{cmd.command}"
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {cmd.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 인식된 텍스트 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          인식된 텍스트
        </h3>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg min-h-[120px]">
          {state.transcript ? (
            <p className="text-gray-900 dark:text-white leading-relaxed">
              {state.transcript}
            </p>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">
              음성 인식을 시작하면 여기에 텍스트가 표시됩니다...
            </p>
          )}
        </div>
      </div>

      {/* 분석 통계 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
          <ChartBarIcon className="w-5 h-5 mr-2" />
          분석 통계
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {analytics.totalWords}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">총 단어 수</div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {(analytics.averageConfidence * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">평균 신뢰도</div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {analytics.recognitionTime}s
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">인식 시간</div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {(analytics.accuracyRate * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">정확도</div>
          </div>
        </div>
      </div>

      {/* 오류 메시지 */}
      {state.error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="text-red-800 dark:text-red-200">
            <strong>오류:</strong> {state.error}
          </div>
        </div>
      )}

      {/* 처리 중 표시 */}
      {state.isProcessing && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            텍스트 분석 중...
          </span>
        </div>
      )}
    </div>
  );
};

export default AdvancedVoiceRecognition;
