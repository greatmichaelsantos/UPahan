import React from 'react';
import { useAuth } from '../context/AuthContext';
import BottomNav from './BottomNav';
import NotificationBell from './NotificationBell';
import TenantSidebar from './TenantSidebar';

export default function TenantLayout({ children, title }) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex" style={{ background: '#FAF8F5' }}>

      <TenantSidebar />

      {/* ── Main area ── */}
      <div className="flex-1 md:ml-[220px] min-h-screen flex flex-col pb-24 md:pb-0">

        {/* Desktop sticky header — blue bar */}
        <header
          className="hidden md:flex items-center justify-between sticky top-0 z-20"
          style={{ padding: '0 32px', height: 64, background: '#4A90D9', boxShadow: '0 2px 8px rgba(74,144,217,0.18)' }}
        >
          <div>
            {title ? (
              <>
                <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10, color: '#F0CF6A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 1 }}>
                  Tenant
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
      </div>

      {/* Bottom nav — mobile only */}
      <div className="md:hidden">
        <BottomNav role="tenant" />
      </div>
    </div>
  );
}
