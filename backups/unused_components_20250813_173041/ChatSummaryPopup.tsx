import React, { useState, useRef, useEffect } from 'react';
import { useModalClose } from '../hooks/useModalClose';

interface ChatSummaryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const ChatSummaryPopup: React.FC<ChatSummaryPopupProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const { modalRef, handleClose } = useModalClose({
    isOpen,
    onClose
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto" ref={modalRef}>
        {/* 헤더 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">개포우성 0000대화 요약</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="대화 요약 팝업 닫기"
              title="ESC 키로도 닫을 수 있습니다"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            2025년 00월 00일 오후 8시 이후 ~ 00월 00일 기준
          </p>
        </div>

        {/* 내용 */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              시공사 홍보 문제 - 주요 내용
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="text-green-500 mt-1">✓</div>
                <p className="text-gray-700">
                  GS E&C와 삼성물산의 개별 홍보 활동에 대한 논란이 지속되고 있습니다.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-green-500 mt-1">✓</div>
                <p className="text-gray-700">
                  GS E&C 홍보 담당자가 일부 조합원 가정을 방문했다는 보고가 있습니다.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-green-500 mt-1">✓</div>
                <p className="text-gray-700">
                  삼성물산도 홍보 활동을 하고 있지만 GS보다는 적은 수준이라는 의견이 있습니다.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-green-500 mt-1">✓</div>
                <p className="text-gray-700">
                  조합원들 사이에서 불법 홍보 신고와 강력한 대응책 마련이 제기되고 있습니다.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              다음은 실명 채팅방 [인증]행복한소유★개포우성7차 의 2025년 7월 14일 대화 내용을 주요 이슈 중심으로 정리한 요약입니다:
            </h3>

            <div className="space-y-6">
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <div className="text-green-500">✓</div>
                  <h4 className="font-semibold text-gray-900">1. 시공사 평가 기준 및 설명회 기대</h4>
                </div>
                <div className="ml-6 space-y-2">
                  <p className="text-sm text-gray-700">
                    <strong>이재헌:</strong> 조합원들이 제안서를 보고 선택하는 것이 중요하다고 강조했습니다.
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>박재우:</strong> 점수 외에도 내용을 꼼꼼히 확인해야 한다고 조언했습니다.
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>박은진:</strong> 설명회에서 누가 설명하는지가 중요하다고 언급했습니다.
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <div className="text-green-500">✓</div>
                  <h4 className="font-semibold text-gray-900">2. 공사비 관련 견해</h4>
                </div>
                <div className="ml-6 space-y-2">
                  <p className="text-sm text-gray-700">
                    <strong>이재헌:</strong> 공사비가 동일할 경우 다양한 요소를 고려해야 한다고 제안했습니다.
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>박재우:</strong> 일부 조건들은 비교할 수 없다고 지적했습니다.
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>정지혜:</strong> 판단하기 전에 제안서를 평가해야 한다고 강조했습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              취소
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSummaryPopup; 