import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import QRCode from 'qrcode';
import {
  Smartphone,
  Laptop,
  QrCode,
  Copy,
  Check,
  Download,
  Upload,
  Globe,
  X,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

const DataSyncModal = ({ isOpen, onClose, onSyncCompleted, initialMode = 'export' }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState(initialMode); // 'export' | 'import' | 'cloud'
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [syncCode, setSyncCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem('edutuition_api_url') || '');
  const [statusMsg, setStatusMsg] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Generate payload from localStorage
  const generateSyncPayload = () => {
    try {
      const users = localStorage.getItem('edutuition_users') || localStorage.getItem('edutuition_custom_users') || '[]';
      const customUsers = localStorage.getItem('edutuition_custom_users') || '[]';
      const classes = localStorage.getItem('edutuition_classes') || '[]';
      const students = localStorage.getItem('edutuition_students') || '[]';
      const attendance = localStorage.getItem('edutuition_attendance') || '[]';
      const exams = localStorage.getItem('edutuition_exams') || '[]';
      const settings = localStorage.getItem('edutuition_settings') || '{}';

      const payloadObj = {
        app: 'edutuition-pro',
        version: 1,
        timestamp: Date.now(),
        data: {
          edutuition_users: JSON.parse(users),
          edutuition_custom_users: JSON.parse(customUsers),
          edutuition_classes: JSON.parse(classes),
          edutuition_students: JSON.parse(students),
          edutuition_attendance: JSON.parse(attendance),
          edutuition_exams: JSON.parse(exams),
          edutuition_settings: JSON.parse(settings)
        }
      };

      const jsonString = JSON.stringify(payloadObj);
      const encoded = btoa(unescape(encodeURIComponent(jsonString)));
      return { jsonString, encoded };
    } catch (err) {
      console.error('Error generating sync payload:', err);
      return { jsonString: '{}', encoded: '' };
    }
  };

  useEffect(() => {
    if (isOpen) {
      const { encoded } = generateSyncPayload();
      setSyncCode(encoded);
      if (encoded) {
        // Generate QR Code containing sync payload (or compact link)
        QRCode.toDataURL(encoded, {
          width: 260,
          margin: 1,
          color: { dark: '#1E1B4B', light: '#FFFFFF' },
          errorCorrectionLevel: 'L'
        })
          .then(url => setQrDataUrl(url))
          .catch(err => {
            // Fallback for large payloads: smaller QR or instructions
            console.warn('QR payload large, fallback to code', err);
          });
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(syncCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadBackup = () => {
    const { jsonString } = generateSyncPayload();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edutuition_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const applySyncPayload = (payloadString) => {
    try {
      let rawJson = '';
      const trimmed = payloadString.trim();
      if (trimmed.startsWith('{')) {
        rawJson = trimmed;
      } else {
        // base64
        rawJson = decodeURIComponent(escape(atob(trimmed)));
      }

      const parsed = JSON.parse(rawJson);
      const data = parsed.data || parsed;

      let accountsRestored = 0;

      if (data.edutuition_users) {
        localStorage.setItem('edutuition_users', JSON.stringify(data.edutuition_users));
        accountsRestored += data.edutuition_users.length;
      }
      if (data.edutuition_custom_users) {
        localStorage.setItem('edutuition_custom_users', JSON.stringify(data.edutuition_custom_users));
      }
      if (data.edutuition_classes) {
        localStorage.setItem('edutuition_classes', JSON.stringify(data.edutuition_classes));
      }
      if (data.edutuition_students) {
        localStorage.setItem('edutuition_students', JSON.stringify(data.edutuition_students));
      }
      if (data.edutuition_attendance) {
        localStorage.setItem('edutuition_attendance', JSON.stringify(data.edutuition_attendance));
      }
      if (data.edutuition_exams) {
        localStorage.setItem('edutuition_exams', JSON.stringify(data.edutuition_exams));
      }
      if (data.edutuition_settings) {
        localStorage.setItem('edutuition_settings', JSON.stringify(data.edutuition_settings));
      }

      setStatusMsg({
        type: 'success',
        text: `Sync Successful! ${accountsRestored} user accounts and institute data transferred. You can now log in with your teacher account.`
      });

      if (onSyncCompleted) {
        onSyncCompleted(data);
      }
    } catch (err) {
      console.error('Import error:', err);
      setStatusMsg({
        type: 'error',
        text: 'Invalid sync code or backup data. Please copy the exact sync code from your PC.'
      });
    }
  };

  const handleImportSubmit = (e) => {
    e.preventDefault();
    if (!inputCode.trim()) {
      setStatusMsg({ type: 'error', text: 'Please paste the sync code or select a backup file.' });
      return;
    }
    applySyncPayload(inputCode);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (content) {
        applySyncPayload(content);
      }
    };
    reader.readAsText(file);
  };

  const handleSaveApiUrl = (e) => {
    e.preventDefault();
    const cleanUrl = apiUrl.trim();
    if (cleanUrl) {
      localStorage.setItem('edutuition_api_url', cleanUrl);
      setStatusMsg({ type: 'success', text: `Cloud API URL saved: ${cleanUrl}. Both devices will now connect to this server!` });
    } else {
      localStorage.removeItem('edutuition_api_url');
      setStatusMsg({ type: 'success', text: 'Reset to default local/embedded API mode.' });
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
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 1000
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: colors.surface,
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          border: `1px solid ${colors.border}`,
          maxHeight: '90vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Smartphone size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: colors.text, margin: 0 }}>
                PC & Mobile Data Sync
              </h2>
              <p style={{ fontSize: '11px', color: colors.textMuted, margin: '2px 0 0 0' }}>
                උපාංග අතර ගිණුම් සහ දත්ත හුවමාරුව
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: colors.textMuted,
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Toggle */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '6px',
            backgroundColor: colors.surfaceSubtle,
            borderRadius: '12px',
            padding: '4px',
            border: `1px solid ${colors.border}`
          }}
        >
          <button
            type="button"
            onClick={() => { setActiveTab('export'); setStatusMsg(null); }}
            style={{
              padding: '8px 4px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'export' ? colors.primary : 'transparent',
              color: activeTab === 'export' ? '#FFFFFF' : colors.textMuted,
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            <Laptop size={14} /> Send from PC
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('import'); setStatusMsg(null); }}
            style={{
              padding: '8px 4px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'import' ? colors.primary : 'transparent',
              color: activeTab === 'import' ? '#FFFFFF' : colors.textMuted,
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            <Smartphone size={14} /> Receive on Mobile
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('cloud'); setStatusMsg(null); }}
            style={{
              padding: '8px 4px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'cloud' ? colors.primary : 'transparent',
              color: activeTab === 'cloud' ? '#FFFFFF' : colors.textMuted,
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            <Globe size={14} /> Cloud Server
          </button>
        </div>

        {statusMsg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '12px',
              backgroundColor: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              border: `1px solid ${statusMsg.type === 'success' ? '#10B981' : '#EF4444'}`,
              color: statusMsg.type === 'success' ? '#10B981' : '#EF4444',
              fontSize: '12px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {statusMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* EXPORT / SHARE FROM PC */}
        {activeTab === 'export' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: colors.textMuted }}>
              PC එකෙන් සාදන ලද Teacher accounts සහ Classes, Mobile app එකට ක්ෂණිකව මාරු කිරීමට පහත Sync Code එක Copy කර Mobile app එකට Paste කරන්න.
            </div>

            {qrDataUrl && (
              <div
                style={{
                  padding: '12px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img src={qrDataUrl} alt="Sync QR Code" style={{ width: '180px', height: '180px' }} />
              </div>
            )}

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  backgroundColor: copied ? '#10B981' : colors.primary,
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Copied Sync Code!' : '1-Click Copy Sync Code (Mobile එකට යවන්න)'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadBackup}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '12px',
                  backgroundColor: colors.surfaceSubtle,
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Download size={14} />
                <span>Download Backup File (.json)</span>
              </button>
            </div>
          </div>
        )}

        {/* IMPORT / RECEIVE ON MOBILE */}
        {activeTab === 'import' && (
          <form onSubmit={handleImportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '12px', color: colors.textMuted }}>
              PC එකෙන් Copy කරගත් <strong>Sync Code</strong> එක පහත Paste කර <strong>"Sync Now"</strong> ඔබන්න.
            </div>

            <div>
              <textarea
                rows={4}
                required
                placeholder="Paste Sync Code here (PC එකෙන් copy කරගත් කේතය මෙතනට paste කරන්න)..."
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surfaceSubtle,
                  color: colors.text,
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  outline: 'none',
                  resize: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="submit"
                style={{
                  flex: 2,
                  padding: '12px',
                  borderRadius: '12px',
                  backgroundColor: colors.primary,
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                }}
              >
                <Sparkles size={16} />
                <span>Sync Now (දත්ත ලබාගන්න)</span>
              </button>

              <label
                style={{
                  flex: 1,
                  padding: '12px 8px',
                  borderRadius: '12px',
                  backgroundColor: colors.surfaceSubtle,
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  textAlign: 'center'
                }}
              >
                <Upload size={14} />
                <span>Upload File</span>
                <input type="file" accept=".json" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
            </div>
          </form>
        )}

        {/* CLOUD SERVER API URL */}
        {activeTab === 'cloud' && (
          <form onSubmit={handleSaveApiUrl} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '12px', color: colors.textMuted }}>
              ඔබේ Tuition System එක Vercel හෝ Cloud Server එකක deploy කර ඇත්නම්, එම API URL එක (උදා: <code>https://your-domain.vercel.app/api</code>) මෙහි ඇතුලත් කිරීමෙන් PC සහ Mobile දෙකම එකම Live Database එකකට සම්බන්ධ වේ.
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>
                CLOUD BACKEND API URL
              </label>
              <input
                type="url"
                placeholder="https://your-app.vercel.app/api"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surfaceSubtle,
                  color: colors.text,
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: colors.primary,
                color: '#FFFFFF',
                border: 'none',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Globe size={16} />
              <span>Save Cloud API URL</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default DataSyncModal;
