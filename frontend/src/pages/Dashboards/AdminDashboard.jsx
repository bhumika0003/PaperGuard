import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { StatCard } from '../../components/ui/StatCard';
import { SecurityAlertBadge } from '../../components/ui/SecurityAlertBadge';
import { Users, UserPlus, ShieldAlert, Key, Lock, CheckCircle, XCircle, Activity, FileText, Settings, ShieldCheck, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { validateEmail } from '../../utils/emailValidator';
import { EmailInput } from '../../components/ui/EmailInput';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [stats, setStats] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // New User Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [newUserId, setNewUserId] = useState('');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState('Teacher');
  const [department, setDepartment] = useState('Computer Science');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Reset Password State
  const [resetTargetUser, setResetTargetUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [uRes, sRes, aRes] = await Promise.all([
        api.get('/users'),
        api.get('/users/stats'),
        api.get('/alerts')
      ]);
      setUsersList(uRes.data.users);
      setStats(sRes.data.stats);
      setAlerts(aRes.data.alerts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      alert(`Invalid Email Format: ${emailCheck.error}`);
      return;
    }

    try {
      await api.post('/users', { name, email, userId: newUserId, password, role, department });
      setShowCreateModal(false);
      setName('');
      setEmail('');
      setNewUserId('');
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Create user failed');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await api.patch(`/users/${userId}/status`);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetTargetUser || !newPassword) return;
    try {
      await api.post(`/users/${resetTargetUser.userId}/reset-password`, { newPassword });
      setResetTargetUser(null);
      setNewPassword('');
      alert('User password reset successfully.');
    } catch (err) {
      alert(err.response?.data?.message || 'Reset password failed');
    }
  };

  return (
    <div className="min-h-screen bg-cyber-dark text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 space-y-8 overflow-y-auto">
          
          {/* Header Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950/60 to-slate-900 border border-rose-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-rose-400 font-bold uppercase tracking-wider">System Operations & Security Management</span>
              <h1 className="text-2xl font-extrabold text-white mt-1">Admin Operations Center</h1>
              <p className="text-xs text-slate-400 mt-1">Provision user accounts, configure department access, track access statistics, and monitor security alerts.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
              <Link
                to="/admin/activities"
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-bold text-xs shadow-sm flex items-center space-x-2 transition"
              >
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Role Activities Monitor</span>
              </Link>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create New User Account</span>
              </button>
            </div>
          </div>

          {/* Institutional Activities Quick Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-purple-950/40 to-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center space-x-3.5">
              <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex-shrink-0">
                <Activity className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                  <span>Cross-Role Activity Oversight Center</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">NEW</span>
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Live audit trail and actions monitoring for <strong className="text-cyan-400">Teachers</strong>, <strong className="text-amber-400">HODs</strong>, <strong className="text-purple-400">Principals</strong>, and <strong className="text-emerald-400">Exam Controllers</strong>.
                </p>
              </div>
            </div>
            <Link
              to="/admin/activities"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs shadow-md shadow-cyan-500/20 flex items-center space-x-2 self-start sm:self-auto transition"
            >
              <span>Inspect All Role Activities</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* System Statistics Dashboard Grid (Section 9) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Users" value={stats.totalUsers || 0} icon={Users} color="cyan" />
            <StatCard title="Active Users" value={stats.activeUsers || 0} icon={CheckCircle} color="emerald" />
            <StatCard title="Total Papers" value={stats.totalPapers || 0} icon={FileText} color="amber" />
            <StatCard title="Access Attempts" value={stats.accessAttempts || 0} icon={Activity} color="purple" />
            <StatCard title="Download Requests" value={stats.downloadRequests || 0} icon={FileText} color="cyan" />
            <StatCard title="Approved Downloads" value={stats.approvedDownloads || 0} icon={CheckCircle} color="emerald" />
            <StatCard title="Suspicious Activities" value={stats.suspiciousActivities || 0} icon={ShieldAlert} color="rose" />
            <StatCard title="Audit Storage" value="Immutable" icon={Lock} trend="Deletion Disabled" color="purple" />
          </div>

          {/* User Management Section */}
          <div className="p-6 rounded-2xl bg-cyber-card border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">System User Accounts & Role Assignments</h3>
              <span className="text-xs text-slate-400 font-mono">Count: {usersList.length} Accounts</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">User ID</th>
                    <th className="py-3 px-4">Full Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {usersList.map((u) => (
                    <tr key={u.userId} className="hover:bg-slate-900/50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">{u.userId}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-200">{u.name}</td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{u.email}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-900 border border-slate-700 text-cyan-300">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">{u.department}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${u.status === 'Active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-rose-950 text-rose-400 border border-rose-500/40'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleToggleStatus(u.userId)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${u.status === 'Active' ? 'bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-500/30' : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30'}`}
                        >
                          {u.status === 'Active' ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => setResetTargetUser(u)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition inline-flex items-center gap-1"
                        >
                          <Key className="w-3.5 h-3.5 text-cyan-400" /> Reset Pwd
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-cyber-card border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-cyan-400" /> Create System User
            </h3>
            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none" />
              </div>
              <EmailInput
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                label="Institutional Email"
                placeholder="e.g. teacher@university.edu"
                required={true}
              />
              <div>
                <label className="block text-slate-300 font-semibold mb-1">User ID</label>
                <input type="text" value={newUserId} onChange={(e) => setNewUserId(e.target.value)} placeholder="e.g. TCH-109" required className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none" />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Default Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none" />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assign Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 font-semibold outline-none">
                  <option value="Teacher">Teacher</option>
                  <option value="HOD">HOD</option>
                  <option value="Principal">Principal</option>
                  <option value="Admin">Admin</option>
                  <option value="Exam Controller">Exam Controller</option>
                  <option value="Auditor">Auditor / Security Team</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Department</label>
                <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none" />
              </div>
              <div className="flex space-x-2 pt-3">
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold">Create User</button>
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-cyber-card border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-cyan-400" /> Reset Password for {resetTargetUser.userId}
            </h3>
            <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="Enter new password" className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none" />
              </div>
              <div className="flex space-x-2 pt-2">
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold">Update Password</button>
                <button type="button" onClick={() => setResetTargetUser(null)} className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
