import React from 'react';
import { useTheme } from '../context/ThemeContext';

const QuickActionBtn = ({ label, icon: Icon, color = '#4F46E5', onClick }) => {
  const { colors, isDark } = useTheme();

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px 8px',
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: '14px',
        cursor: 'pointer',
        boxShadow: colors.cardShadow,
        transition: 'all 0.15s ease',
        minWidth: '78px',
        flex: 1
      }}
    >
      <div
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '12px',
          backgroundColor: `${color}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
          marginBottom: '6px'
        }}
      >
        <Icon size={20} />
      </div>
      <span
        style={{
          fontSize: '11px',
          fontWeight: '700',
          color: colors.text,
          textAlign: 'center',
          whiteSpace: 'nowrap'
        }}
      >
        {label}
      </span>
    </button>
  );
};

export default QuickActionBtn;
