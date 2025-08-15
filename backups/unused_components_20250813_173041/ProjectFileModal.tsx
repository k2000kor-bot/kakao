import React from 'react';
import { FiX } from 'react-icons/fi';

interface ProjectFileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProjectFileModal: React.FC<ProjectFileModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">프로젝트 파일</h2>
          <div className="flex items-center space-x-2">
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm">
              파일 추가
            </button>
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={onClose}
              title="닫기"
            >
              <div className="w-5 h-5 bg-gray-500 rounded"></div>
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Informational Text */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-1">파일이 응답에 영향을 줍니다</p>
            <p className="text-sm text-gray-600">
              이 프로젝트가 사용하는 파일의 수로 인해 응답의 품질이 저하될 수 있습니다.
            </p>
          </div>

          {/* Attached File */}
          <div className="bg-pink-100 rounded-lg p-3 border border-pink-200">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-pink-500 rounded mr-3 flex items-center justify-center">
                <div className="w-2 h-3 bg-white rounded-sm"></div>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  [인증] 행복한소유☆개포우성7차.txt
                </div>
                <div className="text-xs text-gray-500">문서</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectFileModal; 