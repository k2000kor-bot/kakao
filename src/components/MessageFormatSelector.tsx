import React, { useState, useEffect } from 'react';

interface MessageFormat {
    [key: string]: string;
}

interface MessageFormatSelectorProps {
    onMessageGenerated?: (message: any) => void;
}

const MessageFormatSelector: React.FC<MessageFormatSelectorProps> = ({
    onMessageGenerated
}) => {
    const [formats, setFormats] = useState<MessageFormat>({});
    const [selectedFormat, setSelectedFormat] = useState<string>('중립');
    const [originalMessage, setOriginalMessage] = useState<string>('');
    const [context, setContext] = useState<string>('');
    const [recentMessages, setRecentMessages] = useState<string>('');
    const [generatedMessage, setGeneratedMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        fetchMessageFormats();
    }, []);

    const fetchMessageFormats = async () => {
        try {
            const response = await fetch('http://localhost:8011/api/message-formats');
            const data = await response.json();
            if (data.success) {
                setFormats(data.formats);
            }
        } catch (err) {
            setError('메시지 형식을 불러오는데 실패했습니다.');
        }
    };

    const generateFormattedMessage = async () => {
        if (!originalMessage.trim()) {
            setError('원본 메시지를 입력해주세요.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8011/api/generate-formatted-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    format_type: selectedFormat,
                    original_message: originalMessage,
                    context: context,
                    recent_messages: recentMessages ? recentMessages.split('\n').map(msg => ({ content: msg })) : []
                }),
            });

            const data = await response.json();

            if (data.success) {
                setGeneratedMessage(data.message.generated_message);
                onMessageGenerated?.(data.message);
            } else {
                setError(data.error || '메시지 생성에 실패했습니다.');
            }
        } catch (err) {
            setError('메시지 생성 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-center">메시지 형식 선택기</h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">메시지 형식</label>
                    <select
                        value={selectedFormat}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedFormat(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    >
                        {Object.entries(formats).map(([key, description]) => (
                            <option key={key} value={key}>
                                {key} - {description}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">원본 메시지</label>
                    <input
                        type="text"
                        value={originalMessage}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOriginalMessage(e.target.value)}
                        placeholder="원본 메시지를 입력하세요"
                        className="w-full p-2 border border-gray-300 rounded-md"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">맥락 (선택사항)</label>
                    <input
                        type="text"
                        value={context}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContext(e.target.value)}
                        placeholder="대화 맥락을 입력하세요"
                        className="w-full p-2 border border-gray-300 rounded-md"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">최근 메시지들 (선택사항)</label>
                    <textarea
                        value={recentMessages}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRecentMessages(e.target.value)}
                        placeholder="최근 대화 내용을 한 줄씩 입력하세요"
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    />
                </div>

                <button
                    onClick={generateFormattedMessage}
                    disabled={isLoading || !originalMessage.trim()}
                    className="w-full bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
                >
                    {isLoading ? '생성 중...' : '메시지 생성'}
                </button>

                {generatedMessage && (
                    <div className="mt-6">
                        <label className="block text-sm font-medium mb-2">생성된 메시지</label>
                        <div className="p-4 bg-gray-50 rounded-lg border">
                            <pre className="whitespace-pre-wrap text-sm">{generatedMessage}</pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageFormatSelector; 