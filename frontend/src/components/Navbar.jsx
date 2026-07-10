import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_COLORS = {
  admin:    'bg-purple-100 text-purple-700',
  manager:  'bg-blue-100   text-blue-700',
  employee: 'bg-emerald-100 text-emerald-700',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', roles: ['admin', 'manager', 'employee'] },
    { to: '/users',     label: 'Users',     roles: ['admin', 'manager'] },
    { to: '/profile',   label: 'My Profile',roles: ['admin', 'manager', 'employee'] },
  ].filter(l => l.roles.includes(user.role));

  const linkClass = ({ isActive }) =>
    `text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
      isActive
        ? 'bg-white/15 text-white'
        : 'text-blue-200 hover:text-white hover:bg-white/10'
    }`;

  return (
    <header className="sticky top-0 z-30 bg-brand-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-6">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 flex-shrink-0">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
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
            <span className="text-white font-bold text-lg tracking-tight">
              HR<span className="text-blue-300">MS</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {navLinks.map(l => (
              <NavLink key={l.to} to={l.to} className={linkClass}>{l.label}</NavLink>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button onClick={() => setMobileOpen(o => !o)}
            className="md:hidden ml-auto text-blue-200 hover:text-white p-1">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}/>
            </svg>
          </button>

          {/* User dropdown */}
          <div className="relative hidden md:block">
            <button onClick={() => setMenuOpen(o => !o)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg
                         hover:bg-brand-700 transition-colors">
              <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center
                              text-brand-900 font-bold text-xs select-none">
                {initials}
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-white text-sm font-semibold leading-none">{user.name}</p>
                <p className="text-blue-300 text-xs capitalize mt-0.5">{user.role}</p>
              </div>
              <svg className={`w-4 h-4 text-blue-300 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                   viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1
                     1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl
                              border border-slate-200 py-1 z-50">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs text-slate-500">Signed in as</p>
                  <p className="text-sm font-semibold text-slate-800 truncate">{user.email}</p>
                  <span className={`badge mt-1.5 ${ROLE_COLORS[user.role]}`}>{user.role}</span>
                </div>
                <Link to="/profile" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700
                             hover:bg-slate-50 transition-colors">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  My Profile
                </Link>
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm
                             text-red-600 hover:bg-red-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-brand-700 py-3 space-y-1">
            {navLinks.map(l => (
              <NavLink key={l.to} to={l.to} onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-white/15 text-white' : 'text-blue-200 hover:text-white hover:bg-white/10'
                  }`}>
                {l.label}
              </NavLink>
            ))}
            <button onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm font-medium text-red-300
                         hover:text-red-200 hover:bg-white/5 rounded-lg transition-colors">
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
