import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import BottomNav from '../../components/BottomNav';
import StatusBadge from '../../components/StatusBadge';
import api from '../../utils/api';
import { timeAgo, categoryLabel } from '../../utils/format';

const PriorityDot = ({ level }) => {
  const colors = { high: 'bg-red-500', medium: 'bg-orange-400', low: 'bg-gray-400' };
  return <span className={`w-2 h-2 rounded-full ${colors[level] || 'bg-gray-300'} flex-shrink-0`} />;
};

export default function AdminMaintenanceList() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const res = await api.get(`/maintenance${params}`);
      setRequests(res.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const handleResolve = async (e, id) => {
    e.stopPropagation();
    try {
      await api.put(`/maintenance/${id}`, { status: 'completed' });
      load();
    } catch (err) { console.error(err); }
  };

  const filters = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="bg-admin-dark px-6 pt-12 pb-6">
        <p className="text-primary text-xs font-bold tracking-widest uppercase mb-1">MAINTENANCE</p>
        <h1 className="text-white text-2xl font-black">Fix Requests</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2">
          <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-amber-700 text-xs leading-relaxed">
            Review and resolve tenant maintenance requests promptly. High priority items require immediate attention.
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                filter === f.value ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="card h-28 animate-pulse bg-gray-100" />)}
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-2">🔧</p>
            <p className="font-medium">No requests found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map(req => (
              <div
                key={req.request_id}
                className="card hover:shadow-card-hover transition-all cursor-pointer active:scale-[0.98]"
                onClick={() => navigate(`/admin/maintenance/${req.request_id}`)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-2 mt-0.5">
                    <PriorityDot level={req.priority_level} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="bg-admin-dark text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                        UNIT {req.unit_code}
                      </span>
                      <StatusBadge status={req.priority_level} />
                      <StatusBadge status={req.status} />
                    </div>
                    <p className="font-bold text-gray-900 text-sm">{req.subject}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {req.tenant_name} • {timeAgo(req.report_date)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{categoryLabel(req.issue_category)}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                </div>

                {req.status !== 'completed' && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={(e) => handleResolve(e, req.request_id)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-primary/10 text-primary text-xs font-bold py-2.5 rounded-xl hover:bg-primary/20 transition-colors"
                    >
                      <CheckCircle size={14} />
                      RESOLVED
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/admin/maintenance/${req.request_id}`); }}
                      className="flex-1 border border-gray-200 text-gray-600 text-xs font-bold py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      DETAIL
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav role="admin" />
    </div>
  );
}
