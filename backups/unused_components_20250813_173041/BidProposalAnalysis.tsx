import React from 'react';

interface BidProposalAnalysisProps {
  selectedRoomId: string;
}

const BidProposalAnalysis: React.FC<BidProposalAnalysisProps> = ({ selectedRoomId }) => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">입찰 제안서 분석</h2>
      <p className="text-gray-600">입찰 제안서 분석 기능이 여기에 구현됩니다.</p>
    </div>
  );
};

export default BidProposalAnalysis; 