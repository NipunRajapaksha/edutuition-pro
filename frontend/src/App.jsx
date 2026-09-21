import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { useLanguage } from './context/LanguageContext';
import { api } from './api/client';

import Header from './components/Header';
import BottomNav from './components/BottomNav';
import DigitalReceiptModal from './components/DigitalReceiptModal';
import StudentIdCardModal from './components/StudentIdCardModal';
import {
  AddStudentModal,
  RecordPaymentModal,
  AddHomeworkModal,
  CreateExamModal,
  SendNoticeModal,
  AddClassModal
} from './components/modals/QuickActionModals';

// Auth Screen
import LoginScreen from './screens/auth/LoginScreen';

// Teacher Screens
import TeacherDashboard from './screens/teacher/TeacherDashboard';
import StudentsScreen from './screens/teacher/StudentsScreen';
import ClassesScreen from './screens/teacher/ClassesScreen';
import AttendanceScreen from './screens/teacher/AttendanceScreen';
import FeesFinanceScreen from './screens/teacher/FeesFinanceScreen';
import HomeworkScreen from './screens/teacher/HomeworkScreen';
import ExamsMarksScreen from './screens/teacher/ExamsMarksScreen';
import PerformanceScreen from './screens/teacher/PerformanceScreen';
import StudyMaterialsScreen from './screens/teacher/StudyMaterialsScreen';
import AiToolsScreen from './screens/teacher/AiToolsScreen';
import ReportsScreen from './screens/teacher/ReportsScreen';
import InstituteSettingsScreen from './screens/teacher/InstituteSettingsScreen';
import TeacherProfileScreen from './screens/teacher/TeacherProfileScreen';

// Student Screens
import StudentDashboard from './screens/student/StudentDashboard';
import StudentClassesScreen from './screens/student/StudentClassesScreen';
import StudentHomeworkScreen from './screens/student/StudentHomeworkScreen';
import StudentResultsScreen from './screens/student/StudentResultsScreen';
import StudentFeesScreen from './screens/student/StudentFeesScreen';
import StudentProfileScreen from './screens/student/StudentProfileScreen';

// Parent Screens
import ParentDashboard from './screens/parent/ParentDashboard';
import ChildAttendanceScreen from './screens/parent/ChildAttendanceScreen';
import ChildFeesScreen from './screens/parent/ChildFeesScreen';
import ChildProgressScreen from './screens/parent/ChildProgressScreen';

// Shared Screens
import AnnouncementsScreen from './screens/shared/AnnouncementsScreen';
import NotificationsScreen from './screens/shared/NotificationsScreen';
import CalendarScreen from './screens/shared/CalendarScreen';
import MoreMenuScreen from './screens/shared/MoreMenuScreen';
import InstallAppModal from './components/InstallAppModal';

import { Smartphone, Monitor } from 'lucide-react';

const MainApp = () => {
  const { user, role, isAuthenticated, loading } = useAuth();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Overlay Modals
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [activeStudentIdCard, setActiveStudentIdCard] = useState(null);
  const [activeQuickAction, setActiveQuickAction] = useState(null); // 'addStudent', 'recordPayment', etc.
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [settings, setSettings] = useState(null);

  // Mobile frame simulator toggle for web view
  const [mobileFrame, setMobileFrame] = useState(true);

  // Sync initial tab based on role
  useEffect(() => {
    if (role === 'teacher') setActiveTab('dashboard');
    else if (role === 'student' || role === 'parent') setActiveTab('home');
  }, [role]);

  // Listen for PWA install prompt & fetch institute settings
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    api.getSettings().then(res => {
      if (res.data.success && res.data.data) {
        setSettings(res.data.data);
      }
    }).catch(() => {});

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // Fetch unread notifications count
  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.getNotifications();
      if (res.data.success) {
        setUnreadNotifications(res.data.unreadCount || 0);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, [isAuthenticated, activeTab]);

  const handleViewReceipt = async (receiptNumber) => {
    try {
      const res = await api.getReceipt(receiptNumber);
      if (res.data.success) {
        setActiveReceipt(res.data.data);
      }
    } catch (err) {
      alert('Could not load receipt details');
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.bg,
          color: colors.text
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: '800' }}>EduTuition Pro</div>
          <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '4px' }}>Loading workspace...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Render Screen Body
  const renderScreen = () => {
    if (activeTab === 'notifications') {
      return <NotificationsScreen onRefreshCount={fetchUnreadCount} />;
    }
    if (activeTab === 'announcements') {
      return (
        <AnnouncementsScreen
          onOpenSendNotice={() => setActiveQuickAction('sendNotice')}
        />
      );
    }
    if (activeTab === 'calendar') {
      return <CalendarScreen />;
    }
    if (activeTab === 'teacherProfile') {
      return <TeacherProfileScreen />;
    }
    if (activeTab === 'studentProfile') {
      return <StudentProfileScreen onViewQrId={(student) => setActiveStudentIdCard(student)} />;
    }
    if (activeTab === 'instituteSettings') {
      return <InstituteSettingsScreen onSettingsUpdated={(updated) => setSettings(updated)} />;
    }
    if (activeTab === 'installApp') {
      setTimeout(() => setShowInstallModal(true), 50);
      setActiveTab('more');
      return <MoreMenuScreen onSelectModule={(tab) => setActiveTab(tab)} onViewMyQr={(student) => setActiveStudentIdCard(student)} />;
    }

    // Role-specific screens
    if (role === 'teacher') {
      switch (activeTab) {
        case 'dashboard':
          return (
            <TeacherDashboard
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenQuickAction={(action) => setActiveQuickAction(action)}
              onViewReceipt={handleViewReceipt}
            />
          );
        case 'students':
          return (
            <StudentsScreen
              onOpenAddStudent={() => setActiveQuickAction('addStudent')}
              onViewQrId={(student) => setActiveStudentIdCard(student)}
              onViewStudentHistory={(id) => {
                setActiveTab('performance');
              }}
            />
          );
        case 'classes':
          return (
            <ClassesScreen
              onOpenAddClass={() => setActiveQuickAction('addClass')}
            />
          );
        case 'attendance':
          return <AttendanceScreen />;
        case 'finance':
          return (
            <FeesFinanceScreen
              onOpenRecordPayment={() => setActiveQuickAction('recordPayment')}
              onViewReceipt={handleViewReceipt}
            />
          );
        case 'homework':
          return (
            <HomeworkScreen
              onOpenAddHomework={() => setActiveQuickAction('addHomework')}
            />
          );
        case 'exams':
          return (
            <ExamsMarksScreen
              onOpenCreateExam={() => setActiveQuickAction('createExam')}
            />
          );
        case 'performance':
          return <PerformanceScreen />;
        case 'materials':
          return <StudyMaterialsScreen onOpenAddMaterial={() => setActiveQuickAction('addMaterial')} />;
        case 'aiTools':
          return <AiToolsScreen />;
        case 'reports':
          return <ReportsScreen />;
        case 'more':
          return (
            <MoreMenuScreen
              onSelectModule={(tab) => setActiveTab(tab)}
              onViewMyQr={(student) => setActiveStudentIdCard(student)}
            />
          );
        default:
          return <TeacherDashboard onNavigate={(tab) => setActiveTab(tab)} onOpenQuickAction={setActiveQuickAction} onViewReceipt={handleViewReceipt} />;
      }
    } else if (role === 'student') {
      switch (activeTab) {
        case 'home':
          return (
            <StudentDashboard
              onNavigate={(tab) => setActiveTab(tab)}
              onViewMyQr={(student) => setActiveStudentIdCard(student || user.studentProfile)}
              onViewReceipt={handleViewReceipt}
            />
          );
        case 'classes':
          return <StudentClassesScreen />;
        case 'homework':
          return <StudentHomeworkScreen />;
        case 'results':
          return <StudentResultsScreen />;
        case 'fees':
          return <StudentFeesScreen onViewReceipt={handleViewReceipt} />;
        case 'profile':
          return <StudentProfileScreen onViewQrId={(student) => setActiveStudentIdCard(student)} />;
        case 'more':
          return (
            <MoreMenuScreen
              onSelectModule={(tab) => setActiveTab(tab)}
              onViewMyQr={(student) => setActiveStudentIdCard(student)}
            />
          );
        default:
          return <StudentDashboard onNavigate={(tab) => setActiveTab(tab)} onViewMyQr={setActiveStudentIdCard} onViewReceipt={handleViewReceipt} />;
      }
    } else if (role === 'parent') {
      switch (activeTab) {
        case 'home':
          return (
            <ParentDashboard
              onNavigate={(tab) => setActiveTab(tab)}
              onViewReceipt={handleViewReceipt}
            />
          );
        case 'attendance':
          return <ChildAttendanceScreen />;
        case 'fees':
          return <ChildFeesScreen onViewReceipt={handleViewReceipt} />;
        case 'progress':
          return <ChildProgressScreen />;
        case 'more':
          return <MoreMenuScreen onSelectModule={(tab) => setActiveTab(tab)} />;
        default:
          return <ParentDashboard onNavigate={(tab) => setActiveTab(tab)} onViewReceipt={handleViewReceipt} />;
      }
    }

    return null;
  };

  return (
    <div
      style={{
        backgroundColor: isDark ? '#05070E' : '#E5E7EB',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start'
      }}
    >
      {/* Top Floating Viewport Control on Web */}
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '6px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          color: colors.textMuted
        }}
      >
        <span>📱 Mobile Preview Mode</span>
        <button
          onClick={() => setMobileFrame(!mobileFrame)}
          style={{
            background: 'none',
            border: 'none',
            color: colors.primaryLight,
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {mobileFrame ? <Monitor size={12} /> : <Smartphone size={12} />}
          {mobileFrame ? 'Full Width' : 'Mobile Frame'}
        </button>
      </div>

      {/* Mobile Shell Container */}
      <div
        style={{
          width: '100%',
          maxWidth: mobileFrame ? '440px' : '100%',
          minHeight: '100vh',
          backgroundColor: colors.bg,
          boxShadow: mobileFrame ? '0 25px 60px -15px rgba(0, 0, 0, 0.7)' : 'none',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          borderLeft: mobileFrame ? `1px solid ${colors.border}` : 'none',
          borderRight: mobileFrame ? `1px solid ${colors.border}` : 'none',
          borderRadius: mobileFrame ? '24px 24px 0 0' : '0'
        }}
      >
        {/* Header */}
        <Header
          onNotificationClick={() => setActiveTab('notifications')}
          unreadCount={unreadNotifications}
          instituteName={settings?.instituteName}
          onProfileClick={() => {
            if (role === 'teacher') setActiveTab('teacherProfile');
            else if (role === 'student') setActiveTab('studentProfile');
          }}
        />

        {/* Dynamic Screen Content */}
        <main style={{ flex: 1 }}>
          {renderScreen()}
        </main>

        {/* Pinned Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId)}
        />
      </div>

      {/* Digital Receipt Modal */}
      {activeReceipt && (
        <DigitalReceiptModal
          receipt={activeReceipt}
          onClose={() => setActiveReceipt(null)}
        />
      )}

      {/* Student ID Card Modal */}
      {activeStudentIdCard && (
        <StudentIdCardModal
          student={activeStudentIdCard}
          onClose={() => setActiveStudentIdCard(null)}
        />
      )}

      {/* Quick Action Modals */}
      {activeQuickAction === 'addStudent' && (
        <AddStudentModal
          onClose={() => setActiveQuickAction(null)}
          onSuccess={() => setActiveTab('students')}
        />
      )}

      {activeQuickAction === 'recordPayment' && (
        <RecordPaymentModal
          onClose={() => setActiveQuickAction(null)}
          onSuccess={(fee) => handleViewReceipt(fee.receiptNumber)}
        />
      )}

      {activeQuickAction === 'addHomework' && (
        <AddHomeworkModal
          onClose={() => setActiveQuickAction(null)}
          onSuccess={() => setActiveTab('homework')}
        />
      )}

      {activeQuickAction === 'createExam' && (
        <CreateExamModal
          onClose={() => setActiveQuickAction(null)}
          onSuccess={() => setActiveTab('exams')}
        />
      )}

      {activeQuickAction === 'sendNotice' && (
        <SendNoticeModal
          onClose={() => setActiveQuickAction(null)}
          onSuccess={() => setActiveTab('announcements')}
        />
      )}

      {activeQuickAction === 'addClass' && (
        <AddClassModal
          onClose={() => setActiveQuickAction(null)}
          onSuccess={() => setActiveTab('classes')}
        />
      )}

      {/* Install Mobile App PWA Modal */}
      <InstallAppModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        installPrompt={installPrompt}
      />
    </div>
  );
};

export default function App() {
  return <MainApp />;
}
