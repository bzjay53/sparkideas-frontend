'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('ideaspark-theme') as Theme;
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setThemeState(savedTheme);
    }
  }, []);

  // Update resolved theme when theme or system preference changes
  useEffect(() => {
    const updateResolvedTheme = () => {
      let newResolvedTheme: 'light' | 'dark' = 'light';
      
      if (theme === 'system') {
        newResolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        newResolvedTheme = theme;
      }
      
      setResolvedTheme(newResolvedTheme);
      
      // Update document class and CSS variables
      document.documentElement.setAttribute('data-theme', newResolvedTheme);
      document.documentElement.classList.toggle('dark', newResolvedTheme === 'dark');
      
      // Update CSS custom properties for Linear Design System
      if (newResolvedTheme === 'dark') {
        document.documentElement.style.setProperty('--background', '#0a0a0a');
        document.documentElement.style.setProperty('--foreground', '#ededed');
        document.documentElement.style.setProperty('--color-background-primary', '#0a0a0a');
        document.documentElement.style.setProperty('--color-background-secondary', '#1a1a1a');
        document.documentElement.style.setProperty('--color-background-elevated', '#202020');
        document.documentElement.style.setProperty('--color-text-primary', '#ededed');
        document.documentElement.style.setProperty('--color-text-secondary', '#a1a1aa');
        document.documentElement.style.setProperty('--color-border-primary', '#2a2a2a');
        document.documentElement.style.setProperty('--color-border-secondary', '#3a3a3a');
        document.documentElement.style.setProperty('--color-accent-primary', '#3b82f6');
        document.documentElement.style.setProperty('--color-accent-secondary', '#8b5cf6');
      } else {
        document.documentElement.style.setProperty('--background', '#ffffff');
        document.documentElement.style.setProperty('--foreground', '#171717');
        document.documentElement.style.setProperty('--color-background-primary', '#ffffff');
        document.documentElement.style.setProperty('--color-background-secondary', '#f8fafc');
        document.documentElement.style.setProperty('--color-background-elevated', '#ffffff');
        document.documentElement.style.setProperty('--color-text-primary', '#171717');
        document.documentElement.style.setProperty('--color-text-secondary', '#64748b');
        document.documentElement.style.setProperty('--color-border-primary', '#e2e8f0');
        document.documentElement.style.setProperty('--color-border-secondary', '#cbd5e1');
        document.documentElement.style.setProperty('--color-accent-primary', '#3b82f6');
        document.documentElement.style.setProperty('--color-accent-secondary', '#8b5cf6');
      }
    };

    updateResolvedTheme();
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateResolvedTheme);
    
    return () => mediaQuery.removeEventListener('change', updateResolvedTheme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('ideaspark-theme', newTheme);
  };

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}