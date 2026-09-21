import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/client';
import {
  FileSpreadsheet,
  Printer,
  Download,
  FileText,
  DollarSign,
  Users,
  BookOpen
} from 'lucide-react';

const ReportsScreen = () => {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const [reportType, setReportType] = useState('financial'); // 'financial' | 'student' | 'class'
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPrereqs = async () => {
      try {
        const [stuRes, clsRes] = await Promise.all([api.getStudents(), api.getClasses()]);
        if (stuRes.data.success && stuRes.data.data.length > 0) {
          setStudents(stuRes.data.data);
          setSelectedStudentId(stuRes.data.data[0]._id || stuRes.data.data[0].id);
        }
        if (clsRes.data.success && clsRes.data.data.length > 0) {
          setClasses(clsRes.data.data);
          setSelectedClassId(clsRes.data.data[0]._id || clsRes.data.data[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadPrereqs();
  }, []);

  const handleGenerateReport = async () => {
    setLoading(true);
    setReportData(null);
    try {
      if (reportType === 'financial') {
        const res = await api.getFinancialReport(2026);
        if (res.data.success) setReportData({ type: 'financial', data: res.data.data });
      } else if (reportType === 'student' && selectedStudentId) {
        const res = await api.getStudentReport(selectedStudentId);
        if (res.data.success) setReportData({ type: 'student', data: res.data.report });
      } else if (reportType === 'class' && selectedClassId) {
        const res = await api.getClassReport(selectedClassId);
        if (res.data.success) setReportData({ type: 'class', data: res.data.report });
      }
    } catch (err) {
      alert('Error fetching report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGenerateReport();
  }, [reportType, selectedStudentId, selectedClassId]);

  const handleExportCsv = () => {
    let url = 'http://localhost:5000/api/reports/financial?format=csv';
    if (reportType === 'student' && selectedStudentId) {
      url = `http://localhost:5000/api/reports/student/${selectedStudentId}?format=csv`;
    } else if (reportType === 'class' && selectedClassId) {
      url = `http://localhost:5000/api/reports/class/${selectedClassId}?format=csv`;
    }
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '90px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: colors.text }}>
            {t('navReports')}
          </h2>
          <div style={{ fontSize: '12px', color: colors.textMuted }}>
            Generate and export printable & CSV reports
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleExportCsv}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 12px',
              borderRadius: '10px',
              backgroundColor: colors.surfaceSubtle,
              border: `1px solid ${colors.border}`,
              color: colors.text,
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <Download size={14} color="#10B981" /> CSV
          </button>
          <button
            onClick={handlePrint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 12px',
              borderRadius: '10px',
              backgroundColor: colors.primary,
              color: '#FFFFFF',
              border: 'none',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* Select Report Type */}
      <div style={{ display: 'flex', gap: '8px', backgroundColor: colors.surfaceSubtle, borderRadius: '12px', padding: '4px', border: `1px solid ${colors.border}` }}>
        <button
          onClick={() => setReportType('financial')}
          style={{
            flex: 1,
            padding: '8px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: reportType === 'financial' ? colors.primary : 'transparent',
            color: reportType === 'financial' ? '#FFFFFF' : colors.textMuted,
            fontWeight: '700',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Financial
        </button>
        <button
          onClick={() => setReportType('student')}
          style={{
            flex: 1,
            padding: '8px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: reportType === 'student' ? colors.primary : 'transparent',
            color: reportType === 'student' ? '#FFFFFF' : colors.textMuted,
            fontWeight: '700',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Student
        </button>
        <button
          onClick={() => setReportType('class')}
          style={{
            flex: 1,
            padding: '8px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: reportType === 'class' ? colors.primary : 'transparent',
            color: reportType === 'class' ? '#FFFFFF' : colors.textMuted,
            fontWeight: '700',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Class
        </button>
      </div>

      {/* Selector Dropdowns */}
      {reportType === 'student' && (
        <div style={{ backgroundColor: colors.surface, padding: '12px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
          <label style={{ fontSize: '11px', fontWeight: '700', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>
            SELECT STUDENT
          </label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
          >
            {students.map(s => (
              <option key={s._id || s.id} value={s._id || s.id}>
                {s.fullName} ({s.studentId})
              </option>
            ))}
          </select>
        </div>
      )}

      {reportType === 'class' && (
        <div style={{ backgroundColor: colors.surface, padding: '12px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
          <label style={{ fontSize: '11px', fontWeight: '700', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>
            SELECT CLASS
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
          >
            {classes.map(c => (
              <option key={c._id || c.id} value={c._id || c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Printable Report Output Card */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px', color: colors.textMuted }}>{t('loading')}</div>
      ) : !reportData ? (
        <div style={{ textAlign: 'center', padding: '30px', color: colors.textMuted }}>No report data generated.</div>
      ) : (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            color: '#111827',
            borderRadius: '18px',
            padding: '24px',
            boxShadow: colors.cardShadow,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
          id="printable-report-card"
        >
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #111827', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>APEX TUITION ACADEMY</h3>
            <div style={{ fontSize: '12px', color: '#4B5563' }}>ශිල්ප කලා උසස් අධ්‍යාපන ආයතනය</div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#4F46E5', marginTop: '6px', textTransform: 'uppercase' }}>
              Official {reportType} Evaluation Report
            </div>
            <div style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '2px' }}>
              Generated: {new Date().toLocaleDateString()}
            </div>
          </div>

          {/* FINANCIAL REPORT VIEW */}
          {reportData.type === 'financial' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px', textAlign: 'center', backgroundColor: '#F9FAFB', padding: '12px', borderRadius: '10px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#6B7280' }}>Total Expected</div>
                  <div style={{ fontSize: '14px', fontWeight: '800' }}>Rs. {(reportData.data.summary.totalExpected || 0).toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#059669' }}>Total Collected</div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#059669' }}>Rs. {(reportData.data.summary.totalCollected || 0).toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#DC2626' }}>Pending Balance</div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#DC2626' }}>Rs. {(reportData.data.summary.totalPending || 0).toLocaleString()}</div>
                </div>
              </div>

              <div style={{ fontSize: '12px', fontWeight: '800', marginBottom: '8px' }}>Recent Payment Transactions:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                {(reportData.data.transactions || []).map((txn, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderBottom: '1px solid #F3F4F6' }}>
                    <span>{txn.receiptNumber} • {txn.student} ({txn.class})</span>
                    <strong style={{ color: '#059669' }}>Rs. {Number(txn.amountPaid).toLocaleString()}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STUDENT REPORT VIEW */}
          {reportData.type === 'student' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px', marginBottom: '14px', backgroundColor: '#F9FAFB', padding: '12px', borderRadius: '10px' }}>
                <div>
                  <div><strong>Student:</strong> {reportData.data.student.fullName}</div>
                  <div><strong>ID:</strong> {reportData.data.student.studentId}</div>
                  <div><strong>Grade:</strong> {reportData.data.student.grade}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div><strong>Attendance:</strong> {reportData.data.summary.attendancePercentage}%</div>
                  <div><strong>Exam Average:</strong> {reportData.data.summary.averageExamMark}%</div>
                  <div><strong>Fee Balance:</strong> Rs. {reportData.data.summary.feeBalance}</div>
                </div>
              </div>

              <div style={{ fontSize: '12px', fontWeight: '800', marginBottom: '8px' }}>Exam Scores:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                {(reportData.data.exams || []).map((ex, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderBottom: '1px solid #F3F4F6' }}>
                    <span>{ex.examName} ({ex.subject})</span>
                    <span><strong>{ex.marksObtained}/{ex.totalMarks}</strong> ({ex.percentage}%, Grade {ex.grade}, Rank {ex.rank})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CLASS REPORT VIEW */}
          {reportData.type === 'class' && (
            <div>
              <div style={{ fontSize: '13px', fontWeight: '800', marginBottom: '4px' }}>
                {reportData.data.class.name} ({reportData.data.class.subject})
              </div>
              <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '12px' }}>
                Total Enrolled Students: {reportData.data.studentCount} • Fee Collected: Rs. {Number(reportData.data.totalCollected).toLocaleString()}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                {(reportData.data.students || []).map((s, i) => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderBottom: '1px solid #F3F4F6' }}>
                    <span>{i + 1}. {s.name} ({s.code})</span>
                    <span style={{ color: '#4F46E5' }}>{s.phone}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsScreen;
