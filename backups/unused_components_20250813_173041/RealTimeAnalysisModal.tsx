import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import RealTimeAIAnalysis from './RealTimeAIAnalysis';
import { ProjectFile } from '../types/project';

interface RealTimeAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: ProjectFile | null;
}

const RealTimeAnalysisModal: React.FC<RealTimeAnalysisModalProps> = ({
  isOpen,
  onClose,
  file
}) => {
  if (!isOpen || !file) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">실시간 AI 분석</h2>
            <p className="text-sm text-gray-500">{file.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            title="닫기"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          <RealTimeAIAnalysis
            fileId={file.id}
            fileName={file.name}
            onAnalysisComplete={(analysis) => {
              console.log('분석 완료:', analysis);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default RealTimeAnalysisModal;
