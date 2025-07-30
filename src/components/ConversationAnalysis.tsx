import React from 'react';

interface ConversationAnalysisProps {
  selectedRoomId: string;
}

const ConversationAnalysis: React.FC<ConversationAnalysisProps> = ({ selectedRoomId }) => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">대화 분석</h2>
      <p className="text-gray-600">대화 분석 기능이 여기에 구현됩니다.</p>
    </div>
  );
};

export default ConversationAnalysis; 