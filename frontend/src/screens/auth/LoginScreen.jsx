import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { GraduationCap, Lock, Mail, ArrowRight, Smartphone, Eye, EyeOff, KeyRound, Shield, CheckCircle2 } from 'lucide-react';
import DataSyncModal from '../../components/modals/DataSyncModal';

const LoginScreen = () => {
  const { login, getCustomUsers } = useAuth();
  const { colors } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [recentAccounts, setRecentAccounts] = useState([]);

  useEffect(() => {
    try {
      if (getCustomUsers) {
        const custom = getCustomUsers();
        if (Array.isArray(custom)) {
          setRecentAccounts(custom.slice(0, 4));
        }
      }
    } catch {}
  }, []);

  const fillCredentials = async (em, pw, autoSubmit = false) => {
    setEmail(em);
    setPassword(pw);
    setErrorMsg('');
    if (autoSubmit) {
      setLoading(true);
      const res = await login(em, pw);
      setLoading(false);
      if (!res.success) {
        setErrorMsg(res.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    const res = await login(email, password);
    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.message);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        backgroundColor: colors.bg,
        position: 'relative'
      }}
    >
      {/* Top language switch */}
      <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
        <button
          onClick={toggleLanguage}
          style={{
            padding: '6px 14px',
            borderRadius: '12px',
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            color: colors.text,
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '700',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
        >
          {language === 'en' ? 'සිංහල' : 'English'}
        </button>
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: colors.surface,
          borderRadius: '24px',
          padding: '36px 28px',
          boxShadow: colors.cardShadow,
          border: `1px solid ${colors.border}`
        }}
      >
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px auto',
              boxShadow: '0 8px 20px rgba(79, 70, 229, 0.4)'
            }}
          >
            <GraduationCap size={34} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: colors.text, letterSpacing: '-0.02em', margin: 0 }}>
            {t('appName')}
          </h1>
          <p style={{ fontSize: '13px', color: colors.textMuted, marginTop: '6px', margin: '6px 0 0 0' }}>
            {t('tagline')}
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#EF4444',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '18px',
              textAlign: 'center'
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.textMuted, marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }}
              />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 40px',
                  borderRadius: '12px',
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surfaceSubtle,
                  color: colors.text,
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.textMuted, marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 40px',
                  borderRadius: '12px',
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surfaceSubtle,
                  color: colors.text,
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: colors.textMuted,
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '4px',
              padding: '14px',
              borderRadius: '12px',
              backgroundColor: colors.primary,
              color: '#FFFFFF',
              border: 'none',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)'
            }}
          >
            <span>{loading ? t('loading') : 'Sign In'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick One-Tap Account Credentials Selector */}
        <div style={{ marginTop: '20px', borderTop: `1px solid ${colors.border}`, paddingTop: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: colors.textMuted, marginBottom: '8px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            ⚡ 1-Tap Quick Login (වේගවත් පිවිසුම)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => fillCredentials('admin@tuition.lk', 'admin123', true)}
              style={{
                padding: '8px 10px',
                borderRadius: '10px',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                border: '1px solid rgba(79, 70, 229, 0.25)',
                color: colors.primaryLight,
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <span>👑 Super Admin</span>
              <span style={{ fontSize: '9px', opacity: 0.75, fontWeight: '500' }}>admin@tuition.lk</span>
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('teacher@tuition.lk', 'password123', true)}
              style={{
                padding: '8px 10px',
                borderRadius: '10px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: '#10B981',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <span>👨‍🏫 Teacher</span>
              <span style={{ fontSize: '9px', opacity: 0.75, fontWeight: '500' }}>teacher@tuition.lk</span>
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('student1@tuition.lk', 'password123', true)}
              style={{
                padding: '8px 10px',
                borderRadius: '10px',
                backgroundColor: 'rgba(14, 165, 233, 0.1)',
                border: '1px solid rgba(14, 165, 233, 0.25)',
                color: '#0EA5E9',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <span>🎓 Student</span>
              <span style={{ fontSize: '9px', opacity: 0.75, fontWeight: '500' }}>student1@tuition.lk</span>
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('parent1@tuition.lk', 'password123', true)}
              style={{
                padding: '8px 10px',
                borderRadius: '10px',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                color: '#F59E0B',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <span>👨‍👩‍👧 Parent</span>
              <span style={{ fontSize: '9px', opacity: 0.75, fontWeight: '500' }}>parent1@tuition.lk</span>
            </button>
          </div>

          {/* If there are custom created accounts, display them too */}
          {recentAccounts.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <div style={{ fontSize: '10px', color: colors.textMuted, marginBottom: '4px', fontWeight: '600' }}>
                Custom Created Accounts:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {recentAccounts.map(acc => (
                  <button
                    key={acc.id || acc.email}
                    type="button"
                    onClick={() => fillCredentials(acc.email, acc.password || 'password123', true)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '8px',
                      border: `1px solid ${colors.border}`,
                      backgroundColor: colors.surfaceSubtle,
                      color: colors.text,
                      fontSize: '10px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    👤 {acc.name} ({acc.role})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sync Button */}
        <div style={{ marginTop: '20px', textAlign: 'center', borderTop: `1px solid ${colors.border}`, paddingTop: '16px' }}>
          <button
            type="button"
            onClick={() => setShowSyncModal(true)}
            style={{
              background: 'none',
              border: `1px dashed ${colors.border}`,
              padding: '8px 16px',
              borderRadius: '12px',
              color: colors.primaryLight,
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Smartphone size={14} />
            <span>📲 Sync Data from PC / Cloud (දත්ත හුවමාරුව)</span>
          </button>
        </div>
      </div>

      {showSyncModal && (
        <DataSyncModal
          isOpen={showSyncModal}
          onClose={() => setShowSyncModal(false)}
          initialMode="import"
          onSyncCompleted={() => {
            setErrorMsg('');
          }}
        />
      )}
    </div>
  );
};

export default LoginScreen;


