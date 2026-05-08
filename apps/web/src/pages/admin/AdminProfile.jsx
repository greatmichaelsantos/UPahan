import React, { useEffect, useState, useCallback } from 'react';
import { Lock, LogOut, ChevronRight, Eye, EyeOff, X } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const TEAL  = '#2E7D72';
const GOLD  = '#C9A84C';
const RED   = '#D64045';
const CREAM = '#FAF8F5';

const inputStyle = {
  width: '100%', padding: '11px 14px', border: '1.5px solid #E5E0D8',
  borderRadius: 10, fontFamily: 'Inter', fontSize: 14, color: '#4A4A4A',
  background: 'white', boxSizing: 'border-box', outline: 'none',
};

const sectionLabel = {
  fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: GOLD,
  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14,
};

const cardStyle = {
  background: 'white', borderRadius: 12, padding: 16,
  boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
};

// ─── Change Password Modal ────────────────────────────────────────────────────
function ChangePasswordModal({ onClose }) {
  const [form, setForm]       = useState({ current: '', newPw: '', confirm: '' });
  const [show, setShow]       = useState({ current: false, newPw: false, confirm: false });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEsc = useCallback((e) => { if (e.key === 'Escape') onClose(); }, [onClose]);
  useEffect(() => {
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [handleEsc]);

  const set    = (f) => (e) => { setForm(p => ({ ...p, [f]: e.target.value })); setError(''); };
  const toggle = (f) => () => setShow(p => ({ ...p, [f]: !p[f] }));

  const handleSave = async () => {
    if (!form.current) return setError('Please enter your current password.');
    if (!form.newPw)   return setError('Please enter a new password.');
    if (form.newPw.length < 6) return setError('New password must be at least 6 characters.');
    if (form.newPw !== form.confirm) return setError('New passwords do not match.');
    setLoading(true);
    try {
      await api.put('/users/me/password', { currentPassword: form.current, newPassword: form.newPw });
      setSuccess(true);
      setTimeout(onClose, 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  const PwField = ({ label, field }) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={show[field] ? 'text' : 'password'}
          value={form[field]}
          onChange={set(field)}
          style={{ ...inputStyle, paddingRight: 44 }}
          onFocus={e => e.target.style.borderColor = TEAL}
          onBlur={e => e.target.style.borderColor = '#E5E0D8'}
        />
        <button
          type="button"
          onClick={toggle(field)}
          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
        >
          {show[field] ? <EyeOff size={16} color="#888" /> : <Eye size={16} color="#888" />}
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full md:max-w-md" style={{ background: 'white', borderRadius: '20px 20px 0 0', padding: '24px 20px 36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: '"Playfair Display",Georgia,serif', fontWeight: 700, fontSize: 20, color: '#4A4A4A' }}>
            Change Password
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <X size={20} color="#888" />
          </button>
        </div>
        {success ? (
          <div style={{ background: '#E8F5F3', border: `1px solid ${TEAL}`, borderRadius: 10, padding: 14, textAlign: 'center' }}>
            <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 14, color: TEAL }}>Password changed successfully!</p>
          </div>
        ) : (
          <>
            <PwField label="Current Password" field="current" />
            <PwField label="New Password"     field="newPw" />
            <PwField label="Confirm New Password" field="confirm" />
            {error && (
              <div style={{ background: '#FEF2F2', borderRadius: 8, padding: '10px 14px', marginBottom: 14 }}>
                <p style={{ fontFamily: 'Inter', fontSize: 13, color: RED }}>{error}</p>
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={loading}
              style={{ width: '100%', padding: 13, background: loading ? '#7EB5B0' : TEAL, color: 'white', border: 'none', borderRadius: 10, fontFamily: 'Inter', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 10 }}
            >
              {loading ? 'Saving...' : 'SAVE PASSWORD'}
            </button>
            <button
              onClick={onClose}
              style={{ width: '100%', padding: 13, background: 'transparent', color: '#888', border: '1.5px solid #E0DDD8', borderRadius: 10, fontFamily: 'Inter', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
            >
              CANCEL
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Logout Confirm Modal ─────────────────────────────────────────────────────
function LogoutModal({ onConfirm, onClose }) {
  const handleEsc = useCallback((e) => { if (e.key === 'Escape') onClose(); }, [onClose]);
  useEffect(() => {
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [handleEsc]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full md:max-w-sm" style={{ background: 'white', borderRadius: '20px 20px 0 0', padding: '28px 20px 36px', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <LogOut size={24} color={RED} />
        </div>
        <h2 style={{ fontFamily: '"Playfair Display",Georgia,serif', fontWeight: 700, fontSize: 20, color: '#4A4A4A', marginBottom: 8 }}>
          Log Out?
        </h2>
        <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#888', marginBottom: 24, lineHeight: 1.5 }}>
          Are you sure you want to log out?
        </p>
        <button
          onClick={onConfirm}
          style={{ width: '100%', padding: 13, background: RED, color: 'white', border: 'none', borderRadius: 10, fontFamily: 'Inter', fontWeight: 700, fontSize: 14, cursor: 'pointer', marginBottom: 10 }}
        >
          LOG OUT
        </button>
        <button
          onClick={onClose}
          style={{ width: '100%', padding: 13, background: 'transparent', color: '#888', border: '1.5px solid #E0DDD8', borderRadius: 10, fontFamily: 'Inter', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
        >
          CANCEL
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminProfile() {
  const { user, logout, updateUser } = useAuth();

  const [profile, setProfile]     = useState(null);
  const [form, setForm]           = useState({ first_name: '', last_name: '', phone_number: '' });
  const [original, setOriginal]   = useState({ first_name: '', last_name: '', phone_number: '' });
  const [phoneError, setPhoneError] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError]     = useState('');

  const [showPwModal,     setShowPwModal]     = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const fetchProfile = useCallback(() => {
    api.get('/users/me').then(r => {
      const d = r.data.data;
      setProfile(d);
      const fields = { first_name: d.first_name || '', last_name: d.last_name || '', phone_number: d.phone_number || '' };
      setForm(fields);
      setOriginal(fields);
    }).catch(() => {});
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const isDirty = form.first_name !== original.first_name ||
                  form.last_name  !== original.last_name  ||
                  form.phone_number !== original.phone_number;

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
    setForm(p => ({ ...p, phone_number: val }));
    setPhoneError('');
    setSaveSuccess('');
  };

  const handleFieldChange = (f) => (e) => {
    setForm(p => ({ ...p, [f]: e.target.value }));
    setSaveSuccess('');
    setSaveError('');
  };

  const validatePhone = () => {
    if (!form.phone_number) return true;
    if (form.phone_number.length !== 11) { setPhoneError('Phone number must be 11 digits.'); return false; }
    if (!form.phone_number.startsWith('09')) { setPhoneError('Phone number must start with 09.'); return false; }
    return true;
  };

  const handleSave = async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) { setSaveError('First and last name are required.'); return; }
    if (!validatePhone()) return;
    setSaveLoading(true);
    setSaveError('');
    setSaveSuccess('');
    try {
      const r = await api.put('/users/me', form);
      const updated = r.data.data;
      setProfile(updated);
      const fields = { first_name: updated.first_name, last_name: updated.last_name, phone_number: updated.phone_number || '' };
      setForm(fields);
      setOriginal(fields);
      updateUser({ first_name: updated.first_name, last_name: updated.last_name, phone_number: updated.phone_number });
      setSaveSuccess('Profile updated successfully.');
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  const initials = `${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`.toUpperCase() || 'A';

  return (
    <AdminLayout>
      <div style={{ minHeight: '100vh', background: CREAM, paddingBottom: 90 }}>

        {/* Profile header */}
        <div style={{ background: 'white', padding: '32px 20px 24px', borderBottom: '1px solid #F0EEEB', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', background: TEAL,
            border: '3px solid white', boxShadow: '0 2px 12px rgba(46,125,114,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
          }}>
            <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 28, color: 'white' }}>{initials}</span>
          </div>
          <p style={{ fontFamily: '"Playfair Display",Georgia,serif', fontWeight: 700, fontSize: 20, color: '#4A4A4A', marginBottom: 4 }}>
            {profile ? `${profile.first_name} ${profile.last_name}` : '—'}
          </p>
          <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#888888' }}>
            {profile?.email || user?.email}
          </p>
        </div>

        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 480, margin: '0 auto' }}>

          {/* ── Personal Information ──────────────────────────────── */}
          <div>
            <p style={sectionLabel}>Personal Information</p>
            <div style={cardStyle}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>First Name</label>
                <input
                  value={form.first_name}
                  onChange={handleFieldChange('first_name')}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = TEAL}
                  onBlur={e => e.target.style.borderColor = '#E5E0D8'}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Last Name</label>
                <input
                  value={form.last_name}
                  onChange={handleFieldChange('last_name')}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = TEAL}
                  onBlur={e => e.target.style.borderColor = '#E5E0D8'}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Phone Number</label>
                <input
                  type="tel"
                  value={form.phone_number}
                  onChange={handlePhoneChange}
                  maxLength={11}
                  placeholder="09XXXXXXXXX"
                  style={{ ...inputStyle, borderColor: phoneError ? RED : '#E5E0D8' }}
                  onFocus={e => e.target.style.borderColor = phoneError ? RED : TEAL}
                  onBlur={e => e.target.style.borderColor = phoneError ? RED : '#E5E0D8'}
                />
                {phoneError && <p style={{ fontFamily: 'Inter', fontSize: 12, color: RED, marginTop: 4 }}>{phoneError}</p>}
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>
                  Email Address
                  <span style={{ marginLeft: 6, color: '#AAA', fontWeight: 400, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <Lock size={10} /> locked
                  </span>
                </label>
                <input
                  value={profile?.email || user?.email || ''}
                  readOnly
                  style={{ ...inputStyle, background: '#F5F5F5', color: '#888', cursor: 'not-allowed', borderColor: '#EBEBEB' }}
                />
              </div>

              {saveError && (
                <div style={{ background: '#FEF2F2', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}>
                  <p style={{ fontFamily: 'Inter', fontSize: 13, color: RED }}>{saveError}</p>
                </div>
              )}
              {saveSuccess && (
                <div style={{ background: '#E8F5F3', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}>
                  <p style={{ fontFamily: 'Inter', fontSize: 13, color: TEAL, fontWeight: 600 }}>{saveSuccess}</p>
                </div>
              )}

              {isDirty && (
                <button
                  onClick={handleSave}
                  disabled={saveLoading}
                  style={{ width: '100%', padding: 13, background: saveLoading ? '#7EB5B0' : TEAL, color: 'white', border: 'none', borderRadius: 10, fontFamily: 'Inter', fontWeight: 700, fontSize: 14, cursor: saveLoading ? 'not-allowed' : 'pointer' }}
                >
                  {saveLoading ? 'Saving...' : 'SAVE CHANGES'}
                </button>
              )}
            </div>
          </div>

          {/* ── Account ──────────────────────────────────────────── */}
          <div>
            <p style={sectionLabel}>Account</p>
            <div style={cardStyle}>
              {/* Change Password */}
              <button
                onClick={() => setShowPwModal(true)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid #F0EEEB' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: '#E8F5F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Lock size={16} color={TEAL} />
                  </div>
                  <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: '#4A4A4A' }}>Change Password</span>
                </div>
                <ChevronRight size={18} color="#BBBBBB" />
              </button>

              {/* Log Out */}
              <button
                onClick={() => setShowLogoutModal(true)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer', marginTop: 2 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LogOut size={16} color={RED} />
                  </div>
                  <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: RED }}>Log Out</span>
                </div>
                <ChevronRight size={18} color="#BBBBBB" />
              </button>
            </div>
          </div>
        </div>

        {showPwModal     && <ChangePasswordModal onClose={() => setShowPwModal(false)} />}
        {showLogoutModal && <LogoutModal onConfirm={logout} onClose={() => setShowLogoutModal(false)} />}
      </div>
    </AdminLayout>
  );
}
