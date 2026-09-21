import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/client';
import Badge from '../../components/Badge';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';

const CalendarScreen = () => {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCalendar = async () => {
    try {
      setLoading(true);
      const res = await api.getCalendarEvents();
      if (res.data.success) {
        setEvents(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, []);

  const getTypeBadge = (type) => {
    switch (type) {
      case 'exam': return <Badge variant="danger">Exam</Badge>;
      case 'homework_deadline': return <Badge variant="warning">Homework Due</Badge>;
      case 'holiday': return <Badge variant="present">Holiday / Poya</Badge>;
      default: return <Badge variant="info">Class</Badge>;
    }
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '90px' }}>
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: colors.text }}>
          {t('navCalendar')}
        </h2>
        <div style={{ fontSize: '12px', color: colors.textMuted }}>
          Schedule of tuition sessions, exam dates & national holidays
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px', color: colors.textMuted }}>{t('loading')}</div>
      ) : events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', backgroundColor: colors.surface, borderRadius: '16px', color: colors.textMuted }}>
          No calendar events scheduled.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {events.map((ev, i) => (
            <div
              key={ev._id || i}
              style={{
                backgroundColor: colors.surface,
                borderRadius: '16px',
                padding: '16px',
                border: `1px solid ${colors.border}`,
                boxShadow: colors.cardShadow,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: '5px',
                  backgroundColor: ev.color || '#4F46E5'
                }}
              />

              <div style={{ paddingLeft: '8px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '800', color: colors.text }}>
                  {ev.title}
                </h4>
                <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{ev.date}</span>
                  {ev.startTime && <span>• {ev.startTime} - {ev.endTime}</span>}
                </div>
                {ev.description && (
                  <p style={{ fontSize: '11px', color: colors.textMuted, marginTop: '4px' }}>
                    {ev.description}
                  </p>
                )}
              </div>

              <div>
                {getTypeBadge(ev.type)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarScreen;
