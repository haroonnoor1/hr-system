import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import Navbar from '../components/Navbar';
import UserModal from '../components/UserModal';
import ConfirmDialog from '../components/ConfirmDialog';

// ── Helpers ────────────────────────────────────────────────────────────────────
const ROLE_BADGE = {
  admin:    'bg-purple-100 text-purple-700',
  manager:  'bg-blue-100   text-blue-700',
  employee: 'bg-emerald-100 text-emerald-700',
};

function Initials({ name }) {
  const letters = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div className="w-9 h-9 rounded-full bg-brand-800 text-white text-xs font-bold
                    flex items-center justify-center flex-shrink-0 select-none">
      {letters}
    </div>
  );
}

function Notification({ note, onDismiss }) {
  if (!note) return null;
  const colors = {
    success: 'bg-emerald-50 border-emerald-300 text-emerald-800',
    error:   'bg-red-50     border-red-300     text-red-800',
  };
  return (
    <div className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg
                     border text-sm font-medium mb-6 ${colors[note.type]}`}>
      <span>{note.message}</span>
      <button onClick={onDismiss} className="opacity-60 hover:opacity-100">✕</button>
    </div>
  );
}

const PER_PAGE = 8;

export default function UserManagement() {
  const { user: me } = useAuth();
  const isAdmin = me?.role === 'admin';

  const [users,        setUsers]        = useState([]);
  const [stats,        setStats]        = useState({});
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [roleFilter,   setRoleFilter]   = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page,         setPage]         = useState(1);
  const [note,         setNote]         = useState(null);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editingUser,  setEditingUser]  = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toggleTarget, setToggleTarget] = useState(null);

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [usersRes, statsRes] = await Promise.all([
        userService.list(),
        isAdmin ? userService.stats() : Promise.resolve({ data: {} }),
      ]);
      setUsers(usersRes.data.users);
      if (isAdmin) setStats(statsRes.data);
    } catch {
      setNote({ type: 'error', message: 'Failed to load users.' });
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Filter + paginate ────────────────────────────────────────────────────────
  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (
      (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
      (roleFilter   === 'all' || u.role === roleFilter) &&
      (statusFilter === 'all' ||
        (statusFilter === 'active' ? u.is_active : !u.is_active))
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const managers   = users.filter(u => u.role === 'manager' || u.role === 'admin');

  const notify = (type, message) => {
    setNote({ type, message });
    setTimeout(() => setNote(null), 4000);
  };

  // ── CRUD handlers ────────────────────────────────────────────────────────────
  const handleSave = async payload => {
    if (editingUser) {
      const { data } = await userService.update(editingUser.id, payload);
      setUsers(us => us.map(u => u.id === editingUser.id ? data.user : u));
      notify('success', 'User updated successfully.');
    } else {
      const { data } = await userService.create(payload);
      setUsers(us => [data.user, ...us]);
      if (isAdmin) {
        const { data: s } = await userService.stats();
        setStats(s);
      }
      notify('success', 'User created successfully.');
    }
  };

  const handleDelete = async () => {
    try {
      await userService.remove(deleteTarget.id);
      setUsers(us => us.filter(u => u.id !== deleteTarget.id));
      if (isAdmin) {
        const { data: s } = await userService.stats();
        setStats(s);
      }
      notify('success', `${deleteTarget.name} deleted.`);
    } catch (err) {
      notify('error', err.response?.data?.error || 'Delete failed.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleToggle = async () => {
    try {
      const { data } = await userService.toggleStatus(toggleTarget.id);
      setUsers(us => us.map(u => u.id === toggleTarget.id ? data.user : u));
      notify('success', data.message);
    } catch (err) {
      notify('error', err.response?.data?.error || 'Toggle failed.');
    } finally {
      setToggleTarget(null);
    }
  };

  const openCreate = () => { setEditingUser(null); setModalOpen(true); };
  const openEdit   = u  => { setEditingUser(u);    setModalOpen(true); };

  // ── UI ────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {isAdmin ? 'Create, edit, and manage all system users' : 'View your team members'}
            </p>
          </div>
          {isAdmin && (
            <button onClick={openCreate} className="btn-primary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
              </svg>
              Add User
            </button>
          )}
        </div>

        <Notification note={note} onDismiss={() => setNote(null)} />

        {/* Stats cards (admin only) */}
        {isAdmin && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Total Users',   value: stats.total,     color: 'text-slate-800' },
              { label: 'Active',        value: stats.active,    color: 'text-emerald-600' },
              { label: 'Inactive',      value: stats.inactive,  color: 'text-red-500' },
              { label: 'Managers',      value: stats.managers,  color: 'text-blue-600' },
              { label: 'Employees',     value: stats.employees, color: 'text-purple-600' },
            ].map(s => (
              <div key={s.label} className="card text-center py-4">
                <p className={`text-2xl font-bold ${s.color}`}>
                  {s.value ?? '—'}
                </p>
                <p className="text-slate-500 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
            </svg>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name or email…"
              className="input-field pl-10"/>
          </div>
          <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
            className="input-field w-full sm:w-36">
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="input-field w-full sm:w-36">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-brand-700 border-t-transparent rounded-full animate-spin"/>
            </div>
          ) : paginated.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-400 text-sm">No users found matching your filters.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {['User', 'Role', 'Status', 'Manager', 'Joined', ...(isAdmin ? ['Actions'] : [])].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-bold text-slate-500
                                           uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map(u => {
                  const mgr = users.find(x => x.id === u.manager_id);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">

                      {/* User cell */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Initials name={u.name} />
                          <div>
                            <p className="font-semibold text-slate-900 leading-none">{u.name}</p>
                            <p className="text-slate-500 text-xs mt-1">{u.email}</p>
                          </div>
                          {u.id === me?.id && (
                            <span className="badge bg-brand-50 text-brand-700 text-xs">You</span>
                          )}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4">
                        <span className={`badge capitalize ${ROLE_BADGE[u.role]}`}>{u.role}</span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold
                          ${u.is_active ? 'text-emerald-700' : 'text-slate-400'}`}>
                          <span className={`w-2 h-2 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}/>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Manager */}
                      <td className="px-5 py-4 text-slate-500 text-xs">
                        {mgr ? mgr.name : '—'}
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-4 text-slate-500 text-xs">
                        {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>

                      {/* Actions */}
                      {isAdmin && (
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">

                            {/* Edit */}
                            <button onClick={() => openEdit(u)} title="Edit"
                              className="w-8 h-8 rounded-lg flex items-center justify-center
                                         text-slate-400 hover:text-brand-700 hover:bg-brand-50 transition-colors">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5
                                     m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                              </svg>
                            </button>

                            {/* Toggle status */}
                            {u.id !== me?.id && (
                              <button onClick={() => setToggleTarget(u)} title="Toggle status"
                                className={`w-8 h-8 rounded-lg flex items-center justify-center
                                  transition-colors ${u.is_active
                                    ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                    : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  {u.is_active
                                    ? <path strokeLinecap="round" strokeLinejoin="round"
                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7
                                           a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878
                                           l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59
                                           3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025
                                           10.025 0 01-4.132 5.411m0 0L21 21"/>
                                    : <><path strokeLinecap="round" strokeLinejoin="round"
                                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943
                                             9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></>
                                  }
                                </svg>
                              </button>
                            )}

                            {/* Delete */}
                            {u.id !== me?.id && (
                              <button onClick={() => setDeleteTarget(u)} title="Delete"
                                className="w-8 h-8 rounded-lg flex items-center justify-center
                                           text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0
                                       01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1
                                       1 0 00-1 1v3M4 7h16"/>
                                </svg>
                              </button>
                            )}

                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-slate-500 text-sm">
              Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 disabled:opacity-40
                           hover:bg-slate-100 transition-colors">
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)}
                  className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors
                    ${n === page ? 'bg-brand-800 text-white' : 'border border-slate-300 hover:bg-slate-100'}`}>
                  {n}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 disabled:opacity-40
                           hover:bg-slate-100 transition-colors">
                Next →
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Modals */}
      <UserModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        editingUser={editingUser}
        managers={managers}
      />
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to permanently delete ${deleteTarget?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        type="danger"
      />
      <ConfirmDialog
        isOpen={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        onConfirm={handleToggle}
        title={toggleTarget?.is_active ? 'Deactivate User' : 'Activate User'}
        message={toggleTarget?.is_active
          ? `${toggleTarget?.name} will lose access to the system immediately.`
          : `${toggleTarget?.name} will regain access to the system.`}
        confirmLabel={toggleTarget?.is_active ? 'Deactivate' : 'Activate'}
        type={toggleTarget?.is_active ? 'danger' : 'warning'}
      />
    </div>
  );
}
