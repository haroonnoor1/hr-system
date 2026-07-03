import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, accent }) {
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
                       text-2xl flex-shrink-0 ${colors[accent] || colors.blue}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 leading-none">{value}</p>
        <p className="text-slate-500 text-sm mt-1">{label}</p>
      </div>
    </div>
  );
}

// ── Quick action button ────────────────────────────────────────────────────────
function QuickAction({ icon, label, description }) {
  return (
    <button className="card text-left hover:border-brand-600 hover:shadow-md
                       transition-all duration-150 group w-full">
      <div className="text-2xl mb-3">{icon}</div>
      <p className="font-semibold text-slate-800 group-hover:text-brand-700 text-sm">{label}</p>
      <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{description}</p>
    </button>
  );
}

// ── Role-specific panels ───────────────────────────────────────────────────────

function AdminPanel({ user }) {
  return (
    <>
      <section>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
          System Overview
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="👥" label="Total Users"        value="—" accent="blue"/>
          <StatCard icon="✅" label="Active Employees"   value="—" accent="emerald"/>
          <StatCard icon="📋" label="Open Tasks"         value="—" accent="purple"/>
          <StatCard icon="🏖️" label="Pending Leave Requests" value="—" accent="amber"/>
        </div>
      </section>

      <section>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickAction icon="➕" label="Add New User"
            description="Create employee, manager, or admin accounts"/>
          <QuickAction icon="🔑" label="Manage Roles"
            description="Assign and update user roles across the system"/>
          <QuickAction icon="📊" label="View Reports"
            description="Generate performance and attendance reports"/>
        </div>
      </section>

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🛡️</span>
          <h3 className="font-semibold text-slate-800">Admin Access</h3>
          <span className="badge bg-purple-100 text-purple-700 ml-auto">Full control</span>
        </div>
        <p className="text-slate-500 text-sm leading-relaxed">
          You have full system access. Upcoming modules will surface user management,
          task assignment, and leave approval workflows here.
        </p>
      </div>
    </>
  );
}

function ManagerPanel({ user }) {
  return (
    <>
      <section>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
          Team Overview
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard icon="👤" label="Team Members"       value="—" accent="blue"/>
          <StatCard icon="⏳" label="Pending Approvals"  value="—" accent="amber"/>
          <StatCard icon="📋" label="Active Team Tasks"  value="—" accent="emerald"/>
        </div>
      </section>

      <section>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <QuickAction icon="📝" label="Assign Task"
            description="Create and assign tasks to your team members"/>
          <QuickAction icon="✅" label="Review Leave Requests"
            description="Approve or reject pending leave applications"/>
        </div>
      </section>

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">👔</span>
          <h3 className="font-semibold text-slate-800">Manager Dashboard</h3>
          <span className="badge bg-blue-100 text-blue-700 ml-auto">Team access</span>
        </div>
        <p className="text-slate-500 text-sm leading-relaxed">
          Upcoming modules will show your team's task progress, leave calendar,
          and performance summaries here.
        </p>
      </div>
    </>
  );
}

function EmployeePanel({ user }) {
  return (
    <>
      <section>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
          My Status
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard icon="📋" label="Assigned Tasks"  value="—" accent="blue"/>
          <StatCard icon="🏖️" label="Leave Balance (days)" value="—" accent="emerald"/>
          <StatCard icon="⏳" label="Pending Requests"  value="—" accent="amber"/>
        </div>
      </section>

      <section>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <QuickAction icon="🗂️" label="View My Tasks"
            description="Check tasks assigned to you and update their status"/>
          <QuickAction icon="🏖️" label="Apply for Leave"
            description="Submit a new leave request for manager approval"/>
        </div>
      </section>

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">👤</span>
          <h3 className="font-semibold text-slate-800">My Profile</h3>
          <span className="badge bg-emerald-100 text-emerald-700 ml-auto">Employee</span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-slate-400 text-xs font-medium">Name</p>
            <p className="text-slate-800 font-semibold mt-0.5">{user.name}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Email</p>
            <p className="text-slate-800 font-semibold mt-0.5 truncate">{user.email}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Role</p>
            <p className="text-slate-800 font-semibold mt-0.5 capitalize">{user.role}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Status</p>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/>
              Active
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
const PANEL = { admin: AdminPanel, manager: ManagerPanel, employee: EmployeePanel };

export default function Dashboard() {
  const { user } = useAuth();
  const Panel    = PANEL[user?.role] || EmployeePanel;

  const greetings = {
    admin:    'System Admin Console',
    manager:  'Manager Dashboard',
    employee: 'My Workspace',
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Welcome header */}
        <div className="mb-10 flex items-start justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium">
              {greetings[user?.role] || 'Dashboard'}
            </p>
            <h1 className="text-3xl font-bold text-slate-900 mt-0.5">
              Good day, {user?.name?.split(' ')[0]} 👋
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white border border-slate-200
                          rounded-xl px-4 py-2.5 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
            <span className="text-slate-600 text-sm font-medium">System online</span>
          </div>
        </div>

        {/* Role-specific content */}
        <div className="space-y-8">
          <Panel user={user} />
        </div>

        {/* Module roadmap notice */}
        <div className="mt-10 p-5 bg-blue-50 border border-blue-200 rounded-xl
                        flex items-start gap-4">
          <span className="text-2xl flex-shrink-0">🚧</span>
          <div>
            <p className="font-semibold text-blue-800 text-sm">Module 1 Complete</p>
            <p className="text-blue-700 text-xs mt-0.5 leading-relaxed">
              Authentication with JWT, role-based routing, and session management are live.
              Next: <strong>User CRUD</strong>, <strong>Task Assignment</strong>,
              and <strong>Leave Management</strong> modules.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}
