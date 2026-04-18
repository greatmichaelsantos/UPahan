import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Building2, Wrench, LogOut, History, PlusSquare } from 'lucide-react';

export default function BottomNav({ role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const path = location.pathname;

  const adminItems = [
    { label: 'ADMIN',  icon: Home,     to: '/admin' },
    { label: 'UNITS',  icon: Building2,to: '/admin/units' },
    { label: 'FIXES',  icon: Wrench,   to: '/admin/maintenance' },
    { label: 'LOG OUT',icon: LogOut,   action: logout },
  ];

  const tenantItems = [
    { label: 'HOME',    icon: Home,       to: '/tenant' },
    { label: 'REQUEST', icon: PlusSquare, to: '/tenant/maintenance/new' },
    { label: 'HISTORY', icon: History,    to: '/tenant/maintenance' },
    { label: 'LOG OUT', icon: LogOut,     action: logout },
  ];

  const items = role === 'admin' ? adminItems : tenantItems;
  const activeColor = role === 'admin' ? '#1DB954' : '#1DB954';

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50">
      <div
        className="flex items-center justify-around py-3 px-2 border-t border-gray-100"
        style={{ background: role === 'admin' ? '#0F1923' : '#ffffff', paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
      >
        {items.map(({ label, icon: Icon, to, action }) => {
          const isActive = to && (path === to || (to !== '/admin' && to !== '/tenant' && path.startsWith(to)));
          const handleClick = () => action ? action() : navigate(to);
          return (
            <button
              key={label}
              onClick={handleClick}
              className="flex flex-col items-center gap-0.5 px-3 py-1 min-w-0 transition-all duration-200 active:scale-95"
            >
              <Icon
                size={22}
                color={isActive ? activeColor : (role === 'admin' ? '#9E9E9E' : '#9E9E9E')}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span
                className="text-[10px] font-semibold tracking-wide"
                style={{ color: isActive ? activeColor : '#9E9E9E' }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
