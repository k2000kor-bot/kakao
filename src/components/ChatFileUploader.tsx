import React, { useState } from 'react';
import {
    CloudArrowUpIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    XCircleIcon,
    InformationCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface UploadResult {
    success: boolean;
    chat_room_id: string;
    total_messages: number;
    new_messages: number;
    duplicate_messages: number;
    message: string;
    upload_time: string;
}

interface UploadLog {
    file_name: string;
    chat_room_id: string;
    total_messages: number;
    new_messages: number;
    duplicate_messages: number;
    upload_time: string;
    status: string;
}

const ChatFileUploader: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
    const [uploadLogs, setUploadLogs] = useState<UploadLog[]>([]);
    const [showLogs, setShowLogs] = useState(false);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.name.endsWith('.txt')) {
            setSelectedFile(file);
            setUploadResult(null);
        } else {
            alert('텍스트 파일(.txt)만 업로드 가능합니다.');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            alert('파일을 선택해주세요.');
            return;
        }

        setIsUploading(true);
        setUploadResult(null);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await fetch('http://localhost:8005/api/upload-chat', {
                method: 'POST',
                body: formData,
            });

            const result: UploadResult = await response.json();

            if (result.success) {
                setUploadResult(result);
                setSelectedFile(null);
                // 파일 입력 초기화
                const fileInput = document.getElementById('file-input') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
            } else {
                alert('업로드 실패: ' + result.message);
            }
        } catch (error) {
            console.error('업로드 오류:', error);
            alert('업로드 중 오류가 발생했습니다.');
        } finally {
            setIsUploading(false);
        }
    };

    const loadUploadLogs = async () => {
        try {
            const response = await fetch('http://localhost:8005/api/upload-logs');
            const data = await response.json();

            if (data.success) {
                setUploadLogs(data.logs);
                setShowLogs(true);
            }
        } catch (error) {
            console.error('로그 조회 오류:', error);
        }
    };

    const formatDateTime = (dateTimeStr: string) => {
        const date = new Date(dateTimeStr);
        return date.toLocaleString('ko-KR');
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* 헤더 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">채팅 파일 업로드</h1>
                <p className="text-gray-600">
                    카카오톡 대화 파일을 업로드하면 중복된 메시지는 자동으로 제외되고 새로운 메시지만 추가됩니다.
                </p>
            </div>

            {/* 파일 업로드 섹션 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="space-y-4">
                    {/* 파일 선택 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            카카오톡 대화 파일 선택
                        </label>
                        <div className="flex items-center space-x-4">
                            <input
                                id="file-input"
                                type="file"
                                accept=".txt"
                                onChange={handleFileSelect}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {selectedFile && (
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <DocumentTextIcon className="h-5 w-5" />
                                    <span>{selectedFile.name}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 업로드 버튼 */}
                    <div className="flex space-x-4">
                        <button
                            onClick={handleUpload}
                            disabled={!selectedFile || isUploading}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            <CloudArrowUpIcon className="h-5 w-5" />
                            <span>{isUploading ? '업로드 중...' : '업로드'}</span>
                        </button>

                        <button
                            onClick={loadUploadLogs}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                            <InformationCircleIcon className="h-5 w-5" />
                            <span>업로드 로그</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 업로드 결과 */}
            {uploadResult && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-2 mb-4">
                        {uploadResult.success ? (
                            <CheckCircleIcon className="h-6 w-6 text-green-600" />
                        ) : (
                            <XCircleIcon className="h-6 w-6 text-red-600" />
                        )}
                        <h2 className="text-lg font-semibold text-gray-900">업로드 결과</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-medium text-gray-900 mb-2">채팅방 정보</h3>
                            <p className="text-sm text-gray-600">방 이름: {uploadResult.chat_room_id}</p>
                            <p className="text-sm text-gray-600">업로드 시간: {formatDateTime(uploadResult.upload_time)}</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-medium text-gray-900 mb-2">메시지 통계</h3>
                            <div className="space-y-1">
                                <p className="text-sm text-gray-600">총 메시지: {uploadResult.total_messages}개</p>
                                <p className="text-sm text-green-600">새 메시지: {uploadResult.new_messages}개</p>
                                <p className="text-sm text-orange-600">중복 제외: {uploadResult.duplicate_messages}개</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">{uploadResult.message}</p>
                    </div>
                </div>
            )}

            {/* 업로드 로그 */}
            {showLogs && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">업로드 로그</h2>
                        <button
                            onClick={() => setShowLogs(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <XCircleIcon className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        파일명
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        채팅방
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        총 메시지
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        새 메시지
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        중복 제외
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        업로드 시간
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {uploadLogs.map((log, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {log.file_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {log.chat_room_id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {log.total_messages}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                                            {log.new_messages}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600">
                                            {log.duplicate_messages}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDateTime(log.upload_time)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 안내 정보 */}
            <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                    <InformationCircleIcon className="h-6 w-6 text-blue-600 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-medium text-blue-900">업로드 안내</h3>
                        <div className="mt-2 text-sm text-blue-800 space-y-1">
                            <p>• 카카오톡에서 내보낸 텍스트 파일(.txt)만 업로드 가능합니다.</p>
                            <p>• 중복된 메시지는 자동으로 제외되고 새로운 메시지만 추가됩니다.</p>
                            <p>• 메시지는 시간순으로 정렬되어 저장됩니다.</p>
                            <p>• 업로드 후 메시지 생성 기능에서 새로운 대화 내용을 활용할 수 있습니다.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatFileUploader; 