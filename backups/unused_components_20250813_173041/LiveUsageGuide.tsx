import React from 'react';
import {
    LightBulbIcon,
    SparklesIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const LiveUsageGuide: React.FC = () => {
    return (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 mb-3">
                <LightBulbIcon className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">💡 사용 방법</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <div>
                        <p className="font-medium text-blue-900">메시지 취지 입력</p>
                        <p className="text-blue-700">원하는 메시지의 목적을 구체적으로 작성하세요</p>
                    </div>
                </div>

                <div className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <div>
                        <p className="font-medium text-purple-900">형식 선택</p>
                        <p className="text-purple-700">22가지 형식 중 원하는 톤을 선택하세요</p>
                    </div>
                </div>

                <div className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <div>
                        <p className="font-medium text-green-900">생성 및 확인</p>
                        <p className="text-green-700">생성 버튼을 눌러 다양한 메시지를 확인하세요</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-blue-200">
                <div className="flex items-center space-x-2 text-xs text-blue-600">
                    <SparklesIcon className="h-4 w-4" />
                    <span>AI가 맥락을 이해하여 최적의 메시지를 생성합니다</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-purple-600">
                    <ChatBubbleLeftRightIcon className="h-4 w-4" />
                    <span>실시간으로 대화 히스토리가 저장됩니다</span>
                </div>
            </div>
        </div>
    );
};

export default LiveUsageGuide; 