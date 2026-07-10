import { useEffect, useState } from 'react';

const EMPTY = { name: '', email: '', password: '', role: 'employee', manager_id: '', is_active: true };

export default function UserModal({ isOpen, onClose, onSave, editingUser, managers }) {
  const [form,    setForm]    = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const isEdit = !!editingUser;

  useEffect(() => {
    if (isOpen) {
      setError('');
      setForm(isEdit ? {
        name:       editingUser.name       || '',
        email:      editingUser.email      || '',
        password:   '',
        role:       editingUser.role       || 'employee',
        manager_id: editingUser.manager_id || '',
        is_active:  editingUser.is_active  ?? true,
      } : EMPTY);
    }
  }, [isOpen, editingUser]);

  if (!isOpen) return null;

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        name:  form.name.trim(),
        email: form.email.trim(),
        role:  form.role,
        manager_id: form.manager_id || null,
      };
      if (form.password.trim()) payload.password = form.password.trim();
      if (!isEdit) {
        if (!form.password.trim()) { setError('Password is required.'); setLoading(false); return; }
        payload.password = form.password.trim();
      }
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEdit ? 'Edit User' : 'Add New User'}
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">
              {isEdit ? 'Update user information' : 'Create a new account'}
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center
                       text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="label">Full Name</label>
            <input name="name" required value={form.name} onChange={handle}
              placeholder="John Smith" className="input-field"/>
          </div>

          {/* Email */}
          <div>
            <label className="label">Email Address</label>
            <input name="email" type="email" required value={form.email} onChange={handle}
              placeholder="john@company.com" className="input-field"/>
          </div>

          {/* Password */}
          <div>
            <label className="label">
              Password {isEdit && <span className="text-slate-400 font-normal normal-case">(leave blank to keep current)</span>}
            </label>
            <input name="password" type="password" value={form.password} onChange={handle}
              placeholder={isEdit ? 'Leave blank to keep current' : 'Min. 8 characters'}
              className="input-field"/>
          </div>

          {/* Role + Manager — two columns */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Role</label>
              <select name="role" value={form.role} onChange={handle} className="input-field">
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="label">Manager</label>
              <select name="manager_id" value={form.manager_id} onChange={handle} className="input-field">
                <option value="">— None —</option>
                {managers.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm
                         font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Saving…
                </>
              ) : isEdit ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
