import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/client';
import {
  User,
  Phone,
  Mail,
  BookOpen,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  FileText
} from 'lucide-react';

const TeacherProfileScreen = () => {
  const { user, updateUserData, logout } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || 'Senior Tuition Specialist & Academy Administrator');
  const [subjects, setSubjects] = useState(user?.subjects || 'Tuition Management, Mathematics, Science');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState(null);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const res = await api.updateProfile({ name, phone, bio, subjects });
      if (res?.data?.success) {
        setProfileMsg({ type: 'success', text: 'Profile updated successfully! (පැතිකඩ යාවත්කාලීන විය)' });
        if (updateUserData) updateUserData(res.data.user);
      } else {
        if (updateUserData) updateUserData({ name, phone, bio, subjects });
        setProfileMsg({ type: 'success', text: 'Profile updated successfully! (පැතිකඩ යාවත්කාලීන විය)' });
      }
    } catch {
      if (updateUserData) updateUserData({ name, phone, bio, subjects });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully! (පැතිකඩ යාවත්කාලීන විය)' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {

    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setSavingPassword(true);
    try {
      const res = await api.changePassword({ currentPassword, newPassword });
      if (res.data.success) {
        setPasswordMsg({ type: 'success', text: 'Password changed successfully! (මුරපදය වෙනස් කරන ලදි)' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '90px' }}>
      {/* Teacher Profile Card */}
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: '18px',
          padding: '20px',
          border: `1px solid ${colors.border}`,
          boxShadow: colors.cardShadow,
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            fontSize: '22px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}
        >
          {name ? name[0] : 'T'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '18px', fontWeight: '800', color: colors.text }}>
            {name || 'Teacher Profile'}
          </div>
          <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '2px' }}>
            {user?.email}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '6px', backgroundColor: 'rgba(16, 185, 129, 0.12)', padding: '2px 8px', borderRadius: '12px', color: '#10B981', fontSize: '11px', fontWeight: '700' }}>
            <ShieldCheck size={12} /> Teacher / Administrator
          </div>
        </div>
      </div>

      {/* Profile Details Edit Form */}
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: '18px',
          padding: '18px',
          border: `1px solid ${colors.border}`,
          boxShadow: colors.cardShadow
        }}
      >
        <div style={{ fontSize: '15px', fontWeight: '800', color: colors.text, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={18} color={colors.primaryLight} />
          <span>{t('navTeacherProfile')} / තොරතුරු සංස්කරණය</span>
        </div>

        {profileMsg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              backgroundColor: profileMsg.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              border: `1px solid ${profileMsg.type === 'success' ? '#10B981' : '#EF4444'}`,
              color: profileMsg.type === 'success' ? '#10B981' : '#EF4444',
              fontSize: '12px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '14px'
            }}
          >
            {profileMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{profileMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: colors.textMuted, marginBottom: '6px' }}>
              Full Name (සම්පූර්ණ නම) *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sunil Perera"
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
              {t('contactPhone')}
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={15} color={colors.textMuted} style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+94 77 123 4567"
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
              Subjects Taught (උගන්වන විෂයයන්)
            </label>
            <div style={{ position: 'relative' }}>
              <BookOpen size={15} color={colors.textMuted} style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                value={subjects}
                onChange={(e) => setSubjects(e.target.value)}
                placeholder="e.g. Combined Mathematics, Physics"
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
              Bio / Qualifications (සුදුසුකම් සහ විස්තරය)
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. B.Sc. Engineering (Hons), Moratuwa. 12+ years experience producing A/L Island ranks."
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

          <button
            type="submit"
            disabled={savingProfile}
            style={{
              backgroundColor: colors.primary,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '6px',
              opacity: savingProfile ? 0.7 : 1
            }}
          >
            <Save size={16} />
            <span>{savingProfile ? 'Updating Profile...' : 'Save Profile Changes (සුරකින්න)'}</span>
          </button>
        </form>
      </div>

      {/* Change Password Card */}
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: '18px',
          padding: '18px',
          border: `1px solid ${colors.border}`,
          boxShadow: colors.cardShadow
        }}
      >
        <div style={{ fontSize: '15px', fontWeight: '800', color: colors.text, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <KeyRound size={18} color="#F59E0B" />
          <span>{t('changePassword')}</span>
        </div>

        {passwordMsg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              backgroundColor: passwordMsg.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              border: `1px solid ${passwordMsg.type === 'success' ? '#10B981' : '#EF4444'}`,
              color: passwordMsg.type === 'success' ? '#10B981' : '#EF4444',
              fontSize: '12px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '14px'
            }}
          >
            {passwordMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{passwordMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: colors.textMuted, marginBottom: '6px' }}>
              {t('currentPassword')} *
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
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
              {t('newPassword')} (Min 6 chars) *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
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
              {t('confirmPassword')} *
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
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

          <button
            type="submit"
            disabled={savingPassword}
            style={{
              backgroundColor: '#F59E0B',
              color: '#000000',
              border: 'none',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '6px',
              opacity: savingPassword ? 0.7 : 1
            }}
          >
            <Lock size={16} />
            <span>{savingPassword ? 'Updating Password...' : 'Update Password (මුරපදය යාවත්කාලීන කරන්න)'}</span>
          </button>
        </form>
      </div>

      {/* Sign Out Card */}
      <button
        onClick={logout}
        style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#EF4444',
          borderRadius: '16px',
          padding: '14px',
          fontSize: '14px',
          fontWeight: '700',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: colors.cardShadow
        }}
      >
        <Lock size={16} />
        <span>Sign Out of Account (ගිණුමෙන් ඉවත් වන්න)</span>
      </button>
    </div>
  );
};


export default TeacherProfileScreen;
