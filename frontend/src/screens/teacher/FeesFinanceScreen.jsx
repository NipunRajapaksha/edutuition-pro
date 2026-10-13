import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/client';
import Badge from '../../components/Badge';
import StatCard from '../../components/StatCard';
import {
  CircleDollarSign,
  Plus,
  Receipt,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Printer,
  Edit2,
  Trash2,
  X
} from 'lucide-react';

const FeesFinanceScreen = ({ onOpenRecordPayment, onViewReceipt }) => {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const [fees, setFees] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Edit Payment State
  const [editingFee, setEditingFee] = useState(null);
  const [editFormData, setEditFormData] = useState({
    amountPaid: '',
    amountDue: '',
    month: 'April',
    year: 2026,
    paymentMethod: 'cash',
    paymentDate: '',
    notes: ''
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const handleOpenEdit = (f) => {
    setEditingFee(f);
    let parsedDate = '';
    if (f.paymentDate) {
      try {
        parsedDate = f.paymentDate.split('T')[0];
      } catch {
        parsedDate = f.paymentDate;
      }
    } else {
      parsedDate = new Date().toISOString().split('T')[0];
    }
    setEditFormData({
      amountPaid: f.amountPaid ?? '',
      amountDue: f.amountDue ?? '',
      month: f.month || 'April',
      year: f.year || new Date().getFullYear(),
      paymentMethod: f.paymentMethod || 'cash',
      paymentDate: parsedDate,
      notes: f.notes || ''
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingFee) return;
    setSavingEdit(true);
    try {
      const res = await api.updateFee(editingFee._id || editingFee.id, editFormData);
      if (res?.data?.success) {
        setEditingFee(null);
        fetchFees();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating payment');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (f) => {
    if (!window.confirm(`Are you sure you want to delete payment receipt #${f.receiptNumber} for ${f.studentName}? This will permanently remove this transaction record.`)) return;
    try {
      const res = await api.deleteFee(f._id || f.id);
      if (res?.data?.success) {
        fetchFees();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting payment');
    }
  };

  const fetchFees = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQ.trim()) params.q = searchQ.trim();
      if (statusFilter !== 'All') params.status = statusFilter;

      const [feeRes, overRes] = await Promise.all([
        api.getFees(params),
        api.getFinancialOverview()
      ]);

      if (feeRes.data.success) setFees(feeRes.data.data);
      if (overRes.data.success) setOverview(overRes.data.data);
    } catch (err) {
      console.error('Error fetching fees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, [statusFilter]);

  const summary = overview?.summary || { totalExpected: 0, totalCollected: 0, totalPending: 0 };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '90px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: colors.text }}>
            {t('navFees')}
          </h2>
          <div style={{ fontSize: '12px', color: colors.textMuted }}>
            Fee collections, balances & digital receipts
          </div>
        </div>

        <button
          onClick={onOpenRecordPayment}
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
          {t('recordPayment')}
        </button>
      </div>

      {/* Financial Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        <div style={{ backgroundColor: colors.surface, padding: '12px', borderRadius: '14px', border: `1px solid ${colors.border}` }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' }}>
            {t('totalExpected')}
          </div>
          <div style={{ fontSize: '15px', fontWeight: '800', color: colors.text, marginTop: '4px' }}>
            Rs. {(summary.totalExpected || 0).toLocaleString()}
          </div>
        </div>

        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '14px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#10B981', textTransform: 'uppercase' }}>
            {t('totalCollected')}
          </div>
          <div style={{ fontSize: '15px', fontWeight: '800', color: '#10B981', marginTop: '4px' }}>
            Rs. {(summary.totalCollected || 0).toLocaleString()}
          </div>
        </div>

        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '14px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#EF4444', textTransform: 'uppercase' }}>
            {t('pendingFees')}
          </div>
          <div style={{ fontSize: '15px', fontWeight: '800', color: '#EF4444', marginTop: '4px' }}>
            Rs. {(summary.totalPending || 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Search & Status Filter */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }}
          />
          <input
            type="text"
            placeholder="Search student, code, or receipt #..."
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchFees()}
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

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '12px',
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.surface,
            color: colors.text,
            fontSize: '12px',
            fontWeight: '600',
            outline: 'none'
          }}
        >
          <option value="All">All Status</option>
          <option value="paid">Paid</option>
          <option value="partially_paid">Partially Paid</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Fee Records List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px', color: colors.textMuted }}>{t('loading')}</div>
      ) : fees.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', backgroundColor: colors.surface, borderRadius: '16px', border: `1px solid ${colors.border}`, color: colors.textMuted }}>
          No fee payment records found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {fees.map(f => (
            <div
              key={f._id || f.id}
              style={{
                backgroundColor: colors.surface,
                borderRadius: '16px',
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
                  <div style={{ fontSize: '14px', fontWeight: '800', color: colors.text }}>
                    {f.studentName}
                  </div>
                  <div style={{ fontSize: '11px', color: colors.textMuted }}>
                    {f.studentCode} • {f.className}
                  </div>
                </div>

                <Badge variant={f.status}>
                  {f.status ? f.status.replace('_', ' ') : 'Pending'}
                </Badge>
              </div>

              {/* Period and Amount */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surfaceSubtle, padding: '8px 12px', borderRadius: '10px', fontSize: '12px' }}>
                <div>
                  <span style={{ color: colors.textMuted }}>Period: </span>
                  <strong style={{ color: colors.text }}>{f.month} {f.year}</strong>
                </div>
                <div>
                  <span style={{ color: colors.textMuted }}>Paid: </span>
                  <strong style={{ color: '#10B981' }}>Rs. {Number(f.amountPaid).toLocaleString()}</strong>
                  {f.balance > 0 && (
                    <span style={{ color: '#EF4444', marginLeft: '6px' }}>
                      (Bal: Rs. {Number(f.balance).toLocaleString()})
                    </span>
                  )}
                </div>
              </div>

              {/* Actions Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${colors.border}`, paddingTop: '10px', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '11px', color: colors.textMuted }}>
                  Receipt: <strong style={{ color: colors.primaryLight }}>{f.receiptNumber}</strong> • Method: {f.paymentMethod}
                </div>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(f)}
                    title="Edit Payment"
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
                    <Edit2 size={12} color={colors.primary} /> Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(f)}
                    title="Delete Payment"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#EF4444',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={12} /> Delete
                  </button>

                  <button
                    type="button"
                    onClick={() => onViewReceipt(f.receiptNumber)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      backgroundColor: colors.surfaceSubtle,
                      border: `1px solid ${colors.border}`,
                      color: colors.text,
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    <Receipt size={13} color="#4F46E5" /> View Receipt
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Payment Modal */}
      {editingFee && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            zIndex: 96,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              backgroundColor: colors.surface,
              borderRadius: '20px',
              padding: '20px',
              border: `1px solid ${colors.border}`,
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: colors.text }}>
                  Edit Fee Payment (ගෙවීම් සංස්කරණය)
                </h3>
                <div style={{ fontSize: '11px', color: colors.textMuted }}>
                  Receipt: {editingFee.receiptNumber} • {editingFee.studentName}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingFee(null)}
                style={{ background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: colors.textMuted, marginBottom: '4px' }}>
                    Amount Paid (ගෙවූ මුදල) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editFormData.amountPaid}
                    onChange={(e) => setEditFormData({ ...editFormData, amountPaid: e.target.value })}
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
                    Total Due (අයවිය යුතු මුදල) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editFormData.amountDue}
                    onChange={(e) => setEditFormData({ ...editFormData, amountDue: e.target.value })}
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

              {/* Month and Year */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: colors.textMuted, marginBottom: '4px' }}>
                    Fee Month (මාසය)
                  </label>
                  <select
                    value={editFormData.month}
                    onChange={(e) => setEditFormData({ ...editFormData, month: e.target.value })}
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
                  >
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: colors.textMuted, marginBottom: '4px' }}>
                    Fee Year (වර්ෂය)
                  </label>
                  <input
                    type="number"
                    value={editFormData.year}
                    onChange={(e) => setEditFormData({ ...editFormData, year: e.target.value })}
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

              {/* Payment Method and Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: colors.textMuted, marginBottom: '4px' }}>
                    Payment Method
                  </label>
                  <select
                    value={editFormData.paymentMethod}
                    onChange={(e) => setEditFormData({ ...editFormData, paymentMethod: e.target.value })}
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
                  >
                    <option value="cash">Cash (මුදල්)</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="online">Online Payment</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: colors.textMuted, marginBottom: '4px' }}>
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={editFormData.paymentDate}
                    onChange={(e) => setEditFormData({ ...editFormData, paymentDate: e.target.value })}
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

              {/* Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: colors.textMuted, marginBottom: '4px' }}>
                  Notes / Remarks (සටහන්)
                </label>
                <input
                  type="text"
                  placeholder="Optional notes"
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
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

              {/* Balance summary */}
              <div style={{ backgroundColor: colors.surfaceSubtle, padding: '10px 12px', borderRadius: '10px', fontSize: '11px', display: 'flex', justifyContent: 'space-between', border: `1px solid ${colors.border}` }}>
                <span style={{ color: colors.textMuted }}>Computed Balance:</span>
                <strong style={{ color: Math.max(0, Number(editFormData.amountDue || 0) - Number(editFormData.amountPaid || 0)) > 0 ? '#EF4444' : '#10B981' }}>
                  Rs. {Math.max(0, Number(editFormData.amountDue || 0) - Number(editFormData.amountPaid || 0)).toLocaleString()}
                </strong>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setEditingFee(null)}
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
                  {t('cancel')}
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
                  {savingEdit ? t('loading') : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeesFinanceScreen;
