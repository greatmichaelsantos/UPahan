import React, { useState, useEffect, useCallback } from 'react';
import { X, Upload, FileText, CheckCircle } from 'lucide-react';
import api from '../utils/api';

const TEAL = '#2E7D72';

export default function UploadContractModal({ unit, tenant, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleEsc = useCallback((e) => { if (e.key === 'Escape') onClose(); }, [onClose]);
  useEffect(() => {
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [handleEsc]);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setError('File too large. Maximum size is 5MB.'); return; }
    const allowed = /\.(pdf|jpg|jpeg|png)$/i;
    if (!allowed.test(f.name)) { setError('Only PDF, JPG, and PNG files are accepted.'); return; }
    setError('');
    setFile(f);
  };

  const handleSubmit = async () => {
    if (!file) return setError('Please select a contract file.');
    if (!startDate) return setError('Please enter the contract start date.');

    setLoading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('contractFile', file);
      form.append('unit_id', unit.unit_id);
      form.append('tenant_user_id', tenant.user_id);
      if (startDate) form.append('contract_start_date', startDate);
      if (endDate) form.append('contract_end_date', endDate);
      if (notes.trim()) form.append('notes', notes.trim());
      await api.post('/documents/upload-contract', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setDone(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', border: '1.5px solid #E5E0D8',
    borderRadius: 10, fontFamily: 'Inter', fontSize: 14, background: 'white',
    boxSizing: 'border-box',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full md:max-w-md"
        style={{ background: 'white', borderRadius: '20px 20px 0 0', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div style={{ background: TEAL, borderRadius: '20px 20px 0 0', padding: '18px 20px 14px' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 style={{ color: 'white', fontFamily: '"Playfair Display",Georgia,serif', fontWeight: 700, fontSize: 18, margin: 0 }}>
                Upload Contract
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'Inter', fontSize: 12, marginTop: 2 }}>
                {unit?.unit_code} — {tenant?.first_name} {tenant?.last_name}
              </p>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex' }}>
              <X size={18} color="white" />
            </button>
          </div>
        </div>

        {done ? (
          <div className="flex flex-col items-center justify-center" style={{ padding: 48 }}>
            <CheckCircle size={52} color={TEAL} />
            <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 16, color: TEAL, marginTop: 14 }}>Contract Uploaded!</p>
            <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#888', marginTop: 6, textAlign: 'center' }}>
              The contract has been saved to the tenant's documents.
            </p>
          </div>
        ) : (
          <div style={{ padding: '20px 20px 32px' }}>
            {/* File upload */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>
                Contract File (PDF, JPG, PNG — max 5MB) <span style={{ color: '#D64045' }}>*</span>
              </label>
              <label
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  border: `2px dashed ${file ? TEAL : '#DDD'}`, borderRadius: 10, cursor: 'pointer',
                  background: file ? '#F0F9F7' : '#FAFAFA',
                }}
              >
                <FileText size={22} color={file ? TEAL : '#BBB'} />
                <span style={{ fontFamily: 'Inter', fontSize: 13, color: file ? TEAL : '#999' }}>
                  {file ? file.name : 'Tap to select file...'}
                </span>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} style={{ display: 'none' }} />
              </label>
            </div>

            {/* Dates */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>
                  Start Date <span style={{ color: '#D64045' }}>*</span>
                </label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>
                  End Date
                </label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputStyle} />
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes about this contract..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {error && (
              <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#D64045', marginBottom: 12, background: '#FEF2F2', padding: '8px 12px', borderRadius: 8 }}>
                {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%', padding: '13px', background: loading ? '#7BB5AE' : TEAL,
                color: 'white', border: 'none', borderRadius: 10, fontFamily: 'Inter',
                fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <Upload size={16} />
              {loading ? 'Uploading...' : 'Upload Contract'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
