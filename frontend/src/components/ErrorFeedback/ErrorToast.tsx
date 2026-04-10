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
        return <CheckCircle className="h-6 w-6 bw-text-success" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 bw-text-warning" />;
      case 'error':
        return <XCircle className="h-6 w-6 bw-text-error" />;
      case 'info':
      default:
        return <Info className="h-6 w-6 bw-text-info" />;
    }
  };

  const getToastStyle = (): React.CSSProperties => {
    switch (feedback.type) {
      case 'success':
        return { background: 'var(--accent-success-muted)', borderColor: 'var(--accent-success)' };
      case 'warning':
        return { background: 'var(--accent-warning-muted)', borderColor: 'var(--accent-warning)' };
      case 'error':
        return { background: 'var(--accent-error-muted)', borderColor: 'var(--accent-error)' };
      case 'info':
      default:
        return { background: 'var(--accent-info-muted)', borderColor: 'var(--accent-info)' };
    }
  };

  const getActionButtonClass = (style?: string) => {
    switch (style) {
      case 'primary':
        return 'bw-btn-primary text-xs py-1.5 px-3';
      case 'danger':
        return 'bw-btn-danger text-xs py-1.5 px-3';
      case 'secondary':
      default:
        return 'bw-btn-secondary text-xs py-1.5 px-3';
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
          className="fixed top-4 right-4 z-[var(--z-toast)] max-w-md w-full border rounded-lg shadow-lg p-4"
          style={{ ...getToastStyle(), borderWidth: 1, borderStyle: 'solid' }}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {getIcon()}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold bw-text-primary mb-1">
                {feedback.title}
              </h3>
              <p className="text-sm bw-text-secondary leading-relaxed">
                {feedback.message}
              </p>

              {feedback.actions && feedback.actions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {feedback.actions.map((action, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        action.action();
                        if (onAction) onAction(index);
                      }}
                      className={`inline-flex items-center rounded-md ${getActionButtonClass(action.style)}`}
                    >
                      {action.label === '다시 시도' && <RefreshCw className="h-3 w-3 mr-1" />}
                      {action.label === '홈으로 이동' && <Home className="h-3 w-3 mr-1" />}
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button type="button" onClick={handleClose} className="bw-btn-ghost flex-shrink-0 p-1 rounded-md" aria-label="오류 토스트 닫기">
              <X className="h-4 w-4 bw-text-muted" aria-hidden="true" />
            </button>
          </div>

          {feedback.duration && feedback.duration > 0 && (
            <motion.div
              className="absolute bottom-0 left-0 h-1 rounded-b-lg overflow-hidden"
              style={{ width: '100%', background: 'var(--bg-tertiary)' }}
            >
              <motion.div
                className="h-full"
                style={{ background: 'var(--accent-info)' }}
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
