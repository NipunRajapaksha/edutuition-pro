import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  FileText,
  Award,
  TrendingUp,
  FolderOpen,
  BrainCircuit,
  FileSpreadsheet,
  Megaphone,
  Calendar,
  Settings,
  ChevronRight,
  LogOut,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Receipt
} from 'lucide-react';

const MoreMenuScreen = ({ onSelectModule, onViewMyQr }) => {
  const { user, role, logout } = useAuth();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  let menuItems = [];

  if (role === 'teacher') {
    menuItems = [
      { id: 'attendance', label: t('navAttendance'), icon: CheckCircle2, color: '#10B981', desc: 'Daily attendance logs & QR generator' },
      { id: 'homework', label: t('navHomework'), icon: FileText, color: '#06B6D4', desc: 'Create tasks & review submissions' },
      { id: 'exams', label: t('navExams'), icon: Award, color: '#EF4444', desc: 'Examinations, rankings & marks' },
      { id: 'performance', label: t('navPerformance'), icon: TrendingUp, color: '#10B981', desc: 'Student analytics & progression graphs' },
      { id: 'materials', label: t('navMaterials'), icon: FolderOpen, color: '#F59E0B', desc: 'PDF notes, past papers & video links' },
      { id: 'aiTools', label: t('navAiTools'), icon: BrainCircuit, color: '#8B5CF6', desc: 'AI diagnostics & homework/exam generators' },
      { id: 'reports', label: t('navReports'), icon: FileSpreadsheet, color: '#EC4899', desc: 'Exportable printable & CSV reports' },
      { id: 'announcements', label: t('navAnnouncements'), icon: Megaphone, color: '#3B82F6', desc: 'Broadcast notices & alerts' },
      { id: 'calendar', label: t('navCalendar'), icon: Calendar, color: '#6366F1', desc: 'Timetable, exam dates & holidays' }
    ];
  } else if (role === 'parent') {
    menuItems = [
      { id: 'attendance', label: t('navAttendance'), icon: CheckCircle2, color: '#10B981', desc: 'Child attendance rate & date history' },
      { id: 'fees', label: t('navFees'), icon: Receipt, color: '#F59E0B', desc: 'Child fee status & verified receipts' },
      { id: 'progress', label: t('navChildProgress'), icon: TrendingUp, color: '#6366F1', desc: 'Test scores, ranks & teacher notes' },
      { id: 'announcements', label: t('navAnnouncements'), icon: Megaphone, color: '#3B82F6', desc: 'Important institute announcements' },
      { id: 'calendar', label: t('navCalendar'), icon: Calendar, color: '#06B6D4', desc: 'View class timetable & holidays' }
    ];
  } else if (role === 'student') {
    menuItems = [
      { id: 'classes', label: t('navMyClasses'), icon: FolderOpen, color: '#06B6D4', desc: 'Class schedules & study materials' },
      { id: 'homework', label: t('navMyHomework'), icon: FileText, color: '#F59E0B', desc: 'Submit homework & view grades' },
      { id: 'results', label: t('navMyResults'), icon: Award, color: '#EF4444', desc: 'Report card, grades & rank' },
      { id: 'fees', label: t('navMyFees'), icon: Receipt, color: '#10B981', desc: 'Tuition fees & digital receipts' },
      { id: 'announcements', label: t('navAnnouncements'), icon: Megaphone, color: '#3B82F6', desc: 'Institute announcements' },
      { id: 'calendar', label: t('navCalendar'), icon: Calendar, color: '#6366F1', desc: 'Academic calendar' }
    ];
  }

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '90px' }}>
      {/* User Card */}
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: '18px',
          padding: '16px',
          border: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: colors.cardShadow
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            fontSize: '18px'
          }}
        >
          {user?.name ? user.name[0] : 'U'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '15px', fontWeight: '800', color: colors.text }}>
            {user?.name || 'User Profile'}
          </div>
          <div style={{ fontSize: '11px', color: colors.textMuted }}>
            {user?.email} • <span style={{ textTransform: 'capitalize', color: colors.primaryLight, fontWeight: '700' }}>{role}</span>
          </div>
        </div>

        {role === 'student' && onViewMyQr && (
          <button
            onClick={() => onViewMyQr(user.studentProfile)}
            style={{
              padding: '8px',
              borderRadius: '10px',
              backgroundColor: colors.surfaceSubtle,
              border: `1px solid ${colors.border}`,
              color: colors.primaryLight,
              cursor: 'pointer'
            }}
          >
            <QrCode size={18} />
          </button>
        )}
      </div>

      {/* Modules List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {menuItems.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSelectModule(item.id)}
              style={{
                backgroundColor: colors.surface,
                borderRadius: '14px',
                padding: '14px 16px',
                border: `1px solid ${colors.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: colors.cardShadow
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: `${item.color}15`,
                    color: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Icon size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: colors.text }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '11px', color: colors.textMuted }}>
                    {item.desc}
                  </div>
                </div>
              </div>

              <ChevronRight size={16} color={colors.textMuted} />
            </button>
          );
        })}
      </div>

      {/* Logout button */}
      <button
        onClick={logout}
        style={{
          padding: '12px',
          borderRadius: '14px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#EF4444',
          fontSize: '13px',
          fontWeight: '700',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '8px'
        }}
      >
        <LogOut size={16} /> Sign Out of Account
      </button>
    </div>
  );
};

export default MoreMenuScreen;
