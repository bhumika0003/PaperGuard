import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { ShieldCheck, Lock, Hash, Eye, Activity, FileCheck, Download, History, AlertTriangle, Key } from 'lucide-react';

export const SecurityInfoPage = () => {
  const steps = [
    { name: 'CREATE', desc: 'Teacher creates/uploads examination paper metadata and file.', icon: Lock },
    { name: 'FINGERPRINT', desc: 'System automatically generates unique SHA-256 cryptographic hash.', icon: Hash },
    { name: 'PROTECT', desc: 'Original paper encrypted & stored. Direct static URL exposure disabled.', icon: ShieldCheck },
    { name: 'CONTROL', desc: 'Only authorized roles can access inside controlled watermarked viewer.', icon: Eye },
    { name: 'MONITOR', desc: 'Every access event recorded; anomaly detector flags suspicious activity.', icon: Activity },
    { name: 'APPROVE', desc: 'Principal reviews download justification, device context, and approves.', icon: FileCheck },
    { name: 'DOWNLOAD', desc: 'Only approved permits allow paper download; release event logged.', icon: Download },
    { name: 'AUDIT', desc: 'Auditor/Security Team inspects complete immutable system history.', icon: History }
  ];

  return (
    <div className="min-h-screen bg-cyber-dark text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 space-y-8 overflow-y-auto">
          
          {/* Header Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-100 to-slate-100 border border-sky-300 space-y-2 shadow-sm">
            <span className="text-xs font-mono text-sky-700 font-bold uppercase tracking-wider">Security System Specification</span>
            <h1 className="text-2xl font-extrabold text-slate-900">Security Architecture & Leak Prevention Protocol</h1>
            <p className="text-xs text-slate-600 font-medium">Comprehensive breakdown of security controls, cryptographic SHA-256 digital fingerprinting, dynamic watermarking, and principal approval workflows.</p>
          </div>

          {/* Important Security Statement Card */}
          <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 space-y-3 shadow-sm">
            <div className="flex items-center space-x-2 text-rose-700 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600" />
              <span>Mandatory Security Disclaimer & System Capability Scope</span>
            </div>
            <blockquote className="text-xs sm:text-sm text-rose-950 italic leading-relaxed p-4 rounded-xl bg-white border border-rose-300 font-semibold shadow-inner">
              “The system prevents downloading, printing, and unauthorized file access through role-based permissions, secure document viewing, watermarking, and monitoring. However, no web application can completely prevent someone from photographing a screen using another physical device.”
            </blockquote>
          </div>

          {/* Final Security Workflow Timeline */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Key className="w-5 h-5 text-cyan-600" /> End-to-End Security Workflow Lifecycle
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 relative shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-cyan-700 bg-cyan-100 px-2 py-0.5 rounded border border-cyan-300">
                        {step.name}
                      </span>
                      <Icon className="w-4 h-4 text-cyan-600" />
                    </div>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};
