import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/client';
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
  UserCheck
} from 'lucide-react';

const InstituteSettingsScreen = ({ onSettingsUpdated }) => {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

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
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    </div>
  );
};

export default InstituteSettingsScreen;
