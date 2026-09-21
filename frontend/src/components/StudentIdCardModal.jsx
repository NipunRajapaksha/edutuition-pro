import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { X, QrCode, Shield, Award } from 'lucide-react';
import QRCode from 'qrcode';

const StudentIdCardModal = ({ student, onClose }) => {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const [qrSrc, setQrSrc] = useState('');

  useEffect(() => {
    if (student) {
      const payload = JSON.stringify({
        type: 'TUITION_STUDENT_ID',
        id: student._id || student.id,
        code: student.studentId,
        name: student.fullName,
        grade: student.grade
      });
      QRCode.toDataURL(payload, { width: 160, margin: 1 })
        .then(url => setQrSrc(url))
        .catch(err => console.error(err));
    }
  }, [student]);

  if (!student) return null;

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
          maxWidth: '380px',
          background: 'linear-gradient(145deg, #1E1B4B 0%, #0F172A 100%)',
          color: '#FFFFFF',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
          border: '1px solid rgba(255,255,255,0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Glow decoration */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(79, 70, 229, 0.4) 0%, transparent 70%)'
          }}
        />

        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: '#FFFFFF',
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

        {/* Institute Branding */}
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', color: '#A5B4FC', fontWeight: '700', letterSpacing: '0.05em' }}>
            <Shield size={15} />
            APEX TUITION ACADEMY
          </div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>
            ශිල්ප කලා උසස් අධ්‍යාපන ආයතනය
          </div>
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#38BDF8', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Official Student ID Card
          </div>
        </div>

        {/* Student Avatar and Info */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '18px' }}>
          <img
            src={student.photo || `https://api.dicebear.com/7.x/bottts/png?seed=${encodeURIComponent(student.studentId)}`}
            alt={student.fullName}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '16px',
              border: '2px solid #6366F1',
              backgroundColor: '#1E293B',
              objectFit: 'cover'
            }}
          />
          <div>
            <div style={{ fontSize: '16px', fontWeight: '800', lineHeight: 1.2 }}>
              {student.fullName}
            </div>
            <div
              style={{
                display: 'inline-block',
                marginTop: '4px',
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: 'rgba(99, 102, 241, 0.3)',
                color: '#C7D2FE',
                fontSize: '11px',
                fontWeight: '700'
              }}
            >
              {student.studentId}
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
              {student.grade} • {student.school || 'Secondary School'}
            </div>
          </div>
        </div>

        {/* QR Code Container */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px'
          }}
        >
          {qrSrc ? (
            <img src={qrSrc} alt="Student QR Code" style={{ width: '130px', height: '130px' }} />
          ) : (
            <QrCode size={120} color="#111827" />
          )}
          <span style={{ fontSize: '10px', color: '#4B5563', fontWeight: '600', marginTop: '4px' }}>
            Scan for Attendance & Identity
          </span>
        </div>

        {/* Card Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#94A3B8', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
          <span>Issued: 2026 Academic Year</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#34D399' }}>
            <Award size={12} /> Active Student
          </span>
        </div>
      </div>
    </div>
  );
};

export default StudentIdCardModal;
