import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users, Building2, Calendar, Clock, CheckCircle, XCircle, TrendingUp, UserCheck } from 'lucide-react';
import { fetchAdminDashboard, fetchEmployeeDashboard, selectDashboard } from '@/store/slices/dashboardSlice';
import { selectUser } from '@/store/slices/authSlice';
import StatCard from '@/components/common/StatCard';
import Avatar from '@/components/common/Avatar';
import { StatusBadge, LeaveBadge } from '@/components/common/Badge';
import { formatDate, capitalise } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Dashboard() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const { adminData, employeeData, loading } = useSelector(selectDashboard);
  const isAdminOrHr = ['admin', 'hr'].includes(user?.role);

  useEffect(() => {
    if (isAdminOrHr) dispatch(fetchAdminDashboard());
    else dispatch(fetchEmployeeDashboard());
  }, [dispatch, isAdminOrHr]);

  if (loading && !adminData && !employeeData) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="stat-card animate-pulse">
              <div className="w-12 h-12 bg-slate-800 rounded-xl" />
              <div className="space-y-2 flex-1">
                <div className="h-3 bg-slate-800 rounded w-2/3" />
                <div className="h-6 bg-slate-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isAdminOrHr) return <AdminDashboard data={adminData} />;
  return <EmployeeDashboard data={employeeData} user={user} />;
}

function AdminDashboard({ data }) {
  const stats = data?.stats || {};
  const leavesByType = (data?.leavesByType || []).map(l => ({ name: capitalise(l._id), count: l.count }));
  const empByDept = data?.employeesByDept || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Employees" value={stats.totalEmployees} sub="Active workforce"
          iconBg="bg-primary-500/20" iconColor="text-primary-400" />
        <StatCard icon={Building2} label="Departments" value={stats.totalDepartments} sub="Active teams"
          iconBg="bg-emerald-500/20" iconColor="text-emerald-400" />
        <StatCard icon={Clock} label="Pending Leaves" value={stats.pendingLeaves} sub="Awaiting review"
          iconBg="bg-amber-500/20" iconColor="text-amber-400" />
        <StatCard icon={UserCheck} label="On Leave Today" value={stats.activeLeaves} sub="Currently away"
          iconBg="bg-violet-500/20" iconColor="text-violet-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dept breakdown */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="text-base font-semibold text-white mb-4">Employees by Department</h3>
          {empByDept.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={empByDept} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', color: '#f1f5f9' }}
                  cursor={{ fill: 'rgba(99,102,241,0.08)' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-slate-600">No department data yet</div>
          )}
        </div>

        {/* Leave types */}
        <div className="card p-6">
          <h3 className="text-base font-semibold text-white mb-4">Leave Types (30d)</h3>
          {leavesByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={leavesByType} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} paddingAngle={3}>
                  {leavesByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', color: '#f1f5f9' }} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-slate-600">No leave data yet</div>
          )}
        </div>
      </div>

      {/* Recent employees */}
      <div className="card p-6">
        <h3 className="text-base font-semibold text-white mb-4">Recent Employees</h3>
        {(data?.recentEmployees || []).length === 0 ? (
          <p className="text-slate-600 text-sm py-4">No employees yet</p>
        ) : (
          <div className="space-y-3">
            {(data?.recentEmployees || []).map((emp) => (
              <div key={emp._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors">
                <Avatar name={emp.user?.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{emp.user?.name}</p>
                  <p className="text-xs text-slate-500">{emp.designation || 'No designation'} · {emp.department?.name || 'No dept'}</p>
                </div>
                <StatusBadge status={emp.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmployeeDashboard({ data, user }) {
  const stats = data?.leaveStats || {};
  const recent = data?.recentLeaves || [];
  const employee = data?.employee;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="card p-6 flex items-center gap-5">
        <Avatar name={user?.name} size="xl" />
        <div>
          <p className="text-slate-400 text-sm">Welcome back,</p>
          <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            {employee?.designation || 'Employee'} · {employee?.department?.name || 'No department'}
          </p>
        </div>
      </div>

      {/* Leave stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Clock} label="Pending" value={stats.pending || 0} iconBg="bg-amber-500/20" iconColor="text-amber-400" />
        <StatCard icon={CheckCircle} label="Approved" value={stats.approved || 0} iconBg="bg-emerald-500/20" iconColor="text-emerald-400" />
        <StatCard icon={XCircle} label="Rejected" value={stats.rejected || 0} iconBg="bg-red-500/20" iconColor="text-red-400" />
        <StatCard icon={Calendar} label="Total Applied" value={Object.values(stats).reduce((a, b) => a + b, 0)} iconBg="bg-primary-500/20" iconColor="text-primary-400" />
      </div>

      {/* Recent leaves */}
      <div className="card p-6">
        <h3 className="text-base font-semibold text-white mb-4">Recent Leave Requests</h3>
        {recent.length === 0 ? (
          <p className="text-slate-600 text-sm py-4">No leave requests yet</p>
        ) : (
          <div className="space-y-3">
            {recent.map((leave) => (
              <div key={leave._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <LeaveBadge type={leave.type} />
                    <span className="text-xs text-slate-500">{leave.totalDays} day{leave.totalDays !== 1 ? 's' : ''}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {formatDate(leave.startDate)} → {formatDate(leave.endDate)}
                  </p>
                </div>
                <StatusBadge status={leave.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
