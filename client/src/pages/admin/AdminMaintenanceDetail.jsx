import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, User, MapPin, Clock, Calendar, UserCog } from 'lucide-react';
import BottomNav from '../../components/BottomNav';
import StatusBadge from '../../components/StatusBadge';
import api from '../../utils/api';
import { formatDateTime, timeAgo, categoryLabel } from '../../utils/format';

export default function AdminMaintenanceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [req, setReq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);

  const load = async () => {
    try {
      const res = await api.get(`/maintenance/${id}`);
      setReq(res.data.data);
    } catch (e) { navigate('/admin/maintenance'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleResolve = async () => {
    setResolving(true);
    try {
      await api.put(`/maintenance/${id}`, { status: 'completed' });
      load();
    } catch (e) { console.error(e); }
    finally { setResolving(false); }
  };

  const handleAssign = async () => {
    try {
      await api.put(`/maintenance/${id}`, { status: 'in_progress' });
      load();
    } catch (e) { console.error(e); }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!req) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="bg-admin-dark px-6 pt-12 pb-6">
        <button onClick={() => navigate('/admin/maintenance')}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft size={16} />
          <span className="text-xs font-semibold">BACK TO LIST</span>
        </button>
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h1 className="text-white text-xl font-black leading-tight">{req.subject}</h1>
            <p className="text-gray-400 text-xs mt-1">{categoryLabel(req.issue_category)}</p>
          </div>
          <StatusBadge status={req.priority_level} />
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="card">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">STATUS</p>
            <StatusBadge status={req.status} />
          </div>
          <div className="card">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">TIME OPEN</p>
            <p className="font-bold text-gray-900 text-sm">{timeAgo(req.report_date).toUpperCase()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="card flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <User size={18} color="#1DB954" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 font-semibold">RESIDENT</p>
              <p className="text-sm font-bold text-gray-900 truncate">{req.tenant_name}</p>
            </div>
          </div>
          <div className="card flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin size={18} color="#3b82f6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 font-semibold">AREA</p>
              <p className="text-sm font-bold text-gray-900 truncate">Unit {req.unit_code}</p>
            </div>
          </div>
        </div>

        {req.description && (
          <div className="card">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">DESCRIPTION</p>
            <p className="text-sm text-gray-700 leading-relaxed">{req.description}</p>
          </div>
        )}

        <div className="card flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Calendar size={18} color="#f59e0b" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold">REPORTED ON</p>
            <p className="text-sm font-bold text-gray-900">{formatDateTime(req.report_date)}</p>
          </div>
        </div>

        {req.resolved_date && (
          <div className="card flex items-center gap-3">
            <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle size={18} color="#1DB954" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold">RESOLVED ON</p>
              <p className="text-sm font-bold text-gray-900">{formatDateTime(req.resolved_date)}</p>
            </div>
          </div>
        )}

        {req.photos?.length > 0 && (
          <div className="card">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-3">PHOTO EVIDENCE</p>
            <div className="grid grid-cols-2 gap-2">
              {req.photos.map((photo, i) => (
                <img key={i} src={photo} alt="Evidence"
                  className="w-full aspect-video object-cover rounded-xl bg-gray-100" />
              ))}
            </div>
          </div>
        )}

        {req.status !== 'completed' && (
          <div className="space-y-2 pt-2">
            <button
              onClick={handleResolve}
              disabled={resolving}
              className="btn-primary flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <CheckCircle size={18} />
              {resolving ? 'UPDATING...' : 'MARK AS RESOLVED'}
            </button>
            {req.status === 'pending' && (
              <button
                onClick={handleAssign}
                className="btn-outline flex items-center justify-center gap-2"
              >
                <UserCog size={18} />
                ASSIGN TO STAFF
              </button>
            )}
          </div>
        )}
      </div>

      <BottomNav role="admin" />
    </div>
  );
}
