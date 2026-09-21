import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/client';
import Badge from '../../components/Badge';
import {
  User,
  School,
  Phone,
  Mail,
  MapPin,
  QrCode,
  Users,
  BookOpen,
  ShieldAlert,
  GraduationCap,
  Calendar,
  Lock
} from 'lucide-react';

const StudentProfileScreen = ({ onViewQrId }) => {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();

  const [student, setStudent] = useState(user?.studentProfile || null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.studentProfile?._id || user?.studentProfile?.id) {
      const studentId = user.studentProfile._id || user.studentProfile.id;
      setLoading(true);
      api.getStudentById(studentId)
        .then(res => {
          if (res.data.success) {
            setStudent(res.data.data);
          }
        })
        .catch(err => console.error('Error fetching student profile:', err))
        .finally(() => setLoading(false));
    }

    api.getClasses()
      .then(res => {
        if (res.data.success) {
          setClasses(res.data.data);
        }
      })
      .catch(err => console.error('Error fetching classes:', err));
  }, [user]);

  const studentClasses = classes.filter(c => 
    student?.enrolledClasses?.includes(c._id || c.id)
  );

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '90px' }}>
      {/* Student ID Card Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
          borderRadius: '20px',
          padding: '20px',
          color: '#FFFFFF',
          boxShadow: '0 8px 24px rgba(67, 56, 202, 0.35)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#A5B4FC', fontWeight: '700', letterSpacing: '0.05em' }}>
              OFFICIAL STUDENT PROFILE / ශිෂ්‍ය පැතිකඩ
            </div>
            <div style={{ fontSize: '20px', fontWeight: '800', marginTop: '4px' }}>
              {student?.fullName || user?.name}
            </div>
            <div style={{ fontSize: '13px', color: '#C7D2FE', marginTop: '2px', fontWeight: '600' }}>
              ID: {student?.studentId || 'STU-2026-001'}
            </div>
          </div>

          <button
            onClick={() => onViewQrId && onViewQrId(student || user?.studentProfile)}
            style={{
              padding: '10px 14px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '12px',
              backdropFilter: 'blur(10px)'
            }}
          >
            <QrCode size={16} />
            <span>Digital ID (QR)</span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)', padding: '6px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: '600' }}>
            🎓 {student?.grade || 'Grade 11'}
          </div>
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)', padding: '6px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: '600' }}>
            🏫 {student?.school || 'Ananda College'}
          </div>
        </div>
      </div>

      {/* Teacher-Only Permission Alert Box */}
      <div
        style={{
          padding: '12px 14px',
          borderRadius: '14px',
          backgroundColor: 'rgba(79, 70, 229, 0.08)',
          border: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <Lock size={18} color={colors.primaryLight} style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '12px', color: colors.textMuted, lineHeight: 1.4 }}>
          <strong style={{ color: colors.text }}>Notice / දැනුම්දීම:</strong> Student personal details and enrollments can only be updated by the teacher or institute admin.
        </div>
      </div>

      {/* Personal & Guardian Information */}
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: '18px',
          padding: '18px',
          border: `1px solid ${colors.border}`,
          boxShadow: colors.cardShadow,
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
      >
        <div style={{ fontSize: '14px', fontWeight: '800', color: colors.text }}>
          📋 Personal & Guardian Contact / සම්බන්ධතා තොරතුරු
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ backgroundColor: colors.surfaceSubtle, padding: '10px 12px', borderRadius: '12px' }}>
            <div style={{ fontSize: '11px', color: colors.textMuted }}>Student Phone</div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: colors.text, marginTop: '2px' }}>
              {student?.phone || 'Not provided'}
            </div>
          </div>

          <div style={{ backgroundColor: colors.surfaceSubtle, padding: '10px 12px', borderRadius: '12px' }}>
            <div style={{ fontSize: '11px', color: colors.textMuted }}>Parent / Guardian</div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: colors.text, marginTop: '2px' }}>
              {student?.parentName || 'Parent'}
            </div>
          </div>

          <div style={{ backgroundColor: colors.surfaceSubtle, padding: '10px 12px', borderRadius: '12px' }}>
            <div style={{ fontSize: '11px', color: colors.textMuted }}>Parent Phone</div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: colors.text, marginTop: '2px' }}>
              {student?.parentPhone || 'Not provided'}
            </div>
          </div>

          <div style={{ backgroundColor: colors.surfaceSubtle, padding: '10px 12px', borderRadius: '12px' }}>
            <div style={{ fontSize: '11px', color: colors.textMuted }}>Account Status</div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#10B981', marginTop: '2px' }}>
              Active (සක්‍රීයයි)
            </div>
          </div>
        </div>

        {student?.address && (
          <div style={{ backgroundColor: colors.surfaceSubtle, padding: '10px 12px', borderRadius: '12px' }}>
            <div style={{ fontSize: '11px', color: colors.textMuted }}>Home Address</div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: colors.text, marginTop: '2px' }}>
              {student.address}
            </div>
          </div>
        )}
      </div>

      {/* Enrolled Classes List */}
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: '18px',
          padding: '18px',
          border: `1px solid ${colors.border}`,
          boxShadow: colors.cardShadow
        }}
      >
        <div style={{ fontSize: '14px', fontWeight: '800', color: colors.text, marginBottom: '12px' }}>
          📚 Enrolled Classes / ලියාපදිංචි පන්ති ({studentClasses.length})
        </div>

        {studentClasses.length === 0 ? (
          <div style={{ fontSize: '12px', color: colors.textMuted, textAlign: 'center', padding: '14px' }}>
            No enrolled classes found
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {studentClasses.map(cls => (
              <div
                key={cls._id || cls.id}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  backgroundColor: colors.surfaceSubtle,
                  border: `1px solid ${colors.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: colors.text }}>
                    {cls.name}
                  </div>
                  <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '2px' }}>
                    {cls.subject} • {cls.grade} • Fee: Rs. {cls.monthlyFee}
                  </div>
                </div>
                <Badge variant="success" size="small">Enrolled</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfileScreen;
