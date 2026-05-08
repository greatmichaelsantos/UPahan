import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Building2, Wrench, History, PlusSquare, CreditCard, UserCircle } from 'lucide-react';

export default function BottomNav({ role }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user } = useAuth();
  const path = location.pathname;
  const adminItems = [
    { label: 'Dashboard', icon: Home,        to: '/admin' },
    { label: 'Units',     icon: Building2,   to: '/admin/units' },
    { label: 'Payments',  icon: CreditCard,  to: '/admin/payments' },
    { label: 'Fixes',     icon: Wrench,      to: '/admin/maintenance' },
    { label: 'Profile',   icon: UserCircle,  to: '/admin/profile' },
  ];

  const tenantItems = [
    { label: 'Home',    icon: Home,        to: '/tenant' },
    { label: 'Request', icon: PlusSquare,  to: '/tenant/maintenance/new' },
    { label: 'History', icon: History,     to: '/tenant/maintenance' },
    { label: 'Profile', icon: UserCircle,  to: '/tenant/profile' },
  ];

  const items = role === 'admin' ? adminItems : tenantItems;

  const isActive = (to) => {
    if (!to) return false;
    // Home routes: exact match only — prevent "/" matching "/tenant/..."
    if (to === '/admin' || to === '/tenant') return path === to;
    // Tenant leaf routes: exact match to prevent cross-matching
    if (to === '/tenant/maintenance/new') return path === '/tenant/maintenance/new';
    if (to === '/tenant/maintenance')     return path === '/tenant/maintenance';
    if (to === '/tenant/profile')         return path === '/tenant/profile';
    // Admin sub-sections: match the section root and its child pages
    return path === to || path.startsWith(to + '/');
  };

  const TEAL        = '#2E7D72';
  const BLUE        = '#3A7BD5';
  const GRAY        = '#888888';
  const activeColor = role === 'admin' ? TEAL : BLUE;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{ background: 'white', borderTop: '1px solid #F0EEEB', boxShadow: '0 -2px 12px rgba(46,125,114,0.06)' }}
    >
      <div
        className="flex items-center justify-around px-2"
        style={{ paddingTop: 8, paddingBottom: `calc(8px + env(safe-area-inset-bottom))` }}
      >
        {items.map(({ label, icon: Icon, to, action, badge }) => {
          const active      = isActive(to);
          const color       = active ? activeColor : GRAY;
          const handleClick = () => (action ? action() : navigate(to));

          return (
            <button
              key={label}
              onClick={handleClick}
              className="flex flex-col items-center gap-0.5 px-3 py-1 transition-all duration-200 active:scale-95"
              style={{
                borderTop: active ? `2px solid ${activeColor}` : '2px solid transparent',
                paddingTop: 6, position: 'relative',
              }}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={22} color={color} strokeWidth={active ? 2.5 : 1.8} aria-hidden="true" />
              {badge > 0 && (
                <span style={{
                  position: 'absolute', top: 2, right: 6,
                  background: '#D64045', color: 'white', fontSize: 9, fontWeight: 700,
                  width: 16, height: 16, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter',
                }}>
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
              <span style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 600, color, letterSpacing: '0.04em' }}>
                {label.toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
