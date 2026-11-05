import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/client';
import confetti from 'canvas-confetti';
import {
  Building,
  Phone,
  Mail,
  MapPin,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Percent,
  FileText,
  DollarSign,
  UserCheck,
  Smartphone,
  Crown,
  Key,
  Database,
  UploadCloud,
  RefreshCw,
  Users,
  GraduationCap,
  Sparkles,
  Zap
} from 'lucide-react';
import DataSyncModal from '../../components/modals/DataSyncModal';

const InstituteSettingsScreen = ({ onSettingsUpdated }) => {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const [showSyncModal, setShowSyncModal] = useState(false);

  const [formData, setFormData] = useState({
    instituteName: '',
    principalName: '',
    phone: '',
    email: '',
    address: '',
    currency: 'Rs.',
    minAttendanceAlertPercent: 75,
    receiptFooterNote: 'Thank you for your timely payment. Keep this receipt safe.',
    enableAiAssistant: true
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Commercial Licensing & Tier State
  const [planInfo, setPlanInfo] = useState({
    plan: 'standard',
    isPremium: false,
    maxTeachers: 10,
    maxStudents: 500,
    maxParents: 500,
    isCloudConnected: false
  });
  const [counts, setCounts] = useState({
    teachers: 0,
    students: 0,
    parents: 0
  });
  const [licenseInput, setLicenseInput] = useState('');
  const [activatingLicense, setActivatingLicense] = useState(false);
  const [licenseMessage, setLicenseMessage] = useState(null);

  // Emergency Recovery State
  const [cachedStudents, setCachedStudents] = useState([]);
  const [restoringStudents, setRestoringStudents] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState(null);

  // Cloud Database Diagnostics State
  const [dbStatus, setDbStatus] = useState(null);
  const [reconnectingDb, setReconnectingDb] = useState(false);
  const [dbReconnectMsg, setDbReconnectMsg] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.getSettings();
      if (res.data.success && res.data.data) {
        setFormData(prev => ({
          ...prev,
          ...res.data.data
        }));

        setPlanInfo({
          plan: res.data.data.plan || 'standard',
          isPremium: res.data.data.plan === 'premium' || res.data.data.isPremium === true,
          maxTeachers: res.data.data.maxTeachers || 10,
          maxStudents: res.data.data.maxStudents || 500,
          maxParents: res.data.data.maxParents || 500,
          isCloudConnected: res.data.data.isCloudConnected || false
        });

        if (res.data.data.dbStatus) {
          setDbStatus(res.data.data.dbStatus);
        }
      }

      // Fetch user & student counts
      try {
        const usersRes = await api.getUsers().catch(() => null);
        const allUsers = usersRes?.data?.data || [];
        const teacherCount = allUsers.filter(u => u.role === 'teacher' || u.role === 'admin').length;
        const parentCount = allUsers.filter(u => u.role === 'parent').length;

        const studentsRes = await api.getStudents().catch(() => null);
        const allStudents = studentsRes?.data?.data || [];

        setCounts({
          teachers: teacherCount,
          students: allStudents.length,
          parents: parentCount
        });
      } catch {}

      // Scan localStorage for any cached students
      try {
        const rawLocal = localStorage.getItem('edutuition_students');
        if (rawLocal) {
          const parsed = JSON.parse(rawLocal);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCachedStudents(parsed);
          }
        }
      } catch {}
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleReconnectDb = async () => {
    setReconnectingDb(true);
    setDbReconnectMsg(null);
    try {
      const res = await api.reconnectDb();
      if (res.data?.success) {
        setPlanInfo(prev => ({ ...prev, isCloudConnected: true }));
        setDbStatus(res.data.data?.dbStatus || null);
        setDbReconnectMsg({ type: 'success', text: '✅ Successfully connected to MongoDB Atlas Cloud!' });
        fetchSettings();
      } else {
        setDbStatus(res.data?.data?.dbStatus || null);
        setDbReconnectMsg({
          type: 'error',
          text: res.data?.message || 'Connection failed. Please check MongoDB Atlas Network Access and credentials.'
        });
      }
    } catch (e) {
      setDbReconnectMsg({ type: 'error', text: e.message || 'Error testing MongoDB connection' });
    } finally {
      setReconnectingDb(false);
    }
  };

  const handleActivateLicense = async (e) => {
    e.preventDefault();
    if (!licenseInput.trim()) {
      setLicenseMessage({ type: 'error', text: 'Please enter a valid License Key' });
      return;
    }
    setActivatingLicense(true);
    setLicenseMessage(null);
    try {
      const res = await api.activateLicense(licenseInput.trim());
      if (res?.data?.success) {
        setPlanInfo(prev => ({
          ...prev,
          plan: 'premium',
          isPremium: true,
          maxTeachers: 1000,
          maxStudents: 10000,
          maxParents: 10000
        }));
        setFormData(prev => ({
          ...prev,
          enableAiAssistant: true
        }));
        setLicenseMessage({
          type: 'success',
          text: '🎉 Premium Enterprise License Activated! Quotas expanded & AI Assistant unlocked.'
        });
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        setLicenseInput('');
      }
    } catch (err) {
      setLicenseMessage({ type: 'error', text: err.message || 'Invalid License Key' });
    } finally {
      setActivatingLicense(false);
    }
  };

  const handleRecoverStudents = async () => {
    if (!cachedStudents || cachedStudents.length === 0) return;
    setRestoringStudents(true);
    setRecoveryMessage(null);
    try {
      let restored = 0;
      for (const st of cachedStudents) {
        try {
          await api.createStudent(st);
          restored++;
        } catch {}
      }
      setRecoveryMessage({
        type: 'success',
        text: `✓ Successfully synchronized ${restored} students from local browser storage to system!`
      });
      fetchSettings();
    } catch (err) {
      setRecoveryMessage({
        type: 'error',
        text: 'Error recovering students: ' + err.message
      });
    } finally {
      setRestoringStudents(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await api.updateSettings(formData);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Institute settings successfully saved! (ආයතන තොරතුරු යාවත්කාලීන විය)' });
        if (onSettingsUpdated) {
          onSettingsUpdated(res.data.data);
        }
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', color: colors.textMuted }}>
        {t('loading')}
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '90px' }}>
      {/* Title Card */}
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: '18px',
          padding: '18px',
          border: `1px solid ${colors.border}`,
          boxShadow: colors.cardShadow,
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}
      >
        <div
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)'
          }}
        >
          <Building size={24} />
        </div>
        <div>
          <div style={{ fontSize: '17px', fontWeight: '800', color: colors.text }}>
            {t('navInstituteSettings')}
          </div>
          <div style={{ fontSize: '12px', color: colors.textMuted }}>
            Customize your tuition class name, contact details & receipts
          </div>
        </div>
      </div>

      {/* Plan & Commercial Licensing Card */}
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: '18px',
          padding: '20px',
          border: planInfo.isPremium ? '2px solid rgba(245, 158, 11, 0.4)' : `1px solid ${colors.border}`,
          boxShadow: colors.cardShadow,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: planInfo.isPremium ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' : 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Crown size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '15px', fontWeight: '800', color: colors.text }}>
                  Commercial Plan & Quotas
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '2px 8px',
                    borderRadius: '8px',
                    backgroundColor: planInfo.isPremium ? 'rgba(245, 158, 11, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                    color: planInfo.isPremium ? '#F59E0B' : '#6366F1'
                  }}
                >
                  {planInfo.isPremium ? '👑 PREMIUM ENTERPRISE' : 'STANDARD PLAN'}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '2px' }}>
                {planInfo.isPremium ? 'Unlimited accounts, full AI Assistant suite active' : 'Default allocation: 10 Teachers, 500 Students, 500 Parents'}
              </div>
            </div>
          </div>
        </div>

        {/* Database Persistence Status Badge */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '12px 14px',
            borderRadius: '12px',
            backgroundColor: planInfo.isCloudConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            border: `1px solid ${planInfo.isCloudConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: planInfo.isCloudConnected ? '#10B981' : '#F59E0B' }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: planInfo.isCloudConnected ? '#10B981' : '#D97706' }}>
                  {planInfo.isCloudConnected ? 'Cloud Database Connected (100% Data Loss Proof)' : 'Embedded Storage Active'}
                </div>
                <div style={{ fontSize: '11px', color: colors.textMuted }}>
                  {planInfo.isCloudConnected
                    ? 'All students, attendance and fee records are permanently backed up to the cloud.'
                    : dbStatus?.hasMongoUri
                      ? `MONGODB_URI detected (${dbStatus.maskedUri || 'mongodb+srv://...'}), but connection failed.`
                      : 'MONGODB_URI not detected in current deployment. If you just added it in Vercel, click Redeploy in Vercel.'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReconnectDb}
              disabled={reconnectingDb}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                color: colors.text,
                fontSize: '11px',
                fontWeight: '700',
                cursor: reconnectingDb ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={13} className={reconnectingDb ? 'spin' : ''} />
              <span>{reconnectingDb ? 'Testing Connection...' : 'Test / Reconnect MongoDB'}</span>
            </button>
          </div>

          {!planInfo.isCloudConnected && (
            <div style={{ fontSize: '11px', color: colors.textMuted, borderTop: `1px dashed ${colors.border}`, paddingTop: '6px' }}>
              {dbStatus?.lastError && (
                <div style={{ color: '#EF4444', fontWeight: '600', marginBottom: '4px' }}>
                  Reason: {dbStatus.lastError}
                </div>
              )}
              {dbStatus?.hasMongoUri ? (
                <div>
                  <strong>Common Fix:</strong> In MongoDB Atlas, go to <strong>Network Access</strong> &rarr; click <strong>Add IP Address</strong> &rarr; select <strong>Allow Access from Anywhere (0.0.0.0/0)</strong>. Also check that your database username &amp; password in MONGODB_URI are correct.
                </div>
              ) : (
                <div>
                  <strong>To activate:</strong> In Vercel &rarr; <strong>Deployments</strong> &rarr; click <strong>...</strong> next to the latest deployment &rarr; click <strong>Redeploy</strong> to apply the newly added MONGODB_URI.
                </div>
              )}
            </div>
          )}

          {dbReconnectMsg && (
            <div style={{ fontSize: '11px', fontWeight: '700', color: dbReconnectMsg.type === 'success' ? '#10B981' : '#EF4444' }}>
              {dbReconnectMsg.text}
            </div>
          )}
        </div>

        {/* Quota Progress Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
          {/* Teachers Quota */}
          <div style={{ backgroundColor: colors.surfaceSubtle, padding: '12px 14px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: colors.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Users size={14} /> Teachers
              </span>
              <span style={{ fontSize: '12px', fontWeight: '800', color: colors.text }}>
                {counts.teachers} / {planInfo.isPremium ? '∞' : planInfo.maxTeachers}
              </span>
            </div>
            <div style={{ width: '100%', height: '6px', borderRadius: '3px', backgroundColor: colors.border, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: planInfo.isPremium ? '20%' : `${Math.min(100, (counts.teachers / planInfo.maxTeachers) * 100)}%`,
                  backgroundColor: counts.teachers >= planInfo.maxTeachers && !planInfo.isPremium ? '#EF4444' : '#6366F1',
                  borderRadius: '3px'
                }}
              />
            </div>
          </div>

          {/* Students Quota */}
          <div style={{ backgroundColor: colors.surfaceSubtle, padding: '12px 14px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: colors.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <GraduationCap size={14} /> Students
              </span>
              <span style={{ fontSize: '12px', fontWeight: '800', color: colors.text }}>
                {counts.students} / {planInfo.isPremium ? '∞' : planInfo.maxStudents}
              </span>
            </div>
            <div style={{ width: '100%', height: '6px', borderRadius: '3px', backgroundColor: colors.border, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: planInfo.isPremium ? '15%' : `${Math.min(100, (counts.students / planInfo.maxStudents) * 100)}%`,
                  backgroundColor: counts.students >= planInfo.maxStudents && !planInfo.isPremium ? '#EF4444' : '#10B981',
                  borderRadius: '3px'
                }}
              />
            </div>
          </div>

          {/* Parents Quota */}
          <div style={{ backgroundColor: colors.surfaceSubtle, padding: '12px 14px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: colors.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <UserCheck size={14} /> Parents
              </span>
              <span style={{ fontSize: '12px', fontWeight: '800', color: colors.text }}>
                {counts.parents} / {planInfo.isPremium ? '∞' : planInfo.maxParents}
              </span>
            </div>
            <div style={{ width: '100%', height: '6px', borderRadius: '3px', backgroundColor: colors.border, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: planInfo.isPremium ? '10%' : `${Math.min(100, (counts.parents / planInfo.maxParents) * 100)}%`,
                  backgroundColor: counts.parents >= planInfo.maxParents && !planInfo.isPremium ? '#EF4444' : '#06B6D4',
                  borderRadius: '3px'
                }}
              />
            </div>
          </div>
        </div>

        {/* License Key Activation Form */}
        <form onSubmit={handleActivateLicense} style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px', borderTop: `1px dashed ${colors.border}` }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
              <Key size={16} color={colors.textMuted} style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                value={licenseInput}
                onChange={(e) => setLicenseInput(e.target.value.toUpperCase())}
                placeholder="Enter License Key (e.g. PREMIUM-2026)"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: '10px',
                  backgroundColor: colors.surfaceSubtle,
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                  fontSize: '12px',
                  fontWeight: '700',
                  letterSpacing: '0.5px'
                }}
              />
            </div>
            <button
              type="submit"
              disabled={activatingLicense}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: '700',
                fontSize: '12px',
                cursor: activatingLicense ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Zap size={14} />
              <span>{activatingLicense ? 'Activating...' : 'Activate License'}</span>
            </button>
          </div>

          {licenseMessage && (
            <div style={{ fontSize: '12px', fontWeight: '600', color: licenseMessage.type === 'success' ? '#10B981' : '#EF4444' }}>
              {licenseMessage.text}
            </div>
          )}
        </form>
      </div>

      {message && (
        <div
          style={{
            padding: '12px 14px',
            borderRadius: '12px',
            backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${message.type === 'success' ? '#10B981' : '#EF4444'}`,
            color: message.type === 'success' ? '#10B981' : '#EF4444',
            fontSize: '13px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Basic Info Section */}
        <div
          style={{
            backgroundColor: colors.surface,
            borderRadius: '16px',
            padding: '16px',
            border: `1px solid ${colors.border}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: '700', color: colors.primaryLight, marginBottom: '4px' }}>
            🏢 Primary Identity / මූලික තොරතුරු
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: colors.textMuted, marginBottom: '6px' }}>
              {t('instituteName')} *
            </label>
            <input
              type="text"
              required
              value={formData.instituteName}
              onChange={(e) => handleChange('instituteName', e.target.value)}
              placeholder="e.g. Apex Tuition Academy / ශිල්ප කලා ඇකඩමි"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                backgroundColor: colors.surfaceSubtle,
                border: `1px solid ${colors.border}`,
                color: colors.text,
                fontSize: '14px',
                fontWeight: '600',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: colors.textMuted, marginBottom: '6px' }}>
              {t('principalName')}
            </label>
            <div style={{ position: 'relative' }}>
              <UserCheck size={16} color={colors.textMuted} style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                value={formData.principalName}
                onChange={(e) => handleChange('principalName', e.target.value)}
                placeholder="e.g. Mr. Sunil Perera (B.Sc. Eng)"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: '10px',
                  backgroundColor: colors.surfaceSubtle,
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* Contact Details Section */}
        <div
          style={{
            backgroundColor: colors.surface,
            borderRadius: '16px',
            padding: '16px',
            border: `1px solid ${colors.border}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: '700', color: colors.primaryLight, marginBottom: '4px' }}>
            📞 Contact Information / සම්බන්ධතා විස්තර
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: colors.textMuted, marginBottom: '6px' }}>
              {t('contactPhone')}
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} color={colors.textMuted} style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="e.g. +94 77 123 4567"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: '10px',
                  backgroundColor: colors.surfaceSubtle,
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: colors.textMuted, marginBottom: '6px' }}>
              {t('officialEmail')}
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color={colors.textMuted} style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="e.g. info@apextuition.lk"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: '10px',
                  backgroundColor: colors.surfaceSubtle,
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: colors.textMuted, marginBottom: '6px' }}>
              {t('address')}
            </label>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} color={colors.textMuted} style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="e.g. 142 High Level Road, Nugegoda, Sri Lanka"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: '10px',
                  backgroundColor: colors.surfaceSubtle,
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* Finance & Receipt Customization */}
        <div
          style={{
            backgroundColor: colors.surface,
            borderRadius: '16px',
            padding: '16px',
            border: `1px solid ${colors.border}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: '700', color: colors.primaryLight, marginBottom: '4px' }}>
            💳 Receipts & Automation / ලදුපත් සහ ගාස්තු
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: colors.textMuted, marginBottom: '6px' }}>
                Currency (මුදල් සංකේතය)
              </label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                placeholder="Rs. / LKR / රු."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  backgroundColor: colors.surfaceSubtle,
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: colors.textMuted, marginBottom: '6px' }}>
                {t('minAttendanceAlert')}
              </label>
              <input
                type="number"
                min="10"
                max="100"
                value={formData.minAttendanceAlertPercent}
                onChange={(e) => handleChange('minAttendanceAlertPercent', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  backgroundColor: colors.surfaceSubtle,
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: colors.textMuted, marginBottom: '6px' }}>
              {t('receiptFooterNote')}
            </label>
            <textarea
              rows={2}
              value={formData.receiptFooterNote}
              onChange={(e) => handleChange('receiptFooterNote', e.target.value)}
              placeholder="e.g. Payments are non-refundable. Thank you!"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                backgroundColor: colors.surfaceSubtle,
                border: `1px solid ${colors.border}`,
                color: colors.text,
                fontSize: '13px',
                outline: 'none',
                resize: 'none'
              }}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={saving}
          style={{
            backgroundColor: colors.primary,
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '14px',
            padding: '14px',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)',
            opacity: saving ? 0.7 : 1
          }}
        >
          <Save size={18} />
          <span>{saving ? 'Saving Changes...' : 'Save Institute Settings (සුරකින්න)'}</span>
        </button>
      </form>

      {/* Emergency Data Recovery (33 Students Scanner) */}
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: '16px',
          padding: '18px',
          border: `1px solid ${cachedStudents.length > 0 ? 'rgba(16, 185, 129, 0.4)' : colors.border}`,
          boxShadow: colors.cardShadow,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={20} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '800', color: colors.text }}>
                Emergency Data Recovery & Browser Cache Scanner
              </div>
              <div style={{ fontSize: '11px', color: colors.textMuted }}>
                {cachedStudents.length > 0
                  ? `Found ${cachedStudents.length} student records cached in this browser!`
                  : 'Scans your browser storage for your previously added students'}
              </div>
            </div>
          </div>

          {cachedStudents.length > 0 && (
            <button
              type="button"
              onClick={handleRecoverStudents}
              disabled={restoringStudents}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '12px',
                fontWeight: '700',
                cursor: restoringStudents ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={14} className={restoringStudents ? 'spin' : ''} />
              <span>{restoringStudents ? 'Syncing...' : `Restore & Save ${cachedStudents.length} Students to System`}</span>
            </button>
          )}
        </div>

        {recoveryMessage && (
          <div style={{ fontSize: '12px', fontWeight: '600', color: recoveryMessage.type === 'success' ? '#10B981' : '#EF4444' }}>
            {recoveryMessage.text}
          </div>
        )}
      </div>

      {/* Device Sync & Cloud Section */}
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: '16px',
          padding: '18px',
          border: `1px solid ${colors.border}`,
          boxShadow: colors.cardShadow,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: colors.text }}>
              📲 PC & Mobile Data Sync / Cloud Setup
            </div>
            <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '2px' }}>
              Transfer accounts, classes and students between PC and Mobile devices
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowSyncModal(true)}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              backgroundColor: colors.surfaceSubtle,
              border: `1px solid ${colors.border}`,
              color: colors.primaryLight,
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Smartphone size={15} color="#10B981" />
            <span>Open Sync Manager</span>
          </button>
        </div>
      </div>

      {showSyncModal && (
        <DataSyncModal
          isOpen={showSyncModal}
          onClose={() => setShowSyncModal(false)}
          initialMode="export"
          onSyncCompleted={() => {
            fetchSettings();
          }}
        />
      )}
    </div>
  );
};

export default InstituteSettingsScreen;
