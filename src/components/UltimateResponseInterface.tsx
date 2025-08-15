import React, { useState, useRef, useEffect } from 'react';
import ultimateResponseService, { 
  UltimateRequest, 
  UltimateResponse, 
  ProcessingProgress 
} from '../services/ultimateResponseService';


interface UltimateResponseInterfaceProps {
  onResponseGenerated?: (response: UltimateResponse) => void;
  projectContext?: {
    project_id: string;
    name: string;
    description?: string;
  };
  className?: string;
}

const UltimateResponseInterface: React.FC<UltimateResponseInterfaceProps> = ({
  onResponseGenerated,
  projectContext,
  className = ''
}) => {
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<UltimateResponse | null>(null);
  const [processingProgress, setProcessingProgress] = useState<ProcessingProgress | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>>([]);
  const [qualityMetrics, setQualityMetrics] = useState<any>(null);
  const [selectedQuality, setSelectedQuality] = useState<'basic' | 'standard' | 'advanced' | 'expert' | 'ultimate'>('ultimate');
  const [selectedStyle, setSelectedStyle] = useState<'conversational' | 'formal' | 'technical' | 'creative'>('conversational');
  const [selectedDetailLevel, setSelectedDetailLevel] = useState<'low' | 'medium' | 'high'>('high');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const responseRef = useRef<HTMLDivElement>(null);

  // 자동 높이 조정
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [userInput]);

  // 응답 스크롤
  useEffect(() => {
    if (responseRef.current && currentResponse) {
      responseRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentResponse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isProcessing) return;

    setIsProcessing(true);
    setProcessingProgress(null);
    setCurrentResponse(null);
    setQualityMetrics(null);

    try {
      // 사용자 메시지를 히스토리에 추가
      const userMessage = {
        role: 'user' as const,
        content: userInput,
        timestamp: new Date().toISOString()
      };
      setConversationHistory(prev => [...prev, userMessage]);

      // 궁극 요청 구성
      const request: UltimateRequest = {
        user_input: userInput,
        conversation_history: conversationHistory,
        project_context: projectContext,
        user_preferences: {
          quality: selectedQuality,
          detail_level: selectedDetailLevel,
          response_style: selectedStyle
        }
      };

      // 처리 진행 상황 모니터링 시작
      const requestId = Date.now().toString();
      ultimateResponseService.monitorProcessingProgress(requestId, (progress) => {
        setProcessingProgress(progress);
      });

      // 궁극 응답 시스템 호출
      const response = await ultimateResponseService.processUltimateRequest(request);

      // 응답 품질 평가
      const quality = ultimateResponseService.evaluateResponseQuality(response);
      setQualityMetrics(quality);

      // 응답을 히스토리에 추가
      if (response.success && response.result) {
        const assistantMessage = {
          role: 'assistant' as const,
          content: response.result.content,
          timestamp: new Date().toISOString()
        };
        setConversationHistory(prev => [...prev, assistantMessage]);
      }

      setCurrentResponse(response);
      
      // 콜백 호출
      if (onResponseGenerated) {
        onResponseGenerated(response);
      }

    } catch (error) {
      console.error('궁극 응답 처리 중 오류:', error);
      setCurrentResponse({
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(null);
      setUserInput('');
      
      // 텍스트 영역 높이 리셋
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const getProgressStageName = (stage: string): string => {
    const stageNames: Record<string, string> = {
      'initial_analysis': '초기 분석',
      'context_enhancement': '컨텍스트 강화',
      'multi_model_generation': '다중 모델 응답 생성',
      'quality_refinement': '품질 정제',
      'confidence_validation': '신뢰도 검증',
      'final_integration': '최종 통합'
    };
    return stageNames[stage] || stage;
  };

  const getQualityColor = (score: number): string => {
    if (score >= 90) return '#10B981'; // green
    if (score >= 80) return '#F59E0B'; // yellow
    if (score >= 70) return '#F97316'; // orange
    return '#EF4444'; // red
  };

  return (
    <div className={`ultimate-response-interface ${className}`}>
      {/* 설정 패널 */}
      <div className="settings-panel">
        <div className="setting-group">
          <label>품질 수준:</label>
          <select 
            value={selectedQuality} 
            onChange={(e) => setSelectedQuality(e.target.value as any)}
            disabled={isProcessing}
          >
            <option value="basic">기본</option>
            <option value="standard">표준</option>
            <option value="advanced">고급</option>
            <option value="expert">전문가</option>
            <option value="ultimate">궁극</option>
          </select>
        </div>

        <div className="setting-group">
          <label>응답 스타일:</label>
          <select 
            value={selectedStyle} 
            onChange={(e) => setSelectedStyle(e.target.value as any)}
            disabled={isProcessing}
          >
            <option value="conversational">대화형</option>
            <option value="formal">공식적</option>
            <option value="technical">기술적</option>
            <option value="creative">창의적</option>
          </select>
        </div>

        <div className="setting-group">
          <label>상세 수준:</label>
          <select 
            value={selectedDetailLevel} 
            onChange={(e) => setSelectedDetailLevel(e.target.value as any)}
            disabled={isProcessing}
          >
            <option value="low">간단</option>
            <option value="medium">보통</option>
            <option value="high">상세</option>
          </select>
        </div>
      </div>

      {/* 입력 영역 */}
      <form onSubmit={handleSubmit} className="input-section">
        <div className="input-container">
          <textarea
            ref={textareaRef}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="궁극의 AI 시스템에 질문하세요... (Enter로 전송, Shift+Enter로 줄바꿈)"
            disabled={isProcessing}
            className="ultimate-input"
            rows={1}
          />
          <button 
            type="submit" 
            disabled={!userInput.trim() || isProcessing}
            className="submit-button"
          >
            {isProcessing ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
              </div>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22,2 15,22 11,13 2,9" />
              </svg>
            )}
          </button>
        </div>
      </form>

      {/* 처리 진행 상황 */}
      {isProcessing && processingProgress && (
        <div className="processing-progress">
          <div className="progress-header">
            <h3>🚀 궁극 AI 시스템 처리 중...</h3>
            <div className="progress-percentage">
              {processingProgress.progress_percentage}%
            </div>
          </div>
          
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${processingProgress.progress_percentage}%` }}
            ></div>
          </div>
          
          <div className="current-stage">
            현재 단계: {getProgressStageName(processingProgress.current_stage)}
          </div>
          
          {processingProgress.estimated_time_remaining && (
            <div className="estimated-time">
              예상 남은 시간: {processingProgress.estimated_time_remaining.toFixed(1)}초
            </div>
          )}
        </div>
      )}

      {/* 응답 영역 */}
      {currentResponse && (
        <div ref={responseRef} className="response-section">
          {currentResponse.success && currentResponse.result ? (
            <div className="response-content">
              <div className="response-header">
                <h3>🤖 궁극 AI 응답</h3>
                <div className="response-metrics">
                  <span className="metric">
                    신뢰도: <span style={{ color: getQualityColor(currentResponse.result.confidence * 100) }}>
                      {(currentResponse.result.confidence * 100).toFixed(1)}%
                    </span>
                  </span>
                  <span className="metric">
                    품질: <span style={{ color: getQualityColor(currentResponse.result.quality_score * 100) }}>
                      {(currentResponse.result.quality_score * 100).toFixed(1)}%
                    </span>
                  </span>
                  <span className="metric">
                    처리시간: {currentResponse.result.processing_time.toFixed(2)}초
                  </span>
                </div>
              </div>
              
              <div className="response-text">
                {currentResponse.result.content}
              </div>
              
              {currentResponse.result.reasoning && (
                <div className="response-reasoning">
                  <h4>🧠 처리 과정</h4>
                  <p>{currentResponse.result.reasoning}</p>
                </div>
              )}
              
              {currentResponse.result.improvements && currentResponse.result.improvements.length > 0 && (
                <div className="response-improvements">
                  <h4>💡 개선 사항</h4>
                  <ul>
                    {currentResponse.result.improvements.map((improvement, index) => (
                      <li key={index}>{improvement}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {qualityMetrics && (
                <div className="quality-analysis">
                  <h4>📊 품질 분석</h4>
                  <div className="quality-metrics">
                    <div className="quality-metric">
                      <span>종합 점수:</span>
                      <span style={{ color: getQualityColor(qualityMetrics.overall_score) }}>
                        {qualityMetrics.overall_score}/100
                      </span>
                    </div>
                    <div className="quality-metric">
                      <span>신뢰도:</span>
                      <span>{qualityMetrics.confidence_score}/100</span>
                    </div>
                    <div className="quality-metric">
                      <span>품질:</span>
                      <span>{qualityMetrics.quality_score}/100</span>
                    </div>
                    <div className="quality-metric">
                      <span>처리 효율성:</span>
                      <span>{qualityMetrics.processing_efficiency}/100</span>
                    </div>
                  </div>
                  
                  {qualityMetrics.recommendations.length > 0 && (
                    <div className="recommendations">
                      <h5>💭 개선 권장사항</h5>
                      <ul>
                        {qualityMetrics.recommendations.map((rec: string, index: number) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="error-response">
              <h3>❌ 오류 발생</h3>
              <p>{currentResponse.error || '알 수 없는 오류가 발생했습니다.'}</p>
            </div>
          )}
        </div>
      )}

      {/* 대화 히스토리 */}
      {conversationHistory.length > 0 && (
        <div className="conversation-history">
          <h3>💬 대화 히스토리</h3>
          <div className="history-list">
            {conversationHistory.map((message, index) => (
              <div key={index} className={`history-message ${message.role}`}>
                <div className="message-header">
                  <span className="message-role">
                    {message.role === 'user' ? '👤 사용자' : '🤖 AI'}
                  </span>
                  <span className="message-time">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="message-content">
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UltimateResponseInterface;
