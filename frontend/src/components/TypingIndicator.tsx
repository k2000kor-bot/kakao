/**
 * 실시간 타이핑 인디케이터 컴포넌트
 * AI가 메시지를 입력 중일 때 표시되는 애니메이션
 * 
 * Task-G1: 실시간 타이핑 인디케이터 개선
 */

import React from 'react';
import './TypingIndicator.css';

interface TypingIndicatorProps {
  /**
   * 타이핑 중인 사용자 이름 (선택사항)
   */
  userName?: string;
  
  /**
   * 애니메이션 속도 (ms)
   */
  animationSpeed?: number;
  
  /**
   * 점의 개수
   */
  dotCount?: number;
  
  /**
   * 크기 (small, medium, large)
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * 색상 테마
   */
  theme?: 'default' | 'primary' | 'secondary';
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  userName,
  animationSpeed = 600,
  dotCount = 3,
  size = 'medium',
  theme = 'default',
}) => {
  const dots = Array.from({ length: dotCount }, (_, i) => i);

  return (
    <div 
      className={`typing-indicator typing-indicator-${size} typing-indicator-${theme}`}
      role="status"
      aria-live="polite"
      aria-label={userName ? `${userName}이(가) 입력 중입니다` : '입력 중입니다'}
    >
      {userName && (
        <span className="typing-indicator-label">{userName}</span>
      )}
      <div className="typing-indicator-dots">
        {dots.map((index) => (
          <span
            key={index}
            className="typing-indicator-dot"
            style={{
              animationDelay: `${(index * animationSpeed) / dotCount}ms`,
            }}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
};

export default TypingIndicator;

