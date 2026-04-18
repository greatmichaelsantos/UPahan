import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Wrench, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import BottomNav from '../../components/BottomNav';
import Calendar from '../../components/Calendar';
import StatusBadge from '../../components/StatusBadge';
import api from '../../utils/api';
import { formatPeso, formatDate } from '../../utils/format';

export default function TenantDashboard() {
  const navigate = useNavigate();
  const { user, tenantInfo } = useAuth();
  const [monthStatus, setMonthStatus] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);

  useEffect(() => {
    api.get('/payments/current-month').then(r => setMonthStatus(r.data.data)).catch(() => {});
    api.get('/maintenance').then(r => setRecentRequests((r.data.data || []).slice(0, 2))).catch(() => {});
  }, []);

  const getPaymentStatus = () => {
    if (!monthStatus?.payments?.length) return 'unpaid';
    const statuses = monthStatus.payments.map(p => p.payment_status);
    if (statuses.includes('paid')) return 'paid';
    if (statuses.includes('partial')) return 'partial';
    return 'unpaid';
  };

  const getTotalPaid = () => {
    if (!monthStatus?.payments?.length) return 0;
    return monthStatus.payments.reduce((sum, p) => sum + parseFloat(p.total_paid || 0), 0);
  };

  const payStatus = getPaymentStatus();

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white px-6 pt-12 pb-4 border-b border-gray-100">
        <p className="text-xs text-gray-400 font-semibold">UPahan</p>
        <h1 className="text-2xl font-black text-gray-900">My Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Hello, {user?.first_name}!</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div
          className="rounded-2xl p-5 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #17a347, #1DB954, #25d366)' }}
        >
          <div className="flex items-start justify-between mb-2">
            <p className="text-white/80 text-xs font-bold uppercase tracking-wide">MONTHLY RENT</p>
            <StatusBadge status={payStatus} />
          </div>
          <p className="text-white text-3xl font-black mt-1">
            {formatPeso(tenantInfo?.monthly_price || 0)}
          </p>
          <div className="mt-3 space-y-1">
            <p className="text-white/75 text-xs">
              Next Due: {monthStatus?.nextDue ? formatDate(monthStatus.nextDue, 'medium') : '—'}
            </p>
            <p className="text-white/75 text-xs">
              Assigned Unit: {tenantInfo?.unit_code || '—'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/tenant/payments')}
            className="bg-primary-light rounded-2xl p-4 flex flex-col items-center gap-2 hover:shadow-card transition-all active:scale-95"
          >
            <Clock size={26} color="#1DB954" />
            <span className="text-xs font-bold text-gray-700 text-center">PAYMENT HISTORY</span>
          </button>
          <button
            onClick={() => navigate('/tenant/maintenance/new')}
            className="bg-purple-50 rounded-2xl p-4 flex flex-col items-center gap-2 hover:shadow-card transition-all active:scale-95"
          >
            <Wrench size={26} color="#7c3aed" />
            <span className="text-xs font-bold text-gray-700 text-center">REQUEST MAINTENANCE</span>
          </button>
        </div>

        {recentRequests.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">RECENT REQUESTS</p>
              <button onClick={() => navigate('/tenant/maintenance')} className="text-xs text-primary font-semibold">
                See All
              </button>
            </div>
            {recentRequests.map(req => (
              <div key={req.request_id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{req.subject}</p>
                  <p className="text-xs text-gray-400">{req.issue_category}</p>
                </div>
                <StatusBadge status={req.status} />
              </div>
            ))}
          </div>
        )}

        <div className="card">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">CALENDAR</p>
          <Calendar dark={false} />
        </div>
      </div>

      <BottomNav role="tenant" />
    </div>
  );
}
