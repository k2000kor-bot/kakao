import React from 'react';
import MessageGuidanceSystem from './MessageGuidanceSystem';

interface IntegratedChatInterfaceProps {
  selectedRoomId?: string;
}

const IntegratedChatInterface: React.FC<IntegratedChatInterfaceProps> = ({ selectedRoomId }) => {
  const handleClose = () => {
    console.log('MessageGuidanceSystem closed');
  };

  return (
    <div className="h-screen w-full">
      <MessageGuidanceSystem onClose={handleClose} />
    </div>
  );
};

export default IntegratedChatInterface; 