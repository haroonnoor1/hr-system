import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/api';

export default function ForgotPassword() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center
                    px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="10" y="1"  width="8" height="6" rx="2" fill="#1e3a5f"/>
            <rect x="1"  y="20" width="8" height="6" rx="2" fill="#1e3a5f"/>
            <rect x="10" y="20" width="8" height="6" rx="2" fill="#1e3a5f"/>
            <rect x="19" y="20" width="8" height="6" rx="2" fill="#1e3a5f"/>
            <line x1="14" y1="7"  x2="14" y2="15" stroke="#2e65a8" strokeWidth="1.5"/>
            <line x1="5"  y1="15" x2="23" y2="15" stroke="#2e65a8" strokeWidth="1.5"/>
            <line x1="5"  y1="15" x2="5"  y2="20" stroke="#2e65a8" strokeWidth="1.5"/>
            <line x1="14" y1="15" x2="14" y2="20" stroke="#2e65a8" strokeWidth="1.5"/>
            <line x1="23" y1="15" x2="23" y2="20" stroke="#2e65a8" strokeWidth="1.5"/>
          </svg>
          <span className="text-brand-800 font-bold text-xl">HRMS</span>
        </div>

        <div className="card">
          {sent ? (
            /* ── Success state ── */
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center
                              justify-center mx-auto mb-4 text-3xl">
                📧
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Check your inbox</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                If <strong>{email}</strong> is registered, we've sent a password
                reset link. It expires in 30 minutes.
              </p>
              <p className="text-xs text-slate-400 mb-6">
                Didn't receive it? Check your spam folder, or wait a moment and try again.
              </p>
              <Link to="/login" className="btn-primary">
                Back to login
              </Link>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">Forgot your password?</h2>
                <p className="text-slate-500 text-sm mt-1">
                  Enter your work email and we'll send a reset link.
                </p>
              </div>

              {error && (
                <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200
                                text-red-700 rounded-lg px-4 py-3 text-sm">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1
                      1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"/>
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="label">Work email address</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="input-field"
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10"
                                stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Sending…
                    </>
                  ) : 'Send reset link'}
                </button>
              </form>

              <div className="mt-5 text-center">
                <Link to="/login"
                      className="text-sm text-brand-700 hover:text-brand-600 font-medium
                                 inline-flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                  </svg>
                  Back to login
                </Link>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
