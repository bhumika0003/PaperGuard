import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SecureViewerModal } from '../../components/ui/SecureViewerModal';
import { HashIntegrityModal } from '../../components/ui/HashIntegrityModal';
import { StatCard } from '../../components/ui/StatCard';
import { ShieldCheck, Eye, Hash, ShieldAlert, AlertTriangle, History, Search, Lock, User, Activity } from 'lucide-react';
import api from '../../services/api';
import { formatTimeWithAMPM } from '../../utils/dateFormatter';

export const AuditorDashboard = () => {
  const { user } = useAuth();
  const [papers, setPapers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedPaperId, setSelectedPaperId] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [hashPaper, setHashPaper] = useState(null);

  const fetchAuditorData = async () => {
    setLoading(true);
    try {
      const [pRes, lRes, aRes] = await Promise.all([
        api.get('/papers'),
        api.get('/audit'),
        api.get('/alerts')
      ]);
      setPapers(pRes.data.papers);
      setLogs(lRes.data.logs);
      setAlerts(aRes.data.alerts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditorData();
  }, []);

  return (
    <div className="min-h-screen bg-cyber-dark text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 space-y-8 overflow-y-auto">
          
          {/* Header Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">Cyber Security & Audit Intelligence</span>
              <h1 className="text-2xl font-extrabold text-white mt-1">Security Auditor Monitoring Dashboard</h1>
              <p className="text-xs text-slate-400 mt-1">Full system audit inspection, paper leak investigation, user timeline tracking, and security alert monitoring.</p>
            </div>
            
            {/* Required Warning Banner (Section 11) */}
            <div className="p-3.5 rounded-xl bg-rose-950/90 border border-rose-500/50 text-rose-200 text-xs font-extrabold flex items-center space-x-2 shadow-lg">
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 animate-pulse" />
              <span>Auditor Access: View Only. Download and Printing Disabled.</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <StatCard title="System Audit Logs" value={logs.length} icon={History} color="emerald" />
            <StatCard title="Security Alerts" value={alerts.length} icon={ShieldAlert} color="rose" />
            <StatCard title="Monitored Papers" value={papers.length} icon={ShieldCheck} color="cyan" />
            <StatCard title="Auditor Access Level" value="View-Only" icon={Lock} trend="Download Blocked" color="purple" />
          </div>

          {/* Question Papers Audit Table */}
          <div className="p-6 rounded-2xl bg-cyber-card border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> Monitored Question Papers
              </h3>
              <span className="text-xs text-slate-400 font-mono">Count: {papers.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Paper ID</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">SHA-256 Digital Fingerprint</th>
                    <th className="py-3 px-4">Uploaded By</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {papers.map((p) => (
                    <tr key={p.paperId} className="hover:bg-slate-900/50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">{p.paperId}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-200">{p.subject} ({p.subjectCode})</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-cyan-300 max-w-[180px] truncate">{p.hash}</td>
                      <td className="py-3.5 px-4 text-slate-300">{p.uploadedByName} ({p.uploadedBy})</td>
                      <td className="py-3.5 px-4"><StatusBadge status={p.status} /></td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => { setSelectedPaperId(p.paperId); setIsViewerOpen(true); }}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30 font-medium transition inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Secure Watermark View
                        </button>
                        <button
                          onClick={() => setHashPaper(p)}
                          className="px-2.5 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30 font-mono text-[11px] transition inline-flex items-center gap-1"
                        >
                          <Hash className="w-3.5 h-3.5" /> Verify Hash
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Log Audit Trail with User Profile Drilldown (Section 14 & 15) */}
          <div className="p-6 rounded-2xl bg-cyber-card border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" /> Recent System Access Trail & User Investigation
              </h3>
              <Link to="/audit" className="text-xs font-semibold text-cyan-400 hover:underline">
                View Full Audit Logs →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">User (Click for Timeline)</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Paper ID</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Session / Device</th>
                    <th className="py-3 px-4">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {logs.slice(0, 10).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/50 transition">
                      <td className="py-3.5 px-4 font-bold text-white">
                        <Link to={`/audit/user/${log.userId}`} className="text-cyan-400 hover:underline flex items-center gap-1">
                          <User className="w-3 h-3 text-cyan-400" />
                          {log.userName} ({log.userId})
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-900 border border-slate-700 text-slate-300">
                          {log.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-200">{log.action}</td>
                      <td className="py-3.5 px-4 font-mono text-cyan-300">{log.paperId || 'N/A'}</td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono">{log.date} {formatTimeWithAMPM(log.time)}</td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] max-w-[150px] truncate">{log.deviceInfo} ({log.ipAddress})</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${log.result === 'Success' || log.result === 'Approved' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-rose-950 text-rose-400 border border-rose-500/30'}`}>
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

      <SecureViewerModal paperId={selectedPaperId} isOpen={isViewerOpen} onClose={() => setIsViewerOpen(false)} role="Auditor" />
      <HashIntegrityModal paper={hashPaper} isOpen={!!hashPaper} onClose={() => setHashPaper(null)} />
    </div>
  );
};
