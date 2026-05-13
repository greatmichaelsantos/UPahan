import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function SplashPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/tenant', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: '#2E7D72' }}
    >
      <div className="flex flex-col items-center flex-1 justify-center w-full">
        {/* Logo card */}
        <div
          className="flex items-center justify-center mb-8"
          style={{
            width: 96, height: 96, borderRadius: 24,
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          }}
        >
          <svg width="52" height="52" viewBox="0 0 32 32" fill="none" aria-label="UPahan house logo">
            <path d="M16 3L3 14h3v14h8v-8h4v8h8V14h3L16 3z" fill="white" />
            <circle cx="22" cy="22" r="5" fill="rgba(201,168,76,0.5)" />
            <rect x="21" y="19" width="2" height="6" rx="1" fill="white" />
            <rect x="19" y="21" width="6" height="2" rx="1" fill="white" />
          </svg>
        </div>

        {/* Wordmark */}
        <h1 style={{
          fontFamily: 'Inter',
          fontWeight: 700, fontSize: 42, color: 'white',
          letterSpacing: '0.04em', marginBottom: 12,
        }}>
          UPAHAN
        </h1>

        {/* Gold divider */}
        <div style={{ width: 60, height: 1.5, background: '#C9A84C', marginBottom: 14 }} />

        {/* Subtitle */}
        <p style={{
          fontFamily: 'Inter', fontWeight: 400, fontSize: 15,
          color: 'rgba(255,255,255,0.85)', textAlign: 'center',
          maxWidth: 280, lineHeight: 1.6,
        }}>
          Zambales Properties — Digital Management System
        </p>
      </div>

      {/* CTA */}
      <div style={{ width: '100%', paddingBottom: 48 }}>
        <button
          onClick={() => navigate('/select-role')}
          style={{
            display: 'block', margin: '0 auto',
            width: 240, height: 52,
            background: 'white', color: '#2E7D72',
            borderRadius: 8, border: 'none',
            fontFamily: 'Inter', fontWeight: 700, fontSize: 15,
            letterSpacing: '0.04em', cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            transition: 'all 150ms ease',
          }}
          onMouseOver={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.2)'; e.currentTarget.style.transform = 'scale(1.01)'; }}
          onMouseOut={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          GET STARTED
        </button>
        <p style={{ textAlign: 'center', marginTop: 24, fontFamily: 'Inter', fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.04em' }}>
          RGT Real Estate Marketing • Version 1.0
        </p>
      </div>
    </div>
  );
}
