import React, { useState, useEffect } from 'react';
import ErrorToast from './ErrorToast';
import { UserFeedback, errorHandlingService } from '../../services/errorHandlingService';

interface ActiveFeedback extends UserFeedback {
  id: string;
  timestamp: number;
}

const ErrorFeedbackContainer: React.FC = () => {
  const [activeFeedbacks, setActiveFeedbacks] = useState<ActiveFeedback[]>([]);

  useEffect(() => {
    // 에러 핸들링 서비스에 피드백 콜백 등록
    const handleFeedback = (feedback: UserFeedback) => {
      const activeFeedback: ActiveFeedback = {
        ...feedback,
        id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now()
      };

      setActiveFeedbacks(prev => {
        // 최대 5개까지만 표시
        const newFeedbacks = [...prev, activeFeedback];
        return newFeedbacks.slice(-5);
      });
    };

    errorHandlingService.registerFeedbackCallback(handleFeedback);

    // 컴포넌트 언마운트 시 정리는 현재 서비스에서 지원하지 않음
    // 실제 구현에서는 unregister 메서드를 추가할 수 있음

    return () => {
      // 정리 로직 (필요시 구현)
    };
  }, []);

  const handleCloseFeedback = (id: string) => {
    setActiveFeedbacks(prev => prev.filter(feedback => feedback.id !== id));
  };

  const handleFeedbackAction = (id: string, actionIndex: number) => {
    // 액션 실행 후 피드백 제거 (선택적)
    // 일부 액션은 피드백을 유지할 수도 있음
    console.log(`피드백 ${id}의 액션 ${actionIndex} 실행됨`);
  };

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-3 pointer-events-none">
      {activeFeedbacks.map((feedback, index) => (
        <div
          key={feedback.id}
          className="pointer-events-auto"
          style={{
            transform: `translateY(${index * 10}px)`,
            zIndex: 50 - index
          }}
        >
          <ErrorToast
            feedback={feedback}
            onClose={() => handleCloseFeedback(feedback.id)}
            onAction={(actionIndex) => handleFeedbackAction(feedback.id, actionIndex)}
          />
        </div>
      ))}
    </div>
  );
};

export default ErrorFeedbackContainer;
