import React from 'react';
import { useDarkMode } from '../hooks/useDarkMode';

const DarkModeToggle: React.FC = () => {
    const { isDarkMode, toggleDarkMode } = useDarkMode();

    return (
        <button
            onClick={toggleDarkMode}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
            title={`${isDarkMode ? '라이트' : '다크'} 모드로 전환`}
            aria-label={`${isDarkMode ? '라이트' : '다크'} 모드로 전환`}
        >
            {isDarkMode ? (
                <div className="w-5 h-5 flex items-center justify-center">
                    <span className="text-lg">☀️</span>
                </div>
            ) : (
                <div className="w-5 h-5 flex items-center justify-center">
                    <span className="text-lg">🌙</span>
                </div>
            )}
        </button>
    );
};

export default DarkModeToggle;
