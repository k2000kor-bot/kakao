import React from 'react';

interface ConstructionBiasAnalysisProps {
  selectedRoomId: string;
}

const ConstructionBiasAnalysis: React.FC<ConstructionBiasAnalysisProps> = ({ selectedRoomId }) => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">시공사 편향 분석</h2>
      <p className="text-gray-600">시공사 편향 분석 기능이 여기에 구현됩니다.</p>
    </div>
  );
};

export default ConstructionBiasAnalysis; 