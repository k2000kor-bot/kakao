import React from 'react';
import { FiX } from 'react-icons/fi';

interface GuidelineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GuidelineModal: React.FC<GuidelineModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">지침</h2>
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            onClick={onClose}
            title="닫기"
          >
            <div className="w-5 h-5 bg-gray-500 rounded"></div>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Guidelines Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">어떻게 하면 ChatGPT가 이 프로젝트를 최대한 도와드릴 수 있을까요?</h3>
            <p className="text-gray-600 mb-4">
              ChatGPT에게 특정 토픽에 집중해 달라고 하거나, 특정한 톤이나 포맷으로 응답해 달라고 할 수 있습니다.
            </p>
            <div className="border-t border-gray-200 pt-4"></div>
          </div>

          {/* Conversation Summary Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">개포우성 0000대화 요약</h3>
            <p className="text-sm text-gray-600 mb-2">2025년 00월 00일 오후 8시 이후 ~ 00월 00일 기준</p>
            <h4 className="font-medium mb-2">시공사 홍보 문제</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• GS건설과 삼성물산의 개별 홍보 활동 논란 지속</li>
              <li>• GS건설 홍보 요원이 일부 조합원의 집까지 방문했다는 제보가 이어짐.</li>
              <li>• 삼성물산도 홍보 활동을 진행 중이나 GS보다는 수위가 낮다는 의견 존재.</li>
              <li>• 조합원들 사이에서 불법 홍보에 대한 신고 및 강경 대응 필요성이 제기됨.</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuidelineModal; 