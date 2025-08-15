import React from 'react';
import MessageGuidanceSystem from './MessageGuidanceSystem';

interface IntegratedProjectDashboardProps {
  projectId?: string;
  knowledgeBaseId?: string;
}

const IntegratedProjectDashboard: React.FC<IntegratedProjectDashboardProps> = ({
  projectId,
  knowledgeBaseId
}) => {
  const handleClose = () => {
    console.log('MessageGuidanceSystem closed');
  };

  return (
    <div className="h-screen w-full">
      <MessageGuidanceSystem onClose={handleClose} />
    </div>
  );
};

export default IntegratedProjectDashboard; 