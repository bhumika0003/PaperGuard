import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Lock,
  Hash,
  Eye,
  Activity,
  CheckCircle,
  FileBadge,
  History,
  ArrowRight,
  ShieldAlert,
  Key,
  Sparkles,
  Users,
  FileCheck,
  Zap,
  Globe,
  Award
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { LiveHashCalculator } from '../components/ui/LiveHashCalculator';
import { AppLogo } from '../components/ui/AppLogo';
import teacherPrincipalImg from '../assets/teacher_principal_paper_hub.jpg';
import securePaperImg from '../assets/secure_paper_watermark.jpg';
import secureVaultImg from '../assets/secure_document_vault.jpg';

export const LandingPage = () => {
  const { user } = useAuth();
  const features = [
    { icon: Lock, title: 'Role-Based Access Control', desc: 'Granular clearance permissions tailored for Teachers, HODs, Principals, Controllers, and Security Auditors.' },
    { icon: ShieldCheck, title: 'Encrypted Document Vault', desc: 'Original examination paper files encrypted with restricted direct path access and zero static exposure.' },
    { icon: Hash, title: 'SHA-256 Digital Fingerprint', desc: 'Automatic SHA-256 cryptographic fingerprinting generated upon upload to guarantee document integrity.' },
    { icon: Eye, title: 'Controlled Web Stream Viewer', desc: 'Secure web viewer rendering real-time document stream with context menu, print, and download barriers.' },
    { icon: Activity, title: 'Real-Time Intrusion Detection', desc: 'Proactive security alert monitoring engine flagging suspicious viewing patterns and access anomalies.' },
    { icon: CheckCircle, title: 'Principal Approval Gateway', desc: 'Multi-tiered authorization workflow requiring explicit justification review and Principal clearance.' },
    { icon: FileBadge, title: 'Dynamic Session Watermarking', desc: 'Live diagonal watermark stamp embedding User ID, Role, Timestamp, and Session IP dynamically.' },
    { icon: History, title: 'Immutable Audit Trail', desc: 'Complete activity audit log recording every view, download request, approval, and login event.' }
  ];

  const workflowSteps = [
    { num: '01', title: 'Faculty Paper Upload', desc: 'Teacher creates subject metadata and uploads confidential question paper draft.' },
    { num: '02', title: 'Cryptographic Hash Generation', desc: 'System instantly computes unique SHA-256 digital fingerprint.' },
    { num: '03', title: 'Encrypted Vault Storage', desc: 'File is encrypted and stored in secure vault without public URL exposure.' },
    { num: '04', title: 'Watermarked Web Inspection', desc: 'HODs & Auditors inspect question paper inside secure watermarked web viewer.' },
    { num: '05', title: 'Real-Time Audit Monitoring', desc: 'Intrusion engine logs every view session and detects unauthorized actions.' },
    { num: '06', title: 'Principal Review & Clearance', desc: 'Principal reviews download justification, device context, and approves permit.' },
    { num: '07', title: 'Authorized Secure Release', desc: 'Approved permits enable controlled exam hall print stream with full audit trail.' }
  ];

  return (
    <div className="min-h-screen bg-cyber-dark text-slate-800 dark:text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white transition-colors duration-300">
      <Navbar />

      {/* Hero Section with Ambient Glows */}
      <section className="relative pt-10 pb-20 overflow-hidden border-b border-slate-200 dark:border-[#33435C]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-cyan-500/10 dark:bg-cyan-500/15 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-20 right-10 w-80 h-80 bg-blue-500/10 dark:bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headline, CTAs & Metrics */}
            <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-cyan-50 dark:bg-[#151B2E] border border-cyan-300 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-300 text-xs font-bold shadow-sm">
                <ShieldAlert className="w-4 h-4 text-cyan-600 dark:text-cyan-400 animate-pulse" />
                <span>Next-Gen Examination Paper Leak Prevention System</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                Secure Every Question Paper.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-400 dark:via-teal-300 dark:to-emerald-400">
                  Prevent Every Leak.
                </span>
              </h1>

              <p className="text-slate-600 dark:text-[#CBD5E1] text-base sm:text-lg font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
                An end-to-end secure examination management platform engineered with multi-tiered role access, SHA-256 digital fingerprinting, dynamic session watermarking, and real-time audit monitoring.
              </p>

              {/* Primary Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to={user ? "/dashboard" : "/login"}
                  className="group w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 flex items-center justify-center space-x-3 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                >
                  <span>{user ? "Go to Dashboard" : "Access Secure Portal"}</span>
                  <ArrowRight className="w-4.5 h-4.5 text-white group-hover:translate-x-2 transition-transform duration-300 ease-out" />
                </Link>
                
                <Link
                  to="/security-info"
                  className="group w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-[#151B2E] border border-slate-300 dark:border-[#33435C] hover:border-cyan-500/50 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center space-x-2.5 transition-all duration-300 hover:bg-slate-50 dark:hover:bg-[#182232] shadow-md active:scale-95"
                >
                  <Key className="w-4 h-4 text-cyan-600 dark:text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
                  <span>Explore Security Architecture</span>
                </Link>
              </div>

              {/* Interactive Key Feature Badges */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#151B2E] border border-slate-200 dark:border-[#33435C] flex items-center justify-center space-x-2 font-bold shadow-sm text-slate-700 dark:text-[#CBD5E1]">
                  <Lock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>100% Encrypted</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#151B2E] border border-slate-200 dark:border-[#33435C] flex items-center justify-center space-x-2 font-bold shadow-sm text-slate-700 dark:text-[#CBD5E1]">
                  <Hash className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>SHA-256 Hash</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#151B2E] border border-slate-200 dark:border-[#33435C] flex items-center justify-center space-x-2 font-bold shadow-sm text-slate-700 dark:text-[#CBD5E1]">
                  <FileCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Principal Approval</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#151B2E] border border-slate-200 dark:border-[#33435C] flex items-center justify-center space-x-2 font-bold shadow-sm text-slate-700 dark:text-[#CBD5E1]">
                  <History className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Audit Trail</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Card */}
            <div className="lg:col-span-5 relative group">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 rounded-3xl blur-lg opacity-30 group-hover:opacity-60 transition duration-500"></div>
              <div className="relative rounded-3xl bg-white dark:bg-[#151B2E] border border-slate-200 dark:border-[#33435C] p-3 shadow-2xl">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                  <img 
                    src={teacherPrincipalImg} 
                    alt="Teacher & Principal Examination Paper Hub" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>
                  
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-3.5 py-1.5 rounded-full bg-slate-950/90 backdrop-blur-md border border-cyan-500/40 text-cyan-300 text-[11px] font-bold flex items-center gap-2 shadow-lg">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                      Faculty & Principal Portal
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-semibold">
                      VERIFIED ACCESS
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 p-3.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">Exam Paper Security Status:</span>
                      <span className="text-cyan-400 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4 text-cyan-400" /> Encrypted & Stamped
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>ROLE: TEACHER / PRINCIPAL / HOD</span>
                      <span className="text-emerald-400">ACTIVE MATRIX</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive SHA-256 Live Simulator Widget */}
      <section className="py-14 bg-slate-50 dark:bg-[#182232] border-b border-slate-200 dark:border-[#33435C]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <LiveHashCalculator />
        </div>
      </section>

      {/* Digital Secure Paper Visual Showcase Section */}
      <section className="py-16 bg-cyber-dark border-b border-slate-200 dark:border-[#33435C] relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-50 dark:bg-[#151B2E] border border-cyan-300 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-300 text-xs font-bold shadow-sm">
              <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Multi-Layer Examination Security Architecture</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Digital Question Paper Protection Lifecycle
            </h2>
            <p className="text-slate-600 dark:text-[#CBD5E1] text-sm max-w-2xl mx-auto font-medium">
              Designed specifically for Teachers, Principals, HODs, and Controllers to securely create, review, watermark, and authorize examination documents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Photo 1: Faculty Hub */}
            <div className="group relative rounded-3xl bg-white dark:bg-[#151B2E] border border-slate-200 dark:border-[#33435C] hover:border-cyan-500/50 transition-all duration-300 overflow-hidden shadow-xl flex flex-col justify-between">
              <div className="relative overflow-hidden aspect-video">
                <img 
                  src={teacherPrincipalImg} 
                  alt="Teacher & Principal Workstation" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-full bg-cyan-950/90 backdrop-blur-md border border-cyan-400/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5 shadow-lg">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    Faculty Portal
                  </span>
                </div>
              </div>
              <div className="p-6 space-y-2 relative z-10">
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition">
                  Academic Exam Hub
                </h3>
                <p className="text-xs text-slate-600 dark:text-[#CBD5E1] leading-relaxed font-normal">
                  Dedicated portal for faculty and administrators to upload question paper drafts, track approval status, and manage release timelines.
                </p>
              </div>
            </div>

            {/* Photo 2: Cryptographic Stamp */}
            <div className="group relative rounded-3xl bg-white dark:bg-[#151B2E] border border-slate-200 dark:border-[#33435C] hover:border-cyan-500/50 transition-all duration-300 overflow-hidden shadow-xl flex flex-col justify-between">
              <div className="relative overflow-hidden aspect-video">
                <img 
                  src={securePaperImg} 
                  alt="Cryptographic Watermark" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-full bg-cyan-950/90 backdrop-blur-md border border-cyan-400/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5 shadow-lg">
                    <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
                    Dynamic Watermark
                  </span>
                </div>
              </div>
              <div className="p-6 space-y-2 relative z-10">
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition">
                  SHA-256 Cryptographic Stamp
                </h3>
                <p className="text-xs text-slate-600 dark:text-[#CBD5E1] leading-relaxed font-normal">
                  Real-time diagonal security watermark embedding session metadata, teacher/principal identity, timestamp, and unique SHA-256 hashes.
                </p>
              </div>
            </div>

            {/* Photo 3: Encrypted Vault */}
            <div className="group relative rounded-3xl bg-white dark:bg-[#151B2E] border border-slate-200 dark:border-[#33435C] hover:border-cyan-500/50 transition-all duration-300 overflow-hidden shadow-xl flex flex-col justify-between">
              <div className="relative overflow-hidden aspect-video">
                <img 
                  src={secureVaultImg} 
                  alt="Encrypted Storage Vault" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-full bg-emerald-950/90 backdrop-blur-md border border-emerald-400/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-lg">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    Encrypted Storage
                  </span>
                </div>
              </div>
              <div className="p-6 space-y-2 relative z-10">
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition">
                  Encrypted Node Vault
                </h3>
                <p className="text-xs text-slate-600 dark:text-[#CBD5E1] leading-relaxed font-normal">
                  Restricted file path storage holding confidential papers behind multi-stage authorization barriers with zero exposed static file URLs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Features Section */}
      <section className="py-20 bg-slate-50 dark:bg-[#182232] border-b border-slate-200 dark:border-[#33435C]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Defense-In-Depth Security Features</h2>
            <p className="text-slate-600 dark:text-[#CBD5E1] text-sm max-w-2xl mx-auto font-medium">
              Multi-tiered safeguards protecting examination assets throughout the complete creation, viewing, approval, and audit lifecycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-white dark:bg-[#151B2E] border border-slate-200 dark:border-[#33435C] hover:border-cyan-500/50 transition duration-300 group hover:-translate-y-1 shadow-lg"
                >
                  <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-4 group-hover:scale-110 transition">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-[#CBD5E1] leading-relaxed font-normal">{item.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20 bg-cyber-dark border-b border-slate-200 dark:border-[#33435C]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">End-to-End Secure Workflow</h2>
            <p className="text-slate-600 dark:text-[#CBD5E1] text-sm max-w-2xl mx-auto font-medium">
              Sequential enforcement protocol ensuring zero unmonitored question paper access from creation to release.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            {workflowSteps.map((step, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-[#151B2E] border border-slate-200 dark:border-[#33435C] flex flex-col justify-between space-y-3 hover:border-cyan-500/40 transition shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-800 dark:text-cyan-400 bg-cyan-100 dark:bg-[#0B1020] px-2 py-0.5 rounded-lg border border-cyan-300 dark:border-[#33435C]">
                    {step.num}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{step.title}</h4>
                <p className="text-[11px] text-slate-600 dark:text-[#CBD5E1] leading-normal">{step.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Security Statement Banner */}
      <section className="py-12 bg-slate-50 dark:bg-[#182232] border-b border-slate-200 dark:border-[#33435C]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#151B2E] border border-cyan-300 dark:border-cyan-500/30 space-y-3 shadow-xl">
            <div className="flex items-center justify-center space-x-2 text-cyan-700 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Official System Security Statement</span>
            </div>
            <p className="text-slate-700 dark:text-slate-200 text-xs sm:text-sm leading-relaxed italic max-w-3xl mx-auto font-medium">
              “The system prevents downloading, printing, and unauthorized file access through role-based permissions, secure document viewing, watermarking, and monitoring. However, no web application can completely prevent someone from photographing a screen using another physical device.”
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-10 bg-white dark:bg-[#151B2E] text-slate-600 dark:text-[#CBD5E1] text-xs border-t border-slate-200 dark:border-[#33435C]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <AppLogo className="w-6 h-6" />
            <div className="flex items-center gap-1 leading-none">
              <span className="font-extrabold brand-secure text-sm tracking-tight">
                Secure<span className="brand-stack">Stack</span>
              </span>
              <span className="w-2 h-2 rounded-full brand-dot inline-block"></span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/security-info" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition font-semibold">About System</Link>
            <span className="text-slate-300 dark:text-slate-600 font-bold">|</span>
            <Link to="/security-info" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition font-semibold">Security Architecture</Link>
          </div>
          <p className="text-slate-500 dark:text-[#CBD5E1]">
            © 2026 Secure<span className="text-[#00A8CC] dark:text-cyan-400 font-semibold">Stack</span>. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
};
