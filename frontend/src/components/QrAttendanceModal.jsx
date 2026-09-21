import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api/client';
import { X, QrCode, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';

const QrAttendanceModal = ({ classItem, date, onAttendanceMarked, onClose }) => {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const [qrSrc, setQrSrc] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [marking, setMarking] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    if (classItem) {
      const payload = JSON.stringify({
        type: 'CLASS_ATTENDANCE_SESSION',
        classId: classItem._id || classItem.id,
        className: classItem.name,
        date: date || new Date().toISOString().split('T')[0],
        timestamp: Date.now()
      });

      QRCode.toDataURL(payload, { width: 220, margin: 1, color: { dark: '#1E1B4B', light: '#FFFFFF' } })
        .then(url => setQrSrc(url))
        .catch(err => console.error(err));
    }
  }, [classItem, date]);

  const handleSimulateScan = async () => {
    if (!manualCode.trim()) return;
    setMarking(true);
    setStatusMsg(null);

    try {
      // Find student by code
      const studentsRes = await api.getStudents({ q: manualCode.trim() });
      if (!studentsRes.data.success || studentsRes.data.data.length === 0) {
        setStatusMsg({ error: true, text: 'Student with this ID or Name not found' });
        setMarking(false);
        return;
      }

      const foundStudent = studentsRes.data.data[0];

      const res = await api.scanQrAttendance({
        qrData: {
          classId: classItem._id || classItem.id,
          date: date || new Date().toISOString().split('T')[0]
        },
        studentId: foundStudent._id
      });

      if (res.data.success) {
        setStatusMsg({ error: false, text: res.data.message });
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
        if (onAttendanceMarked) onAttendanceMarked();
        setManualCode('');
      } else {
        setStatusMsg({ error: true, text: res.data.message });
      }
    } catch (err) {
      setStatusMsg({
        error: true,
        text: err.response?.data?.message || 'Error processing QR scan attendance'
      });
    } finally {
      setMarking(false);
    }
  };

  if (!classItem) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: colors.surface,
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          border: `1px solid ${colors.border}`,
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: colors.surfaceSubtle,
            border: `1px solid ${colors.border}`,
            color: colors.text,
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={16} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: colors.primaryLight, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t('qrAttendance')}
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: colors.text, marginTop: '2px' }}>
            {classItem.name}
          </h3>
          <div style={{ fontSize: '12px', color: colors.textMuted }}>
            {t('date')}: {date}
          </div>
        </div>

        {/* Big QR Code Display */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
            marginBottom: '16px'
          }}
        >
          {qrSrc ? (
            <img src={qrSrc} alt="Class QR Attendance Code" style={{ width: '200px', height: '200px' }} />
          ) : (
            <QrCode size={180} color="#1E1B4B" />
          )}
          <span style={{ fontSize: '11px', color: '#4B5563', fontWeight: '600', marginTop: '8px', textAlign: 'center' }}>
            {t('scanToMarkAttendance')}
          </span>
        </div>

        {/* Quick Simulator / Student Scan Verification */}
        <div style={{ backgroundColor: colors.surfaceSubtle, borderRadius: '14px', padding: '14px', border: `1px solid ${colors.border}` }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: colors.textMuted, marginBottom: '8px' }}>
            SCAN / SIMULATE ATTENDANCE (STUDENT ID OR NAME)
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="e.g. STU-2026-001 or Kasun"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSimulateScan()}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '10px',
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.surface,
                color: colors.text,
                fontSize: '13px',
                outline: 'none'
              }}
            />
            <button
              onClick={handleSimulateScan}
              disabled={marking || !manualCode.trim()}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                backgroundColor: colors.primary,
                color: '#FFFFFF',
                border: 'none',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {marking ? <RefreshCw size={14} className="animate-spin" /> : 'Register'}
            </button>
          </div>

          {statusMsg && (
            <div
              style={{
                marginTop: '10px',
                fontSize: '12px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: statusMsg.error ? colors.danger : colors.success
              }}
            >
              {statusMsg.error ? <ShieldAlert size={15} /> : <CheckCircle2 size={15} />}
              <span>{statusMsg.text}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QrAttendanceModal;
