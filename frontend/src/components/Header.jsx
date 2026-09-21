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
      {/* Brand */}
      <div 
        onClick={onProfileClick}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: onProfileClick ? 'pointer' : 'default' }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 4px 10px rgba(79, 70, 229, 0.4)'
          }}
        >
          <GraduationCap size={22} />
        </div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: '800', color: colors.text, letterSpacing: '-0.02em', lineHeight: 1.1, maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {instituteName || t('appName')}
          </div>
          <div style={{ fontSize: '10px', color: colors.textMuted, fontWeight: '500' }}>
            {t('tagline')}
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Language switch */}
        <button
          onClick={toggleLanguage}
          title="Switch Language (English / සිංහල)"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 10px',
            borderRadius: '8px',
            backgroundColor: colors.surfaceSubtle,
            border: `1px solid ${colors.border}`,
            color: colors.text,
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600'
          }}
        >
          <Globe size={14} style={{ color: colors.primary }} />
          <span>{language === 'en' ? 'සිං' : 'EN'}</span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title="Toggle Light/Dark Theme"
          style={{
            padding: '6px 8px',
            borderRadius: '8px',
            backgroundColor: colors.surfaceSubtle,
            border: `1px solid ${colors.border}`,
            color: colors.text,
            cursor: 'pointer'
          }}
        >
          {isDark ? <Sun size={15} style={{ color: '#FBBF24' }} /> : <Moon size={15} style={{ color: '#4B5563' }} />}
        </button>

        {/* Notifications */}
        <button
          onClick={onNotificationClick}
          title="Notifications"
          style={{
            position: 'relative',
            padding: '6px 8px',
            borderRadius: '8px',
            backgroundColor: colors.surfaceSubtle,
            border: `1px solid ${colors.border}`,
            color: colors.text,
            cursor: 'pointer'
          }}
        >
          <Bell size={15} />
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
                minWidth: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 3px'
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>

        {/* Role badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '20px',
            backgroundColor: 'rgba(79, 70, 229, 0.12)',
            border: '1px solid rgba(79, 70, 229, 0.25)',
            fontSize: '11px',
            fontWeight: '600',
            color: colors.primaryLight
          }}
        >
          <ShieldCheck size={13} />
          <span>{getRoleLabel()}</span>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          title="Log Out"
          style={{
            padding: '6px 8px',
            borderRadius: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#EF4444',
            cursor: 'pointer'
          }}
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
};

export default Header;
