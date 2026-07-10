import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import Navbar from '../components/Navbar';

function StatCard({ icon, label, value, accent, loading }) {
  const colors = {
    blue:    'bg-blue-50   text-blue-600',
    purple:  'bg-purple-50 text-purple-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber:   'bg-amber-50   text-amber-600',
    rose:    'bg-rose-50    text-rose-600',
  };
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center
                       text-2xl flex-shrink-0 ${colors[accent]}`}>
        {icon}
      </div>
      <div>
        {loading
          ? <div className="h-7 w-12 bg-slate-200 rounded animate-pulse mb-1"/>
          : <p className="text-2xl font-bold text-slate-900 leading-none">{value ?? '—'}</p>
        }
        <p className="text-slate-500 text-sm mt-1">{label}</p>
      </div>
    </div>
  );
}

function QuickAction({ icon, label, description, to }) {
  return (
    <Link to={to} className="card text-left hover:border-brand-600 hover:shadow-md
                              transition-all duration-150 group block">
      <div className="text-2xl mb-3">{icon}</div>
      <p className="font-semibold text-slate-800 group-hover:text-brand-700 text-sm">{label}</p>
      <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{description}</p>
    </Link>
  );
}

// ── Role panels ────────────────────────────────────────────────────────────────

function AdminPanel({ stats, statsLoading }) {
  return (
    <>
      <section>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">System Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="" label="Total Users"     value={stats?.total}     accent="blue"    loading={statsLoading}/>
          <StatCard icon="" label="Active Users"    value={stats?.active}    accent="emerald" loading={statsLoading}/>
          <StatCard icon="" label="Managers"        value={stats?.managers}  accent="purple"  loading={statsLoading}/>
          <StatCard icon="" label="Employees"     value={stats?.employees} accent="amber"   loading={statsLoading}/>
        </div>
      </section>
      <section>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <QuickAction icon="" label="Manage Users"      to="/users"   description="View, create, edit and delete user accounts"/>
          <QuickAction icon="" label="My Profile"        to="/profile" description="Update your personal info and password"/>
          <QuickAction icon="" label="Assign Roles"      to="/users"   description="Change roles and manager assignments"/>
        </div>
      </section>
    </>
  );
}

function ManagerPanel({ stats, statsLoading }) {
  return (
    <>
      <section>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Team Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard icon="" label="Team Members"    value={stats?.total}    accent="blue"    loading={statsLoading}/>
          <StatCard icon="✅" label="Active Members"  value={stats?.active}   accent="emerald" loading={statsLoading}/>
          <StatCard icon="🔴" label="Inactive"        value={stats?.inactive} accent="rose"    loading={statsLoading}/>
        </div>
      </section>
      <section>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <QuickAction icon="👥" label="View Team"  to="/users"   description="See all your team members"/>
          <QuickAction icon="👤" label="My Profile" to="/profile" description="Update your personal info"/>
        </div>
      </section>
    </>
  );
}

function EmployeePanel({ user }) {
  return (
    <>
      <section>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">My Status</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard icon="" label="Assigned Tasks"       value="—" accent="blue"/>
          <StatCard icon="" label="Leave Balance (days)" value="—" accent="emerald"/>
          <StatCard icon="" label="Pending Requests"     value="—" accent="amber"/>
        </div>
      </section>
      <section>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <QuickAction icon="" label="My Profile"    to="/profile" description="Update your name, email, and password"/>
          <QuickAction icon="" label="Apply Leave"  to="/profile" description="Leave management coming in Module 4"/>
        </div>
      </section>
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">👤</span>
          <h3 className="font-semibold text-slate-800">My Profile</h3>
          <span className="badge bg-emerald-100 text-emerald-700 ml-auto">Employee</span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-slate-400 text-xs font-medium">Name</p>
               <p className="text-slate-800 font-semibold mt-0.5">{user.name}</p></div>
          <div><p className="text-slate-400 text-xs font-medium">Email</p>
               <p className="text-slate-800 font-semibold mt-0.5 truncate">{user.email}</p></div>
          <div><p className="text-slate-400 text-xs font-medium">Role</p>
               <p className="text-slate-800 font-semibold mt-0.5 capitalize">{user.role}</p></div>
          <div><p className="text-slate-400 text-xs font-medium">Status</p>
               <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold mt-0.5">
                 <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/>Active</span></div>
        </div>
      </div>
    </>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
const GREET = { admin: 'System Admin Console', manager: 'Manager Dashboard', employee: 'My Workspace' };

export default function Dashboard() {
  const { user } = useAuth();
  const [stats,        setStats]        = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'manager') {
      setStatsLoading(true);
      userService.stats()
        .then(r => setStats(r.data))
        .catch(() => {})
        .finally(() => setStatsLoading(false));
    }
  }, [user]);

  const Panel = user?.role === 'admin' ? AdminPanel
              : user?.role === 'manager' ? ManagerPanel
              : EmployeePanel;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <div className="mb-10 flex items-start justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium">{GREET[user?.role]}</p>
            <h1 className="text-3xl font-bold text-slate-900 mt-0.5">
            السلام علیکم, {user?.name?.split(' ')[0]} 
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white border border-slate-200
                          rounded-xl px-4 py-2.5 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
            <span className="text-slate-600 text-sm font-medium">System online</span>
          </div>
        </div>

        <div className="space-y-8">
          <Panel user={user} stats={stats} statsLoading={statsLoading}/>
        </div>

        <div className="mt-10 p-5 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-4">
          
          <div>
            <p className="text-slate-800 font-semibold">All systems operational</p>
            <p className="text-slate-600 text-sm mt-0.5">No incidents reported in the last 24 hours</p>
          </div>
        </div>
      </main>
    </div>
  );
}
