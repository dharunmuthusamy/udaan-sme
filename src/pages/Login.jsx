import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const digits = form.phone.replace(/\D/g, '');
    if (digits.length !== 10) return setError('Please enter a valid 10-digit phone number.');
    if (!form.password) return setError('Password is required.');

    setLoading(true);
    try {
      await login(digits, form.password);
      navigate('/dashboard');
    } catch (err) {
      console.error('[Login]', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid phone number or password.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 px-4 pt-16">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-surface-200 bg-white p-8 shadow-sm">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 text-white font-bold shadow-md">
              U
            </span>
            <span className="text-xl font-bold text-surface-900 tracking-tight">
              UDAAN<span className="text-primary-600">-SME</span>
            </span>
          </div>

          <h1 className="text-xl font-bold text-surface-900 text-center">Welcome back</h1>
          <p className="mt-1 text-sm text-surface-700/60 text-center">
            Sign in to your account to continue
          </p>

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-surface-700 mb-1.5">
                Phone Number
              </label>
              <div className="flex">
                <span className="inline-flex items-center rounded-l-lg border border-r-0 border-surface-200 bg-surface-100 px-3 text-sm text-surface-500 font-medium select-none">
                  +91
                </span>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="w-full rounded-r-lg border border-surface-200 bg-surface-50 px-3.5 py-2.5 text-sm text-surface-900 placeholder-surface-700/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-400 transition"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-surface-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full rounded-lg border border-surface-200 bg-surface-50 px-3.5 py-2.5 text-sm text-surface-900 placeholder-surface-700/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-400 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-primary-600 to-accent-500 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-surface-700/60">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-700">
              Create one
            </Link>
          </p>
        </div>

        <Link
          to="/"
          className="mt-6 flex items-center justify-center text-sm font-medium text-surface-700/50 hover:text-primary-600 transition-colors"
        >
          <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
