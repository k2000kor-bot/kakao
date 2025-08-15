import React, { useState, useEffect } from 'react';

const SimpleBrainwave: React.FC = () => {
    const [messageIntent, setMessageIntent] = useState('');
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">간단한 메시지 생성기</h1>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">메시지 취지:</label>
                <input
                    type="text"
                    value={messageIntent}
                    onChange={(e) => setMessageIntent(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="메시지 취지를 입력하세요"
                />
            </div>

            <button
                onClick={() => alert(`취지: ${messageIntent}`)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                메시지 생성
            </button>
        </div>
    );
};

export default SimpleBrainwave; 