import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/client';
import Badge from '../../components/Badge';
import {
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  FileCheck,
  Edit2,
  Trash2
} from 'lucide-react';

const HomeworkScreen = ({ onOpenAddHomework }) => {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const [homeworkList, setHomeworkList] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Submissions Modal
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [submissionsRoster, setSubmissionsRoster] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  // Grading Modal
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [marksInput, setMarksInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [savingGrade, setSavingGrade] = useState(false);

  // Edit Homework Modal
  const [editingHomework, setEditingHomework] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    totalMarks: 100,
    classId: ''
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchHomework = async () => {
    try {
      setLoading(true);
      const res = await api.getHomework();
      if (res.data.success) {
        setHomeworkList(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomework();
    api.getClasses().then(res => {
      if (res?.data?.success && Array.isArray(res.data.data)) {
        setClasses(res.data.data);
      }
    }).catch(() => {});
  }, []);

  const handleOpenEditModal = (hw) => {
    setEditingHomework(hw);
    setEditFormData({
      title: hw.title,
      description: hw.description || '',
      deadline: hw.deadline || '',
      totalMarks: hw.totalMarks || 100,
      classId: hw.classId || ''
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingHomework) return;
    setSavingEdit(true);
    try {
      const res = await api.updateHomework(editingHomework._id || editingHomework.id, editFormData);
      if (res.data.success) {
        setEditingHomework(null);
        fetchHomework();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating homework');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteHomework = async (hw) => {
    if (!window.confirm(`Are you sure you want to delete homework "${hw.title}"?`)) return;
    try {
      const res = await api.deleteHomework(hw._id || hw.id);
      if (res.data.success) {
        fetchHomework();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting homework');
    }
  };

  const handleOpenSubmissions = async (hw) => {
    setSelectedHomework(hw);
    setLoadingSubs(true);
    try {
      const res = await api.getHomeworkSubmissions(hw._id || hw.id);
      if (res.data.success) {
        setSubmissionsRoster(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSubs(false);
    }
  };

  const handleOpenGradeModal = (sub) => {
    setGradingSubmission(sub);
    setMarksInput(sub.marksObtained !== null ? String(sub.marksObtained) : '');
    setFeedbackInput(sub.feedback || '');
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    if (!gradingSubmission) return;
    setSavingGrade(true);
    try {
      const res = await api.reviewHomeworkSubmission(gradingSubmission.submissionId, {
        marksObtained: Number(marksInput),
        feedback: feedbackInput
      });
      if (res.data.success) {
        // Refresh roster
        handleOpenSubmissions(selectedHomework);
        setGradingSubmission(null);
        fetchHomework();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving grade');
    } finally {
      setSavingGrade(false);
    }
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '90px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: colors.text }}>
            {t('navHomework')}
          </h2>
          <div style={{ fontSize: '12px', color: colors.textMuted }}>
            Assignment deadlines, submissions & reviews
          </div>
        </div>
        <button
          onClick={onOpenAddHomework}
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
          {t('addHomework')}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px', color: colors.textMuted }}>{t('loading')}</div>
      ) : homeworkList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', backgroundColor: colors.surface, borderRadius: '16px', border: `1px solid ${colors.border}`, color: colors.textMuted }}>
          No homework assignments created yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {homeworkList.map(hw => (
            <div
              key={hw._id || hw.id}
              style={{
                backgroundColor: colors.surface,
                borderRadius: '18px',
                padding: '16px',
                border: `1px solid ${colors.border}`,
                boxShadow: colors.cardShadow,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: colors.text }}>
                    {hw.title}
                  </h3>
                  <div style={{ fontSize: '12px', color: colors.primaryLight, fontWeight: '600', marginTop: '2px' }}>
                    {hw.className} • {hw.subject}
                  </div>
                </div>

                <Badge variant={hw.isOverdue ? 'danger' : 'warning'}>
                  {hw.isOverdue ? 'Deadline Passed' : 'Active'}
                </Badge>
              </div>

              {hw.description && (
                <p style={{ fontSize: '12px', color: colors.textMuted, lineHeight: 1.4 }}>
                  {hw.description}
                </p>
              )}

              {/* Deadline & Marks */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surfaceSubtle, padding: '8px 12px', borderRadius: '10px', fontSize: '11px', color: colors.textMuted }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} color="#F59E0B" />
                  <span>Due: <strong>{hw.deadline}</strong></span>
                </div>
                <div>
                  Marks: <strong>{hw.totalMarks}</strong>
                </div>
              </div>

              {/* Submission Stats & Action */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${colors.border}`, paddingTop: '10px', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '11px', color: colors.textMuted }}>
                  Submissions: <strong style={{ color: '#10B981' }}>{hw.submittedCount || 0}</strong> / {hw.totalAssigned || 0}
                  {hw.reviewedCount > 0 && <span style={{ marginLeft: '6px' }}>({hw.reviewedCount} graded)</span>}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => handleOpenSubmissions(hw)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      backgroundColor: colors.surfaceSubtle,
                      border: `1px solid ${colors.border}`,
                      color: colors.text,
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    <Eye size={13} /> Submissions
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(hw)}
                    title="Edit Homework"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(79, 70, 229, 0.1)',
                      border: '1px solid rgba(79, 70, 229, 0.25)',
                      color: colors.primaryLight,
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    <Edit2 size={13} /> Edit
                  </button>

                  <button
                    onClick={() => handleDeleteHomework(hw)}
                    title="Delete Homework"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      color: '#EF4444',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submissions Review Modal */}
      {selectedHomework && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
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
              maxWidth: '480px',
              backgroundColor: colors.surface,
              borderRadius: '20px',
              padding: '20px',
              border: `1px solid ${colors.border}`,
              maxHeight: '85vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: colors.text }}>
                  {selectedHomework.title}
                </h3>
                <div style={{ fontSize: '11px', color: colors.textMuted }}>
                  Student Submissions Roster
                </div>
              </div>
              <button
                onClick={() => setSelectedHomework(null)}
                style={{ background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {loadingSubs ? (
              <div style={{ textAlign: 'center', padding: '20px', color: colors.textMuted }}>{t('loading')}</div>
            ) : submissionsRoster.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: colors.textMuted, fontSize: '12px' }}>
                No enrolled students found.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {submissionsRoster.map(s => (
                  <div
                    key={s.studentId}
                    style={{
                      backgroundColor: colors.surfaceSubtle,
                      borderRadius: '12px',
                      padding: '12px',
                      border: `1px solid ${colors.border}`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img
                          src={s.photo || `https://api.dicebear.com/7.x/bottts/png?seed=${encodeURIComponent(s.studentCode)}`}
                          alt={s.fullName}
                          style={{ width: '30px', height: '30px', borderRadius: '6px', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: colors.text }}>{s.fullName}</div>
                          <div style={{ fontSize: '10px', color: colors.textMuted }}>{s.studentCode}</div>
                        </div>
                      </div>

                      <Badge variant={s.status === 'reviewed' ? 'reviewed' : s.submitted ? 'submitted' : 'danger'}>
                        {s.status === 'reviewed' ? `Graded (${s.marksObtained}/${selectedHomework.totalMarks})` : s.status}
                      </Badge>
                    </div>

                    {s.content && (
                      <div style={{ fontSize: '11px', color: colors.text, margin: '6px 0', fontStyle: 'italic', backgroundColor: colors.surface, padding: '6px 8px', borderRadius: '6px' }}>
                        "{s.content}"
                      </div>
                    )}

                    {s.feedback && (
                      <div style={{ fontSize: '11px', color: colors.primaryLight, marginBottom: '6px' }}>
                        <strong>Feedback:</strong> {s.feedback}
                      </div>
                    )}

                    {s.submitted && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                        <button
                          onClick={() => handleOpenGradeModal(s)}
                          style={{
                            padding: '5px 12px',
                            borderRadius: '8px',
                            backgroundColor: colors.primary,
                            color: '#FFFFFF',
                            border: 'none',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <FileCheck size={12} /> {s.status === 'reviewed' ? 'Edit Grade' : 'Grade & Feedback'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grade Submission Modal */}
      {gradingSubmission && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '380px',
              backgroundColor: colors.surface,
              borderRadius: '20px',
              padding: '20px',
              border: `1px solid ${colors.border}`
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: colors.text }}>
                Grade: {gradingSubmission.fullName}
              </h3>
              <button
                onClick={() => setGradingSubmission(null)}
                style={{ background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveGrade} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>
                  Marks Obtained (out of {selectedHomework.totalMarks})
                </label>
                <input
                  type="number"
                  min="0"
                  max={selectedHomework.totalMarks}
                  value={marksInput}
                  onChange={(e) => setMarksInput(e.target.value)}
                  required
                  placeholder="e.g. 85"
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
                  Teacher Feedback & Notes
                </label>
                <textarea
                  rows="3"
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  placeholder="e.g. Excellent step-by-step calculations!"
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

              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setGradingSubmission(null)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
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
                  disabled={savingGrade}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    backgroundColor: colors.primary,
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {savingGrade ? t('loading') : 'Save Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Homework Modal */}
      {editingHomework && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
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
              maxWidth: '440px',
              backgroundColor: colors.surface,
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              border: `1px solid ${colors.border}`,
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(79, 70, 229, 0.15)', color: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Edit2 size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: colors.text, margin: 0 }}>
                    Edit Homework Assignment
                  </h3>
                  <p style={{ fontSize: '11px', color: colors.textMuted, margin: 0 }}>
                    Update details, deadline & total marks
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingHomework(null)}
                style={{ background: 'none', border: 'none', color: colors.textMuted, fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Title */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: colors.textMuted, marginBottom: '4px' }}>
                  Title / මාතෘකාව *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
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

              {/* Class Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: colors.textMuted, marginBottom: '4px' }}>
                  Assigned Class / පන්තිය *
                </label>
                <select
                  required
                  value={editFormData.classId}
                  onChange={(e) => setEditFormData({ ...editFormData, classId: e.target.value })}
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
                >
                  <option value="">-- Select Class --</option>
                  {classes.map(c => (
                    <option key={c._id || c.id} value={c._id || c.id}>
                      {c.name} ({c.grade})
                    </option>
                  ))}
                </select>
              </div>

              {/* Deadline & Marks */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: colors.textMuted, marginBottom: '4px' }}>
                    Deadline Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={editFormData.deadline}
                    onChange={(e) => setEditFormData({ ...editFormData, deadline: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: `1px solid ${colors.border}`,
                      backgroundColor: colors.surfaceSubtle,
                      color: colors.text,
                      fontSize: '12px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: colors.textMuted, marginBottom: '4px' }}>
                    Total Marks
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={editFormData.totalMarks}
                    onChange={(e) => setEditFormData({ ...editFormData, totalMarks: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: `1px solid ${colors.border}`,
                      backgroundColor: colors.surfaceSubtle,
                      color: colors.text,
                      fontSize: '12px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: colors.textMuted, marginBottom: '4px' }}>
                  Instructions / Description (විස්තරය)
                </label>
                <textarea
                  rows={3}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.surfaceSubtle,
                    color: colors.text,
                    fontSize: '12px',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setEditingHomework(null)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    backgroundColor: colors.surfaceSubtle,
                    border: `1px solid ${colors.border}`,
                    color: colors.text,
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingEdit}
                  style={{
                    flex: 2,
                    padding: '10px',
                    borderRadius: '10px',
                    backgroundColor: colors.primary,
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                  }}
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

export default HomeworkScreen;
