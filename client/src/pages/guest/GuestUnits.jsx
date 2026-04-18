import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, ChevronRight, ArrowLeft } from 'lucide-react';
import api from '../../utils/api';
import { formatPeso } from '../../utils/format';

const FILTERS = [
  { label: 'ALL UNITS',   value: '' },
  { label: 'STUDIO',      value: 'Studio' },
  { label: '1 BEDROOM',   value: '1 Bedroom' },
  { label: '2 BEDROOM',   value: '2 Bedroom' },
  { label: 'UNDER ₱10K',  value: 'under10k' },
  { label: 'UNDER ₱20K',  value: 'under20k' },
];

export default function GuestUnits() {
  const navigate = useNavigate();
  const [units, setUnits] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/units').then(r => {
      setUnits(r.data.data || []);
      setFiltered(r.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = [...units];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        u.unit_code?.toLowerCase().includes(q) ||
        u.location?.toLowerCase().includes(q) ||
        u.floor_plan?.toLowerCase().includes(q)
      );
    }
    if (activeFilter === 'under10k') result = result.filter(u => u.monthly_price < 10000);
    else if (activeFilter === 'under20k') result = result.filter(u => u.monthly_price < 20000);
    else if (activeFilter) result = result.filter(u => u.floor_plan?.includes(activeFilter));
    setFiltered(result);
  }, [search, activeFilter, units]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className="px-6 pt-12 pb-6"
        style={{ background: 'linear-gradient(135deg, #17a347, #1DB954)' }}
      >
        <button
          onClick={() => navigate('/select-role')}
          className="flex items-center gap-1.5 text-white/70 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="text-xs font-semibold">BACK</span>
        </button>
        <div className="flex items-center gap-2 mb-1">
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
            <path d="M16 3L3 14h3v14h8v-8h4v8h8V14h3L16 3z" fill="white" />
          </svg>
          <span className="text-white/80 text-sm font-bold">UPahan</span>
        </div>
        <h1 className="text-white text-2xl font-black">Available Units</h1>
        <p className="text-white/70 text-xs mt-0.5">Zambales Properties for Rent</p>
      </div>

      <div className="px-4 py-4 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search units or filter options"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10 pr-10"
          />
          <SlidersHorizontal size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                activeFilter === f.value ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="rounded-2xl h-52 animate-pulse bg-gray-200" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-2">🏠</p>
            <p className="font-medium">No units available</p>
          </div>
        ) : (
          <div className="space-y-4 pb-8">
            {filtered.map(unit => (
              <button
                key={unit.unit_id}
                onClick={() => navigate(`/units/${unit.unit_id}`)}
                className="w-full rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all text-left active:scale-[0.98]"
              >
                <div className="relative h-44 bg-gradient-to-br from-gray-200 to-gray-300">
                  {unit.photos?.[0] ? (
                    <img src={unit.photos[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg width="48" height="48" viewBox="0 0 32 32" fill="none" opacity="0.3">
                        <path d="M16 3L3 14h3v14h8v-8h4v8h8V14h3L16 3z" fill="#666" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
                    {unit.floor_plan && (
                      <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full">
                        {unit.floor_plan.split(',')[0]}
                      </span>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                      unit.monthly_price < 10000 ? 'bg-primary text-white' :
                      unit.monthly_price < 20000 ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
                    }`}>
                      {unit.monthly_price < 10000 ? 'UNDER ₱10K' : unit.monthly_price < 20000 ? 'UNDER ₱20K' : `₱${Math.round(unit.monthly_price/1000)}K`}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 bg-primary text-white font-black text-sm px-3 py-1.5 rounded-xl shadow-lg">
                    {formatPeso(unit.monthly_price).replace('₱ ', '₱')}
                  </div>
                </div>

                <div className="bg-white p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-black text-gray-900">Unit {unit.unit_code}</h3>
                      {unit.location && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin size={12} className="text-gray-400" />
                          <p className="text-xs text-gray-500">{unit.location}</p>
                        </div>
                      )}
                    </div>
                    <ChevronRight size={18} className="text-gray-300 mt-0.5" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {unit.floor_plan || 'Unit details available'} • Monthly Payment
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
