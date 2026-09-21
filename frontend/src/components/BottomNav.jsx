import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CircleDollarSign,
  Menu,
  Home,
  FileText,
  Award,
  User,
  CheckCircle2,
  Receipt,
  TrendingUp
} from 'lucide-react';

const BottomNav = ({ activeTab, onTabChange }) => {
  const { role } = useAuth();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  let tabs = [];

  if (role === 'teacher') {
    tabs = [
      { id: 'dashboard', label: t('navDashboard'), icon: LayoutDashboard },
      { id: 'students', label: t('navStudents'), icon: Users },
      { id: 'classes', label: t('navClasses'), icon: BookOpen },
      { id: 'finance', label: t('navFees'), icon: CircleDollarSign },
      { id: 'more', label: t('navMore'), icon: Menu }
    ];
  } else if (role === 'student') {
    tabs = [
      { id: 'home', label: t('navDashboard'), icon: Home },
      { id: 'classes', label: t('navClasses'), icon: BookOpen },
      { id: 'homework', label: t('navHomework'), icon: FileText },
      { id: 'results', label: t('navMyResults'), icon: Award },
      { id: 'profile', label: t('navStudentId'), icon: User }
    ];
  } else if (role === 'parent') {
    tabs = [
      { id: 'home', label: t('navDashboard'), icon: Home },
      { id: 'attendance', label: t('navAttendance'), icon: CheckCircle2 },
      { id: 'fees', label: t('navFees'), icon: Receipt },
      { id: 'progress', label: t('navChildProgress'), icon: TrendingUp },
      { id: 'more', label: t('navMore'), icon: Menu }
    ];
  }

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.surface,
        borderTop: `1px solid ${colors.border}`,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '8px 4px 12px 4px',
        zIndex: 50,
        boxShadow: isDark ? '0 -4px 20px rgba(0,0,0,0.6)' : '0 -2px 10px rgba(0,0,0,0.05)',
        maxWidth: '768px',
        margin: '0 auto'
      }}
    >
      {tabs.map(tab => {
        const IconComponent = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              padding: '4px',
              cursor: 'pointer',
              color: isActive ? colors.primaryLight : colors.textMuted,
              transition: 'all 0.15s ease'
            }}
          >
            <div
              style={{
                padding: '4px 14px',
                borderRadius: '16px',
                backgroundColor: isActive ? 'rgba(79, 70, 229, 0.15)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '2px'
              }}
            >
              <IconComponent size={20} strokeWidth={isActive ? 2.4 : 1.8} />
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: isActive ? '700' : '500',
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '68px'
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
