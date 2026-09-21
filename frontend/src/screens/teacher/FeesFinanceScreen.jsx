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
  Printer
} from 'lucide-react';

const FeesFinanceScreen = ({ onOpenRecordPayment, onViewReceipt }) => {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const [fees, setFees] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

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

              {/* Receipt Action */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${colors.border}`, paddingTop: '10px' }}>
                <div style={{ fontSize: '11px', color: colors.textMuted }}>
                  Receipt: <strong style={{ color: colors.primaryLight }}>{f.receiptNumber}</strong> • Method: {f.paymentMethod}
                </div>

                <button
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
          ))}
        </div>
      )}
    </div>
  );
};

export default FeesFinanceScreen;
