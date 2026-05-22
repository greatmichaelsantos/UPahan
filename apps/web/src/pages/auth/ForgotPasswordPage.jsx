import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail } from 'lucide-react';
import api from '../../utils/api';

export default function ForgotPasswordPage() {
  const navigate            = useNavigate();
  const [params]            = useSearchParams();
  const role                = params.get('role') || 'tenant';
  const isAdmin             = role === 'admin';
  const accent              = isAdmin ? '#2E7D72' : '#3A7BD5';
  const accentDark          = isAdmin ? '#1F5C56' : '#2f6abf';
  const accentLight         = isAdmin ? '#E8F5F3' : '#EBF2FC';

  const [email, setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [sent, setSent]     = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5" style={{ background: '#FAF8F5' }}>
      <div style={{
        background: 'white', borderRadius: 16, padding: '36px 28px 32px',
        width: '100%', maxWidth: 400,
        boxShadow: '0 4px 24px rgba(46,125,114,0.12)',
      }}>
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M16 3L3 14h3v14h8v-8h4v8h8V14h3L16 3z" fill={accent} />
          </svg>
          <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 18, color: accent }}>
            UPAHAN
          </span>
        </div>

        <h1 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 26, color: '#4A4A4A', textAlign: 'center', marginBottom: 4 }}>
          Forgot Password
        </h1>
        <div style={{ width: 48, height: 1.5, background: '#C9A84C', margin: '10px auto 20px' }} />

        {sent ? (
          <>
            <div style={{ background: '#E8F5E9', border: '1px solid #2E7D32', borderRadius: 8, padding: '12px 14px', color: '#2E7D32', fontSize: 13, fontFamily: 'Inter', marginBottom: 20 }}>
              If that email is registered, a reset link has been sent. Check your inbox.
            </div>
            <button
              onClick={() => navigate(`/login/${role}`)}
              style={{
                height: 52, borderRadius: 8, background: accent, color: 'white',
                border: 'none', width: '100%', cursor: 'pointer',
                fontFamily: 'Inter', fontWeight: 600, fontSize: 14, letterSpacing: '0.04em',
              }}
            >
              BACK TO LOGIN
            </button>
          </>
        ) : (
          <>
            <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#888888', textAlign: 'center', marginBottom: 20 }}>
              Enter your registered email and we'll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {error && (
                <div style={{ background: '#FDEEEE', border: '1px solid #D64045', borderRadius: 8, padding: '10px 14px', color: '#D64045', fontSize: 13, fontFamily: 'Inter' }}>
                  {error}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontFamily: 'Inter', fontWeight: 600, fontSize: 12, color: '#4A4A4A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#888888' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    placeholder="you@example.com"
                    autoComplete="email"
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    style={{
                      width: '100%', height: 52, borderRadius: 8,
                      background: focused ? accentLight : '#fff',
                      border: `1.5px solid ${focused ? accent : '#D1D5DB'}`,
                      fontFamily: 'Inter', fontSize: 14, color: '#4A4A4A',
                      paddingLeft: 44, paddingRight: 14, outline: 'none', transition: 'all 150ms ease',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  height: 52, borderRadius: 8,
                  background: loading ? '#888888' : accent,
                  color: 'white', border: 'none', width: '100%',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Inter', fontWeight: 600, fontSize: 14, letterSpacing: '0.04em',
                  transition: 'all 150ms ease', opacity: loading ? 0.6 : 1,
                }}
                onMouseOver={e => { if (!loading) e.currentTarget.style.background = accentDark; }}
                onMouseOut={e => { if (!loading) e.currentTarget.style.background = accent; }}
              >
                {loading ? 'Sending...' : 'SEND RESET LINK'}
              </button>
            </form>
          </>
        )}
      </div>

      <button
        onClick={() => navigate(`/login/${role}`)}
        style={{ marginTop: 24, fontFamily: 'Inter', fontWeight: 500, fontSize: 13, color: accent, background: 'none', border: 'none', cursor: 'pointer' }}
      >
        ← Back to Login
      </button>
    </div>
  );
}
