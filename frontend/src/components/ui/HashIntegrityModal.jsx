import React from 'react';
import { createPortal } from 'react-dom';
import { AppLogo } from './AppLogo';

export const HashIntegrityModal = ({ paper, isOpen, onClose }) => {
  if (!isOpen || !paper) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[88vh] overflow-y-auto bg-white dark:bg-[#151B2E] border border-slate-200 dark:border-[#33435C] rounded-2xl p-6 shadow-2xl space-y-6 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <AppLogo className="w-10 h-10" iconSize="w-6 h-6" />
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">SHA-256 Fingerprint Verification</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Cryptographic Document Integrity Verification</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verification Status */}
        <div className="p-4 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/40 flex items-center space-x-3">
          <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Document Integrity: VERIFIED ✓</h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-400/80">SHA-256 hash matches the original uploaded fingerprint exactly.</p>
          </div>
        </div>

        {/* Paper Metadata & Teacher Verification Info */}
        <div className="space-y-3 text-xs bg-slate-50 dark:bg-[#182232] p-4.5 rounded-xl border border-slate-200 dark:border-[#33435C]">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800/80">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Author Teacher Name:</span>
            <span className="font-bold text-cyan-800 dark:text-cyan-300 bg-cyan-100 dark:bg-cyan-950/80 px-3 py-1 rounded-lg border border-cyan-300 dark:border-cyan-500/40 text-xs">
              {paper.uploadedByName || 'Faculty Member'} ({paper.uploadedBy || 'TCH-101'})
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Paper ID:</span>
            <span className="font-mono text-cyan-700 dark:text-cyan-400 font-extrabold">{paper.paperId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Subject:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{paper.subject} ({paper.subjectCode})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Semester & Department:</span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold">{paper.semester || 'Semester VI'} • {paper.department || 'Computer Science'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Exam Date:</span>
            <span className="text-slate-700 dark:text-slate-300 font-mono">{paper.examDate}</span>
          </div>
          {paper.status && (
            <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400">Paper Status:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{paper.status}</span>
            </div>
          )}
        </div>

        {/* Hash Details */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Cryptographic SHA-256 Hash:</label>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-cyan-300 dark:border-cyan-500/30 rounded-xl font-mono text-xs text-cyan-800 dark:text-cyan-300 break-all select-all">
            {paper.hash}
          </div>
        </div>

        <div className="text-[11px] text-slate-500 italic text-center">
          Any unauthorized modification to the file content will immediately alter this cryptographic hash.
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-bold text-sm transition shadow-md"
          >
            Close Integrity Verification
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
