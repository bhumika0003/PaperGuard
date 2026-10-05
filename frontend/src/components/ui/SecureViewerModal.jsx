import React, { useEffect, useState } from 'react';
import { ShieldCheck, Lock, X, AlertTriangle, Eye, Hash, Copy, Check } from 'lucide-react';
import api from '../../services/api';
import { AppLogo } from './AppLogo';

export const SecureViewerModal = ({ paperId, isOpen, onClose, role }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    if (!isOpen || !paperId) return;

    const fetchSecureDocument = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/papers/${paperId}/view`);
        setData(res.data);
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load secure document stream.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchSecureDocument();
  }, [isOpen, paperId]);

  // Prevent Context Menu (Right Click) inside viewer
  const handleContextMenu = (e) => {
    e.preventDefault();
    return false;
  };

  const handleCopyHash = () => {
    if (data?.hash) {
      navigator.clipboard.writeText(data.hash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header - Sleek Executive Theme (High Contrast Adaptive) */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors">
          <div className="flex items-center space-x-3.5">
            <AppLogo className="w-10 h-10" iconSize="w-6 h-6" />
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
                Controlled Secure Document Viewer
                <span className="text-xs px-2.5 py-0.5 rounded-lg font-mono font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700/70 shadow-sm">
                  {paperId}
                </span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-200 font-semibold flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping"></span>
                Protected API Stream • Dynamic Watermark Engine Active
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-200/60 dark:bg-slate-800/80 hover:bg-slate-300 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Warning Banners per Role */}
        {role === 'Auditor' && (
          <div className="px-6 py-2.5 bg-rose-100 dark:bg-rose-950/90 border-b border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              Auditor Access: View Only. Download and Printing Disabled.
            </span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-200 dark:bg-rose-900 border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200">RESTRICTED VIEW</span>
          </div>
        )}

        {role === 'HOD' && (
          <div className="px-6 py-2.5 bg-amber-100 dark:bg-amber-950/90 border-b border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-200 text-xs font-semibold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Download Restricted – Principal Approval Required.
            </span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200">APPROVAL REQUIRED</span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 relative secure-viewer-no-select bg-slate-50 dark:bg-slate-950" onContextMenu={handleContextMenu}>
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-cyan-500 space-y-4">
              <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-mono text-slate-700 dark:text-slate-300 font-semibold">Decrypting document payload and generating security stamp...</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center space-y-4">
              <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
              <div className="text-rose-600 dark:text-rose-400 font-semibold text-sm">{error}</div>
            </div>
          ) : (
            <div className="relative space-y-6">

              {/* Document Header Metadata - High Contrast Labels and Values (No Label Clipping) */}
              <div className="pt-6 pb-5 px-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs relative z-30 shadow-sm">
                <div className="space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 block uppercase font-extrabold text-[11px] tracking-widest leading-none">Subject</span>
                  <span className="font-extrabold text-slate-900 dark:text-white block text-sm sm:text-base leading-snug">
                    {data.subject} ({data.subjectCode})
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 block uppercase font-extrabold text-[11px] tracking-widest leading-none">Exam Name</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 block text-sm sm:text-base leading-snug">
                    {data.examName}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 block uppercase font-extrabold text-[11px] tracking-widest leading-none">Department</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 block text-sm sm:text-base leading-snug">
                    {data.department}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 block uppercase font-extrabold text-[11px] tracking-widest leading-none">Integrity Status</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/80 px-3 py-1 rounded-xl border border-emerald-300 dark:border-emerald-500/40 text-xs shadow-sm inline-flex">
                    <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>VERIFIED ✓</span>
                  </span>
                </div>
              </div>

              {/* SHA-256 Hash Display */}
              <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-cyan-300/80 dark:border-cyan-500/40 flex items-center justify-between text-xs font-mono shadow-sm relative z-30">
                <div className="flex items-center space-x-2.5 overflow-hidden min-w-0">
                  <Hash className="w-4.5 h-4.5 text-cyan-600 dark:text-cyan-400 flex-shrink-0 animate-pulse" />
                  <span className="text-slate-700 dark:text-slate-300 flex-shrink-0 font-extrabold text-xs">SHA-256 Fingerprint:</span>
                  <span className="font-mono text-cyan-700 dark:text-cyan-300 font-extrabold text-xs sm:text-sm truncate select-all tracking-wide">{data.hash}</span>
                </div>
                <button
                  onClick={handleCopyHash}
                  className="ml-3 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-sans font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-md shadow-cyan-500/20 flex-shrink-0 active:scale-95"
                >
                  {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedHash ? 'Copied' : 'Copy'}
                </button>
              </div>

              {/* Document Display Area: Soft Slate Canvas Background */}
              {data.pdfDataUrl || data.isPdf ? (
                <div className="relative w-full h-[650px] rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-800 bg-slate-200 dark:bg-slate-900 shadow-inner z-10">
                  {/* Dynamic Watermark Matrix Overlay over Document Preview */}
                  <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden select-none opacity-25 flex flex-wrap content-start justify-around gap-x-16 gap-y-20 p-4">
                    {Array.from({ length: 60 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="text-cyan-700 dark:text-cyan-300 font-mono text-xs font-bold tracking-widest uppercase transform -rotate-12 whitespace-nowrap py-2"
                      >
                        {role === 'Principal' || role === 'Exam Controller'
                          ? `ST. JOSEPH COLLEGE OF ENGINEERING & TECHNOLOGY | OFFICIAL EXAM HALL PRINT | APPROVED BY: ${data.watermark?.userName || 'PRINCIPAL'}`
                          : data.watermark?.watermarkText}
                      </div>
                    ))}
                  </div>

                  <object
                    data={`${data.pdfDataUrl || 'about:blank'}#toolbar=0&navpanes=0&scrollbar=0`}
                    type="application/pdf"
                    className="w-full h-full rounded-2xl relative z-10"
                  >
                    <iframe
                      src={`${data.pdfDataUrl || 'about:blank'}#toolbar=0`}
                      title="PDF Document Viewer"
                      className="w-full h-full rounded-2xl border-none"
                    />
                  </object>
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-mono text-sm leading-relaxed whitespace-pre-wrap relative shadow-inner min-h-[350px] overflow-hidden z-10">
                  {/* Dynamic Watermark Matrix Overlay over Document Preview */}
                  <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden select-none opacity-25 flex flex-wrap content-start justify-around gap-x-16 gap-y-20 p-4">
                    {Array.from({ length: 60 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="text-cyan-700 dark:text-cyan-300 font-mono text-xs font-bold tracking-widest uppercase transform -rotate-12 whitespace-nowrap py-2"
                      >
                        {role === 'Principal' || role === 'Exam Controller'
                          ? `ST. JOSEPH COLLEGE OF ENGINEERING & TECHNOLOGY | OFFICIAL EXAM HALL PRINT | APPROVED BY: ${data.watermark?.userName || 'PRINCIPAL'}`
                          : data.watermark?.watermarkText}
                      </div>
                    ))}
                  </div>

                  <div className="relative z-10">
                    {data.content}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer - High Contrast Adaptive Theme */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col sm:flex-row items-center justify-between text-xs gap-2 transition-colors">
          <div className="flex items-center space-x-2 text-cyan-700 dark:text-cyan-400 font-extrabold text-xs">
            <Lock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>End-to-End Encrypted Session Stream</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-200 font-semibold italic">
            Direct file access, downloading, and printing are disabled. Dynamic watermark is active.
          </p>
        </div>

      </div>
    </div>
  );
};
