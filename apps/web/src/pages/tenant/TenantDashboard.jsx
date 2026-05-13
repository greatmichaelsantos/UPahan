import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Clock, Wrench, CreditCard, FileText, MapPin, Bed, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import TenantLayout from '../../components/TenantLayout';
import Calendar from '../../components/Calendar';
import StatusBadge from '../../components/StatusBadge';
import PaymentDeclarationModal from '../../components/PaymentDeclarationModal';
import SubmitIdModal from '../../components/SubmitIdModal';
import api from '../../utils/api';
import { formatPeso, formatDate } from '../../utils/format';

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function TenantDashboard() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { tenantInfo } = useAuth();
  const [monthStatus, setMonthStatus]       = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [showPayModal, setShowPayModal]     = useState(false);
  const [loadingStatus, setLoadingStatus]   = useState(true);
  const [showIdModal, setShowIdModal]       = useState(false);
  const [documents, setDocuments]           = useState([]);
  const [unitDetail, setUnitDetail]         = useState(null);

  const fetchStatus = (silent = false) => {
    if (!silent) setLoadingStatus(true);
    api.get('/payments/current-month')
      .then(r => setMonthStatus(r.data.data))
      .catch(() => {})
      .finally(() => { if (!silent) setLoadingStatus(false); });
  };

  const fetchDocuments = () => {
    api.get('/documents/my-documents').then(r => setDocuments(r.data.data || [])).catch(() => {});
  };

  useEffect(() => {
    const load = (silent = false) => {
      fetchStatus(silent);
      fetchDocuments();
      api.get('/maintenance').then(r => setRecentRequests((r.data.data || []).slice(0, 2))).catch(() => {});
      api.get('/tenants/me').then(r => setUnitDetail(r.data.data)).catch(() => {});
    };
    load(false);
    const interval = setInterval(() => load(true), 30000);
    return () => clearInterval(interval);
  }, [location.key]);

  const getPaymentStatus = () => {
    if (!monthStatus?.payments?.length) return 'unpaid';
    const statuses = monthStatus.payments.map(p => p.payment_status);
    if (statuses.includes('paid')) return 'paid';
    if (statuses.includes('pending_approval')) return 'pending_approval';
    if (statuses.includes('partial')) return 'partial';
    return 'unpaid';
  };

  const payStatus = getPaymentStatus();
  const hasPending = payStatus === 'pending_approval';
  const canSubmit  = payStatus === 'unpaid' || payStatus === 'partial';

  const handlePaySuccess = () => {
    setShowPayModal(false);
    fetchStatus();
  };

  const unitPhotos = unitDetail?.unit_photos?.filter(Boolean) || [];
  const firstPhoto = unitPhotos[0] || null;

  const idDoc    = documents.find(d => d.document_type === 'valid_id');
  const contract = documents.find(d => d.document_type === 'contract');
  const canSubmitId = !idDoc || idDoc.status === 'rejected';

  return (
    <TenantLayout title="Dashboard">

      {/* ── Page content — mobile: single col, desktop: 2-col grid ── */}
      <div className="p-4 md:p-6">
        <div className="flex flex-col gap-4 md:grid md:gap-6 md:items-start" style={{ gridTemplateColumns: '1fr 380px' }}>

          {/* ── LEFT COLUMN: rent card, unit, documents ── */}
          <div className="flex flex-col gap-4">

            {/* Monthly rent card */}
            <div style={{ background: '#4A90D9', borderRadius: 16, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                <p style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 12, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  MONTHLY RENT
                </p>
                <StatusBadge status={payStatus} />
              </div>
              <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 40, color: 'white', margin: '4px 0 12px' }}>
                {formatPeso(tenantInfo?.monthly_price || 0)}
              </p>
              <p style={{ fontFamily: 'Inter', fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 4 }}>
                Next Due: {monthStatus?.nextDue ? formatDate(monthStatus.nextDue, 'medium') : '—'}
              </p>
              <p style={{ fontFamily: 'Inter', fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 16 }}>
                Assigned Unit: {tenantInfo?.unit_code || '—'}
              </p>

              {!loadingStatus && (
                hasPending ? (
                  <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 8, padding: '10px 14px', fontFamily: 'Inter', fontWeight: 600, fontSize: 13, color: 'rgba(255,255,255,0.85)', textAlign: 'center' }}>
                    Awaiting Approval — declaration submitted
                  </div>
                ) : canSubmit ? (
                  <button
                    onClick={() => setShowPayModal(true)}
                    style={{ width: '100%', height: 44, borderRadius: 8, background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.4)', color: 'white', fontFamily: 'Inter', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 150ms ease' }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                    onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                  >
                    <CreditCard size={16} aria-hidden="true" /> SUBMIT PAYMENT
                  </button>
                ) : payStatus === 'paid' ? (
                  <button
                    onClick={() => setShowPayModal(true)}
                    style={{ width: '100%', height: 44, borderRadius: 8, background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.4)', color: 'white', fontFamily: 'Inter', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 150ms ease' }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                    onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                  >
                    <CreditCard size={16} aria-hidden="true" /> PAY IN ADVANCE
                  </button>
                ) : null
              )}
            </div>

            {/* My Unit card */}
            {unitDetail && (
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.08em' }}>MY UNIT</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Home size={14} color="#4A90D9" />
                    <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 14, color: '#4A90D9' }}>{unitDetail.unit_code}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  {firstPhoto && (
                    <div style={{ width: 80, height: 80, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                      <img
                        src={`${BASE_URL}${firstPhoto}`}
                        alt="Unit"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {unitDetail.floor_plan && (
                      <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#4A4A4A', fontWeight: 600 }}>{unitDetail.floor_plan}</p>
                    )}
                    {unitDetail.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={12} color="#888" />
                        <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#888' }}>{unitDetail.location}</p>
                      </div>
                    )}
                    {unitDetail.bedrooms && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Bed size={12} color="#888" />
                        <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#888' }}>{unitDetail.bedrooms}</p>
                      </div>
                    )}
                  </div>
                </div>
                {(unitDetail.lease_start_date || unitDetail.lease_end_date) && (
                  <div style={{ marginTop: 10, background: '#F8F8F8', borderRadius: 8, padding: '8px 12px' }}>
                    <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#888', marginBottom: 2 }}>Lease Period</p>
                    <p style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 600, color: '#4A4A4A' }}>
                      {unitDetail.lease_start_date ? formatDate(unitDetail.lease_start_date, 'medium') : '—'}
                      {' – '}
                      {unitDetail.lease_end_date ? formatDate(unitDetail.lease_end_date, 'medium') : 'Ongoing'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Documents */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.08em' }}>MY DOCUMENTS</p>
                <button
                  onClick={() => navigate('/tenant/documents')}
                  style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 12, color: '#3A7BD5', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  See All
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: '#EEF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CreditCard size={18} color="#3A7BD5" />
                  </div>
                  <div>
                    <p style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13, color: '#4A4A4A' }}>Valid ID</p>
                    <p style={{ fontFamily: 'Inter', fontSize: 11, marginTop: 2, fontWeight: 600,
                      color: !idDoc ? '#AAAAAA' : idDoc.status === 'verified' ? '#4A90D9' : idDoc.status === 'rejected' ? '#D64045' : '#E07B39'
                    }}>
                      {!idDoc ? 'Not submitted' : idDoc.status === 'verified' ? '✓ Verified' : idDoc.status === 'rejected' ? '✗ Rejected' : '● Under Review'}
                    </p>
                  </div>
                </div>
                {canSubmitId && (
                  <button
                    onClick={() => setShowIdModal(true)}
                    style={{ padding: '7px 16px', background: '#3A7BD5', color: 'white', border: 'none', borderRadius: 8, fontFamily: 'Inter', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                  >
                    {idDoc?.status === 'rejected' ? 'Resubmit' : 'Submit ID'}
                  </button>
                )}
              </div>

              {idDoc?.status === 'rejected' && idDoc?.rejection_reason && (
                <div style={{ background: '#FEF2F2', borderRadius: 8, padding: '7px 10px', marginBottom: 8 }}>
                  <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#D64045' }}>Reason: {idDoc.rejection_reason}</p>
                </div>
              )}

              <div style={{ height: 1, background: '#F0EEEB', marginBottom: 8 }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: '#EBF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={18} color="#4A90D9" />
                  </div>
                  <div>
                    <p style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13, color: '#4A4A4A' }}>Lease Contract</p>
                    <p style={{ fontFamily: 'Inter', fontSize: 11, marginTop: 2, fontWeight: 600, color: contract ? '#4A90D9' : '#AAAAAA' }}>
                      {contract ? '✓ Available' : 'Not yet uploaded'}
                    </p>
                  </div>
                </div>
                {contract && (
                  <a
                    href={`${BASE_URL}/uploads/documents/${contract.contract_file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ padding: '7px 16px', background: '#EBF4FF', color: '#4A90D9', border: '1.5px solid #4A90D9', borderRadius: 8, fontFamily: 'Inter', fontWeight: 700, fontSize: 12, textDecoration: 'none' }}
                  >
                    View
                  </a>
                )}
              </div>
            </div>

          </div>{/* end left column */}

          {/* ── RIGHT COLUMN: quick actions, recent requests, calendar ── */}
          <div className="flex flex-col gap-4">

            {/* Quick actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button
                onClick={() => navigate('/tenant/payments')}
                className="card"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: 20, cursor: 'pointer', border: 'none', transition: 'all 200ms ease' }}
                onMouseOver={e => { e.currentTarget.style.background = '#EBF4FF'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'translateY(0)'; }}
                aria-label="Payment history"
              >
                <div style={{ width: 44, height: 44, borderRadius: 10, background: '#EBF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={22} color="#4A90D9" aria-hidden="true" />
                </div>
                <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 12, color: '#4A4A4A', textAlign: 'center' }}>PAYMENT HISTORY</span>
              </button>

              <button
                onClick={() => navigate('/tenant/maintenance/new')}
                className="card"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: 20, cursor: 'pointer', border: 'none', transition: 'all 200ms ease' }}
                onMouseOver={e => { e.currentTarget.style.background = '#FDF6E3'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'translateY(0)'; }}
                aria-label="Request maintenance"
              >
                <div style={{ width: 44, height: 44, borderRadius: 10, background: '#FDF6E3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Wrench size={22} color="#C9A84C" aria-hidden="true" />
                </div>
                <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 12, color: '#4A4A4A', textAlign: 'center' }}>REQUEST MAINTENANCE</span>
              </button>
            </div>

            {/* Recent requests */}
            {recentRequests.length > 0 && (
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>RECENT REQUESTS</p>
                  <button
                    onClick={() => navigate('/tenant/maintenance')}
                    style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 12, color: '#3A7BD5', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    See All
                  </button>
                </div>
                {recentRequests.map(req => (
                  <div key={req.request_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F0EEEB' }}>
                    <div>
                      <p style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: '#4A4A4A' }}>{req.subject}</p>
                      <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#888888', marginTop: 2 }}>{req.issue_category}</p>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                ))}
              </div>
            )}

            {/* Calendar */}
            <div className="card">
              <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>CALENDAR</p>
              <Calendar />
            </div>

          </div>{/* end right column */}

        </div>
      </div>

      {showPayModal && (
        <PaymentDeclarationModal
          unit={tenantInfo?.unit_code}
          monthlyRent={tenantInfo?.monthly_price}
          onClose={() => setShowPayModal(false)}
          onSuccess={handlePaySuccess}
          initialType={payStatus === 'paid' ? 'advance' : 'full'}
        />
      )}
      {showIdModal && (
        <SubmitIdModal
          onClose={() => setShowIdModal(false)}
          onSuccess={fetchDocuments}
        />
      )}

    </TenantLayout>
  );
}
