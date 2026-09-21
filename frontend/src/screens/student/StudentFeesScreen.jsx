import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/client';
import Badge from '../../components/Badge';
import { Receipt, CircleDollarSign, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const StudentFeesScreen = ({ onViewReceipt }) => {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const [student, setStudent] = useState(null);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  const studentProfileId = user?.studentProfileId || user?.studentProfile?._id;

  useEffect(() => {
    const fetchFees = async () => {
      if (!studentProfileId) return;
      try {
        setLoading(true);
        const [stuRes, feeRes] = await Promise.all([
          api.getStudentById(studentProfileId),
          api.getFees({ studentId: studentProfileId })
        ]);

        if (stuRes.data.success) setStudent(stuRes.data.data);
        if (feeRes.data.success) setFees(feeRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, [studentProfileId]);

  if (loading) {
    return <div style={{ padding: '30px', textAlign: 'center', color: colors.textMuted }}>{t('loading')}</div>;
  }

  const stats = student?.stats || { totalFeeDue: 0, totalFeePaid: 0, pendingBalance: 0 };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '90px' }}>
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: colors.text }}>
          {t('navMyFees')}
        </h2>
        <div style={{ fontSize: '12px', color: colors.textMuted }}>
          Tuition fee payments, outstanding dues & verified digital receipts
        </div>
      </div>

      {/* Summary Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#10B981', textTransform: 'uppercase' }}>
            TOTAL PAID
          </div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#10B981', marginTop: '4px' }}>
            Rs. {(stats.totalFeePaid || 0).toLocaleString()}
          </div>
        </div>

        <div style={{ backgroundColor: stats.pendingBalance > 0 ? 'rgba(239, 68, 68, 0.1)' : colors.surface, padding: '16px', borderRadius: '16px', border: `1px solid ${stats.pendingBalance > 0 ? 'rgba(239, 68, 68, 0.3)' : colors.border}` }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: stats.pendingBalance > 0 ? '#EF4444' : colors.textMuted, textTransform: 'uppercase' }}>
            OUTSTANDING BALANCE
          </div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: stats.pendingBalance > 0 ? '#EF4444' : '#10B981', marginTop: '4px' }}>
            Rs. {(stats.pendingBalance || 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Payment History List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '800', color: colors.text }}>
          Payment Receipts & Invoices
        </h3>

        {fees.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', backgroundColor: colors.surface, borderRadius: '16px', color: colors.textMuted, fontSize: '12px' }}>
            No payment records found.
          </div>
        ) : (
          fees.map(f => (
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
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '800', color: colors.text }}>
                    {f.month} {f.year} Tuition Fee
                  </h4>
                  <div style={{ fontSize: '11px', color: colors.primaryLight, fontWeight: '600', marginTop: '2px' }}>
                    {f.className}
                  </div>
                </div>

                <Badge variant={f.status}>
                  {f.status}
                </Badge>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surfaceSubtle, padding: '8px 12px', borderRadius: '10px', fontSize: '12px' }}>
                <div>
                  <span style={{ color: colors.textMuted }}>Paid: </span>
                  <strong style={{ color: '#10B981' }}>Rs. {Number(f.amountPaid).toLocaleString()}</strong>
                  {f.balance > 0 && (
                    <span style={{ color: '#EF4444', marginLeft: '6px' }}>(Bal: Rs. {f.balance})</span>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: colors.textMuted }}>
                  {f.paymentDate}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${colors.border}`, paddingTop: '8px' }}>
                <span style={{ fontSize: '11px', color: colors.textMuted }}>
                  Receipt: <strong>{f.receiptNumber}</strong>
                </span>

                <button
                  onClick={() => onViewReceipt(f.receiptNumber)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '5px 12px',
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
          ))
        )}
      </div>
    </div>
  );
};

export default StudentFeesScreen;
