import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  GraduationCap, 
  Sun, 
  Moon, 
  Globe, 
  Bell, 
  LogOut, 
  User as UserIcon,
  ShieldCheck
} from 'lucide-react';

const Header = ({ onNotificationClick, unreadCount = 0, instituteName, onProfileClick }) => {
  const { user, logout, role } = useAuth();
  const { isDark, toggleTheme, colors } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();

  const getRoleLabel = () => {
    if (role === 'teacher') return t('roleTeacher');
    if (role === 'student') return t('roleStudent');
    if (role === 'parent') return t('roleParent');
    return '';
  };

  return (
    <header
      style={{
        backgroundColor: colors.surface,
        borderBottom: `1px solid ${colors.border}`,
        position: 'sticky',
        top: 0,
        zIndex: 40,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: isDark ? '0 2px 10px rgba(0,0,0,0.5)' : '0 1px 3px rgba(0,0,0,0.05)'
      }}
    >
      {/* Embedded CSS for perfect mobile header responsiveness */}
      <style>{`
        @media (max-width: 520px) {
          .header-brand-title { max-width: 105px !important; font-size: 13px !important; }
          .header-brand-tagline { display: none !important; }
          .header-role-text { display: none !important; }
          .header-role-badge { padding: 4px 6px !important; }
        }
      `}</style>

      {/* Brand */}
      <div 
        onClick={onProfileClick}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: onProfileClick ? 'pointer' : 'default', minWidth: 0, flexShrink: 1 }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 4px 10px rgba(79, 70, 229, 0.4)',
            flexShrink: 0
          }}
        >
          <GraduationCap size={20} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="header-brand-title" style={{ fontSize: '15px', fontWeight: '800', color: colors.text, letterSpacing: '-0.02em', lineHeight: 1.1, maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {instituteName || t('appName')}
          </div>
          <div className="header-brand-tagline" style={{ fontSize: '10px', color: colors.textMuted, fontWeight: '500' }}>
            {t('tagline')}
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        {/* Language switch */}
        <button
          onClick={toggleLanguage}
          title="Switch Language (English / සිංහල)"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            padding: '5px 8px',
            borderRadius: '8px',
            backgroundColor: colors.surfaceSubtle,
            border: `1px solid ${colors.border}`,
            color: colors.text,
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: '600',
            flexShrink: 0
          }}
        >
          <Globe size={13} style={{ color: colors.primary }} />
          <span>{language === 'en' ? 'සිං' : 'EN'}</span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title="Toggle Light/Dark Theme"
          style={{
            padding: '5px 7px',
            borderRadius: '8px',
            backgroundColor: colors.surfaceSubtle,
            border: `1px solid ${colors.border}`,
            color: colors.text,
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          {isDark ? <Sun size={14} style={{ color: '#FBBF24' }} /> : <Moon size={14} style={{ color: '#4B5563' }} />}
        </button>

        {/* Notifications */}
        <button
          onClick={onNotificationClick}
          title="Notifications"
          style={{
            position: 'relative',
            padding: '5px 7px',
            borderRadius: '8px',
            backgroundColor: colors.surfaceSubtle,
            border: `1px solid ${colors.border}`,
            color: colors.text,
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <Bell size={14} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: '#EF4444',
                color: '#FFFFFF',
                fontSize: '9px',
                fontWeight: 'bold',
                borderRadius: '9999px',
                minWidth: '15px',
                height: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 2px'
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>

        {/* Role badge */}
        <div
          className="header-role-badge"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            borderRadius: '16px',
            backgroundColor: 'rgba(79, 70, 229, 0.12)',
            border: '1px solid rgba(79, 70, 229, 0.25)',
            fontSize: '11px',
            fontWeight: '600',
            color: colors.primaryLight,
            flexShrink: 0
          }}
        >
          <ShieldCheck size={12} />
          <span className="header-role-text">{getRoleLabel()}</span>
        </div>

        {/* High-visibility Logout Button */}
        <button
          onClick={logout}
          title="Log Out (ගිණුමෙන් ඉවත් වන්න)"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '5px 9px',
            borderRadius: '8px',
            backgroundColor: '#EF4444',
            border: '1px solid #DC2626',
            color: '#FFFFFF',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: '700',
            flexShrink: 0,
            boxShadow: '0 2px 6px rgba(239, 68, 68, 0.25)'
          }}
        >
          <LogOut size={13} color="#FFFFFF" />
          <span>Exit</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
