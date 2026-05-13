import React, { useState, useEffect, useCallback } from 'react';
import { X, Upload, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import { formatPeso } from '../utils/format';

const OVERLAY = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 16,
};
const MODAL = {
  background: 'white', borderRadius: 16, width: '100%', maxWidth: 500,
  boxShadow: '0 8px 40px rgba(0,0,0,0.18)', maxHeight: '92vh', overflowY: 'auto',
};

const labelStyle = {
  display: 'block', fontFamily: 'Inter', fontWeight: 600, fontSize: 11,
  color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5,
};
const baseInput = {
  width: '100%', height: 44, borderRadius: 8, background: '#F0EEEB',
  border: '1.5px solid transparent', fontFamily: 'Inter', fontSize: 14,
  color: '#4A4A4A', padding: '0 12px', outline: 'none', transition: 'all 150ms ease',
};
const onFocus = (e) => { e.target.style.borderColor = '#3A7BD5'; e.target.style.background = '#EBF2FC'; };
const onBlur  = (e) => { e.target.style.borderColor = 'transparent'; e.target.style.background = '#F0EEEB'; };

const today = new Date().toISOString().split('T')[0];

function friendlyError(msg) {
  if (!msg) return 'Something went wrong. Please try again.';
  const lower = msg.toLowerCase();
  if (lower.includes('pending payment declaration')) return msg;
  if (lower.includes('cannot exceed')) return msg;
  if (lower.includes('future')) return 'Payment date cannot be in the future.';
  if (lower.includes('5mb') || lower.includes('file size')) return 'File size must not exceed 5MB.';
  if (lower.includes('jpg') || lower.includes('png') || lower.includes('pdf') || lower.includes('file type')) return 'Only JPG, PNG, and PDF files are accepted.';
  return 'Something went wrong. Please try again.';
}

export default function PaymentDeclarationModal({ unit, monthlyRent, onClose, onSuccess, initialType = 'full' }) {
  const isPaid = initialType === 'advance';
  const [paymentType, setPaymentType] = useState(initialType);
  const [advanceMonths, setAdvanceMonths] = useState(1);
  const [form, setForm] = useState({
    paymentMethod: '',
    amountPaid: String(monthlyRent || ''),
    referenceNumber: '',
    paymentDate: today,
    notes: '',
  });
  const [amountWarning, setAmountWarning] = useState('');
  const [proofFile, setProofFile]   = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');

  const handleTypeChange = (type) => {
    setPaymentType(type);
    setError('');
    setAmountWarning('');
    setAdvanceMonths(1);
    if (type === 'full') {
      setForm(p => ({ ...p, amountPaid: String(monthlyRent || '') }));
    } else if (type === 'advance') {
      const multiplier = isPaid ? 1 : 2;
      setForm(p => ({ ...p, amountPaid: String(Number(monthlyRent) * multiplier) }));
    } else {
      setForm(p => ({ ...p, amountPaid: '' }));
    }
  };

  const handleAdvanceMonths = (n) => {
    setAdvanceMonths(n);
    const multiplier = isPaid ? n : n + 1;
    setForm(p => ({ ...p, amountPaid: String(Number(monthlyRent) * multiplier) }));
  };

  const getAdvanceMonthCovered = (months) => {
    const now = new Date();
    const startOffset = isPaid ? 1 : 0;
    const startDate = new Date(now.getFullYear(), now.getMonth() + startOffset, 1);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + months - 1, 1);
    const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (months === 1) return fmt(startDate);
    return `${fmt(startDate)} to ${fmt(endDate)}`;
  };

  const handleKey = useCallback((e) => { if (e.key === 'Escape') onClose(); }, [onClose]);
  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  const set = (f) => (e) => {
    const val = e.target.value;
    setForm(p => ({ ...p, [f]: val }));
    if (f === 'amountPaid' && paymentType === 'full' && monthlyRent) {
      const amt = parseFloat(val);
      if (!isNaN(amt) && amt < parseFloat(monthlyRent) && amt > 0) {
        setAmountWarning(`Full rent is ${formatPeso(monthlyRent)}. Are you sure this is the correct amount?`);
      } else {
        setAmountWarning('');
      }
    }
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must not exceed 5MB.');
      return;
    }
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG, PNG, and PDF files are accepted.');
      return;
    }
    setError('');
    setProofFile(file);
    if (file.type !== 'application/pdf') {
      setProofPreview(URL.createObjectURL(file));
    } else {
      setProofPreview('pdf');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.paymentMethod) { setError('Please select a payment method.'); return; }
    if (!form.amountPaid || parseFloat(form.amountPaid) <= 0) { setError('Please enter a valid amount greater than 0.'); return; }
    if (paymentType === 'partial' && parseFloat(form.amountPaid) >= parseFloat(monthlyRent)) {
      setError(`Partial payment must be less than the full rent of ${formatPeso(monthlyRent)}.`); return;
    }
    if (!form.paymentDate) { setError('Please select a payment date.'); return; }
    if (form.paymentDate > today) { setError('Payment date cannot be in the future.'); return; }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('paymentMethod', form.paymentMethod);
      fd.append('amountPaid', form.amountPaid);
      fd.append('referenceNumber', form.referenceNumber);
      fd.append('paymentDate', form.paymentDate);
      fd.append('notes', form.notes);
      fd.append('paymentType', paymentType);
      if (paymentType === 'advance') fd.append('monthCovered', getAdvanceMonthCovered(advanceMonths));
      if (proofFile) fd.append('proofOfPayment', proofFile);

      await api.post('/payments/declare', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess('Your payment declaration has been submitted. Please wait for the landlord to approve it.');
      setTimeout(() => onSuccess(), 1800);
    } catch (err) {
      setError(friendlyError(err.response?.data?.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={OVERLAY} onClick={onClose} role="dialog" aria-modal="true" aria-label="Submit Payment Declaration">
      <div style={MODAL} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ background: '#3A7BD5', borderRadius: '16px 16px 0 0', padding: '20px 20px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              PAYMENT
            </p>
            <h2 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 22, color: 'white' }}>
              Submit Payment
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Unit summary */}
          <div style={{ background: '#EBF2FC', borderRadius: 10, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#888888', marginBottom: 2 }}>Unit</p>
              <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 15, color: '#3A7BD5' }}>{unit}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#888888', marginBottom: 2 }}>Monthly Rent</p>
              <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 15, color: '#3A7BD5' }}>{formatPeso(monthlyRent)}</p>
            </div>
          </div>

          {/* Full / Partial / Advance toggle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {['full', 'partial', 'advance'].map(type => {
              const isActive   = paymentType === type;
              const isDisabled = initialType === 'advance' && type !== 'advance';
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => !isDisabled && handleTypeChange(type)}
                  title={isDisabled ? 'Already paid for this month' : undefined}
                  style={{
                    padding: '10px', borderRadius: 8, border: '1.5px solid',
                    borderColor: isActive ? '#3A7BD5' : '#E0DDD8',
                    background: isActive ? '#EBF2FC' : 'white',
                    color: isActive ? '#3A7BD5' : '#888',
                    fontFamily: 'Inter', fontWeight: 700, fontSize: 13,
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    transition: 'all 150ms ease',
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                    opacity: isDisabled ? 0.4 : 1,
                  }}
                >
                  {type === 'full' ? `Full — ${formatPeso(monthlyRent)}` : type === 'partial' ? 'Partial Amount' : 'Advance'}
                </button>
              );
            })}
          </div>
          {paymentType === 'advance' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
                {[1, 2, 3, 4].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handleAdvanceMonths(n)}
                    style={{
                      padding: '10px 0', borderRadius: 8, border: '1.5px solid #4A90D9',
                      background: advanceMonths === n ? '#4A90D9' : 'white',
                      color: advanceMonths === n ? 'white' : '#4A90D9',
                      fontFamily: 'Inter', fontWeight: 700, fontSize: 12,
                      cursor: 'pointer', transition: 'all 150ms ease',
                    }}
                  >
                    {n} {n === 1 ? 'Month' : 'Months'}
                  </button>
                ))}
              </div>
              <div style={{ background: '#EBF2FC', border: '1px solid #3A7BD5', borderRadius: 8, padding: '8px 12px', fontFamily: 'Inter', fontSize: 12, color: '#3A7BD5' }}>
                {isPaid
                  ? 'Paying in advance for future months'
                  : 'Includes current month (unpaid) + advance months'}
              </div>
            </>
          )}
          {paymentType === 'partial' && (
            <div style={{ background: '#FFF8EC', border: '1px solid #E07B39', borderRadius: 8, padding: '8px 12px', fontFamily: 'Inter', fontSize: 12, color: '#E07B39' }}>
              Enter the amount you are paying now. You can submit another partial declaration after this one is approved.
            </div>
          )}

          {error && (
            <div style={{ background: '#FDEEEE', border: '1px solid #D64045', borderRadius: 8, padding: '10px 14px', color: '#D64045', fontSize: 13, fontFamily: 'Inter', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div style={{ background: '#E8F5F3', border: '1px solid #2E7D72', borderRadius: 8, padding: '10px 14px', color: '#2E7D72', fontSize: 13, fontFamily: 'Inter', fontWeight: 600 }}>
              {success}
            </div>
          )}

          {/* Payment Method */}
          <div>
            <label style={labelStyle}>Payment Method *</label>
            <select value={form.paymentMethod} onChange={set('paymentMethod')}
              style={{ ...baseInput, appearance: 'none', cursor: 'pointer' }}
              onFocus={onFocus} onBlur={onBlur}>
              <option value="">Select payment method...</option>
              <option value="Cash">Cash</option>
              <option value="GCash">GCash</option>
              <option value="Maya">Maya</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Amount + Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={labelStyle}>Amount Paid *</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontFamily: 'Inter', fontWeight: 700, color: '#3A7BD5', fontSize: 15 }}>₱</span>
                <input type="number" value={form.amountPaid} onChange={set('amountPaid')} min="1"
                  style={{ ...baseInput, paddingLeft: 26 }} onFocus={onFocus} onBlur={onBlur} />
              </div>
              {amountWarning && (
                <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#E07B39', marginTop: 4 }}>{amountWarning}</p>
              )}
            </div>
            <div>
              <label style={labelStyle}>Payment Date *</label>
              <input type="date" value={form.paymentDate} onChange={set('paymentDate')} max={today}
                style={baseInput} onFocus={onFocus} onBlur={onBlur} />
            </div>
          </div>

          {/* Reference Number */}
          <div>
            <label style={labelStyle}>Reference Number</label>
            <input value={form.referenceNumber} onChange={set('referenceNumber')}
              placeholder="Transaction / reference number (if applicable)"
              style={baseInput} onFocus={onFocus} onBlur={onBlur} />
          </div>

          {/* Proof of Payment */}
          <div>
            <label style={labelStyle}>Proof of Payment</label>
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
              border: '2px dashed #3A7BD5', borderRadius: 10, padding: '14px', background: '#EBF2FC', cursor: 'pointer',
            }}>
              <Upload size={20} color="#3A7BD5" aria-hidden="true" />
              <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#4A4A4A', textAlign: 'center' }}>
                Upload screenshot or receipt (optional)
              </span>
              <span style={{ fontFamily: 'Inter', fontSize: 11, color: '#888888' }}>JPG, PNG, PDF up to 5MB</span>
              <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFile} style={{ display: 'none' }} />
            </label>
            {proofPreview === 'pdf' && (
              <div style={{ marginTop: 8, padding: '10px 14px', background: '#EBF2FC', borderRadius: 8, fontFamily: 'Inter', fontSize: 13, color: '#3A7BD5', fontWeight: 600 }}>
                ✓ PDF file selected: {proofFile?.name}
              </div>
            )}
            {proofPreview && proofPreview !== 'pdf' && (
              <img src={proofPreview} alt="Proof preview" style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} />
            )}
          </div>

          {/* Notes */}
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea value={form.notes} onChange={set('notes')} rows={3} maxLength={300}
              placeholder="Any additional notes for the landlord..."
              style={{ ...baseInput, height: 'auto', paddingTop: 10, paddingBottom: 10, resize: 'none' }}
              onFocus={onFocus} onBlur={onBlur}
            />
            <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#888888', textAlign: 'right', marginTop: 3 }}>
              {form.notes.length}/300
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
            <button type="submit" disabled={submitting || !!success}
              style={{
                height: 52, borderRadius: 8, background: (submitting || success) ? '#888888' : '#3A7BD5',
                color: 'white', border: 'none', width: '100%',
                fontFamily: 'Inter', fontWeight: 600, fontSize: 14,
                cursor: (submitting || success) ? 'not-allowed' : 'pointer',
                opacity: (submitting || success) ? 0.7 : 1, transition: 'all 150ms ease',
              }}
              onMouseOver={e => { if (!submitting && !success) e.currentTarget.style.background = '#2f6abf'; }}
              onMouseOut={e => { if (!submitting && !success) e.currentTarget.style.background = '#3A7BD5'; }}
            >
              {submitting ? 'Submitting...' : 'SUBMIT DECLARATION'}
            </button>
            <button type="button" onClick={onClose} disabled={submitting}
              style={{
                height: 52, borderRadius: 8, background: 'transparent',
                color: '#888888', border: '1.5px solid #E0DDD8', width: '100%',
                fontFamily: 'Inter', fontWeight: 600, fontSize: 14,
                cursor: submitting ? 'not-allowed' : 'pointer', transition: 'all 150ms ease',
              }}
              onMouseOver={e => { if (!submitting) e.currentTarget.style.background = '#F0EEEB'; }}
              onMouseOut={e => { if (!submitting) e.currentTarget.style.background = 'transparent'; }}
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
