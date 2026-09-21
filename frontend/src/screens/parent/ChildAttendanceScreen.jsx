import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/client';
import Badge from '../../components/Badge';
import { CalendarCheck2, CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';

const ChildAttendanceScreen = () => {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  const linkedStudentId = user?.linkedStudentId;

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!linkedStudentId) return;
      try {
        setLoading(true);
        const [stuRes, attRes] = await Promise.all([
          api.getStudentById(linkedStudentId),
          api.getStudentAttendanceHistory(linkedStudentId)
        ]);

        if (stuRes.data.success) setStudent(stuRes.data.data);
        if (attRes.data.success) setAttendance(attRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [linkedStudentId]);

  if (loading) {
    return <div style={{ padding: '30px', textAlign: 'center', color: colors.textMuted }}>{t('loading')}</div>;
  }

  const rate = attendance?.percentage ?? 100;
  const history = attendance?.history || [];

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '90px' }}>
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: colors.text }}>
          Child Attendance Tracking
        </h2>
        <div style={{ fontSize: '12px', color: colors.textMuted }}>
          Daily attendance sessions, check-in timestamps & absence alerts
        </div>
      </div>

      {/* Attendance Summary */}
      <div style={{ backgroundColor: colors.surface, borderRadius: '18px', padding: '18px', border: `1px solid ${colors.border}`, boxShadow: colors.cardShadow }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', color: colors.textMuted, fontWeight: '700' }}>
              OVERALL ATTENDANCE RATE
            </div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: rate >= 75 ? '#10B981' : '#EF4444', marginTop: '2px' }}>
              {rate}%
            </div>
          </div>
          <Badge variant={rate >= 75 ? 'present' : 'danger'}>
            {rate >= 75 ? 'Satisfactory' : 'Action Required'}
          </Badge>
        </div>

        {rate < 75 && (
          <div style={{ marginTop: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '10px 12px', borderRadius: '10px', fontSize: '12px', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} />
            <span>Attendance is below the recommended 75% limit. Please contact the teacher.</span>
          </div>
        )}
      </div>

      {/* Attendance History */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '800', color: colors.text }}>
          Session Attendance Log
        </h3>

        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', backgroundColor: colors.surface, borderRadius: '16px', color: colors.textMuted, fontSize: '12px' }}>
            No attendance records found.
          </div>
        ) : (
          history.map(item => (
            <div
              key={item._id}
              style={{
                backgroundColor: colors.surface,
                borderRadius: '14px',
                padding: '12px 14px',
                border: `1px solid ${colors.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: colors.text }}>
                  {item.className}
                </div>
                <div style={{ fontSize: '11px', color: colors.textMuted }}>
                  {item.date} {item.time && `• Checked in: ${item.time}`} {item.markedVia === 'qr' && '• 📱 QR'}
                </div>
              </div>

              <Badge variant={item.status}>
                {item.status}
              </Badge>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChildAttendanceScreen;
