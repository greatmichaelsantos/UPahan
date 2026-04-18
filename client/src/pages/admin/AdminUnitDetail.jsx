import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, UserPlus, Plus } from 'lucide-react';
import BottomNav from '../../components/BottomNav';
import StatusBadge from '../../components/StatusBadge';
import api from '../../utils/api';
import { formatPeso, formatDate } from '../../utils/format';

export default function AdminUnitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [unit, setUnit] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [uRes, pRes] = await Promise.all([
        api.get(`/units/${id}`),
        api.get(`/payments?unitId=${id}`)
      ]);
      setUnit(uRes.data.data);
      setPayments(pRes.data.data?.slice(0, 5) || []);
    } catch { navigate('/admin/units'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this unit? This cannot be undone.')) return;
    try {
      await api.delete(`/units/${id}`);
      navigate('/admin/units');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete unit.');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!unit) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="bg-admin-dark px-6 pt-12 pb-6">
        <button onClick={() => navigate('/admin/units')}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft size={16} />
          <span className="text-xs font-semibold">BACK</span>
        </button>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-primary text-white text-sm font-black px-3 py-1 rounded-xl">
                {unit.unit_code}
              </span>
              <StatusBadge status={unit.vacancy_status} />
            </div>
            <p className="text-gray-400 text-sm">{unit.floor_plan || 'Unit'}</p>
          </div>
          <p className="text-white text-xl font-black">{formatPeso(unit.monthly_price)}</p>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {unit.photos?.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {unit.photos.slice(0, 4).map((p, i) => (
              <img key={i} src={p} alt="" className={`rounded-2xl object-cover ${i === 0 ? 'col-span-2 h-44' : 'h-28'}`} />
            ))}
          </div>
        )}

        <div className="card space-y-3">
          <div className="flex justify-between">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Location</span>
            <span className="text-sm font-semibold text-gray-900">{unit.location || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Floor Plan</span>
            <span className="text-sm font-semibold text-gray-900">{unit.floor_plan || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Monthly Rent</span>
            <span className="text-sm font-bold text-primary">{formatPeso(unit.monthly_price)}</span>
          </div>
        </div>

        {unit.tenant_name ? (
          <div className="card">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">CURRENT TENANT</p>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-black">{unit.tenant_name?.[0]}</span>
              </div>
              <div>
                <p className="font-bold text-gray-900">{unit.tenant_name}</p>
                <p className="text-xs text-gray-500">{unit.tenant_email}</p>
                <p className="text-xs text-gray-400">
                  Lease: {formatDate(unit.lease_start_date, 'medium')} – {formatDate(unit.lease_end_date, 'medium')}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate(`/admin/tenants/assign?unitId=${id}`)}
            className="card w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 py-5 text-gray-500 hover:border-primary hover:text-primary transition-all"
          >
            <UserPlus size={18} />
            <span className="text-sm font-semibold">Assign Tenant</span>
          </button>
        )}

        {payments.length > 0 && (
          <div className="card">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">RECENT PAYMENTS</p>
            <div className="space-y-2">
              {payments.map(p => (
                <div key={p.payment_id} className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{formatDate(p.payment_date, 'medium')}</p>
                    <p className="text-xs text-gray-400 capitalize">{p.payment_type} payment</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{formatPeso(p.amount)}</p>
                    <StatusBadge status={p.payment_status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={() => navigate(`/admin/units/${id}/edit`)}
            className="flex items-center justify-center gap-1.5 border border-gray-300 text-gray-700 font-bold text-sm py-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Edit2 size={15} />
            EDIT
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center justify-center gap-1.5 border border-red-200 text-red-500 font-bold text-sm py-3 rounded-xl hover:bg-red-50 transition-colors"
          >
            <Trash2 size={15} />
            DELETE
          </button>
        </div>
      </div>

      <BottomNav role="admin" />
    </div>
  );
}
