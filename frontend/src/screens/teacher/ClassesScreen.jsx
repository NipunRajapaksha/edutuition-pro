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
  Eye,
  Search,
  Edit2,
  Trash2
} from 'lucide-react';

const ClassesScreen = ({ onOpenAddClass }) => {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const [classes, setClasses] = useState([]);
  const [timetable, setTimetable] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'timetable'
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Class Roster Modal
  const [selectedClassRoster, setSelectedClassRoster] = useState(null);
  const [loadingRoster, setLoadingRoster] = useState(false);

  // Edit Class Modal
  const [editingClass, setEditingClass] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  const grades = [
    'All',
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
    'Grade 11', 'Grade 12', 'Grade 13', 'A/L', 'A/L Revision'
  ];

  const fetchClasses = async () => {
    try {
      setLoading(true);

      let localClasses = [];
      try {
        const stored = localStorage.getItem('edutuition_classes');
        if (stored) localClasses = JSON.parse(stored);
      } catch (e) {}

      const [clsRes, timeRes] = await Promise.allSettled([
        api.getClasses(),
        api.getTimetable()
      ]);

      let serverClasses = [];
      if (clsRes.status === 'fulfilled' && clsRes.value?.data?.success && Array.isArray(clsRes.value.data.data)) {
        serverClasses = clsRes.value.data.data;
      }

      const classMap = new Map();
      serverClasses.forEach(c => classMap.set(c._id || c.id || c.name, c));
      localClasses.forEach(c => classMap.set(c._id || c.id || c.name, c));
      const mergedClasses = Array.from(classMap.values());

      setClasses(mergedClasses);
      localStorage.setItem('edutuition_classes', JSON.stringify(mergedClasses));

      if (timeRes.status === 'fulfilled' && timeRes.value?.data?.success) {
        setTimetable(timeRes.value.data.data);
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
      try {
        const stored = localStorage.getItem('edutuition_classes');
        if (stored) setClasses(JSON.parse(stored));
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const filteredClasses = classes.filter(cls => {
    const matchesGrade = selectedGrade === 'All' || cls.grade === selectedGrade || (cls.grade && cls.grade.includes(selectedGrade));
    const matchesSearch = !searchQuery.trim() || 
      cls.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.teacherName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGrade && matchesSearch;
  });

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

  const handleOpenEditClass = (cls) => {
    setEditingClass(cls);
    setEditFormData({
      name: cls.name || '',
      subject: cls.subject || 'Mathematics',
      grade: cls.grade || 'Grade 10',
      teacherName: cls.teacherName || 'Master N. Perera',
      location: cls.location || 'Main Hall',
      dayOfWeek: cls.dayOfWeek || 'Saturday',
      startTime: cls.startTime || '08:00',
      endTime: cls.endTime || '10:00',
      monthlyFee: cls.monthlyFee || 2500,
      maxStudents: cls.maxStudents || 50,
      status: cls.status || 'active',
      color: cls.color || '#3B82F6'
    });
  };

  const handleSaveEditClass = async (e) => {
    e.preventDefault();
    if (!editingClass) return;
    setSavingEdit(true);
    const targetId = editingClass._id || editingClass.id;
    try {
      await api.updateClass(targetId, editFormData);
    } catch {}
    const updated = classes.map(c => (c._id || c.id) === targetId ? { ...c, ...editFormData } : c);
    setClasses(updated);
    localStorage.setItem('edutuition_classes', JSON.stringify(updated));
    setEditingClass(null);
    setSavingEdit(false);
  };

  const handleDeleteClass = async (cls) => {
    const cId = cls._id || cls.id;
    if (!window.confirm(`Are you sure you want to delete "${cls.name}"?`)) return;
    try {
      await api.deleteClass(cId);
    } catch {}
    const updated = classes.filter(c => (c._id || c.id) !== cId);
    setClasses(updated);
    localStorage.setItem('edutuition_classes', JSON.stringify(updated));
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

      {/* Search & Grade Filter (Cards View) */}
      {viewMode === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: colors.surface,
              borderRadius: '12px',
              padding: '0 12px',
              border: `1px solid ${colors.border}`,
              gap: '8px'
            }}
          >
            <Search size={16} color={colors.textMuted} />
            <input
              type="text"
              placeholder="Search by class name, subject, or teacher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 0',
                backgroundColor: 'transparent',
                border: 'none',
                color: colors.text,
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              paddingBottom: '4px',
              scrollbarWidth: 'none'
            }}
          >
            {grades.map(grade => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: 'none',
                  backgroundColor: selectedGrade === grade ? colors.primary : colors.surfaceSubtle,
                  color: selectedGrade === grade ? '#FFFFFF' : colors.textMuted,
                  fontSize: '11px',
                  fontWeight: '700',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer'
                }}
              >
                {grade}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px', color: colors.textMuted, fontSize: '13px' }}>
          {t('loading')}
        </div>
      ) : viewMode === 'list' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredClasses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: colors.textMuted, fontSize: '13px', backgroundColor: colors.surface, borderRadius: '16px', border: `1px solid ${colors.border}` }}>
              No classes found matching your criteria.
            </div>
          ) : (
            filteredClasses.map(cls => (
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

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => handleOpenRoster(cls)}
                    style={{
                      padding: '6px 10px',
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
                    <Eye size={13} /> Roster
                  </button>

                  <button
                    onClick={() => handleOpenEditClass(cls)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      color: '#3B82F6',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Edit2 size={13} /> Edit
                  </button>

                  <button
                    onClick={() => handleDeleteClass(cls)}
                    style={{
                      padding: '6px 8px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#EF4444',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          )))
        }
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

      {/* Edit Class Modal */}
      {editingClass && (
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
              maxWidth: '440px',
              backgroundColor: colors.surface,
              borderRadius: '20px',
              padding: '20px',
              border: `1px solid ${colors.border}`,
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: colors.text }}>
                Edit Tuition Class
              </h3>
              <button
                onClick={() => setEditingClass(null)}
                style={{ background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditClass} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Class Name *</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Subject *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.subject}
                    onChange={(e) => setEditFormData({ ...editFormData, subject: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Grade (ශ්‍රේණිය) *</label>
                  <select
                    value={editFormData.grade}
                    onChange={(e) => setEditFormData({ ...editFormData, grade: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
                  >
                    {grades.filter(g => g !== 'All').map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Day of Week</label>
                  <select
                    value={editFormData.dayOfWeek}
                    onChange={(e) => setEditFormData({ ...editFormData, dayOfWeek: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
                  >
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Monthly Fee (Rs.)</label>
                  <input
                    type="number"
                    value={editFormData.monthlyFee}
                    onChange={(e) => setEditFormData({ ...editFormData, monthlyFee: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Start Time</label>
                  <input
                    type="time"
                    value={editFormData.startTime}
                    onChange={(e) => setEditFormData({ ...editFormData, startTime: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>End Time</label>
                  <input
                    type="time"
                    value={editFormData.endTime}
                    onChange={(e) => setEditFormData({ ...editFormData, endTime: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Location / Hall</label>
                  <input
                    type="text"
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Teacher Name</label>
                  <input
                    type="text"
                    value={editFormData.teacherName}
                    onChange={(e) => setEditFormData({ ...editFormData, teacherName: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingClass(null)}
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', backgroundColor: colors.surfaceSubtle, border: `1px solid ${colors.border}`, color: colors.text, fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', backgroundColor: colors.primary, color: '#FFFFFF', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassesScreen;
