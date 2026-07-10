import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/api';

function StrengthBar({ password }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const colors = ['bg-slate-200', 'bg-red-400', 'bg-amber-400', 'bg-blue-500', 'bg-emerald-500'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  if (!password) return null;
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1,2,3,4].map(i => (
          <div key={i}
               className={`h-1 flex-1 rounded-full transition-colors ${i <= score ? colors[score] : 'bg-slate-200'}`}/>
        ))}
      </div>
      <p className={`text-xs font-medium ${score >= 3 ? 'text-emerald-600' : 'text-slate-400'}`}>
        {labels[score]}
      </p>
    </div>
  );
}

export default function ResetPassword() {
  const [params]       = useSearchParams();
  const token          = params.get('token') || '';
  const navigate       = useNavigate();
  const [form,      setForm]      = useState({ password: '', confirm: '' });
  const [showPw,    setShowPw]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [error,     setError]     = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!token) {
      setError('No reset token found. Please request a new link.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, form.password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed. The link may have expired.');
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
          {success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center
                              justify-center mx-auto mb-4 text-3xl">
                ✅
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Password updated!</h2>
              <p className="text-slate-500 text-sm mb-1">
                Your password has been changed successfully.
              </p>
              <p className="text-slate-400 text-xs mb-6">Redirecting to login…</p>
              <Link to="/login" className="btn-primary">Go to login</Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">Create a new password</h2>
                <p className="text-slate-500 text-sm mt-1">
                  Choose something strong that you haven't used before.
                </p>
              </div>

              {!token && (
                <div className="mb-5 bg-amber-50 border border-amber-200 text-amber-700
                                rounded-lg px-4 py-3 text-sm">
                  ⚠️ No reset token found in the URL. Please request a new reset link.
                </div>
              )}

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
                {/* New password */}
                <div>
                  <label className="label">New password</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      required
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="Min. 8 characters"
                      className="input-field pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      className="absolute inset-y-0 right-3 flex items-center
                                 text-slate-400 hover:text-slate-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showPw ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943
                               9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7
                               a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878
                               l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59
                               m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025
                               10.025 0 01-4.132 5.411m0 0L21 21"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  <StrengthBar password={form.password} />
                </div>

                {/* Confirm password */}
                <div>
                  <label className="label">Confirm new password</label>
                  <input
                    type="password"
                    required
                    value={form.confirm}
                    onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                    placeholder="Re-enter your password"
                    className={`input-field ${
                      form.confirm && form.confirm !== form.password
                        ? 'border-red-400 focus:ring-red-400'
                        : ''
                    }`}
                  />
                  {form.confirm && form.confirm !== form.password && (
                    <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !token}
                  className="btn-primary w-full"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10"
                                stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Updating…
                    </>
                  ) : 'Update password'}
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
