import React from 'react';

interface FormattedTextDisplayProps {
    text: string;
    fontSize?: number;
    preserveLineBreaks?: boolean;
    textStructure?: string[];
    className?: string;
}

const FormattedTextDisplay: React.FC<FormattedTextDisplayProps> = ({
    text,
    fontSize = 16,
    preserveLineBreaks = true,
    textStructure,
    className = ''
}) => {
    // 텍스트 구조가 있으면 사용, 없으면 원본 텍스트를 줄별로 분리
    const lines = textStructure || text.split('\n').filter(line => line.trim() !== '');

    const textStyle: React.CSSProperties = {
        fontSize: `${fontSize}px`,
        lineHeight: preserveLineBreaks ? '1.6' : '1.4',
        whiteSpace: preserveLineBreaks ? 'pre-wrap' : 'normal',
        wordBreak: 'break-word',
        fontFamily: 'inherit'
    };

    return (
        <div className={`formatted-text-display ${className}`} style={textStyle}>
            {lines.map((line, index) => (
                <div key={index} className="text-line">
                    {line}
                    {preserveLineBreaks && index < lines.length - 1 && <br />}
                </div>
            ))}
        </div>
    );
};

export default FormattedTextDisplay;
