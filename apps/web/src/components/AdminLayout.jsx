import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from './BottomNav';
import NotificationBell from './NotificationBell';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout({ children, title }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || 'A';

  return (
    <div className="min-h-screen bg-cream flex">

      <AdminSidebar />

      {/* ── Main content ── */}
      <main className="flex-1 md:ml-[220px] min-h-screen flex flex-col pb-24 md:pb-0">
        {/* Desktop sticky header — merged green bar */}
        <header
          className="flex items-center justify-between sticky top-0 z-20"
          style={{ padding: '0 16px', height: 56, background: '#277571', boxShadow: '0 2px 8px rgba(39,117,113,0.18)' }}
        >
          <div>
            {title ? (
              <>
                <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10, color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 1 }}>
                  Landlord
                </p>
                <h1 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 20, color: 'white', lineHeight: 1.1 }}>
                  {title}
                </h1>
              </>
            ) : <span />}
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell color="white" />
          </div>
        </header>
        <div className="flex-1">
          {children}
        </div>
      </main>

      {/* Bottom nav — mobile only */}
      <div className="md:hidden">
        <BottomNav role="admin" />
      </div>
    </div>
  );
}
