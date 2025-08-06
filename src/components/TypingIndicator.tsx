import React from 'react';

interface TypingIndicatorProps {
  users: string[];
  isVisible: boolean;
  className?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ 
  users, 
  isVisible, 
  className = '' 
}) => {
  if (!isVisible || users.length === 0) {
    return null;
  }

  const userText = users.length === 1 
    ? users[0] 
    : users.length === 2 
    ? `${users[0]}와 ${users[1]}` 
    : `${users[0]} 외 ${users.length - 1}명`;

  return (
    <div className={`flex items-center space-x-2 text-gray-500 text-sm ${className}`}>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <span>{userText}이(가) 입력 중...</span>
    </div>
  );
};

export default TypingIndicator; 