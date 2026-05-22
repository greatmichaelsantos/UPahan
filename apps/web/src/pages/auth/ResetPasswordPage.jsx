import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import api from '../../utils/api';

const PASSWORD_CRITERIA = [
  { key: 'length',    label: 'At least 8 characters', test: p => p.length >= 8 },
  { key: 'uppercase', label: 'One uppercase letter',  test: p => /[A-Z]/.test(p) },
  { key: 'lowercase', label: 'One lowercase letter',  test: p => /[a-z]/.test(p) },
  { key: 'number',    label: 'One number',            test: p => /[0-9]/.test(p) },
  { key: 'special',   label: 'One special character', test: p => /[^A-Za-z0-9]/.test(p) },
];

const PasswordInput = ({ value, onChange, showPass, onToggle, accent, accentLight, placeholder }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#888888' }} />
      <input
        type={showPass ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder || '••••••••'}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', height: 52, borderRadius: 8,
          background: focused ? accentLight : '#F0EEEB',
          border: `1.5px solid ${focused ? accent : 'transparent'}`,
          fontFamily: 'Inter', fontSize: 14, color: '#4A4A4A',
          paddingLeft: 42, paddingRight: 44,
          outline: 'none', transition: 'all 150ms ease',
        }}
      />
      <button
        type="button" onClick={onToggle}
        style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888888', display: 'flex', padding: 0 }}
        aria-label={showPass ? 'Hide password' : 'Show password'}
      >
        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
};

const LABEL_STYLE = {
  display: 'block', fontFamily: 'Inter', fontWeight: 600, fontSize: 12,
  color: '#4A4A4A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6,
};

export default function ResetPasswordPage() {
  const navigate        = useNavigate();
  const [params]        = useSearchParams();
  const token           = params.get('token') || '';
  const accent          = '#2E7D72';
  const accentDark      = '#1F5C56';
  const accentLight     = '#E8F5F3';

  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass]               = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState('');
  const [done, setDone]                       = useState(false);

  const allMet = PASSWORD_CRITERIA.every(c => c.test(password));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) { setError('Please enter a new password.'); return; }
    if (!allMet)   { setError('Password does not meet all requirements.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (!token)    { setError('Invalid reset link. Please request a new one.'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired reset link.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5" style={{ background: '#FAF8F5' }}>
      <div style={{
        background: 'white', borderRadius: 16, padding: '36px 28px 32px',
        width: '100%', maxWidth: 420,
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
          Reset Password
        </h1>
        <div style={{ width: 48, height: 1.5, background: '#C9A84C', margin: '10px auto 24px' }} />

        {done ? (
          <>
            <div style={{ background: '#E8F5E9', border: '1px solid #2E7D32', borderRadius: 8, padding: '12px 14px', color: '#2E7D32', fontSize: 13, fontFamily: 'Inter', marginBottom: 20 }}>
              Password reset! You may now log in with your new password.
            </div>
            <button
              onClick={() => navigate('/select-role')}
              style={{
                height: 52, borderRadius: 8, background: accent, color: 'white',
                border: 'none', width: '100%', cursor: 'pointer',
                fontFamily: 'Inter', fontWeight: 600, fontSize: 14, letterSpacing: '0.04em',
              }}
            >
              GO TO LOGIN
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {error && (
              <div style={{ background: '#FDEEEE', border: '1px solid #D64045', borderRadius: 8, padding: '10px 14px', color: '#D64045', fontSize: 13, fontFamily: 'Inter' }}>
                {error}
              </div>
            )}

            <div>
              <label style={LABEL_STYLE}>New Password</label>
              <PasswordInput
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                showPass={showPass}
                onToggle={() => setShowPass(p => !p)}
                accent={accent}
                accentLight={accentLight}
              />
              {password.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', marginTop: 10 }}>
                  {PASSWORD_CRITERIA.map(c => {
                    const met = c.test(password);
                    return (
                      <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{
                          width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                          background: met ? accent : '#DDDDDD',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'background 150ms ease',
                        }}>
                          {met && (
                            <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                              <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <span style={{ fontFamily: 'Inter', fontSize: 11, color: met ? accent : '#999999', fontWeight: met ? 600 : 400, transition: 'color 150ms ease' }}>
                          {c.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label style={LABEL_STYLE}>Confirm Password</label>
              <PasswordInput
                value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                showPass={showConfirmPass}
                onToggle={() => setShowConfirmPass(p => !p)}
                accent={accent}
                accentLight={accentLight}
              />
              {confirmPassword.length > 0 && confirmPassword !== password && (
                <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#D64045', marginTop: 5 }}>Passwords do not match</p>
              )}
              {confirmPassword.length > 0 && confirmPassword === password && password.length > 0 && (
                <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#2E7D32', marginTop: 5 }}>Passwords match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 4, height: 52, borderRadius: 8,
                background: loading ? '#888888' : accent,
                color: 'white', border: 'none', width: '100%',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter', fontWeight: 600, fontSize: 14, letterSpacing: '0.04em',
                transition: 'all 150ms ease', opacity: loading ? 0.6 : 1,
              }}
              onMouseOver={e => { if (!loading) e.currentTarget.style.background = accentDark; }}
              onMouseOut={e => { if (!loading) e.currentTarget.style.background = accent; }}
            >
              {loading ? 'Resetting...' : 'RESET PASSWORD'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
