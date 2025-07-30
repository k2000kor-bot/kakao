import React from 'react';

interface VoiceRecognitionProps {
  selectedRoomId: string;
}

const VoiceRecognition: React.FC<VoiceRecognitionProps> = ({ selectedRoomId }) => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">음성 인식</h2>
      <p className="text-gray-600">음성 인식 기능이 여기에 구현됩니다.</p>
    </div>
  );
};

export default VoiceRecognition; 