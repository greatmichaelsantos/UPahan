import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Building2, Wrench, CreditCard, UserCircle } from 'lucide-react';
import BottomNav from './BottomNav';

const navItems = [
  { label: 'Dashboard',    icon: Home,        to: '/admin' },
  { label: 'Units',        icon: Building2,   to: '/admin/units' },
  { label: 'Payments',     icon: CreditCard,  to: '/admin/payments' },
  { label: 'Fix Requests', icon: Wrench,      to: '/admin/maintenance' },
  { label: 'Profile',      icon: UserCircle,  to: '/admin/profile' },
];

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const isActive = (to) =>
    to === '/admin'
      ? path === '/admin'
      : path.startsWith(to);

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar — desktop only */}
      <aside
        className="hidden md:flex flex-col fixed top-0 left-0 h-screen z-30"
        style={{ width: 220, background: '#2E7D72', boxShadow: '2px 0 16px rgba(46,125,114,0.12)' }}
      >
        {/* Logo */}
        <div style={{ padding: '28px 20px 16px' }}>
          <div className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <path d="M16 3L3 14h3v14h8v-8h4v8h8V14h3L16 3z" fill="white" />
            </svg>
            <span style={{ color: 'white', fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, fontSize: 20, letterSpacing: '0.02em' }}>
              UPAHAN
            </span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontFamily: 'Inter', marginTop: 4, letterSpacing: '0.06em' }}>
            RGT REAL ESTATE MARKETING
          </p>
        </div>

        {/* Gold divider */}
        <div style={{ height: 1, background: '#C9A84C', opacity: 0.4, margin: '0 20px' }} />

        {/* Nav items */}
        <nav className="flex-1" style={{ padding: '12px 0' }}>
          {navItems.map(({ label, icon: Icon, to }) => {
            const active = isActive(to);
            return (
              <button
                key={to}
                onClick={() => navigate(to)}
                className="flex items-center gap-3 w-full transition-colors duration-150"
                style={{
                  padding: '14px 20px',
                  background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                  borderLeft: active ? '3px solid #C9A84C' : '3px solid transparent',
                  color: active ? 'white' : 'rgba(255,255,255,0.75)',
                }}
                aria-label={label}
              >
                <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
                <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14 }}>{label}</span>
              </button>
            );
          })}
        </nav>

      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-[220px] min-h-screen pb-24 md:pb-0">
        {children}
      </main>

      {/* Bottom nav — mobile only */}
      <div className="md:hidden">
        <BottomNav role="admin" />
      </div>
    </div>
  );
}
