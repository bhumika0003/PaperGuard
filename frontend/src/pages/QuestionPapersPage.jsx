import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SecureViewerModal } from '../components/ui/SecureViewerModal';
import { HashIntegrityModal } from '../components/ui/HashIntegrityModal';
import { Search, Filter, Eye, Hash, ShieldCheck, FileText, Download } from 'lucide-react';
import api from '../services/api';

export const QuestionPapersPage = () => {
  const { user } = useAuth();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [selectedPaperId, setSelectedPaperId] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [hashPaper, setHashPaper] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchPapers = async () => {
      setLoading(true);
      try {
        const res = await api.get('/papers');
        setPapers(res.data.papers || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPapers();
  }, []);

  const handleDirectDownload = async (paper) => {
    setDownloading(true);
    try {
      const res = await api.get(`/papers/${paper.paperId}/download`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${paper.subjectCode}_Official_Paper.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.response?.data?.message || 'Download authorization failed. Ensure Principal approval.');
    } finally {
      setDownloading(false);
    }
  };

  const filtered = papers.filter(p => {
    const matchesSearch = p.subject.toLowerCase().includes(search.toLowerCase()) ||
                          p.paperId.toLowerCase().includes(search.toLowerCase()) ||
                          p.subjectCode.toLowerCase().includes(search.toLowerCase());
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
              <span className="text-xs font-mono font-extrabold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider">
                Question Papers Vault
              </span>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                <FileText className="w-6 h-6 text-cyan-600 dark:text-cyan-400" /> Question Papers Registry
              </h1>
              <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-1 font-medium">
                Digitally fingerprinted examination question paper master list. Filter by department to view specific subject papers.
              </p>
            </div>
          </div>

          {/* Search & Department Selector Controls */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#151B2E] border border-slate-200 dark:border-[#33435C] shadow-lg flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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

          {/* Table Container Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#151B2E] border border-slate-200 dark:border-[#33435C] shadow-lg space-y-4">
            
            {/* DYNAMIC DEPARTMENT TITLE HEADING */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-[#33435C] pb-3">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                <span className="text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/80 px-3 py-1 rounded-xl border border-cyan-200 dark:border-cyan-800">
                  {deptFilter === 'All' ? 'All Departments' : deptFilter}
                </span>
                <span>Examination Question Papers Master List</span>
              </h3>
              <span className="text-xs font-mono font-bold text-slate-400">
                {filtered.length} Papers Found
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-[#33435C]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 dark:bg-[#182232] border-b border-slate-200 dark:border-[#33435C] text-slate-700 dark:text-slate-300 font-black uppercase text-[11px] tracking-wider">
                    <th className="py-3.5 px-4">PAPER ID</th>
                    <th className="py-3.5 px-4">SUBJECT</th>
                    <th className="py-3.5 px-4">DEPARTMENT</th>
                    <th className="py-3.5 px-4">SHA-256 HASH</th>
                    <th className="py-3.5 px-4">STATUS</th>
                    <th className="py-3.5 px-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#33435C]/60 bg-white dark:bg-[#151B2E]">
                  {filtered.map((p) => (
                    <tr key={p.paperId} className="hover:bg-slate-50 dark:hover:bg-[#182232]/60 transition">
                      <td className="py-4 px-4 font-mono font-extrabold text-cyan-700 dark:text-cyan-400 whitespace-nowrap">{p.paperId}</td>
                      <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">{p.subject} ({p.subjectCode})</td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                          {p.department}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono text-[11px] text-cyan-700 dark:text-cyan-300 max-w-[160px] truncate font-semibold">{p.hash}</td>
                      <td className="py-4 px-4"><StatusBadge status={p.status} /></td>
                      <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => { setSelectedPaperId(p.paperId); setIsViewerOpen(true); }}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> Secure View
                        </button>
                        {(user?.role === 'Principal' || user?.role === 'Exam Controller') && (
                          <button
                            onClick={() => handleDirectDownload(p)}
                            disabled={downloading}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold transition inline-flex items-center gap-1 shadow disabled:opacity-50 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" /> Download Paper
                          </button>
                        )}
                        <button
                          onClick={() => setHashPaper(p)}
                          className="px-3 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30 font-mono text-[11px] font-bold transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Hash className="w-3.5 h-3.5" /> Hash
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

      <SecureViewerModal paperId={selectedPaperId} isOpen={isViewerOpen} onClose={() => setIsViewerOpen(false)} role={user?.role} />
      <HashIntegrityModal paper={hashPaper} isOpen={!!hashPaper} onClose={() => setHashPaper(null)} />

    </div>
  );
};
