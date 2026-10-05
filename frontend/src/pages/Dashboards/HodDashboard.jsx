import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SecureViewerModal } from '../../components/ui/SecureViewerModal';
import { HashIntegrityModal } from '../../components/ui/HashIntegrityModal';
import { StatCard } from '../../components/ui/StatCard';
import { ShieldCheck, Eye, Hash, Lock, CheckCircle, AlertTriangle, FileText, Clock } from 'lucide-react';
import api from '../../services/api';

export const HodDashboard = () => {
  const { user } = useAuth();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPaperId, setSelectedPaperId] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [hashPaper, setHashPaper] = useState(null);

  const fetchDepartmentPapers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/papers');
      setPapers(res.data.papers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentPapers();
  }, []);

  const handleUpdateStatus = async (paperId, newStatus) => {
    try {
      await api.patch(`/papers/${paperId}/status`, { status: newStatus });
      fetchDepartmentPapers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-cyber-dark text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 space-y-8 overflow-y-auto">
          
          {/* Header Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/50 to-slate-900 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">HOD Verification Dashboard</span>
              <h1 className="text-2xl font-extrabold text-white mt-1">Department Paper Submissions & Review</h1>
              <p className="text-xs text-slate-300 mt-1">Review department question papers, inspect SHA-256 hash integrity, and verify submission details.</p>
            </div>
            
            {/* Required Security Warning Banner */}
            <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-bold flex items-center space-x-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Download Restricted – Principal Approval Required.</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Department Submissions" value={papers.length} icon={FileText} color="amber" />
            <StatCard title="Integrity Status" value="Verified ✓" icon={ShieldCheck} color="emerald" />
            <StatCard title="Download Authority" value="Restricted" icon={Lock} trend="Principal Approval Required" color="rose" />
          </div>

          {/* Department Papers List */}
          <div className="p-6 rounded-2xl bg-cyber-card border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Department Question Papers ({user?.department})</h3>
              <span className="text-xs text-slate-400 font-mono">Total Submitted: {papers.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Paper ID</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Submitted By</th>
                    <th className="py-3 px-4">SHA-256 Hash</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {papers.map((p) => (
                    <tr key={p.paperId} className="hover:bg-slate-900/50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">{p.paperId}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-200">{p.subject} ({p.subjectCode})</td>
                      <td className="py-3.5 px-4 text-slate-300">{p.uploadedByName} ({p.uploadedBy})</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-cyan-300 max-w-[160px] truncate">{p.hash}</td>
                      <td className="py-3.5 px-4"><StatusBadge status={p.status} /></td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => { setSelectedPaperId(p.paperId); setIsViewerOpen(true); }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-cyan-400" /> Secure View
                        </button>
                        <button
                          onClick={() => setHashPaper(p)}
                          className="px-2.5 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30 font-mono text-[11px] transition inline-flex items-center gap-1"
                        >
                          <Hash className="w-3.5 h-3.5" /> Hash
                        </button>
                        {p.status !== 'Approved' && (
                          <button
                            onClick={() => handleUpdateStatus(p.paperId, 'Approved')}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30 font-semibold transition"
                          >
                            Approve Submission
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>

      <SecureViewerModal paperId={selectedPaperId} isOpen={isViewerOpen} onClose={() => setIsViewerOpen(false)} role="HOD" />
      <HashIntegrityModal paper={hashPaper} isOpen={!!hashPaper} onClose={() => setHashPaper(null)} />
    </div>
  );
};
