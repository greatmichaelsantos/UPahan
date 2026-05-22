import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, CreditCard, Wrench, FileText, UserCircle, BarChart2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SIDEBAR_COLOR = '#4A90D9';

const NAV = [
  { label: 'Home',        icon: Home,        to: '/tenant' },
  { label: 'Payments',    icon: CreditCard,  to: '/tenant/payments' },
  { label: 'Maintenance', icon: Wrench,      to: '/tenant/maintenance' },
  { label: 'Reports',     icon: BarChart2,   to: '/tenant/reports' },
  { label: 'Documents',   icon: FileText,    to: '/tenant/documents' },
  { label: 'Profile',     icon: UserCircle,  to: '/tenant/profile' },
];

export default function TenantSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const path = location.pathname;

  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || 'T';

  const isActive = (to) =>
    to === '/tenant' ? path === '/tenant' : path.startsWith(to);

  return (
    <aside
      className="hidden md:flex flex-col fixed top-0 left-0 h-screen z-30"
      style={{ width: 220, background: SIDEBAR_COLOR, boxShadow: '2px 0 16px rgba(74,144,217,0.18)' }}
    >
      {/* Logo */}
      <div style={{ padding: '28px 20px 16px' }}>
        <div className="flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M16 3L3 14h3v14h8v-8h4v8h8V14h3L16 3z" fill="white" />
          </svg>
          <span style={{ color: 'white', fontFamily: 'Inter', fontWeight: 700, fontSize: 20, letterSpacing: '0.02em' }}>
            UPAHAN
          </span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, fontFamily: 'Inter', marginTop: 4, letterSpacing: '0.06em' }}>
          TENANT PORTAL
        </p>
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.2)', margin: '0 20px' }} />

      {/* Nav */}
      <nav
        className="flex-1 flex flex-col"
        style={{ padding: '12px 0 12px 10px', overflow: 'visible' }}
      >
        {NAV.map(({ label, icon: Icon, to }) => {
          const active = isActive(to);
          return (
            <div
              key={to}
              style={{ marginBottom: 4, ...(active && { position: 'relative', zIndex: 2 }) }}
            >
              <button
                onClick={() => navigate(to)}
                className={`flex items-center gap-3 w-full transition-all duration-150${active ? ' nav-active-tenant' : ''}`}
                style={{
                  padding: active ? '14px 16px' : '12px 16px',
                  borderRadius: active ? '9999px 0 0 9999px' : 12,
                  border: 'none',
                  background: active ? '#FAF8F5' : 'transparent',
                  color: active ? SIDEBAR_COLOR : 'rgba(255,255,255,0.8)',
                  boxShadow: 'none',
                  cursor: 'pointer',
                  outline: 'none',
                  textAlign: 'left',
                  marginRight: active ? 0 : 8,
                }}
                onMouseOver={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseOut={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                aria-label={label}
              >
                <Icon size={18} strokeWidth={active ? 2.5 : 1.8} color={active ? SIDEBAR_COLOR : 'rgba(255,255,255,0.8)'} />
                <span style={{ fontFamily: 'Inter', fontWeight: active ? 700 : 500, fontSize: 14 }}>{label}</span>
                {active && (
                  <>
                    <div className="nav-curve-top" style={{ background: SIDEBAR_COLOR, boxShadow: '3px 3px 0 0 #FAF8F5' }} />
                    <div className="nav-curve-bottom" style={{ background: SIDEBAR_COLOR, boxShadow: '3px -3px 0 0 #FAF8F5' }} />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 14, color: 'white' }}>{initials}</span>
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 13, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.first_name} {user?.last_name}
            </p>
            <p style={{ fontFamily: 'Inter', fontSize: 11, color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full"
          style={{ padding: '8px', borderRadius: 8, background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', fontFamily: 'Inter', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}
        >
          <LogOut size={14} /> Log Out
        </button>
      </div>
    </aside>
  );
}
