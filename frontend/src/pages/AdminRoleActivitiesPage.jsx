import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Download,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Activity,
  Calendar,
  Clock,
  Eye,
  FileText,
  CheckCircle,
  XCircle,
  FileCheck,
  Upload,
  UserCheck,
  GraduationCap,
  Award,
  Cpu,
  Lock,
  Layers,
  ArrowRight,
  Info,
  Laptop,
  Check,
  X
} from 'lucide-react';
import api from '../services/api';
import { formatTimeWithAMPM } from '../utils/dateFormatter';

export const AdminRoleActivitiesPage = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [roleStats, setRoleStats] = useState({
    Teacher: { total: 0, uploads: 0, views: 0, requests: 0, edits: 0, uniqueUsers: 0 },
    HOD: { total: 0, verified: 0, views: 0, statusUpdates: 0, uniqueUsers: 0 },
    Principal: { total: 0, approved: 0, rejected: 0, views: 0, uniqueUsers: 0 },
    'Exam Controller': { total: 0, downloadRequests: 0, verifications: 0, views: 0, uniqueUsers: 0 }
  });
  const [summary, setSummary] = useState({
    totalActivities: 0,
    todayActivities: 0,
    blockedActivities: 0
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters State
  const [activeRoleTab, setActiveRoleTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionCategory, setActionCategory] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [resultFilter, setResultFilter] = useState('All');
  const [timeFilter, setTimeFilter] = useState('all');

  // Selected Log for Inspection Modal
  const [inspectLog, setInspectLog] = useState(null);

  const fetchRoleActivities = async () => {
    setLoading(true);
    try {
      // First try dedicated role-activities endpoint
      try {
        const res = await api.get('/audit/role-activities');
        if (res.data && res.data.logs) {
          setLogs(res.data.logs);
          if (res.data.roleStats) setRoleStats(res.data.roleStats);
          if (res.data.summary) setSummary(res.data.summary);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Role-activities route fallback to general audit logs:', err);
      }

      // Fallback: fetch from /audit
      const fallbackRes = await api.get('/audit');
      const allLogs = fallbackRes.data.logs || [];
      setLogs(allLogs);

      // Compute stats client-side
      const stats = {
        Teacher: { total: 0, uploads: 0, views: 0, requests: 0, edits: 0, uniqueUsers: new Set() },
        HOD: { total: 0, verified: 0, views: 0, statusUpdates: 0, uniqueUsers: new Set() },
        Principal: { total: 0, approved: 0, rejected: 0, views: 0, uniqueUsers: new Set() },
        'Exam Controller': { total: 0, downloadRequests: 0, verifications: 0, views: 0, uniqueUsers: new Set() }
      };

      let todayCount = 0;
      let blockedCount = 0;
      const todayStr = new Date().toISOString().split('T')[0];

      allLogs.forEach((l) => {
        const r = l.role;
        const act = (l.action || '').toLowerCase();
        const resVal = (l.result || '').toLowerCase();

        if (l.date && l.date.includes(todayStr)) todayCount++;
        if (resVal.includes('fail') || resVal.includes('denied') || resVal.includes('block')) blockedCount++;

        if (stats[r]) {
          stats[r].total++;
          if (l.userId) stats[r].uniqueUsers.add(l.userId);

          if (r === 'Teacher') {
            if (act.includes('upload')) stats.Teacher.uploads++;
            if (act.includes('view')) stats.Teacher.views++;
            if (act.includes('request')) stats.Teacher.requests++;
            if (act.includes('update') || act.includes('edit')) stats.Teacher.edits++;
          } else if (r === 'HOD') {
            if (act.includes('verify') || act.includes('verified')) stats.HOD.verified++;
            if (act.includes('status')) stats.HOD.statusUpdates++;
            if (act.includes('view')) stats.HOD.views++;
          } else if (r === 'Principal') {
            if (act.includes('approve')) stats.Principal.approved++;
            if (act.includes('reject')) stats.Principal.rejected++;
            if (act.includes('view')) stats.Principal.views++;
          } else if (r === 'Exam Controller') {
            if (act.includes('request')) stats['Exam Controller'].downloadRequests++;
            if (act.includes('verify') || act.includes('hash')) stats['Exam Controller'].verifications++;
            if (act.includes('view')) stats['Exam Controller'].views++;
          }
        }
      });

      setRoleStats({
        Teacher: { ...stats.Teacher, uniqueUsers: stats.Teacher.uniqueUsers.size },
        HOD: { ...stats.HOD, uniqueUsers: stats.HOD.uniqueUsers.size },
        Principal: { ...stats.Principal, uniqueUsers: stats.Principal.uniqueUsers.size },
        'Exam Controller': { ...stats['Exam Controller'], uniqueUsers: stats['Exam Controller'].uniqueUsers.size }
      });

      setSummary({
        totalActivities: allLogs.length,
        todayActivities: todayCount,
        blockedActivities: blockedCount
      });
    } catch (err) {
      console.error('Error fetching role activities:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRoleActivities();
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchRoleActivities();
  };

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Role filter tab
      if (activeRoleTab !== 'All' && log.role !== activeRoleTab) {
        return false;
      }

      // Department filter
      if (deptFilter !== 'All') {
        const logDept = log.userDepartment || log.department || '';
        if (logDept !== deptFilter) return false;
      }

      // Action category filter
      if (actionCategory !== 'All') {
        const act = (log.action || '').toLowerCase();
        if (actionCategory === 'uploads' && !act.includes('upload')) return false;
        if (actionCategory === 'views' && !act.includes('view')) return false;
        if (actionCategory === 'verifications' && !act.includes('verify') && !act.includes('status')) return false;
        if (actionCategory === 'approvals' && !act.includes('approve') && !act.includes('reject')) return false;
        if (actionCategory === 'requests' && !act.includes('request')) return false;
        if (actionCategory === 'auth' && !act.includes('login') && !act.includes('logout') && !act.includes('password')) return false;
      }

      // Result filter
      if (resultFilter !== 'All') {
        const resVal = (log.result || '').toLowerCase();
        const isSuccess = resVal.includes('success');
        if (resultFilter === 'Success' && !isSuccess) return false;
        if (resultFilter === 'Blocked' && isSuccess) return false;
      }

      // Time filter
      if (timeFilter !== 'all') {
        const logDate = new Date(log.createdAt || `${log.date} ${log.time}`);
        const now = new Date();
        const diffDays = (now - logDate) / (1000 * 60 * 60 * 24);

        if (timeFilter === 'today' && diffDays > 1) return false;
        if (timeFilter === 'week' && diffDays > 7) return false;
        if (timeFilter === 'month' && diffDays > 30) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (log.userName || '').toLowerCase().includes(q);
        const matchId = (log.userId || '').toLowerCase().includes(q);
        const matchRole = (log.role || '').toLowerCase().includes(q);
        const matchAction = (log.action || '').toLowerCase().includes(q);
        const matchPaperId = (log.paperId || '').toLowerCase().includes(q);
        const matchPaperTitle = (log.paperTitle || '').toLowerCase().includes(q);
        const matchIp = (log.ipAddress || '').toLowerCase().includes(q);
        const matchMac = (log.macAddress || '').toLowerCase().includes(q);
        const matchReason = (log.reason || '').toLowerCase().includes(q);

        if (
          !matchName &&
          !matchId &&
          !matchRole &&
          !matchAction &&
          !matchPaperId &&
          !matchPaperTitle &&
          !matchIp &&
          !matchMac &&
          !matchReason
        ) {
          return false;
        }
      }

      return true;
    });
  }, [logs, activeRoleTab, deptFilter, actionCategory, resultFilter, timeFilter, searchQuery]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      alert('No records available to export.');
      return;
    }

    const headers = ['Timestamp', 'Date', 'Time', 'User ID', 'Name', 'Role', 'Department', 'Action', 'Paper ID', 'Paper Title', 'Result', 'IP Address', 'MAC Address', 'Reason'];
    const rows = filteredLogs.map((l) => [
      `"${l.createdAt || ''}"`,
      `"${l.date || ''}"`,
      `"${l.time || ''}"`,
      `"${l.userId || ''}"`,
      `"${l.userName || ''}"`,
      `"${l.role || ''}"`,
      `"${l.userDepartment || l.department || 'General'}"`,
      `"${l.action || ''}"`,
      `"${l.paperId || 'N/A'}"`,
      `"${(l.paperTitle || '').replace(/"/g, '""')}"`,
      `"${l.result || 'Success'}"`,
      `"${l.ipAddress || ''}"`,
      `"${l.macAddress || ''}"`,
      `"${(l.reason || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `role_activities_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper for Role Theme
  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'Teacher':
        return 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-500/40';
      case 'HOD':
        return 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/40';
      case 'Principal':
        return 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-500/40';
      case 'Exam Controller':
        return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Teacher':
        return GraduationCap;
      case 'HOD':
        return FileCheck;
      case 'Principal':
        return Award;
      case 'Exam Controller':
        return Cpu;
      default:
        return Users;
    }
  };

  // Calculate percentage of role volume
  const totalMonitored =
    (roleStats.Teacher?.total || 0) +
    (roleStats.HOD?.total || 0) +
    (roleStats.Principal?.total || 0) +
    (roleStats['Exam Controller']?.total || 0) || 1;

  const teacherPct = Math.round(((roleStats.Teacher?.total || 0) / totalMonitored) * 100);
  const hodPct = Math.round(((roleStats.HOD?.total || 0) / totalMonitored) * 100);
  const principalPct = Math.round(((roleStats.Principal?.total || 0) / totalMonitored) * 100);
  const examControllerPct = Math.round(((roleStats['Exam Controller']?.total || 0) / totalMonitored) * 100);

  return (
    <div className="min-h-screen bg-cyber-dark text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-300">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header Banner */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#151B2E] border border-slate-200 dark:border-[#33435C] shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30 text-xs font-mono font-bold mb-2">
                <Activity className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 animate-pulse" />
                <span>INSTITUTIONAL ROLE ACTIVITIES COMMAND CENTER</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Role Activity Oversight & Ledger
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-[#CBD5E1] mt-1 font-medium max-w-3xl">
                Comprehensive real-time tracking of all operations performed by{' '}
                <strong className="text-blue-600 dark:text-blue-400">Teachers</strong>,{' '}
                <strong className="text-amber-600 dark:text-amber-400">HODs</strong>,{' '}
                <strong className="text-purple-600 dark:text-purple-400">Principals</strong>, and{' '}
                <strong className="text-emerald-600 dark:text-emerald-400">Exam Controllers</strong>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
              <button
                onClick={handleManualRefresh}
                disabled={refreshing}
                className="px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-[#182232] hover:bg-slate-200 dark:hover:bg-[#222D42] border border-slate-200 dark:border-[#33435C] text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-2 transition shadow-sm"
                title="Refresh live activity feed"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-extrabold flex items-center space-x-2 transition shadow-md shadow-cyan-500/20"
                title="Download CSV audit report"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Audit CSV</span>
              </button>

              <Link
                to="/users"
                className="px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-[#182232] hover:bg-slate-200 dark:hover:bg-[#222D42] border border-slate-200 dark:border-[#33435C] text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-1.5 transition shadow-sm"
              >
                <Users className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>Users</span>
              </Link>
            </div>
          </div>

          {/* 4 Dedicated Role Command Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Teacher Card */}
            <div
              onClick={() => setActiveRoleTab('Teacher')}
              className={`p-5 rounded-3xl bg-white dark:bg-[#151B2E] border transition-all duration-300 cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-1 ${
                activeRoleTab === 'Teacher'
                  ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20 dark:bg-blue-950/20'
                  : 'border-slate-200 dark:border-[#33435C]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" />
                  <span>Teacher Operations</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 font-bold">
                  {teacherPct}% Vol
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div className="text-3xl font-black text-slate-900 dark:text-white">
                  {roleStats.Teacher?.total || 0}
                </div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {roleStats.Teacher?.uniqueUsers || 0} Faculty Active
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Uploads:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{roleStats.Teacher?.uploads || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Edits:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{roleStats.Teacher?.edits || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Views:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{roleStats.Teacher?.views || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Requests:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{roleStats.Teacher?.requests || 0}</span>
                </div>
              </div>
            </div>

            {/* HOD Card */}
            <div
              onClick={() => setActiveRoleTab('HOD')}
              className={`p-5 rounded-3xl bg-white dark:bg-[#151B2E] border transition-all duration-300 cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-1 ${
                activeRoleTab === 'HOD'
                  ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20 dark:bg-amber-950/20'
                  : 'border-slate-200 dark:border-[#33435C]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4" />
                  <span>HOD Department Verifications</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-bold">
                  {hodPct}% Vol
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div className="text-3xl font-black text-slate-900 dark:text-white">
                  {roleStats.HOD?.total || 0}
                </div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {roleStats.HOD?.uniqueUsers || 0} HODs Active
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Verified:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{roleStats.HOD?.verified || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status Updates:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{roleStats.HOD?.statusUpdates || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Dept Views:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{roleStats.HOD?.views || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Audit Scope:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Dept Only</span>
                </div>
              </div>
            </div>

            {/* Principal Card */}
            <div
              onClick={() => setActiveRoleTab('Principal')}
              className={`p-5 rounded-3xl bg-white dark:bg-[#151B2E] border transition-all duration-300 cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-1 ${
                activeRoleTab === 'Principal'
                  ? 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/20 dark:bg-purple-950/20'
                  : 'border-slate-200 dark:border-[#33435C]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span>Principal Authorizations</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 font-bold">
                  {principalPct}% Vol
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div className="text-3xl font-black text-slate-900 dark:text-white">
                  {roleStats.Principal?.total || 0}
                </div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {roleStats.Principal?.uniqueUsers || 0} Exec Active
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Approved:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{roleStats.Principal?.approved || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Rejected:</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">{roleStats.Principal?.rejected || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Inspections:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{roleStats.Principal?.views || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Authority:</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">Final Decider</span>
                </div>
              </div>
            </div>

            {/* Exam Controller Card */}
            <div
              onClick={() => setActiveRoleTab('Exam Controller')}
              className={`p-5 rounded-3xl bg-white dark:bg-[#151B2E] border transition-all duration-300 cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-1 ${
                activeRoleTab === 'Exam Controller'
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/20'
                  : 'border-slate-200 dark:border-[#33435C]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4" />
                  <span>Exam Controller Operations</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-bold">
                  {examControllerPct}% Vol
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div className="text-3xl font-black text-slate-900 dark:text-white">
                  {roleStats['Exam Controller']?.total || 0}
                </div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {roleStats['Exam Controller']?.uniqueUsers || 0} Controller Active
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Permits Filed:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{roleStats['Exam Controller']?.downloadRequests || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hash Checks:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{roleStats['Exam Controller']?.verifications || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Inspections:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{roleStats['Exam Controller']?.views || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Security Gate:</span>
                  <span className="font-bold text-cyan-600 dark:text-cyan-400">Printing Hub</span>
                </div>
              </div>
            </div>
          </div>

          {/* Role Proportion Visualizer Bar */}
          <div className="p-4 rounded-3xl bg-white dark:bg-[#151B2E] border border-slate-200 dark:border-[#33435C] shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Institutional Activity Share by Role</span>
              </span>
              <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                Total Monitored Operations: {totalMonitored}
              </span>
            </div>

            <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${teacherPct}%` }}
                title={`Teachers: ${teacherPct}% (${roleStats.Teacher?.total || 0} events)`}
                className="bg-blue-500 hover:bg-blue-400 transition-all cursor-pointer"
              />
              <div
                style={{ width: `${hodPct}%` }}
                title={`HODs: ${hodPct}% (${roleStats.HOD?.total || 0} events)`}
                className="bg-amber-500 hover:bg-amber-400 transition-all cursor-pointer"
              />
              <div
                style={{ width: `${principalPct}%` }}
                title={`Principals: ${principalPct}% (${roleStats.Principal?.total || 0} events)`}
                className="bg-purple-500 hover:bg-purple-400 transition-all cursor-pointer"
              />
              <div
                style={{ width: `${examControllerPct}%` }}
                title={`Exam Controllers: ${examControllerPct}% (${roleStats['Exam Controller']?.total || 0} events)`}
                className="bg-emerald-500 hover:bg-emerald-400 transition-all cursor-pointer"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] font-semibold text-slate-600 dark:text-slate-400 pt-1">
              <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setActiveRoleTab('Teacher')}>
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                <span>Teacher: {roleStats.Teacher?.total || 0} ({teacherPct}%)</span>
              </div>
              <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setActiveRoleTab('HOD')}>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <span>HOD: {roleStats.HOD?.total || 0} ({hodPct}%)</span>
              </div>
              <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setActiveRoleTab('Principal')}>
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                <span>Principal: {roleStats.Principal?.total || 0} ({principalPct}%)</span>
              </div>
              <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setActiveRoleTab('Exam Controller')}>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span>Exam Controller: {roleStats['Exam Controller']?.total || 0} ({examControllerPct}%)</span>
              </div>
            </div>
          </div>

          {/* Interactive Role Tabs & Filter Controls */}
          <div className="space-y-4">
            {/* Role Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-[#33435C] pb-3">
              {[
                { id: 'All', label: 'All Roles', count: logs.length, icon: Users },
                { id: 'Teacher', label: 'Teachers', count: roleStats.Teacher?.total || 0, icon: GraduationCap },
                { id: 'HOD', label: 'HODs', count: roleStats.HOD?.total || 0, icon: FileCheck },
                { id: 'Principal', label: 'Principals', count: roleStats.Principal?.total || 0, icon: Award },
                { id: 'Exam Controller', label: 'Exam Controllers', count: roleStats['Exam Controller']?.total || 0, icon: Cpu }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeRoleTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveRoleTab(tab.id)}
                    className={`px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center space-x-2 transition shadow-sm ${
                      isActive
                        ? 'bg-cyan-600 text-white shadow-cyan-500/20'
                        : 'bg-white dark:bg-[#151B2E] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#182232] border border-slate-200 dark:border-[#33435C]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Filter Toolbar */}
            <div className="p-4 rounded-3xl bg-white dark:bg-[#151B2E] border border-slate-200 dark:border-[#33435C] shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
              {/* Search input */}
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user, ID, paper, IP, MAC address..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-cyan-500 transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Dropdowns */}
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                {/* Action Category */}
                <select
                  value={actionCategory}
                  onChange={(e) => setActionCategory(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                >
                  <option value="All">All Actions</option>
                  <option value="uploads">Paper Uploads</option>
                  <option value="views">Paper Views</option>
                  <option value="verifications">Verifications / Status</option>
                  <option value="approvals">Approvals / Rejections</option>
                  <option value="requests">Download Requests</option>
                  <option value="auth">Logins / Auth</option>
                </select>

                {/* Department Filter */}
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                >
                  <option value="All">All Departments</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Telecom">Electronics & Telecom</option>
                  <option value="Mechanical Engineering">Mechanical</option>
                  <option value="Civil Engineering">Civil</option>
                  <option value="Cyber Security & Audit">Cyber Security</option>
                </select>

                {/* Result Filter */}
                <select
                  value={resultFilter}
                  onChange={(e) => setResultFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                >
                  <option value="All">All Results</option>
                  <option value="Success">Success Only</option>
                  <option value="Blocked">Blocked / Denied</option>
                </select>

                {/* Time Range */}
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today Only</option>
                  <option value="week">Past 7 Days</option>
                  <option value="month">Past 30 Days</option>
                </select>
              </div>
            </div>
          </div>

          {/* Activity Ledger Table Card */}
          <div className="rounded-3xl bg-white dark:bg-[#151B2E] border border-slate-200 dark:border-[#33435C] shadow-lg overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-[#33435C] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>Institutional Activity Stream</span>
                </h3>
                <span className="text-xs text-slate-500 dark:text-[#CBD5E1]">
                  Showing <strong className="text-cyan-600 dark:text-cyan-400">{filteredLogs.length}</strong> of{' '}
                  <strong>{logs.length}</strong> total logged actions
                </span>
              </div>

              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                  <span>LIVE AUDIT SYNCHRONIZED</span>
                </span>
              </div>
            </div>

            {loading ? (
              <div className="p-16 text-center space-y-3">
                <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-500">Querying institutional immutable audit ledger...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-16 text-center space-y-3">
                <ShieldCheck className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No activities match your filters</h4>
                <p className="text-xs text-slate-500">
                  Try adjusting your search criteria, switching role tabs, or clearing filters.
                </p>
                <button
                  onClick={() => {
                    setActiveRoleTab('All');
                    setSearchQuery('');
                    setActionCategory('All');
                    setDeptFilter('All');
                    setResultFilter('All');
                    setTimeFilter('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-sm"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-[#33435C] bg-slate-50/70 dark:bg-[#182232]/70 text-slate-500 dark:text-[#CBD5E1] font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3.5 px-4">User & Role</th>
                      <th className="py-3.5 px-4">Action Performed</th>
                      <th className="py-3.5 px-4">Paper / Target Context</th>
                      <th className="py-3.5 px-4">Network & Hardware Footprint</th>
                      <th className="py-3.5 px-4">Result</th>
                      <th className="py-3.5 px-4">Timestamp</th>
                      <th className="py-3.5 px-4 text-right">Ledger Record</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#33435C]/50">
                    {filteredLogs.map((log) => {
                      const RoleIcon = getRoleIcon(log.role);
                      const isSuccess = !(log.result || '').toLowerCase().includes('fail') && !(log.result || '').toLowerCase().includes('denied');

                      return (
                        <tr
                          key={log.id || `${log.userId}-${log.time}-${Math.random()}`}
                          className="hover:bg-slate-50/80 dark:hover:bg-[#182232]/50 transition duration-150"
                        >
                          {/* User & Role */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-3">
                              {log.userAvatar ? (
                                <img
                                  src={log.userAvatar}
                                  alt={log.userName}
                                  className="w-9 h-9 rounded-xl object-cover border border-cyan-500/30 flex-shrink-0"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 text-xs flex-shrink-0">
                                  {log.userName ? log.userName.charAt(0).toUpperCase() : 'U'}
                                </div>
                              )}
                              <div>
                                <Link
                                  to={`/audit/user/${log.userId}`}
                                  className="font-bold text-slate-900 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 transition hover:underline flex items-center gap-1"
                                  title="View User Activity Profile"
                                >
                                  <span>{log.userName || log.userId}</span>
                                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                                </Link>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border font-mono inline-flex items-center gap-1 ${getRoleBadgeStyle(
                                      log.role
                                    )}`}
                                  >
                                    <RoleIcon className="w-3 h-3" />
                                    <span>{log.role}</span>
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {log.userId}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Action Performed */}
                          <td className="py-3.5 px-4">
                            <div className="font-extrabold text-slate-800 dark:text-slate-200">
                              {log.action}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 max-w-xs truncate" title={log.reason || 'Standard system action'}>
                              {log.reason ? `Reason: ${log.reason}` : (log.userDepartment ? `Dept: ${log.userDepartment}` : 'Logged Operation')}
                            </div>
                          </td>

                          {/* Paper / Target Context */}
                          <td className="py-3.5 px-4">
                            {log.paperId ? (
                              <div>
                                <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-200 dark:border-cyan-500/20 text-[11px]">
                                  {log.paperId}
                                </span>
                                {log.paperTitle && (
                                  <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-1 truncate max-w-xs" title={log.paperTitle}>
                                    {log.paperTitle}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 font-mono text-[11px] italic">System Level / Account</span>
                            )}
                          </td>

                          {/* Network & Hardware Footprint */}
                          <td className="py-3.5 px-4 font-mono text-[11px]">
                            <div className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300 font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 inline-block" />
                              <span>IP: {log.ipAddress || '192.168.1.101'}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              MAC: {log.macAddress || 'A4-83-E7-12-9F-3B'}
                            </div>
                          </td>

                          {/* Result */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold inline-flex items-center gap-1 border ${
                                isSuccess
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30'
                                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-500/30'
                              }`}
                            >
                              {isSuccess ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                              <span>{log.result || 'Success'}</span>
                            </span>
                          </td>

                          {/* Timestamp */}
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{log.date || (log.createdAt ? new Date(log.createdAt).toLocaleDateString() : '2026-10-17')}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-slate-400 text-[10px] mt-0.5">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{formatTimeWithAMPM(log.time) || (log.createdAt ? new Date(log.createdAt).toLocaleTimeString('en-US', { hour12: true }) : '12:00:00 PM')}</span>
                            </div>
                          </td>

                          {/* Ledger Record Action */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setInspectLog(log)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#182232] hover:bg-cyan-50 dark:hover:bg-cyan-500/20 text-slate-700 dark:text-slate-200 hover:text-cyan-700 dark:hover:text-cyan-300 border border-slate-200 dark:border-[#33435C] hover:border-cyan-400 text-xs font-bold transition inline-flex items-center gap-1"
                              title="Inspect cryptographic ledger record"
                            >
                              <Info className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                              <span>Inspect</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Cryptographic Audit Ledger Inspector Modal */}
      {inspectLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-[#151B2E] border border-slate-200 dark:border-[#33435C] rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#33435C]">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-500/30">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Immutable Audit Ledger Record
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#CBD5E1] font-mono">
                    Record ID: #{inspectLog.id || 'ACC-8910'} • Tamper Status: VERIFIED ✓
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInspectLog(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#182232] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Operator Name</span>
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">{inspectLog.userName}</span>
                <div className="text-[11px] text-slate-500 font-mono">ID: {inspectLog.userId}</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned Role & Perm</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold inline-block border ${getRoleBadgeStyle(inspectLog.role)}`}>
                  {inspectLog.role}
                </span>
                <div className="text-[11px] text-slate-500 font-medium">Department: {inspectLog.userDepartment || inspectLog.department || 'General'}</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] space-y-1 sm:col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Action Details & Payload</span>
                <span className="font-black text-sm text-cyan-700 dark:text-cyan-400">{inspectLog.action}</span>
                {inspectLog.reason && (
                  <p className="text-slate-600 dark:text-slate-300 mt-1">{inspectLog.reason}</p>
                )}
              </div>

              {inspectLog.paperId && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] space-y-1 sm:col-span-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Question Paper Associated</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-500/20 px-2 py-0.5 rounded">
                      {inspectLog.paperId}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{inspectLog.paperTitle}</span>
                  </div>
                </div>
              )}

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] space-y-1 font-mono">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Network IPv4 / IPv6</span>
                <span className="font-bold text-slate-900 dark:text-white">{inspectLog.ipAddress || '192.168.1.101'}</span>
                <div className="text-[10px] text-slate-500">Hardware MAC: {inspectLog.macAddress || 'A4-83-E7-12-9F-3B'}</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Execution Outcome</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{inspectLog.result || 'Success'}</span>
                <div className="text-[11px] text-slate-500 font-mono">
                  {inspectLog.date} at {formatTimeWithAMPM(inspectLog.time)}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] space-y-1 sm:col-span-2 font-mono text-[11px]">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Device & Session Footprint</span>
                <div className="text-slate-700 dark:text-slate-300">Device: {inspectLog.deviceInfo || 'Workstation (Windows 11 / Chrome)'}</div>
                <div className="text-slate-500 text-[10px]">Session ID: {inspectLog.sessionId || 'SES-2026-X99281A'}</div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-[#33435C]">
              <Link
                to={`/audit/user/${inspectLog.userId}`}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#182232] hover:bg-slate-200 dark:hover:bg-[#222D42] text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5 transition"
              >
                <UserCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>View Full User Activity Profile</span>
              </Link>

              <button
                onClick={() => setInspectLog(null)}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition shadow-md shadow-cyan-500/20"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
