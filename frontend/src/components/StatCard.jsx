import React from 'react';
import { useTheme } from '../context/ThemeContext';

const StatCard = ({ title, value, subtitle, icon: Icon, color = '#4F46E5', onClick }) => {
  const { colors, isDark } = useTheme();

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: '16px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: colors.cardShadow,
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.15s ease, border-color 0.15s ease'
      }}
    >
      {/* Subtle top accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${color}, transparent)`
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: '600', color: colors.textMuted }}>
          {title}
        </span>
        {Icon && (
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: `${color}18`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: color
            }}
          >
            <Icon size={18} />
          </div>
        )}
      </div>

      <div>
        <div style={{ fontSize: '22px', fontWeight: '800', color: colors.text, letterSpacing: '-0.02em' }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '2px', fontWeight: '500' }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
