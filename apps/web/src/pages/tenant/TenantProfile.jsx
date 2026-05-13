import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera, Lock, LogOut, ChevronRight, Eye, EyeOff, CreditCard, FileText, ExternalLink, X } from 'lucide-react';
import TenantLayout from '../../components/TenantLayout';
import StatusBadge from '../../components/StatusBadge';
import SubmitIdModal from '../../components/SubmitIdModal';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { formatDate } from '../../utils/format';

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const GOLD   = '#C9A84C';
const BLUE   = '#3A7BD5';
const TEAL   = '#4A90D9';
const RED    = '#D64045';
const CREAM  = '#FAF8F5';

const inputStyle = {
  width: '100%', padding: '11px 14px', border: '1.5px solid #E5E0D8',
  borderRadius: 10, fontFamily: 'Inter', fontSize: 14, color: '#4A4A4A',
  background: 'white', boxSizing: 'border-box', outline: 'none',
  transition: 'border-color 150ms ease',
};

const sectionLabel = {
  fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: GOLD,
  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14,
};

const cardStyle = {
  background: 'white', borderRadius: 12, padding: 16,
  boxShadow: '0 1px 8px rgba(0,0,0,0.06)', marginBottom: 0,
};

// ─── PwField — defined outside modal so its identity is stable across renders ─
function PwField({ label, value, showPw, onChange, onToggle }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={showPw ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          style={{ ...inputStyle, paddingRight: 44 }}
        />
        <button
          type="button"
          onClick={onToggle}
          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
        >
          {showPw ? <EyeOff size={16} color="#888" /> : <Eye size={16} color="#888" />}
        </button>
      </div>
    </div>
  );
}

// ─── Change Password Modal ────────────────────────────────────────────────────
function ChangePasswordModal({ onClose }) {
  const [form, setForm]     = useState({ current: '', newPw: '', confirm: '' });
  const [show, setShow]     = useState({ current: false, newPw: false, confirm: false });
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEsc = useCallback((e) => { if (e.key === 'Escape') onClose(); }, [onClose]);
  useEffect(() => {
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [handleEsc]);

  const set = (f) => (e) => { setForm(p => ({ ...p, [f]: e.target.value })); setError(''); };
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full md:max-w-md" style={{ background: 'white', borderRadius: '20px 20px 0 0', padding: '24px 20px 36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 20, color: '#4A4A4A' }}>
            Change Password
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <X size={20} color="#888" />
          </button>
        </div>

        {success ? (
          <div style={{ background: '#EBF4FF', border: '1px solid #4A90D9', borderRadius: 10, padding: '14px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 14, color: TEAL }}>Password changed successfully!</p>
          </div>
        ) : (
          <>
            <PwField label="Current Password" value={form.current} showPw={show.current} onChange={set('current')} onToggle={toggle('current')} />
            <PwField label="New Password"      value={form.newPw}   showPw={show.newPw}   onChange={set('newPw')}   onToggle={toggle('newPw')} />
            <PwField label="Confirm New Password" value={form.confirm} showPw={show.confirm} onChange={set('confirm')} onToggle={toggle('confirm')} />

            {error && (
              <div style={{ background: '#FEF2F2', borderRadius: 8, padding: '10px 14px', marginBottom: 14 }}>
                <p style={{ fontFamily: 'Inter', fontSize: 13, color: RED }}>{error}</p>
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={loading}
              style={{ width: '100%', padding: '13px', background: loading ? '#9BB8E8' : BLUE, color: 'white', border: 'none', borderRadius: 10, fontFamily: 'Inter', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 10 }}
            >
              {loading ? 'Saving...' : 'SAVE PASSWORD'}
            </button>
            <button
              onClick={onClose}
              style={{ width: '100%', padding: '13px', background: 'transparent', color: '#888', border: '1.5px solid #E0DDD8', borderRadius: 10, fontFamily: 'Inter', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
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
        <h2 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 20, color: '#4A4A4A', marginBottom: 8 }}>
          Log Out?
        </h2>
        <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#888', marginBottom: 24, lineHeight: 1.5 }}>
          Are you sure you want to log out?
        </p>
        <button
          onClick={onConfirm}
          style={{ width: '100%', padding: '13px', background: RED, color: 'white', border: 'none', borderRadius: 10, fontFamily: 'Inter', fontWeight: 700, fontSize: 14, cursor: 'pointer', marginBottom: 10 }}
        >
          LOG OUT
        </button>
        <button
          onClick={onClose}
          style={{ width: '100%', padding: '13px', background: 'transparent', color: '#888', border: '1.5px solid #E0DDD8', borderRadius: 10, fontFamily: 'Inter', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
        >
          CANCEL
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TenantProfile() {
  const { user, logout, updateUser } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [profile, setProfile]   = useState(null);
  const [documents, setDocuments] = useState([]);
  const [form, setForm]         = useState({ first_name: '', last_name: '', phone_number: '' });
  const [original, setOriginal] = useState({ first_name: '', last_name: '', phone_number: '' });
  const [phoneError, setPhoneError] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError]     = useState('');
  const [avatarLoading, setAvatarLoading] = useState(false);

  const [showPwModal, setShowPwModal]     = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showIdModal, setShowIdModal]     = useState(false);

  const fileInputRef = useRef(null);

  const fetchProfile = useCallback(() => {
    api.get('/users/me').then(r => {
      const d = r.data.data;
      setProfile(d);
      const fields = { first_name: d.first_name || '', last_name: d.last_name || '', phone_number: d.phone_number || '' };
      setForm(fields);
      setOriginal(fields);
    }).catch(() => {});
  }, []);

  const fetchDocuments = useCallback(() => {
    api.get('/documents/my-documents').then(r => setDocuments(r.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchDocuments();
    const interval = setInterval(() => { fetchProfile(); fetchDocuments(); }, 30000);
    return () => clearInterval(interval);
  }, [fetchProfile, fetchDocuments, location.key]);

  const idDoc   = documents.find(d => d.document_type === 'valid_id');
  const contract = documents.find(d => d.document_type === 'contract');
  const canSubmitId = !idDoc || idDoc.status === 'rejected';

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
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setSaveError('First and last name are required.'); return;
    }
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

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Photo must be under 2MB.'); return; }
    if (!/\.(jpg|jpeg|png)$/i.test(file.name)) { alert('Only JPG and PNG files are accepted.'); return; }
    setAvatarLoading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const r = await api.post('/users/me/photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setProfile(p => ({ ...p, profile_photo: r.data.data.profile_photo }));
      updateUser({ profile_photo: r.data.data.profile_photo });
    } catch {
      alert('Failed to upload photo.');
    } finally {
      setAvatarLoading(false);
    }
  };

  const avatarSrc = profile?.profile_photo
    ? `${BASE_URL}/uploads/avatars/${profile.profile_photo}`
    : null;

  const initials = `${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`.toUpperCase() || 'T';

  /* ── Shared avatar block (reused in both mobile header and desktop left col) ── */
  const renderAvatar = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', marginBottom: 14 }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: avatarSrc ? 'transparent' : BLUE,
          border: '3px solid white',
          boxShadow: '0 2px 12px rgba(58,123,213,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {avatarSrc ? (
            <img src={avatarSrc} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 28, color: 'white' }}>{initials}</span>
          )}
          {avatarLoading && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
              <div style={{ width: 20, height: 20, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            </div>
          )}
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 26, height: 26, borderRadius: '50%',
            background: BLUE, border: '2px solid white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          }}
          aria-label="Change profile photo"
        >
          <Camera size={12} color="white" />
        </button>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" onChange={handleAvatarChange} style={{ display: 'none' }} />
      </div>
      <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 20, color: '#4A4A4A', marginBottom: 4, textAlign: 'center' }}>
        {profile ? `${profile.first_name} ${profile.last_name}` : '—'}
      </p>
      <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#888888', textAlign: 'center' }}>
        {profile?.email || user?.email}
      </p>
    </div>
  );

  return (
    <TenantLayout title="Profile">
    <div style={{ minHeight: '100vh', background: CREAM }}>

      {/* Profile header — mobile only */}
      <div className="md:hidden" style={{ background: 'white', padding: '32px 20px 24px', borderBottom: '1px solid #F0EEEB' }}>
        {renderAvatar()}
      </div>

      <div className="p-4 md:p-6">
        <div className="flex flex-col gap-4 md:grid md:gap-6 md:items-start" style={{ gridTemplateColumns: '1fr 380px' }}>

          {/* ── LEFT column ─── */}
          <div className="flex flex-col gap-4">

            {/* Desktop avatar card */}
            <div className="hidden md:block" style={{ ...cardStyle, textAlign: 'center', padding: '28px 20px' }}>
              {renderAvatar()}
            </div>

            {/* Personal Information */}
            <div>
              <p style={sectionLabel}>Personal Information</p>
              <div style={cardStyle}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>First Name</label>
                  <input
                    value={form.first_name}
                    onChange={handleFieldChange('first_name')}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = BLUE}
                    onBlur={e => e.target.style.borderColor = '#E5E0D8'}
                  />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Last Name</label>
                  <input
                    value={form.last_name}
                    onChange={handleFieldChange('last_name')}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = BLUE}
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
                    onFocus={e => e.target.style.borderColor = phoneError ? RED : BLUE}
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
                  <div style={{ background: '#EBF4FF', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}>
                    <p style={{ fontFamily: 'Inter', fontSize: 13, color: TEAL, fontWeight: 600 }}>{saveSuccess}</p>
                  </div>
                )}

                {isDirty && (
                  <button
                    onClick={handleSave}
                    disabled={saveLoading}
                    style={{ width: '100%', padding: '13px', background: saveLoading ? '#9BB8E8' : BLUE, color: 'white', border: 'none', borderRadius: 10, fontFamily: 'Inter', fontWeight: 700, fontSize: 14, cursor: saveLoading ? 'not-allowed' : 'pointer' }}
                  >
                    {saveLoading ? 'Saving...' : 'SAVE CHANGES'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT column ── */}
          <div className="flex flex-col gap-4">

            {/* Documents */}
            <div>
              <p style={sectionLabel}>My Documents</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

                {/* Valid ID */}
                <div style={cardStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: idDoc ? 12 : 0 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#EEF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CreditCard size={20} color={BLUE} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 15, color: '#4A4A4A' }}>Valid ID</p>
                      {idDoc ? (
                        <p style={{ fontFamily: 'Inter', fontSize: 11, marginTop: 2, fontWeight: 600,
                          color: idDoc.status === 'verified' ? TEAL : idDoc.status === 'rejected' ? RED : '#E07B39'
                        }}>
                          {idDoc.status === 'verified' ? '✓ Verified'
                            : idDoc.status === 'rejected' ? '✗ Rejected'
                            : '● Under Review'}
                        </p>
                      ) : (
                        <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#AAAAAA', marginTop: 2 }}>Not submitted</p>
                      )}
                    </div>
                    {idDoc && <StatusBadge status={idDoc.status === 'under_review' ? 'under_review' : idDoc.status} />}
                  </div>

                  {idDoc?.status === 'rejected' && idDoc?.rejection_reason && (
                    <p style={{ fontFamily: 'Inter', fontSize: 12, color: RED, fontStyle: 'italic', marginBottom: 10 }}>
                      Reason: {idDoc.rejection_reason}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: 8 }}>
                    {canSubmitId && (
                      <button
                        onClick={() => setShowIdModal(true)}
                        style={{ flex: 1, padding: '10px', background: 'transparent', color: TEAL, border: `1.5px solid ${TEAL}`, borderRadius: 10, fontFamily: 'Inter', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                      >
                        {idDoc?.status === 'rejected' ? 'Resubmit ID' : 'Submit ID'}
                      </button>
                    )}
                    {idDoc && (idDoc.status === 'under_review' || idDoc.status === 'verified') && idDoc.front_image && (
                      <a
                        href={`${BASE_URL}/uploads/documents/${idDoc.front_image}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ flex: 1, padding: '10px', background: '#F0F9F7', color: TEAL, border: `1.5px solid ${TEAL}`, borderRadius: 10, fontFamily: 'Inter', fontWeight: 700, fontSize: 13, textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                      >
                        <ExternalLink size={13} /> View ID
                      </a>
                    )}
                  </div>
                </div>

                {/* Lease Contract */}
                <div style={cardStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: contract ? 12 : 0 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#F0F9F7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileText size={20} color={TEAL} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 15, color: '#4A4A4A' }}>Lease Contract</p>
                      <p style={{ fontFamily: 'Inter', fontSize: 11, marginTop: 2, fontWeight: 600, color: contract ? TEAL : '#AAAAAA' }}>
                        {contract ? '✓ Available' : 'Not yet uploaded by landlord'}
                      </p>
                    </div>
                    {contract && <StatusBadge status="verified" />}
                  </div>

                  {contract && (
                    <>
                      {(contract.contract_start_date || contract.contract_end_date) && (
                        <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#888', marginBottom: 10 }}>
                          {contract.contract_start_date ? formatDate(contract.contract_start_date, 'medium') : '—'}
                          {' – '}
                          {contract.contract_end_date ? formatDate(contract.contract_end_date, 'medium') : 'Ongoing'}
                        </p>
                      )}
                      <a
                        href={`${BASE_URL}/uploads/documents/${contract.contract_file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '10px', background: '#F0F9F7', color: TEAL, border: `1.5px solid ${TEAL}`, borderRadius: 10, fontFamily: 'Inter', fontWeight: 700, fontSize: 13, textDecoration: 'none', boxSizing: 'border-box' }}
                      >
                        <ExternalLink size={13} /> View / Download Contract
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Account */}
            <div>
              <p style={sectionLabel}>Account</p>
              <div style={cardStyle}>
                <button
                  onClick={() => setShowPwModal(true)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid #F0EEEB' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#EEF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Lock size={16} color={BLUE} />
                    </div>
                    <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: '#4A4A4A' }}>Change Password</span>
                  </div>
                  <ChevronRight size={18} color="#BBBBBB" />
                </button>

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
        </div>
      </div>

      {showPwModal    && <ChangePasswordModal onClose={() => setShowPwModal(false)} />}
      {showLogoutModal && <LogoutModal onConfirm={logout} onClose={() => setShowLogoutModal(false)} />}
      {showIdModal    && <SubmitIdModal onClose={() => setShowIdModal(false)} onSuccess={() => { setShowIdModal(false); fetchDocuments(); }} />}
    </div>
    </TenantLayout>
  );
}
