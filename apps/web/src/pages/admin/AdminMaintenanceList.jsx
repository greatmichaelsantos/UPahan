import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Info, Wrench } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import SectionHeader from '../../components/SectionHeader';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import api from '../../utils/api';
import { timeAgo, categoryLabel } from '../../utils/format';

const PRIORITY_COLORS = { high: '#D64045', medium: '#E07B39', low: '#888888' };

const filters = [
  { value: 'all',         label: 'All' },
  { value: 'pending',     label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed',  label: 'Completed' },
];

export default function AdminMaintenanceList() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const res = await api.get(`/maintenance${params}`);
      setRequests(res.data.data || []);
    } catch (e) { console.error(e); }
    finally { if (!silent) setLoading(false); }
  };

  useEffect(() => {
    load(false);
    const interval = setInterval(() => load(true), 30000);
    return () => clearInterval(interval);
  }, [filter, location.key]);

  const handleResolve = async (e, id) => {
    e.stopPropagation();
    try {
      await api.put(`/maintenance/${id}`, { status: 'completed' });
      load();
    } catch (err) { console.error(err); }
  };

  return (
    <AdminLayout title="Fix Requests">
      <SectionHeader label="Maintenance" title="Fix Requests" />

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Info banner */}
        <div style={{ background: '#FDF6E3', borderLeft: '3px solid #C9A84C', borderRadius: 8, padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <Info size={16} color="#C9A84C" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
          <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#4A4A4A', lineHeight: 1.5 }}>
            Select a request to view details and take action.
          </p>
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }} className="no-scrollbar">
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              style={{
                flexShrink: 0, height: 34, paddingLeft: 14, paddingRight: 14,
                borderRadius: 999, fontFamily: 'Inter', fontWeight: 600, fontSize: 12,
                border: filter === f.value ? 'none' : '1px solid #F0EEEB',
                background: filter === f.value ? '#2E7D72' : 'white',
                color: filter === f.value ? 'white' : '#888888',
                cursor: 'pointer', transition: 'all 150ms ease',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Request cards */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3].map(i => <div key={i} className="card" style={{ height: 110, background: '#F0EEEB' }} />)}
          </div>
        ) : requests.length === 0 ? (
          <EmptyState icon={Wrench} title="No Requests" message="All clear — no maintenance requests at this time." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {requests.map(req => {
              const priColor = PRIORITY_COLORS[req.priority_level] || '#888888';
              return (
                <div
                  key={req.request_id}
                  onClick={() => navigate(`/admin/maintenance/${req.request_id}`)}
                  className="card"
                  style={{ borderLeft: `3px solid ${priColor}`, cursor: 'pointer', transition: 'all 200ms ease' }}
                  onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(46,125,114,0.15)'; }}
                  onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(46,125,114,0.08)'; }}
                >
                  {/* Top row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ background: '#2E7D72', color: 'white', fontFamily: 'Inter', fontWeight: 700, fontSize: 10, padding: '3px 8px', borderRadius: 4, letterSpacing: '0.04em' }}>
                        UNIT {req.unit_code}
                      </span>
                      <StatusBadge status={req.priority_level} />
                    </div>
                    <StatusBadge status={req.status} />
                  </div>

                  {/* Subject */}
                  <p style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 15, color: '#4A4A4A', marginBottom: 4 }}>
                    {req.subject}
                  </p>

                  {/* Reporter + time */}
                  <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#888888' }}>
                    {req.tenant_name} • {timeAgo(req.report_date)}
                  </p>
                  <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#888888', marginTop: 2 }}>
                    {categoryLabel(req.issue_category)}
                  </p>

                  {/* Actions */}
                  {req.status !== 'completed' && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid #F0EEEB' }}>
                      <button
                        onClick={(e) => handleResolve(e, req.request_id)}
                        style={{
                          flex: 1, height: 40, borderRadius: 8, background: '#E8F5F3', color: '#2E7D72',
                          border: 'none', fontFamily: 'Inter', fontWeight: 700, fontSize: 12,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          cursor: 'pointer', transition: 'background 150ms',
                        }}
                        onMouseOver={e => e.currentTarget.style.background = '#2E7D72' && (e.currentTarget.style.color = 'white')}
                        onMouseOut={e => { e.currentTarget.style.background = '#E8F5F3'; e.currentTarget.style.color = '#2E7D72'; }}
                      >
                        <CheckCircle size={14} aria-hidden="true" /> RESOLVED
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/admin/maintenance/${req.request_id}`); }}
                        style={{
                          flex: 1, height: 40, borderRadius: 8, background: 'transparent',
                          border: '1.5px solid #2E7D72', color: '#2E7D72',
                          fontFamily: 'Inter', fontWeight: 700, fontSize: 12,
                          cursor: 'pointer', transition: 'all 150ms',
                        }}
                        onMouseOver={e => e.currentTarget.style.background = '#E8F5F3'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                      >
                        DETAIL
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
