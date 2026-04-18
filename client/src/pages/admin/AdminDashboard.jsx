import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Wrench, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import BottomNav from '../../components/BottomNav';
import Calendar from '../../components/Calendar';
import api from '../../utils/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [summary, setSummary] = useState({ percentage: 0, paid: 0, occupied: 0 });
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    api.get('/units/collection-summary').then(r => setSummary(r.data.data)).catch(() => {});
    api.get('/maintenance?status=pending').then(r => setPendingCount(r.data.data?.length || 0)).catch(() => {});
  }, []);

  const monthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-admin-dark px-6 pt-12 pb-8">
        <p className="text-primary text-xs font-bold tracking-widest uppercase mb-1">ADMINISTRATOR</p>
        <h1 className="text-white text-2xl font-black">Property Overview</h1>
        <p className="text-gray-400 text-sm mt-0.5">
          Welcome back, {user?.first_name}
        </p>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        <div className="bg-admin-dark rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">RENT COLLECTION</p>
              <p className="text-white text-xl font-black mt-0.5">{summary.percentage}% COLLECTED THIS MONTH</p>
              <p className="text-gray-500 text-xs mt-0.5">{monthName} • {summary.paid}/{summary.occupied} units paid</p>
            </div>
            <div className="bg-primary/20 p-3 rounded-xl">
              <TrendingUp size={24} color="#1DB954" />
            </div>
          </div>
          <div className="bg-white/10 rounded-full h-2.5 mb-3 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-700"
              style={{ width: `${summary.percentage}%` }}
            />
          </div>
          <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full">
            {summary.percentage >= 80 ? '✓ ON TRACK' : summary.percentage >= 50 ? '⚠ IN PROGRESS' : '✗ NEEDS ATTENTION'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/admin/units/new')}
            className="bg-white rounded-2xl p-5 shadow-card flex flex-col items-center gap-3 hover:shadow-card-hover transition-all active:scale-95"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Plus size={24} color="#1DB954" />
            </div>
            <span className="text-xs font-bold text-gray-700 text-center leading-tight">ADD NEW UNIT</span>
          </button>

          <button
            onClick={() => navigate('/admin/maintenance')}
            className="bg-white rounded-2xl p-5 shadow-card flex flex-col items-center gap-3 hover:shadow-card-hover transition-all active:scale-95 relative"
          >
            {pendingCount > 0 && (
              <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {pendingCount}
              </span>
            )}
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
              <Wrench size={24} color="#f59e0b" />
            </div>
            <span className="text-xs font-bold text-gray-700 text-center leading-tight">FIX REQUESTS</span>
          </button>
        </div>

        <div className="card">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">CALENDAR</p>
          <Calendar dark={false} />
        </div>
      </div>

      <BottomNav role="admin" />
    </div>
  );
}
