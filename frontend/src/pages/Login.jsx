import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Org-chart network illustration for the brand panel
function OrgIllustration() {
  return (
    <svg viewBox="0 0 400 340" className="w-full max-w-xs opacity-20" fill="none">
      {/* Nodes */}
      <rect x="160" y="20"  width="80" height="44" rx="8" fill="white"/>
      <rect x="60"  y="120" width="80" height="44" rx="8" fill="white"/>
      <rect x="160" y="120" width="80" height="44" rx="8" fill="white"/>
      <rect x="260" y="120" width="80" height="44" rx="8" fill="white"/>
      <rect x="10"  y="220" width="70" height="40" rx="8" fill="white"/>
      <rect x="90"  y="220" width="70" height="40" rx="8" fill="white"/>
      <rect x="160" y="220" width="70" height="40" rx="8" fill="white"/>
      <rect x="240" y="220" width="70" height="40" rx="8" fill="white"/>
      <rect x="320" y="220" width="70" height="40" rx="8" fill="white"/>
      {/* Lines top tier */}
      <line x1="200" y1="64"  x2="200" y2="90"  stroke="white" strokeWidth="2"/>
      <line x1="100" y1="90"  x2="300" y2="90"  stroke="white" strokeWidth="2"/>
      <line x1="100" y1="90"  x2="100" y2="120" stroke="white" strokeWidth="2"/>
      <line x1="200" y1="90"  x2="200" y2="120" stroke="white" strokeWidth="2"/>
      <line x1="300" y1="90"  x2="300" y2="120" stroke="white" strokeWidth="2"/>
      {/* Lines mid tier */}
      <line x1="100" y1="164" x2="100" y2="190" stroke="white" strokeWidth="2"/>
      <line x1="45"  y1="190" x2="125" y2="190" stroke="white" strokeWidth="2"/>
      <line x1="45"  y1="190" x2="45"  y2="220" stroke="white" strokeWidth="2"/>
      <line x1="125" y1="190" x2="125" y2="220" stroke="white" strokeWidth="2"/>
      <line x1="200" y1="164" x2="200" y2="220" stroke="white" strokeWidth="2"/>
      <line x1="300" y1="164" x2="300" y2="190" stroke="white" strokeWidth="2"/>
      <line x1="275" y1="190" x2="355" y2="190" stroke="white" strokeWidth="2"/>
      <line x1="275" y1="190" x2="275" y2="220" stroke="white" strokeWidth="2"/>
      <line x1="355" y1="190" x2="355" y2="220" stroke="white" strokeWidth="2"/>
    </svg>
  );
}

function EyeIcon({ open }) {
  return open ? (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7
           -1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
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
  );
}

export default function Login() {
  const [form,      setForm]      = useState({ email: '', password: '' });
  const [showPw,    setShowPw]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const location    = useLocation();
  const from        = location.state?.from?.pathname || '/dashboard';

  const handleChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left brand panel ─────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-2/5
                      bg-brand-800 flex-col justify-between p-12 relative overflow-hidden">

        {/* Background gradient accent */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full
                          bg-brand-700 opacity-50 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full
                          bg-blue-600 opacity-30 blur-3xl" />
        </div>

        <div className="relative z-10">
          {/* Logo mark */}
          <div className="flex items-center gap-3 mb-16">
            <svg width="36" height="36" viewBox="0 0 28 28" fill="none">
              <rect x="10" y="1"  width="8" height="6" rx="2" fill="#93c5fd"/>
              <rect x="1"  y="20" width="8" height="6" rx="2" fill="#93c5fd"/>
              <rect x="10" y="20" width="8" height="6" rx="2" fill="#93c5fd"/>
              <rect x="19" y="20" width="8" height="6" rx="2" fill="#93c5fd"/>
              <line x1="14" y1="7"  x2="14" y2="15" stroke="#60a5fa" strokeWidth="1.5"/>
              <line x1="5"  y1="15" x2="23" y2="15" stroke="#60a5fa" strokeWidth="1.5"/>
              <line x1="5"  y1="15" x2="5"  y2="20" stroke="#60a5fa" strokeWidth="1.5"/>
              <line x1="14" y1="15" x2="14" y2="20" stroke="#60a5fa" strokeWidth="1.5"/>
              <line x1="23" y1="15" x2="23" y2="20" stroke="#60a5fa" strokeWidth="1.5"/>
            </svg>
            <span className="text-white font-bold text-2xl tracking-tight">
              HR<span className="text-blue-300">MS</span>
            </span>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            People first.<br/>
            <span className="text-blue-300">Always.</span>
          </h1>
          <p className="text-blue-200 text-base leading-relaxed max-w-xs">
            One platform to manage your workforce — tasks, leaves,
            and team performance, all in one place.
          </p>
        </div>

        {/* Org chart illustration */}
        <div className="relative z-10 flex justify-center my-8">
          <OrgIllustration />
        </div>

        {/* Feature pills */}
        <div className="relative z-10 flex flex-col gap-3">
          {[
            { icon: '🔐', label: 'Role-based access control' },
            { icon: '📋', label: 'Task assignment & tracking' },
            { icon: '🏖️', label: 'Leave management & approvals' },
          ].map(f => (
            <div key={f.label}
                 className="flex items-center gap-3 bg-brand-700/50 rounded-xl px-4 py-3">
              <span className="text-xl">{f.icon}</span>
              <span className="text-blue-100 text-sm font-medium">{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center
                      px-6 sm:px-12 py-12 bg-slate-50">

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
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

        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h2>
          <p className="text-slate-500 text-sm mb-8">Sign in to your workspace</p>

          {/* Error banner */}
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
            {/* Email */}
            <div>
              <label htmlFor="email" className="label">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@company.com"
                className="input-field"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="label mb-0">Password</label>
                <Link to="/forgot-password"
                      className="text-xs text-brand-700 hover:text-brand-600 font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400
                             hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  <EyeIcon open={showPw} />
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                            stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Signing in…
                </>
              ) : 'Sign in'}
            </button>
          </form>

          {/* Dev hint */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs font-semibold text-blue-700 mb-1">Default admin credentials</p>
            <p className="text-xs text-blue-600 font-mono">admin@hrms.com / Admin@1234</p>
          </div>
        </div>
      </div>

    </div>
  );
}
