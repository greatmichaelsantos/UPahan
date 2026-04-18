import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Plus, ArrowLeft, CheckCircle, ChevronDown } from 'lucide-react';
import BottomNav from '../../components/BottomNav';
import api from '../../utils/api';

const CATEGORIES = [
  { value: 'plumbing',    label: 'Plumbing',    sub: 'Tulo ng Tubig',  emoji: '🚰' },
  { value: 'electrical',  label: 'Electrical',  sub: 'Kuryente',       emoji: '⚡' },
  { value: 'structural',  label: 'Structural',  sub: 'Sira sa Bahay',  emoji: '🧱' },
  { value: 'others',      label: 'Others',      sub: 'Iba pa',         emoji: '🔧' },
];

export default function TenantMaintenanceRequest() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dropOpen, setDropOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
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
        await api.post(`/maintenance/${res.data.data.request_id}/photos`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={40} color="#1DB954" />
          </div>
          <h2 className="text-xl font-black text-gray-900">Request Submitted!</h2>
          <p className="text-gray-500 text-sm mt-1">We'll notify you when it's addressed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="bg-white px-6 pt-12 pb-5 border-b border-gray-100">
        <button onClick={() => navigate('/tenant/maintenance')}
          className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 mb-4 transition-colors">
          <ArrowLeft size={16} />
          <span className="text-xs font-semibold">BACK</span>
        </button>
        <h1 className="text-2xl font-black text-gray-900">New Request</h1>
        <p className="text-sm text-gray-500 mt-0.5">Report a maintenance issue in your unit</p>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-5 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
        )}

        <div className="card">
          <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">ISSUE CATEGORY</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropOpen(!dropOpen)}
              className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl bg-white text-left"
            >
              <span className={selected ? 'text-gray-900' : 'text-gray-400'}>
                {selected ? `${selected.emoji} ${selected.label} (${selected.sub})` : 'Select a category...'}
              </span>
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${dropOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropOpen && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 z-10 overflow-hidden">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => { setCategory(cat.value); setDropOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0 ${category === cat.value ? 'bg-primary/5' : ''}`}
                  >
                    <span className="text-xl">{cat.emoji}</span>
                    <div>
                      <p className={`text-sm font-semibold ${category === cat.value ? 'text-primary' : 'text-gray-900'}`}>
                        {cat.label}
                      </p>
                      <p className="text-xs text-gray-400">{cat.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {category && (
          <div className="card">
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">SUBJECT</label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Ex. Sira ang Gripo"
              className="input-field"
              maxLength={150}
            />

            <label className="block text-xs font-semibold text-gray-500 mt-4 mb-2 uppercase tracking-wide">
              DESCRIPTION (Optional)
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..."
              className="input-field resize-none"
              rows={3}
            />
          </div>
        )}

        <div className="card">
          <label className="block text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">PHOTO EVIDENCE (Optional)</label>
          {preview ? (
            <div className="relative">
              <img src={preview} alt="Evidence" className="w-full aspect-video object-cover rounded-xl" />
              <button
                type="button"
                onClick={() => { setPhoto(null); setPreview(null); }}
                className="absolute top-2 right-2 bg-white rounded-full w-7 h-7 flex items-center justify-center shadow-sm text-red-500 hover:bg-red-50"
              >
                ×
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-8 cursor-pointer hover:border-primary transition-colors">
              <Camera size={28} className="text-gray-400" />
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-600">CLICK TO TAKE PHOTO OR UPLOAD</p>
                <p className="text-xs text-gray-400 mt-0.5">JPG, PNG up to 5MB</p>
              </div>
              <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
            </label>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Plus size={18} />
          {loading ? 'SUBMITTING...' : 'Submit Request'}
        </button>
      </form>

      <BottomNav role="tenant" />
    </div>
  );
}
