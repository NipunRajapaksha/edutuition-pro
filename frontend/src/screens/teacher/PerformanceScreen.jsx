import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/client';
import { ProgressLineChart } from '../../components/ChartViewer';
import Badge from '../../components/Badge';
import {
  TrendingUp,
  User,
  CheckCircle2,
  CalendarCheck2,
  FileCheck2,
  Award,
  Zap,
  AlertTriangle
} from 'lucide-react';

const PerformanceScreen = () => {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const res = await api.getStudents();
        if (res.data.success && res.data.data.length > 0) {
          setStudents(res.data.data);
          setSelectedStudentId(res.data.data[0]._id || res.data.data[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadStudents();
  }, []);

  const fetchPerformance = async () => {
    if (!selectedStudentId) return;
    setLoading(true);
    try {
      const res = await api.getStudentPerformance(selectedStudentId);
      if (res.data.success) {
        setPerformanceData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, [selectedStudentId]);

  const metrics = performanceData?.metrics || {
    attendanceRate: 100,
    hwCompletionRate: 100,
    averageMark: 85,
    latestRank: 1,
    feeStatus: 'Fully Paid'
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '90px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: colors.text }}>
          {t('studentPerformance')}
        </h2>
        <div style={{ fontSize: '12px', color: colors.textMuted }}>
          Multi-metric progress analytics & subject strength analysis
        </div>
      </div>

      {/* Student Selector */}
      <div style={{ backgroundColor: colors.surface, borderRadius: '16px', padding: '12px', border: `1px solid ${colors.border}` }}>
        <label style={{ fontSize: '11px', fontWeight: '700', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>
          SELECT STUDENT
        </label>
        <select
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '10px',
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.surfaceSubtle,
            color: colors.text,
            fontSize: '13px',
            fontWeight: '600',
            outline: 'none'
          }}
        >
          {students.map(s => (
            <option key={s._id || s.id} value={s._id || s.id}>
              {s.fullName} ({s.studentId} - {s.grade})
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px', color: colors.textMuted }}>{t('loading')}</div>
      ) : (
        <>
          {/* Key Metric Gauges */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div style={{ backgroundColor: colors.surface, padding: '14px', borderRadius: '16px', border: `1px solid ${colors.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: colors.textMuted, fontWeight: '600' }}>
                <CalendarCheck2 size={14} color="#10B981" /> Attendance
              </div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: metrics.attendanceRate >= 75 ? '#10B981' : '#EF4444', marginTop: '4px' }}>
                {metrics.attendanceRate}%
              </div>
            </div>

            <div style={{ backgroundColor: colors.surface, padding: '14px', borderRadius: '16px', border: `1px solid ${colors.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: colors.textMuted, fontWeight: '600' }}>
                <Award size={14} color="#6366F1" /> Exam Average
              </div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: colors.text, marginTop: '4px' }}>
                {metrics.averageMark}%
                <span style={{ fontSize: '12px', color: colors.primaryLight, marginLeft: '6px' }}>(Rank #{metrics.latestRank})</span>
              </div>
            </div>

            <div style={{ backgroundColor: colors.surface, padding: '14px', borderRadius: '16px', border: `1px solid ${colors.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: colors.textMuted, fontWeight: '600' }}>
                <FileCheck2 size={14} color="#06B6D4" /> Homework
              </div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#06B6D4', marginTop: '4px' }}>
                {metrics.hwCompletionRate}%
              </div>
            </div>

            <div style={{ backgroundColor: colors.surface, padding: '14px', borderRadius: '16px', border: `1px solid ${colors.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: colors.textMuted, fontWeight: '600' }}>
                <CheckCircle2 size={14} color="#F59E0B" /> Fee Status
              </div>
              <div style={{ fontSize: '14px', fontWeight: '800', color: colors.text, marginTop: '8px' }}>
                <Badge variant={metrics.feeStatus === 'Fully Paid' ? 'present' : 'warning'}>
                  {metrics.feeStatus}
                </Badge>
              </div>
            </div>
          </div>

          {/* Line Chart: Marks Over Time */}
          <div style={{ backgroundColor: colors.surface, borderRadius: '18px', padding: '18px', border: `1px solid ${colors.border}`, boxShadow: colors.cardShadow }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: colors.text, marginBottom: '10px' }}>
              {t('examProgression')}
            </h3>
            <ProgressLineChart data={performanceData?.examProgression || []} />
          </div>

          {/* Strengths & Weaknesses Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
            {/* Strengths */}
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', borderRadius: '16px', padding: '14px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#10B981', marginBottom: '8px' }}>
                <Zap size={15} /> {t('strengths')}
              </div>
              {(!performanceData?.strengths || performanceData.strengths.length === 0) ? (
                <div style={{ fontSize: '12px', color: colors.textMuted }}>No strengths noted yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {performanceData.strengths.map((st, i) => (
                    <div key={i} style={{ fontSize: '12px', color: colors.text, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                      <strong>{st.subject}:</strong> {st.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Areas Needing Practice */}
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', borderRadius: '16px', padding: '14px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#EF4444', marginBottom: '8px' }}>
                <AlertTriangle size={15} /> {t('areasToImprove')}
              </div>
              {(!performanceData?.weakAreas || performanceData.weakAreas.length === 0) ? (
                <div style={{ fontSize: '12px', color: colors.textMuted }}>All subjects in healthy ranges. Keep challenging with model tests!</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {performanceData.weakAreas.map((w, i) => (
                    <div key={i} style={{ fontSize: '12px', color: colors.text, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                      <strong>{w.subject}:</strong> {w.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PerformanceScreen;
