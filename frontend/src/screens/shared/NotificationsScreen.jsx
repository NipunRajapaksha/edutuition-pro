import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/client';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  Award,
  CheckCheck
} from 'lucide-react';

const NotificationsScreen = ({ onRefreshCount }) => {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.getNotifications();
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      fetchNotifications();
      if (onRefreshCount) onRefreshCount();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      fetchNotifications();
      if (onRefreshCount) onRefreshCount();
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'attendance': return <CheckCircle2 size={16} color="#10B981" />;
      case 'homework': return <FileText size={16} color="#06B6D4" />;
      case 'fee': return <CreditCard size={16} color="#F59E0B" />;
      case 'exam': return <Award size={16} color="#EF4444" />;
      default: return <Bell size={16} color="#8B5CF6" />;
    }
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '90px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: colors.text }}>
            Notification Center
          </h2>
          <div style={{ fontSize: '12px', color: colors.textMuted }}>
            Real-time updates, deadline alerts & receipts
          </div>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: colors.surfaceSubtle,
              border: `1px solid ${colors.border}`,
              color: colors.text,
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <CheckCheck size={14} color="#10B981" /> Mark All Read
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px', color: colors.textMuted }}>{t('loading')}</div>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: colors.surface, borderRadius: '16px', color: colors.textMuted, border: `1px solid ${colors.border}` }}>
          <Bell size={36} style={{ margin: '0 auto 10px auto', opacity: 0.4 }} />
          <div style={{ fontSize: '14px', fontWeight: '700', color: colors.text }}>No notifications right now</div>
          <div style={{ fontSize: '12px', marginTop: '4px' }}>You are completely caught up!</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {notifications.map(n => (
            <div
              key={n._id || n.id}
              onClick={() => !n.read && handleMarkRead(n._id || n.id)}
              style={{
                backgroundColor: n.read ? colors.surface : 'rgba(79, 70, 229, 0.08)',
                borderRadius: '14px',
                padding: '14px',
                border: `1px solid ${n.read ? colors.border : 'rgba(79, 70, 229, 0.3)'}`,
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                cursor: n.read ? 'default' : 'pointer'
              }}
            >
              <div style={{ marginTop: '2px' }}>
                {getIcon(n.type)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: n.read ? '700' : '800', color: colors.text }}>
                    {n.title}
                  </h4>
                  {!n.read && (
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4F46E5' }} />
                  )}
                </div>
                <p style={{ fontSize: '12px', color: colors.textMuted, marginTop: '2px', lineHeight: 1.3 }}>
                  {n.message}
                </p>
                <div style={{ fontSize: '10px', color: colors.textMuted, marginTop: '6px' }}>
                  {new Date(n.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsScreen;
