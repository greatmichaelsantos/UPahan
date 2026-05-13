import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Wrench, TrendingUp, CreditCard } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import Calendar from '../../components/Calendar';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useAuth();
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

  return (
    <AdminLayout title="Dashboard">

      {/* ── Page content — mobile: single col, desktop: 2-col grid ── */}
      <div className="p-4 md:p-6">
        <div className="flex flex-col gap-4 md:grid md:gap-6 md:items-start" style={{ gridTemplateColumns: '1fr 380px' }}>

          {/* ── LEFT COLUMN: collection, actions, payments ── */}
          <div className="flex flex-col gap-4">

            {/* Greeting */}
            <div>
              <h2 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 28, color: '#4A4A4A', lineHeight: 1.2 }}>
                Welcome back, {user?.first_name || ''}
              </h2>
            </div>

            {/* Rent Collection Card */}
            <div style={{ background: '#277571', borderRadius: 16, padding: 24 }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                <div>
                  <p style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 11, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                    RENT COLLECTION
                  </p>
                  <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: 999, padding: '3px 10px', fontFamily: 'Inter', fontWeight: 600, fontSize: 11, letterSpacing: '0.04em' }}>
                    {onTrack}
                  </span>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={20} color="white" aria-hidden="true" />
                </div>
              </div>
              <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 48, color: 'white', lineHeight: 1, margin: '8px 0 4px' }}>
                {summary.percentage}%
              </p>
              <p style={{ fontFamily: 'Inter', fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 12 }}>
                COLLECTED THIS MONTH — {monthName}
              </p>
              <p style={{ fontFamily: 'Inter', fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 10 }}>
                {summary.paid}/{summary.occupied} units paid
              </p>
              <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 999, height: 8, overflow: 'hidden' }}>
                <div style={{ width: `${summary.percentage}%`, background: 'white', height: '100%', borderRadius: 999, transition: 'width 700ms ease' }} />
              </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/admin/units/new')}
                className="card"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 20, minHeight: 130, cursor: 'pointer', border: 'none', transition: 'all 200ms ease' }}
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
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 20, minHeight: 130, cursor: 'pointer', border: 'none', transition: 'all 200ms ease', position: 'relative' }}
                onMouseOver={e => { e.currentTarget.style.background = '#FDF6E3'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'translateY(0)'; }}
                aria-label="Fix requests"
              >
                <div style={{ position: 'relative' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: '#FDF6E3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Wrench size={24} color="#C9A84C" aria-hidden="true" />
                  </div>
                  {pendingCount > 0 && (
                    <span style={{
                      position: 'absolute', top: -6, right: -6,
                      background: '#C9A84C', color: 'white',
                      fontSize: 10, fontWeight: 700, fontFamily: 'Inter',
                      width: 18, height: 18, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {pendingCount > 9 ? '9+' : pendingCount}
                    </span>
                  )}
                </div>
                <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13, color: '#4A4A4A', textAlign: 'center' }}>FIX REQUESTS</span>
              </button>
            </div>

            {/* Payment requests */}
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

          </div>{/* end left column */}

          {/* ── RIGHT COLUMN: calendar ── */}
          <div className="flex flex-col gap-4">

            <div className="card" style={{ padding: 16 }}>
              <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                CALENDAR
              </p>
              <Calendar color="#277571" hoverBg="#E8F5F3" />
            </div>

          </div>{/* end right column */}

        </div>
      </div>
    </AdminLayout>
  );
}
