import React from 'react';
import { useNavigate } from 'react-router-dom';

interface CORBULogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

const CORBULogo: React.FC<CORBULogoProps> = ({ size = 'md', className = '', onClick }) => {
  const navigate = useNavigate();
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // React Router를 사용한 홈 이동
      navigate('/');
    }
  };

  return (
    <div
      className={`flex items-center space-x-2 ${className} ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-lg">
        <span className="text-white text-lg">🤖</span>
      </div>
      <div className={`font-bold text-gray-900 ${sizeClasses[size]}`}>
        CORBU.AI
      </div>
    </div>
  );
};

export default CORBULogo; 