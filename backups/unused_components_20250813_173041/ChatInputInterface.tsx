import React from 'react';
import UnifiedDoctorLevelInput from './UnifiedDoctorLevelInput';

interface ChatInputInterfaceProps {
  onSendMessage: (message: string) => void;
  onFileUpload: (files: FileList) => void;
  onVoiceInput: () => void;
  isProcessing?: boolean;
  placeholder?: string;
  className?: string;
}

const ChatInputInterface: React.FC<ChatInputInterfaceProps> = ({
  onSendMessage,
  onFileUpload,
  onVoiceInput,
  isProcessing = false,
  placeholder = "무엇이든 물어보세요...",
  className = ""
}) => {
  return (
    <div className={`bg-white border-t border-gray-200 p-4 ${className}`}>
      <UnifiedDoctorLevelInput
        onSendMessage={onSendMessage}
        onFileUpload={(files) => onFileUpload(files as any)}
        onVoiceInput={onVoiceInput}
        placeholder={placeholder}
        disabled={isProcessing}
        isLoading={isProcessing}
        showFileUpload={true}
        showVoiceInput={true}
        showToolButton={true}
        showStyleButtons={true}
        autoFocus={true}
        maxLength={10000}
      />
    </div>
  );
};

export default ChatInputInterface; 