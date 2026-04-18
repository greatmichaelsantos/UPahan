import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCircle, Eye } from 'lucide-react';

const RoleCard = ({ icon: Icon, label, sublabel, color, bgColor, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-gray-100 bg-white shadow-card hover:shadow-card-hover hover:border-gray-200 transition-all duration-200 active:scale-95 w-full"
  >
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center`} style={{ background: bgColor }}>
      <Icon size={28} color={color} strokeWidth={2} />
    </div>
    <div className="text-center">
      <p className="font-bold text-gray-900 text-base">{label}</p>
      <p className="text-xs text-gray-500 mt-0.5 leading-snug">{sublabel}</p>
    </div>
  </button>
);

export default function RoleSelectPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="bg-white px-6 pt-12 pb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <path d="M16 3L3 14h3v14h8v-8h4v8h8V14h3L16 3z" fill="#1DB954" />
            <circle cx="22" cy="22" r="4" fill="#0F1923" />
            <rect x="21" y="19.5" width="2" height="5" rx="0.75" fill="white" />
            <rect x="19.5" y="21" width="5" height="2" rx="0.75" fill="white" />
          </svg>
          <span className="text-2xl font-black text-gray-900">UPAHAN</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mt-4">Continue As</h2>
        <p className="text-sm text-gray-500 mt-1">Select your account type to proceed</p>
      </div>

      <div className="flex-1 px-6 py-6 flex flex-col gap-4">
        <RoleCard
          icon={ShieldCheck}
          label="ADMIN"
          sublabel="Property Owner / Manager"
          color="#0F1923"
          bgColor="#f0f0f0"
          onClick={() => navigate('/login/admin')}
        />
        <RoleCard
          icon={UserCircle}
          label="TENANT"
          sublabel="Resident / Renter"
          color="#1DB954"
          bgColor="#e8f9ef"
          onClick={() => navigate('/login/tenant')}
        />
        <RoleCard
          icon={Eye}
          label="BROWSE AS GUEST"
          sublabel="View Available Units Only"
          color="#7c3aed"
          bgColor="#f3f0ff"
          onClick={() => navigate('/units')}
        />
      </div>

      <div className="pb-10 text-center">
        <button
          onClick={() => navigate('/')}
          className="text-sm text-gray-400 font-medium hover:text-gray-600 transition-colors"
        >
          ← BACK TO WELCOME
        </button>
      </div>
    </div>
  );
}
