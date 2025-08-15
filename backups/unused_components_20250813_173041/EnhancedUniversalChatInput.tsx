import React, { useState, useRef, useEffect } from 'react';
import UnifiedDoctorLevelInput from './UnifiedDoctorLevelInput';

interface EnhancedUniversalChatInputProps {
  onSendMessage: (message: string) => void;
  onFileUpload?: (files: File[]) => void;
  onVoiceInput?: () => void;
  onToolClick?: () => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  showFileUpload?: boolean;
  showVoiceInput?: boolean;
  showToolButton?: boolean;
  autoFocus?: boolean;
  maxLength?: number;
  projectContext?: string;
  attachedFiles?: File[];
  onRemoveFile?: (file: File) => void;
  onClearFiles?: () => void;
}

const EnhancedUniversalChatInput: React.FC<EnhancedUniversalChatInputProps> = ({
  onSendMessage,
  onFileUpload,
  onVoiceInput,
  onToolClick,
  placeholder = "박사급 AI와 대화하세요. 복잡한 질문, 분석 요청, 연구 논의 등 무엇이든 물어보세요.",
  disabled = false,
  isLoading = false,
  className = "",
  showFileUpload = true,
  showVoiceInput = true,
  showToolButton = true,
  autoFocus = true,
  maxLength = 10000,
  projectContext,
  attachedFiles = [],
  onRemoveFile,
  onClearFiles
}) => {
  return (
    <div className={`bg-white border-t border-gray-200 p-4 ${className}`}>
      <UnifiedDoctorLevelInput
        onSendMessage={onSendMessage}
        onFileUpload={onFileUpload}
        onVoiceInput={onVoiceInput}
        onToolClick={onToolClick}
        placeholder={placeholder}
        disabled={disabled}
        isLoading={isLoading}
        showFileUpload={showFileUpload}
        showVoiceInput={showVoiceInput}
        showToolButton={showToolButton}
        showStyleButtons={true}
        autoFocus={autoFocus}
        maxLength={maxLength}
        projectContext={projectContext}
        attachedFiles={attachedFiles}
        onRemoveFile={onRemoveFile}
        onClearFiles={onClearFiles}
      />
    </div>
  );
};

export default EnhancedUniversalChatInput;
