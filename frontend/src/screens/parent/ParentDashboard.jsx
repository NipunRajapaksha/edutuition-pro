import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/client';
import Badge from '../../components/Badge';
import {
  Users,
  CalendarCheck2,
  Receipt,
  Award,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Clock,
  BookOpen
} from 'lucide-react';

const ParentDashboard = ({ onNavigate, onViewReceipt }) => {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const [childData, setChildData] = useState(null);
  const [loading, setLoading] = useState(true);

  const linkedStudentId = user?.linkedStudentId;

  useEffect(() => {
    const fetchChild = async () => {
      if (!linkedStudentId) return;
      try {
        setLoading(true);
        const res = await api.getStudentById(linkedStudentId);
        if (res.data.success) {
          setChildData(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchChild();
  }, [linkedStudentId]);

  if (loading) {
    return <div style={{ padding: '30px', textAlign: 'center', color: colors.textMuted }}>{t('loading')}</div>;
  }

  const child = childData || {};
  const stats = childData?.stats || { attendancePercentage: 90, pendingBalance: 0 };
  const hasLowAttendance = stats.attendancePercentage < 75;
  const hasPendingFees = (stats.pendingBalance || 0) > 0;

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '90px' }}>
      {/* Welcome Child Overview */}
      <div
        style={{
          background: 'linear-gradient(135deg, #065F46 0%, #064E3B 100%)',
          borderRadius: '20px',
          padding: '20px',
          color: '#FFFFFF',
          boxShadow: '0 8px 24px rgba(6, 95, 70, 0.3)'
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#A7F3D0' }}>
          PARENT MONITORING PORTAL
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: '800', marginTop: '2px' }}>
          {child.fullName ? `Monitoring: ${child.fullName}` : 'Child Overview'}
        </h2>
        <div style={{ fontSize: '12px', color: '#D1FAE5', marginTop: '4px' }}>
          {child.studentId} • {child.grade} • {child.school}
        </div>
      </div>

      {/* Automated Alert Banners */}
      {hasLowAttendance && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '14px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px', color: '#EF4444' }}>
          <AlertTriangle size={20} style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '12px', fontWeight: '600' }}>
            {t('lowAttendanceWarning')} ({stats.attendancePercentage}%)
          </div>
        </div>
      )}

      {hasPendingFees && (
        <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '14px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px', color: '#F59E0B' }}>
          <Receipt size={20} style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '12px', fontWeight: '600' }}>
            {t('pendingFeeAlert')} (Outstanding: Rs. {stats.pendingBalance.toLocaleString()})
          </div>
        </div>
      )}

      {/* Quick Status Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        <div
          onClick={() => onNavigate('attendance')}
          style={{ backgroundColor: colors.surface, padding: '16px', borderRadius: '16px', border: `1px solid ${colors.border}`, cursor: 'pointer', boxShadow: colors.cardShadow }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: colors.textMuted, fontWeight: '700' }}>ATTENDANCE</span>
            <CalendarCheck2 size={16} color="#10B981" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: stats.attendancePercentage >= 75 ? '#10B981' : '#EF4444', marginTop: '4px' }}>
            {stats.attendancePercentage}%
          </div>
          <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '2px' }}>
            {stats.present || 0} days present
          </div>
        </div>

        <div
          onClick={() => onNavigate('fees')}
          style={{ backgroundColor: colors.surface, padding: '16px', borderRadius: '16px', border: `1px solid ${colors.border}`, cursor: 'pointer', boxShadow: colors.cardShadow }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: colors.textMuted, fontWeight: '700' }}>TUITION FEES</span>
            <Receipt size={16} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: stats.pendingBalance > 0 ? '#EF4444' : '#10B981', marginTop: '6px' }}>
            {stats.pendingBalance > 0 ? `Rs. ${stats.pendingBalance}` : 'All Paid'}
          </div>
          <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '2px' }}>
            {stats.pendingBalance > 0 ? 'Payment required' : 'Up to date'}
          </div>
        </div>
      </div>

      {/* Child's Academic Schedule */}
      <div style={{ backgroundColor: colors.surface, borderRadius: '18px', padding: '16px', border: `1px solid ${colors.border}`, boxShadow: colors.cardShadow }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: colors.text }}>
            Enrolled Classes & Timetable
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(child.classes || []).map(c => (
            <div
              key={c._id || c.id}
              style={{
                padding: '10px 12px',
                borderRadius: '12px',
                backgroundColor: colors.surfaceSubtle,
                border: `1px solid ${colors.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: colors.text }}>{c.name}</div>
                <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '2px' }}>
                  {c.dayOfWeek} {c.startTime} - {c.endTime} • {c.teacherName}
                </div>
              </div>
              <Badge variant="present">Active</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Child's Latest Exam Results */}
      <div style={{ backgroundColor: colors.surface, borderRadius: '18px', padding: '16px', border: `1px solid ${colors.border}`, boxShadow: colors.cardShadow }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: colors.text }}>
            Recent Marks & Grade Ranks
          </h3>
          <button
            onClick={() => onNavigate('progress')}
            style={{ background: 'none', border: 'none', color: colors.primaryLight, fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
          >
            Full Progress &gt;
          </button>
        </div>

        {(!child.recentMarks || child.recentMarks.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '16px', color: colors.textMuted, fontSize: '12px' }}>
            No exam marks recorded yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {child.recentMarks.slice(0, 3).map((m, i) => (
              <div
                key={i}
                style={{
                  padding: '10px 12px',
                  borderRadius: '12px',
                  backgroundColor: colors.surfaceSubtle,
                  border: `1px solid ${colors.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: colors.text }}>{m.examName}</div>
                  <div style={{ fontSize: '11px', color: colors.textMuted }}>{m.subject} • {m.date}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#10B981' }}>
                    {m.marksObtained}/{m.totalMarks} ({m.percentage}%)
                  </div>
                  <div style={{ fontSize: '10px', color: colors.primaryLight, fontWeight: '700' }}>
                    Grade {m.grade} • Rank #{m.rank}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;
