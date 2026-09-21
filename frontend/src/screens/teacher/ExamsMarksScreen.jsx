import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/client';
import Badge from '../../components/Badge';
import confetti from 'canvas-confetti';
import {
  Award,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  Edit3,
  TrendingUp,
  X,
  Sparkles,
  BarChart3
} from 'lucide-react';

const ExamsMarksScreen = ({ onOpenCreateExam }) => {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Marks Entry Modal
  const [selectedExam, setSelectedExam] = useState(null);
  const [marksRoster, setMarksRoster] = useState([]);
  const [loadingMarks, setLoadingMarks] = useState(false);
  const [marksFormData, setMarksFormData] = useState({});
  const [savingMarks, setSavingMarks] = useState(false);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await api.getExams();
      if (res.data.success) {
        setExams(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleOpenMarksModal = async (exam) => {
    setSelectedExam(exam);
    setLoadingMarks(true);
    try {
      const res = await api.getExamMarks(exam._id || exam.id);
      if (res.data.success) {
        setMarksRoster(res.data.data);
        const initialInputs = {};
        res.data.data.forEach(r => {
          initialInputs[r.studentId] = r.marksObtained !== null ? r.marksObtained : '';
        });
        setMarksFormData(initialInputs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMarks(false);
    }
  };

  const handleSaveAllMarks = async (e) => {
    e.preventDefault();
    setSavingMarks(true);
    try {
      const marksPayload = Object.entries(marksFormData)
        .filter(([_, val]) => val !== '' && !isNaN(val))
        .map(([sId, val]) => ({
          studentId: sId,
          marksObtained: Number(val)
        }));

      const res = await api.enterExamMarks(selectedExam._id || selectedExam.id, marksPayload);
      if (res.data.success) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        setSelectedExam(null);
        fetchExams();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving marks');
    } finally {
      setSavingMarks(false);
    }
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '90px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: colors.text }}>
            {t('navExams')}
          </h2>
          <div style={{ fontSize: '12px', color: colors.textMuted }}>
            Tests, auto-grading, rankings & performance
          </div>
        </div>

        <button
          onClick={onOpenCreateExam}
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
          {t('addExam')}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px', color: colors.textMuted }}>{t('loading')}</div>
      ) : exams.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', backgroundColor: colors.surface, borderRadius: '16px', border: `1px solid ${colors.border}`, color: colors.textMuted }}>
          No exams scheduled yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {exams.map(ex => (
            <div
              key={ex._id || ex.id}
              style={{
                backgroundColor: colors.surface,
                borderRadius: '18px',
                padding: '18px',
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
                    {ex.name}
                  </h3>
                  <div style={{ fontSize: '12px', color: colors.primaryLight, fontWeight: '600', marginTop: '2px' }}>
                    {ex.className} • {ex.subject}
                  </div>
                </div>

                <Badge variant={ex.status === 'graded' ? 'present' : 'warning'}>
                  {ex.status === 'graded' ? 'Graded & Ranked' : 'Scheduled'}
                </Badge>
              </div>

              {/* Timing & Marks Overview */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', backgroundColor: colors.surfaceSubtle, padding: '10px', borderRadius: '12px', textAlign: 'center', fontSize: '11px' }}>
                <div>
                  <div style={{ color: colors.textMuted }}>Date</div>
                  <div style={{ fontWeight: '700', color: colors.text, marginTop: '2px' }}>{ex.date}</div>
                </div>
                <div>
                  <div style={{ color: colors.textMuted }}>Total Marks</div>
                  <div style={{ fontWeight: '700', color: colors.text, marginTop: '2px' }}>{ex.totalMarks}</div>
                </div>
                <div>
                  <div style={{ color: colors.textMuted }}>Class Avg</div>
                  <div style={{ fontWeight: '800', color: '#10B981', marginTop: '2px' }}>
                    {ex.classAverage > 0 ? `${ex.classAverage}%` : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Highest / Lowest if graded */}
              {ex.status === 'graded' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: colors.textMuted, padding: '0 4px' }}>
                  <span>Highest Score: <strong style={{ color: '#10B981' }}>{ex.highestMark}/{ex.totalMarks}</strong></span>
                  <span>Lowest Score: <strong style={{ color: '#EF4444' }}>{ex.lowestMark}/{ex.totalMarks}</strong></span>
                </div>
              )}

              {/* Action */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: `1px solid ${colors.border}`, paddingTop: '10px' }}>
                <button
                  onClick={() => handleOpenMarksModal(ex)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    backgroundColor: colors.primary,
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  <Edit3 size={14} />
                  {ex.status === 'graded' ? 'Edit Marks & Ranks' : 'Record Marks'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Marks Entry & Auto-Ranking Modal */}
      {selectedExam && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
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
              maxHeight: '88vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: colors.text }}>
                  {selectedExam.name}
                </h3>
                <div style={{ fontSize: '11px', color: colors.textMuted }}>
                  Enter marks out of {selectedExam.totalMarks}. Ranks and grades (A, B, C, S, F) compute automatically!
                </div>
              </div>
              <button
                onClick={() => setSelectedExam(null)}
                style={{ background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {loadingMarks ? (
              <div style={{ textAlign: 'center', padding: '24px', color: colors.textMuted }}>{t('loading')}</div>
            ) : marksRoster.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: colors.textMuted, fontSize: '12px' }}>
                No students enrolled in this class.
              </div>
            ) : (
              <form onSubmit={handleSaveAllMarks} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {marksRoster.map(s => {
                  const markVal = marksFormData[s.studentId];
                  const percent = markVal !== '' && !isNaN(markVal) ? Math.round((Number(markVal) / selectedExam.totalMarks) * 100) : null;
                  let gradeCalc = '';
                  if (percent !== null) {
                    if (percent >= 75) gradeCalc = 'A';
                    else if (percent >= 65) gradeCalc = 'B';
                    else if (percent >= 50) gradeCalc = 'C';
                    else if (percent >= 35) gradeCalc = 'S';
                    else gradeCalc = 'F';
                  }

                  return (
                    <div
                      key={s.studentId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        backgroundColor: colors.surfaceSubtle,
                        borderRadius: '12px',
                        border: `1px solid ${colors.border}`
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                        <img
                          src={s.photo || `https://api.dicebear.com/7.x/bottts/png?seed=${encodeURIComponent(s.code)}`}
                          alt={s.fullName}
                          style={{ width: '34px', height: '34px', borderRadius: '8px', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: colors.text }}>{s.fullName}</div>
                          <div style={{ fontSize: '10px', color: colors.textMuted }}>{s.code}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {percent !== null && (
                          <div style={{ textAlign: 'right', fontSize: '11px', minWidth: '45px' }}>
                            <div style={{ fontWeight: '800', color: '#10B981' }}>{percent}%</div>
                            <div style={{ fontSize: '9px', color: colors.textMuted }}>Grade {gradeCalc}</div>
                          </div>
                        )}
                        <input
                          type="number"
                          min="0"
                          max={selectedExam.totalMarks}
                          value={marksFormData[s.studentId] ?? ''}
                          onChange={(e) => setMarksFormData({ ...marksFormData, [s.studentId]: e.target.value })}
                          placeholder="Marks"
                          style={{
                            width: '70px',
                            padding: '6px 8px',
                            borderRadius: '8px',
                            border: `1px solid ${colors.border}`,
                            backgroundColor: colors.surface,
                            color: colors.text,
                            fontSize: '13px',
                            fontWeight: '700',
                            textAlign: 'center',
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedExam(null)}
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
                    disabled={savingMarks}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '10px',
                      backgroundColor: colors.primary,
                      color: '#FFFFFF',
                      border: 'none',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <Sparkles size={14} />
                    {savingMarks ? t('loading') : 'Save & Calculate Ranks'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamsMarksScreen;
