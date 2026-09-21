import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { GraduationCap, Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

const LoginScreen = () => {
  const { login, quickLogin } = useAuth();
  const { colors, isDark } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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

  const handleQuick = async (role) => {
    setLoading(true);
    setErrorMsg('');
    const res = await quickLogin(role);
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
            padding: '6px 12px',
            borderRadius: '10px',
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            color: colors.text,
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600'
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
          padding: '32px 24px',
          boxShadow: colors.cardShadow,
          border: `1px solid ${colors.border}`
        }}
      >
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
              boxShadow: '0 8px 20px rgba(79, 70, 229, 0.4)'
            }}
          >
            <GraduationCap size={32} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: colors.text, letterSpacing: '-0.02em' }}>
            {t('appName')}
          </h1>
          <p style={{ fontSize: '12px', color: colors.textMuted, marginTop: '4px' }}>
            {t('tagline')}
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#EF4444',
              fontSize: '12px',
              fontWeight: '600',
              marginBottom: '16px',
              textAlign: 'center'
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: colors.textMuted, marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }}
              />
              <input
                type="email"
                placeholder="teacher@tuition.lk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 38px',
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
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: colors.textMuted, marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }}
              />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 38px',
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

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              padding: '13px',
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

        {/* Quick Demo Switcher */}
        <div style={{ marginTop: '28px', borderTop: `1px solid ${colors.border}`, paddingTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', color: colors.textMuted, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Sparkles size={14} color="#F59E0B" />
            1-Tap Demo Role Login
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              onClick={() => handleQuick('teacher')}
              style={{
                padding: '9px 10px',
                borderRadius: '10px',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                border: '1px solid rgba(79, 70, 229, 0.3)',
                color: colors.primaryLight,
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              👨‍🏫 Teacher/Admin
            </button>

            <button
              onClick={() => handleQuick('parent')}
              style={{
                padding: '9px 10px',
                borderRadius: '10px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10B981',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              👪 Parent Portal
            </button>

            <button
              onClick={() => handleQuick('student')}
              style={{
                padding: '9px 10px',
                borderRadius: '10px',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                color: '#06B6D4',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              👨‍🎓 Student 1 (Kasun)
            </button>

            <button
              onClick={() => handleQuick('student2')}
              style={{
                padding: '9px 10px',
                borderRadius: '10px',
                backgroundColor: 'rgba(236, 72, 153, 0.1)',
                border: '1px solid rgba(236, 72, 153, 0.3)',
                color: '#EC4899',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              👩‍🎓 Student 2 (Dilani)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
