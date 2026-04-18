import React, { useEffect, useState } from 'react';
import { Download, Info } from 'lucide-react';
import BottomNav from '../../components/BottomNav';
import StatusBadge from '../../components/StatusBadge';
import api from '../../utils/api';
import { formatPeso, formatDate, formatMonthYear } from '../../utils/format';

export default function TenantPaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({ totalPaid: 0, totalPending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/payments'),
      api.get('/payments/summary')
    ]).then(([pRes, sRes]) => {
      setPayments(pRes.data.data || []);
      setSummary(sRes.data.data || { totalPaid: 0, totalPending: 0 });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const groupByMonth = (payments) => {
    const groups = {};
    payments.forEach(p => {
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

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="bg-white px-6 pt-12 pb-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Payment History</h1>
            <p className="text-sm text-gray-500 mt-0.5">Your rent payment records</p>
          </div>
          <button className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors active:scale-95">
            <Download size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {loading ? (
          <div className="card h-24 animate-pulse bg-gray-100" />
        ) : (
          <div className="card">
            <div className="grid grid-cols-2 divide-x divide-gray-100">
              <div className="pr-4">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">PAID</p>
                <p className="text-lg font-black text-primary mt-1">{formatPeso(summary.totalPaid)}</p>
              </div>
              <div className="pl-4">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">PENDING</p>
                <p className="text-lg font-black text-gray-900 mt-1">{formatPeso(summary.totalPending)}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && grouped.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-2">💳</p>
            <p className="font-medium">No payments recorded yet</p>
          </div>
        ) : (
          grouped.map(([month, entries]) => (
            <div key={month}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-gray-700">{formatMonthYear(month)}</p>
                <StatusBadge status={getMonthStatus(entries)} />
              </div>
              <div className="card space-y-0 divide-y divide-gray-50">
                {entries.map(entry => (
                  <div key={entry.payment_id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDate(entry.payment_date, 'long')}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 capitalize">
                        {entry.payment_type === 'full' ? 'FULL PAYMENT' :
                         entry.payment_type === 'partial' ? 'PARTIAL PAYMENT' : 'ADVANCE PAYMENT'}
                        {entry.payment_method ? ` • ${entry.payment_method}` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-gray-900">{formatPeso(entry.amount)}</p>
                      <StatusBadge status={entry.payment_status} className="mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-2">
          <Info size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-blue-700 text-xs leading-relaxed">
            Payments are automatically logged upon verification. Contact the landlord if your payment status is not updated within 24 hours.
          </p>
        </div>
      </div>

      <BottomNav role="tenant" />
    </div>
  );
}
