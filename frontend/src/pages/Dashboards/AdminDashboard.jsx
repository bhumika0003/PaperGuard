import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { StatCard } from '../../components/ui/StatCard';
import { SecurityAlertBadge } from '../../components/ui/SecurityAlertBadge';
import { SuspiciousActivityAlertModal } from '../../components/ui/SuspiciousActivityAlertModal';
import { formatTimeWithAMPM } from '../../utils/dateFormatter';
import {
  Users,
  UserPlus,
  ShieldAlert,
  Key,
  Lock,
  CheckCircle,
  XCircle,
  Activity,
  FileText,
  Settings,
  ShieldCheck,
  ArrowRight,
  AlertTriangle,
  Radio,
  ExternalLink
} from 'lucide-react';
import api from '../../services/api';
import { validateEmail } from '../../utils/emailValidator';
import { EmailInput } from '../../components/ui/EmailInput';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [stats, setStats] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Suspicious Activity Alert Modal State
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const previousAlertCountRef = useRef(0);

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

  // Audio threat chime
  const playThreatChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  };

  const fetchAdminData = async (isPolling = false) => {
    if (!isPolling) setLoading(true);
    try {
      const [uRes, sRes, aRes] = await Promise.all([
        api.get('/users'),
        api.get('/users/stats'),
        api.get('/alerts')
      ]);
      setUsersList(uRes.data.users);
      setStats(sRes.data.stats);
      const incomingAlerts = aRes.data.alerts || [];
      setAlerts(incomingAlerts);

      const activeIncoming = incomingAlerts.filter(a => a.status === 'Active');

      // Auto-popup alert on initial load if active threats exist, OR on polling if a new threat was added!
      if (activeIncoming.length > 0) {
        if (!isPolling) {
          setIsAlertModalOpen(true);
          playThreatChime();
        } else if (activeIncoming.length > previousAlertCountRef.current) {
          setIsAlertModalOpen(true);
          playThreatChime();
        }
      }
      previousAlertCountRef.current = activeIncoming.length;
    } catch (err) {
      console.error(err);
    } finally {
      if (!isPolling) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(() => {
      fetchAdminData(true);
    }, 12000); // Live poll every 12s
    return () => clearInterval(interval);
  }, []);

  const handleSimulateAlert = async () => {
    setSimulating(true);
    try {
      await api.post('/alerts/simulate');
      await fetchAdminData(true);
      setIsAlertModalOpen(true);
      playThreatChime();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to simulate alert');
    } finally {
      setSimulating(false);
    }
  };

  const handleAlertUpdated = (alertId, newStatus) => {
    setAlerts((prev) =>
      prev.map((a) => (a.alertId === alertId ? { ...a, status: newStatus } : a))
    );
    api.get('/users/stats').then((res) => {
      if (res.data?.stats) setStats(res.data.stats);
    }).catch(() => {});
  };

  const handleUserStatusToggled = (targetUserId) => {
    setUsersList((prev) =>
      prev.map((u) =>
        u.userId === targetUserId
          ? { ...u, status: u.status === 'Active' ? 'Disabled' : 'Active' }
          : u
      )
    );
  };

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

  const activeAlerts = alerts.filter((a) => a.status === 'Active');

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
              <button
                onClick={handleSimulateAlert}
                disabled={simulating}
                className="px-3.5 py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/40 font-bold text-xs shadow-sm flex items-center space-x-1.5 transition cursor-pointer"
                title="Test trigger a suspicious anomaly alert popup for demonstration"
              >
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>{simulating ? 'Simulating Threat...' : 'Simulate Threat Alert'}</span>
              </button>
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

          {/* Active Suspicious Activities Alert Banner */}
          {activeAlerts.length > 0 && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950 via-rose-900/90 to-slate-900 border-2 border-rose-500/70 shadow-2xl shadow-rose-950/70 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in duration-300">
              <div className="flex items-start sm:items-center space-x-4">
                <div className="relative p-3 rounded-2xl bg-rose-500/20 border border-rose-500 text-rose-400 flex-shrink-0 animate-pulse">
                  <ShieldAlert className="w-8 h-8 text-rose-500" />
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500"></span>
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-black text-white tracking-wide">
                      SUSPICIOUS ACTIVITY ALERT
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-black bg-rose-600 text-white shadow-sm animate-bounce">
                      {activeAlerts.length} ACTIVE THREAT{activeAlerts.length > 1 ? 'S' : ''}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                      ADMIN ATTENTION REQUIRED
                    </span>
                  </div>
                  <p className="text-xs text-rose-200 mt-1">
                    Latest Incident: <strong className="text-white font-bold">{activeAlerts[0]?.activity}</strong> by suspect{' '}
                    <strong className="text-rose-100">{activeAlerts[0]?.userName} ({activeAlerts[0]?.userId})</strong>{' '}
                    at <span className="font-mono text-cyan-300 font-bold">{formatTimeWithAMPM(activeAlerts[0]?.detectedTime)}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
                <button
                  onClick={() => setIsAlertModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-black text-xs shadow-lg shadow-rose-600/40 flex items-center space-x-2 transition cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Inspect Threat Pop-up</span>
                </button>
                <Link
                  to="/alerts"
                  className="px-3.5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center space-x-1.5 transition"
                >
                  <span>All Alerts ({alerts.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

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
            <div
              onClick={() => activeAlerts.length > 0 && setIsAlertModalOpen(true)}
              className={activeAlerts.length > 0 ? 'cursor-pointer group' : ''}
              title={activeAlerts.length > 0 ? 'Click to open suspicious activities alert pop-up' : 'No active alerts'}
            >
              <StatCard
                title="Suspicious Activities"
                value={activeAlerts.length > 0 ? `${activeAlerts.length} Active` : (stats.suspiciousActivities || 0)}
                icon={ShieldAlert}
                color="rose"
                trend={activeAlerts.length > 0 ? 'Click to View Threats' : undefined}
              />
            </div>
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

      {/* Suspicious Activity Threat Pop-up Modal */}
      <SuspiciousActivityAlertModal
        alerts={activeAlerts}
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        onAlertUpdated={handleAlertUpdated}
        onUserStatusToggled={handleUserStatusToggled}
      />

    </div>
  );
};
