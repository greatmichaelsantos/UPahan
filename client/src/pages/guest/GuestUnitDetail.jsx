import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, CheckCircle } from 'lucide-react';
import api from '../../utils/api';
import { formatPeso } from '../../utils/format';

const Feature = ({ label }) => (
  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full">
    <CheckCircle size={12} color="#1DB954" />
    <span className="text-xs font-medium text-gray-700">{label}</span>
  </div>
);

export default function GuestUnitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/units/${id}`).then(r => setUnit(r.data.data)).catch(() => navigate('/units')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!unit) return null;

  const photos = unit.photos?.filter(Boolean) || [];

  const getFeatures = () => {
    const features = [];
    if (unit.floor_plan) {
      const parts = unit.floor_plan.split(',');
      parts.forEach(p => features.push(p.trim()));
    }
    features.push('Monthly Payment', 'CCTV Security', 'Flood Free', 'Safe Neighborhood');
    return features;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative">
        {photos.length > 0 ? (
          <div className="grid grid-cols-2 gap-1 h-64">
            <img src={photos[0]} alt="" className="col-span-2 w-full h-40 object-cover" />
            {photos.slice(1, 3).map((p, i) => (
              <img key={i} src={p} alt="" className="w-full h-24 object-cover" />
            ))}
          </div>
        ) : (
          <div className="h-56 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <svg width="64" height="64" viewBox="0 0 32 32" fill="none" opacity="0.3">
              <path d="M16 3L3 14h3v14h8v-8h4v8h8V14h3L16 3z" fill="#666" />
            </svg>
          </div>
        )}

        <button
          onClick={() => navigate('/units')}
          className="absolute top-4 left-4 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
        >
          <ArrowLeft size={18} className="text-gray-700" />
        </button>

        <div className="absolute bottom-4 right-4 bg-primary text-white font-black text-base px-4 py-2 rounded-xl shadow-lg">
          {formatPeso(unit.monthly_price)}<span className="text-white/80 text-xs font-normal">/month</span>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Unit {unit.unit_code} Details</h1>
          {unit.location && (
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin size={14} color="#9E9E9E" />
              <p className="text-sm text-gray-500">{unit.location}</p>
            </div>
          )}
        </div>

        {unit.description && (
          <div className="card">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">ABOUT THIS UNIT</p>
            <p className="text-sm text-gray-700 leading-relaxed">{unit.description}</p>
          </div>
        )}

        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">FEATURES & DETAILS</p>
          <div className="flex flex-wrap gap-2">
            {getFeatures().map((f, i) => <Feature key={i} label={f} />)}
          </div>
        </div>

        <div className="card">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">CONTACT OWNER</p>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-black text-lg">J</span>
            </div>
            <div>
              <p className="font-bold text-gray-900">John Doe</p>
              <p className="text-xs text-gray-500">Property Owner</p>
            </div>
          </div>
          <div className="space-y-2">
            <a
              href="tel:+63171234567"
              className="flex items-center justify-center gap-2 bg-primary text-white font-bold text-sm py-3.5 rounded-xl hover:bg-primary-dark transition-colors active:scale-95"
            >
              <Phone size={16} />
              Call: +6317 123 4567
            </a>
            <a
              href="mailto:johndoe@email.com"
              className="flex items-center justify-center gap-2 border-2 border-primary text-primary font-bold text-sm py-3.5 rounded-xl hover:bg-primary/5 transition-colors active:scale-95"
            >
              <Mail size={16} />
              Email: johndoe@email.com
            </a>
          </div>
        </div>

        <button
          onClick={() => navigate('/select-role')}
          className="w-full text-center text-sm text-gray-400 py-3 hover:text-gray-600 transition-colors"
        >
          ← Browse More Units
        </button>
      </div>
    </div>
  );
}
