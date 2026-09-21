import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/client';
import Badge from '../../components/Badge';
import {
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  Award,
  CircleDollarSign,
  QrCode,
  Sparkles,
  ChevronRight,
  BookOpen
} from 'lucide-react';

const StudentDashboard = ({ onNavigate, onViewMyQr, onViewReceipt }) => {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const [studentData, setStudentData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);

  const studentProfileId = user?.studentProfileId || user?.studentProfile?._id;

  useEffect(() => {
    const fetchStudentDashboard = async () => {
      if (!studentProfileId) return;
      try {
        setLoading(true);
        const [stuRes, clsRes, hwRes] = await Promise.all([
          api.getStudentById(studentProfileId),
          api.getClasses(),
          api.getStudentHomework(studentProfileId)
        ]);

        if (stuRes.data.success) setStudentData(stuRes.data.data);
        if (clsRes.data.success) setClasses(clsRes.data.data);
        if (hwRes.data.success) setHomework(hwRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDashboard();
  }, [studentProfileId]);

  if (loading) {
    return <div style={{ padding: '30px', textAlign: 'center', color: colors.textMuted }}>{t('loading')}</div>;
  }

  const student = studentData || user?.studentProfile || {};
  const stats = studentData?.stats || { attendancePercentage: 95, totalDays: 10, present: 9 };
  const enrolledClasses = (studentData?.classes || []).length > 0
    ? studentData.classes
    : classes.filter(c => (student.enrolledClasses || []).includes(c._id || c.id));

  const pendingHomework = homework.filter(h => h.submissionStatus !== 'reviewed' && h.submissionStatus !== 'submitted');

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '90px' }}>
      {/* Student Welcome & Digital ID Card Launcher */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
          borderRadius: '20px',
          padding: '20px',
          color: '#FFFFFF',
          boxShadow: '0 8px 24px rgba(79, 70, 229, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#A5B4FC' }}>
              STUDENT PORTAL
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginTop: '2px' }}>
              Hello, {student.fullName || user?.name}! 👋
            </h2>
            <div style={{ fontSize: '12px', color: '#C7D2FE', marginTop: '4px' }}>
              {student.studentId} • {student.grade || 'Grade 10'} • {student.school}
            </div>
          </div>

          {/* QR ID Button */}
          <button
            onClick={() => onViewMyQr(student)}
            style={{
              padding: '10px 14px',
              borderRadius: '14px',
              backgroundColor: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              fontSize: '10px',
              fontWeight: '700'
            }}
          >
            <QrCode size={22} />
            <span>My QR ID</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        <div style={{ backgroundColor: colors.surface, padding: '12px', borderRadius: '14px', border: `1px solid ${colors.border}`, textAlign: 'center' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: colors.textMuted }}>ATTENDANCE</div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: stats.attendancePercentage >= 75 ? '#10B981' : '#EF4444', marginTop: '4px' }}>
            {stats.attendancePercentage}%
          </div>
        </div>

        <div style={{ backgroundColor: colors.surface, padding: '12px', borderRadius: '14px', border: `1px solid ${colors.border}`, textAlign: 'center' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: colors.textMuted }}>PENDING HW</div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: pendingHomework.length > 0 ? '#F59E0B' : '#10B981', marginTop: '4px' }}>
            {pendingHomework.length}
          </div>
        </div>

        <div style={{ backgroundColor: colors.surface, padding: '12px', borderRadius: '14px', border: `1px solid ${colors.border}`, textAlign: 'center' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: colors.textMuted }}>FEE DUE</div>
          <div style={{ fontSize: '16px', fontWeight: '800', color: (stats.pendingBalance || 0) > 0 ? '#EF4444' : '#10B981', marginTop: '6px' }}>
            {(stats.pendingBalance || 0) > 0 ? `Rs. ${stats.pendingBalance}` : 'Settled'}
          </div>
        </div>
      </div>

      {/* Today / Enrolled Classes */}
      <div style={{ backgroundColor: colors.surface, borderRadius: '18px', padding: '16px', border: `1px solid ${colors.border}`, boxShadow: colors.cardShadow }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: colors.text }}>
            My Enrolled Classes ({enrolledClasses.length})
          </h3>
          <button
            onClick={() => onNavigate('classes')}
            style={{ background: 'none', border: 'none', color: colors.primaryLight, fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
          >
            Details &gt;
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {enrolledClasses.map(c => (
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
                <div style={{ fontSize: '11px', color: colors.textMuted, display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <Clock size={12} /> {c.dayOfWeek} {c.startTime} - {c.endTime}
                </div>
              </div>
              <Badge variant="present">Enrolled</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Homework */}
      <div style={{ backgroundColor: colors.surface, borderRadius: '18px', padding: '16px', border: `1px solid ${colors.border}`, boxShadow: colors.cardShadow }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: colors.text }}>
            Pending Homework Assignments
          </h3>
          <button
            onClick={() => onNavigate('homework')}
            style={{ background: 'none', border: 'none', color: colors.primaryLight, fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
          >
            View All &gt;
          </button>
        </div>

        {pendingHomework.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '16px', color: '#10B981', fontSize: '12px', fontWeight: '600' }}>
            ✓ All caught up! No pending homework.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pendingHomework.map(hw => (
              <div
                key={hw._id || hw.id}
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
                  <div style={{ fontSize: '13px', fontWeight: '700', color: colors.text }}>{hw.title}</div>
                  <div style={{ fontSize: '11px', color: '#F59E0B', marginTop: '2px' }}>
                    Due: {hw.deadline} ({hw.className})
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('homework')}
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
                  Submit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Exam Marks */}
      <div style={{ backgroundColor: colors.surface, borderRadius: '18px', padding: '16px', border: `1px solid ${colors.border}`, boxShadow: colors.cardShadow }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: colors.text }}>
            Recent Exam Results
          </h3>
          <button
            onClick={() => onNavigate('results')}
            style={{ background: 'none', border: 'none', color: colors.primaryLight, fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
          >
            Report Card &gt;
          </button>
        </div>

        {(!studentData?.recentMarks || studentData.recentMarks.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '16px', color: colors.textMuted, fontSize: '12px' }}>
            No exam marks published yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {studentData.recentMarks.slice(0, 3).map((m, i) => (
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
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#10B981' }}>
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

export default StudentDashboard;
