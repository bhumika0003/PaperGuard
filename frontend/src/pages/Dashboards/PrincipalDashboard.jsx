import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SecureViewerModal } from '../../components/ui/SecureViewerModal';
import { HashIntegrityModal } from '../../components/ui/HashIntegrityModal';
import { StatCard } from '../../components/ui/StatCard';
import { ShieldCheck, Eye, Download, CheckCircle, XCircle, Clock, FileCheck, Hash, ShieldAlert } from 'lucide-react';
import api from '../../services/api';

export const PrincipalDashboard = () => {
  const { user } = useAuth();
  const [papers, setPapers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedPaperId, setSelectedPaperId] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [hashPaper, setHashPaper] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingRequestId, setRejectingRequestId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [papersRes, reqRes] = await Promise.all([
        api.get('/papers'),
        api.get('/requests')
      ]);
      setPapers(papersRes.data.papers);
      setRequests(reqRes.data.requests);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (requestId) => {
    try {
      await api.patch(`/requests/${requestId}/approve`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await api.patch(`/requests/${requestId}/reject`, { rejectionReason });
      setRejectingRequestId(null);
      setRejectionReason('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Rejection failed');
    }
  };

  const handleDownload = async (paperId) => {
    try {
      const res = await api.get(`/papers/${paperId}/download`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${paperId}_Official_Paper.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Download failed. Access restricted.');
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'Pending');

  return (
    <div className="min-h-screen bg-cyber-dark text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 space-y-8 overflow-y-auto">
          
          {/* Header Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/60 to-slate-900 border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-purple-400 font-bold uppercase tracking-wider">Executive Authorization Dashboard</span>
              <h1 className="text-2xl font-extrabold text-white mt-1">Principal Download Approval & Oversight</h1>
              <p className="text-xs text-slate-400 mt-1">Review download permit requests, verify device context, grant release approvals, and monitor audit trails.</p>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-purple-950 border border-purple-500/40 text-xs text-purple-300 font-bold flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Highest Release Clearance Active</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <StatCard title="Total Exam Papers" value={papers.length} icon={ShieldCheck} color="purple" />
            <StatCard title="Pending Release Requests" value={pendingRequests.length} icon={Clock} color="amber" />
            <StatCard title="Approved Downloads" value={requests.filter(r => r.status === 'Approved').length} icon={CheckCircle} color="emerald" />
            <StatCard title="Rejected Requests" value={requests.filter(r => r.status === 'Rejected').length} icon={XCircle} color="rose" />
          </div>

          {/* Pending Download Approval Requests Section */}
          <div className="p-6 rounded-2xl bg-cyber-card border border-purple-500/30 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Download Approval Requests</h3>
                  <p className="text-xs text-slate-400">Requires explicit Principal review and authorization prior to file release.</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold">
                {pendingRequests.length} Pending
              </span>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No pending download approval requests at this time.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {pendingRequests.map((req) => (
                  <div key={req.requestId} className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div>
                        <span className="text-xs font-mono font-bold text-purple-400">{req.requestId}</span>
                        <h4 className="text-sm font-bold text-white mt-0.5">{req.paperTitle}</h4>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40 text-xs font-medium self-start">
                        Pending Authorization
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 block uppercase font-semibold text-[10px]">Requested By</span>
                        <span className="font-bold text-slate-200">{req.requestedByName} ({req.requestedBy})</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block uppercase font-semibold text-[10px]">Role / Department</span>
                        <span className="font-bold text-slate-300">{req.role} ({req.department})</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block uppercase font-semibold text-[10px]">Request Timestamp</span>
                        <span className="text-slate-300 font-mono">{req.requestedDate} {req.requestedTime}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block uppercase font-semibold text-[10px]">Device & Session IP</span>
                        <span className="text-cyan-300 font-mono text-[11px] truncate block">{req.deviceInfo} ({req.ipAddress})</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                      <span className="text-slate-500 font-semibold uppercase text-[10px] block">Justification Reason:</span>
                      <p className="text-slate-300 italic">{req.reason}</p>
                    </div>

                    {rejectingRequestId === req.requestId ? (
                      <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 space-y-3">
                        <textarea
                          rows="2"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Provide security rejection reason..."
                          className="w-full p-2.5 rounded-lg bg-slate-900 text-xs text-white outline-none"
                        ></textarea>
                        <div className="flex space-x-2">
                          <button onClick={() => handleReject(req.requestId)} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs">
                            Confirm Rejection
                          </button>
                          <button onClick={() => setRejectingRequestId(null)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3 pt-2">
                        <button
                          onClick={() => handleApprove(req.requestId)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center space-x-1.5"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve Download</span>
                        </button>
                        <button
                          onClick={() => setRejectingRequestId(req.requestId)}
                          className="px-4 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center space-x-1.5"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject Request</span>
                        </button>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            )}

          </div>

          {/* All Question Papers Master Registry */}
          <div className="p-6 rounded-2xl bg-cyber-card border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Question Paper Master Registry</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Paper ID</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Uploaded By</th>
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
                      <td className="py-3.5 px-4 text-slate-300">{p.uploadedByName}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-cyan-300 max-w-[150px] truncate">{p.hash}</td>
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
                          onClick={() => handleDownload(p.paperId)}
                          className="px-2.5 py-1.5 rounded-lg bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-500/40 font-bold transition inline-flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" /> Release & Download
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

      <SecureViewerModal paperId={selectedPaperId} isOpen={isViewerOpen} onClose={() => setIsViewerOpen(false)} role="Principal" />
      <HashIntegrityModal paper={hashPaper} isOpen={!!hashPaper} onClose={() => setHashPaper(null)} />
    </div>
  );
};
