import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { User, ShieldCheck, Clock, Activity, ArrowLeft, Calendar, Lock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import api from '../services/api';

export const UserProfileAuditPage = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/audit/user/${userId}`);
        setProfile(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-dark text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-cyan-400">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-cyber-dark text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 p-8 text-center text-rose-400">
          User profile activity log not found.
        </div>
      </div>
    );
  }

  const { user, timeline } = profile;

  return (
    <div className="min-h-screen bg-cyber-dark text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 space-y-8 overflow-y-auto">
          
          {/* Back Navigation */}
          <Link to="/audit" className="inline-flex items-center space-x-2 text-xs font-semibold text-cyan-400 hover:underline">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Full Audit Logs</span>
          </Link>

          {/* User Activity Profile Header (Section 15) */}
          <div className="p-6 rounded-2xl bg-cyber-card border border-slate-800 space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-extrabold text-2xl">
                {user.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-white">{user.name}</h1>
                <p className="text-xs text-slate-400 font-mono">User ID: <strong className="text-cyan-400">{user.userId}</strong> • {user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-4 border-t border-slate-800">
              <div>
                <span className="text-slate-500 block uppercase font-semibold text-[10px]">Assigned Role</span>
                <span className="font-bold text-cyan-300 font-mono">{user.role}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase font-semibold text-[10px]">Department</span>
                <span className="font-bold text-slate-200">{user.department}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase font-semibold text-[10px]">Account Status</span>
                <span className={`font-bold ${user.status === 'Active' ? 'text-emerald-400' : 'text-rose-400'}`}>{user.status}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase font-semibold text-[10px]">Last Session Login</span>
                <span className="font-mono text-slate-300">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Interactive Activity Timeline (Section 15) */}
          <div className="p-6 rounded-2xl bg-cyber-card border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Chronological User Activity Timeline</h3>
                  <p className="text-xs text-slate-400">Sequential step-by-step trace of user actions for security investigation.</p>
                </div>
              </div>
              <span className="text-xs font-mono text-cyan-400">{timeline.length} Actions Recorded</span>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {timeline.map((item, idx) => (
                <div key={item.id || idx} className="relative flex items-start space-x-4">
                  {/* Timeline Bullet */}
                  <div className={`absolute -left-[23px] top-1.5 w-3 h-3 rounded-full border-2 bg-cyber-dark ${item.result === 'Success' || item.result === 'Approved' ? 'border-cyan-400 bg-cyan-950' : 'border-rose-500 bg-rose-950'}`}></div>

                  {/* Card Content */}
                  <div className="flex-1 p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-cyan-400 text-sm">{item.timeDisplay}</span>
                      <span className="text-slate-500 font-mono text-[11px]">{item.dateDisplay}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white">{item.action}</span>
                      {item.paperId && (
                        <span className="px-2 py-0.5 rounded font-mono text-[11px] bg-slate-950 text-cyan-300 border border-slate-800">
                          {item.paperId}
                        </span>
                      )}
                    </div>

                    {item.paperTitle && (
                      <p className="text-slate-400 text-[11px]">{item.paperTitle}</p>
                    )}

                    {item.reason && (
                      <p className="text-slate-400 italic text-[11px] bg-slate-950 p-2 rounded border border-slate-800/80">
                        "{item.reason}"
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 font-mono">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-lg font-mono text-xs bg-cyan-100 dark:bg-cyan-950 text-cyan-950 dark:text-cyan-200 border border-cyan-300 dark:border-cyan-500/40 font-extrabold whitespace-nowrap">
                          IP: {item.ipAddress || '192.168.1.100'}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg font-mono text-xs bg-purple-100 dark:bg-purple-950 text-purple-950 dark:text-purple-200 border border-purple-300 dark:border-purple-500/40 font-extrabold whitespace-nowrap">
                          MAC: {item.macAddress || '7A-2F-9D-11-4B-88'}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400 font-medium">Device: {item.deviceInfo}</span>
                      </span>
                      <span className={`font-black px-2.5 py-0.5 rounded-full text-xs ${item.result === 'Success' || item.result === 'Approved' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300' : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300'}`}>
                        {item.result}
                      </span>
                    </div>
                  </div>

                </div>
              ))}
            </div>

          </div>

        </main>
      </div>
    </div>
  );
};
