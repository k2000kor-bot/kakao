import React from 'react';

/** CORBU.AI UI Kit (Figma node-id=7-3) 테마 변수 사용 */
const ChatGPTInterfaceSimple: React.FC = () => {
    return (
        <div className="brainwave-simple-screen">
            <h1 className="brainwave-simple-title">✅ 프론트엔드 정상 작동</h1>
            <p className="brainwave-simple-desc">React가 정상적으로 렌더링되고 있습니다.</p>
            <p className="brainwave-simple-hint">이 메시지가 보이면 기본 설정은 정상입니다.</p>
            <div className="brainwave-simple-card">
                <h2 className="brainwave-simple-card-title">다음 단계:</h2>
                <ol className="brainwave-simple-list">
                    <li>브라우저 개발자 도구(F12) 열기</li>
                    <li>Console 탭에서 에러 확인</li>
                    <li>Network 탭에서 API 요청 상태 확인</li>
                    <li>에러가 없다면 App.tsx에서 USE_SIMPLE_MODE를 false로 변경</li>
                </ol>
            </div>
        </div>
    );
};

export default ChatGPTInterfaceSimple;
