import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('edutuition_theme') || 'dark';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('edutuition_theme', nextTheme);
  };

  const isDark = theme === 'dark';

  const colors = {
    bg: isDark ? '#0B0F19' : '#F3F4F6',
    surface: isDark ? '#111827' : '#FFFFFF',
    surfaceSubtle: isDark ? '#1F2937' : '#F9FAFB',
    border: isDark ? '#374151' : '#E5E7EB',
    text: isDark ? '#F9FAFB' : '#111827',
    textMuted: isDark ? '#9CA3AF' : '#6B7280',
    primary: '#4F46E5',
    primaryLight: '#6366F1',
    primaryDark: '#4338CA',
    accent: '#06B6D4',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    cardShadow: isDark ? '0 4px 20px rgba(0, 0, 0, 0.4)' : '0 4px 15px rgba(0, 0, 0, 0.05)'
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
