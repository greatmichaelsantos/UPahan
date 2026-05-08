import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Wrench, TrendingUp, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout';
import Calendar from '../../components/Calendar';
import SectionHeader from '../../components/SectionHeader';
import NotificationBell from '../../components/NotificationBell';
import api from '../../utils/api';

export default function AdminDashboard() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user } = useAuth();
  const [summary, setSummary]                 = useState({ percentage: 0, paid: 0, occupied: 0 });
  const [pendingCount, setPendingCount]       = useState(0);
  const [paymentPending, setPaymentPending]   = useState(0);

  useEffect(() => {
    const fetch = () => {
      api.get('/units/collection-summary').then(r => setSummary(r.data.data)).catch(() => {});
      api.get('/maintenance?status=pending').then(r => setPendingCount(r.data.data?.length || 0)).catch(() => {});
      api.get('/payments/pending').then(r => setPaymentPending(r.data.data?.length || 0)).catch(() => {});
    };
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, [location.key]);

  const monthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const onTrack = summary.percentage >= 80 ? 'ON TRACK' : summary.percentage >= 50 ? 'IN PROGRESS' : 'NEEDS ATTENTION';
  const onTrackColor = summary.percentage >= 80 ? '#2E7D72' : summary.percentage >= 50 ? '#E07B39' : '#D64045';

  return (
    <AdminLayout>
      <SectionHeader label="Landlord" title="Property Overview">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'Inter', fontSize: 13 }}>
            Welcome back, {user?.first_name}
          </p>
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: 4 }}>
            <NotificationBell />
          </div>
        </div>
      </SectionHeader>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Rent Collection Card */}
        <div className="card" style={{ padding: 20 }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 11, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                RENT COLLECTION
              </p>
              <span style={{ display: 'inline-block', background: '#E8F5F3', color: onTrackColor, borderRadius: 999, padding: '3px 10px', fontFamily: 'Inter', fontWeight: 600, fontSize: 11, letterSpacing: '0.04em' }}>
                {onTrack}
              </span>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#E8F5F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} color="#2E7D72" aria-hidden="true" />
            </div>
          </div>

          <p style={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, fontSize: 48, color: '#4A4A4A', lineHeight: 1, margin: '8px 0 4px' }}>
            {summary.percentage}%
          </p>
          <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#888888', marginBottom: 12 }}>
            COLLECTED THIS MONTH — {monthName}
          </p>
          <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#888888', marginBottom: 10 }}>
            {summary.paid}/{summary.occupied} units paid
          </p>

          {/* Progress bar */}
          <div style={{ background: '#F0EEEB', borderRadius: 999, height: 8, overflow: 'hidden' }}>
            <div style={{ width: `${summary.percentage}%`, background: '#2E7D72', height: '100%', borderRadius: 999, transition: 'width 700ms ease' }} />
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <button
            onClick={() => navigate('/admin/units/new')}
            className="card"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 20, cursor: 'pointer', border: 'none', transition: 'all 200ms ease' }}
            onMouseOver={e => { e.currentTarget.style.background = '#E8F5F3'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'translateY(0)'; }}
            aria-label="Add new unit"
          >
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#E8F5F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={24} color="#2E7D72" aria-hidden="true" />
            </div>
            <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13, color: '#4A4A4A', textAlign: 'center' }}>ADD NEW UNIT</span>
          </button>

          <button
            onClick={() => navigate('/admin/maintenance')}
            className="card"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 20, cursor: 'pointer', border: 'none', transition: 'all 200ms ease' }}
            onMouseOver={e => { e.currentTarget.style.background = '#FDF6E3'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'translateY(0)'; }}
            aria-label="Fix requests"
          >
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#FDF6E3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wrench size={24} color="#C9A84C" aria-hidden="true" />
            </div>
            <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13, color: '#4A4A4A', textAlign: 'center' }}>FIX REQUESTS</span>
            {pendingCount > 0 && (
              <span style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 600, color: '#C9A84C' }}>
                {pendingCount} pending request{pendingCount !== 1 ? 's' : ''}
              </span>
            )}
          </button>
        </div>

        {/* Payment requests quick action */}
        <button
          onClick={() => navigate('/admin/payments')}
          className="card"
          style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', cursor: 'pointer', border: 'none', transition: 'all 200ms ease', width: '100%', textAlign: 'left' }}
          onMouseOver={e => { e.currentTarget.style.background = '#E8F5F3'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'translateY(0)'; }}
          aria-label="Payment requests"
        >
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#E8F5F3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CreditCard size={24} color="#2E7D72" aria-hidden="true" />
          </div>
          <div>
            <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 14, color: '#4A4A4A', marginBottom: 2 }}>PAYMENT REQUESTS</p>
            <p style={{ fontFamily: 'Inter', fontSize: 12, color: paymentPending > 0 ? '#C9A84C' : '#888888', fontWeight: paymentPending > 0 ? 600 : 400 }}>
              {paymentPending > 0 ? `${paymentPending} pending review` : 'No pending declarations'}
            </p>
          </div>
        </button>

        {/* Calendar */}
        <div className="card" style={{ padding: 16 }}>
          <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            CALENDAR
          </p>
          <Calendar />
        </div>

      </div>
    </AdminLayout>
  );
}
