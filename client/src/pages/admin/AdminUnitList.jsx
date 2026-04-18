import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ChevronRight } from 'lucide-react';
import BottomNav from '../../components/BottomNav';
import StatusBadge from '../../components/StatusBadge';
import api from '../../utils/api';
import { formatPeso } from '../../utils/format';

const UNIT_COLORS = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-orange-500', 'bg-pink-500', 'bg-cyan-500'];

export default function AdminUnitList() {
  const navigate = useNavigate();
  const [units, setUnits] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (q = '') => {
    setLoading(true);
    try {
      const params = q ? `?search=${encodeURIComponent(q)}` : '';
      const res = await api.get(`/units${params}`);
      setUnits(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const t = setTimeout(() => load(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const getColor = (code) => {
    const i = (code?.charCodeAt(0) || 0) % UNIT_COLORS.length;
    return UNIT_COLORS[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="bg-admin-dark px-6 pt-12 pb-6">
        <p className="text-primary text-xs font-bold tracking-widest uppercase mb-1">INVENTORY</p>
        <h1 className="text-white text-2xl font-black">Unit List</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Units..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="card h-24 animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : units.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-2">🏠</p>
            <p className="font-medium">No units found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {units.map(unit => (
              <button
                key={unit.unit_id}
                onClick={() => navigate(`/admin/units/${unit.unit_id}`)}
                className="card w-full flex items-center gap-4 hover:shadow-card-hover transition-all active:scale-[0.98] text-left"
              >
                <div className={`w-14 h-14 ${getColor(unit.unit_code)} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white font-black text-base">{unit.unit_code}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-900 text-sm">Unit {unit.unit_code}</p>
                    <StatusBadge status={unit.vacancy_status} />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {unit.tenant_name || 'No tenant assigned'}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs font-bold text-primary">{formatPeso(unit.monthly_price)}</span>
                    <span className="text-gray-300">•</span>
                    <StatusBadge status={unit.payment_status || 'unpaid'} />
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => navigate('/admin/units/new')}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-primary text-primary font-bold text-sm py-4 rounded-2xl hover:bg-primary/5 transition-all active:scale-95"
        >
          <Plus size={18} />
          ADD NEW UNIT
        </button>
      </div>

      <BottomNav role="admin" />
    </div>
  );
}
