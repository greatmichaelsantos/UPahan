import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Users } from 'lucide-react';
import api from '../utils/api';
import { formatPeso } from '../utils/format';

const OVERLAY = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 16,
};
const MODAL = {
  background: 'white', borderRadius: 16, width: '100%', maxWidth: 480,
  boxShadow: '0 8px 40px rgba(0,0,0,0.18)', maxHeight: '90vh', overflowY: 'auto',
};

function friendlyAssignError(msg) {
  if (!msg) return 'Something went wrong. Please try again.';
  const lower = msg.toLowerCase();
  if (lower.includes('already has an active tenancy') || lower.includes('already assigned')) {
    return 'This tenant is already assigned to a unit. Please unassign them first.';
  }
  if (lower.includes('not vacant') || lower.includes('already occupied')) {
    return 'This unit is already occupied.';
  }
  return 'Something went wrong. Please try again.';
}

export default function AssignTenantModal({ unit, onClose, onSuccess }) {
  const [tenants, setTenants]         = useState([]);
  const [search, setSearch]           = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [leaseStart, setLeaseStart]   = useState('');
  const [leaseEnd, setLeaseEnd]       = useState('');
  const [monthlyRent, setMonthlyRent] = useState(String(unit?.monthly_price || ''));
  const [loading, setLoading]         = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');

  // Close on Escape
  const handleKey = useCallback((e) => { if (e.key === 'Escape') onClose(); }, [onClose]);
  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  // Fetch unassigned tenant users
  useEffect(() => {
    api.get('/users/unassigned-tenants')
      .then(r => setTenants(r.data.data || []))
      .catch(() => setTenants([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = tenants.filter(t => {
    const q = search.toLowerCase();
    return (
      t.first_name?.toLowerCase().includes(q) ||
      t.last_name?.toLowerCase().includes(q) ||
      t.email?.toLowerCase().includes(q)
    );
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedUser) { setError('Please select a tenant.'); return; }
    if (!leaseStart || !leaseEnd) { setError('Please enter lease start and end dates.'); return; }
    if (new Date(leaseEnd) <= new Date(leaseStart)) { setError('Lease end date must be after start date.'); return; }

    setSubmitting(true);
    try {
      await api.post('/tenants', {
        userId: selectedUser.user_id,
        unitId: unit.unit_id,
        leaseStartDate: leaseStart,
        leaseEndDate: leaseEnd,
      });
      setSuccess(`Tenant successfully assigned to Unit ${unit.unit_code}.`);
      setTimeout(() => { onSuccess(); }, 1500);
    } catch (err) {
      setError(friendlyAssignError(err.response?.data?.message));
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%', height: 44, borderRadius: 8, background: '#F0EEEB',
    border: '1.5px solid transparent', fontFamily: 'Inter', fontSize: 14,
    color: '#4A4A4A', padding: '0 12px', outline: 'none',
  };
  const labelStyle = {
    display: 'block', fontFamily: 'Inter', fontWeight: 600, fontSize: 11,
    color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5,
  };

  return (
    <div style={OVERLAY} onClick={onClose} role="dialog" aria-modal="true" aria-label="Assign Tenant">
      <div style={MODAL} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ background: '#2E7D72', borderRadius: '16px 16px 0 0', padding: '20px 20px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              INVENTORY
            </p>
            <h2 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, fontSize: 22, color: 'white' }}>
              Assign Tenant
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Unit summary */}
          <div style={{ background: '#E8F5F3', borderRadius: 10, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#888888', marginBottom: 2 }}>Unit</p>
              <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 16, color: '#2E7D72' }}>{unit?.unit_code}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#888888', marginBottom: 2 }}>Monthly Price</p>
              <p style={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, fontSize: 16, color: '#2E7D72' }}>{formatPeso(unit?.monthly_price)}</p>
            </div>
          </div>

          {error && (
            <div style={{ background: '#FDEEEE', border: '1px solid #D64045', borderRadius: 8, padding: '10px 14px', color: '#D64045', fontSize: 13, fontFamily: 'Inter' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ background: '#E8F5F3', border: '1px solid #2E7D72', borderRadius: 8, padding: '10px 14px', color: '#2E7D72', fontSize: 13, fontFamily: 'Inter', fontWeight: 600 }}>
              {success}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ width: 28, height: 28, border: '4px solid #E8F5F3', borderTopColor: '#2E7D72', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            </div>
          ) : tenants.length === 0 ? (
            /* Empty state — no tenant accounts */
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#F0EEEB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Users size={28} color="#888888" />
              </div>
              <p style={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, fontSize: 18, color: '#4A4A4A', marginBottom: 8 }}>
                No Tenant Accounts Found
              </p>
              <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#888888', lineHeight: 1.5, maxWidth: 300, margin: '0 auto 20px' }}>
                The tenant must create an account first before they can be assigned to a unit.
              </p>
              <button onClick={onClose} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 8, background: '#E0DDD8', color: '#4A4A4A', border: 'none', fontFamily: 'Inter', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                CLOSE
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Tenant search */}
              <div>
                <label style={labelStyle}>Select Tenant</label>
                <div style={{ position: 'relative', marginBottom: 8 }}>
                  <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#888888' }} aria-hidden="true" />
                  <input
                    type="text" placeholder="Search by name or email..."
                    value={search} onChange={e => setSearch(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: 36 }}
                    onFocus={e => { e.target.style.borderColor = '#2E7D72'; e.target.style.background = '#E8F5F3'; }}
                    onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.background = '#F0EEEB'; }}
                  />
                </div>

                <div style={{ border: '1px solid #F0EEEB', borderRadius: 8, maxHeight: 160, overflowY: 'auto' }}>
                  {filtered.length === 0 ? (
                    <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#888888', padding: '12px 14px', textAlign: 'center' }}>No matching tenants</p>
                  ) : filtered.map(t => (
                    <button
                      key={t.user_id} type="button"
                      onClick={() => setSelectedUser(t)}
                      style={{
                        width: '100%', textAlign: 'left', padding: '10px 14px',
                        border: 'none', borderBottom: '1px solid #F0EEEB',
                        background: selectedUser?.user_id === t.user_id ? '#E8F5F3' : 'white',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                        transition: 'background 100ms',
                      }}
                      onMouseOver={e => { if (selectedUser?.user_id !== t.user_id) e.currentTarget.style.background = '#FAF8F5'; }}
                      onMouseOut={e => { if (selectedUser?.user_id !== t.user_id) e.currentTarget.style.background = 'white'; }}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: selectedUser?.user_id === t.user_id ? '#2E7D72' : '#F0EEEB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 13, color: selectedUser?.user_id === t.user_id ? 'white' : '#888888' }}>
                          {t.first_name?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: '#4A4A4A' }}>
                          {t.first_name} {t.last_name}
                        </p>
                        <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#888888' }}>{t.email}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {selectedUser && (
                  <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#2E7D72', marginTop: 6, fontWeight: 600 }}>
                    ✓ Selected: {selectedUser.first_name} {selectedUser.last_name}
                  </p>
                )}
              </div>

              {/* Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={labelStyle}>Lease Start</label>
                  <input type="date" value={leaseStart} onChange={e => setLeaseStart(e.target.value)}
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#2E7D72'; e.target.style.background = '#E8F5F3'; }}
                    onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.background = '#F0EEEB'; }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Lease End</label>
                  <input type="date" value={leaseEnd} onChange={e => setLeaseEnd(e.target.value)}
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#2E7D72'; e.target.style.background = '#E8F5F3'; }}
                    onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.background = '#F0EEEB'; }}
                  />
                </div>
              </div>

              {/* Monthly rent */}
              <div>
                <label style={labelStyle}>Monthly Rent (₱)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontFamily: 'Inter', fontWeight: 700, color: '#2E7D72', fontSize: 15 }}>₱</span>
                  <input type="number" value={monthlyRent} onChange={e => setMonthlyRent(e.target.value)}
                    min="0" style={{ ...inputStyle, paddingLeft: 28 }}
                    onFocus={e => { e.target.style.borderColor = '#2E7D72'; e.target.style.background = '#E8F5F3'; }}
                    onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.background = '#F0EEEB'; }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
                <button
                  type="submit" disabled={submitting || !!success}
                  style={{
                    height: 52, borderRadius: 8, background: submitting ? '#888888' : '#2E7D72',
                    color: 'white', border: 'none', width: '100%',
                    fontFamily: 'Inter', fontWeight: 600, fontSize: 14,
                    cursor: (submitting || success) ? 'not-allowed' : 'pointer',
                    opacity: (submitting || success) ? 0.7 : 1, transition: 'all 150ms ease',
                  }}
                  onMouseOver={e => { if (!submitting && !success) e.currentTarget.style.background = '#1F5C56'; }}
                  onMouseOut={e => { if (!submitting && !success) e.currentTarget.style.background = '#2E7D72'; }}
                >
                  {submitting ? 'Assigning...' : 'CONFIRM ASSIGNMENT'}
                </button>
                <button
                  type="button" onClick={onClose} disabled={submitting}
                  style={{
                    height: 52, borderRadius: 8, background: 'transparent',
                    color: '#888888', border: '1.5px solid #E0DDD8', width: '100%',
                    fontFamily: 'Inter', fontWeight: 600, fontSize: 14,
                    cursor: submitting ? 'not-allowed' : 'pointer', transition: 'all 150ms ease',
                  }}
                  onMouseOver={e => { if (!submitting) e.currentTarget.style.background = '#F0EEEB'; }}
                  onMouseOut={e => { if (!submitting) e.currentTarget.style.background = 'transparent'; }}
                >
                  CANCEL
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
