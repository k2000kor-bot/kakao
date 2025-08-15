import React, { useState } from 'react';

interface TestResult {
    message: string;
    expectedResponse: string;
    actualResponse: string;
    similarity: number;
}

const ChatGPTSimilarityTester: React.FC = () => {
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const testCases = [
        {
            message: "환급금이 언제 나올까요?",
            expectedResponse: "환급금 지급 시기는 일반적으로 재건축 사업의 진행 단계에 따라 달라집니다. 현재 사업 진행 상황을 확인해보시는 것이 좋겠습니다."
        },
        {
            message: "시공사 선정이 언제 될까요?",
            expectedResponse: "시공사 선정은 조합 총회에서 결정되며, 보통 설계 완료 후 진행됩니다. 구체적인 일정은 조합에 문의해보시기 바랍니다."
        },
        {
            message: "총회는 언제 열리나요?",
            expectedResponse: "총회 일정은 조합에서 공지하므로 조합 사무실에 문의하시거나 공지사항을 확인해보시기 바랍니다."
        }
    ];

    const calculateSimilarity = (response1: string, response2: string): number => {
        const words1 = new Set(response1.split(' '));
        const words2 = new Set(response2.split(' '));

        const intersection = new Set(Array.from(words1).filter(x => words2.has(x)));
        const union = new Set([...Array.from(words1), ...Array.from(words2)]);

        return intersection.size / union.size;
    };

    const runSimilarityTest = async () => {
        setIsLoading(true);

        try {
            const results: TestResult[] = [];

            for (const testCase of testCases) {
                // 실제 API 호출 대신 시뮬레이션
                const actualResponse = "테스트 응답입니다.";
                const similarity = calculateSimilarity(testCase.expectedResponse, actualResponse);

                results.push({
                    message: testCase.message,
                    expectedResponse: testCase.expectedResponse,
                    actualResponse: actualResponse,
                    similarity: similarity
                });
            }

            setTestResults(results);
        } catch (error) {
            console.error('테스트 오류:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">ChatGPT 유사도 테스트</h3>

            <button
                onClick={runSimilarityTest}
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg mb-4 disabled:opacity-50"
            >
                {isLoading ? '테스트 중...' : '유사도 테스트 실행'}
            </button>

            {testResults.length > 0 && (
                <div className="space-y-4">
                    {testResults.map((result, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="mb-2">
                                <strong>입력:</strong> {result.message}
                            </div>
                            <div className="mb-2">
                                <strong>기대 응답:</strong> {result.expectedResponse}
                            </div>
                            <div className="mb-2">
                                <strong>실제 응답:</strong> {result.actualResponse}
                            </div>
                            <div className="mb-2">
                                <strong>유사도:</strong> {(result.similarity * 100).toFixed(1)}%
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ChatGPTSimilarityTester; 