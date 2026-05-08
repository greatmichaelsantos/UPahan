import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, CheckCircle, Clock, Wrench } from 'lucide-react';
import BottomNav from '../../components/BottomNav';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import api from '../../utils/api';
import { formatDate, categoryLabel } from '../../utils/format';

export default function TenantMaintenanceHistory() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);

  const load = (silent = false) => {
    if (!silent) setLoading(true);
    api.get('/maintenance')
      .then(r => setRequests(r.data.data || []))
      .catch(() => {})
      .finally(() => { if (!silent) setLoading(false); });
  };

  useEffect(() => {
    load(false);
    const interval = setInterval(() => load(true), 30000);
    return () => clearInterval(interval);
  }, [location.key]);

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F5', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: 'white', padding: '20px 20px 16px', borderBottom: '1px solid #F0EEEB' }}>
        <h1 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, fontSize: 28, color: '#4A4A4A', marginBottom: 4 }}>
          Maintenance
        </h1>
        <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#888888' }}>Your maintenance request history</p>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* New request button */}
        <button
          onClick={() => navigate('/tenant/maintenance/new')}
          style={{
            height: 52, borderRadius: 8, background: '#3A7BD5', color: 'white',
            border: 'none', width: '100%', cursor: 'pointer',
            fontFamily: 'Inter', fontWeight: 600, fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 150ms ease',
          }}
          onMouseOver={e => e.currentTarget.style.background = '#2f6abf'}
          onMouseOut={e => e.currentTarget.style.background = '#3A7BD5'}
        >
          <Plus size={18} aria-hidden="true" /> NEW MAINTENANCE REQUEST
        </button>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1,2,3].map(i => <div key={i} className="card" style={{ height: 76, background: '#F0EEEB' }} />)}
          </div>
        ) : requests.length === 0 ? (
          <EmptyState icon={CheckCircle} title="No Requests Yet" message="Submit a new request if you have a maintenance issue." />
        ) : (
          <>
            {/* HISTORY label with gold line */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                HISTORY
              </p>
              <div style={{ flex: 1, height: 1, background: '#C9A84C', opacity: 0.3 }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {requests.map(req => {
                const isDone = req.status === 'completed';
                return (
                  <div key={req.request_id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* Status icon */}
                    <div style={{
                      width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                      background: isDone ? '#E8F5F3' : '#FEF3EC',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isDone
                        ? <CheckCircle size={20} color="#2E7D72" aria-hidden="true" />
                        : <Clock size={20} color="#E07B39" aria-hidden="true" />
                      }
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 15, color: '#4A4A4A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {req.subject}
                      </p>
                      <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#888888', marginTop: 2 }}>
                        {formatDate(req.report_date, 'short')} • {categoryLabel(req.issue_category)}
                      </p>
                    </div>

                    <StatusBadge status={req.status} />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <BottomNav role="tenant" />
    </div>
  );
}
