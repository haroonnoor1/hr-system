import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import Navbar from '../components/Navbar';

const ROLE_BADGE = {
  admin:    'bg-purple-100 text-purple-700',
  manager:  'bg-blue-100 text-blue-700',
  employee: 'bg-emerald-100 text-emerald-700',
};

function Section({ title, description, children }) {
  return (
    <div className="card mb-6">
      <div className="mb-5 pb-4 border-b border-slate-100">
        <h2 className="font-bold text-slate-800">{title}</h2>
        <p className="text-slate-500 text-sm mt-0.5">{description}</p>
      </div>
      {children}
    </div>
  );
}

export default function Profile() {
  const { user: me, login } = useAuth();

  const [info,    setInfo]    = useState({ name: '', email: '' });
  const [pwForm,  setPwForm]  = useState({ current: '', newPw: '', confirm: '' });
  const [loading, setLoading] = useState({ info: false, pw: false });
  const [note,    setNote]    = useState({ info: null, pw: null });

  useEffect(() => {
    if (me) setInfo({ name: me.name, email: me.email });
  }, [me]);

  const notify = (section, type, message) => {
    setNote(n => ({ ...n, [section]: { type, message } }));
    setTimeout(() => setNote(n => ({ ...n, [section]: null })), 4000);
  };

  // ── Update personal info ───────────────────────────────────────────────────
  const handleInfoSubmit = async e => {
    e.preventDefault();
    setLoading(l => ({ ...l, info: true }));
    try {
      await userService.update(me.id, { name: info.name.trim(), email: info.email.trim() });
      notify('info', 'success', 'Profile updated successfully.');
    } catch (err) {
      notify('info', 'error', err.response?.data?.error || 'Update failed.');
    } finally {
      setLoading(l => ({ ...l, info: false }));
    }
  };

  // ── Change password ────────────────────────────────────────────────────────
  const handlePwSubmit = async e => {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) {
      notify('pw', 'error', 'New passwords do not match.'); return;
    }
    if (pwForm.newPw.length < 8) {
      notify('pw', 'error', 'Password must be at least 8 characters.'); return;
    }
    if (!pwForm.current.trim()) {
      notify('pw', 'error', 'Current password is required.'); return;
    }
    setLoading(l => ({ ...l, pw: true }));
    try {
      await userService.update(me.id, {
        current_password: pwForm.current.trim(),
        password:         pwForm.newPw.trim(),
      });
      setPwForm({ current: '', newPw: '', confirm: '' });
      notify('pw', 'success', 'Password changed successfully.');
    } catch (err) {
      notify('pw', 'error', err.response?.data?.error || 'Password change failed.');
    } finally {
      setLoading(l => ({ ...l, pw: false }));
    }
  };

  const NoteBar = ({ n }) => {
    if (!n) return null;
    const cls = n.type === 'success'
      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
      : 'bg-red-50 border-red-300 text-red-800';
    return (
      <div className={`mb-4 px-4 py-3 rounded-lg border text-sm font-medium ${cls}`}>
        {n.message}
      </div>
    );
  };

  if (!me) return null;

  const initials = me.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const joined   = new Date(me.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

        {/* Profile header */}
        <div className="card mb-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-brand-800 text-white text-xl font-bold
                          flex items-center justify-center flex-shrink-0 select-none">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-900 truncate">{me.name}</h1>
            <p className="text-slate-500 text-sm truncate">{me.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`badge capitalize ${ROLE_BADGE[me.role]}`}>{me.role}</span>
              <span className="text-slate-300 text-xs">•</span>
              <span className="text-slate-400 text-xs">Joined {joined}</span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/>
            Active
          </div>
        </div>

        {/* Personal Info */}
        <Section title="Personal Information" description="Update your name and email address">
          <NoteBar n={note.info} />
          <form onSubmit={handleInfoSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input value={info.name} onChange={e => setInfo(f => ({ ...f, name: e.target.value }))}
                required className="input-field" placeholder="Your full name"/>
            </div>
            <div>
              <label className="label">Email Address</label>
              <input type="email" value={info.email}
                onChange={e => setInfo(f => ({ ...f, email: e.target.value }))}
                required className="input-field" placeholder="your@email.com"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Role</label>
                <input value={me.role} readOnly
                  className="input-field bg-slate-50 text-slate-500 cursor-not-allowed capitalize"/>
              </div>
              <div>
                <label className="label">Member Since</label>
                <input value={joined} readOnly
                  className="input-field bg-slate-50 text-slate-500 cursor-not-allowed"/>
              </div>
            </div>
            <button type="submit" disabled={loading.info} className="btn-primary">
              {loading.info ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </Section>

        {/* Change Password */}
        <Section title="Change Password" description="Choose a strong password you haven't used before">
          <NoteBar n={note.pw} />
          <form onSubmit={handlePwSubmit} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <input type="password" required value={pwForm.current}
                onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
                placeholder="Your current password" className="input-field"/>
            </div>
            <div>
              <label className="label">New Password</label>
              <input type="password" required value={pwForm.newPw}
                onChange={e => setPwForm(f => ({ ...f, newPw: e.target.value }))}
                placeholder="Min. 8 characters" className="input-field"/>
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input type="password" required value={pwForm.confirm}
                onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                placeholder="Re-enter new password"
                className={`input-field ${pwForm.confirm && pwForm.confirm !== pwForm.newPw
                  ? 'border-red-400 focus:ring-red-400' : ''}`}/>
              {pwForm.confirm && pwForm.confirm !== pwForm.newPw && (
                <p className="text-red-500 text-xs mt-1">Passwords don't match</p>
              )}
            </div>
            <button type="submit" disabled={loading.pw} className="btn-primary">
              {loading.pw ? 'Updating…' : 'Change Password'}
            </button>
          </form>
        </Section>

      </main>
    </div>
  );
}
