import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { errorLogger } from './utils/errorLogger';

function App() {
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
    // 세션 ID 생성
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
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString(),
      analysis: null
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'user'
        },
        body: JSON.stringify({
          message: inputValue,
          session_id: sessionId
        })
      });

      const data = await response.json();
      setIsTyping(false);

      if (data.success) {
        const aiMessage = {
          id: Date.now() + 1,
          sender: 'ai',
          content: data.response,
          timestamp: new Date().toLocaleTimeString(),
          analysis: data.emotion_analysis && data.intent_analysis ? {
            emotion: data.emotion_analysis,
            intent: data.intent_analysis
          } : null
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorMessage = {
          id: Date.now() + 1,
          sender: 'ai',
          content: '죄송합니다. 답변을 생성하는 데 문제가 발생했습니다: ' + data.error,
          timestamp: new Date().toLocaleTimeString(),
          analysis: null
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      setIsTyping(false);
      errorLogger.error('메시지 전송 오류', error instanceof Error ? error : new Error(String(error)), {
        component: 'App',
        action: 'sendMessage',
        sessionId,
      });
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        content: '네트워크 오류가 발생했습니다. 다시 시도해주세요.',
        timestamp: new Date().toLocaleTimeString(),
        analysis: null
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendQuickMessage = (message) => {
    setInputValue(message);
    setTimeout(() => sendMessage(), 100);
  };

  const getEmotionEmoji = (emotion) => {
    const emojis = {
      'happy': '😊',
      'sad': '😢',
      'angry': '😤',
      'excited': '🎉',
      'neutral': '😐',
      'confused': '🤔',
      'curious': '🔍',
      'frustrated': '😩'
    };
    return emojis[emotion] || '😐';
  };

  const getIntentEmoji = (intent) => {
    const emojis = {
      'question': '❓',
      'greeting': '👋',
      'request': '🙏',
      'complaint': '😠',
      'compliment': '👍',
      'goodbye': '👋',
      'help': '🆘',
      'information': 'ℹ️'
    };
    return emojis[intent] || 'ℹ️';
  };

  return (
    <div className="app-container">
      {/* 사이드바 */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-title">CORBU.AI</div>
          <button className="new-chat-btn" onClick={() => window.location.reload()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            새 채팅
          </button>
        </div>
        
        <div className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">기능</div>
            <div className="nav-item active">
              <div className="nav-item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              일반 채팅
            </div>
            <div className="nav-item">
              <div className="nav-item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                </svg>
              </div>
              코딩 파트너
            </div>
            <div className="nav-item">
              <div className="nav-item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 19c-5 0-9-4-9-9s4-9 9-9 9 4 9 9-4 9-9 9zM21 3l-6 6"/>
                </svg>
              </div>
              텍스트 분석
            </div>
          </div>
          
          <div className="nav-section">
            <div className="nav-section-title">최근 대화</div>
            <div className="nav-item">
              <div className="nav-item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              웹 개발 질문
            </div>
            <div className="nav-item">
              <div className="nav-item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              데이터 분석 도움
            </div>
          </div>
        </div>
        
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">U</div>
            <div>
              <div style={{fontWeight: 500, color: '#1f2937'}}>사용자</div>
              <div style={{fontSize: '12px'}}>CORBU.AI Plus</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 메인 컨텐츠 */}
      <div className="main-content">
        <div className="main-header">
          <div className="header-left">
            <div className="header-title">CORBU.AI</div>
            <div className="model-selector">
              <span>고급 AI</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6,9 12,15 18,9"/>
              </svg>
            </div>
          </div>
          <div className="header-right">
            <button className="upgrade-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              업그레이드
            </button>
            <button className="profile-btn">U</button>
          </div>
        </div>
        
        <div className="chat-container">
          <div className="chat-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-avatar">
                  {message.sender === 'user' ? 'U' : 'AI'}
                </div>
                <div className="message-content">
                  <div>{message.content}</div>
                  <div className="message-time">{message.timestamp}</div>
                  
                  {message.analysis && (
                    <div className="analysis-panel">
                      <div className="analysis-title">🧠 AI 분석 결과</div>
                      <div className="emotion-analysis">
                        <span className={`emotion-tag emotion-${message.analysis.emotion.emotion}`}>
                          {getEmotionEmoji(message.analysis.emotion.emotion)} {message.analysis.emotion.emotion}
                        </span>
                        <div className="confidence-bar">
                          <div 
                            className="confidence-fill" 
                            style={{width: `${message.analysis.emotion.confidence * 100}%`}}
                          ></div>
                        </div>
                        <span style={{fontSize: '12px', color: '#64748b'}}>
                          {Math.round(message.analysis.emotion.confidence * 100)}%
                        </span>
                      </div>
                      <div className="intent-analysis">
                        <span className={`intent-tag intent-${message.analysis.intent.intent}`}>
                          {getIntentEmoji(message.analysis.intent.intent)} {message.analysis.intent.intent}
                        </span>
                        <div className="confidence-bar">
                          <div 
                            className="confidence-fill" 
                            style={{width: `${message.analysis.intent.confidence * 100}%`}}
                          ></div>
                        </div>
                        <span style={{fontSize: '12px', color: '#64748b'}}>
                          {Math.round(message.analysis.intent.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="typing-indicator show">
                CORBU.AI가 답변을 생성하고 있습니다<span className="typing-dots">...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="chat-input-container">
            <div className="quick-actions">
              <button className="quick-action-btn" onClick={() => sendQuickMessage('안녕하세요!')}>
                인사
              </button>
              <button className="quick-action-btn" onClick={() => sendQuickMessage('파이썬 웹 개발에 대해 알려주세요')}>
                웹 개발
              </button>
              <button className="quick-action-btn" onClick={() => sendQuickMessage('머신러닝 기초를 설명해주세요')}>
                머신러닝
              </button>
              <button className="quick-action-btn" onClick={() => sendQuickMessage('데이터 분석 도구를 추천해주세요')}>
                데이터 분석
              </button>
            </div>
            
            <div className="input-wrapper">
              <div className="input-attachments">
                <button className="attachment-btn" title="파일 첨부">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49"/>
                  </svg>
                </button>
                <button className="attachment-btn" title="이미지 첨부">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21,15 16,10 5,21"/>
                  </svg>
                </button>
              </div>
              
              <textarea 
                className="chat-input" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="CORBU.AI에게 무엇이든 물어보세요..."
                rows="1"
              />
              
              <div className="input-actions">
                <button className="voice-btn" title="음성 입력">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                </button>
                <button className="send-btn" onClick={sendMessage} title="전송">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22,2 15,22 11,13 2,9 22,2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
