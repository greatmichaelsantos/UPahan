import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Plus, CheckCircle, ChevronDown, AlertCircle } from 'lucide-react';
import BottomNav from '../../components/BottomNav';
import api from '../../utils/api';

const CATEGORIES = [
  { value: 'plumbing',   label: 'Plumbing',   sub: 'Tulo ng Tubig', emoji: '🚰' },
  { value: 'electrical', label: 'Electrical', sub: 'Kuryente',      emoji: '⚡' },
  { value: 'structural', label: 'Structural', sub: 'Sira sa Bahay', emoji: '🧱' },
  { value: 'others',     label: 'Others',     sub: 'Iba pa',        emoji: '🔧' },
];

const Label = ({ children }) => (
  <p style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 12, color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
    {children}
  </p>
);

export default function TenantMaintenanceRequest() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('');
  const [subject, setSubject]   = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto]       = useState(null);
  const [preview, setPreview]   = useState(null);
  const [dropOpen, setDropOpen] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState('');

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) { setPhoto(file); setPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!category) { setError('Please select an issue category.'); return; }
    if (!subject.trim()) { setError('Please provide a subject.'); return; }
    setLoading(true);
    try {
      const res = await api.post('/maintenance', { issueCategory: category, subject: subject.trim(), description });
      if (photo) {
        const fd = new FormData();
        fd.append('photos', photo);
        await api.post(`/maintenance/${res.data.data.request_id}/photos`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setSuccess(true);
      setTimeout(() => navigate('/tenant/maintenance'), 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  const selected = CATEGORIES.find(c => c.value === category);

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FAF8F5', gap: 16 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#E8F5F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle size={40} color="#2E7D72" />
        </div>
        <h2 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, fontSize: 24, color: '#4A4A4A' }}>Request Submitted!</h2>
        <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#888888' }}>We'll notify you when it's addressed.</p>
      </div>
    );
  }

  const inputStyle = {
    width: '100%', height: 52, borderRadius: 8, background: '#F0EEEB',
    border: '1.5px solid transparent', fontFamily: 'Inter', fontSize: 14, color: '#4A4A4A',
    paddingLeft: 14, paddingRight: 14, outline: 'none', transition: 'all 150ms ease',
  };
  const onFocus = (e) => { e.target.style.borderColor = '#3A7BD5'; e.target.style.background = '#EBF2FC'; };
  const onBlur  = (e) => { e.target.style.borderColor = 'transparent'; e.target.style.background = '#F0EEEB'; };

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F5', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: 'white', padding: '16px 20px 16px', borderBottom: '1px solid #F0EEEB' }}>
        <button
          onClick={() => navigate('/tenant/maintenance')}
          style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 13, color: '#3A7BD5', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}
        >
          ← Back
        </button>
        <h1 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, fontSize: 26, color: '#4A4A4A' }}>New Request</h1>
        <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#888888', marginTop: 4 }}>Report a maintenance issue in your unit</p>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {error && (
          <div style={{ background: '#FDEEEE', border: '1px solid #D64045', borderRadius: 8, padding: '10px 14px', color: '#D64045', fontSize: 13, fontFamily: 'Inter', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {/* Category dropdown */}
        <div className="card">
          <Label>Issue Category</Label>
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setDropOpen(!dropOpen)}
              style={{
                width: '100%', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 14px', borderRadius: 8, background: '#F0EEEB',
                border: `1.5px solid ${dropOpen ? '#3A7BD5' : 'transparent'}`,
                cursor: 'pointer', fontFamily: 'Inter', fontSize: 14, transition: 'all 150ms',
              }}
              aria-expanded={dropOpen} aria-haspopup="listbox"
            >
              <span style={{ color: selected ? '#4A4A4A' : '#888888' }}>
                {selected ? `${selected.emoji} ${selected.label} (${selected.sub})` : 'Select a category...'}
              </span>
              <ChevronDown size={16} color="#888888" style={{ transform: dropOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} aria-hidden="true" />
            </button>

            {dropOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', borderRadius: 8, boxShadow: '0 4px 20px rgba(46,125,114,0.15)', marginTop: 4, zIndex: 10, overflow: 'hidden' }} role="listbox">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value} type="button" role="option" aria-selected={category === cat.value}
                    onClick={() => { setCategory(cat.value); setDropOpen(false); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px', cursor: 'pointer', textAlign: 'left',
                      background: category === cat.value ? '#EBF2FC' : 'white',
                      border: 'none', borderBottom: '1px solid #F0EEEB', transition: 'background 100ms',
                    }}
                    onMouseOver={e => { if (category !== cat.value) e.currentTarget.style.background = '#FAF8F5'; }}
                    onMouseOut={e => { if (category !== cat.value) e.currentTarget.style.background = 'white'; }}
                  >
                    <span style={{ fontSize: 20 }}>{cat.emoji}</span>
                    <div>
                      <p style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: category === cat.value ? '#3A7BD5' : '#4A4A4A', marginBottom: 2 }}>{cat.label}</p>
                      <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#888888' }}>{cat.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Subject + description */}
        {category && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <Label>Subject</Label>
              <div style={{ position: 'relative' }}>
                <AlertCircle size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#888888' }} aria-hidden="true" />
                <input
                  type="text" value={subject} onChange={e => setSubject(e.target.value)}
                  placeholder="Ex. Sira ang Gripo" maxLength={150}
                  style={{ ...inputStyle, paddingLeft: 42 }} onFocus={onFocus} onBlur={onBlur}
                />
              </div>
            </div>
            <div>
              <Label>Description (Optional)</Label>
              <textarea
                value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Describe the issue in detail..."
                rows={3}
                style={{ ...inputStyle, height: 'auto', paddingTop: 12, paddingBottom: 12, resize: 'none' }}
                onFocus={onFocus} onBlur={onBlur}
              />
            </div>
          </div>
        )}

        {/* Photo upload */}
        <div className="card">
          <Label>Photo Evidence (Optional)</Label>
          {preview ? (
            <div style={{ position: 'relative' }}>
              <img src={preview} alt="Evidence" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: 8 }} />
              <button
                type="button"
                onClick={() => { setPhoto(null); setPreview(null); }}
                style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D64045', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', fontWeight: 700 }}
                aria-label="Remove photo"
              >
                ×
              </button>
            </div>
          ) : (
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, border: '2px dashed #3A7BD5', borderRadius: 10, padding: '28px 16px', background: '#EBF2FC', cursor: 'pointer' }}>
              <Camera size={28} color="#3A7BD5" aria-hidden="true" />
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13, color: '#4A4A4A', marginBottom: 2 }}>Click to take photo or upload</p>
                <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#888888' }}>JPG, PNG up to 5MB</p>
              </div>
              <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
            </label>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit" disabled={loading}
          style={{
            height: 52, borderRadius: 8, background: loading ? '#888888' : '#3A7BD5',
            color: 'white', border: 'none', width: '100%',
            fontFamily: 'Inter', fontWeight: 600, fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
            transition: 'all 150ms ease',
          }}
          onMouseOver={e => { if (!loading) e.currentTarget.style.background = '#2f6abf'; }}
          onMouseOut={e => { if (!loading) e.currentTarget.style.background = '#3A7BD5'; }}
        >
          <Plus size={18} aria-hidden="true" />
          {loading ? 'Submitting...' : 'SUBMIT REQUEST'}
        </button>
      </form>

      <BottomNav role="tenant" />
    </div>
  );
}
