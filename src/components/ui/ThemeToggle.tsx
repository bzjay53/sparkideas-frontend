'use client';

import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, resolvedTheme, toggleTheme } = useTheme();

  const getIcon = () => {
    if (theme === 'light') {
      return <SunIcon className="w-5 h-5 text-yellow-600" />;
    } else if (theme === 'dark') {
      return <MoonIcon className="w-5 h-5 text-blue-400" />;
    } else {
      return <ComputerDesktopIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getAriaLabel = () => {
    if (theme === 'light') return '다크 모드로 전환';
    if (theme === 'dark') return '시스템 설정 모드로 전환';
    return '라이트 모드로 전환';
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
      aria-label={getAriaLabel()}
      title={`현재: ${theme === 'system' ? `시스템 (${resolvedTheme})` : theme} 모드`}
    >
      {getIcon()}
    </button>
  );
}