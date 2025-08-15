import { useState, useCallback, useEffect, useRef } from 'react';

interface VoiceRecognitionState {
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  transcript: string;
  confidence: number;
  interimTranscript: string;
  finalTranscript: string;
  language: string;
  continuous: boolean;
}

interface VoiceRecognitionOptions {
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onStop?: () => void;
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export const useVoiceRecognition = ({
  onResult,
  onError,
  onStart,
  onStop,
  language = 'ko-KR',
  continuous = true,
  interimResults = true,
  maxAlternatives = 1
}: VoiceRecognitionOptions = {}) => {
  const [state, setState] = useState<VoiceRecognitionState>({
    isListening: false,
    isSupported: false,
    error: null,
    transcript: '',
    confidence: 0,
    interimTranscript: '',
    finalTranscript: '',
    language,
    continuous
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Web Speech API 지원 확인
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    const isSupported = !!SpeechRecognition;

    setState(prev => ({ ...prev, isSupported }));

    if (isSupported) {
      const recognition = new SpeechRecognition();
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = language;
      recognition.maxAlternatives = maxAlternatives;

      // 음성 인식 이벤트 핸들러
      recognition.onstart = () => {
        setState(prev => ({ ...prev, isListening: true, error: null }));
        onStart?.();
      };

      recognition.onend = () => {
        setState(prev => ({ ...prev, isListening: false }));
        onStop?.();
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;

          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }

          setState(prev => ({
            ...prev,
            transcript: finalTranscript || interimTranscript,
            confidence,
            interimTranscript,
            finalTranscript: prev.finalTranscript + finalTranscript
          }));

          if (event.results[i].isFinal) {
            onResult?.(transcript, true);
          } else {
            onResult?.(transcript, false);
          }
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        const errorMessages: { [key: string]: string } = {
          'no-speech': '음성이 감지되지 않았습니다.',
          'audio-capture': '마이크에 접근할 수 없습니다.',
          'not-allowed': '마이크 사용 권한이 거부되었습니다.',
          'network': '네트워크 오류가 발생했습니다.',
          'service-not-allowed': '음성 인식 서비스를 사용할 수 없습니다.',
          'bad-grammar': '문법 오류가 발생했습니다.',
          'language-not-supported': '지원하지 않는 언어입니다.'
        };

        const errorMessage = errorMessages[event.error] || `음성 인식 오류: ${event.error}`;

        setState(prev => ({
          ...prev,
          error: errorMessage,
          isListening: false
        }));

        onError?.(errorMessage);
      };

      recognitionRef.current = recognition;
    }
  }, [continuous, interimResults, language, maxAlternatives, onResult, onError, onStart, onStop]);

  // 음성 인식 시작
  const startListening = useCallback(async () => {
    if (!recognitionRef.current) {
      setState(prev => ({ ...prev, error: '음성 인식이 지원되지 않습니다.' }));
      return;
    }

    try {
      // 마이크 권한 요청
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // 오디오 분석기 설정 (음성 시각화용)
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      recognitionRef.current.start();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '마이크 접근 오류';
      setState(prev => ({ ...prev, error: errorMessage }));
      onError?.(errorMessage);
    }
  }, [onError]);

  // 음성 인식 중지
  const stopListening = useCallback(() => {
    if (recognitionRef.current && state.isListening) {
      recognitionRef.current.stop();
    }

    // 오디오 리소스 정리
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
  }, [state.isListening]);

  // 음성 인식 초기화
  const resetTranscript = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
      transcript: '',
      interimTranscript: '',
      finalTranscript: '',
      confidence: 0
    }));
  }, []);

  // 언어 변경
  const changeLanguage = useCallback((newLanguage: string) => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = newLanguage;
      setState(prev => ({ ...prev, language: newLanguage }));
    }
  }, []);

  // 연속 모드 토글
  const toggleContinuous = useCallback(() => {
    if (recognitionRef.current) {
      const newContinuous = !state.continuous;
      recognitionRef.current.continuous = newContinuous;
      setState(prev => ({ ...prev, continuous: newContinuous }));
    }
  }, [state.continuous]);

  // 음성 시각화 데이터 가져오기
  const getAudioData = useCallback(() => {
    if (!analyserRef.current) return null;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    return Array.from(dataArray);
  }, []);

  // 음성 품질 분석
  const analyzeVoiceQuality = useCallback(() => {
    if (!analyserRef.current) return null;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
    const max = Math.max(...Array.from(dataArray));
    const min = Math.min(...Array.from(dataArray));

    return {
      average,
      max,
      min,
      volume: average / 255,
      clarity: (max - min) / 255
    };
  }, []);

  // 음성 명령 처리
  const processVoiceCommand = useCallback((transcript: string) => {
    const commands = {
      '전송': () => ({ type: 'send', data: transcript }),
      '취소': () => ({ type: 'cancel', data: null }),
      '지우기': () => ({ type: 'clear', data: null }),
      '도구': () => ({ type: 'tools', data: null }),
      '파일': () => ({ type: 'file', data: null }),
      '음성': () => ({ type: 'voice', data: null })
    };

    for (const [command, action] of Object.entries(commands)) {
      if (transcript.includes(command)) {
        return action();
      }
    }

    return { type: 'text', data: transcript };
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    ...state,
    startListening,
    stopListening,
    resetTranscript,
    changeLanguage,
    toggleContinuous,
    getAudioData,
    analyzeVoiceQuality,
    processVoiceCommand
  };
};
