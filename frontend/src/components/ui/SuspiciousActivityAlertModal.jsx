import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  X,
  UserX,
  CheckCircle2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  Lock,
  FileText,
  Activity,
  AlertOctagon,
  Volume2
} from 'lucide-react';
import { SecurityAlertBadge } from './SecurityAlertBadge';
import { formatTimeWithAMPM } from '../../utils/dateFormatter';
import api from '../../services/api';

export const SuspiciousActivityAlertModal = ({
  alerts = [],
  isOpen,
  onClose,
  onAlertUpdated,
  onUserStatusToggled
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  if (!isOpen || !alerts || alerts.length === 0) return null;

  // Bound index safely
  const safeIndex = Math.min(currentIndex, alerts.length - 1);
  const alert = alerts[safeIndex];

  const handleNext = () => {
    setFeedbackMsg(null);
    setCurrentIndex((prev) => (prev + 1) % alerts.length);
  };

  const handlePrev = () => {
    setFeedbackMsg(null);
    setCurrentIndex((prev) => (prev - 1 + alerts.length) % alerts.length);
  };

  const handleDisableUser = async (userId) => {
    if (!userId || userId === 'N/A') return;
    if (!window.confirm(`Are you sure you want to disable account access for ${alert.userName} (${userId})?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await api.patch(`/users/${userId}/status`);
      setFeedbackMsg({
        type: 'success',
        text: `Account for ${alert.userName} (${userId}) was disabled.`
      });
      if (onUserStatusToggled) onUserStatusToggled(userId);
    } catch (err) {
      setFeedbackMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update user status.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveAlert = async (alertId) => {
    setActionLoading(true);
    try {
      await api.patch(`/alerts/${alertId}/status`, { status: 'Resolved' });
      setFeedbackMsg({
        type: 'success',
        text: `Alert ${alertId} marked as Resolved.`
      });
      if (onAlertUpdated) onAlertUpdated(alertId, 'Resolved');
    } catch (err) {
      setFeedbackMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update alert.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0f172a] border-2 border-rose-500/80 rounded-3xl p-6 sm:p-7 shadow-[0_0_60px_rgba(244,63,94,0.35)] space-y-6 relative overflow-hidden text-slate-100 max-h-[92vh] flex flex-col">
        
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-400 to-rose-600 animate-pulse" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-rose-500/30">
          <div className="flex items-center space-x-3.5">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/50 text-rose-400 flex-shrink-0">
              <ShieldAlert className="w-7 h-7 animate-pulse text-rose-500" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-rose-950 text-rose-300 border border-rose-500/50 animate-pulse">
                  CRITICAL SECURITY ADVISORY
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {safeIndex + 1} of {alerts.length} Active Threat{alerts.length > 1 ? 's' : ''}
                </span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
                <span>Suspicious Activity Detected</span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
            title="Acknowledge and dismiss popup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback message banner if any action performed */}
        {feedbackMsg && (
          <div
            className={`p-3 rounded-xl text-xs font-bold border flex items-center justify-between ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
            }`}
          >
            <span>{feedbackMsg.text}</span>
            <button onClick={() => setFeedbackMsg(null)} className="text-xs opacity-70 hover:opacity-100">
              Dismiss
            </button>
          </div>
        )}

        {/* Main Alert Card Content */}
        <div className="overflow-y-auto space-y-4 pr-1">
          
          {/* Card Meta Box */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <SecurityAlertBadge severity={alert.severity} />
                <span className="font-mono text-xs font-bold text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30">
                  {alert.alertId}
                </span>
              </div>

              <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {alert.detectedDate}
                </span>
                <span className="flex items-center gap-1 text-cyan-300 font-bold">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  {formatTimeWithAMPM(alert.detectedTime)}
                </span>
              </div>
            </div>

            <div className="pt-1">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{alert.activity}</span>
              </h3>
            </div>
          </div>

          {/* Forensic Parameters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Suspect Account</span>
              <div className="font-extrabold text-sm text-white">{alert.userName}</div>
              <div className="text-[11px] font-mono text-cyan-400">User ID: {alert.userId}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Target Asset / Paper</span>
              <div className="font-extrabold text-sm text-cyan-300 font-mono">
                {alert.paperId || 'System Endpoint / Auth'}
              </div>
              <div className="text-[11px] text-slate-400">
                Threat Status: <strong className="text-rose-400 uppercase font-mono">{alert.status}</strong>
              </div>
            </div>
          </div>

          {/* Threat Description / Incident Log */}
          <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold text-rose-400 block">
              Forensic Anomaly Details
            </span>
            <p className="text-xs text-rose-100 font-mono leading-relaxed bg-black/40 p-3 rounded-xl border border-rose-500/20">
              {alert.details}
            </p>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          
          {/* Quick Administrative Remediation Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            
            {/* Carousel navigation buttons if multiple alerts exist */}
            {alerts.length > 1 ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrev}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>
                <span className="text-xs font-mono text-slate-400">
                  {safeIndex + 1}/{alerts.length}
                </span>
                <button
                  onClick={handleNext}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : <div />}

            <div className="flex flex-wrap items-center gap-2">
              {/* Disable User Account Button */}
              {alert.userId && alert.userId !== 'N/A' && (
                <button
                  disabled={actionLoading}
                  onClick={() => handleDisableUser(alert.userId)}
                  className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 flex items-center gap-1.5 transition cursor-pointer"
                  title="Immediately block and disable this user account"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>Disable User</span>
                </button>
              )}

              {/* Mark as Resolved */}
              <button
                disabled={actionLoading}
                onClick={() => handleResolveAlert(alert.alertId)}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition cursor-pointer"
                title="Mark this threat as acknowledged and resolved"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Resolved</span>
              </button>
            </div>
          </div>

          {/* Deep Navigation & Dismiss Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
            <div className="flex items-center space-x-3">
              {alert.userId && alert.userId !== 'N/A' && (
                <Link
                  to={`/audit/user/${alert.userId}`}
                  className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                  onClick={onClose}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Inspect User Audit Trail</span>
                </Link>
              )}
              <Link
                to="/alerts"
                className="text-rose-400 hover:underline flex items-center gap-1 font-semibold"
                onClick={onClose}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Security Alerts Page</span>
              </Link>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition cursor-pointer"
            >
              Dismiss Alert
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
