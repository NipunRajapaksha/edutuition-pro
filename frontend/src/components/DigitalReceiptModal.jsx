import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { X, Printer, CheckCircle, ShieldCheck } from 'lucide-react';
import QRCode from 'qrcode';

const DigitalReceiptModal = ({ receipt, onClose }) => {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const [qrSrc, setQrSrc] = useState('');

  useEffect(() => {
    if (receipt) {
      const qrData = JSON.stringify({
        receipt: receipt.receiptNumber,
        date: receipt.paymentDate,
        amount: receipt.amountPaid,
        student: receipt.studentName || receipt.student?.fullName,
        valid: true
      });
      QRCode.toDataURL(qrData, { width: 140, margin: 1 })
        .then(url => setQrSrc(url))
        .catch(err => console.error(err));
    }
  }, [receipt]);

  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const studentName = receipt.studentName || receipt.student?.fullName || 'Student';
  const studentCode = receipt.studentCode || receipt.student?.studentId || '';
  const className = receipt.className || receipt.class?.name || 'Class';
  const period = receipt.month ? `${receipt.month} ${receipt.year}` : receipt.billing?.period || '';
  const due = receipt.amountDue || receipt.billing?.amountDue || 0;
  const paid = receipt.amountPaid || receipt.billing?.amountPaid || 0;
  const balance = receipt.balance ?? receipt.billing?.balance ?? 0;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          color: '#111827',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '460px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }}
      >
        {/* Modal Top Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            backgroundColor: '#F3F4F6',
            borderBottom: '1px solid #E5E7EB'
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#4F46E5', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} />
            {t('verifiedDigitalReceipt')}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 10px',
                borderRadius: '8px',
                backgroundColor: '#4F46E5',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <Printer size={14} />
              {t('printReceipt')}
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '6px',
                borderRadius: '8px',
                backgroundColor: '#E5E7EB',
                border: 'none',
                color: '#4B5563',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Receipt Printable Area */}
        <div style={{ padding: '24px', overflowY: 'auto' }} id="printable-receipt">
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px dashed #D1D5DB', paddingBottom: '16px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1E1B4B' }}>
              APEX TUITION ACADEMY
            </h2>
            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>
              ශිල්ප කලා උසස් අධ්‍යාපන ආයතනය
            </div>
            <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>
              142 High Level Road, Nugegoda • Tel: 011 280 9900
            </div>
            <div
              style={{
                display: 'inline-block',
                marginTop: '10px',
                padding: '3px 12px',
                borderRadius: '9999px',
                backgroundColor: '#EEF2FF',
                color: '#4F46E5',
                fontSize: '11px',
                fontWeight: '700'
              }}
            >
              {receipt.receiptNumber}
            </div>
          </div>

          {/* Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px', marginBottom: '16px' }}>
            <div>
              <span style={{ color: '#6B7280' }}>Student:</span>
              <div style={{ fontWeight: '700', color: '#111827' }}>{studentName}</div>
              <div style={{ color: '#9CA3AF', fontSize: '11px' }}>{studentCode}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: '#6B7280' }}>Date:</span>
              <div style={{ fontWeight: '700', color: '#111827' }}>{receipt.paymentDate}</div>
              <div style={{ color: '#059669', fontSize: '11px', fontWeight: '600' }}>
                Method: {(receipt.paymentMethod || 'cash').toUpperCase()}
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#F9FAFB', borderRadius: '10px', padding: '12px', marginBottom: '16px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#6B7280' }}>Class / Subject:</span>
              <span style={{ fontWeight: '700' }}>{className}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6B7280' }}>Fee Period:</span>
              <span style={{ fontWeight: '700' }}>{period}</span>
            </div>
          </div>

          {/* Amount Breakdown */}
          <div style={{ borderBottom: '2px dashed #D1D5DB', paddingBottom: '14px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span style={{ color: '#6B7280' }}>Total Fee Due:</span>
              <span style={{ fontWeight: '600' }}>Rs. {Number(due).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '800', color: '#059669', marginBottom: '6px' }}>
              <span>Amount Paid:</span>
              <span>Rs. {Number(paid).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: balance > 0 ? '#DC2626' : '#6B7280' }}>
              <span>Remaining Balance:</span>
              <span style={{ fontWeight: '700' }}>Rs. {Number(balance).toLocaleString()}</span>
            </div>
          </div>

          {/* QR Code Verification & Stamp */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              {qrSrc && <img src={qrSrc} alt="Verification QR" style={{ width: '80px', height: '80px', borderRadius: '6px' }} />}
              <div style={{ fontSize: '9px', color: '#9CA3AF', marginTop: '2px' }}>Scan to Verify Authenticity</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontSize: '12px', fontWeight: '700' }}>
                <CheckCircle size={15} />
                PAID & VERIFIED
              </div>
              <div style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '24px', borderTop: '1px solid #D1D5DB', paddingTop: '4px' }}>
                Authorized Signature / Seal
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalReceiptModal;
