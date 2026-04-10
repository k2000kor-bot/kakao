/**
 * 일반 대화 뷰 (기본 프론트) - 감정/의도 분석 대화
 * bw-detail 레이아웃 적용
 */
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare } from 'lucide-react';
import { errorLogger } from '../utils/errorLogger';
import { postChatJsonWithFallback } from '../utils/apiClient';
import { buildUnifiedGenerationPrompt, buildUnifiedChatContext } from '../services/generationPromptBuilder';
import {
  extractResponseContent,
  coerceTrimmedString,
  extractPipelineMessageExtrasFromChatResponse,
  hasPipelineExtras,
  ASSISTANT_VERIFY_PHASE_MS,
} from '../utils/chatInputUtils';
import {
  mergeApiChatContextPayload,
  normalizeChatTurnsForApiMerge,
  resolveMergeOptionsFromHistoryAndExplicit,
  scenarioInheritMergeOptionsFromPipelineLikeMessages,
} from '../services/modernChatContextBuilder';
import { resolveGensparkAgentIdFromWindowSearch } from '../services/gensparkAgentRegistry';
import { DEFAULT_CHAT_PERSPECTIVE, DEFAULT_CHAT_RESPONSE_STYLE } from '../utils/modernChatUrlStyle';

export default function SimpleChatView() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      content: '안녕하세요! CORBU.AI입니다. 🚀\n저는 고급 감정 분석과 의도 파악 기능을 갖춘 AI 어시스턴트입니다.\n무엇을 도와드릴까요?',
      timestamp: new Date().toLocaleTimeString(),
      analysis: null
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const savedSessionId = localStorage.getItem('chatSessionId');
    if (!savedSessionId) {
      const newSessionId = 'session-' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('chatSessionId', newSessionId);
      setSessionId(newSessionId);
    } else {
      setSessionId(savedSessionId);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (overrideText) => {
    const messageToSend = coerceTrimmedString(overrideText, inputValue);
    if (!messageToSend) return;
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      content: messageToSend,
      timestamp: new Date().toLocaleTimeString(),
      analysis: null
    };
    const placeholderId = `${Date.now()}-ai`;
    const placeholderAi = {
      id: placeholderId,
      sender: 'ai',
      content: '질문 분석 중...',
      timestamp: new Date().toLocaleTimeString(),
      analysis: null,
      generationPlaceholder: true,
    };
    setMessages((prev) => [...prev, userMessage, placeholderAi]);
    setInputValue('');
    setIsTyping(true);

    let simpleChatStepTimer;
    simpleChatStepTimer = setTimeout(() => {
      simpleChatStepTimer = undefined;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderId ? { ...m, content: '답변 생성 중...' } : m
        )
      );
    }, 500);

    try {
      const requestMessage = buildUnifiedGenerationPrompt(messageToSend, {
        responseStyle: DEFAULT_CHAT_RESPONSE_STYLE,
        perspective: DEFAULT_CHAT_PERSPECTIVE,
      });
      const historySource = messages.filter(
        (m) => !m.generationPlaceholder && (m.sender === 'user' || m.sender === 'ai')
      );
      const conversationHistory = historySource
        .slice(-20)
        .map((m) => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.content }));
      const simpleChatUsePipeline = process.env.REACT_APP_SIMPLE_CHAT_USE_PIPELINE === 'true';
      const agentRouteId = resolveGensparkAgentIdFromWindowSearch();
      const agentGensparkSession = Boolean(agentRouteId);
      const context = buildUnifiedChatContext(messageToSend, {
        conversationHistory,
        ...(simpleChatUsePipeline || agentGensparkSession
          ? {
              useQuestionAnswerPipeline: true,
              agenticGensparkStyle: true,
              qaPipelineAllowEmptyProject: true,
              ...(agentRouteId ? { gensparkRouteAgentId: agentRouteId } : {}),
              skipWriterLlmPolish:
                process.env.REACT_APP_PIPELINE_SKIP_WRITER_POLISH === 'true',
              ...(process.env.REACT_APP_PIPELINE_VERIFIER_REWRITE === 'true'
                ? { pipelineVerifierRewrite: true }
                : {}),
              ...(process.env.REACT_APP_INCLUDE_QA_GENERATION_SCENARIO === 'true'
                ? { includeGenerationScenarioInResponse: true }
                : {}),
            }
          : {}),
      });
      const scenarioMergeOpts = scenarioInheritMergeOptionsFromPipelineLikeMessages(
        historySource.slice(-20)
      );
      const historyNorm = normalizeChatTurnsForApiMerge(conversationHistory);
      const mergeOpts = resolveMergeOptionsFromHistoryAndExplicit(historyNorm, scenarioMergeOpts);
      const { quality, contextForBody } = mergeApiChatContextPayload(
        messageToSend,
        context,
        historyNorm.length > 0 ? historyNorm : undefined,
        mergeOpts
      );
      const payload = {
        message: requestMessage,
        quality,
        session_id: sessionId || undefined,
        ...(contextForBody && Object.keys(contextForBody).length > 0 ? { context: contextForBody } : {}),
        response_style: DEFAULT_CHAT_RESPONSE_STYLE,
        perspective: DEFAULT_CHAT_PERSPECTIVE
      };
      const data = await postChatJsonWithFallback(payload);
      if (simpleChatStepTimer !== undefined) {
        clearTimeout(simpleChatStepTimer);
        simpleChatStepTimer = undefined;
      }
      setIsTyping(false);
      const responseText = extractResponseContent({ data });
      const isSuccess =
        data.success !== false &&
        typeof responseText === 'string' &&
        coerceTrimmedString(responseText, '').length > 0;
      if (isSuccess) {
        const pipelineExtrasRaw = extractPipelineMessageExtrasFromChatResponse({ data });
        const pipelineExtras = hasPipelineExtras(pipelineExtrasRaw) ? pipelineExtrasRaw : undefined;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === placeholderId
              ? { ...m, content: '최종 검토 중...', generationPlaceholder: true }
              : m
          )
        );
        await new Promise((r) => setTimeout(r, ASSISTANT_VERIFY_PHASE_MS));
        setMessages((prev) =>
          prev.map((m) =>
            m.id === placeholderId
              ? {
                  id: placeholderId,
                  sender: 'ai',
                  content: responseText,
                  timestamp: new Date().toLocaleTimeString(),
                  analysis:
                    data.emotion_analysis && data.intent_analysis
                      ? { emotion: data.emotion_analysis, intent: data.intent_analysis }
                      : null,
                  ...(pipelineExtras ? { pipelineExtras } : {}),
                }
              : m
          )
        );
      } else {
        const errorMsg = typeof data.error === 'string' ? data.error : '답변을 생성할 수 없습니다.';
        setMessages((prev) =>
          prev.map((m) =>
            m.id === placeholderId
              ? {
                  id: placeholderId,
                  sender: 'ai',
                  content: '죄송합니다. 답변 생성에 문제가 발생했습니다: ' + errorMsg,
                  timestamp: new Date().toLocaleTimeString(),
                  analysis: null,
                }
              : m
          )
        );
      }
    } catch (error) {
      if (simpleChatStepTimer !== undefined) {
        clearTimeout(simpleChatStepTimer);
        simpleChatStepTimer = undefined;
      }
      setIsTyping(false);
      errorLogger.error('메시지 전송 오류', error instanceof Error ? error : new Error(String(error)), { component: 'SimpleChatView', action: 'sendMessage' });
      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderId
            ? {
                id: placeholderId,
                sender: 'ai',
                content: '네트워크 오류가 발생했습니다. 다시 시도해주세요.',
                timestamp: new Date().toLocaleTimeString(),
                analysis: null,
              }
            : m
        )
      );
    } finally {
      if (simpleChatStepTimer !== undefined) {
        clearTimeout(simpleChatStepTimer);
        simpleChatStepTimer = undefined;
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  const sendQuickMessage = (msg) => {
    setInputValue(msg);
    void sendMessage(msg);
  };

  const getEmotionEmoji = (emotion) => {
    const m = { happy: '😊', sad: '😢', angry: '😤', excited: '🎉', neutral: '😐', confused: '🤔', curious: '🔍', frustrated: '😩' };
    return m[emotion] || '😐';
  };
  const getIntentEmoji = (intent) => {
    const m = { question: '❓', greeting: '👋', request: '🙏', complaint: '😠', compliment: '👍', goodbye: '👋', help: '🆘', information: 'ℹ️' };
    return m[intent] || 'ℹ️';
  };

  return (
    <div className="main-content bw-detail-root" data-testid="simple-chat-main-content">
      <div className="bw-detail-header">
        <div className="bw-detail-header-inner">
          <div className="bw-detail-header-left">
            <div className="bw-detail-header-icon">
              <MessageSquare size={20} aria-hidden />
            </div>
            <div>
              <h2 className="bw-detail-header-title">간단 대화</h2>
              <p className="bw-detail-header-desc">고급 AI 감정·의도 분석이 적용된 대화를 진행하세요</p>
            </div>
          </div>
          <div className="bw-detail-header-actions header-right">
            <div className="bw-model-selector">
              <span>고급 AI</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><polyline points="6,9 12,15 18,9"/></svg>
            </div>
            <button className="bw-btn-ghost" type="button" aria-label="업그레이드">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              업그레이드
            </button>
            <button className="bw-btn-ghost bw-btn-icon" type="button" aria-label="프로필">U</button>
          </div>
        </div>
      </div>
      <div className="bw-detail-content">
      <div className="chat-container" data-testid="simple-chat-container">
        <div className="chat-messages">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.sender}`}>
              <div className="message-avatar">{message.sender === 'user' ? 'U' : 'AI'}</div>
              <div className="message-content">
                <div>{message.content}</div>
                <div className="message-time">{message.timestamp}</div>
                {message.analysis && (
                  <div className="analysis-panel">
                    <div className="analysis-title">🧠 AI 분석 결과</div>
                    <div className="emotion-analysis">
                      <span className={`emotion-tag emotion-${message.analysis.emotion?.emotion}`}>
                        {getEmotionEmoji(message.analysis.emotion?.emotion)} {message.analysis.emotion?.emotion}
                      </span>
                      <div className="confidence-bar"><div className="confidence-fill" style={{ width: `${(message.analysis.emotion?.confidence || 0) * 100}%` }} /></div>
                      <span className="confidence-value">{Math.round((message.analysis.emotion?.confidence || 0) * 100)}%</span>
                    </div>
                    <div className="intent-analysis">
                      <span className={`intent-tag intent-${message.analysis.intent?.intent}`}>
                        {getIntentEmoji(message.analysis.intent?.intent)} {message.analysis.intent?.intent}
                      </span>
                      <div className="confidence-bar"><div className="confidence-fill" style={{ width: `${(message.analysis.intent?.confidence || 0) * 100}%` }} /></div>
                      <span className="confidence-value">{Math.round((message.analysis.intent?.confidence || 0) * 100)}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping &&
            !messages.some((m) => m.generationPlaceholder) && (
            <div className="typing-indicator show" role="status" aria-live="polite" aria-label="답변 생성 중">CORBU.AI가 답변을 생성하고 있습니다<span className="typing-dots">...</span></div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input-container bw-page-input-dock">
          <div className="quick-actions">
            <button type="button" className="quick-action-btn" onClick={() => sendQuickMessage('안녕하세요!')} aria-label="인사 메시지 보내기">인사</button>
            <button type="button" className="quick-action-btn" onClick={() => sendQuickMessage('파이썬 웹 개발에 대해 알려주세요')} aria-label="웹 개발 질문 보내기">웹 개발</button>
            <button type="button" className="quick-action-btn" onClick={() => sendQuickMessage('머신러닝 기초를 설명해주세요')} aria-label="머신러닝 질문 보내기">머신러닝</button>
            <button type="button" className="quick-action-btn" onClick={() => sendQuickMessage('데이터 분석 도구를 추천해주세요')} aria-label="데이터 분석 질문 보내기">데이터 분석</button>
          </div>
          <div className="bw-figma-composer">
            <div className="input-attachments">
              <button type="button" className="attachment-btn bw-figma-composer-add" title="파일 첨부" aria-label="파일 첨부">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49"/></svg>
              </button>
              <button type="button" className="attachment-btn bw-figma-composer-add" title="이미지 첨부" aria-label="이미지 첨부">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>
              </button>
            </div>
            <textarea
              className="chat-input bw-input bw-figma-composer-field"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type '/' for commands"
              rows={1}
              aria-label="메시지 입력"
            />
            <div className="input-actions">
              <button
                type="button"
                className="send-btn bw-figma-composer-action bw-figma-composer-action--primary"
                onClick={() => void sendMessage()}
                disabled={!coerceTrimmedString(inputValue, '') || isTyping}
                title="전송"
                aria-label="메시지 전송"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9 22,2"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
