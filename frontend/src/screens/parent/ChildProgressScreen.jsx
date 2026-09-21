import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/client';
import { ProgressLineChart } from '../../components/ChartViewer';
import Badge from '../../components/Badge';
import { Award, TrendingUp, Zap, AlertTriangle, FileCheck } from 'lucide-react';

const ChildProgressScreen = () => {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const [student, setStudent] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);

  const linkedStudentId = user?.linkedStudentId;

  useEffect(() => {
    const fetchProgress = async () => {
      if (!linkedStudentId) return;
      try {
        setLoading(true);
        const [stuRes, perfRes] = await Promise.all([
          api.getStudentById(linkedStudentId),
          api.getStudentPerformance(linkedStudentId)
        ]);

        if (stuRes.data.success) setStudent(stuRes.data.data);
        if (perfRes.data.success) setPerformance(perfRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, [linkedStudentId]);

  if (loading) {
    return <div style={{ padding: '30px', textAlign: 'center', color: colors.textMuted }}>{t('loading')}</div>;
  }

  const marks = student?.recentMarks || [];
  const metrics = performance?.metrics || { averageMark: 85, latestRank: 1 };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '90px' }}>
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: colors.text }}>
          Child Academic Performance
        </h2>
        <div style={{ fontSize: '12px', color: colors.textMuted }}>
          Exam score progression, subject strengths & teacher feedback
        </div>
      </div>

      {/* Gauges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        <div style={{ backgroundColor: colors.surface, padding: '16px', borderRadius: '16px', border: `1px solid ${colors.border}` }}>
          <div style={{ fontSize: '11px', color: colors.textMuted, fontWeight: '700' }}>TEST AVERAGE</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#10B981', marginTop: '4px' }}>
            {metrics.averageMark}%
          </div>
        </div>

        <div style={{ backgroundColor: colors.surface, padding: '16px', borderRadius: '16px', border: `1px solid ${colors.border}` }}>
          <div style={{ fontSize: '11px', color: colors.textMuted, fontWeight: '700' }}>CLASS RANKING</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#6366F1', marginTop: '4px' }}>
            #{metrics.latestRank}
          </div>
        </div>
      </div>

      {/* Progress Chart */}
      <div style={{ backgroundColor: colors.surface, borderRadius: '18px', padding: '18px', border: `1px solid ${colors.border}`, boxShadow: colors.cardShadow }}>
        <h3 style={{ fontSize: '14px', fontWeight: '800', color: colors.text, marginBottom: '10px' }}>
          Examination Progress Over Time
        </h3>
        <ProgressLineChart data={performance?.examProgression || []} />
      </div>

      {/* Strengths & Suggestions */}
      <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', borderRadius: '16px', padding: '14px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#10B981', marginBottom: '8px' }}>
          <Zap size={15} /> Academic Strengths Noted by Teacher
        </div>
        {(performance?.strengths || []).map((s, i) => (
          <div key={i} style={{ fontSize: '12px', color: colors.text, marginBottom: '4px' }}>
            • <strong>{s.subject}:</strong> {s.label}
          </div>
        ))}
      </div>

      {/* Exam marks list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '800', color: colors.text }}>
          Examination Mark Details
        </h3>
        {marks.map((m, i) => (
          <div
            key={i}
            style={{
              backgroundColor: colors.surface,
              borderRadius: '16px',
              padding: '14px',
              border: `1px solid ${colors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: colors.text }}>{m.examName}</div>
              <div style={{ fontSize: '11px', color: colors.textMuted }}>{m.subject} • {m.date}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#10B981' }}>
                {m.marksObtained}/{m.totalMarks} ({m.percentage}%)
              </div>
              <div style={{ fontSize: '10px', color: colors.primaryLight, fontWeight: '700' }}>
                Grade {m.grade} • Rank #{m.rank}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChildProgressScreen;
