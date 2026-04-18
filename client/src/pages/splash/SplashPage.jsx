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
      style={{ background: 'linear-gradient(160deg, #17a347 0%, #1DB954 60%, #25d366 100%)' }}
    >
      <div className="flex flex-col items-center flex-1 justify-center w-full">
        <div className="flex items-center justify-center w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm mb-8 shadow-xl">
          <svg width="56" height="56" viewBox="0 0 32 32" fill="none">
            <path d="M16 3L3 14h3v14h8v-8h4v8h8V14h3L16 3z" fill="white" />
            <circle cx="22" cy="22" r="5" fill="rgba(255,255,255,0.3)" />
            <rect x="21" y="19" width="2" height="6" rx="1" fill="white" />
            <rect x="19" y="21" width="6" height="2" rx="1" fill="white" />
          </svg>
        </div>

        <h1 className="text-5xl font-black text-white tracking-tight mb-3">UPAHAN</h1>
        <p className="text-white/85 text-sm text-center leading-relaxed max-w-xs font-medium">
          Gordon College Digital Apartment{'\n'}Management System
        </p>
        <p className="text-white/60 text-xs text-center mt-1">Zambales Properties for Rent / Sale</p>
      </div>

      <div className="w-full pb-12">
        <button
          onClick={() => navigate('/select-role')}
          className="w-full bg-white text-primary font-bold text-base py-4 rounded-2xl shadow-lg transition-all duration-200 active:scale-95 hover:shadow-xl"
        >
          GET STARTED
        </button>
        <p className="text-white/50 text-xs text-center mt-6">
          Digital Property Management • Version 1.0
        </p>
      </div>
    </div>
  );
}
