import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { role } = useParams();
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = role === 'admin';
  const accent = isAdmin ? '#0F1923' : '#1DB954';
  const badgeBg = isAdmin ? '#0F1923' : '#1DB954';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    const result = await login(email.trim(), password, role);
    if (result.success) {
      navigate(isAdmin ? '/admin' : '/tenant', { replace: true });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="bg-white px-6 pt-12 pb-8">
        <div className="flex justify-center mb-6">
          <span
            className="text-xs font-bold px-4 py-1.5 rounded-full text-white tracking-widest"
            style={{ background: badgeBg }}
          >
            LOGIN AS {role?.toUpperCase()}
          </span>
        </div>
        <h1 className="text-2xl font-black text-gray-900 text-center">Welcome Back</h1>
        <p className="text-sm text-gray-500 text-center mt-1">Sign in to your account</p>
      </div>

      <div className="flex-1 px-6 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field pl-10"
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field pl-10 pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full font-bold text-sm py-4 rounded-2xl text-white mt-2 transition-all duration-200 active:scale-95 disabled:opacity-60"
            style={{ background: accent }}
          >
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            New to UPahan?{' '}
            <button
              onClick={() => navigate(`/register/${role}`)}
              className="font-bold"
              style={{ color: accent }}
            >
              SIGN UP
            </button>
          </p>
        </div>
      </div>

      <div className="pb-10 text-center">
        <button
          onClick={() => navigate('/select-role')}
          className="text-sm text-gray-400 font-medium hover:text-gray-600 transition-colors"
        >
          ← Back to Role Select
        </button>
      </div>
    </div>
  );
}
