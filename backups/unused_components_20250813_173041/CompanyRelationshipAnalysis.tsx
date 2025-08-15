import React from 'react';

interface CompanyRelationshipAnalysisProps {
    selectedRoomId: string;
}

const CompanyRelationshipAnalysis: React.FC<CompanyRelationshipAnalysisProps> = ({ selectedRoomId }) => {
    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">기업 관계 분석</h2>
            <p className="text-gray-600">기업 관계 분석 기능이 여기에 구현됩니다.</p>
        </div>
    );
};

export default CompanyRelationshipAnalysis; 