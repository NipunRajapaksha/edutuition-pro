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
  BookOpen,
  LogOut
} from 'lucide-react';

const StudentDashboard = ({ onNavigate, onViewMyQr, onViewReceipt }) => {
  const { user, logout } = useAuth();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const [studentData, setStudentData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);

  const studentProfileId = user?.studentProfileId || user?.studentProfile?._id || user?.studentProfile?.id || user?._id || user?.id;

  useEffect(() => {
    let isMounted = true;
    const fetchStudentDashboard = async () => {
      setLoading(true);
      try {
        const [stuRes, clsRes, hwRes] = await Promise.all([
          api.getStudentById(studentProfileId),
          api.getClasses(),
          api.getStudentHomework(studentProfileId)
        ]);

        if (isMounted) {
          if (stuRes?.data?.success && stuRes.data.data) {
            setStudentData(stuRes.data.data);
          }
          if (clsRes?.data?.success && Array.isArray(clsRes.data.data)) {
            setClasses(clsRes.data.data);
          }
          if (hwRes?.data?.success && Array.isArray(hwRes.data.data)) {
            setHomework(hwRes.data.data);
          }
        }
      } catch (err) {
        console.error('Student dashboard fetch error:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStudentDashboard();
    return () => { isMounted = false; };
  }, [studentProfileId]);

  if (loading) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: colors.textMuted }}>
        <div style={{ fontSize: '15px', fontWeight: '700', color: colors.text }}>Loading Student Dashboard...</div>
        <div style={{ fontSize: '12px', marginTop: '6px' }}>Preparing your classes & attendance overview</div>
      </div>
    );
  }

  const student = studentData || user?.studentProfile || {
    fullName: user?.name || 'Student',
    studentId: user?.studentId || 'STU-2026-001',
    grade: user?.grade || 'Grade 11',
    school: user?.school || 'N.A.R Academy'
  };

  const stats = studentData?.stats || {
    attendancePercentage: 100,
    totalDays: 1,
    present: 1,
    totalFeeDue: 0,
    pendingBalance: 0
  };

  let enrolledClasses = (studentData?.classes || []).length > 0
    ? studentData.classes
    : classes.filter(c => (student.enrolledClasses || []).includes(c._id || c.id));

  if (enrolledClasses.length === 0 && classes.length > 0) {
    const studentGrade = student.grade || user?.grade;
    const gradeCls = studentGrade ? classes.filter(c => c.grade === studentGrade) : [];
    enrolledClasses = gradeCls.length > 0 ? gradeCls : classes.slice(0, 3);
  }

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
              STUDENT PORTAL • N.A.R ACADEMY
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginTop: '2px' }}>
              Hello, {student.fullName || user?.name}! 👋
            </h2>
            <div style={{ fontSize: '12px', color: '#C7D2FE', marginTop: '4px' }}>
              {student.studentId} • {student.grade || 'Grade 11'} • {student.school || 'Academy'}
            </div>
          </div>

          {/* Quick Buttons: QR ID and Sign Out */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => onViewMyQr && onViewMyQr(student)}
              style={{
                padding: '10px 12px',
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
              <QrCode size={20} />
              <span>QR ID</span>
            </button>

            <button
              onClick={logout}
              title="Sign Out (ගිණුමෙන් ඉවත් වන්න)"
              style={{
                padding: '10px 12px',
                borderRadius: '14px',
                backgroundColor: 'rgba(239, 68, 68, 0.25)',
                border: '1px solid rgba(239, 68, 68, 0.45)',
                color: '#FCA5A5',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                fontSize: '10px',
                fontWeight: '700'
              }}
            >
              <LogOut size={20} color="#EF4444" />
              <span>Log Out</span>
            </button>
          </div>
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
          {enrolledClasses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '16px', color: colors.textMuted, fontSize: '12px' }}>
              No tuition classes scheduled yet. New sessions will appear here automatically.
            </div>
          ) : (
            enrolledClasses.map(c => (
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
            ))
          )}
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
