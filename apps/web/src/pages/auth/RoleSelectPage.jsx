import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCircle, Eye, ChevronRight } from 'lucide-react';

const RoleCard = ({ icon: Icon, label, sublabel, iconBg, iconColor, chevronColor, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-4 w-full text-left transition-all duration-200"
    style={{
      background: 'white', borderRadius: 12, padding: 16,
      boxShadow: '0 2px 12px rgba(46,125,114,0.08)',
      border: '1.5px solid transparent', cursor: 'pointer',
    }}
    onMouseOver={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(46,125,114,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseOut={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(46,125,114,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
  >
    {/* Icon box */}
    <div style={{
      width: 48, height: 48, borderRadius: 10, flexShrink: 0,
      background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon size={24} color={iconColor} strokeWidth={2} aria-hidden="true" />
    </div>

    {/* Text */}
    <div className="flex-1 min-w-0">
      <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 18, color: '#4A4A4A', marginBottom: 2 }}>
        {label}
      </p>
      <p style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: 13, color: '#888888' }}>
        {sublabel}
      </p>
    </div>

    <ChevronRight size={20} color={chevronColor} aria-hidden="true" />
  </button>
);

export default function RoleSelectPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FAF8F5' }}>
      {/* Header */}
      <div style={{ background: 'white', padding: '48px 24px 32px', textAlign: 'center' }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M16 3L3 14h3v14h8v-8h4v8h8V14h3L16 3z" fill="#2E7D72" />
          </svg>
          <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 22, color: '#2E7D72' }}>
            UPAHAN
          </span>
        </div>
        <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#888888', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 24 }}>
          RGT Real Estate Marketing
        </p>

        <h2 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 32, color: '#4A4A4A', marginBottom: 8 }}>
          Login As
        </h2>
        <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#888888' }}>
          Choose your account type to proceed.
        </p>
      </div>

      {/* Role cards */}
      <div className="flex-1 flex flex-col gap-3" style={{ padding: '24px 20px' }}>
        <RoleCard
          icon={ShieldCheck}
          label="Landlord"
          sublabel="Property Owner / Manager"
          iconBg="#E8F5F3"
          iconColor="#2E7D72"
          chevronColor="#2E7D72"
          onClick={() => navigate('/login/admin')}
        />

        <RoleCard
          icon={UserCircle}
          label="Tenant"
          sublabel="Resident / Renter"
          iconBg="#EBF2FC"
          iconColor="#3A7BD5"
          chevronColor="#3A7BD5"
          onClick={() => navigate('/login/tenant')}
        />

        {/* Gold divider with OR */}
        <div className="flex items-center gap-3" style={{ margin: '4px 0' }}>
          <div style={{ flex: 1, height: 1, background: '#C9A84C', opacity: 0.3 }} />
          <span style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 600, color: '#C9A84C', letterSpacing: '0.06em' }}>OR</span>
          <div style={{ flex: 1, height: 1, background: '#C9A84C', opacity: 0.3 }} />
        </div>

        <RoleCard
          icon={Eye}
          label="Browse as Guest"
          sublabel="View Available Units Only"
          iconBg="#FDF6E3"
          iconColor="#C9A84C"
          chevronColor="#C9A84C"
          onClick={() => navigate('/units')}
        />
      </div>

      {/* Back link */}
      <div style={{ textAlign: 'center', paddingBottom: 40 }}>
        <button
          onClick={() => navigate('/')}
          style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 13, color: '#2E7D72', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          ← Back to Welcome
        </button>
      </div>
    </div>
  );
}
