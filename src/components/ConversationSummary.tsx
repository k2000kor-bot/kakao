import React, { useState } from 'react';
import { FiPlus, FiMic } from 'react-icons/fi';

const ConversationSummary: React.FC = () => {
  const [inputMessage, setInputMessage] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;
    // 메시지 전송 로직
    setInputMessage('');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-800 text-white flex flex-col">
        {/* Top Section */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded"></div>
            <span className="font-semibold">CORBU.AI</span>
          </div>
          <div className="flex space-x-2">
            <div className="w-6 h-6 bg-gray-600 rounded"></div>
            <div className="w-6 h-6 bg-gray-600 rounded"></div>
            <div className="w-6 h-6 bg-gray-600 rounded"></div>
            <div className="w-6 h-6 bg-gray-600 rounded"></div>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 p-4 space-y-4">
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-4 h-4 bg-gray-600 rounded"></div>
            <span>새 채팅</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-4 h-4 bg-gray-600 rounded"></div>
            <span>채팅 검색</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-4 h-4 bg-gray-600 rounded"></div>
            <span>라이브러리</span>
          </div>

          <div className="space-y-2 text-sm">
            <div>Codex</div>
            <div>Sora</div>
            <div>GPT</div>
            <div>챗</div>
          </div>

          {/* Project Section */}
          <div className="pt-4">
            <div className="flex items-center space-x-3 text-sm mb-4">
              <div className="w-4 h-4 bg-gray-600 rounded"></div>
              <span>새 프로젝트</span>
            </div>
            <div className="flex items-center space-x-3 text-sm mb-4">
              <div className="w-4 h-4 bg-gray-600 rounded"></div>
              <span>바이럴</span>
            </div>

            {/* Project List */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-600 rounded"></div>
                <span>채팅방 논의 요약</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-600 rounded"></div>
                <span>행복한소유 개포우성7차 요약</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-600 rounded"></div>
                <span>삼성 홍보 반박</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-600 rounded"></div>
                <span>70대 조합원 반박글</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-700 p-2 rounded">
                <div className="w-3 h-3 bg-gray-600 rounded"></div>
                <span>DA 설계 의견 요청</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-600 rounded"></div>
                <span>모두 보기</span>
              </div>
            </div>

            {/* Additional Sections */}
            <div className="pt-4 space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-600 rounded"></div>
                <span>개포우성_실명방</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-600 rounded"></div>
                <span>부동산뉴스</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-600 rounded"></div>
                <span>웨딩다이어리</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-600 rounded"></div>
                <span>바이럴메뉴얼</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-600 rounded"></div>
                <span>더 보기</span>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="pt-4">
            <div className="text-sm font-medium mb-2">채팅</div>
            <div className="space-y-2 text-sm">
              <div>SM-T530 루팅 방법</div>
              <div>상가 보상 비율 분석</div>
              <div>지하철 직결 아파트</div>
              <div>원격주차보조 사용법</div>
              <div>금리 차이 및 조건 비교</div>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
            <span className="text-sm">KIM HOBUM</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="font-semibold">CORBU.AI</span>
              <div className="flex space-x-2">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
              </div>
            </div>
            <button className="px-4 py-2 bg-blue-500 text-white rounded text-sm flex items-center space-x-2">
              <div className="w-4 h-4 bg-white rounded"></div>
              <span>공유하기</span>
            </button>
          </div>
        </div>

        {/* Document Display Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Top Action Buttons */}
            <div className="flex justify-end space-x-2 mb-6">
              <button className="px-4 py-2 bg-blue-500 text-white rounded text-sm">
                대화내용 요약해줘
              </button>
              <button
                className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center"
                title="편집"
              >
                <div className="w-4 h-4 bg-gray-600 rounded-sm"></div>
              </button>
              <button
                className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center"
                title="다운로드"
              >
                <div className="w-4 h-4 bg-gray-600 rounded-sm"></div>
              </button>
            </div>

            {/* Conversation Summary */}
            <div className="bg-white rounded-lg p-6 shadow-sm border mb-6">
              <div className="prose max-w-none">
                <h2 className="text-lg font-bold mb-4">
                  다음은 실명 채팅방 [인증] 행복한소유 개포우성7차의 2025년 7월 14일 대화 내용을 주요 이슈 중심으로 정리한 요약입니다:
                </h2>

                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full mt-1"></div>
                    <div>
                      <h3 className="font-semibold">1. 시공사 평가 기준 및 설명회 기대</h3>
                      <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                        <li><strong>이재헌:</strong> 시공사 평가 기준이 중요하다고 강조</li>
                        <li><strong>박재우:</strong> 내용 확인의 중요성 언급</li>
                        <li><strong>박은진:</strong> 설명회 발표자의 중요성 강조</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full mt-1"></div>
                    <div>
                      <h3 className="font-semibold">2. 공사비 관련 견해</h3>
                      <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                        <li><strong>이재헌:</strong> 공사비가 같을 경우 브랜드 등 다양한 요소 고려</li>
                        <li><strong>박재우:</strong> GS와 삼성 조건 비교 불가 주장</li>
                        <li><strong>정지혜:</strong> 제안서 확인 후 판단 주장</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Down Arrow */}
            <div className="text-center mb-4">
              <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center mx-auto">
                <div className="w-2 h-2 bg-white rounded-sm"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Input Bar */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="max-w-4xl mx-auto">
            <div className={`bg-gray-50 rounded-lg border border-gray-300 p-4 transition-all duration-200 ${isInputFocused ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
              }`}>
              {/* Input Field */}
              <div className="flex items-start space-x-3">
                {/* Left Tools */}
                <div className="flex items-center space-x-2">
                  <button
                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800"
                    title="파일 첨부"
                  >
                    <div className="w-4 h-4 bg-gray-500 rounded"></div>
                  </button>
                  <button
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
                    title="도구 메뉴"
                  >
                    <div className="w-4 h-4 bg-black rounded-sm flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-sm"></div>
                    </div>
                    <span className="text-sm">도구</span>
                  </button>
                </div>

                {/* Main Input */}
                <div className="flex-1">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="무엇이든 물어보세요"
                    className={`w-full bg-transparent border-none outline-none resize-none text-gray-900 transition-all duration-200 ${inputMessage.trim() === ''
                      ? 'placeholder-gray-400'
                      : 'placeholder-gray-500'
                      } focus:placeholder-gray-600`}
                    rows={3}
                    title="메시지 입력"
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                  />
                </div>

                {/* Right Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800"
                    title="음성 입력"
                  >
                    <div className="w-4 h-4 bg-gray-500 rounded"></div>
                  </button>
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <div className="flex space-x-0.5">
                      <div className="w-0.5 h-2 bg-gray-400 rounded-sm"></div>
                      <div className="w-0.5 h-4 bg-gray-400 rounded-sm"></div>
                      <div className="w-0.5 h-5 bg-gray-400 rounded-sm"></div>
                      <div className="w-0.5 h-4 bg-gray-400 rounded-sm"></div>
                      <div className="w-0.5 h-2 bg-gray-400 rounded-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationSummary; 