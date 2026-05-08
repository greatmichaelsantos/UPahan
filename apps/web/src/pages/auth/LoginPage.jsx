import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Defined OUTSIDE LoginPage — each instance manages its own focus state
// so parent never re-renders on focus change
const EmailInput = ({ value, onChange, accent, accentLight }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <Mail size={16} aria-hidden="true" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#888888' }} />
      <input
        type="email" value={value} onChange={onChange}
        placeholder="you@example.com" autoComplete="email"
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: '100%', height: 52, borderRadius: 8,
          background: focused ? accentLight : '#F0EEEB',
          border: `1.5px solid ${focused ? accent : 'transparent'}`,
          fontFamily: 'Inter', fontSize: 14, color: '#4A4A4A',
          paddingLeft: 44, paddingRight: 14, outline: 'none', transition: 'all 150ms ease',
        }}
      />
    </div>
  );
};

const PasswordInput = ({ value, onChange, showPass, onToggle, accent, accentLight }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <Lock size={16} aria-hidden="true" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#888888' }} />
      <input
        type={showPass ? 'text' : 'password'} value={value} onChange={onChange}
        placeholder="••••••••" autoComplete="current-password"
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: '100%', height: 52, borderRadius: 8,
          background: focused ? accentLight : '#F0EEEB',
          border: `1.5px solid ${focused ? accent : 'transparent'}`,
          fontFamily: 'Inter', fontSize: 14, color: '#4A4A4A',
          paddingLeft: 44, paddingRight: 44, outline: 'none', transition: 'all 150ms ease',
        }}
      />
      <button
        type="button" onClick={onToggle}
        style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888888', display: 'flex', padding: 0 }}
        aria-label={showPass ? 'Hide password' : 'Show password'}
      >
        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
};

const LABEL_STYLE = {
  display: 'block', fontFamily: 'Inter', fontWeight: 600, fontSize: 12,
  color: '#4A4A4A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6,
};

export default function LoginPage() {
  const { role }   = useParams();
  const navigate   = useNavigate();
  const { login, loading } = useAuth();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');

  const isAdmin     = role === 'admin';
  const accent      = isAdmin ? '#2E7D72' : '#3A7BD5';
  const accentDark  = isAdmin ? '#1F5C56' : '#2f6abf';
  const accentLight = isAdmin ? '#E8F5F3' : '#EBF2FC';
  const roleLabel   = isAdmin ? 'LANDLORD' : 'TENANT';

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    const result = await login(email.trim(), password, role);
    if (result.success) {
      navigate(isAdmin ? '/admin' : '/tenant', { replace: true });
    } else {
      // Clear password, keep email — standard login UX
      setPassword('');
      setError('Incorrect email or password. Please try again.');
    }
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
          <span style={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, fontSize: 18, color: accent }}>
            UPAHAN
          </span>
        </div>

        {/* Role badge */}
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <span style={{
            display: 'inline-block', background: accent, color: 'white',
            borderRadius: 999, padding: '4px 14px',
            fontFamily: 'Inter', fontWeight: 700, fontSize: 11, letterSpacing: '0.08em',
          }}>
            LOGIN AS {roleLabel}
          </span>
        </div>

        <h1 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, fontSize: 30, color: '#4A4A4A', textAlign: 'center', marginBottom: 4 }}>
          Welcome
        </h1>

        {/* Gold divider */}
        <div style={{ width: 48, height: 1.5, background: '#C9A84C', margin: '10px auto 24px' }} />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div style={{ background: '#FDEEEE', border: '1px solid #D64045', borderRadius: 8, padding: '10px 14px', color: '#D64045', fontSize: 13, fontFamily: 'Inter' }}>
              {error}
            </div>
          )}

          <div>
            <label style={LABEL_STYLE}>Email Address</label>
            <EmailInput value={email} onChange={handleEmailChange} accent={accent} accentLight={accentLight} />
          </div>

          <div>
            <label style={LABEL_STYLE}>Password</label>
            <PasswordInput
              value={password} onChange={handlePasswordChange}
              showPass={showPass} onToggle={() => setShowPass(p => !p)}
              accent={accent} accentLight={accentLight}
            />
          </div>

          <div style={{ textAlign: 'right', marginTop: -8 }}>
            <span style={{ fontFamily: 'Inter', fontSize: 12, color: '#888888', cursor: 'default' }}>
              Forgot password?
            </span>
          </div>

          <button
            type="submit" disabled={loading}
            style={{
              height: 52, borderRadius: 8, background: loading ? '#888888' : accent,
              color: 'white', border: 'none', width: '100%',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter', fontWeight: 600, fontSize: 14, letterSpacing: '0.04em',
              transition: 'all 150ms ease', opacity: loading ? 0.6 : 1,
            }}
            onMouseOver={e => { if (!loading) e.currentTarget.style.background = accentDark; }}
            onMouseOut={e => { if (!loading) e.currentTarget.style.background = accent; }}
          >
            {loading ? 'Signing In...' : 'SIGN IN'}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#888888' }}>
            New to UPahan?{' '}
            <button
              onClick={() => navigate(`/register/${role}`)}
              style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13, color: accent, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              SIGN UP
            </button>
          </p>
        </div>
      </div>

      <button
        onClick={() => navigate('/select-role')}
        style={{ marginTop: 24, fontFamily: 'Inter', fontWeight: 500, fontSize: 13, color: '#2E7D72', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        ← Back to Role Select
      </button>
    </div>
  );
}
