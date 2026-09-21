import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/client';
import Badge from '../../components/Badge';
import {
  BookOpen,
  Plus,
  Clock,
  MapPin,
  Users,
  Calendar,
  DollarSign,
  X,
  CheckCircle,
  Eye
} from 'lucide-react';

const ClassesScreen = ({ onOpenAddClass }) => {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const [classes, setClasses] = useState([]);
  const [timetable, setTimetable] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'timetable'
  const [loading, setLoading] = useState(true);

  // Class Roster Modal
  const [selectedClassRoster, setSelectedClassRoster] = useState(null);
  const [loadingRoster, setLoadingRoster] = useState(false);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const [clsRes, timeRes] = await Promise.all([
        api.getClasses(),
        api.getTimetable()
      ]);
      if (clsRes.data.success) setClasses(clsRes.data.data);
      if (timeRes.data.success) setTimetable(timeRes.data.data);
    } catch (err) {
      console.error('Error fetching classes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleOpenRoster = async (cls) => {
    setLoadingRoster(true);
    setSelectedClassRoster(cls);
    try {
      const res = await api.getClassById(cls._id || cls.id);
      if (res.data.success) {
        setSelectedClassRoster(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRoster(false);
    }
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '90px' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: colors.text }}>
            {t('navClasses')}
          </h2>
          <div style={{ fontSize: '12px', color: colors.textMuted }}>
            {classes.length} active classes in curriculum
          </div>
        </div>
        <button
          onClick={onOpenAddClass}
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
          <Plus size={16} />
          + Class
        </button>
      </div>

      {/* View Mode Toggle */}
      <div style={{ display: 'flex', backgroundColor: colors.surfaceSubtle, borderRadius: '12px', padding: '4px', border: `1px solid ${colors.border}` }}>
        <button
          onClick={() => setViewMode('list')}
          style={{
            flex: 1,
            padding: '8px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: viewMode === 'list' ? colors.primary : 'transparent',
            color: viewMode === 'list' ? '#FFFFFF' : colors.textMuted,
            fontWeight: '700',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Cards View
        </button>
        <button
          onClick={() => setViewMode('timetable')}
          style={{
            flex: 1,
            padding: '8px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: viewMode === 'timetable' ? colors.primary : 'transparent',
            color: viewMode === 'timetable' ? '#FFFFFF' : colors.textMuted,
            fontWeight: '700',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Weekly Timetable
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px', color: colors.textMuted, fontSize: '13px' }}>
          {t('loading')}
        </div>
      ) : viewMode === 'list' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {classes.map(cls => (
            <div
              key={cls._id || cls.id}
              style={{
                backgroundColor: colors.surface,
                borderRadius: '18px',
                padding: '18px',
                border: `1px solid ${colors.border}`,
                boxShadow: colors.cardShadow,
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
                  backgroundColor: cls.color || '#4F46E5'
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: colors.text }}>
                    {cls.name}
                  </h3>
                  <div style={{ fontSize: '12px', color: colors.primaryLight, fontWeight: '600', marginTop: '2px' }}>
                    {cls.subject} • {cls.grade}
                  </div>
                </div>
                <Badge variant="present">
                  {cls.status || 'Active'}
                </Badge>
              </div>

              {/* Timing & Location */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', margin: '12px 0', fontSize: '12px', color: colors.textMuted }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} color="#6366F1" />
                  <span><strong>{cls.dayOfWeek}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} color="#6366F1" />
                  <span>{cls.startTime} - {cls.endTime}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} color="#06B6D4" />
                  <span>{cls.location}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <DollarSign size={14} color="#10B981" />
                  <span>Rs. {Number(cls.monthlyFee).toLocaleString()} / mo</span>
                </div>
              </div>

              {/* Roster & Teacher */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${colors.border}`, paddingTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: colors.textMuted }}>
                  <Users size={14} />
                  <span>
                    <strong>{cls.enrolledCount || 0}</strong> / {cls.maxStudents || 50} students
                  </span>
                </div>

                <button
                  onClick={() => handleOpenRoster(cls)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    backgroundColor: colors.surfaceSubtle,
                    border: `1px solid ${colors.border}`,
                    color: colors.text,
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Eye size={13} /> View Roster
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Timetable View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
            const dayClasses = timetable ? timetable[day] || [] : [];
            return (
              <div
                key={day}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: '16px',
                  padding: '14px',
                  border: `1px solid ${colors.border}`
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: '800', color: colors.primaryLight, marginBottom: '8px' }}>
                  {day} ({dayClasses.length})
                </div>

                {dayClasses.length === 0 ? (
                  <div style={{ fontSize: '11px', color: colors.textMuted, fontStyle: 'italic' }}>
                    No sessions scheduled
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {dayClasses.map(c => (
                      <div
                        key={c._id}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '10px',
                          backgroundColor: colors.surfaceSubtle,
                          borderLeft: `4px solid ${c.color || '#4F46E5'}`,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: colors.text }}>
                            {c.name}
                          </div>
                          <div style={{ fontSize: '10px', color: colors.textMuted }}>
                            {c.location} • {c.teacherName}
                          </div>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: colors.textMuted }}>
                          {c.startTime} - {c.endTime}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Class Roster Modal */}
      {selectedClassRoster && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 95,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              backgroundColor: colors.surface,
              borderRadius: '20px',
              padding: '20px',
              border: `1px solid ${colors.border}`,
              maxHeight: '85vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: colors.text }}>
                  {selectedClassRoster.name}
                </h3>
                <div style={{ fontSize: '12px', color: colors.textMuted }}>
                  Enrolled Students ({selectedClassRoster.students?.length || 0})
                </div>
              </div>
              <button
                onClick={() => setSelectedClassRoster(null)}
                style={{ background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {loadingRoster ? (
              <div style={{ textAlign: 'center', padding: '20px', color: colors.textMuted }}>{t('loading')}</div>
            ) : (!selectedClassRoster.students || selectedClassRoster.students.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '20px', color: colors.textMuted, fontSize: '12px' }}>
                No students currently enrolled in this class.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedClassRoster.students.map(s => (
                  <div
                    key={s._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      backgroundColor: colors.surfaceSubtle,
                      border: `1px solid ${colors.border}`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={s.photo || `https://api.dicebear.com/7.x/bottts/png?seed=${encodeURIComponent(s.studentId)}`}
                        alt={s.fullName}
                        style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: colors.text }}>
                          {s.fullName}
                        </div>
                        <div style={{ fontSize: '11px', color: colors.textMuted }}>
                          {s.studentId} • {s.school || 'School'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassesScreen;
