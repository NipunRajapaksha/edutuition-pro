import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/client';
import StatCard from '../../components/StatCard';
import QuickActionBtn from '../../components/QuickActionBtn';
import { TrendBarChart } from '../../components/ChartViewer';
import Badge from '../../components/Badge';
import {
  Users,
  BookOpen,
  CalendarCheck2,
  CircleDollarSign,
  FileCheck2,
  Award,
  UserPlus,
  CheckCircle2,
  CreditCard,
  FileText,
  Megaphone,
  Clock,
  MapPin,
  ChevronRight,
  Receipt,
  Sparkles
} from 'lucide-react';

const TeacherDashboard = ({ onNavigate, onOpenQuickAction, onViewReceipt }) => {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardStats();
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: colors.textMuted }}>
        {t('loading')}
      </div>
    );
  }

  const metrics = stats?.metrics || {
    totalStudents: 125,
    activeClasses: 5,
    todayClassesCount: 2,
    presentToday: 108,
    pendingFees: 45000,
    homeworkPending: 3,
    upcomingExamsCount: 2
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '90px' }}>
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #3730A3 0%, #1E1B4B 100%)',
          borderRadius: '20px',
          padding: '20px',
          color: '#FFFFFF',
          boxShadow: '0 8px 24px rgba(79, 70, 229, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#A5B4FC' }}>
            {t('instituteDefault')}
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', marginTop: '2px' }}>
            {t('welcome')}, Master Perera 👋
          </h2>
          <p style={{ fontSize: '12px', color: '#C7D2FE', marginTop: '4px' }}>
            {metrics.todayClassesCount} classes scheduled for today. {metrics.presentToday} students present.
          </p>
        </div>
      </div>

      {/* 6 Quick Action Buttons */}
      <div>
        <div style={{ fontSize: '13px', fontWeight: '700', color: colors.text, marginBottom: '10px' }}>
          {t('quickActions')}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          <QuickActionBtn
            label={t('actionAddStudent')}
            icon={UserPlus}
            color="#4F46E5"
            onClick={() => onOpenQuickAction('addStudent')}
          />
          <QuickActionBtn
            label={t('actionAttendance')}
            icon={CheckCircle2}
            color="#10B981"
            onClick={() => onNavigate('attendance')}
          />
          <QuickActionBtn
            label={t('actionPayment')}
            icon={CreditCard}
            color="#F59E0B"
            onClick={() => onOpenQuickAction('recordPayment')}
          />
          <QuickActionBtn
            label={t('actionHomework')}
            icon={FileText}
            color="#06B6D4"
            onClick={() => onOpenQuickAction('addHomework')}
          />
          <QuickActionBtn
            label={t('actionExam')}
            icon={Award}
            color="#EF4444"
            onClick={() => onOpenQuickAction('createExam')}
          />
          <QuickActionBtn
            label={t('actionNotice')}
            icon={Megaphone}
            color="#8B5CF6"
            onClick={() => onOpenQuickAction('sendNotice')}
          />
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        <StatCard
          title={t('totalStudents')}
          value={metrics.totalStudents}
          subtitle="Enrolled active"
          icon={Users}
          color="#4F46E5"
          onClick={() => onNavigate('students')}
        />
        <StatCard
          title={t('activeClasses')}
          value={metrics.activeClasses}
          subtitle="Weekly timetable"
          icon={BookOpen}
          color="#06B6D4"
          onClick={() => onNavigate('classes')}
        />
        <StatCard
          title={t('presentToday')}
          value={metrics.presentToday}
          subtitle={`${metrics.todayClassesCount} classes today`}
          icon={CalendarCheck2}
          color="#10B981"
          onClick={() => onNavigate('attendance')}
        />
        <StatCard
          title={t('pendingFees')}
          value={`Rs. ${metrics.pendingFees.toLocaleString()}`}
          subtitle="Outstanding balance"
          icon={CircleDollarSign}
          color="#F59E0B"
          onClick={() => onNavigate('finance')}
        />
        <StatCard
          title={t('homeworkPending')}
          value={metrics.homeworkPending}
          subtitle="Needs teacher review"
          icon={FileCheck2}
          color="#EC4899"
          onClick={() => onNavigate('homework')}
        />
        <StatCard
          title={t('upcomingExams')}
          value={metrics.upcomingExamsCount}
          subtitle="Tests & evaluations"
          icon={Award}
          color="#EF4444"
          onClick={() => onNavigate('exams')}
        />
      </div>

      {/* Today's Classes */}
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: '18px',
          padding: '18px',
          border: `1px solid ${colors.border}`,
          boxShadow: colors.cardShadow
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: colors.text }}>
            {t('todayClasses')}
          </h3>
          <button
            onClick={() => onNavigate('classes')}
            style={{
              background: 'none',
              border: 'none',
              color: colors.primaryLight,
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '2px'
            }}
          >
            {t('all')} <ChevronRight size={14} />
          </button>
        </div>

        {(!stats?.todayClasses || stats.todayClasses.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '16px', color: colors.textMuted, fontSize: '12px' }}>
            {t('noClassToday')}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {stats.todayClasses.map(cls => (
              <div
                key={cls.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  backgroundColor: colors.surfaceSubtle,
                  borderRadius: '12px',
                  border: `1px solid ${colors.border}`
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: colors.text }}>
                    {cls.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: colors.textMuted, marginTop: '3px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={12} /> {cls.time}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <MapPin size={12} /> {cls.location}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('attendance')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    backgroundColor: colors.primary,
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {t('actionAttendance')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Attendance Trends Chart */}
      {stats?.attendanceTrends && stats.attendanceTrends.length > 0 && (
        <div
          style={{
            backgroundColor: colors.surface,
            borderRadius: '18px',
            padding: '18px',
            border: `1px solid ${colors.border}`,
            boxShadow: colors.cardShadow
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: colors.text }}>
              {t('attendanceRate')} (Last 7 Days)
            </h3>
            <Badge variant="present">Daily Logs</Badge>
          </div>
          <TrendBarChart data={stats.attendanceTrends} />
        </div>
      )}

      {/* Recent Payments with Receipt Trigger */}
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: '18px',
          padding: '18px',
          border: `1px solid ${colors.border}`,
          boxShadow: colors.cardShadow
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: colors.text }}>
            {t('recentPayments')}
          </h3>
          <button
            onClick={() => onNavigate('finance')}
            style={{
              background: 'none',
              border: 'none',
              color: colors.primaryLight,
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '2px'
            }}
          >
            {t('all')} <ChevronRight size={14} />
          </button>
        </div>

        {(!stats?.recentPayments || stats.recentPayments.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '16px', color: colors.textMuted, fontSize: '12px' }}>
            No recent payments recorded.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stats.recentPayments.map(p => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  backgroundColor: colors.surfaceSubtle,
                  borderRadius: '10px',
                  border: `1px solid ${colors.border}`
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: colors.text }}>
                    {p.studentName}
                  </div>
                  <div style={{ fontSize: '11px', color: colors.textMuted }}>
                    {p.className} • {p.date}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#10B981' }}>
                    Rs. {Number(p.amount).toLocaleString()}
                  </span>
                  <button
                    onClick={() => onViewReceipt(p.receiptNumber)}
                    title="View Digital Receipt"
                    style={{
                      padding: '5px 8px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(79, 70, 229, 0.1)',
                      border: '1px solid rgba(79, 70, 229, 0.25)',
                      color: colors.primaryLight,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}
                  >
                    <Receipt size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
