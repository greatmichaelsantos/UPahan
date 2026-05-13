import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Plus, ChevronRight, Home } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import SectionHeader from '../../components/SectionHeader';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import api from '../../utils/api';
import { formatPeso } from '../../utils/format';

const UNIT_COLORS_TEAL = ['#2E7D72', '#1F5C56', '#3A7BD5', '#C9A84C', '#E07B39', '#4A4A4A'];

export default function AdminUnitList() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [units, setUnits]   = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (q = '', silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = q ? `?search=${encodeURIComponent(q)}` : '';
      const res = await api.get(`/units${params}`);
      setUnits(res.data.data || []);
    } catch (e) { console.error(e); }
    finally { if (!silent) setLoading(false); }
  };

  useEffect(() => {
    load('', false);
    const interval = setInterval(() => load('', true), 30000);
    return () => clearInterval(interval);
  }, [location.key]);
  useEffect(() => { const t = setTimeout(() => load(search), 350); return () => clearTimeout(t); }, [search]);

  const unitColor = (code) => {
    const i = (code?.charCodeAt(0) || 0) % UNIT_COLORS_TEAL.length;
    return UNIT_COLORS_TEAL[i];
  };

  const isVacant = (u) => u.vacancy_status === 'vacant';

  return (
    <AdminLayout title="Units">
      <SectionHeader label="Inventory" title="Unit List" />

      <div style={{ padding: '16px 16px 100px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#888888' }} aria-hidden="true" />
          <input
            type="text" placeholder="Search units..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', height: 52, borderRadius: 8, paddingLeft: 44, paddingRight: 14,
              background: 'white', border: '1.5px solid transparent', fontFamily: 'Inter', fontSize: 14, color: '#4A4A4A',
              outline: 'none', boxShadow: '0 2px 8px rgba(46,125,114,0.06)', transition: 'border-color 150ms',
            }}
            onFocus={e => { e.target.style.borderColor = '#2E7D72'; }}
            onBlur={e => { e.target.style.borderColor = 'transparent'; }}
          />
        </div>

        {/* Unit list */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3].map(i => <div key={i} className="card" style={{ height: 88, background: '#F0EEEB', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
          </div>
        ) : units.length === 0 ? (
          <EmptyState
            icon={Home}
            title="No Units Yet"
            message="Add your first unit to get started."
            action={
              <button
                onClick={() => navigate('/admin/units/new')}
                style={{ height: 52, paddingLeft: 24, paddingRight: 24, background: '#2E7D72', color: 'white', border: 'none', borderRadius: 8, fontFamily: 'Inter', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
              >
                + ADD NEW UNIT
              </button>
            }
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {units.map(unit => {
              const color = isVacant(unit) ? '#C9A84C' : unitColor(unit.unit_code);
              return (
                <button
                  key={unit.unit_id}
                  onClick={() => navigate(`/admin/units/${unit.unit_id}`)}
                  className="card"
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', width: '100%', textAlign: 'left', cursor: 'pointer', border: 'none', transition: 'all 200ms ease' }}
                  onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(46,125,114,0.15)'; }}
                  onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(46,125,114,0.08)'; }}
                >
                  {/* Unit code badge */}
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 14, color: 'white', letterSpacing: '0.04em' }}>
                      {unit.unit_code}
                    </span>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                      <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 15, color: '#4A4A4A' }}>Unit {unit.unit_code}</span>
                      <StatusBadge status={unit.vacancy_status} />
                    </div>
                    <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#888888', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {unit.tenant_name || 'No tenant assigned'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 13, color: '#2E7D72' }}>{formatPeso(unit.monthly_price)}</span>
                      {unit.bedrooms && (
                        <>
                          <span style={{ color: '#F0EEEB' }}>•</span>
                          <span style={{ fontFamily: 'Inter', fontSize: 11, color: '#888888' }}>{unit.bedrooms}</span>
                        </>
                      )}
                      {unit.payment_status && (
                        <>
                          <span style={{ color: '#F0EEEB' }}>•</span>
                          <StatusBadge status={unit.payment_status} />
                        </>
                      )}
                    </div>
                  </div>

                  <ChevronRight size={16} color="#F0EEEB" />
                </button>
              );
            })}
          </div>
        )}

        {/* Add new unit button */}
        <button
          onClick={() => navigate('/admin/units/new')}
          style={{
            width: '100%', height: 52, borderRadius: 8,
            border: '1.5px solid #2E7D72', background: 'transparent',
            color: '#2E7D72', fontFamily: 'Inter', fontWeight: 600, fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            cursor: 'pointer', transition: 'all 150ms ease',
          }}
          onMouseOver={e => { e.currentTarget.style.background = '#E8F5F3'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <Plus size={18} aria-hidden="true" /> ADD NEW UNIT
        </button>
      </div>
    </AdminLayout>
  );
}
