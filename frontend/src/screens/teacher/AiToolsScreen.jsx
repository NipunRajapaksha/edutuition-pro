import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/client';
import Badge from '../../components/Badge';
import {
  Sparkles,
  BrainCircuit,
  FileQuestion,
  HelpCircle,
  FileText,
  AlertTriangle,
  Send,
  CheckCircle2,
  Copy,
  Download
} from 'lucide-react';

const AiToolsScreen = () => {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('insights'); // 'insights' | 'homework' | 'quiz' | 'paper' | 'risk'

  // Tab 1: Performance Insights
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [insightsResult, setInsightsResult] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Tab 2: Homework Generator
  const [hwGrade, setHwGrade] = useState('Grade 10');
  const [hwSubject, setHwSubject] = useState('Mathematics');
  const [hwTopic, setHwTopic] = useState('Quadratic Equations');
  const [hwDifficulty, setHwDifficulty] = useState('Medium');
  const [hwResult, setHwResult] = useState(null);
  const [loadingHw, setLoadingHw] = useState(false);

  // Tab 3: Quiz Generator
  const [quizSubject, setQuizSubject] = useState('Science');
  const [quizTopic, setQuizTopic] = useState('Chemical Bonding');
  const [quizCount, setQuizCount] = useState(4);
  const [quizResult, setQuizResult] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  // Tab 4: Question Paper Generator
  const [paperGrade, setPaperGrade] = useState('Grade 11');
  const [paperSubject, setPaperSubject] = useState('Mathematics');
  const [paperTerm, setPaperTerm] = useState('Mid-Year Term Evaluation');
  const [paperResult, setPaperResult] = useState(null);
  const [loadingPaper, setLoadingPaper] = useState(false);

  // Tab 5: Risk Detection
  const [riskProfiles, setRiskProfiles] = useState([]);
  const [loadingRisk, setLoadingRisk] = useState(false);

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

  const handleGenerateInsights = async () => {
    if (!selectedStudentId) return;
    setLoadingInsights(true);
    setInsightsResult(null);
    try {
      const res = await api.getAiInsights(selectedStudentId);
      if (res.data.success) {
        setInsightsResult(res.data.data);
      }
    } catch (err) {
      alert('Error generating AI insights');
    } finally {
      setLoadingInsights(false);
    }
  };

  const handleGenerateHomework = async (e) => {
    e.preventDefault();
    setLoadingHw(true);
    setHwResult(null);
    try {
      const res = await api.generateAiHomework({
        grade: hwGrade,
        subject: hwSubject,
        topic: hwTopic,
        difficulty: hwDifficulty
      });
      if (res.data.success) {
        setHwResult(res.data.data);
      }
    } catch (err) {
      alert('Error generating homework');
    } finally {
      setLoadingHw(false);
    }
  };

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    setLoadingQuiz(true);
    setQuizResult(null);
    try {
      const res = await api.generateAiQuiz({
        subject: quizSubject,
        topic: quizTopic,
        count: quizCount
      });
      if (res.data.success) {
        setQuizResult(res.data.data);
      }
    } catch (err) {
      alert('Error generating quiz');
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleGeneratePaper = async (e) => {
    e.preventDefault();
    setLoadingPaper(true);
    setPaperResult(null);
    try {
      const res = await api.generateAiQuestionPaper({
        grade: paperGrade,
        subject: paperSubject,
        term: paperTerm
      });
      if (res.data.success) {
        setPaperResult(res.data.data);
      }
    } catch (err) {
      alert('Error generating question paper');
    } finally {
      setLoadingPaper(false);
    }
  };

  const handleRunRiskDetection = async () => {
    setLoadingRisk(true);
    try {
      const res = await api.detectAiRisk();
      if (res.data.success) {
        setRiskProfiles(res.data.data);
      }
    } catch (err) {
      alert('Error detecting student risk');
    } finally {
      setLoadingRisk(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'risk') {
      handleRunRiskDetection();
    }
  }, [activeTab]);

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '90px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BrainCircuit size={22} />
        </div>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: colors.text }}>
            {t('aiAssistant')}
          </h2>
          <div style={{ fontSize: '12px', color: colors.textMuted }}>
            Diagnostic insights, auto-generators & at-risk student detector
          </div>
        </div>
      </div>

      {/* Feature Navigation Tabs */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { id: 'insights', label: 'Insights', icon: Sparkles },
          { id: 'homework', label: 'Homework Gen', icon: FileText },
          { id: 'quiz', label: 'Quiz Gen', icon: HelpCircle },
          { id: 'paper', label: 'Paper Gen', icon: FileQuestion },
          { id: 'risk', label: 'Risk Detector', icon: AlertTriangle }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '20px',
                backgroundColor: isActive ? '#8B5CF6' : colors.surface,
                color: isActive ? '#FFFFFF' : colors.textMuted,
                border: `1px solid ${isActive ? '#8B5CF6' : colors.border}`,
                fontSize: '12px',
                fontWeight: isActive ? '700' : '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: AI Student Performance Insights */}
      {activeTab === 'insights' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ backgroundColor: colors.surface, borderRadius: '18px', padding: '16px', border: `1px solid ${colors.border}` }}>
            <label style={{ fontSize: '11px', fontWeight: '700', color: colors.textMuted, display: 'block', marginBottom: '6px' }}>
              SELECT STUDENT TO DIAGNOSE
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surfaceSubtle,
                  color: colors.text,
                  fontSize: '13px',
                  fontWeight: '600'
                }}
              >
                {students.map(s => (
                  <option key={s._id || s.id} value={s._id || s.id}>
                    {s.fullName} ({s.studentId})
                  </option>
                ))}
              </select>

              <button
                onClick={handleGenerateInsights}
                disabled={loadingInsights}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  backgroundColor: '#8B5CF6',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Sparkles size={14} />
                {loadingInsights ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
          </div>

          {insightsResult && (
            <div
              style={{
                backgroundColor: colors.surface,
                borderRadius: '18px',
                padding: '18px',
                border: `1px solid ${colors.border}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                boxShadow: colors.cardShadow
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '15px', fontWeight: '800', color: colors.text }}>
                  Academic Diagnosis: {insightsResult.student.name}
                </div>
                <Badge variant="present">{insightsResult.student.grade}</Badge>
              </div>

              {/* Summary quote */}
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
                  borderLeft: '4px solid #8B5CF6',
                  fontSize: '13px',
                  color: colors.text,
                  lineHeight: 1.4
                }}
              >
                "{insightsResult.summary}"
              </div>

              {/* Observations */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#10B981', marginBottom: '6px' }}>
                  KEY OBSERVATIONS:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {insightsResult.observations.map((obs, i) => (
                    <div key={i} style={{ fontSize: '12px', color: colors.text, display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                      <span style={{ color: '#10B981' }}>✓</span>
                      <span>{obs}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#8B5CF6', marginBottom: '6px' }}>
                  TEACHER INTERVENTION RECOMMENDATIONS:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {insightsResult.recommendations.map((rec, i) => (
                    <div key={i} style={{ fontSize: '12px', color: colors.text, display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                      <span style={{ color: '#8B5CF6' }}>➜</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AI Homework Generator */}
      {activeTab === 'homework' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <form onSubmit={handleGenerateHomework} style={{ backgroundColor: colors.surface, borderRadius: '18px', padding: '16px', border: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>
                  Grade
                </label>
                <select
                  value={hwGrade}
                  onChange={(e) => setHwGrade(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
                >
                  <option>Grade 9</option>
                  <option>Grade 10</option>
                  <option>Grade 11</option>
                  <option>A/L</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>
                  Subject
                </label>
                <input
                  type="text"
                  value={hwSubject}
                  onChange={(e) => setHwSubject(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>
                Topic / Lesson
              </label>
              <input
                type="text"
                value={hwTopic}
                onChange={(e) => setHwTopic(e.target.value)}
                placeholder="e.g. Quadratic Equations, Newton Laws..."
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>
                  Difficulty
                </label>
                <select
                  value={hwDifficulty}
                  onChange={(e) => setHwDifficulty(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={loadingHw}
                  style={{
                    width: '100%',
                    padding: '9px',
                    borderRadius: '8px',
                    backgroundColor: colors.primary,
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Sparkles size={14} />
                  {loadingHw ? 'Generating...' : 'Generate Questions'}
                </button>
              </div>
            </div>
          </form>

          {hwResult && (
            <div style={{ backgroundColor: colors.surface, borderRadius: '18px', padding: '18px', border: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ borderBottom: `1px solid ${colors.border}`, paddingBottom: '10px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: colors.text }}>
                  {hwResult.title}
                </h3>
                <div style={{ fontSize: '11px', color: colors.primaryLight, marginTop: '2px' }}>
                  {hwResult.difficulty} Difficulty • Total Marks: {hwResult.totalMarks}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {hwResult.questions.map((q, i) => (
                  <div key={i} style={{ backgroundColor: colors.surfaceSubtle, padding: '12px', borderRadius: '10px', border: `1px solid ${colors.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', color: colors.text }}>
                      <span>Q{i + 1}.</span>
                      <span style={{ color: '#10B981' }}>{q.marks} Marks</span>
                    </div>
                    <p style={{ fontSize: '13px', color: colors.text, marginTop: '4px' }}>
                      {q.q}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: '11px', color: colors.textMuted, fontStyle: 'italic', backgroundColor: colors.surfaceSubtle, padding: '8px 12px', borderRadius: '8px' }}>
                <strong>Marking Guide:</strong> {hwResult.markingGuide}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AI Quiz Generator */}
      {activeTab === 'quiz' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <form onSubmit={handleGenerateQuiz} style={{ backgroundColor: colors.surface, borderRadius: '18px', padding: '16px', border: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>
                  Subject
                </label>
                <input
                  type="text"
                  value={quizSubject}
                  onChange={(e) => setQuizSubject(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>
                  Questions Count
                </label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={quizCount}
                  onChange={(e) => setQuizCount(Number(e.target.value))}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>
                Topic
              </label>
              <input
                type="text"
                value={quizTopic}
                onChange={(e) => setQuizTopic(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
              />
            </div>

            <button
              type="submit"
              disabled={loadingQuiz}
              style={{
                padding: '10px',
                borderRadius: '10px',
                backgroundColor: '#06B6D4',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <HelpCircle size={15} />
              {loadingQuiz ? 'Generating...' : 'Generate MCQ Assessment'}
            </button>
          </form>

          {quizResult && (
            <div style={{ backgroundColor: colors.surface, borderRadius: '18px', padding: '18px', border: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: colors.text }}>
                {quizResult.title}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {quizResult.quizQuestions.map((q, i) => (
                  <div key={q.id} style={{ backgroundColor: colors.surfaceSubtle, borderRadius: '12px', padding: '12px', border: `1px solid ${colors.border}` }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: colors.text, marginBottom: '8px' }}>
                      {i + 1}. {q.question}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '6px' }}>
                      {q.options.map((opt, optIndex) => {
                        const isCorrect = opt === q.correctAnswer;
                        return (
                          <div
                            key={optIndex}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '8px',
                              backgroundColor: isCorrect ? 'rgba(16, 185, 129, 0.15)' : colors.surface,
                              border: `1px solid ${isCorrect ? '#10B981' : colors.border}`,
                              fontSize: '12px',
                              color: isCorrect ? '#10B981' : colors.text,
                              fontWeight: isCorrect ? '700' : '400'
                            }}
                          >
                            {String.fromCharCode(65 + optIndex)}) {opt} {isCorrect && '✓ (Correct)'}
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '8px', fontStyle: 'italic' }}>
                      <strong>Explanation:</strong> {q.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: AI Question Paper Generator */}
      {activeTab === 'paper' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <form onSubmit={handleGeneratePaper} style={{ backgroundColor: colors.surface, borderRadius: '18px', padding: '16px', border: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>
                  Grade
                </label>
                <input
                  type="text"
                  value={paperGrade}
                  onChange={(e) => setPaperGrade(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>
                  Subject
                </label>
                <input
                  type="text"
                  value={paperSubject}
                  onChange={(e) => setPaperSubject(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>
                Examination Title / Term
              </label>
              <input
                type="text"
                value={paperTerm}
                onChange={(e) => setPaperTerm(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
              />
            </div>

            <button
              type="submit"
              disabled={loadingPaper}
              style={{
                padding: '10px',
                borderRadius: '10px',
                backgroundColor: '#EF4444',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <FileQuestion size={15} />
              {loadingPaper ? 'Synthesizing...' : 'Generate Full Exam Paper'}
            </button>
          </form>

          {paperResult && (
            <div style={{ backgroundColor: '#FFFFFF', color: '#111827', borderRadius: '18px', padding: '24px', boxShadow: colors.cardShadow, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Paper Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #111827', paddingBottom: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: '800' }}>{paperResult.header.institute}</div>
                <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '2px' }}>{paperResult.header.examination}</div>
                <div style={{ fontSize: '12px', color: '#4B5563', marginTop: '4px' }}>
                  Duration: {paperResult.header.duration} • Total Marks: {paperResult.header.totalMarks}
                </div>
              </div>

              {/* Part A */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: '800', borderBottom: '1px solid #E5E7EB', paddingBottom: '4px', marginBottom: '8px' }}>
                  {paperResult.partA.title}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {paperResult.partA.questions.map(q => (
                    <div key={q.num} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span><strong>({q.num})</strong> {q.text}</span>
                      <span style={{ fontWeight: '700', color: '#4B5563' }}>[{q.marks} m]</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Part B */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: '800', borderBottom: '1px solid #E5E7EB', paddingBottom: '4px', marginBottom: '8px' }}>
                  {paperResult.partB.title}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {paperResult.partB.questions.map(q => (
                    <div key={q.num} style={{ fontSize: '12px' }}>
                      <div style={{ fontWeight: '800', color: '#4F46E5', marginBottom: '2px' }}>
                        Question {q.num}: {q.title} [{q.marks} Marks]
                      </div>
                      <p style={{ lineHeight: 1.4 }}>{q.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: AI Student Risk Detection */}
      {activeTab === 'risk' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', padding: '14px', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={16} /> Academic Risk Intelligence
              </div>
              <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '2px' }}>
                Flags attendance &lt; 75%, failing test marks, or persistent missed assignments.
              </div>
            </div>
            <button
              onClick={handleRunRiskDetection}
              disabled={loadingRisk}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                color: colors.text,
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {loadingRisk ? 'Scanning...' : 'Re-Scan'}
            </button>
          </div>

          {loadingRisk ? (
            <div style={{ textAlign: 'center', padding: '30px', color: colors.textMuted }}>{t('loading')}</div>
          ) : riskProfiles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', backgroundColor: colors.surface, borderRadius: '16px', border: `1px solid ${colors.border}`, color: '#10B981', fontWeight: '700', fontSize: '13px' }}>
              ✓ All active students are currently in healthy academic standing!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {riskProfiles.map(st => (
                <div
                  key={st.studentId}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: '16px',
                    padding: '16px',
                    border: `1px solid ${st.riskLevel === 'High' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(245, 158, 11, 0.5)'}`,
                    boxShadow: colors.cardShadow,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={st.photo}
                        alt={st.fullName}
                        style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: colors.text }}>
                          {st.fullName}
                        </div>
                        <div style={{ fontSize: '11px', color: colors.textMuted }}>
                          {st.code} • {st.grade}
                        </div>
                      </div>
                    </div>

                    <Badge variant={st.riskLevel === 'High' ? 'danger' : 'warning'}>
                      {st.riskLevel} Risk
                    </Badge>
                  </div>

                  {/* Indicators */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', backgroundColor: colors.surfaceSubtle, padding: '8px', borderRadius: '10px', textAlign: 'center', fontSize: '11px' }}>
                    <div>
                      <div style={{ color: colors.textMuted }}>Attendance</div>
                      <div style={{ fontWeight: '800', color: st.attendanceRate < 75 ? '#EF4444' : '#10B981' }}>
                        {st.attendanceRate}%
                      </div>
                    </div>
                    <div>
                      <div style={{ color: colors.textMuted }}>Test Avg</div>
                      <div style={{ fontWeight: '800', color: st.averageMark < 50 ? '#EF4444' : '#10B981' }}>
                        {st.averageMark}%
                      </div>
                    </div>
                    <div>
                      <div style={{ color: colors.textMuted }}>Homework</div>
                      <div style={{ fontWeight: '800', color: st.homeworkCompletionRate < 60 ? '#EF4444' : '#10B981' }}>
                        {st.homeworkCompletionRate}%
                      </div>
                    </div>
                  </div>

                  {/* Warning Flags */}
                  <div style={{ fontSize: '11px', color: '#EF4444' }}>
                    {st.flags.map((f, i) => (
                      <div key={i}>• {f}</div>
                    ))}
                  </div>

                  {/* AI Suggestions */}
                  <div style={{ backgroundColor: 'rgba(139, 92, 246, 0.08)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.2)', fontSize: '11px', color: colors.text }}>
                    <strong style={{ color: '#8B5CF6' }}>AI Suggestion:</strong> {st.suggestions[0]}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AiToolsScreen;
