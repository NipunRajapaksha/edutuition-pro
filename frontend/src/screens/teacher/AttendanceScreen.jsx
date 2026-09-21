import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/client';
import Badge from '../../components/Badge';
import QrAttendanceModal from '../../components/QrAttendanceModal';
import confetti from 'canvas-confetti';
import {
  CalendarCheck2,
  QrCode,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  Sparkles,
  RefreshCw,
  Users
} from 'lucide-react';

const AttendanceScreen = () => {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Load classes
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const res = await api.getClasses();
        if (res.data.success && res.data.data.length > 0) {
          setClasses(res.data.data);
          setSelectedClassId(res.data.data[0]._id || res.data.data[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadClasses();
  }, []);

  // Fetch attendance when class or date changes
  const fetchAttendance = async () => {
    if (!selectedClassId || !selectedDate) return;
    setLoading(true);
    try {
      const res = await api.getAttendance({ classId: selectedClassId, date: selectedDate });
      if (res.data.success) {
        setAttendanceData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedClassId, selectedDate]);

  const handleMarkAllPresent = async () => {
    setActionLoading(true);
    try {
      const res = await api.markAttendanceAll({ classId: selectedClassId, date: selectedDate });
      if (res.data.success) {
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
        fetchAttendance();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating attendance');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (studentId, currentStatus) => {
    const statusCycle = {
      not_marked: 'present',
      present: 'late',
      late: 'absent',
      absent: 'excused',
      excused: 'present'
    };
    const nextStatus = statusCycle[currentStatus] || 'present';

    try {
      await api.markAttendanceSingle({
        classId: selectedClassId,
        studentId,
        date: selectedDate,
        status: nextStatus
      });
      fetchAttendance();
    } catch (err) {
      console.error(err);
    }
  };

  const selectedClass = classes.find(c => (c._id || c.id) === selectedClassId);
  const summary = attendanceData?.summary || { totalEnrolled: 0, presentCount: 0, lateCount: 0, absentCount: 0, rate: 0 };
  const roster = attendanceData?.roster || [];

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '90px' }}>
      {/* Screen Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: colors.text }}>
            {t('navAttendance')}
          </h2>
          <div style={{ fontSize: '12px', color: colors.textMuted }}>
            Record class attendance & dynamic QR scanning
          </div>
        </div>

        {/* Generate Class QR button */}
        <button
          onClick={() => setShowQrModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '9px 14px',
            borderRadius: '12px',
            backgroundColor: 'rgba(79, 70, 229, 0.15)',
            border: '1px solid rgba(79, 70, 229, 0.3)',
            color: colors.primaryLight,
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          <QrCode size={16} />
          {t('generateClassQr')}
        </button>
      </div>

      {/* Selectors Bar */}
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: '16px',
          padding: '14px',
          border: `1px solid ${colors.border}`,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px'
        }}
      >
        <div>
          <label style={{ fontSize: '11px', fontWeight: '700', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>
            SELECT CLASS
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '10px',
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.surfaceSubtle,
              color: colors.text,
              fontSize: '12px',
              fontWeight: '600',
              outline: 'none'
            }}
          >
            {classes.map(c => (
              <option key={c._id || c.id} value={c._id || c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '11px', fontWeight: '700', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>
            SELECT DATE
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '10px',
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.surfaceSubtle,
              color: colors.text,
              fontSize: '12px',
              fontWeight: '600',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Attendance Summary Banner */}
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: '18px',
          padding: '16px',
          border: `1px solid ${colors.border}`,
          boxShadow: colors.cardShadow,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '12px', color: colors.textMuted, fontWeight: '600' }}>
              Attendance Turnout
            </span>
            <div style={{ fontSize: '24px', fontWeight: '800', color: summary.rate >= 75 ? '#10B981' : '#F59E0B' }}>
              {summary.rate}%
            </div>
          </div>

          <button
            onClick={handleMarkAllPresent}
            disabled={actionLoading}
            style={{
              padding: '10px 16px',
              borderRadius: '12px',
              backgroundColor: colors.primary,
              color: '#FFFFFF',
              border: 'none',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
            }}
          >
            {actionLoading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {t('markAllPresent')}
          </button>
        </div>

        {/* Pill Counters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', textAlign: 'center' }}>
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '6px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div style={{ fontSize: '10px', color: '#10B981', fontWeight: '700' }}>Present</div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#10B981' }}>{summary.presentCount}</div>
          </div>
          <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '6px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <div style={{ fontSize: '10px', color: '#F59E0B', fontWeight: '700' }}>Late</div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#F59E0B' }}>{summary.lateCount}</div>
          </div>
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '6px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <div style={{ fontSize: '10px', color: '#EF4444', fontWeight: '700' }}>Absent</div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#EF4444' }}>{summary.absentCount}</div>
          </div>
          <div style={{ backgroundColor: 'rgba(14, 165, 233, 0.1)', padding: '6px', borderRadius: '8px', border: '1px solid rgba(14, 165, 233, 0.2)' }}>
            <div style={{ fontSize: '10px', color: '#0EA5E9', fontWeight: '700' }}>Excused</div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#0EA5E9' }}>{summary.excusedCount || 0}</div>
          </div>
        </div>
      </div>

      {/* Students Attendance Roster */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px', color: colors.textMuted }}>{t('loading')}</div>
      ) : roster.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', backgroundColor: colors.surface, borderRadius: '16px', border: `1px solid ${colors.border}`, color: colors.textMuted }}>
          No students enrolled in this class.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {roster.map(st => (
            <div
              key={st.studentId}
              style={{
                backgroundColor: colors.surface,
                borderRadius: '14px',
                padding: '12px 14px',
                border: `1px solid ${colors.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src={st.photo || `https://api.dicebear.com/7.x/bottts/png?seed=${encodeURIComponent(st.code)}`}
                  alt={st.fullName}
                  style={{ width: '38px', height: '38px', borderRadius: '10px', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: colors.text }}>
                    {st.fullName}
                  </div>
                  <div style={{ fontSize: '11px', color: colors.textMuted }}>
                    {st.code} {st.time && `• Marked: ${st.time}`} {st.markedVia === 'qr' && '• 📱 QR'}
                  </div>
                </div>
              </div>

              {/* Status Clickable Button */}
              <button
                onClick={() => handleToggleStatus(st.studentId, st.status)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: '1px solid',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'capitalize',
                  backgroundColor:
                    st.status === 'present' ? 'rgba(16, 185, 129, 0.15)' :
                    st.status === 'late' ? 'rgba(245, 158, 11, 0.15)' :
                    st.status === 'absent' ? 'rgba(239, 68, 68, 0.15)' :
                    st.status === 'excused' ? 'rgba(14, 165, 233, 0.15)' : colors.surfaceSubtle,
                  borderColor:
                    st.status === 'present' ? '#10B981' :
                    st.status === 'late' ? '#F59E0B' :
                    st.status === 'absent' ? '#EF4444' :
                    st.status === 'excused' ? '#0EA5E9' : colors.border,
                  color:
                    st.status === 'present' ? '#10B981' :
                    st.status === 'late' ? '#F59E0B' :
                    st.status === 'absent' ? '#EF4444' :
                    st.status === 'excused' ? '#0EA5E9' : colors.textMuted
                }}
              >
                {st.status === 'not_marked' ? 'Not Marked' : st.status}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dynamic QR Modal */}
      {showQrModal && (
        <QrAttendanceModal
          classItem={selectedClass}
          date={selectedDate}
          onAttendanceMarked={fetchAttendance}
          onClose={() => setShowQrModal(false)}
        />
      )}
    </div>
  );
};

export default AttendanceScreen;
