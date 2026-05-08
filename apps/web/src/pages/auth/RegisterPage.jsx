import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Defined OUTSIDE RegisterPage so React does not remount on re-render
const InputField = ({ label, icon: Icon, type, placeholder, autoComplete, value, onChange, accent, accentLight }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{
        display: 'block', fontFamily: 'Inter', fontWeight: 600, fontSize: 12,
        color: '#4A4A4A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6,
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {Icon && (
          <Icon size={15} aria-hidden="true" style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#888888',
          }} />
        )}
        <input
          type={type || 'text'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%', height: 52, borderRadius: 8,
            background: focused ? accentLight : '#F0EEEB',
            border: `1.5px solid ${focused ? accent : 'transparent'}`,
            fontFamily: 'Inter', fontSize: 14, color: '#4A4A4A',
            paddingLeft: Icon ? 42 : 14, paddingRight: 14,
            outline: 'none', transition: 'all 150ms ease',
          }}
        />
      </div>
    </div>
  );
};

// Phone field — numeric only, max 11 digits, shows inline error
const PhoneField = ({ value, onChange, error, accent, accentLight }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{
        display: 'block', fontFamily: 'Inter', fontWeight: 600, fontSize: 12,
        color: '#4A4A4A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6,
      }}>
        Phone Number
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type="tel"
          value={value}
          onChange={onChange}
          placeholder="09XX XXX XXXX"
          autoComplete="tel"
          maxLength={11}
          inputMode="numeric"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%', height: 52, borderRadius: 8,
            background: focused ? accentLight : (error ? '#FDEEEE' : '#F0EEEB'),
            border: `1.5px solid ${error ? '#D64045' : focused ? accent : 'transparent'}`,
            fontFamily: 'Inter', fontSize: 14, color: '#4A4A4A',
            paddingLeft: 14, paddingRight: 14,
            outline: 'none', transition: 'all 150ms ease',
          }}
        />
      </div>
      {error && (
        <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#D64045', marginTop: 5 }}>{error}</p>
      )}
    </div>
  );
};

// Also defined outside — manages its own focus state
const PasswordField = ({ value, onChange, showPass, onToggle, accent, accentLight }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <Lock size={15} aria-hidden="true" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#888888' }} />
      <input
        type={showPass ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder="Minimum 6 characters"
        autoComplete="new-password"
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

// Maps server error messages to user-friendly text
function friendlyError(msg) {
  if (!msg) return 'Something went wrong. Please try again.';
  const lower = msg.toLowerCase();
  if (lower.includes('email already in use') || lower.includes('email already')) {
    return 'An account with this email already exists. Please use a different email address to register.';
  }
  return msg;
}

export default function RegisterPage() {
  const { role }   = useParams();
  const navigate   = useNavigate();
  const { register, loading } = useAuth();

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError]   = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');

  const isAdmin     = role === 'admin';
  const accent      = isAdmin ? '#2E7D72' : '#3A7BD5';
  const accentDark  = isAdmin ? '#1F5C56' : '#2f6abf';
  const accentLight = isAdmin ? '#E8F5F3' : '#EBF2FC';
  const roleLabel   = isAdmin ? 'LANDLORD' : 'TENANT';

  const handleChange = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handlePhoneChange = (e) => {
    const numbersOnly = e.target.value.replace(/[^0-9]/g, '');
    const maxEleven = numbersOnly.slice(0, 11);
    setPhoneNumber(maxEleven);
    if (phoneError) setPhoneError('');
  };

  const validatePhone = () => {
    if (phoneNumber.length > 0 && phoneNumber.length < 11) {
      setPhoneError('Phone number must be exactly 11 digits.');
      return false;
    }
    if (phoneNumber.length === 11 && !phoneNumber.startsWith('09')) {
      setPhoneError('Phone number must start with 09.');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const { firstName, lastName, email, password } = form;
    if (!firstName || !lastName || !email || !password) {
      setError('Please fill in all required fields.'); return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }
    if (!validatePhone()) return;

    const result = await register({ ...form, phoneNumber, role });
    if (result.success) {
      navigate(isAdmin ? '/admin' : '/tenant', { replace: true });
    } else {
      setError(friendlyError(result.message));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5" style={{ background: '#FAF8F5' }}>
      <div style={{
        background: 'white', borderRadius: 16, padding: '32px 28px',
        width: '100%', maxWidth: 420,
        boxShadow: '0 4px 24px rgba(46,125,114,0.12)',
      }}>
        {/* Badge */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <span style={{
            display: 'inline-block', background: accent, color: 'white',
            borderRadius: 999, padding: '4px 14px',
            fontFamily: 'Inter', fontWeight: 700, fontSize: 11, letterSpacing: '0.08em',
          }}>
            NEW {roleLabel}
          </span>
        </div>

        <h1 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, fontSize: 28, color: '#4A4A4A', textAlign: 'center', marginBottom: 6 }}>
          Create Account
        </h1>
        <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#888888', textAlign: 'center', marginBottom: 24 }}>
          Join Upahan to manage your property easily.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && (
            <div style={{ background: '#FDEEEE', border: '1px solid #D64045', borderRadius: 8, padding: '10px 14px', color: '#D64045', fontSize: 13, fontFamily: 'Inter' }}>
              {error}
            </div>
          )}

          {/* Name row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <InputField
              label="First Name" icon={User}
              placeholder="Maria" value={form.firstName}
              onChange={handleChange('firstName')}
              accent={accent} accentLight={accentLight}
            />
            <InputField
              label="Last Name"
              placeholder="Santos" value={form.lastName}
              onChange={handleChange('lastName')}
              accent={accent} accentLight={accentLight}
            />
          </div>

          <PhoneField
            value={phoneNumber}
            onChange={handlePhoneChange}
            error={phoneError}
            accent={accent}
            accentLight={accentLight}
          />

          <InputField
            label="Email Address" icon={Mail}
            placeholder="you@example.com" type="email" autoComplete="email"
            value={form.email} onChange={handleChange('email')}
            accent={accent} accentLight={accentLight}
          />

          {/* Password — custom because it has the eye toggle */}
          <div>
            <label style={{
              display: 'block', fontFamily: 'Inter', fontWeight: 600, fontSize: 12,
              color: '#4A4A4A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6,
            }}>
              Password
            </label>
            <PasswordField
              value={form.password}
              onChange={handleChange('password')}
              showPass={showPass}
              onToggle={() => setShowPass(p => !p)}
              accent={accent}
              accentLight={accentLight}
            />
          </div>

          <button
            type="submit" disabled={loading}
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
            {loading ? 'Creating Account...' : 'COMPLETE REGISTRATION'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 18, fontFamily: 'Inter', fontSize: 13, color: '#888888' }}>
          Already have an account?{' '}
          <button
            onClick={() => navigate(`/login/${role}`)}
            style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13, color: accent, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            LOG IN
          </button>
        </p>
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
