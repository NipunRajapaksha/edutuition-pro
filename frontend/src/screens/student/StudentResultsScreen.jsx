import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/client';
import { ProgressLineChart } from '../../components/ChartViewer';
import Badge from '../../components/Badge';
import { Award, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react';

const StudentResultsScreen = () => {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const [student, setStudent] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);

  const studentProfileId = user?.studentProfileId || user?.studentProfile?._id || user?.studentProfile?.id || user?._id || user?.id;

  useEffect(() => {
    let isMounted = true;
    const fetchResults = async () => {
      setLoading(true);
      try {
        const [stuRes, perfRes] = await Promise.all([
          api.getStudentById(studentProfileId),
          api.getStudentPerformance(studentProfileId)
        ]);

        if (isMounted) {
          if (stuRes?.data?.success && stuRes.data.data) {
            setStudent(stuRes.data.data);
          }
          if (perfRes?.data?.success && perfRes.data.data) {
            setPerformance(perfRes.data.data);
          }
        }
      } catch (err) {
        console.error('Error fetching student results:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchResults();
    return () => { isMounted = false; };
  }, [studentProfileId]);

  if (loading) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: colors.textMuted }}>
        <div style={{ fontSize: '15px', fontWeight: '700', color: colors.text }}>Loading Academic Results...</div>
        <div style={{ fontSize: '12px', marginTop: '6px' }}>Fetching your exam marks and class progression</div>
      </div>
    );
  }

  const marks = student?.recentMarks || [];
  const metrics = performance?.metrics || { 
    averageMark: marks.length > 0 ? Math.round(marks.reduce((acc, m) => acc + (m.percentage || 0), 0) / marks.length) : 0, 
    latestRank: marks.length > 0 ? 1 : 0 
  };
  const progressionData = (performance?.examProgression && performance.examProgression.length > 0)
    ? performance.examProgression
    : (performance?.trend || []);

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '90px' }}>
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: colors.text }}>
          {t('navMyResults')}
        </h2>
        <div style={{ fontSize: '12px', color: colors.textMuted }}>
          Official academic report card, subject grades & class rankings
        </div>
      </div>

      {/* Top Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        <div style={{ backgroundColor: colors.surface, padding: '16px', borderRadius: '16px', border: `1px solid ${colors.border}` }}>
          <div style={{ fontSize: '11px', color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase' }}>
            OVERALL AVERAGE
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#10B981', marginTop: '4px' }}>
            {metrics.averageMark}%
          </div>
        </div>

        <div style={{ backgroundColor: colors.surface, padding: '16px', borderRadius: '16px', border: `1px solid ${colors.border}` }}>
          <div style={{ fontSize: '11px', color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase' }}>
            LATEST CLASS RANK
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#6366F1', marginTop: '4px' }}>
            {metrics.latestRank > 0 ? `#${metrics.latestRank}` : '-'}
          </div>
        </div>
      </div>

      {/* Marks Progress Graph */}
      {progressionData.length > 0 && (
        <div style={{ backgroundColor: colors.surface, borderRadius: '18px', padding: '18px', border: `1px solid ${colors.border}`, boxShadow: colors.cardShadow }}>
          <h3 style={{ fontSize: '14px', fontWeight: '800', color: colors.text, marginBottom: '10px' }}>
            {t('examProgression')}
          </h3>
          <ProgressLineChart data={progressionData} />
        </div>
      )}

      {/* Exam Results Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '800', color: colors.text }}>
          Evaluations & Test Papers ({marks.length})
        </h3>

        {marks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 20px', backgroundColor: colors.surface, borderRadius: '16px', border: `1px solid ${colors.border}`, color: colors.textMuted, fontSize: '12px' }}>
            <Award size={32} color={colors.primaryLight} style={{ margin: '0 auto 8px auto', opacity: 0.8 }} />
            <div style={{ fontSize: '14px', fontWeight: '700', color: colors.text }}>No Exam Marks Recorded Yet</div>
            <div style={{ marginTop: '4px' }}>When exam papers are marked by your teacher, your scores and class rank will appear here.</div>
          </div>
        ) : (
          marks.map((m, i) => (
            <div
              key={i}
              style={{
                backgroundColor: colors.surface,
                borderRadius: '16px',
                padding: '16px',
                border: `1px solid ${colors.border}`,
                boxShadow: colors.cardShadow,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '800', color: colors.text }}>
                    {m.examName}
                  </h4>
                  <div style={{ fontSize: '11px', color: colors.primaryLight, fontWeight: '600', marginTop: '2px' }}>
                    {m.subject} • {m.date}
                  </div>
                </div>

                <Badge variant="present">
                  Grade {m.grade}
                </Badge>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surfaceSubtle, padding: '8px 12px', borderRadius: '10px', fontSize: '12px' }}>
                <div>
                  <span style={{ color: colors.textMuted }}>Score: </span>
                  <strong style={{ color: colors.text }}>{m.marksObtained} / {m.totalMarks}</strong>
                  <span style={{ color: '#10B981', marginLeft: '6px', fontWeight: '700' }}>({m.percentage}%)</span>
                </div>
                <div>
                  <span style={{ color: colors.textMuted }}>Class Rank: </span>
                  <strong style={{ color: '#6366F1' }}>#{m.rank}</strong>
                </div>
              </div>

              {m.remarks && (
                <div style={{ fontSize: '11px', color: colors.textMuted, fontStyle: 'italic', padding: '0 4px' }}>
                  "{m.remarks}"
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentResultsScreen;
