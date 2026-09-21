import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/client';
import Badge from '../../components/Badge';
import {
  Search,
  Plus,
  Filter,
  QrCode,
  Phone,
  School,
  Edit2,
  Trash2,
  History,
  X,
  User,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const StudentsScreen = ({ onOpenAddStudent, onViewQrId, onViewStudentHistory }) => {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Edit Student Modal State
  const [editingStudent, setEditingStudent] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery.trim()) params.q = searchQuery.trim();
      if (selectedGrade !== 'All') params.grade = selectedGrade;
      if (selectedStatus !== 'All') params.status = selectedStatus;

      const [stuRes, clsRes] = await Promise.all([
        api.getStudents(params),
        api.getClasses()
      ]);

      if (stuRes.data.success) setStudents(stuRes.data.data);
      if (clsRes.data.success) setClasses(clsRes.data.data);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedGrade, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate/remove this student?')) return;
    try {
      await api.deleteStudent(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete student');
    }
  };

  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setEditFormData({
      fullName: student.fullName,
      phone: student.phone || '',
      email: student.email || '',
      grade: student.grade,
      school: student.school || '',
      parentName: student.parentName || '',
      parentPhone: student.parentPhone || '',
      address: student.address || '',
      status: student.status || 'active',
      notes: student.notes || ''
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const res = await api.updateStudent(editingStudent._id || editingStudent.id, editFormData);
      if (res.data.success) {
        setEditingStudent(null);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update student');
    } finally {
      setSavingEdit(false);
    }
  };

  const grades = ['All', 'Grade 9', 'Grade 10', 'Grade 11', 'A/L'];

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '90px' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: colors.text }}>
            {t('navStudents')}
          </h2>
          <div style={{ fontSize: '12px', color: colors.textMuted }}>
            {students.length} students enrolled
          </div>
        </div>
        <button
          onClick={onOpenAddStudent}
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
          {t('actionAddStudent')}
        </button>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }}
          />
          <input
            type="text"
            placeholder="Search by name, student ID, phone, or school..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              borderRadius: '12px',
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.surface,
              color: colors.text,
              fontSize: '13px',
              outline: 'none'
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '10px 16px',
            borderRadius: '12px',
            backgroundColor: colors.surfaceSubtle,
            border: `1px solid ${colors.border}`,
            color: colors.text,
            fontWeight: '600',
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          {t('search')}
        </button>
      </form>

      {/* Grade Filter Chips */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
        {grades.map(grade => {
          const isActive = selectedGrade === grade;
          return (
            <button
              key={grade}
              onClick={() => setSelectedGrade(grade)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                backgroundColor: isActive ? colors.primary : colors.surface,
                color: isActive ? '#FFFFFF' : colors.textMuted,
                border: `1px solid ${isActive ? colors.primary : colors.border}`,
                fontSize: '12px',
                fontWeight: isActive ? '700' : '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {grade}
            </button>
          );
        })}
      </div>

      {/* Student Cards List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px', color: colors.textMuted, fontSize: '13px' }}>
          {t('loading')}
        </div>
      ) : students.length === 0 ? (
        <div
          style={{
            padding: '40px 20px',
            textAlign: 'center',
            backgroundColor: colors.surface,
            borderRadius: '16px',
            border: `1px solid ${colors.border}`,
            color: colors.textMuted
          }}
        >
          <User size={36} style={{ margin: '0 auto 10px auto', opacity: 0.4 }} />
          <div style={{ fontSize: '14px', fontWeight: '700', color: colors.text }}>No students found</div>
          <div style={{ fontSize: '12px', marginTop: '4px' }}>Try adjusting your search or grade filter.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {students.map(student => (
            <div
              key={student._id || student.id}
              style={{
                backgroundColor: colors.surface,
                borderRadius: '16px',
                padding: '16px',
                border: `1px solid ${colors.border}`,
                boxShadow: colors.cardShadow,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src={student.photo || `https://api.dicebear.com/7.x/bottts/png?seed=${encodeURIComponent(student.studentId)}`}
                  alt={student.fullName}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: colors.surfaceSubtle,
                    objectFit: 'cover'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: colors.text }}>
                      {student.fullName}
                    </span>
                    <Badge variant={student.status === 'active' ? 'present' : 'absent'} size="sm">
                      {student.status}
                    </Badge>
                  </div>
                  <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '700', color: colors.primaryLight }}>{student.studentId}</span>
                    <span>•</span>
                    <span>{student.grade}</span>
                  </div>
                </div>

                {/* QR ID Button */}
                <button
                  onClick={() => onViewQrId(student)}
                  title="View Student QR ID Card"
                  style={{
                    padding: '8px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    border: '1px solid rgba(79, 70, 229, 0.25)',
                    color: colors.primaryLight,
                    cursor: 'pointer'
                  }}
                >
                  <QrCode size={18} />
                </button>
              </div>

              {/* School and Contact */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px', color: colors.textMuted, backgroundColor: colors.surfaceSubtle, padding: '8px 12px', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <School size={12} />
                  <span>{student.school || 'Not specified'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={12} />
                  <span>{student.phone || student.parentPhone || 'No phone'}</span>
                </div>
              </div>

              {/* Quick stats and Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${colors.border}`, paddingTop: '10px' }}>
                <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
                  <span>
                    Att: <strong style={{ color: student.attendanceRate >= 75 ? '#10B981' : '#EF4444' }}>{student.attendanceRate ?? 100}%</strong>
                  </span>
                  <span>
                    Classes: <strong>{(student.classes || []).length}</strong>
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => onViewStudentHistory(student._id || student.id)}
                    title="View Student History"
                    style={{
                      padding: '5px 10px',
                      borderRadius: '8px',
                      backgroundColor: colors.surfaceSubtle,
                      border: `1px solid ${colors.border}`,
                      color: colors.text,
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <History size={12} /> History
                  </button>

                  <button
                    onClick={() => handleOpenEdit(student)}
                    title="Edit Student"
                    style={{
                      padding: '5px 8px',
                      borderRadius: '8px',
                      backgroundColor: colors.surfaceSubtle,
                      border: `1px solid ${colors.border}`,
                      color: colors.textMuted,
                      cursor: 'pointer'
                    }}
                  >
                    <Edit2 size={13} />
                  </button>

                  <button
                    onClick={() => handleDeleteStudent(student._id || student.id)}
                    title="Delete Student"
                    style={{
                      padding: '5px 8px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      color: '#EF4444',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 90,
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: colors.text }}>
                Edit Student Details
              </h3>
              <button
                onClick={() => setEditingStudent(null)}
                style={{ background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={editFormData.fullName}
                  onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.surfaceSubtle,
                    color: colors.text,
                    fontSize: '13px'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>
                    Grade
                  </label>
                  <select
                    value={editFormData.grade}
                    onChange={(e) => setEditFormData({ ...editFormData, grade: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '8px',
                      border: `1px solid ${colors.border}`,
                      backgroundColor: colors.surfaceSubtle,
                      color: colors.text,
                      fontSize: '13px'
                    }}
                  >
                    <option>Grade 9</option>
                    <option>Grade 10</option>
                    <option>Grade 11</option>
                    <option>A/L</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>
                    Status
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '8px',
                      border: `1px solid ${colors.border}`,
                      backgroundColor: colors.surfaceSubtle,
                      color: colors.text,
                      fontSize: '13px'
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>
                    Student Phone
                  </label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: `1px solid ${colors.border}`,
                      backgroundColor: colors.surfaceSubtle,
                      color: colors.text,
                      fontSize: '13px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>
                    Parent Phone
                  </label>
                  <input
                    type="text"
                    value={editFormData.parentPhone}
                    onChange={(e) => setEditFormData({ ...editFormData, parentPhone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: `1px solid ${colors.border}`,
                      backgroundColor: colors.surfaceSubtle,
                      color: colors.text,
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>
                  School
                </label>
                <input
                  type="text"
                  value={editFormData.school}
                  onChange={(e) => setEditFormData({ ...editFormData, school: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.surfaceSubtle,
                    color: colors.text,
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>
                  Parent / Guardian Name
                </label>
                <input
                  type="text"
                  value={editFormData.parentName}
                  onChange={(e) => setEditFormData({ ...editFormData, parentName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.surfaceSubtle,
                    color: colors.text,
                    fontSize: '13px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    backgroundColor: colors.surfaceSubtle,
                    border: `1px solid ${colors.border}`,
                    color: colors.text,
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    backgroundColor: colors.primary,
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {savingEdit ? t('loading') : t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsScreen;
