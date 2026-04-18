import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Phone, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const { role } = useParams();
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phoneNumber: '', password: ''
  });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = role === 'admin';
  const accent = isAdmin ? '#0F1923' : '#1DB954';

  const handleChange = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const { firstName, lastName, email, password } = form;
    if (!firstName || !lastName || !email || !password) {
      setError('Please fill in all required fields.'); return;
    }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    const result = await register({ ...form, role });
    if (result.success) {
      navigate(isAdmin ? '/admin' : '/tenant', { replace: true });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="bg-white px-6 pt-12 pb-6">
        <div className="flex justify-center mb-5">
          <span
            className="text-xs font-bold px-4 py-1.5 rounded-full text-white tracking-widest"
            style={{ background: accent }}
          >
            NEW {role?.toUpperCase()}
          </span>
        </div>
        <h1 className="text-2xl font-black text-gray-900 text-center">Create Account</h1>
        <p className="text-sm text-gray-500 text-center mt-1">Join Upahan to manage your property easily.</p>
      </div>

      <div className="flex-1 px-6 py-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">First Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={form.firstName} onChange={handleChange('firstName')}
                  placeholder="Maria" className="input-field pl-9 text-sm" />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Last Name</label>
              <input type="text" value={form.lastName} onChange={handleChange('lastName')}
                placeholder="Santos" className="input-field text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Phone Number</label>
            <div className="relative">
              <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="tel" value={form.phoneNumber} onChange={handleChange('phoneNumber')}
                placeholder="+63 917 123 4567" className="input-field pl-10" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Email Address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" value={form.email} onChange={handleChange('email')}
                placeholder="you@example.com" className="input-field pl-10" autoComplete="email" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange('password')}
                placeholder="Minimum 6 characters" className="input-field pl-10 pr-10" autoComplete="new-password" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full font-bold text-sm py-4 rounded-2xl text-white mt-2 transition-all duration-200 active:scale-95 disabled:opacity-60"
            style={{ background: accent }}
          >
            {loading ? 'CREATING ACCOUNT...' : 'COMPLETE REGISTRATION'}
          </button>
        </form>

        <div className="mt-5 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <button onClick={() => navigate(`/login/${role}`)} className="font-bold" style={{ color: accent }}>
              LOG IN
            </button>
          </p>
        </div>
      </div>

      <div className="pb-10 text-center">
        <button onClick={() => navigate('/select-role')} className="text-sm text-gray-400 font-medium hover:text-gray-600">
          ← Back to Role Select
        </button>
      </div>
    </div>
  );
}
