import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/client';
import Badge from '../../components/Badge';
import { Megaphone, Plus, Bell, Clock, Trash2 } from 'lucide-react';

const AnnouncementsScreen = ({ onOpenSendNotice }) => {
  const { role } = useAuth();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.getAnnouncements();
      if (res.data.success) {
        setAnnouncements(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await api.deleteAnnouncement(id);
      fetchAnnouncements();
    } catch (err) {
      alert('Failed to delete announcement');
    }
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '90px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: colors.text }}>
            {t('navAnnouncements')}
          </h2>
          <div style={{ fontSize: '12px', color: colors.textMuted }}>
            Institute notices, class schedules & holiday announcements
          </div>
        </div>

        {role === 'teacher' && onOpenSendNotice && (
          <button
            onClick={onOpenSendNotice}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              borderRadius: '12px',
              backgroundColor: colors.primary,
              color: '#FFFFFF',
              border: 'none',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
            }}
          >
            <Plus size={16} /> Broadcast Notice
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px', color: colors.textMuted }}>{t('loading')}</div>
      ) : announcements.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', backgroundColor: colors.surface, borderRadius: '16px', color: colors.textMuted, border: `1px solid ${colors.border}` }}>
          No announcements published yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {announcements.map(a => (
            <div
              key={a._id || a.id}
              style={{
                backgroundColor: colors.surface,
                borderRadius: '16px',
                padding: '16px',
                border: `1px solid ${a.priority === 'urgent' ? 'rgba(239, 68, 68, 0.4)' : colors.border}`,
                boxShadow: colors.cardShadow,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: a.priority === 'urgent' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(79, 70, 229, 0.15)',
                      color: a.priority === 'urgent' ? '#EF4444' : '#6366F1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Megaphone size={16} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: colors.text }}>
                      {a.title}
                    </h4>
                    <div style={{ fontSize: '10px', color: colors.textMuted }}>
                      By {a.authorName} • For: {a.targetType.toUpperCase()}
                    </div>
                  </div>
                </div>

                <Badge variant={a.priority}>
                  {a.priority}
                </Badge>
              </div>

              <p style={{ fontSize: '13px', color: colors.text, lineHeight: 1.4, margin: '4px 0' }}>
                {a.content}
              </p>

              {role === 'teacher' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: `1px solid ${colors.border}`, paddingTop: '6px' }}>
                  <button
                    onClick={() => handleDelete(a._id || a.id)}
                    style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementsScreen;
