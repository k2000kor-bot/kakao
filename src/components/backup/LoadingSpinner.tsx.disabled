import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    text = '로딩 중...',
    className = ''
}) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-16 w-16'
    };

    const textSizes = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base'
    };

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <div className="relative">
                <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-200 border-t-blue-500`}></div>
                <div className={`${sizeClasses[size]} absolute top-0 left-0 animate-ping rounded-full border-2 border-blue-500 opacity-20`}></div>
            </div>
            {text && (
                <p className={`mt-2 text-gray-500 ${textSizes[size]} font-medium`}>
                    {text}
                </p>
            )}
        </div>
    );
};

export default LoadingSpinner;
