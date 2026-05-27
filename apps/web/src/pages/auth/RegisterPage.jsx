import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import TermsAndConditions from '../TermsAndConditions';

const NAME_REGEX  = /^[A-Za-z\s'\-]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Defined OUTSIDE RegisterPage so React does not remount on re-render
const InputField = ({ label, icon: Icon, type, placeholder, autoComplete, value, onChange, onBlur, accent, accentLight, error }) => {
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
          onBlur={() => { setFocused(false); onBlur?.(); }}
          style={{
            width: '100%', height: 52, borderRadius: 8,
            background: focused ? accentLight : (error ? '#FEF2F2' : '#F0EEEB'),
            border: `1.5px solid ${error ? '#D64045' : focused ? accent : 'transparent'}`,
            fontFamily: 'Inter', fontSize: 14, color: '#4A4A4A',
            paddingLeft: Icon ? 42 : 14, paddingRight: 14,
            outline: 'none', transition: 'all 150ms ease',
          }}
        />
      </div>
      {error && <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#D64045', marginTop: 5 }}>{error}</p>}
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

const PASSWORD_CRITERIA = [
  { key: 'length',    label: 'At least 8 characters', test: p => p.length >= 8 },
  { key: 'uppercase', label: 'One uppercase letter',  test: p => /[A-Z]/.test(p) },
  { key: 'lowercase', label: 'One lowercase letter',  test: p => /[a-z]/.test(p) },
  { key: 'number',    label: 'One number',            test: p => /[0-9]/.test(p) },
  { key: 'special',   label: 'One special character', test: p => /[^A-Za-z0-9]/.test(p) },
];

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

  const [form, setForm]           = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError]   = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass]       = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ firstName: '', lastName: '', email: '' });

  const isAdmin     = role === 'admin';
  const accent      = isAdmin ? '#2E7D72' : '#3A7BD5';
  const accentDark  = isAdmin ? '#1F5C56' : '#2f6abf';
  const accentLight = isAdmin ? '#E8F5F3' : '#EBF2FC';
  const roleLabel   = isAdmin ? 'LANDLORD' : 'TENANT';

  const clearFieldError = (field) => setFieldErrors(e => ({ ...e, [field]: '' }));

  const handleChange = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    clearFieldError(field);
  };

  const validateName = (label, value) => {
    if (!value.trim())              return `${label} is required.`;
    if (value.trim().length < 2)    return `${label} must be at least 2 characters.`;
    if (!NAME_REGEX.test(value))    return `${label} must contain letters only.`;
    return '';
  };

  const handleBlur = (field) => () => {
    if (field === 'firstName') setFieldErrors(e => ({ ...e, firstName: validateName('First name', form.firstName) }));
    if (field === 'lastName')  setFieldErrors(e => ({ ...e, lastName:  validateName('Last name',  form.lastName)  }));
    if (field === 'email') {
      if (!form.email.trim())            setFieldErrors(e => ({ ...e, email: 'Email is required.' }));
      else if (!EMAIL_REGEX.test(form.email)) setFieldErrors(e => ({ ...e, email: 'Please enter a valid email address.' }));
      else                               setFieldErrors(e => ({ ...e, email: '' }));
    }
  };

  const handlePhoneChange = (e) => {
    setPhoneNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 11));
    if (phoneError) setPhoneError('');
  };

  const validatePhone = () => {
    if (!phoneNumber) { setPhoneError(''); return true; }
    if (phoneNumber.length !== 11 || !phoneNumber.startsWith('09')) {
      setPhoneError('Phone number must be 11 digits starting with 09.');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleTermsAgree = () => {
    setTermsAgreed(true);
    setShowTerms(false);
  };

  const handleTermsCancel = () => {
    setShowTerms(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const { firstName, lastName, email, password } = form;
    if (!firstName || !lastName || !email || !password) {
      setError('Please fill in all required fields.'); return;
    }
    const fnErr = validateName('First name', firstName);
    const lnErr = validateName('Last name',  lastName);
    const emErr = !EMAIL_REGEX.test(email) ? 'Please enter a valid email address.' : '';
    if (fnErr || lnErr || emErr) {
      setFieldErrors({ firstName: fnErr, lastName: lnErr, email: emErr });
      setError('Please fix the highlighted fields.'); return;
    }
    if (!PASSWORD_CRITERIA.every(c => c.test(password))) {
      setError('Password does not meet all requirements.'); return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.'); return;
    }
    if (!validatePhone()) return;

    const result = await register({ ...form, phoneNumber, role });
    if (result.success) {
      setSuccess(result.message || 'Registration successful! Please check your email to verify your account before logging in.');
      setTimeout(() => navigate(`/login/${role}`), 4000);
    } else {
      setError(friendlyError(result.message));
    }
  };

  const canSubmit = termsAgreed && !loading;

  return (
    <>
      {showTerms && (
        <TermsAndConditions
          role={role}
          onAgree={handleTermsAgree}
          onCancel={handleTermsCancel}
        />
      )}

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

          <h1 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 28, color: '#4A4A4A', textAlign: 'center', marginBottom: 6 }}>
            Create Account
          </h1>
          <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#888888', textAlign: 'center', marginBottom: 24 }}>
            Join Upahan to manage your property easily.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {success && (
              <div style={{ background: '#E8F5E9', border: '1px solid #2E7D32', borderRadius: 8, padding: '10px 14px', color: '#2E7D32', fontSize: 13, fontFamily: 'Inter' }}>
                {success}
              </div>
            )}
            {error && (
              <div style={{ background: '#FDEEEE', border: '1px solid #D64045', borderRadius: 8, padding: '10px 14px', color: '#D64045', fontSize: 13, fontFamily: 'Inter' }}>
                {error}
              </div>
            )}

            {/* Name row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <InputField
                label="First Name *" icon={User}
                placeholder="Maria" value={form.firstName}
                onChange={handleChange('firstName')}
                onBlur={handleBlur('firstName')}
                error={fieldErrors.firstName}
                accent={accent} accentLight={accentLight}
              />
              <InputField
                label="Last Name *"
                placeholder="Santos" value={form.lastName}
                onChange={handleChange('lastName')}
                onBlur={handleBlur('lastName')}
                error={fieldErrors.lastName}
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
              label="Email Address *" icon={Mail}
              placeholder="you@example.com" type="email" autoComplete="email"
              value={form.email} onChange={handleChange('email')}
              onBlur={handleBlur('email')}
              error={fieldErrors.email}
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
              {form.password.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', marginTop: 10 }}>
                  {PASSWORD_CRITERIA.map(c => {
                    const met = c.test(form.password);
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
                        <span style={{
                          fontFamily: 'Inter', fontSize: 11,
                          color: met ? accent : '#999999',
                          fontWeight: met ? 600 : 400,
                          transition: 'color 150ms ease',
                        }}>
                          {c.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{
                display: 'block', fontFamily: 'Inter', fontWeight: 600, fontSize: 12,
                color: '#4A4A4A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6,
              }}>
                Confirm Password
              </label>
              <PasswordField
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                showPass={showConfirmPass}
                onToggle={() => setShowConfirmPass(p => !p)}
                accent={accent}
                accentLight={accentLight}
              />
              {confirmPassword.length > 0 && confirmPassword !== form.password && (
                <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#D64045', marginTop: 5 }}>
                  Passwords do not match
                </p>
              )}
              {confirmPassword.length > 0 && confirmPassword === form.password && form.password.length > 0 && (
                <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#2E7D32', marginTop: 5 }}>
                  Passwords match
                </p>
              )}
            </div>

            {/* T&C checkbox row */}
            <div
              onClick={() => setShowTerms(true)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                cursor: 'pointer', marginTop: 4,
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
                border: `2px solid ${termsAgreed ? accent : '#AAAAAA'}`,
                background: termsAgreed ? accent : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 150ms ease',
              }}>
                {termsAgreed && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#555555', lineHeight: 1.6, userSelect: 'none' }}>
                I have read and agree to the{' '}
                <span style={{ color: accent, fontWeight: 600, textDecoration: 'underline' }}>
                  Terms and Conditions
                </span>
              </span>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                marginTop: 4, height: 52, borderRadius: 8,
                background: canSubmit ? accent : '#CCCCCC',
                color: 'white', border: 'none', width: '100%',
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                fontFamily: 'Inter', fontWeight: 600, fontSize: 14, letterSpacing: '0.04em',
                transition: 'all 150ms ease',
              }}
              onMouseOver={e => { if (canSubmit) e.currentTarget.style.background = accentDark; }}
              onMouseOut={e => { if (canSubmit) e.currentTarget.style.background = accent; }}
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
    </>
  );
}
