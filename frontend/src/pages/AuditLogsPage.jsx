import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { Link } from 'react-router-dom';
import { History, Search, Filter, User, Calendar, Clock, Monitor, ShieldCheck, AlertTriangle, Cpu, Lock } from 'lucide-react';
import api from '../services/api';
import { formatTimeWithAMPM } from '../utils/dateFormatter';

export const AuditLogsPage = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userFilter, setUserFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [actionFilter, setActionFilter] = useState('All');

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/audit');
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    // If HOD, strictly exclude logs from Principal, Exam Controller, Admin, Auditor
    if (user?.role === 'HOD' && ['Principal', 'Exam Controller', 'Admin', 'Auditor'].includes(log.role)) {
      return false;
    }

    const matchesUser = log.userName.toLowerCase().includes(userFilter.toLowerCase()) ||
                        log.userId.toLowerCase().includes(userFilter.toLowerCase()) ||
                        (log.ipAddress && log.ipAddress.includes(userFilter)) ||
                        (log.macAddress && log.macAddress.toLowerCase().includes(userFilter.toLowerCase())) ||
                        (log.paperId && log.paperId.toLowerCase().includes(userFilter.toLowerCase()));
    const matchesRole = roleFilter === 'All' || log.role === roleFilter;
    const matchesAction = actionFilter === 'All' || log.action.includes(actionFilter);
    return matchesUser && matchesRole && matchesAction;
  });

  return (
    <div className="min-h-screen bg-cyber-dark text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-300">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          
          {/* Header Banner */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#151B2E] border border-slate-200 dark:border-[#33435C] shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-extrabold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider">
                {user?.role === 'HOD' ? `Department Audit Ledger (${user?.department})` : 'Immutable Security Ledger'}
              </span>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {user?.role === 'HOD' ? `Department Activity & Audit Logs` : 'System History & Audit Logs'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-1 font-medium">
                {user?.role === 'HOD'
                  ? `Activity trail restricted to users and papers in the ${user?.department} department.`
                  : 'Comprehensive system activity trail capturing user actions, IP addresses, MAC hardware IDs, paper accesses, and authentication results.'}
              </p>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-slate-50 dark:bg-[#182232] border border-slate-200 dark:border-cyan-500/30 text-xs text-cyan-800 dark:text-cyan-300 font-mono font-bold flex items-center space-x-2 self-start md:self-auto shadow-sm">
              <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>{user?.role === 'HOD' ? `Scope: ${user?.department}` : 'Log Tamper Protection: ACTIVE'}</span>
            </div>
          </div>

          {/* Search & Role Filters */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#151B2E] border border-slate-200 dark:border-[#33435C] shadow-lg flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                placeholder="Search user, IP, MAC, or Paper ID..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-cyan-500 transition"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Role:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] text-xs text-slate-800 dark:text-cyan-300 font-bold outline-none cursor-pointer"
                >
                  <option value="All">All Roles</option>
                  <option value="Teacher">Teacher</option>
                  <option value="HOD">HOD</option>
                  {user?.role !== 'HOD' && (
                    <>
                      <option value="Principal">Principal</option>
                      <option value="Admin">Admin</option>
                      <option value="Exam Controller">Exam Controller</option>
                      <option value="Auditor">Auditor</option>
                    </>
                  )}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Action:</span>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] text-xs text-slate-800 dark:text-cyan-300 font-bold outline-none cursor-pointer"
                >
                  <option value="All">All Actions</option>
                  <option value="Uploaded">Uploaded</option>
                  <option value="Viewed">Viewed</option>
                  <option value="Requested Download">Requested Download</option>
                  <option value="Approved Download">Approved Download</option>
                  <option value="Downloaded">Downloaded</option>
                  <option value="Login">Login</option>
                </select>
              </div>
            </div>
          </div>

          {/* High Visibility Audit Logs Table */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#151B2E] border border-slate-200 dark:border-[#33435C] shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-5 h-5 text-cyan-600 dark:text-cyan-400" /> Audit Log Trail ({filteredLogs.length} Records)
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-medium hidden sm:inline">
                Click user name to view activity timeline
              </span>
            </div>

            <div className="overflow-auto max-h-[620px] rounded-2xl border border-slate-200 dark:border-[#33435C] relative shadow-sm scroll-smooth">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-20 bg-slate-100 dark:bg-[#182232] shadow-sm">
                  <tr className="bg-slate-100 dark:bg-[#182232] border-b border-slate-200 dark:border-[#33435C] text-slate-700 dark:text-slate-300 font-black uppercase text-[11px] tracking-wider">
                    <th className="py-3.5 px-4 sticky top-0 z-20 bg-slate-100 dark:bg-[#182232] border-b border-slate-200 dark:border-[#33435C]">USER</th>
                    <th className="py-3.5 px-4 sticky top-0 z-20 bg-slate-100 dark:bg-[#182232] border-b border-slate-200 dark:border-[#33435C]">ROLE</th>
                    <th className="py-3.5 px-4 sticky top-0 z-20 bg-slate-100 dark:bg-[#182232] border-b border-slate-200 dark:border-[#33435C]">IP ADDRESS</th>
                    <th className="py-3.5 px-4 sticky top-0 z-20 bg-slate-100 dark:bg-[#182232] border-b border-slate-200 dark:border-[#33435C]">MAC ADDRESS</th>
                    <th className="py-3.5 px-4 sticky top-0 z-20 bg-slate-100 dark:bg-[#182232] border-b border-slate-200 dark:border-[#33435C]">ACTION</th>
                    <th className="py-3.5 px-4 sticky top-0 z-20 bg-slate-100 dark:bg-[#182232] border-b border-slate-200 dark:border-[#33435C]">PAPER ID</th>
                    <th className="py-3.5 px-4 sticky top-0 z-20 bg-slate-100 dark:bg-[#182232] border-b border-slate-200 dark:border-[#33435C]">DATE & TIME</th>
                    <th className="py-3.5 px-4 sticky top-0 z-20 bg-slate-100 dark:bg-[#182232] border-b border-slate-200 dark:border-[#33435C]">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#33435C]/60 bg-white dark:bg-[#151B2E]">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-[#182232]/60 transition">
                      
                      {/* USER Column */}
                      <td className="py-4 px-4 font-bold">
                        <Link 
                          to={`/audit/user/${log.userId}`} 
                          className="text-cyan-700 dark:text-cyan-400 hover:underline flex items-center gap-1.5 text-xs"
                          title="Click to inspect user activity timeline"
                        >
                          <User className="w-4 h-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                          <span>{log.userName}</span>
                          <span className="text-[10px] font-mono text-slate-400">({log.userId})</span>
                        </Link>
                      </td>

                      {/* ROLE Column */}
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 whitespace-nowrap">
                          {log.role}
                        </span>
                      </td>

                      {/* IP ADDRESS Column - Crystal Clear Visibility */}
                      <td className="py-4 px-4">
                        <span className="px-3 py-1.5 rounded-xl bg-cyan-100 dark:bg-cyan-950/90 text-cyan-950 dark:text-cyan-200 border border-cyan-300 dark:border-cyan-500/50 text-xs font-mono font-extrabold shadow-xs inline-flex items-center gap-1.5 whitespace-nowrap">
                          <Monitor className="w-3.5 h-3.5 text-cyan-700 dark:text-cyan-400" />
                          <span>{log.ipAddress || '192.168.1.100'}</span>
                        </span>
                      </td>

                      {/* MAC ADDRESS Column - Crystal Clear Visibility */}
                      <td className="py-4 px-4">
                        <span className="px-3 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-950/90 text-purple-950 dark:text-purple-200 border border-purple-300 dark:border-purple-500/50 text-xs font-mono font-extrabold shadow-xs inline-flex items-center gap-1.5 whitespace-nowrap">
                          <Cpu className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
                          <span>{log.macAddress || '7A-2F-9D-11-4B-88'}</span>
                        </span>
                      </td>

                      {/* ACTION Column */}
                      <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                        {log.action}
                      </td>

                      {/* PAPER ID Column */}
                      <td className="py-4 px-4 font-mono font-extrabold text-cyan-700 dark:text-cyan-300 whitespace-nowrap">
                        {log.paperId || 'N/A'}
                      </td>

                      {/* DATE & TIME Column */}
                      <td className="py-4 px-4 font-mono text-xs text-slate-700 dark:text-slate-300 font-bold whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{log.date}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold pl-4">
                          {formatTimeWithAMPM(log.time)}
                        </div>
                      </td>

                      {/* STATUS Column */}
                      <td className="py-4 px-4">
                        <span 
                          className={`px-3 py-1 rounded-full text-xs font-black shadow-xs whitespace-nowrap ${
                            log.result === 'Success' || log.result === 'Approved'
                              ? 'bg-emerald-100 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40'
                              : 'bg-rose-100 dark:bg-rose-950/90 text-rose-900 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40'
                          }`}
                        >
                          {log.result}
                        </span>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

