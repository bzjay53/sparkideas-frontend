'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
  variant?: 'default' | 'minimal' | 'icon-only';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const { theme, resolvedTheme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'p-1.5 text-sm',
    md: 'p-2 text-base',
    lg: 'p-3 text-lg'
  };

  const baseClasses = `
    inline-flex items-center justify-center rounded-lg
    transition-all duration-200 ease-in-out
    border border-gray-200 dark:border-gray-700
    bg-white dark:bg-gray-800
    hover:bg-gray-50 dark:hover:bg-gray-700
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
    active:scale-95
    ${sizeClasses[size]}
    ${className}
  `;

  const getThemeIcon = () => {
    if (theme === 'system') {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-600 dark:text-gray-300">
          <path
            d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 11H23C23.6 11 24 11.4 24 12C24 12.6 23.6 13 23 13H21C20.4 13 20 12.6 20 12C20 11.4 20.4 11 21 11ZM1 11H3C3.6 11 4 11.4 4 12C4 12.6 3.6 13 3 13H1C0.4 13 0 12.6 0 12C0 11.4 0.4 11 1 11ZM18.7 4.7L20.1 3.3C20.5 2.9 21.1 2.9 21.5 3.3C21.9 3.7 21.9 4.3 21.5 4.7L20.1 6.1C19.7 6.5 19.1 6.5 18.7 6.1C18.3 5.7 18.3 5.1 18.7 4.7ZM3.3 18.7L4.7 20.1C5.1 20.5 5.7 20.5 6.1 20.1C6.5 19.7 6.5 19.1 6.1 18.7L4.7 17.3C4.3 16.9 3.7 16.9 3.3 17.3C2.9 17.7 2.9 18.3 3.3 18.7ZM12 18C10.9 18 10 18.9 10 20C10 21.1 10.9 22 12 22C13.1 22 14 21.1 14 20C14 18.9 13.1 18 12 18ZM17.3 18.7C17.7 18.3 18.3 18.3 18.7 18.7L20.1 20.1C20.5 20.5 20.5 21.1 20.1 21.5C19.7 21.9 19.1 21.9 18.7 21.5L17.3 20.1C16.9 19.7 16.9 19.1 17.3 18.7Z"
            fill="currentColor"
          />
        </svg>
      );
    }
    
    if (resolvedTheme === 'dark') {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-600 dark:text-gray-300">
          <path
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
            fill="currentColor"
          />
        </svg>
      );
    }
    
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-600 dark:text-gray-300">
        <circle cx="12" cy="12" r="5" fill="currentColor"/>
        <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light': return '라이트 모드';
      case 'dark': return '다크 모드';
      case 'system': return '시스템 설정';
      default: return '테마 전환';
    }
  };

  if (variant === 'icon-only') {
    return (
      <button
        onClick={toggleTheme}
        className={baseClasses}
        title={getThemeLabel()}
        aria-label={getThemeLabel()}
      >
        {getThemeIcon()}
      </button>
    );
  }

  if (variant === 'minimal') {
    return (
      <button
        onClick={toggleTheme}
        className={`${baseClasses} gap-2`}
        title={getThemeLabel()}
      >
        {getThemeIcon()}
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
          {theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'Auto'}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`${baseClasses} gap-2 min-w-[120px]`}
      title={getThemeLabel()}
    >
      {getThemeIcon()}
      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
        {getThemeLabel()}
      </span>
    </button>
  );
};