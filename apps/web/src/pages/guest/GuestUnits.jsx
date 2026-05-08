import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, Home } from 'lucide-react';
import EmptyState from '../../components/EmptyState';
import api from '../../utils/api';
import { formatPeso } from '../../utils/format';

const FILTERS = [
  { label: 'ALL UNITS',  value: '' },
  { label: 'STUDIO',     value: 'Studio' },
  { label: '1 BEDROOM',  value: '1 Bedroom' },
  { label: '2 BEDROOM',  value: '2 Bedroom' },
  { label: 'UNDER ₱10K', value: 'under10k' },
  { label: 'UNDER ₱20K', value: 'under20k' },
];

export default function GuestUnits() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [units, setUnits]           = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [search, setSearch]         = useState('');
  const [activeFilter, setFilter]   = useState('');
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    api.get('/units').then(r => { setUnits(r.data.data || []); setFiltered(r.data.data || []); }).catch(() => {}).finally(() => setLoading(false));
  }, [location.key]);

  useEffect(() => {
    let result = [...units];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(u => u.unit_code?.toLowerCase().includes(q) || u.location?.toLowerCase().includes(q) || u.floor_plan?.toLowerCase().includes(q));
    }
    if (activeFilter === 'under10k') result = result.filter(u => u.monthly_price < 10000);
    else if (activeFilter === 'under20k') result = result.filter(u => u.monthly_price < 20000);
    else if (activeFilter) result = result.filter(u => u.floor_plan?.includes(activeFilter));
    setFiltered(result);
  }, [search, activeFilter, units]);

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F5' }}>

      {/* Teal header */}
      <div style={{ background: '#2E7D72', padding: '32px 20px 24px' }}>
        <button
          onClick={() => navigate('/select-role')}
          style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 13, color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}
        >
          ← Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M16 3L3 14h3v14h8v-8h4v8h8V14h3L16 3z" fill="white" />
          </svg>
          <span style={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, fontSize: 18, color: 'white' }}>UPAHAN</span>
        </div>
        <h1 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, fontSize: 28, color: 'white', marginBottom: 4 }}>Available Units</h1>
        <p style={{ fontFamily: 'Inter', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Zambales Properties for Rent</p>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Search bar */}
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#2E7D72' }} aria-hidden="true" />
          <input
            type="text" placeholder="Search units, location..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', height: 52, borderRadius: 8,
              background: 'white', border: '1.5px solid transparent',
              fontFamily: 'Inter', fontSize: 14, color: '#4A4A4A',
              paddingLeft: 44, paddingRight: 44, outline: 'none',
              boxShadow: '0 2px 12px rgba(46,125,114,0.10)',
              transition: 'border-color 150ms',
            }}
            onFocus={e => e.target.style.borderColor = '#2E7D72'}
            onBlur={e => e.target.style.borderColor = 'transparent'}
          />
          <SlidersHorizontal size={16} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#2E7D72' }} aria-hidden="true" />
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }} className="no-scrollbar">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              style={{
                flexShrink: 0, height: 34, paddingLeft: 14, paddingRight: 14,
                borderRadius: 999, fontFamily: 'Inter', fontWeight: 600, fontSize: 12,
                border: activeFilter === f.value ? 'none' : '1.5px solid #2E7D72',
                background: activeFilter === f.value ? '#2E7D72' : 'white',
                color: activeFilter === f.value ? 'white' : '#2E7D72',
                cursor: 'pointer', transition: 'all 150ms ease',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Unit cards */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1,2,3].map(i => <div key={i} style={{ height: 280, borderRadius: 16, background: '#F0EEEB' }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Home} title="No Units Available" message="Try adjusting your search or filters." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 24 }}>
            {filtered.map(unit => (
              <button
                key={unit.unit_id}
                onClick={() => navigate(`/units/${unit.unit_id}`)}
                style={{
                  width: '100%', borderRadius: 16, overflow: 'hidden', background: 'white',
                  boxShadow: '0 2px 12px rgba(46,125,114,0.08)', border: 'none', cursor: 'pointer', textAlign: 'left',
                  transition: 'all 200ms ease',
                }}
                onMouseOver={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(46,125,114,0.18)'; e.currentTarget.style.transform = 'scale(1.01)'; }}
                onMouseOut={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(46,125,114,0.08)'; e.currentTarget.style.transform = 'scale(1)'; }}
                aria-label={`View Unit ${unit.unit_code}`}
              >
                {/* Photo */}
                <div style={{ height: 200, background: '#F0EEEB', position: 'relative', overflow: 'hidden' }}>
                  {unit.photos?.[0] ? (
                    <img
                      src={unit.photos[0]} alt={`Unit ${unit.unit_code}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 200ms ease' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="56" height="56" viewBox="0 0 32 32" fill="none" opacity="0.2">
                        <path d="M16 3L3 14h3v14h8v-8h4v8h8V14h3L16 3z" fill="#4A4A4A" />
                      </svg>
                    </div>
                  )}

                  {/* Tag chips on photo */}
                  {unit.floor_plan && (
                    <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ background: '#2E7D72', color: 'white', fontFamily: 'Inter', fontWeight: 700, fontSize: 11, padding: '4px 10px', borderRadius: 999, letterSpacing: '0.04em' }}>
                        {unit.floor_plan.split(',')[0].trim()}
                      </span>
                    </div>
                  )}

                  {/* Price overlay */}
                  <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(4px)', borderRadius: 8, padding: '6px 10px' }}>
                    <span style={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, fontSize: 16, color: '#2E7D72' }}>
                      {formatPeso(unit.monthly_price)}
                    </span>
                    <span style={{ fontFamily: 'Inter', fontSize: 11, color: '#888888' }}>/mo</span>
                  </div>
                </div>

                {/* Card body */}
                <div style={{ padding: '14px 16px' }}>
                  <h3 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 16, color: '#4A4A4A', marginBottom: 4 }}>Unit {unit.unit_code}</h3>
                  {unit.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                      <MapPin size={12} color="#888888" aria-hidden="true" />
                      <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#888888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{unit.location}</p>
                    </div>
                  )}
                  <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#888888' }}>
                    {[unit.bedrooms, unit.floor_plan].filter(Boolean).join(' • ') || 'Unit details available'}
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
