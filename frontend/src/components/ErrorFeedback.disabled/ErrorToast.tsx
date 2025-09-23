import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info, 
  X,
  RefreshCw,
  Home
} from 'lucide-react';
import { UserFeedback } from '../../services/errorHandlingService';

interface ErrorToastProps {
  feedback: UserFeedback;
  onClose: () => void;
  onAction?: (actionIndex: number) => void;
}

const ErrorToast: React.FC<ErrorToastProps> = ({ feedback, onClose, onAction }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (feedback.duration && feedback.duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // 애니메이션 완료 후 제거
      }, feedback.duration);

      return () => clearTimeout(timer);
    }
  }, [feedback.duration, onClose]);

  const getIcon = () => {
    switch (feedback.type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-red-600" />;
      case 'info':
      default:
        return <Info className="h-6 w-6 text-blue-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (feedback.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getActionButtonStyle = (style?: string) => {
    switch (style) {
      case 'primary':
        return 'bg-blue-600 text-white hover:bg-blue-700';
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700';
      case 'secondary':
      default:
        return 'bg-gray-200 text-gray-800 hover:bg-gray-300';
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`fixed top-4 right-4 z-50 max-w-md w-full ${getBackgroundColor()} border rounded-lg shadow-lg p-4`}
        >
          <div className="flex items-start space-x-3">
            {/* 아이콘 */}
            <div className="flex-shrink-0 mt-0.5">
              {getIcon()}
            </div>

            {/* 내용 */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                {feedback.title}
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {feedback.message}
              </p>

              {/* 액션 버튼들 */}
              {feedback.actions && feedback.actions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {feedback.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        action.action();
                        if (onAction) onAction(index);
                      }}
                      className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${getActionButtonStyle(action.style)}`}
                    >
                      {action.label === '다시 시도' && <RefreshCw className="h-3 w-3 mr-1" />}
                      {action.label === '홈으로 이동' && <Home className="h-3 w-3 mr-1" />}
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 닫기 버튼 */}
            <button
              onClick={handleClose}
              className="flex-shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* 진행 바 (자동 사라지는 토스트용) */}
          {feedback.duration && feedback.duration > 0 && (
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-gray-300 rounded-b-lg overflow-hidden"
              style={{ width: '100%' }}
            >
              <motion.div
                className="h-full bg-blue-500"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: feedback.duration / 1000, ease: 'linear' }}
              />
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorToast;
