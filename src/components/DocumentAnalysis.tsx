import React from 'react';

interface DocumentAnalysisProps {
  selectedRoomId: string;
}

const DocumentAnalysis: React.FC<DocumentAnalysisProps> = ({ selectedRoomId }) => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">문서 분석</h2>
      <p className="text-gray-600">문서 분석 기능이 여기에 구현됩니다.</p>
    </div>
  );
};

export default DocumentAnalysis; 