import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import BottomNav from '../../components/BottomNav';
import StatusBadge from '../../components/StatusBadge';
import api from '../../utils/api';
import { formatDate, categoryLabel } from '../../utils/format';

export default function TenantMaintenanceHistory() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/maintenance').then(r => setRequests(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="bg-white px-6 pt-12 pb-5 border-b border-gray-100">
        <h1 className="text-2xl font-black text-gray-900">Maintenance</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your maintenance request history</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        <button
          onClick={() => navigate('/tenant/maintenance/new')}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          New Maintenance Request
        </button>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="card h-20 animate-pulse bg-gray-100" />)}
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-2">🔧</p>
            <p className="font-medium">No requests yet</p>
            <p className="text-sm mt-1">Submit your first maintenance request above</p>
          </div>
        ) : (
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">HISTORY</p>
            <div className="space-y-2">
              {requests.map(req => (
                <div key={req.request_id} className="card flex items-center justify-between">
                  <div className="flex-1 min-w-0 pr-3">
                    <p className="font-bold text-gray-900 text-sm truncate">{req.subject}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-400">{formatDate(req.report_date, 'short')}</p>
                      <span className="text-gray-300">•</span>
                      <p className="text-xs text-gray-400">{categoryLabel(req.issue_category)}</p>
                    </div>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav role="tenant" />
    </div>
  );
}
