import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SecureViewerModal } from '../../components/ui/SecureViewerModal';
import { HashIntegrityModal } from '../../components/ui/HashIntegrityModal';
import { StatCard } from '../../components/ui/StatCard';
import { Search, Filter, Eye, Hash, FileCheck, Send, ShieldCheck, Clock } from 'lucide-react';
import api from '../../services/api';

export const ExamControllerDashboard = () => {
  const { user } = useAuth();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  // Modals
  const [selectedPaperId, setSelectedPaperId] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [hashPaper, setHashPaper] = useState(null);

  // Download Request Modal
  const [requestTargetPaper, setRequestTargetPaper] = useState(null);
  const [requestReason, setRequestReason] = useState('');

  const fetchPapers = async () => {
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
    fetchPapers();
  }, []);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!requestTargetPaper || !requestReason) return;
    try {
      await api.post('/requests', {
        paperId: requestTargetPaper.paperId,
        reason: requestReason
      });
      setRequestTargetPaper(null);
      setRequestReason('');
      alert('Download permit request submitted to Principal successfully!');
      fetchPapers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit download request.');
    }
  };

  const filteredPapers = papers.filter((p) => {
    const matchesSearch = p.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.paperId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.subjectCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'All' || 
                        p.department.toLowerCase().includes(deptFilter.toLowerCase()) ||
                        (deptFilter === 'Computer Science' && p.department.toLowerCase().includes('computer'));
    return matchesSearch && matchesDept;
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
              <span className="text-xs font-mono font-extrabold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Exam Controller Operations</span>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">Examination Paper Registry & Distribution Control</h1>
              <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-1 font-medium">Monitor examination paper workflow, search registry, view secure streams, and request official print release.</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Examination Papers" value={papers.length} icon={ShieldCheck} color="blue" />
            <StatCard title="Filtered Results" value={filteredPapers.length} icon={Filter} color="cyan" />
            <StatCard title="Download Protocol" value="Principal Permit" icon={FileCheck} trend="Workflow Enforced" color="purple" />
          </div>

          {/* Search & Filter Bar */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#151B2E] border border-slate-200 dark:border-[#33435C] shadow-lg flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search subject, code, or Paper ID..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-cyan-500 transition"
              />
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Department:</span>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] text-xs text-cyan-700 dark:text-cyan-300 font-extrabold outline-none cursor-pointer shadow-sm"
              >
                <option value="All">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Telecom">Electronics & Telecom</option>
              </select>
            </div>
          </div>

          {/* Papers Registry Table */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#151B2E] border border-slate-200 dark:border-[#33435C] shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#33435C] pb-3">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/80 px-3 py-1 rounded-xl border border-cyan-200 dark:border-cyan-800">
                  {deptFilter === 'All' ? 'All Departments' : deptFilter}
                </span>
                <span>Examination Question Papers Master List</span>
              </h3>
              <span className="text-xs font-mono font-bold text-slate-400">
                {filteredPapers.length} Papers Listed
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Paper ID</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Exam Date</th>
                    <th className="py-3 px-4">SHA-256 Hash</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredPapers.map((p) => (
                    <tr key={p.paperId} className="hover:bg-slate-900/50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">{p.paperId}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-200">{p.subject} ({p.subjectCode})</td>
                      <td className="py-3.5 px-4 text-slate-300">{p.department}</td>
                      <td className="py-3.5 px-4 text-slate-400">{p.examDate}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-cyan-300 max-w-[140px] truncate">{p.hash}</td>
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
                        <button
                          onClick={() => setRequestTargetPaper(p)}
                          className="px-2.5 py-1.5 rounded-lg bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-500/40 font-bold transition inline-flex items-center gap-1"
                        >
                          <Send className="w-3.5 h-3.5" /> Request Download
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

      <SecureViewerModal paperId={selectedPaperId} isOpen={isViewerOpen} onClose={() => setIsViewerOpen(false)} role="Exam Controller" />
      <HashIntegrityModal paper={hashPaper} isOpen={!!hashPaper} onClose={() => setHashPaper(null)} />

      {/* Download Permit Request Modal */}
      {requestTargetPaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-cyber-card border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-purple-400" /> Request Download Approval
            </h3>
            <p className="text-xs text-slate-400">
              Submit an official download permit request for <strong className="text-cyan-400">{requestTargetPaper.paperId} ({requestTargetPaper.subject})</strong>. Request will be routed to Principal.
            </p>
            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Justification Reason for Download</label>
                <textarea
                  rows="3"
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  placeholder="State official examination cell justification (e.g. Printing required for May 18 exam hall distribution)..."
                  required
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-purple-500"
                ></textarea>
              </div>
              <div className="flex space-x-2 pt-2">
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold">
                  Submit Request to Principal
                </button>
                <button type="button" onClick={() => setRequestTargetPaper(null)} className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
