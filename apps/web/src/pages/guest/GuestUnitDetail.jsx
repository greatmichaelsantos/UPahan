import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, CheckCircle } from 'lucide-react';
import api from '../../utils/api';
import { formatPeso } from '../../utils/format';

export default function GuestUnitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [unit, setUnit]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/units/${id}`).then(r => setUnit(r.data.data)).catch(() => navigate('/units')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF8F5' }}>
      <div style={{ width: 32, height: 32, border: '4px solid #E8F5F3', borderTopColor: '#2E7D72', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );
  if (!unit) return null;

  const photos = unit.photos?.filter(Boolean) || [];

  const getFeatures = () => {
    const features = [];
    if (unit.bedrooms) features.push(unit.bedrooms);
    if (unit.floor_plan) unit.floor_plan.split(',').forEach(p => features.push(p.trim()));
    features.push('Monthly Payment', 'CCTV Security', 'Flood Free', 'Safe Neighborhood');
    return features;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F5' }}>

      {/* Photo section */}
      <div style={{ position: 'relative' }}>
        {photos.length > 0 ? (
          <div>
            <img src={photos[0]} alt={`Unit ${unit.unit_code} main photo`} style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: '0 0 0 0', display: 'block' }} />
            {photos.length > 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                {photos.slice(1, 4).map((p, i) => (
                  <img key={i} src={p} alt={`Unit photo ${i+2}`} style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ height: 260, background: '#F0EEEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="64" height="64" viewBox="0 0 32 32" fill="none" opacity="0.2">
              <path d="M16 3L3 14h3v14h8v-8h4v8h8V14h3L16 3z" fill="#4A4A4A" />
            </svg>
          </div>
        )}

        {/* Back button */}
        <button
          onClick={() => navigate('/units')}
          style={{
            position: 'absolute', top: 14, left: 14,
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          }}
          aria-label="Back to units"
        >
          <ArrowLeft size={18} color="#4A4A4A" />
        </button>

        {/* Price overlay */}
        <div style={{
          position: 'absolute', bottom: 14, right: 14,
          background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(4px)',
          borderRadius: 999, padding: '6px 12px',
          display: 'flex', alignItems: 'baseline', gap: 2,
        }}>
          <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 18, color: '#2E7D72' }}>
            {formatPeso(unit.monthly_price)}
          </span>
          <span style={{ fontFamily: 'Inter', fontSize: 12, color: '#888888' }}>/month</span>
        </div>
      </div>

      <div style={{ padding: '18px 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Title + address */}
        <div>
          <h1 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 28, color: '#4A4A4A', marginBottom: 8 }}>
            Unit {unit.unit_code} Details
          </h1>
          {unit.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={14} color="#888888" aria-hidden="true" />
              <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#888888' }}>{unit.location}</p>
            </div>
          )}
        </div>

        {/* Description */}
        {unit.description && (
          <div className="card">
            <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>ABOUT THIS UNIT</p>
            <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#4A4A4A', lineHeight: 1.6 }}>{unit.description}</p>
          </div>
        )}

        {/* Gold divider */}
        <div style={{ height: 1, background: '#C9A84C', opacity: 0.3 }} />

        {/* Specs */}
        <div>
          <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>FEATURES & DETAILS</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {getFeatures().map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#E8F5F3', borderRadius: 999, padding: '6px 12px' }}>
                <CheckCircle size={12} color="#2E7D72" aria-hidden="true" />
                <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 12, color: '#2E7D72' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gold divider */}
        <div style={{ height: 1, background: '#C9A84C', opacity: 0.3 }} />

        {/* Contact owner */}
        <div className="card">
          <p style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 20, color: '#4A4A4A', marginBottom: 16 }}>Contact Owner</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#E8F5F3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 20, color: '#2E7D72' }}>R</span>
            </div>
            <div>
              <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 16, color: '#4A4A4A' }}>RGT Real Estate</p>
              <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#888888' }}>Property Owner / Manager</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <a
              href="tel:+63171234567"
              style={{
                height: 52, borderRadius: 8, background: '#2E7D72', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: 'Inter', fontWeight: 600, fontSize: 14, textDecoration: 'none',
                transition: 'background 150ms',
              }}
              onMouseOver={e => e.currentTarget.style.background = '#1F5C56'}
              onMouseOut={e => e.currentTarget.style.background = '#2E7D72'}
            >
              <Phone size={16} aria-hidden="true" /> CALL OWNER
            </a>
            <a
              href="mailto:rgt@upahan.ph"
              style={{
                height: 52, borderRadius: 8, background: 'transparent',
                border: '1.5px solid #2E7D72', color: '#2E7D72',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: 'Inter', fontWeight: 600, fontSize: 14, textDecoration: 'none',
                transition: 'background 150ms',
              }}
              onMouseOver={e => e.currentTarget.style.background = '#E8F5F3'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
              <Mail size={16} aria-hidden="true" /> EMAIL OWNER
            </a>
          </div>
        </div>

        <button
          onClick={() => navigate('/units')}
          style={{ width: '100%', textAlign: 'center', fontFamily: 'Inter', fontSize: 13, color: '#888888', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0' }}
        >
          ← Browse More Units
        </button>
      </div>
    </div>
  );
}
