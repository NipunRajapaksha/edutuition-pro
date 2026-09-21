import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/client';
import Badge from '../../components/Badge';
import confetti from 'canvas-confetti';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  X,
  UploadCloud,
  FileCheck
} from 'lucide-react';

const StudentHomeworkScreen = () => {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);

  // Submit modal
  const [submittingHw, setSubmittingHw] = useState(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const studentProfileId = user?.studentProfileId || user?.studentProfile?._id;

  const fetchHomework = async () => {
    if (!studentProfileId) return;
    try {
      setLoading(true);
      const res = await api.getStudentHomework(studentProfileId);
      if (res.data.success) {
        setHomework(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomework();
  }, [studentProfileId]);

  const handleSubmitHomework = async (e) => {
    e.preventDefault();
    if (!submittingHw) return;
    setSubmitting(true);
    try {
      const attachments = fileName ? [{ name: fileName, url: 'https://example.com/student-uploads/' + fileName }] : [];
      const res = await api.submitHomework({
        homeworkId: submittingHw._id || submittingHw.id,
        studentId: studentProfileId,
        content: submissionContent,
        attachments
      });

      if (res.data.success) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
        setSubmittingHw(null);
        setSubmissionContent('');
        setFileName('');
        fetchHomework();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting homework');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '90px' }}>
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: colors.text }}>
          {t('navMyHomework')}
        </h2>
        <div style={{ fontSize: '12px', color: colors.textMuted }}>
          Assignments, submission deadlines & teacher review marks
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px', color: colors.textMuted }}>{t('loading')}</div>
      ) : homework.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', backgroundColor: colors.surface, borderRadius: '16px', border: `1px solid ${colors.border}`, color: colors.textMuted }}>
          No homework assigned at this time.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {homework.map(hw => (
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

                <Badge variant={hw.submissionStatus === 'reviewed' ? 'reviewed' : hw.submissionStatus === 'submitted' ? 'submitted' : 'warning'}>
                  {hw.submissionStatus === 'reviewed' ? 'Reviewed' : hw.submissionStatus === 'submitted' ? 'Submitted' : 'Pending'}
                </Badge>
              </div>

              {hw.description && (
                <p style={{ fontSize: '12px', color: colors.textMuted, lineHeight: 1.4 }}>
                  {hw.description}
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surfaceSubtle, padding: '8px 12px', borderRadius: '10px', fontSize: '11px', color: colors.textMuted }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} color="#F59E0B" /> Due: <strong>{hw.deadline}</strong>
                </span>
                <span>Total Marks: <strong>{hw.totalMarks}</strong></span>
              </div>

              {/* Reviewed details if available */}
              {hw.submission && hw.submission.status === 'reviewed' && (
                <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', borderRadius: '10px', padding: '10px 12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', color: '#10B981' }}>
                    <span>Score Awarded:</span>
                    <span>{hw.submission.marksObtained} / {hw.totalMarks} Marks</span>
                  </div>
                  {hw.submission.feedback && (
                    <div style={{ fontSize: '11px', color: colors.text, marginTop: '4px' }}>
                      <strong>Teacher Feedback:</strong> {hw.submission.feedback}
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              {hw.submissionStatus !== 'reviewed' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: `1px solid ${colors.border}`, paddingTop: '10px' }}>
                  <button
                    onClick={() => {
                      setSubmittingHw(hw);
                      setSubmissionContent(hw.submission?.content || '');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '10px',
                      backgroundColor: hw.submissionStatus === 'submitted' ? colors.surfaceSubtle : colors.primary,
                      color: hw.submissionStatus === 'submitted' ? colors.text : '#FFFFFF',
                      border: `1px solid ${colors.border}`,
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    <Send size={13} />
                    {hw.submissionStatus === 'submitted' ? 'Update Submission' : 'Submit Homework'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Submission Modal */}
      {submittingHw && (
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
              maxWidth: '420px',
              backgroundColor: colors.surface,
              borderRadius: '20px',
              padding: '20px',
              border: `1px solid ${colors.border}`
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: colors.text }}>
                  Submit: {submittingHw.title}
                </h3>
                <div style={{ fontSize: '11px', color: colors.textMuted }}>
                  Enter your solution steps or attach file name
                </div>
              </div>
              <button
                onClick={() => setSubmittingHw(null)}
                style={{ background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitHomework} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>
                  Solution Notes / Explanations
                </label>
                <textarea
                  rows="4"
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  required
                  placeholder="Type your answers, proofs, or calculations here..."
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

              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>
                  Attach Document / Photo Solution
                </label>
                <input
                  type="text"
                  placeholder="e.g. My_Math_Solutions.pdf"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.surfaceSubtle,
                    color: colors.text,
                    fontSize: '12px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setSubmittingHw(null)}
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
                  disabled={submitting}
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
                  {submitting ? t('loading') : 'Send Solution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentHomeworkScreen;
