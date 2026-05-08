import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Download, Info, Receipt, AlertCircle } from 'lucide-react';
import BottomNav from '../../components/BottomNav';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import api from '../../utils/api';
import { formatPeso, formatDate, formatMonthYear } from '../../utils/format';

const STATUS_COLOR = {
  paid:             '#2E7D72',
  partial:          '#3A5BA0',
  late:             '#D64045',
  pending_approval: '#E07B39',
  rejected:         '#D64045',
  unpaid:           '#D64045',
  advance:          '#2E7D72',
};

const STATUS_BG = {
  paid:             '#F0F9F7',
  partial:          '#EEF1FA',
  late:             '#FEF2F2',
  pending_approval: '#FFF8EC',
  rejected:         '#FEF2F2',
  unpaid:           '#FDECEA',
  advance:          '#F0F9F7',
};

const LEGEND = [
  { status: 'paid',             label: 'Paid',            color: '#2E7D72' },
  { status: 'partial',          label: 'Partial',         color: '#3A5BA0' },
  { status: 'pending_approval', label: 'Pending Review',  color: '#E07B39' },
  { status: 'late',             label: 'Late',            color: '#D64045' },
  { status: 'rejected',         label: 'Rejected',        color: '#D64045' },
];

const METHOD_LABEL = { Cash: 'Cash', GCash: 'GCash', Maya: 'Maya', 'Bank Transfer': 'Bank Transfer', Other: 'Other' };

export default function TenantPaymentHistory() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [payments, setPayments]         = useState([]);
  const [declarations, setDeclarations] = useState([]);
  const [summary, setSummary]           = useState({ totalPaid: 0, totalPending: 0 });
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState('history');

  const load = useCallback((silent = false) => {
    if (!silent) setLoading(true);
    Promise.all([
      api.get('/payments'),
      api.get('/payments/summary'),
      api.get('/payments/my-declarations'),
    ])
      .then(([pRes, sRes, dRes]) => {
        setPayments(pRes.data.data || []);
        setSummary(sRes.data.data || { totalPaid: 0, totalPending: 0 });
        setDeclarations(dRes.data.data || []);
      })
      .catch(() => {})
      .finally(() => { if (!silent) setLoading(false); });
  }, []);

  useEffect(() => {
    load(false);
    const interval = setInterval(() => load(true), 30000);
    return () => clearInterval(interval);
  }, [load, location.key]);

  const groupByMonth = (items) => {
    const groups = {};
    items.forEach(p => {
      const key = p.month_covered || p.payment_date?.substring(0, 7) || 'unknown';
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  };

  const getMonthStatus = (entries) => {
    const statuses = entries.map(e => e.payment_status);
    if (statuses.every(s => s === 'paid')) return 'paid';
    if (statuses.some(s => s === 'late')) return 'late';
    if (statuses.some(s => s === 'partial')) return 'partial';
    return entries[0]?.payment_status || 'unpaid';
  };

  const grouped = groupByMonth(payments);
  const pendingCount = declarations.filter(d => d.payment_status === 'pending_approval').length;

  const tabStyle = (active) => ({
    flex: 1, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer',
    fontFamily: 'Inter', fontWeight: 600, fontSize: 13,
    background: active ? '#3A7BD5' : '#F0EEEB',
    color: active ? 'white' : '#888888',
    transition: 'all 150ms ease', position: 'relative',
  });

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F5', paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ background: 'white', padding: '16px 20px', borderBottom: '1px solid #F0EEEB' }}>
        <button
          onClick={() => navigate('/tenant')}
          style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 13, color: '#3A7BD5', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}
        >
          ← Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, fontSize: 26, color: '#4A4A4A' }}>Payments</h1>
          <button
            style={{ width: 42, height: 42, borderRadius: 10, background: '#F0EEEB', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            aria-label="Download payment history"
          >
            <Download size={18} color="#4A4A4A" />
          </button>
        </div>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Summary card */}
        {loading ? (
          <div className="card" style={{ height: 80, background: '#F0EEEB' }} />
        ) : (
          <div className="card">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              <div style={{ paddingRight: 16, borderRight: '1px solid #C9A84C' }}>
                <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>PAID</p>
                <p style={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, fontSize: 22, color: '#2E7D72' }}>{formatPeso(summary.totalPaid)}</p>
              </div>
              <div style={{ paddingLeft: 16 }}>
                <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>PENDING</p>
                <p style={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, fontSize: 22, color: '#E07B39' }}>{formatPeso(summary.totalPending)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Color legend */}
        <div className="card" style={{ padding: '10px 14px' }}>
          <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>STATUS LEGEND</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px' }}>
            {LEGEND.map(({ status, label, color }) => (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
                <span style={{ fontFamily: 'Inter', fontSize: 11, color: '#555', fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={tabStyle(activeTab === 'history')} onClick={() => setActiveTab('history')}>
            HISTORY
          </button>
          <button style={tabStyle(activeTab === 'declarations')} onClick={() => setActiveTab('declarations')}>
            MY DECLARATIONS
            {pendingCount > 0 && (
              <span style={{
                position: 'absolute', top: -6, right: -6,
                background: '#D64045', color: 'white', fontSize: 10, fontWeight: 700,
                width: 18, height: 18, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter',
              }}>
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* History tab */}
        {activeTab === 'history' && (
          !loading && grouped.length === 0 ? (
            <EmptyState icon={Receipt} title="No Payments Recorded" message="Your verified payment history will appear here." />
          ) : (
            grouped.map(([month, entries]) => (
              <div key={month}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingLeft: 2, paddingRight: 2 }}>
                  <p style={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, fontSize: 16, color: '#4A4A4A' }}>
                    {formatMonthYear(month)}
                  </p>
                  <StatusBadge status={getMonthStatus(entries)} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {entries.map((entry) => {
                    const status = entry.payment_status;
                    const color = STATUS_COLOR[status] || '#888';
                    const bg    = STATUS_BG[status] || 'white';
                    return (
                      <div
                        key={entry.payment_id}
                        style={{
                          background: 'white', borderRadius: 12,
                          borderLeft: `4px solid ${color}`,
                          boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                          overflow: 'hidden',
                        }}
                      >
                        <div style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                            <div>
                              <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 18, color, marginBottom: 2 }}>
                                {formatPeso(entry.amount)}
                              </p>
                              <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#888' }}>
                                {entry.payment_type === 'full' ? 'Full Payment' : entry.payment_type === 'partial' ? 'Partial Payment' : 'Advance Payment'}
                                {entry.payment_method ? ` • ${entry.payment_method}` : ''}
                              </p>
                            </div>
                            <StatusBadge status={status} />
                          </div>
                          <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#AAAAAA', marginBottom: entry.remaining_balance != null ? 4 : 0 }}>
                            {formatDate(entry.payment_date, 'long')}
                          </p>
                          {entry.remaining_balance != null && entry.remaining_balance > 0 && (
                            <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#3A5BA0', fontWeight: 600 }}>
                              Remaining balance: {formatPeso(entry.remaining_balance)}
                            </p>
                          )}
                          {entry.rejection_reason && (
                            <div style={{ marginTop: 8, background: '#FEF2F2', borderRadius: 8, padding: '6px 10px' }}>
                              <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#D64045' }}>
                                Rejected: {entry.rejection_reason}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )
        )}

        {/* Declarations tab */}
        {activeTab === 'declarations' && (
          !loading && declarations.length === 0 ? (
            <EmptyState icon={Receipt} title="No Declarations Yet" message="Declarations you submit will appear here." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {declarations.map(d => {
                const status = d.payment_status;
                const color  = STATUS_COLOR[status] || '#888';
                return (
                  <div
                    key={d.payment_id}
                    style={{ background: 'white', borderRadius: 12, borderLeft: `4px solid ${color}`, boxShadow: '0 1px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}
                  >
                    <div style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div>
                          <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 18, color, marginBottom: 2 }}>
                            {formatPeso(d.amount)}
                          </p>
                          <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#888' }}>
                            {d.payment_type ? (d.payment_type === 'full' ? 'Full' : 'Partial') : ''}{d.payment_method ? ` • ${d.payment_method}` : ''}
                            {d.reference_number ? ` • Ref: ${d.reference_number}` : ''}
                          </p>
                        </div>
                        <StatusBadge status={status} />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                        <div>
                          <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Payment Date</p>
                          <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#4A4A4A', fontWeight: 600 }}>{formatDate(d.payment_date, 'medium')}</p>
                        </div>
                        <div>
                          <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Submitted</p>
                          <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#4A4A4A', fontWeight: 600 }}>{formatDate(d.created_at, 'medium')}</p>
                        </div>
                      </div>

                      {d.remaining_balance != null && d.remaining_balance > 0 && (
                        <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#3A5BA0', fontWeight: 600, marginBottom: 8 }}>
                          Remaining balance: {formatPeso(d.remaining_balance)}
                        </p>
                      )}

                      {d.proof_of_payment && (
                        <a
                          href={d.proof_of_payment}
                          target="_blank"
                          rel="noreferrer"
                          style={{ display: 'inline-block', marginBottom: 10, fontFamily: 'Inter', fontSize: 12, color: '#3A7BD5', fontWeight: 600, textDecoration: 'underline' }}
                        >
                          View Proof of Payment
                        </a>
                      )}

                      {status === 'rejected' && d.rejection_reason && (
                        <div style={{ background: '#FEF2F2', border: '1px solid #D64045', borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <AlertCircle size={14} color="#D64045" style={{ flexShrink: 0, marginTop: 2 }} />
                          <div>
                            <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 12, color: '#D64045', marginBottom: 2 }}>Rejection Reason</p>
                            <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#D64045', lineHeight: 1.5 }}>{d.rejection_reason}</p>
                          </div>
                        </div>
                      )}

                      {status === 'pending_approval' && (
                        <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#E07B39', fontStyle: 'italic' }}>
                          Waiting for landlord review...
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* Disclaimer */}
        <div style={{ background: '#FDF6E3', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <Info size={16} color="#C9A84C" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
          <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#4A4A4A', lineHeight: 1.5, fontStyle: 'italic' }}>
            Verified payments appear in History. Declarations you submit appear in My Declarations until the landlord approves or rejects them.
          </p>
        </div>

      </div>

      <BottomNav role="tenant" />
    </div>
  );
}
