import React from 'react';

interface AnalysisResultCardProps {
    title: string;
    accuracy?: number;
    keywords?: string[];
    text?: string;
    extra?: React.ReactNode;
}

const AnalysisResultCard: React.FC<AnalysisResultCardProps> = ({
    title,
    accuracy,
    keywords,
    text,
    extra
}) => (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-200 max-w-lg">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        {accuracy !== undefined && (
            <div className="mb-2">
                <span className="text-sm text-gray-600">정확도: </span>
                <span className="font-bold text-blue-600">{accuracy.toFixed(1)}%</span>
                <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                    <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${accuracy}%` }}
                    ></div>
                </div>
            </div>
        )}
        {keywords && keywords.length > 0 && (
            <div className="mb-2">
                <span className="text-sm text-gray-600">주요 키워드: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                    {keywords.map((kw, i) => (
                        <span key={i} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{kw}</span>
                    ))}
                </div>
            </div>
        )}
        {text && (
            <div className="mb-2">
                <span className="text-sm text-gray-600">추출 텍스트:</span>
                <div className="bg-gray-50 rounded p-2 mt-1 text-xs text-gray-800 max-h-32 overflow-y-auto">{text}</div>
            </div>
        )}
        {extra}
    </div>
);

export default AnalysisResultCard;