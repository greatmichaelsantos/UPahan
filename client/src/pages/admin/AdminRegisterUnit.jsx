import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, DollarSign, Layers, MapPin, Camera, ArrowLeft, CheckCircle } from 'lucide-react';
import BottomNav from '../../components/BottomNav';
import api from '../../utils/api';

export default function AdminRegisterUnit() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    unitCode: '', monthlyPrice: '', vacancyStatus: 'vacant',
    floorPlan: '', location: '', description: ''
  });
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(files);
    const urls = files.map(f => URL.createObjectURL(f));
    setPreviews(urls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.unitCode || !form.monthlyPrice) {
      setError('Unit code and monthly price are required.'); return;
    }
    setLoading(true);
    try {
      const res = await api.post('/units', form);
      const unitId = res.data.data.unit_id;

      if (photos.length > 0) {
        const fd = new FormData();
        photos.forEach(p => fd.append('photos', p));
        await api.post(`/units/${unitId}/photos`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setSuccess(true);
      setTimeout(() => navigate('/admin/units'), 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save unit.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={40} color="#1DB954" />
          </div>
          <h2 className="text-xl font-black text-gray-900">Unit Saved!</h2>
          <p className="text-gray-500 text-sm mt-1">Redirecting to unit list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="bg-admin-dark px-6 pt-12 pb-6">
        <button onClick={() => navigate('/admin/units')} className="flex items-center gap-1.5 text-gray-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft size={16} />
          <span className="text-xs font-semibold">BACK</span>
        </button>
        <p className="text-primary text-xs font-bold tracking-widest uppercase mb-1">INVENTORY INTAKE</p>
        <h1 className="text-white text-2xl font-black">Register New Unit</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-5 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
        )}

        <div className="card space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Unit Code</label>
            <div className="relative">
              <Home size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={form.unitCode} onChange={set('unitCode')}
                placeholder="e.g., 4C" className="input-field pl-10 uppercase"
                maxLength={5} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Monthly Price (₱)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">₱</span>
              <input type="number" value={form.monthlyPrice} onChange={set('monthlyPrice')}
                placeholder="15000" className="input-field pl-8" min="0" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Current Vacancy</label>
            <div className="flex gap-2">
              <button type="button"
                onClick={() => setForm(f => ({ ...f, vacancyStatus: 'vacant' }))}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${form.vacancyStatus === 'vacant' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                VACANT
              </button>
              <button type="button"
                onClick={() => setForm(f => ({ ...f, vacancyStatus: 'occupied' }))}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${form.vacancyStatus === 'occupied' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-500'}`}>
                OCCUPIED
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Floor Plan / Type</label>
            <div className="relative">
              <Layers size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={form.floorPlan} onChange={set('floorPlan')}
                placeholder="e.g., Studio, 24sqm Open Plan" className="input-field pl-10" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Location / City</label>
            <div className="relative">
              <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={form.location} onChange={set('location')}
                placeholder="e.g., Olongapo City, Zambales" className="input-field pl-10" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Description</label>
            <textarea value={form.description} onChange={set('description')}
              placeholder="Brief description of the unit..."
              className="input-field resize-none" rows={3} />
          </div>
        </div>

        <div className="card">
          <label className="block text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Unit Photos</label>
          <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-primary transition-colors">
            <Camera size={28} className="text-gray-400" />
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-600">Click to upload photos</p>
              <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WEBP up to 5MB each</p>
            </div>
            <input type="file" multiple accept="image/*" onChange={handlePhotos} className="hidden" />
          </label>
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {previews.map((url, i) => (
                <img key={i} src={url} alt="" className="w-full aspect-square object-cover rounded-xl" />
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary disabled:opacity-60"
        >
          {loading ? 'SAVING...' : '💾 SAVE UNIT INFORMATION'}
        </button>
      </form>

      <BottomNav role="admin" />
    </div>
  );
}
