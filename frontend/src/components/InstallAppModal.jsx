import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Smartphone,
  Download,
  Share2,
  MoreVertical,
  PlusSquare,
  CheckCircle2,
  X,
  Sparkles,
  Zap,
  ShieldCheck
} from 'lucide-react';

const InstallAppModal = ({ isOpen, onClose, installPrompt }) => {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('android'); // 'android' or 'ios'
  const [installed, setInstalled] = useState(false);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setInstalled(true);
      }
    } else {
      alert('To install, follow the steps below for your phone (Android or iPhone)!');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: '24px',
          width: '100%',
          maxWidth: '440px',
          border: `1px solid ${colors.border}`,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px',
            background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
            color: '#FFFFFF',
            position: 'relative'
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)'
              }}
            >
              <img src="/icon.svg" alt="App Icon" style={{ width: '40px', height: '40px' }} />
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '800', lineHeight: 1.2 }}>
                EduTuition Pro
              </div>
              <div style={{ fontSize: '12px', color: '#E0E7FF', marginTop: '3px' }}>
                ශිල්ප ඇකඩමි Mobile Phone App
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Quick Features */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1, backgroundColor: colors.surfaceSubtle, padding: '10px', borderRadius: '12px', textAlign: 'center', border: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#10B981' }}>100% Free</div>
              <div style={{ fontSize: '10px', color: colors.textMuted }}>No Fees / නොමිලේ</div>
            </div>
            <div style={{ flex: 1, backgroundColor: colors.surfaceSubtle, padding: '10px', borderRadius: '12px', textAlign: 'center', border: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#06B6D4' }}>Fast & Clean</div>
              <div style={{ fontSize: '10px', color: colors.textMuted }}>Full Screen View</div>
            </div>
            <div style={{ flex: 1, backgroundColor: colors.surfaceSubtle, padding: '10px', borderRadius: '12px', textAlign: 'center', border: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#8B5CF6' }}>Home Screen</div>
              <div style={{ fontSize: '10px', color: colors.textMuted }}>One-Tap Launch</div>
            </div>
          </div>

          {/* 1-Tap Install Button if supported */}
          {installPrompt && !installed && (
            <button
              onClick={handleNativeInstall}
              style={{
                backgroundColor: '#10B981',
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
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
              }}
            >
              <Download size={18} />
              <span>Install to Phone Now (කෙළින්ම Install කරගන්න)</span>
            </button>
          )}

          {/* Device Tabs */}
          <div
            style={{
              display: 'flex',
              backgroundColor: colors.surfaceSubtle,
              borderRadius: '12px',
              padding: '4px',
              border: `1px solid ${colors.border}`
            }}
          >
            <button
              onClick={() => setActiveTab('android')}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'android' ? colors.surface : 'transparent',
                color: activeTab === 'android' ? colors.primaryLight : colors.textMuted,
                fontWeight: '700',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              🤖 Android (Samsung / Xiaomi etc.)
            </button>
            <button
              onClick={() => setActiveTab('ios')}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'ios' ? colors.surface : 'transparent',
                color: activeTab === 'ios' ? colors.primaryLight : colors.textMuted,
                fontWeight: '700',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              🍎 iPhone / iPad (Apple iOS)
            </button>
          </div>

          {/* Step-by-Step Instructions */}
          {activeTab === 'android' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(79, 70, 229, 0.15)', color: colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', flexShrink: 0 }}>
                  1
                </div>
                <div style={{ fontSize: '12px', color: colors.text }}>
                  Open your deployed tuition link in <strong>Google Chrome</strong> or <strong>Brave</strong>.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(79, 70, 229, 0.15)', color: colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', flexShrink: 0 }}>
                  2
                </div>
                <div style={{ fontSize: '12px', color: colors.text }}>
                  Tap the <strong>3 vertical dots (⋮)</strong> in the top-right corner of Chrome.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(79, 70, 229, 0.15)', color: colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', flexShrink: 0 }}>
                  3
                </div>
                <div style={{ fontSize: '12px', color: colors.text }}>
                  Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong> (හෝ 'ස්ථාපනය කරන්න').
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', flexShrink: 0 }}>
                  ✓
                </div>
                <div style={{ fontSize: '12px', color: '#10B981', fontWeight: '600' }}>
                  The app icon will now appear on your phone home screen just like a Play Store app!
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(79, 70, 229, 0.15)', color: colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', flexShrink: 0 }}>
                  1
                </div>
                <div style={{ fontSize: '12px', color: colors.text }}>
                  Open your tuition link in <strong>Safari</strong> browser on your iPhone.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(79, 70, 229, 0.15)', color: colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', flexShrink: 0 }}>
                  2
                </div>
                <div style={{ fontSize: '12px', color: colors.text }}>
                  Tap the <strong>Share button (⎙)</strong> at the bottom center of the screen.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(79, 70, 229, 0.15)', color: colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', flexShrink: 0 }}>
                  3
                </div>
                <div style={{ fontSize: '12px', color: colors.text }}>
                  Scroll down and tap <strong>"Add to Home Screen" (+)</strong>.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', flexShrink: 0 }}>
                  ✓
                </div>
                <div style={{ fontSize: '12px', color: '#10B981', fontWeight: '600' }}>
                  Tap 'Add' in the top-right corner. It is now installed on your iPhone!
                </div>
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            style={{
              backgroundColor: colors.surfaceSubtle,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '12px',
              padding: '10px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Got it (තේරුණා)
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallAppModal;
