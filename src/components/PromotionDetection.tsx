import React from 'react';

interface PromotionDetectionProps {
  selectedRoomId: string;
}

const PromotionDetection: React.FC<PromotionDetectionProps> = ({ selectedRoomId }) => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">홍보 감지</h2>
      <p className="text-gray-600">홍보 감지 기능이 여기에 구현됩니다.</p>
    </div>
  );
};

export default PromotionDetection; 