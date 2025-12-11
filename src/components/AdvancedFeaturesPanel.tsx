/**
 * 고급 기능 패널 컴포넌트
 * 음성 인식, 이미지 분석, 예측 분석 기능을 통합 제공
 */

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import advancedAPIService, {
  ImageAnalysisResponse,
  UserActivityPredictionResponse,
  MessageQualityPredictionResponse,
  SystemPerformancePredictionResponse,
  PredictionSummaryResponse,
} from '../services/advancedAPIService';
import { useWebSocket } from '../hooks/useWebSocket';
import { speechRecognitionService } from '../services/speechRecognitionService';
import PredictionChart from './PredictionChart';
import LoadingSkeleton from './LoadingSkeleton';
import LoadingStateIndicator from './LoadingStateIndicator';
import { useLoadingState } from '../hooks/useLoadingState';
import { useDebounce } from '../hooks/useDebounce';
import { errorLogger } from '../utils/errorLogger';
import './AdvancedFeaturesPanel.css';

interface AdvancedFeaturesPanelProps {
  userId?: string;
  onImageAnalyzed?: (result: ImageAnalysisResponse) => void;
  onPredictionComplete?: (type: string, result: any) => void;
}

const AdvancedFeaturesPanel: React.FC<AdvancedFeaturesPanelProps> = ({
  userId = 'default-user',
  onImageAnalyzed,
  onPredictionComplete,
}) => {
  // 상태 관리
  const [activeTab, setActiveTab] = useState<'voice' | 'image' | 'prediction'>('image');
  const { loadingState, startUpdating, stopLoading } = useLoadingState();
  const [error, setError] = useState<string | null>(null);

  // 음성 인식 상태
  const [voiceSessionId, setVoiceSessionId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [voiceInterimTranscript, setVoiceInterimTranscript] = useState<string>('');
  const recognitionRef = useRef<any>(null);

  // 이미지 분석 상태
  const [imageAnalysisResult, setImageAnalysisResult] = useState<ImageAnalysisResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 예측 분석 상태
  const [userActivityPrediction, setUserActivityPrediction] = useState<UserActivityPredictionResponse | null>(null);
  const [messageQualityPrediction, setMessageQualityPrediction] = useState<MessageQualityPredictionResponse | null>(null);
  const [systemPerformancePrediction, setSystemPerformancePrediction] = useState<SystemPerformancePredictionResponse | null>(null);
  const [predictionSummary, setPredictionSummary] = useState<PredictionSummaryResponse | null>(null);
  const [messageInput, setMessageInput] = useState('');
  
  // 디바운스된 메시지 입력
  const debouncedMessageInput = useDebounce(messageInput, 500);

  // WebSocket 연결
  const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8000';
  const { isConnected: wsConnected, sendMessage: wsSendMessage } = useWebSocket({
    url: wsUrl,
    roomId: userId,
    onMessage: (data) => {
      errorLogger.info('[WebSocket] 메시지 수신', {
        component: 'AdvancedFeaturesPanel',
        action: 'websocketMessage',
        dataType: typeof data,
      });
      // 실시간 업데이트 처리
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'emotion_analysis') {
            // 감정 분석 결과 실시간 업데이트
            errorLogger.info('실시간 감정 분석', {
              component: 'AdvancedFeaturesPanel',
              action: 'emotionAnalysis',
              data: parsed,
            });
          } else if (parsed.type === 'file_learning_progress') {
            // 파일 학습 진행 상황 업데이트
            errorLogger.info('파일 학습 진행', {
              component: 'AdvancedFeaturesPanel',
              action: 'fileLearningProgress',
              data: parsed,
            });
          }
        } catch (e) {
          // 파싱 실패 시 무시
        }
      }
    },
    onError: (error) => {
      errorLogger.error('[WebSocket] 오류', error instanceof Error ? error : new Error(String(error)), {
        component: 'AdvancedFeaturesPanel',
        action: 'websocketError',
      });
    },
    onOpen: () => {
      errorLogger.info('[WebSocket] 연결됨', {
        component: 'AdvancedFeaturesPanel',
        action: 'websocketOpen',
      });
    },
    onClose: () => {
      errorLogger.info('[WebSocket] 연결 종료', {
        component: 'AdvancedFeaturesPanel',
        action: 'websocketClose',
      });
    },
    reconnect: true,
  });

  // ==================== 음성 인식 기능 ====================

  const handleStartVoiceRecognition = useCallback(async () => {
    try {
      startUpdating('음성 인식을 시작하는 중...');
      setError(null);
      setVoiceTranscript('');
      setVoiceInterimTranscript('');

      // 백엔드 세션 시작
      const response = await advancedAPIService.startVoiceRecognition({
        language: 'ko',
      });

      if (response.status === 'success' && response.session_id) {
        setVoiceSessionId(response.session_id);

        // Web Speech API 시작
        const started = await speechRecognitionService.startListening({
          onResult: (result) => {
            const transcript = result.transcript || '';
            if (result.isFinal) {
              setVoiceTranscript(prev => prev + transcript + ' ');
              setVoiceInterimTranscript('');

              // 백엔드에 결과 전송
              if (response.session_id) {
                wsSendMessage({
                  type: 'voice_result',
                  session_id: response.session_id,
                  text: transcript,
                  is_final: true,
                });
              }
            } else {
              setVoiceInterimTranscript(transcript);
            }
          },
          onError: (error) => {
            setError(`음성 인식 오류: ${error}`);
            setIsRecording(false);
          },
          onEnd: () => {
            setIsRecording(false);
          },
        });

        if (started) {
          setIsRecording(true);
        } else {
          throw new Error('음성 인식 시작 실패 (브라우저 미지원 또는 권한 필요)');
        }
      } else {
        throw new Error(response.message || '음성 인식 시작 실패');
      }
    } catch (err: any) {
      setError(err.message || '음성 인식 시작 중 오류가 발생했습니다.');
      setIsRecording(false);
    } finally {
      stopLoading();
    }
  }, [wsSendMessage]);

  const handleStopVoiceRecognition = useCallback(async () => {
    if (!voiceSessionId) return;

    try {
      startUpdating('음성 인식을 중지하는 중...');
      setError(null);

      // Web Speech API 중지
      speechRecognitionService.stopListening();

      // 백엔드 세션 중지
      const response = await advancedAPIService.stopVoiceRecognition({
        session_id: voiceSessionId,
      });

      if (response.status === 'success') {
        setIsRecording(false);
        setVoiceInterimTranscript('');

        // 최종 결과 조회
        const results = await advancedAPIService.getVoiceRecognitionResults(voiceSessionId);
        errorLogger.info('음성 인식 결과', {
          component: 'AdvancedFeaturesPanel',
          action: 'voiceRecognition',
          sessionId: voiceSessionId,
        });

        // 최종 텍스트가 있으면 표시
        if (voiceTranscript.trim()) {
          setError(null);
        }
      } else {
        throw new Error(response.message || '음성 인식 중지 실패');
      }
    } catch (err: any) {
      setError(err.message || '음성 인식 중지 중 오류가 발생했습니다.');
    } finally {
      stopLoading();
    }
  }, [voiceSessionId, voiceTranscript]);

  // ==================== 이미지 분석 기능 ====================

  const handleImageFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    try {
      startUpdating('이미지를 분석하는 중...');
      setError(null);

      const result = await advancedAPIService.analyzeImageFile(file, 'comprehensive');

      if (result.status === 'success') {
        setImageAnalysisResult(result);
        onImageAnalyzed?.(result);
      } else {
        throw new Error(result.message || '이미지 분석 실패');
      }
    } catch (err: any) {
      setError(err.message || '이미지 분석 중 오류가 발생했습니다.');
    } finally {
      stopLoading();
    }
  }, [onImageAnalyzed]);

  const handleImageUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // ==================== 예측 분석 기능 ====================

  const handlePredictUserActivity = useCallback(async () => {
    try {
      startUpdating('사용자 활동을 예측하는 중...');
      setError(null);

      const result = await advancedAPIService.predictUserActivity({
        user_id: userId,
        time_horizon: '1h',
      });

      if (result.status === 'success') {
        setUserActivityPrediction(result);
        onPredictionComplete?.('user_activity', result);
      } else {
        throw new Error(result.message || '사용자 활동 예측 실패');
      }
    } catch (err: any) {
      setError(err.message || '사용자 활동 예측 중 오류가 발생했습니다.');
    } finally {
      stopLoading();
    }
  }, [userId, onPredictionComplete]);

  const handlePredictMessageQuality = useCallback(async () => {
    if (!messageInput.trim()) {
      setError('메시지를 입력해주세요.');
      return;
    }

    try {
      startUpdating('메시지 품질을 분석하는 중...');
      setError(null);

      const result = await advancedAPIService.predictMessageQuality({
        message_content: messageInput,
        message_type: 'general',
      });

      if (result.status === 'success') {
        setMessageQualityPrediction(result);
        onPredictionComplete?.('message_quality', result);
      } else {
        throw new Error(result.message || '메시지 품질 예측 실패');
      }
    } catch (err: any) {
      setError(err.message || '메시지 품질 예측 중 오류가 발생했습니다.');
    } finally {
      stopLoading();
    }
  }, [messageInput, onPredictionComplete]);

  const handlePredictSystemPerformance = useCallback(async () => {
    try {
      startUpdating('시스템 성능을 예측하는 중...');
      setError(null);

      const result = await advancedAPIService.predictSystemPerformance({
        time_horizon: '1h',
        include_trends: true,
      });

      if (result.status === 'success') {
        setSystemPerformancePrediction(result);
        onPredictionComplete?.('system_performance', result);
      } else {
        throw new Error(result.message || '시스템 성능 예측 실패');
      }
    } catch (err: any) {
      setError(err.message || '시스템 성능 예측 중 오류가 발생했습니다.');
    } finally {
      stopLoading();
    }
  }, [onPredictionComplete]);

  const handleGetPredictionSummary = useCallback(async () => {
    try {
      startUpdating('예측 요약을 불러오는 중...');
      setError(null);

      const result = await advancedAPIService.getPredictionSummary();

      if (result.status === 'success') {
        setPredictionSummary(result);
      } else {
        throw new Error(result.message || '예측 요약 조회 실패');
      }
    } catch (err: any) {
      setError(err.message || '예측 요약 조회 중 오류가 발생했습니다.');
    } finally {
      stopLoading();
    }
  }, []);

  // ==================== 렌더링 ====================

  return (
    <div className="advanced-features-panel">
      <div className="panel-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>고급 기능</h2>
          <div className="connection-status">
            <span className={`status-indicator ${wsConnected ? 'connected' : 'disconnected'}`}></span>
            <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>
              {wsConnected ? '실시간 연결됨' : '연결 끊김'}
            </span>
          </div>
        </div>
        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}
      </div>

      {/* 탭 네비게이션 */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'voice' ? 'active' : ''}`}
          onClick={() => setActiveTab('voice')}
        >
          🎤 음성 인식
        </button>
        <button
          className={`tab-button ${activeTab === 'image' ? 'active' : ''}`}
          onClick={() => setActiveTab('image')}
        >
          🖼️ 이미지 분석
        </button>
        <button
          className={`tab-button ${activeTab === 'prediction' ? 'active' : ''}`}
          onClick={() => setActiveTab('prediction')}
        >
          🔮 예측 분석
        </button>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="panel-content">
        <LoadingStateIndicator
          type={loadingState.type}
          message={loadingState.message}
          showSpinner={loadingState.type === 'updating'}
        />

        {/* 로딩 스켈레톤 */}
        {loadingState.type === 'updating' && activeTab === 'image' && !imageAnalysisResult && (
          <LoadingSkeleton type="card" height="300px" />
        )}
        {loadingState.type === 'updating' && activeTab === 'prediction' && !userActivityPrediction && !messageQualityPrediction && !systemPerformancePrediction && (
          <LoadingSkeleton type="list" lines={3} />
        )}

        {/* 음성 인식 탭 */}
        {activeTab === 'voice' && (
          <div className="voice-recognition-section">
            <h3>음성 인식</h3>
            <div className="voice-controls">
              {!isRecording ? (
                <button
                  className="btn btn-primary"
                  onClick={handleStartVoiceRecognition}
                  disabled={loadingState.type === 'updating'}
                >
                  🎤 음성 인식 시작
                </button>
              ) : (
                <button
                  className="btn btn-danger"
                  onClick={handleStopVoiceRecognition}
                  disabled={loadingState.type === 'updating'}
                >
                  ⏹️ 음성 인식 중지
                </button>
              )}
            </div>
            {isRecording && (
              <div className="recording-indicator">
                <span className="pulse"></span>
                <span>녹음 중...</span>
              </div>
            )}
            {voiceSessionId && (
              <div className="session-info">
                <p>세션 ID: {voiceSessionId}</p>
              </div>
            )}
            {(voiceTranscript || voiceInterimTranscript) && (
              <div className="voice-transcript">
                <h4>인식된 텍스트:</h4>
                <div className="transcript-text">
                  <span>{voiceTranscript}</span>
                  <span style={{ color: '#999', fontStyle: 'italic' }}>
                    {voiceInterimTranscript}
                  </span>
                </div>
                {voiceTranscript && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setMessageInput(voiceTranscript.trim());
                      setActiveTab('prediction');
                    }}
                    style={{ marginTop: '10px' }}
                  >
                    📝 메시지 품질 예측에 사용
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 이미지 분석 탭 */}
        {activeTab === 'image' && (
          <div className="image-analysis-section">
            <h3>이미지 분석</h3>
            <div className="image-upload-area">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileSelect}
                style={{ display: 'none' }}
              />
              <button
                className="btn btn-primary"
                onClick={handleImageUpload}
                disabled={loadingState.type === 'updating'}
              >
                📁 이미지 선택
              </button>
            </div>

            {imageAnalysisResult?.analysis && (
              <div className="analysis-results">
                <h4>분석 결과</h4>
                <div className="result-grid">
                  <div className="result-item">
                    <strong>이미지 정보</strong>
                    <p>
                      크기: {imageAnalysisResult.analysis.image_info.width} x{' '}
                      {imageAnalysisResult.analysis.image_info.height}
                    </p>
                    <p>형식: {imageAnalysisResult.analysis.image_info.format}</p>
                  </div>

                  {imageAnalysisResult.analysis.object_detection && (
                    <div className="result-item">
                      <strong>객체 감지</strong>
                      <p>
                        감지된 객체: {imageAnalysisResult.analysis.object_detection.total_objects}개
                      </p>
                      <ul>
                        {imageAnalysisResult.analysis.object_detection.detected_objects.map(
                          (obj, idx) => (
                            <li key={idx}>
                              {obj.name} (신뢰도: {(obj.confidence * 100).toFixed(1)}%)
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {imageAnalysisResult.analysis.ocr_results && (
                    <div className="result-item">
                      <strong>OCR 결과</strong>
                      <p>{imageAnalysisResult.analysis.ocr_results.extracted_text}</p>
                    </div>
                  )}

                  {imageAnalysisResult.analysis.emotion_analysis && (
                    <div className="result-item">
                      <strong>감정 분석</strong>
                      <p>
                        주요 감정: {imageAnalysisResult.analysis.emotion_analysis.primary_emotion}
                      </p>
                      <p>
                        신뢰도: {(imageAnalysisResult.analysis.emotion_analysis.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 예측 분석 탭 */}
        {activeTab === 'prediction' && (
          <div className="prediction-analysis-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>예측 분석</h3>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  handlePredictUserActivity();
                  handlePredictSystemPerformance();
                  handleGetPredictionSummary();
                }}
                disabled={loadingState.type === 'updating'}
              >
                🔄 전체 새로고침
              </button>
            </div>

            <div className="prediction-controls">
              <div className="control-group">
                <button
                  className="btn btn-secondary"
                  onClick={handlePredictUserActivity}
                  disabled={loadingState.type === 'updating'}
                >
                  👤 사용자 활동 예측
                </button>
                {userActivityPrediction?.prediction && (
                  <div className="prediction-result">
                    <h4>예측된 활동</h4>
                    {useMemo(() => (
                      <PredictionChart
                        data={{
                          labels: userActivityPrediction.prediction?.predicted_activities.map(
                            (a) => a.activity
                          ) || [],
                          values: userActivityPrediction.prediction?.predicted_activities.map(
                            (a) => a.probability
                          ) || [],
                        }}
                        type="bar"
                        title="활동 예측 확률"
                      />
                    ), [userActivityPrediction.prediction?.predicted_activities])}
                    <ul style={{ marginTop: '15px' }}>
                      {userActivityPrediction.prediction?.predicted_activities.map((activity, idx) => (
                        <li key={idx}>
                          <strong>{activity.activity}</strong> - 확률: {(activity.probability * 100).toFixed(1)}%
                          <br />
                          <small style={{ color: '#666' }}>
                            예상 시간: {activity.expected_time} | 신뢰도: {(activity.confidence * 100).toFixed(1)}%
                          </small>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="control-group">
                <h4>메시지 품질 예측</h4>
                <textarea
                  className="message-input"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="메시지를 입력하세요..."
                  rows={4}
                />
                <button
                  className="btn btn-secondary"
                  onClick={handlePredictMessageQuality}
                  disabled={loadingState.type === 'updating' || !messageInput.trim()}
                >
                  ✍️ 품질 예측
                </button>
                {messageQualityPrediction?.quality_analysis && (
                  <div className="prediction-result">
                    <h4>품질 분석 결과</h4>
                    <PredictionChart
                      data={{
                        labels: ['명확성', '완전성', '관련성', '톤'],
                        values: [
                          messageQualityPrediction.quality_analysis.scores.clarity,
                          messageQualityPrediction.quality_analysis.scores.completeness,
                          messageQualityPrediction.quality_analysis.scores.relevance,
                          messageQualityPrediction.quality_analysis.scores.tone_appropriateness,
                        ],
                        colors: ['#007bff', '#28a745', '#ffc107', '#dc3545'],
                      }}
                      type="bar"
                      title="품질 점수 분석"
                    />
                    <div style={{ marginTop: '15px' }}>
                      <p>
                        <strong>종합 점수:</strong> {(messageQualityPrediction.quality_analysis.overall_score * 100).toFixed(1)}점
                      </p>
                      <p>
                        <strong>품질 수준:</strong>{' '}
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor:
                              messageQualityPrediction.quality_analysis.quality_level === 'excellent'
                                ? '#d4edda'
                                : messageQualityPrediction.quality_analysis.quality_level === 'good'
                                ? '#d1ecf1'
                                : messageQualityPrediction.quality_analysis.quality_level === 'fair'
                                ? '#fff3cd'
                                : '#f8d7da',
                            color:
                              messageQualityPrediction.quality_analysis.quality_level === 'excellent'
                                ? '#155724'
                                : messageQualityPrediction.quality_analysis.quality_level === 'good'
                                ? '#0c5460'
                                : messageQualityPrediction.quality_analysis.quality_level === 'fair'
                                ? '#856404'
                                : '#721c24',
                          }}
                        >
                          {messageQualityPrediction.quality_analysis.quality_level === 'excellent'
                            ? '우수'
                            : messageQualityPrediction.quality_analysis.quality_level === 'good'
                            ? '양호'
                            : messageQualityPrediction.quality_analysis.quality_level === 'fair'
                            ? '보통'
                            : '개선 필요'}
                        </span>
                      </p>
                      {messageQualityPrediction.quality_analysis.suggestions.length > 0 && (
                        <div>
                          <strong>개선 제안:</strong>
                          <ul>
                            {messageQualityPrediction.quality_analysis.suggestions.map((suggestion, idx) => (
                              <li key={idx}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="control-group">
                <button
                  className="btn btn-secondary"
                  onClick={handlePredictSystemPerformance}
                  disabled={loadingState.type === 'updating'}
                >
                  ⚙️ 시스템 성능 예측
                </button>
                {systemPerformancePrediction?.performance_prediction && (
                  <div className="prediction-result">
                    <h4>성능 예측 결과</h4>
                    <p>
                      CPU 사용률: {systemPerformancePrediction.performance_prediction.predicted_metrics.cpu_usage.toFixed(1)}%
                    </p>
                    <p>
                      메모리 사용률: {systemPerformancePrediction.performance_prediction.predicted_metrics.memory_usage.toFixed(1)}%
                    </p>
                    {systemPerformancePrediction.performance_prediction.alerts.length > 0 && (
                      <div className="alerts">
                        <strong>경고:</strong>
                        <ul>
                          {systemPerformancePrediction.performance_prediction.alerts.map((alert, idx) => (
                            <li key={idx} className={`alert-${alert.level}`}>
                              {alert.message}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="control-group">
                <button
                  className="btn btn-secondary"
                  onClick={handleGetPredictionSummary}
                  disabled={loadingState.type === 'updating'}
                >
                  📊 예측 요약 조회
                </button>
                {predictionSummary?.summary && (
                  <div className="prediction-result">
                    <h4>예측 요약</h4>
                    <p>총 예측 수: {predictionSummary.summary.total_predictions}</p>
                    <p>정확도: {(predictionSummary.summary.accuracy_rate * 100).toFixed(1)}%</p>
                    <p>활성 모델: {predictionSummary.summary.active_models}개</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedFeaturesPanel;

