import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/client';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

// 1. Add Student Modal
export const AddStudentModal = ({ onClose, onSuccess }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    grade: 'Grade 10',
    school: '',
    parentName: '',
    parentPhone: '',
    address: '',
    enrolledClasses: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getClasses().then(res => {
      if (res.data.success) setClasses(res.data.data);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.createStudent(formData);
      if (res.data.success) {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
        onSuccess(res.data.data);
        onClose();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating student');
    } finally {
      setLoading(false);
    }
  };

  const toggleClass = (cId) => {
    setFormData(prev => ({
      ...prev,
      enrolledClasses: prev.enrolledClasses.includes(cId)
        ? prev.enrolledClasses.filter(id => id !== cId)
        : [...prev.enrolledClasses, cId]
    }));
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '440px', backgroundColor: colors.surface, borderRadius: '20px', padding: '20px', border: `1px solid ${colors.border}`, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: colors.text }}>Enroll New Student</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Student Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Kasun Bandara"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Grade *</label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
              >
                <option>Grade 9</option>
                <option>Grade 10</option>
                <option>Grade 11</option>
                <option>A/L</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Student Phone</label>
              <input
                type="text"
                placeholder="077xxxxxxx"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>School</label>
            <input
              type="text"
              placeholder="e.g. Ananda College"
              value={formData.school}
              onChange={(e) => setFormData({ ...formData, school: e.target.value })}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Parent / Guardian Name</label>
              <input
                type="text"
                placeholder="e.g. Sunil Bandara"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Parent Phone</label>
              <input
                type="text"
                placeholder="071xxxxxxx"
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
              />
            </div>
          </div>

          {/* Enrolled Classes */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Assign Classes</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '100px', overflowY: 'auto' }}>
              {classes.map(c => (
                <label key={c._id || c.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: colors.text, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.enrolledClasses.includes(c._id || c.id)}
                    onChange={() => toggleClass(c._id || c.id)}
                  />
                  <span>{c.name} (Rs. {c.monthlyFee})</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: '10px', backgroundColor: colors.surfaceSubtle, border: `1px solid ${colors.border}`, color: colors.text, fontWeight: '600' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px', borderRadius: '10px', backgroundColor: colors.primary, color: '#FFFFFF', border: 'none', fontWeight: '700' }}>{loading ? 'Enrolling...' : 'Enroll Student'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 2. Record Payment Modal
export const RecordPaymentModal = ({ onClose, onSuccess }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [month, setMonth] = useState('April');
  const [year, setYear] = useState(2026);
  const [amountDue, setAmountDue] = useState('2500');
  const [amountPaid, setAmountPaid] = useState('2500');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([api.getStudents(), api.getClasses()]).then(([sRes, cRes]) => {
      if (sRes.data.success && sRes.data.data.length > 0) {
        setStudents(sRes.data.data);
        setSelectedStudentId(sRes.data.data[0]._id || sRes.data.data[0].id);
      }
      if (cRes.data.success && cRes.data.data.length > 0) {
        setClasses(cRes.data.data);
        setSelectedClassId(cRes.data.data[0]._id || cRes.data.data[0].id);
        setAmountDue(String(cRes.data.data[0].monthlyFee || 2500));
        setAmountPaid(String(cRes.data.data[0].monthlyFee || 2500));
      }
    });
  }, []);

  const handleClassChange = (cId) => {
    setSelectedClassId(cId);
    const cls = classes.find(c => (c._id || c.id) === cId);
    if (cls) {
      setAmountDue(String(cls.monthlyFee || 2500));
      setAmountPaid(String(cls.monthlyFee || 2500));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.recordPayment({
        studentId: selectedStudentId,
        classId: selectedClassId,
        month,
        year: Number(year),
        amountDue: Number(amountDue),
        amountPaid: Number(amountPaid),
        paymentMethod
      });
      if (res.data.success) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        onSuccess(res.data.data);
        onClose();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording payment');
    } finally {
      setLoading(false);
    }
  };

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '420px', backgroundColor: colors.surface, borderRadius: '20px', padding: '20px', border: `1px solid ${colors.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: colors.text }}>Record Tuition Payment</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Student</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
            >
              {students.map(s => <option key={s._id || s.id} value={s._id || s.id}>{s.fullName} ({s.studentId})</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Class</label>
            <select
              value={selectedClassId}
              onChange={(e) => handleClassChange(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
            >
              {classes.map(c => <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
              >
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="online">Online Payment</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Fee Due (Rs.)</label>
              <input
                type="number"
                value={amountDue}
                onChange={(e) => setAmountDue(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Paid Now (Rs.)</label>
              <input
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: '10px', backgroundColor: colors.surfaceSubtle, border: `1px solid ${colors.border}`, color: colors.text, fontWeight: '600' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px', borderRadius: '10px', backgroundColor: colors.primary, color: '#FFFFFF', border: 'none', fontWeight: '700' }}>{loading ? 'Recording...' : 'Issue Receipt'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 3. Add Homework Modal
export const AddHomeworkModal = ({ onClose, onSuccess }) => {
  const { colors } = useTheme();
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    classId: '',
    title: '',
    description: '',
    deadline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    totalMarks: 100
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getClasses().then(res => {
      if (res.data.success && res.data.data.length > 0) {
        setClasses(res.data.data);
        setFormData(prev => ({ ...prev, classId: res.data.data[0]._id || res.data.data[0].id }));
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.createHomework(formData);
      if (res.data.success) {
        onSuccess(res.data.data);
        onClose();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding homework');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '420px', backgroundColor: colors.surface, borderRadius: '20px', padding: '20px', border: `1px solid ${colors.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: colors.text }}>Assign New Homework</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Class *</label>
            <select
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              style={{ width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
            >
              {classes.map(c => <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Quadratic Equations Practice Set"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Instructions</label>
            <textarea
              rows="3"
              placeholder="Questions to solve, textbook pages, etc."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Deadline *</label>
              <input
                type="date"
                required
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Total Marks</label>
              <input
                type="number"
                value={formData.totalMarks}
                onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: '10px', backgroundColor: colors.surfaceSubtle, border: `1px solid ${colors.border}`, color: colors.text, fontWeight: '600' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px', borderRadius: '10px', backgroundColor: colors.primary, color: '#FFFFFF', border: 'none', fontWeight: '700' }}>{loading ? 'Creating...' : 'Assign Homework'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 4. Create Exam Modal
export const CreateExamModal = ({ onClose, onSuccess }) => {
  const { colors } = useTheme();
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    classId: '',
    name: '',
    type: 'monthly_test',
    date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    totalMarks: 100
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getClasses().then(res => {
      if (res.data.success && res.data.data.length > 0) {
        setClasses(res.data.data);
        setFormData(prev => ({ ...prev, classId: res.data.data[0]._id || res.data.data[0].id }));
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.createExam(formData);
      if (res.data.success) {
        onSuccess(res.data.data);
        onClose();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '420px', backgroundColor: colors.surface, borderRadius: '20px', padding: '20px', border: `1px solid ${colors.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: colors.text }}>Create Examination</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Class *</label>
            <select
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              style={{ width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
            >
              {classes.map(c => <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Exam Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Monthly Test - Algebra & Functions"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Exam Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
              >
                <option value="monthly_test">Monthly Test</option>
                <option value="term_test">Term Test</option>
                <option value="model_paper">Model Paper</option>
                <option value="class_test">Class Test</option>
                <option value="final_exam">Final Exam</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Total Marks</label>
              <input
                type="number"
                value={formData.totalMarks}
                onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Exam Date *</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              style={{ width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: '10px', backgroundColor: colors.surfaceSubtle, border: `1px solid ${colors.border}`, color: colors.text, fontWeight: '600' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px', borderRadius: '10px', backgroundColor: colors.primary, color: '#FFFFFF', border: 'none', fontWeight: '700' }}>{loading ? 'Creating...' : 'Schedule Exam'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 5. Send Notice Modal
export const SendNoticeModal = ({ onClose, onSuccess }) => {
  const { colors } = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetType: 'all',
    priority: 'normal'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.createAnnouncement(formData);
      if (res.data.success) {
        onSuccess(res.data.data);
        onClose();
      }
    } catch (err) {
      alert('Error broadcasting announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '420px', backgroundColor: colors.surface, borderRadius: '20px', padding: '20px', border: `1px solid ${colors.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: colors.text }}>Broadcast Notice</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Saturday Special Revision Class at 8:00 AM"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Content Message *</label>
            <textarea
              rows="4"
              required
              placeholder="Write the announcement description..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Target Audience</label>
              <select
                value={formData.targetType}
                onChange={(e) => setFormData({ ...formData, targetType: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
              >
                <option value="all">All Students & Parents</option>
                <option value="parents">Parents Only</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: '10px', backgroundColor: colors.surfaceSubtle, border: `1px solid ${colors.border}`, color: colors.text, fontWeight: '600' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px', borderRadius: '10px', backgroundColor: colors.primary, color: '#FFFFFF', border: 'none', fontWeight: '700' }}>{loading ? 'Sending...' : 'Publish Announcement'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 6. Add Class Modal
export const AddClassModal = ({ onClose, onSuccess }) => {
  const { colors } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    subject: 'Mathematics',
    grade: 'Grade 10',
    teacherName: 'Master N. Perera',
    location: 'Main Hall',
    dayOfWeek: 'Saturday',
    startTime: '08:00',
    endTime: '10:00',
    monthlyFee: 2500,
    maxStudents: 60,
    color: '#3B82F6'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.createClass(formData);
      if (res.data.success) {
        onSuccess(res.data.data);
        onClose();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '420px', backgroundColor: colors.surface, borderRadius: '20px', padding: '20px', border: `1px solid ${colors.border}`, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: colors.text }}>Create Tuition Class</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Class Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Grade 10 Mathematics"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Subject *</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Grade *</label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
              >
                <option>Grade 9</option>
                <option>Grade 10</option>
                <option>Grade 11</option>
                <option>A/L</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Day of Week *</label>
              <select
                value={formData.dayOfWeek}
                onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
              >
                <option>Monday</option>
                <option>Tuesday</option>
                <option>Wednesday</option>
                <option>Thursday</option>
                <option>Friday</option>
                <option>Saturday</option>
                <option>Sunday</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Monthly Fee (Rs.) *</label>
              <input
                type="number"
                required
                value={formData.monthlyFee}
                onChange={(e) => setFormData({ ...formData, monthlyFee: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>End Time</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surfaceSubtle, color: colors.text, fontSize: '12px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: '10px', backgroundColor: colors.surfaceSubtle, border: `1px solid ${colors.border}`, color: colors.text, fontWeight: '600' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px', borderRadius: '10px', backgroundColor: colors.primary, color: '#FFFFFF', border: 'none', fontWeight: '700' }}>{loading ? 'Creating...' : 'Create Class'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
