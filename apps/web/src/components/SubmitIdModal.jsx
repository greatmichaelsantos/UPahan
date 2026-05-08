import React, { useState, useEffect, useCallback } from 'react';
import { X, Upload, FileImage, CheckCircle } from 'lucide-react';
import api from '../utils/api';

const BLUE = '#3A7BD5';
const ID_TYPES = [
  "Philippine National ID (PhilSys)",
  "Driver's License",
  "Passport",
  "SSS ID",
  "GSIS ID",
  "PhilHealth ID",
  "Voter's ID",
  "Postal ID",
  "PRC ID",
  "Senior Citizen ID",
  "PWD ID",
  "Barangay ID",
  "TIN ID",
  "Other Government ID",
];

function ImageUploadBox({ label, file, onChange }) {
  const preview = file ? URL.createObjectURL(file) : null;
  return (
    <div>
      <p style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6 }}>
        {label} <span style={{ color: '#D64045' }}>*</span>
      </p>
      <label
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          border: `2px dashed ${file ? BLUE : '#DDD'}`, borderRadius: 10, height: 120, cursor: 'pointer',
          background: file ? '#EEF4FF' : '#FAFAFA', overflow: 'hidden', position: 'relative',
        }}
      >
        {preview ? (
          <img src={preview} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <>
            <FileImage size={28} color="#BBB" />
            <span style={{ fontFamily: 'Inter', fontSize: 11, color: '#AAA', marginTop: 6 }}>Tap to upload</span>
            <span style={{ fontFamily: 'Inter', fontSize: 10, color: '#CCC', marginTop: 2 }}>JPG, PNG up to 5MB</span>
          </>
        )}
        <input type="file" accept="image/jpeg,image/png" onChange={onChange} style={{ display: 'none' }} />
      </label>
      {file && (
        <p style={{ fontFamily: 'Inter', fontSize: 10, color: BLUE, marginTop: 4 }}>
          {file.name}
        </p>
      )}
    </div>
  );
}

export default function SubmitIdModal({ onClose, onSuccess }) {
  const [idType, setIdType] = useState('');
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleEsc = useCallback((e) => { if (e.key === 'Escape') onClose(); }, [onClose]);
  useEffect(() => {
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [handleEsc]);

  const handleFileChange = (setter) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('File too large. Maximum size is 5MB.'); return; }
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setError('Invalid file type. Only JPG and PNG images are allowed.');
      return;
    }
    setError('');
    setter(file);
  };

  const handleSubmit = async () => {
    if (!idType) return setError('Please select an ID type.');
    if (!frontFile) return setError('Please upload the front image of your ID.');
    if (!backFile) return setError('Please upload the back image of your ID.');

    setLoading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('id_type', idType);
      form.append('frontImage', frontFile);
      form.append('backImage', backFile);
      await api.post('/documents/submit-id', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setDone(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
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
        <div style={{ background: BLUE, borderRadius: '20px 20px 0 0', padding: '18px 20px 14px' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 style={{ color: 'white', fontFamily: '"Playfair Display",Georgia,serif', fontWeight: 700, fontSize: 18, margin: 0 }}>
                Submit Valid ID
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'Inter', fontSize: 12, marginTop: 2 }}>
                Upload front and back of your government ID
              </p>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex' }}>
              <X size={18} color="white" />
            </button>
          </div>
        </div>

        {done ? (
          <div className="flex flex-col items-center justify-center" style={{ padding: 48 }}>
            <CheckCircle size={52} color="#2E7D72" />
            <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 16, color: '#2E7D72', marginTop: 14 }}>ID Submitted!</p>
            <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#888', marginTop: 6, textAlign: 'center' }}>
              Your ID is under review. The landlord will verify it shortly.
            </p>
          </div>
        ) : (
          <div style={{ padding: '20px 20px 32px' }}>
            {/* ID Type */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>
                ID Type <span style={{ color: '#D64045' }}>*</span>
              </label>
              <select
                value={idType}
                onChange={(e) => { setIdType(e.target.value); setError(''); }}
                style={{
                  width: '100%', padding: '10px 12px', border: '1.5px solid #E5E0D8',
                  borderRadius: 10, fontFamily: 'Inter', fontSize: 14, background: 'white',
                  appearance: 'none', cursor: 'pointer',
                }}
              >
                <option value="">Select ID type...</option>
                {ID_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Image uploads */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <ImageUploadBox label="Front of ID" file={frontFile} onChange={handleFileChange(setFrontFile)} />
              <ImageUploadBox label="Back of ID" file={backFile} onChange={handleFileChange(setBackFile)} />
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
                width: '100%', padding: '13px', background: loading ? '#9BB8E8' : BLUE,
                color: 'white', border: 'none', borderRadius: 10, fontFamily: 'Inter',
                fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <Upload size={16} />
              {loading ? 'Submitting...' : 'Submit ID for Verification'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
