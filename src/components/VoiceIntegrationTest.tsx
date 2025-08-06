import React, { useState, useEffect } from 'react';
import { MicrophoneIcon, StopIcon, PlayIcon } from '@heroicons/react/24/outline';

interface VoiceTestResult {
  text: string;
  confidence: number;
  language: string;
  duration: number;
  timestamp: string;
  emotions: Record<string, number>;
  keywords: string[];
  sentiment: string;
}

const VoiceIntegrationTest: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<VoiceTestResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<any>(null);

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);

  // 서버 상태 확인
  useEffect(() => {
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/v7/voice/status');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      setError('음성 인식 서버에 연결할 수 없습니다.');
    }
  };

  // 음성 녹음 시작
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        await processAudio();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (error) {
      setError('마이크 권한을 허용해주세요.');
    }
  };

  // 음성 녹음 중지
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  // 오디오 처리
  const processAudio = async () => {
    setIsProcessing(true);
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      const base64Audio = await blobToBase64(audioBlob);

      const response = await fetch('http://localhost:8001/api/v7/voice/recognize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audio_data: base64Audio,
          language: 'ko-KR'
        })
      });

      const result = await response.json();
      if (result.success) {
        setResults(prev => [...prev, result.result]);
      } else {
        setError(result.error || '음성 인식에 실패했습니다.');
      }
    } catch (error) {
      setError('음성 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Blob을 Base64로 변환
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // 음성 명령 테스트
  const testVoiceCommand = async (command: string) => {
    try {
      const response = await fetch('http://localhost:8001/api/v7/voice/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: command,
          context: {}
        })
      });

      const result = await response.json();
      if (result.success) {
        setResults(prev => [...prev, {
          text: command,
          confidence: 1.0,
          language: 'ko-KR',
          duration: 0,
          timestamp: new Date().toISOString(),
          emotions: {},
          keywords: [],
          sentiment: 'neutral'
        }]);
      }
    } catch (error) {
      setError('음성 명령 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">🎤 음성 인식 시스템 연동 테스트</h2>
        
        {/* 서버 상태 */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">서버 상태</h3>
          {status ? (
            <div className="text-sm text-gray-600">
              <p>✅ 서버 연결됨</p>
              <p>활성 세션: {status.status.is_active ? '예' : '아니오'}</p>
              <p>성공한 인식: {status.status.successful_recognitions}</p>
              <p>사용 가능한 명령: {status.available_commands.length}개</p>
            </div>
          ) : (
            <p className="text-red-600">❌ 서버에 연결할 수 없습니다.</p>
          )}
        </div>

        {/* 음성 녹음 컨트롤 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">음성 녹음 테스트</h3>
          <div className="flex gap-4">
            <button
              onClick={startRecording}
              disabled={isRecording || isProcessing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <MicrophoneIcon className="w-5 h-5" />
              녹음 시작
            </button>
            <button
              onClick={stopRecording}
              disabled={!isRecording}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              <StopIcon className="w-5 h-5" />
              녹음 중지
            </button>
          </div>
          
          {isRecording && (
            <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg">
              🔴 녹음 중... 말씀해주세요
            </div>
          )}
          
          {isProcessing && (
            <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg">
              ⏳ 음성 처리 중...
            </div>
          )}
        </div>

        {/* 음성 명령 테스트 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">음성 명령 테스트</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {status?.available_commands?.map((command: string, index: number) => (
              <button
                key={index}
                onClick={() => testVoiceCommand(command)}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                {command}
              </button>
            ))}
          </div>
        </div>

        {/* 오류 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg">
            ⚠️ {error}
          </div>
        )}

        {/* 결과 표시 */}
        {results.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">인식 결과 ({results.length}개)</h3>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium">{result.text}</p>
                    <span className="text-sm text-gray-500">
                      신뢰도: {(result.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>언어: {result.language}</p>
                    <p>감정: {result.sentiment}</p>
                    <p>키워드: {result.keywords.join(', ')}</p>
                    <p>시간: {new Date(result.timestamp).toLocaleTimeString()}</p>
                  </div>
                  {Object.keys(result.emotions).length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">감정 분석:</p>
                      <div className="flex gap-2 mt-1">
                        {Object.entries(result.emotions).map(([emotion, value]) => (
                          <span key={emotion} className="text-xs px-2 py-1 bg-blue-100 rounded">
                            {emotion}: {(value * 100).toFixed(1)}%
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceIntegrationTest; 