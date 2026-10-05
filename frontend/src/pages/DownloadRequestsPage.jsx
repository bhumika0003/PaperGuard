import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { 
  FileCheck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  User, 
  UserCheck, 
  Building, 
  Calendar, 
  Laptop, 
  PlusCircle,
  Filter
} from 'lucide-react';
import api from '../services/api';

export const DownloadRequestsPage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [creatingTest, setCreatingTest] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/requests');
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error('Error fetching download requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (requestId) => {
    try {
      await api.patch(`/requests/${requestId}/approve`);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await api.patch(`/requests/${requestId}/reject`, { rejectionReason: 'Security policy restriction' });
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Rejection failed');
    }
  };

  const handleCreateTestRequest = async () => {
    setCreatingTest(true);
    try {
      // Fetch available papers first
      const papersRes = await api.get('/papers');
      const papers = papersRes.data.papers || [];
      const paperId = papers.length > 0 ? papers[0].paperId : 'PAP-2026-CS101';

      await api.post('/requests', {
        paperId,
        reason: 'Authorized exam hall download request for upcoming semester exam.'
      });
      fetchRequests();
    } catch (err) {
      console.error('Error creating test request:', err);
    } finally {
      setCreatingTest(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filterStatus === 'PENDING') return req.status === 'Pending';
    if (filterStatus === 'APPROVED') return req.status === 'Approved';
    if (filterStatus === 'REJECTED') return req.status === 'Rejected';
    return true;
  });

  return (
    <div className="min-h-screen bg-cyber-dark text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-300">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          
          {/* Top Banner Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#151B2E] border border-slate-200 dark:border-[#33435C] shadow-lg">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                <FileCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <span>Download Approval Workflow Tracking</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-[#CBD5E1] font-medium">
                Track who requested question paper access, which teacher owns the paper, and authorization clearance statuses.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCreateTestRequest}
                disabled={creatingTest}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{creatingTest ? 'Creating...' : '+ Create Test Request'}</span>
              </button>

              <span className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] text-xs font-mono font-bold text-cyan-700 dark:text-cyan-400">
                {requests.length} Total Requests
              </span>
            </div>
          </div>

          {/* Filter Status Tabs */}
          <div className="flex items-center space-x-2 text-xs font-bold overflow-x-auto pb-1">
            <span className="text-slate-400 flex items-center gap-1 pr-2">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-4 py-2 rounded-xl transition cursor-pointer font-extrabold ${
                  filterStatus === st
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'bg-white dark:bg-[#151B2E] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#33435C] hover:border-cyan-400'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Loading Indicator */}
          {loading ? (
            <div className="p-12 text-center text-slate-400 animate-pulse font-medium text-sm">
              Loading security download approval requests...
            </div>
          ) : filteredRequests.length === 0 ? (
            /* Empty State */
            <div className="p-12 rounded-3xl bg-white dark:bg-[#151B2E] border border-slate-200 dark:border-[#33435C] text-center space-y-4 shadow-lg">
              <FileCheck className="w-12 h-12 text-slate-400 mx-auto opacity-60" />
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  No Download Requests Found ({filterStatus})
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#CBD5E1] max-w-sm mx-auto">
                  When faculty or staff request access to download confidential papers, the requester and target teacher details will be tracked here.
                </p>
              </div>
              <button
                onClick={handleCreateTestRequest}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold inline-flex items-center gap-2 shadow-md cursor-pointer transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Sample Request</span>
              </button>
            </div>
          ) : (
            /* Requests List Cards */
            <div className="grid grid-cols-1 gap-5">
              {filteredRequests.map((req) => (
                <div
                  key={req.requestId}
                  className="p-5 rounded-3xl bg-white dark:bg-[#151B2E] border border-slate-200 dark:border-[#33435C] space-y-4 shadow-lg hover:border-cyan-500/50 transition-all duration-200"
                >
                  
                  {/* Top Bar: Request ID, Paper Title & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-[#33435C] pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-lg border border-purple-200 dark:border-purple-800">
                          {req.requestId}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 font-semibold">
                          Paper ID: {req.paperId}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                        {req.paperTitle}
                      </h3>
                    </div>

                    <span
                      className={`px-3.5 py-1 rounded-full text-xs font-black self-start sm:self-auto shadow-sm ${
                        req.status === 'Approved'
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/50'
                          : req.status === 'Rejected'
                          ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/50'
                          : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/50 animate-pulse'
                      }`}
                    >
                      {req.status === 'Pending' ? '● PENDING APPROVAL' : req.status === 'Approved' ? '✓ DOWNLOAD APPROVED' : '✕ ACCESS REJECTED'}
                    </span>
                  </div>

                  {/* PROMINENT REQUEST FLOW BANNER: Who sent request -> To which teacher */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 via-cyan-50 to-blue-50 dark:from-[#182232] dark:via-[#1c273a] dark:to-[#182232] border border-cyan-200/80 dark:border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-3 shadow-inner">
                    
                    {/* Left: Who Sent Download Request */}
                    <div className="flex items-center space-x-3 w-full md:w-auto">
                      <div className="w-10 h-10 rounded-2xl bg-cyan-100 dark:bg-cyan-950 border border-cyan-300 dark:border-cyan-500/40 flex items-center justify-center text-cyan-700 dark:text-cyan-300 font-black text-sm flex-shrink-0 shadow-sm">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                          WHO SENT REQUEST (REQUESTER):
                        </span>
                        <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{req.requestedByName}</span>
                          <span className="text-xs px-2 py-0.2 rounded-md font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                            {req.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Arrow Divider Icon */}
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-400/40 text-cyan-600 dark:text-cyan-400 my-1 md:my-0 flex-shrink-0">
                      <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </div>

                    {/* Right: To Which Teacher (Paper Author) */}
                    <div className="flex items-center space-x-3 w-full md:w-auto">
                      <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950 border border-purple-300 dark:border-purple-500/40 flex items-center justify-center text-purple-700 dark:text-purple-300 font-black text-sm flex-shrink-0 shadow-sm">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                          TO WHICH TEACHER (PAPER AUTHOR):
                        </span>
                        <div className="text-sm font-extrabold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                          <span>{req.targetTeacherName || 'Prof. Alan Turing'}</span>
                          <span className="text-[10px] px-2 py-0.2 rounded-md font-mono font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                            Faculty Teacher
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Metadata Attribute Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-700 dark:text-slate-200 pt-1">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] space-y-0.5">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Department</span>
                      <span className="font-bold flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-cyan-500" />
                        {req.department || 'Computer Science'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] space-y-0.5">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Requested Timestamp</span>
                      <span className="font-mono font-bold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-cyan-500" />
                        {req.requestedDate} {req.requestedTime}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] space-y-0.5">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Requester User ID</span>
                      <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                        {req.requestedBy}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] space-y-0.5">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Device IP</span>
                      <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                        <Laptop className="w-3.5 h-3.5 text-cyan-500" />
                        {req.ipAddress || '192.168.1.45'}
                      </span>
                    </div>
                  </div>

                  {/* Justification Reason Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] text-xs space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      JUSTIFICATION REASON SUBMITTED:
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 italic font-medium leading-relaxed">
                      "{req.reason}"
                    </p>
                  </div>

                  {/* Principal Approval Actions */}
                  {user?.role === 'Principal' && req.status === 'Pending' && (
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => handleApprove(req.requestId)}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve Download Clearance</span>
                      </button>
                      <button
                        onClick={() => handleReject(req.requestId)}
                        className="py-2.5 px-4 rounded-xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition"
                      >
                        <XCircle className="w-4 h-4 text-rose-500" />
                        <span>Reject Request</span>
                      </button>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

